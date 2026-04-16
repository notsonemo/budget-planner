/* ══════════════════════════════════════════════════
   charts.js — Pure Canvas donut + bar charts
   (Updated for light theme)
══════════════════════════════════════════════════ */

// ── Donut chart ──────────────────────────────────
function drawDonut(canvasId, slices, total) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const dpr    = window.devicePixelRatio || 1;
  const size   = 200;
  canvas.width  = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width  = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  const cx = size / 2, cy = size / 2;
  const r  = 80, inner = 52;

  ctx.clearRect(0, 0, size, size);

  if (!slices.length) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.arc(cx, cy, inner, Math.PI * 2, 0, true);
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    ctx.fill();
    return;
  }

  let start = -Math.PI / 2;
  const gap = slices.length > 1 ? 0.025 : 0;

  slices.forEach((s, i) => {
    const angle = (s.value / total) * (Math.PI * 2);
    ctx.beginPath();
    ctx.arc(cx, cy, r,     start + gap, start + angle - gap);
    ctx.arc(cx, cy, inner, start + angle - gap, start + gap, true);
    ctx.closePath();
    ctx.fillStyle = s.colour;
    ctx.shadowColor = s.colour;
    ctx.shadowBlur  = 8;
    ctx.fill();
    ctx.shadowBlur  = 0;
    start += angle;
  });
}

// ── Bar chart ────────────────────────────────────
function drawBar(canvasId, labels, incomes, expenses) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const W = canvas.clientWidth  || 500;
  const H = canvas.clientHeight || 240;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const pad   = { top: 20, right: 20, bottom: 40, left: 60 };
  const cW    = W - pad.left - pad.right;
  const cH    = H - pad.top  - pad.bottom;
  const n     = labels.length;
  const max   = Math.max(...incomes, ...expenses, 1);
  const barW  = (cW / n) * 0.28;
  const grpW  = cW / n;

  // Grid lines
  const steps = 4;
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth   = 1;
  ctx.font        = '10px Inter, sans-serif';
  ctx.fillStyle   = 'rgba(110,110,115,0.8)';
  ctx.textAlign   = 'right';
  for (let i = 0; i <= steps; i++) {
    const y = pad.top + cH - (i / steps) * cH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + cW, y);
    ctx.stroke();
    ctx.fillText(fmtMoney((max * i) / steps).replace('₹','₹').replace(',00,',''), pad.left - 6, y + 4);
  }

  // Bars
  labels.forEach((lbl, i) => {
    const x = pad.left + i * grpW + grpW / 2;

    // Income bar (left)
    const incH = (incomes[i] / max) * cH;
    const incY = pad.top + cH - incH;
    ctx.fillStyle = '#30D158';
    ctx.shadowColor = 'rgba(48,209,88,0.3)';
    ctx.shadowBlur  = 6;
    roundRect(ctx, x - barW - 2, incY, barW, incH, [5, 5, 0, 0]);
    ctx.fill();

    // Expense bar (right)
    const expH = (expenses[i] / max) * cH;
    const expY = pad.top + cH - expH;
    ctx.fillStyle = '#FF3B30';
    ctx.shadowColor = 'rgba(255,59,48,0.3)';
    ctx.shadowBlur  = 6;
    roundRect(ctx, x + 2, expY, barW, expH, [5, 5, 0, 0]);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Label
    ctx.fillStyle   = 'rgba(110,110,115,0.8)';
    ctx.font        = '11px Inter, sans-serif';
    ctx.textAlign   = 'center';
    ctx.fillText(lbl, x, pad.top + cH + 18);
  });

  // Legend
  const legY = H - 8;
  ctx.font = '11px Inter, sans-serif';
  [['Income', '#30D158'], ['Expenses', '#FF3B30']].forEach(([l, c], i) => {
    const lx = pad.left + i * 90;
    ctx.fillStyle = c;
    roundRect(ctx, lx, legY - 9, 12, 9, [3,3,3,3]);
    ctx.fill();
    ctx.fillStyle = 'rgba(110,110,115,0.9)';
    ctx.textAlign = 'left';
    ctx.fillText(l, lx + 16, legY);
  });
}

// ── Savings ring (summary tab) ───────────────────
function drawSavingsRing(canvasId, pct) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  const dpr  = window.devicePixelRatio || 1;
  const size = 140;
  canvas.width  = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width  = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);
  const cx = size / 2, cy = size / 2, r = 55, lw = 14;

  // Track
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth   = lw;
  ctx.stroke();

  // Fill
  const angle = (Math.max(0, Math.min(pct, 100)) / 100) * Math.PI * 2;
  const color  = pct >= 20 ? '#30D158' : pct >= 0 ? '#FF9500' : '#FF3B30';
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + angle);
  ctx.strokeStyle = color;
  ctx.lineWidth   = lw;
  ctx.lineCap     = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur  = 8;
  ctx.stroke();
  ctx.shadowBlur  = 0;

  // Text
  ctx.fillStyle   = '#1D1D1F';
  ctx.font        = `700 22px Outfit, sans-serif`;
  ctx.textAlign   = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${Math.round(pct)}%`, cx, cy - 6);
  ctx.font        = '11px Inter, sans-serif';
  ctx.fillStyle   = 'rgba(110,110,115,0.8)';
  ctx.fillText('savings', cx, cy + 14);
}

// ── Helper ───────────────────────────────────────
function roundRect(ctx, x, y, w, h, radii) {
  ctx.beginPath();
  ctx.moveTo(x + radii[0], y);
  ctx.lineTo(x + w - radii[1], y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radii[1]);
  ctx.lineTo(x + w, y + h - radii[2]);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radii[2], y + h);
  ctx.lineTo(x + radii[3], y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radii[3]);
  ctx.lineTo(x, y + radii[0]);
  ctx.quadraticCurveTo(x, y, x + radii[0], y);
  ctx.closePath();
}
