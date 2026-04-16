/* ══════════════════════════════════════════════════
   ui.js — DOM helpers, toasts, modals
══════════════════════════════════════════════════ */

// ── Toast ────────────────────────────────────────
function toast(msg, type = 'info') {
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove());
  }, 3200);
}

// ── Modal ────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  el.classList.add('open');
  const firstInput = el.querySelector('input,select,textarea');
  if (firstInput) setTimeout(() => firstInput.focus(), 50);
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Close on backdrop click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('open');
  }
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
  }
});

// ── Confirm dialog ───────────────────────────────
function confirm(message, onOk) {
  document.getElementById('confirm-message').textContent = message;
  openModal('confirm-modal');
  const okBtn = document.getElementById('confirm-ok');
  const cancelBtn = document.getElementById('confirm-cancel');
  const close = () => closeModal('confirm-modal');

  const handler = () => { onOk(); close(); cleanup(); };
  const cancelH = () => { close(); cleanup(); };
  const cleanup = () => {
    okBtn.removeEventListener('click', handler);
    cancelBtn.removeEventListener('click', cancelH);
  };

  okBtn.addEventListener('click', handler);
  cancelBtn.addEventListener('click', cancelH);
}

// ── Format helpers ───────────────────────────────
const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
function fmtMoney(v) { return fmt.format(Number(v)); }
function fmtDate(d)  { return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }); }

// ── API helper ───────────────────────────────────
async function api(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// ── Colour swatches ──────────────────────────────
const SWATCHES = [
  '#6366f1','#8b5cf6','#a855f7','#ec4899',
  '#f43f5e','#f97316','#f59e0b','#eab308',
  '#10b981','#14b8a6','#06b6d4','#3b82f6',
  '#22c55e','#94a3b8',
];

function renderSwatches(containerId, colourInputId) {
  const wrap   = document.getElementById(containerId);
  const input  = document.getElementById(colourInputId);
  wrap.innerHTML = '';
  SWATCHES.forEach(c => {
    const s = document.createElement('div');
    s.className = 'swatch';
    s.style.background = c;
    if (c === input.value) s.classList.add('selected');
    s.addEventListener('click', () => {
      wrap.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
      s.classList.add('selected');
      input.value = c;
    });
    wrap.appendChild(s);
  });
  input.addEventListener('input', () => {
    wrap.querySelectorAll('.swatch').forEach(x => x.classList.remove('selected'));
  });
}

// ── Animate counter ──────────────────────────────
function animateCounter(el, target, prefix = '₹') {
  const start = 0;
  const duration = 800;
  const startTime = performance.now();
  const update = (now) => {
    const elapsed = Math.min(now - startTime, duration);
    const progress = elapsed / duration;
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * eased;
    el.textContent = fmtMoney(current);
    if (elapsed < duration) requestAnimationFrame(update);
    else el.textContent = fmtMoney(target);
  };
  requestAnimationFrame(update);
}

// Current month YYYY-MM
function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

// Today YYYY-MM-DD
function today() {
  return new Date().toISOString().slice(0, 10);
}
