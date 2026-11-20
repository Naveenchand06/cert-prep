# Cloud Certs Lab

A browser-based study workspace for **Certified Kubernetes Administrator (CKA)** and **AWS Solutions Architect – Associate (SAA-C03)**. It is a static site with no build step, deployed on GitHub Pages (`cert-prep.naveenops.com`).

## Run locally

```sh
python3 -m http.server 8111
# open http://localhost:8111
```

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Certification path picker |
| `pages/cka.html` | CKA workspace: topics, command drill, mock exam |
| `pages/saa.html` | SAA-C03 practice exams |
| `pages/cheatsheet.html` | SAA interactive cheatsheet and service directory |

## CKA workspace

Built with **Vue 3** (CDN global build) and hash routing, so it still deploys as plain static files. Routes:

- `#/`: dashboard with official domain weights, weighted readiness and the study path
- `#/topic/<id>/<tab>`: one topic, with tabs **Learn** (concepts, reference tables, exam traps), **Commands** (grouped, copy buttons, quiz mode that hides commands, "known" tracking), **YAML** templates, **Labs** (task → hidden solution → verify step, mark mastered) and **Docs**
- `#/drill`: flashcards. You get a description, type the command, reveal and grade yourself; missed commands come back more often
- `#/mock`: random labs weighted by exam domain, with a timer (default 16 tasks / 120 min), self-marking, pass/fail against 66% and history

Press `/` anywhere to search all commands, YAML, labs and concepts.

### Topics (KodeKloud CKA course order)

| # | Topic | KodeKloud section |
|---|---|---|
| 01 | Exam Setup & kubectl Speed (aliases, JSONPath, custom-columns) | Intro · Other Topics |
| 02 | Core Concepts | 2 |
| 03 | Scheduling (taints, affinity, resources, DaemonSets, static Pods, PriorityClass, admission) | 3 |
| 04 | Logging & Monitoring | 4 |
| 05 | Application Lifecycle (rollouts, ConfigMaps/Secrets, encryption at rest, probes, HPA/VPA, in-place resize) | 5 |
| 06 | Cluster Maintenance (drain, kubeadm upgrade, etcd backup/restore, node paths) | 6 |
| 07 | Security (TLS, CSR API, kubeconfig, RBAC, ServiceAccounts, securityContext, Pod Security) | 7 |
| 08 | Storage | 8 |
| 09 | Networking (CNI, Services, CoreDNS, Ingress, Gateway API, NetworkPolicy) | 9 |
| 10 | Install & HA with kubeadm (prereqs, CRI/CNI/CSI) | 10–11 |
| 11 | Helm | 13 |
| 12 | Kustomize | 14 |
| 13 | CRDs & Operators | 7 (2025 updates) |
| 14 | Troubleshooting | 12 |

### Adding content

Each topic is one file in `js/cka/topics/` that calls `CKA.topic({...})`. The schema is documented at the top of `js/cka/registry.js`. To add a topic, create the file and add a `<script>` tag for it in `pages/cka.html`. Lab `id`s are progress keys, so keep them stable. Text fields support `` `code` `` and `**bold**`.

### Storage keys

`cka-mastered-v1` (mastered labs, same key as the original version), `cka-state-v2` (known commands, drill stats, last topic, mock history), `cka-mock-v2` (current mock exam).

### Sources

- [Linux Foundation CKA exam page and curriculum](https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/): Kubernetes v1.37, domain weights and competencies
- [KodeKloud CKA course](https://kodekloud.com/courses/cka-certification-course-certified-kubernetes-administrator/) and its [course notes](https://notes.kodekloud.com/docs/Certified-Kubernetes-Administrator-CKA): topic structure
- [kubernetes.io documentation](https://kubernetes.io/docs/): commands, paths and YAML
- Practice: [Killercoda](https://killercoda.com/playgrounds), [killer.sh](https://killer.sh), [TechiesCamp guide](https://github.com/techiescamp/cka-certification-guide), [chadmcrowell CKA exercises](https://github.com/chadmcrowell/CKA-Exercises)

The labs are original study tasks shaped by the public curriculum. They are not exam questions. Run them in a disposable cluster.

## SAA

Questions are in `js/questions.js` (practice exam in `pages/saa.html`), and the cheatsheet data is in `js/cheatsheet-data.js` and `js/services.js`.

## Deploy

GitHub Pages serves the repo as is. To use Vercel instead: import the repo, choose the **Other** preset, leave the build command empty, and set the output directory to `.`.
