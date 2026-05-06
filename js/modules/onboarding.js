/* ============================================================
   Nutrilite — Onboarding Module
   Multi-step profile setup wizard
   ============================================================ */
const Onboarding = (() => {
  'use strict';
  const { $, escapeHTML, showToast } = Helpers;
  let currentStep = 0;
  let profileData = { name:'', age:25, gender:'male', weight:70, height:170, activityLevel:'moderate', goal:'maintain', dietPrefs:[] };
  const DIET_OPTIONS = [
    { id:'none', icon:'🍽️', label:'No Restriction' },
    { id:'vegetarian', icon:'🥬', label:'Vegetarian' },
    { id:'vegan', icon:'🌱', label:'Vegan' },
    { id:'keto', icon:'🥑', label:'Keto' },
    { id:'glutenFree', icon:'🌾', label:'Gluten Free' },
    { id:'halal', icon:'☪️', label:'Halal' },
    { id:'paleo', icon:'🥩', label:'Paleo' },
    { id:'lactoseFree', icon:'🥛', label:'Lactose Free' }
  ];
  const GOAL_OPTIONS = [
    { id:'lose', icon:'📉', label:'Lose Weight' },
    { id:'mildLose', icon:'⬇️', label:'Mild Weight Loss' },
    { id:'maintain', icon:'⚖️', label:'Maintain Weight' },
    { id:'mildGain', icon:'⬆️', label:'Mild Weight Gain' },
    { id:'gain', icon:'💪', label:'Build Muscle' }
  ];
  const ACTIVITY_OPTIONS = [
    { id:'sedentary', icon:'🪑', label:'Sedentary' },
    { id:'light', icon:'🚶', label:'Lightly Active' },
    { id:'moderate', icon:'🏃', label:'Moderately Active' },
    { id:'active', icon:'🏋️', label:'Very Active' },
    { id:'veryActive', icon:'🔥', label:'Extremely Active' }
  ];

  function render() {
    const overlay = document.getElementById('onboarding-overlay');
    if (!overlay) return;
    overlay.innerHTML = `<div class="onboarding-card animate-scale-in">
      <div class="onboarding-progress" id="ob-progress"></div>
      <div id="ob-steps"></div>
    </div>`;
    renderProgress();
    renderStep();
  }

  function renderProgress() {
    const prog = document.getElementById('ob-progress');
    if (!prog) return;
    prog.innerHTML = Array.from({length:5}, (_, i) =>
      `<div class="onboarding-dot ${i <= currentStep ? 'filled' : ''}"></div>`
    ).join('');
  }

  function renderStep() {
    const container = document.getElementById('ob-steps');
    if (!container) return;
    const steps = [renderWelcome, renderBasicInfo, renderBodyStats, renderActivity, renderGoalDiet];
    container.innerHTML = '';
    const stepEl = document.createElement('div');
    stepEl.className = 'onboarding-step active animate-fade-in-up';
    steps[currentStep](stepEl);
    container.appendChild(stepEl);
  }

  function renderWelcome(el) {
    el.innerHTML = `
      <div class="text-center" style="margin-bottom:var(--sp-xl)">
        <div style="font-size:4rem;margin-bottom:var(--sp-md)" class="animate-float">🥗</div>
        <h2 class="text-gradient">Welcome to Nutrilite</h2>
        <p style="margin-top:var(--sp-sm)">Your smart companion for healthier eating habits. Let's set up your profile in just a few steps.</p>
      </div>
      <div class="input-group mb-md">
        <label class="input-label">What's your name?</label>
        <input type="text" class="input" id="ob-name" placeholder="Enter your name" value="${escapeHTML(profileData.name)}" maxlength="50" autocomplete="off">
      </div>
      <div class="onboarding-actions">
        <button class="btn btn-primary btn-block btn-lg" id="ob-next">Get Started →</button>
      </div>`;
    el.querySelector('#ob-next').addEventListener('click', () => {
      const name = Helpers.sanitizeInput(el.querySelector('#ob-name').value, 50);
      if (!name) { showToast('Please enter your name', 'warning'); return; }
      profileData.name = name;
      nextStep();
    });
    el.querySelector('#ob-name').addEventListener('keydown', e => { if (e.key === 'Enter') el.querySelector('#ob-next').click(); });
  }

  function renderBasicInfo(el) {
    el.innerHTML = `
      <h2>About You</h2>
      <p>Help us personalize your nutrition plan.</p>
      <div class="input-group mb-md">
        <label class="input-label">Age</label>
        <input type="number" class="input" id="ob-age" min="10" max="120" value="${profileData.age}">
      </div>
      <div class="input-group mb-md">
        <label class="input-label">Gender</label>
        <div class="onboarding-options" style="grid-template-columns:repeat(2,1fr)">
          <div class="onboarding-option ${profileData.gender==='male'?'selected':''}" data-val="male">
            <div class="icon">👨</div><div class="label">Male</div>
          </div>
          <div class="onboarding-option ${profileData.gender==='female'?'selected':''}" data-val="female">
            <div class="icon">👩</div><div class="label">Female</div>
          </div>
        </div>
      </div>
      <div class="onboarding-actions">
        <button class="btn btn-secondary" id="ob-back">← Back</button>
        <button class="btn btn-primary" id="ob-next">Continue →</button>
      </div>`;
    el.querySelectorAll('[data-val]').forEach(opt => {
      opt.addEventListener('click', () => {
        el.querySelectorAll('[data-val]').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        profileData.gender = opt.dataset.val;
      });
    });
    el.querySelector('#ob-back').addEventListener('click', prevStep);
    el.querySelector('#ob-next').addEventListener('click', () => {
      const age = parseInt(el.querySelector('#ob-age').value);
      if (!age || age < 10 || age > 120) { showToast('Enter a valid age (10-120)', 'warning'); return; }
      profileData.age = age;
      nextStep();
    });
  }

  function renderBodyStats(el) {
    el.innerHTML = `
      <h2>Body Measurements</h2>
      <p>We use this to calculate your nutrition targets.</p>
      <div class="input-group mb-md">
        <label class="input-label">Weight (kg)</label>
        <input type="number" class="input" id="ob-weight" min="20" max="300" step="0.5" value="${profileData.weight}">
      </div>
      <div class="input-group mb-md">
        <label class="input-label">Height (cm)</label>
        <input type="number" class="input" id="ob-height" min="100" max="250" value="${profileData.height}">
      </div>
      <div class="onboarding-actions">
        <button class="btn btn-secondary" id="ob-back">← Back</button>
        <button class="btn btn-primary" id="ob-next">Continue →</button>
      </div>`;
    el.querySelector('#ob-back').addEventListener('click', prevStep);
    el.querySelector('#ob-next').addEventListener('click', () => {
      const w = parseFloat(el.querySelector('#ob-weight').value);
      const h = parseFloat(el.querySelector('#ob-height').value);
      if (!w || w < 20 || w > 300) { showToast('Enter valid weight', 'warning'); return; }
      if (!h || h < 100 || h > 250) { showToast('Enter valid height', 'warning'); return; }
      profileData.weight = w; profileData.height = h;
      nextStep();
    });
  }

  function renderActivity(el) {
    el.innerHTML = `
      <h2>Activity Level</h2>
      <p>How active are you on a typical day?</p>
      <div class="onboarding-options">
        ${ACTIVITY_OPTIONS.map(a => `
          <div class="onboarding-option ${profileData.activityLevel===a.id?'selected':''}" data-val="${a.id}">
            <div class="icon">${a.icon}</div><div class="label">${escapeHTML(a.label)}</div>
          </div>`).join('')}
      </div>
      <div class="onboarding-actions">
        <button class="btn btn-secondary" id="ob-back">← Back</button>
        <button class="btn btn-primary" id="ob-next">Continue →</button>
      </div>`;
    el.querySelectorAll('[data-val]').forEach(opt => {
      opt.addEventListener('click', () => {
        el.querySelectorAll('[data-val]').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        profileData.activityLevel = opt.dataset.val;
      });
    });
    el.querySelector('#ob-back').addEventListener('click', prevStep);
    el.querySelector('#ob-next').addEventListener('click', nextStep);
  }

  function renderGoalDiet(el) {
    el.innerHTML = `
      <h2>Goals & Preferences</h2>
      <p>What's your primary goal?</p>
      <div class="onboarding-options mb-lg">
        ${GOAL_OPTIONS.map(g => `
          <div class="onboarding-option goal-opt ${profileData.goal===g.id?'selected':''}" data-val="${g.id}">
            <div class="icon">${g.icon}</div><div class="label">${escapeHTML(g.label)}</div>
          </div>`).join('')}
      </div>
      <h4 class="mb-md">Dietary Preferences</h4>
      <div class="flex gap-sm" style="flex-wrap:wrap;margin-bottom:var(--sp-lg)">
        ${DIET_OPTIONS.map(d => `
          <div class="chip ${profileData.dietPrefs.includes(d.id)?'selected':''}" data-diet="${d.id}">
            ${d.icon} ${escapeHTML(d.label)}
          </div>`).join('')}
      </div>
      <div class="onboarding-actions">
        <button class="btn btn-secondary" id="ob-back">← Back</button>
        <button class="btn btn-primary btn-lg" id="ob-finish">🚀 Start My Journey</button>
      </div>`;
    el.querySelectorAll('.goal-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        el.querySelectorAll('.goal-opt').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        profileData.goal = opt.dataset.val;
      });
    });
    el.querySelectorAll('[data-diet]').forEach(chip => {
      chip.addEventListener('click', () => {
        const id = chip.dataset.diet;
        chip.classList.toggle('selected');
        if (profileData.dietPrefs.includes(id)) {
          profileData.dietPrefs = profileData.dietPrefs.filter(d => d !== id);
        } else {
          profileData.dietPrefs.push(id);
        }
      });
    });
    el.querySelector('#ob-back').addEventListener('click', prevStep);
    el.querySelector('#ob-finish').addEventListener('click', finishOnboarding);
  }

  function nextStep() { if (currentStep < 4) { currentStep++; renderProgress(); renderStep(); } }
  function prevStep() { if (currentStep > 0) { currentStep--; renderProgress(); renderStep(); } }

  function finishOnboarding() {
    const calc = NutriCalc.calculateProfile(profileData);
    const profile = { ...profileData, ...calc, createdAt: Helpers.today(), waterTarget: NutriCalc.calcWaterTarget(profileData.weight, profileData.activityLevel) };
    NutriStore.set('profile', profile);
    NutriStore.set('onboarded', true);
    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) { overlay.style.opacity = '0'; setTimeout(() => { overlay.remove(); App.init(); }, 400); }
    showToast(`Welcome, ${escapeHTML(profileData.name)}! 🎉`, 'success');
  }

  function isOnboarded() { return NutriStore.get('onboarded', false); }

  function show() {
    const overlay = document.createElement('div');
    overlay.id = 'onboarding-overlay';
    overlay.className = 'onboarding-overlay';
    document.body.appendChild(overlay);
    render();
  }

  return { show, isOnboarded };
})();
