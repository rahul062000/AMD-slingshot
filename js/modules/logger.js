/* ============================================================
   Nutrilite — Food Logger Module
   Search, log, manage daily food entries
   ============================================================ */
const Logger = (() => {
  'use strict';
  const { $, $$, escapeHTML, sanitizeInput, today, debounce, uid, showToast } = Helpers;
  let activeMeal = 'breakfast';
  let selectedFood = null;

  function render(container, params = {}) {
    if (params.meal) activeMeal = params.meal;
    else activeMeal = Helpers.getMealTimeSlot();
    const log = getLog();
    const profile = NutriStore.getObject('profile');
    const consumed = Dashboard.calcConsumed(log);
    const target = profile.targetCalories || 2000;
    container.innerHTML = `
      <h2 class="mb-md animate-fade-in-up">Food Logger</h2>
      <div class="card mb-lg animate-fade-in-up stagger-1">
        <div class="flex justify-between items-center mb-md">
          <span class="text-sm text-muted">Today's intake</span>
          <span class="font-bold" style="color:var(--clr-calories)">${consumed.calories} / ${target} kcal</span>
        </div>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${Math.min(consumed.calories/target*100,100)}%;background:var(--grad-primary)"></div></div>
      </div>
      <div class="card mb-lg animate-fade-in-up stagger-2">
        <div class="search-container">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <div class="flex" style="width:100%">
            <input type="text" class="search-input" id="food-search" placeholder="Search foods... (e.g. chicken, banana, rice)" autocomplete="off" maxlength="100" style="flex:1; border-top-right-radius:0; border-bottom-right-radius:0;">
            <label class="btn btn-secondary" style="border-top-left-radius:0; border-bottom-left-radius:0; cursor:pointer; display:flex; align-items:center;">
              📸 Scan
              <input type="file" id="ai-scan-upload" accept="image/*" style="display:none;">
            </label>
          </div>
          <div class="search-results" id="search-results"></div>
        </div>
        <div class="meal-type-selector">
          ${['breakfast','lunch','snack','dinner'].map(m => `
            <button class="meal-type-btn ${activeMeal===m?'active':''}" data-meal="${m}">
              ${{breakfast:'🌅',lunch:'☀️',snack:'🍪',dinner:'🌙'}[m]} ${m.charAt(0).toUpperCase()+m.slice(1)}
            </button>`).join('')}
        </div>
      </div>
      <div class="card mb-lg animate-fade-in-up stagger-3">
        <div class="card-header">
          <h4 class="card-title">${{breakfast:'🌅 Breakfast',lunch:'☀️ Lunch',snack:'🍪 Snacks',dinner:'🌙 Dinner'}[activeMeal]}</h4>
          <span class="text-xs text-muted" id="meal-cal-total"></span>
        </div>
        <div id="meal-items"></div>
      </div>
      <div class="card animate-fade-in-up stagger-4">
        <div class="card-header"><h4 class="card-title">⭐ Quick Add</h4></div>
        <div class="favorites-grid" id="quick-add-grid"></div>
      </div>
      <div class="modal-overlay" id="portion-modal">
        <div class="modal">
          <div class="modal-header">
            <h3 id="portion-food-name">Select Portion</h3>
            <button class="modal-close" id="portion-close">✕</button>
          </div>
          <div id="portion-content"></div>
        </div>
      </div>`;
    bindSearch();
    bindMealTabs(container);
    renderMealItems();
    renderQuickAdd();
  }

  function getLog() {
    return NutriStore.getObject('log_' + today(), { meals: { breakfast:[], lunch:[], snack:[], dinner:[] } });
  }
  function saveLog(log) { NutriStore.set('log_' + today(), log); }

  function bindSearch() {
    const input = $('#food-search');
    const results = $('#search-results');
    if (!input || !results) return;
    const doSearch = debounce((q) => {
      const items = FoodDB.search(sanitizeInput(q), 8);
      if (!items.length) { results.classList.remove('show'); return; }
      results.innerHTML = items.map(f => `
        <div class="search-result-item" data-food-id="${f.id}">
          <div>
            <div class="search-result-name">${f.emoji} ${escapeHTML(f.name)}</div>
            <div class="search-result-serving">${escapeHTML(f.servingUnit)}</div>
          </div>
          <span class="search-result-cal">${f.calories} kcal</span>
        </div>`).join('');
      results.classList.add('show');
      results.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const food = FoodDB.getById(item.dataset.foodId);
          if (food) openPortionModal(food);
          results.classList.remove('show');
          input.value = '';
        });
      });
    }, 200);
    input.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      if (q.length < 2) { results.classList.remove('show'); return; }
      doSearch(q);
    });
    input.addEventListener('blur', () => setTimeout(() => results.classList.remove('show'), 200));
    input.addEventListener('focus', () => { if (input.value.trim().length >= 2) doSearch(input.value.trim()); });

    $('#ai-scan-upload')?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        showToast('🤖 AI is analyzing image...', 'info');
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const base64Image = event.target.result;
            const aiData = await GeminiAI.analyzeFoodImage(base64Image);
            const aiFood = {
              id: 'ai_' + Date.now(),
              name: aiData.mealName || 'AI Food',
              emoji: '✨',
              calories: aiData.estimatedCalories || 0,
              protein: aiData.macros?.protein || 0,
              carbs: aiData.macros?.carbs || 0,
              fat: aiData.macros?.fat || 0,
              serving: 1,
              servingUnit: 'serving'
            };
            openPortionModal(aiFood);
            showToast('✅ AI Analysis complete!', 'success');
          } catch (err) {
            showToast(err.message || 'AI analysis failed', 'error');
          }
        };
        reader.readAsDataURL(file);
      } catch (err) {
        showToast('Error reading image', 'error');
      }
    });
  }

  function openPortionModal(food) {
    selectedFood = food;
    const modal = $('#portion-modal');
    const nameEl = $('#portion-food-name');
    const content = $('#portion-content');
    if (!modal || !content) return;
    if (nameEl) nameEl.textContent = food.emoji + ' ' + food.name;
    content.innerHTML = `
      <p class="text-sm text-muted mb-md">${escapeHTML(food.servingUnit)} — ${food.calories} kcal</p>
      <div class="portion-modal-grid">
        ${[{s:'🥄',l:'Half',m:0.5},{s:'🍽️',l:'1 Serving',m:1},{s:'🥣',l:'1.5x',m:1.5},{s:'🍲',l:'2 Servings',m:2},{s:'🥘',l:'3 Servings',m:3},{s:'✏️',l:'Custom',m:0}].map((p,i) => `
          <div class="portion-option ${p.m===1?'selected':''}" data-mult="${p.m}">
            <div class="size">${p.s}</div>
            <div class="label">${p.l}</div>
            ${p.m > 0 ? `<div class="text-xs text-muted mt-sm">${Math.round(food.calories*p.m)} kcal</div>` : ''}
          </div>`).join('')}
      </div>
      <div id="custom-portion-wrap" class="hidden mb-md">
        <label class="input-label">Number of servings</label>
        <input type="number" class="input" id="custom-portions" min="0.25" max="10" step="0.25" value="1">
      </div>
      <button class="btn btn-primary btn-block btn-lg" id="add-food-btn">Add to ${activeMeal.charAt(0).toUpperCase()+activeMeal.slice(1)}</button>`;
    let selectedMult = 1;
    content.querySelectorAll('.portion-option').forEach(opt => {
      opt.addEventListener('click', () => {
        content.querySelectorAll('.portion-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedMult = parseFloat(opt.dataset.mult);
        const customWrap = $('#custom-portion-wrap');
        if (selectedMult === 0) { customWrap.classList.remove('hidden'); }
        else { customWrap.classList.add('hidden'); }
      });
    });
    content.querySelector('#add-food-btn').addEventListener('click', () => {
      let portions = selectedMult;
      if (portions === 0) {
        portions = parseFloat($('#custom-portions')?.value || 1);
        if (!portions || portions <= 0 || portions > 10) { showToast('Enter valid portions (0.25-10)', 'warning'); return; }
      }
      addFood(food, portions);
      Helpers.closeModal('portion-modal');
    });
    $('#portion-close').addEventListener('click', () => Helpers.closeModal('portion-modal'));
    Helpers.openModal('portion-modal');
  }

  function addFood(food, portions) {
    const log = getLog();
    if (!log.meals) log.meals = { breakfast:[], lunch:[], snack:[], dinner:[] };
    if (!log.meals[activeMeal]) log.meals[activeMeal] = [];
    log.meals[activeMeal].push({
      id: uid(), foodId: food.id, name: food.name, emoji: food.emoji,
      calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat, fiber: food.fiber,
      servingUnit: food.servingUnit, portions: portions, addedAt: new Date().toISOString()
    });
    saveLog(log);
    renderMealItems();
    showToast(`${food.emoji} ${food.name} added!`, 'success');
    // Save to recents
    const recents = NutriStore.getArray('recents');
    if (!recents.find(r => r.id === food.id)) {
      recents.unshift({ id: food.id, count: 1 });
      if (recents.length > 20) recents.pop();
      NutriStore.set('recents', recents);
    } else {
      const r = recents.find(r => r.id === food.id);
      if (r) r.count++;
      NutriStore.set('recents', recents);
    }
  }

  function removeFood(itemId) {
    const log = getLog();
    if (!log.meals || !log.meals[activeMeal]) return;
    log.meals[activeMeal] = log.meals[activeMeal].filter(i => i.id !== itemId);
    saveLog(log);
    renderMealItems();
    showToast('Food removed', 'warning');
  }

  function renderMealItems() {
    const container = $('#meal-items');
    const totalEl = $('#meal-cal-total');
    if (!container) return;
    const log = getLog();
    const items = (log.meals && log.meals[activeMeal]) || [];
    if (!items.length) {
      container.innerHTML = '<div class="empty-state"><p class="text-muted">No foods logged yet. Search above to add!</p></div>';
      if (totalEl) totalEl.textContent = '0 kcal';
      return;
    }
    const totalCals = items.reduce((s, i) => s + (i.calories||0) * (i.portions||1), 0);
    if (totalEl) totalEl.textContent = Math.round(totalCals) + ' kcal';
    container.innerHTML = items.map(item => `
      <div class="logged-food-item">
        <div class="logged-food-emoji">${item.emoji || '🍽️'}</div>
        <div class="logged-food-info">
          <h5>${escapeHTML(item.name)}</h5>
          <p>${escapeHTML(item.servingUnit || '')} × ${item.portions}</p>
          <div class="logged-food-macros">
            <span class="macro-p">P ${Math.round((item.protein||0)*(item.portions||1))}g</span>
            <span class="macro-c">C ${Math.round((item.carbs||0)*(item.portions||1))}g</span>
            <span class="macro-f">F ${Math.round((item.fat||0)*(item.portions||1))}g</span>
          </div>
        </div>
        <div class="logged-food-cals">${Math.round((item.calories||0)*(item.portions||1))}<br><span class="text-xs text-muted">kcal</span></div>
        <button class="logged-food-remove" data-remove="${item.id}" title="Remove">✕</button>
      </div>`).join('');
    container.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => removeFood(btn.dataset.remove));
    });
  }

  function renderQuickAdd() {
    const grid = $('#quick-add-grid');
    if (!grid) return;
    const recents = NutriStore.getArray('recents').slice(0, 8);
    let foods;
    if (recents.length >= 4) {
      foods = recents.map(r => FoodDB.getById(r.id)).filter(Boolean);
    } else {
      foods = FoodDB.getRandom(8);
    }
    grid.innerHTML = foods.map(f => `
      <div class="favorite-item" data-food-id="${f.id}">
        <div class="emoji">${f.emoji}</div>
        <div class="name">${escapeHTML(f.name)}</div>
        <div class="cals">${f.calories} kcal</div>
      </div>`).join('');
    grid.querySelectorAll('.favorite-item').forEach(item => {
      item.addEventListener('click', () => {
        const food = FoodDB.getById(item.dataset.foodId);
        if (food) openPortionModal(food);
      });
    });
  }

  function bindMealTabs(container) {
    container.querySelectorAll('.meal-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.meal-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeMeal = btn.dataset.meal;
        renderMealItems();
      });
    });
  }

  return { render };
})();
