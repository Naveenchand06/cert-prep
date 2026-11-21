/* CKA quick reference: exam facts, question types, config file paths and shorthand commands.
   Loaded after registry.js and before app.js. Used by #/exam and #/ref.
   Text fields support `code` and **bold**. */
(() => { const R = String.raw;

/* ---------- study path phases (groups the 14 topics, order unchanged) ---------- */
CKA.phases = [
  { name: 'Foundations', hint: 'Speed, objects, scheduling, apps', topics: ['exam-setup', 'core-concepts', 'scheduling', 'logging-monitoring', 'app-lifecycle'] },
  { name: 'Run the cluster', hint: 'Upgrades, etcd, RBAC, certs', topics: ['cluster-maintenance', 'security'] },
  { name: 'Storage & networking', hint: 'PV/PVC, Services, DNS, NetPol, Gateway', topics: ['storage', 'networking'] },
  { name: 'Build & extend', hint: 'kubeadm, Helm, Kustomize, CRDs', topics: ['install-kubeadm', 'helm', 'kustomize', 'crds-operators'] },
  { name: 'Fix it', hint: '30% of the exam', topics: ['troubleshooting'] },
];

/* ---------- exam facts ---------- */
CKA.exam = {
  facts: [
    { k: 'Duration', v: '2 hours' },
    { k: 'Tasks', v: '~16–17 hands-on tasks, each with a % weight' },
    { k: 'Pass mark', v: '66%' },
    { k: 'Retake', v: '1 free retake within 12 months' },
    { k: 'Simulator', v: '2 × killer.sh sessions (36 h each), harder than the real exam' },
    { k: 'Version', v: 'Latest K8s minor, about 4–8 weeks after release' },
  ],
  environment: [
    'Remote Linux desktop (PSI). One terminal, one Firefox, a notepad. No second monitor.',
    'Each task starts with an `ssh <host>` line. Run it first, every time.',
    'Allowed sites: kubernetes.io/docs, kubernetes.io/blog, helm.sh/docs, gateway-api.sigs.k8s.io. Bookmarks are not allowed.',
    'Copy is **Ctrl+Shift+C**, paste is **Ctrl+Shift+V** in the terminal.',
    '`k` alias and bash completion are already set. Check with `type k`.',
    'You can use `sudo -i` on task hosts. Some kubeconfigs only work as a specific user.',
  ],
  routine: [
    'Read the weight. Under 4% and hard? Flag it in the notepad and move on.',
    'Run the task\'s `ssh` line, then `k config set-context --current --namespace=<ns>` if a namespace is given.',
    'Generate, don\'t type: `$do > x.yaml`, then edit the fields that have no flag.',
    'Debug in order: **get → describe → logs → events**. On nodes: **systemctl → journalctl → crictl**.',
    'Verify exactly what the task asked (file contents, Ready, curl works).',
    '`exit` back to the base host before the next task.',
  ],
  links: [
    { label: 'LF CKA page & curriculum', url: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/' },
    { label: 'LF exam tips & allowed resources', url: 'https://docs.linuxfoundation.org/tc-docs/certification/tips-cka-and-ckad' },
    { label: 'killer.sh simulator', url: 'https://killer.sh' },
    { label: 'Killercoda free playgrounds', url: 'https://killercoda.com/playgrounds' },
    { label: 'KodeKloud CKA course + labs', url: 'https://kodekloud.com/courses/cka-certification-course-certified-kubernetes-administrator/' },
    { label: 'kubectl Quick Reference', url: 'https://kubernetes.io/docs/reference/kubectl/quick-reference/' },
  ],
};

/* ---------- question types per domain (public curriculum + candidate reports, not dumps) ---------- */
CKA.questionTypes = [
  { domain: 'Troubleshooting', items: [
    { q: 'A worker node is NotReady. Fix it.', how: 'ssh node → `systemctl status kubelet` → `journalctl -u kubelet -n 50` → fix `/var/lib/kubelet/config.yaml` or the unit → `systemctl daemon-reload && systemctl restart kubelet`.', labs: ['node', 'kubelet-config'] },
    { q: 'The API server / scheduler / controller-manager is down.', how: 'Static Pod. `crictl ps -a`, `crictl logs <id>` or `/var/log/pods/kube-system_*`. Fix the typo in `/etc/kubernetes/manifests/<comp>.yaml` and wait for the kubelet to recreate it.', labs: ['controlplane', 'scheduler-down', 'controller-manager-down'] },
    { q: 'A Pod is Pending / CrashLoopBackOff. Make it run.', how: '`k describe pod` (Events) → `k logs --previous` → fix image, command, resources, taints, PVC or probe.', labs: ['replicaset-fix', 'storage-debug'] },
    { q: 'A Service does not reach its Pods.', how: '`k get ep,endpointslice` empty? Selector or targetPort mismatch. Test with a throwaway busybox Pod.', labs: ['service-debug', 'kube-proxy-fix'] },
    { q: 'Find the Pod using the most CPU and write its name to a file.', how: '`k top pod -A --sort-by=cpu --no-headers | head -1` → write only the name.', labs: ['top-consumer', 'metrics-fix'] },
    { q: 'Save the logs of a container that match X to a file.', how: '`k logs <pod> -c <ctr> | grep X > /path`, then `cat` the file.', labs: ['logs'] },
  ] },
  { domain: 'Cluster Architecture, Installation & Configuration', items: [
    { q: 'Back up etcd to a path, then restore from a given snapshot.', how: 'Read certs from `etcd.yaml` → `etcdctl snapshot save` → `etcdutl snapshot restore --data-dir <new>` → point the etcd-data hostPath at it.', labs: ['etcd', 'etcd-restore'] },
    { q: 'Upgrade the control plane (or a worker) by one minor version.', how: 'Repo → kubeadm pkg → `kubeadm upgrade plan/apply` (or `upgrade node`) → drain → kubelet + kubectl pkgs → restart kubelet → uncordon.', labs: ['kubeadm-upgrade-config', 'upgrade'] },
    { q: 'Prepare a node: install a runtime .deb, set sysctls, join it.', how: '`dpkg -i`, `systemctl enable --now`, `/etc/sysctl.d/k8s.conf` + `sysctl --system`, then `kubeadm token create --print-join-command` on the CP.', labs: ['prep-node', 'cri-dockerd', 'kubeadm-init'] },
    { q: 'Create a ServiceAccount / user with limited RBAC.', how: '`k create sa|role|rolebinding` imperatively, verify with `k auth can-i ... --as=system:serviceaccount:<ns>:<sa>`.', labs: ['rbac', 'csr-user', 'clusterrole-nodes'] },
    { q: 'Install a chart with Helm using given values / version.', how: '`helm repo add` → `helm install <rel> <chart> -n <ns> --create-namespace --version X --set k=v`. Check `helm list -A`.', labs: ['helm-release', 'helm-values-rollback', 'helm-template'] },
    { q: 'Apply a Kustomize overlay / patch.', how: '`k kustomize <dir>` to preview, `k apply -k <dir>` to apply.', labs: ['kustomize-overlay', 'kustomize-generator-patch'] },
    { q: 'List an operator\'s CRDs or create a custom resource.', how: '`k get crd | grep <x>`, `k explain <kind>.spec`, write the CR from the CRD schema.', labs: ['crd-resource', 'operator-install'] },
  ] },
  { domain: 'Services & Networking', items: [
    { q: 'Expose a Deployment with a NodePort on a given port.', how: '`k expose deploy web --type=NodePort --port=80 --target-port=8080 --name=web-svc`, then edit `nodePort` if a fixed one is asked.', labs: ['nodeport-svc', 'imperative-pod-svc'] },
    { q: 'Write a NetworkPolicy: only Pods X in namespace Y may reach Z on port P.', how: 'Copy the docs example. `podSelector` = target. Same list item = AND (`namespaceSelector` + `podSelector`), separate items = OR.', labs: ['networkpolicy', 'default-deny'] },
    { q: 'Create a Gateway + HTTPRoute, or migrate an Ingress to Gateway API.', how: 'Find the GatewayClass (`k get gatewayclass`), copy Gateway/HTTPRoute from gateway-api docs, keep hosts, paths and TLS from the Ingress.', labs: ['gateway-api', 'gateway-migrate', 'ingress'] },
    { q: 'Resolve a Service/Pod DNS name and save the output, or change CoreDNS.', how: '`k run tmp --rm -it --image=busybox:1.36 --restart=Never -- nslookup <svc>.<ns>`. CoreDNS config is the `coredns` ConfigMap in kube-system.', labs: ['dns', 'coredns-config'] },
  ] },
  { domain: 'Workloads & Scheduling', items: [
    { q: 'Rolling-update a Deployment image, then roll back.', how: '`k set image deploy/web web=nginx:1.27` → `k rollout status` → `k rollout undo [--to-revision=N]`.', labs: ['rollout', 'rollback'] },
    { q: 'Add a sidecar that tails the app\'s log file.', how: 'Shared `emptyDir`, second container (or native sidecar: initContainer with `restartPolicy: Always`) running `tail -f`.', labs: ['sidecar-logs', 'init-container'] },
    { q: 'Mount a ConfigMap/Secret as env or files.', how: '`k create cm|secret ... --from-literal/--from-file`, then `envFrom` or a volume in the Pod spec.', labs: ['config'] },
    { q: 'Create an HPA for CPU at N%.', how: '`k autoscale deploy web --cpu-percent=50 --min=1 --max=5`. The Pods need CPU requests.', labs: ['hpa'] },
    { q: 'Schedule onto specific nodes: taints, tolerations, affinity, requests, PriorityClass.', how: 'Generate the Pod with `$do`, then add `tolerations` / `affinity` copied from the docs.', labs: ['taint-toleration', 'node-affinity', 'priorityclass', 'resources-quota', 'static-pod'] },
  ] },
  { domain: 'Storage', items: [
    { q: 'Create a PV, a matching PVC and a Pod that mounts it.', how: 'Copy from the "Configure a Pod to use a PV" docs page. Match `storageClassName`, `accessModes` and size.', labs: ['pv-hostpath-retain', 'pvc'] },
    { q: 'Create a StorageClass / make it the default / expand a PVC.', how: 'Default = annotation `storageclass.kubernetes.io/is-default-class: "true"`. Expand needs `allowVolumeExpansion: true`, then edit the PVC size.', labs: ['sc-wffc', 'pvc-expand'] },
    { q: 'A PVC is stuck in Pending. Fix it.', how: '`k describe pvc`: wrong class, access mode, size, or WaitForFirstConsumer with no Pod yet.', labs: ['storage-debug'] },
  ] },
];

/* ---------- config file paths (kubeadm defaults) ---------- */
CKA.paths = [
  { group: 'Static Pods (control plane)', find: R`grep staticPodPath /var/lib/kubelet/config.yaml`, rows: [
    ['Static Pod folder', '/etc/kubernetes/manifests/', 'kubelet watches it. Save a file → Pod is (re)created. Move it out → Pod is deleted.'],
    ['kube-apiserver', '/etc/kubernetes/manifests/kube-apiserver.yaml', '`--etcd-servers`, `--service-cluster-ip-range`, `--authorization-mode`, `--enable-admission-plugins`, `--encryption-provider-config`'],
    ['kube-controller-manager', '/etc/kubernetes/manifests/kube-controller-manager.yaml', '`--cluster-cidr`, `--kubeconfig`, `--cluster-signing-cert-file`, `--service-account-private-key-file`'],
    ['kube-scheduler', '/etc/kubernetes/manifests/kube-scheduler.yaml', '`--kubeconfig`, `--config` (custom profiles)'],
    ['etcd', '/etc/kubernetes/manifests/etcd.yaml', '`--data-dir`, `--listen-client-urls`, `--cert-file`, `--key-file`, `--trusted-ca-file`, etcd-data hostPath'],
  ] },
  { group: 'Kubelet (every node)', find: R`ps -ef | grep [k]ubelet     # shows --config and --kubeconfig
systemctl cat kubelet`, rows: [
    ['Kubelet config', '/var/lib/kubelet/config.yaml', '`staticPodPath`, `clusterDNS`, `cgroupDriver`, `authentication`, eviction'],
    ['Kubelet flags', '/var/lib/kubelet/kubeadm-flags.env', '`--container-runtime-endpoint`, `--node-ip`'],
    ['Extra args', '/etc/default/kubelet', '`KUBELET_EXTRA_ARGS=` (Debian/Ubuntu)'],
    ['systemd drop-in', '/usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf', 'Older installs: /etc/systemd/system/kubelet.service.d/'],
    ['Kubelet kubeconfig', '/etc/kubernetes/kubelet.conf', 'Identity the kubelet uses to talk to the API server'],
    ['Kubelet certs', '/var/lib/kubelet/pki/', '`kubelet-client-current.pem` rotates'],
    ['Cluster copy', 'kube-system/kubelet-config ConfigMap', 'Used by `kubeadm upgrade node` / join'],
  ] },
  { group: 'kubeconfig files', find: R`k config view --minify`, rows: [
    ['Admin', '/etc/kubernetes/admin.conf', 'Copy to `~/.kube/config`. Or `export KUBECONFIG=/etc/kubernetes/admin.conf`'],
    ['Super admin', '/etc/kubernetes/super-admin.conf', 'Bypasses RBAC (system:masters). Break-glass only'],
    ['Controller-manager', '/etc/kubernetes/controller-manager.conf', ''],
    ['Scheduler', '/etc/kubernetes/scheduler.conf', ''],
    ['Your user', '~/.kube/config', 'What `kubectl` reads by default'],
  ] },
  { group: 'Certificates (PKI)', find: R`openssl x509 -in /etc/kubernetes/pki/apiserver.crt -noout -text | grep -A1 -E "Not After|Alternative"
kubeadm certs check-expiration`, rows: [
    ['Cluster CA', '/etc/kubernetes/pki/ca.crt · ca.key', 'Signs everything. CSR API uses it too'],
    ['API server', '/etc/kubernetes/pki/apiserver.crt · .key', 'SANs = names you can reach the API on'],
    ['API → kubelet', '/etc/kubernetes/pki/apiserver-kubelet-client.crt', ''],
    ['API → etcd', '/etc/kubernetes/pki/apiserver-etcd-client.crt', ''],
    ['ServiceAccount keys', '/etc/kubernetes/pki/sa.key · sa.pub', 'Sign / verify SA tokens'],
    ['Front proxy', '/etc/kubernetes/pki/front-proxy-ca.crt', 'Aggregation layer (metrics-server)'],
    ['etcd CA + server', '/etc/kubernetes/pki/etcd/ca.crt · server.crt · server.key', 'Use these for `etcdctl snapshot save`'],
  ] },
  { group: 'etcd data', find: R`grep -E "data-dir|path:" /etc/kubernetes/manifests/etcd.yaml`, rows: [
    ['Data dir', '/var/lib/etcd/', 'Restore to a **new** dir, then change the hostPath'],
    ['Client endpoint', 'https://127.0.0.1:2379', 'Peer port is 2380'],
  ] },
  { group: 'Runtime & CNI', find: R`crictl info | head
ls /etc/cni/net.d/`, rows: [
    ['containerd config', '/etc/containerd/config.toml', '`SystemdCgroup = true`. Regenerate: `containerd config default`'],
    ['containerd socket', 'unix:///run/containerd/containerd.sock', 'cri-dockerd: unix:///run/cri-dockerd.sock'],
    ['crictl config', '/etc/crictl.yaml', '`runtime-endpoint:`'],
    ['CNI config', '/etc/cni/net.d/', 'Empty folder → node NotReady (no network plugin)'],
    ['CNI binaries', '/opt/cni/bin/', ''],
    ['Kernel modules', '/etc/modules-load.d/k8s.conf', '`overlay`, `br_netfilter`'],
    ['sysctl', '/etc/sysctl.d/k8s.conf', '`net.ipv4.ip_forward = 1`, then `sysctl --system`'],
    ['apt repo', '/etc/apt/sources.list.d/kubernetes.list', 'Change `/v1.xx/` here before upgrading'],
  ] },
  { group: 'Config stored in the cluster', find: R`k -n kube-system get cm`, rows: [
    ['kube-proxy', 'kube-system/kube-proxy ConfigMap', '`config.conf`: mode, clusterCIDR. Restart the DaemonSet after editing'],
    ['CoreDNS', 'kube-system/coredns ConfigMap', '`Corefile`. Restart: `k -n kube-system rollout restart deploy coredns`'],
    ['kubeadm', 'kube-system/kubeadm-config ConfigMap', 'ClusterConfiguration: podSubnet, serviceSubnet, version'],
  ] },
  { group: 'Logs', find: R`journalctl -u kubelet -f`, rows: [
    ['kubelet / containerd', 'journalctl -u kubelet · journalctl -u containerd', 'Not files. Use `-n 50 --no-pager`'],
    ['Pod logs on the node', '/var/log/pods/<ns>_<pod>_<uid>/', 'Works even when the API server is down'],
    ['Container log symlinks', '/var/log/containers/', ''],
  ] },
];

/* ---------- shorthand commands (one-liners to type from memory) ---------- */
CKA.cheats = [
  { group: 'Setup (first 30 seconds)', icon: '⚡', items: [
    ['Dry-run shortcut', R`export do="--dry-run=client -o yaml"`],
    ['Instant delete', R`export now="--force --grace-period=0"`],
    ['Switch namespace', R`k config set-context --current --namespace=<ns>`],
    ['Switch context', R`k config use-context <ctx>`],
    ['Look up a field', R`k explain pod.spec.containers.securityContext`],
  ] },
  { group: 'Pods', icon: '🫛', items: [
    ['Run a Pod', R`k run web --image=nginx --port=80 -l app=web`],
    ['Pod YAML to file', R`k run web --image=nginx $do > pod.yaml`],
    ['Pod with a command', R`k run bb --image=busybox --restart=Never -- sleep 3600`],
    ['Throwaway test Pod', R`k run tmp --rm -it --image=busybox:1.36 --restart=Never -- wget -qO- http://web`],
    ['Shell into a Pod', R`k exec -it web -- sh`],
    ['Recreate after edit', R`k replace --force -f /tmp/kubectl-edit-*.yaml`],
    ['Force delete', R`k delete pod web $now`],
  ] },
  { group: 'Deployments', icon: '🚀', items: [
    ['Create', R`k create deploy web --image=nginx --replicas=3`],
    ['YAML to file', R`k create deploy web --image=nginx $do > deploy.yaml`],
    ['Scale', R`k scale deploy web --replicas=5`],
    ['Change image', R`k set image deploy/web nginx=nginx:1.27`],
    ['Rollout status / history', R`k rollout status deploy/web; k rollout history deploy/web`],
    ['Roll back', R`k rollout undo deploy/web --to-revision=1`],
    ['Autoscale (HPA)', R`k autoscale deploy web --cpu-percent=50 --min=2 --max=6`],
  ] },
  { group: 'Services', icon: '🔌', items: [
    ['ClusterIP', R`k expose deploy web --port=80 --target-port=8080`],
    ['NodePort', R`k expose deploy web --type=NodePort --port=80 --name=web-np`],
    ['Fixed nodePort', R`k create svc nodeport web --tcp=80:8080 --node-port=30080`],
    ['Check backends', R`k get ep,endpointslice -l app=web`],
    ['DNS test', R`k run tmp --rm -it --image=busybox:1.36 --restart=Never -- nslookup web.default.svc.cluster.local`],
  ] },
  { group: 'Config & Jobs', icon: '🧾', items: [
    ['ConfigMap', R`k create cm app-cfg --from-literal=MODE=prod --from-file=app.conf`],
    ['Secret', R`k create secret generic db --from-literal=password=s3cret`],
    ['TLS Secret', R`k create secret tls web-tls --cert=tls.crt --key=tls.key`],
    ['Decode a Secret', R`k get secret db -o jsonpath='{.data.password}' | base64 -d`],
    ['Job', R`k create job once --image=busybox -- echo hi`],
    ['CronJob', R`k create cronjob tick --image=busybox --schedule="*/5 * * * *" -- date`],
  ] },
  { group: 'RBAC', icon: '🔐', items: [
    ['ServiceAccount', R`k create sa app-sa`],
    ['Role', R`k create role pod-reader --verb=get,list,watch --resource=pods`],
    ['RoleBinding', R`k create rolebinding rb --role=pod-reader --serviceaccount=<ns>:app-sa`],
    ['ClusterRole + binding', R`k create clusterrole node-view --verb=get,list --resource=nodes
k create clusterrolebinding nv --clusterrole=node-view --user=jane`],
    ['Test permissions', R`k auth can-i list pods --as=system:serviceaccount:<ns>:app-sa -n <ns>`],
    ['SA token', R`k create token app-sa`],
    ['Approve a CSR', R`k certificate approve jane`],
  ] },
  { group: 'Nodes', icon: '🖥️', items: [
    ['Cordon', R`k cordon node01`],
    ['Drain', R`k drain node01 --ignore-daemonsets --delete-emptydir-data`],
    ['Uncordon', R`k uncordon node01`],
    ['Taint / remove taint', R`k taint node node01 gpu=true:NoSchedule
k taint node node01 gpu=true:NoSchedule-`],
    ['Label a node', R`k label node node01 disk=ssd`],
    ['Usage', R`k top node; k top pod -A --sort-by=cpu`],
    ['Join command', R`kubeadm token create --print-join-command`],
  ] },
  { group: 'etcd backup & restore', icon: '💾', items: [
    ['Backup', R`ETCDCTL_API=3 etcdctl snapshot save /opt/backup/etcd.db \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key`],
    ['Check snapshot', R`etcdutl --write-out=table snapshot status /opt/backup/etcd.db`],
    ['Restore', R`etcdutl snapshot restore /opt/backup/etcd.db --data-dir /var/lib/etcd-new
# then: vi /etc/kubernetes/manifests/etcd.yaml  → etcd-data hostPath: /var/lib/etcd-new`],
  ] },
  { group: 'Upgrade (kubeadm)', icon: '⬆️', items: [
    ['1. Repo + kubeadm', R`sed -i 's#/v1.36/#/v1.37/#' /etc/apt/sources.list.d/kubernetes.list
apt-get update && apt-mark unhold kubeadm && apt-get install -y kubeadm='1.37.1-*' && apt-mark hold kubeadm`],
    ['2. Control plane', R`kubeadm upgrade plan && kubeadm upgrade apply v1.37.1   # workers: kubeadm upgrade node`],
    ['3. Drain', R`k drain <node> --ignore-daemonsets`],
    ['4. kubelet + kubectl', R`apt-mark unhold kubelet kubectl && apt-get install -y kubelet='1.37.1-*' kubectl='1.37.1-*' && apt-mark hold kubelet kubectl
systemctl daemon-reload && systemctl restart kubelet`],
    ['5. Uncordon', R`k uncordon <node>`],
  ] },
  { group: 'Troubleshoot', icon: '🩺', items: [
    ['Why is it failing?', R`k describe pod web | tail -20`],
    ['Logs of the crashed run', R`k logs web --previous`],
    ['Recent events', R`k get events -A --sort-by=.lastTimestamp | tail`],
    ['kubelet health', R`systemctl status kubelet; journalctl -u kubelet -n 50 --no-pager`],
    ['Containers on the node', R`crictl ps -a; crictl logs <id>`],
    ['Control-plane Pods', R`k -n kube-system get pods -o wide`],
  ] },
  { group: 'Helm & Kustomize', icon: '📦', items: [
    ['Add repo', R`helm repo add bitnami https://charts.bitnami.com/bitnami && helm repo update`],
    ['Install', R`helm install web bitnami/nginx -n web --create-namespace --set replicaCount=2`],
    ['Upgrade / rollback', R`helm upgrade web bitnami/nginx -f values.yaml; helm rollback web 1`],
    ['List / remove', R`helm list -A; helm uninstall web -n web`],
    ['Kustomize', R`k kustomize overlays/prod; k apply -k overlays/prod`],
  ] },
  { group: 'Output & files', icon: '📤', items: [
    ['JSONPath', R`k get pod web -o jsonpath='{.spec.nodeName}'`],
    ['Custom columns', R`k get po -o custom-columns=NAME:.metadata.name,NODE:.spec.nodeName`],
    ['Sort', R`k get pv --sort-by=.spec.capacity.storage`],
    ['Count', R`k get po -A --no-headers | wc -l`],
  ] },
];
})();
