(() => { const R = String.raw;
CKA.topic({
  id: 'crds-operators',
  title: 'CRDs & Operators',
  icon: '🧬',
  domain: 'Cluster Architecture, Installation & Configuration',
  kodekloud: 'Section 7 (2025 updates) · CRDs, Custom Controllers, Operator Framework',
  summary: 'Extending the Kubernetes API with CustomResourceDefinitions, how custom controllers reconcile them, and installing and configuring operators (often through Helm or a manifest bundle) and then driving them with custom resources.',
  objectives: ['Understand CRDs, install and configure operators', 'Understand extension interfaces (CNI, CSI, CRI, etc.)'],
  concepts: [
    { title: 'CustomResourceDefinition', body: 'A CRD registers a new resource type: `group`, `names` (kind, plural, singular, shortNames), `scope` (Namespaced or Cluster) and one or more `versions` with an OpenAPI v3 **schema**. One version is `storage: true`. The CRD name must be `<plural>.<group>`. Once `Established`, the type behaves like any built-in for kubectl, RBAC and `explain`.' },
    { title: 'Controllers & operators', body: 'A CR is just data until a **controller** watches it and reconciles the real state toward `spec`, reporting back in `status`. An **operator** is a controller that packages operational knowledge for one app (backups, failover, upgrades), e.g. cert-manager, Prometheus Operator or CloudNativePG. Operators normally run as a Deployment with a ServiceAccount + RBAC and ship their own CRDs.' },
    { title: 'Installing operators', body: 'Typical methods: `helm install` (CRDs in the chart\'s `crds/` folder), `kubectl apply -f <bundle.yaml>` / `--server-side`, or OLM (Operator Lifecycle Manager). After installing, check that the CRDs exist, the controller Pod runs, and its logs show it watching. Then create a CR and watch its `status`.' },
    { title: 'RBAC for custom resources', body: 'Reference the API group and plural in rules: `apiGroups: ["stable.example.com"]`, `resources: ["crontabs"]`. `k create role --resource=crontabs.stable.example.com` works too.' },
  ],
  commands: [
    { group: 'Discover', use: 'List CRDs', cmd: 'k get crd', note: '' },
    { group: 'Discover', use: 'CRDs from one project', cmd: 'k get crd | grep cert-manager.io', note: '' },
    { group: 'Discover', use: 'Resources in an API group', cmd: 'k api-resources --api-group=cert-manager.io', note: '' },
    { group: 'Discover', use: 'Explain a custom resource', cmd: 'k explain certificates.spec --api-version=cert-manager.io/v1', note: 'Works once the CRD publishes a schema.' },
    { group: 'Discover', use: 'CRD details', cmd: R`k get crd crontabs.stable.example.com -o jsonpath='{.spec.scope} {.spec.versions[*].name}{"\n"}'`, note: '' },
    { group: 'Discover', use: 'Wait for Established', cmd: 'k wait --for=condition=Established crd/crontabs.stable.example.com', note: '' },
    { group: 'Use', use: 'Get CR instances', cmd: 'k get crontabs -A\nk get ct', note: 'Plural or a short name.' },
    { group: 'Use', use: 'Describe a CR', cmd: 'k describe crontab my-cron', note: '' },
    { group: 'Use', use: 'Write CR list to file', cmd: 'k get <plural> -A -o custom-columns=NS:.metadata.namespace,NAME:.metadata.name > /opt/answers/crs.txt', note: '' },
    { group: 'Operators', use: 'Install operator with Helm', cmd: 'helm repo add jetstack https://charts.jetstack.io && helm repo update\nhelm install cert-manager jetstack/cert-manager -n cert-manager --create-namespace --set crds.enabled=true', note: 'Example operator; values key per its docs.' },
    { group: 'Operators', use: 'Install operator bundle', cmd: 'k apply --server-side -f <operator-bundle.yaml>', note: 'Server-side apply avoids annotation-size limits on huge CRDs.' },
    { group: 'Operators', use: 'Operator health', cmd: 'k get deploy,pods -n <operator-ns>\nk logs -n <operator-ns> deploy/<operator> --tail=50', note: '' },
    { group: 'Operators', use: 'RBAC for a CR', cmd: 'k create role ct-editor --verb=get,list,create,update --resource=crontabs.stable.example.com', note: '' },
  ],
  yaml: [
    { title: 'CustomResourceDefinition', note: '', code: R`apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: crontabs.stable.example.com
spec:
  group: stable.example.com
  scope: Namespaced
  names:
    plural: crontabs
    singular: crontab
    kind: CronTab
    shortNames: ["ct"]
  versions:
  - name: v1
    served: true
    storage: true
    schema:
      openAPIV3Schema:
        type: object
        properties:
          spec:
            type: object
            required: ["cronSpec", "image"]
            properties:
              cronSpec: {type: string}
              image: {type: string}
              replicas: {type: integer, minimum: 1, maximum: 10}
    additionalPrinterColumns:
    - name: Schedule
      type: string
      jsonPath: .spec.cronSpec` },
    { title: 'Custom resource instance', note: '', code: R`apiVersion: stable.example.com/v1
kind: CronTab
metadata:
  name: my-cron
spec:
  cronSpec: "*/5 * * * *"
  image: busybox:1.36
  replicas: 2` },
  ],
  gotchas: [
    'The CRD metadata.name must exactly equal `<spec.names.plural>.<spec.group>`.',
    'Deleting a CRD deletes **all** its custom resources.',
    'Creating CRs before the CRD is Established returns "no matches for kind". Use `k wait`.',
    'If a CR\'s status never updates, the controller isn\'t running or lacks RBAC. Check its logs.',
  ],
  tasks: [
    { id: 'crd-resource', title: 'Install a CRD and create a custom resource', difficulty: 'Core workflow', time: '8–12 min', prompt: 'Install a namespaced CRD named CronTab (group stable.example.com, short name ct) and create one instance my-cron-tab. Confirm the API resource is discoverable and inspect its schema with explain.', steps: [
      { note: 'Save the CRD template as crontab-crd.yaml and the instance as crontab.yaml.' },
      { code: R`k apply -f crontab-crd.yaml
k wait --for=condition=Established crd/crontabs.stable.example.com
k api-resources --api-group=stable.example.com
k apply -f crontab.yaml
k get ct
k explain crontab.spec` } ], check: 'The CRD is Established, `k get ct` lists the instance with the Schedule column, and explain shows the schema.' },
    { id: 'operator-install', title: 'Install an operator and use its CRD', difficulty: 'Stretch', time: '10–15 min', prompt: 'Install cert-manager with Helm into namespace cert-manager (CRDs enabled). Write the names of all its CRDs to /opt/answers/cm-crds.txt, then create a self-signed ClusterIssuer named selfsigned and confirm it is Ready.', steps: [
      { code: R`helm repo add jetstack https://charts.jetstack.io && helm repo update
helm install cert-manager jetstack/cert-manager -n cert-manager --create-namespace --set crds.enabled=true
k get pods -n cert-manager -w
k get crd -o name | grep cert-manager.io | sed 's#.*/##' > /opt/answers/cm-crds.txt
cat <<'EOF' | k apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: selfsigned
spec:
  selfSigned: {}
EOF
k get clusterissuer selfsigned` } ], check: 'The operator Pods are Running, the file lists CRDs such as certificates.cert-manager.io, and READY is True for the ClusterIssuer.' },
  ],
  docs: [
    { label: 'Custom resources', url: 'https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/' },
    { label: 'Extend the API with CRDs', url: 'https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/' },
    { label: 'Operator pattern', url: 'https://kubernetes.io/docs/concepts/extend-kubernetes/operator/' },
  ],
});
})();
