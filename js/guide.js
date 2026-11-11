/* Study guide page:
   - collapsible sections (click a heading to expand / collapse)
   - filter rows by verdict (study / skim / drop)
*/
(function () {
  var guide = document.querySelector('.guide');
  var buttons = document.querySelectorAll('.filter-btn[data-filter]');
  var toggleAllBtn = document.getElementById('btn-toggle-all');
  var countEl = document.getElementById('filter-count');
  var rows = Array.prototype.slice.call(document.querySelectorAll('.guide-table tbody tr'));

  /* ---- 1. Group each <h2> with the content that follows it ---- */
  var sections = [];

  Array.prototype.slice.call(guide.children).forEach(function (node) {
    if (node.tagName === 'H2') {
      sections.push({ heading: node, nodes: [] });
    } else if (sections.length && !node.classList.contains('exam-nav')) {
      sections[sections.length - 1].nodes.push(node);
    }
  });

  sections.forEach(function (s) {
    s.body = document.createElement('div');
    s.body.className = 'section-body';
    guide.insertBefore(s.body, s.nodes[0] || s.heading.nextSibling);
    s.nodes.forEach(function (n) { s.body.appendChild(n); });

    s.rows = Array.prototype.slice.call(s.body.querySelectorAll('.guide-table tbody tr'));
    s.collapsed = false;

    s.heading.classList.add('collapsible');
    s.heading.setAttribute('role', 'button');
    s.heading.setAttribute('tabindex', '0');
    s.heading.setAttribute('aria-expanded', 'true');

    // Small counter badge so a collapsed section still tells you its size.
    if (s.rows.length) {
      var badge = document.createElement('span');
      badge.className = 'section-count';
      s.heading.appendChild(badge);
      s.badge = badge;
    }

    s.heading.addEventListener('click', function () { setCollapsed(s, !s.collapsed); });
    s.heading.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setCollapsed(s, !s.collapsed);
      }
    });
  });

  function setCollapsed(s, collapsed) {
    s.collapsed = collapsed;
    s.heading.classList.toggle('collapsed', collapsed);
    s.heading.setAttribute('aria-expanded', String(!collapsed));
    s.body.hidden = collapsed;
    syncToggleAllLabel();
  }

  function syncToggleAllLabel() {
    var anyOpen = sections.some(function (s) { return !s.collapsed && !s.heading.hidden; });
    toggleAllBtn.textContent = anyOpen ? 'Collapse all' : 'Expand all';
  }

  toggleAllBtn.addEventListener('click', function () {
    var collapse = toggleAllBtn.textContent === 'Collapse all';
    sections.forEach(function (s) { setCollapsed(s, collapse); });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---- 2. Verdict filter ---- */
  function apply(filter) {
    var shown = 0;

    rows.forEach(function (row) {
      var match = filter === 'all' || row.classList.contains(filter);
      row.hidden = !match;
      if (match) shown++;
    });

    sections.forEach(function (s) {
      if (!s.rows.length) return; // e.g. the "Suggested plan" section

      var visible = s.rows.filter(function (r) { return !r.hidden; }).length;
      var empty = visible === 0;

      s.heading.hidden = empty;
      s.body.hidden = empty || s.collapsed;
      if (s.badge) s.badge.textContent = visible + (filter === 'all' ? '' : ' of ' + s.rows.length);
    });

    countEl.textContent = filter === 'all'
      ? rows.length + ' topics'
      : shown + ' of ' + rows.length + ' topics';

    syncToggleAllLabel();
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      apply(btn.dataset.filter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  apply('all');
})();
