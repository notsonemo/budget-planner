/* ══════════════════════════════════════════════════
   categories.js
══════════════════════════════════════════════════ */

let _catEditId = null;

async function loadCategories() {
  const grid = document.getElementById('cat-grid');
  grid.innerHTML = '<div class="loading"><div class="spinner"></div> Loading…</div>';

  try {
    const cats    = await api('api/categories.php');
    const txAll   = await api('api/transactions.php');

    if (!cats.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">🏷️</div>
        <div class="empty-state-text">No categories yet. Create one!</div>
      </div>`;
      return;
    }

    // Count transactions per category
    const countMap = {};
    txAll.forEach(t => {
      if (t.category_id) countMap[t.category_id] = (countMap[t.category_id] || 0) + 1;
    });

    grid.innerHTML = cats.map(c => `
      <div class="cat-card">
        <div class="cat-card-actions">
          <button class="btn btn-ghost btn-sm btn-icon" onclick="editCat(${c.id})" title="Edit">✏️</button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="deleteCat(${c.id})" title="Delete">🗑</button>
        </div>
        <div class="cat-card-icon" style="background:${c.colour}22;color:${c.colour}">${c.icon}</div>
        <div class="cat-card-name">${c.name}</div>
        <div class="cat-card-count">${countMap[c.id] || 0} transactions</div>
        <div style="margin-top:.3rem">
          <div style="width:10px;height:10px;border-radius:50%;background:${c.colour};margin:0 auto"></div>
        </div>
      </div>`).join('');

  } catch (err) { toast(err.message, 'error'); }
}

// ── Add / Edit ───────────────────────────────────
function openCatModal(cat = null) {
  _catEditId = cat ? cat.id : null;
  document.getElementById('cat-modal-title').textContent = cat ? 'Edit Category' : 'New Category';
  document.getElementById('cat-icon').value   = cat ? cat.icon   : '📦';
  document.getElementById('cat-name').value   = cat ? cat.name   : '';
  document.getElementById('cat-colour').value = cat ? cat.colour : '#6366f1';
  renderSwatches('colour-swatches', 'cat-colour');
  openModal('cat-modal');
}

async function saveCat() {
  const name   = document.getElementById('cat-name').value.trim();
  const icon   = document.getElementById('cat-icon').value.trim() || '📦';
  const colour = document.getElementById('cat-colour').value;
  if (!name) { toast('Category name is required', 'error'); return; }

  try {
    if (_catEditId) {
      await api(`api/categories.php?id=${_catEditId}`, 'PUT', { name, icon, colour });
      toast('Category updated', 'success');
    } else {
      await api('api/categories.php', 'POST', { name, icon, colour });
      toast('Category created', 'success');
    }
    closeModal('cat-modal');
    await loadCategories();
    await populateCatFilter();
    loadDashboard();
  } catch (err) { toast(err.message, 'error'); }
}

async function editCat(id) {
  try {
    const cat = await api(`api/categories.php?id=${id}`);
    openCatModal(cat);
  } catch (err) { toast(err.message, 'error'); }
}

function deleteCat(id) {
  confirm('Delete this category? Transactions linked to it will be unlinked.', async () => {
    try {
      await api(`api/categories.php?id=${id}`, 'DELETE');
      toast('Category deleted', 'success');
      await loadCategories();
      await populateCatFilter();
      loadDashboard();
    } catch (err) { toast(err.message, 'error'); }
  });
}

// ── Event wiring ─────────────────────────────────
function initCategories() {
  document.getElementById('add-cat-btn').addEventListener('click', () => openCatModal());
  document.getElementById('cat-modal-save').addEventListener('click', saveCat);
  document.getElementById('cat-modal-close').addEventListener('click', () => closeModal('cat-modal'));
  document.getElementById('cat-modal-cancel').addEventListener('click', () => closeModal('cat-modal'));
}
