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

- `#/`: dashboard. One "continue" button, the learn → drill → test loop, the study path grouped into 5 phases, and domain weights
- `#/exam`: exam guide. Format and rules, the per-task routine, and the question types for each domain with a short recipe and links to the labs that practise them
- `#/ref`: cheat sheet for a kubeadm cluster: kubectl shorthands, resource short names, get/filter, RBAC, certs and kubeconfig, kubeadm, upgrade, etcd, static Pods, systemd/crictl, troubleshooting, Helm. `#/ref/paths`: a directory tree of a control-plane node plus tables of config file paths, ports and cluster defaults, each with the command that confirms it on the host. Click to copy, print button, "Drill these" button
- `#/topic/<id>/<tab>`: one topic, with tabs **Learn** (concepts, reference tables, exam traps), **Commands** (grouped, copy buttons, quiz mode that hides commands, "known" tracking), **YAML** templates, **Labs** (task → hidden solution → verify step, mark mastered) and **Docs**
- `#/drill`: command drill sessions. Choose the source (topic commands, cheat sheet or both), focus (smart mix, weak spots, not seen yet), length and topics. Type the command and press Enter: the answer is checked as a bag of tokens, so flag order, `kubectl`/`k`, `--flag=v`/`--flag v`, short/plural resource names and `<placeholders>` don't matter. It shows missing and unexpected parts, suggests a grade (Enter accepts, 1/2 override), brings missed cards back later in the session, and ends with a summary and a "drill the missed again" button
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

Exam facts, question types, phases, paths and the cheat sheet live in `js/cka/reference.js`. Each topic is one file in `js/cka/topics/` that calls `CKA.topic({...})`. The schema is documented at the top of `js/cka/registry.js`. To add a topic, create the file and add a `<script>` tag for it in `pages/cka.html`. Lab `id`s are progress keys, so keep them stable. Text fields support `` `code` `` and `**bold**`.

### Storage keys

`cka-mastered-v1` (mastered labs, same key as the original version), `cka-state-v2` (known commands, drill stats, drill settings, last topic, mock history), `cka-mock-v2` (current mock exam).

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
