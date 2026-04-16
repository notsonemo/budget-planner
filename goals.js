/* ══════════════════════════════════════════════════
   goals.js
══════════════════════════════════════════════════ */

let _goalEditId = null;

async function loadGoals() {
  const month = document.getElementById('goals-month').value || currentMonth();
  const grid  = document.getElementById('goals-grid');
  grid.innerHTML = '<div class="loading"><div class="spinner"></div> Loading…</div>';

  try {
    const goals = await api(`api/goals.php?month=${month}`);

    if (!goals.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">🎯</div>
        <div class="empty-state-text">No goals set for ${month}.<br>Click "+ Set Goal" to create one.</div>
      </div>`;
      return;
    }

    grid.innerHTML = goals.map(g => {
      const pct    = Math.min(g.percent, 100);
      const over   = +g.percent > 100;
      const warn   = +g.percent >= 80 && !over;
      const colour = over ? 'var(--danger)' : warn ? 'var(--warn)' : 'var(--success)';
      const pctCls = over ? 'over' : warn ? 'warn' : 'ok';

      return `<div class="goal-card">
        <div class="goal-header">
          <div class="goal-cat">
            <div class="goal-cat-icon" style="background:${g.category_colour}22;color:${g.category_colour}">${g.category_icon}</div>
            ${g.category_name}
          </div>
          <div style="display:flex;gap:.4rem">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="editGoal(${g.id},${g.limit_amount})" title="Edit">✏️</button>
            <button class="btn btn-danger btn-sm btn-icon" onclick="deleteGoal(${g.id})" title="Delete">🗑</button>
          </div>
        </div>

        <div class="goal-amounts">
          <div>Spent: <span>${fmtMoney(g.spent)}</span></div>
          <div>Limit: <span>${fmtMoney(g.limit_amount)}</span></div>
        </div>

        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%;background:${colour};box-shadow:0 0 8px ${colour}80"></div>
        </div>

        <div class="goal-pct ${pctCls}">
          ${over
            ? `⚠️ Over budget by ${fmtMoney(+g.spent - +g.limit_amount)}`
            : warn
              ? `⚡ ${g.percent}% used — almost there`
              : `✓ ${g.percent}% used`}
        </div>
      </div>`;
    }).join('');

  } catch (err) { toast(err.message, 'error'); }
}

// ── Add / Edit ───────────────────────────────────
function openGoalModal(goalId = null, limit = '') {
  _goalEditId = goalId;
  document.getElementById('goal-modal-title').textContent = goalId ? 'Edit Goal' : 'Set Budget Goal';
  document.getElementById('goal-month').value  = document.getElementById('goals-month').value || currentMonth();
  document.getElementById('goal-limit').value  = limit || '';
  document.getElementById('goal-modal-save').textContent = goalId ? 'Update Goal' : 'Save Goal';
  openModal('goal-modal');
}

async function saveGoal() {
  const catId  = document.getElementById('goal-category').value;
  const month  = document.getElementById('goal-month').value;
  const limit  = parseFloat(document.getElementById('goal-limit').value);

  if (!catId)           { toast('Pick a category', 'error'); return; }
  if (!month)           { toast('Pick a month', 'error'); return; }
  if (!limit || limit <= 0) { toast('Enter a positive limit', 'error'); return; }

  try {
    if (_goalEditId) {
      await api(`api/goals.php?id=${_goalEditId}`, 'PUT', { limit_amount: limit });
      toast('Goal updated', 'success');
    } else {
      await api('api/goals.php', 'POST', { category_id: catId, month, limit_amount: limit });
      toast('Goal set', 'success');
    }
    closeModal('goal-modal');
    loadGoals();
  } catch (err) { toast(err.message, 'error'); }
}

function editGoal(id, limit) {
  openGoalModal(id, limit);
}

function deleteGoal(id) {
  confirm('Remove this budget goal?', async () => {
    try {
      await api(`api/goals.php?id=${id}`, 'DELETE');
      toast('Goal removed', 'success');
      loadGoals();
    } catch (err) { toast(err.message, 'error'); }
  });
}

// ── Event wiring ─────────────────────────────────
function initGoals() {
  document.getElementById('goals-month').value = currentMonth();

  document.getElementById('add-goal-btn').addEventListener('click', () => openGoalModal());
  document.getElementById('goal-modal-save').addEventListener('click', saveGoal);
  document.getElementById('goal-modal-close').addEventListener('click', () => closeModal('goal-modal'));
  document.getElementById('goal-modal-cancel').addEventListener('click', () => closeModal('goal-modal'));
  document.getElementById('goals-month').addEventListener('change', loadGoals);
}
