# Cloud Certs Lab

A browser-based study workspace for **AWS Solutions Architect – Associate (SAA-C03)** and **Certified Kubernetes Administrator (CKA)**. The original AWS practice app remains available alongside a new CKA workspace with exam-weighted progress, kubectl drills, and hands-on practice tasks.

## Run locally

No build step is required. Open `index.html`, or serve the directory for reliable browser storage and navigation:

```sh
python3 -m http.server 8111
# open http://localhost:8111
```

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Certification path picker: AWS SAA or CKA |
| `pages/saa.html` | SAA-C03 practice exams |
| `pages/study-guide.html` | SAA course triage guide |
| `pages/cheatsheet.html` | SAA dark-first interactive cheatsheet and service directory |
| `pages/cka.html` | CKA study dashboard, domains, command drills and practice tasks |

## Project structure

```text
cert-prep/
├── index.html          # Entry point: certification path picker
├── pages/              # All other pages (cka, saa, study-guide, cheatsheet)
├── css/                # Stylesheets: style.css (shared/SAA), platform.css (home + CKA), cheatsheet.css
├── js/                 # Scripts: theme.js, app.js, questions.js, guide.js, services.js,
│                       #   cheatsheet.js, cheatsheet-data.js, cka.js
└── README.md
```

## Framework choice

The path picker and CKA workspace use **Vue 3** from its production CDN build. Vue fits the interactive progress view, command filters, and revealable practice solutions while keeping this content-first project static and easy to host. The existing SAA app remains plain JavaScript; its cheatsheet already uses Vue 3. There is no package manager or build output to maintain.

The site is configured as a static site for Vercel: import the repository, use the **Other** framework preset, leave the build command blank, and use `.` as the output directory. No server-side routes or API keys are required. Vue, fonts, and the cheatsheet's framework load from CDNs, so those features require a network connection; the SAA question bank itself is local.

## CKA study workspace

The CKA page uses the current Linux Foundation domain weights and includes progress by domain and a weighted readiness score. Progress is local to the browser and records tasks marked mastered. The task prompts are original study exercises shaped by the published curriculum and common public lab patterns; they are not actual exam dumps. Practice in a disposable Kubernetes lab before running cluster-changing commands.

The **Node paths & etcd** tab covers kubeadm's usual control-plane static Pod manifests, controller-manager and scheduler kubeconfigs, kubelet config and service discovery, PKI, the etcd data directory, and a TLS-authenticated etcd snapshot example. It includes a step-by-step static Pod manifest workflow and a matching practice task. Paths are defaults: inspect the designated host and component manifest/config when a task or cluster differs. The paths table remains horizontally scrollable on narrow screens so the path column stays visible. Kubernetes documents kubeadm static Pods under `/etc/kubernetes/manifests`; it warns to keep backups outside that watched directory.

The CKA objective explicitly includes creating and managing clusters with kubeadm, and Linux Foundation exam instructions describe SSH to a designated host for each task. Public exam guidance does not guarantee that every prebuilt cluster is exclusively kubeadm-created, so this guide teaches the kubeadm defaults while prompting you to verify the actual host configuration.

Current domain weights:

| Domain | Weight |
|---|---:|
| Troubleshooting | 30% |
| Cluster Architecture, Installation & Configuration | 25% |
| Services & Networking | 20% |
| Workloads & Scheduling | 15% |
| Storage | 10% |

The command drills cover context/namespace handling, imperative generators, inspect/debug patterns, rollout and node maintenance, and concise output. `k` and shell completion are common exam conveniences; confirm the environment instead of assuming aliases are configured.

### CKA references

- [Linux Foundation CKA exam page and curriculum](https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/)
- [KodeKloud CKA course](https://kodekloud.com/courses/cka-certification-course-certified-kubernetes-administrator/) — labs and imperative command practice
- [KodeKloud CKA learning path](https://pages.kodekloud.com/learning-path/cka)
- [TechiesCamp public practice question guide](https://github.com/techiescamp/cka-certification-guide/blob/main/PRACTICE_QUESTIONS.md)
- [chadmcrowell CKA Exercises](https://github.com/chadmcrowell/CKA-Exercises)
- [Killercoda Kubernetes playgrounds](https://killercoda.com/playgrounds)
- [Kubernetes kubeadm implementation details and default paths](https://kubernetes.io/docs/reference/setup-tools/kubeadm/implementation-details/)
- [Kubernetes static Pod manifests](https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/)
- [Kubernetes etcd snapshot and restore guide](https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/)

The public question repositories are linked as external study materials rather than copied into this repo; check each repository's license and attribution before reusing its content.

## SAA question bank

All SAA questions remain in `js/questions.js`. `pages/saa.html` provides the topic-filtered practice exam, coverage tracking, randomized choices, partial-credit review, and session history. The SAA cheatsheet content is in `js/cheatsheet-data.js`, with its service directory in `js/services.js`.

## Deploy to Vercel

This is a static multi-page site. In Vercel, select **Other** as the framework preset, leave build and install commands empty, and set the output directory to `.`. The default URLs (`/`, `/pages/saa.html`, `/pages/cka.html`, and supporting pages) need no rewrite configuration.
