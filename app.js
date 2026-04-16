/* ══════════════════════════════════════════════════
   app.js — Router, global init, monthly summary
══════════════════════════════════════════════════ */

// ── Tab router ───────────────────────────────────
const TAB_LOADERS = {
  dashboard:    loadDashboard,
  transactions: loadTransactions,
  categories:   loadCategories,
  goals:        loadGoals,
  summary:      loadSummary,
};

let _activeTab = 'dashboard';

function switchTab(id) {
  // Update active pane
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.getElementById(`tab-${id}`)?.classList.add('active');

  // Update nav
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.nav-btn[data-tab="${id}"]`)?.classList.add('active');

  _activeTab = id;

  if (TAB_LOADERS[id]) TAB_LOADERS[id]();

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
}

// ── Monthly summary tab ──────────────────────────
async function loadSummary() {
  const month = document.getElementById('summary-month').value || currentMonth();

  try {
    const txList = await api(`api/transactions.php?month=${month}`);
    const income  = txList.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0);
    const expense = txList.filter(t => t.type === 'expense').reduce((s, t) => s + +t.amount, 0);
    const net     = income - expense;
    const savPct  = income > 0 ? ((net / income) * 100) : 0;

    // Stat cards
    const sc = document.getElementById('summary-stat-cards');
    sc.innerHTML = `
      <div class="stat-card income">
        <div class="stat-label"><span class="dot" style="background:var(--success)"></span> Income</div>
        <div class="stat-value income">${fmtMoney(income)}</div>
        <div class="stat-sub">${txList.filter(t=>t.type==='income').length} transactions</div>
      </div>
      <div class="stat-card expense">
        <div class="stat-label"><span class="dot" style="background:var(--danger)"></span> Expenses</div>
        <div class="stat-value expense">${fmtMoney(expense)}</div>
        <div class="stat-sub">${txList.filter(t=>t.type==='expense').length} transactions</div>
      </div>
      <div class="stat-card balance">
        <div class="stat-label"><span class="dot" style="background:var(--primary)"></span> Net Savings</div>
        <div class="stat-value ${net>=0?'balance':'expense'}">${fmtMoney(net)}</div>
        <div class="stat-sub">
          <div style="display:flex;flex-direction:column;align-items:center;gap:.25rem;margin-top:.5rem">
            <canvas id="savings-ring" class="savings-rate-ring"></canvas>
          </div>
        </div>
      </div>`;

    // Draw ring after DOM settles
    setTimeout(() => drawSavingsRing('savings-ring', savPct), 60);

    // Transaction list
    const list = document.getElementById('summary-tx-list');
    if (!txList.length) {
      list.innerHTML = `<div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-text">No transactions for ${month}</div>
      </div>`;
      return;
    }
    list.innerHTML = txList.map(t => txItemHTML(t, false)).join('');

  } catch (err) { toast(err.message, 'error'); }
}

function exportSummaryCSV() {
  const month = document.getElementById('summary-month').value;
  const url   = 'api/transactions.php?export=csv' + (month ? `&month=${month}` : '');
  const a     = document.createElement('a');
  a.href = url; a.download = `transactions_${month || 'all'}.csv`; a.click();
}

// ── Greeting display ─────────────────────────────
function updateTopbarGreeting() {
  const el = document.getElementById('topbar-date');
  if (!el) return;

  const hour = new Date().getHours();
  let greeting;
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  else greeting = 'Good evening';

  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'long'
  });

  el.textContent = `${greeting} — ${dateStr}`;
}

// ── Mobile menu ──────────────────────────────────
function initMobileMenu() {
  const btn  = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');
  const mq   = window.matchMedia('(max-width: 900px)');

  const check = () => { btn.style.display = mq.matches ? 'flex' : 'none'; };
  check();
  mq.addEventListener('change', check);

  btn.addEventListener('click', () => sidebar.classList.toggle('open'));
}

// ── Bootstrap ────────────────────────────────────
async function init() {
  updateTopbarGreeting();
  initMobileMenu();
  initTransactions();
  initCategories();
  initGoals();

  // Set default month pickers
  document.getElementById('tx-filter-month').value = '';
  document.getElementById('summary-month').value   = currentMonth();
  document.getElementById('goals-month').value     = currentMonth();

  // Nav click handlers
  document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Summary tab events
  document.getElementById('summary-month').addEventListener('change', loadSummary);
  document.getElementById('summary-export-btn').addEventListener('click', exportSummaryCSV);

  // Populate category dropdowns first, then load dashboard
  await populateCatFilter();
  loadDashboard();

  // Redraw bar chart on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (_activeTab === 'dashboard') loadDashboard();
    }, 250);
  });
}

document.addEventListener('DOMContentLoaded', init);
