/* ============================================================
   Nutrilite — Profile Module
   User settings, profile management, data export/reset
   ============================================================ */
const Profile = (() => {
  'use strict';
  const { $, escapeHTML, showToast, formatDate } = Helpers;

  function render(container) {
    const profile = NutriStore.getObject('profile');
    const bmi = NutriCalc.calcBMI(profile.weight || 70, profile.height || 170);
    const bmiCat = NutriCalc.getBMICategory(bmi);

    container.innerHTML = `
      <h2 class="mb-lg animate-fade-in-up">Profile & Settings</h2>
      <div class="card mb-lg animate-fade-in-up stagger-1">
        <div class="profile-header">
          <div class="profile-avatar-lg">${(profile.name || 'U').charAt(0).toUpperCase()}</div>
          <div>
            <h3>${escapeHTML(profile.name || 'User')}</h3>
            <p class="text-sm text-muted">Member since ${formatDate(profile.createdAt || new Date(), 'medium')}</p>
          </div>
        </div>
        <div class="profile-stats">
          <div class="profile-stat">
            <div class="value" style="color:var(--clr-calories)">${profile.targetCalories || '—'}</div>
            <div class="label">Daily Calories</div>
          </div>
          <div class="profile-stat">
            <div class="value" style="color:var(--clr-info)">${bmi}</div>
            <div class="label">BMI — <span style="color:${bmiCat.color}">${bmiCat.label}</span></div>
          </div>
          <div class="profile-stat">
            <div class="value text-primary">${profile.tdee || '—'}</div>
            <div class="label">TDEE</div>
          </div>
        </div>
      </div>
      <div class="grid grid-2 mb-lg">
        <div class="card animate-fade-in-up stagger-2">
          <h4 class="card-title mb-md">Body Info</h4>
          <div class="input-group mb-md">
            <label class="input-label">Name</label>
            <input type="text" class="input" id="p-name" value="${escapeHTML(profile.name || '')}" maxlength="50">
          </div>
          <div class="input-group mb-md">
            <label class="input-label">Age</label>
            <input type="number" class="input" id="p-age" value="${profile.age || 25}" min="10" max="120">
          </div>
          <div class="input-group mb-md">
            <label class="input-label">Weight (kg)</label>
            <input type="number" class="input" id="p-weight" value="${profile.weight || 70}" min="20" max="300" step="0.5">
          </div>
          <div class="input-group mb-md">
            <label class="input-label">Height (cm)</label>
            <input type="number" class="input" id="p-height" value="${profile.height || 170}" min="100" max="250">
          </div>
          <div class="input-group mb-md">
            <label class="input-label">Gender</label>
            <select class="input" id="p-gender">
              <option value="male" ${profile.gender==='male'?'selected':''}>Male</option>
              <option value="female" ${profile.gender==='female'?'selected':''}>Female</option>
            </select>
          </div>
          <button class="btn btn-primary btn-block" id="save-profile">Save Changes</button>
        </div>
        <div class="card animate-fade-in-up stagger-3">
          <h4 class="card-title mb-md">Goals & Activity</h4>
          <div class="input-group mb-md">
            <label class="input-label">Activity Level</label>
            <select class="input" id="p-activity">
              ${Object.entries(NutriCalc.ACTIVITY_MULTIPLIERS).map(([k]) =>
                `<option value="${k}" ${profile.activityLevel===k?'selected':''}>${k.charAt(0).toUpperCase()+k.slice(1).replace(/([A-Z])/g,' $1')}</option>`
              ).join('')}
            </select>
          </div>
          <div class="input-group mb-md">
            <label class="input-label">Goal</label>
            <select class="input" id="p-goal">
              <option value="lose" ${profile.goal==='lose'?'selected':''}>Lose Weight</option>
              <option value="mildLose" ${profile.goal==='mildLose'?'selected':''}>Mild Weight Loss</option>
              <option value="maintain" ${profile.goal==='maintain'?'selected':''}>Maintain</option>
              <option value="mildGain" ${profile.goal==='mildGain'?'selected':''}>Mild Weight Gain</option>
              <option value="gain" ${profile.goal==='gain'?'selected':''}>Build Muscle</option>
            </select>
          </div>
          <div class="card-sm mt-lg" style="background:var(--clr-bg-secondary);border-radius:var(--radius-md)">
            <h5 class="mb-md">Current Targets</h5>
            <div class="flex flex-col gap-sm text-sm">
              <div class="flex justify-between"><span class="text-muted">Calories</span><span class="font-bold" style="color:var(--clr-calories)">${profile.targetCalories || '—'} kcal</span></div>
              <div class="flex justify-between"><span class="text-muted">Protein</span><span class="font-bold" style="color:var(--clr-protein)">${profile.macros?.protein || '—'}g</span></div>
              <div class="flex justify-between"><span class="text-muted">Carbs</span><span class="font-bold" style="color:var(--clr-carbs)">${profile.macros?.carbs || '—'}g</span></div>
              <div class="flex justify-between"><span class="text-muted">Fat</span><span class="font-bold" style="color:var(--clr-fat)">${profile.macros?.fat || '—'}g</span></div>
              <div class="flex justify-between"><span class="text-muted">Water</span><span class="font-bold" style="color:var(--clr-water)">${profile.waterTarget || '—'}ml</span></div>
            </div>
          </div>
        </div>
      </div>
      <div class="card animate-fade-in-up stagger-4">
        <h4 class="card-title mb-md">⚙️ Data Management</h4>
        <div class="settings-group">
          <div class="setting-item">
            <div><div class="setting-item-label">Export Data</div><div class="setting-item-desc">Download all your data as JSON</div></div>
            <button class="btn btn-sm btn-outline" id="export-data">Export</button>
          </div>
          <div class="setting-item">
            <div><div class="setting-item-label" style="color:var(--clr-danger)">Reset All Data</div><div class="setting-item-desc">Delete all logs, plans, and settings</div></div>
            <button class="btn btn-sm btn-danger" id="reset-data">Reset</button>
          </div>
        </div>
      </div>`;
    bindEvents();
  }

  function bindEvents() {
    $('#save-profile')?.addEventListener('click', () => {
      const profile = NutriStore.getObject('profile');
      const name = Helpers.sanitizeInput($('#p-name')?.value || '', 50);
      const age = parseInt($('#p-age')?.value || 25);
      const weight = parseFloat($('#p-weight')?.value || 70);
      const height = parseFloat($('#p-height')?.value || 170);
      const gender = $('#p-gender')?.value || 'male';
      const activityLevel = $('#p-activity')?.value || 'moderate';
      const goal = $('#p-goal')?.value || 'maintain';
      if (!name) { showToast('Please enter your name', 'warning'); return; }
      if (age < 10 || age > 120) { showToast('Invalid age', 'warning'); return; }
      if (weight < 20 || weight > 300) { showToast('Invalid weight', 'warning'); return; }
      if (height < 100 || height > 250) { showToast('Invalid height', 'warning'); return; }
      const updated = { ...profile, name, age, weight, height, gender, activityLevel, goal };
      const calc = NutriCalc.calculateProfile(updated);
      Object.assign(updated, calc);
      updated.waterTarget = NutriCalc.calcWaterTarget(weight, activityLevel);
      NutriStore.set('profile', updated);
      showToast('Profile saved! 🎉', 'success');
      render(document.getElementById('page-content'));
    });

    $('#export-data')?.addEventListener('click', () => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('nutrilite_')) data[key] = localStorage.getItem(key);
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `nutrilite-backup-${Helpers.today()}.json`; a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported!', 'success');
    });

    $('#reset-data')?.addEventListener('click', () => {
      if (confirm('⚠️ This will permanently delete ALL your data. Are you sure?')) {
        NutriStore.clear();
        showToast('All data cleared', 'warning');
        location.reload();
      }
    });
  }

  return { render };
})();
