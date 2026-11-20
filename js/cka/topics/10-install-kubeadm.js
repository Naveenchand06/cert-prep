(() => { const R = String.raw;
CKA.topic({
  id: 'install-kubeadm',
  title: 'Install & HA with kubeadm',
  icon: '🏗️',
  domain: 'Cluster Architecture, Installation & Configuration',
  kodekloud: 'Sections 10–11 · Design & Install a Cluster · kubeadm way',
  summary: 'Preparing nodes (kernel modules, sysctl, container runtime, packages), bootstrapping with `kubeadm init`, installing a CNI, joining workers and extra control planes for HA, and the extension interfaces (CRI, CNI, CSI) that make the cluster pluggable.',
  objectives: ['Prepare underlying infrastructure for installing a Kubernetes cluster', 'Create and manage Kubernetes clusters using kubeadm', 'Implement and configure a highly-available control plane', 'Understand extension interfaces (CNI, CSI, CRI, etc.)'],
  concepts: [
    { title: 'Node prerequisites', body: 'Unique hostname/MAC/product_uuid. Required ports open: 6443 apiserver, 2379-2380 etcd, 10250 kubelet, 10257/10259 controller-manager/scheduler, 30000-32767 NodePorts. Swap disabled, or the kubelet configured to tolerate it. Kernel modules `overlay` and `br_netfilter` loaded. sysctls `net.ipv4.ip_forward=1` and `net.bridge.bridge-nf-call-iptables=1`. A CRI runtime installed with the **systemd cgroup driver**, matching the kubelet.' },
    { title: 'Packages', body: 'Install `kubeadm`, `kubelet` and `kubectl` from the community repo `pkgs.k8s.io`. Each minor version has its own repo path (`/core:/stable:/v1.37/deb/`). Pin them with `apt-mark hold`. The kubelet crash-loops until `kubeadm init/join` writes its config; that is normal.' },
    { title: 'kubeadm init phases', body: '`kubeadm init` runs preflight checks, generates certificates in `/etc/kubernetes/pki`, writes kubeconfigs, creates static Pod manifests for etcd and the control plane, waits for the apiserver, uploads config, marks and taints the control plane, issues a bootstrap token and installs CoreDNS + kube-proxy. Pass `--pod-network-cidr` to match your CNI. Pass `--control-plane-endpoint` (an LB DNS name or IP) **from day one** if you want HA later.' },
    { title: 'Joining nodes', body: 'Workers run `kubeadm join <endpoint>:6443 --token ... --discovery-token-ca-cert-hash sha256:...`. Tokens expire after 24h; get a fresh command with `kubeadm token create --print-join-command`. Extra control-plane nodes add `--control-plane --certificate-key <key>`. Upload the key with `kubeadm init phase upload-certs --upload-certs`.' },
    { title: 'HA topologies', body: '**Stacked etcd**: each control-plane node also runs an etcd member. It is simpler and needs fewer machines, but losing a node loses both. **External etcd**: a separate etcd cluster, more resilient and more hosts. Either way you need an odd number of etcd members (3 or 5) for quorum (n/2+1), and a **load balancer** in front of all the apiservers. The scheduler and controller-manager use **leader election**, so only one is active at a time.' },
    { title: 'Extension interfaces', body: '**CRI** (Container Runtime Interface): the kubelet talks gRPC to containerd/CRI-O over a socket such as `unix:///run/containerd/containerd.sock`. Debug with `crictl`. Docker Engine needs the `cri-dockerd` shim. **CNI**: the network plugin. **CSI**: the storage driver. All three let vendors plug in without changing core Kubernetes, the same way CRDs extend the API and webhooks extend admission.' },
  ],
  commands: [
    { group: 'Prepare node', use: 'Kernel modules', cmd: R`cat <<'EOF' | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
sudo modprobe overlay && sudo modprobe br_netfilter`, note: '' },
    { group: 'Prepare node', use: 'sysctl settings', cmd: R`cat <<'EOF' | sudo tee /etc/sysctl.d/k8s.conf
net.ipv4.ip_forward = 1
net.bridge.bridge-nf-call-iptables = 1
net.bridge.bridge-nf-call-ip6tables = 1
EOF
sudo sysctl --system
sysctl net.ipv4.ip_forward`, note: 'A favourite "prepare infrastructure" exam task.' },
    { group: 'Prepare node', use: 'Disable swap', cmd: R`sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab`, note: '' },
    { group: 'Runtime', use: 'containerd default config + systemd cgroup', cmd: R`sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
sudo systemctl restart containerd && sudo systemctl enable containerd`, note: 'Check the key exists in your containerd version\'s config.' },
    { group: 'Runtime', use: 'Install cri-dockerd package', cmd: R`sudo dpkg -i ./cri-dockerd_*.deb
sudo systemctl enable --now cri-docker.service
systemctl status cri-docker --no-pager`, note: 'Socket: unix:///var/run/cri-dockerd.sock.' },
    { group: 'Runtime', use: 'crictl endpoint', cmd: 'sudo crictl --runtime-endpoint unix:///run/containerd/containerd.sock ps', note: 'Or set it in /etc/crictl.yaml.' },
    { group: 'Packages', use: 'Add pkgs.k8s.io repo', cmd: R`sudo mkdir -p -m 755 /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.37/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.37/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list`, note: '' },
    { group: 'Packages', use: 'Install and pin', cmd: R`sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
sudo systemctl enable --now kubelet`, note: '' },
    { group: 'Bootstrap', use: 'Init control plane', cmd: 'sudo kubeadm init --apiserver-advertise-address=<cp-ip> --pod-network-cidr=10.244.0.0/16 --kubernetes-version=v1.37.1', note: 'Add `--control-plane-endpoint=<lb>:6443 --upload-certs` for HA.' },
    { group: 'Bootstrap', use: 'kubeconfig for your user', cmd: 'mkdir -p $HOME/.kube\nsudo cp /etc/kubernetes/admin.conf $HOME/.kube/config\nsudo chown $(id -u):$(id -g) $HOME/.kube/config', note: '' },
    { group: 'Bootstrap', use: 'Init from a config file', cmd: 'kubeadm config print init-defaults > kubeadm.yaml\nsudo kubeadm init --config kubeadm.yaml', note: '' },
    { group: 'Bootstrap', use: 'Install a CNI', cmd: 'k apply -f <cni-manifest-url-from-the-plugin-docs>\nk get pods -n kube-system -w', note: 'Nodes go Ready after the CNI is running. Match the plugin\'s pod CIDR.' },
    { group: 'Join', use: 'Print a join command', cmd: 'sudo kubeadm token create --print-join-command', note: '' },
    { group: 'Join', use: 'Join a worker', cmd: 'sudo kubeadm join <cp>:6443 --token <t> --discovery-token-ca-cert-hash sha256:<hash>', note: '' },
    { group: 'Join', use: 'Upload certs for CP join', cmd: 'sudo kubeadm init phase upload-certs --upload-certs', note: 'Prints the certificate key (valid 2h).' },
    { group: 'Join', use: 'Join another control plane', cmd: 'sudo kubeadm join <lb>:6443 --token <t> --discovery-token-ca-cert-hash sha256:<hash> --control-plane --certificate-key <key>', note: '' },
    { group: 'Join', use: 'Reset a node', cmd: 'sudo kubeadm reset -f', note: 'Removes kubeadm-created state, but not iptables or CNI config.' },
    { group: 'HA', use: 'etcd members', cmd: 'sudo ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key member list -w table', note: '' },
    { group: 'HA', use: 'Leader election holders', cmd: 'k get lease -n kube-system', note: 'kube-scheduler and kube-controller-manager leases show the active node.' },
    { group: 'HA', use: 'Cluster configuration', cmd: 'k get cm kubeadm-config -n kube-system -o yaml', note: 'Shows controlPlaneEndpoint, networking, etcd type.' },
  ],
  yaml: [
    { title: 'kubeadm InitConfiguration + ClusterConfiguration', note: 'v1beta4 config API.', code: R`apiVersion: kubeadm.k8s.io/v1beta4
kind: InitConfiguration
localAPIEndpoint:
  advertiseAddress: 192.168.56.10
  bindPort: 6443
nodeRegistration:
  criSocket: unix:///run/containerd/containerd.sock
---
apiVersion: kubeadm.k8s.io/v1beta4
kind: ClusterConfiguration
kubernetesVersion: v1.37.1
controlPlaneEndpoint: k8s-api.lab.local:6443
networking:
  podSubnet: 10.244.0.0/16
  serviceSubnet: 10.96.0.0/12
---
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
cgroupDriver: systemd` },
  ],
  gotchas: [
    'If `kubeadm init` fails preflight on `/proc/sys/net/ipv4/ip_forward`, the sysctl step was skipped.',
    'A cgroup driver mismatch (runtime cgroupfs vs kubelet systemd) makes the kubelet or Pods crash. Set SystemdCgroup = true.',
    'Pod CIDR must not overlap node or Service networks, and must match what the CNI expects.',
    'You cannot add `--control-plane-endpoint` to an existing single-node cluster easily. Plan HA at init time.',
    'A 2-member etcd cluster is **less** available than 1, because quorum needs both members. Use odd numbers.',
  ],
  tasks: [
    { id: 'prep-node', title: 'Prepare a node for kubeadm', difficulty: 'Core workflow', time: '6–10 min', prompt: 'On node new-worker: load overlay and br_netfilter persistently, enable IPv4 forwarding and bridged iptables persistently, disable swap, and make sure containerd uses the systemd cgroup driver.', steps: [
      { note: 'Run the "Prepare node" and "Runtime" commands from the Commands tab on new-worker.' },
      { code: R`lsmod | grep -E "overlay|br_netfilter"
sysctl net.ipv4.ip_forward net.bridge.bridge-nf-call-iptables
swapon --show
grep SystemdCgroup /etc/containerd/config.toml
systemctl is-active containerd` } ], check: 'Both modules are listed, both sysctls = 1, swapon prints nothing, SystemdCgroup = true, and containerd is active.' },
    { id: 'cri-dockerd', title: 'Install cri-dockerd as the CRI', difficulty: 'Core workflow', time: '5–8 min', prompt: 'A .deb for cri-dockerd is in /root. Install it, enable and start the service, and set the sysctls net.bridge.bridge-nf-call-iptables=1, net.ipv6.conf.all.forwarding=1, net.ipv4.ip_forward=1 and net.netfilter.nf_conntrack_max=131072 persistently.', steps: [
      { code: R`sudo dpkg -i /root/cri-dockerd_*.deb
sudo systemctl enable --now cri-docker.service
cat <<'EOF' | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables = 1
net.ipv6.conf.all.forwarding = 1
net.ipv4.ip_forward = 1
net.netfilter.nf_conntrack_max = 131072
EOF
sudo sysctl --system
systemctl is-active cri-docker` } ], check: 'cri-docker is active and enabled, and `sysctl <key>` shows each value.' },
    { id: 'kubeadm-init', title: 'Bootstrap a cluster and join a worker', difficulty: 'Stretch', time: '15–20 min', prompt: 'On controlplane, initialise a cluster with pod network 10.244.0.0/16, configure kubectl for the current user, install a CNI, and join node01 as a worker.', steps: [
      { code: R`sudo kubeadm init --apiserver-advertise-address=$(hostname -I | awk '{print $1}') --pod-network-cidr=10.244.0.0/16
mkdir -p $HOME/.kube && sudo cp /etc/kubernetes/admin.conf $HOME/.kube/config && sudo chown $(id -u):$(id -g) $HOME/.kube/config
k apply -f <cni-manifest>
sudo kubeadm token create --print-join-command` },
      { code: R`ssh node01
sudo <paste join command>
exit
k get nodes -w` } ], check: 'Both nodes are Ready and the CoreDNS Pods are Running.' },
  ],
  docs: [
    { label: 'Installing kubeadm', url: 'https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/' },
    { label: 'Container runtimes (prereqs, cgroup driver)', url: 'https://kubernetes.io/docs/setup/production-environment/container-runtimes/' },
    { label: 'Creating a cluster with kubeadm', url: 'https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/' },
    { label: 'HA topology options', url: 'https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/ha-topology/' },
    { label: 'Creating HA clusters', url: 'https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/high-availability/' },
    { label: 'Ports and protocols', url: 'https://kubernetes.io/docs/reference/networking/ports-and-protocols/' },
    { label: 'kubeadm config v1beta4', url: 'https://kubernetes.io/docs/reference/config-api/kubeadm-config.v1beta4/' },
  ],
});
})();
