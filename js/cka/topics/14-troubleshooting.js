(() => { const R = String.raw;
CKA.topic({
  id: 'troubleshooting',
  title: 'Troubleshooting',
  icon: '🚑',
  domain: 'Troubleshooting',
  kodekloud: 'Section 12 · Troubleshooting',
  summary: 'The biggest domain at 30%. It covers application failures, control-plane failures, worker-node failures and network failures. Each has a fixed investigation order. Practise the order until you can run it without thinking. Then you can find the broken layer in under two minutes.',
  objectives: ['Troubleshoot clusters and nodes', 'Troubleshoot cluster components', 'Troubleshoot services and networking', 'Monitor cluster and application resource usage', 'Manage and evaluate container output streams'],
  concepts: [
    { title: 'Application failure: work from the outside in', body: 'Client → **Service** (selector, port/targetPort, endpoints) → **Pod** (status, restarts, events) → **container** (logs, previous logs, command/env/config) → **dependencies** (DB Service, Secrets, PVC). Use `describe` for events and `logs --previous` for crashes. Fix the **owner** (Deployment), not the Pod.' },
    { title: 'Reading pod status', body: '`Pending`: scheduling (resources, taints, affinity, PVC unbound, no scheduler). `ContainerCreating`: volume mount, CNI, image pull. `ImagePullBackOff`/`ErrImagePull`: wrong image/tag, registry auth. `CrashLoopBackOff`: the app exits; check logs, command and probes. `OOMKilled`: memory limit too low. `CreateContainerConfigError`: missing ConfigMap/Secret key. `Running` but not `Ready`: readiness probe failing.' },
    { title: 'Control-plane failure', body: 'If `kubectl` itself fails ("connection refused" / "the server could not find…"), the apiserver or etcd is down. Go to the control-plane node and use `crictl ps -a` plus `crictl logs`, or the files in `/var/log/pods/`. Then check the manifest in `/etc/kubernetes/manifests/` for typos, wrong certificate paths, wrong ports or a wrong etcd endpoint. If Pods are Pending with no scheduler events, check **kube-scheduler**. If Deployments don\'t create Pods, or scaling does nothing, check **kube-controller-manager**.' },
    { title: 'Worker-node failure', body: 'For a `NotReady` node, run `describe node` (conditions: MemoryPressure, DiskPressure, PIDPressure, Ready message), then on the node `systemctl status kubelet`, then `journalctl -u kubelet`. Usual faults: kubelet stopped or disabled, a wrong path in `/var/lib/kubelet/config.yaml` (CA file) or the kubelet kubeconfig (server address/port), an expired or wrong certificate, a stopped containerd, or a full disk.' },
    { title: 'Network failure', body: 'Pod → Pod by IP fails: check the **CNI** (CNI Pods running? config in `/etc/cni/net.d`?). Pod → Service IP fails but Pod IP works: check **kube-proxy** (DaemonSet running? ConfigMap correct? logs). Name fails but IP works: check **CoreDNS** (Pods, Service `kube-dns`, Corefile, endpoints). Selective blocking: check **NetworkPolicies**.' },
    { title: 'Fix with minimum change, then verify', body: 'Back up before editing (`cp manifest /root/backup/`, outside the manifests dir). Change one thing at a time. Verify the **outcome** the task asked for (curl works, node Ready, Pod Ready), not just that the command ran.' },
  ],
  commands: [
    { group: 'Application', use: 'Fast triage', cmd: 'k get pods -n <ns> -o wide\nk describe pod <pod> -n <ns> | tail -20', note: 'Events at the bottom of describe tell you most of the story.' },
    { group: 'Application', use: 'Crash reason', cmd: R`k get pod <pod> -o jsonpath='{.status.containerStatuses[*].lastState.terminated.reason}'`, note: 'e.g. OOMKilled, Error, Completed.' },
    { group: 'Application', use: 'Previous logs', cmd: 'k logs <pod> -c <c> --previous', note: '' },
    { group: 'Application', use: 'Selector vs labels', cmd: R`k get svc <svc> -o jsonpath='{.spec.selector}'; echo
k get pods --show-labels`, note: '' },
    { group: 'Application', use: 'Ports', cmd: R`k get svc <svc> -o jsonpath='{.spec.ports}'; echo
k get pod <pod> -o jsonpath='{.spec.containers[*].ports}'`, note: 'targetPort must match the containerPort the app actually listens on.' },
    { group: 'Application', use: 'Endpoints', cmd: 'k get endpointslices -l kubernetes.io/service-name=<svc>', note: '' },
    { group: 'Application', use: 'Test from inside', cmd: 'k run t --rm -it --restart=Never --image=busybox:1.36 -- wget -qO- -T2 http://<svc>:<port>', note: '' },
    { group: 'Control plane', use: 'Component status', cmd: 'k get pods -n kube-system\nk get --raw="/readyz?verbose"', note: '' },
    { group: 'Control plane', use: 'When kubectl is down', cmd: 'sudo crictl ps -a | grep -E "apiserver|etcd|scheduler|controller"\nsudo crictl logs <id> 2>&1 | tail -20', note: 'Exited containers keep their logs.' },
    { group: 'Control plane', use: 'Static pod log files', cmd: 'sudo ls /var/log/pods/ | grep kube-system\nsudo tail -n 30 /var/log/pods/kube-system_kube-apiserver-*/kube-apiserver/*.log', note: '' },
    { group: 'Control plane', use: 'kubelet complaints about manifests', cmd: 'sudo journalctl -u kubelet --no-pager | grep -iE "apiserver|static|manifest|error" | tail -20', note: 'YAML syntax errors in manifests show up here.' },
    { group: 'Control plane', use: 'Back up a manifest', cmd: 'sudo cp /etc/kubernetes/manifests/kube-apiserver.yaml /root/kube-apiserver.yaml.bak', note: 'Never inside the manifests directory.' },
    { group: 'Control plane', use: 'Check a certificate path exists', cmd: 'sudo grep -E "\\.crt|\\.key" /etc/kubernetes/manifests/kube-apiserver.yaml | awk -F= \'{print $2}\' | xargs -I{} sudo ls -l {}', note: 'Spots a typo in a cert/key path.' },
    { group: 'Nodes', use: 'Conditions', cmd: 'k describe node <node> | sed -n "/Conditions/,/Addresses/p"', note: '' },
    { group: 'Nodes', use: 'kubelet service', cmd: 'sudo systemctl status kubelet --no-pager\nsudo systemctl enable --now kubelet', note: '' },
    { group: 'Nodes', use: 'kubelet errors', cmd: 'sudo journalctl -u kubelet -n 50 --no-pager | grep -iE "error|fail"', note: '' },
    { group: 'Nodes', use: 'kubelet config & kubeconfig', cmd: 'sudo cat /var/lib/kubelet/config.yaml | grep -iE "clientCAFile|staticPodPath|clusterDNS"\nsudo grep server /etc/kubernetes/kubelet.conf', note: 'Wrong CA path or server port (6443) are classic faults.' },
    { group: 'Nodes', use: 'After fixing config', cmd: 'sudo systemctl daemon-reload && sudo systemctl restart kubelet', note: '' },
    { group: 'Nodes', use: 'Runtime & disk', cmd: 'sudo systemctl status containerd --no-pager\ndf -h / /var/lib', note: '' },
    { group: 'Nodes', use: 'kubelet client cert', cmd: 'sudo openssl x509 -in /var/lib/kubelet/pki/kubelet-client-current.pem -noout -subject -enddate', note: '' },
    { group: 'Network', use: 'CNI & kube-proxy pods', cmd: 'k get pods -n kube-system -o wide | grep -Ei "proxy|calico|cilium|flannel|weave|coredns"', note: '' },
    { group: 'Network', use: 'kube-proxy logs/config', cmd: 'k logs -n kube-system -l k8s-app=kube-proxy --tail=30\nk get cm kube-proxy -n kube-system -o yaml | grep -E "clusterCIDR|mode|kubeconfig"', note: '' },
    { group: 'Network', use: 'DNS end-to-end', cmd: 'k run t --rm -it --restart=Never --image=busybox:1.36 -- nslookup kubernetes.default', note: '' },
    { group: 'Network', use: 'Policies in play', cmd: 'k get netpol -A', note: '' },
  ],
  yaml: [
    { title: 'Triage checklist (copy to the exam notepad)', note: '', code: R`APP:     get → describe (events) → logs --previous → svc selector/ports → endpoints → test pod
CP:      crictl ps -a → crictl logs → /etc/kubernetes/manifests/*.yaml → journalctl -u kubelet
NODE:    describe node → systemctl status kubelet → journalctl -u kubelet → config.yaml / kubelet.conf → containerd → disk
NETWORK: pod IP? (CNI) → svc IP? (kube-proxy) → name? (CoreDNS) → selective? (NetworkPolicy)` },
  ],
  gotchas: [
    'After editing a static Pod manifest the container can take 30–60s to come back. Watch `crictl ps`; don\'t edit again in a panic.',
    'A broken manifest file means no container at all, and nothing in crictl. Look in the kubelet journal for the parse error.',
    '`systemctl restart kubelet` won\'t help if the service is **disabled** and the node reboots. Use `enable --now`.',
    'Editing a Pod owned by a Deployment is pointless; the ReplicaSet replaces it. Edit the Deployment.',
    'Common planted faults: image tag typo, wrong command, wrong targetPort, selector typo, missing ConfigMap key, PVC bound to the wrong class, scheduler manifest with a bad binary path, kubelet CA path typo.',
  ],
  tasks: [
    { id: 'logs', title: 'Find and repair a crash-looping container', difficulty: 'Core workflow', time: '5–10 min', prompt: 'A pod in namespace checkout is CrashLoopBackOff. Identify the failing container, inspect its previous logs and events, correct the configuration, and verify it becomes Ready.', steps: [
      { code: R`k get pods -n checkout -o wide
k describe pod <pod> -n checkout
k logs <pod> -n checkout -c <container> --previous
k get events -n checkout --sort-by=.lastTimestamp` },
      { note: 'Use the error to identify the cause: bad command, missing config, failed probe, OOM, or dependency. Change the owning Deployment/StatefulSet.' },
      { code: R`k rollout status deployment/<owner> -n checkout
k get pods -n checkout` } ], check: 'The controller is healthy, the replacement pod is Ready, and you can name the root cause.' },
    { id: 'service-debug', title: 'Trace a Service with no endpoints', difficulty: 'Core workflow', time: '6–10 min', prompt: 'Clients cannot reach Service api in namespace shop. Diagnose selector/label, port/targetPort, pod readiness and DNS; fix the actual mismatch and verify endpoints.', steps: [
      { code: R`k get svc api -n shop -o yaml
k get endpointslice -n shop -l kubernetes.io/service-name=api
k get pods -n shop --show-labels
k describe svc api -n shop` },
      { note: 'Compare the Service selector with Pod labels; then targetPort with the containerPort; then readiness and NetworkPolicy.' },
      { code: 'k run netcheck --rm -it --restart=Never -n shop --image=busybox:1.36 -- wget -qO- -T2 http://api' } ], check: 'Service has ready endpoints and the request succeeds.' },
    { id: 'node', title: 'Diagnose a NotReady node', difficulty: 'Core workflow', time: '8–12 min', prompt: 'Worker node01 is NotReady. Determine whether kubelet or the container runtime is failing, repair the issue, and make the fix survive a reboot.', steps: [
      { code: R`k get nodes
k describe node node01 | sed -n "/Conditions/,/Addresses/p"
ssh node01
sudo systemctl status kubelet --no-pager
sudo journalctl -u kubelet -n 80 --no-pager
sudo systemctl status containerd --no-pager` },
      { note: 'If kubelet is inactive: `sudo systemctl enable --now kubelet`. If it fails on a file path, fix /var/lib/kubelet/config.yaml or /etc/kubernetes/kubelet.conf. Then daemon-reload + restart.' },
      { code: R`sudo systemctl daemon-reload && sudo systemctl restart kubelet
exit
k get nodes -w` } ], check: 'node01 is Ready, and `systemctl is-enabled kubelet` says enabled.' },
    { id: 'kubelet-config', title: 'Fix a kubelet pointing at the wrong CA or port', difficulty: 'Stretch', time: '8–12 min', prompt: 'After maintenance, node02 is NotReady. The kubelet logs show either "unable to load client CA file" or "connection refused" to the API server. Fix it.', steps: [
      { code: R`ssh node02
sudo journalctl -u kubelet -n 30 --no-pager | grep -iE "ca file|refused|x509"
sudo grep -n clientCAFile /var/lib/kubelet/config.yaml
ls /etc/kubernetes/pki/
sudo grep -n server /etc/kubernetes/kubelet.conf` },
      { note: 'Correct the clientCAFile to the existing /etc/kubernetes/pki/ca.crt, and/or the server URL to https://<controlplane>:6443.' },
      { code: R`sudo systemctl restart kubelet
sudo systemctl status kubelet --no-pager | head -5` } ], check: 'The kubelet is active (running), its logs are clean, and node02 is Ready.' },
    { id: 'controlplane', title: 'Trace a control-plane component failure', difficulty: 'Stretch', time: '8–12 min', prompt: 'kubectl returns "The connection to the server was refused". Restore the API server.', steps: [
      { code: R`ssh controlplane
sudo crictl ps -a | grep -E "apiserver|etcd"
sudo crictl logs <latest-apiserver-id> 2>&1 | tail -20
sudo journalctl -u kubelet --no-pager | grep -i apiserver | tail` },
      { note: 'Look for: a typo in a flag, a wrong --etcd-servers port (2379), a wrong certificate path, or broken YAML. Back up and fix /etc/kubernetes/manifests/kube-apiserver.yaml.' },
      { code: R`sudo cp /etc/kubernetes/manifests/kube-apiserver.yaml /root/apiserver.bak
sudo vi /etc/kubernetes/manifests/kube-apiserver.yaml
watch sudo crictl ps
k get --raw='/readyz?verbose'` } ], check: 'kubectl works again and every readyz check passes.' },
    { id: 'scheduler-down', title: 'Pods stuck Pending with no events', difficulty: 'Core workflow', time: '5–8 min', prompt: 'New pods stay Pending and their describe output shows no scheduling events. Find and fix the cause.', steps: [
      { code: R`k get pods -n kube-system | grep scheduler
k describe pod kube-scheduler-controlplane -n kube-system | tail
k logs -n kube-system kube-scheduler-controlplane` },
      { note: 'Usual faults: a wrong command (e.g. kube-schedulerr), a wrong --kubeconfig path, or a wrong image. Fix /etc/kubernetes/manifests/kube-scheduler.yaml.' },
      { code: R`sudo vi /etc/kubernetes/manifests/kube-scheduler.yaml
k get pods -n kube-system -w
k get pods -o wide` } ], check: 'The scheduler is Running, and the Pending Pods are scheduled.' },
    { id: 'controller-manager-down', title: 'Deployment does not create pods', difficulty: 'Core workflow', time: '5–8 min', prompt: 'Scaling deployment web to 4 replicas has no effect and no new ReplicaSet appears after an image change. Fix the cluster.', steps: [
      { code: R`k get pods -n kube-system | grep controller-manager
k logs -n kube-system kube-controller-manager-controlplane --tail=30
sudo grep -nE "kubeconfig|command|image" /etc/kubernetes/manifests/kube-controller-manager.yaml` },
      { note: 'Fix the bad flag, path or volume mount in the manifest. A common one is a wrong path for the hostPath volume containing the CA/kubeconfig.' } ], check: 'controller-manager is Running and deployment web shows 4/4.' },
    { id: 'kube-proxy-fix', title: 'Service IPs unreachable cluster-wide', difficulty: 'Stretch', time: '8–10 min', domain: 'Services & Networking', prompt: 'Pods can reach each other by Pod IP but no ClusterIP Service works. Find and fix the problem.', steps: [
      { code: R`k get ds kube-proxy -n kube-system
k get pods -n kube-system -l k8s-app=kube-proxy
k logs -n kube-system -l k8s-app=kube-proxy --tail=20
k get cm kube-proxy -n kube-system -o yaml | grep -nE "kubeconfig|clusterCIDR|mode"
k get ds kube-proxy -n kube-system -o yaml | grep -n -A3 command` },
      { note: 'Typical planted faults: a wrong config file path in the DaemonSet command (--config=/var/lib/kube-proxy/config.conf), a bad ConfigMap value, or a DaemonSet scaled to nothing with a bad nodeSelector.' },
      { code: R`k -n kube-system edit ds kube-proxy
k -n kube-system rollout status ds kube-proxy
k run t --rm -it --restart=Never --image=busybox:1.36 -- wget -qO- -T2 http://kubernetes.default.svc:443 2>&1 | head -2` } ], check: 'kube-proxy Pods run on all nodes, and ClusterIP traffic works.' },
  ],
  docs: [
    { label: 'Troubleshooting applications', url: 'https://kubernetes.io/docs/tasks/debug/debug-application/' },
    { label: 'Debug Services', url: 'https://kubernetes.io/docs/tasks/debug/debug-application/debug-service/' },
    { label: 'Troubleshooting clusters', url: 'https://kubernetes.io/docs/tasks/debug/debug-cluster/' },
    { label: 'Debugging DNS resolution', url: 'https://kubernetes.io/docs/tasks/administer-cluster/dns-debugging-resolution/' },
    { label: 'crictl for node debugging', url: 'https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/' },
  ],
});
})();
