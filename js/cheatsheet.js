/* SAA-C03 cheatsheet: Vue 3 app (CDN build, no build step).
 *
 * Data comes from cheatsheet-data.js (sections) and services.js (service directory).
 * At load time every table cell / callout is "annotated" once:
 *   - service names become hoverable links (.sref) to their directory card
 *   - constraint words, numbers/limits and negations get highlight classes
 * Search highlighting is applied on top at render time.
 */
(function () {
  'use strict';

  var TYPES = window.CS_TYPES;
  var CATS = window.CS_CATEGORIES;
  var SERVICES = window.CS_SERVICES;
  var SECTIONS = window.CS_SECTIONS;
  var STORE_KEY = 'cs.v2';

  /* ------------------------------------------------------------------ */
  /* Helpers                                                             */
  /* ------------------------------------------------------------------ */

  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function stripTags(h) {
    return h.replace(/<[^>]+>/g, ' ')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ').trim();
  }
  function hash(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  /* Apply fn to every text run of an HTML snippet that is not inside
     <code>, <a> or <span> (pills, already-linked services). */
  function mapText(html, fn) {
    var out = '', depth = 0, re = /<\/?([a-z0-9]+)[^>]*>|[^<]+/gi, m;
    while ((m = re.exec(html))) {
      var tok = m[0];
      if (m[1]) {
        var tag = m[1].toLowerCase();
        if (tag === 'code' || tag === 'a' || tag === 'span' || tag === 'mark') {
          depth += tok.charAt(1) === '/' ? -1 : 1;
        }
        out += tok;
      } else {
        out += depth > 0 ? tok : fn(tok);
      }
    }
    return out;
  }

  /* Same, but descends into spans too (for search marks). */
  function mapAllText(html, fn) {
    return html.replace(/(^|>)([^<]+)/g, function (_, p, t) { return p + fn(t); });
  }

  /* ------------------------------------------------------------------ */
  /* Service index + auto-linking                                       */
  /* ------------------------------------------------------------------ */

  var catByKey = {};
  CATS.forEach(function (c) { catByKey[c.key] = c; });

  var aliasList = [];
  SERVICES.forEach(function (s, i) {
    s.id = 's' + i;
    s.short = (s.a && s.a[0] && s.a[0].indexOf('re:') !== 0) ? s.a[0] : s.n;
    s.search = [s.n, s.u, s.d, s.k || '', (s.a || []).join(' '), catByKey[s.c].label, TYPES[s.t].label, s.v || '']
      .join(' ').toLowerCase();
    (s.a || [s.n]).forEach(function (a) {
      if (a.indexOf('re:') === 0) aliasList.push({ src: a.slice(3), len: 3, svc: s });
      else aliasList.push({ src: '\\b' + escRe(a) + '(?![\\w@-])', len: a.length, svc: s });
    });
  });
  aliasList.sort(function (a, b) { return b.len - a.len; });

  var svcRe = new RegExp(aliasList.map(function (a) { return '(' + a.src + ')'; }).join('|'), 'g');
  var byId = {};
  SERVICES.forEach(function (s) { byId[s.id] = s; });

  function svcForMatch(m) {
    for (var i = 1; i < m.length; i++) if (m[i] !== undefined) return aliasList[i - 1].svc;
    return null;
  }

  /* Service that a cell *starts* with (for the badge next to row titles). */
  function leadingService(html) {
    var text = stripTags(html);
    svcRe.lastIndex = 0;
    var m = svcRe.exec(text);
    return m && m.index === 0 ? svcForMatch(m) : null;
  }

  function linkServices(html) {
    var seen = {};
    return mapText(html, function (text) {
      svcRe.lastIndex = 0;
      return text.replace(svcRe, function () {
        var args = Array.prototype.slice.call(arguments, 0, aliasList.length + 1);
        var s = svcForMatch(args);
        if (!s || seen[s.id]) return args[0];
        seen[s.id] = true;
        return '<span class="sref" data-svc="' + s.id + '">' + args[0] + '</span>';
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Keyword highlights                                                  */
  /* ------------------------------------------------------------------ */

  var CONSTRAINTS = [
    'most cost-effective', 'cost-effective', 'cheapest', 'lowest cost', 'least expensive',
    'least operational overhead', 'operational overhead', 'least overhead', 'least effort',
    'most secure', 'least privilege', 'highly available', 'high availability', 'highest availability',
    'fault[- ]tolerant', 'lowest latency', 'low latency', 'minimal (?:application |code )?changes?',
    'minimal code change', 'no code changes?', 'minimal downtime', 'no data loss', 'real[- ]time',
    'near real[- ]time', 'serverless', 'exactly[- ]once', 'decouple', 'durable', 'scalable',
  ];
  var conRe = new RegExp('\\b(?:' + CONSTRAINTS.join('|') + ')\\b', 'gi');

  var UNITS = 'ms|µs|s|sec|seconds?|min|mins|minutes?|h|hrs?|hours?|d|days?|weeks?|months?|years?|yr|' +
    'KB|MB|GB|TB|PB|KiB|MiB|GiB|TiB|Gbps|Mbps|IOPS|ACUs?|AZs?|Regions?|copies|replicas|partitions|nines|rps|req/s|msg/s|connections';
  var numRe = new RegExp(
    '(?:\\$\\d[\\d,.]*(?:\\s?[–-]\\s?\\$?[\\d.]+)?(?:/(?:GB|hr|h))?)' +        // $0.023, $0.045/hr
    '|(?:\\b\\d[\\d,.]*(?:\\s?[–-]\\s?\\d[\\d,.]*)?\\s?(?:%|×)(?=\\W|$))' +   // 72%, 10×
    '|(?:\\b\\d[\\d,.]*(?:\\s?[–-]\\s?\\d[\\d,.]*)?\\s?(?:' + UNITS + ')\\b)' + // 15 min, 400 KB
    '|(?:\\b\\d{1,3}(?:,\\d{3})+\\b)',                                        // 3,500
    'g');
  var negRe = /\b(?:never|not|can't|cannot|can’t|doesn't|don't|won't|isn't|aren't|no longer|only)\b/gi;

  function highlightKeywords(html) {
    html = mapText(html, function (t) { return t.replace(conRe, '<span class="hl-con">$&</span>'); });
    html = mapText(html, function (t) { return t.replace(numRe, '<span class="hl-num">$&</span>'); });
    html = mapText(html, function (t) { return t.replace(negRe, '<span class="hl-neg">$&</span>'); });
    html = mapText(html, function (t) { return t.replace(/→|⇒|↔/g, '<span class="hl-arrow">$&</span>'); });
    return html;
  }

  function annotate(html) { return highlightKeywords(linkServices(html)); }

  /* ------------------------------------------------------------------ */
  /* Prepare sections once                                               */
  /* ------------------------------------------------------------------ */

  var GROUP_ORDER = ['Exam strategy', 'Service deep dives', 'Quick reference'];

  var sections = SECTIONS.map(function (s) {
    var sec = { num: s.num, id: 'sec-' + s.num, title: s.title, group: s.group, blocks: [], rowCount: 0 };
    sec.blocks = s.blocks.map(function (b, bi) {
      var o = { t: b.t, key: s.num + '-' + bi };
      if (b.t === 'note' || b.t === 'h3') o.html = b.html || b.text;
      if (b.t === 'callout') {
        o.tip = b.tip;
        o.paras = b.paras.map(annotate);
        o.text = stripTags(b.paras.join(' ')).toLowerCase();
      }
      if (b.t === 'table') {
        o.cols = b.cols;
        o.kinds = b.kinds;
        o.rows = b.rows.map(function (r) {
          var plain = r.map(stripTags).join(' | ');
          return {
            id: 'r' + hash(s.num + '|' + stripTags(r[0])),
            cells: r.map(annotate),
            lead: leadingService(r[0]),
            text: plain.toLowerCase(),
          };
        });
        sec.rowCount += o.rows.length;
      }
      return o;
    });
    if (s.blocks.some(function (b) { return b.t === 'directory'; })) sec.rowCount = SERVICES.length;
    return sec;
  });

  var intro = window.CS_INTRO.map(annotate);

  /* ------------------------------------------------------------------ */
  /* Persistence                                                         */
  /* ------------------------------------------------------------------ */

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }
  var saved = load();

  /* ------------------------------------------------------------------ */
  /* App                                                                 */
  /* ------------------------------------------------------------------ */

  var app = Vue.createApp({
    data: function () {
      return {
        sections: sections,
        intro: intro,
        cats: CATS,
        types: TYPES,
        typeKeys: Object.keys(TYPES),
        services: SERVICES,
        query: '',
        theme: saved.theme || 'dark',
        read: saved.read || {},
        flags: saved.flags || {},
        collapsed: saved.collapsed || {},
        flaggedOnly: false,
        hl: saved.hl !== false,
        dirCat: saved.dirCat || 'all',
        dirType: saved.dirType || 'all',
        dirHideOut: !!saved.dirHideOut,
        activeId: 'sec-0',
        tip: null,          // { svc, x, y, above }
        modal: null,        // service shown in the modal
        navOpen: false,
        linksOpen: false,
        showTop: false,
        cloudfrontId: SERVICES.filter(function (s) { return s.n === 'Amazon CloudFront'; })[0].id,
      };
    },

    computed: {
      terms: function () {
        return this.query.toLowerCase().split(/\s+/).filter(Boolean);
      },
      searching: function () { return this.terms.length > 0 || this.flaggedOnly; },

      /* Sections after search / flag filtering. */
      view: function () {
        var self = this, terms = this.terms;
        function match(text) {
          for (var i = 0; i < terms.length; i++) if (text.indexOf(terms[i]) === -1) return false;
          return true;
        }
        return this.sections.map(function (s) {
          var shown = 0;
          var blocks = s.blocks.map(function (b) {
            if (b.t === 'table') {
              var rows = b.rows.filter(function (r) {
                return (!self.flaggedOnly || self.flags[r.id]) && match(r.text);
              });
              shown += rows.length;
              return { t: 'table', key: b.key, cols: b.cols, kinds: b.kinds, rows: rows, empty: !rows.length };
            }
            if (b.t === 'directory') {
              var n = self.dirFiltered.length;
              shown += self.searching ? n : 0;
              return { t: 'directory', key: b.key, empty: self.searching && !n };
            }
            if (!self.searching) return b;
            if (b.t === 'callout' && !self.flaggedOnly && match(b.text)) return b;
            return { t: b.t, key: b.key, empty: true, html: b.html };
          });
          // While searching, an h3 only shows if the table after it has rows.
          if (self.searching) {
            blocks.forEach(function (b, i) {
              if (b.t === 'h3') {
                var next = blocks[i + 1];
                b.empty = !(next && next.t === 'table' && !next.empty);
              }
            });
          }
          return {
            src: s, id: s.id, num: s.num, title: s.title, group: s.group,
            blocks: blocks, shown: shown,
            hidden: self.searching && shown === 0 && !blocks.some(function (b) { return b.t === 'callout' && !b.empty; }),
          };
        });
      },

      groups: function () {
        var self = this;
        return GROUP_ORDER.map(function (g) {
          return { name: g, items: self.view.filter(function (s) { return s.group === g; }) };
        });
      },

      totalRows: function () {
        return this.sections.reduce(function (n, s) { return n + s.rowCount; }, 0);
      },
      shownRows: function () {
        return this.view.reduce(function (n, s) { return n + s.shown; }, 0);
      },
      readCount: function () {
        var self = this;
        return this.sections.filter(function (s) { return self.read[s.id]; }).length;
      },
      flagCount: function () { return Object.keys(this.flags).length; },
      allCollapsed: function () {
        var self = this;
        return this.sections.every(function (s) { return self.collapsed[s.id]; });
      },

      /* Service directory */
      dirFiltered: function () {
        var self = this, terms = this.terms;
        return this.services.filter(function (s) {
          if (self.dirCat !== 'all' && s.c !== self.dirCat) return false;
          if (self.dirType !== 'all' && s.t !== self.dirType) return false;
          if (self.dirHideOut && s.s) return false;
          if (self.flaggedOnly && !self.flags[s.id]) return false;
          for (var i = 0; i < terms.length; i++) if (s.search.indexOf(terms[i]) === -1) return false;
          return true;
        });
      },
      dirGroups: function () {
        var list = this.dirFiltered;
        return this.cats.map(function (c) {
          return { cat: c, items: list.filter(function (s) { return s.c === c.key; }) };
        }).filter(function (g) { return g.items.length; });
      },
      catCounts: function () {
        var counts = { all: this.services.length };
        this.services.forEach(function (s) { counts[s.c] = (counts[s.c] || 0) + 1; });
        return counts;
      },
      typeCounts: function () {
        var counts = {};
        this.services.forEach(function (s) { counts[s.t] = (counts[s.t] || 0) + 1; });
        return counts;
      },
    },

    watch: {
      theme: function () { this.applyTheme(); this.persist(); },
      hl: function () { this.persist(); },
      dirCat: function () { this.persist(); },
      dirType: function () { this.persist(); },
      dirHideOut: function () { this.persist(); },
      query: function () { this.tip = null; },
    },

    methods: {
      persist: function () {
        localStorage.setItem(STORE_KEY, JSON.stringify({
          theme: this.theme, read: this.read, flags: this.flags, collapsed: this.collapsed, hl: this.hl,
          dirCat: this.dirCat, dirType: this.dirType, dirHideOut: this.dirHideOut,
        }));
      },
      applyTheme: function () {
        document.documentElement.setAttribute('data-theme', this.theme);
      },

      /* Search marks on top of the pre-annotated HTML. */
      mark: function (html) {
        if (!this.terms.length) return html;
        var re = new RegExp('(' + this.terms.map(escRe).join('|') + ')', 'gi');
        return mapAllText(html, function (t) { return t.replace(re, '<mark>$1</mark>'); });
      },
      markText: function (text) {
        var esc = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;');
        return this.mark(esc);
      },

      toggle: function (map, id) {
        if (map[id]) delete map[id]; else map[id] = 1;
        this.persist();
      },
      toggleRead: function (s) { this.toggle(this.read, s.id); },
      toggleFlag: function (id) { this.toggle(this.flags, id); },
      toggleSection: function (s) {
        if (this.searching) return;
        this.toggle(this.collapsed, s.id);
      },
      isOpen: function (s) { return this.searching || !this.collapsed[s.id]; },
      toggleAll: function () {
        var collapse = !this.allCollapsed, self = this;
        this.sections.forEach(function (s) {
          if (collapse) self.collapsed[s.id] = 1; else delete self.collapsed[s.id];
        });
        this.persist();
      },
      resetProgress: function () {
        if (!confirm('Clear read marks and flagged rows?')) return;
        this.read = {}; this.flags = {}; this.flaggedOnly = false;
        this.persist();
      },

      go: function (id) {
        this.navOpen = false;
        if (this.collapsed[id] && !this.searching) { delete this.collapsed[id]; this.persist(); }
        var self = this;
        this.$nextTick(function () {
          var el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          self.activeId = id;
          history.replaceState(null, '', '#' + id);
        });
      },
      toTop: function () { window.scrollTo({ top: 0, behavior: 'smooth' }); },
      clearSearch: function () { this.query = ''; this.flaggedOnly = false; },
      searchFor: function (text) {
        this.modal = null;
        this.query = text;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      showInDirectory: function (s) {
        this.modal = null;
        this.query = '';
        this.dirCat = s.c; this.dirType = 'all';
        var self = this;
        this.$nextTick(function () {
          self.go('sec-18');
          setTimeout(function () {
            var el = document.getElementById('svc-' + s.id);
            if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('pulse'); setTimeout(function () { el.classList.remove('pulse'); }, 1600); }
          }, 450);
        });
      },
      cat: function (key) { return catByKey[key]; },
      svc: function (id) { return byId[id]; },
      scopeLabel: function (s) {
        return { out: 'Not in scope', legacy: 'Legacy', removed: 'Removed Oct 2026' }[s.s] || '';
      },

      /* Hover / click on .sref (event delegation) */
      onOver: function (e) {
        var el = e.target.closest && e.target.closest('.sref');
        if (!el) return;
        var r = el.getBoundingClientRect();
        var above = r.bottom + 200 > window.innerHeight;
        this.tip = {
          svc: byId[el.dataset.svc],
          x: Math.max(12, Math.min(r.left, window.innerWidth - 332)),
          y: above ? r.top - 8 : r.bottom + 8,
          above: above,
        };
      },
      onOut: function (e) {
        var el = e.target.closest && e.target.closest('.sref');
        if (el && !(e.relatedTarget && el.contains(e.relatedTarget))) this.tip = null;
      },
      onClick: function (e) {
        var el = e.target.closest && e.target.closest('.sref');
        if (!el) return;
        e.preventDefault();
        this.tip = null;
        this.modal = byId[el.dataset.svc];
      },

      onKey: function (e) {
        var inField = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
        if (e.key === '/' && !inField) { e.preventDefault(); this.$refs.search.focus(); this.$refs.search.select(); }
        else if (e.key === 'Escape') {
          if (this.modal) this.modal = null;
          else if (this.navOpen) this.navOpen = false;
          else if (this.query || this.flaggedOnly) this.clearSearch();
          if (inField) document.activeElement.blur();
        }
      },

      observe: function () {
        var self = this;
        if (this.io) this.io.disconnect();
        this.io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (en.isIntersecting) self.activeId = en.target.id; });
        }, { rootMargin: '-15% 0px -75% 0px' });
        document.querySelectorAll('.cs-section').forEach(function (el) { self.io.observe(el); });
      },
    },

    mounted: function () {
      var self = this;
      this.applyTheme();
      document.addEventListener('keydown', this.onKey);
      window.addEventListener('scroll', function () {
        self.showTop = window.scrollY > 900;
        if (self.tip) self.tip = null;
      }, { passive: true });
      this.observe();
      if (location.hash) {
        var id = location.hash.slice(1);
        setTimeout(function () { var el = document.getElementById(id); if (el) el.scrollIntoView(); }, 50);
      }
    },
  });

  app.mount('#app');
})();
