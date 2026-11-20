/* CKA content registry.
   Each file in js/cka/topics/ calls CKA.topic({...}) to register one study topic.
   Topic shape:
     id, title, icon, domain (default exam domain for its labs), kodekloud (matching course section),
     summary, objectives[] (official curriculum lines it covers),
     concepts[{title, body}]  body supports `code` and **bold**
     commands[{group, use, cmd, note}]
     yaml[{title, note, code}]
     gotchas[]  tasks[{id, title, difficulty, time, prompt, steps[{note|code}], check, domain?}]
     docs[{label, url}]
*/
window.CKA = {
  k8sVersion: 'v1.37',
  reviewed: 'November 2026',
  domains: [
    { name: 'Troubleshooting', short: 'Troubleshooting', weight: 30,
      competencies: ['Troubleshoot clusters and nodes', 'Troubleshoot cluster components', 'Monitor cluster and application resource usage', 'Manage and evaluate container output streams', 'Troubleshoot services and networking'] },
    { name: 'Cluster Architecture, Installation & Configuration', short: 'Cluster Architecture', weight: 25,
      competencies: ['Manage role based access control (RBAC)', 'Prepare underlying infrastructure for installing a Kubernetes cluster', 'Create and manage Kubernetes clusters using kubeadm', 'Manage the lifecycle of Kubernetes clusters', 'Implement and configure a highly-available control plane', 'Use Helm and Kustomize to install cluster components', 'Understand extension interfaces (CNI, CSI, CRI, etc.)', 'Understand CRDs, install and configure operators'] },
    { name: 'Services & Networking', short: 'Networking', weight: 20,
      competencies: ['Understand connectivity between Pods', 'Define and enforce Network Policies', 'Use ClusterIP, NodePort, LoadBalancer service types and endpoints', 'Use the Gateway API to manage Ingress traffic', 'Know how to use Ingress controllers and Ingress resources', 'Understand and use CoreDNS'] },
    { name: 'Workloads & Scheduling', short: 'Workloads', weight: 15,
      competencies: ['Understand application deployments and how to perform rolling update and rollbacks', 'Use ConfigMaps and Secrets to configure applications', 'Configure workload autoscaling', 'Understand the primitives used to create robust, self-healing, application deployments', 'Configure Pod admission and scheduling (limits, node affinity, etc.)'] },
    { name: 'Storage', short: 'Storage', weight: 10,
      competencies: ['Implement storage classes and dynamic volume provisioning', 'Configure volume types, access modes and reclaim policies', 'Manage persistent volumes and persistent volume claims'] },
  ],
  topics: [],
  topic(t) { this.topics.push(t); },
};
