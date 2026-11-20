(() => { const R = String.raw;
CKA.topic({
  id: 'cluster-maintenance',
  title: 'Cluster Maintenance',
  icon: '🛠️',
  domain: 'Cluster Architecture, Installation & Configuration',
  kodekloud: 'Section 6 · Cluster Maintenance',
  summary: 'Node maintenance with cordon/drain, Kubernetes releases and version skew, kubeadm upgrades (control plane, then workers), and etcd snapshot backup and restore. These are near-guaranteed exam tasks, so practise the full sequences until you can do them without notes.',
  objectives: ['Manage the lifecycle of Kubernetes clusters', 'Create and manage Kubernetes clusters using kubeadm'],
  concepts: [
    { title: 'Cordon, drain, uncordon', body: '`cordon` marks a node unschedulable and leaves running Pods alone. `drain` cordons and then **evicts** Pods, respecting PodDisruptionBudgets. DaemonSet Pods block a drain unless you pass `--ignore-daemonsets`. Pods using emptyDir need `--delete-emptydir-data`. Bare Pods (no controller) need `--force` and are lost for good. `uncordon` makes the node schedulable again; Pods do not move back on their own.' },
    { title: 'Releases & version skew', body: 'Versions are `major.minor.patch`. Upgrade **one minor version at a time** (1.36 → 1.37). kube-apiserver must be the newest component. controller-manager and scheduler may be one minor behind it. kubelet may be up to three minors behind the apiserver but never newer. kubectl may be ±1 minor. Upgrade order: control plane first, then workers.' },
    { title: 'kubeadm upgrade flow', body: 'For each node: point the package repo at the new minor (`pkgs.k8s.io/core:/stable:/v1.37/deb/`), then upgrade the **kubeadm** package. On the first control plane run `kubeadm upgrade plan` and `kubeadm upgrade apply v1.37.x`. Other control planes run `kubeadm upgrade node`. Then **drain**, upgrade the **kubelet + kubectl** packages, `systemctl daemon-reload && systemctl restart kubelet`, and **uncordon**. Workers do the same with `kubeadm upgrade node`.' },
    { title: 'etcd backup', body: 'Take a snapshot over the client endpoint using the etcd TLS certificates. Read the endpoint and certificate paths from `/etc/kubernetes/manifests/etcd.yaml` (`--listen-client-urls`, `--cert-file`, `--key-file`, `--trusted-ca-file`). `etcdctl snapshot save` needs `--endpoints --cacert --cert --key`. Check the snapshot with `etcdutl snapshot status`.' },
    { title: 'etcd restore', body: 'Run `etcdutl snapshot restore <file> --data-dir <new-dir>` to build a **new** data directory; it needs no TLS. Then edit `etcd.yaml` so the `etcd-data` hostPath volume (and `--data-dir` if you prefer) points at the new directory. The kubelet re-creates etcd, and the API server reconnects after a minute or two. You may have to restart the kubelet and wait for the control-plane Pods to settle.' },
    { title: 'Other backup approaches', body: 'Resource-level backup: `k get all -A -o yaml > all.yaml` (incomplete), or tools like Velero. For a managed etcd you may not have access, so resource backup is the only option. The exam focuses on the etcd snapshot.' },
    { title: 'Certificates lifecycle', body: 'kubeadm certificates last 1 year and the CA lasts 10. `kubeadm upgrade apply` renews them automatically. Check expiry with `kubeadm certs check-expiration` and renew with `kubeadm certs renew all`, then restart the control-plane static Pods (move the manifests out and back, or restart the kubelet).' },
  ],
  tables: [
    { title: 'kubeadm node paths', note: 'kubeadm defaults. Always confirm on the task\'s designated host.', cols: ['Component / data', 'Default path', 'Notes'], rows: [
      ['Static Pod manifests', '/etc/kubernetes/manifests/', 'apiserver, controller-manager, scheduler, etcd. kubelet staticPodPath'],
      ['API server manifest', '/etc/kubernetes/manifests/kube-apiserver.yaml', 'Flags: service CIDR, etcd, admission, authz, encryption'],
      ['etcd manifest', '/etc/kubernetes/manifests/etcd.yaml', 'Endpoints, certificate paths, data-dir and hostPath'],
      ['Controller-manager kubeconfig', '/etc/kubernetes/controller-manager.conf', 'Identity used by the component'],
      ['Scheduler kubeconfig', '/etc/kubernetes/scheduler.conf', ''],
      ['Admin kubeconfig', '/etc/kubernetes/admin.conf', 'cluster-admin; copy to ~/.kube/config'],
      ['Kubelet kubeconfig', '/etc/kubernetes/kubelet.conf', 'Every node'],
      ['Kubelet config', '/var/lib/kubelet/config.yaml', 'staticPodPath, clusterDNS, cgroupDriver, authn'],
      ['Kubelet flags', '/var/lib/kubelet/kubeadm-flags.env', 'Container runtime endpoint, node IP'],
      ['Kubelet unit & drop-ins', 'systemctl cat kubelet', '/usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf'],
      ['Kubelet certs', '/var/lib/kubelet/pki/', 'kubelet-client-current.pem rotates'],
      ['Cluster PKI', '/etc/kubernetes/pki/', 'ca, apiserver, front-proxy, sa.key/sa.pub'],
      ['etcd PKI', '/etc/kubernetes/pki/etcd/', 'ca, server, peer, healthcheck-client'],
      ['etcd data', '/var/lib/etcd/', 'Default data-dir for stacked etcd'],
      ['CNI config / binaries', '/etc/cni/net.d/ · /opt/cni/bin/', 'Network plugin files'],
      ['containerd config', '/etc/containerd/config.toml', 'SystemdCgroup, sandbox image'],
      ['Pod logs', '/var/log/pods/ · /var/log/containers/', ''],
      ['kubeadm cluster config', 'kube-system/kubeadm-config ConfigMap', 'Read with kubectl'],
    ] },
  ],
  commands: [
    { group: 'Nodes', use: 'Cordon', cmd: 'k cordon node01', note: 'STATUS shows SchedulingDisabled.' },
    { group: 'Nodes', use: 'Drain', cmd: 'k drain node01 --ignore-daemonsets --delete-emptydir-data', note: 'Add `--force` for bare Pods (they are deleted).' },
    { group: 'Nodes', use: 'Uncordon', cmd: 'k uncordon node01', note: '' },
    { group: 'Nodes', use: 'PodDisruptionBudget', cmd: 'k create pdb web-pdb --selector=app=web --min-available=2', note: 'A drain waits rather than violate it.' },
    { group: 'Nodes', use: 'Versions per node', cmd: 'k get nodes -o wide', note: 'VERSION column = kubelet version.' },
    { group: 'Upgrade', use: 'Versions now', cmd: 'kubeadm version -o short\nkubelet --version\nk version', note: '' },
    { group: 'Upgrade', use: 'Switch package repo minor', cmd: R`sudo sed -i 's#/v1.36/#/v1.37/#' /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update
apt-cache madison kubeadm | head`, note: 'Debian/Ubuntu with pkgs.k8s.io. Check the exact file name in sources.list.d.' },
    { group: 'Upgrade', use: 'Upgrade kubeadm package', cmd: R`sudo apt-mark unhold kubeadm
sudo apt-get install -y kubeadm='1.37.1-*'
sudo apt-mark hold kubeadm`, note: 'Use the patch version the task asks for.' },
    { group: 'Upgrade', use: 'Plan & apply (first CP)', cmd: 'sudo kubeadm upgrade plan\nsudo kubeadm upgrade apply v1.37.1', note: '' },
    { group: 'Upgrade', use: 'Other CP / workers', cmd: 'sudo kubeadm upgrade node', note: 'Upgrades local config and manifests.' },
    { group: 'Upgrade', use: 'Upgrade kubelet & kubectl', cmd: R`sudo apt-mark unhold kubelet kubectl
sudo apt-get install -y kubelet='1.37.1-*' kubectl='1.37.1-*'
sudo apt-mark hold kubelet kubectl
sudo systemctl daemon-reload && sudo systemctl restart kubelet`, note: 'Drain the node before this step.' },
    { group: 'etcd', use: 'Find etcd connection details', cmd: 'sudo grep -E "listen-client|cert-file|key-file|trusted-ca|data-dir" /etc/kubernetes/manifests/etcd.yaml', note: '' },
    { group: 'etcd', use: 'Snapshot save', cmd: R`sudo ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  snapshot save /opt/backup/etcd.db`, note: '' },
    { group: 'etcd', use: 'Snapshot status', cmd: 'sudo etcdutl --write-out=table snapshot status /opt/backup/etcd.db', note: 'Older labs: `etcdctl snapshot status` (deprecated).' },
    { group: 'etcd', use: 'Snapshot restore', cmd: 'sudo etcdutl snapshot restore /opt/backup/etcd.db --data-dir /var/lib/etcd-restored', note: 'Then point the etcd-data hostPath in etcd.yaml at the new directory.' },
    { group: 'etcd', use: 'Member list / health', cmd: R`sudo ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key member list -w table`, note: 'Use `endpoint health` the same way.' },
    { group: 'Certs', use: 'Certificate expiry', cmd: 'sudo kubeadm certs check-expiration', note: '' },
    { group: 'Certs', use: 'Renew all', cmd: 'sudo kubeadm certs renew all', note: 'Restart the control-plane static Pods afterwards.' },
  ],
  yaml: [
    { title: 'etcd.yaml after restore', note: 'Only the hostPath has to change; the container still uses /var/lib/etcd internally.', code: R`  volumes:
  - hostPath:
      path: /var/lib/etcd-restored   # was /var/lib/etcd
      type: DirectoryOrCreate
    name: etcd-data` },
    { title: 'PodDisruptionBudget', note: '', code: R`apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: web-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: web` },
  ],
  gotchas: [
    'Run `kubeadm upgrade apply` on **one** control-plane node only; others use `kubeadm upgrade node`.',
    'Drain from where kubectl works (often the control plane), but upgrade packages on the node itself over SSH.',
    'If `apt-get install kubeadm=1.37.x` cannot find the version, the repo still points at the old minor.',
    'Skipping `systemctl daemon-reload && restart kubelet` leaves the node reporting the old version.',
    'Save snapshots where the task says. Do not put them inside `/var/lib/etcd`.',
    'After a restore, if the API server stays down, check `crictl ps -a | grep etcd` and the etcd logs for a wrong data-dir or permissions.',
  ],
  tasks: [
    { id: 'upgrade', title: 'Safely maintain a worker node', difficulty: 'Stretch', time: '10–15 min', prompt: 'Upgrade worker node01 to the same version as the control plane. Drain it safely, perform the package steps, and return it to scheduling.', steps: [
      { code: R`k drain node01 --ignore-daemonsets --delete-emptydir-data
ssh node01
sudo sed -i 's#/v1.36/#/v1.37/#' /etc/apt/sources.list.d/kubernetes.list && sudo apt-get update
sudo apt-mark unhold kubeadm kubelet kubectl
sudo apt-get install -y kubeadm='1.37.1-*'
sudo kubeadm upgrade node
sudo apt-get install -y kubelet='1.37.1-*' kubectl='1.37.1-*'
sudo apt-mark hold kubeadm kubelet kubectl
sudo systemctl daemon-reload && sudo systemctl restart kubelet
exit` },
      { code: R`k uncordon node01
k get nodes` } ], check: 'node01 shows the target VERSION and Ready without SchedulingDisabled.' },
    { id: 'kubeadm-upgrade-config', title: 'Upgrade the control plane with kubeadm', difficulty: 'Stretch', time: '12–18 min', prompt: 'Upgrade the controlplane node from v1.36.x to v1.37.1: kubeadm, control-plane components, kubelet and kubectl. Do not upgrade the workers.', steps: [
      { code: R`k drain controlplane --ignore-daemonsets
sudo sed -i 's#/v1.36/#/v1.37/#' /etc/apt/sources.list.d/kubernetes.list && sudo apt-get update
sudo apt-mark unhold kubeadm && sudo apt-get install -y kubeadm='1.37.1-*' && sudo apt-mark hold kubeadm
sudo kubeadm upgrade plan
sudo kubeadm upgrade apply v1.37.1` },
      { note: 'kubeadm also accepts a config file: an `UpgradeConfiguration` (kubeadm.k8s.io/v1beta4) with `apply.kubernetesVersion`, passed via `--config`.' },
      { code: R`sudo apt-mark unhold kubelet kubectl && sudo apt-get install -y kubelet='1.37.1-*' kubectl='1.37.1-*' && sudo apt-mark hold kubelet kubectl
sudo systemctl daemon-reload && sudo systemctl restart kubelet
k uncordon controlplane
k get nodes` } ], check: 'controlplane reports v1.37.1 and is Ready. The kube-system Pods use the new image tags.' },
    { id: 'etcd', title: 'Back up and validate etcd', difficulty: 'Core workflow', time: '6–10 min', prompt: 'Create an etcd snapshot at /opt/backup/etcd-snap.db using the cluster\'s endpoint and certificates, and verify it.', steps: [
      { note: 'Read the endpoint and certificate paths from the etcd static Pod manifest first.' },
      { code: R`sudo grep -E "listen-client|cert-file|key-file|trusted-ca" /etc/kubernetes/manifests/etcd.yaml
sudo mkdir -p /opt/backup
sudo ETCDCTL_API=3 etcdctl snapshot save /opt/backup/etcd-snap.db \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key
sudo etcdutl --write-out=table snapshot status /opt/backup/etcd-snap.db` } ], check: 'Status shows a hash, revision and key count, and the file exists.' },
    { id: 'etcd-restore', title: 'Restore etcd from a snapshot', difficulty: 'Stretch', time: '10–15 min', prompt: 'Restore the cluster from /opt/backup/etcd-snap.db into /var/lib/etcd-from-backup and make the cluster use it.', steps: [
      { code: R`sudo etcdutl snapshot restore /opt/backup/etcd-snap.db --data-dir /var/lib/etcd-from-backup
sudo vi /etc/kubernetes/manifests/etcd.yaml   # hostPath etcd-data -> /var/lib/etcd-from-backup` },
      { code: R`watch sudo crictl ps          # etcd and kube-apiserver restart
k get pods -A                 # objects from the snapshot time are back` },
      { note: 'If control-plane Pods stay stuck, `sudo systemctl restart kubelet` and check `sudo crictl logs <etcd-container>`.' } ], check: 'etcd runs from the new directory and resources created after the snapshot are gone.' },
    { id: 'pdb-drain', title: 'Drain a node while protecting availability', difficulty: 'Core workflow', time: '5–8 min', prompt: 'Deployment web has 3 replicas. Create a PDB requiring at least 2 available, then drain the node hosting most web Pods and confirm it never dropped below 2.', steps: [
      { code: R`k create pdb web-pdb --selector=app=web --min-available=2
k get pods -l app=web -o wide
k drain <node> --ignore-daemonsets --delete-emptydir-data
k get pdb web-pdb
k uncordon <node>` } ], check: 'Drain evicts one Pod at a time, and the PDB ALLOWED DISRUPTIONS value never goes negative.' },
  ],
  docs: [
    { label: 'Safely drain a node', url: 'https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/' },
    { label: 'Upgrading kubeadm clusters', url: 'https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/' },
    { label: 'Upgrading Linux nodes', url: 'https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/upgrading-linux-nodes/' },
    { label: 'Version skew policy', url: 'https://kubernetes.io/releases/version-skew-policy/' },
    { label: 'Operating etcd (backup/restore)', url: 'https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/' },
    { label: 'Certificate management with kubeadm', url: 'https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/' },
  ],
});
})();
