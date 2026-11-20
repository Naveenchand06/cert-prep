(() => { const R = String.raw;
CKA.topic({
  id: 'networking',
  title: 'Networking',
  icon: '🌐',
  domain: 'Services & Networking',
  kodekloud: 'Section 9 · Networking',
  summary: 'The Kubernetes network model, CNI and Pod networking, Service networking and kube-proxy, DNS with CoreDNS, Ingress, Gateway API and NetworkPolicy. This domain is 20% of the exam, and network troubleshooting adds more on top.',
  objectives: ['Understand connectivity between Pods', 'Define and enforce Network Policies', 'Use ClusterIP, NodePort, LoadBalancer service types and endpoints', 'Use the Gateway API to manage Ingress traffic', 'Know how to use Ingress controllers and Ingress resources', 'Understand and use CoreDNS'],
  concepts: [
    { title: 'Network model', body: 'Every Pod gets its own IP. All Pods can reach all other Pods **without NAT**, across nodes. Containers in one Pod share a network namespace and talk over `localhost`. Kubernetes doesn\'t implement this itself; the **CNI plugin** does (Calico, Cilium, Flannel, Weave…).' },
    { title: 'CNI', body: 'The kubelet (through the container runtime) calls the CNI plugin for each Pod sandbox. The config lives in `/etc/cni/net.d/` (the first file alphabetically wins) and the binaries in `/opt/cni/bin/`. The plugin creates the veth pair, assigns an IP from its **IPAM** range and sets up routes. The Pod CIDR is set with `kubeadm init --pod-network-cidr` and the CNI config. Check per-node ranges with `.spec.podCIDR`. Without a CNI, nodes stay `NotReady` and CoreDNS stays `Pending`.' },
    { title: 'Service networking & kube-proxy', body: 'Service IPs are virtual and come from `--service-cluster-ip-range` on the kube-apiserver. They are not bound to any interface. **kube-proxy** (a DaemonSet) watches Services and EndpointSlices and programs **iptables** (the usual default), **nftables** or IPVS rules that DNAT the ClusterIP:port to a backend Pod. Mode and settings live in the `kube-proxy` ConfigMap in kube-system. NodePort opens the port on every node; LoadBalancer also needs a cloud or bare-metal LB controller (e.g. MetalLB).' },
    { title: 'DNS & CoreDNS', body: 'CoreDNS runs as Deployment `coredns` behind Service `kube-dns` in kube-system (usually `10.96.0.10`). The kubelet writes that IP and the search domains into each Pod\'s `/etc/resolv.conf` (`clusterDNS` in the kubelet config). Records: `svc.ns.svc.cluster.local` → ClusterIP; headless Services → Pod IPs; Pods → `a-b-c-d.ns.pod.cluster.local`. Settings live in the `coredns` ConfigMap (Corefile): `kubernetes cluster.local`, `forward . /etc/resolv.conf`, `cache`.' },
    { title: 'Ingress', body: 'An Ingress is just rules: host/path → Service:port, with optional TLS from a Secret. Nothing happens without an **Ingress controller** (ingress-nginx, Traefik, HAProxy…), selected via `ingressClassName`. `pathType` is `Prefix`, `Exact` or `ImplementationSpecific`. Controller-specific behaviour such as rewrites uses annotations, e.g. `nginx.ingress.kubernetes.io/rewrite-target: /`.' },
    { title: 'Gateway API', body: 'The role-oriented successor to Ingress (`gateway.networking.k8s.io/v1`). **GatewayClass** (the infra provider picks the controller) → **Gateway** (the cluster operator defines listeners: protocol, port, hostname, TLS, allowedRoutes) → **HTTPRoute** / GRPCRoute / TLSRoute (app teams attach via `parentRefs`). Matches cover path, headers and query params. Filters handle redirect, rewrite and header modification. `backendRefs` with `weight` give canary/traffic splitting. The CRDs and a controller must be installed first. A Route in another namespace than its backend needs a **ReferenceGrant**.' },
    { title: 'NetworkPolicy', body: 'Without any policy, all traffic is allowed. Once a policy **selects** a Pod for Ingress or Egress, only explicitly allowed traffic in that direction passes. Policies are additive allow-lists. Sources/destinations: `podSelector` (same namespace), `namespaceSelector`, both combined in **one** item (AND), or `ipBlock`. Separate list items are OR. Enforcement depends on the CNI (Calico/Cilium yes, plain Flannel no). When you restrict egress, remember to allow **DNS (UDP/TCP 53)** to kube-system.' },
  ],
  commands: [
    { group: 'Pod network', use: 'Pod CIDRs per node', cmd: R`k get nodes -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.podCIDR}{"\n"}{end}'`, note: '' },
    { group: 'Pod network', use: 'Which CNI is installed', cmd: 'ls /etc/cni/net.d/ && ls /opt/cni/bin/\nk get pods -n kube-system -o wide | grep -Ei "calico|cilium|flannel|weave"', note: '' },
    { group: 'Pod network', use: 'Service CIDR', cmd: 'sudo grep service-cluster-ip-range /etc/kubernetes/manifests/kube-apiserver.yaml', note: '' },
    { group: 'Pod network', use: 'Node interfaces/routes', cmd: 'ip -br addr\nip route', note: '' },
    { group: 'Pod network', use: 'Test pod-to-pod', cmd: 'k run t --rm -it --restart=Never --image=busybox:1.36 -- wget -qO- -T2 <pod-ip>:<port>', note: '' },
    { group: 'Services', use: 'ClusterIP + endpoints', cmd: 'k get svc,endpointslices -n <ns>', note: '' },
    { group: 'Services', use: 'Test a Service by DNS', cmd: 'k run t --rm -it --restart=Never --image=busybox:1.36 -- wget -qO- -T2 http://<svc>.<ns>.svc.cluster.local', note: '' },
    { group: 'Services', use: 'kube-proxy mode', cmd: 'k get cm kube-proxy -n kube-system -o yaml | grep -i mode\nk logs -n kube-system -l k8s-app=kube-proxy | grep -i proxier', note: '' },
    { group: 'Services', use: 'iptables rules for a Service', cmd: 'sudo iptables -t nat -L KUBE-SERVICES -n | grep <svc>', note: '' },
    { group: 'DNS', use: 'Resolve a Service', cmd: 'k run t --rm -it --restart=Never --image=busybox:1.36 -- nslookup <svc>.<ns>.svc.cluster.local', note: '' },
    { group: 'DNS', use: 'Pod resolv.conf', cmd: 'k exec <pod> -- cat /etc/resolv.conf', note: '' },
    { group: 'DNS', use: 'CoreDNS health', cmd: 'k get pods,svc -n kube-system -l k8s-app=kube-dns\nk logs -n kube-system -l k8s-app=kube-dns', note: '' },
    { group: 'DNS', use: 'Corefile', cmd: 'k get cm coredns -n kube-system -o yaml', note: 'Restart after editing: `k rollout restart deploy coredns -n kube-system`.' },
    { group: 'DNS', use: 'Cluster domain & DNS IP', cmd: 'sudo grep -A2 clusterDNS /var/lib/kubelet/config.yaml; sudo grep clusterDomain /var/lib/kubelet/config.yaml', note: '' },
    { group: 'Ingress', use: 'Ingress classes & controller', cmd: 'k get ingressclass\nk get pods -A | grep -i ingress', note: '' },
    { group: 'Ingress', use: 'Create Ingress imperatively', cmd: 'k create ingress shop --class=nginx --rule="shop.example.com/api*=api-svc:8080" --rule="shop.example.com/=web-svc:80"', note: 'A trailing `*` gives pathType Prefix; without it the path is Exact.' },
    { group: 'Ingress', use: 'Ingress with TLS', cmd: 'k create ingress secure --class=nginx --rule="app.example.com/*=web:80,tls=web-tls"', note: '' },
    { group: 'Ingress', use: 'Test via host header', cmd: 'curl -H "Host: shop.example.com" http://<node-ip>:<ingress-nodeport>/api', note: '' },
    { group: 'Gateway API', use: 'Gateway resources', cmd: 'k get gatewayclass,gateway,httproute -A', note: '' },
    { group: 'Gateway API', use: 'Route status', cmd: 'k describe httproute <name> -n <ns>', note: 'Look for Accepted and ResolvedRefs conditions.' },
    { group: 'Gateway API', use: 'CRDs installed?', cmd: 'k get crd | grep gateway.networking.k8s.io', note: '' },
    { group: 'NetworkPolicy', use: 'List & describe', cmd: 'k get netpol -A\nk describe netpol <name> -n <ns>', note: '' },
    { group: 'NetworkPolicy', use: 'Namespace labels', cmd: 'k get ns --show-labels', note: 'Every namespace has `kubernetes.io/metadata.name=<ns>`.' },
    { group: 'NetworkPolicy', use: 'Test allowed vs denied', cmd: 'k run src --rm -it --restart=Never --image=busybox:1.36 -l role=api -n <ns> -- nc -zv -w2 <target-svc> 8080', note: 'Repeat without the label to see it fail.' },
  ],
  yaml: [
    { title: 'Ingress with two paths', note: '', code: R`apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop
  namespace: shop
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  tls:
  - hosts: ["shop.example.com"]
    secretName: shop-tls
  rules:
  - host: shop.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-svc
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-svc
            port:
              number: 80` },
    { title: 'Gateway + HTTPRoute', note: 'gatewayClassName comes from `k get gatewayclass`.', code: R`apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: web-gw
  namespace: apps
spec:
  gatewayClassName: <provided-class>
  listeners:
  - name: http
    protocol: HTTP
    port: 80
    hostname: "*.example.test"
    allowedRoutes:
      namespaces:
        from: Same
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: shop
  namespace: apps
spec:
  parentRefs:
  - name: web-gw
  hostnames: ["shop.example.test"]
  rules:
  - matches:
    - path: {type: PathPrefix, value: /}
    backendRefs:
    - name: shop
      port: 80` },
    { title: 'HTTPRoute traffic split + redirect', note: 'Canary 90/10, plus HTTP→HTTPS redirect on another route.', code: R`rules:
- matches:
  - path: {type: PathPrefix, value: /}
  backendRefs:
  - {name: web-v1, port: 80, weight: 90}
  - {name: web-v2, port: 80, weight: 10}
---
rules:
- filters:
  - type: RequestRedirect
    requestRedirect:
      scheme: https
      statusCode: 301` },
    { title: 'Gateway HTTPS listener', note: 'TLS terminated at the Gateway with a TLS Secret.', code: R`listeners:
- name: https
  protocol: HTTPS
  port: 443
  hostname: shop.example.test
  tls:
    mode: Terminate
    certificateRefs:
    - kind: Secret
      name: shop-tls` },
    { title: 'Default deny all (ingress + egress)', note: '', code: R`apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
  namespace: payments
spec:
  podSelector: {}
  policyTypes: ["Ingress", "Egress"]` },
    { title: 'Allow from labelled pods in another namespace + DNS egress', note: 'One `from` item with both selectors = AND.', code: R`apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-ledger
  namespace: payments
spec:
  podSelector:
    matchLabels: {app: ledger}
  policyTypes: ["Ingress", "Egress"]
  ingress:
  - from:
    - namespaceSelector:
        matchLabels: {kubernetes.io/metadata.name: api}
      podSelector:
        matchLabels: {role: api}
    ports:
    - {protocol: TCP, port: 8080}
  egress:
  - to:
    - podSelector:
        matchLabels: {app: db}
    ports:
    - {protocol: TCP, port: 5432}
  - to:
    - namespaceSelector: {}
      podSelector:
        matchLabels: {k8s-app: kube-dns}
    ports:
    - {protocol: UDP, port: 53}
    - {protocol: TCP, port: 53}` },
  ],
  gotchas: [
    '`- namespaceSelector` and `- podSelector` as **two list items** = OR (very permissive). As one item = AND.',
    'An empty `podSelector: {}` in `spec` selects all Pods in the namespace; in `from` it means all Pods in the same namespace.',
    'Egress-restricting policies break DNS unless you allow port 53.',
    'Ingress `pathType: Exact` with `/api` doesn\'t match `/api/`. Use Prefix.',
    'Gateway API resources do nothing without a controller that implements the GatewayClass. Check `ACCEPTED` on the class.',
    'Services select Pods by labels only. Wrong labels give empty endpoints and connection refused/timeouts.',
    'The ingress-nginx project has been retired. That is one reason the curriculum now stresses Gateway API, but labs may still use nginx IngressClasses.',
  ],
  tasks: [
    { id: 'nodeport-svc', title: 'Expose a deployment on a fixed NodePort', difficulty: 'Warm-up', time: '4–6 min', prompt: 'Expose deployment web (port 8080 in container) as Service web-np of type NodePort on node port 30080, Service port 80. Verify from a node.', steps: [
      { code: R`k expose deploy web --name=web-np --type=NodePort --port=80 --target-port=8080 $do > np.yaml
# add nodePort: 30080 under ports[0]
k apply -f np.yaml
k get svc web-np
curl -s http://<node-ip>:30080` } ], check: 'PORT(S) shows 80:30080/TCP and curl returns the app.' },
    { id: 'networkpolicy', title: 'Restrict pod ingress with NetworkPolicy', difficulty: 'Core workflow', time: '8–12 min', prompt: 'In namespace payments, allow pods labeled app=ledger to receive TCP/8080 only from pods labeled role=api (same namespace). Test allowed and denied traffic.', steps: [
      { code: R`k get pods -n payments --show-labels
k get netpol -n payments` },
      { code: R`cat <<'EOF' | k apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-ledger
  namespace: payments
spec:
  podSelector:
    matchLabels: {app: ledger}
  policyTypes: ["Ingress"]
  ingress:
  - from:
    - podSelector:
        matchLabels: {role: api}
    ports:
    - {protocol: TCP, port: 8080}
EOF
LEDGER=$(k get pod -n payments -l app=ledger -o jsonpath='{.items[0].status.podIP}')
k run ok --rm -it --restart=Never -n payments -l role=api --image=busybox:1.36 -- nc -zv -w2 $LEDGER 8080
k run no --rm -it --restart=Never -n payments --image=busybox:1.36 -- nc -zv -w2 $LEDGER 8080` } ], check: 'The role=api pod connects; the unlabelled pod times out (requires a policy-enforcing CNI).' },
    { id: 'default-deny', title: 'Default-deny a namespace but keep DNS', difficulty: 'Core workflow', time: '6–10 min', prompt: 'In namespace locked, deny all ingress and egress for all pods, except allow egress DNS to kube-system CoreDNS on UDP/TCP 53.', steps: [
      { note: 'Apply the default-deny template for namespace locked, plus a second policy with podSelector {}, policyTypes [Egress], egress to namespaceSelector kubernetes.io/metadata.name: kube-system + podSelector k8s-app: kube-dns on port 53 UDP and TCP.' },
      { code: R`k apply -f deny.yaml -f allow-dns.yaml
k run t --rm -it --restart=Never -n locked --image=busybox:1.36 -- sh -c "nslookup kubernetes.default && wget -qO- -T2 http://kubernetes.default || echo blocked"` } ], check: 'DNS resolves, but the HTTP request is blocked.' },
    { id: 'ingress', title: 'Route HTTP traffic with Ingress', difficulty: 'Core workflow', time: '6–10 min', prompt: 'Expose Service catalog (port 80) at catalog.example.test path / and Service search (port 8080) at path /search, in namespace shop, using the installed IngressClass.', steps: [
      { code: R`k get ingressclass
k get svc -n shop
k create ingress catalog -n shop --class=<class> \
  --rule="catalog.example.test/*=catalog:80" \
  --rule="catalog.example.test/search*=search:8080"
k describe ingress catalog -n shop
curl -H "Host: catalog.example.test" http://<controller-address>/search` } ], check: 'Ingress shows both rules with backends resolved, and the controller routes requests correctly.' },
    { id: 'gateway-api', title: 'Expose an app with Gateway API', difficulty: 'Core workflow', time: '8–12 min', prompt: 'Using the GatewayClass already installed, route HTTP requests for shop.example.test to Service shop on port 80 with Gateway web-gw and HTTPRoute shop in namespace apps.', steps: [
      { code: 'k get gatewayclass' },
      { note: 'Apply the Gateway + HTTPRoute template with the class name from the lab.' },
      { code: R`k apply -f shop-gateway.yaml
k get gateway,httproute -n apps
k describe httproute shop -n apps | grep -A3 Conditions
curl -H "Host: shop.example.test" http://$(k get gateway web-gw -n apps -o jsonpath='{.status.addresses[0].value}')` } ], check: 'Gateway is Programmed, HTTPRoute is Accepted with ResolvedRefs=True, and curl reaches shop.' },
    { id: 'gateway-migrate', title: 'Migrate an Ingress to Gateway API with TLS', difficulty: 'Stretch', time: '10–14 min', prompt: 'Ingress web in namespace www serves web.example.test with TLS secret web-tls. Recreate the same routing with a Gateway (HTTPS listener on 443 using web-tls) and an HTTPRoute, then delete the Ingress.', steps: [
      { code: 'k get ingress web -n www -o yaml' },
      { note: 'Write a Gateway with an HTTPS listener (port 443, hostname web.example.test, tls.mode Terminate, certificateRefs web-tls) and an HTTPRoute with the same host and path rules and backend Service/port as the Ingress.' },
      { code: R`k apply -f gw.yaml -f route.yaml
k get gateway,httproute -n www
k delete ingress web -n www` } ], check: 'HTTPS requests to web.example.test reach the same backend through the Gateway.' },
    { id: 'dns', title: 'Check CoreDNS and service discovery', difficulty: 'Core workflow', time: '6–10 min', domain: 'Troubleshooting', prompt: 'Pods cannot resolve api.team.svc.cluster.local. Verify the Service exists, test DNS from a pod, then inspect CoreDNS health, config and logs and fix the problem.', steps: [
      { code: R`k get svc api -n team
k run dns-test --rm -it --restart=Never --image=busybox:1.36 -- nslookup api.team.svc.cluster.local
k get pods,svc,endpointslices -n kube-system -l k8s-app=kube-dns
k logs -n kube-system -l k8s-app=kube-dns --tail=80
k get cm coredns -n kube-system -o yaml` },
      { note: 'Common causes: CoreDNS scaled to 0 or crashlooping (bad Corefile), kube-dns Service selector wrong, kubelet clusterDNS mismatch, or NetworkPolicy blocking port 53.' } ], check: 'The service name resolves to its ClusterIP from a workload pod; DNS pods are Ready.' },
    { id: 'coredns-config', title: 'Add a custom DNS entry to CoreDNS', difficulty: 'Stretch', time: '6–8 min', prompt: 'Make the name legacy.corp.internal resolve to 10.10.10.10 for all pods by editing the CoreDNS configuration.', steps: [
      { code: 'k edit cm coredns -n kube-system' },
      { code: R`# inside the .:53 { ... } block, add:
    hosts {
       10.10.10.10 legacy.corp.internal
       fallthrough
    }` },
      { code: R`k rollout restart deploy coredns -n kube-system
k run t --rm -it --restart=Never --image=busybox:1.36 -- nslookup legacy.corp.internal` } ], check: 'nslookup returns 10.10.10.10, and other cluster names still resolve.' },
  ],
  docs: [
    { label: 'Cluster networking', url: 'https://kubernetes.io/docs/concepts/cluster-administration/networking/' },
    { label: 'Service', url: 'https://kubernetes.io/docs/concepts/services-networking/service/' },
    { label: 'DNS for Services and Pods', url: 'https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/' },
    { label: 'Customizing DNS (CoreDNS)', url: 'https://kubernetes.io/docs/tasks/administer-cluster/dns-custom-nameservers/' },
    { label: 'Ingress', url: 'https://kubernetes.io/docs/concepts/services-networking/ingress/' },
    { label: 'Gateway API (k8s docs)', url: 'https://kubernetes.io/docs/concepts/services-networking/gateway/' },
    { label: 'Gateway API project docs', url: 'https://gateway-api.sigs.k8s.io/' },
    { label: 'Network policies', url: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/' },
  ],
});
})();
