// ================================================================
//  MEMORY MATCH — gioco di test per PewPlay
//  Gioco indipendente: funziona da solo, dentro PewPlay o altrove.
// ================================================================

const GAME_ID = 'memory-match'; // prefisso delle chiavi localStorage (= nome del repo)

const T = {
  title: 'Memory Match', moves: 'Moves', time: 'Time', best: 'Best', restart: 'New game',
  won: 'You did it!', again: 'Play again',
  levels: { easy: 'Easy', normal: 'Normal', hard: 'Hard' },
  result: (m, t, record) => `${m} moves in ${t}${record ? '\nNew record!' : ''}`,
  cardLabel: n => `Card ${n}`,
};
document.querySelectorAll('[data-t]').forEach(el => { el.textContent = T[el.dataset.t]; });

const storage = {
  get: (k, d) => { try { const v = localStorage.getItem(`${GAME_ID}:${k}`); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(`${GAME_ID}:${k}`, JSON.stringify(v)); } catch { /* ignorato */ } },
};

const LEVELS = {
  easy: { cols: 4, rows: 3 },
  normal: { cols: 4, rows: 4 },
  hard: { cols: 5, rows: 4 },
};
const SYMBOLS = ['🍎', '🍋', '🍇', '🍉', '🍒', '🥝', '🍑', '🍍', '🥥', '🫐', '🥕', '🌽'];

// ── STATO ─────────────────────────────────────────
let level = storage.get('level', 'normal');
if (!LEVELS[level]) level = 'normal';
let cards = [];       // { symbol, el, done }
let open = [];        // carte scoperte in questo turno (max 2)
let moves = 0;
let matched = 0;
let seconds = 0;
let timer = null;
let busy = false;

const board = document.getElementById('board');
const $moves = document.getElementById('moves');
const $time = document.getElementById('time');
const $best = document.getElementById('best');
const win = document.getElementById('win');

const fmtTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── LIVELLI ───────────────────────────────────────
const levelsEl = document.getElementById('levels');
for (const key of Object.keys(LEVELS)) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'level';
  b.setAttribute('role', 'radio');
  b.dataset.level = key;
  b.textContent = T.levels[key];
  b.addEventListener('click', () => { level = key; storage.set('level', level); newGame(); });
  levelsEl.appendChild(b);
}

// ── DIMENSIONE CARTE ──────────────────────────────
function layout() {
  const { cols, rows } = LEVELS[level];
  const rect = board.getBoundingClientRect();
  const gap = Math.max(6, Math.min(12, Math.min(innerWidth, innerHeight) * 0.015));
  const size = Math.floor(Math.min((rect.width - gap * (cols - 1)) / cols, (rect.height - gap * (rows - 1)) / rows, 130));
  board.style.setProperty('--cols', cols);
  board.style.setProperty('--size', `${Math.max(40, size)}px`);
}
window.addEventListener('resize', layout);

// ── TIMER (si ferma se la scheda non è visibile) ──
function startTimer() {
  if (timer) return;
  timer = setInterval(() => { seconds++; $time.textContent = fmtTime(seconds); }, 1000);
}
function stopTimer() { clearInterval(timer); timer = null; }
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopTimer();
  else if (moves > 0 && matched < cards.length) startTimer();
});

// ── PARTITA ───────────────────────────────────────
function showBest() {
  const b = storage.get(`best-${level}`, null);
  $best.textContent = b ? `${b.moves} · ${fmtTime(b.seconds)}` : '—';
}

function newGame() {
  stopTimer();
  win.classList.add('hidden');
  moves = 0; matched = 0; seconds = 0; open = []; busy = false;
  $moves.textContent = '0';
  $time.textContent = fmtTime(0);
  levelsEl.querySelectorAll('.level').forEach(b => b.setAttribute('aria-checked', String(b.dataset.level === level)));
  showBest();

  const { cols, rows } = LEVELS[level];
  const pairs = (cols * rows) / 2;
  const symbols = shuffle(shuffle([...SYMBOLS]).slice(0, pairs).flatMap(s => [s, s]));
  board.innerHTML = '';
  cards = symbols.map((symbol, i) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'card';
    el.setAttribute('aria-label', T.cardLabel(i + 1));
    el.innerHTML = `<span class="card__inner"><span class="card__side card__back"></span><span class="card__side card__face" aria-hidden="true">${symbol}</span></span>`;
    const card = { symbol, el, done: false };
    el.addEventListener('click', () => flip(card));
    board.appendChild(el);
    return card;
  });
  layout();
}

function flip(card) {
  if (busy || card.done || open.includes(card)) return;
  startTimer();
  card.el.classList.add('is-open');
  card.el.setAttribute('aria-label', card.symbol);
  open.push(card);
  if (open.length < 2) return;

  moves++;
  $moves.textContent = String(moves);
  const [a, b] = open;
  if (a.symbol === b.symbol) {
    a.done = b.done = true;
    a.el.classList.add('is-done');
    b.el.classList.add('is-done');
    open = [];
    matched += 2;
    if (matched === cards.length) setTimeout(finish, 450);
  } else {
    busy = true;
    setTimeout(() => {
      for (const c of [a, b]) {
        c.el.classList.remove('is-open');
        c.el.setAttribute('aria-label', T.cardLabel(cards.indexOf(c) + 1));
      }
      open = [];
      busy = false;
    }, 750);
  }
}

function finish() {
  stopTimer();
  const prev = storage.get(`best-${level}`, null);
  const record = !prev || moves < prev.moves || (moves === prev.moves && seconds < prev.seconds);
  if (record) storage.set(`best-${level}`, { moves, seconds });
  showBest();
  document.getElementById('win-text').textContent = T.result(moves, fmtTime(seconds), record);
  win.classList.remove('hidden');
  document.getElementById('again').focus();
}

document.getElementById('restart').addEventListener('click', newGame);
document.getElementById('again').addEventListener('click', newGame);
document.addEventListener('keydown', e => { if (e.key === 'r' || e.key === 'R') newGame(); });

newGame();
