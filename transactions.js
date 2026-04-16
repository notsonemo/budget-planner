/* ══════════════════════════════════════════════════
   transactions.js
══════════════════════════════════════════════════ */

let _txAll    = [];
let _txPage   = 1;
let _txPerPg  = 12;
let _txSort   = { col: 'date', dir: -1 };
let _txEditId = null;
let _categories = [];

// ── Load ─────────────────────────────────────────
async function loadTransactions() {
  try {
    const params = new URLSearchParams();
    const search = document.getElementById('tx-search').value.trim();
    const type   = document.getElementById('tx-filter-type').value;
    const catId  = document.getElementById('tx-filter-cat').value;
    const month  = document.getElementById('tx-filter-month').value;

    if (search) params.set('search', search);
    if (type)   params.set('type', type);
    if (catId)  params.set('category_id', catId);
    if (month)  params.set('month', month);

    _txAll  = await api('api/transactions.php?' + params.toString());
    _txPage = 1;
    renderTxTable();
  } catch (err) { toast(err.message, 'error'); }
}

// ── Render table ─────────────────────────────────
function renderTxTable() {
  const sorted = [..._txAll].sort((a, b) => {
    let va = a[_txSort.col] ?? '', vb = b[_txSort.col] ?? '';
    if (_txSort.col === 'amount') { va = +va; vb = +vb; }
    if (va < vb) return -1 * _txSort.dir;
    if (va > vb) return  1 * _txSort.dir;
    return 0;
  });

  const total = sorted.length;
  const pages = Math.max(1, Math.ceil(total / _txPerPg));
  _txPage     = Math.min(_txPage, pages);
  const start = (_txPage - 1) * _txPerPg;
  const page  = sorted.slice(start, start + _txPerPg);

  const tbody = document.getElementById('tx-tbody');

  if (!page.length) {
    tbody.innerHTML = `<tr><td colspan="6">
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-text">No transactions found</div>
      </div></td></tr>`;
  } else {
    tbody.innerHTML = page.map(t => {
      const sign   = t.type === 'income' ? '+' : '-';
      const colour = t.category_colour || '#94a3b8';
      const icon   = t.category_icon   || '📦';
      return `<tr>
        <td>${fmtDate(t.date)}</td>
        <td><span class="badge ${t.type}">${t.type}</span></td>
        <td>
          <span class="cat-badge" style="background:${colour}22;color:${colour}">
            ${icon} ${t.category_name || 'Uncategorized'}
          </span>
        </td>
        <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.note || '—'}</td>
        <td class="tx-amount ${t.type}" style="font-size:.92rem">${sign}${fmtMoney(t.amount)}</td>
        <td>
          <div style="display:flex;gap:.4rem">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="editTx(${t.id})" title="Edit">✏️</button>
            <button class="btn btn-danger btn-sm btn-icon" onclick="deleteTx(${t.id})" title="Delete">🗑</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  // Pagination
  document.getElementById('tx-page-info').textContent =
    total ? `Showing ${start + 1}–${Math.min(start + _txPerPg, total)} of ${total}` : '';
  document.getElementById('tx-prev-btn').disabled = _txPage <= 1;
  document.getElementById('tx-next-btn').disabled = _txPage >= pages;

  // Sort indicators
  document.querySelectorAll('#tx-table thead th').forEach(th => {
    th.classList.toggle('sorted', th.dataset.col === _txSort.col);
    th.textContent = th.textContent.replace(/ [↑↓]$/, '');
    if (th.dataset.col === _txSort.col) th.textContent += _txSort.dir === 1 ? ' ↑' : ' ↓';
  });
}

// ── Category select population ────────────────────
async function populateCatFilter() {
  _categories = await api('api/categories.php');
  const sel = document.getElementById('tx-filter-cat');
  sel.innerHTML = '<option value="">All categories</option>' +
    _categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
  const txCat = document.getElementById('tx-category');
  txCat.innerHTML = '<option value="">No category</option>' +
    _categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
  const goalCat = document.getElementById('goal-category');
  goalCat.innerHTML = _categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
}

// ── Add / Edit modal ─────────────────────────────
function openTxModal(tx = null) {
  _txEditId = tx ? tx.id : null;
  document.getElementById('tx-modal-title').textContent = tx ? 'Edit Transaction' : 'Add Transaction';

  const typeVal = tx ? tx.type : 'expense';
  document.querySelector(`input[name="tx-type"][value="${typeVal}"]`).checked = true;
  document.getElementById('tx-amount').value   = tx ? tx.amount : '';
  document.getElementById('tx-date').value     = tx ? tx.date : today();
  document.getElementById('tx-note').value     = tx ? tx.note : '';
  document.getElementById('tx-category').value = tx ? (tx.category_id || '') : '';

  openModal('tx-modal');
}

async function saveTx() {
  const type    = document.querySelector('input[name="tx-type"]:checked').value;
  const amount  = parseFloat(document.getElementById('tx-amount').value);
  const date    = document.getElementById('tx-date').value;
  const note    = document.getElementById('tx-note').value.trim();
  const catId   = document.getElementById('tx-category').value;

  if (!amount || amount <= 0) { toast('Enter a valid amount', 'error'); return; }
  if (!date)                  { toast('Pick a date', 'error'); return; }

  const body = { type, amount, date, note, category_id: catId || null };

  try {
    if (_txEditId) {
      await api(`api/transactions.php?id=${_txEditId}`, 'PUT', body);
      toast('Transaction updated', 'success');
    } else {
      await api('api/transactions.php', 'POST', body);
      toast('Transaction added', 'success');
    }
    closeModal('tx-modal');
    await loadTransactions();
    loadDashboard();
  } catch (err) { toast(err.message, 'error'); }
}

async function editTx(id) {
  try {
    const tx = await api(`api/transactions.php?id=${id}`);
    openTxModal(tx);
  } catch (err) { toast(err.message, 'error'); }
}

function deleteTx(id) {
  confirm('Delete this transaction? This action cannot be undone.', async () => {
    try {
      await api(`api/transactions.php?id=${id}`, 'DELETE');
      toast('Transaction deleted', 'success');
      await loadTransactions();
      loadDashboard();
    } catch (err) { toast(err.message, 'error'); }
  });
}

// ── CSV export ───────────────────────────────────
function exportTxCSV() {
  const month = document.getElementById('tx-filter-month').value;
  const url   = 'api/transactions.php?export=csv' + (month ? `&month=${month}` : '');
  const a     = document.createElement('a');
  a.href = url; a.download = 'transactions.csv'; a.click();
}

// ── Event wiring ─────────────────────────────────
function initTransactions() {
  document.getElementById('add-tx-btn').addEventListener('click', () => openTxModal());
  document.getElementById('tx-modal-save').addEventListener('click', saveTx);
  document.getElementById('tx-modal-close').addEventListener('click', () => closeModal('tx-modal'));
  document.getElementById('tx-modal-cancel').addEventListener('click', () => closeModal('tx-modal'));
  document.getElementById('tx-export-btn').addEventListener('click', exportTxCSV);

  let searchTimer;
  document.getElementById('tx-search').addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadTransactions, 300);
  });
  ['tx-filter-type','tx-filter-cat','tx-filter-month'].forEach(id => {
    document.getElementById(id).addEventListener('change', loadTransactions);
  });
  document.getElementById('tx-clear-filters').addEventListener('click', () => {
    document.getElementById('tx-search').value      = '';
    document.getElementById('tx-filter-type').value = '';
    document.getElementById('tx-filter-cat').value  = '';
    document.getElementById('tx-filter-month').value= '';
    loadTransactions();
  });

  document.getElementById('tx-prev-btn').addEventListener('click', () => { _txPage--; renderTxTable(); });
  document.getElementById('tx-next-btn').addEventListener('click', () => { _txPage++; renderTxTable(); });

  document.querySelectorAll('#tx-table thead th[data-col]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (_txSort.col === col) _txSort.dir *= -1;
      else { _txSort.col = col; _txSort.dir = 1; }
      renderTxTable();
    });
  });
}
