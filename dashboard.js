/* ══════════════════════════════════════════════════
   dashboard.js
══════════════════════════════════════════════════ */

async function loadDashboard() {
  const month = currentMonth();

  // ── Stats ────────────────────────────────────────
  try {
    const [allTx, monthTx] = await Promise.all([
      api('api/transactions.php'),
      api(`api/transactions.php?month=${month}`),
    ]);

    const income  = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0);
    const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + +t.amount, 0);
    const balance = income - expense;
    const savingsRate = income > 0 ? ((balance / income) * 100) : 0;

    animateCounter(document.getElementById('stat-income'),  income);
    animateCounter(document.getElementById('stat-expense'), expense);
    animateCounter(document.getElementById('stat-balance'), balance);

    // Savings rate card
    const savingsEl = document.getElementById('stat-savings');
    if (savingsEl) {
      savingsEl.textContent = Math.round(savingsRate) + '%';
    }

    document.getElementById('stat-balance').className =
      'stat-value ' + (balance >= 0 ? 'balance' : 'expense');

    // ── Donut chart — spending by category ─────────
    const catMap = {};
    monthTx.filter(t => t.type === 'expense').forEach(t => {
      const k = t.category_name || 'Uncategorized';
      const c = t.category_colour || '#94a3b8';
      if (!catMap[k]) catMap[k] = { value: 0, colour: c };
      catMap[k].value += +t.amount;
    });
    const slices = Object.entries(catMap)
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.value - a.value);

    drawDonut('donut-chart', slices, expense);
    document.getElementById('donut-total').textContent = fmtMoney(expense);

    const legend = document.getElementById('donut-legend');
    legend.innerHTML = slices.length
      ? slices.map(s => `
          <div class="legend-item">
            <div class="legend-dot" style="background:${s.colour}"></div>
            <span class="legend-name">${s.name}</span>
            <span class="legend-val">${fmtMoney(s.value)}</span>
          </div>`).join('')
      : '<div class="text-muted">No expenses this month</div>';

    // ── Bar chart — 6-month trend ────────────────
    const labels = [], incomes = [], expenses = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const m = d.toISOString().slice(0, 7);
      labels.push(d.toLocaleDateString('en-IN', { month: 'short' }));
      const mTx = allTx.filter(t => t.date.slice(0, 7) === m);
      incomes.push(mTx.filter(t => t.type === 'income').reduce((s, t) => s + +t.amount, 0));
      expenses.push(mTx.filter(t => t.type === 'expense').reduce((s, t) => s + +t.amount, 0));
    }
    drawBar('bar-chart', labels, incomes, expenses);

    // ── Recent transactions ──────────────────────
    renderRecentTx(monthTx.slice(0, 8));

  } catch (err) {
    toast(err.message, 'error');
  }
}

function renderRecentTx(txList) {
  const el = document.getElementById('recent-tx-list');
  if (!txList.length) {
    el.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">📭</div>
      <div class="empty-state-text">No transactions this month yet.<br>Add your first one!</div>
    </div>`;
    return;
  }
  el.innerHTML = txList.map(t => txItemHTML(t, false)).join('');
}

function txItemHTML(t, showActions = true) {
  const icon   = t.category_icon || '📦';
  const colour = t.category_colour || '#94a3b8';
  const sign   = t.type === 'income' ? '+' : '-';
  const actions = showActions ? `
    <div class="tx-actions">
      <button class="btn btn-ghost btn-sm btn-icon" onclick="editTx(${t.id})" title="Edit">✏️</button>
      <button class="btn btn-danger btn-sm btn-icon" onclick="deleteTx(${t.id})" title="Delete">🗑</button>
    </div>` : '';

  return `<div class="tx-item" data-id="${t.id}">
    <div class="tx-icon" style="background:${colour}18;color:${colour}">${icon}</div>
    <div class="tx-info">
      <div class="tx-note">${t.note || t.category_name || 'Transaction'}</div>
      <div class="tx-meta">${fmtDate(t.date)} &bull; ${t.category_name || 'Uncategorized'}</div>
    </div>
    <div class="tx-amount ${t.type}">${sign}${fmtMoney(t.amount)}</div>
    ${actions}
  </div>`;
}
