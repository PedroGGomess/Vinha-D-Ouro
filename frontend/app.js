/* ============================================================================
   the 100's — Premium Wine Management System
   app.js · Unified Frontend Logic v3.0
   ============================================================================
   Autores: Pedro Gomes, Eduardo Lourenço, Kollan Intacua
   Universidade Lusófona — Grupo 13
   ============================================================================ */

const API = window.location.origin + '/api';

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
    // Sessão antiga (criada antes de termos tokens). Força re-login para ter token.
    if (!user.token) {
      this.clear();
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
    caves: '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M2 12h20M7 7h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z"></path></svg>'
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

  // Determine layout: gerente pages use <ul class="sidebar-nav-list"> wrappers;
  // stock/caves use direct <a class="nav-link"> children. Detect by presence
  // of a sidebar-nav-list (or by URL prefix as fallback).
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  const sidebarNavEl = sidebar.querySelector('.sidebar-nav');
  const isGerentePage = path.startsWith('gerente') ||
                        !!sidebarNavEl?.querySelector('.sidebar-nav-list');

  if (isGerentePage) {
    // Rebuild the sidebar-nav for gerente pages (uses <ul><li> structure)
    const sidebarNav = sidebarNavEl;
    if (!sidebarNav) return;

    // Limpar TUDO o conteúdo dinâmico para evitar duplicação em re-renderizações
    sidebarNav.querySelectorAll('.sidebar-nav-item, .sidebar-nav-list, .nav-section-label, .nav-link').forEach(n => n.remove());

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
    const sidebarNav = sidebarNavEl;
    if (!sidebarNav) return;

    // Limpar TUDO o conteúdo dinâmico para evitar duplicação
    sidebarNav.querySelectorAll('.nav-link, .nav-section-label, .sidebar-nav-list, .sidebar-nav-item').forEach(n => n.remove());

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
  try { Screensaver.stop(); } catch(e) { /* screensaver may not be initialized */ }
  const sess = Session.get();
  if (sess && sess.token) {
    fetch(`${API}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sess.token}` },
      keepalive: true,
    }).catch(() => {});
  }
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
    if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
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
let _loginFormBound = false;

function initLogin() {
  const session = Session.get();
  if (session && session.token && session.redirect) {
    window.location.href = session.redirect;
    return;
  }

  const form = document.getElementById('loginForm') || document.getElementById('login-form');
  if (form && !_loginFormBound) {
    _loginFormBound = true;
    form.addEventListener('submit', handleLogin);
  }

  const roleSection = document.getElementById('roleSection');
  if (roleSection) roleSection.classList.remove('show');
}

/* ══════════════════════════════════════════════
   3. API HELPERS
   ══════════════════════════════════════════════ */
let apiOnline = false;

/** AbortSignal com timeout (compatível com browsers sem AbortSignal.timeout). */
function fetchAbortAfter(ms) {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return { signal: AbortSignal.timeout(ms), cleanup: null };
  }
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, cleanup: () => clearTimeout(t) };
}

async function checkApi() {
  const { signal, cleanup } = fetchAbortAfter(2500);
  try {
    const r = await fetch(`${API}/health`, { signal });
    apiOnline = r.ok;
  } catch { apiOnline = false; }
  finally { cleanup?.(); }
  updateApiBadge();
  return apiOnline;
}

function updateApiBadge() {
  const badge = document.getElementById('api-badge')
    || document.querySelector('nav.sidebar .api-badge, .sidebar .api-badge');
  const label = document.getElementById('api-label');
  if (badge) {
    badge.className = apiOnline ? 'api-badge online' : 'api-badge offline';
  }
  if (label) label.textContent = apiOnline ? 'BD Ligada' : 'Offline (Demo)';
  const dot = document.getElementById('api-dot');
  if (dot) dot.className = apiOnline ? 'status-dot' : 'status-dot off';
}

/**
 * Wrapper de fetch para a API:
 *  · injeta Authorization Bearer + Content-Type JSON
 *  · timeout de 15s via AbortController (evita pendurar para sempre)
 *  · 401 → limpa sessão + redireciona para login
 *  · erro de rede → mensagem amigável
 */
async function apiFetch(path, opts = {}) {
  const sess = Session.get();
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (sess && sess.token) headers['Authorization'] = `Bearer ${sess.token}`;

  // AbortController para timeout — 15s é tempo suficiente para queries lentas em MySQL
  const controller = new AbortController();
  const timeoutMs = opts.timeoutMs || 15000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let r;
  try {
    r = await fetch(`${API}${path}`, { ...opts, headers, signal: controller.signal });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(`Pedido ao servidor demorou mais de ${timeoutMs/1000}s — verifica a ligação`);
    }
    throw new Error('Não foi possível contactar o servidor (rede offline?)');
  }
  clearTimeout(timer);

  let data;
  try { data = await r.json(); } catch { data = {}; }
  if (r.status === 401) {
    // Token inválido/expirado — limpa sessão e redireciona para login
    Session.clear();
    if (window.location.pathname.split('/').pop() !== 'index.html') {
      window.location.href = 'index.html';
    }
    throw new Error(data.error || 'Sessão expirada');
  }
  if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
  return data;
}

/* ══════════════════════════════════════════════
   4. TOAST NOTIFICATIONS
   ══════════════════════════════════════════════ */
/**
 * Notificação toast — premium, glassmorphic, bottom-right.
 * Tipos: 'success' | 'error' | 'warning' | 'info'
 * Auto-fecha após `ms` ms; clicável para dismiss imediato.
 * Limita a 4 toasts visíveis (FIFO — o mais antigo desaparece).
 */
function toast(msg, type = 'success', ms = 3500) {
  const c = document.getElementById('toasts'); if (!c) return;

  // Limita stack a 4 toasts visíveis — remove o mais antigo se exceder
  while (c.querySelectorAll('.toast:not(.toast-leaving)').length >= 4) {
    const oldest = c.querySelector('.toast:not(.toast-leaving)');
    if (oldest) dismissToast(oldest);
    else break;
  }

  const icons = {
    success: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    error:   '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    warning: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    info:    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  };

  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.setAttribute('role', type === 'error' ? 'alert' : 'status');
  t.style.setProperty('--toast-dur', ms + 'ms');

  // Ícone (SVG inline, fill=none + stroke=currentColor) — width/height explícitos para evitar overflow
  const iconWrap = document.createElement('span');
  iconWrap.className = 'toast-icon';
  iconWrap.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[type] || icons.info}</svg>`;

  // Texto principal (via textContent — XSS-safe)
  const txt = document.createElement('span');
  txt.textContent = String(msg);

  t.appendChild(iconWrap);
  t.appendChild(txt);
  c.appendChild(t);

  // Clica para dismiss imediato
  t.addEventListener('click', () => dismissToast(t));

  // Anima entrada
  requestAnimationFrame(() => t.classList.add('show'));

  // Auto-dismiss
  const timer = setTimeout(() => dismissToast(t), ms);
  t._dismissTimer = timer;
}

/** Remove um toast com animação de saída. */
function dismissToast(el) {
  if (!el || el.classList.contains('toast-leaving')) return;
  clearTimeout(el._dismissTimer);
  el.classList.remove('show');
  el.classList.add('toast-leaving');
  setTimeout(() => el.remove(), 320);
}

/* ══════════════════════════════════════════════
   5. FORMAT / SAFETY HELPERS
   ══════════════════════════════════════════════ */
const fmt = {
  eur:  v => `${(+v || 0).toFixed(2).replace('.', ',')} €`,
  num:  v => (v || 0).toLocaleString('pt-PT'),
  date: s => { if (!s) return '—'; try { return new Date(s).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch { return s; } },
  dt:   s => { if (!s) return '—'; try { return new Date(s).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return s; } },
};

/** Anima um número de 0 ao valor target ao longo de duration ms. */
function countUp(el, target, opts = {}) {
  if (!el) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = opts.format ? opts.format(target) : String(target);
    return;
  }
  const duration = opts.duration ?? 900;
  const fmtFn = opts.format || (v => String(Math.round(v)));
  const start = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
    const v = target * eased;
    el.textContent = fmtFn(v);
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = fmtFn(target);
  }
  requestAnimationFrame(tick);
}

/** Escapa HTML para uso seguro em templates literais (defesa contra XSS em dados da API). */
function escHtml(v) {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Estado vazio reutilizável. Usar em containers (grid/tbody) quando a lista vier vazia. */
function emptyState(message = 'Sem dados para mostrar', icon = '📭') {
  return `<div class="empty-state" style="grid-column:1/-1;text-align:center;padding:48px 16px;color:var(--text-muted);">
    <div style="font-size:32px;margin-bottom:8px;opacity:0.6;" aria-hidden="true">${icon}</div>
    <div style="font-size:13px;">${escHtml(message)}</div>
  </div>`;
}

/** Estado de erro reutilizável. */
function errorState(message = 'Não foi possível carregar', onRetry = null) {
  const id = 'err-retry-' + Math.random().toString(36).slice(2, 8);
  if (onRetry && typeof window !== 'undefined') {
    setTimeout(() => { document.getElementById(id)?.addEventListener('click', onRetry); }, 0);
  }
  return `<div class="error-state" style="grid-column:1/-1;text-align:center;padding:48px 16px;color:var(--text-muted);">
    <div style="font-size:32px;margin-bottom:8px;opacity:0.6;" aria-hidden="true">⚠️</div>
    <div style="font-size:13px;margin-bottom:12px;">${escHtml(message)}</div>
    ${onRetry ? `<button id="${id}" type="button" class="btn btn-secondary btn-sm">Tentar novamente</button>` : ''}
  </div>`;
}

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
function drawBarChart(svgId, labels, values, color = '#C9A96E') {
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
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

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
          <h2 class="screensaver-title">the 100&apos;s</h2>
          <p class="screensaver-subtitle">Bottled Memories</p>
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
  const elements = document.querySelectorAll('.kpi-card, .card, .team-card, .comparison-card, .wine-card');
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

  // KPIs com count-up animado
  const eurFmt = v => fmt.eur(v);
  countUp(document.getElementById('kpi-receita'), data.receitaTotal || 0, { format: eurFmt });
  countUp(document.getElementById('kpi-vendas'),  data.vendas || 0);
  countUp(document.getElementById('kpi-lucro'),   data.lucroLiquido || 0, { format: eurFmt });
  countUp(document.getElementById('kpi-ticket'),  data.ticketMedio || 0, { format: eurFmt });
  countUp(document.getElementById('kpi-critico'), data.stockCritico || 0);
  countUp(document.getElementById('kpi-stock'),   data.valorStock || 0, { format: eurFmt });

  drawBarChart('chart-vendas', data.vendasLabels || ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Hj'], data.vendasSemanais || [0, 0, 0, 0, 0, 0, 0], '#C9A96E');
  drawLineChart('chart-receita', ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'], [120, 185, 240, 180, 310, 420], '#A83D4A');

  // Recent sales
  let vendas;
  try { vendas = await apiFetch('/vendas'); } catch { vendas = FALLBACK.vendas; }
  renderVendasTable(document.getElementById('vendas-table'), vendas.slice(0, 6));

  // Top wines + stock alerts
  let vinhos;
  try { vinhos = await apiFetch('/vinhos'); } catch { vinhos = FALLBACK.vinhos; }

  // Top vinhos — premium ranking list
  const topWinesEl = document.getElementById('dash-top-wines');
  if (topWinesEl) {
    const sorted = [...vinhos].sort((a, b) => (b.preco * b.quantidade) - (a.preco * a.quantidade)).slice(0, 5);
    const maxValor = Math.max(...sorted.map(v => (v.preco || 0) * (v.quantidade || 0)), 1);
    const typeColors = { Tinto:'#8B3A44', Branco:'#D4AF37', 'Rosé':'#E75480', Espumante:'#C9A96E', Porto:'#5A2A22', Madeira:'#C68A2E' };
    topWinesEl.innerHTML = `<ol class="rank-list">${sorted.map((v, i) => {
      const valor = (v.preco || 0) * (v.quantidade || 0);
      const pct = Math.round((valor / maxValor) * 100);
      const color = typeColors[v.tipo] || 'var(--gold)';
      return `<li class="rank-item" style="animation-delay:${i * 70}ms">
        <span class="rank-num">${i + 1}</span>
        <span class="rank-bar" style="--rank-color:${color}">
          <span class="rank-fill" style="width:${pct}%"></span>
        </span>
        <div class="rank-body">
          <div class="rank-line">
            <span class="rank-name">${escHtml(v.nome)}</span>
            <span class="rank-value">${escHtml(fmt.eur(valor))}</span>
          </div>
          <div class="rank-meta">
            <span class="rank-tag">${escHtml(v.tipo || '—')}</span>
            <span class="rank-stock">${v.quantidade || 0} un. · ${escHtml(fmt.eur(v.preco))}</span>
          </div>
        </div>
      </li>`;
    }).join('')}</ol>`;
  }

  // Stock alerts — premium alert cards
  const alertsEl = document.getElementById('dash-stock-alerts');
  if (alertsEl) {
    const critical = vinhos.filter(v => (v.quantidade || 0) < 10).sort((a, b) => (a.quantidade || 0) - (b.quantidade || 0));
    if (!critical.length) {
      alertsEl.innerHTML = `<div class="alert-clean">
        <div class="alert-clean-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
        <div>
          <p class="alert-clean-title">Tudo em ordem</p>
          <p class="alert-clean-sub">Todos os vinhos têm stock adequado.</p>
        </div>
      </div>`;
    } else {
      alertsEl.innerHTML = `<ul class="alert-list">${critical.slice(0, 6).map((v, i) => {
        const qty = v.quantidade || 0;
        const isOut = qty === 0;
        return `<li class="alert-item ${isOut ? 'alert-out' : 'alert-low'}" style="animation-delay:${i * 60}ms">
          <span class="alert-dot" aria-hidden="true"></span>
          <div class="alert-body">
            <span class="alert-name">${escHtml(v.nome)}</span>
            <span class="alert-meta">${escHtml(v.tipo || '—')} · ${escHtml(v.regiao || '—')}</span>
          </div>
          <span class="alert-qty ${isOut ? 'qty-out' : 'qty-low'}">${isOut ? 'ESGOTADO' : qty + ' un.'}</span>
        </li>`;
      }).join('')}</ul>
      <a href="stock.html" class="alert-link">Ver inventário completo →</a>`;
    }
  }

  // Aplicar preferências guardadas de visibilidade dos widgets
  applyDashVisibility();
  buildDashEditorList();
  animateEntrance();
}

/* ══════════════════════════════════════════════
   10b. DASHBOARD EDITOR — Mostrar/esconder widgets
   ══════════════════════════════════════════════ */
const DASH_PREFS_KEY = 'vd_dash_widgets_v1';
const DASH_DEFAULT_VISIBLE = {
  'kpi-receita': true, 'kpi-vendas': true, 'kpi-lucro': true, 'kpi-ticket': true,
  'kpi-critico': true, 'kpi-stock': true,
  'charts': true, 'top-wines': true, 'stock-alerts': true,
};

function _dashLoadPrefs() {
  try { return { ...DASH_DEFAULT_VISIBLE, ...(JSON.parse(localStorage.getItem(DASH_PREFS_KEY) || '{}')) }; }
  catch { return { ...DASH_DEFAULT_VISIBLE }; }
}
function _dashSavePrefs(prefs) {
  try { localStorage.setItem(DASH_PREFS_KEY, JSON.stringify(prefs)); } catch {}
}

function applyDashVisibility() {
  const prefs = _dashLoadPrefs();
  document.querySelectorAll('[data-widget]').forEach(el => {
    const key = el.dataset.widget;
    if (prefs[key] === false) el.classList.add('widget-hidden');
    else el.classList.remove('widget-hidden');
  });
}

function buildDashEditorList() {
  const list = document.getElementById('dash-editor-list');
  if (!list) return;
  const prefs = _dashLoadPrefs();
  const widgets = Array.from(document.querySelectorAll('[data-widget]'))
    .map(el => ({ key: el.dataset.widget, name: el.dataset.widgetName || el.dataset.widget }))
    .filter((w, i, arr) => arr.findIndex(x => x.key === w.key) === i);
  list.innerHTML = widgets.map(w => `
    <label class="dash-editor-item ${prefs[w.key] !== false ? 'checked' : ''}" data-widget-key="${escHtml(w.key)}">
      <input type="checkbox" ${prefs[w.key] !== false ? 'checked' : ''} onchange="dashToggleWidget('${escHtml(w.key)}', this.checked)">
      <span>${escHtml(w.name)}</span>
    </label>
  `).join('');
}

function dashToggleWidget(key, visible) {
  const prefs = _dashLoadPrefs();
  prefs[key] = !!visible;
  _dashSavePrefs(prefs);
  applyDashVisibility();
  // Update visual state of label
  const label = document.querySelector(`.dash-editor-item[data-widget-key="${key}"]`);
  if (label) label.classList.toggle('checked', !!visible);
}

function toggleDashEditor() {
  const ed = document.getElementById('dash-editor');
  if (!ed) return;
  const isOpen = !ed.hasAttribute('hidden');
  if (isOpen) {
    ed.setAttribute('hidden', '');
    document.body.classList.remove('dash-edit-mode');
  } else {
    buildDashEditorList();
    ed.removeAttribute('hidden');
    document.body.classList.add('dash-edit-mode');
    ed.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function dashResetVisibility() {
  _dashSavePrefs({ ...DASH_DEFAULT_VISIBLE });
  applyDashVisibility();
  buildDashEditorList();
  toast('Layout do dashboard reposto', 'info');
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

  // ── KPIs por período ──
  const concluded = allVendas.filter(v => (v.status || v.estado) === 'CONCLUIDA');
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const monStart = new Date(now); monStart.setDate(now.getDate() - ((now.getDay() + 6) % 7)); monStart.setHours(0,0,0,0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const inPeriod = (start) => concluded.filter(v => {
    const d = new Date(v.dataVenda || 0);
    return d >= start;
  });
  const ofToday = concluded.filter(v => String(v.dataVenda || '').slice(0,10) === todayStr);
  const ofWeek  = inPeriod(monStart);
  const ofMonth = inPeriod(monthStart);

  const sumT = arr => arr.reduce((s, v) => s + (+v.total || 0), 0);
  const totHoje = sumT(ofToday);
  const totSem = sumT(ofWeek);
  const totMes = sumT(ofMonth);
  const ticketMed = concluded.length ? sumT(concluded) / concluded.length : 0;

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  countUp(document.getElementById('hv-kpi-hoje'), ofToday.length);
  set('hv-kpi-hoje-eur', fmt.eur(totHoje));
  countUp(document.getElementById('hv-kpi-semana'), totSem, { format: fmt.eur });
  set('hv-kpi-semana-n', `${ofWeek.length} venda${ofWeek.length === 1 ? '' : 's'}`);
  countUp(document.getElementById('hv-kpi-mes'), totMes, { format: fmt.eur });
  set('hv-kpi-mes-n', `${ofMonth.length} venda${ofMonth.length === 1 ? '' : 's'}`);
  countUp(document.getElementById('hv-kpi-ticket'), ticketMed, { format: fmt.eur });
  set('hv-kpi-total', `Total: ${concluded.length} venda${concluded.length === 1 ? '' : 's'}`);

  // Compatibilidade legacy
  set('sales-this-week', fmt.eur(totSem));
  set('total-transactions', allVendas.length);
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
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:50px;color:var(--text-muted);">Nenhuma venda encontrada</td></tr>`;
    return;
  }
  tbody.innerHTML = vendas.map(v => {
    const status = v.status || v.estado || '';
    const isPaid = status === 'CONCLUIDA' || status === 'PAGA';
    const codigo = escHtml(v.codigo || `VD-${String(v.id).padStart(4, '0')}`);
    const cliente = escHtml(v.clienteNome || v.cliente || 'Consumidor Final');
    const clienteNif = v.clienteNif ? `<span style="font-size:10px;color:var(--text-muted);display:block;">NIF ${escHtml(v.clienteNif)}</span>` : '';
    const funcionario = escHtml(v.funcionarioNome || 'Sistema');
    const produto = escHtml(v.produto || '—');
    const metodo = escHtml(v.metodoPagamento || '—');
    return `<tr>
      <td><span style="font-family:var(--font-display);font-size:13px;color:var(--text-gold);font-weight:600;">${codigo}</span></td>
      <td>${cliente}${clienteNif}</td>
      <td><span style="display:inline-flex;align-items:center;gap:6px;font-size:12.5px;"><span style="width:22px;height:22px;border-radius:50%;background:rgba(201,169,110,0.14);color:#C9A96E;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:10px;letter-spacing:0.5px;" aria-hidden="true">${escHtml((v.funcionarioNome || 'S').split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase())}</span>${funcionario}</span></td>
      <td class="muted" style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${produto}</td>
      <td class="muted">${metodo}</td>
      <td><span style="font-family:var(--font-display);font-weight:700;">${fmt.eur(v.total)}</span></td>
      <td>${statusBadge(status)}</td>
      <td class="muted">${fmt.dt(v.dataVenda)}</td>
      <td><div style="display:flex;gap:5px;">
        <button class="btn btn-secondary btn-sm btn-icon" onclick="printVendaReceipt(${v.id})" title="Imprimir Fatura" aria-label="Imprimir fatura ${codigo}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></button>
        ${isPaid ? '<span class="badge badge-success" style="font-size:9px;">Paga</span>' : ''}
      </div></td>
    </tr>`;
  }).join('');
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
  renderGuiasHistorico();   // Histórico de guias de transporte
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
}

/** Ordenação da listagem de stock (filtros aplicados antes). */
function sortStockList(items, sortKey) {
  const arr = [...items];
  switch (sortKey) {
    case 'stock-asc':
      return arr.sort((a, b) => (a.quantidade || 0) - (b.quantidade || 0));
    case 'stock-desc':
      return arr.sort((a, b) => (b.quantidade || 0) - (a.quantidade || 0));
    case 'preco-desc':
      return arr.sort((a, b) => (b.preco || 0) - (a.preco || 0));
    case 'nome':
    default:
      return arr.sort((a, b) =>
        (a.nome || '').localeCompare(b.nome || '', 'pt', { sensitivity: 'base' }));
  }
}

function renderStock() {
  const tbody = document.getElementById('stock-table'); if (!tbody) return;
  const q = (document.getElementById('stock-search')?.value || '').toLowerCase();
  const t = document.getElementById('tipo-filter')?.value || '';
  const onlyCrit = document.getElementById('stock-only-crit')?.checked;
  const sortKey = document.getElementById('stock-sort')?.value || 'nome';

  let list = allVinhos.filter(v => {
    const txt = `${v.nome || ''} ${v.regiao || ''} ${v.produtor || ''}`.toLowerCase();
    const qty = v.quantidade || 0;
    const passCrit = !onlyCrit || qty < 10;
    return txt.includes(q) && (!t || v.tipo === t) && passCrit;
  });

  list = sortStockList(list, sortKey);

  const meta = document.getElementById('stock-table-meta');
  if (meta) {
    const visUnits = list.reduce((s, v) => s + (v.quantidade || 0), 0);
    const n = allVinhos.length;
    meta.textContent = n
      ? `A mostrar ${list.length} de ${n} referências · ${fmt.num(visUnits)} garrafas nesta vista`
      : 'Sem dados — verifique a ligação à API ou adicione referências.';
  }

  if (!list.length) {
    const msg = allVinhos.length
      ? 'Nenhum resultado com estes filtros. Ajuste a pesquisa ou desactive «Só críticos».'
      : 'Sem referências. Clique em «Nova referência» para começar.';
    tbody.innerHTML = `<tr><td colspan="9" class="stock-empty">${msg}</td></tr>`;
    return;
  }

  const maxQ = Math.max(...allVinhos.map(v => v.quantidade || 0), 100);
  const typeDots = { Tinto: 'tinto', Branco: 'branco', 'Rosé': 'rose', Espumante: 'espumante', Porto: 'porto', Madeira: 'madeira' };

  tbody.innerHTML = list.map(v => {
    const qty = v.quantidade || 0;
    let sc = 'badge-success', st = 'OK';
    if (qty === 0) { sc = 'badge-danger'; st = 'Esgotado'; }
    else if (qty < 10) { sc = 'badge-danger'; st = 'Crítico'; }
    else if (qty < 25) { sc = 'badge-warning'; st = 'Baixo'; }
    const nome = escHtml(v.nome);
    const tipo = escHtml(v.tipo || '—');
    const regiao = escHtml(v.regiao || '—');
    const produtor = escHtml(v.produtor || '—');
    const ano = v.anoColheita != null ? escHtml(String(v.anoColheita)) : '—';
    const rowCrit = qty < 10 ? ' stock-row--critical' : '';
    const subParts = [v.tipo, v.regiao].filter(Boolean).map(escHtml).join(' · ');
    return `<tr class="stock-row${rowCrit}">
      <td class="stock-cell-product"><div style="display:flex;align-items:center;gap:12px;">
        <div class="stock-bottle-mini" aria-hidden="true">${wineBottleSVG(v.tipo)}</div>
        <div>
          <div class="stock-product-name">${nome}</div>
          <div class="stock-product-sub">${subParts || '—'}</div>
        </div>
      </div></td>
      <td class="stock-cell-muted"><div style="display:inline-flex;align-items:center;gap:6px;"><span class="wine-type-dot ${typeDots[v.tipo] || ''}" style="position:static;" aria-hidden="true"></span>${tipo}</div></td>
      <td class="stock-cell-muted">${regiao}</td>
      <td class="stock-cell-muted">${produtor}</td>
      <td class="stock-cell-muted">${ano}</td>
      <td><span style="font-family:var(--font-display);font-weight:700;color:var(--text-gold);">${fmt.eur(v.preco)}</span></td>
      <td style="min-width:132px;">${stockBar(qty, maxQ)}</td>
      <td><span class="badge ${sc}">${st}</span></td>
      <td class="align-right"><div class="stock-actions">
        <button type="button" class="btn btn-secondary btn-sm btn-icon" onclick="openEditModal(${v.id})" title="Editar" aria-label="Editar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button type="button" class="btn btn-secondary btn-sm btn-icon" onclick="openStockModal(${v.id})" title="Ajustar stock" aria-label="Ajustar stock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg></button>
        <button type="button" class="btn btn-secondary btn-sm btn-icon" onclick="openGuiaModal(${v.id})" title="Guia de transporte" aria-label="Guia de transporte"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></button>
      </div></td>
    </tr>`;
  }).join('');
}

// Wine modal
function openAddModal() {
  document.getElementById('modal-title').textContent = 'Nova referência';
  document.getElementById('wine-id').value = '';
  ['wine-nome', 'wine-regiao', 'wine-produtor', 'wine-ano', 'wine-preco', 'wine-qty'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('wine-modal')?.classList.remove('hidden');
}

function openEditModal(id) {
  const v = allVinhos.find(x => x.id === id); if (!v) return;
  document.getElementById('modal-title').textContent = 'Editar referência';
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
  if (!body.tipo) { toast('Selecione o tipo de vinho', 'error'); return; }
  try {
    if (id) { await apiFetch(`/vinhos/${id}`, { method: 'PUT', body: JSON.stringify(body) }); toast('Referência atualizada'); }
    else { await apiFetch('/vinhos', { method: 'POST', body: JSON.stringify(body) }); toast('Referência criada'); }
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
    Madeira:   { b1: '#3A1810', b2: '#160604', f1: '#C68A2E', f2: '#7A4F12', l: 'rgba(58,24,16,0.92)', ltr: 'M', shape: 'port', glw: 'rgba(198,138,46,0.28)' },
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
let _posListenersBound = false;
const wineTypeClass = { Tinto: 'tinto', Branco: 'branco', 'Rosé': 'rose', Espumante: 'espumante', Porto: 'porto', Madeira: 'madeira' };

function _posActiveFilterKey() {
  const active = document.querySelector('.pos-tab.active, .cat-btn.active, .filter-btn.active');
  const raw = active?.getAttribute('data-filter');
  return raw === null || raw === '' ? 'todos' : raw;
}

/** Recolhe e atualiza os KPIs do topo da loja (vendas/receita/ticket/top categoria — dia em curso). */
async function loadPOSStats() {
  let vendas = [];
  try { vendas = await apiFetch('/vendas'); } catch { vendas = []; }
  const hoje = new Date().toISOString().slice(0, 10);
  const doDia = vendas.filter(v => {
    const d = String(v.dataVenda || '').slice(0, 10);
    return d === hoje && (v.estado === 'CONCLUIDA' || v.status === 'CONCLUIDA');
  });
  const receita = doDia.reduce((s, v) => s + (+v.total || 0), 0);
  const ticket = doDia.length ? receita / doDia.length : 0;

  // Top categoria: contar vendas por tipo (precisa de ler catálogo)
  const topCat = (() => {
    const cnt = {};
    for (const v of doDia) {
      const produtos = String(v.produto || '').split(',').map(s => s.trim()).filter(Boolean);
      for (const p of produtos) {
        const w = (catalog || []).find(x => x.nome === p);
        const t = w?.tipo || 'Outros';
        cnt[t] = (cnt[t] || 0) + 1;
      }
    }
    const entries = Object.entries(cnt).sort((a, b) => b[1] - a[1]);
    return entries.length ? entries[0][0] : '—';
  })();

  countUp(document.getElementById('pos-stat-vendas'), doDia.length);
  countUp(document.getElementById('pos-stat-receita'), receita, { format: fmt.eur });
  countUp(document.getElementById('pos-stat-ticket'), ticket, { format: fmt.eur });
  const topEl = document.getElementById('pos-stat-top');
  if (topEl) topEl.textContent = topCat;
}

async function loadPOS() {
  await checkApi();
  try { catalog = await apiFetch('/vinhos'); } catch { catalog = FALLBACK.vinhos; }
  renderCatalog();
  loadPOSStats();

  const clockEl = document.getElementById('pos-clock');
  if (clockEl && !clockEl.dataset.vdClock) {
    clockEl.dataset.vdClock = '1';
    const tick = () => {
      clockEl.textContent = new Date().toLocaleString('pt-PT', {
        weekday: 'short', day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
    };
    tick();
    setInterval(tick, 1000);
  }

  if (_posListenersBound) return;
  _posListenersBound = true;

  const searchInput = document.getElementById('pos-search') || document.getElementById('wine-search');
  searchInput?.addEventListener('input', () => renderCatalog(_posActiveFilterKey()));

  document.querySelectorAll('.pay-method').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    payMethod = btn.dataset.method;
  }));

  /* ─── Atalhos de teclado (UX nível POS profissional) ───
       /       → focar barra de pesquisa
       Esc     → fechar modal aberto
       F9      → abrir checkout (se carrinho tem itens)
       Enter   → confirmar pagamento (se modal checkout aberto)
       Ctrl+L  → limpar carrinho                                  */
  document.addEventListener('keydown', (e) => {
    // Não interfere quando o utilizador está a escrever em inputs/textareas
    const inEditable = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    const checkoutOpen = !document.getElementById('checkout-modal')?.classList.contains('hidden');
    const receiptOpen  = !document.getElementById('receipt-modal')?.classList.contains('hidden');
    const returnsOpen  = !document.getElementById('returns-modal')?.classList.contains('hidden');
    const anyModalOpen = checkoutOpen || receiptOpen || returnsOpen;

    // '/' → foca pesquisa
    if (e.key === '/' && !inEditable && !anyModalOpen) {
      e.preventDefault();
      searchInput?.focus();
      searchInput?.select();
      return;
    }
    // Esc → fecha qualquer modal aberto
    if (e.key === 'Escape') {
      if (checkoutOpen) { closeCheckoutModal(); e.preventDefault(); return; }
      if (receiptOpen)  { closeReceiptAndReset(); e.preventDefault(); return; }
      if (returnsOpen)  { document.getElementById('returns-modal')?.classList.add('hidden'); e.preventDefault(); return; }
    }
    // F9 → abre checkout (se houver itens no carrinho)
    if (e.key === 'F9' && !anyModalOpen) {
      e.preventDefault();
      if (cart.length > 0 && typeof openCheckoutModal === 'function') {
        openCheckoutModal();
      } else {
        toast('Carrinho vazio — adiciona produtos primeiro', 'warning');
      }
      return;
    }
    // Enter dentro do checkout → confirma pagamento
    if (e.key === 'Enter' && checkoutOpen && !inEditable) {
      const btn = document.getElementById('co-confirm-btn') || document.querySelector('#checkout-modal .btn-confirm');
      btn?.click();
      e.preventDefault();
      return;
    }
    // Ctrl+L → limpa carrinho
    if (e.key === 'l' && (e.ctrlKey || e.metaKey) && !inEditable && !anyModalOpen) {
      e.preventDefault();
      if (cart.length > 0 && confirm('Limpar carrinho?')) clearCart();
    }
    // '?' → mostra ajuda dos atalhos
    if (e.key === '?' && !inEditable && !anyModalOpen) {
      e.preventDefault();
      showShortcutsHelp();
    }
  });

  /* ─── Auto-focus na barra de pesquisa quando o POS carrega ─── */
  setTimeout(() => {
    if (document.activeElement === document.body) searchInput?.focus();
  }, 200);

  /* ─── Restaura estado do ícone de som a partir do localStorage ─── */
  syncSoundIcon();
}

/** Alterna o som on/off e atualiza o ícone. Chamado pelo botão na topbar do POS. */
function toggleSound() {
  const nowOn = SoundFX.toggle();
  syncSoundIcon();
  toast(nowOn ? '🔊 Som ligado' : '🔇 Som desligado', 'info', 1800);
}

/** Sincroniza o ícone do botão de som com o estado em localStorage. */
function syncSoundIcon() {
  const on  = document.getElementById('sound-icon-on');
  const off = document.getElementById('sound-icon-off');
  if (!on || !off) return;
  const enabled = SoundFX.isEnabled();
  on.style.display  = enabled ? '' : 'none';
  off.style.display = enabled ? 'none' : '';
}

const wineEmojis = { Tinto: '🍷', Branco: '🥂', 'Rosé': '🌸', Espumante: '✨', Porto: '🍇', Madeira: '🥃' };

/**
 * Destaca (highlight) os caracteres do nome que correspondem ao termo de pesquisa.
 * Faz escaping HTML primeiro (segurança XSS), depois envolve a porção com <mark>.
 * Insensível a maiúsculas/acentos.
 */
function highlightMatch(text, query) {
  const safe = escHtml(text || '');
  if (!query) return safe;
  const q = String(query).trim();
  if (!q) return safe;
  // Normaliza para comparação sem acentos
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const safeLower = norm(safe);
  const qLower = norm(q);
  const idx = safeLower.indexOf(qLower);
  if (idx === -1) return safe;
  // Encontra a posição equivalente no texto original (safe pode ter HTML entities)
  return safe.slice(0, idx) +
         '<mark class="pos-mark">' + safe.slice(idx, idx + q.length) + '</mark>' +
         safe.slice(idx + q.length);
}

function _renderTile(v, query = '') {
  const oos = (v.quantidade || 0) === 0;
  const tc = wineTypeClass[v.tipo] || 'tinto';
  const qty = v.quantidade || 0;
  const stockClass = oos ? 'oos-label' : qty < 5 ? 'low' : '';
  const emoji = wineEmojis[v.tipo] || '🍷';
  const tipoL = escHtml(v.tipo || '');
  const nomeL = highlightMatch(v.nome || '', query);
  const titleL = `${escHtml(v.nome || '')} — ${tipoL} ${escHtml(v.regiao || '')}`;
  return `<div class="wine-tile t-${tc}${oos ? ' oos' : ''}" onclick="${oos ? 'void(0)' : `addToCart(${v.id})`}" title="${titleL}">
    <div class="tile-type">${tipoL}</div>
    <div class="tile-icon" aria-hidden="true">${emoji}</div>
    <div class="tile-name">${nomeL}</div>
    <div class="tile-bottom">
      <span class="tile-price">${fmt.eur(v.preco)}</span>
      <span class="tile-stock ${stockClass}">${oos ? 'Esgotado' : qty + ' un.'}</span>
    </div>
  </div>`;
}

const POS_TYPE_ORDER = ['Tinto', 'Branco', 'Rosé', 'Espumante', 'Porto', 'Madeira'];

function renderCatalog(filter = 'todos') {
  const grid = document.getElementById('catalog-grid') || document.getElementById('wine-grid');
  if (!grid) return;
  const searchEl = document.getElementById('pos-search') || document.getElementById('wine-search');
  const q = (searchEl?.value || '').toLowerCase();
  const isAll = !filter || filter === 'todos' || filter === '';

  const list = catalog.filter(v =>
    (`${v.nome || ''} ${v.regiao || ''} ${v.produtor || ''}`.toLowerCase()).includes(q) &&
    (isAll || v.tipo === filter)
  );

  const countEl = document.getElementById('pos-product-count');
  if (countEl) countEl.textContent = `${list.length} produto${list.length !== 1 ? 's' : ''}`;

  if (!list.length) {
    grid.innerHTML = `<div class="pos-empty">Nenhum vinho encontrado${q ? ' para “' + escHtml(q) + '”' : ''}.</div>`;
    return;
  }

  // Modo "Todos" sem pesquisa: agrupar por tipo com cabeçalho de secção
  if (isAll && !q) {
    const groups = {};
    for (const v of list) {
      const t = v.tipo || 'Outros';
      (groups[t] = groups[t] || []).push(v);
    }
    const types = Object.keys(groups).sort((a, b) => {
      const ai = POS_TYPE_ORDER.indexOf(a); const bi = POS_TYPE_ORDER.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
    grid.innerHTML = types.map(t => {
      const items = groups[t];
      const totalUn = items.reduce((s, x) => s + (x.quantidade || 0), 0);
      return `<section class="pos-section" data-type="${escHtml(t)}">
        <header class="pos-section-head">
          <span class="pos-section-name">${escHtml(t)}</span>
          <span class="pos-section-count">${items.length} ${items.length === 1 ? 'referência' : 'referências'} · ${totalUn} un.</span>
        </header>
        <div class="pos-section-grid">${items.map(v => _renderTile(v, q)).join('')}</div>
      </section>`;
    }).join('');
  } else {
    grid.innerHTML = list.map(v => _renderTile(v, q)).join('');
  }
}

/* Refresh catalog from API (called after sale/return) */
async function refreshCatalog() {
  try { catalog = await apiFetch('/vinhos'); } catch { /* keep current */ }
  renderCatalog(_posActiveFilterKey());
  loadPOSStats();
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
  flyToCart(id);
}

/**
 * Animação "fly to cart" — pequena bolinha dourada que voa do tile para o carrinho.
 * Pura visual, não bloqueia nada. Respeita prefers-reduced-motion.
 */
function flyToCart(wineId) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  // Encontra o tile clicado (pelo onclick attr)
  const tile = document.querySelector(`.wine-tile[onclick*="addToCart(${wineId})"]`);
  // Destino: o painel do carrinho (procura várias possíveis IDs)
  const cartTarget = document.querySelector('.pos-cart-summary, #cart-panel, #cart-total, .cart-total, .pos-cart');
  if (!tile || !cartTarget) return;

  const fromRect = tile.getBoundingClientRect();
  const toRect   = cartTarget.getBoundingClientRect();
  const fromX = fromRect.left + fromRect.width / 2;
  const fromY = fromRect.top + fromRect.height / 2;
  const toX   = toRect.left + toRect.width / 2;
  const toY   = toRect.top + 20;

  const dot = document.createElement('div');
  dot.style.cssText = `
    position: fixed; left: ${fromX}px; top: ${fromY}px;
    width: 18px; height: 18px; border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #F0D88A, #C9A96E 60%, #8B7048);
    box-shadow: 0 4px 14px rgba(201,169,110,0.55), 0 0 0 1px rgba(255,255,255,0.18) inset;
    pointer-events: none; z-index: 9000; transform: translate(-50%,-50%);
    transition: transform .55s cubic-bezier(.4,.0,.2,1), opacity .55s ease-out;
  `;
  document.body.appendChild(dot);

  // Pulse leve no tile
  tile.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(0.96)' }, { transform: 'scale(1)' }],
    { duration: 250, easing: 'ease-out' }
  );

  // Força o reflow para a transição arrancar do ponto correto
  // eslint-disable-next-line no-unused-expressions
  dot.getBoundingClientRect();
  requestAnimationFrame(() => {
    dot.style.transform = `translate(${toX - fromX - 9}px, ${toY - fromY - 9}px) scale(0.4)`;
    dot.style.opacity = '0';
  });
  setTimeout(() => dot.remove(), 700);
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
  if ((v.quantidade || 0) <= 0) { toast('Produto esgotado', 'error'); return; }
  const cartKey = `${id}_${vol}`;
  const ex = cart.find(c => c.cartKey === cartKey);
  const preco = +(v.preco * mult).toFixed(2);
  // Calcular total no carrinho para este vinho (todas as variantes)
  const totalInCart = cart.filter(c => c.id === id).reduce((s, c) => s + c.qty, 0);
  if (totalInCart >= (v.quantidade || 0)) { toast('Stock insuficiente', 'warning'); return; }
  if (ex) {
    ex.qty++;
  } else {
    cart.push({ cartKey, id, nome: v.nome, vol, nomeTamanho, preco, qty: 1 });
  }
  toast(`${v.nome} (${vol}) adicionado`, 'success', 2000);
  SoundFX.cartAdd();
  renderCart();
}

function removeFromCart(i) { cart.splice(i, 1); renderCart(); }
function updateQty(i, d) { cart[i].qty += d; if (cart[i].qty <= 0) cart.splice(i, 1); renderCart(); }
function clearCart() { cart = []; renderCart(); }

/* ──────────────────────────────────────────────────────────────
   Sound feedback — Web Audio API (sem ficheiros externos)
   ──────────────────────────────────────────────────────────────
   Gera tons curtos sintetizados para feedback sonoro premium.
   Respeita preferencia do utilizador via localStorage ('sound:off').
   ────────────────────────────────────────────────────────────── */
const SoundFX = (() => {
  let ctx = null;
  function getCtx() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch { return null; }
    }
    return ctx;
  }
  function enabled() {
    return localStorage.getItem('the100s:sound') !== 'off';
  }
  function tone(freq, durationMs, type = 'sine', volume = 0.15, delay = 0) {
    const c = getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime + delay);
    gain.gain.setValueAtTime(0, c.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, c.currentTime + delay + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + durationMs / 1000);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + durationMs / 1000 + 0.05);
  }
  return {
    /** Cash register "ding" — 3 tons ascendentes (acorde maior) */
    saleSuccess() {
      if (!enabled()) return;
      tone(880, 90, 'sine', 0.18, 0);       // A5
      tone(1108, 90, 'sine', 0.16, 0.06);   // C#6
      tone(1318, 220, 'sine', 0.20, 0.12);  // E6 (mantém um pouco mais)
    },
    /** "Click" subtil ao adicionar ao carrinho */
    cartAdd() {
      if (!enabled()) return;
      tone(1200, 50, 'triangle', 0.06, 0);
    },
    /** Erro — tom mais grave e curto */
    error() {
      if (!enabled()) return;
      tone(180, 180, 'sawtooth', 0.10, 0);
    },
    toggle() {
      const next = enabled() ? 'off' : 'on';
      localStorage.setItem('the100s:sound', next);
      if (next === 'on') this.cartAdd();
      return next === 'on';
    },
    isEnabled: enabled,
  };
})();
window.SoundFX = SoundFX;

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
        <div class="ci-name">${escHtml(item.nome)}</div>
        <div class="ci-meta">${escHtml(item.vol || '0.75L')} · ${escHtml(fmt.eur(item.preco))}/un.</div>
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
        <span class="co-item-name">${escHtml(item.nome)}</span>
        <span class="co-item-qty">${escHtml(item.vol ? item.vol + ' · ' : '')}×${item.qty}</span>
        <span class="co-item-price">${escHtml(fmt.eur(item.preco * item.qty))}</span>
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

/* Validações simples de pagamento */
function _validatePayment(method) {
  if (method === 'Cartão') {
    const num = (document.getElementById('co-card-number')?.value || '').replace(/\s/g, '');
    const exp = (document.getElementById('co-card-expiry')?.value || '').trim();
    const cvv = (document.getElementById('co-card-cvv')?.value || '').trim();
    if (num.length < 12) return 'Número de cartão inválido';
    if (!/^\d{2}\/\d{2}$/.test(exp)) return 'Validade inválida (formato MM/AA)';
    if (cvv.length < 3) return 'CVV inválido';
  } else if (method === 'MB Way') {
    const phone = (document.getElementById('co-mbway-phone')?.value || '').replace(/[^\d+]/g, '');
    if (phone.length < 9) return 'Indica o telemóvel para o pedido MB Way';
  } else if (method === 'Numerário') {
    const total = +(document.getElementById('co-total')?.textContent || '0').replace(/[^\d,]/g, '').replace(',', '.');
    const recv = +(document.getElementById('co-cash-received')?.value || 0);
    if (recv < total) return 'Valor recebido inferior ao total';
  }
  return null;
}

async function processPayment() {
  if (!cart.length) return;
  const btn = document.getElementById('process-btn');

  // Validação por método
  const validErr = _validatePayment(payMethod);
  if (validErr) { toast(validErr, 'error', 4000); return; }

  if (btn) { btn.disabled = true; btn.innerHTML = '<span>A processar...</span>'; }

  const sub = cart.reduce((s, x) => s + x.preco * x.qty, 0);
  const discPct = Math.min(100, Math.max(0, +(document.getElementById('co-discount')?.value || 0)));
  const discAmt = sub * (discPct / 100);
  const afterDisc = sub - discAmt;
  const iva = afterDisc * 0.23;
  const tot = afterDisc + iva;
  const nif = document.getElementById('co-nif')?.value || '';
  const notas = document.getElementById('co-notes')?.value || '';
  const clienteNome = (document.getElementById('co-client-name')?.value || '').trim();
  const clienteEmail = (document.getElementById('co-client-email')?.value || '').trim();
  const clienteTelefone = (document.getElementById('co-client-phone')?.value || '').trim();

  const itens = cart.map(c => ({ vinhoId: c.id, quantidade: c.qty, formato: c.vol || '0.75L', precUnit: c.preco }));

  const code = 'VD-' + Date.now().toString(36).toUpperCase().slice(-6);
  const now = new Date();

  let saleResult = null;
  try {
    const user = Session.get();
    saleResult = await apiFetch('/vendas', {
      method: 'POST',
      body: JSON.stringify({
        itens,
        metodoPagamento: payMethod,
        funcionarioId: user?.id || 1,
        desconto: discPct,
        notas,
        clienteNome:     clienteNome || null,
        clienteNif:      nif || null,
        clienteEmail:    clienteEmail || null,
        clienteTelefone: clienteTelefone || null,
      })
    });
  } catch(err) {
    if (err.message && !err.message.startsWith('HTTP') && !err.message.includes('fetch')) {
      toast(err.message, 'error', 5000);
      if (btn) { btn.disabled = false; btn.innerHTML = '<span>Confirmar Pagamento</span>'; }
      return;
    }
    itens.forEach(item => { const v = catalog.find(x => x.id === item.vinhoId); if (v) v.quantidade = Math.max(0, (v.quantidade || 0) - item.quantidade); });
  }

  const saleCode = saleResult?.codigo || code;
  // Guarda o ID real da venda — usado pelo botão "Imprimir Fatura" para abrir o talão AT.
  window.__lastSaleId = saleResult?.id || null;

  // Build receipt
  const receiptEl = document.getElementById('receipt-content');
  if (receiptEl) {
    const lines = cart.map(item => `<div class="receipt-line"><span>${escHtml(item.nome)}${item.vol ? ' (' + escHtml(item.vol) + ')' : ''} ×${item.qty}</span><span>${escHtml(fmt.eur(item.preco * item.qty))}</span></div>`).join('');
    receiptEl.innerHTML = `
      <div class="receipt-header">
        <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:#C9A96E;">the 100's</div>
        <div style="font-size:11px;color:#777;margin-top:2px;">${now.toLocaleString('pt-PT')}</div>
        <div style="font-size:11px;color:#777;">Ref: ${escHtml(String(saleCode))}${nif ? ' · NIF: ' + escHtml(nif) : ''}</div>
      </div>
      ${lines}
      <div class="receipt-divider"></div>
      ${discPct > 0 ? `<div class="receipt-line"><span style="color:#34d399;">Desconto (${discPct}%)</span><span style="color:#34d399;">−${fmt.eur(discAmt)}</span></div>` : ''}
      <div class="receipt-line"><span>IVA 23%</span><span>${fmt.eur(iva)}</span></div>
      <div class="receipt-divider"></div>
      <div class="receipt-total-line"><span>TOTAL</span><span>${fmt.eur(tot)}</span></div>
      <div style="text-align:center;margin-top:8px;font-size:11px;color:#555;">Pagamento: ${escHtml(payMethod)}</div>`;
  }
  const sub2 = document.getElementById('receipt-subtitle');
  if (sub2) sub2.textContent = `${cart.length} artigo(s) · IVA incluído · ${payMethod}`;

  // Lista dos IDs vendidos — para detetar stock crítico após refresh do catálogo
  const soldIds = itens.map(it => it.vinhoId);

  closeCheckoutModal();
  clearCart();
  // Refresh catalog from API to get real stock values
  await refreshCatalog();

  /* ─── Alerta de stock crítico (UX nível POS profissional) ───
     Verifica os vinhos vendidos: se algum ficou ≤5 unidades,
     mostra toast amarelo a avisar o operador.                  */
  const criticos = catalog.filter(v => soldIds.includes(v.id) && v.quantidade > 0 && v.quantidade <= 5);
  const esgotados = catalog.filter(v => soldIds.includes(v.id) && (v.quantidade || 0) === 0);
  if (esgotados.length > 0) {
    const nomes = esgotados.slice(0, 2).map(v => v.nome).join(', ') + (esgotados.length > 2 ? ` +${esgotados.length - 2}` : '');
    setTimeout(() => toast(`⛔ Esgotado: ${nomes}`, 'error', 5000), 600);
  } else if (criticos.length > 0) {
    const nomes = criticos.slice(0, 2).map(v => `${v.nome} (${v.quantidade}un)`).join(', ') + (criticos.length > 2 ? ` +${criticos.length - 2}` : '');
    setTimeout(() => toast(`⚠ Stock crítico: ${nomes}`, 'warning', 5000), 600);
  }

  document.getElementById('receipt-modal')?.classList.remove('hidden');
  SoundFX.saleSuccess();   // Cash register ding — feedback sonoro premium
  if (btn) { btn.disabled = false; btn.textContent = 'Confirmar Pagamento'; }
}

/**
 * Mostra um diálogo flutuante com os atalhos de teclado do POS.
 * Disparado quando o utilizador carrega '?' (sem estar a escrever em input).
 * Auto-fecha em 8s ou ao clicar fora.
 */
function showShortcutsHelp() {
  // Se já está aberto, fecha e sai (toggle)
  const existing = document.getElementById('shortcuts-help');
  if (existing) { existing.remove(); return; }

  const overlay = document.createElement('div');
  overlay.id = 'shortcuts-help';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'Atalhos de teclado');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(5,2,3,0.75);backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease;';
  overlay.innerHTML = `
    <style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}</style>
    <div style="background:#1A1410;border:1px solid #C9A96E33;border-radius:14px;padding:28px 32px;max-width:420px;width:92%;color:#F5F0E8;box-shadow:0 20px 60px rgba(0,0,0,0.55);font-family:'Inter',sans-serif;" onclick="event.stopPropagation()">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
        <h3 style="font-family:'Playfair Display',serif;font-size:20px;font-weight:600;color:#C9A96E;margin:0;">Atalhos de Teclado</h3>
        <button onclick="document.getElementById('shortcuts-help')?.remove()" style="background:transparent;border:none;color:#8B7C68;font-size:22px;cursor:pointer;padding:0 8px;" aria-label="Fechar">×</button>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tbody>
          <tr><td style="padding:8px 0;color:#C9B895;">Procurar produto</td><td style="text-align:right;"><kbd style="background:#0A0807;border:1px solid #2B2620;color:#E0C992;padding:3px 8px;border-radius:4px;font-family:'Courier New',monospace;font-size:11px;">/</kbd></td></tr>
          <tr><td style="padding:8px 0;color:#C9B895;">Abrir checkout</td><td style="text-align:right;"><kbd style="background:#0A0807;border:1px solid #2B2620;color:#E0C992;padding:3px 8px;border-radius:4px;font-family:'Courier New',monospace;font-size:11px;">F9</kbd></td></tr>
          <tr><td style="padding:8px 0;color:#C9B895;">Confirmar pagamento</td><td style="text-align:right;"><kbd style="background:#0A0807;border:1px solid #2B2620;color:#E0C992;padding:3px 8px;border-radius:4px;font-family:'Courier New',monospace;font-size:11px;">Enter</kbd></td></tr>
          <tr><td style="padding:8px 0;color:#C9B895;">Fechar modal</td><td style="text-align:right;"><kbd style="background:#0A0807;border:1px solid #2B2620;color:#E0C992;padding:3px 8px;border-radius:4px;font-family:'Courier New',monospace;font-size:11px;">Esc</kbd></td></tr>
          <tr><td style="padding:8px 0;color:#C9B895;">Limpar carrinho</td><td style="text-align:right;"><kbd style="background:#0A0807;border:1px solid #2B2620;color:#E0C992;padding:3px 8px;border-radius:4px;font-family:'Courier New',monospace;font-size:11px;">⌘L</kbd></td></tr>
          <tr><td style="padding:8px 0;color:#C9B895;">Esta ajuda</td><td style="text-align:right;"><kbd style="background:#0A0807;border:1px solid #2B2620;color:#E0C992;padding:3px 8px;border-radius:4px;font-family:'Courier New',monospace;font-size:11px;">?</kbd></td></tr>
        </tbody>
      </table>
      <p style="margin:18px 0 0;font-size:11px;color:#8B7C68;font-style:italic;text-align:center;">Pressiona qualquer tecla para fechar</p>
    </div>
  `;
  overlay.addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);

  // Fechar com qualquer tecla
  const closeOnKey = (e) => {
    if (e.key !== '?' || true) {
      overlay.remove();
      document.removeEventListener('keydown', closeOnKey);
    }
  };
  setTimeout(() => document.addEventListener('keydown', closeOnKey, { once: true }), 100);
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
  document.querySelectorAll('.filter-btn, .pos-cat-btn, .pos-tab').forEach(b => {
    b.classList.remove('active');
    if (b.hasAttribute('aria-selected')) b.setAttribute('aria-selected', 'false');
  });
  const filterValue = type === '' ? '' : type;
  const target = document.querySelector(`.filter-btn[data-filter="${filterValue}"], .pos-cat-btn[data-filter="${filterValue}"], .pos-tab[data-filter="${filterValue}"]`);
  if (target) {
    target.classList.add('active');
    if (target.hasAttribute('aria-selected')) target.setAttribute('aria-selected', 'true');
  }
  renderCatalog(filterValue === '' ? 'todos' : filterValue);
}

function searchWines() {
  renderCatalog(_posActiveFilterKey());
}

/* ══════════════════════════════════════════════
   Stock search and filter (from HTML onkeyup/onchange)
   ══════════════════════════════════════════════ */
function searchStock(query) {
  renderStock();
}

function filterStockByType(type) {
  renderStock();
}

function selectPaymentMethod(method) {
  document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('active'));
  const target = document.querySelector(`.pay-method[data-method="${method}"]`);
  if (target) target.classList.add('active');
  payMethod = method;
  // Show/hide payment panels
  const cashP  = document.getElementById('co-cash-panel');
  const mbwayP = document.getElementById('co-mbway-panel');
  const cardP  = document.getElementById('co-card-panel');
  const mbP    = document.getElementById('co-mb-panel');
  if (cashP)  cashP.style.display  = method === 'Numerário' ? 'block' : 'none';
  if (mbwayP) mbwayP.style.display = method === 'MB Way'    ? 'block' : 'none';
  if (cardP)  cardP.style.display  = method === 'Cartão'    ? 'block' : 'none';
  if (mbP)    mbP.style.display    = method === 'Multibanco' ? 'block' : 'none';

  // Multibanco: gera referência simulada (entidade-referência-valor)
  if (method === 'Multibanco') {
    const totalText = document.getElementById('co-total')?.textContent || '€0,00';
    const total = totalText.replace(/[^\d,]/g, '').replace(',', '.');
    const ent = String(Math.floor(10000 + Math.random() * 89999)).slice(0, 5);
    const ref = (() => {
      const blocks = [];
      for (let i = 0; i < 3; i++) blocks.push(String(Math.floor(100 + Math.random() * 900)));
      return blocks.join(' ');
    })();
    const mbRef = document.getElementById('co-mb-ref');
    if (mbRef) mbRef.textContent = `${ent} · ${ref} · ${(+total || 0).toFixed(2).replace('.', ',')} €`;
  }
}

// Alias para o handler do HTML
function selectPayMethod(method) { selectPaymentMethod(method); }

/**
 * Abre o talão fiscal AT-compliant numa janela nova.
 * Chamado pelo botão "Imprimir" do modal de checkout.
 * Se a venda foi gravada no servidor → abre o talão oficial (com ATCUD, QR AT, hash, etc.).
 * Se não conseguiu gravar (modo offline) → fallback para impressão do modal só.
 */
function printReceipt() {
  const saleId = window.__lastSaleId;
  if (saleId && typeof printVendaReceipt === 'function') {
    printVendaReceipt(saleId);
    return;
  }
  // Fallback: imprime só o conteúdo do recibo, isolado numa janela limpa
  const receipt = document.getElementById('receipt-content');
  if (!receipt) { toast('Talão indisponível', 'error'); return; }
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Recibo</title>
    <style>
      body{font-family:'Courier New',monospace;padding:24px;max-width:380px;margin:0 auto;color:#000;}
      .receipt-line{display:flex;justify-content:space-between;padding:4px 0;font-size:12px;}
      .receipt-divider{border-top:1px dashed #999;margin:8px 0;}
      .receipt-total-line{display:flex;justify-content:space-between;font-weight:bold;font-size:14px;padding:8px 0;border-top:2px solid #000;}
      .receipt-header{text-align:center;margin-bottom:12px;}
      @media print{body{padding:0;}}
    </style></head><body>${receipt.innerHTML}</body></html>`;
  openPrintWindow(html, 'Recibo');
}

function openPrintWindow(html, title = 'Imprimir') {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank', 'width=820,height=1000');
  if (!win) { toast('Popups bloqueados — autoriza-os no browser', 'error'); URL.revokeObjectURL(url); return null; }
  win.addEventListener('load', () => {
    try { win.focus(); win.print(); } catch (_) {}
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }, { once: true });
  return win;
}

/* ══════════════════════════════════════════════
   Enhanced print functions for Gerente
   ══════════════════════════════════════════════ */

/* Empresa: dados oficiais The 100's (do brand.md / brand vault) */
const COMPANY = {
  name: 'the 100’s',
  legal: 'The 100’s, Lda.',
  tagline: 'Bottled Memories',
  nif: '517 234 891',
  nifPlain: '517234891',                // sem espaços para QR AT
  capitalSocial: '5.000,00 €',
  conservatoria: 'C.R.C. Ponta Delgada',
  matricula: '517234891',
  address: 'Rua Cidade Newport, n.º 13',
  postal: '9500-176 Ponta Delgada',
  country: 'Portugal',
  phone: '+351 936 442 822',
  email: 'geral@the-100s.com',
  web: 'www.the-100s.com',
  espacoFiscal: 'PT',                   // PT (continental) | PT-AC (Açores) | PT-MA (Madeira)
  certificadoAT: '9999',                // nº fictício — software não certificado pela AT (ambiente demo)
  csvSerie: 'JFTH9CK2',                 // CSV simulado emitido pela AT para a série (real: 8 chars alfanum)
};

/* ──────────────────────────────────────────────────────────────
   Helpers fiscais portugueses (AT — Portaria 195/2020, Lei 28/2019)
   ────────────────────────────────────────────────────────────── */

/** Gera ATCUD (Código Único de Documento). Real: CSV é emitido pela AT por série. */
function generateATCUD(docNum) {
  const seq = String(docNum).match(/(\d+)\s*$/);
  const num = seq ? String(parseInt(seq[1], 10)) : '1';
  return `${COMPANY.csvSerie}-${num}`;
}

/** Hash de 4 caracteres (simulação determinística do hash SAF-T). */
function generateDocHash(docNum, total, dataIso) {
  const str = `${dataIso};${(+total).toFixed(2)};${docNum};${COMPANY.nifPlain}`;
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem 0,O,1,I,L para legibilidade
  return chars[h % 32]
       + chars[(h >>> 5) % 32]
       + chars[(h >>> 10) % 32]
       + chars[(h >>> 15) % 32];
}

/** Sanitiza NIF (mantém só dígitos). */
function sanitizeNIF(nif) {
  return String(nif || '').replace(/\D/g, '');
}

/** Constrói o payload QR no formato AT (Portaria 195/2020). */
function buildATQRPayload(opts) {
  const {
    nifCli, paisCli, tipoDoc, dataIso, docNum, atcud,
    baseIVA, valorIVA, total, hash,
  } = opts;
  // Datas no formato AAAAMMDD; valores com 2 casas decimais (ponto como separador)
  const dataAT = dataIso.replace(/-/g, '');
  const docCompact = String(docNum).replace(/\s+/g, '');
  const nifAdq = sanitizeNIF(nifCli) || '999999990'; // 999999990 = Consumidor Final (norma AT)

  return [
    `A:${COMPANY.nifPlain}`,           // NIF do emitente
    `B:${nifAdq}`,                     // NIF do adquirente
    `C:${paisCli || 'PT'}`,            // País do adquirente (ISO 3166-1 alpha-2)
    `D:${tipoDoc}`,                    // Tipo de documento: FS / FT / FR / NC / ND
    `E:N`,                             // Estado: N (Normal) | A (Anulado) | F (Faturado)
    `F:${dataAT}`,                     // Data emissão AAAAMMDD
    `G:${docCompact}`,                 // Número do documento
    `H:${atcud}`,                      // ATCUD
    `I1:${COMPANY.espacoFiscal}`,      // Espaço fiscal: PT / PT-AC / PT-MA
    `I7:${(+baseIVA).toFixed(2)}`,     // Base tributável IVA taxa normal (23%)
    `I8:${(+valorIVA).toFixed(2)}`,    // Valor IVA taxa normal
    `N:${(+valorIVA).toFixed(2)}`,     // Total de impostos
    `O:${(+total).toFixed(2)}`,        // Total documento c/ impostos
    `Q:${hash}`,                       // 4 caracteres do hash da assinatura
    `R:${COMPANY.certificadoAT}`,      // Nº de certificado do software
  ].join('*');
}

/** Converte total (€) para extenso em português — útil para faturas. */
function valorPorExtenso(valor) {
  const v = Math.round((+valor) * 100) / 100;
  const inteiro = Math.floor(v);
  const cent = Math.round((v - inteiro) * 100);
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const dez10_19 = ['dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezasseis', 'dezassete', 'dezoito', 'dezanove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  function ate999(n) {
    if (n === 0) return '';
    if (n === 100) return 'cem';
    let r = '';
    const c = Math.floor(n / 100), d = Math.floor((n % 100) / 10), u = n % 10;
    if (c) r += centenas[c];
    if (d || u) r += (r ? ' e ' : '');
    if (d === 1) r += dez10_19[u];
    else {
      if (d) r += dezenas[d];
      if (d && u) r += ' e ';
      if (u) r += unidades[u];
    }
    return r;
  }
  function ate999999(n) {
    if (n === 0) return 'zero';
    const milhares = Math.floor(n / 1000), resto = n % 1000;
    let r = '';
    if (milhares) r += (milhares === 1 ? 'mil' : ate999(milhares) + ' mil');
    if (resto) r += (r ? (resto < 100 || resto % 100 === 0 ? ' e ' : ', ') : '') + ate999(resto);
    return r || 'zero';
  }
  const txtInt = ate999999(inteiro);
  const moedaInt = inteiro === 1 ? 'euro' : 'euros';
  if (cent === 0) return `${txtInt} ${moedaInt}`;
  const txtCent = ate999(cent);
  const moedaCent = cent === 1 ? 'cêntimo' : 'cêntimos';
  return `${txtInt} ${moedaInt} e ${txtCent} ${moedaCent}`;
}

async function printVendaReceipt(vendaId) {
  try {
    const venda = await apiFetch(`/vendas/${vendaId}`).catch(() => null);
    const itens = await apiFetch(`/vendas/${vendaId}/itens`).catch(() => []);

    if (!venda) { toast('Venda não encontrada', 'error'); return; }

    /* ─── Cálculos fiscais (IVA 23% — taxa normal aplicável a vinho) ─── */
    const TAXA_IVA = 0.23;
    const totalComIVA = itens.reduce((sum, item) => sum + (item.precoUnitario * item.quantidade), 0);
    const baseIVA = totalComIVA / (1 + TAXA_IVA);
    const iva = totalComIVA - baseIVA;
    const total = totalComIVA;

    const dataVenda = venda.dataVenda ? new Date(venda.dataVenda) : new Date();
    const dataFmt = dataVenda.toLocaleDateString('pt-PT');
    const horaFmt = dataVenda.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    // ISO YYYY-MM-DD (independente do timezone)
    const dataIso = `${dataVenda.getFullYear()}-${String(dataVenda.getMonth()+1).padStart(2,'0')}-${String(dataVenda.getDate()).padStart(2,'0')}`;

    /* ─── Tipo de documento (regras AT):
       FS (Fatura Simplificada) — total ≤ 100€ e sem NIF cliente
       FT (Fatura)              — restantes casos                 */
    const temNIF = !!sanitizeNIF(venda.clienteNif);
    const tipoDoc = (total <= 100 && !temNIF) ? 'FS' : 'FT';
    const tipoDocLabel = tipoDoc === 'FS' ? 'Fatura Simplificada' : 'Fatura';

    const ano = dataVenda.getFullYear();
    const seqNum = String(vendaId).padStart(5, '0');
    const docNum = venda.codigo || `${tipoDoc} ${ano}/${seqNum}`;

    /* ─── ATCUD + Hash 4 chars (Portaria 195/2020 + Lei 28/2019) ─── */
    const atcud = generateATCUD(docNum);
    const hash4 = generateDocHash(docNum, total, dataIso);
    const valorExtenso = valorPorExtenso(total);

    /* ─── QR Code formato AT (Portaria 195/2020) — passa em validadores fiscais oficiais.
       Parâmetros A→R conforme especificação da Autoridade Tributária. */
    const qrPayloadAT = buildATQRPayload({
      nifCli: venda.clienteNif,
      paisCli: 'PT',
      tipoDoc,
      dataIso,
      docNum,
      atcud,
      baseIVA,
      valorIVA: iva,
      total,
      hash: hash4,
    });
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=2&ecc=M&data=${encodeURIComponent(qrPayloadAT)}`;

    
    /* Resumo plano para envio digital (mailto / sms) */
    const itensTxt = itens.map(it => `${it.quantidade} × ${it.nome || ('Vinho #' + it.vinhoId)} — ${fmt.eur((it.precoUnitario || 0) * (it.quantidade || 0))}`).join('\n');
    const msgPlain = [
      `the 100's — ${tipoDocLabel} ${docNum}`,
      `ATCUD: ${atcud}`,
      `Data: ${dataFmt} ${horaFmt}`,
      '',
      itensTxt,
      '',
      `Base tributável: ${fmt.eur(baseIVA)}`,
      `IVA (23%): ${fmt.eur(iva)}`,
      `Total: ${fmt.eur(total)}`,
      `Pagamento: ${venda.metodoPagamento || 'Numerário'}`,
      '',
      `Documento processado por programa certificado n.º ${COMPANY.certificadoAT}/AT`,
      `Obrigado pela sua preferência — ${COMPANY.web}`
    ].join('\n');
    const subjectEmail = `${tipoDocLabel} ${docNum} — the 100's`;

    const html = `<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <title>Fatura ${docNum} — the 100's</title>
  <link rel="icon" type="image/png" href="${window.location.origin}/assets/logo-the100s.png">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; font-size: 11px; color: #15110D; background: #F8F5EE; }
    .invoice { max-width: 780px; margin: 24px auto; padding: 44px 48px; background: #fff; box-shadow: 0 8px 40px rgba(20, 14, 8, 0.08); border: 1px solid #ECE3D2; }

    /* Header */
    .inv-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 22px; border-bottom: 1px solid #ECE3D2; margin-bottom: 28px; }
    .inv-header::after { content: ''; display: block; }
    .inv-brand-logo { width: 110px; height: auto; display: block; margin-bottom: 10px; filter: drop-shadow(0 2px 6px rgba(201, 169, 110, 0.18)); }
    .inv-brand .tagline { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 14px; color: #8B7048; margin-bottom: 14px; }
    .inv-brand .company-info { font-size: 10px; color: #6B6358; line-height: 1.65; }
    .inv-doc { text-align: right; min-width: 220px; }
    .inv-doc .doc-eyebrow { font-size: 9px; font-weight: 600; color: #B89060; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 4px; }
    .inv-doc .doc-type { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 600; color: #15110D; letter-spacing: 0.5px; }
    .inv-doc .doc-number { font-size: 13px; font-weight: 600; color: #8B7048; margin-top: 2px; font-variant-numeric: tabular-nums; }
    .inv-doc .doc-meta { margin-top: 10px; font-size: 10px; color: #6B6358; line-height: 1.8; }
    .inv-doc .doc-meta strong { color: #15110D; font-weight: 600; }

    /* Client & Payment info */
    .inv-parties { display: flex; gap: 32px; margin-bottom: 28px; }
    .inv-party { flex: 1; }
    .inv-party-label { font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #B89060; margin-bottom: 10px; border-bottom: 1px solid #ECE3D2; padding-bottom: 6px; }
    .inv-party p { font-size: 11px; line-height: 1.7; color: #4A453E; }
    .inv-party .name { font-weight: 600; font-size: 12.5px; color: #15110D; }

    /* Items table */
    .inv-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .inv-table thead th { background: #15110D; color: #E0C992; padding: 11px 12px; font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; text-align: left; }
    .inv-table thead th:nth-child(n+3) { text-align: right; }
    .inv-table tbody td { padding: 11px 12px; border-bottom: 1px solid #ECE3D2; font-size: 11px; color: #2B2620; }
    .inv-table tbody td:nth-child(n+3) { text-align: right; font-variant-numeric: tabular-nums; }
    .inv-table tbody tr:nth-child(even) { background: #FAF6EC; }
    .inv-table tbody .item-name { font-weight: 600; color: #15110D; }
    .inv-table tbody .item-desc { font-size: 9.5px; color: #8B7C68; margin-top: 2px; letter-spacing: 0.02em; }

    /* Totals + QR */
    .inv-summary { display: flex; gap: 28px; align-items: flex-start; margin-bottom: 28px; }
    .inv-qr-block { width: 200px; padding: 14px; background: #FAF6EC; border: 1px solid #ECE3D2; border-radius: 6px; text-align: center; }
    .inv-qr-block img { width: 160px; height: 160px; display: block; margin: 0 auto 8px; }
    .inv-qr-block .qr-label { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #B89060; margin-bottom: 4px; }
    .inv-qr-block .qr-help { font-size: 9.5px; color: #8B7C68; line-height: 1.45; }

    .inv-totals-wrap { flex: 1; display: flex; justify-content: flex-end; }
    .inv-totals-box { width: 100%; max-width: 320px; }
    .inv-totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 11.5px; color: #4A453E; }
    .inv-totals-row.subtotal { border-top: 1px solid #ECE3D2; padding-top: 10px; }
    .inv-totals-row.total { border-top: 2px solid #15110D; padding-top: 14px; margin-top: 8px; font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; color: #15110D; letter-spacing: 0.5px; }
    .inv-totals-row.total .val { color: #8B7048; }

    /* Footer */
    .inv-footer { border-top: 1px solid #ECE3D2; padding-top: 22px; text-align: center; }
    .inv-footer .thanks { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 16px; color: #8B7048; margin-bottom: 6px; letter-spacing: 0.4px; }
    .inv-footer .legal { font-size: 9px; color: #8B7C68; line-height: 1.65; max-width: 540px; margin: 12px auto 0; }
    .inv-footer .gold-line { width: 48px; height: 1px; background: #B89060; margin: 14px auto; }

    /* Payment badge */
    .payment-badge { display: inline-block; background: #ECE3D2; color: #15110D; font-size: 10px; font-weight: 600; padding: 4px 12px; border-radius: 999px; letter-spacing: 0.5px; }
    .status-paid { background: #1F4A2A; color: #C9E5A8; }

    /* Send actions (no print) */
    .send-bar { background: #15110D; color: #F5F0E8; padding: 18px 22px; border-radius: 10px; margin: 24px 0 12px; display: flex; flex-wrap: wrap; align-items: center; gap: 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.18); }
    .send-bar h3 { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-weight: 600; flex: 1; min-width: 180px; }
    .send-bar .send-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .send-btn { background: #C9A96E; color: #15110D; border: none; padding: 11px 20px; border-radius: 8px; font-family: inherit; font-size: 12px; font-weight: 600; letter-spacing: 1.4px; text-transform: uppercase; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: filter .15s, transform .15s; }
    .send-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
    .send-btn.secondary { background: transparent; color: #E0C992; border: 1px solid #C9A96E; }
    .send-btn svg { width: 14px; height: 14px; }

    .toolbar { text-align: center; margin: 14px 0 24px; }
    .toolbar button { background: #15110D; color: #F5F0E8; border: 1px solid #15110D; padding: 11px 26px; border-radius: 8px; font-family: inherit; font-size: 11px; font-weight: 600; letter-spacing: 1.4px; text-transform: uppercase; cursor: pointer; }
    .toolbar button:hover { background: #2B2620; }

    @media print {
      body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .invoice { box-shadow: none; border: none; padding: 24px; max-width: 100%; margin: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="inv-header">
      <div class="inv-brand">
        <img src="${window.location.origin}/assets/logo-the100s.png" alt="the 100's" class="inv-brand-logo" style="filter: invert(1) sepia(1) saturate(2) hue-rotate(15deg) brightness(0.9);">
        <div class="tagline">${COMPANY.tagline}</div>
        <div class="company-info">
          ${COMPANY.legal} · NIPC: ${COMPANY.nif}<br>
          ${COMPANY.address}<br>
          ${COMPANY.postal} — ${COMPANY.country}<br>
          ${COMPANY.phone} · ${COMPANY.email}<br>
          Capital social: ${COMPANY.capitalSocial} · Matriculada na ${COMPANY.conservatoria}
        </div>
      </div>
      <div class="inv-doc">
        <div class="doc-eyebrow">Documento Fiscal</div>
        <div class="doc-type">${tipoDocLabel.toUpperCase()}</div>
        <div class="doc-number">${docNum}</div>
        <div class="doc-meta">
          <strong>ATCUD:</strong> ${atcud}<br>
          <strong>Data:</strong> ${dataFmt}<br>
          <strong>Hora:</strong> ${horaFmt}<br>
          <strong>Espaço fiscal:</strong> ${COMPANY.espacoFiscal}<br>
          <strong>Original</strong>
        </div>
      </div>
    </div>

    <div class="inv-parties">
      <div class="inv-party">
        <div class="inv-party-label">Adquirente</div>
        <p class="name">${escHtml(venda.clienteNome || 'Consumidor Final')}</p>
        <p>NIF: ${temNIF ? escHtml(venda.clienteNif) : '999999990'} <span style="color:#8B7C68;font-size:9.5px;">(${temNIF ? 'identificado' : 'consumidor final'})</span></p>
        ${venda.clienteMorada ? `<p>${escHtml(venda.clienteMorada)}</p>` : ''}
        <p style="font-size:9.5px;color:#8B7C68;margin-top:4px;">País: PT — Portugal</p>
      </div>
      <div class="inv-party">
        <div class="inv-party-label">Pagamento</div>
        <p><span class="payment-badge">${escHtml(venda.metodoPagamento || 'Numerário')}</span></p>
        <p style="margin-top:6px;"><span class="payment-badge status-paid">PAGO</span></p>
        <p style="margin-top:8px;font-size:10px;color:#8B7C68;">Operador: ${escHtml(venda.funcionarioNome || 'Sistema')}</p>
      </div>
    </div>

    <table class="inv-table">
      <thead>
        <tr>
          <th style="width:46%;">Descrição</th>
          <th style="width:10%;">Qtd.</th>
          <th style="width:16%;">Preço Unit.</th>
          <th style="width:10%;">IVA</th>
          <th style="width:18%;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itens.map(item => {
          const lineTotal = item.precoUnitario * item.quantidade;
          const desc = [item.tipo, item.regiao, item.anoColheita].filter(Boolean).map(escHtml).join(' · ');
          return `<tr>
            <td><div class="item-name">${escHtml(item.nome || 'Vinho #' + item.vinhoId)}</div>${desc ? `<div class="item-desc">${desc}</div>` : ''}</td>
            <td style="text-align:center;">${item.quantidade}</td>
            <td>${fmt.eur(item.precoUnitario)}</td>
            <td>23%</td>
            <td><strong>${fmt.eur(lineTotal)}</strong></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>

    <!-- Discriminação do IVA por taxa (obrigatório AT — art.º 36.º CIVA) -->
    <table class="inv-iva-table" style="width:100%;border-collapse:collapse;margin-bottom:18px;font-size:10px;">
      <thead>
        <tr>
          <th style="background:#FAF6EC;color:#8B7048;padding:8px 10px;text-align:left;font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;border:1px solid #ECE3D2;">Taxa</th>
          <th style="background:#FAF6EC;color:#8B7048;padding:8px 10px;text-align:right;font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;border:1px solid #ECE3D2;">Incidência</th>
          <th style="background:#FAF6EC;color:#8B7048;padding:8px 10px;text-align:right;font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;border:1px solid #ECE3D2;">Valor IVA</th>
          <th style="background:#FAF6EC;color:#8B7048;padding:8px 10px;text-align:right;font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;border:1px solid #ECE3D2;">Total c/ IVA</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:8px 10px;border:1px solid #ECE3D2;color:#15110D;font-weight:600;">Normal (23%)</td>
          <td style="padding:8px 10px;border:1px solid #ECE3D2;text-align:right;font-variant-numeric:tabular-nums;">${fmt.eur(baseIVA)}</td>
          <td style="padding:8px 10px;border:1px solid #ECE3D2;text-align:right;font-variant-numeric:tabular-nums;">${fmt.eur(iva)}</td>
          <td style="padding:8px 10px;border:1px solid #ECE3D2;text-align:right;font-variant-numeric:tabular-nums;font-weight:600;">${fmt.eur(total)}</td>
        </tr>
      </tbody>
    </table>

    <div class="inv-summary">
      <div class="inv-qr-block">
        <div class="qr-label">QR · AT</div>
        <img src="${qrUrl}" alt="QR code AT da ${tipoDocLabel.toLowerCase()} ${docNum}">
        <div class="qr-help">QR Code conforme Portaria 195/2020. Lê com app fiscal para validar.</div>
      </div>
      <div class="inv-totals-wrap">
        <div class="inv-totals-box">
          <div class="inv-totals-row subtotal">
            <span>Base Tributável</span>
            <span>${fmt.eur(baseIVA)}</span>
          </div>
          <div class="inv-totals-row">
            <span>IVA (23%)</span>
            <span>${fmt.eur(iva)}</span>
          </div>
          <div class="inv-totals-row total">
            <span>TOTAL A PAGAR</span>
            <span class="val">${fmt.eur(total)}</span>
          </div>
          <div style="margin-top:10px;padding:8px 10px;background:#FAF6EC;border-left:3px solid #C9A96E;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:10.5px;color:#4A453E;line-height:1.5;">
            <strong style="font-style:normal;color:#15110D;">Por extenso:</strong> ${valorExtenso}.
          </div>
        </div>
      </div>
    </div>

    <!-- Envio digital (mailto: / sms: — abrem app do utilizador, sem necessitar de servidor SMTP) -->
    <div class="send-bar no-print">
      <h3>Enviar talão digital ao cliente</h3>
      <div class="send-actions">
        <button class="send-btn" type="button" onclick="window.tsendEmail()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          E-mail
        </button>
        <button class="send-btn secondary" type="button" onclick="window.tsendSms()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
          SMS
        </button>
        <button class="send-btn secondary" type="button" onclick="window.tsendWhatsApp()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
          WhatsApp
        </button>
      </div>
    </div>

    <div class="inv-footer">
      <div class="thanks">${COMPANY.tagline}</div>
      <div class="gold-line"></div>

      <!-- Linha fiscal obrigatória (Portaria 195/2020 · Lei 28/2019) -->
      <div style="background:#15110D;color:#E0C992;padding:10px 14px;border-radius:4px;font-size:9.5px;font-family:'Courier New',monospace;letter-spacing:0.5px;margin-bottom:14px;text-align:center;">
        <strong>${hash4}</strong> · Processado por programa certificado n.º ${COMPANY.certificadoAT}/AT &nbsp;|&nbsp; ATCUD: <strong>${atcud}</strong>
      </div>

      <div class="legal">
        <strong>Menções legais obrigatórias:</strong><br>
        • Os bens/serviços foram colocados à disposição do adquirente na data deste documento.<br>
        • IVA incluído à taxa normal (23%) — Continente. Regime geral de IVA (art.º 18.º CIVA).<br>
        • Documento emitido nos termos do art.º 36.º do CIVA e do Decreto-Lei n.º 28/2019.<br>
        • Reclamações: Livro de Reclamações disponível ao abrigo do D.L. n.º 156/2005.<br>
        • Venda de bebidas alcoólicas: proibida a menores de 18 anos (Lei n.º 109/2015).<br>
        <br>
        ${COMPANY.legal} · NIPC ${COMPANY.nif} · ${COMPANY.address}, ${COMPANY.postal} · ${COMPANY.web}<br>
        <span style="color:#B89060;font-style:italic;">⚠ Documento gerado em ambiente de demonstração (software académico — não certificado pela AT).</span>
      </div>
    </div>

    <div class="toolbar no-print">
      <button onclick="window.print()" type="button">Imprimir Fatura</button>
    </div>
  </div>

  <script>
    const __MSG = ${JSON.stringify(msgPlain)};
    const __SUBJECT = ${JSON.stringify(subjectEmail)};

    window.tsendEmail = function() {
      const to = prompt('E-mail do cliente:');
      if (!to) return;
      const url = 'mailto:' + encodeURIComponent(to)
        + '?subject=' + encodeURIComponent(__SUBJECT)
        + '&body='    + encodeURIComponent(__MSG);
      window.location.href = url;
    };

    window.tsendSms = function() {
      const num = prompt('Telemóvel do cliente (ex.: +351 912 345 678):');
      if (!num) return;
      const cleaned = num.replace(/[^+\\d]/g, '');
      // sms: with body uses '?body=' on iOS / Android
      const url = 'sms:' + cleaned + '?body=' + encodeURIComponent(__MSG);
      window.location.href = url;
    };

    window.tsendWhatsApp = function() {
      const num = prompt('Telemóvel WhatsApp (com indicativo, ex.: 351912345678):');
      if (!num) return;
      const cleaned = num.replace(/[^\\d]/g, '');
      const url = 'https://wa.me/' + cleaned + '?text=' + encodeURIComponent(__MSG);
      window.open(url, '_blank');
    };
  </script>
</body>
</html>`;
    openPrintWindow(html, `Fatura ${docNum}`);
  } catch (err) {
    console.error('Erro ao imprimir fatura:', err);
    toast('Erro ao gerar fatura', 'error');
  }
}

async function printGuiaTransporte(vinhoId, quantidade, destino, guiaNumOverride) {
  try {
    // Tenta API primeiro, depois fallback para catálogo local
    let vinho = await apiFetch(`/vinhos/${vinhoId}`).catch(() => null);
    if (!vinho) vinho = (allVinhos || []).find(v => v.id === vinhoId) || (catalog || []).find(v => v.id === vinhoId);
    if (!vinho) { toast('Vinho não encontrado', 'error'); return; }

    const hoje = new Date();
    const dataFmt = hoje.toLocaleDateString('pt-PT');
    const horaFmt = hoje.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    const guiaNum = guiaNumOverride || `GT ${hoje.getFullYear()}/${String(Date.now()).slice(-5)}`;
    const user = Session.get();
    const valorUnit = vinho.preco || 0;
    const valorTotal = valorUnit * quantidade;

    const html = `<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <title>Guia de Transporte ${guiaNum} — the 100's</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; font-size: 11px; color: #1a1a1a; background: #fff; }
    .guia { max-width: 780px; margin: 0 auto; padding: 40px; }

    .guia-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 3px solid #8B3A44; margin-bottom: 24px; }
    .guia-brand h1 { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: #8B3A44; }
    .guia-brand .tagline { font-size: 10px; color: #C9A96E; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; }
    .guia-brand .co-info { margin-top: 10px; font-size: 10px; color: #666; line-height: 1.6; }
    .guia-doc { text-align: right; }
    .guia-doc .doc-type { font-size: 18px; font-weight: 700; color: #1a1a1a; letter-spacing: 2px; }
    .guia-doc .doc-num { font-size: 13px; font-weight: 600; color: #8B3A44; margin-top: 2px; }
    .guia-doc .doc-meta { margin-top: 8px; font-size: 10px; color: #666; line-height: 1.8; }

    .guia-parties { display: flex; gap: 30px; margin-bottom: 24px; }
    .guia-party { flex: 1; background: #faf8f5; padding: 16px; border-radius: 6px; border-left: 3px solid #C9A96E; }
    .guia-party-label { font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #C9A96E; margin-bottom: 8px; }
    .guia-party p { font-size: 11px; line-height: 1.7; color: #333; }
    .guia-party .name { font-weight: 600; font-size: 12px; color: #1a1a1a; }

    .guia-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .guia-table thead th { background: #8B3A44; color: #fff; padding: 10px 12px; font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; text-align: left; }
    .guia-table thead th.right { text-align: right; }
    .guia-table tbody td { padding: 12px; border-bottom: 1px solid #f0ebe6; font-size: 11px; }
    .guia-table tbody td.right { text-align: right; font-variant-numeric: tabular-nums; }
    .guia-table tfoot td { padding: 10px 12px; font-size: 12px; font-weight: 700; border-top: 2px solid #8B3A44; }

    .guia-obs { background: #faf8f5; border-left: 3px solid #C9A96E; padding: 14px 16px; margin-bottom: 24px; border-radius: 4px; }
    .guia-obs-title { font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #C9A96E; margin-bottom: 6px; }

    .signatures { display: flex; gap: 40px; margin-top: 40px; margin-bottom: 30px; }
    .sig-box { flex: 1; text-align: center; }
    .sig-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 8px; font-size: 10px; color: #666; }

    .guia-footer { border-top: 2px solid #f0ebe6; padding-top: 16px; text-align: center; font-size: 9px; color: #999; line-height: 1.6; }
    .guia-footer .gold-line { width: 50px; height: 2px; background: #C9A96E; margin: 10px auto; }

    .legal-box { background: #fff9f0; border: 1px solid #f0ebe6; border-radius: 4px; padding: 10px 14px; margin-bottom: 20px; font-size: 9px; color: #888; line-height: 1.6; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .guia { padding: 20px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="guia">
    <div class="guia-header">
      <div class="guia-brand">
        <img src="${window.location.origin}/assets/logo-the100s.png" alt="the 100's" style="width:96px;height:auto;margin-bottom:8px;display:block;filter: invert(1) sepia(1) saturate(2) hue-rotate(15deg) brightness(0.85);">
        <div class="tagline">${COMPANY.tagline}</div>
        <div class="co-info">
          ${COMPANY.legal} · NIF: ${COMPANY.nif}<br>
          ${COMPANY.address} — ${COMPANY.postal}<br>
          ${COMPANY.phone}
        </div>
      </div>
      <div class="guia-doc">
        <div class="doc-type">GUIA DE TRANSPORTE</div>
        <div class="doc-num">${guiaNum}</div>
        <div class="doc-meta">
          <strong>Data:</strong> ${dataFmt}<br>
          <strong>Hora Carga:</strong> ${horaFmt}<br>
          <strong>Emitente:</strong> ${user?.nome || 'Armazenista'}
        </div>
      </div>
    </div>

    <div class="guia-parties">
      <div class="guia-party">
        <div class="guia-party-label">Remetente (Origem)</div>
        <p class="name">Armazém Central — ${COMPANY.name}</p>
        <p>${COMPANY.address}<br>${COMPANY.postal}</p>
        <p>NIF: ${COMPANY.nif}</p>
      </div>
      <div class="guia-party">
        <div class="guia-party-label">Destinatário (Destino)</div>
        <p class="name">${escHtml(destino)}</p>
      </div>
    </div>

    <table class="guia-table">
      <thead>
        <tr>
          <th style="width:35%;">Designação</th>
          <th style="width:15%;">Tipo</th>
          <th style="width:15%;">Região / Colheita</th>
          <th class="right" style="width:10%;">Qtd.</th>
          <th class="right" style="width:12%;">Valor Unit.</th>
          <th class="right" style="width:13%;">Valor Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>${vinho.nome}</strong><br><span style="font-size:9px;color:#888;">${vinho.produtor || ''}</span></td>
          <td>${vinho.tipo || '—'}</td>
          <td>${vinho.regiao || '—'} ${vinho.anoColheita ? '· ' + vinho.anoColheita : ''}</td>
          <td class="right">${quantidade} un.</td>
          <td class="right">${fmt.eur(valorUnit)}</td>
          <td class="right"><strong>${fmt.eur(valorTotal)}</strong></td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="text-align:right;">Total de Mercadorias:</td>
          <td class="right"><strong>${quantidade} un.</strong></td>
          <td></td>
          <td class="right"><strong>${fmt.eur(valorTotal)}</strong></td>
        </tr>
      </tfoot>
    </table>

    <div class="legal-box">
      <strong>Enquadramento Legal:</strong> Documento emitido nos termos do artigo 201.º do CIEC e Decreto-Lei n.º 147/2003.
      Os bens circulam em território nacional acompanhados do presente documento.
    </div>

    <div class="signatures">
      <div class="sig-box">
        <div class="sig-line">Expedição (Carimbo e Assinatura)</div>
      </div>
      <div class="sig-box">
        <div class="sig-line">Transporte (Assinatura)</div>
      </div>
      <div class="sig-box">
        <div class="sig-line">Receção (Carimbo e Assinatura)</div>
      </div>
    </div>

    <div class="guia-footer">
      <div class="gold-line"></div>
      Documento processado por programa certificado n.º ${COMPANY.certificadoAT}/AT.<br>
      ${COMPANY.legal} · NIPC: ${COMPANY.nif} · ${COMPANY.address}, ${COMPANY.postal} · ${COMPANY.web}<br>
      <span style="color:#B89060;font-style:italic;font-size:9px;">⚠ Documento gerado em ambiente de demonstração (software académico — não certificado pela AT).</span>
    </div>

    <div class="no-print" style="text-align:center;margin-top:30px;">
      <button onclick="window.print()" style="background:#8B3A44;color:#fff;border:none;padding:12px 32px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">Imprimir Guia</button>
    </div>
  </div>
</body>
</html>`;
    openPrintWindow(html, `Guia ${guiaNum}`);
  } catch (err) {
    console.error('Erro ao imprimir guia:', err);
    toast('Erro ao gerar guia de transporte', 'error');
  }
}

/* ══════════════════════════════════════════════
   Guia de Transporte Modal Management
   ══════════════════════════════════════════════ */

let guiaModalVinhoId = null;

/**
 * Abre o modal de Guia de Transporte para um vinho específico.
 * Se não receber vinhoId, popula um <select> com todos os vinhos disponíveis.
 */
function openGuiaModal(vinhoId) {
  guiaModalVinhoId = vinhoId || null;
  const vinho = vinhoId ? (allVinhos || []).find(v => v.id === vinhoId) : null;
  const nameEl = document.getElementById('guia-wine-name');
  if (nameEl) nameEl.textContent = vinho ? vinho.nome : (vinhoId ? 'Vinho #' + vinhoId : 'Selecionar abaixo');

  // Se não veio vinhoId, mostra o seletor; caso contrário, esconde
  const selectorWrap = document.getElementById('guia-wine-selector-wrap');
  if (selectorWrap) {
    if (!vinhoId) {
      selectorWrap.style.display = '';
      const sel = document.getElementById('guia-wine-selector');
      if (sel) {
        sel.innerHTML = '<option value="">— Selecionar vinho —</option>' +
          (allVinhos || [])
            .filter(v => (v.quantidade || 0) > 0)
            .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
            .map(v => `<option value="${v.id}">${escHtml(v.nome)} (${v.quantidade} un. em armazém)</option>`)
            .join('');
        sel.value = '';
      }
    } else {
      selectorWrap.style.display = 'none';
    }
  }

  const qtyEl  = document.getElementById('guia-quantity');
  const destEl = document.getElementById('guia-destino');
  if (qtyEl)  qtyEl.value  = '1';
  if (destEl) destEl.value = '';
  document.getElementById('guia-modal')?.classList.remove('hidden');
  setTimeout(() => destEl?.focus(), 100);
}

function closeGuiaModal() {
  const modal = document.getElementById('guia-modal');
  if (modal) modal.classList.add('hidden');
  guiaModalVinhoId = null;
}

/**
 * Valida e gera a Guia de Transporte.
 * BUG fix: captura o vinhoId ANTES de fechar o modal (closeGuiaModal reseta a null).
 */
function generateGuia() {
  // Se o selector está visível, lê dele; senão usa o guiaModalVinhoId já definido
  const selectorWrap = document.getElementById('guia-wine-selector-wrap');
  if (selectorWrap && selectorWrap.style.display !== 'none') {
    const sel = document.getElementById('guia-wine-selector');
    const id = parseInt(sel?.value || '', 10);
    if (id) guiaModalVinhoId = id;
  }

  const quantidade = parseInt(document.getElementById('guia-quantity')?.value || '0', 10);
  const destino   = (document.getElementById('guia-destino')?.value || '').trim();

  if (!guiaModalVinhoId) {
    toast('Selecione um vinho', 'error');
    return;
  }
  if (!quantidade || quantidade < 1) {
    toast('Quantidade tem de ser maior que 0', 'error');
    return;
  }
  if (!destino) {
    toast('Indique um destino', 'error');
    document.getElementById('guia-destino')?.focus();
    return;
  }
  // Valida stock disponível
  const vinho = (allVinhos || []).find(v => v.id === guiaModalVinhoId);
  if (vinho && quantidade > (vinho.quantidade || 0)) {
    toast(`Stock insuficiente — apenas ${vinho.quantidade || 0} un. disponíveis`, 'error', 5000);
    return;
  }

  // ⚠ Captura o ID ANTES de closeGuiaModal() (que reseta a null)
  const vinhoIdFinal = guiaModalVinhoId;
  closeGuiaModal();

  // Guarda no histórico local (localStorage) — sem dependência do servidor
  const guiaNum = `GT ${new Date().getFullYear()}/${String(Date.now()).slice(-5)}`;
  saveGuiaHistorico({
    numero: guiaNum,
    vinhoId: vinhoIdFinal,
    vinhoNome: vinho?.nome || 'Vinho #' + vinhoIdFinal,
    quantidade,
    destino,
    data: new Date().toISOString(),
    operador: (Session.get() || {}).nome || 'Sistema',
  });

  printGuiaTransporte(vinhoIdFinal, quantidade, destino, guiaNum);
  toast(`Guia ${guiaNum} emitida`, 'success', 3500);
}

/** Histórico de guias emitidas (localStorage). Retorna lista mais recente primeiro. */
function getGuiasHistorico() {
  try { return JSON.parse(localStorage.getItem('the100s:guias') || '[]'); }
  catch { return []; }
}
function saveGuiaHistorico(g) {
  const list = getGuiasHistorico();
  list.unshift(g);
  // Mantém apenas as últimas 50
  localStorage.setItem('the100s:guias', JSON.stringify(list.slice(0, 50)));
  renderGuiasHistorico();
}

/** Renderiza a tabela de histórico de guias se a secção existir na página. */
function renderGuiasHistorico() {
  const tbody = document.getElementById('guias-historico-body');
  if (!tbody) return;
  const list = getGuiasHistorico();
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted,#8B7C68);font-style:italic;">Ainda não foram emitidas guias de transporte. Clica em "Nova guia" acima ou no botão de uma linha do inventário.</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(g => `
    <tr>
      <td><strong style="color:var(--gold,#C9A96E);font-variant-numeric:tabular-nums;">${escHtml(g.numero)}</strong></td>
      <td>${escHtml(g.vinhoNome)}</td>
      <td style="text-align:center;font-variant-numeric:tabular-nums;">${g.quantidade}</td>
      <td>${escHtml(g.destino)}</td>
      <td style="font-size:11px;color:var(--text-muted,#8B7C68);">${new Date(g.data).toLocaleString('pt-PT', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</td>
      <td style="text-align:right;">
        <button class="btn btn-secondary btn-sm" onclick="reprintGuia(${g.vinhoId}, ${g.quantidade}, ${JSON.stringify(g.destino).replace(/"/g,'&quot;')}, ${JSON.stringify(g.numero).replace(/"/g,'&quot;')})" title="Re-imprimir esta guia">🖨️ Re-imprimir</button>
      </td>
    </tr>
  `).join('');
}

/** Re-imprime uma guia anteriormente emitida (mesmo número, mesma data se possível). */
function reprintGuia(vinhoId, quantidade, destino, numero) {
  printGuiaTransporte(vinhoId, quantidade, destino, numero);
  toast(`A re-imprimir ${numero}…`, 'info', 2000);
}

function newSale() {
  closeReceiptAndReset();
}

/* ══════════════════════════════════════════════
   16C. DEVOLUÇÕES (Returns)
   ══════════════════════════════════════════════ */
let returnVendaId = null;

let _returnsCache = [];

async function openReturns() {
  document.getElementById('returns-modal')?.classList.remove('hidden');
  document.getElementById('return-confirm').style.display = 'none';
  document.getElementById('confirm-return-btn').style.display = 'none';
  returnVendaId = null;
  const searchEl = document.getElementById('returns-search');
  if (searchEl) searchEl.value = '';

  const list = document.getElementById('returns-list');
  if (!list) return;
  list.innerHTML = '<p class="returns-empty">A carregar vendas…</p>';

  let vendas;
  try { vendas = await apiFetch('/vendas'); } catch { vendas = FALLBACK.vendas || []; }
  _returnsCache = vendas.filter(v => (v.status || v.estado) === 'CONCLUIDA');

  // Listener pesquisa (uma única vez)
  if (searchEl && !searchEl.dataset.bound) {
    searchEl.dataset.bound = '1';
    searchEl.addEventListener('input', _renderReturnsList);
  }
  _renderReturnsList();
}

function _renderReturnsList() {
  const list = document.getElementById('returns-list');
  if (!list) return;
  const q = (document.getElementById('returns-search')?.value || '').toLowerCase();
  const filtered = _returnsCache.filter(v => {
    if (!q) return true;
    return (
      String(v.codigo || '').toLowerCase().includes(q) ||
      String(v.cliente || v.clienteNome || '').toLowerCase().includes(q) ||
      String(v.produto || '').toLowerCase().includes(q)
    );
  }).slice(0, 30);

  if (!filtered.length) {
    list.innerHTML = `<p class="returns-empty">${q ? 'Nenhuma venda corresponde à pesquisa.' : 'Sem vendas para devolver.'}</p>`;
    return;
  }

  list.innerHTML = filtered.map(v => {
    const dataFmt = fmt.dt(v.dataVenda);
    const cliente = v.clienteNome || v.cliente || 'Consumidor Final';
    const produtos = (v.produto || '—').length > 60 ? (v.produto || '').slice(0, 60) + '…' : (v.produto || '—');
    return `<div class="return-sale-item" onclick="selectReturn(${v.id}, '${escHtml(v.codigo)}', this)" tabindex="0" role="button">
      <div style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:0;">
        <div style="display:flex;gap:10px;align-items:baseline;">
          <span style="font-family:'Cormorant Garamond',serif;font-weight:700;color:#E0C992;font-size:14px;letter-spacing:0.5px;">${escHtml(v.codigo || '—')}</span>
          <span style="font-size:11px;color:#9B9590;">${escHtml(cliente)}</span>
        </div>
        <div style="font-size:11px;color:#9B9590;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(produtos)}</div>
        <div style="font-size:10px;color:#9B9590;letter-spacing:0.04em;">${escHtml(dataFmt)} · ${escHtml(v.metodoPagamento || '')}</div>
      </div>
      <span style="font-family:'Cormorant Garamond',serif;font-weight:700;color:#C9A96E;font-size:15px;font-variant-numeric:tabular-nums;flex-shrink:0;">${escHtml(fmt.eur(v.total))}</span>
    </div>`;
  }).join('');
}

async function selectReturn(vendaId, codigo, rowEl) {
  returnVendaId = vendaId;
  // Highlight selected row
  document.querySelectorAll('.return-sale-item.selected').forEach(el => el.classList.remove('selected'));
  if (rowEl) rowEl.classList.add('selected');

  const confirmDiv = document.getElementById('return-confirm');
  const confirmBtn = document.getElementById('confirm-return-btn');
  const titleEl = document.getElementById('return-confirm-title');
  const itemsEl = document.getElementById('return-confirm-items');

  if (titleEl) titleEl.textContent = `Devolver venda ${codigo}`;
  if (confirmDiv) confirmDiv.style.display = 'block';
  if (confirmBtn) confirmBtn.style.display = 'inline-flex';

  // Load sale items
  if (itemsEl) {
    itemsEl.innerHTML = '<p style="color:#9B9590;font-size:11px;text-align:center;padding:8px;">A carregar itens…</p>';
    try {
      const itens = await apiFetch(`/vendas/${vendaId}/itens`);
      const total = itens.reduce((s, i) => s + (i.precoUnitario || 0) * (i.quantidade || 0), 0);
      itemsEl.innerHTML = itens.map(item => `
        <div class="return-item-row" style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(201,169,110,0.06);font-size:13px;">
          <span style="flex:1;color:#F5F0E8;">${escHtml(item.nome || 'Vinho #' + item.vinhoId)}</span>
          <span style="color:#9B9590;font-variant-numeric:tabular-nums;">×${item.quantidade}</span>
          <span style="color:#C9A96E;font-weight:600;font-variant-numeric:tabular-nums;min-width:64px;text-align:right;">${escHtml(fmt.eur((item.precoUnitario || 0) * (item.quantidade || 0)))}</span>
        </div>
      `).join('') + `
        <div style="display:flex;justify-content:space-between;padding-top:10px;margin-top:6px;border-top:2px solid rgba(201,169,110,0.25);">
          <span style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#B89060;font-weight:700;align-self:center;">Total a devolver</span>
          <span style="font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:600;color:#E0C992;font-variant-numeric:tabular-nums;">${escHtml(fmt.eur(total))}</span>
        </div>`;
    } catch {
      itemsEl.innerHTML = '<p style="color:#9B9590;font-size:11px;padding:8px;">Será processada devolução total da venda.</p>';
    }
  }

  confirmDiv?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    g.innerHTML = emptyState('Sem funcionários registados', '👥');
    return;
  }
  const ini = n => n ? n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';
  g.innerHTML = allFuncs.map(f => {
    const nomeRaw = f.nome || (f.pessoa && f.pessoa.nome) || '—';
    const emailRaw = f.email || (f.pessoa && f.pessoa.email) || '';
    const nome = escHtml(nomeRaw);
    const email = escHtml(emailRaw);
    const cargo = escHtml(f.cargo || '—');
    return `<div class="team-card">
      <div style="display:flex;align-items:center;gap:var(--sp-4);margin-bottom:var(--sp-4);">
        <div class="team-avatar" aria-hidden="true">${escHtml(ini(nomeRaw))}</div>
        <div><div style="font-weight:700;font-size:15px;">${nome}</div><div style="font-size:12px;color:var(--text-muted);">${email}</div></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:var(--sp-2);">
        <div style="display:flex;justify-content:space-between;"><span style="font-size:12px;color:var(--text-muted);">Cargo</span><span style="font-size:13px;font-weight:600;">${cargo}</span></div>
        <div style="display:flex;justify-content:space-between;"><span style="font-size:12px;color:var(--text-muted);">Salário</span><span style="font-family:var(--font-display);font-size:13px;font-weight:700;color:var(--text-gold);">${fmt.eur(f.salario)}</span></div>
        <div style="display:flex;justify-content:space-between;"><span style="font-size:12px;color:var(--text-muted);">Admissão</span><span style="font-size:12px;color:var(--text-secondary);">${fmt.date(f.dataAdmissao)}</span></div>
        <div style="display:flex;justify-content:space-between;margin-top:4px;">${statusBadge(f.nivelAcesso)}${f.ativo === 1 || f.ativo === true ? '<span class="badge badge-success">Ativo</span>' : '<span class="badge badge-muted">Inativo</span>'}</div>
        <div style="display:flex;gap:6px;margin-top:var(--sp-2);">
          <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="openEditFuncModal(${f.id})" aria-label="Editar funcionário ${nome}">Editar</button>
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

  countUp(document.getElementById('r-receita'), dash.receitaTotal || 0, { format: fmt.eur });
  countUp(document.getElementById('r-lucro'),   dash.lucroLiquido || 0, { format: fmt.eur });
  countUp(document.getElementById('r-ticket'),  dash.ticketMedio || 0, { format: fmt.eur });
  countUp(document.getElementById('r-vendas'),  dash.vendas || 0);

  drawBarChart('chart-vendas', dash.vendasLabels || ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Hj'], dash.vendasSemanais || [0, 0, 0, 0, 0, 0, 0], '#C9A96E');
  drawLineChart('chart-receita', ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'], [120, 185, 240, 180, 310, 420], '#A83D4A');

  let vinhos;
  try { vinhos = await apiFetch('/vinhos'); } catch { vinhos = FALLBACK.vinhos; }
  const tbody = document.getElementById('top-wines-table');
  if (tbody) {
    const sorted = [...vinhos].sort((a, b) => (b.preco * b.quantidade) - (a.preco * a.quantidade)).slice(0, 8);
    const totalReceita = sorted.reduce((s, v) => s + (v.preco || 0) * (v.quantidade || 0), 0) || 1;
    tbody.innerHTML = sorted.map((v, i) => {
      const valor = (v.preco || 0) * (v.quantidade || 0);
      const quota = (valor / totalReceita) * 100;
      const rankBadge = `<span class="rep-rank rep-rank-${i + 1}">${i + 1}</span>`;
      return `<tr class="rep-row">
        <td>${rankBadge}</td>
        <td style="font-weight:600;">${escHtml(v.nome)}</td>
        <td class="muted">${escHtml(v.tipo || '—')}</td>
        <td class="muted">${escHtml(v.regiao || '—')}</td>
        <td><span style="font-family:var(--font-display);font-weight:700;color:var(--text-gold);">${escHtml(fmt.eur(v.preco))}</span></td>
        <td><span style="font-family:var(--font-display);font-weight:700;">${escHtml(fmt.eur(valor))}</span></td>
        <td><div class="rep-bar"><span class="rep-bar-fill" style="width:${quota.toFixed(1)}%"></span></div><span class="rep-bar-label">${quota.toFixed(1)}%</span></td>
      </tr>`;
    }).join('');
  }
  animateEntrance();
}

/* ══════════════════════════════════════════════
   19. CAVES — Cellar Grid
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
  const nameEl = document.getElementById('cave-name');
  if (nameEl) nameEl.textContent = `${cfg.nome} — ${cfg.rows} linhas × ${cfg.cols} colunas`;

  // Tabs (novo layout) e fallback para botões antigos
  document.querySelectorAll('.cave-tab, .cave-selector-btn').forEach(b => {
    b.classList.remove('active');
    if (b.hasAttribute('aria-selected')) b.setAttribute('aria-selected', 'false');
  });
  const activeTab = document.querySelector(`.cave-tab[data-cave="${currentCave}"]`)
    || document.querySelector(`.cave-selector-btn[onclick*="'${currentCave}'"]`);
  if (activeTab) {
    activeTab.classList.add('active');
    if (activeTab.hasAttribute('aria-selected')) activeTab.setAttribute('aria-selected', 'true');
  }

  try { caveVinhos = await apiFetch('/vinhos'); } catch { caveVinhos = FALLBACK.vinhos; }
  // Estado das caves: persiste em localStorage (a API /api/caves/<id> ainda não tem persistência de slots)
  caveData = _loadCaveStorage(currentCave) || {};
  if (!Object.keys(caveData).length) {
    // Pré-povoa demo só se não havia nada gravado
    const pool = caveVinhos.length ? caveVinhos : FALLBACK.vinhos;
    const demoSlots = [
      { row: 1, col: 3 }, { row: 1, col: 4 }, { row: 2, col: 1 },
      { row: 3, col: 5 }, { row: 4, col: 2 }, { row: 4, col: 3 },
      { row: 5, col: 7 }, { row: 6, col: 1 },
    ];
    demoSlots.forEach((s, i) => { if (pool[i % pool.length]) caveData[`${s.row}-${s.col}`] = pool[i % pool.length]; });
    _saveCaveStorage(currentCave, caveData);
  }
  selectedSlot = null;
  renderCaveGrid();
  updateCaveStats();
  resetSlotInfo();
}

function _caveStorageKey(cave) { return `vd_cave_${cave}_v2`; }
function _loadCaveStorage(cave) {
  try { return JSON.parse(localStorage.getItem(_caveStorageKey(cave)) || 'null'); } catch { return null; }
}
function _saveCaveStorage(cave, data) {
  try { localStorage.setItem(_caveStorageKey(cave), JSON.stringify(data)); } catch {}
}

function updateCaveStats() {
  const cfg = CAVE_CONFIGS[currentCave];
  const total = cfg.rows * cfg.cols;
  const occ = Object.keys(caveData).length;
  const free = total - occ;
  const pct = total ? Math.round(occ / total * 100) : 0;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('cave-capacity', total);
  set('cave-occupied', occ);
  set('cave-free', free);
  set('cave-pct', pct + '%');
  set('cave-pct-big', pct + '%');
  set('cave-occ-text', `${occ} de ${total}`);
  const fill = document.getElementById('cave-progress-fill');
  if (fill) fill.style.width = pct + '%';
  const meta = document.getElementById('cave-grid-meta');
  if (meta) meta.innerHTML = `${cfg.rows} linhas × ${cfg.cols} colunas · <strong>${occ}/${total}</strong>`;
}

function renderCaveGrid() {
  const cfg = CAVE_CONFIGS[currentCave];
  const container = document.getElementById('cave-grid-container'); if (!container) return;
  const typeClass = { Tinto: 'tinto', Branco: 'branco', 'Rosé': 'rose', Espumante: 'espumante', Porto: 'porto', Madeira: 'madeira' };
  const colHeaders = [''].concat(Array.from({ length: cfg.cols }, (_, i) => String(i + 1).padStart(2, '0')));
  let html = `<div class="cave-grid" style="grid-template-columns:28px repeat(${cfg.cols},56px);">`;
  // Linha de cabeçalhos (números das colunas)
  html += colHeaders.map(h => `<div class="cave-row-label" style="min-height:30px;font-size:10px;letter-spacing:0.1em;">${escHtml(h)}</div>`).join('');
  // Linhas A, B, C... × colunas 1..cols
  for (let r = 1; r <= cfg.rows; r++) {
    html += `<div class="cave-row-label">${escHtml(String.fromCharCode(64 + r))}</div>`;
    for (let c = 1; c <= cfg.cols; c++) {
      const key = `${r}-${c}`;
      const wine = caveData[key];
      const tc = wine ? (typeClass[wine.tipo] || 'tinto') : '';
      const isSelected = selectedSlot === key ? ' selected' : '';
      if (wine) {
        const shortName = (wine.nome || '').split(' ').slice(0, 2).join(' ');
        const ano = wine.anoColheita || wine.ano_colheita;
        html += `<button type="button" class="cave-slot occupied ${tc}${isSelected}" onclick="selectSlot('${key}')" title="${escHtml(wine.nome)} — ${escHtml(String.fromCharCode(64 + r))}${c}" aria-label="${escHtml(wine.nome)} na posição ${escHtml(String.fromCharCode(64 + r))}${c}">
          <span class="cave-slot-label">${escHtml(shortName)}</span>
          ${ano ? `<span class="cave-slot-year">'${escHtml(String(ano).slice(-2))}</span>` : ''}
        </button>`;
      } else {
        const posTitle = `Posição ${String.fromCharCode(64 + r)}${c} — Livre`;
        html += `<button type="button" class="cave-slot${isSelected}" onclick="selectSlot('${key}')" title="${escHtml(posTitle)}" aria-label="${escHtml(posTitle)}"></button>`;
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
  const actCard = document.getElementById('slot-actions-card');
  const clearBtn = document.getElementById('clear-slot-btn');

  if (infoEl) {
    if (wine) {
      const ano = wine.anoColheita || wine.ano_colheita;
      infoEl.innerHTML = `
        <div class="slot-detail-name">${escHtml(wine.nome)}</div>
        <dl class="slot-detail-grid">
          <dt>Tipo</dt><dd>${escHtml(wine.tipo || '—')}</dd>
          <dt>Região</dt><dd>${escHtml(wine.regiao || '—')}</dd>
          <dt>Colheita</dt><dd>${escHtml(ano ? String(ano) : '—')}</dd>
          <dt>PVP</dt><dd class="gold">${escHtml(fmt.eur(wine.preco))}</dd>
        </dl>
        <span class="slot-position-badge">${escHtml(rowLabel)}${escHtml(String(c))}</span>
      `;
    } else {
      infoEl.innerHTML = `
        <p class="slot-empty-msg">Posição <strong style="color:var(--gold);">${escHtml(rowLabel)}${escHtml(String(c))}</strong> está livre. Seleciona um vinho abaixo para o colocar nesta posição.</p>
      `;
    }
  }

  if (actCard) {
    actCard.style.display = 'block';
    const sel = document.getElementById('slot-wine-select');
    if (sel && caveVinhos.length) {
      sel.innerHTML = '<option value="">Selecionar vinho…</option>' + caveVinhos.map(v =>
        `<option value="${escHtml(String(v.id))}"${wine && wine.id === v.id ? ' selected' : ''}>${escHtml(v.nome)} — ${escHtml(v.tipo || '')}${v.anoColheita ? ' · ' + escHtml(String(v.anoColheita)) : ''}</option>`
      ).join('');
    }
    if (clearBtn) {
      if (wine) clearBtn.classList.remove('hidden');
      else clearBtn.classList.add('hidden');
    }
  }
}

function resetSlotInfo() {
  const infoEl = document.getElementById('slot-info-content');
  const actCard = document.getElementById('slot-actions-card');
  if (infoEl) {
    infoEl.innerHTML = '<p class="slot-empty-msg">Clique numa posição da cave para ver os detalhes da garrafa armazenada.</p>';
  }
  if (actCard) actCard.style.display = 'none';
}

function assignWineToSlot() {
  if (!selectedSlot) { toast('Seleciona uma posição na cave primeiro', 'warning'); return; }
  const sel = document.getElementById('slot-wine-select'); if (!sel) return;
  const winhoId = +sel.value;
  if (!winhoId) { toast('Escolhe um vinho da lista', 'warning'); return; }
  const wine = caveVinhos.find(v => v.id === winhoId); if (!wine) return;
  caveData[selectedSlot] = wine;
  _saveCaveStorage(currentCave, caveData);
  const [r, c] = selectedSlot.split('-');
  const pos = String.fromCharCode(64 + parseInt(r)) + c;
  toast(`${wine.nome} colocado em ${pos}`, 'success');
  renderCaveGrid();
  selectSlot(selectedSlot);
  updateCaveStats();
}

function clearSlot() {
  if (!selectedSlot) return;
  const [r, c] = selectedSlot.split('-');
  const pos = String.fromCharCode(64 + parseInt(r)) + c;
  delete caveData[selectedSlot];
  _saveCaveStorage(currentCave, caveData);
  toast(`Posição ${pos} libertada`, 'info');
  renderCaveGrid();
  resetSlotInfo();
  selectedSlot = null;
  updateCaveStats();
}

/* ══════════════════════════════════════════════
   20. EXPORT FUNCTIONS
   ══════════════════════════════════════════════ */
/* Relatório premium em Excel (gerado pelo backend com 4 sheets). */
async function exportRelatorioCSV() {
  try {
    const sess = Session.get();
    const headers = {};
    if (sess && sess.token) headers['Authorization'] = 'Bearer ' + sess.token;
    const res = await fetch('/api/export/relatorio.xlsx', { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || ('HTTP ' + res.status));
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'the100s-relatorio-' + new Date().toISOString().slice(0,10) + '.xlsx';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    toast('Relatório premium exportado', 'success');
  } catch (err) {
    console.error(err);
    toast('Erro a exportar relatório: ' + (err.message || 'desconhecido'), 'error');
  }
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

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    document.body.style.opacity = '1';
  } else {
    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
      document.body.style.transition = 'opacity 0.4s ease';
      document.body.style.opacity = '1';
    });
  }

  switch (path) {
    case 'index.html': case '': case '/':
      initLogin(); checkApi(); break;

    case 'gerente.html':
      loadDashboard(); setInterval(checkApi, 30000); break;

    case 'loja.html':
      loadPOS(); setInterval(checkApi, 30000); break;

    case 'stock.html':
      loadStock();
      document.getElementById('stock-search')?.addEventListener('input', renderStock);
      document.getElementById('tipo-filter')?.addEventListener('change', renderStock);
      document.getElementById('stock-sort')?.addEventListener('change', renderStock);
      document.getElementById('stock-only-crit')?.addEventListener('change', renderStock);
      setInterval(checkApi, 30000);
      break;

    case 'gerente-vendas.html':
      loadVendas();
      document.getElementById('vendas-search')?.addEventListener('input', filterVendas);
      document.getElementById('estado-filter')?.addEventListener('change', filterVendas);
      setInterval(checkApi, 30000);
      break;

    case 'gerente-equipa.html':
      loadEquipa();
      setInterval(checkApi, 30000);
      break;

    case 'gerente-relatorios.html':
      loadRelatorios();
      setInterval(checkApi, 30000);
      break;

    case 'caves.html':
      loadCave('A');
      setInterval(checkApi, 30000);
      break;
  }
});
if (location.search.includes('_toast_demo')) {
  setTimeout(() => {
    toast('Murganheira Bruto (0.75L) adicionado', 'success');
    setTimeout(() => toast('Stock crítico: Barca Velha (3un)', 'warning'), 250);
    setTimeout(() => toast('Pagamento recusado — tente novamente', 'error'), 500);
    setTimeout(() => toast('Cave A — temperatura ideal (14°C)', 'info'), 750);
  }, 1500);
}
