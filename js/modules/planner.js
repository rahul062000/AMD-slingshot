/* ============================================================
   NutriSense — Meal Planner Module
   Weekly meal planner with auto-generation
   ============================================================ */
const Planner = (() => {
  'use strict';
  const { $, escapeHTML, showToast, getWeekDates, dayName, formatDate, today } = Helpers;
  let weekOffset = 0;

  function render(container) {
    const weekDates = getWeekDates(weekOffset);
    const profile = NutriStore.getObject('profile');
    container.innerHTML = `
      <div class="flex justify-between items-center mb-lg animate-fade-in-up">
        <h2>Meal Planner</h2>
        <div class="flex gap-sm">
          <button class="btn btn-sm btn-secondary" id="plan-prev">← Prev</button>
          <button class="btn btn-sm btn-secondary" id="plan-today">Today</button>
          <button class="btn btn-sm btn-secondary" id="plan-next">Next →</button>
        </div>
      </div>
      <div class="auto-plan-banner animate-fade-in-up stagger-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <div>
          <h4>Auto-Generate Meal Plan</h4>
          <p>Create a balanced meal plan based on your ${profile.targetCalories || 2000} kcal daily target</p>
        </div>
        <button class="btn btn-primary" id="auto-plan-btn">Generate</button>
      </div>
      <div class="planner-week animate-fade-in-up stagger-2" id="planner-grid"></div>
      <div class="grid grid-2 mt-lg">
        <div class="card animate-fade-in-up stagger-3">
          <div class="card-header"><h4 class="card-title">🛒 Shopping List</h4>
            <button class="btn btn-sm btn-outline" id="gen-shopping">Generate</button>
          </div>
          <div id="shopping-list"></div>
        </div>
        <div class="card animate-fade-in-up stagger-4">
          <div class="card-header"><h4 class="card-title">📊 Week Summary</h4></div>
          <div id="week-summary"></div>
        </div>
      </div>`;
    renderWeekGrid(weekDates);
    renderWeekSummary(weekDates);
    bindEvents(container, weekDates);
  }

  function renderWeekGrid(dates) {
    const grid = $('#planner-grid');
    if (!grid) return;
    const mealSlots = ['breakfast','lunch','snack','dinner'];
    const mealIcons = {breakfast:'🌅',lunch:'☀️',snack:'🍪',dinner:'🌙'};
    grid.innerHTML = dates.map(d => {
      const isToday = d === today();
      const plan = NutriStore.getObject('plan_' + d, {});
      return `<div class="planner-day ${isToday ? 'today' : ''}">
        <div class="planner-day-header">${dayName(d)}<br><span class="text-xs">${formatDate(d,'medium')}</span></div>
        ${mealSlots.map(slot => {
          const items = plan[slot] || [];
          return items.length ? items.map(item =>
            `<div class="planner-meal-item">
              <div class="meal-label">${mealIcons[slot]} ${slot}</div>
              <div class="text-xs">${item.emoji||''} ${escapeHTML(item.name)}</div>
            </div>`).join('') :
            `<button class="planner-add-btn" data-date="${d}" data-slot="${slot}">+ ${slot}</button>`;
        }).join('')}
      </div>`;
    }).join('');
    grid.querySelectorAll('.planner-add-btn').forEach(btn => {
      btn.addEventListener('click', () => openAddToPlan(btn.dataset.date, btn.dataset.slot));
    });
  }

  function openAddToPlan(date, slot) {
    const foods = FoodDB.getRandom(6);
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'plan-add-modal';
    modal.innerHTML = `<div class="modal">
      <div class="modal-header">
        <h3>Add to ${slot} — ${dayName(date)}</h3>
        <button class="modal-close" id="plan-add-close">✕</button>
      </div>
      <div class="search-container">
        <input type="text" class="input" id="plan-food-search" placeholder="Search food..." maxlength="100" autocomplete="off">
      </div>
      <div id="plan-food-results" class="mb-md">
        ${foods.map(f => `<div class="list-item" data-fid="${f.id}">
          <span>${f.emoji} ${escapeHTML(f.name)}</span>
          <span class="text-xs text-muted">${f.calories} kcal</span>
        </div>`).join('')}
      </div>
    </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#plan-add-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    const searchInput = modal.querySelector('#plan-food-search');
    const resultsDiv = modal.querySelector('#plan-food-results');
    searchInput.addEventListener('input', Helpers.debounce(() => {
      const q = Helpers.sanitizeInput(searchInput.value);
      const results = q.length >= 2 ? FoodDB.search(q, 6) : FoodDB.getRandom(6);
      resultsDiv.innerHTML = results.map(f => `<div class="list-item" data-fid="${f.id}">
        <span>${f.emoji} ${escapeHTML(f.name)}</span>
        <span class="text-xs text-muted">${f.calories} kcal</span>
      </div>`).join('');
      bindPlanItems(resultsDiv, date, slot, modal);
    }, 200));
    bindPlanItems(resultsDiv, date, slot, modal);
  }

  function bindPlanItems(resultsDiv, date, slot, modal) {
    resultsDiv.querySelectorAll('.list-item').forEach(item => {
      item.addEventListener('click', () => {
        const food = FoodDB.getById(item.dataset.fid);
        if (!food) return;
        const plan = NutriStore.getObject('plan_' + date, {});
        if (!plan[slot]) plan[slot] = [];
        plan[slot].push({ foodId: food.id, name: food.name, emoji: food.emoji, calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat });
        NutriStore.set('plan_' + date, plan);
        modal.remove();
        showToast(`Added ${food.name} to ${slot}`, 'success');
        render(document.getElementById('page-content'));
      });
    });
  }

  function autoGenerate(dates) {
    const profile = NutriStore.getObject('profile');
    const targetCal = profile.targetCalories || 2000;
    const allFoods = FoodDB.getAll();
    const meals = allFoods.filter(f => f.category === 'meals');
    const grains = allFoods.filter(f => f.category === 'grains');
    const proteins = allFoods.filter(f => f.category === 'protein');
    const fruits = allFoods.filter(f => f.category === 'fruits');
    const snacks = allFoods.filter(f => f.category === 'snacks');
    dates.forEach(d => {
      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
      const mkItem = (f) => ({ foodId:f.id, name:f.name, emoji:f.emoji, calories:f.calories, protein:f.protein, carbs:f.carbs, fat:f.fat });
      const plan = {
        breakfast: [mkItem(pick(grains)), mkItem(pick(fruits))],
        lunch: [mkItem(pick(meals))],
        snack: [mkItem(pick(snacks))],
        dinner: [mkItem(pick(meals.concat(proteins)))]
      };
      NutriStore.set('plan_' + d, plan);
    });
    showToast('Meal plan generated! 🎉', 'success');
  }

  function generateShoppingList(dates) {
    const el = $('#shopping-list');
    if (!el) return;
    const items = {};
    dates.forEach(d => {
      const plan = NutriStore.getObject('plan_' + d, {});
      Object.values(plan).forEach(slot => {
        (slot || []).forEach(item => {
          if (items[item.name]) items[item.name].count++;
          else items[item.name] = { name: item.name, emoji: item.emoji, count: 1 };
        });
      });
    });
    const list = Object.values(items);
    if (!list.length) { el.innerHTML = '<p class="text-muted text-sm">Generate a meal plan first</p>'; return; }
    el.innerHTML = `<div class="shopping-list">${list.map(i =>
      `<div class="shopping-item">
        <div class="shopping-check" onclick="this.classList.toggle('checked');this.closest('.shopping-item').classList.toggle('checked-item')"></div>
        <span class="shopping-item-name">${i.emoji||''} ${escapeHTML(i.name)} × ${i.count}</span>
      </div>`).join('')}</div>`;
  }

  function renderWeekSummary(dates) {
    const el = $('#week-summary');
    if (!el) return;
    let totalCal = 0, totalP = 0, totalC = 0, totalF = 0, daysPlanned = 0;
    dates.forEach(d => {
      const plan = NutriStore.getObject('plan_' + d, {});
      const hasPlan = Object.values(plan).some(s => s && s.length > 0);
      if (hasPlan) daysPlanned++;
      Object.values(plan).forEach(slot => {
        (slot || []).forEach(item => {
          totalCal += item.calories || 0;
          totalP += item.protein || 0;
          totalC += item.carbs || 0;
          totalF += item.fat || 0;
        });
      });
    });
    el.innerHTML = `
      <div class="stat mb-md"><div class="stat-value text-primary">${daysPlanned}/7</div><div class="stat-label">Days Planned</div></div>
      <div class="stat mb-md"><div class="stat-value" style="color:var(--clr-calories)">${Math.round(totalCal/Math.max(daysPlanned,1))}</div><div class="stat-label">Avg Daily Calories</div></div>
      <div class="flex gap-md mt-md">
        <div class="stat"><div class="stat-value text-sm" style="color:var(--clr-protein)">${Math.round(totalP/Math.max(daysPlanned,1))}g</div><div class="stat-label">Protein</div></div>
        <div class="stat"><div class="stat-value text-sm" style="color:var(--clr-carbs)">${Math.round(totalC/Math.max(daysPlanned,1))}g</div><div class="stat-label">Carbs</div></div>
        <div class="stat"><div class="stat-value text-sm" style="color:var(--clr-fat)">${Math.round(totalF/Math.max(daysPlanned,1))}g</div><div class="stat-label">Fat</div></div>
      </div>`;
  }

  function bindEvents(container, dates) {
    $('#plan-prev')?.addEventListener('click', () => { weekOffset--; render(container); });
    $('#plan-next')?.addEventListener('click', () => { weekOffset++; render(container); });
    $('#plan-today')?.addEventListener('click', () => { weekOffset = 0; render(container); });
    $('#auto-plan-btn')?.addEventListener('click', () => { autoGenerate(dates); render(container); });
    $('#gen-shopping')?.addEventListener('click', () => generateShoppingList(dates));
  }

  return { render };
})();
