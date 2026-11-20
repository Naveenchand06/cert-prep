(() => { const R = String.raw;
CKA.topic({
  id: 'core-concepts',
  title: 'Core Concepts',
  icon: '🧱',
  domain: 'Cluster Architecture, Installation & Configuration',
  kodekloud: 'Section 2 · Core Concepts',
  summary: 'The architecture you will troubleshoot all exam long: control-plane components, node components, and the basic objects (Pod, ReplicaSet, Deployment, Service, Namespace). Know what each component does and where it runs. Then you can tell which one broke from the symptom alone.',
  objectives: ['Understand the primitives used to create robust, self-healing, application deployments', 'Use ClusterIP, NodePort, LoadBalancer service types and endpoints'],
  concepts: [
    { title: 'Control plane', body: '**kube-apiserver**: the only component that talks to etcd. Every other component and `kubectl` goes through it. **etcd**: key-value store holding all cluster state (port 2379 client, 2380 peer). **kube-scheduler**: picks a node for unscheduled Pods (filter, then score). **kube-controller-manager**: runs the reconcile loops (Deployment, ReplicaSet, Node, Endpoint, ServiceAccount…). In kubeadm clusters these all run as **static Pods** from `/etc/kubernetes/manifests`.' },
    { title: 'Node components', body: '**kubelet**: a systemd service, not a Pod. It registers the node, runs Pods through the container runtime, and reports status. **Container runtime**: containerd (or CRI-O) via the CRI; inspect it with `crictl`. **kube-proxy**: a DaemonSet that programs iptables/nftables rules for Services.' },
    { title: 'Symptom → component', body: 'Pods stay `Pending` with no events: check the **scheduler**. Deployment changes but no new ReplicaSet/Pods: check the **controller-manager**. `kubectl` gets connection refused: check the **apiserver** (or etcd behind it). A node goes `NotReady`: check the **kubelet** or runtime. A Service has endpoints but doesn\'t route: check **kube-proxy** or the CNI.' },
    { title: 'Pod → ReplicaSet → Deployment', body: 'A Pod is one or more containers sharing network and volumes. A ReplicaSet keeps N Pods matching its `selector` alive. A Deployment manages ReplicaSets to give rolling updates and rollbacks. Its `spec.selector` must match `template.metadata.labels`, and the selector is immutable.' },
    { title: 'Services', body: '**ClusterIP** (default): a virtual IP reachable inside the cluster. **NodePort**: ClusterIP plus a port 30000–32767 on every node. **LoadBalancer**: NodePort plus an external LB from a cloud controller. **Headless** (`clusterIP: None`): DNS returns Pod IPs directly. The Service `selector` picks Pods; the matching ready Pod IPs become **EndpointSlices**. `port` is the Service port, `targetPort` the container port.' },
    { title: 'Namespaces & DNS names', body: 'Namespaces scope names, RBAC, quotas and NetworkPolicies. From the same namespace a Service is reachable as `svc`. From elsewhere use `svc.ns` or the FQDN `svc.ns.svc.cluster.local`. Nodes, PVs, StorageClasses, ClusterRoles and Namespaces themselves are cluster-scoped.' },
    { title: 'Imperative vs declarative', body: 'Imperative (`create`, `run`, `expose`, `scale`, `set`) is fast for exam tasks. Declarative (`apply -f`) tracks the last applied config and is how real clusters are managed. On the exam, generate with imperative + `--dry-run=client -o yaml`, then `apply`.' },
  ],
  commands: [
    { group: 'Pods', use: 'Run a pod', cmd: 'k run nginx --image=nginx', note: 'Creates a bare Pod (no controller).' },
    { group: 'Pods', use: 'Pod with labels, port and env', cmd: 'k run web --image=nginx -l tier=web,app=shop --port=80 --env=MODE=prod', note: 'Many fields are settable with flags.' },
    { group: 'Pods', use: 'Pod plus ClusterIP Service in one go', cmd: 'k run web --image=nginx --port=80 --expose', note: 'Creates a Service with the same name selecting the Pod.' },
    { group: 'Pods', use: 'Pod with a custom command', cmd: 'k run box --image=busybox --restart=Never --command -- sleep 3600', note: '`--command` makes the args the container command, not args.' },
    { group: 'Pods', use: 'Temporary debug pod', cmd: 'k run tmp --rm -it --restart=Never --image=busybox:1.36 -- sh', note: 'Deleted when you exit the shell.' },
    { group: 'Pods', use: 'Which node, which IP', cmd: 'k get pods -o wide', note: 'Adds IP, NODE, NOMINATED NODE columns.' },
    { group: 'Workloads', use: 'Create a deployment', cmd: 'k create deployment web --image=nginx:1.27 --replicas=3 --port=80', note: 'Labels Pods with app=web.' },
    { group: 'Workloads', use: 'Scale', cmd: 'k scale deployment web --replicas=5', note: 'Also works for ReplicaSets and StatefulSets.' },
    { group: 'Workloads', use: 'Fix a ReplicaSet image', cmd: 'k set image rs/web nginx=nginx:1.27 && k delete pod -l app=web', note: 'A ReplicaSet does not replace existing Pods when its template changes. Delete them to roll.' },
    { group: 'Workloads', use: 'See the ownership chain', cmd: 'k get deploy,rs,pods -l app=web', note: 'Deployment → ReplicaSet (hash suffix) → Pods.' },
    { group: 'Services', use: 'Expose a deployment', cmd: 'k expose deployment web --port=80 --target-port=8080 --name=web-svc', note: 'Copies the deployment selector into the Service.' },
    { group: 'Services', use: 'NodePort Service', cmd: 'k expose deployment web --type=NodePort --port=80', note: 'Generate YAML and add `nodePort: 30080` if a fixed port is required.' },
    { group: 'Services', use: 'Create a Service by type', cmd: 'k create service nodeport web --tcp=80:8080 --node-port=30080', note: 'Selector defaults to app=<name>. Check it matches the Pods.' },
    { group: 'Services', use: 'Endpoints behind a Service', cmd: 'k get endpointslices -l kubernetes.io/service-name=web', note: 'Empty endpoints usually mean a selector or readiness problem.' },
    { group: 'Namespaces', use: 'Create namespace', cmd: 'k create ns dev', note: '' },
    { group: 'Namespaces', use: 'Everything in a namespace', cmd: 'k get all -n dev', note: '`all` does not include ConfigMaps, Secrets, PVCs or Ingress.' },
    { group: 'Namespaces', use: 'Find which namespace holds a pod', cmd: 'k get pods -A | grep <name>', note: '' },
    { group: 'Control plane', use: 'Control-plane pods', cmd: 'k get pods -n kube-system -o wide', note: 'Static Pods are suffixed with the node name.' },
    { group: 'Control plane', use: 'API server health', cmd: R`k get --raw='/readyz?verbose'`, note: 'Lists each readiness check.' },
    { group: 'Control plane', use: 'Component flags', cmd: 'sudo cat /etc/kubernetes/manifests/kube-apiserver.yaml | grep -E "\\-\\-(etcd|service|authorization|admission)"', note: 'Find service CIDR, etcd endpoints, admission plugins.' },
  ],
  yaml: [
    { title: 'Deployment', note: 'The selector must match template labels.', code: R`apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  labels:
    app: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:1.27
        ports:
        - containerPort: 80` },
    { title: 'NodePort Service', note: '`port` = Service port, `targetPort` = container port, `nodePort` = 30000–32767.', code: R`apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  type: NodePort
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30080` },
  ],
  gotchas: [
    'Pods created with `k run` have label `run=<name>`; Deployments label Pods `app=<name>`.',
    'Updating a ReplicaSet template does not touch running Pods. A Deployment does.',
    '`kubectl expose pod` needs the pod to have labels, otherwise there is no selector.',
    'Service `targetPort` can be a named port (`http`) defined on the container.',
    'kubelet is never in `kubectl get pods`. Check it with `systemctl status kubelet` on the node.',
  ],
  tasks: [
    { id: 'imperative-pod-svc', title: 'Create a pod and Service imperatively', difficulty: 'Warm-up', time: '3–5 min', domain: 'Services & Networking', prompt: 'In namespace web, create a Pod named frontend (image nginx:1.27, label tier=frontend). Expose it on port 80 with a ClusterIP Service named frontend-svc, and confirm the Service has an endpoint.', steps: [
      { code: R`k create ns web
k run frontend --image=nginx:1.27 -l tier=frontend --port=80 -n web
k expose pod frontend --name=frontend-svc --port=80 --target-port=80 -n web
k get endpointslices -n web -l kubernetes.io/service-name=frontend-svc
k run t --rm -it --restart=Never --image=busybox:1.36 -n web -- wget -qO- frontend-svc` } ], check: 'The endpoint slice lists the Pod IP and the wget returns the nginx welcome page.' },
    { id: 'replicaset-fix', title: 'Fix a broken ReplicaSet', difficulty: 'Core workflow', time: '5–8 min', domain: 'Workloads & Scheduling', prompt: 'ReplicaSet api-rs in namespace default fails to create, or creates Pods with ImagePullBackOff because of image nginx:latestt. Fix the image and get all replicas Ready.', steps: [
      { code: R`k get rs api-rs -o yaml > api-rs.yaml
k describe rs api-rs
k set image rs/api-rs '*=nginx:1.27'
k get rs api-rs -o wide          # SELECTOR column, e.g. app=api
k delete pod -l app=api           # RS re-creates Pods from the fixed template
k get rs api-rs` },
      { note: 'If the ReplicaSet was rejected because `selector` did not match the template labels, edit the YAML so they match and `k apply -f api-rs.yaml`.' } ], check: 'DESIRED = READY, and the Pods run the corrected image.' },
  ],
  docs: [
    { label: 'Kubernetes components', url: 'https://kubernetes.io/docs/concepts/overview/components/' },
    { label: 'Deployments', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/' },
    { label: 'Services', url: 'https://kubernetes.io/docs/concepts/services-networking/service/' },
    { label: 'Namespaces', url: 'https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/' },
  ],
});
})();
