/* ============================================================
   NutriSense — App Core
   Router, navigation, initialization, security headers
   ============================================================ */
const App = (() => {
  'use strict';
  const { $, $$, escapeHTML } = Helpers;
  let currentPage = 'dashboard';

  const PAGES = {
    dashboard: { title: 'Dashboard', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>', render: (c, p) => Dashboard.render(c, p) },
    logger:    { title: 'Food Log', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>', render: (c, p) => Logger.render(c, p) },
    planner:   { title: 'Planner', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>', render: (c, p) => Planner.render(c, p) },
    insights:  { title: 'Insights', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>', render: (c, p) => Insights.render(c, p) },
    hydration: { title: 'Water', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>', render: (c, p) => Hydration.render(c, p) },
    profile:   { title: 'Profile', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', render: (c, p) => Profile.render(c, p) }
  };

  function init() {
    renderShell();
    navigate('dashboard');
    setupCSP();
  }

  function renderShell() {
    const app = document.getElementById('app');
    if (!app) return;
    const profile = NutriStore.getObject('profile');
    app.innerHTML = `
      <nav class="sidebar hide-mobile" id="sidebar">
        <div class="sidebar-brand">
          <div class="card-icon">🥗</div>
          <h2>NutriSense</h2>
        </div>
        <div class="sidebar-nav" id="sidebar-nav">
          ${Object.entries(PAGES).map(([key, p]) => `
            <a href="#" class="sidebar-link ${key === currentPage ? 'active' : ''}" data-page="${key}">
              ${p.icon}<span>${p.title}</span>
            </a>`).join('')}
        </div>
        <div class="sidebar-footer">
          <div class="flex items-center gap-sm">
            <div class="avatar">${(profile.name || 'U').charAt(0).toUpperCase()}</div>
            <div>
              <div class="text-sm font-medium truncate">${escapeHTML(profile.name || 'User')}</div>
              <div class="text-xs text-muted">${profile.targetCalories || 2000} kcal/day</div>
            </div>
          </div>
        </div>
      </nav>
      <div class="main-content">
        <header class="topbar">
          <div class="flex items-center gap-sm">
            <button class="btn btn-icon hide-desktop" id="menu-toggle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <h1 class="topbar-title" id="topbar-title">Dashboard</h1>
          </div>
          <div class="topbar-actions">
            <button class="btn btn-sm btn-primary ripple" data-page="logger">+ Log Food</button>
          </div>
        </header>
        <div class="page-content" id="page-content"></div>
      </div>
      <nav class="mobile-nav hide-desktop" id="mobile-nav">
        <div class="mobile-nav-items">
          ${Object.entries(PAGES).slice(0, 5).map(([key, p]) => `
            <button class="mobile-nav-item ${key === currentPage ? 'active' : ''}" data-page="${key}">
              ${p.icon}<span>${p.title}</span>
            </button>`).join('')}
        </div>
      </nav>`;
    bindNavigation();
  }

  function bindNavigation() {
    // Sidebar links
    $$('[data-page]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(el.dataset.page);
        // Close mobile sidebar
        const sidebar = $('#sidebar');
        if (sidebar) sidebar.classList.remove('open');
      });
    });
    // Menu toggle
    $('#menu-toggle')?.addEventListener('click', () => {
      const sidebar = $('#sidebar');
      if (sidebar) sidebar.classList.toggle('open');
    });
    // Close sidebar on overlay click (mobile)
    document.addEventListener('click', (e) => {
      const sidebar = $('#sidebar');
      if (sidebar?.classList.contains('open') && !sidebar.contains(e.target) && e.target.id !== 'menu-toggle') {
        sidebar.classList.remove('open');
      }
    });
  }

  function navigate(page, params = {}) {
    if (!PAGES[page]) return;
    currentPage = page;
    // Update active states
    $$('.sidebar-link').forEach(l => l.classList.toggle('active', l.dataset.page === page));
    $$('.mobile-nav-item').forEach(l => l.classList.toggle('active', l.dataset.page === page));
    // Update title
    const titleEl = $('#topbar-title');
    if (titleEl) titleEl.textContent = PAGES[page].title;
    document.title = `NutriSense — ${PAGES[page].title}`;
    // Render page with transition
    const content = $('#page-content');
    if (!content) return;
    content.classList.add('page-transition-enter');
    content.innerHTML = '';
    requestAnimationFrame(() => {
      PAGES[page].render(content, params);
      requestAnimationFrame(() => content.classList.remove('page-transition-enter'));
    });
    // Scroll to top
    content.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // Basic CSP via meta tag (defense in depth)
  function setupCSP() {
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; img-src 'self' data:;";
      document.head.appendChild(meta);
    }
  }

  return { init, navigate };
})();

// ============================================================
// Boot
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  if (!Onboarding.isOnboarded()) {
    Onboarding.show();
  } else {
    App.init();
  }
});
