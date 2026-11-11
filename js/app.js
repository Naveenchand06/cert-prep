// AWS SAA practice exam.
//
// Question selection avoids repeats across sessions: every question gets a
// stable id (hashed from its text) and the app records how many times you have
// been served it. A new session always draws from the least-seen questions
// first, so you cycle through the entire (filtered) bank before anything
// repeats.

const SEEN_KEY = "saa-seen-v1";
const HISTORY_KEY = "saa-history";

const state = {
  questions: [],   // selected questions for this session (with shuffled options)
  answers: [],     // per question: Set of selected option indexes
  current: 0,
  startedAt: null,
  timerId: null,
  timed: false,
  deadline: null,
  timeExpired: false,
  flags: new Set(),
  count: 10,
  topics: new Set(),   // empty = all topics
};

const $ = (id) => document.getElementById(id);
const screens = { start: $("screen-start"), exam: $("screen-exam"), "flag-review": $("screen-flag-review"), results: $("screen-results") };

function showScreen(name) {
  Object.entries(screens).forEach(([k, el]) => (el.hidden = k !== name));
  window.scrollTo(0, 0);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch (_) {
    return fallback;
  }
}

// Stable id for a question, derived from its text (FNV-1a style hash).
function questionId(q) {
  const str = q.question;
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

QUESTION_BANK.forEach((q) => { q.id = questionId(q); });

// ---------- Seen tracking ----------
function getSeen() {
  return readJSON(SEEN_KEY, {});
}

function recordSeen(questions) {
  const seen = getSeen();
  questions.forEach((q) => { seen[q.id] = (seen[q.id] || 0) + 1; });
  localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
}

function filteredPool() {
  if (state.topics.size === 0) return QUESTION_BANK;
  return QUESTION_BANK.filter((q) => state.topics.has(q.topic));
}

// Draw `n` questions, preferring ones seen the fewest times. Within a
// seen-count tier the order is random, so sessions still feel fresh.
function drawQuestions(pool, n) {
  const seen = getSeen();
  const tiers = new Map();
  pool.forEach((q) => {
    const c = seen[q.id] || 0;
    if (!tiers.has(c)) tiers.set(c, []);
    tiers.get(c).push(q);
  });
  const picked = [];
  [...tiers.keys()].sort((a, b) => a - b).forEach((c) => {
    if (picked.length >= n) return;
    picked.push(...shuffle(tiers.get(c)).slice(0, n - picked.length));
  });
  return shuffle(picked);
}

// ---------- Start screen ----------
const COUNT_CHOICES = [5, 10, 15, 25, 50];

function renderTopics() {
  const wrap = $("topic-options");
  wrap.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.className = "topic-btn all" + (state.topics.size === 0 ? " selected" : "");
  allBtn.textContent = `All topics (${QUESTION_BANK.length})`;
  allBtn.onclick = () => { state.topics.clear(); renderStart(); };
  wrap.appendChild(allBtn);

  TOPICS.forEach((topic) => {
    const n = QUESTION_BANK.filter((q) => q.topic === topic).length;
    if (n === 0) return;
    const btn = document.createElement("button");
    btn.className = "topic-btn" + (state.topics.has(topic) ? " selected" : "");
    btn.innerHTML = `${topic} <span class="topic-count">${n}</span>`;
    btn.onclick = () => {
      if (state.topics.has(topic)) state.topics.delete(topic);
      else state.topics.add(topic);
      renderStart();
    };
    wrap.appendChild(btn);
  });
}

function renderCounts() {
  const poolSize = filteredPool().length;
  const wrap = $("count-options");
  wrap.innerHTML = "";

  const choices = COUNT_CHOICES.filter((n) => n < poolSize);
  choices.push(poolSize); // always offer the whole filtered pool

  if (!choices.includes(state.count)) state.count = choices[Math.min(1, choices.length - 1)];

  choices.forEach((n) => {
    const btn = document.createElement("button");
    btn.className = "count-btn" + (n === state.count ? " selected" : "");
    btn.textContent = n === poolSize ? `All (${n})` : String(n);
    btn.disabled = $("timed-mode").checked;
    btn.onclick = () => { state.count = n; renderCounts(); };
    wrap.appendChild(btn);
  });
  wrap.classList.toggle("disabled", $("timed-mode").checked);
}

function renderCoverage() {
  const seen = getSeen();
  const pool = filteredPool();
  const seenCount = pool.filter((q) => seen[q.id]).length;
  const pct = pool.length ? Math.round((seenCount / pool.length) * 100) : 0;
  $("coverage-fill").style.width = `${pct}%`;
  const scope = state.topics.size === 0 ? "the full bank" : "the selected topics";
  $("coverage-text").textContent =
    `You've been served ${seenCount} of ${pool.length} questions in ${scope} (${pct}%). ` +
    (seenCount >= pool.length && pool.length > 0
      ? "You've covered everything — questions will now start cycling again, least-seen first."
      : "New sessions draw unseen questions first.");
}

function renderPoolNote() {
  const pool = filteredPool();
  const label = state.topics.size === 0
    ? "all topics"
    : `${state.topics.size} topic${state.topics.size > 1 ? "s" : ""}`;
  const timed = $("timed-mode").checked;
  $("pool-note").textContent = timed
    ? `Timed mode draws 65 questions from the full bank (${QUESTION_BANK.length} available), with a 130-minute countdown.`
    : `Drawing ${state.count} question${state.count > 1 ? "s" : ""} from ${pool.length} available in ${label}.`;
  $("btn-start").disabled = timed ? QUESTION_BANK.length < 65 : pool.length === 0;
}

function renderStart() {
  renderTopics();
  renderCounts();
  renderPoolNote();
  renderCoverage();
  renderHistory();
}

function renderHistory() {
  const history = readJSON(HISTORY_KEY, []);
  const card = $("history-card");
  if (!history.length) { card.hidden = true; return; }
  card.hidden = false;
  $("history-list").innerHTML = history
    .slice(-5)
    .reverse()
    .map((h) => {
      const pct = Math.round((h.score / h.total) * 100);
      const cls = pct >= 72 ? "pass" : "fail";
      return `<li><span class="hist-score ${cls}">${pct}%</span> ${h.score}/${h.total} correct <span class="muted">· ${h.date}</span></li>`;
    })
    .join("");
}

function saveHistory(score, total) {
  const history = readJSON(HISTORY_KEY, []);
  history.push({ score, total, date: new Date().toLocaleString() });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-20)));
}

// ---------- Exam ----------
function startExam(questions = null) {
  const timed = !questions && $("timed-mode").checked;
  const pool = questions || (timed ? QUESTION_BANK : filteredPool());
  if (!pool.length) return;
  const count = questions ? questions.length : timed ? 65 : Math.min(state.count, pool.length);
  state.questions = (questions ? shuffle(pool) : drawQuestions(pool, count))
    .map((q) => ({ ...q, options: shuffle(q.options) }));
  if (!questions) recordSeen(state.questions);
  state.answers = state.questions.map(() => new Set());
  state.flags = new Set();
  state.current = 0;
  state.startedAt = Date.now();
  state.timed = timed;
  state.deadline = timed ? Date.now() + 130 * 60 * 1000 : null;
  state.timeExpired = false;
  state.timerId = setInterval(updateTimer, 1000);
  updateTimer();
  renderQuestion();
  showScreen("exam");
}

function updateTimer() {
  const secs = state.timed
    ? Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000))
    : Math.floor((Date.now() - state.startedAt) / 1000);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  $("exam-timer").textContent = `${mm}:${ss}`;
  $("exam-timer").classList.toggle("timer-warning", state.timed && secs <= 300);
  if (state.timed && secs === 0) { state.timeExpired = true; clearInterval(state.timerId); showFlagReviewOrResults(); }
}

function renderQuestion() {
  const q = state.questions[state.current];
  const selected = state.answers[state.current];
  const total = state.questions.length;

  $("exam-progress-text").textContent = `Question ${state.current + 1} of ${total}`;
  $("progress-fill").style.width = `${((state.current + 1) / total) * 100}%`;
  $("q-topic").textContent = q.topic;

  const typeTag = $("q-type");
  if (q.pick > 1) {
    typeTag.textContent = `Multiple response — choose ${q.pick === 2 ? "TWO" : q.pick}`;
    typeTag.className = "type-tag multi";
  } else {
    typeTag.textContent = "Single choice";
    typeTag.className = "type-tag";
  }

  $("q-text").textContent = q.question;
  $("q-hint").textContent = q.pick > 1
    ? `This question has ${q.pick} correct answers — select ${q.pick === 2 ? "TWO" : q.pick}.`
    : "Select one answer.";

  const wrap = $("q-options");
  wrap.innerHTML = "";
  q.options.forEach((opt, i) => {
    const div = document.createElement("div");
    div.className = "option" + (selected.has(i) ? " selected" : "");
    const marker = q.pick > 1 ? (selected.has(i) ? "☑" : "☐") : (selected.has(i) ? "●" : "○");
    div.innerHTML = `<span class="option-marker">${marker}</span><span>${opt.text}</span>`;
    div.onclick = () => toggleOption(i);
    wrap.appendChild(div);
  });

  $("btn-prev").disabled = state.current === 0;
  const flagButton = $("btn-flag");
  flagButton.setAttribute("aria-pressed", state.flags.has(state.current));
  flagButton.textContent = state.flags.has(state.current) ? "★ Flagged for review" : "☆ Flag for review";
  const isLast = state.current === total - 1;
  $("btn-next").hidden = isLast;
  $("btn-finish").hidden = !isLast;
}

function toggleOption(i) {
  if (state.timeExpired) return;
  const q = state.questions[state.current];
  const selected = state.answers[state.current];
  if (q.pick === 1) {
    selected.clear();
    selected.add(i);
  } else if (selected.has(i)) {
    selected.delete(i);
  } else {
    if (selected.size >= q.pick) {
      // Replace the oldest selection so the user never exceeds the limit.
      selected.delete(selected.values().next().value);
    }
    selected.add(i);
  }
  renderQuestion();
}

function requestFinish() {
  const unanswered = state.answers.filter((s) => s.size === 0).length;
  if (!unanswered) return showFlagReviewOrResults();
  $("finish-warning").textContent = `${unanswered} question${unanswered === 1 ? " is" : "s are"} unanswered and will be marked wrong.`;
  $("finish-dialog").hidden = false;
  $("btn-finish-anyway").focus();
}

function showFlagReviewOrResults() {
  const indexes = [...state.flags].sort((a, b) => a - b);
  if (!indexes.length) return finishExam();
  $("flagged-list").innerHTML = indexes.map((index) => {
    const q = state.questions[index];
    const status = state.answers[index].size ? "Answered" : "Unanswered";
    return `<div class="flag-review-row"><span><b>Q${index + 1} · ${q.topic}</b><br><span class="muted">${status} · ${q.question}</span></span><button class="btn btn-small" data-review="${index}">Review</button></div>`;
  }).join("");
  $("flagged-list").querySelectorAll("[data-review]").forEach((button) => button.onclick = () => {
    state.current = Number(button.dataset.review);
    renderQuestion();
    showScreen("exam");
  });
  showScreen("flag-review");
}

function finishExam() {
  $("finish-dialog").hidden = true;
  clearInterval(state.timerId);
  renderResults();
  showScreen("results");
}

// ---------- Results ----------
// Returns "correct" | "partial" | "incorrect".
// "partial" applies only to multiple-response questions where the selection
// includes at least one correct option but is not exactly the correct set
// (e.g., one right + one wrong, or only one of the two right answers).
function gradeQuestion(q, selected) {
  const correctIdx = q.options.map((o, i) => (o.correct ? i : -1)).filter((i) => i >= 0);
  const hits = [...selected].filter((i) => q.options[i].correct).length;
  const wrongPicks = selected.size - hits;
  if (hits === correctIdx.length && wrongPicks === 0) return "correct";
  if (q.pick > 1 && hits > 0) return "partial";
  return "incorrect";
}

function renderResults() {
  const total = state.questions.length;
  let score = 0;
  let partials = 0;
  const domainStats = {};
  const topicStats = {};

  const grades = state.questions.map((q, qi) => {
    const grade = gradeQuestion(q, state.answers[qi]);
    if (grade === "correct") score++;
    if (grade === "partial") partials++;
    [[domainStats, q.domain], [topicStats, q.topic]].forEach(([bucket, key]) => {
      bucket[key] = bucket[key] || { ok: 0, total: 0 };
      bucket[key].total++;
      if (grade === "correct") bucket[key].ok++;
    });
    return grade;
  });

  const pct = Math.round((score / total) * 100);
  const passed = pct >= 72; // real exam pass mark is ~720/1000
  $("score-headline").textContent = passed ? "Nice work — passing score! 🎉" : "Keep practicing — you'll get there.";
  $("score-big").textContent = `${pct}%`;
  $("score-big").className = "score-big " + (passed ? "pass" : "fail");
  const mins = Math.round((Date.now() - state.startedAt) / 60000);
  const wrong = total - score - partials;
  const parts = [`${score} correct`];
  if (partials) parts.push(`${partials} partially correct`);
  parts.push(`${wrong} incorrect`);
  $("score-detail").textContent =
    `${parts.join(" · ")} · ${mins < 1 ? "under a minute" : mins + " min"} · pass mark ≈ 72%` +
    (partials ? " (the real exam gives no credit for partial answers)" : "");

  const barRows = (stats) =>
    Object.entries(stats)
      .sort((a, b) => a[1].ok / a[1].total - b[1].ok / b[1].total)
      .map(([name, s]) => {
        const p = Math.round((s.ok / s.total) * 100);
        return `<div class="domain-row">
          <span class="domain-name">${name}</span>
          <div class="domain-bar"><div class="domain-bar-fill ${p >= 72 ? "pass" : "fail"}" style="width:${p}%"></div></div>
          <span class="domain-pct">${s.ok}/${s.total}</span>
        </div>`;
      })
      .join("");

  $("domain-breakdown").innerHTML =
    `<h3 class="breakdown-heading">By exam domain</h3>${barRows(domainStats)}` +
    `<h3 class="breakdown-heading">By topic (weakest first)</h3>${barRows(topicStats)}`;

  const VERDICT = {
    correct:   { cardCls: "ok",      verdictCls: "pass",    label: "Correct" },
    partial:   { cardCls: "partial", verdictCls: "partial", label: "Partially correct" },
    incorrect: { cardCls: "not-ok",  verdictCls: "fail",    label: "Incorrect" },
  };

  $("review-list").innerHTML = state.questions
    .map((q, qi) => {
      const selected = state.answers[qi];
      const v = VERDICT[grades[qi]];
      const multi = q.pick > 1;
      const optionsHtml = q.options
        .map((opt, oi) => {
          const chosen = selected.has(oi);
          let cls = "review-option";
          let badge = "";
          if (opt.correct && chosen) { cls += " right"; badge = "✔ Your answer — correct"; }
          else if (opt.correct) { cls += " right"; badge = multi ? "✔ Correct answer — you missed this" : "✔ Correct answer"; }
          else if (chosen) { cls += " wrong"; badge = "✘ Your answer — wrong"; }
          return `<div class="${cls}">
            <div class="review-option-text">${opt.text}${badge ? `<span class="badge">${badge}</span>` : ""}</div>
            <div class="review-why">${opt.why}</div>
          </div>`;
        })
        .join("");
      return `<div class="card review-card ${v.cardCls}">
        <div class="review-head">
          <span class="review-verdict ${v.verdictCls}">${v.label}</span>
          <span class="domain-tag">${q.topic}</span>
          ${multi ? `<span class="type-tag multi">Multiple response</span>` : ""}
        </div>
        <h3>Q${qi + 1}. ${q.question}</h3>
        ${optionsHtml}
      </div>`;
    })
    .join("");

  saveHistory(score, total);
  const retry = $("btn-retry-missed");
  retry.hidden = !grades.some((grade) => grade !== "correct");
  retry.onclick = () => {
    const missed = state.questions.filter((q, qi) => gradeQuestion(q, state.answers[qi]) !== "correct");
    startExam(missed);
  };
}

// ---------- Wire up ----------
$("btn-start").onclick = startExam;
$("btn-prev").onclick = () => { state.current--; renderQuestion(); };
$("btn-next").onclick = () => { state.current++; renderQuestion(); };
$("btn-finish").onclick = requestFinish;
$("btn-flag").onclick = () => {
  if (state.timeExpired) return;
  if (state.flags.has(state.current)) state.flags.delete(state.current);
  else state.flags.add(state.current);
  renderQuestion();
};
$("btn-finish-anyway").onclick = () => { $("finish-dialog").hidden = true; showFlagReviewOrResults(); };
$("btn-finish-cancel").onclick = () => { $("finish-dialog").hidden = true; $("btn-finish").focus(); };
$("btn-review-back").onclick = () => { renderQuestion(); showScreen("exam"); };
$("btn-review-finish").onclick = finishExam;
$("btn-restart").onclick = () => { renderStart(); showScreen("start"); };
$("timed-mode").onchange = () => { renderCounts(); renderPoolNote(); };
$("btn-reset-seen").onclick = () => {
  if (confirm("Reset which questions you've been served? Your score history is kept.")) {
    localStorage.removeItem(SEEN_KEY);
    renderStart();
  }
};

renderStart();
