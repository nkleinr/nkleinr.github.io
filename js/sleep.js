const STORAGE_KEY = 'unlockfitness_sleep_hours_html_v1';

const HOURS_OPTIONS = [
  { label: '<5 h 😫', value: 4.5 },
  { label: '5–6 h 🙁', value: 5.5 },
  { label: '6–7 h 🙂', value: 6.5 },
  { label: '7–8 h 😊', value: 7.5 },
  { label: '8–9 h 😴', value: 8.5 },
  { label: '>9 h 💤', value: 9.5 },
];

const $ = (id) => document.getElementById(id);
const todayISO = () => { const d = new Date(); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); };
const ymd = (d) => { d = new Date(d); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); };
const avg = (a) => a.length ? a.reduce((x,y)=>x+y,0)/a.length : 0;
const stddev = (a) => { if (a.length <= 1) return 0; const m = avg(a); return Math.sqrt(avg(a.map(x => (x-m)**2))); };

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function save(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  catch {}
}

function upsert(entries, entry) {
  const others = entries.filter(e => e.date !== entry.date);
  return [...others, entry].sort((a,b) => a.date < b.date ? -1 : 1);
}

function computeStreak(sorted) {
  if (!sorted.length) return 0;
  let streak = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const d1 = new Date(sorted[i].date);
    const d0 = new Date(sorted[i-1].date);
    const diff = Math.round((d1 - d0) / (1000*60*60*24));
    if (diff === 1) streak++;
    else if (diff > 1) break;
  }
  return streak;
}

// DOM refs
const dateInput   = $('date');
const hourButtons = $('hourButtons');
const saveBtn     = $('save');
const clearAllBtn = $('clearAll');
const tbody       = $('tbody');
const tableEl     = $('table');
const emptyEl     = $('empty');
const feedbackEl  = $('feedback');
const avgEl       = $('avg');
const sdEl        = $('sd');
const streakEl    = $('streak');
const chartEl     = $('chart');

let entries = load();
let form = { date: todayISO(), hours: HOURS_OPTIONS[3].value };

dateInput.value = form.date;

// Render hour buttons
function renderHourButtons() {
  hourButtons.innerHTML = '';
  HOURS_OPTIONS.forEach((opt) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn sleep-hour-btn' + (form.hours === opt.value ? ' active' : '');
    b.textContent = opt.label;
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', form.hours === opt.value ? 'true' : 'false');
    b.addEventListener('click', () => {
      form.hours = opt.value;
      renderHourButtons();
    });
    hourButtons.appendChild(b);
  });
}

renderHourButtons();

dateInput.addEventListener('change', (e) => {
  form.date = e.target.value;
  updateFeedback();
  renderChartAndStats();
});

saveBtn.addEventListener('click', () => {
  if (!form.date) {
    alert('Please select a date first.');
    return;
  }
  const entry = { id: crypto.randomUUID(), date: form.date, hours: Number(form.hours) };
  entries = upsert(entries, entry);
  save(entries);
  renderTable();
  renderChartAndStats();
  updateFeedback();
});

clearAllBtn.addEventListener('click', () => {
  if (confirm('Delete all sleep entries?')) {
    entries = [];
    save(entries);
    renderTable();
    renderChartAndStats();
    updateFeedback();
  }
});

function updateFeedback() {
  const y = new Date(form.date);
  y.setDate(y.getDate() - 1);
  const key = ymd(y);
  const yesterday = entries.find(e => e.date === key);

  if (!yesterday) {
    feedbackEl.textContent = 'Log yesterday to get feedback!';
    return;
  }

  const diff = form.hours - yesterday.hours;
  if (diff > 0.5) {
    feedbackEl.textContent = 'You slept longer than yesterday!';
  } else if (diff < -0.5) {
    feedbackEl.textContent = 'You slept less than yesterday. Aim for 7–9 hours.';
  } else {
    feedbackEl.textContent = 'About the same as yesterday. Keep it steady!';
  }
}

function renderTable() {
  if (!entries.length) {
    emptyEl.style.display = 'block';
    tableEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  tableEl.style.display = 'table';

  tbody.innerHTML = '';
  entries.forEach(e => {
    const tr = document.createElement('tr');

    const tdDate = document.createElement('td');
    tdDate.textContent = e.date;
    tr.appendChild(tdDate);

    const tdHours = document.createElement('td');
    tdHours.textContent = e.hours + ' h';
    tr.appendChild(tdHours);

    const tdAct = document.createElement('td');
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.className = 'del';
    del.addEventListener('click', () => {
      entries = entries.filter(x => x.id !== e.id);
      save(entries);
      renderTable();
      renderChartAndStats();
      updateFeedback();
    });
    tdAct.appendChild(del);
    tr.appendChild(tdAct);

    tbody.appendChild(tr);
  });
}

function renderChartAndStats() {
  const byDate = new Map(entries.map(e => [e.date, e]));

  const base = form.date ? new Date(form.date) : new Date();
  const last7 = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const key = ymd(d);
    const found = byDate.get(key);
    last7.push({ label: key.slice(5), hours: found ? found.hours : 0 });
  }

  const hoursAll = entries.map(e => e.hours);
  const mean = +(avg(hoursAll).toFixed(1));
  const sd = +(stddev(hoursAll).toFixed(1));
  const streak = computeStreak(entries);

  avgEl.textContent    = (isNaN(mean)   ? 0 : mean)   + ' h';
  sdEl.textContent     = (isNaN(sd)     ? 0 : sd)     + ' h sd';
  streakEl.textContent = (isNaN(streak) ? 0 : streak) + 'd';

  const W = 600, H = 260, padL = 40, padR = 10, padB = 28, padT = 10;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxH = 10;
  const barW = (chartW / last7.length) * 0.6;
  const gap  = (chartW / last7.length) * 0.4;

  const yScale = (h) => chartH - (h / maxH) * chartH;

  let svg = '';
  svg += `<rect x="0" y="0" width="${W}" height="${H}" fill="transparent"/>`;

  for (let v = 0; v <= 10; v += 2) {
    const y = padT + yScale(v);
    svg += `<line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`;
    svg += `<text x="${padL-8}" y="${y+4}" font-size="11" fill="#6b7280" text-anchor="end">${v}</text>`;
  }

  const y8 = padT + yScale(8);
  svg += `<line x1="${padL}" y1="${y8}" x2="${W-padR}" y2="${y8}" stroke="#22c55e" stroke-width="2" stroke-dasharray="4 3"/>`;

  last7.forEach((d, i) => {
    const x = padL + i * (barW + gap) + gap / 2;
    const h = (d.hours / maxH) * chartH;
    const y = padT + (chartH - h);

    svg += `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="6" fill="#2563eb"/>`;
    svg += `<text x="${x+barW/2}" y="${H-8}" font-size="11" fill="#6b7280" text-anchor="middle">${d.label}</text>`;
  });

  chartEl.innerHTML = svg;
}

// initial render
renderTable();
renderChartAndStats();
updateFeedback();
