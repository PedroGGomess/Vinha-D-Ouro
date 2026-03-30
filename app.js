/* ============================================================================
   VINHA D'OURO — Premium Wine Management System
   app.js · Unified Frontend Logic v3.0
   ============================================================================
   Autores: Pedro Gomes, Eduardo Lourenço, Kollan Intacua
   Universidade Lusófona — Grupo 13
   ============================================================================ */

const API = 'http://localhost:8080/api';

/* ══════════════════════════════════════════════
   1. SESSION / AUTH
   ══════════════════════════════════════════════ */
const Session = {
  key: 'vd_session',
  save(user)  { try { localStorage.setItem(this.key, JSON.stringify(user)); } catch(e) {} },
  get()       { try { return JSON.parse(localStorage.getItem(this.key) || 'null'); } catch(e) { return null; } },
  clear()     { try { localStorage.removeItem(this.key); } catch(e) {} },

  pagesAuth: {
    'gerente.html':            ['GERENTE','ADMIN'],
    'gerente-vendas.html':     ['GERENTE','ADMIN'],
    'gerente-relatorios.html': ['GERENTE','ADMIN'],
    'gerente-equipa.html':     ['GERENTE','ADMIN'],
    // provas removidas do sistema
    'caves.html':              ['ARMAZENISTA','GERENTE','ADMIN'],
    'loja.html':               ['FUNCIONARIO','GERENTE','ADMIN'],
    'stock.html':              ['ARMAZENISTA','GERENTE','ADMIN'],
  },

  guard() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const allowed = this.pagesAuth[page];
    if (!allowed) return;
    const user = this.get();
    if (!user || !allowed.includes(user.role)) {
      window.location.href = 'index.html';
      return;
    }
    const av = document.getElementById('user-avatar');
    const nm = document.getElementById('user-name');
    if (av) av.textContent = (user.nome || 'U').charAt(0).toUpperCase();
    if (nm) nm.textContent = user.nome || 'Utilizador';
  }
};

/* ══════════════════════════════════════════════
   DYNAMIC SIDEBAR BUILDER
   ══════════════════════════════════════════════ */
function buildSidebar() {
  const user = Session.get();
  if (!user) return;

  const path = window.location.pathname.split('/').pop() || 'index.html';
  if (path === 'index.html' || path === '' || path === '/') return;

  const role = user.role;

  // Map roles to display labels and subtitles
  const roleDisplay = {
    'GERENTE': { title: 'GERENTE', subtitle: 'Acesso Total' },
    'ADMIN': { title: 'ADMIN', subtitle: 'Acesso Total' },
    'FUNCIONARIO': { title: 'LOJA', subtitle: 'Funcionário' },
    'ARMAZENISTA': { title: 'ARMAZÉM', subtitle: 'Armazenista' }
  };

  // Define navigation structure for each role
  const navStructure = {
    'GERENTE': {
      sections: [
        {
          label: 'GERÊNCIA',
          items: [
            { href: 'gerente.html', label: 'Dashboard', icon: 'dashboard' },
            { href: 'gerente-vendas.html', label: 'Vendas', icon: 'vendas' },
            { href: 'gerente-relatorios.html', label: 'Relatórios', icon: 'relatorios' },
            { href: 'gerente-equipa.html', label: 'Equipa', icon: 'equipa' }
          ]
        },
        {
          label: 'OPERAÇÕES',
          items: [
            { href: 'loja.html', label: 'Loja', icon: 'loja' },
            { href: 'stock.html', label: 'Stock', icon: 'stock' },
            { href: 'caves.html', label: 'Caves', icon: 'caves' },
          ]
        }
      ]
    },
    'ADMIN': {
      sections: [
        {
          label: 'GERÊNCIA',
          items: [
            { href: 'gerente.html', label: 'Dashboard', icon: 'dashboard' },
            { href: 'gerente-vendas.html', label: 'Vendas', icon: 'vendas' },
            { href: 'gerente-relatorios.html', label: 'Relatórios', icon: 'relatorios' },
            { href: 'gerente-equipa.html', label: 'Equipa', icon: 'equipa' }
          ]
        },
        {
          label: 'OPERAÇÕES',
          items: [
            { href: 'loja.html', label: 'Loja', icon: 'loja' },
            { href: 'stock.html', label: 'Stock', icon: 'stock' },
            { href: 'caves.html', label: 'Caves', icon: 'caves' },
          ]
        }
      ]
    },
    'FUNCIONARIO': {
      sections: [
        {
          label: 'Vendas',
          items: [
            { href: 'loja.html', label: 'Catálogo', icon: 'loja' },
          ]
        }
      ]
    },
    'ARMAZENISTA': {
      sections: [
        {
          label: 'Inventário',
          items: [
            { href: 'stock.html', label: 'Stock', icon: 'stock' },
            { href: 'caves.html', label: 'Caves', icon: 'caves' }
          ]
        }
      ]
    }
  };

  // Icon SVG templates
  const iconSvgs = {
    dashboard: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5 12 3"></polyline><polyline points="12 12 20 7.5"></polyline><polyline points="12 12 12 21"></polyline><polyline points="12 12 4 7.5"></polyline></svg>',
    vendas: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
    relatorios: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
    equipa: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 00-3-3.87"></path><path d="M16 3.13a4 4 0 010 7.75"></path></svg>',
    loja: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path></svg>',
    stock: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"></path></svg>',
    caves: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M2 12h20M7 7h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z"></path></svg>',
    provas: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 10c0 1.104.896 2 2 2s2-.896 2-2c0-1.105-.896-2-2-2s-2 .895-2 2z"></path><path d="M17 10c0 1.104.896 2 2 2s2-.896 2-2c0-1.105-.896-2-2-2s-2 .895-2 2z"></path><path d="M12 20v-8M7 12v8M17 12v8M7 20h10M4 8h16M6 3h12a3 3 0 013 3v2H3V6a3 3 0 013-3z"></path></svg>'
  };

  const display = roleDisplay[role];
  if (!display) return;

  // Update brand subtitle
  const brandSubtitle = document.querySelector('.brand-subtitle');
  if (brandSubtitle) {
    brandSubtitle.textContent = display.title;
  }

  // Update user role display
  const userRole = document.querySelector('.user-role');
  if (userRole) {
    userRole.textContent = display.subtitle;
  }

  // Determine if we're on a gerente page (has <aside> with sidebar-nav)
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  const isGerentePage = sidebar.tagName === 'ASIDE';

  if (isGerentePage) {
    // Rebuild the sidebar-nav for gerente pages (uses <ul><li> structure)
    const sidebarNav = sidebar.querySelector('.sidebar-nav');
    if (!sidebarNav) return;

    // Clear existing nav items but keep section labels we'll rebuild them
    const existingItems = sidebarNav.querySelectorAll('.sidebar-nav-item');
    const existingLabels = sidebarNav.querySelectorAll('.nav-section-label');
    existingItems.forEach(item => item.remove());
    existingLabels.forEach(label => label.remove());

    // Get the nav structure for this role
    const structure = navStructure[role];
    if (!structure) return;

    // Rebuild sections
    structure.sections.forEach(section => {
      // Add section label
      const label = document.createElement('p');
      label.className = 'nav-section-label';
      label.textContent = section.label;
      sidebarNav.appendChild(label);

      // Create UL for items
      const ul = document.createElement('ul');
      ul.className = 'sidebar-nav-list';

      section.items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'sidebar-nav-item';

        const a = document.createElement('a');
        a.href = item.href;
        a.className = 'nav-link';
        if (item.href === path) {
          a.classList.add('active');
          a.setAttribute('aria-current', 'page');
        }

        a.innerHTML = `${iconSvgs[item.icon] || ''}<span>${item.label}</span>`;
        li.appendChild(a);
        ul.appendChild(li);
      });

      sidebarNav.appendChild(ul);
    });
  } else {
    // Rebuild sidebar for non-gerente pages (uses direct <a> links)
    const sidebarNav = sidebar.querySelector('.sidebar-nav');
    if (!sidebarNav) return;

    // Clear existing nav items
    const existingLinks = sidebarNav.querySelectorAll('.nav-link');
    const existingLabels = sidebarNav.querySelectorAll('.nav-section-label');
    existingLinks.forEach(link => link.remove());
    existingLabels.forEach(label => label.remove());

    // Get the nav structure for this role
    const structure = navStructure[role];
    if (!structure) return;

    // Rebuild sections
    structure.sections.forEach(section => {
      // Add section label
      const label = document.createElement('p');
      label.className = 'nav-section-label';
      label.textContent = section.label;
      sidebarNav.appendChild(label);

      section.items.forEach(item => {
        const a = document.createElement('a');
        a.href = item.href;
        a.className = 'nav-link';
        if (item.href === path) {
          a.classList.add('active');
        }

        // Use simple SVG with width/height for non-gerente pages (matching style)
        const iconHtml = item.icon === 'loja'
          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"></path></svg>'
          : item.icon === 'stock'
          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>'
          : item.icon === 'caves'
          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H7a2 2 0 0 1-2-2V9.414a1 1 0 0 1 .293-.707l5.414-5.414a1 1 0 0 1 1.414 0l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2h-2"></path><rect x="9" y="9" width="6" height="12"></rect></svg>'
          : item.icon === 'provas'
          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h12v5c0 1-1 2-2 2H8c-1 0-2-1-2-2V4z"></path><path d="M9 9v11M15 9v11"></path><circle cx="12" cy="20" r="1"></circle></svg>'
          : '';

        a.innerHTML = `${iconHtml}<span>${item.label}</span>`;
        sidebarNav.appendChild(a);
      });
    });
  }
}

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const main = document.querySelector('.main-content');
  if (sidebar) {
    sidebar.classList.toggle('collapsed');
    if (main) {
      main.style.marginLeft = sidebar.classList.contains('collapsed') ? '64px' : '';
    }
  }
}

function logout() {
  Screensaver.stop();
  Session.clear();
  window.location.href = 'index.html';
}

/* ══════════════════════════════════════════════
   2. LOGIN
   ══════════════════════════════════════════════ */
async function handleLogin(e) {
  if (e) e.preventDefault();
  const username = (document.getElementById('login-username') || document.getElementById('username'))?.value?.trim();
  const password = (document.getElementById('login-password') || document.getElementById('password'))?.value;
  const btn      = document.getElementById('login-btn') || document.querySelector('.btn-login');
  const errorEl  = document.getElementById('login-error') || document.getElementById('loginError');

  if (!username || !password) { showLoginError('Preencha todos os campos'); return; }
  if (btn) { btn.disabled = true; btn.textContent = 'A verificar...'; }
  if (errorEl) { errorEl.style.display = 'none'; errorEl.classList.remove('show'); }

  try {
    const res  = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Credenciais inválidas');
    Session.save(data);
    window.location.href = data.redirect;
  } catch(err) {
    showLoginError(err.message || 'Erro de ligação ao servidor');
    if (btn) { btn.disabled = false; btn.textContent = 'ENTRAR'; }
  }
}

function showLoginError(msg) {
  const el = document.getElementById('login-error') || document.getElementById('loginError');
  if (!el) return;
  const span = el.querySelector('span');
  if (span) span.textContent = msg;
  else el.textContent = msg;
  el.style.display = 'block';
  el.classList.add('show');
}

function fillLogin(user, pass) {
  const u = document.getElementById('login-username') || document.getElementById('username');
  if (u) u.value = user;
  const p = document.getElementById('login-password') || document.getElementById('password');
  if (p) p.value = pass;
  const e = document.getElementById('login-error') || document.getElementById('loginError');
  if (e) { e.style.display = 'none'; e.classList.remove('show'); }
}

/* ══════════════════════════════════════════════
   2b. LOGIN PAGE INIT
   ══════════════════════════════════════════════ */
function initLogin() {
  // If already logged in, redirect
  const session = Session.get();
  if (session && session.redirect) { window.location.href = session.redirect; return; }

  // Hook into existing form (supports both old and new HTML IDs)
  const form = document.getElementById('loginForm') || document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', handleLogin);
  }

  // Show demo credentials hint if role cards exist
  const roleSection = document.getElementById('roleSection');
  if (roleSection) roleSection.classList.remove('show');
}

/* ══════════════════════════════════════════════
   3. API HELPERS
   ══════════════════════════════════════════════ */
let apiOnline = false;

async function checkApi() {
  try {
    const r = await fetch(`${API}/health`, { signal: AbortSignal.timeout(2500) });
    apiOnline = r.ok;
  } catch { apiOnline = false; }
  updateApiBadge();
  return apiOnline;
}

function updateApiBadge() {
  const badge = document.getElementById('api-badge');
  const label = document.getElementById('api-label');
  if (badge) {
    badge.className = apiOnline ? 'api-badge online' : 'api-badge offline';
  }
  if (label) label.textContent = apiOnline ? 'BD Ligada' : 'Offline (Demo)';
  // POS status dot
  const dot = document.getElementById('api-dot');
  if (dot) dot.className = apiOnline ? 'status-dot' : 'status-dot off';
}

async function apiFetch(path, opts = {}) {
  const r = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' }, ...opts
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

/* ══════════════════════════════════════════════
   4. TOAST NOTIFICATIONS
   ══════════════════════════════════════════════ */
function toast(msg, type = 'success', ms = 3500) {
  const c = document.getElementById('toasts'); if (!c) return;
  const icons = {
    success: '<polyline points="20 6 9 17 4 12"/>',
    error:   '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    warning: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/>',
    info:    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  };
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icons[type] || icons.info}</svg>${msg}`;
  c.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, ms);
}

/* ══════════════════════════════════════════════
   5. FORMAT HELPERS
   ══════════════════════════════════════════════ */
const fmt = {
  eur:  v => `${(+v || 0).toFixed(2).replace('.', ',')} €`,
  num:  v => (v || 0).toLocaleString('pt-PT'),
  date: s => { if (!s) return '—'; try { return new Date(s).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch { return s; } },
  dt:   s => { if (!s) return '—'; try { return new Date(s).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return s; } },
};

function stockBar(qty, max = 100) {
  const pct = Math.min(100, (qty / Math.max(max, 1)) * 100);
  const cls = qty < 10 ? 'critical' : qty < 25 ? 'low' : qty < 50 ? 'ok' : 'high';
  return `<div class="stock-bar-wrap"><div class="stock-bar"><div class="stock-bar-fill ${cls}" style="width:${pct}%"></div></div><span class="stock-count">${qty}</span></div>`;
}

function statusBadge(s) {
  const map = {
    'CONCLUIDA': 'badge-success', 'CONCLUÍDA': 'badge-success',
    'PENDENTE': 'badge-warning', 'CANCELADA': 'badge-danger', 'CANCELADO': 'badge-danger',
    'ATIVO': 'badge-success', 'INATIVO': 'badge-muted',
    'GERENTE': 'badge-gold', 'ADMIN': 'badge-wine',
    'FUNCIONARIO': 'badge-info', 'ARMAZENISTA': 'badge-info',
  };
  const labels = {
    'CONCLUIDA': 'Concluída', 'CONCLUÍDA': 'Concluída', 'PENDENTE': 'Pendente',
    'CANCELADA': 'Cancelada', 'CANCELADO': 'Cancelado',
    'ATIVO': 'Ativo', 'INATIVO': 'Inativo', 'GERENTE': 'Gerente', 'ADMIN': 'Admin',
    'FUNCIONARIO': 'Funcionário', 'ARMAZENISTA': 'Armazenista',
  };
  const k = (s || '').toUpperCase();
  return `<span class="badge ${map[k] || 'badge-muted'}">${labels[k] || s || '—'}</span>`;
}

/* ══════════════════════════════════════════════
   6. SVG CHARTS
   ══════════════════════════════════════════════ */
function drawBarChart(svgId, labels, values, color = '#C9A227') {
  const svg = document.getElementById(svgId); if (!svg) return;
  svg.innerHTML = '';
  const W = 500, H = 200, padL = 40, padR = 16, padT = 16, padB = 36;
  const iW = W - padL - padR, iH = H - padT - padB, n = labels.length;
  const maxV = Math.max(...values, 1), step = iW / n, barW = Math.floor(step * 0.55);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  svg.appendChild(defs);

  // Grid lines
  for (let i = 0; i <= 4; i++) {
    const y = padT + (iH / 4) * i;
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    Object.entries({ x1: padL, x2: W - padR, y1: y, y2: y, stroke: 'rgba(255,255,255,0.04)', 'stroke-width': '1' })
      .forEach(([k, v]) => l.setAttribute(k, v));
    svg.appendChild(l);
  }

  // Bars with animation
  values.forEach((v, i) => {
    const x = padL + step * i + (step - barW) / 2;
    const bH = Math.max(v > 0 ? 3 : 1, (v / maxV) * iH);
    const y = padT + iH - bH;
    const gId = `g${svgId}${i}`;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    g.setAttribute('id', gId); g.setAttribute('x1', '0'); g.setAttribute('y1', '0'); g.setAttribute('x2', '0'); g.setAttribute('y2', '1');
    const s1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', color); s1.setAttribute('stop-opacity', '0.9');
    const s2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', color); s2.setAttribute('stop-opacity', '0.35');
    g.appendChild(s1); g.appendChild(s2); defs.appendChild(g);

    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    Object.entries({ x, y: padT + iH, width: barW, height: 0, rx: '4', fill: `url(#${gId})` })
      .forEach(([k, val]) => bar.setAttribute(k, val));
    svg.appendChild(bar);

    // Animate bar growing
    setTimeout(() => {
      bar.setAttribute('y', y);
      bar.setAttribute('height', bH);
      bar.style.transition = 'y 0.6s ease, height 0.6s ease';
    }, 80 * i);

    const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    Object.entries({ x: x + barW / 2, y: H - padB / 4, 'text-anchor': 'middle', 'font-size': '11', fill: 'rgba(168,153,142,0.7)', 'font-family': 'Inter,sans-serif' })
      .forEach(([k, val]) => lbl.setAttribute(k, val));
    lbl.textContent = labels[i]; svg.appendChild(lbl);
  });
}

function drawLineChart(svgId, labels, values, color = '#A83D4A') {
  const svg = document.getElementById(svgId); if (!svg) return;
  svg.innerHTML = '';
  const W = 500, H = 200, padL = 40, padR = 16, padT = 16, padB = 36;
  const iW = W - padL - padR, iH = H - padT - padB, n = labels.length;
  const maxV = Math.max(...values, 1), stepX = iW / (n - 1 || 1);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const ag = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  ag.setAttribute('id', `ag${svgId}`); ag.setAttribute('x1', '0'); ag.setAttribute('y1', '0'); ag.setAttribute('x2', '0'); ag.setAttribute('y2', '1');
  const as1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  as1.setAttribute('offset', '0%'); as1.setAttribute('stop-color', color); as1.setAttribute('stop-opacity', '0.22');
  const as2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  as2.setAttribute('offset', '100%'); as2.setAttribute('stop-color', color); as2.setAttribute('stop-opacity', '0.01');
  ag.appendChild(as1); ag.appendChild(as2); defs.appendChild(ag); svg.appendChild(defs);

  // Grid
  for (let i = 0; i <= 4; i++) {
    const y = padT + (iH / 4) * i;
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    Object.entries({ x1: padL, x2: W - padR, y1: y, y2: y, stroke: 'rgba(255,255,255,0.04)', 'stroke-width': '1' })
      .forEach(([k, v]) => l.setAttribute(k, v));
    svg.appendChild(l);
  }

  const pts = values.map((v, i) => ({ x: padL + stepX * i, y: padT + iH - (v / maxV) * iH }));

  // Area fill
  const aP = [`M ${pts[0].x} ${padT + iH}`, pts.map(p => `L ${p.x} ${p.y}`).join(' '), `L ${pts[pts.length - 1].x} ${padT + iH} Z`].join(' ');
  const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  area.setAttribute('d', aP); area.setAttribute('fill', `url(#ag${svgId})`);
  area.style.opacity = '0'; svg.appendChild(area);
  requestAnimationFrame(() => { area.style.transition = 'opacity 0.8s ease'; area.style.opacity = '1'; });

  // Smooth curve
  const smooth = pts.map((p, i) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = pts[i - 1], cx1 = prev.x + (p.x - prev.x) * 0.5, cx2 = p.x - (p.x - prev.x) * 0.5;
    return `C ${cx1},${prev.y} ${cx2},${p.y} ${p.x},${p.y}`;
  }).join(' ');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', smooth); path.setAttribute('fill', 'none');
  path.setAttribute('stroke', color); path.setAttribute('stroke-width', '2.5'); path.setAttribute('stroke-linecap', 'round');
  const totalLen = 1200;
  path.setAttribute('stroke-dasharray', totalLen); path.setAttribute('stroke-dashoffset', totalLen);
  svg.appendChild(path);
  requestAnimationFrame(() => { path.style.transition = 'stroke-dashoffset 1.2s ease'; path.setAttribute('stroke-dashoffset', '0'); });

  // Dots & labels
  pts.forEach((p, i) => {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    Object.entries({ cx: p.x, cy: p.y, r: '4', fill: color, stroke: 'rgba(10,4,6,0.9)', 'stroke-width': '2' })
      .forEach(([k, v]) => dot.setAttribute(k, v));
    dot.style.opacity = '0'; svg.appendChild(dot);
    setTimeout(() => { dot.style.transition = 'opacity 0.3s ease'; dot.style.opacity = '1'; }, 200 + 100 * i);

    const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    Object.entries({ x: p.x, y: H - padB / 4, 'text-anchor': 'middle', 'font-size': '11', fill: 'rgba(168,153,142,0.7)', 'font-family': 'Inter,sans-serif' })
      .forEach(([k, v]) => lbl.setAttribute(k, v));
    lbl.textContent = labels[i]; svg.appendChild(lbl);
  });
}

/* ══════════════════════════════════════════════
   7. SCREENSAVER / IDLE TIMEOUT
   ══════════════════════════════════════════════ */
const Screensaver = {
  IDLE_MS: 3 * 60 * 1000, // 3 minutes
  timer: null,
  active: false,
  animFrame: null,
  particles: [],

  init() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    if (page === 'index.html' || page === '' || page === '/') return;

    // Create overlay
    if (!document.getElementById('screensaver-overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'screensaver-overlay';
      overlay.innerHTML = `
        <canvas id="screensaver-canvas"></canvas>
        <div class="screensaver-content">
          <div class="screensaver-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" width="64" height="64">
              <path d="M8 22h8M12 11v11M7 11c0 2.8 2.2 5 5 5s5-2.2 5-5V3H7v8z"/><path d="M7 8h10"/>
            </svg>
          </div>
          <h2 class="screensaver-title">Vinha D'Ouro</h2>
          <p class="screensaver-subtitle">Premium Wine Management</p>
          <div class="screensaver-time" id="screensaver-clock"></div>
          <p class="screensaver-hint">Clique ou toque para continuar</p>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', () => this.dismiss());
      overlay.addEventListener('touchstart', () => this.dismiss());
    }

    // Listen for activity
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];
    events.forEach(ev => document.addEventListener(ev, () => this.resetTimer(), { passive: true }));

    this.resetTimer();
  },

  resetTimer() {
    if (this.active) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.activate(), this.IDLE_MS);
  },

  activate() {
    if (this.active) return;
    this.active = true;
    const overlay = document.getElementById('screensaver-overlay');
    if (!overlay) return;

    // Setup canvas
    const canvas = document.getElementById('screensaver-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.ctx = canvas.getContext('2d');

    // Create particles
    this.particles = [];
    const count = Math.min(60, Math.floor(window.innerWidth / 25));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.15,
        r: Math.random() * 2.5 + 0.8,
        alpha: Math.random() * 0.5 + 0.15,
        color: Math.random() > 0.5 ? '201,162,39' : '139,58,68', // gold or wine
      });
    }

    overlay.classList.add('active');
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
    this.animate();
  },

  animate() {
    if (!this.active) return;
    const { ctx, particles } = this;
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(201,162,39,${0.06 * (1 - dist / 140)})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();

      // Glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha * 0.12})`;
      ctx.fill();
    });

    this.animFrame = requestAnimationFrame(() => this.animate());
  },

  updateClock() {
    const el = document.getElementById('screensaver-clock');
    if (el) {
      const now = new Date();
      el.textContent = now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    }
  },

  dismiss() {
    if (!this.active) return;
    this.active = false;
    const overlay = document.getElementById('screensaver-overlay');
    if (overlay) overlay.classList.remove('active');
    cancelAnimationFrame(this.animFrame);
    clearInterval(this.clockInterval);
    this.resetTimer();
  },

  stop() {
    clearTimeout(this.timer);
    this.dismiss();
  }
};

/* ══════════════════════════════════════════════
   8. PAGE ENTRANCE ANIMATIONS
   ══════════════════════════════════════════════ */
function animateEntrance() {
  const elements = document.querySelectorAll('.kpi-card, .card, .team-card, .prova-card, .comparison-card, .wine-card');
  elements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    setTimeout(() => {
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 60 * i);
  });
}

/* ══════════════════════════════════════════════
   9. FALLBACK DATA (demo mode when server offline)
   ══════════════════════════════════════════════ */
const FALLBACK = {
  vinhos: [
    { id: 1, nome: "Quinta do Crasto Reserva", tipo: "Tinto", regiao: "Douro", produtor: "Quinta do Crasto", anoColheita: 2019, preco: 32.50, quantidade: 45 },
    { id: 2, nome: "Esporão Reserva Branco", tipo: "Branco", regiao: "Alentejo", produtor: "Herdade do Esporão", anoColheita: 2021, preco: 18.90, quantidade: 62 },
    { id: 3, nome: "Barca Velha", tipo: "Tinto", regiao: "Douro", produtor: "Casa Ferreirinha", anoColheita: 2011, preco: 185.00, quantidade: 8 },
    { id: 4, nome: "Niepoort Redoma Rosé", tipo: "Rosé", regiao: "Douro", produtor: "Niepoort", anoColheita: 2022, preco: 22.00, quantidade: 34 },
    { id: 5, nome: "Luís Pato Vinhas Velhas", tipo: "Tinto", regiao: "Bairrada", produtor: "Luís Pato", anoColheita: 2018, preco: 28.50, quantidade: 3 },
    { id: 6, nome: "Ramos Pinto Duas Quintas", tipo: "Tinto", regiao: "Douro", produtor: "Ramos Pinto", anoColheita: 2020, preco: 15.90, quantidade: 78 },
    { id: 7, nome: "Palhete Vinho Verde", tipo: "Branco", regiao: "Vinho Verde", produtor: "Adega Cooperativa", anoColheita: 2023, preco: 9.50, quantidade: 90 },
    { id: 8, nome: "Cockburn's 10 Anos Tawny", tipo: "Porto", regiao: "Porto", produtor: "Cockburn's", anoColheita: 2010, preco: 24.90, quantidade: 22 },
    { id: 9, nome: "Marta Sousa Puro", tipo: "Tinto", regiao: "Douro", produtor: "Marta Sousa", anoColheita: 2020, preco: 19.50, quantidade: 55 },
    { id: 10, nome: "Alvarinho Soalheiro", tipo: "Branco", regiao: "Vinho Verde", produtor: "Soalheiro", anoColheita: 2022, preco: 14.90, quantidade: 41 },
    { id: 11, nome: "Quinta Vale Meão", tipo: "Tinto", regiao: "Douro", produtor: "QVM", anoColheita: 2020, preco: 55.00, quantidade: 7 },
    { id: 12, nome: "Graham's LBV Porto", tipo: "Porto", regiao: "Porto", produtor: "W&J Graham's", anoColheita: 2018, preco: 18.50, quantidade: 30 },
  ],
  funcionarios: [
    { id: 1, nome: "António Ferreira", cargo: "Gerente", salario: 2800, dataAdmissao: "2022-01-15", ativo: 1, nivelAcesso: "GERENTE", email: "antonio@vinhadouro.pt" },
    { id: 2, nome: "Sofia Martins", cargo: "Operador POS", salario: 1200, dataAdmissao: "2023-03-01", ativo: 1, nivelAcesso: "FUNCIONARIO", email: "sofia@vinhadouro.pt" },
    { id: 3, nome: "João Rodrigues", cargo: "Armazenista", salario: 1150, dataAdmissao: "2023-06-15", ativo: 1, nivelAcesso: "ARMAZENISTA", email: "joao@vinhadouro.pt" },
    { id: 4, nome: "Maria Costa", cargo: "Operador POS", salario: 1200, dataAdmissao: "2024-01-10", ativo: 1, nivelAcesso: "FUNCIONARIO", email: "maria@vinhadouro.pt" },
  ],
  vendas: [
    { id: 1, codigo: "VD-0001", cliente: "Carlos Mendes", produto: "Barca Velha", metodoPagamento: "Cartão", total: 185.00, status: "CONCLUIDA", dataVenda: "2026-03-20 14:23" },
    { id: 2, codigo: "VD-0002", cliente: "Ana Pereira", produto: "Quinta do Crasto", metodoPagamento: "MB Way", total: 65.00, status: "CONCLUIDA", dataVenda: "2026-03-20 15:10" },
    { id: 3, codigo: "VD-0003", cliente: "Miguel Santos", produto: "Esporão Reserva", metodoPagamento: "Numerário", total: 37.80, status: "CONCLUIDA", dataVenda: "2026-03-19 11:45" },
    { id: 4, codigo: "VD-0004", cliente: "Inês Ferreira", produto: "Alvarinho Soalheiro", metodoPagamento: "Cartão", total: 29.80, status: "CONCLUIDA", dataVenda: "2026-03-19 16:30" },
    { id: 5, codigo: "VD-0005", cliente: "Pedro Nunes", produto: "Luís Pato", metodoPagamento: "Cartão", total: 57.00, status: "CONCLUIDA", dataVenda: "2026-03-18 10:15" },
    { id: 6, codigo: "VD-0006", cliente: "Carla Gomes", produto: "Niepoort Rosé", metodoPagamento: "MB Way", total: 44.00, status: "CONCLUIDA", dataVenda: "2026-03-17 13:20" },
    { id: 7, codigo: "VD-0007", cliente: "Rui Costa", produto: "Palhete Verde", metodoPagamento: "Cartão", total: 19.00, status: "CONCLUIDA", dataVenda: "2026-03-16 09:05" },
    { id: 8, codigo: "VD-0008", cliente: "Lídia Marques", produto: "Graham's Porto", metodoPagamento: "Numerário", total: 18.50, status: "CONCLUIDA", dataVenda: "2026-03-15 17:40" },
  ],
  dashboard: {
    receitaTotal: 466.10, vendas: 8, lucroLiquido: 158.47, ticketMedio: 58.26,
    stockCritico: 2, valorStock: 8391.21,
    vendasSemanais: [44, 0, 19, 57, 37.8, 65, 185],
    vendasLabels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
  }
};

/* ══════════════════════════════════════════════
   10. DASHBOARD
   ══════════════════════════════════════════════ */
async function loadDashboard() {
  await checkApi();
  let data;
  try { data = await apiFetch('/dashboard'); } catch { data = FALLBACK.dashboard; }

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('kpi-receita', fmt.eur(data.receitaTotal));
  set('kpi-vendas', data.vendas);
  set('kpi-lucro', fmt.eur(data.lucroLiquido));
  set('kpi-ticket', fmt.eur(data.ticketMedio));
  set('kpi-critico', data.stockCritico);
  set('kpi-stock', fmt.eur(data.valorStock));

  drawBarChart('chart-vendas', data.vendasLabels || ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Hj'], data.vendasSemanais || [0, 0, 0, 0, 0, 0, 0], '#C9A227');
  drawLineChart('chart-receita', ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'], [120, 185, 240, 180, 310, 420], '#A83D4A');

  // Recent sales
  let vendas;
  try { vendas = await apiFetch('/vendas'); } catch { vendas = FALLBACK.vendas; }
  renderVendasTable(document.getElementById('vendas-table'), vendas.slice(0, 6));

  // Top wines + stock alerts
  let vinhos;
  try { vinhos = await apiFetch('/vinhos'); } catch { vinhos = FALLBACK.vinhos; }

  const topWinesTbody = document.getElementById('dash-top-wines');
  if (topWinesTbody) {
    const sorted = [...vinhos].sort((a, b) => (b.preco * b.quantidade) - (a.preco * a.quantidade)).slice(0, 5);
    topWinesTbody.innerHTML = sorted.map((v, i) => `<tr>
      <td><span style="font-size:11px;color:var(--text-muted);margin-right:6px;font-family:var(--font-display);">${i + 1}</span><span style="font-weight:600;font-size:13px;">${v.nome}</span></td>
      <td><span class="badge badge-muted" style="font-size:10px;">${v.tipo || '—'}</span></td>
      <td><span style="font-family:var(--font-display);font-size:13px;font-weight:700;color:var(--text-gold);">${fmt.eur(v.preco)}</span></td>
      <td>${stockBar(v.quantidade || 0, 100)}</td>
    </tr>`).join('');
  }

  // Stock alerts
  const alertsEl = document.getElementById('dash-stock-alerts');
  if (alertsEl) {
    const critical = vinhos.filter(v => (v.quantidade || 0) < 10).sort((a, b) => (a.quantidade || 0) - (b.quantidade || 0));
    if (!critical.length) {
      alertsEl.innerHTML = `<div style="display:flex;align-items:center;gap:10px;padding:14px;background:var(--success-bg);border:1px solid var(--success-border);border-radius:var(--r-md);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span style="font-size:13px;color:var(--success);">Todos os vinhos com stock adequado</span></div>`;
    } else {
      alertsEl.innerHTML = critical.slice(0, 6).map(v => {
        const qty = v.quantidade || 0;
        const cls = qty === 0 ? 'danger' : 'warning';
        const icon = qty === 0
          ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
          : '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/>';
        return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-subtle);">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--${cls})" stroke-width="2">${icon}</svg>
            <span style="font-size:13px;font-weight:500;">${v.nome}</span>
          </div>
          <span class="badge badge-${cls}" style="font-size:11px;">${qty === 0 ? 'Esgotado' : `${qty} un.`}</span>
        </div>`;
      }).join('');
    }
  }

  animateEntrance();
}

/* ══════════════════════════════════════════════
   11. VENDAS (Sales History)
   ══════════════════════════════════════════════ */
let allVendas = [];

async function loadVendas() {
  await checkApi();
  try { allVendas = await apiFetch('/vendas'); } catch { allVendas = FALLBACK.vendas; }
  filterVendas();
  const el = document.getElementById('vendas-count');
  if (el) el.textContent = `${allVendas.length} transação(ões) registada(s)`;

  // Update comparison cards
  const thisWeekTotal = allVendas.reduce((s, v) => s + (v.total || 0), 0);
  const setC = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setC('sales-this-week', fmt.eur(thisWeekTotal));
  setC('total-transactions', allVendas.length);
  animateEntrance();
}

function filterVendas() {
  const q = (document.getElementById('vendas-search')?.value || '').toLowerCase();
  const e = document.getElementById('estado-filter')?.value || '';
  const f = allVendas.filter(v => {
    const txt = `${v.codigo || ''} ${v.cliente || ''} ${v.produto || ''}`.toLowerCase();
    return txt.includes(q) && (!e || v.status === e || v.estado === e);
  });
  renderVendasTable(document.getElementById('vendas-table'), f);
}

function renderVendasTable(tbody, vendas) {
  if (!tbody) return;
  if (!vendas || !vendas.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:50px;color:var(--text-muted);">Nenhuma venda encontrada</td></tr>`;
    return;
  }
  tbody.innerHTML = vendas.map(v => `
    <tr>
      <td><span style="font-family:var(--font-display);font-size:13px;color:var(--text-gold);font-weight:600;">${v.codigo || `VD-${String(v.id).padStart(4, '0')}`}</span></td>
      <td>${v.cliente || '—'}</td>
      <td class="muted" style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${v.produto || '—'}</td>
      <td class="muted">${v.metodoPagamento || '—'}</td>
      <td><span style="font-family:var(--font-display);font-weight:700;">${fmt.eur(v.total)}</span></td>
      <td>${statusBadge(v.status || v.estado)}</td>
      <td class="muted">${fmt.dt(v.dataVenda)}</td>
    </tr>`).join('');
}

/* ══════════════════════════════════════════════
   12. STOCK (Inventory)
   ══════════════════════════════════════════════ */
let allVinhos = [];

async function loadStock() {
  await checkApi();
  try { allVinhos = await apiFetch('/vinhos'); } catch { allVinhos = FALLBACK.vinhos; }
  renderStock();
  updateStockStats();
  animateEntrance();
}

function updateStockStats() {
  const total = allVinhos.length;
  const units = allVinhos.reduce((s, v) => s + (v.quantidade || 0), 0);
  const crit = allVinhos.filter(v => (v.quantidade || 0) < 10).length;
  const valor = allVinhos.reduce((s, v) => s + (v.preco || 0) * (v.quantidade || 0), 0);
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('stat-total', total);
  set('stat-units', fmt.num(units));
  set('stat-critico', crit);
  set('stat-valor', fmt.eur(valor));
  const c = document.getElementById('table-count');
  if (c) c.textContent = `${total} referência(s) · ${fmt.num(units)} unidades`;
}

function renderStock() {
  const tbody = document.getElementById('stock-table'); if (!tbody) return;
  const q = (document.getElementById('stock-search')?.value || '').toLowerCase();
  const t = document.getElementById('tipo-filter')?.value || '';
  const list = allVinhos.filter(v => {
    const txt = `${v.nome || ''} ${v.regiao || ''} ${v.produtor || ''}`.toLowerCase();
    return txt.includes(q) && (!t || v.tipo === t);
  });
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:50px;color:var(--text-muted);">Nenhum vinho encontrado</td></tr>`;
    return;
  }
  const maxQ = Math.max(...allVinhos.map(v => v.quantidade || 0), 100);
  const typeDots = { Tinto: 'tinto', Branco: 'branco', 'Rosé': 'rosé', Espumante: 'espumante' };
  tbody.innerHTML = list.map(v => {
    const qty = v.quantidade || 0;
    let sc = 'badge-success', st = 'Disponível';
    if (qty === 0) { sc = 'badge-danger'; st = 'Esgotado'; }
    else if (qty < 10) { sc = 'badge-danger'; st = 'Crítico'; }
    else if (qty < 25) { sc = 'badge-warning'; st = 'Baixo'; }
    return `<tr>
      <td><div style="display:flex;align-items:center;gap:8px;"><span class="wine-type-dot ${typeDots[v.tipo] || ''}" style="position:static;"></span><span style="font-weight:600;">${v.nome}</span></div></td>
      <td class="muted">${v.tipo || '—'}</td>
      <td class="muted">${v.regiao || '—'}</td>
      <td class="muted">${v.produtor || '—'}</td>
      <td class="muted">${v.anoColheita || '—'}</td>
      <td><span style="font-family:var(--font-display);font-weight:700;color:var(--text-gold);">${fmt.eur(v.preco)}</span></td>
      <td style="min-width:130px;">${stockBar(qty, maxQ)}</td>
      <td><span class="badge ${sc}">${st}</span></td>
      <td><div style="display:flex;gap:5px;">
        <button class="btn btn-secondary btn-sm btn-icon" onclick="openEditModal(${v.id})" title="Editar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="btn btn-secondary btn-sm btn-icon" onclick="openStockModal(${v.id})" title="Stock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg></button>
      </div></td>
    </tr>`;
  }).join('');
}

// Wine modal
function openAddModal() {
  document.getElementById('modal-title').textContent = 'Adicionar Vinho';
  document.getElementById('wine-id').value = '';
  ['wine-nome', 'wine-regiao', 'wine-produtor', 'wine-ano', 'wine-preco', 'wine-qty'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('wine-modal')?.classList.remove('hidden');
}

function openEditModal(id) {
  const v = allVinhos.find(x => x.id === id); if (!v) return;
  document.getElementById('modal-title').textContent = 'Editar Vinho';
  document.getElementById('wine-id').value = id;
  const set = (fid, val) => { const el = document.getElementById(fid); if (el) el.value = val || ''; };
  set('wine-nome', v.nome); set('wine-regiao', v.regiao); set('wine-produtor', v.produtor);
  set('wine-ano', v.anoColheita); set('wine-preco', v.preco); set('wine-qty', v.quantidade);
  const s = document.getElementById('wine-tipo'); if (s) s.value = v.tipo || 'Tinto';
  document.getElementById('wine-modal')?.classList.remove('hidden');
}

function closeModal() { document.getElementById('wine-modal')?.classList.add('hidden'); }

async function saveWine() {
  const id = document.getElementById('wine-id')?.value;
  const body = {
    nome: document.getElementById('wine-nome')?.value,
    tipo: document.getElementById('wine-tipo')?.value,
    regiao: document.getElementById('wine-regiao')?.value,
    produtor: document.getElementById('wine-produtor')?.value,
    anoColheita: +document.getElementById('wine-ano')?.value || 0,
    preco: +document.getElementById('wine-preco')?.value || 0,
    quantidade: +document.getElementById('wine-qty')?.value || 0,
  };
  if (!body.nome) { toast('Preencha o nome', 'error'); return; }
  try {
    if (id) { await apiFetch(`/vinhos/${id}`, { method: 'PUT', body: JSON.stringify(body) }); toast('Vinho atualizado'); }
    else { await apiFetch('/vinhos', { method: 'POST', body: JSON.stringify(body) }); toast('Vinho adicionado'); }
    closeModal(); loadStock();
  } catch {
    if (id) { const i = allVinhos.findIndex(v => v.id === +id); if (i >= 0) allVinhos[i] = { ...allVinhos[i], ...body }; }
    else { allVinhos.push({ id: Date.now(), ...body }); }
    toast('Guardado (modo demo)'); closeModal(); renderStock(); updateStockStats();
  }
}

// Stock modal
function openStockModal(id) {
  const v = allVinhos.find(x => x.id === id); if (!v) return;
  document.getElementById('stock-wine-id').value = id;
  const n = document.getElementById('stock-wine-name'); if (n) n.textContent = v.nome;
  const c = document.getElementById('stock-current'); if (c) c.textContent = v.quantidade || 0;
  const q = document.getElementById('stock-qty'); if (q) q.value = v.quantidade || 0;
  document.getElementById('stock-modal')?.classList.remove('hidden');
}

function closeStockModal() { document.getElementById('stock-modal')?.classList.add('hidden'); }

async function saveStock() {
  const id = document.getElementById('stock-wine-id')?.value;
  const qty = +document.getElementById('stock-qty')?.value || 0;
  try {
    await apiFetch(`/vinhos/${id}/stock`, { method: 'PUT', body: JSON.stringify({ quantidade: qty }) });
    toast('Stock atualizado');
  } catch {
    const v = allVinhos.find(x => x.id === +id); if (v) v.quantidade = qty;
    toast('Stock atualizado (modo demo)');
  }
  closeStockModal(); loadStock();
}

/* ══════════════════════════════════════════════
   12. WINE BOTTLE IMAGE SELECTOR
   ══════════════════════════════════════════════ */
function getWineBottleImage(tipo) {
  // Return transparent pixel - visual handled by CSS gradient backgrounds and SVG
  return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
}

/* ══════════════════════════════════════════════
   13. WINE BOTTLE SVG ART
   ══════════════════════════════════════════════ */
function wineBottleSVG(tipo) {
  const C = {
    Tinto:     { b1: '#38141C', b2: '#120408', f1: '#C8382A', f2: '#7D1E24', l: 'rgba(100,16,22,0.92)', ltr: 'T', shape: 'bordeaux', glw: 'rgba(175,30,45,0.3)' },
    Branco:    { b1: '#1C3A10', b2: '#0A1A06', f1: '#D4A825', f2: '#9A6E10', l: 'rgba(28,58,16,0.92)', ltr: 'B', shape: 'burgundy', glw: 'rgba(180,148,30,0.25)' },
    'Rosé':    { b1: '#561825', b2: '#20080D', f1: '#ECA8BC', f2: '#C46885', l: 'rgba(86,24,37,0.92)', ltr: 'R', shape: 'slim', glw: 'rgba(196,104,133,0.3)' },
    Espumante: { b1: '#0C2016', b2: '#050C08', f1: '#D4A825', f2: '#9A6E10', l: 'rgba(12,32,22,0.92)', ltr: 'E', shape: 'champagne', glw: 'rgba(180,148,30,0.28)' },
    Porto:     { b1: '#260C06', b2: '#0E0402', f1: '#9E2616', f2: '#621408', l: 'rgba(38,12,6,0.92)', ltr: 'P', shape: 'port', glw: 'rgba(158,38,22,0.3)' },
  };
  const c = C[tipo] || C.Tinto;
  const uid = 'b' + (tipo || '').replace(/[^a-zA-Z]/g, '');

  const shapes = {
    bordeaux:  { bx: 22, bw: 36, by: 62, nxw: [34, 12], ny: 18, shoulder: 'M 22,64 L 34,50 L 46,50 L 58,64 Z' },
    burgundy:  { bx: 20, bw: 40, by: 64, nxw: [34, 12], ny: 18, shoulder: 'M 20,66 C 20,54 34,50 34,50 L 46,50 C 46,50 60,54 60,66 Z' },
    slim:      { bx: 27, bw: 26, by: 62, nxw: [36, 8], ny: 18, shoulder: 'M 27,64 C 27,54 36,50 36,50 L 44,50 C 44,50 53,54 53,64 Z' },
    champagne: { bx: 18, bw: 44, by: 68, nxw: [33, 14], ny: 16, shoulder: 'M 18,70 C 18,56 33,50 33,50 L 47,50 C 47,50 62,56 62,70 Z' },
    port:      { bx: 22, bw: 36, by: 56, nxw: [34, 12], ny: 18, shoulder: 'M 22,58 L 34,48 L 46,48 L 58,58 Z' },
  };
  const s = shapes[c.shape] || shapes.bordeaux;
  const [nx, nw] = s.nxw;
  const bodyBot = 150;
  const labelY = s.by + 18;

  return `<svg viewBox="0 0 80 164" xmlns="http://www.w3.org/2000/svg" class="wine-card-svg">
<defs>
  <linearGradient id="${uid}body" x1="0.1" y1="0" x2="0.9" y2="0"><stop offset="0%" stop-color="${c.b2}"/><stop offset="28%" stop-color="${c.b1}"/><stop offset="72%" stop-color="${c.b1}"/><stop offset="100%" stop-color="${c.b2}"/></linearGradient>
  <linearGradient id="${uid}foil" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${c.f1}"/><stop offset="100%" stop-color="${c.f2}"/></linearGradient>
  <linearGradient id="${uid}shin" x1="0.15" y1="0" x2="0.55" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,0.2)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></linearGradient>
  <radialGradient id="${uid}glow" cx="50%" cy="55%" r="50%"><stop offset="0%" stop-color="${c.glw}"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/></radialGradient>
  <filter id="${uid}shadow"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.5)"/></filter>
</defs>
<ellipse cx="40" cy="95" rx="36" ry="52" fill="url(#${uid}glow)"/>
<rect x="${nx}" y="${s.ny}" width="${nw}" height="${s.by - s.ny + 4}" rx="3" fill="url(#${uid}body)" filter="url(#${uid}shadow)"/>
<path d="${s.shoulder}" fill="url(#${uid}body)"/>
<rect x="${s.bx}" y="${s.by}" width="${s.bw}" height="${bodyBot - s.by}" rx="7" fill="url(#${uid}body)" filter="url(#${uid}shadow)"/>
<rect x="${nx - 1}" y="${s.ny}" width="${nw + 2}" height="20" rx="3" fill="url(#${uid}foil)"/>
<rect x="${nx - 1}" y="${s.ny + 18}" width="${nw + 2}" height="2.5" rx="0" fill="${c.f2}" opacity="0.8"/>
<rect x="${nx + 2}" y="${s.ny - 11}" width="${nw - 4}" height="13" rx="2" fill="#9B7A50"/>
<rect x="${nx + 3}" y="${s.ny - 12}" width="${nw - 6}" height="3" rx="1" fill="#B89060"/>
<rect x="${s.bx + 3}" y="${s.by + 2}" width="${Math.floor(s.bw * 0.2)}" height="${bodyBot - s.by - 10}" rx="3" fill="url(#${uid}shin)"/>
<rect x="${s.bx + 4}" y="${labelY}" width="${s.bw - 8}" height="36" rx="3" fill="${c.l}"/>
<line x1="${s.bx + 8}" y1="${labelY + 7}" x2="${s.bx + s.bw - 12}" y2="${labelY + 7}" stroke="rgba(201,162,39,0.55)" stroke-width="0.75"/>
<text x="40" y="${labelY + 22}" font-family="Georgia,serif" font-size="13" font-weight="700" fill="rgba(255,238,200,0.95)" text-anchor="middle">${c.ltr}</text>
<line x1="${s.bx + 8}" y1="${labelY + 29}" x2="${s.bx + s.bw - 12}" y2="${labelY + 29}" stroke="rgba(201,162,39,0.55)" stroke-width="0.75"/>
<ellipse cx="40" cy="${bodyBot + 1}" rx="${Math.floor(s.bw / 2) - 2}" ry="3.5" fill="rgba(0,0,0,0.4)"/>
</svg>`;
}

/* ══════════════════════════════════════════════
   14. POS (Point of Sale)
   ══════════════════════════════════════════════ */
let catalog = [], cart = [], payMethod = 'Cartão';
const wineTypeClass = { Tinto: 'tinto', Branco: 'branco', 'Rosé': 'rose', Espumante: 'espumante', Porto: 'porto' };

async function loadPOS() {
  await checkApi();
  try { catalog = await apiFetch('/vinhos'); } catch { catalog = FALLBACK.vinhos; }
  renderCatalog();

  document.querySelectorAll('.filter-btn, .pos-cat-btn, .pos-tab').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn, .pos-cat-btn, .pos-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCatalog(btn.dataset.filter);
  }));

  document.getElementById('wine-search')?.addEventListener('input', () =>
    renderCatalog(document.querySelector('.pos-tab.active, .cat-btn.active, .filter-btn.active')?.dataset?.filter || 'todos'));

  document.querySelectorAll('.pay-method').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    payMethod = btn.dataset.method;
  }));
}

const wineEmojis = { Tinto: '🍷', Branco: '🥂', 'Rosé': '🌸', Espumante: '✨', Porto: '🍇' };

function renderCatalog(filter = 'todos') {
  const grid = document.getElementById('wine-grid'); if (!grid) return;
  const q = (document.getElementById('wine-search')?.value || '').toLowerCase();
  const list = catalog.filter(v =>
    (`${v.nome || ''} ${v.regiao || ''} ${v.produtor || ''}`.toLowerCase()).includes(q) &&
    (!filter || filter === 'todos' || filter === '' || v.tipo === filter)
  );

  const countEl = document.getElementById('pos-product-count');
  if (countEl) countEl.textContent = `${list.length} produto${list.length !== 1 ? 's' : ''}`;

  if (!list.length) {
    grid.innerHTML = `<div class="pos-empty">Nenhum vinho encontrado</div>`;
    return;
  }
  grid.innerHTML = list.map(v => {
    const oos = (v.quantidade || 0) === 0;
    const tc = wineTypeClass[v.tipo] || 'tinto';
    const qty = v.quantidade || 0;
    const stockClass = oos ? 'oos-label' : qty < 5 ? 'low' : '';
    const emoji = wineEmojis[v.tipo] || '🍷';
    return `<div class="wine-tile t-${tc}${oos ? ' oos' : ''}" onclick="${oos ? 'void(0)' : `addToCart(${v.id})`}">
      <div class="tile-type">${v.tipo || ''}</div>
      <div class="tile-icon">${emoji}</div>
      <div class="tile-name">${v.nome}</div>
      <div class="tile-bottom">
        <span class="tile-price">${fmt.eur(v.preco)}</span>
        <span class="tile-stock ${stockClass}">${oos ? 'Esgotado' : qty + ' un.'}</span>
      </div>
    </div>`;
  }).join('');
}

/* Refresh catalog from API (called after sale/return) */
async function refreshCatalog() {
  try { catalog = await apiFetch('/vinhos'); } catch { /* keep current */ }
  const activeFilter = document.querySelector('.pos-tab.active, .cat-btn.active')?.dataset?.filter || '';
  renderCatalog(activeFilter || 'todos');
}

/* ══════════════════════════════════════════════
   15. BOTTLE SIZE SELECTOR & CART
   ══════════════════════════════════════════════ */
const BOTTLE_SIZES = [
  { vol: '0.375L', nome: 'Meia Garrafa', mult: 0.55, desc: '375 ml' },
  { vol: '0.75L', nome: 'Garrafa Standard', mult: 1.0, desc: '750 ml · Padrão' },
  { vol: '1.5L', nome: 'Magnum', mult: 2.15, desc: '1 500 ml' },
  { vol: '3.0L', nome: 'Double Magnum', mult: 4.4, desc: '3 000 ml' },
];

function addToCart(id) {
  const v = catalog.find(x => x.id === id);
  if (!v || (v.quantidade || 0) === 0) return;
  // Direct add at standard 0.75L — no modal needed
  addToCartWithSize(id, '0.75L', 'Garrafa Standard', 1.0);
}

function openSizeSelector(id) {
  // Optional: open size modal for special sizes
  const v = catalog.find(x => x.id === id);
  if (!v || (v.quantidade || 0) === 0) return;
  document.getElementById('size-wine-name').textContent = v.nome;
  const opts = document.getElementById('size-options');
  opts.innerHTML = BOTTLE_SIZES.map(s => `
    <button class="size-option" onclick="addToCartWithSize(${id},'${s.vol}','${s.nome}',${s.mult});closeSizeModal()">
      <div class="size-label">${s.vol}</div>
      <div class="size-name">${s.nome}</div>
      <div class="size-ml">${s.desc}</div>
      <div class="size-price">${fmt.eur(v.preco * s.mult)}</div>
    </button>`).join('');
  document.getElementById('size-modal')?.classList.remove('hidden');
}

function closeSizeModal() { document.getElementById('size-modal')?.classList.add('hidden'); }

function addToCartWithSize(id, vol, nomeTamanho, mult) {
  const v = catalog.find(x => x.id === id); if (!v) return;
  const cartKey = `${id}_${vol}`;
  const ex = cart.find(c => c.cartKey === cartKey);
  const preco = +(v.preco * mult).toFixed(2);
  if (ex) {
    if (ex.qty >= (v.quantidade || 0)) { toast('Stock insuficiente', 'warning'); return; }
    ex.qty++;
  } else {
    cart.push({ cartKey, id, nome: v.nome, vol, nomeTamanho, preco, qty: 1 });
  }
  toast(`${v.nome} (${vol}) adicionado`, 'success', 2000);
  renderCart();
}

function removeFromCart(i) { cart.splice(i, 1); renderCart(); }
function updateQty(i, d) { cart[i].qty += d; if (cart[i].qty <= 0) cart.splice(i, 1); renderCart(); }
function clearCart() { cart = []; renderCart(); }

function renderCart() {
  const c = document.getElementById('cart-items'); if (!c) return;
  const empty = document.getElementById('cart-empty');
  const btn = document.getElementById('checkout-btn');
  const cnt = document.getElementById('cart-count');
  const clearBtn = document.getElementById('cart-clear-btn');
  const totalItems = cart.reduce((s, x) => s + x.qty, 0);

  if (!cart.length) {
    if (empty) empty.style.display = 'flex';
    if (btn) btn.disabled = true;
    if (cnt) cnt.textContent = '0';
    if (clearBtn) clearBtn.style.display = 'none';
    Array.from(c.children).forEach(el => { if (el.id !== 'cart-empty') el.remove(); });
    updateTotals(0); return;
  }

  if (empty) empty.style.display = 'none';
  if (btn) btn.disabled = false;
  if (cnt) cnt.textContent = totalItems;
  if (clearBtn) clearBtn.style.display = 'block';

  // Clear non-empty items
  Array.from(c.children).forEach(el => { if (el.id !== 'cart-empty') el.remove(); });

  cart.forEach((item, i) => {
    const v = catalog.find(x => x.id === item.id);
    const tc = v ? (wineTypeClass[v.tipo] || 'tinto') : 'tinto';
    const div = document.createElement('div');
    div.className = 'ci';
    div.innerHTML = `
      <div class="ci-dot ${tc}"></div>
      <div class="ci-info">
        <div class="ci-name">${item.nome}</div>
        <div class="ci-meta">${item.vol || '0.75L'} · ${fmt.eur(item.preco)}/un.</div>
      </div>
      <div class="ci-qty">
        <button onclick="updateQty(${i},-1)">−</button>
        <span>${item.qty}</span>
        <button onclick="updateQty(${i},1)">+</button>
      </div>
      <div class="ci-price">${fmt.eur(item.preco * item.qty)}</div>
      <button class="ci-del" onclick="removeFromCart(${i})" title="Remover">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>`;
    c.appendChild(div);
  });

  updateTotals(cart.reduce((s, x) => s + x.preco * x.qty, 0));
}

function updateTotals(sub) {
  const iva = sub * 0.23, tot = sub + iva;
  const s = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = fmt.eur(v); };
  s('cart-subtotal', sub); s('cart-iva', iva); s('cart-total', tot);
}

/* ══════════════════════════════════════════════
   16. CHECKOUT
   ══════════════════════════════════════════════ */
function checkout() {
  if (!cart.length) return;
  const coItems = document.getElementById('co-items');
  if (coItems) {
    coItems.innerHTML = cart.map(item => `
      <div class="co-item">
        <span class="co-item-name">${item.nome}</span>
        <span class="co-item-qty">${item.vol ? item.vol + ' · ' : ''}×${item.qty}</span>
        <span class="co-item-price">${fmt.eur(item.preco * item.qty)}</span>
      </div>`).join('');
  }
  const disc = document.getElementById('co-discount'); if (disc) disc.value = '0';
  const payIcons = {
    Cartão: '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
    Numerário: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>',
    'MB Way': '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
  };
  const payEl = document.getElementById('co-pay-display');
  if (payEl) payEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">${payIcons[payMethod] || payIcons.Cartão}</svg>${payMethod}`;

  const cashP = document.getElementById('co-cash-panel'); if (cashP) cashP.style.display = payMethod === 'Numerário' ? 'block' : 'none';
  const mbwayP = document.getElementById('co-mbway-panel'); if (mbwayP) mbwayP.style.display = payMethod === 'MB Way' ? 'block' : 'none';
  const cardP = document.getElementById('co-card-panel'); if (cardP) cardP.style.display = payMethod === 'Cartão' ? 'block' : 'none';

  updateCoTotals();
  document.getElementById('checkout-modal')?.classList.remove('hidden');
}

function closeCheckoutModal() { document.getElementById('checkout-modal')?.classList.add('hidden'); }

function updateCoTotals() {
  const sub = cart.reduce((s, x) => s + x.preco * x.qty, 0);
  const discPct = Math.min(100, Math.max(0, +(document.getElementById('co-discount')?.value || 0)));
  const discAmt = sub * (discPct / 100);
  const afterDisc = sub - discAmt;
  const iva = afterDisc * 0.23;
  const tot = afterDisc + iva;
  const s = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  s('co-subtotal', fmt.eur(sub));
  s('co-iva', fmt.eur(iva));
  s('co-total', fmt.eur(tot));
  const dl = document.getElementById('co-discount-line');
  const dv = document.getElementById('co-discount-val');
  if (dl) dl.style.display = discPct > 0 ? 'flex' : 'none';
  if (dv) dv.textContent = `−${fmt.eur(discAmt)} (${discPct}%)`;
}

function calcTroco() {
  const sub = cart.reduce((s, x) => s + x.preco * x.qty, 0);
  const discPct = +(document.getElementById('co-discount')?.value || 0);
  const afterDisc = sub * (1 - discPct / 100);
  const tot = afterDisc * 1.23;
  const rec = +(document.getElementById('co-cash-received')?.value || 0);
  const troco = rec - tot;
  const el = document.getElementById('co-troco');
  if (!el) return;
  if (rec > 0) {
    el.style.display = 'block';
    if (troco >= 0) { el.className = 'troco-display ok'; el.textContent = `Troco: ${fmt.eur(troco)}`; }
    else { el.className = 'troco-display bad'; el.textContent = `Faltam: ${fmt.eur(-troco)}`; }
  } else { el.style.display = 'none'; }
}

async function processPayment() {
  if (!cart.length) return;
  const btn = document.getElementById('process-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span>A processar...</span>'; }

  const sub = cart.reduce((s, x) => s + x.preco * x.qty, 0);
  const discPct = Math.min(100, Math.max(0, +(document.getElementById('co-discount')?.value || 0)));
  const discAmt = sub * (discPct / 100);
  const afterDisc = sub - discAmt;
  const iva = afterDisc * 0.23;
  const tot = afterDisc + iva;
  const nif = document.getElementById('co-nif')?.value || '';
  const notas = document.getElementById('co-notes')?.value || '';
  const itens = cart.map(c => ({ vinhoId: c.id, quantidade: c.qty, formato: c.vol || '0.75L', precUnit: c.preco }));

  const code = 'VD-' + Date.now().toString(36).toUpperCase().slice(-6);
  const now = new Date();

  let saleResult = null;
  try {
    const user = Session.get();
    saleResult = await apiFetch('/vendas', { method: 'POST', body: JSON.stringify({ itens, metodoPagamento: payMethod, funcionarioId: user?.id || 1, desconto: discPct, nif, notas }) });
  } catch {
    // API offline — update local catalog stock for demo mode
    itens.forEach(item => { const v = catalog.find(x => x.id === item.vinhoId); if (v) v.quantidade = Math.max(0, (v.quantidade || 0) - item.quantidade); });
  }

  const saleCode = saleResult?.codigo || code;

  // Build receipt
  const receiptEl = document.getElementById('receipt-content');
  if (receiptEl) {
    const lines = cart.map(item => `<div class="receipt-line"><span>${item.nome}${item.vol ? ' (' + item.vol + ')' : ''} ×${item.qty}</span><span>${fmt.eur(item.preco * item.qty)}</span></div>`).join('');
    receiptEl.innerHTML = `
      <div class="receipt-header">
        <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:#d4a843;">Vinha D'Ouro</div>
        <div style="font-size:11px;color:#777;margin-top:2px;">${now.toLocaleString('pt-PT')}</div>
        <div style="font-size:11px;color:#777;">Ref: ${saleCode}${nif ? ' · NIF: ' + nif : ''}</div>
      </div>
      ${lines}
      <div class="receipt-divider"></div>
      ${discPct > 0 ? `<div class="receipt-line"><span style="color:#34d399;">Desconto (${discPct}%)</span><span style="color:#34d399;">−${fmt.eur(discAmt)}</span></div>` : ''}
      <div class="receipt-line"><span>IVA 23%</span><span>${fmt.eur(iva)}</span></div>
      <div class="receipt-divider"></div>
      <div class="receipt-total-line"><span>TOTAL</span><span>${fmt.eur(tot)}</span></div>
      <div style="text-align:center;margin-top:8px;font-size:11px;color:#555;">Pagamento: ${payMethod}</div>`;
  }
  const sub2 = document.getElementById('receipt-subtitle');
  if (sub2) sub2.textContent = `${cart.length} artigo(s) · IVA incluído · ${payMethod}`;

  closeCheckoutModal();
  clearCart();
  // Refresh catalog from API to get real stock values
  await refreshCatalog();
  document.getElementById('receipt-modal')?.classList.remove('hidden');
  if (btn) { btn.disabled = false; btn.textContent = 'Confirmar Pagamento'; }
}

function closeReceiptAndReset() {
  document.getElementById('receipt-modal')?.classList.add('hidden');
}

/* ══════════════════════════════════════════════
   16B. ALIAS FUNCTIONS FOR loja.html onclick HANDLERS
   ══════════════════════════════════════════════ */
function closeReceipt() { closeReceiptAndReset(); }
function openCheckout() { checkout(); }
function closeCheckout() { closeCheckoutModal(); }
function updateCheckoutTotals() { updateCoTotals(); }
function calculateChange() { calcTroco(); }

function filterByType(type) {
  document.querySelectorAll('.filter-btn, .pos-cat-btn, .pos-tab').forEach(b => b.classList.remove('active'));
  const target = document.querySelector(`.filter-btn[data-filter="${type}"], .pos-cat-btn[data-filter="${type}"], .pos-tab[data-filter="${type}"]`);
  if (target) target.classList.add('active');
  renderCatalog(type || 'todos');
}

function searchWines(query) {
  const active = document.querySelector('.pos-tab.active, .filter-btn.active');
  renderCatalog(active?.dataset?.filter || 'todos');
}

function selectPaymentMethod(method) {
  document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('active'));
  const target = document.querySelector(`.pay-method[data-method="${method}"]`);
  if (target) target.classList.add('active');
  payMethod = method;
  // Show/hide payment panels
  const cashP = document.getElementById('co-cash-panel');
  const mbwayP = document.getElementById('co-mbway-panel');
  const cardP = document.getElementById('co-card-panel');
  if (cashP) cashP.style.display = method === 'Numerário' ? 'block' : 'none';
  if (mbwayP) mbwayP.style.display = method === 'MB Way' ? 'block' : 'none';
  if (cardP) cardP.style.display = method === 'Cartão' ? 'block' : 'none';
}

function printReceipt() {
  window.print();
}

function newSale() {
  closeReceiptAndReset();
}

/* ══════════════════════════════════════════════
   16C. DEVOLUÇÕES (Returns)
   ══════════════════════════════════════════════ */
let returnVendaId = null;

async function openReturns() {
  document.getElementById('returns-modal')?.classList.remove('hidden');
  document.getElementById('return-confirm').style.display = 'none';
  document.getElementById('confirm-return-btn').style.display = 'none';
  returnVendaId = null;

  const list = document.getElementById('returns-list');
  if (!list) return;
  list.innerHTML = '<p style="color:#555;text-align:center;padding:20px;">A carregar...</p>';

  let vendas;
  try { vendas = await apiFetch('/vendas'); } catch { vendas = FALLBACK.vendas; }

  // Only show completed sales (not already returned)
  const completadas = vendas.filter(v => v.status === 'CONCLUIDA').slice(0, 15);

  if (!completadas.length) {
    list.innerHTML = '<p style="color:#555;text-align:center;padding:20px;">Sem vendas para devolver</p>';
    return;
  }

  list.innerHTML = completadas.map(v => `
    <div class="return-sale-item">
      <span class="rsi-code">${v.codigo}</span>
      <div class="rsi-info">
        <div>${v.produto || '—'}</div>
        <div class="rsi-date">${v.dataVenda || ''}</div>
      </div>
      <span class="rsi-total">${fmt.eur(v.total)}</span>
      <button class="return-sale-btn" onclick="selectReturn(${v.id}, '${v.codigo}')">Devolver</button>
    </div>
  `).join('');
}

async function selectReturn(vendaId, codigo) {
  returnVendaId = vendaId;
  const confirmDiv = document.getElementById('return-confirm');
  const confirmBtn = document.getElementById('confirm-return-btn');
  const titleEl = document.getElementById('return-confirm-title');
  const itemsEl = document.getElementById('return-confirm-items');

  if (titleEl) titleEl.textContent = `Devolver ${codigo}`;
  if (confirmDiv) confirmDiv.style.display = 'block';
  if (confirmBtn) confirmBtn.style.display = 'inline-flex';

  // Load sale items
  if (itemsEl) {
    itemsEl.innerHTML = '<p style="color:#555;font-size:0.7rem;">A carregar itens...</p>';
    try {
      const itens = await apiFetch(`/vendas/${vendaId}/itens`);
      itemsEl.innerHTML = itens.map(item => `
        <div class="return-item-row">
          <span class="ri-name">${item.nome || 'Vinho #' + item.vinhoId}</span>
          <span class="ri-qty">×${item.quantidade}</span>
          <span class="ri-price">${fmt.eur(item.precoUnitario * item.quantidade)}</span>
        </div>
      `).join('');
    } catch {
      itemsEl.innerHTML = '<p style="color:#888;font-size:0.7rem;">Devolução total será processada</p>';
    }
  }

  // Scroll to confirm section
  confirmDiv?.scrollIntoView({ behavior: 'smooth' });
}

async function confirmReturn() {
  if (!returnVendaId) return;
  const btn = document.getElementById('confirm-return-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'A processar...'; }

  const motivo = document.getElementById('return-reason')?.value || '';

  try {
    await apiFetch('/devolucoes', {
      method: 'POST',
      body: JSON.stringify({ vendaId: returnVendaId, motivo })
    });
    toast('Devolução processada com sucesso! Stock atualizado.', 'success', 3000);
    // Refresh catalog to reflect stock changes
    await refreshCatalog();
  } catch (e) {
    toast('Erro ao processar devolução: ' + (e.message || 'erro'), 'error');
  }

  if (btn) { btn.disabled = false; btn.textContent = 'Confirmar Devolução'; }
  returnVendaId = null;
  closeReturns();
}

function closeReturns() {
  document.getElementById('returns-modal')?.classList.add('hidden');
}

/* ══════════════════════════════════════════════
   17. EQUIPA (Team Management)
   ══════════════════════════════════════════════ */
let allFuncs = [];

async function loadEquipa() {
  await checkApi();
  try { allFuncs = await apiFetch('/funcionarios'); } catch { allFuncs = FALLBACK.funcionarios; }
  renderEquipa();
  animateEntrance();
}

function renderEquipa() {
  const g = document.getElementById('team-grid'); if (!g) return;
  if (!allFuncs.length) {
    g.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text-muted);">Sem funcionários</div>';
    return;
  }
  const ini = n => n ? n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';
  g.innerHTML = allFuncs.map(f => {
    const nome = f.nome || (f.pessoa && f.pessoa.nome) || '—';
    const email = f.email || (f.pessoa && f.pessoa.email) || '';
    return `<div class="team-card">
      <div style="display:flex;align-items:center;gap:var(--sp-4);margin-bottom:var(--sp-4);">
        <div class="team-avatar">${ini(nome)}</div>
        <div><div style="font-weight:700;font-size:15px;">${nome}</div><div style="font-size:12px;color:var(--text-muted);">${email}</div></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:var(--sp-2);">
        <div style="display:flex;justify-content:space-between;"><span style="font-size:12px;color:var(--text-muted);">Cargo</span><span style="font-size:13px;font-weight:600;">${f.cargo || '—'}</span></div>
        <div style="display:flex;justify-content:space-between;"><span style="font-size:12px;color:var(--text-muted);">Salário</span><span style="font-family:var(--font-display);font-size:13px;font-weight:700;color:var(--text-gold);">${fmt.eur(f.salario)}</span></div>
        <div style="display:flex;justify-content:space-between;"><span style="font-size:12px;color:var(--text-muted);">Admissão</span><span style="font-size:12px;color:var(--text-secondary);">${fmt.date(f.dataAdmissao)}</span></div>
        <div style="display:flex;justify-content:space-between;margin-top:4px;">${statusBadge(f.nivelAcesso)}${f.ativo === 1 || f.ativo === true ? '<span class="badge badge-success">Ativo</span>' : '<span class="badge badge-muted">Inativo</span>'}</div>
        <div style="display:flex;gap:6px;margin-top:var(--sp-2);">
          <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="openEditFuncModal(${f.id})">Editar</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function openAddFuncModal() {
  document.getElementById('func-modal-title').textContent = 'Novo Funcionário';
  document.getElementById('func-id').value = '';
  ['func-nome', 'func-email', 'func-cargo', 'func-salario'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('func-modal')?.classList.remove('hidden');
}

function openEditFuncModal(id) {
  const f = allFuncs.find(x => x.id === id); if (!f) return;
  document.getElementById('func-modal-title').textContent = 'Editar Funcionário';
  document.getElementById('func-id').value = id;
  const set = (eid, val) => { const el = document.getElementById(eid); if (el) el.value = val || ''; };
  const nome = f.nome || (f.pessoa && f.pessoa.nome) || '';
  const email = f.email || (f.pessoa && f.pessoa.email) || '';
  set('func-nome', nome); set('func-email', email); set('func-cargo', f.cargo); set('func-salario', f.salario);
  const nv = document.getElementById('func-nivel'); if (nv) nv.value = f.nivelAcesso || 'FUNCIONARIO';
  const av = document.getElementById('func-ativo'); if (av) av.value = f.ativo ? '1' : '0';
  document.getElementById('func-modal')?.classList.remove('hidden');
}

function closeFuncModal() { document.getElementById('func-modal')?.classList.add('hidden'); }

async function saveFuncionario() {
  const id = document.getElementById('func-id')?.value;
  const body = {
    nome: document.getElementById('func-nome')?.value,
    email: document.getElementById('func-email')?.value,
    cargo: document.getElementById('func-cargo')?.value,
    salario: +document.getElementById('func-salario')?.value || 0,
    nivelAcesso: document.getElementById('func-nivel')?.value || 'FUNCIONARIO',
    ativo: +document.getElementById('func-ativo')?.value || 1,
  };
  if (!body.nome) { toast('Preencha o nome', 'error'); return; }
  try {
    if (id) { await apiFetch(`/funcionarios/${id}`, { method: 'PUT', body: JSON.stringify(body) }); toast('Funcionário atualizado'); }
    else { await apiFetch('/funcionarios', { method: 'POST', body: JSON.stringify(body) }); toast('Funcionário adicionado'); }
    closeFuncModal(); loadEquipa();
  } catch {
    if (!id) allFuncs.push({ id: Date.now(), ...body });
    else { const i = allFuncs.findIndex(x => x.id === +id); if (i >= 0) allFuncs[i] = { ...allFuncs[i], ...body }; }
    toast('Guardado (modo demo)'); closeFuncModal(); renderEquipa();
  }
}

/* ══════════════════════════════════════════════
   18. RELATÓRIOS
   ══════════════════════════════════════════════ */
async function loadRelatorios() {
  await checkApi();
  let dash;
  try { dash = await apiFetch('/dashboard'); } catch { dash = FALLBACK.dashboard; }
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('r-receita', fmt.eur(dash.receitaTotal));
  set('r-lucro', fmt.eur(dash.lucroLiquido));
  set('r-ticket', fmt.eur(dash.ticketMedio));
  set('r-vendas', dash.vendas);

  drawBarChart('chart-vendas', dash.vendasLabels || ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Hj'], dash.vendasSemanais || [0, 0, 0, 0, 0, 0, 0], '#C9A227');
  drawLineChart('chart-receita', ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'], [120, 185, 240, 180, 310, 420], '#A83D4A');

  let vinhos;
  try { vinhos = await apiFetch('/vinhos'); } catch { vinhos = FALLBACK.vinhos; }
  const tbody = document.getElementById('top-wines-table');
  if (tbody) {
    const sorted = [...vinhos].sort((a, b) => (b.preco * b.quantidade) - (a.preco * a.quantidade)).slice(0, 8);
    tbody.innerHTML = sorted.map(v => `<tr>
      <td style="font-weight:600;">${v.nome}</td>
      <td class="muted">${v.tipo || '—'}</td>
      <td class="muted">${v.regiao || '—'}</td>
      <td><span style="font-family:var(--font-display);font-weight:700;color:var(--text-gold);">${fmt.eur(v.preco)}</span></td>
      <td>${stockBar(v.quantidade || 0, 100)}</td>
      <td><span style="font-family:var(--font-display);font-weight:700;">${fmt.eur((v.preco || 0) * (v.quantidade || 0))}</span></td>
    </tr>`).join('');
  }
  animateEntrance();
}

/* ══════════════════════════════════════════════
   19. PROVAS DE VINHO
   ══════════════════════════════════════════════ */
let allProvas = [], provaFilter = 'todas';

const FALLBACK_PROVAS = [
  { id: 1, titulo: "Grandes Vinhos do Douro", descricao: "Uma viagem pelos melhores vinhos da região do Douro.", dataHora: "2026-04-05T19:00", capacidade: 16, inscritos: 11, precoPorPessoa: 35, estado: "AGENDADA", vinhos: "Barca Velha, Quinta do Crasto, Niepoort Redoma" },
  { id: 2, titulo: "Espumantes & Champagnes", descricao: "Degustação comparativa entre espumantes portugueses e champagnes.", dataHora: "2026-04-12T18:30", capacidade: 12, inscritos: 12, precoPorPessoa: 55, estado: "AGENDADA", vinhos: "Espumante Vinha D'Ouro, Graham's" },
  { id: 3, titulo: "Alentejo em Destaque", descricao: "Os melhores tintos e brancos da região alentejana.", dataHora: "2026-03-15T19:30", capacidade: 20, inscritos: 18, precoPorPessoa: 28, estado: "CONCLUIDA", vinhos: "Esporão Reserva, Mouchão, Ravasqueira" },
  { id: 4, titulo: "Provas de Porto & Moscatel", descricao: "Vinhos generosos portugueses, do Vintage ao Tawny.", dataHora: "2026-05-03T17:00", capacidade: 10, inscritos: 4, precoPorPessoa: 42, estado: "AGENDADA", vinhos: "Graham's LBV, Bacalhôa Moscatel" },
];

async function loadProvas() {
  await checkApi();
  try { allProvas = await apiFetch('/provas'); } catch { allProvas = FALLBACK_PROVAS; }
  updateProvasStats();
  filterProvas(provaFilter);
  animateEntrance();
}

function updateProvasStats() {
  const total = allProvas.length;
  const agendadas = allProvas.filter(p => p.estado === 'AGENDADA').length;
  const inscritos = allProvas.reduce((s, p) => s + (p.inscritos || 0), 0);
  const receita = allProvas.reduce((s, p) => s + (p.inscritos || 0) * (p.precoPorPessoa || 0), 0);
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('pv-total', total); set('pv-agendadas', agendadas); set('pv-inscritos', inscritos); set('pv-receita', fmt.eur(receita));
}

function filterProvas(estado) {
  provaFilter = estado;
  document.querySelectorAll('[id^="pv-filter-"]').forEach(b => b.classList.remove('active'));
  document.getElementById(`pv-filter-${estado}`)?.classList.add('active');
  const list = estado === 'todas' ? allProvas : allProvas.filter(p => p.estado === estado);
  const cnt = document.getElementById('pv-count'); if (cnt) cnt.textContent = `${list.length} prova(s)`;
  renderProvas(list);
}

function renderProvas(list) {
  const grid = document.getElementById('provas-grid'); if (!grid) return;
  if (!list.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted);">Nenhuma prova encontrada</div>`;
    return;
  }
  const estadoBadge = { AGENDADA: 'badge-info', EM_CURSO: 'badge-success', CONCLUIDA: 'badge-muted', CANCELADA: 'badge-danger' };
  const estadoLabel = { AGENDADA: 'Agendada', EM_CURSO: 'Em Curso', CONCLUIDA: 'Concluída', CANCELADA: 'Cancelada' };
  grid.innerHTML = list.map(p => {
    const dt = p.dataHora ? new Date(p.dataHora) : null;
    const dtFmt = dt ? dt.toLocaleString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Data não definida';
    const cap = p.capacidade || 0, ins = p.inscritos || 0;
    const pct = cap ? Math.min(100, Math.round(ins / cap * 100)) : 0;
    const vinhosList = (p.vinhos || '').split(',').map(w => w.trim()).filter(Boolean);
    return `<div class="prova-card">
      <div class="prova-card-header">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
          <div>
            <div class="prova-card-date"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>${dtFmt}</div>
            <div class="prova-card-title">${p.titulo || 'Prova sem título'}</div>
          </div>
          <span class="badge ${estadoBadge[p.estado] || 'badge-muted'}" style="flex-shrink:0;">${estadoLabel[p.estado] || p.estado}</span>
        </div>
        ${p.descricao ? `<div class="prova-card-desc" style="margin-top:8px;">${p.descricao}</div>` : ''}
      </div>
      <div class="prova-card-body">
        <div class="prova-stat-row">
          <div class="prova-stat"><div class="prova-stat-val">${ins}/${cap}</div><div class="prova-stat-lbl">Inscritos</div></div>
          <div class="prova-stat"><div class="prova-stat-val">${fmt.eur(p.precoPorPessoa || 0)}</div><div class="prova-stat-lbl">/ Pessoa</div></div>
          <div class="prova-stat"><div class="prova-stat-val">${fmt.eur(ins * (p.precoPorPessoa || 0))}</div><div class="prova-stat-lbl">Receita</div></div>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:5px;"><span>Ocupação</span><span>${pct}%</span></div>
          <div style="background:var(--bg-raised);height:5px;border-radius:3px;overflow:hidden;"><div style="height:100%;width:${pct}%;background:${pct >= 100 ? 'var(--success)' : pct > 70 ? 'var(--warning)' : 'var(--info)'};border-radius:3px;transition:width 0.5s;"></div></div>
        </div>
        ${vinhosList.length ? `<div class="prova-wines-list">${vinhosList.map(w => `<span class="prova-wine-tag">${w}</span>`).join('')}</div>` : ''}
      </div>
      <div class="prova-card-footer">
        <button class="btn btn-secondary btn-sm" onclick="openEditProvaModal(${p.id})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Editar</button>
        <div style="display:flex;gap:6px;">
          ${p.estado === 'AGENDADA' ? `<button class="btn btn-secondary btn-sm" onclick="changeProvaEstado(${p.id},'EM_CURSO')">Iniciar</button>` : ''}
          ${p.estado === 'EM_CURSO' ? `<button class="btn btn-secondary btn-sm" onclick="changeProvaEstado(${p.id},'CONCLUIDA')">Concluir</button>` : ''}
          ${p.estado !== 'CANCELADA' && p.estado !== 'CONCLUIDA' ? `<button class="btn btn-ghost btn-sm" onclick="changeProvaEstado(${p.id},'CANCELADA')">Cancelar</button>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

function openAddProvaModal() {
  document.getElementById('prova-modal-title').textContent = 'Nova Prova de Vinho';
  document.getElementById('prova-id').value = '';
  ['prova-titulo', 'prova-descricao', 'prova-notas'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('prova-capacidade').value = '10';
  document.getElementById('prova-inscritos').value = '0';
  document.getElementById('prova-preco').value = '0';
  document.getElementById('prova-estado').value = 'AGENDADA';
  const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(19, 0, 0);
  document.getElementById('prova-data').value = d.toISOString().slice(0, 16);
  populateProvaWines([]);
  document.getElementById('prova-modal')?.classList.remove('hidden');
}

function openEditProvaModal(id) {
  const p = allProvas.find(x => x.id === id); if (!p) return;
  document.getElementById('prova-modal-title').textContent = 'Editar Prova';
  document.getElementById('prova-id').value = id;
  document.getElementById('prova-titulo').value = p.titulo || '';
  document.getElementById('prova-descricao').value = p.descricao || '';
  document.getElementById('prova-notas').value = p.notas || '';
  document.getElementById('prova-capacidade').value = p.capacidade || 10;
  document.getElementById('prova-inscritos').value = p.inscritos || 0;
  document.getElementById('prova-preco').value = p.precoPorPessoa || 0;
  document.getElementById('prova-estado').value = p.estado || 'AGENDADA';
  if (p.dataHora) document.getElementById('prova-data').value = p.dataHora.slice(0, 16);
  const selWines = (p.vinhos || '').split(',').map(w => w.trim());
  populateProvaWines(selWines);
  document.getElementById('prova-modal')?.classList.remove('hidden');
}

function populateProvaWines(selected) {
  const container = document.getElementById('prova-wine-checks'); if (!container) return;
  const wines = allProvas._wineCache || FALLBACK.vinhos;
  container.innerHTML = wines.map(v => `
    <label style="display:flex;align-items:center;gap:8px;font-size:12.5px;cursor:pointer;padding:4px;">
      <input type="checkbox" value="${v.nome}" ${selected.includes(v.nome) ? 'checked' : ''} style="accent-color:var(--accent-gold);">
      <span>${v.nome} <span style="color:var(--text-muted);font-size:10px;">(${v.tipo})</span></span>
    </label>`).join('');
}

function closeProvaModal() { document.getElementById('prova-modal')?.classList.add('hidden'); }

async function saveProva() {
  const id = document.getElementById('prova-id')?.value;
  const checks = document.querySelectorAll('#prova-wine-checks input[type=checkbox]:checked');
  const vinhos = Array.from(checks).map(c => c.value).join(', ');
  const body = {
    titulo: document.getElementById('prova-titulo')?.value,
    descricao: document.getElementById('prova-descricao')?.value,
    dataHora: document.getElementById('prova-data')?.value,
    capacidade: +document.getElementById('prova-capacidade')?.value || 10,
    inscritos: +document.getElementById('prova-inscritos')?.value || 0,
    precoPorPessoa: +document.getElementById('prova-preco')?.value || 0,
    estado: document.getElementById('prova-estado')?.value || 'AGENDADA',
    notas: document.getElementById('prova-notas')?.value,
    vinhos,
  };
  if (!body.titulo) { toast('Preencha o título', 'error'); return; }
  try {
    if (id) { await apiFetch(`/provas/${id}`, { method: 'PUT', body: JSON.stringify(body) }); toast('Prova atualizada'); }
    else { await apiFetch('/provas', { method: 'POST', body: JSON.stringify(body) }); toast('Prova criada'); }
    closeProvaModal(); loadProvas();
  } catch {
    if (id) { const i = allProvas.findIndex(x => x.id === +id); if (i >= 0) allProvas[i] = { ...allProvas[i], ...body }; }
    else { allProvas.push({ id: Date.now(), ...body }); }
    toast('Guardado (modo demo)'); closeProvaModal(); updateProvasStats(); filterProvas(provaFilter);
  }
}

async function changeProvaEstado(id, estado) {
  try { await apiFetch(`/provas/${id}`, { method: 'PUT', body: JSON.stringify({ estado }) }); }
  catch { const p = allProvas.find(x => x.id === id); if (p) p.estado = estado; }
  toast('Estado atualizado'); loadProvas();
}

/* ══════════════════════════════════════════════
   20. CAVES — Cellar Grid
   ══════════════════════════════════════════════ */
const CAVE_CONFIGS = {
  A: { rows: 10, cols: 12, nome: 'Cave A — Principal' },
  B: { rows: 8, cols: 10, nome: 'Cave B — Reserva' },
  C: { rows: 6, cols: 8, nome: 'Cave C — Premium' },
};
let caveData = {}, currentCave = 'A', selectedSlot = null, caveVinhos = [];

async function loadCave(cave) {
  currentCave = cave || 'A';
  await checkApi();
  const cfg = CAVE_CONFIGS[currentCave];
  const nameEl = document.getElementById('cave-name'); if (nameEl) nameEl.textContent = cfg.nome;

  // Highlight active cave button
  document.querySelectorAll('.cave-selector-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.cave-selector-btn[onclick*="'${currentCave}'"]`);
  if (activeBtn) activeBtn.classList.add('active');

  try { caveVinhos = await apiFetch('/vinhos'); } catch { caveVinhos = FALLBACK.vinhos; }
  try { caveData = await apiFetch(`/caves/${currentCave}`); } catch {
    caveData = {};
    const demo = [
      { row: 1, col: 3, vinho: FALLBACK.vinhos[0] }, { row: 1, col: 4, vinho: FALLBACK.vinhos[0] },
      { row: 2, col: 1, vinho: FALLBACK.vinhos[2] }, { row: 3, col: 5, vinho: FALLBACK.vinhos[3] },
      { row: 4, col: 2, vinho: FALLBACK.vinhos[6] }, { row: 4, col: 3, vinho: FALLBACK.vinhos[6] },
      { row: 5, col: 7, vinho: FALLBACK.vinhos[9] }, { row: 6, col: 1, vinho: FALLBACK.vinhos[1] },
    ];
    demo.forEach(d => { caveData[`${d.row}-${d.col}`] = d.vinho; });
  }
  renderCaveGrid(); updateCaveStats();
  selectedSlot = null; resetSlotInfo();
}

function updateCaveStats() {
  const cfg = CAVE_CONFIGS[currentCave];
  const total = cfg.rows * cfg.cols;
  const occ = Object.keys(caveData).length;
  const free = total - occ;
  const pct = Math.round(occ / total * 100);
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('cave-capacity', total); set('cave-occupied', occ); set('cave-free', free); set('cave-pct', pct + '%');
}

function renderCaveGrid() {
  const cfg = CAVE_CONFIGS[currentCave];
  const container = document.getElementById('cave-grid-container'); if (!container) return;
  const typeClass = { Tinto: 'tinto', Branco: 'branco', 'Rosé': 'rose', Espumante: 'espumante', Porto: 'porto' };
  const colHeaders = [''].concat(Array.from({ length: cfg.cols }, (_, i) => String(i + 1).padStart(2, '0')));
  let html = `<div class="cave-grid" style="grid-template-columns:24px repeat(${cfg.cols},56px);">`;
  html += colHeaders.map(h => `<div class="cave-row-label" style="height:24px;">${h}</div>`).join('');
  for (let r = 1; r <= cfg.rows; r++) {
    html += `<div class="cave-row-label">${String.fromCharCode(64 + r)}</div>`;
    for (let c = 1; c <= cfg.cols; c++) {
      const key = `${r}-${c}`;
      const wine = caveData[key];
      const tc = wine ? typeClass[wine.tipo] || 'tinto' : '';
      const active = selectedSlot === key ? 'style="outline:2px solid var(--accent-gold);outline-offset:2px;"' : '';
      if (wine) {
        const shortName = wine.nome.split(' ').slice(0, 2).join(' ');
        html += `<div class="cave-slot occupied ${tc}" onclick="selectSlot('${key}')" title="${wine.nome}" ${active}>
          <div class="cave-slot-label">${shortName}</div>
          ${wine.anoColheita ? `<div class="cave-slot-year">${wine.anoColheita}</div>` : ''}
        </div>`;
      } else {
        html += `<div class="cave-slot" onclick="selectSlot('${key}')" title="Posição ${String.fromCharCode(64 + r)}${c} — Vazia" ${active}><div style="font-size:9px;color:var(--border-subtle);">+</div></div>`;
      }
    }
  }
  html += '</div>';
  container.innerHTML = html;
}

function selectSlot(key) {
  selectedSlot = key;
  renderCaveGrid();
  const [r, c] = key.split('-');
  const rowLabel = String.fromCharCode(64 + parseInt(r));
  const wine = caveData[key];
  const infoEl = document.getElementById('slot-info-content');
  const actEl = document.getElementById('slot-actions');
  const clearBtn = document.getElementById('clear-slot-btn');
  if (infoEl) {
    if (wine) {
      infoEl.innerHTML = `<div style="font-weight:600;font-size:14px;margin-bottom:6px;">${wine.nome}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:2px;">Tipo: ${wine.tipo} · Região: ${wine.regiao || '—'}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:2px;">Colheita: ${wine.anoColheita || '—'} · Preço: ${fmt.eur(wine.preco)}</div>
        <div style="font-size:12px;color:var(--text-gold);margin-top:6px;font-weight:600;">Posição ${rowLabel}${c}</div>`;
    } else {
      infoEl.innerHTML = `<div style="color:var(--text-muted);font-size:13px;">Posição <strong style="color:var(--text-primary);">${rowLabel}${c}</strong> está vazia.</div>`;
    }
    infoEl.style.fontStyle = 'normal';
  }
  if (actEl) {
    actEl.style.display = 'flex';
    const sel = document.getElementById('slot-wine-select');
    if (sel) { sel.innerHTML = caveVinhos.map(v => `<option value="${v.id}">${v.nome} (${v.tipo} ${v.anoColheita || ''})</option>`).join(''); }
    if (clearBtn) clearBtn.style.display = wine ? 'flex' : 'none';
  }
}

function resetSlotInfo() {
  const infoEl = document.getElementById('slot-info-content');
  const actEl = document.getElementById('slot-actions');
  if (infoEl) { infoEl.innerHTML = 'Clique numa posição para ver os detalhes'; infoEl.style.fontStyle = 'italic'; }
  if (actEl) actEl.style.display = 'none';
}

function assignWineToSlot() {
  if (!selectedSlot) return;
  const sel = document.getElementById('slot-wine-select'); if (!sel) return;
  const winhoId = +sel.value;
  const wine = caveVinhos.find(v => v.id === winhoId); if (!wine) return;
  caveData[selectedSlot] = wine;
  toast(`${wine.nome} colocado na posição ${selectedSlot}`, 'success');
  renderCaveGrid(); selectSlot(selectedSlot); updateCaveStats();
}

function clearSlot() {
  if (!selectedSlot) return;
  delete caveData[selectedSlot];
  toast('Posição esvaziada');
  renderCaveGrid(); resetSlotInfo(); selectedSlot = null; updateCaveStats();
}

/* ══════════════════════════════════════════════
   20. EXPORT FUNCTIONS
   ══════════════════════════════════════════════ */
function exportRelatorioCSV() {
  const table = document.getElementById('top-wines-table');
  if (!table) { toast('Sem dados para exportar', 'warning'); return; }

  let csv = 'Pos.,Produto,Tipo,Vendas,Receita,Quota\n';
  table.querySelectorAll('tr').forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length) {
      const vals = Array.from(cells).map(c => '"' + c.textContent.trim().replace(/"/g, '""') + '"');
      csv += vals.join(',') + '\n';
    }
  });

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `relatorio_vinhadouro_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  toast('Relatório exportado com sucesso', 'success');
}

/* ══════════════════════════════════════════════
   21. AUTO-INIT
   ══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.split('/').pop() || 'index.html';

  if (path !== 'index.html' && path !== '' && path !== '/') {
    Session.guard();
    buildSidebar();
    Screensaver.init();
  }

  // Add smooth page entrance
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.4s ease';
    document.body.style.opacity = '1';
  });

  switch (path) {
    case 'index.html': case '': case '/':
      initLogin(); checkApi(); break;

    case 'gerente.html':
      loadDashboard(); setInterval(() => checkApi().then(updateApiBadge), 30000); break;

    case 'loja.html':
      loadPOS(); setInterval(() => checkApi().then(updateApiBadge), 30000); break;

    case 'stock.html':
      loadStock();
      document.getElementById('stock-search')?.addEventListener('input', renderStock);
      document.getElementById('tipo-filter')?.addEventListener('change', renderStock);
      break;

    case 'gerente-vendas.html':
      loadVendas();
      document.getElementById('vendas-search')?.addEventListener('input', filterVendas);
      document.getElementById('estado-filter')?.addEventListener('change', filterVendas);
      break;

    case 'gerente-equipa.html':
      loadEquipa(); break;

    case 'gerente-relatorios.html':
      loadRelatorios(); break;

    case 'provas.html':
      (async () => {
        try { allProvas._wineCache = await apiFetch('/vinhos'); } catch { allProvas._wineCache = FALLBACK.vinhos; }
        loadProvas();
      })();
      break;

    case 'caves.html':
      loadCave('A'); break;
  }
});
