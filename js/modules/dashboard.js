/* ============================================================
   Nutrilite — Dashboard Module
   Main dashboard with rings, meal timeline, streak, charts
   ============================================================ */
const Dashboard = (() => {
  'use strict';
  const { $, escapeHTML, getGreeting, today, formatDate, getWeekDates, dayName, formatNum } = Helpers;

  function render(container) {
    const profile = NutriStore.getObject('profile');
    const todayLog = NutriStore.getObject('log_' + today(), { meals: { breakfast:[], lunch:[], snack:[], dinner:[] } });
    const consumed = calcConsumed(todayLog);
    const target = { calories: profile.targetCalories || 2000, protein: profile.macros?.protein || 150, carbs: profile.macros?.carbs || 200, fat: profile.macros?.fat || 65 };
    container.innerHTML = `
      <div class="dashboard-greeting animate-fade-in-up">
        <h1>${getGreeting()}, <span class="text-gradient">${escapeHTML(profile.name || 'Friend')}</span></h1>
        <p>${formatDate(today(), 'long')} — Let's make today count!</p>
      </div>
      <div class="grid grid-2 mb-lg">
        <div class="card animate-fade-in-up stagger-1">
          <div class="card-header"><h4 class="card-title">Today's Progress</h4><span class="badge badge-primary">${Math.round((consumed.calories/target.calories)*100)}%</span></div>
          <div class="macro-rings" id="dash-rings"></div>
          <div class="calorie-summary">
            <div class="calorie-item"><div class="value" style="color:var(--clr-calories)">${formatNum(consumed.calories)}</div><div class="label">Consumed</div></div>
            <div class="calorie-item"><div class="value" style="color:var(--clr-success)">${formatNum(Math.max(0,target.calories - consumed.calories))}</div><div class="label">Remaining</div></div>
            <div class="calorie-item"><div class="value">${formatNum(target.calories)}</div><div class="label">Target</div></div>
          </div>
        </div>
        <div class="card animate-fade-in-up stagger-2">
          <div class="card-header"><h4 class="card-title">Macronutrients</h4></div>
          ${renderMacroBar('Protein', consumed.protein, target.protein, 'var(--clr-protein)')}
          ${renderMacroBar('Carbs', consumed.carbs, target.carbs, 'var(--clr-carbs)')}
          ${renderMacroBar('Fat', consumed.fat, target.fat, 'var(--clr-fat)')}
          <div class="mt-md" id="dash-donut" style="display:flex;align-items:center;justify-content:center"></div>
        </div>
      </div>
      <div class="grid grid-2 mb-lg">
        <div class="card animate-fade-in-up stagger-3">
          <div class="card-header"><h4 class="card-title">Quick Actions</h4></div>
          <div class="quick-actions">
            <button class="quick-action-btn ripple" data-action="log">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              <span>Log Food</span>
            </button>
            <button class="quick-action-btn ripple" data-action="water">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
              <span>Log Water</span>
            </button>
            <button class="quick-action-btn ripple" data-action="plan">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              <span>Meal Plan</span>
            </button>
            <button class="quick-action-btn ripple" data-action="insights">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
              <span>Insights</span>
            </button>
          </div>
        </div>
        <div class="card animate-fade-in-up stagger-4">
          <div class="card-header"><h4 class="card-title">🔥 Streak</h4></div>
          ${renderStreak()}
        </div>
      </div>
      <div class="card mb-lg animate-fade-in-up stagger-5">
        <div class="card-header"><h4 class="card-title">Today's Meals</h4>
          <button class="btn btn-sm btn-primary" data-action="log">+ Add Food</button>
        </div>
        <div class="meals-timeline" id="dash-meals"></div>
      </div>
      <div class="card animate-fade-in-up stagger-6">
        <div class="card-header"><h4 class="card-title">Weekly Overview</h4></div>
        <div class="weekly-chart-container" id="dash-weekly-chart"></div>
      </div>`;
    renderRings(consumed, target);
    renderDonut(consumed);
    renderMeals(todayLog);
    renderWeeklyChart();
    bindActions(container);
  }

  function calcConsumed(log) {
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    if (!log || !log.meals) return totals;
    Object.values(log.meals).forEach(items => {
      items.forEach(item => {
        const mult = (item.portions || 1);
        totals.calories += (item.calories || 0) * mult;
        totals.protein += (item.protein || 0) * mult;
        totals.carbs += (item.carbs || 0) * mult;
        totals.fat += (item.fat || 0) * mult;
        totals.fiber += (item.fiber || 0) * mult;
      });
    });
    Object.keys(totals).forEach(k => totals[k] = Math.round(totals[k]));
    return totals;
  }

  function renderMacroBar(label, current, target, color) {
    const pct = Math.min((current / (target || 1)) * 100, 100);
    return `<div class="mb-md">
      <div class="flex justify-between items-center mb-sm">
        <span class="text-sm font-medium">${label}</span>
        <span class="text-xs text-muted">${current}g / ${target}g</span>
      </div>
      <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%;background:${color}"></div></div>
    </div>`;
  }

  function renderRings(consumed, target) {
    const el = document.getElementById('dash-rings');
    if (!el) return;
    el.innerHTML = '<div id="ring-cal"></div><div id="ring-prot"></div><div id="ring-carb"></div><div id="ring-fat"></div>';
    Charts.createRing($('#ring-cal'), { value: consumed.calories, max: target.calories, size: 110, stroke: 10, color: 'var(--clr-calories)', sublabel: 'kcal' });
    Charts.createRing($('#ring-prot'), { value: consumed.protein, max: target.protein, size: 80, stroke: 8, color: 'var(--clr-protein)', sublabel: 'Protein' });
    Charts.createRing($('#ring-carb'), { value: consumed.carbs, max: target.carbs, size: 80, stroke: 8, color: 'var(--clr-carbs)', sublabel: 'Carbs' });
    Charts.createRing($('#ring-fat'), { value: consumed.fat, max: target.fat, size: 80, stroke: 8, color: 'var(--clr-fat)', sublabel: 'Fat' });
  }

  function renderDonut(consumed) {
    const el = document.getElementById('dash-donut');
    if (!el) return;
    const total = consumed.protein + consumed.carbs + consumed.fat;
    if (total === 0) { el.innerHTML = '<span class="text-muted text-sm">No data yet</span>'; return; }
    Charts.createDonut(el, { segments: [
      { value: consumed.protein, color: 'var(--clr-protein)' },
      { value: consumed.carbs, color: 'var(--clr-carbs)' },
      { value: consumed.fat, color: 'var(--clr-fat)' }
    ], size: 80, stroke: 10 });
  }

  function renderStreak() {
    let streak = 0;
    for (let i = 1; i <= 30; i++) {
      const log = NutriStore.getObject('log_' + Helpers.daysAgo(i));
      if (log && log.meals && Object.values(log.meals).some(m => m.length > 0)) streak++;
      else break;
    }
    // Check today
    const todayLog = NutriStore.getObject('log_' + today());
    if (todayLog && todayLog.meals && Object.values(todayLog.meals).some(m => m.length > 0)) streak++;
    const dots = Array.from({length:7}, (_, i) => `<div class="streak-dot ${i < Math.min(streak,7) ? 'filled' : ''}"></div>`).join('');
    return `<div class="streak-card">
      <div class="streak-number">${streak}</div>
      <div class="streak-info">
        <h4>${streak === 0 ? 'Start your streak!' : streak === 1 ? '1 day streak' : streak + ' day streak'}</h4>
        <p class="text-sm text-muted">${streak >= 7 ? '🔥 Amazing consistency!' : streak >= 3 ? '💪 Keep it up!' : 'Log your meals daily!'}</p>
        <div class="streak-days">${dots}</div>
      </div>
    </div>`;
  }

  function renderMeals(log) {
    const el = document.getElementById('dash-meals');
    if (!el) return;
    const mealTypes = [
      { key: 'breakfast', icon: '🌅', label: 'Breakfast' },
      { key: 'lunch', icon: '☀️', label: 'Lunch' },
      { key: 'snack', icon: '🍪', label: 'Snacks' },
      { key: 'dinner', icon: '🌙', label: 'Dinner' }
    ];
    el.innerHTML = mealTypes.map(mt => {
      const items = (log.meals && log.meals[mt.key]) || [];
      const totalCals = items.reduce((s, i) => s + (i.calories || 0) * (i.portions || 1), 0);
      return `<div class="meal-slot card-sm">
        <div class="meal-slot-header" data-action="log" data-meal="${mt.key}">
          <h4>${mt.icon} ${mt.label}</h4>
          <span class="meal-slot-cals">${items.length ? Math.round(totalCals) + ' kcal' : 'No items'}</span>
        </div>
        ${items.length ? `<div class="meal-slot-items">${items.map(item => `
          <div class="meal-food-item">
            <div><div class="meal-food-name">${item.emoji || '🍽️'} ${escapeHTML(item.name)}</div>
            <div class="meal-food-detail">${item.servingUnit || ''} × ${item.portions || 1}</div></div>
            <div class="logged-food-cals">${Math.round((item.calories||0)*(item.portions||1))} kcal</div>
          </div>`).join('')}</div>` : ''}
      </div>`;
    }).join('');
  }

  function renderWeeklyChart() {
    const el = document.getElementById('dash-weekly-chart');
    if (!el) return;
    const dates = Helpers.getWeekDates();
    const profile = NutriStore.getObject('profile');
    const target = profile.targetCalories || 2000;
    const data = dates.map(d => {
      const log = NutriStore.getObject('log_' + d);
      const consumed = calcConsumed(log);
      return { label: dayName(d), value: consumed.calories, color: consumed.calories > target ? 'var(--clr-warning)' : 'var(--clr-primary)' };
    });
    Charts.createBarChart(el, { data, height: 180 });
  }

  function bindActions(container) {
    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        const meal = e.currentTarget.dataset.meal;
        if (action === 'log') App.navigate('logger', meal ? { meal } : {});
        else if (action === 'water') App.navigate('hydration');
        else if (action === 'plan') App.navigate('planner');
        else if (action === 'insights') App.navigate('insights');
      });
    });
  }

  return { render, calcConsumed };
})();
