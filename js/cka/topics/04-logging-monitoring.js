(() => { const R = String.raw;
CKA.topic({
  id: 'logging-monitoring',
  title: 'Logging & Monitoring',
  icon: '📈',
  domain: 'Troubleshooting',
  kodekloud: 'Section 4 · Logging & Monitoring',
  summary: 'The curriculum asks you to monitor resource usage and evaluate container output streams. In practice that means metrics-server and `kubectl top`, container logs in every form (previous, multi-container, by label), and node-level logs when the API is down.',
  objectives: ['Monitor cluster and application resource usage', 'Manage and evaluate container output streams'],
  concepts: [
    { title: 'Metrics pipeline', body: 'kubelet exposes resource metrics through cAdvisor. **metrics-server** scrapes every kubelet and serves the `metrics.k8s.io` API. It holds the latest values in memory, so there is no history. `kubectl top` and the HPA read from it. If `k top` says "Metrics API not available", metrics-server is missing or unhealthy. Check its Pod logs (kubelet TLS errors are common in labs).' },
    { title: 'Where logs live', body: 'Containers write to stdout/stderr. The runtime stores the output on the node under `/var/log/pods/<ns>_<pod>_<uid>/<container>/` with symlinks in `/var/log/containers/`. `kubectl logs` reads them through the kubelet. Logs of a deleted Pod are gone. The kubelet and containerd log to **journald**.' },
    { title: 'Multi-container and crashed containers', body: 'With more than one container, `-c <name>` is required (or `--all-containers`). For a CrashLoopBackOff, the current container may have just started, so read the **previous** instance with `--previous` / `-p`. Init container logs work the same way with `-c <init-name>`.' },
    { title: 'Sidecar logging pattern', body: 'When an app writes to a file instead of stdout, add a sidecar that shares an `emptyDir` volume and runs `tail -F` on the file. Its stdout then becomes readable with `kubectl logs -c sidecar`. Modern Kubernetes runs native sidecars as `initContainers` with `restartPolicy: Always`. They start before the main containers and keep running.' },
    { title: 'Events', body: 'Events are API objects that expire, about 1 hour by default. They hold scheduling failures, image pulls, probe failures, OOM kills and evictions. Sort them by time and filter by object or type.' },
  ],
  commands: [
    { group: 'Metrics', use: 'Install metrics-server (lab)', cmd: 'k apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml', note: 'In kubeadm labs you may need the `--kubelet-insecure-tls` arg on its container.' },
    { group: 'Metrics', use: 'Node usage', cmd: 'k top nodes', note: '' },
    { group: 'Metrics', use: 'Top CPU pods everywhere', cmd: 'k top pods -A --sort-by=cpu', note: '`--sort-by=memory` for memory.' },
    { group: 'Metrics', use: 'Per-container usage', cmd: 'k top pod <pod> --containers', note: '' },
    { group: 'Metrics', use: 'Highest pod name only', cmd: R`k top pods -n <ns> --sort-by=cpu --no-headers | head -1 | awk '{print $1}'`, note: 'Typical "write the pod name to a file" task.' },
    { group: 'Metrics', use: 'Raw metrics API', cmd: 'k get --raw /apis/metrics.k8s.io/v1beta1/nodes', note: 'Confirms the API is registered.' },
    { group: 'Logs', use: 'Container logs', cmd: 'k logs <pod>', note: '' },
    { group: 'Logs', use: 'Follow with recent lines', cmd: 'k logs -f <pod> --tail=50', note: '' },
    { group: 'Logs', use: 'Specific container', cmd: 'k logs <pod> -c <container>', note: 'List container names: `k get pod <pod> -o jsonpath="{.spec.containers[*].name}"`.' },
    { group: 'Logs', use: 'Previous (crashed) instance', cmd: 'k logs <pod> -c <container> --previous', note: '' },
    { group: 'Logs', use: 'By label, all containers', cmd: 'k logs -l app=web --all-containers --prefix --tail=20', note: '`--prefix` shows which Pod/container each line came from.' },
    { group: 'Logs', use: 'Time window', cmd: 'k logs <pod> --since=30m --timestamps', note: 'Or `--since-time=2026-11-20T10:00:00Z`.' },
    { group: 'Logs', use: 'Deployment logs', cmd: 'k logs deploy/web', note: 'Picks one Pod of the deployment.' },
    { group: 'Logs', use: 'Grep and save', cmd: 'k logs <pod> | grep -i error > /opt/answers/errors.log', note: '' },
    { group: 'Events', use: 'Sorted events', cmd: 'k get events -A --sort-by=.lastTimestamp', note: '' },
    { group: 'Events', use: 'Warnings only', cmd: 'k get events -A --field-selector type=Warning', note: '' },
    { group: 'Events', use: 'Events for one object', cmd: 'k events --for pod/<pod> -n <ns>', note: '`kubectl events` is the newer dedicated command.' },
    { group: 'Node level', use: 'kubelet logs', cmd: 'sudo journalctl -u kubelet --since "10 min ago" --no-pager', note: '' },
    { group: 'Node level', use: 'Container logs via runtime', cmd: 'sudo crictl ps -a\nsudo crictl logs <container-id>', note: 'Works when the API server is down.' },
    { group: 'Node level', use: 'Pod log files', cmd: 'sudo ls /var/log/pods/\nsudo tail -n 50 /var/log/pods/kube-system_kube-apiserver-*/kube-apiserver/*.log', note: '' },
    { group: 'Debug', use: 'Ephemeral debug container', cmd: 'k debug -it <pod> --image=busybox:1.36 --target=<container>', note: 'Shares the target process namespace; good for distroless images.' },
    { group: 'Debug', use: 'Debug a node', cmd: 'k debug node/<node> -it --image=busybox:1.36', note: 'Host filesystem mounted at /host.' },
  ],
  yaml: [
    { title: 'Native sidecar streaming a log file', note: 'initContainer with restartPolicy Always is a sidecar.', code: R`apiVersion: v1
kind: Pod
metadata:
  name: app-with-logger
spec:
  volumes:
  - name: logs
    emptyDir: {}
  initContainers:
  - name: log-shipper
    image: busybox:1.36
    restartPolicy: Always
    command: ["sh", "-c", "tail -F /var/log/app/app.log"]
    volumeMounts:
    - name: logs
      mountPath: /var/log/app
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh", "-c", "while true; do date >> /var/log/app/app.log; sleep 5; done"]
    volumeMounts:
    - name: logs
      mountPath: /var/log/app` },
  ],
  gotchas: [
    '`k top` values are a snapshot. Wait about 60 seconds after metrics-server starts before trusting them.',
    'Without `-c`, `kubectl logs` on a multi-container Pod errors (or picks the default container annotation).',
    '`--previous` errors if the container never restarted.',
    'Events are namespaced. Use `-A` or the right `-n`.',
  ],
  tasks: [
    { id: 'top-consumer', title: 'Find the highest CPU pod', difficulty: 'Warm-up', time: '3–5 min', prompt: 'Among pods with label app=batch in all namespaces, find the one using the most CPU and write "<namespace>/<pod>" to /opt/answers/top-cpu.txt.', steps: [
      { code: R`k top pods -A -l app=batch --sort-by=cpu --no-headers | head -1 | awk '{print $1"/"$2}' > /opt/answers/top-cpu.txt
cat /opt/answers/top-cpu.txt` } ], check: 'The file holds exactly one namespace/pod pair, matching the top line of `k top pods`.' },
    { id: 'sidecar-logs', title: 'Expose a file-based log through a sidecar', difficulty: 'Core workflow', time: '8–10 min', domain: 'Workloads & Scheduling', prompt: 'Deployment legacy writes logs only to /var/log/legacy/app.log. Add a native sidecar named log-tail (busybox:1.36) that streams the file to stdout, without changing the app container command.', steps: [
      { code: 'k get deploy legacy -o yaml > legacy.yaml' },
      { note: 'Add an emptyDir volume, mount it at /var/log/legacy in the app container (if not already), and add an initContainer log-tail with restartPolicy: Always, the same mount, and command tail -F /var/log/legacy/app.log.' },
      { code: R`k apply -f legacy.yaml
k rollout status deploy legacy
k logs deploy/legacy -c log-tail --tail=5` } ], check: 'Lines from app.log appear in `kubectl logs -c log-tail`, and the app container is unchanged.' },
    { id: 'metrics-fix', title: 'Get kubectl top working', difficulty: 'Core workflow', time: '6–10 min', prompt: '`kubectl top nodes` returns "Metrics API not available". Install or repair metrics-server so node and pod metrics are reported.', steps: [
      { code: R`k get pods -n kube-system -l k8s-app=metrics-server
k get apiservice v1beta1.metrics.k8s.io
k logs -n kube-system deploy/metrics-server` },
      { note: 'If missing, apply the components.yaml. If logs show x509 errors talking to kubelets in a lab, add `--kubelet-insecure-tls` to the container args.' },
      { code: R`k -n kube-system patch deploy metrics-server --type=json -p '[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
k -n kube-system rollout status deploy metrics-server
k top nodes` } ], check: 'APIService shows Available=True and `k top nodes` prints CPU/memory per node.' },
  ],
  docs: [
    { label: 'Resource metrics pipeline', url: 'https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-metrics-pipeline/' },
    { label: 'Logging architecture', url: 'https://kubernetes.io/docs/concepts/cluster-administration/logging/' },
    { label: 'Sidecar containers', url: 'https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/' },
    { label: 'Debug running pods', url: 'https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/' },
  ],
});
})();
