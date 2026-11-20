(() => { const R = String.raw;
CKA.topic({
  id: 'kustomize',
  title: 'Kustomize',
  icon: '🧩',
  domain: 'Cluster Architecture, Installation & Configuration',
  kodekloud: 'Section 14 · Kustomize Basics',
  summary: 'Template-free customisation built into kubectl: bases and overlays, common transformers (namespace, prefixes, labels), image and replica overrides, ConfigMap/Secret generators, strategic-merge and JSON6902 patches, and components.',
  objectives: ['Use Helm and Kustomize to install cluster components'],
  concepts: [
    { title: 'Base & overlays', body: 'A **base** is a directory of plain manifests plus a `kustomization.yaml` that lists them under `resources`. An **overlay** (e.g. `overlays/prod`) lists the base in its own `resources` (`- ../../base`) and adds changes. Nothing is templated: the YAML stays valid on its own.' },
    { title: 'Kustomize vs Helm', body: 'Helm templates YAML with Go templates and tracks releases. Kustomize patches existing YAML and has no release state; it just builds and you `apply`. It is built into kubectl (`-k`). A standalone `kustomize` binary also exists, sometimes newer than the embedded one.' },
    { title: 'Common transformers', body: '`namespace:` sets every resource\'s namespace. `namePrefix:` / `nameSuffix:` rename resources and update references (e.g. ConfigMap refs). `labels:` (preferred over the deprecated `commonLabels`) adds labels, optionally to selectors with `includeSelectors: true`. `commonAnnotations:` adds annotations. `images:` changes `newName`/`newTag`/`digest`. `replicas:` sets counts.' },
    { title: 'Generators', body: '`configMapGenerator` / `secretGenerator` build objects from literals, files or env files. They append a **content hash** to the name and rewrite references, so a config change triggers a rollout. Turn the hash off with `generatorOptions.disableNameSuffixHash: true`.' },
    { title: 'Patches', body: '`patches:` accepts a strategic-merge patch (a partial YAML of the object) or a JSON6902 patch (an op list) with a `target` selector (kind/name/labelSelector). Use strategic merge to change containers by name and JSON6902 for precise add/remove/replace at a path. Patches can be inline (`patch: |-`) or a `path:` to a file.' },
    { title: 'Components', body: 'A `kind: Component` kustomization holds reusable optional features (e.g. "monitoring sidecar", "ldap auth"). Overlays include it with `components:`. Use it when a feature should be toggled on in some overlays only.' },
  ],
  commands: [
    { group: 'Build', use: 'Render an overlay', cmd: 'k kustomize overlays/dev', note: 'Shows the final YAML. Always check it before applying.' },
    { group: 'Build', use: 'Apply / delete', cmd: 'k apply -k overlays/dev\nk delete -k overlays/dev', note: '' },
    { group: 'Build', use: 'Diff against cluster', cmd: 'k diff -k overlays/prod', note: '' },
    { group: 'Build', use: 'Standalone kustomize', cmd: 'kustomize build overlays/prod | k apply -f -', note: '' },
    { group: 'Build', use: 'Remote base', cmd: 'k kustomize "https://github.com/kubernetes-sigs/kustomize//examples/helloWorld?ref=kustomize-v5.0.1"', note: 'Remote targets need network access.' },
    { group: 'Edit', use: 'Create kustomization', cmd: 'kustomize create --autodetect', note: 'Lists all YAML in the directory as resources.' },
    { group: 'Edit', use: 'Set image', cmd: 'kustomize edit set image nginx=nginx:1.28', note: '' },
    { group: 'Edit', use: 'Set namespace / prefix', cmd: 'kustomize edit set namespace prod\nkustomize edit set nameprefix prod-', note: '' },
    { group: 'Edit', use: 'Add resource', cmd: 'kustomize edit add resource service.yaml', note: '' },
  ],
  yaml: [
    { title: 'Layout', note: '', code: R`app/
├── base/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── kustomization.yaml
└── overlays/
    ├── dev/kustomization.yaml
    └── prod/
        ├── kustomization.yaml
        └── replicas-patch.yaml` },
    { title: 'base/kustomization.yaml', note: '', code: R`apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
- deployment.yaml
- service.yaml
labels:
- pairs:
    app.kubernetes.io/name: web
  includeSelectors: false` },
    { title: 'overlays/prod/kustomization.yaml', note: 'Namespace, prefix, image, replicas, generator and patches.', code: R`apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
- ../../base
namespace: prod
namePrefix: prod-
commonAnnotations:
  owner: platform-team
images:
- name: nginx
  newTag: "1.28"
replicas:
- name: web
  count: 4
configMapGenerator:
- name: web-config
  literals:
  - LOG_LEVEL=warn
patches:
- path: replicas-patch.yaml
- target:
    kind: Deployment
    name: web
  patch: |-
    - op: add
      path: /spec/template/spec/containers/0/env
      value:
      - name: ENV
        value: prod` },
    { title: 'Strategic-merge patch file', note: 'Containers are merged by name.', code: R`apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  template:
    spec:
      containers:
      - name: nginx
        resources:
          limits:
            memory: 256Mi` },
    { title: 'Component', note: 'Included from an overlay with `components: [../../components/monitoring]`.', code: R`apiVersion: kustomize.config.k8s.io/v1alpha1
kind: Component
patches:
- target:
    kind: Deployment
  patch: |-
    - op: add
      path: /spec/template/metadata/annotations
      value:
        prometheus.io/scrape: "true"` },
  ],
  gotchas: [
    '`kubectl apply -f dir/` ignores kustomization.yaml; you need `-k`.',
    'Patch targets use the **original** base name, not the prefixed name.',
    'A JSON6902 `add` to a path whose parent doesn\'t exist fails. Add the parent first.',
    '`commonLabels` also rewrites selectors, which can break an existing Deployment because selectors are immutable. Prefer `labels:` without includeSelectors.',
  ],
  tasks: [
    { id: 'kustomize-overlay', title: 'Build and apply a Kustomize dev overlay', difficulty: 'Core workflow', time: '8–12 min', prompt: 'Create a base containing a Deployment named web and a dev overlay that changes its image tag to 1.28 and replica count to 3. Build the overlay, apply it with kubectl apply -k, and verify.', steps: [
      { code: R`mkdir -p kustomize-demo/base kustomize-demo/overlays/dev && cd kustomize-demo
k create deploy web --image=nginx:1.27 --dry-run=client -o yaml > base/deployment.yaml
cat > base/kustomization.yaml <<'EOF'
resources:
- deployment.yaml
EOF
cat > overlays/dev/kustomization.yaml <<'EOF'
resources:
- ../../base
images:
- name: nginx
  newTag: "1.28"
replicas:
- name: web
  count: 3
EOF
k kustomize overlays/dev
k apply -k overlays/dev
k get deployment web -o jsonpath='{.spec.replicas} {.spec.template.spec.containers[0].image}{"\n"}'` } ], check: 'Output is `3 nginx:1.28`.' },
    { id: 'kustomize-generator-patch', title: 'Prod overlay with namespace, generator and patch', difficulty: 'Stretch', time: '10–14 min', prompt: 'Using the base from the previous task, create overlays/prod that deploys into namespace prod with prefix prod-, generates ConfigMap web-config (MODE=prod) injected via envFrom, and sets a memory limit of 256Mi with a patch.', steps: [
      { code: R`mkdir -p overlays/prod && k create ns prod
cat > overlays/prod/kustomization.yaml <<'EOF'
resources:
- ../../base
namespace: prod
namePrefix: prod-
configMapGenerator:
- name: web-config
  literals:
  - MODE=prod
patches:
- target: {kind: Deployment, name: web}
  patch: |-
    - op: add
      path: /spec/template/spec/containers/0/envFrom
      value:
      - configMapRef:
          name: web-config
    - op: add
      path: /spec/template/spec/containers/0/resources
      value:
        limits:
          memory: 256Mi
EOF
k kustomize overlays/prod | grep -E "name:|memory|MODE"
k apply -k overlays/prod
k get deploy,cm -n prod` } ], check: 'The prod-web Deployment references the hashed prod-web-config-xxxx ConfigMap and has the 256Mi limit.' },
  ],
  docs: [
    { label: 'Declarative management with Kustomize', url: 'https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/' },
    { label: 'Kustomize reference', url: 'https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/' },
  ],
});
})();
