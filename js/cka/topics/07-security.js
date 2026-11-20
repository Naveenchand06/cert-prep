(() => { const R = String.raw;
CKA.topic({
  id: 'security',
  title: 'Security',
  icon: '🔐',
  domain: 'Cluster Architecture, Installation & Configuration',
  kodekloud: 'Section 7 · Security',
  summary: 'Authentication with TLS certificates and kubeconfig, the Certificates API, authorization with RBAC (Roles, ClusterRoles, bindings), ServiceAccounts, private registry credentials, security contexts and Pod Security Admission. RBAC appears on nearly every exam.',
  objectives: ['Manage role based access control (RBAC)'],
  concepts: [
    { title: 'Request flow', body: 'Every API request goes through **authentication** (who are you: client certificate, bearer/ServiceAccount token, OIDC), then **authorization** (may you: `--authorization-mode=Node,RBAC`), then **admission** (mutate/validate). Kubernetes has no User objects. A user is just the certificate **CN**, and groups come from **O** fields.' },
    { title: 'TLS in the cluster', body: 'The cluster CA (`/etc/kubernetes/pki/ca.crt`) signs server certificates (apiserver, kubelet) and client certificates (admin, scheduler, controller-manager, kubelet clients). etcd usually has its **own CA** under `pki/etcd/`. Inspect a certificate with `openssl x509 -noout -text` and check the Subject, Issuer, SANs (DNS/IP names) and validity.' },
    { title: 'Certificates API', body: 'A user generates a key and CSR. You wrap the CSR in a `CertificateSigningRequest` object with `signerName: kubernetes.io/kube-apiserver-client` and `usages: [client auth]`, then **approve** it. The controller-manager signs it with the cluster CA, and you read the result from `.status.certificate`.' },
    { title: 'kubeconfig', body: 'A kubeconfig has three lists: **clusters** (server + CA), **users** (credentials) and **contexts** (cluster + user + namespace). `current-context` picks the active one. The default is `~/.kube/config`; override with `--kubeconfig` or `$KUBECONFIG`.' },
    { title: 'RBAC model', body: '**Role** = rules in one namespace. **ClusterRole** = rules that are cluster-wide or for cluster-scoped resources, reusable across namespaces. **RoleBinding** grants a Role or ClusterRole **within one namespace**. **ClusterRoleBinding** grants a ClusterRole across all namespaces. Rules list `apiGroups` (`""` = core), `resources` (and subresources like `pods/log`), `verbs` and optionally `resourceNames`. Permissions only add up; there is no deny.' },
    { title: 'ServiceAccounts', body: 'Every namespace has a `default` SA. Pods get a short-lived **projected token** at `/var/run/secrets/kubernetes.io/serviceaccount/`. `kubectl create token <sa>` mints a token on demand. Disable automount with `automountServiceAccountToken: false`. A ServiceAccount is referenced in RBAC as `system:serviceaccount:<ns>:<name>`.' },
    { title: 'Image security', body: 'For private registries, create a `docker-registry` Secret and reference it in `spec.imagePullSecrets` (or attach it to the ServiceAccount). Image names without a registry default to `docker.io/library/`.' },
    { title: 'Security contexts', body: 'At Pod level: `runAsUser`, `runAsGroup`, `fsGroup`, `runAsNonRoot`, `seccompProfile`. At container level (overrides the Pod level): `allowPrivilegeEscalation`, `readOnlyRootFilesystem`, `privileged` and **`capabilities.add/drop`**, which exists only at container level.' },
    { title: 'Pod Security Admission', body: 'Built-in replacement for PodSecurityPolicy. Label a namespace with `pod-security.kubernetes.io/<mode>=<level>`. Modes are `enforce`, `audit` and `warn`; levels are `privileged`, `baseline` and `restricted`. Violating Pods are rejected only in enforce mode.' },
  ],
  commands: [
    { group: 'Certificates', use: 'Inspect a certificate', cmd: 'sudo openssl x509 -in /etc/kubernetes/pki/apiserver.crt -noout -text | grep -E "Subject:|Issuer:|Not After|DNS:"', note: '' },
    { group: 'Certificates', use: 'Generate key + CSR', cmd: 'openssl genrsa -out jane.key 2048\nopenssl req -new -key jane.key -subj "/CN=jane/O=dev-team" -out jane.csr', note: 'CN = username, O = group.' },
    { group: 'Certificates', use: 'Base64 the CSR', cmd: 'base64 -w0 jane.csr', note: 'Paste into spec.request.' },
    { group: 'Certificates', use: 'List / approve / deny CSRs', cmd: 'k get csr\nk certificate approve jane\nk certificate deny jane', note: '' },
    { group: 'Certificates', use: 'Extract signed certificate', cmd: R`k get csr jane -o jsonpath='{.status.certificate}' | base64 -d > jane.crt`, note: '' },
    { group: 'kubeconfig', use: 'Add user credentials', cmd: 'k config set-credentials jane --client-certificate=jane.crt --client-key=jane.key --embed-certs=true', note: '' },
    { group: 'kubeconfig', use: 'Add context', cmd: 'k config set-context jane@kubernetes --cluster=kubernetes --user=jane --namespace=dev', note: '' },
    { group: 'kubeconfig', use: 'Use a separate kubeconfig', cmd: 'k get pods --kubeconfig=/root/my-kube-config', note: '' },
    { group: 'kubeconfig', use: 'Show the current cluster only', cmd: 'k config view --minify', note: 'Add `--raw` to include certificate data.' },
    { group: 'RBAC', use: 'Role', cmd: 'k create role dev --verb=get,list,watch,create,delete --resource=pods,deployments -n dev', note: 'Add `--resource-name=x` to restrict to named objects.' },
    { group: 'RBAC', use: 'RoleBinding to user/group', cmd: 'k create rolebinding dev-jane --role=dev --user=jane -n dev\nk create rolebinding dev-team --role=dev --group=dev-team -n dev', note: '' },
    { group: 'RBAC', use: 'ClusterRole for nodes', cmd: 'k create clusterrole node-reader --verb=get,list,watch --resource=nodes', note: 'Nodes are cluster-scoped, so this needs a ClusterRole + ClusterRoleBinding.' },
    { group: 'RBAC', use: 'ClusterRoleBinding', cmd: 'k create clusterrolebinding node-reader-jane --clusterrole=node-reader --user=jane', note: '' },
    { group: 'RBAC', use: 'Reuse ClusterRole in one ns', cmd: 'k create rolebinding view-dev --clusterrole=view --serviceaccount=dev:ci -n dev', note: 'Built-in roles: view, edit, admin, cluster-admin.' },
    { group: 'RBAC', use: 'Can I?', cmd: 'k auth can-i create deployments -n dev --as=jane', note: '' },
    { group: 'RBAC', use: 'Can a ServiceAccount?', cmd: 'k auth can-i list secrets -n dev --as=system:serviceaccount:dev:ci', note: '' },
    { group: 'RBAC', use: 'Everything a user can do', cmd: 'k auth can-i --list --as=jane -n dev', note: '' },
    { group: 'RBAC', use: 'Who is bound to a role', cmd: 'k get rolebindings,clusterrolebindings -A -o wide | grep <role-or-subject>', note: '' },
    { group: 'RBAC', use: 'Authorization modes', cmd: 'sudo grep authorization-mode /etc/kubernetes/manifests/kube-apiserver.yaml', note: '' },
    { group: 'ServiceAccounts', use: 'Create SA', cmd: 'k create sa ci -n dev', note: '' },
    { group: 'ServiceAccounts', use: 'Use SA in deployment', cmd: 'k set serviceaccount deploy/web ci -n dev', note: '' },
    { group: 'ServiceAccounts', use: 'Mint a token', cmd: 'k create token ci -n dev --duration=1h', note: '' },
    { group: 'Images', use: 'Registry secret', cmd: 'k create secret docker-registry regcred --docker-server=registry.example.com --docker-username=u --docker-password=p --docker-email=u@example.com', note: '' },
    { group: 'Images', use: 'Attach to default SA', cmd: R`k patch sa default -p '{"imagePullSecrets":[{"name":"regcred"}]}'`, note: '' },
    { group: 'Pod security', use: 'Enforce restricted', cmd: 'k label ns prod pod-security.kubernetes.io/enforce=restricted', note: '' },
    { group: 'Pod security', use: 'Who runs as what', cmd: 'k exec <pod> -- id', note: '' },
  ],
  yaml: [
    { title: 'CertificateSigningRequest', note: '', code: R`apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: jane
spec:
  request: <base64 -w0 jane.csr>
  signerName: kubernetes.io/kube-apiserver-client
  expirationSeconds: 86400
  usages:
  - client auth` },
    { title: 'Role with subresources and resourceNames', note: '', code: R`apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: log-reader
  namespace: dev
rules:
- apiGroups: [""]
  resources: ["pods", "pods/log"]
  verbs: ["get", "list"]
- apiGroups: ["apps"]
  resources: ["deployments"]
  resourceNames: ["web"]
  verbs: ["get", "update", "patch"]` },
    { title: 'RoleBinding', note: 'Subjects can be User, Group or ServiceAccount.', code: R`apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: log-reader-ci
  namespace: dev
subjects:
- kind: ServiceAccount
  name: ci
  namespace: dev
- kind: User
  name: jane
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: log-reader
  apiGroup: rbac.authorization.k8s.io` },
    { title: 'Security context', note: '', code: R`apiVersion: v1
kind: Pod
metadata:
  name: secure
spec:
  securityContext:
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000
    runAsNonRoot: true
  containers:
  - name: app
    image: busybox:1.36
    command: ["sleep", "3600"]
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop: ["ALL"]
        add: ["NET_BIND_SERVICE"]` },
  ],
  gotchas: [
    'The `deployments` resource lives in the `apps` API group. Check with `k api-resources | grep deploy`.',
    'A RoleBinding cannot reference a Role from another namespace, but it **can** reference a ClusterRole.',
    'roleRef is immutable. To switch roles, delete and re-create the binding.',
    'For `--serviceaccount`, the format is `<namespace>:<name>`. For `--as` it is `system:serviceaccount:<ns>:<name>`.',
    'Capabilities and readOnlyRootFilesystem are container-level fields. Putting them under the Pod securityContext fails validation.',
    'CSR spec.request must be single-line base64 (`-w0`); line breaks cause a decode error.',
  ],
  tasks: [
    { id: 'rbac', title: 'Create least-privilege RBAC access', difficulty: 'Core workflow', time: '6–10 min', prompt: 'In namespace reports, allow ServiceAccount report-reader to get and list pods only. Bind the permission in that namespace and verify with can-i.', steps: [
      { code: R`k create ns reports
k create serviceaccount report-reader -n reports
k create role pod-reader --verb=get,list --resource=pods -n reports
k create rolebinding report-reader-pods --role=pod-reader --serviceaccount=reports:report-reader -n reports
k auth can-i list pods -n reports --as=system:serviceaccount:reports:report-reader
k auth can-i create pods -n reports --as=system:serviceaccount:reports:report-reader` } ], check: 'list/get pods returns yes; create pods and access in another namespace return no.' },
    { id: 'csr-user', title: 'Onboard a user with the Certificates API', difficulty: 'Stretch', time: '10–14 min', prompt: 'Create user jane in group dev-team: generate a key/CSR, get it signed through a CertificateSigningRequest, add a kubeconfig context jane-ctx, and allow her to manage deployments in namespace dev.', steps: [
      { code: R`openssl genrsa -out jane.key 2048
openssl req -new -key jane.key -subj "/CN=jane/O=dev-team" -out jane.csr
cat <<EOF | k apply -f -
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: jane
spec:
  request: $(base64 -w0 jane.csr)
  signerName: kubernetes.io/kube-apiserver-client
  usages: ["client auth"]
EOF
k certificate approve jane
k get csr jane -o jsonpath='{.status.certificate}' | base64 -d > jane.crt` },
      { code: R`k config set-credentials jane --client-certificate=jane.crt --client-key=jane.key --embed-certs=true
k config set-context jane-ctx --cluster=kubernetes --user=jane --namespace=dev
k create role deploy-mgr --verb=get,list,watch,create,update,patch,delete --resource=deployments -n dev
k create rolebinding jane-deploy --role=deploy-mgr --user=jane -n dev
k --context=jane-ctx get deploy
k auth can-i delete deployments -n dev --as=jane` } ], check: 'The CSR is Approved,Issued; jane-ctx works; jane can manage deployments in dev only.' },
    { id: 'clusterrole-nodes', title: 'Cluster-wide read access to nodes and PVs', difficulty: 'Core workflow', time: '5–7 min', prompt: 'ServiceAccount monitor in namespace ops must be able to get, list and watch nodes and persistentvolumes cluster-wide.', steps: [
      { code: R`k create sa monitor -n ops
k create clusterrole infra-reader --verb=get,list,watch --resource=nodes,persistentvolumes
k create clusterrolebinding monitor-infra --clusterrole=infra-reader --serviceaccount=ops:monitor
k auth can-i list nodes --as=system:serviceaccount:ops:monitor
k auth can-i delete nodes --as=system:serviceaccount:ops:monitor` } ], check: 'list returns yes, delete returns no.' },
    { id: 'security-context', title: 'Harden a pod with securityContext', difficulty: 'Core workflow', time: '5–8 min', domain: 'Workloads & Scheduling', prompt: 'Create pod hardened (busybox:1.36, sleep 3600) running as user 1000 / group 3000, with no privilege escalation, a read-only root filesystem and all capabilities dropped. Verify with id.', steps: [
      { note: 'Use the Security context YAML template, then:' },
      { code: R`k apply -f hardened.yaml
k exec hardened -- id
k exec hardened -- touch /test   # should fail: Read-only file system` } ], check: 'id shows uid=1000 gid=3000, and writing to / fails.' },
    { id: 'pod-security', title: 'Enforce Pod Security restricted', difficulty: 'Core workflow', time: '4–6 min', prompt: 'Namespace secure must reject pods that violate the restricted Pod Security Standard. Prove that a privileged pod is rejected.', steps: [
      { code: R`k create ns secure
k label ns secure pod-security.kubernetes.io/enforce=restricted pod-security.kubernetes.io/enforce-version=latest
k get ns secure --show-labels
cat <<'EOF' | k apply -f -      # expect: forbidden, violates PodSecurity "restricted"
apiVersion: v1
kind: Pod
metadata: {name: priv, namespace: secure}
spec:
  containers:
  - name: c
    image: nginx
    securityContext: {privileged: true}
EOF` } ], check: 'Creating the privileged pod returns a "violates PodSecurity restricted" error.' },
  ],
  docs: [
    { label: 'Controlling access to the API', url: 'https://kubernetes.io/docs/concepts/security/controlling-access/' },
    { label: 'Certificates and CSRs', url: 'https://kubernetes.io/docs/reference/access-authn-authz/certificate-signing-requests/' },
    { label: 'Configure access with kubeconfig', url: 'https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/' },
    { label: 'Using RBAC authorization', url: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/' },
    { label: 'Service accounts', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/' },
    { label: 'Security context', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/security-context/' },
    { label: 'Pod Security Admission', url: 'https://kubernetes.io/docs/concepts/security/pod-security-admission/' },
    { label: 'Pull from a private registry', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/' },
  ],
});
})();
