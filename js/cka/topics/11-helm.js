(() => { const R = String.raw;
CKA.topic({
  id: 'helm',
  title: 'Helm',
  icon: '⛵',
  domain: 'Cluster Architecture, Installation & Configuration',
  kodekloud: 'Section 13 · Helm Basics',
  summary: 'Use Helm to install cluster components: add repositories, search charts, inspect and override values, install, upgrade, roll back and uninstall releases, and render templates without installing.',
  objectives: ['Use Helm and Kustomize to install cluster components'],
  concepts: [
    { title: 'Vocabulary', body: '**Chart**: a package of templated manifests plus `values.yaml` and `Chart.yaml`. **Repository**: an HTTP index or OCI registry of charts. **Release**: one installed instance of a chart, with a name, in a namespace. **Revision**: each install, upgrade or rollback increments it. Release state is stored as Secrets in the release namespace.' },
    { title: 'Values precedence', body: 'Chart `values.yaml` < `-f my-values.yaml` (later files win) < `--set key=val`. Use `helm show values <chart>` to discover keys. Nested keys use dots: `--set controller.replicaCount=2`. Lists use `--set args[0]=x`.' },
    { title: 'Lifecycle', body: 'Use `install` to create a release and `upgrade` to change chart version or values. `upgrade --install` is idempotent. Without `--reuse-values`, `upgrade` resets values to chart defaults plus what you pass. `rollback <rel> <rev>` creates a new revision equal to the old one. `uninstall` deletes resources (CRDs installed by a chart are usually kept).' },
    { title: 'Inspect before you install', body: '`helm template` renders manifests locally. `helm install --dry-run=server` validates against the cluster. `helm get values|manifest|notes <rel>` shows what is deployed. `helm pull --untar` downloads a chart so you can read or edit it.' },
  ],
  commands: [
    { group: 'Repos', use: 'Add & update repo', cmd: 'helm repo add traefik https://traefik.github.io/charts\nhelm repo add metrics-server https://kubernetes-sigs.github.io/metrics-server/\nhelm repo update', note: '' },
    { group: 'Repos', use: 'List repos', cmd: 'helm repo list', note: '' },
    { group: 'Repos', use: 'Search repo / versions', cmd: 'helm search repo traefik\nhelm search repo traefik/traefik --versions | head', note: '`helm search hub` searches Artifact Hub.' },
    { group: 'Inspect', use: 'Default values', cmd: 'helm show values traefik/traefik > values.yaml', note: '' },
    { group: 'Inspect', use: 'Chart info', cmd: 'helm show chart traefik/traefik', note: '' },
    { group: 'Inspect', use: 'Download chart', cmd: 'helm pull traefik/traefik --version <ver> --untar', note: '' },
    { group: 'Inspect', use: 'Render templates', cmd: 'helm template web traefik/traefik -f values.yaml -n web > rendered.yaml', note: '' },
    { group: 'Install', use: 'Install a release', cmd: 'helm install metrics-server metrics-server/metrics-server -n kube-system', note: '' },
    { group: 'Install', use: 'Install with values', cmd: 'helm install web traefik/traefik -n web -f values.yaml --set deployment.replicas=2', note: '' },
    { group: 'Install', use: 'Install a specific version', cmd: 'helm install web traefik/traefik --version <ver> -n web', note: '' },
    { group: 'Install', use: 'Install from OCI', cmd: 'helm install web oci://ghcr.io/traefik/helm/traefik -n web', note: '' },
    { group: 'Install', use: 'Install from local dir', cmd: 'helm install web ./web-chart -n web', note: '' },
    { group: 'Manage', use: 'List releases', cmd: 'helm list -A', note: '`-a` includes failed/pending releases.' },
    { group: 'Manage', use: 'Status & values', cmd: 'helm status web -n web\nhelm get values web -n web --all', note: '' },
    { group: 'Manage', use: 'Upgrade', cmd: 'helm upgrade web traefik/traefik -n web --reuse-values --set deployment.replicas=3', note: '' },
    { group: 'Manage', use: 'Upgrade or install', cmd: 'helm upgrade --install web traefik/traefik -n web -f values.yaml', note: '' },
    { group: 'Manage', use: 'History', cmd: 'helm history web -n web', note: '' },
    { group: 'Manage', use: 'Rollback', cmd: 'helm rollback web 1 -n web', note: '' },
    { group: 'Manage', use: 'Uninstall', cmd: 'helm uninstall web -n web', note: '' },
  ],
  yaml: [
    { title: 'Values override file', note: 'Keys come from `helm show values`.', code: R`# traefik/traefik example
deployment:
  replicas: 3
service:
  type: NodePort
ingressClass:
  enabled: true
  isDefaultClass: false
resources:
  requests:
    cpu: 100m
    memory: 128Mi` },
  ],
  gotchas: [
    'Forgetting `-n` installs into the current context namespace, and `helm list` then appears empty in the right one.',
    '`helm upgrade` without `--reuse-values` or `-f` drops your earlier `--set` overrides.',
    'Release names must be unique per namespace.',
    'Read the exact values key from `helm show values`. Guessing `replicas` vs `replicaCount` is a common way to lose marks.',
  ],
  tasks: [
    { id: 'helm-release', title: 'Install and upgrade a Helm release', difficulty: 'Core workflow', time: '6–10 min', prompt: 'With a local chart at ./web-chart, install release web into namespace apps, change its replicaCount to 3, and verify the new release revision.', steps: [
      { code: R`helm show values ./web-chart | grep -i replica
helm install web ./web-chart --namespace apps --create-namespace
helm upgrade web ./web-chart --namespace apps --reuse-values --set replicaCount=3
helm list --namespace apps
helm history web --namespace apps
k get deployments -n apps` } ], check: 'Release web is at revision 2, and the workload has 3 replicas.' },
    { id: 'helm-values-rollback', title: 'Install a cluster component from a repo, then roll back', difficulty: 'Core workflow', time: '8–12 min', prompt: 'Add the traefik repo (https://traefik.github.io/charts), install chart traefik/traefik as release edge in namespace edge with service type NodePort. Upgrade it to 2 replicas, then roll back to revision 1.', steps: [
      { code: R`helm repo add traefik https://traefik.github.io/charts && helm repo update
helm show values traefik/traefik | grep -nE "^(deployment|service):" -A4 | head -30
helm install edge traefik/traefik -n edge --create-namespace --set service.type=NodePort
helm upgrade edge traefik/traefik -n edge --reuse-values --set deployment.replicas=2
helm rollback edge 1 -n edge
helm history edge -n edge
k get deploy,svc -n edge` } ], check: 'History shows revisions 1, 2 and 3 (the rollback), and the deployment is back to 1 replica with a NodePort Service.' },
    { id: 'helm-template', title: 'Render a chart and find its images', difficulty: 'Warm-up', time: '4–6 min', prompt: 'Without installing, render chart traefik/traefik as release preview and write every container image it uses to /opt/answers/images.txt.', steps: [
      { code: R`helm template preview traefik/traefik | grep -E "^\s+image:" | awk '{print $2}' | sort -u > /opt/answers/images.txt
cat /opt/answers/images.txt
helm list -A | grep preview || echo "not installed (correct)"` } ], check: 'The file lists the images, and no release named preview exists.' },
  ],
  docs: [
    { label: 'Helm quickstart', url: 'https://helm.sh/docs/intro/quickstart/' },
    { label: 'Using Helm', url: 'https://helm.sh/docs/intro/using_helm/' },
    { label: 'Helm commands', url: 'https://helm.sh/docs/helm/' },
  ],
});
})();
