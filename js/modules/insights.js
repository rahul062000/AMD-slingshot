/* ============================================================
   NutriSense — Insights Module
   Weekly report, tips, achievements, recommendations
   ============================================================ */
const Insights = (() => {
  'use strict';
  const { $, escapeHTML, today, daysAgo, getWeekDates } = Helpers;

  function render(container) {
    const profile = NutriStore.getObject('profile');
    const weekData = getWeekData();
    const score = getWeeklyScore(weekData, profile);
    const grade = NutriCalc.scoreToGrade(score);
    const tips = generateTips(weekData, profile);
    const achievements = getAchievements();
    const recs = getRecommendations(profile);

    container.innerHTML = `
      <h2 class="mb-lg animate-fade-in-up">Insights & Reports</h2>
      <div class="grid grid-2 mb-lg">
        <div class="card animate-fade-in-up stagger-1">
          <div class="card-header"><h4 class="card-title">📊 Weekly Report Card</h4></div>
          <div class="text-center mb-lg">
            <div class="report-grade grade-${grade.toLowerCase()}" style="margin:0 auto;width:80px;height:80px;font-size:var(--fs-2xl)">${grade}</div>
            <h3 class="mt-md">${score >= 75 ? 'Great week!' : score >= 50 ? 'Good effort!' : 'Room to improve'}</h3>
            <p class="text-sm text-muted">Overall score: ${score}/100</p>
          </div>
          <div class="report-card-grid">
            ${renderGradeCard('Calories', weekData.avgCalPct, 'var(--clr-calories)')}
            ${renderGradeCard('Protein', weekData.avgProtPct, 'var(--clr-protein)')}
            ${renderGradeCard('Consistency', weekData.consistency, 'var(--clr-primary)')}
            ${renderGradeCard('Balance', weekData.balance, 'var(--clr-info)')}
          </div>
        </div>
        <div class="card animate-fade-in-up stagger-2">
          <div class="card-header"><h4 class="card-title">💡 Smart Recommendations</h4></div>
          <div class="flex flex-col gap-md" id="recommendations">
            ${recs.map(r => `
              <div class="tip-card">
                <span style="font-size:1.5rem">${r.icon}</span>
                <div><h5>${escapeHTML(r.title)}</h5><p>${escapeHTML(r.text)}</p></div>
              </div>`).join('')}
          </div>
        </div>
      </div>
      <div class="card mb-lg animate-fade-in-up stagger-3">
        <div class="card-header"><h4 class="card-title">🍽️ What Should I Eat Next?</h4>
          <button class="btn btn-sm btn-primary" id="refresh-suggest">Refresh</button>
        </div>
        <div id="smart-suggestions" class="grid grid-3"></div>
      </div>
      <div class="grid grid-2 mb-lg">
        <div class="card animate-fade-in-up stagger-4">
          <div class="card-header"><h4 class="card-title">📈 7-Day Calorie Trend</h4></div>
          <div id="calorie-trend" style="height:160px"></div>
        </div>
        <div class="card animate-fade-in-up stagger-5">
          <div class="card-header"><h4 class="card-title">📈 7-Day Protein Trend</h4></div>
          <div id="protein-trend" style="height:160px"></div>
        </div>
      </div>
      <div class="card animate-fade-in-up stagger-5">
        <div class="card-header"><h4 class="card-title">🏆 Achievements</h4></div>
        <div class="achievement-grid">${achievements.map(a => `
          <div class="achievement ${a.unlocked ? 'unlocked' : 'locked'}">
            <div class="icon">${a.icon}</div>
            <div class="name">${escapeHTML(a.name)}</div>
          </div>`).join('')}
        </div>
      </div>
      <div class="card mt-lg animate-fade-in-up stagger-6">
        <div class="card-header"><h4 class="card-title">🔄 Healthier Swaps</h4></div>
        <div id="swaps-list" class="flex flex-col gap-sm"></div>
      </div>`;
    renderSmartSuggestions();
    renderTrends(weekData);
    renderSwaps();
    $('#refresh-suggest')?.addEventListener('click', renderSmartSuggestions);
  }

  function getWeekData() {
    const profile = NutriStore.getObject('profile');
    const target = profile.targetCalories || 2000;
    const macroTarget = profile.macros || { protein: 150, carbs: 200, fat: 65 };
    let totalCal = 0, totalP = 0, totalC = 0, totalF = 0, daysLogged = 0;
    const dailyCals = [], dailyProt = [];
    for (let i = 6; i >= 0; i--) {
      const d = daysAgo(i);
      const log = NutriStore.getObject('log_' + d);
      const consumed = Dashboard.calcConsumed(log);
      dailyCals.push(consumed.calories);
      dailyProt.push(consumed.protein);
      if (consumed.calories > 0) { daysLogged++; totalCal += consumed.calories; totalP += consumed.protein; totalC += consumed.carbs; totalF += consumed.fat; }
    }
    const days = Math.max(daysLogged, 1);
    const avgCal = totalCal / days;
    const avgP = totalP / days;
    return {
      dailyCals, dailyProt, daysLogged,
      avgCalPct: Math.round((avgCal / target) * 100),
      avgProtPct: Math.round((avgP / macroTarget.protein) * 100),
      consistency: Math.round((daysLogged / 7) * 100),
      balance: Math.round(Math.min((avgP / macroTarget.protein) * 100, 100)),
      avgCal: Math.round(avgCal), avgP: Math.round(avgP)
    };
  }

  function getWeeklyScore(data, profile) {
    const calScore = Math.max(0, 100 - Math.abs(100 - data.avgCalPct));
    const protScore = Math.max(0, 100 - Math.abs(100 - data.avgProtPct));
    const conScore = data.consistency;
    return Math.round((calScore + protScore + conScore + data.balance) / 4);
  }

  function renderGradeCard(label, pct, color) {
    const grade = NutriCalc.scoreToGrade(pct);
    return `<div>
      <div class="report-grade grade-${grade.toLowerCase()}" style="width:44px;height:44px;font-size:var(--fs-md)">${grade}</div>
      <div class="text-xs text-muted mt-sm">${label}</div>
      <div class="text-xs font-medium">${pct}%</div>
    </div>`;
  }

  function generateTips(weekData, profile) {
    const tips = [];
    if (weekData.avgCalPct < 80) tips.push({ icon: '🍽️', title: 'Eat More', text: `You're averaging ${weekData.avgCal} kcal — ${Math.round(profile.targetCalories * 0.8)} kcal minimum recommended.` });
    if (weekData.avgCalPct > 120) tips.push({ icon: '⚠️', title: 'Watch Calories', text: 'You\'re exceeding your calorie target. Try lighter meals.' });
    if (weekData.avgProtPct < 70) tips.push({ icon: '💪', title: 'Boost Protein', text: 'Add lean meats, eggs, or legumes to hit your protein goal.' });
    if (weekData.consistency < 60) tips.push({ icon: '📝', title: 'Log Consistently', text: 'Track meals daily for better insights and recommendations.' });
    if (tips.length === 0) tips.push({ icon: '🌟', title: 'Excellent Work!', text: 'You\'re on track. Keep up the great habits!' });
    return tips;
  }

  function getRecommendations(profile) {
    const recs = [];
    const todayLog = NutriStore.getObject('log_' + today());
    const consumed = Dashboard.calcConsumed(todayLog);
    const remaining = (profile.targetCalories || 2000) - consumed.calories;
    const remainProt = (profile.macros?.protein || 150) - consumed.protein;
    if (remaining > 500) recs.push({ icon: '🥗', title: 'Room for a meal', text: `You have ${remaining} kcal remaining today. Consider a balanced meal.` });
    if (remainProt > 30) recs.push({ icon: '🥩', title: 'Need more protein', text: `${remainProt}g protein to go. Try chicken, fish, or tofu.` });
    const h = new Date().getHours();
    if (h >= 7 && h < 10 && consumed.calories === 0) recs.push({ icon: '🌅', title: 'Start with breakfast', text: 'A good breakfast boosts metabolism and energy levels.' });
    if (h >= 20 && consumed.calories < (profile.targetCalories || 2000) * 0.5) recs.push({ icon: '🌙', title: 'Light dinner idea', text: 'Try a salad or grilled protein for a light evening meal.' });
    if (recs.length === 0) recs.push({ icon: '✅', title: 'On Track!', text: 'Your nutrition looks balanced today. Great job!' });
    return recs;
  }

  function renderSmartSuggestions() {
    const el = $('#smart-suggestions');
    if (!el) return;
    const profile = NutriStore.getObject('profile');
    const todayLog = NutriStore.getObject('log_' + today());
    const consumed = Dashboard.calcConsumed(todayLog);
    const remaining = (profile.targetCalories || 2000) - consumed.calories;
    const allFoods = FoodDB.getAll();
    const suitable = allFoods.filter(f => f.calories <= Math.max(remaining, 300) && f.calories >= 50).sort(() => Math.random() - 0.5).slice(0, 6);
    el.innerHTML = suitable.map(f => `
      <div class="card card-sm" style="cursor:pointer" data-suggest="${f.id}">
        <div class="text-center">
          <div style="font-size:2rem;margin-bottom:var(--sp-xs)">${f.emoji}</div>
          <h5 class="text-sm">${escapeHTML(f.name)}</h5>
          <p class="text-xs text-muted">${f.calories} kcal</p>
          <div class="flex justify-center gap-xs mt-sm">
            <span class="badge badge-primary text-xs">P${f.protein}g</span>
            <span class="badge badge-info text-xs">C${f.carbs}g</span>
          </div>
        </div>
      </div>`).join('');
    el.querySelectorAll('[data-suggest]').forEach(card => {
      card.addEventListener('click', () => App.navigate('logger'));
    });
  }

  function renderTrends(weekData) {
    const dates = Helpers.getWeekDates();
    const calData = dates.map((d, i) => ({ label: Helpers.dayName(d), value: weekData.dailyCals[i], color: 'var(--clr-calories)' }));
    const protData = dates.map((d, i) => ({ label: Helpers.dayName(d), value: weekData.dailyProt[i], color: 'var(--clr-protein)' }));
    Charts.createBarChart($('#calorie-trend'), { data: calData, height: 140 });
    Charts.createBarChart($('#protein-trend'), { data: protData, barColor: 'var(--clr-protein)', height: 140 });
  }

  function renderSwaps() {
    const el = $('#swaps-list');
    if (!el) return;
    const swaps = [
      { from: '🍦 Ice Cream', to: '🥛 Greek Yogurt', save: '~150 kcal' },
      { from: '🍟 French Fries', to: '🍠 Sweet Potato', save: '~200 kcal' },
      { from: '🥤 Soda', to: '💧 Sparkling Water', save: '~140 kcal' },
      { from: '🍞 White Bread', to: '🫓 Whole Wheat', save: 'More fiber' },
      { from: '🍕 Pizza', to: '🥗 Grilled Chicken Salad', save: '~300 kcal' },
      { from: '☕ Latte', to: '☕ Black Coffee', save: '~190 kcal' },
    ];
    el.innerHTML = swaps.map(s =>
      `<div class="flex items-center gap-md p-md" style="border-radius:var(--radius-md);background:var(--clr-bg-secondary)">
        <span class="text-sm">${s.from}</span>
        <span class="text-primary font-bold">→</span>
        <span class="text-sm font-medium">${s.to}</span>
        <span class="badge badge-primary" style="margin-left:auto">${s.save}</span>
      </div>`).join('');
  }

  function getAchievements() {
    let streak = 0;
    for (let i = 1; i <= 30; i++) {
      const log = NutriStore.getObject('log_' + daysAgo(i));
      if (log?.meals && Object.values(log.meals).some(m => m.length > 0)) streak++;
      else break;
    }
    const totalLogs = (() => { let c = 0; for (let i = 0; i < 90; i++) { const l = NutriStore.getObject('log_' + daysAgo(i)); if (l?.meals && Object.values(l.meals).some(m => m.length > 0)) c++; } return c; })();
    return [
      { icon: '🌱', name: 'First Log', unlocked: totalLogs >= 1 },
      { icon: '🔥', name: '3-Day Streak', unlocked: streak >= 3 },
      { icon: '⭐', name: '7-Day Streak', unlocked: streak >= 7 },
      { icon: '💎', name: '30-Day Streak', unlocked: streak >= 30 },
      { icon: '🥗', name: '10 Meals Logged', unlocked: totalLogs >= 3 },
      { icon: '🏆', name: '30 Days Tracked', unlocked: totalLogs >= 30 },
      { icon: '🧠', name: 'Nutrition Pro', unlocked: totalLogs >= 50 },
      { icon: '👑', name: 'Legend', unlocked: totalLogs >= 90 },
    ];
  }

  return { render };
})();
