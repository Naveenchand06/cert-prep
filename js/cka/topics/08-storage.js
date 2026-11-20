(() => { const R = String.raw;
CKA.topic({
  id: 'storage',
  title: 'Storage',
  icon: '💾',
  domain: 'Storage',
  kodekloud: 'Section 8 · Storage',
  summary: 'Volumes, PersistentVolumes, PersistentVolumeClaims, StorageClasses and dynamic provisioning, access modes, reclaim policies, volume expansion, and the CSI that makes it all pluggable. Only 10% of the exam, but the tasks are quick wins.',
  objectives: ['Implement storage classes and dynamic volume provisioning', 'Configure volume types, access modes and reclaim policies', 'Manage persistent volumes and persistent volume claims'],
  concepts: [
    { title: 'Volumes in a Pod', body: '`emptyDir`: scratch space that lives as long as the Pod (`medium: Memory` for tmpfs). `hostPath`: a node directory, for labs and node agents only. `configMap` / `secret` / `projected`: config as files. `persistentVolumeClaim`: durable storage. Each volume is declared in `spec.volumes` and mounted per container with `volumeMounts`.' },
    { title: 'PV ↔ PVC binding', body: 'An admin creates a **PV** (cluster-scoped) or a StorageClass provisions it dynamically. A **PVC** (namespaced) requests a size, access modes and a class. The control plane binds a PVC to one PV that has **enough capacity, matching access modes, the same storageClassName** (and matching selector labels if set). The binding is 1:1, and a big PV can bind to a small claim. With no match, the PVC stays `Pending`.' },
    { title: 'Access modes', body: '**RWO** ReadWriteOnce: read-write by a single **node**. **ROX** ReadOnlyMany. **RWX** ReadWriteMany: many nodes, needs NFS/CephFS-type backends. **RWOP** ReadWriteOncePod: a single Pod. What a backend supports depends on its driver; hostPath/local is RWO.' },
    { title: 'Reclaim policy', body: 'What happens to the PV when its PVC is deleted. **Retain**: the PV becomes `Released` and keeps its data, but cannot be reused until an admin clears `spec.claimRef`. **Delete**: the PV and its backing storage are removed (the default for dynamic provisioning). **Recycle** is deprecated. Change it on a live PV with `kubectl patch`.' },
    { title: 'StorageClass & dynamic provisioning', body: 'A StorageClass names a **provisioner** (a CSI driver such as `ebs.csi.aws.com`, or `rancher.io/local-path` in labs), plus `parameters`, `reclaimPolicy`, `allowVolumeExpansion` and `volumeBindingMode`. **WaitForFirstConsumer** delays binding until a Pod is scheduled, so the volume lands in the right zone or node; until then the PVC stays Pending, which is expected. The default class has annotation `storageclass.kubernetes.io/is-default-class: "true"`. `kubernetes.io/no-provisioner` means static PVs only.' },
    { title: 'CSI, expansion & StatefulSets', body: 'The **Container Storage Interface** lets vendors ship drivers outside core (controller plugin plus a node DaemonSet). If the class has `allowVolumeExpansion: true`, you can raise `spec.resources.requests.storage` on a PVC; shrinking is not allowed. StatefulSets use `volumeClaimTemplates` to give each replica its own PVC (`data-web-0`, `data-web-1`…), and those PVCs outlive the Pods.' },
  ],
  commands: [
    { group: 'Inspect', use: 'Classes, volumes, claims', cmd: 'k get sc,pv,pvc -A', note: 'Default class is marked "(default)".' },
    { group: 'Inspect', use: 'Why is a PVC Pending', cmd: 'k describe pvc <claim>', note: 'Events show "no persistent volumes available", "waiting for first consumer", provisioner errors.' },
    { group: 'Inspect', use: 'Which pod uses a PVC', cmd: 'k describe pvc <claim> | grep "Used By"', note: '' },
    { group: 'Inspect', use: 'PV details as columns', cmd: 'k get pv -o custom-columns=NAME:.metadata.name,CAP:.spec.capacity.storage,MODES:.spec.accessModes,RECLAIM:.spec.persistentVolumeReclaimPolicy,CLAIM:.spec.claimRef.name', note: '' },
    { group: 'Inspect', use: 'Sort PVs by size', cmd: 'k get pv --sort-by=.spec.capacity.storage', note: '' },
    { group: 'Inspect', use: 'CSI drivers present', cmd: 'k get csidrivers\nk get pods -A | grep -i csi', note: '' },
    { group: 'Change', use: 'Change reclaim policy', cmd: R`k patch pv <pv> -p '{"spec":{"persistentVolumeReclaimPolicy":"Retain"}}'`, note: '' },
    { group: 'Change', use: 'Make a Released PV Available again', cmd: R`k patch pv <pv> --type=json -p '[{"op":"remove","path":"/spec/claimRef"}]'`, note: 'Clean the data first if needed.' },
    { group: 'Change', use: 'Expand a PVC', cmd: R`k patch pvc <claim> -p '{"spec":{"resources":{"requests":{"storage":"2Gi"}}}}'`, note: 'Needs allowVolumeExpansion on the class.' },
    { group: 'Change', use: 'Set default StorageClass', cmd: R`k patch sc <name> -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'`, note: 'Set "false" on the old default.' },
    { group: 'Verify', use: 'Check data in mount', cmd: 'k exec <pod> -- sh -c "df -h /data && ls -l /data"', note: '' },
  ],
  yaml: [
    { title: 'hostPath PersistentVolume', note: 'No YAML generator exists for PV/PVC. Copy from the docs.', code: R`apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-log
spec:
  capacity:
    storage: 1Gi
  accessModes: ["ReadWriteOnce"]
  persistentVolumeReclaimPolicy: Retain
  storageClassName: manual
  hostPath:
    path: /mnt/data/log` },
    { title: 'PersistentVolumeClaim', note: 'storageClassName must match the PV (or omit for the default class).', code: R`apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: claim-log
spec:
  accessModes: ["ReadWriteOnce"]
  storageClassName: manual
  resources:
    requests:
      storage: 500Mi` },
    { title: 'Pod using a PVC', note: '', code: R`apiVersion: v1
kind: Pod
metadata:
  name: writer
spec:
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: claim-log
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh", "-c", "echo ok > /data/ok.txt; sleep 3600"]
    volumeMounts:
    - name: data
      mountPath: /data` },
    { title: 'StorageClass', note: '', code: R`apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-local
provisioner: rancher.io/local-path   # use the provisioner in your cluster
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true` },
    { title: 'StatefulSet volumeClaimTemplates', note: '', code: R`apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: db
spec:
  serviceName: db
  replicas: 2
  selector:
    matchLabels: {app: db}
  template:
    metadata:
      labels: {app: db}
    spec:
      containers:
      - name: db
        image: redis:7
        volumeMounts:
        - {name: data, mountPath: /data}
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 1Gi` },
  ],
  gotchas: [
    'An empty `storageClassName: ""` on a PVC means "no class". It won\'t use the default and binds only to class-less PVs.',
    'A PVC can\'t be deleted while a Pod uses it (it stays Terminating, held by the protection finalizer). Delete the Pod first.',
    'Volume mounts on a running Pod are immutable. Export the YAML, edit it, then `replace --force`.',
    'With WaitForFirstConsumer, a Pending PVC is normal until a Pod that uses it is created.',
    'The access mode and storageClassName must match the PV **exactly**. Size can be smaller than the PV.',
  ],
  tasks: [
    { id: 'pv-hostpath-retain', title: 'Static PV, claim and pod', difficulty: 'Core workflow', time: '8–10 min', prompt: 'Create PV pv-app (1Gi, RWO, Retain, storageClassName manual, hostPath /mnt/app). Create PVC pvc-app (500Mi) in namespace store that binds to it, and pod app-writer that mounts it at /data.', steps: [
      { note: 'Use the YAML templates: PV with the values above; PVC in namespace store with storageClassName manual; Pod referencing claimName pvc-app.' },
      { code: R`k create ns store
k apply -f pv.yaml -f pvc.yaml -f pod.yaml
k get pv pv-app
k get pvc pvc-app -n store
k exec -n store app-writer -- ls /data` } ], check: 'PV shows Bound to store/pvc-app; the pod is Running with /data mounted.' },
    { id: 'pvc', title: 'Provision storage dynamically', difficulty: 'Core workflow', time: '8–12 min', prompt: 'Create a 2Gi PVC named data-claim using the default StorageClass, mount it at /data in a pod storage-writer, write a file, and verify the claim is Bound.', steps: [
      { code: R`k get storageclass
k get pv` },
      { note: 'Create the PVC with accessModes ReadWriteOnce and 2Gi, omitting storageClassName to use the default. Reference it from a Pod volume.' },
      { code: R`k apply -f data-claim.yaml -f storage-writer.yaml
k get pvc data-claim -w
k exec storage-writer -- sh -c "echo persisted > /data/check.txt && cat /data/check.txt"` } ], check: 'PVC is Bound to a dynamically created PV, and the file is readable from the mounted volume.' },
    { id: 'storage-debug', title: 'Diagnose a Pending PVC', difficulty: 'Core workflow', time: '6–10 min', domain: 'Troubleshooting', prompt: 'A PVC remains Pending and its pod is unscheduled. Find the cause using events and StorageClass/PV details, correct the mismatch, and confirm the pod starts.', steps: [
      { code: R`k describe pvc <claim> -n <ns>
k get storageclass
k get pv
k get events -n <ns> --sort-by=.lastTimestamp` },
      { note: 'Look for unsupported access mode, size larger than any PV, wrong/missing StorageClass name, provisioner errors or topology constraints. PVC spec is mostly immutable: export the YAML, fix it, delete and re-create the PVC.' },
      { code: R`k get pvc <claim> -n <ns> -o yaml > pvc.yaml
k delete pvc <claim> -n <ns> && k apply -f pvc.yaml
k get pod <pod> -n <ns> -o wide` } ], check: 'The claim binds to a compatible volume and its consumer pod becomes schedulable.' },
    { id: 'pvc-expand', title: 'Expand a PVC online', difficulty: 'Core workflow', time: '4–6 min', prompt: 'PVC logs-pvc (1Gi) is full. Allow expansion on its StorageClass and grow it to 3Gi.', steps: [
      { code: R`SC=$(k get pvc logs-pvc -o jsonpath='{.spec.storageClassName}')
k patch sc $SC -p '{"allowVolumeExpansion": true}'
k patch pvc logs-pvc -p '{"spec":{"resources":{"requests":{"storage":"3Gi"}}}}'
k get pvc logs-pvc -w
k describe pvc logs-pvc | tail` } ], check: 'CAPACITY shows 3Gi (some drivers need a Pod restart for filesystem resize).' },
    { id: 'sc-wffc', title: 'Create a WaitForFirstConsumer StorageClass', difficulty: 'Core workflow', time: '5–8 min', prompt: 'Create StorageClass local-wait using the cluster\'s existing provisioner, with reclaimPolicy Retain and volumeBindingMode WaitForFirstConsumer. Make it the default class.', steps: [
      { code: R`k get sc -o custom-columns=NAME:.metadata.name,PROV:.provisioner
k get sc <old-default> -o yaml > sc.yaml   # copy provisioner + parameters` },
      { note: 'Write sc.yaml with name local-wait, the same provisioner, reclaimPolicy: Retain, volumeBindingMode: WaitForFirstConsumer and the is-default-class annotation "true". Unset the annotation on the old default.' },
      { code: R`k apply -f sc.yaml
k patch sc <old-default> -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'
k get sc` } ], check: 'Only local-wait shows (default), and a new PVC stays Pending until a Pod uses it.' },
  ],
  docs: [
    { label: 'Volumes', url: 'https://kubernetes.io/docs/concepts/storage/volumes/' },
    { label: 'Persistent volumes', url: 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/' },
    { label: 'Configure a Pod to use a PV (task)', url: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-persistent-volume-storage/' },
    { label: 'Storage classes', url: 'https://kubernetes.io/docs/concepts/storage/storage-classes/' },
    { label: 'Change default StorageClass', url: 'https://kubernetes.io/docs/tasks/administer-cluster/change-default-storage-class/' },
  ],
});
})();
