(() => { const R = String.raw;
CKA.topic({
  id: 'app-lifecycle',
  title: 'Application Lifecycle',
  icon: '🔄',
  domain: 'Workloads & Scheduling',
  kodekloud: 'Section 5 · Application Lifecycle Management',
  summary: 'Rolling updates and rollbacks, commands and args, ConfigMaps and Secrets (including encryption at rest), multi-container and init patterns, probes, and autoscaling with HPA, VPA and in-place resize.',
  objectives: ['Understand application deployments and how to perform rolling update and rollbacks', 'Use ConfigMaps and Secrets to configure applications', 'Configure workload autoscaling', 'Understand the primitives used to create robust, self-healing, application deployments'],
  concepts: [
    { title: 'Deployment strategies', body: '**RollingUpdate** (default) replaces Pods gradually. `maxSurge` sets how many extra Pods may exist and `maxUnavailable` how many may be down; both default to 25%. **Recreate** kills all old Pods before creating new ones, so expect downtime. Every template change creates a new ReplicaSet and a revision. `kubectl rollout undo` rolls back by scaling the old ReplicaSet back up.' },
    { title: 'Change cause & history', body: 'Revision history keeps `revisionHistoryLimit` (default 10) old ReplicaSets. Record why with the annotation `kubernetes.io/change-cause`, which shows up in `rollout history`. Use `--to-revision=N` to return to a specific revision.' },
    { title: 'command vs args', body: 'In Kubernetes, `command` overrides the image **ENTRYPOINT** and `args` overrides **CMD**. With `k run ... -- a b`, the words become args. With `k run ... --command -- a b`, they become the command.' },
    { title: 'ConfigMaps & Secrets', body: 'There are three ways to consume them: single env vars (`valueFrom.configMapKeyRef` / `secretKeyRef`), all keys as env (`envFrom`), or files through a volume. Env vars are read **once at startup**; mounted files update in place, except with `subPath`. Secret values are **base64**, not encrypted. Anyone with `get secrets` RBAC can read them.' },
    { title: 'Encrypting Secrets at rest', body: 'Create an `EncryptionConfiguration` (aescbc/aesgcm/secretbox or kms), put it on the control-plane node, then mount it and point `--encryption-provider-config` at it in the kube-apiserver manifest. Only newly written Secrets get encrypted; re-write existing ones with `k get secrets -A -o json | k replace -f -`. Check it by reading the raw key from etcd: encrypted values start with `k8s:enc:`.' },
    { title: 'Multi-container patterns', body: '**Init containers** run to completion in order before the app starts, for jobs like waiting on dependencies or seeding volumes. **Sidecars** are initContainers with `restartPolicy: Always`; they run alongside the app for logging, proxies and sync. **Ambassador/adapter** are sidecar variations. All containers in a Pod share the network (localhost) and any mounted volumes.' },
    { title: 'Probes = self-healing', body: '**livenessProbe** failing means the kubelet restarts the container. **readinessProbe** failing removes the Pod from Service endpoints. **startupProbe** holds off the other probes until the app has booted. Probe types are httpGet, tcpSocket, exec and grpc. Tune them with `initialDelaySeconds`, `periodSeconds` and `failureThreshold`.' },
    { title: 'Autoscaling', body: '**HPA** (`autoscaling/v2`) scales replicas on CPU/memory utilization or custom metrics. It needs metrics-server and container **requests**. **VPA** is an add-on (CRDs plus controllers) that recommends or sets requests. **In-place Pod resize** changes container cpu/memory without recreating the Pod, using the `resize` subresource and per-resource `resizePolicy`.' },
  ],
  commands: [
    { group: 'Rollouts', use: 'Update image', cmd: 'k set image deploy/web nginx=nginx:1.28', note: 'Format is `<container>=<image>`. Use `*=img` for all containers.' },
    { group: 'Rollouts', use: 'Record change cause', cmd: 'k annotate deploy/web kubernetes.io/change-cause="bump to 1.28"', note: '' },
    { group: 'Rollouts', use: 'Watch rollout', cmd: 'k rollout status deploy/web', note: '' },
    { group: 'Rollouts', use: 'History', cmd: 'k rollout history deploy/web', note: 'Add `--revision=2` for that revision\'s template.' },
    { group: 'Rollouts', use: 'Roll back', cmd: 'k rollout undo deploy/web', note: '' },
    { group: 'Rollouts', use: 'Roll back to revision', cmd: 'k rollout undo deploy/web --to-revision=1', note: '' },
    { group: 'Rollouts', use: 'Restart all pods', cmd: 'k rollout restart deploy/web', note: 'Picks up changed ConfigMap env values.' },
    { group: 'Rollouts', use: 'Pause / resume', cmd: 'k rollout pause deploy/web\nk rollout resume deploy/web', note: 'Batch several changes into one rollout.' },
    { group: 'Rollouts', use: 'Switch to Recreate', cmd: R`k patch deploy web -p '{"spec":{"strategy":{"type":"Recreate","rollingUpdate":null}}}'`, note: '`rollingUpdate` must be cleared.' },
    { group: 'Config', use: 'ConfigMap from literals', cmd: 'k create cm app-cfg --from-literal=MODE=prod --from-literal=LOG=debug', note: '' },
    { group: 'Config', use: 'ConfigMap from file', cmd: 'k create cm nginx-conf --from-file=nginx.conf', note: 'Key = file name; `--from-file=key=path` to rename.' },
    { group: 'Config', use: 'ConfigMap from env file', cmd: 'k create cm app-env --from-env-file=app.env', note: 'Each KEY=VAL line becomes a key.' },
    { group: 'Config', use: 'Generic secret', cmd: 'k create secret generic db --from-literal=user=admin --from-literal=pass=s3cr3t', note: '' },
    { group: 'Config', use: 'TLS secret', cmd: 'k create secret tls web-tls --cert=tls.crt --key=tls.key', note: 'Used by Ingress/Gateway TLS.' },
    { group: 'Config', use: 'Inject env from objects', cmd: 'k set env deploy/web --from=configmap/app-cfg\nk set env deploy/web --from=secret/db --prefix=DB_', note: 'Fast alternative to editing envFrom.' },
    { group: 'Config', use: 'Show env in a pod', cmd: 'k exec <pod> -- env | sort', note: '' },
    { group: 'Autoscale', use: 'Create HPA', cmd: 'k autoscale deploy web --cpu-percent=70 --min=2 --max=8', note: '' },
    { group: 'Autoscale', use: 'Inspect HPA', cmd: 'k get hpa -w\nk describe hpa web', note: '`<unknown>` targets = no metrics or no requests.' },
    { group: 'Autoscale', use: 'In-place resize', cmd: R`k patch pod web --subresource resize -p '{"spec":{"containers":[{"name":"web","resources":{"requests":{"cpu":"300m"},"limits":{"cpu":"600m"}}}]}}'`, note: 'Check `.status.containerStatuses[].resources` for the applied value.' },
    { group: 'Autoscale', use: 'VPA objects (if installed)', cmd: 'k get vpa -A\nk describe vpa <name>', note: 'Shows target/lower/upper recommendations.' },
    { group: 'Jobs', use: 'Job', cmd: 'k create job pi --image=perl:5.34 -- perl -Mbignum=bpi -wle "print bpi(200)"', note: 'Set completions/parallelism/backoffLimit in YAML.' },
    { group: 'Jobs', use: 'CronJob', cmd: 'k create cronjob backup --image=busybox:1.36 --schedule="0 2 * * *" -- sh -c "date"', note: '' },
    { group: 'Jobs', use: 'Trigger CronJob now', cmd: 'k create job backup-manual --from=cronjob/backup', note: '' },
  ],
  yaml: [
    { title: 'Rolling update tuning', note: 'Zero-downtime: never drop below desired replicas.', code: R`spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  minReadySeconds: 5` },
    { title: 'ConfigMap & Secret consumption', note: 'Env vars, envFrom and volume mounts.', code: R`containers:
- name: app
  image: busybox:1.36
  command: ["sleep", "3600"]
  env:
  - name: MODE
    valueFrom:
      configMapKeyRef:
        name: app-cfg
        key: MODE
  - name: DB_PASS
    valueFrom:
      secretKeyRef:
        name: db
        key: pass
  envFrom:
  - configMapRef:
      name: app-env
  volumeMounts:
  - name: conf
    mountPath: /etc/app
    readOnly: true
volumes:
- name: conf
  configMap:
    name: nginx-conf` },
    { title: 'Probes', note: '', code: R`containers:
- name: web
  image: nginx:1.27
  startupProbe:
    httpGet: {path: /, port: 80}
    failureThreshold: 30
    periodSeconds: 2
  readinessProbe:
    httpGet: {path: /, port: 80}
    periodSeconds: 5
  livenessProbe:
    tcpSocket: {port: 80}
    initialDelaySeconds: 10
    periodSeconds: 10` },
    { title: 'Init container waiting for a Service', note: '', code: R`initContainers:
- name: wait-db
  image: busybox:1.36
  command: ["sh", "-c", "until nslookup db.default.svc.cluster.local; do sleep 2; done"]` },
    { title: 'HPA autoscaling/v2 with behavior', note: '', code: R`apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 2
  maxReplicas: 8
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 120` },
    { title: 'EncryptionConfiguration', note: 'Save as /etc/kubernetes/enc/enc.yaml; mount it and set --encryption-provider-config.', code: R`apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
- resources: ["secrets"]
  providers:
  - aescbc:
      keys:
      - name: key1
        secret: <output of: head -c 32 /dev/urandom | base64>
  - identity: {}` },
    { title: 'In-place resize policy', note: 'Restart only on memory change.', code: R`containers:
- name: web
  image: nginx
  resizePolicy:
  - resourceName: cpu
    restartPolicy: NotRequired
  - resourceName: memory
    restartPolicy: RestartContainer` },
  ],
  gotchas: [
    'Changing a ConfigMap does not restart Pods. Env-based consumers need `k rollout restart`.',
    '`k rollout undo` goes back one revision; running it twice flips between the same two revisions.',
    '`k create secret generic --from-literal` base64-encodes for you. In YAML `data:` you must encode it yourself (or use `stringData:`).',
    'HPA and a manual `replicas` value fight each other. Once an HPA exists, leave `replicas` to it.',
    'The first provider in EncryptionConfiguration is used for writing. Put `identity` last, or encryption never happens.',
    'Readiness failures do **not** restart a container; liveness failures do.',
  ],
  tasks: [
    { id: 'rollout', title: 'Roll out a deployment safely', difficulty: 'Core workflow', time: '5–8 min', prompt: 'In namespace apps, create a 3-replica Deployment named web using nginx:1.27, expose it internally on port 80, then update it to nginx:1.28. Confirm the rollout and show its history.', steps: [
      { note: 'Set the namespace explicitly. Imperative generation is a fast start.' },
      { code: R`k create ns apps
k create deployment web --image=nginx:1.27 --replicas=3 -n apps
k expose deployment web --port=80 --target-port=80 -n apps
k set image deployment/web nginx=nginx:1.28 -n apps
k rollout status deployment/web -n apps
k rollout history deployment/web -n apps` } ], check: 'Deployment has 3 ready replicas, the Service selects the pods, and rollout status is complete.' },
    { id: 'rollback', title: 'Recover from a bad rollout', difficulty: 'Core workflow', time: '4–6 min', prompt: 'Deployment api was updated to image nginx:9.9.9 and is stuck. Roll back to the last working revision, record the change cause "rollback bad tag", and write the current revision number to /opt/answers/rev.txt.', steps: [
      { code: R`k rollout status deploy/api --timeout=10s
k rollout history deploy/api
k rollout undo deploy/api
k annotate deploy/api kubernetes.io/change-cause="rollback bad tag" --overwrite
k rollout status deploy/api
k get deploy api -o jsonpath='{.metadata.annotations.deployment\.kubernetes\.io/revision}' > /opt/answers/rev.txt` } ], check: 'All replicas are ready on the old image, and the history shows the new change cause.' },
    { id: 'config', title: 'Configure an app from a ConfigMap and Secret', difficulty: 'Core workflow', time: '6–10 min', prompt: 'Create a ConfigMap with APP_MODE=production and a Secret with API_TOKEN=practice-value. Inject both into a pod named config-demo and verify the environment inside the container.', steps: [
      { code: R`k create configmap app-settings --from-literal=APP_MODE=production
k create secret generic app-credentials --from-literal=API_TOKEN=practice-value
k run config-demo --image=busybox:1.36 --restart=Never --dry-run=client -o yaml --command -- sleep 3600 > config-demo.yaml` },
      { note: 'Edit config-demo.yaml and add spec.containers[0].envFrom entries with configMapRef.name: app-settings and secretRef.name: app-credentials. Then apply.' },
      { code: R`k apply -f config-demo.yaml
k exec config-demo -- sh -c 'test "$APP_MODE" = production && test -n "$API_TOKEN" && echo both-configured'` } ], check: 'The pod references the named objects and exposes both keys.' },
    { id: 'init-container', title: 'Add an init container that seeds content', difficulty: 'Core workflow', time: '6–8 min', prompt: 'Create pod site (nginx:1.27). An init container (busybox:1.36) must write "hello from init" into index.html on a shared emptyDir mounted at /usr/share/nginx/html.', steps: [
      { code: R`cat <<'EOF' | k apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: site
spec:
  volumes:
  - name: html
    emptyDir: {}
  initContainers:
  - name: seed
    image: busybox:1.36
    command: ["sh", "-c", "echo 'hello from init' > /work/index.html"]
    volumeMounts:
    - {name: html, mountPath: /work}
  containers:
  - name: web
    image: nginx:1.27
    volumeMounts:
    - {name: html, mountPath: /usr/share/nginx/html}
EOF
k exec site -- curl -s localhost` } ], check: 'curl returns "hello from init" and the pod shows Init:0/1 → Running.' },
    { id: 'probes', title: 'Make a deployment self-healing with probes', difficulty: 'Core workflow', time: '6–8 min', prompt: 'Add to deployment web (nginx) a readinessProbe httpGet / on port 80 every 5s, and a livenessProbe tcpSocket 80 with initialDelaySeconds 10.', steps: [
      { code: 'k edit deploy web' },
      { note: 'Under the container, add readinessProbe.httpGet {path: /, port: 80}, periodSeconds: 5 and livenessProbe.tcpSocket.port: 80, initialDelaySeconds: 10.' },
      { code: R`k rollout status deploy web
k describe pod -l app=web | grep -E "Liveness|Readiness"` } ], check: 'describe shows both probes and the Pods are Ready.' },
    { id: 'hpa', title: 'Configure CPU-based horizontal pod autoscaling', difficulty: 'Core workflow', time: '6–10 min', prompt: 'Configure Deployment web in namespace apps to scale between 2 and 8 replicas when average CPU utilization exceeds 70%. Ensure its containers declare CPU requests and verify HPA metrics.', steps: [
      { note: 'The cluster needs a functioning metrics API, and CPU requests must be set on the containers for utilization-based scaling.' },
      { code: R`k set resources deploy web -n apps --requests=cpu=100m
k autoscale deployment web --namespace apps --cpu-percent=70 --min=2 --max=8
k get hpa web -n apps -w
k describe hpa web -n apps` } ], check: 'HPA targets CPU 70%, min 2/max 8, and reports a current metric rather than <unknown>.' },
    { id: 'encrypt-secrets', title: 'Encrypt Secrets at rest', difficulty: 'Stretch', time: '12–15 min', domain: 'Cluster Architecture, Installation & Configuration', prompt: 'Configure the API server to encrypt Secrets with aescbc. Then create secret enc-test and prove that it is stored encrypted in etcd.', steps: [
      { code: R`sudo mkdir -p /etc/kubernetes/enc
head -c 32 /dev/urandom | base64      # use as the key
sudo vi /etc/kubernetes/enc/enc.yaml  # EncryptionConfiguration (see YAML tab)` },
      { note: 'Edit /etc/kubernetes/manifests/kube-apiserver.yaml: add `--encryption-provider-config=/etc/kubernetes/enc/enc.yaml`, a hostPath volume for /etc/kubernetes/enc and a matching readOnly volumeMount. Wait for the API server to come back.' },
      { code: R`k create secret generic enc-test --from-literal=k=v
sudo ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  get /registry/secrets/default/enc-test | hexdump -C | head
# re-encrypt existing secrets
k get secrets -A -o json | k replace -f -` } ], check: 'The etcd value begins with k8s:enc:aescbc:v1:key1 and is not readable plain text.' },
  ],
  docs: [
    { label: 'Deployments: rolling back', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-back-a-deployment' },
    { label: 'ConfigMaps', url: 'https://kubernetes.io/docs/concepts/configuration/configmap/' },
    { label: 'Secrets', url: 'https://kubernetes.io/docs/concepts/configuration/secret/' },
    { label: 'Encrypting data at rest', url: 'https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/' },
    { label: 'Probes', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/' },
    { label: 'HPA walkthrough', url: 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/' },
    { label: 'Resize container resources in place', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/resize-container-resources/' },
    { label: 'Init containers', url: 'https://kubernetes.io/docs/concepts/workloads/pods/init-containers/' },
  ],
});
})();
