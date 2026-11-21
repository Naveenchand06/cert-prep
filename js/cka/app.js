/* CKA study workspace. Vue 3 (global build), hash routing, localStorage progress.
   Routes: #/  ·  #/exam  ·  #/ref[/cmds|paths]  ·  #/topic/<id>[/<tab>]  ·  #/drill  ·  #/mock */
(function () {
  const { createApp } = Vue;
  const MASTERED_KEY = 'cka-mastered-v1'; // kept from v1 so earlier progress carries over
  const STATE_KEY = 'cka-state-v2';
  const MOCK_KEY = 'cka-mock-v2';
  const TABS = ['learn', 'commands', 'yaml', 'labs', 'docs'];

  const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; } };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------- drill answer checking ----------
     Commands are compared as bags of tokens, so flag order, `--flag=value` vs `--flag value`,
     `kubectl` vs `k`, `deploy/web` vs `deploy web` and plural/short resource names all match.
     `<placeholder>` tokens in the answer accept any value. */
  const ALIASES = {
    kubectl: 'k', pod: 'po', pods: 'po', deployment: 'deploy', deployments: 'deploy', service: 'svc', services: 'svc',
    namespace: 'ns', namespaces: 'ns', node: 'no', nodes: 'no', configmap: 'cm', configmaps: 'cm', serviceaccount: 'sa',
    serviceaccounts: 'sa', replicaset: 'rs', replicasets: 'rs', daemonset: 'ds', daemonsets: 'ds', statefulset: 'sts',
    statefulsets: 'sts', persistentvolume: 'pv', persistentvolumes: 'pv', persistentvolumeclaim: 'pvc',
    persistentvolumeclaims: 'pvc', storageclass: 'sc', storageclasses: 'sc', ingress: 'ing', ingresses: 'ing',
    networkpolicy: 'netpol', networkpolicies: 'netpol', cronjob: 'cj', cronjobs: 'cj', job: 'jobs', secret: 'secrets',
    endpoints: 'ep', event: 'ev', events: 'ev', horizontalpodautoscaler: 'hpa', poddisruptionbudget: 'pdb',
    '--namespace': '-n', '--all-namespaces': '-A', '--output': '-o', '--selector': '-l', '--filename': '-f',
    '--container': '-c', '--recursive': '-R',
  };
  function tokens(cmd, exact) {
    const text = String(cmd)
      .replace(/\\\n/g, ' ')                                         // line continuations
      .split('\n').map(l => l.replace(/^\s*#.*$/, '').replace(/\s+#\s.*$/, '')).join(' ; ')
      .replace(/\s*(;|&&|\|\|?)\s*/g, ' $1 ');
    const raw = text.match(/"[^"]*"|'[^']*'|\S+/g) || [];
    const out = [];
    for (let t of raw) {
      t = t.replace(/^(["'])(.*)\1$/, '$2');
      if (t === 'sudo' || t === ';' || t === '&&' || t === 'ETCDCTL_API=3') continue;  // optional noise
      if (exact) { out.push(t); continue; }
      const parts = [];
      const eq = t.match(/^(--?[A-Za-z][\w-]*)=(.*)$/);
      if (eq) parts.push(eq[1], eq[2].replace(/^(["'])(.*)\1$/, '$2'));
      else if (/^-(it|ti)$/.test(t)) parts.push('-i', '-t');
      else if (/^[a-z]+\/[\w.<>-]+$/.test(t)) parts.push(...t.split('/'));
      else parts.push(t);
      for (const p of parts) if (p !== '') out.push(ALIASES[p] || p);
    }
    return out;
  }
  const tokenMatcher = t => {
    if (!/<[^>]+>/.test(t)) return u => u === t;
    const re = new RegExp('^' + t.split(/<[^>]+>/).map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.+') + '$');
    return u => re.test(u);
  };
  function checkAnswer(answer, expected, exact) {
    const want = tokens(expected, exact), got = tokens(answer, exact);
    const used = new Array(got.length).fill(false);
    const missing = [];
    for (const t of want) {
      const m = tokenMatcher(t);
      const i = got.findIndex((u, j) => !used[j] && m(u));
      if (i >= 0) used[i] = true; else missing.push(t);
    }
    const extra = got.filter((_, j) => !used[j]);
    const score = want.length ? (want.length - missing.length) / want.length : 0;
    const verdict = !got.length ? 'blank' : !missing.length && !extra.length ? 'exact' : score >= 0.75 && extra.length <= 2 ? 'close' : 'wrong';
    return { missing, extra, score: Math.round(score * 100), verdict, placeholders: /<[^>]+>/.test(expected) };
  }
  // "k create deploy ___ --image=___" style hint from the first real line of the answer
  function hintFor(cmd) {
    const line = String(cmd).replace(/\\\n/g, ' ').split('\n').find(l => l.trim() && !/^\s*#/.test(l)) || '';
    let show = 3; // reveal the first 3 words of every piped / chained segment
    return line.replace(/\s+#\s.*$/, '').trim().split(/\s+/).map(t => {
      if (/^([|;&]+|--)$/.test(t)) { if (t !== '--') show = 3; return t; }
      if (/^[A-Z_]+=/.test(t)) return t;
      const f = t.match(/^(--?[\w-]+)(=.*)?$/);
      if (f) { show = 0; return f[2] ? f[1] + '=___' : f[1]; }
      if (show > 0) { show--; return t; }
      return '___';
    }).join(' ');
  }
  const REF_TOPIC = { id: 'ref', title: 'Cheat sheet', icon: '📋' };

  function parseRoute() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    if (parts[0] === 'topic' && parts[1]) return { view: 'topic', id: parts[1], tab: TABS.includes(parts[2]) ? parts[2] : 'learn' };
    if (parts[0] === 'drill') return { view: 'drill' };
    if (parts[0] === 'exam') return { view: 'exam' };
    if (parts[0] === 'ref') return { view: 'ref', tab: parts[1] === 'paths' ? 'paths' : 'cmds' };
    if (parts[0] === 'mock') return { view: 'mock' };
    return { view: 'home' };
  }

  createApp({
    data() {
      const state = load(STATE_KEY, {});
      return {
        topics: CKA.topics,
        domains: CKA.domains,
        k8sVersion: CKA.k8sVersion,
        reviewed: CKA.reviewed,
        exam: CKA.exam,
        questionTypes: CKA.questionTypes,
        paths: CKA.paths,
        cheats: CKA.cheats,
        tree: CKA.tree,
        refFilter: '',
        route: parseRoute(),
        sideOpen: false,
        query: '',
        cmdFilter: '',
        quiz: false,
        peek: {},
        revealed: {},
        toast: '',
        mastered: load(MASTERED_KEY, {}),
        known: state.known || {},          // cmdKey -> true
        drillStats: state.drillStats || {}, // cmdKey -> { ok, miss }
        lastTopic: state.lastTopic || '',
        mockHistory: state.mockHistory || [],
        drillCfg: Object.assign({ source: 'both', focus: 'smart', size: 20, topics: [] }, state.drillCfg || {}),
        drill: { active: false, done: false, queue: [], i: 0, first: {}, again: {} },
        drillAnswer: '',
        drillResult: null,  // checkAnswer() output once the card is checked
        drillHint: false,
        mockCfg: { count: 16, minutes: 120, unmasteredFirst: true },
        mock: load(MOCK_KEY, { active: false, finished: false, tasks: [], weights: {}, solved: {}, start: 0, end: 0 }),
        now: Date.now(),
      };
    },
    computed: {
      topic() { return this.route.view === 'topic' ? this.topicById(this.route.id) : null; },
      topicIndex() { return this.topics.findIndex(t => t.id === this.route.id); },
      topicTabs() {
        const t = this.topic;
        return [
          { id: 'learn', label: 'Learn' },
          { id: 'commands', label: 'Commands', count: t.commands.length },
          { id: 'yaml', label: 'YAML', count: t.yaml.length },
          { id: 'labs', label: 'Labs', count: t.tasks.length },
          { id: 'docs', label: 'Docs', count: t.docs.length },
        ];
      },
      allTasks() { return this.topics.flatMap(topic => topic.tasks.map(task => ({ task, topic, domain: task.domain || topic.domain }))); },
      allCommands() { return this.topics.flatMap(topic => topic.commands.map(c => ({ topic, c }))); },
      masteredCount() { return this.allTasks.filter(x => this.mastered[x.task.id]).length; },
      drillKnown() { return this.allCommands.filter(x => this.known[this.cmdKey(x.topic, x.c)]).length; },
      readiness() { return Math.round(this.domains.reduce((s, d) => s + d.weight * this.domainProgress(d.name) / 100, 0)); },
      phases() {
        return CKA.phases.map(p => ({ ...p, items: p.topics.map(id => this.topicById(id)).filter(Boolean) }));
      },
      nextTopic() {
        if (this.lastTopic && this.topicById(this.lastTopic) && this.topicProgress(this.topicById(this.lastTopic)) < 100) return this.topicById(this.lastTopic);
        return this.topics.find(t => this.topicProgress(t) < 100) || this.topics[0];
      },
      drillLeft() { return this.allCommands.length - this.drillKnown; },
      // every drillable card: topic commands + cheat-sheet one-liners
      drillCards() {
        const topicCards = this.allCommands.map(({ topic, c }) => ({ key: this.cmdKey(topic, c), topic, c, src: 'topics' }));
        const refCards = this.cheats.flatMap(g => g.items.map(([use, cmd]) => ({ key: `ref:${g.group}:${use}`, topic: REF_TOPIC, c: { group: g.group, use, cmd, note: g.drillNote || '' }, src: 'ref', exact: g.exact })));
        return topicCards.concat(refCards);
      },
      cardByKey() { const m = {}; this.drillCards.forEach(x => { m[x.key] = x; }); return m; },
      drillScope() {
        const { source, topics } = this.drillCfg;
        return this.drillCards.filter(x => (source === 'both' || x.src === source) && (x.src === 'ref' || !topics.length || topics.includes(x.topic.id)));
      },
      drillCounts() {
        const n = { total: 0, known: 0, weak: 0, fresh: 0 };
        for (const x of this.drillScope) { n.total++; n[this.cardStatus(x.key)]++; }
        return n;
      },
      drillCard() { return this.drill.active ? this.cardByKey[this.drill.queue[this.drill.i]] : null; },
      drillHintText() { return this.drillCard ? hintFor(this.drillCard.c.cmd) : ''; },
      drillSuggest() { const r = this.drillResult; return r && (r.verdict === 'exact' || r.verdict === 'close') ? 'ok' : 'miss'; },
      drillTally() {
        const v = Object.values(this.drill.first);
        return { ok: v.filter(x => x === 'ok').length, miss: v.filter(x => x === 'miss').length, skip: v.filter(x => x === 'skip').length };
      },
      drillMissed() { return Object.keys(this.drill.first).filter(k => this.drill.first[k] === 'miss').map(k => this.cardByKey[k]).filter(Boolean); },
      lastMock() { return this.mockHistory.length ? this.mockHistory[this.mockHistory.length - 1] : null; },
      cheatGroups() {
        const f = this.refFilter.trim().toLowerCase();
        return this.cheats.map(g => ({ ...g, items: g.items.filter(([use, cmd]) => !f || (g.group + ' ' + use + ' ' + cmd).toLowerCase().includes(f)) })).filter(g => g.items.length);
      },
      pathGroups() {
        const f = this.refFilter.trim().toLowerCase();
        return this.paths.map(g => ({ ...g, rows: g.rows.filter(r => !f || (g.group + ' ' + r.join(' ')).toLowerCase().includes(f)) })).filter(g => g.rows.length);
      },
      bestMock() { return Math.max(0, ...this.mockHistory.map(h => h.score)); },
      commandGroups() {
        const f = this.cmdFilter.trim().toLowerCase();
        const groups = [];
        for (const c of this.topic.commands) {
          if (f && !(c.use + ' ' + c.cmd + ' ' + c.note + ' ' + c.group).toLowerCase().includes(f)) continue;
          let g = groups.find(x => x.name === c.group);
          if (!g) groups.push(g = { name: c.group, items: [] });
          g.items.push(c);
        }
        return groups;
      },
      searchResults() {
        const terms = this.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
        if (!terms.length) return [];
        const hit = text => { const t = text.toLowerCase(); return terms.every(w => t.includes(w)); };
        const out = [];
        for (const topic of this.topics) {
          topic.commands.forEach((c, i) => { if (hit(`${c.use} ${c.cmd} ${c.note} ${c.group}`)) out.push({ key: `${topic.id}c${i}`, kind: 'command', topic, tab: 'commands', title: c.use, code: c.cmd, note: c.note }); });
          topic.yaml.forEach((y, i) => { if (hit(`${y.title} ${y.code} ${y.note}`)) out.push({ key: `${topic.id}y${i}`, kind: 'yaml', topic, tab: 'yaml', title: y.title, code: y.code, note: y.note }); });
          topic.tasks.forEach(t => { if (hit(`${t.title} ${t.prompt}`)) out.push({ key: `${topic.id}t${t.id}`, kind: 'lab', topic, tab: 'labs', title: t.title, note: t.prompt }); });
          topic.concepts.forEach((c, i) => { if (hit(`${c.title} ${c.body}`)) out.push({ key: `${topic.id}k${i}`, kind: 'concept', topic, tab: 'learn', title: c.title, note: c.body }); });
        }
        const order = { command: 0, yaml: 1, lab: 2, concept: 3 };
        return out.sort((a, b) => order[a.kind] - order[b.kind]);
      },
      remaining() { return Math.max(0, Math.round((this.mock.end - this.now) / 1000)); },
      mockTasks() {
        return this.mock.tasks.map(id => this.allTasks.find(x => x.task.id === id)).filter(Boolean);
      },
      mockSolvedCount() { return this.mock.tasks.filter(id => this.mock.solved[id]).length; },
      mockScore() { return this.mock.tasks.reduce((s, id) => s + (this.mock.solved[id] ? this.mock.weights[id] || 0 : 0), 0); },
    },
    watch: {
      route: { handler(r) { if (r.view === 'topic' && this.topicById(r.id)) { this.lastTopic = r.id; this.saveState(); } this.cmdFilter = ''; this.refFilter = ''; this.peek = {}; window.scrollTo(0, 0); }, deep: true },
    },
    methods: {
      print() { window.print(); },
      jump(id) { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
      topicById(id) { return this.topics.find(t => t.id === id); },
      topicNum(t) { return String(this.topics.indexOf(t) + 1).padStart(2, '0'); },
      labInfo(id) { return this.allTasks.find(x => x.task.id === id); },
      domainWeight(name) { const d = this.domains.find(x => x.name === name); return d ? d.weight : 0; },
      fmt(s) {
        return esc(s || '')
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      },
      clock(sec) { const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; },
      notify(msg) { this.toast = msg; clearTimeout(this._t); this._t = setTimeout(() => { this.toast = ''; }, 1400); },
      async copy(text) {
        try { await navigator.clipboard.writeText(text); }
        catch (_) { const a = document.createElement('textarea'); a.value = text; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); }
        this.notify('Copied to clipboard');
      },
      saveState() {
        localStorage.setItem(STATE_KEY, JSON.stringify({ known: this.known, drillStats: this.drillStats, lastTopic: this.lastTopic, mockHistory: this.mockHistory, drillCfg: this.drillCfg }));
      },

      // progress
      domainTasks(name) { return this.allTasks.filter(x => x.domain === name); },
      domainDone(name) { return this.domainTasks(name).filter(x => this.mastered[x.task.id]).length; },
      domainProgress(name) { const n = this.domainTasks(name).length; return n ? Math.round(this.domainDone(name) / n * 100) : 0; },
      topicProgress(t) { return t.tasks.length ? Math.round(t.tasks.filter(k => this.mastered[k.id]).length / t.tasks.length * 100) : 0; },
      toggleMastered(id) {
        if (this.mastered[id]) delete this.mastered[id]; else this.mastered[id] = true;
        localStorage.setItem(MASTERED_KEY, JSON.stringify(this.mastered));
      },
      cmdKey(topic, c) { return `${topic.id}:${c.use}`; },
      isKnown(topic, c) { return Boolean(this.known[this.cmdKey(topic, c)]); },
      toggleKnown(topic, c) { const k = this.cmdKey(topic, c); if (this.known[k]) delete this.known[k]; else this.known[k] = true; this.saveState(); },
      topicKnown(t) { return t.commands.filter(c => this.isKnown(t, c)).length; },

      // drill
      cardStatus(key) {
        if (this.known[key]) return 'known';
        const s = this.drillStats[key];
        if (!s) return 'fresh';
        return s.miss > 0 && s.miss >= s.ok ? 'weak' : 'known';
      },
      cardWeight(key) {
        const s = this.drillStats[key];
        if (!s) return 3;
        return Math.max(1, 1 + s.miss * 2 - s.ok) * (this.known[key] ? 0.5 : 1);
      },
      toggleDrillTopic(id) {
        const t = this.drillCfg.topics, i = t.indexOf(id);
        if (i >= 0) t.splice(i, 1); else t.push(id);
        this.saveState();
      },
      setDrill(k, v) { this.drillCfg[k] = v; if (k === 'source' && v === 'ref') this.drillCfg.topics = []; this.saveState(); },
      startDrill(keys) {
        let queue = keys;
        if (!queue) {
          let pool = this.drillScope;
          if (this.drillCfg.focus === 'weak') pool = pool.filter(x => this.cardStatus(x.key) === 'weak');
          if (this.drillCfg.focus === 'fresh') pool = pool.filter(x => this.cardStatus(x.key) === 'fresh');
          // weighted sample without replacement: missed cards first, known cards rarely
          queue = pool.map(x => ({ k: x.key, r: Math.pow(Math.random(), 1 / this.cardWeight(x.key)) }))
            .sort((a, b) => b.r - a.r).slice(0, this.drillCfg.size).map(x => x.k);
        }
        if (!queue.length) { this.notify('No cards match. Change the focus or topics.'); return; }
        this.drill = { active: true, done: false, queue: queue.slice(), i: 0, first: {}, again: {} };
        this.resetCard();
      },
      resetCard() {
        this.drillAnswer = ''; this.drillResult = null; this.drillHint = false;
        this.$nextTick(() => { const a = this.$refs.answer; if (a) a.focus(); });
      },
      checkCard() {
        if (!this.drillCard || this.drillResult) return;
        this.drillResult = checkAnswer(this.drillAnswer, this.drillCard.c.cmd, this.drillCard.exact);
        this.$nextTick(() => { const f = this.$refs.flash; if (f) f.focus(); });
      },
      gradeCard(ok) {
        const key = this.drill.queue[this.drill.i];
        const s = this.drillStats[key] || { ok: 0, miss: 0 };
        if (ok) { s.ok++; if (s.ok >= 2 && s.ok > s.miss) this.known[key] = true; }
        else {
          s.miss++; delete this.known[key];
          // see it again later in this session (once)
          if (!this.drill.again[key]) { this.drill.again[key] = true; this.drill.queue.splice(Math.min(this.drill.i + 4, this.drill.queue.length), 0, key); }
        }
        if (!(key in this.drill.first)) this.drill.first[key] = ok ? 'ok' : 'miss';
        this.drillStats[key] = s; this.saveState();
        this.advance();
      },
      skipCard() {
        const key = this.drill.queue[this.drill.i];
        if (!(key in this.drill.first)) this.drill.first[key] = 'skip';
        this.advance();
      },
      advance() {
        if (this.drill.i + 1 >= this.drill.queue.length) { this.endDrill(); return; }
        this.drill.i++; this.resetCard();
      },
      endDrill() { this.drill.active = false; this.drill.done = true; this.drillResult = null; window.scrollTo(0, 0); },
      drillKeys(e) {
        if (!this.drill.active || !this.drillResult) return;
        if (e.key === 'Enter') { e.preventDefault(); this.gradeCard(this.drillSuggest === 'ok'); }
        else if (e.key === '1') this.gradeCard(true);
        else if (e.key === '2') this.gradeCard(false);
      },

      // mock exam
      startMock() {
        const count = this.mockCfg.count;
        const pickFrom = list => {
          const fresh = shuffle(list.filter(x => !this.mastered[x.task.id]));
          const done = shuffle(list.filter(x => this.mastered[x.task.id]));
          return this.mockCfg.unmasteredFirst ? fresh.concat(done) : shuffle(list);
        };
        // allocate slots by domain weight (largest remainder)
        const alloc = this.domains.map(d => ({ d, exact: d.weight / 100 * count }));
        alloc.forEach(a => { a.n = Math.floor(a.exact); });
        let left = count - alloc.reduce((s, a) => s + a.n, 0);
        alloc.slice().sort((a, b) => (b.exact - b.n) - (a.exact - a.n)).forEach(a => { if (left > 0) { a.n++; left--; } });
        let chosen = [];
        alloc.forEach(a => { chosen = chosen.concat(pickFrom(this.domainTasks(a.d.name)).slice(0, a.n)); });
        if (chosen.length < count) chosen = chosen.concat(pickFrom(this.allTasks.filter(x => !chosen.includes(x))).slice(0, count - chosen.length));
        chosen = shuffle(chosen);
        // task weights: domain weight split across that domain's picked tasks, rounded to sum 100
        const weights = {};
        const byDomain = {};
        chosen.forEach(x => { (byDomain[x.domain] = byDomain[x.domain] || []).push(x); });
        const totalW = Object.keys(byDomain).reduce((s, d) => s + this.domains.find(x => x.name === d).weight, 0);
        let sum = 0;
        chosen.forEach(x => { const w = Math.max(1, Math.round(this.domains.find(d => d.name === x.domain).weight / totalW * 100 / byDomain[x.domain].length)); weights[x.task.id] = w; sum += w; });
        if (chosen.length) weights[chosen[0].task.id] += 100 - sum;
        const start = Date.now();
        this.mock = { active: true, finished: false, tasks: chosen.map(x => x.task.id), weights, solved: {}, start, end: start + this.mockCfg.minutes * 60000 };
        this.revealed = {};
        this.saveMock();
      },
      saveMock() { localStorage.setItem(MOCK_KEY, JSON.stringify(this.mock)); },
      finishMock() {
        if (!this.mock.active) return;
        const used = Math.round((Math.min(Date.now(), this.mock.end) - this.mock.start) / 60000);
        this.mockHistory.push({ date: Date.now(), total: this.mock.tasks.length, solved: this.mockSolvedCount, score: this.mockScore, used });
        this.mock.active = false; this.mock.finished = true;
        this.saveMock(); this.saveState();
        window.scrollTo(0, 0);
      },
      resetMock() { this.mock = { active: false, finished: false, tasks: [], weights: {}, solved: {}, start: 0, end: 0 }; this.saveMock(); },
    },
    mounted() {
      window.addEventListener('hashchange', () => { this.route = parseRoute(); this.query = ''; });
      if (this.route.view === 'topic' && !this.topicById(this.route.id)) location.hash = '#/';
      this._tick = setInterval(() => {
        this.now = Date.now();
        if (this.mock.active && this.remaining === 0) { this.finishMock(); this.notify('Time is up'); }
      }, 1000);
      document.addEventListener('keydown', e => {
        if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); this.$refs.search.focus(); }
      });
    },
  }).mount('#cka');
})();
