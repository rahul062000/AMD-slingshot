/* ============================================================
   NutriSense — SVG Chart Renderer
   Custom charts: rings, bars, line charts
   ============================================================ */
const Charts = (() => {
  'use strict';

  // --- Security: sanitize values ---
  function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }
  function sanitizeNum(val) { return isFinite(val) ? val : 0; }

  // --- Progress Ring ---
  function createRing(container, { value = 0, max = 100, size = 120, stroke = 10, color = 'var(--clr-primary)', label = '', sublabel = '', animate = true }) {
    value = sanitizeNum(value); max = sanitizeNum(max) || 1;
    const pct = clamp(value / max, 0, 1);
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - pct);
    const el = document.createElement('div');
    el.className = 'progress-ring';
    el.style.width = size + 'px'; el.style.height = size + 'px';
    el.innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle class="progress-ring-bg" cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="${stroke}" />
        <circle class="progress-ring-fg" cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="${stroke}"
          stroke="${color}" style="stroke-dasharray:${circumference};stroke-dashoffset:${animate ? circumference : offset};--ring-circumference:${circumference};--ring-target:${offset}" />
      </svg>
      <div class="progress-ring-value">
        <span class="font-bold" style="font-size:${size > 100 ? 'var(--fs-xl)' : 'var(--fs-md)'}">${Math.round(pct * 100)}%</span>
        ${sublabel ? `<span class="text-xs text-muted">${sanitizeText(sublabel)}</span>` : ''}
      </div>`;
    container.innerHTML = '';
    container.appendChild(el);
    if (animate) {
      requestAnimationFrame(() => {
        const fg = el.querySelector('.progress-ring-fg');
        if (fg) fg.style.strokeDashoffset = offset;
      });
    }
    return el;
  }

  // --- Bar Chart ---
  function createBarChart(container, { data = [], barColor = 'var(--clr-primary)', height = 200, showLabels = true, showValues = true }) {
    if (!data.length) { container.innerHTML = '<div class="empty-state"><p>No data</p></div>'; return; }
    const maxVal = Math.max(...data.map(d => sanitizeNum(d.value)), 1);
    const el = document.createElement('div');
    el.className = 'chart-bar-group';
    el.style.height = height + 'px';
    data.forEach((item, i) => {
      const val = sanitizeNum(item.value);
      const barH = clamp((val / maxVal) * 100, 2, 100);
      const wrapper = document.createElement('div');
      wrapper.className = 'chart-bar-wrapper';
      const color = item.color || barColor;
      wrapper.innerHTML = `
        <div class="chart-bar stagger-${i+1}" data-value="${val}" style="height:0%;background:${color};width:100%"></div>
        ${showLabels ? `<span class="chart-day-label">${sanitizeText(item.label || '')}</span>` : ''}`;
      el.appendChild(wrapper);
      requestAnimationFrame(() => {
        setTimeout(() => {
          const bar = wrapper.querySelector('.chart-bar');
          if (bar) bar.style.height = barH + '%';
        }, i * 80);
      });
    });
    container.innerHTML = '';
    container.appendChild(el);
  }

  // --- Mini sparkline (SVG path) ---
  function createSparkline(container, { data = [], color = 'var(--clr-primary)', height = 40, width = 150 }) {
    if (data.length < 2) { container.innerHTML = ''; return; }
    const vals = data.map(d => sanitizeNum(d));
    const max = Math.max(...vals, 1);
    const min = Math.min(...vals, 0);
    const range = max - min || 1;
    const step = width / (vals.length - 1);
    const points = vals.map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    });
    const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs><linearGradient id="sg${Date.now()}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient></defs>
      <polyline fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${points.join(' ')}"/>
      <polygon fill="url(#sg${Date.now()})" points="0,${height} ${points.join(' ')} ${width},${height}"/>
    </svg>`;
    container.innerHTML = svg;
  }

  // --- Donut Chart ---
  function createDonut(container, { segments = [], size = 100, stroke = 12 }) {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const total = segments.reduce((s, seg) => s + sanitizeNum(seg.value), 0) || 1;
    let offset = 0;
    let circles = '';
    segments.forEach(seg => {
      const pct = sanitizeNum(seg.value) / total;
      const len = circumference * pct;
      circles += `<circle cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="${stroke}"
        stroke="${seg.color}" fill="none" stroke-dasharray="${len} ${circumference - len}"
        stroke-dashoffset="${-offset}" stroke-linecap="round"/>`;
      offset += len;
    });
    container.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg)">${circles}</svg>`;
  }

  function sanitizeText(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { createRing, createBarChart, createSparkline, createDonut, sanitizeText };
})();
