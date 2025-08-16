// Stays Dashboard frontend
const API = () => (window.CONFIG?.API_BASE_URL || '').replace(/\/$/, '');

// Helpers
const fmtPct = (v) => (v == null ? '--' : `${Math.round(v)}%`);
const fmtFrac = (a,b) => (a==null||b==null ? '--/--' : `${a}/${b}`);
const moneyBRL = (n) => {
  if (n==null || isNaN(n)) return '--';
  try { return n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
  catch { return `R$ ${Number(n).toFixed(2)}`; }
};
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// Build calendar days of current month
function buildDays() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-based
  const last = new Date(y, m+1, 0).getDate();
  const start = new Date(y, m, 1);
  const monthName = start.toLocaleDateString('pt-BR', { month: 'long', year:'numeric'});
  $('#cal-title').textContent = `Calendário — ${monthName}`;

  const strip = $('#cal-strip');
  strip.innerHTML = '';
  for (let d=1; d<=last; d++) {
    const dt = new Date(y, m, d);
    const dow = dt.toLocaleDateString('pt-BR',{ weekday:'short'}).toUpperCase().replace('.', '');
    const div = document.createElement('div');
    div.className = 'pill';
    div.dataset.date = dt.toISOString().slice(0,10);
    div.innerHTML = `<div class="num">${String(d).padStart(2,'0')}</div><div class="dow">${dow}</div>`;
    strip.appendChild(div);
  }
}

// Map API calendar payload to a simple structure
function normalizeCalendar(data) {
  // Try several formats. We aim at { days: [{date:'YYYY-MM-DD', reserved:bool, tooltip?:string}], stats:{...} }
  const out = { days: [], stats: {} };

  if (!data) return out;

  if (Array.isArray(data.days)) {
    out.days = data.days.map(d => ({
      date: d.date || d.data || d.dia || d.dt,
      reserved: ('reserved' in d) ? d.reserved : (!!d.ocupado || d.status==='booked' || d.color==='green'),
      tooltip: d.tooltip || d.info || d.label || ''
    }));
  } else if (Array.isArray(data)) {
    out.days = data.map(d => ({
      date: d.date || d.data || d.dia || d.dt,
      reserved: ('reserved' in d) ? d.reserved : (!!d.ocupado || d.status==='booked' || d.color==='green'),
      tooltip: d.tooltip || d.info || d.label || ''
    }));
  } else if (data.calendar && Array.isArray(data.calendar)) {
    out.days = data.calendar.map(d => ({
      date: d.date,
      reserved: !!d.reserved,
      tooltip: d.tooltip || ''
    }));
  }

  // Stats
  const s = data.stats || data.metricas || data.resumo || {};
  const parseFrac = (x) => {
    if (!x) return {a:null,b:null};
    if (typeof x === 'string' && x.includes('/')) {
      const [a,b] = x.split('/').map(Number);
      return {a,b};
    }
    if (typeof x === 'object' && ('a' in x || 'b' in x)) return x;
    return {a:null,b:null};
  };

  const ateHojeF = parseFrac(s.ateHojeFrac || s.ate_hoje_fracao || s.ateHoje || s.hoje);
  const futuroF = parseFrac(s.futuroFrac || s.futuro_fracao || s.futuro);
  const fechF = parseFrac(s.fechamentoFrac || s.fechamento_fracao || s.fechamento);

  out.stats = {
    ateHojePct: s.ateHojePct ?? s.ate_hoje_pct ?? s.hojePct ?? s.hoje ?? null,
    ateHojeA: ateHojeF.a, ateHojeB: ateHojeF.b,
    futuroPct: s.futuroPct ?? s.futuro_pct ?? null,
    futuroA: futuroF.a, futuroB: futuroF.b,
    fechamentoPct: s.fechamentoPct ?? s.fechamento_pct ?? null,
    fechamentoA: fechF.a, fechamentoB: fechF.b,
  };

  return out;
}

function applyCalendar(cal) {
  // Color pills
  const map = new Map(cal.days.map(d => [d.date, d]));
  $$('#cal-strip .pill').forEach(pill => {
    const dt = pill.dataset.date;
    const it = map.get(dt);
    pill.classList.remove('reserved','empty');
    if (it) {
      pill.classList.add(it.reserved ? 'reserved' : 'empty');
      if (it.tooltip) pill.title = it.tooltip;
    }
  });

  // Compute 🚨 for 3+ empty in a row from day 1 until today
  const todayISO = new Date().toISOString().slice(0,10);
  let streak = 0;
  $$('#cal-strip .pill').forEach(pill => {
    const date = pill.dataset.date;
    // remove old siren
    pill.querySelector('.siren')?.remove();

    if (date <= todayISO) {
      const empty = pill.classList.contains('empty');
      streak = empty ? (streak+1) : 0;
      if (streak >= 3) {
        const s = document.createElement('div');
        s.className = 'siren';
        s.textContent = '🚨';
        pill.appendChild(s);
      }
    }
  });
}

function applyStats(stats) {
  $('#ate-hoje-pct').textContent = fmtPct(stats.ateHojePct);
  $('#ate-hoje-frac').textContent = fmtFrac(stats.ateHojeA, stats.ateHojeB);
  $('#futuro-pct').textContent = fmtPct(stats.futuroPct);
  $('#futuro-frac').textContent = fmtFrac(stats.futuroA, stats.futuroB);
  $('#fechamento-pct').textContent = fmtPct(stats.fechamentoPct);
  $('#fechamento-frac').textContent = fmtFrac(stats.fechamentoA, stats.fechamentoB);
}

async function fetchCalendar() {
  const url = API() + '/calendario?mes=2025-08';
  const res = await fetch(url, {
    cache:'no-store',
    headers: {
      'Authorization': `Bearer ${window.CONFIG?.API_TOKEN || 'default-token'}`
    }
  });
  if (!res.ok) throw new Error('Erro ao buscar calendário');
  const data = await res.json();
  const normalized = normalizeCalendar(data);
  applyStats(normalized.stats);
  applyCalendar(normalized);
}

async function fetchRepasse() {
  const url = API() + '/repasse?mes=2025-08&incluir_limpeza=true';
  const res = await fetch(url, {
    cache:'no-store',
    headers: {
      'Authorization': `Bearer ${window.CONFIG?.API_TOKEN || 'default-token'}`
    }
  });
  if (!res.ok) throw new Error('Erro ao buscar repasse');
  const data = await res.json();
  // Allow flexible shapes
  const total = data.total ?? data.valor ?? data.repasse ?? data.repasse_estimado ?? null;
  const obs = data.obs ?? data.observacao ?? data.nota ?? data.status ?? '';
  $('#repasse-total').textContent = moneyBRL(Number(total));
  $('#repasse-obs').textContent = obs || 'em progresso';
}

async function refreshAll(showErr=true) {
  try {
    $('#error').classList.add('hidden');
    await Promise.all([fetchCalendar(), fetchRepasse()]);
    $('#last-updated').textContent = new Date().toLocaleTimeString('pt-BR');
  } catch (err) {
    console.error(err);
    if (showErr) {
      $('#error').textContent = 'Falha ao atualizar: ' + err.message;
      $('#error').classList.remove('hidden');
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  buildDays();
  $('#btn-refresh').addEventListener('click', () => refreshAll(true));
  await refreshAll(true);
  setInterval(refreshAll, 60_000);
});
