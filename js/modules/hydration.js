/* ============================================================
   Nutrilite — Hydration Module
   Water tracking with visual bottle and glass interface
   ============================================================ */
const Hydration = (() => {
  'use strict';
  const { $, today, showToast, daysAgo, dayName } = Helpers;

  function render(container) {
    const profile = NutriStore.getObject('profile');
    const targetMl = profile.waterTarget || 2500;
    const targetGlasses = Math.ceil(targetMl / 250);
    const data = NutriStore.getObject('water_' + today(), { glasses: 0 });
    const glasses = data.glasses || 0;
    const pct = Math.min((glasses / targetGlasses) * 100, 100);

    container.innerHTML = `
      <h2 class="mb-lg animate-fade-in-up">💧 Hydration Tracker</h2>
      <div class="grid grid-2">
        <div class="card animate-fade-in-up stagger-1">
          <div class="hydration-display">
            <div class="water-bottle">
              <div class="water-fill" style="height:${pct}%"></div>
            </div>
            <h3>${glasses} / ${targetGlasses} glasses</h3>
            <p class="text-sm text-muted">${glasses * 250}ml / ${targetMl}ml</p>
            <div class="flex gap-md mt-lg">
              <button class="btn btn-primary btn-lg ripple" id="add-water">💧 + 1 Glass</button>
              <button class="btn btn-secondary btn-lg" id="remove-water">−</button>
            </div>
          </div>
        </div>
        <div class="card animate-fade-in-up stagger-2">
          <div class="card-header"><h4 class="card-title">Today's Glasses</h4></div>
          <div class="water-glasses" id="water-glass-grid"></div>
          <div class="mt-lg">
            <div class="card-header"><h4 class="card-title">7-Day Water Intake</h4></div>
            <div id="water-chart" style="height:140px"></div>
          </div>
          <div class="mt-lg">
            <h4 class="card-title mb-md">💡 Hydration Tips</h4>
            <div class="flex flex-col gap-sm">
              <div class="tip-card"><span style="font-size:1.2rem">🌅</span><div><h5>Morning Boost</h5><p class="text-xs text-muted">Drink a glass of water right after waking up.</p></div></div>
              <div class="tip-card"><span style="font-size:1.2rem">⏰</span><div><h5>Set Reminders</h5><p class="text-xs text-muted">Drink water every 1-2 hours throughout the day.</p></div></div>
              <div class="tip-card"><span style="font-size:1.2rem">🍋</span><div><h5>Add Flavor</h5><p class="text-xs text-muted">Add lemon or cucumber for natural flavor.</p></div></div>
            </div>
          </div>
        </div>
      </div>`;
    renderGlassGrid(glasses, targetGlasses);
    renderWaterChart();
    bindEvents(targetGlasses);
  }

  function renderGlassGrid(glasses, target) {
    const el = $('#water-glass-grid');
    if (!el) return;
    el.innerHTML = Array.from({ length: target }, (_, i) =>
      `<div class="water-glass ${i < glasses ? 'filled' : ''}" data-glass="${i}">
        ${i < glasses ? '💧' : ''}
      </div>`
    ).join('');
    el.querySelectorAll('.water-glass').forEach(glass => {
      glass.addEventListener('click', () => {
        const idx = parseInt(glass.dataset.glass);
        const data = NutriStore.getObject('water_' + today(), { glasses: 0 });
        data.glasses = idx + 1;
        NutriStore.set('water_' + today(), data);
        render(document.getElementById('page-content'));
      });
    });
  }

  function renderWaterChart() {
    const el = $('#water-chart');
    if (!el) return;
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = daysAgo(i);
      const w = NutriStore.getObject('water_' + d, { glasses: 0 });
      data.push({ label: dayName(d), value: (w.glasses || 0) * 250, color: 'var(--clr-water)' });
    }
    Charts.createBarChart(el, { data, barColor: 'var(--clr-water)', height: 120 });
  }

  function bindEvents(targetGlasses) {
    $('#add-water')?.addEventListener('click', () => {
      const data = NutriStore.getObject('water_' + today(), { glasses: 0 });
      if (data.glasses < targetGlasses) {
        data.glasses++;
        NutriStore.set('water_' + today(), data);
        if (data.glasses === targetGlasses) showToast('🎉 Water goal reached!', 'success');
        else showToast('💧 +250ml', 'success');
        render(document.getElementById('page-content'));
      } else {
        showToast('Goal already reached!', 'warning');
      }
    });
    $('#remove-water')?.addEventListener('click', () => {
      const data = NutriStore.getObject('water_' + today(), { glasses: 0 });
      if (data.glasses > 0) {
        data.glasses--;
        NutriStore.set('water_' + today(), data);
        render(document.getElementById('page-content'));
      }
    });
  }

  return { render };
})();
