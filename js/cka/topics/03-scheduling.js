(() => { const R = String.raw;
CKA.topic({
  id: 'scheduling',
  title: 'Scheduling',
  icon: '🧭',
  domain: 'Workloads & Scheduling',
  kodekloud: 'Section 3 · Scheduling',
  summary: 'How Pods land on nodes, and how you control it. This covers manual scheduling, labels and selectors, taints and tolerations, node affinity, resource requests/limits with quotas, DaemonSets, static Pods, PriorityClasses, multiple schedulers and admission controllers.',
  objectives: ['Configure Pod admission and scheduling (limits, node affinity, etc.)', 'Understand the primitives used to create robust, self-healing, application deployments'],
  concepts: [
    { title: 'How scheduling works', body: 'The scheduler watches for Pods with an empty `spec.nodeName`. It **filters** nodes (resources, taints, affinity, nodeSelector, ports, volumes), **scores** the rest, then **binds** the Pod. With no scheduler running, Pods stay `Pending` forever. Setting `nodeName` yourself bypasses the scheduler entirely, and taints are ignored too.' },
    { title: 'Taints vs tolerations vs affinity', body: 'A **taint** on a node repels Pods. A **toleration** on a Pod lets it ignore a matching taint, but does not attract it there. **nodeSelector / nodeAffinity** attracts a Pod to labelled nodes. To dedicate nodes to a workload, use **both**: taint the node and add a matching toleration plus affinity on the Pod.' },
    { title: 'Taint effects', body: '`NoSchedule`: new Pods without a toleration are not placed. `PreferNoSchedule`: avoided if possible. `NoExecute`: running Pods without a toleration are **evicted** (optionally after `tolerationSeconds`). Control-plane nodes carry `node-role.kubernetes.io/control-plane:NoSchedule`.' },
    { title: 'Node affinity', body: '`requiredDuringSchedulingIgnoredDuringExecution` is a hard rule. `preferredDuringSchedulingIgnoredDuringExecution` is a weighted preference. Operators: `In`, `NotIn`, `Exists`, `DoesNotExist`, `Gt`, `Lt`. "IgnoredDuringExecution" means label changes don\'t evict running Pods. **Pod (anti-)affinity** uses other Pods\' labels plus a `topologyKey` such as `kubernetes.io/hostname`.' },
    { title: 'Requests, limits, QoS', body: '**Requests** are what the scheduler reserves. **Limits** are enforced at runtime: going over the CPU limit throttles the container, going over the memory limit gets it OOMKilled. QoS classes: **Guaranteed** (requests = limits for all), **Burstable**, **BestEffort** (none). **LimitRange** sets per-container defaults/min/max in a namespace. **ResourceQuota** caps namespace totals, and once a quota covers cpu/memory every Pod must declare those values.' },
    { title: 'DaemonSets & static Pods', body: 'A **DaemonSet** runs one Pod per (matching) node. Typical uses are kube-proxy, CNI agents and log collectors. Generate one by creating a Deployment YAML, changing `kind`, and removing `replicas`/`strategy`. A **static Pod** is run by the kubelet straight from a file in its `staticPodPath`, with no API server needed. The API shows a read-only **mirror Pod** named `<pod>-<node>`.' },
    { title: 'PriorityClass & preemption', body: 'A `PriorityClass` maps a name to an integer `value`. Higher-priority Pods are scheduled first and can **preempt** (evict) lower ones when resources are short. `globalDefault: true` sets the default for Pods without a class. `preemptionPolicy: Never` queues the Pod ahead without evicting anything. Built-ins are `system-cluster-critical` and `system-node-critical`.' },
    { title: 'Multiple schedulers & profiles', body: 'Run another scheduler as a Deployment or static Pod with its own `KubeSchedulerConfiguration` (`profiles[].schedulerName`). Pods opt in with `spec.schedulerName`. Check which scheduler placed a Pod in its events: `k get events -o wide` shows the source.' },
    { title: 'Admission controllers', body: 'After authentication and authorization, requests pass **mutating** then **validating** admission. Enable built-in plugins with `--enable-admission-plugins` in the kube-apiserver manifest; examples are `NamespaceLifecycle`, `LimitRanger`, `ResourceQuota`, `NodeRestriction`, `PodSecurity`. Custom logic comes from webhooks (`MutatingWebhookConfiguration` / `ValidatingWebhookConfiguration`) or in-process CEL rules (`ValidatingAdmissionPolicy`).' },
  ],
  commands: [
    { group: 'Labels', use: 'Label a node', cmd: 'k label node node01 disk=ssd', note: 'Add `--overwrite` to change an existing value.' },
    { group: 'Labels', use: 'Remove a label', cmd: 'k label node node01 disk-', note: 'Trailing dash removes the key.' },
    { group: 'Labels', use: 'Show labels', cmd: 'k get nodes --show-labels', note: '`-L disk` adds a single column instead.' },
    { group: 'Labels', use: 'Select by labels', cmd: 'k get pods -l "env=prod,tier in (web,api)"', note: 'Equality and set-based selectors.' },
    { group: 'Taints', use: 'Taint a node', cmd: 'k taint nodes node01 app=blue:NoSchedule', note: '' },
    { group: 'Taints', use: 'Remove a taint', cmd: 'k taint nodes node01 app=blue:NoSchedule-', note: '' },
    { group: 'Taints', use: 'View taints', cmd: 'k describe node node01 | grep -A3 Taints', note: 'Or `k get nodes -o custom-columns=N:.metadata.name,T:.spec.taints`.' },
    { group: 'Taints', use: 'Allow pods on control plane (lab only)', cmd: 'k taint nodes controlplane node-role.kubernetes.io/control-plane:NoSchedule-', note: 'Removes the default control-plane taint.' },
    { group: 'Resources', use: 'Set requests/limits', cmd: 'k set resources deploy web --requests=cpu=100m,memory=128Mi --limits=cpu=500m,memory=256Mi', note: 'Triggers a rollout.' },
    { group: 'Resources', use: 'Create a quota', cmd: 'k create quota team-q -n team --hard=pods=10,requests.cpu=2,requests.memory=4Gi,limits.memory=8Gi', note: 'See usage with `k describe quota -n team`.' },
    { group: 'Resources', use: 'Node allocation', cmd: 'k describe node node01 | grep -A8 "Allocated resources"', note: 'Shows how much is requested vs allocatable.' },
    { group: 'Resources', use: 'Pod QoS class', cmd: R`k get pod web -o jsonpath='{.status.qosClass}'`, note: '' },
    { group: 'DaemonSets', use: 'DaemonSet from a deployment skeleton', cmd: R`k create deploy agent --image=fluent/fluent-bit $do > ds.yaml
# change kind to DaemonSet, delete replicas, strategy and status`, note: 'There is no `k create daemonset`.' },
    { group: 'DaemonSets', use: 'List DaemonSets', cmd: 'k get ds -A', note: 'DESIRED usually equals the number of eligible nodes.' },
    { group: 'Static Pods', use: 'Find static Pod path', cmd: 'sudo grep staticPodPath /var/lib/kubelet/config.yaml', note: 'Check `systemctl cat kubelet` for a different `--config`.' },
    { group: 'Static Pods', use: 'Generate a static Pod file', cmd: R`k run static-web --image=nginx $do | sudo tee /etc/kubernetes/manifests/static-web.yaml`, note: 'Run on the target node, or scp the file there.' },
    { group: 'Static Pods', use: 'Spot static Pods', cmd: R`k get pods -A -o jsonpath='{range .items[?(@.metadata.ownerReferences[0].kind=="Node")]}{.metadata.namespace}/{.metadata.name}{"\n"}{end}'`, note: 'Mirror Pods are owned by the Node object.' },
    { group: 'Priority', use: 'Create PriorityClass', cmd: 'k create priorityclass high-prio --value=100000 --description="critical apps"', note: 'Add `--preemption-policy=Never` to stop it preempting.' },
    { group: 'Priority', use: 'Pod priorities', cmd: 'k get pods -o custom-columns=NAME:.metadata.name,PRIO:.spec.priorityClassName,VALUE:.spec.priority', note: '' },
    { group: 'Scheduler', use: 'Manually bind a pod', cmd: R`# set spec.nodeName: node01 in YAML then
k replace --force -f pod.yaml`, note: 'You cannot change nodeName on a running Pod.' },
    { group: 'Scheduler', use: 'Who scheduled it', cmd: 'k get events -o wide --field-selector involvedObject.name=<pod>', note: 'SOURCE column shows the scheduler name.' },
    { group: 'Admission', use: 'Enabled admission plugins', cmd: 'sudo grep admission /etc/kubernetes/manifests/kube-apiserver.yaml', note: '' },
    { group: 'Admission', use: 'Default-on plugin list', cmd: 'k exec -n kube-system kube-apiserver-controlplane -- kube-apiserver -h | grep -A2 "enable-admission-plugins"', note: 'Shows plugins enabled by default.' },
    { group: 'Admission', use: 'Webhooks & policies', cmd: 'k get mutatingwebhookconfigurations,validatingwebhookconfigurations,validatingadmissionpolicies', note: '' },
  ],
  yaml: [
    { title: 'Taint toleration + node affinity (dedicated node)', note: 'Toleration lets it on, affinity keeps it there.', code: R`apiVersion: v1
kind: Pod
metadata:
  name: gpu-job
spec:
  tolerations:
  - key: gpu
    operator: Equal
    value: "true"
    effect: NoSchedule
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: accelerator
            operator: In
            values: ["nvidia"]
  containers:
  - name: job
    image: busybox:1.36
    command: ["sleep", "3600"]` },
    { title: 'Pod anti-affinity: one replica per node', note: 'Spread replicas across hostnames.', code: R`spec:
  affinity:
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchLabels:
            app: web
        topologyKey: kubernetes.io/hostname` },
    { title: 'Requests & limits', note: 'Container-level `resources`.', code: R`containers:
- name: app
  image: nginx
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 256Mi` },
    { title: 'LimitRange defaults', note: 'Applied at admission to containers missing values.', code: R`apiVersion: v1
kind: LimitRange
metadata:
  name: defaults
  namespace: team
spec:
  limits:
  - type: Container
    default:
      cpu: 500m
      memory: 256Mi
    defaultRequest:
      cpu: 100m
      memory: 128Mi
    max:
      memory: 1Gi` },
    { title: 'PriorityClass + usage', note: '', code: R`apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-prio
value: 100000
globalDefault: false
description: critical apps
---
# in the Pod spec
spec:
  priorityClassName: high-prio` },
    { title: 'Custom scheduler profile', note: 'Passed via `--config` to a second kube-scheduler.', code: R`apiVersion: kubescheduler.config.k8s.io/v1
kind: KubeSchedulerConfiguration
profiles:
- schedulerName: my-scheduler
leaderElection:
  leaderElect: false
---
# Pod opting in
spec:
  schedulerName: my-scheduler` },
  ],
  gotchas: [
    'A toleration alone does not guarantee placement on the tainted node. Add nodeSelector/affinity for that.',
    'Removing a taint needs the exact key, value and effect plus a trailing `-` (or `key-` removes all effects for the key).',
    'Once a ResourceQuota covers cpu/memory, Pods without requests/limits are **rejected**. Add a LimitRange or set them.',
    'Static Pods cannot be deleted with kubectl; the mirror Pod comes straight back. Remove the manifest file instead.',
    'Never keep backup copies inside `/etc/kubernetes/manifests`. kubelet runs every file there.',
    'Pending with `0/3 nodes are available: ... untolerated taint` is a taint issue. `Insufficient cpu` is a requests issue.',
  ],
  tasks: [
    { id: 'schedule', title: 'Schedule a pod onto a labeled node', difficulty: 'Core workflow', time: '5–8 min', prompt: 'Label a worker node with disk=ssd and schedule a pod named cache there using nodeSelector. Keep the pod running and prove which node it landed on.', steps: [
      { code: R`k get nodes -o wide
k label node <worker-node> disk=ssd
k run cache --image=redis:7 --dry-run=client -o yaml > cache.yaml` },
      { note: 'Edit the generated pod spec to add spec.nodeSelector.disk: ssd, then apply and verify.' },
      { code: R`k apply -f cache.yaml
k get pod cache -o wide
k describe pod cache` } ], check: 'The pod is Running, nodeSelector matches the label, and NODE is the intended worker.' },
    { id: 'taint-toleration', title: 'Dedicate a node with taints and tolerations', difficulty: 'Core workflow', time: '6–10 min', prompt: 'Taint node01 with team=blue:NoSchedule. Create pod plain (nginx) that must not land on node01, and pod blue (nginx) that tolerates the taint and is forced onto node01 with node affinity on kubernetes.io/hostname.', steps: [
      { code: R`k taint nodes node01 team=blue:NoSchedule
k run plain --image=nginx
k run blue --image=nginx $do > blue.yaml` },
      { note: 'Add to blue.yaml spec: a toleration (key team, operator Equal, value blue, effect NoSchedule) and a required nodeAffinity on kubernetes.io/hostname In [node01].' },
      { code: R`k apply -f blue.yaml
k get pods plain blue -o wide` } ], check: 'blue runs on node01; plain runs elsewhere (or stays Pending in a 1-worker lab, citing the taint).' },
    { id: 'node-affinity', title: 'Preferred and required node affinity', difficulty: 'Core workflow', time: '6–8 min', prompt: 'Create deployment analytics (3 replicas, nginx) that must run on nodes labeled zone in (east, west), preferring zone=east with weight 80.', steps: [
      { code: R`k label node node01 zone=east
k label node node02 zone=west
k create deploy analytics --image=nginx --replicas=3 $do > analytics.yaml` },
      { code: R`# under spec.template.spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - {key: zone, operator: In, values: [east, west]}
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 80
            preference:
              matchExpressions:
              - {key: zone, operator: In, values: [east]}` },
      { code: R`k apply -f analytics.yaml
k get pods -l app=analytics -o wide` } ], check: 'All Pods land on zone-labelled nodes, mostly on the east node.' },
    { id: 'daemonset', title: 'Run a log agent on every node', difficulty: 'Core workflow', time: '5–8 min', prompt: 'Create a DaemonSet log-agent in kube-system using image busybox:1.36 running "sleep infinity". It must also run on control-plane nodes.', steps: [
      { code: R`k create deploy log-agent -n kube-system --image=busybox:1.36 $do -- sleep infinity > ds.yaml` },
      { note: 'Change `kind: Deployment` to `kind: DaemonSet`, delete `replicas`, `strategy` and `status`, and add a toleration for the control-plane taint:' },
      { code: R`      tolerations:
      - key: node-role.kubernetes.io/control-plane
        operator: Exists
        effect: NoSchedule` },
      { code: R`k apply -f ds.yaml
k get ds log-agent -n kube-system
k get pods -n kube-system -l app=log-agent -o wide` } ], check: 'DESIRED = CURRENT = READY = total number of nodes.' },
    { id: 'static-pod', title: 'Create a static Pod on a designated node', difficulty: 'Core workflow', time: '6–10 min', domain: 'Cluster Architecture, Installation & Configuration', prompt: 'On the node named by the task, create a static Pod named local-check that runs busybox and stays running. Verify its node placement and identify the local manifest path that owns it.', steps: [
      { note: 'SSH to the target node. Check the kubelet service/config first; kubeadm commonly uses /var/lib/kubelet/config.yaml with staticPodPath /etc/kubernetes/manifests. Use the actual configured path if it differs.' },
      { code: R`ssh <designated-node>
sudo systemctl cat kubelet
sudo grep -n staticPodPath /var/lib/kubelet/config.yaml
sudo install -d -m 755 /etc/kubernetes/manifests
sudo tee /etc/kubernetes/manifests/local-check.yaml >/dev/null <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: local-check
spec:
  containers:
  - name: check
    image: busybox:1.36
    command: ["sh", "-c", "sleep 3600"]
EOF` },
      { code: R`k get pods -A -o wide | grep local-check
sudo crictl pods` },
      { note: 'The API object is a kubelet-created mirror Pod (suffixed with the node name). To change or remove it, edit or remove the local manifest.' } ], check: 'The mirror Pod is Running on the designated node, and you can point to the exact local manifest and kubelet config paths.' },
    { id: 'priorityclass', title: 'Give a workload a higher priority', difficulty: 'Core workflow', time: '4–6 min', prompt: 'Create PriorityClass critical-app with value 1000000 that does not preempt other pods. Patch deployment payments to use it.', steps: [
      { code: R`k create priorityclass critical-app --value=1000000 --preemption-policy=Never --description="payments"
k patch deploy payments -p '{"spec":{"template":{"spec":{"priorityClassName":"critical-app"}}}}'
k get pods -l app=payments -o custom-columns=NAME:.metadata.name,PRIO:.spec.priority` } ], check: 'New Pods show priority 1000000 and the class has preemptionPolicy Never.' },
    { id: 'resources-quota', title: 'Enforce namespace quotas and defaults', difficulty: 'Core workflow', time: '6–10 min', prompt: 'In namespace team-a, limit total pods to 5 and total memory requests to 1Gi. Add a LimitRange so containers without values get 128Mi request / 256Mi limit, then create a pod without resources and confirm defaults were applied.', steps: [
      { code: R`k create ns team-a
k create quota team-a-q -n team-a --hard=pods=5,requests.memory=1Gi` },
      { code: R`cat <<'EOF' | k apply -f -
apiVersion: v1
kind: LimitRange
metadata:
  name: mem-defaults
  namespace: team-a
spec:
  limits:
  - type: Container
    defaultRequest:
      memory: 128Mi
    default:
      memory: 256Mi
EOF
k run probe --image=nginx -n team-a
k get pod probe -n team-a -o jsonpath='{.spec.containers[0].resources}'
k describe quota -n team-a` } ], check: 'The Pod shows the injected 128Mi/256Mi and the quota shows Used requests.memory 128Mi.' },
  ],
  docs: [
    { label: 'Assigning Pods to nodes', url: 'https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/' },
    { label: 'Taints and tolerations', url: 'https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/' },
    { label: 'Resource management', url: 'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/' },
    { label: 'Resource quotas', url: 'https://kubernetes.io/docs/concepts/policy/resource-quotas/' },
    { label: 'Pod priority & preemption', url: 'https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/' },
    { label: 'Multiple schedulers', url: 'https://kubernetes.io/docs/tasks/extend-kubernetes/configure-multiple-schedulers/' },
    { label: 'Admission controllers', url: 'https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/' },
    { label: 'Static Pods', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/' },
  ],
});
})();
