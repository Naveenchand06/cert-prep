(() => { const R = String.raw;
CKA.topic({
  id: 'exam-setup',
  title: 'Exam Setup & kubectl Speed',
  icon: '⚡',
  domain: 'Troubleshooting',
  kodekloud: 'Introduction · Other Topics (JSON Path)',
  summary: 'The CKA is 2 hours of hands-on tasks in a remote desktop. Speed comes from three things: never working in the wrong context, generating YAML instead of typing it, and pulling exact fields with JSONPath or custom-columns. Learn these before any other topic.',
  objectives: ['Manage and evaluate container output streams', 'Exam environment and time management'],
  concepts: [
    { title: 'How the exam works', body: 'Roughly 15–20 performance tasks, 2 hours, Kubernetes **v1.37**. Each task tells you which host to `ssh` to, and a weight in percent. You work in a Linux remote desktop with a terminal, a browser limited to allowed docs, and a notepad. Passing score is published in the LF candidate handbook (66% at time of writing). Your purchase includes two killer.sh simulator sessions, which are harder than the real exam.' },
    { title: 'Always start a task the same way', body: 'Read the whole task, copy the `ssh` / context line the task gives you, run it, then set the namespace. Most lost marks are correct work done on the wrong host, cluster or namespace. When a task ends, `exit` back to the base terminal before starting the next one.' },
    { title: 'Imperative first, YAML second', body: 'Use `kubectl create/run/expose ... --dry-run=client -o yaml > file.yaml` to produce a valid skeleton, then add fields that have no flag (volumes, probes, affinity, securityContext). Use `kubectl explain <resource>.<field>` to find field names instead of searching the docs.' },
    { title: 'Editing immutable fields', body: 'Many Pod fields cannot be edited live. `kubectl edit` saves a rejected copy to `/tmp/kubectl-edit-*.yaml`. Apply that copy with `kubectl replace --force -f <file>`, which deletes and re-creates the Pod in one step.' },
    { title: 'Output formats are a weapon', body: '`-o wide` adds node/IP, `-o yaml` shows everything, `-o jsonpath` extracts fields, `-o custom-columns` builds tables, `--sort-by` sorts on any JSON path. Tasks often say "write the result to /opt/answer.txt". Redirect the exact output and `cat` the file to check it.' },
    { title: 'Time management', body: 'Do a first pass in order and skip anything that takes more than ~8 minutes. Use the notepad to track skipped task numbers and their weight. High-weight troubleshooting tasks deserve your time; a 2% task does not.' },
  ],
  commands: [
    { group: 'Shell setup', use: 'Alias & completion (if not preset)', cmd: R`alias k=kubectl
source <(kubectl completion bash)
complete -o default -F __start_kubectl k`, note: 'Usually preconfigured on the exam. Check with `type k` before adding.' },
    { group: 'Shell setup', use: 'Dry-run shortcut', cmd: R`export do="--dry-run=client -o yaml"
# k run web --image=nginx $do > web.yaml`, note: 'Saves typing the most-used flag combination.' },
    { group: 'Shell setup', use: 'Fast delete shortcut', cmd: R`export now="--force --grace-period=0"
# k delete pod web $now`, note: 'Skips the graceful shutdown wait. Use it on Pods only.' },
    { group: 'Shell setup', use: 'Vim indentation for YAML', cmd: R`cat >> ~/.vimrc <<'EOF'
set expandtab tabstop=2 shiftwidth=2 autoindent
EOF`, note: 'Prevents tab characters breaking YAML. In vim: `:set paste` before pasting, `V` + `>` to indent a block.' },
    { group: 'Context', use: 'Show contexts', cmd: 'k config get-contexts', note: 'The asterisk marks the active context.' },
    { group: 'Context', use: 'Switch context', cmd: 'k config use-context <context>', note: 'Run exactly what the task header says.' },
    { group: 'Context', use: 'Set default namespace', cmd: 'k config set-context --current --namespace=<ns>', note: 'Then every command targets that namespace without -n.' },
    { group: 'Context', use: 'Current namespace check', cmd: 'k config view --minify -o jsonpath=\'{..namespace}\'', note: 'Empty output means `default`.' },
    { group: 'Discover', use: 'Explain a field', cmd: 'k explain pod.spec.containers.livenessProbe', note: 'Field names, types and descriptions offline.' },
    { group: 'Discover', use: 'Explain full tree', cmd: 'k explain deployment.spec --recursive | less', note: 'See every nested field name at once.' },
    { group: 'Discover', use: 'All resource types', cmd: 'k api-resources -o wide', note: 'Short names, API group, namespaced or not, and verbs.' },
    { group: 'Discover', use: 'Cluster-scoped resources', cmd: 'k api-resources --namespaced=false', note: 'Useful for ClusterRole rules.' },
    { group: 'Output', use: 'JSONPath single field', cmd: R`k get pod web -o jsonpath='{.status.podIP}'`, note: 'Field path follows the YAML structure; start from the root object.' },
    { group: 'Output', use: 'JSONPath loop with range', cmd: R`k get nodes -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.nodeInfo.kubeletVersion}{"\n"}{end}'`, note: '`range ... end` prints one line per item.' },
    { group: 'Output', use: 'JSONPath filter', cmd: R`k get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="InternalIP")].address}'`, note: '`?(@.field=="value")` filters list entries.' },
    { group: 'Output', use: 'Custom columns', cmd: 'k get pods -o custom-columns=NAME:.metadata.name,IMAGE:.spec.containers[*].image,NODE:.spec.nodeName', note: 'Readable tables with your own headings.' },
    { group: 'Output', use: 'Sort by field', cmd: 'k get pv --sort-by=.spec.capacity.storage', note: 'Works with any JSON path, e.g. `.metadata.creationTimestamp`.' },
    { group: 'Output', use: 'Decode a Secret value', cmd: R`k get secret <name> -o jsonpath='{.data.password}' | base64 -d`, note: 'Secret data is base64-encoded, not encrypted.' },
    { group: 'Output', use: 'Count objects', cmd: 'k get pods -A --no-headers | wc -l', note: '`--no-headers` removes the header line from counts.' },
    { group: 'Edit', use: 'Replace immutable change', cmd: 'k replace --force -f /tmp/kubectl-edit-<id>.yaml', note: 'Deletes and re-creates from the saved edit file.' },
    { group: 'Edit', use: 'Save a live object as YAML', cmd: 'k get deploy web -o yaml > web.yaml', note: 'Always back up before editing important objects.' },
    { group: 'Edit', use: 'Quick JSON patch', cmd: R`k patch deploy web -p '{"spec":{"replicas":4}}'`, note: 'Strategic merge patch; no editor needed.' },
  ],
  yaml: [
    { title: 'Generated pod skeleton', note: 'What `k run web --image=nginx --dry-run=client -o yaml` gives you after cleanup.', code: R`apiVersion: v1
kind: Pod
metadata:
  name: web
  labels:
    run: web
spec:
  containers:
  - name: web
    image: nginx
  restartPolicy: Always` },
  ],
  gotchas: [
    'The `--dry-run` flag alone is deprecated; always write `--dry-run=client`.',
    '`k exec pod -- cmd` needs the `--` separator; the old form without it was removed.',
    'JSONPath needs single quotes around the expression in bash, and `{"\\n"}` for new lines.',
    'Copy/paste in the exam terminal is Ctrl+Shift+C / Ctrl+Shift+V.',
    'Many tasks require you to `sudo -i` on the host. Remember that kubeconfig may only exist for a specific user.',
    'Answer files must contain exactly what is asked. Check them with `cat`, and look for stray header lines.',
  ],
  tasks: [
    { id: 'jsonpath-nodes', title: 'Write node names and internal IPs to a file', difficulty: 'Warm-up', time: '3–5 min', prompt: 'Write every node name and its InternalIP, one node per line separated by a space, into /opt/answers/node-ips.txt.', steps: [
      { code: R`mkdir -p /opt/answers
k get nodes -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.status.addresses[?(@.type=="InternalIP")].address}{"\n"}{end}' > /opt/answers/node-ips.txt
cat /opt/answers/node-ips.txt` } ], check: 'One line per node, name then IP, no headers.' },
    { id: 'sort-pods', title: 'List pods sorted by creation time with custom columns', difficulty: 'Warm-up', time: '3–5 min', prompt: 'List all pods in all namespaces with columns NAMESPACE, NAME and NODE, sorted by creation timestamp, and save the output to /opt/answers/pods.txt.', steps: [
      { code: R`k get pods -A --sort-by=.metadata.creationTimestamp \
  -o custom-columns=NAMESPACE:.metadata.namespace,NAME:.metadata.name,NODE:.spec.nodeName \
  > /opt/answers/pods.txt
head /opt/answers/pods.txt` } ], check: 'The headers exactly match NAMESPACE, NAME and NODE, and the oldest pods appear first.' },
    { id: 'secret-decode', title: 'Extract and decode a Secret key', difficulty: 'Warm-up', time: '2–4 min', prompt: 'Secret db-creds in namespace data has a key password. Write its decoded value into /opt/answers/db-pass.txt.', steps: [
      { code: R`k get secret db-creds -n data -o jsonpath='{.data.password}' | base64 -d > /opt/answers/db-pass.txt
cat /opt/answers/db-pass.txt` } ], check: 'The file contains the plain-text password without base64 encoding.' },
  ],
  docs: [
    { label: 'kubectl Quick Reference', url: 'https://kubernetes.io/docs/reference/kubectl/quick-reference/' },
    { label: 'JSONPath support', url: 'https://kubernetes.io/docs/reference/kubectl/jsonpath/' },
    { label: 'LF exam tips (CKA/CKAD)', url: 'https://docs.linuxfoundation.org/tc-docs/certification/tips-cka-and-ckad' },
    { label: 'LF CKA exam page', url: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/' },
  ],
});
})();
