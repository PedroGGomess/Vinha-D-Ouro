/* ============================================================================
   VINHA D'OURO — Premium Wine Management System
   app.js · Unified Frontend Logic v2
   ============================================================================ */

const API = 'http://localhost:8080/api';

/* ──────────────────────────────────────────────
   SESSION / AUTH
   ──────────────────────────────────────────── */
const Session = {
  key: 'vd_session',
  save(user)  { try { localStorage.setItem(this.key, JSON.stringify(user)); } catch(e) {} },
  get()       { try { return JSON.parse(localStorage.getItem(this.key)||'null'); } catch(e) { return null; } },
  clear()     { try { localStorage.removeItem(this.key); } catch(e) {} },

  // Protected pages → allowed roles
  pagesAuth: {
    'gerente.html':            ['GERENTE','ADMIN'],
    'gerente-vendas.html':     ['GERENTE','ADMIN'],
    'gerente-relatorios.html': ['GERENTE','ADMIN'],
    'gerente-equipa.html':     ['GERENTE','ADMIN'],
    'provas.html':             ['GERENTE','ADMIN','FUNCIONARIO'],
    'caves.html':              ['ARMAZENISTA','GERENTE','ADMIN'],
    'loja.html':               ['FUNCIONARIO','GERENTE','ADMIN'],
    'stock.html':              ['ARMAZENISTA','GERENTE','ADMIN'],
  },

  guard() {
    const page    = window.location.pathname.split('/').pop() || 'index.html';
    const allowed = this.pagesAuth[page];
    if (!allowed) return;
    const user = this.get();
    if (!user)                    { window.location.href='index.html'; return; }
    if (!allowed.includes(user.role)) { window.location.href='index.html'; return; }
    // Update sidebar user info
    const av = document.getElementById('user-avatar');
    const nm = document.getElementById('user-name');
    if (av) av.textContent = user.nome.charAt(0).toUpperCase();
    if (nm) nm.textContent = user.nome;
  }
};

function logout() { Session.clear(); window.location.href='index.html'; }

/* ──────────────────────────────────────────────
   LOGIN HANDLER
   ──────────────────────────────────────────── */
async function handleLogin(e) {
  e && e.preventDefault();
  const username = document.getElementById('login-username')?.value?.trim();
  const password = document.getElementById('login-password')?.value;
  const btn      = document.getElementById('login-btn');
  const errorEl  = document.getElementById('login-error');

  if (!username || !password) { showLoginError('Preencha todos os campos'); return; }
  if (btn) { btn.disabled=true; btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>A verificar...'; }
  if (errorEl) errorEl.style.display='none';

  try {
    const res  = await fetch(`${API}/login`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({username, password})
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Credenciais inválidas');
    Session.save(data);
    window.location.href = data.redirect;
  } catch(err) {
    showLoginError(err.message || 'Erro de ligação ao servidor');
    if (btn) { btn.disabled=false; btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>Entrar'; }
  }
}

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  if (!el) return;
  el.querySelector('span').textContent = msg;
  el.style.display = 'flex';
}

function fillLogin(user, pass) {
  const u=document.getElementById('login-username'); if(u) u.value=user;
  const p=document.getElementById('login-password'); if(p) p.value=pass;
  const e=document.getElementById('login-error');    if(e) e.style.display='none';
}

/* ──────────────────────────────────────────────
   API HELPERS
   ──────────────────────────────────────────── */
let apiOnline = false;

async function checkApi() {
  try {
    const r = await fetch(`${API}/health`, {signal: AbortSignal.timeout(2500)});
    apiOnline = r.ok;
  } catch { apiOnline = false; }
  updateApiBadge();
  return apiOnline;
}

function updateApiBadge() {
  const badge = document.getElementById('api-badge');
  const label = document.getElementById('api-label');
  if (!badge) return;
  badge.className = apiOnline ? 'api-badge online' : 'api-badge offline';
  if (label) label.textContent = apiOnline ? 'BD Ligada' : 'Offline (Demo)';
}

async function apiFetch(path, opts={}) {
  const r = await fetch(`${API}${path}`, {
    headers:{'Content-Type':'application/json'}, ...opts
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

/* ──────────────────────────────────────────────
   TOAST
   ──────────────────────────────────────────── */
function toast(msg, type='success', ms=3500) {
  const c = document.getElementById('toasts'); if(!c) return;
  const icons = {
    success: '<polyline points="20 6 9 17 4 12"/>',
    error:   '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    warning: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/>',
    info:    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  };
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icons[type]}</svg>${msg}`;
  c.appendChild(t);
  setTimeout(()=>t.remove(), ms);
}

/* ──────────────────────────────────────────────
   FORMAT HELPERS
   ──────────────────────────────────────────── */
const fmt = {
  eur: v  => `${(+v||0).toFixed(2).replace('.',',')} €`,
  num: v  => (v||0).toLocaleString('pt-PT'),
  date: s => { if(!s) return '—'; try { return new Date(s).toLocaleDateString('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric'}); } catch { return s; }},
  dt:   s => { if(!s) return '—'; try { return new Date(s).toLocaleString('pt-PT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}); } catch { return s; }},
};

function stockBar(qty, max=100) {
  const pct = Math.min(100,(qty/Math.max(max,1))*100);
  const cls = qty<10?'critical': qty<25?'low': qty<50?'ok':'high';
  return `<div class="stock-bar-wrap"><div class="stock-bar"><div class="stock-bar-fill ${cls}" style="width:${pct}%"></div></div><span class="stock-count">${qty}</span></div>`;
}

function statusBadge(s) {
  const map = {
    'CONCLUIDA':'badge-success','CONCLUÍDA':'badge-success',
    'PENDENTE':'badge-warning','CANCELADA':'badge-danger','CANCELADO':'badge-danger',
    'ATIVO':'badge-success','INATIVO':'badge-muted',
    'GERENTE':'badge-gold','ADMIN':'badge-wine',
    'FUNCIONARIO':'badge-info','ARMAZENISTA':'badge-info',
  };
  const labels = {
    'CONCLUIDA':'Concluída','CONCLUÍDA':'Concluída','PENDENTE':'Pendente',
    'CANCELADA':'Cancelada','CANCELADO':'Cancelado',
    'ATIVO':'Ativo','INATIVO':'Inativo','GERENTE':'Gerente','ADMIN':'Admin',
    'FUNCIONARIO':'Funcionário','ARMAZENISTA':'Armazenista',
  };
  const k=(s||'').toUpperCase();
  return `<span class="badge ${map[k]||'badge-muted'}">${labels[k]||s||'—'}</span>`;
}

/* ──────────────────────────────────────────────
   SVG CHARTS
   ──────────────────────────────────────────── */
function drawBarChart(svgId, labels, values, color='#C9A227') {
  const svg=document.getElementById(svgId); if(!svg) return;
  svg.innerHTML='';
  const W=500,H=200,padL=40,padR=16,padT=16,padB=36;
  const iW=W-padL-padR, iH=H-padT-padB, n=labels.length;
  const maxV=Math.max(...values,1), step=iW/n, barW=Math.floor(step*0.55);
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);

  const defs=document.createElementNS('http://www.w3.org/2000/svg','defs');
  svg.appendChild(defs);

  for(let i=0;i<=4;i++){
    const y=padT+(iH/4)*i;
    const l=document.createElementNS('http://www.w3.org/2000/svg','line');
    l.setAttribute('x1',padL);l.setAttribute('x2',W-padR);l.setAttribute('y1',y);l.setAttribute('y2',y);
    l.setAttribute('stroke','rgba(255,255,255,0.04)');l.setAttribute('stroke-width','1');
    svg.appendChild(l);
  }

  values.forEach((v,i)=>{
    const x=padL+step*i+(step-barW)/2;
    const bH=Math.max(v>0?3:1,(v/maxV)*iH);
    const y=padT+iH-bH;
    const gId=`g${svgId}${i}`;
    const g=document.createElementNS('http://www.w3.org/2000/svg','linearGradient');
    g.setAttribute('id',gId);g.setAttribute('x1','0');g.setAttribute('y1','0');g.setAttribute('x2','0');g.setAttribute('y2','1');
    const s1=document.createElementNS('http://www.w3.org/2000/svg','stop');
    s1.setAttribute('offset','0%');s1.setAttribute('stop-color',color);s1.setAttribute('stop-opacity','0.9');
    const s2=document.createElementNS('http://www.w3.org/2000/svg','stop');
    s2.setAttribute('offset','100%');s2.setAttribute('stop-color',color);s2.setAttribute('stop-opacity','0.35');
    g.appendChild(s1);g.appendChild(s2);defs.appendChild(g);
    const bar=document.createElementNS('http://www.w3.org/2000/svg','rect');
    bar.setAttribute('x',x);bar.setAttribute('y',y);bar.setAttribute('width',barW);bar.setAttribute('height',bH);
    bar.setAttribute('rx','4');bar.setAttribute('fill',`url(#${gId})`);
    svg.appendChild(bar);
    const lbl=document.createElementNS('http://www.w3.org/2000/svg','text');
    lbl.setAttribute('x',x+barW/2);lbl.setAttribute('y',H-padB/4);
    lbl.setAttribute('text-anchor','middle');lbl.setAttribute('font-size','11');
    lbl.setAttribute('fill','rgba(168,153,142,0.7)');lbl.setAttribute('font-family','Inter,sans-serif');
    lbl.textContent=labels[i];svg.appendChild(lbl);
  });
}

function drawLineChart(svgId, labels, values, color='#A83D4A') {
  const svg=document.getElementById(svgId); if(!svg) return;
  svg.innerHTML='';
  const W=500,H=200,padL=40,padR=16,padT=16,padB=36;
  const iW=W-padL-padR, iH=H-padT-padB, n=labels.length;
  const maxV=Math.max(...values,1), stepX=iW/(n-1||1);
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);

  const defs=document.createElementNS('http://www.w3.org/2000/svg','defs');
  const ag=document.createElementNS('http://www.w3.org/2000/svg','linearGradient');
  ag.setAttribute('id',`ag${svgId}`);ag.setAttribute('x1','0');ag.setAttribute('y1','0');ag.setAttribute('x2','0');ag.setAttribute('y2','1');
  const as1=document.createElementNS('http://www.w3.org/2000/svg','stop');
  as1.setAttribute('offset','0%');as1.setAttribute('stop-color',color);as1.setAttribute('stop-opacity','0.22');
  const as2=document.createElementNS('http://www.w3.org/2000/svg','stop');
  as2.setAttribute('offset','100%');as2.setAttribute('stop-color',color);as2.setAttribute('stop-opacity','0.01');
  ag.appendChild(as1);ag.appendChild(as2);defs.appendChild(ag);svg.appendChild(defs);

  for(let i=0;i<=4;i++){
    const y=padT+(iH/4)*i;
    const l=document.createElementNS('http://www.w3.org/2000/svg','line');
    l.setAttribute('x1',padL);l.setAttribute('x2',W-padR);l.setAttribute('y1',y);l.setAttribute('y2',y);
    l.setAttribute('stroke','rgba(255,255,255,0.04)');l.setAttribute('stroke-width','1');
    svg.appendChild(l);
  }

  const pts=values.map((v,i)=>({x:padL+stepX*i, y:padT+iH-(v/maxV)*iH}));

  const aP=[`M ${pts[0].x} ${padT+iH}`,pts.map(p=>`L ${p.x} ${p.y}`).join(' '),`L ${pts[pts.length-1].x} ${padT+iH} Z`].join(' ');
  const area=document.createElementNS('http://www.w3.org/2000/svg','path');
  area.setAttribute('d',aP);area.setAttribute('fill',`url(#ag${svgId})`);svg.appendChild(area);

  const smooth=pts.map((p,i)=>{
    if(i===0) return `M ${p.x},${p.y}`;
    const prev=pts[i-1], cx1=prev.x+(p.x-prev.x)*0.5, cx2=p.x-(p.x-prev.x)*0.5;
    return `C ${cx1},${prev.y} ${cx2},${p.y} ${p.x},${p.y}`;
  }).join(' ');
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d',smooth);path.setAttribute('fill','none');
  path.setAttribute('stroke',color);path.setAttribute('stroke-width','2.5');path.setAttribute('stroke-linecap','round');
  svg.appendChild(path);

  pts.forEach((p,i)=>{
    const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');
    dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);dot.setAttribute('r','4');
    dot.setAttribute('fill',color);dot.setAttribute('stroke','rgba(10,4,6,0.9)');dot.setAttribute('stroke-width','2');
    svg.appendChild(dot);
    const lbl=document.createElementNS('http://www.w3.org/2000/svg','text');
    lbl.setAttribute('x',p.x);lbl.setAttribute('y',H-padB/4);
    lbl.setAttribute('text-anchor','middle');lbl.setAttribute('font-size','11');
    lbl.setAttribute('fill','rgba(168,153,142,0.7)');lbl.setAttribute('font-family','Inter,sans-serif');
    lbl.textContent=labels[i];svg.appendChild(lbl);
  });
}

/* ──────────────────────────────────────────────
   FALLBACK DATA (demo mode when server offline)
   ──────────────────────────────────────────── */
const FALLBACK = {
  vinhos:[
    {id:1,nome:"Quinta do Crasto Reserva",tipo:"Tinto",regiao:"Douro",produtor:"Quinta do Crasto",anoColheita:2019,preco:32.50,quantidade:45},
    {id:2,nome:"Esporão Reserva Branco",tipo:"Branco",regiao:"Alentejo",produtor:"Herdade do Esporão",anoColheita:2021,preco:18.90,quantidade:62},
    {id:3,nome:"Barca Velha",tipo:"Tinto",regiao:"Douro",produtor:"Casa Ferreirinha",anoColheita:2011,preco:185.00,quantidade:8},
    {id:4,nome:"Niepoort Redoma Rosé",tipo:"Rosé",regiao:"Douro",produtor:"Niepoort",anoColheita:2022,preco:22.00,quantidade:34},
    {id:5,nome:"Luís Pato Vinhas Velhas",tipo:"Tinto",regiao:"Bairrada",produtor:"Luís Pato",anoColheita:2018,preco:28.50,quantidade:3},
    {id:6,nome:"Ramos Pinto Duas Quintas",tipo:"Tinto",regiao:"Douro",produtor:"Ramos Pinto",anoColheita:2020,preco:15.90,quantidade:78},
    {id:7,nome:"Palhete Vinho Verde",tipo:"Branco",regiao:"Vinho Verde",produtor:"Adega Cooperativa",anoColheita:2023,preco:9.50,quantidade:90},
    {id:8,nome:"Cockburn's 10 Anos Tawny",tipo:"Porto",regiao:"Porto",produtor:"Cockburn's",anoColheita:2010,preco:24.90,quantidade:22},
    {id:9,nome:"Marta Sousa Puro",tipo:"Tinto",regiao:"Douro",produtor:"Marta Sousa",anoColheita:2020,preco:19.50,quantidade:55},
    {id:10,nome:"Alvarinho Soalheiro",tipo:"Branco",regiao:"Vinho Verde",produtor:"Soalheiro",anoColheita:2022,preco:14.90,quantidade:41},
    {id:11,nome:"Quinta Vale Meão",tipo:"Tinto",regiao:"Douro",produtor:"QVM",anoColheita:2020,preco:55.00,quantidade:7},
    {id:12,nome:"Graham's LBV Porto",tipo:"Porto",regiao:"Porto",produtor:"W&J Graham's",anoColheita:2018,preco:18.50,quantidade:30},
  ],
  funcionarios:[
    {id:1,nome:"António Ferreira",cargo:"Gerente",salario:2800,dataAdmissao:"2022-01-15",ativo:1,nivelAcesso:"GERENTE",email:"antonio@vinhadouro.pt"},
    {id:2,nome:"Sofia Martins",cargo:"Operador POS",salario:1200,dataAdmissao:"2023-03-01",ativo:1,nivelAcesso:"FUNCIONARIO",email:"sofia@vinhadouro.pt"},
    {id:3,nome:"João Rodrigues",cargo:"Armazenista",salario:1150,dataAdmissao:"2023-06-15",ativo:1,nivelAcesso:"ARMAZENISTA",email:"joao@vinhadouro.pt"},
    {id:4,nome:"Maria Costa",cargo:"Operador POS",salario:1200,dataAdmissao:"2024-01-10",ativo:1,nivelAcesso:"FUNCIONARIO",email:"maria@vinhadouro.pt"},
  ],
  vendas:[
    {id:1,codigo:"VD-0001",cliente:"Carlos Mendes",produto:"Barca Velha",metodoPagamento:"Cartão",total:185.00,status:"CONCLUIDA",dataVenda:"2026-03-20 14:23"},
    {id:2,codigo:"VD-0002",cliente:"Ana Pereira",produto:"Quinta do Crasto",metodoPagamento:"MB Way",total:65.00,status:"CONCLUIDA",dataVenda:"2026-03-20 15:10"},
    {id:3,codigo:"VD-0003",cliente:"Miguel Santos",produto:"Esporão Reserva",metodoPagamento:"Numerário",total:37.80,status:"CONCLUIDA",dataVenda:"2026-03-19 11:45"},
    {id:4,codigo:"VD-0004",cliente:"Inês Ferreira",produto:"Alvarinho Soalheiro",metodoPagamento:"Cartão",total:29.80,status:"CONCLUIDA",dataVenda:"2026-03-19 16:30"},
    {id:5,codigo:"VD-0005",cliente:"Pedro Nunes",produto:"Luís Pato",metodoPagamento:"Cartão",total:57.00,status:"CONCLUIDA",dataVenda:"2026-03-18 10:15"},
    {id:6,codigo:"VD-0006",cliente:"Carla Gomes",produto:"Niepoort Rosé",metodoPagamento:"MB Way",total:44.00,status:"CONCLUIDA",dataVenda:"2026-03-17 13:20"},
    {id:7,codigo:"VD-0007",cliente:"Rui Costa",produto:"Palhete Verde",metodoPagamento:"Cartão",total:19.00,status:"CONCLUIDA",dataVenda:"2026-03-16 09:05"},
    {id:8,codigo:"VD-0008",cliente:"Lídia Marques",produto:"Graham's Porto",metodoPagamento:"Numerário",total:18.50,status:"CONCLUIDA",dataVenda:"2026-03-15 17:40"},
  ],
  dashboard:{
    receitaTotal:466.10,vendas:8,lucroLiquido:158.47,ticketMedio:58.26,
    stockCritico:2,valorStock:8391.21,
    vendasSemanais:[44,0,19,57,37.8,65,185],
    vendasLabels:["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"],
  }
};

/* ──────────────────────────────────────────────
   DASHBOARD
   ──────────────────────────────────────────── */
async function loadDashboard() {
  await checkApi();
  let data; try { data=await apiFetch('/dashboard'); } catch { data=FALLBACK.dashboard; }
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('kpi-receita',fmt.eur(data.receitaTotal));
  set('kpi-vendas', data.vendas);
  set('kpi-lucro',  fmt.eur(data.lucroLiquido));
  set('kpi-ticket', fmt.eur(data.ticketMedio));
  set('kpi-critico',data.stockCritico);
  set('kpi-stock',  fmt.eur(data.valorStock));
  drawBarChart('chart-vendas', data.vendasLabels||['Seg','Ter','Qua','Qui','Sex','Sáb','Hj'], data.vendasSemanais||[0,0,0,0,0,0,0], '#C9A227');
  drawLineChart('chart-receita',['Jan','Fev','Mar','Abr','Mai','Jun'],[120,185,240,180,310,420],'#A83D4A');

  // Recent sales
  let vendas; try { vendas=await apiFetch('/vendas'); } catch { vendas=FALLBACK.vendas; }
  renderVendasTable(document.getElementById('vendas-table'), vendas.slice(0,6));

  // Top wines + stock alerts
  let vinhos; try { vinhos=await apiFetch('/vinhos'); } catch { vinhos=FALLBACK.vinhos; }

  // Top wines by inventory value
  const topWinesTbody = document.getElementById('dash-top-wines');
  if(topWinesTbody) {
    const sorted=[...vinhos].sort((a,b)=>(b.preco*b.quantidade)-(a.preco*a.quantidade)).slice(0,5);
    const typeDot = {Tinto:'tinto',Branco:'branco','Rosé':'rosé',Espumante:'espumante',Porto:'porto'};
    topWinesTbody.innerHTML = sorted.map((v,i)=>`<tr>
      <td><span style="font-size:11px;color:var(--text-muted);margin-right:6px;font-family:var(--font-display);">${i+1}</span><span style="font-weight:600;font-size:13px;">${v.nome}</span></td>
      <td><span class="badge badge-muted" style="font-size:10px;">${v.tipo||'—'}</span></td>
      <td><span style="font-family:var(--font-display);font-size:13px;font-weight:700;color:var(--text-gold);">${fmt.eur(v.preco)}</span></td>
      <td>${stockBar(v.quantidade||0,100)}</td>
    </tr>`).join('');
  }

  // Stock alerts
  const alertsEl = document.getElementById('dash-stock-alerts');
  if(alertsEl) {
    const critical = vinhos.filter(v=>(v.quantidade||0)<10).sort((a,b)=>(a.quantidade||0)-(b.quantidade||0));
    if(!critical.length) {
      alertsEl.innerHTML=`<div style="display:flex;align-items:center;gap:10px;padding:14px;background:var(--success-bg);border:1px solid var(--success-border);border-radius:var(--r-md);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span style="font-size:13px;color:var(--success);">Todos os vinhos com stock adequado</span></div>`;
    } else {
      alertsEl.innerHTML = critical.slice(0,6).map(v=>{
        const qty=v.quantidade||0;
        const cls=qty===0?'danger':'warning';
        const icon=qty===0?'<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>':'<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/>';
        return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-subtle);">
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--${cls})" stroke-width="2">${icon}</svg>
            <span style="font-size:13px;font-weight:500;">${v.nome}</span>
          </div>
          <span class="badge badge-${cls}" style="font-size:11px;">${qty===0?'Esgotado':`${qty} un.`}</span>
        </div>`;
      }).join('');
    }
  }
}

/* ──────────────────────────────────────────────
   VENDAS
   ──────────────────────────────────────────── */
let allVendas=[];

async function loadVendas() {
  await checkApi();
  try { allVendas=await apiFetch('/vendas'); } catch { allVendas=FALLBACK.vendas; }
  filterVendas();
  const el=document.getElementById('vendas-count'); if(el) el.textContent=`${allVendas.length} transação(ões) registada(s)`;
}

function filterVendas() {
  const q=(document.getElementById('vendas-search')?.value||'').toLowerCase();
  const e=document.getElementById('estado-filter')?.value||'';
  const f=allVendas.filter(v=>{
    const txt=`${v.codigo||''} ${v.cliente||''} ${v.produto||''}`.toLowerCase();
    return txt.includes(q)&&(!e||v.status===e||v.estado===e);
  });
  renderVendasTable(document.getElementById('vendas-table'),f);
}

function renderVendasTable(tbody, vendas) {
  if(!tbody) return;
  if(!vendas||!vendas.length){
    tbody.innerHTML=`<tr><td colspan="7" style="text-align:center;padding:50px;color:var(--text-muted);">Nenhuma venda encontrada</td></tr>`;
    return;
  }
  tbody.innerHTML=vendas.map(v=>`
    <tr>
      <td><span style="font-family:var(--font-display);font-size:13px;color:var(--text-gold);font-weight:600;">${v.codigo||`VD-${String(v.id).padStart(4,'0')}`}</span></td>
      <td>${v.cliente||'—'}</td>
      <td class="muted" style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${v.produto||'—'}</td>
      <td class="muted">${v.metodoPagamento||'—'}</td>
      <td><span style="font-family:var(--font-display);font-weight:700;">${fmt.eur(v.total)}</span></td>
      <td>${statusBadge(v.status||v.estado)}</td>
      <td class="muted">${fmt.dt(v.dataVenda)}</td>
    </tr>`).join('');
}

/* ──────────────────────────────────────────────
   STOCK
   ──────────────────────────────────────────── */
let allVinhos=[];

async function loadStock() {
  await checkApi();
  try { allVinhos=await apiFetch('/vinhos'); } catch { allVinhos=FALLBACK.vinhos; }
  renderStock(); updateStockStats();
}

function updateStockStats() {
  const total=allVinhos.length;
  const units=allVinhos.reduce((s,v)=>s+(v.quantidade||0),0);
  const crit =allVinhos.filter(v=>(v.quantidade||0)<10).length;
  const valor=allVinhos.reduce((s,v)=>s+(v.preco||0)*(v.quantidade||0),0);
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('stat-total',total); set('stat-units',fmt.num(units));
  set('stat-critico',crit); set('stat-valor',fmt.eur(valor));
  const c=document.getElementById('table-count'); if(c) c.textContent=`${total} referência(s) · ${fmt.num(units)} unidades`;
}

function renderStock() {
  const tbody=document.getElementById('stock-table'); if(!tbody) return;
  const q=(document.getElementById('stock-search')?.value||'').toLowerCase();
  const t=document.getElementById('tipo-filter')?.value||'';
  const list=allVinhos.filter(v=>{
    const txt=`${v.nome||''} ${v.regiao||''} ${v.produtor||''}`.toLowerCase();
    return txt.includes(q)&&(!t||v.tipo===t);
  });
  if(!list.length){tbody.innerHTML=`<tr><td colspan="9" style="text-align:center;padding:50px;color:var(--text-muted);">Nenhum vinho encontrado</td></tr>`;return;}
  const maxQ=Math.max(...allVinhos.map(v=>v.quantidade||0),100);
  const typeDots={Tinto:'tinto',Branco:'branco','Rosé':'rosé',Espumante:'espumante'};
  tbody.innerHTML=list.map(v=>{
    const qty=v.quantidade||0;
    let sc='badge-success',st='Disponível';
    if(qty===0){sc='badge-danger';st='Esgotado';}
    else if(qty<10){sc='badge-danger';st='Crítico';}
    else if(qty<25){sc='badge-warning';st='Baixo';}
    return `<tr>
      <td><div style="display:flex;align-items:center;gap:8px;"><span class="wine-type-dot ${typeDots[v.tipo]||''}" style="position:static;"></span><span style="font-weight:600;">${v.nome}</span></div></td>
      <td class="muted">${v.tipo||'—'}</td>
      <td class="muted">${v.regiao||'—'}</td>
      <td class="muted">${v.produtor||'—'}</td>
      <td class="muted">${v.anoColheita||'—'}</td>
      <td><span style="font-family:var(--font-display);font-weight:700;color:var(--text-gold);">${fmt.eur(v.preco)}</span></td>
      <td style="min-width:130px;">${stockBar(qty,maxQ)}</td>
      <td><span class="badge ${sc}">${st}</span></td>
      <td><div style="display:flex;gap:5px;">
        <button class="btn btn-secondary btn-sm btn-icon" onclick="openEditModal(${v.id})" title="Editar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="btn btn-secondary btn-sm btn-icon" onclick="openStockModal(${v.id})" title="Stock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg></button>
      </div></td>
    </tr>`;
  }).join('');
}

function openAddModal(){
  document.getElementById('modal-title').textContent='Adicionar Vinho';
  document.getElementById('wine-id').value='';
  ['wine-nome','wine-regiao','wine-produtor','wine-ano','wine-preco','wine-qty'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('wine-modal')?.classList.add('open');
}
function openEditModal(id){
  const v=allVinhos.find(x=>x.id===id);if(!v)return;
  document.getElementById('modal-title').textContent='Editar Vinho';
  document.getElementById('wine-id').value=id;
  const set=(id,val)=>{const el=document.getElementById(id);if(el)el.value=val||'';};
  set('wine-nome',v.nome);set('wine-regiao',v.regiao);set('wine-produtor',v.produtor);
  set('wine-ano',v.anoColheita);set('wine-preco',v.preco);set('wine-qty',v.quantidade);
  const s=document.getElementById('wine-tipo');if(s)s.value=v.tipo||'Tinto';
  document.getElementById('wine-modal')?.classList.add('open');
}
function closeModal(){document.getElementById('wine-modal')?.classList.remove('open');}
async function saveWine(){
  const id=document.getElementById('wine-id')?.value;
  const body={nome:document.getElementById('wine-nome')?.value,tipo:document.getElementById('wine-tipo')?.value,regiao:document.getElementById('wine-regiao')?.value,produtor:document.getElementById('wine-produtor')?.value,anoColheita:+document.getElementById('wine-ano')?.value||0,preco:+document.getElementById('wine-preco')?.value||0,quantidade:+document.getElementById('wine-qty')?.value||0};
  if(!body.nome){toast('Preencha o nome','error');return;}
  try{
    if(id){await apiFetch(`/vinhos/${id}`,{method:'PUT',body:JSON.stringify(body)});toast('Vinho atualizado');}
    else   {await apiFetch('/vinhos',{method:'POST',body:JSON.stringify(body)});toast('Vinho adicionado');}
    closeModal();loadStock();
  }catch{
    if(id){const i=allVinhos.findIndex(v=>v.id===+id);if(i>=0)allVinhos[i]={...allVinhos[i],...body};}
    else{allVinhos.push({id:Date.now(),...body});}
    toast('Guardado (modo demo)');closeModal();renderStock();updateStockStats();
  }
}

function openStockModal(id){
  const v=allVinhos.find(x=>x.id===id);if(!v)return;
  document.getElementById('stock-wine-id').value=id;
  const n=document.getElementById('stock-wine-name');if(n)n.textContent=v.nome;
  const c=document.getElementById('stock-current');if(c)c.textContent=v.quantidade||0;
  const q=document.getElementById('stock-qty');if(q)q.value=v.quantidade||0;
  document.getElementById('stock-modal')?.classList.add('open');
}
function closeStockModal(){document.getElementById('stock-modal')?.classList.remove('open');}
async function saveStock(){
  const id=document.getElementById('stock-wine-id')?.value;
  const qty=+document.getElementById('stock-qty')?.value||0;
  try{await apiFetch(`/vinhos/${id}/stock`,{method:'PUT',body:JSON.stringify({quantidade:qty})});toast('Stock atualizado');}
  catch{const v=allVinhos.find(x=>x.id===+id);if(v)v.quantidade=qty;toast('Stock atualizado (modo demo)');}
  closeStockModal();loadStock();
}

/* ──────────────────────────────────────────────
   WINE BOTTLE SVG ART — per type illustration
   ──────────────────────────────────────────── */
function wineBottleSVG(tipo) {
  // Color schemes per type
  const C = {
    Tinto:     { b1:'#38141C', b2:'#120408', f1:'#C8382A', f2:'#7D1E24', l:'rgba(100,16,22,0.92)', ltr:'T', shape:'bordeaux', glw:'rgba(175,30,45,0.3)'  },
    Branco:    { b1:'#1C3A10', b2:'#0A1A06', f1:'#D4A825', f2:'#9A6E10', l:'rgba(28,58,16,0.92)',  ltr:'B', shape:'burgundy', glw:'rgba(180,148,30,0.25)' },
    'Rosé':    { b1:'#561825', b2:'#20080D', f1:'#ECA8BC', f2:'#C46885', l:'rgba(86,24,37,0.92)',  ltr:'R', shape:'slim',     glw:'rgba(196,104,133,0.3)' },
    Espumante: { b1:'#0C2016', b2:'#050C08', f1:'#D4A825', f2:'#9A6E10', l:'rgba(12,32,22,0.92)', ltr:'E', shape:'champagne',glw:'rgba(180,148,30,0.28)' },
    Porto:     { b1:'#260C06', b2:'#0E0402', f1:'#9E2616', f2:'#621408', l:'rgba(38,12,6,0.92)',   ltr:'P', shape:'port',     glw:'rgba(158,38,22,0.3)'  },
  };
  const c = C[tipo] || C.Tinto;
  const uid = 'b' + (tipo||'').replace(/[^a-zA-Z]/g,'');

  // Per-shape dimensions (viewBox: 0 0 80 164)
  const shapes = {
    bordeaux:  { bx:22,bw:36,by:62,nxw:[34,12],ny:18,
                 shoulder:'M 22,64 L 34,50 L 46,50 L 58,64 Z' },
    burgundy:  { bx:20,bw:40,by:64,nxw:[34,12],ny:18,
                 shoulder:'M 20,66 C 20,54 34,50 34,50 L 46,50 C 46,50 60,54 60,66 Z' },
    slim:      { bx:27,bw:26,by:62,nxw:[36,8], ny:18,
                 shoulder:'M 27,64 C 27,54 36,50 36,50 L 44,50 C 44,50 53,54 53,64 Z' },
    champagne: { bx:18,bw:44,by:68,nxw:[33,14],ny:16,
                 shoulder:'M 18,70 C 18,56 33,50 33,50 L 47,50 C 47,50 62,56 62,70 Z' },
    port:      { bx:22,bw:36,by:56,nxw:[34,12],ny:18,
                 shoulder:'M 22,58 L 34,48 L 46,48 L 58,58 Z' },
  };
  const s = shapes[c.shape] || shapes.bordeaux;
  const [nx, nw] = s.nxw;
  const bodyBot = 150;
  const labelY = s.by + 18;

  return `<svg viewBox="0 0 80 164" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="${uid}body" x1="0.1" y1="0" x2="0.9" y2="0">
    <stop offset="0%" stop-color="${c.b2}"/>
    <stop offset="28%" stop-color="${c.b1}"/>
    <stop offset="72%" stop-color="${c.b1}"/>
    <stop offset="100%" stop-color="${c.b2}"/>
  </linearGradient>
  <linearGradient id="${uid}foil" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${c.f1}"/>
    <stop offset="100%" stop-color="${c.f2}"/>
  </linearGradient>
  <linearGradient id="${uid}shin" x1="0.15" y1="0" x2="0.55" y2="1">
    <stop offset="0%" stop-color="rgba(255,255,255,0.2)"/>
    <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
  </linearGradient>
  <radialGradient id="${uid}glow" cx="50%" cy="55%" r="50%">
    <stop offset="0%" stop-color="${c.glw}"/>
    <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
  </radialGradient>
  <filter id="${uid}shadow">
    <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.5)"/>
  </filter>
</defs>
<!-- Ambient glow -->
<ellipse cx="40" cy="95" rx="36" ry="52" fill="url(#${uid}glow)"/>
<!-- Neck -->
<rect x="${nx}" y="${s.ny}" width="${nw}" height="${s.by - s.ny + 4}" rx="3" fill="url(#${uid}body)" filter="url(#${uid}shadow)"/>
<!-- Shoulder -->
<path d="${s.shoulder}" fill="url(#${uid}body)"/>
<!-- Body -->
<rect x="${s.bx}" y="${s.by}" width="${s.bw}" height="${bodyBot - s.by}" rx="7" fill="url(#${uid}body)" filter="url(#${uid}shadow)"/>
<!-- Foil/Capsule -->
<rect x="${nx - 1}" y="${s.ny}" width="${nw + 2}" height="20" rx="3" fill="url(#${uid}foil)"/>
<!-- Foil bottom ring -->
<rect x="${nx - 1}" y="${s.ny + 18}" width="${nw + 2}" height="2.5" rx="0" fill="${c.f2}" opacity="0.8"/>
<!-- Cork -->
<rect x="${nx + 2}" y="${s.ny - 11}" width="${nw - 4}" height="13" rx="2" fill="#9B7A50"/>
<!-- Cork top -->
<rect x="${nx + 3}" y="${s.ny - 12}" width="${nw - 6}" height="3" rx="1" fill="#B89060"/>
<!-- Body shine (left edge highlight) -->
<rect x="${s.bx + 3}" y="${s.by + 2}" width="${Math.floor(s.bw * 0.2)}" height="${bodyBot - s.by - 10}" rx="3" fill="url(#${uid}shin)"/>
<!-- Label -->
<rect x="${s.bx + 4}" y="${labelY}" width="${s.bw - 8}" height="36" rx="3" fill="${c.l}"/>
<line x1="${s.bx + 8}" y1="${labelY + 7}" x2="${s.bx + s.bw - 12}" y2="${labelY + 7}" stroke="rgba(201,162,39,0.55)" stroke-width="0.75"/>
<text x="40" y="${labelY + 22}" font-family="Georgia,serif" font-size="13" font-weight="700" fill="rgba(255,238,200,0.95)" text-anchor="middle">${c.ltr}</text>
<line x1="${s.bx + 8}" y1="${labelY + 29}" x2="${s.bx + s.bw - 12}" y2="${labelY + 29}" stroke="rgba(201,162,39,0.55)" stroke-width="0.75"/>
<!-- Base punt shadow -->
<ellipse cx="40" cy="${bodyBot + 1}" rx="${Math.floor(s.bw / 2) - 2}" ry="3.5" fill="rgba(0,0,0,0.4)"/>
</svg>`;
}

/* ──────────────────────────────────────────────
   POS
   ──────────────────────────────────────────── */
let catalog=[], cart=[], payMethod='Cartão';

const wineTypeClass = { Tinto:'tinto', Branco:'branco', 'Rosé':'rose', Espumante:'espumante', Porto:'porto' };

async function loadPOS(){
  await checkApi();
  try{catalog=await apiFetch('/vinhos');}catch{catalog=FALLBACK.vinhos;}
  renderCatalog();
  document.querySelectorAll('.filter-btn').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');renderCatalog(btn.dataset.filter);
  }));
  document.getElementById('wine-search')?.addEventListener('input',()=>renderCatalog(document.querySelector('.filter-btn.active')?.dataset.filter||'todos'));
  document.querySelectorAll('.pay-method').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.pay-method').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');payMethod=btn.dataset.method;
  }));
}

function renderCatalog(filter='todos'){
  const grid=document.getElementById('wine-grid');if(!grid)return;
  const q=(document.getElementById('wine-search')?.value||'').toLowerCase();
  const list=catalog.filter(v=>(`${v.nome||''} ${v.regiao||''} ${v.produtor||''}`.toLowerCase()).includes(q)&&(filter==='todos'||v.tipo===filter));
  if(!list.length){grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted);">Nenhum vinho encontrado</div>`;return;}
  grid.innerHTML=list.map(v=>{
    const oos=(v.quantidade||0)===0;
    const tc = wineTypeClass[v.tipo]||'tinto';
    const producer = (v.produtor||'').length > 20 ? (v.produtor||'').slice(0,18)+'…' : (v.produtor||'');
    return `<div class="wine-card wine-card-${tc}${oos?' out-of-stock':''}" onclick="${oos?'void(0)':` addToCart(${v.id})`}">
      <div class="wine-card-visual">
        ${wineBottleSVG(v.tipo)}
        ${v.anoColheita?`<div class="wine-vintage-badge">${v.anoColheita}</div>`:''}
        <div class="wine-type-pill">${v.tipo||''}</div>
      </div>
      <div class="wine-card-body">
        <div class="wine-card-name">${v.nome}</div>
        <div class="wine-card-meta">${v.regiao||''}${producer?` · ${producer}`:''}</div>
        <div class="wine-card-footer">
          <span class="wine-card-price">${fmt.eur(v.preco)}</span>
          <span class="wine-card-stock${oos?' oos':''}">${oos?'Esgotado':`${v.quantidade} un.`}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ──────────────────────────────────────────────
   BOTTLE SIZE SELECTOR
   ──────────────────────────────────────────── */
const BOTTLE_SIZES = [
  { vol:'0.375L', nome:'Meia Garrafa',     mult:0.55,  desc:'375 ml' },
  { vol:'0.75L',  nome:'Garrafa Standard', mult:1.0,   desc:'750 ml · Padrão' },
  { vol:'1.5L',   nome:'Magnum',           mult:2.15,  desc:'1 500 ml' },
  { vol:'3.0L',   nome:'Double Magnum',    mult:4.4,   desc:'3 000 ml' },
];

function addToCart(id){
  const v=catalog.find(x=>x.id===id);if(!v||(v.quantidade||0)===0)return;
  document.getElementById('size-wine-name').textContent=v.nome;
  const opts=document.getElementById('size-options');
  opts.innerHTML=BOTTLE_SIZES.map(s=>`
    <button class="size-option-btn" onclick="addToCartWithSize(${id},'${s.vol}','${s.nome}',${s.mult});closeSizeModal()">
      <div class="size-option-vol">${s.vol}</div>
      <div class="size-option-name">${s.nome}</div>
      <div class="size-option-desc">${s.desc}</div>
      <div class="size-option-price">${fmt.eur(v.preco*s.mult)}</div>
    </button>`).join('');
  document.getElementById('size-modal')?.classList.add('open');
}
function closeSizeModal(){document.getElementById('size-modal')?.classList.remove('open');}

function addToCartWithSize(id,vol,nomeTamanho,mult){
  const v=catalog.find(x=>x.id===id);if(!v)return;
  const cartKey=`${id}_${vol}`;
  const ex=cart.find(c=>c.cartKey===cartKey);
  const preco=+(v.preco*mult).toFixed(2);
  if(ex){if(ex.qty>=(v.quantidade||0)){toast('Stock insuficiente','warning');return;}ex.qty++;}
  else{cart.push({cartKey,id,nome:v.nome,vol,nomeTamanho,preco,qty:1});}
  toast(`${v.nome} (${vol}) adicionado`,'success',2000);
  renderCart();
}
function removeFromCart(i){cart.splice(i,1);renderCart();}
function updateQty(i,d){cart[i].qty+=d;if(cart[i].qty<=0)cart.splice(i,1);renderCart();}
function clearCart(){cart=[];renderCart();}

function renderCart(){
  const c=document.getElementById('cart-items');if(!c)return;
  const empty=document.getElementById('cart-empty');
  const btn=document.getElementById('checkout-btn');
  const cnt=document.getElementById('cart-count');
  if(!cart.length){
    if(empty)empty.style.display='flex';if(btn)btn.disabled=true;if(cnt)cnt.textContent='0';
    Array.from(c.children).forEach(el=>{if(el.id!=='cart-empty')el.remove();});
    updateTotals(0);return;
  }
  if(empty)empty.style.display='none';if(btn)btn.disabled=false;
  if(cnt)cnt.textContent=cart.reduce((s,x)=>s+x.qty,0);
  Array.from(c.children).forEach(el=>{if(el.id!=='cart-empty')el.remove();});
  cart.forEach((item,i)=>{
    const div=document.createElement('div');div.className='cart-item';
    const sizeTag=item.vol?`<span style="font-size:10px;background:var(--bg-elevated);color:var(--text-muted);padding:1px 6px;border-radius:10px;margin-left:4px;">${item.vol}</span>`:'';
    div.innerHTML=`<div class="cart-item-info"><div class="cart-item-name">${item.nome}${sizeTag}</div><div class="cart-item-price">${fmt.eur(item.preco*item.qty)}</div></div><div class="cart-item-qty"><button class="qty-btn" onclick="updateQty(${i},-1)">−</button><span class="qty-num">${item.qty}</span><button class="qty-btn" onclick="updateQty(${i},1)">+</button></div><button class="cart-item-remove" onclick="removeFromCart(${i})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`;
    c.appendChild(div);
  });
  updateTotals(cart.reduce((s,x)=>s+x.preco*x.qty,0));
}
function updateTotals(sub){
  const iva=sub*0.23,tot=sub+iva;
  const s=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=fmt.eur(v);};
  s('cart-subtotal',sub);s('cart-iva',iva);s('cart-total',tot);
}

/* ──────────────────────────────────────────────
   ENHANCED CHECKOUT MODAL
   ──────────────────────────────────────────── */
function checkout(){
  if(!cart.length)return;
  // Populate checkout modal
  const coItems=document.getElementById('co-items');
  if(coItems){
    coItems.innerHTML=cart.map(item=>`
      <div class="checkout-item-row">
        <span class="ci-name">${item.nome}</span>
        ${item.vol?`<span class="ci-size">${item.vol}</span>`:''}
        <span style="font-size:12px;color:var(--text-muted);margin-right:6px;">×${item.qty}</span>
        <span class="ci-price">${fmt.eur(item.preco*item.qty)}</span>
      </div>`).join('');
  }
  // Reset discount
  const disc=document.getElementById('co-discount');if(disc)disc.value='0';
  // Show payment method
  const payIcons={Cartão:'<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',Numerário:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>','MB Way':'<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>'};
  const payEl=document.getElementById('co-pay-display');
  if(payEl) payEl.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">${payIcons[payMethod]||payIcons.Cartão}</svg>${payMethod}`;
  // Show/hide payment-specific panels
  document.getElementById('co-cash-panel')?.style.display=payMethod==='Numerário'?'block':'none';
  document.getElementById('co-mbway-panel')?.style.display=payMethod==='MB Way'?'block':'none';
  document.getElementById('co-card-panel')?.style.display=payMethod==='Cartão'?'block':'none';
  // Update totals
  updateCoTotals();
  document.getElementById('checkout-modal')?.classList.add('open');
}
function closeCheckoutModal(){document.getElementById('checkout-modal')?.classList.remove('open');}

function updateCoTotals(){
  const sub=cart.reduce((s,x)=>s+x.preco*x.qty,0);
  const discPct=Math.min(100,Math.max(0,+(document.getElementById('co-discount')?.value||0)));
  const discAmt=sub*(discPct/100);
  const afterDisc=sub-discAmt;
  const iva=afterDisc*0.23;
  const tot=afterDisc+iva;
  const s=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  s('co-subtotal',fmt.eur(sub));
  s('co-iva',fmt.eur(iva));
  s('co-total',fmt.eur(tot));
  const dl=document.getElementById('co-discount-line');
  const dv=document.getElementById('co-discount-val');
  if(dl&&dv){dl.style.display=discPct>0?'flex':'none';dv.textContent=`−${fmt.eur(discAmt)} (${discPct}%)`;}
}

function calcTroco(){
  const sub=cart.reduce((s,x)=>s+x.preco*x.qty,0);
  const discPct=+(document.getElementById('co-discount')?.value||0);
  const afterDisc=sub*(1-discPct/100);
  const tot=afterDisc*1.23;
  const rec=+(document.getElementById('co-cash-received')?.value||0);
  const troco=rec-tot;
  const el=document.getElementById('co-troco');
  if(!el)return;
  if(rec>0){
    el.style.display='block';
    if(troco>=0){el.style.background='var(--success-bg)';el.style.borderColor='var(--success-border)';el.style.color='var(--success)';el.textContent=`Troco: ${fmt.eur(troco)}`;}
    else{el.style.background='var(--danger-bg)';el.style.borderColor='var(--danger-border)';el.style.color='var(--danger)';el.textContent=`Faltam: ${fmt.eur(-troco)}`;}
  } else {el.style.display='none';}
}

async function processPayment(){
  if(!cart.length)return;
  const btn=document.getElementById('process-btn');
  if(btn){btn.disabled=true;btn.innerHTML='<span>A processar...</span>';}
  const sub=cart.reduce((s,x)=>s+x.preco*x.qty,0);
  const discPct=Math.min(100,Math.max(0,+(document.getElementById('co-discount')?.value||0)));
  const discAmt=sub*(discPct/100);
  const afterDisc=sub-discAmt;
  const iva=afterDisc*0.23;
  const tot=afterDisc+iva;
  const nif=document.getElementById('co-nif')?.value||'';
  const notas=document.getElementById('co-notes')?.value||'';
  const itens=cart.map(c=>({vinhoId:c.id,quantidade:c.qty,formato:c.vol||'0.75L',precUnit:c.preco}));

  // Generate receipt code
  const code='VD-'+Date.now().toString(36).toUpperCase().slice(-6);
  const now=new Date();

  try{
    const user=Session.get();
    await apiFetch('/vendas',{method:'POST',body:JSON.stringify({itens,metodoPagamento:payMethod,funcionarioId:user?.id||1,desconto:discPct,nif,notas})});
  }catch{
    itens.forEach(item=>{const v=catalog.find(x=>x.id===item.vinhoId);if(v)v.quantidade=Math.max(0,(v.quantidade||0)-item.quantidade);});
  }

  // Build receipt
  const receiptEl=document.getElementById('receipt-content');
  if(receiptEl){
    const lines=cart.map(item=>`<div class="receipt-line"><span>${item.nome}${item.vol?' ('+item.vol+')':''} ×${item.qty}</span><span>${fmt.eur(item.preco*item.qty)}</span></div>`).join('');
    receiptEl.innerHTML=`
      <div class="receipt-header">
        <div style="font-family:var(--font-display);font-size:16px;font-weight:700;color:var(--text-gold);">Vinha D'Ouro</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${now.toLocaleString('pt-PT')}</div>
        <div style="font-size:11px;color:var(--text-muted);">Ref: ${code}${nif?' · NIF: '+nif:''}</div>
      </div>
      ${lines}
      <div class="receipt-divider"></div>
      ${discPct>0?`<div class="receipt-line"><span style="color:var(--success);">Desconto (${discPct}%)</span><span style="color:var(--success);">−${fmt.eur(discAmt)}</span></div>`:''}
      <div class="receipt-line"><span>IVA 23%</span><span>${fmt.eur(iva)}</span></div>
      <div class="receipt-divider"></div>
      <div class="receipt-total-line"><span>TOTAL</span><span>${fmt.eur(tot)}</span></div>
      <div style="text-align:center;margin-top:8px;font-size:11px;color:var(--text-muted);">Pagamento: ${payMethod}</div>
    `;
  }
  const sub2=document.getElementById('receipt-subtitle');
  if(sub2)sub2.textContent=`${cart.length} artigo(s) · IVA incluído · ${payMethod}`;

  closeCheckoutModal();
  clearCart();
  renderCatalog(document.querySelector('.filter-btn.active')?.dataset.filter||'todos');
  document.getElementById('receipt-modal')?.classList.add('open');
  if(btn){btn.disabled=false;btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>Confirmar Pagamento';}
}

function closeReceiptAndReset(){
  document.getElementById('receipt-modal')?.classList.remove('open');
}

/* ──────────────────────────────────────────────
   EQUIPA
   ──────────────────────────────────────────── */
let allFuncs=[];

async function loadEquipa(){
  await checkApi();
  try{allFuncs=await apiFetch('/funcionarios');}catch{allFuncs=FALLBACK.funcionarios;}
  renderEquipa();
}
function renderEquipa(){
  const g=document.getElementById('team-grid');if(!g)return;
  if(!allFuncs.length){g.innerHTML='<div style="text-align:center;padding:60px;color:var(--text-muted);">Sem funcionários</div>';return;}
  const ini=n=>n?n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase():'?';
  g.innerHTML=allFuncs.map(f=>{
    const nome=f.nome||(f.pessoa&&f.pessoa.nome)||'—';
    const email=f.email||(f.pessoa&&f.pessoa.email)||'';
    return `<div class="team-card">
      <div style="display:flex;align-items:center;gap:var(--sp-4);margin-bottom:var(--sp-4);">
        <div class="team-avatar">${ini(nome)}</div>
        <div><div style="font-weight:700;font-size:15px;">${nome}</div><div style="font-size:12px;color:var(--text-muted);">${email}</div></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:var(--sp-2);">
        <div style="display:flex;justify-content:space-between;"><span style="font-size:12px;color:var(--text-muted);">Cargo</span><span style="font-size:13px;font-weight:600;">${f.cargo||'—'}</span></div>
        <div style="display:flex;justify-content:space-between;"><span style="font-size:12px;color:var(--text-muted);">Salário</span><span style="font-family:var(--font-display);font-size:13px;font-weight:700;color:var(--text-gold);">${fmt.eur(f.salario)}</span></div>
        <div style="display:flex;justify-content:space-between;"><span style="font-size:12px;color:var(--text-muted);">Admissão</span><span style="font-size:12px;color:var(--text-secondary);">${fmt.date(f.dataAdmissao)}</span></div>
        <div style="display:flex;justify-content:space-between;margin-top:4px;">${statusBadge(f.nivelAcesso)}${f.ativo===1||f.ativo===true?'<span class="badge badge-success">Ativo</span>':'<span class="badge badge-muted">Inativo</span>'}</div>
        <div style="display:flex;gap:6px;margin-top:var(--sp-2);">
          <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="openEditFuncModal(${f.id})">Editar</button>
        </div>
      </div>
    </div>`;
  }).join('');
}
function openAddFuncModal(){
  document.getElementById('func-modal-title').textContent='Novo Funcionário';
  document.getElementById('func-id').value='';
  ['func-nome','func-email','func-cargo','func-salario'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('func-modal')?.classList.add('open');
}
function openEditFuncModal(id){
  const f=allFuncs.find(x=>x.id===id);if(!f)return;
  document.getElementById('func-modal-title').textContent='Editar Funcionário';
  document.getElementById('func-id').value=id;
  const set=(eid,val)=>{const el=document.getElementById(eid);if(el)el.value=val||'';};
  const nome=f.nome||(f.pessoa&&f.pessoa.nome)||'';
  const email=f.email||(f.pessoa&&f.pessoa.email)||'';
  set('func-nome',nome);set('func-email',email);set('func-cargo',f.cargo);set('func-salario',f.salario);
  const nv=document.getElementById('func-nivel');if(nv)nv.value=f.nivelAcesso||'FUNCIONARIO';
  const av=document.getElementById('func-ativo');if(av)av.value=f.ativo?'1':'0';
  document.getElementById('func-modal')?.classList.add('open');
}
function closeFuncModal(){document.getElementById('func-modal')?.classList.remove('open');}
async function saveFuncionario(){
  const id=document.getElementById('func-id')?.value;
  const body={nome:document.getElementById('func-nome')?.value,email:document.getElementById('func-email')?.value,cargo:document.getElementById('func-cargo')?.value,salario:+document.getElementById('func-salario')?.value||0,nivelAcesso:document.getElementById('func-nivel')?.value||'FUNCIONARIO',ativo:+document.getElementById('func-ativo')?.value||1};
  if(!body.nome){toast('Preencha o nome','error');return;}
  try{
    if(id){await apiFetch(`/funcionarios/${id}`,{method:'PUT',body:JSON.stringify(body)});toast('Funcionário atualizado');}
    else   {await apiFetch('/funcionarios',{method:'POST',body:JSON.stringify(body)});toast('Funcionário adicionado');}
    closeFuncModal();loadEquipa();
  }catch{
    if(!id)allFuncs.push({id:Date.now(),...body});
    else{const i=allFuncs.findIndex(x=>x.id===+id);if(i>=0)allFuncs[i]={...allFuncs[i],...body};}
    toast('Guardado (modo demo)');closeFuncModal();renderEquipa();
  }
}

/* ──────────────────────────────────────────────
   RELATÓRIOS
   ──────────────────────────────────────────── */
async function loadRelatorios(){
  await checkApi();
  let dash;try{dash=await apiFetch('/dashboard');}catch{dash=FALLBACK.dashboard;}
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('r-receita',fmt.eur(dash.receitaTotal));set('r-lucro',fmt.eur(dash.lucroLiquido));
  set('r-ticket',fmt.eur(dash.ticketMedio));set('r-vendas',dash.vendas);
  drawBarChart('chart-vendas',dash.vendasLabels||['Seg','Ter','Qua','Qui','Sex','Sáb','Hj'],dash.vendasSemanais||[0,0,0,0,0,0,0],'#C9A227');
  drawLineChart('chart-receita',['Jan','Fev','Mar','Abr','Mai','Jun'],[120,185,240,180,310,420],'#A83D4A');
  let vinhos;try{vinhos=await apiFetch('/vinhos');}catch{vinhos=FALLBACK.vinhos;}
  const tbody=document.getElementById('top-wines-table');
  if(tbody){
    const sorted=[...vinhos].sort((a,b)=>(b.preco*b.quantidade)-(a.preco*a.quantidade)).slice(0,8);
    tbody.innerHTML=sorted.map(v=>`<tr>
      <td style="font-weight:600;">${v.nome}</td>
      <td class="muted">${v.tipo||'—'}</td>
      <td class="muted">${v.regiao||'—'}</td>
      <td><span style="font-family:var(--font-display);font-weight:700;color:var(--text-gold);">${fmt.eur(v.preco)}</span></td>
      <td>${stockBar(v.quantidade||0,100)}</td>
      <td><span style="font-family:var(--font-display);font-weight:700;">${fmt.eur((v.preco||0)*(v.quantidade||0))}</span></td>
    </tr>`).join('');
  }
}

/* ──────────────────────────────────────────────
   LOGIN PAGE INIT — inject login form
   ──────────────────────────────────────────── */
function initLogin(){
  const session=Session.get();
  if(session){window.location.href=session.redirect;return;}
  const roleGrid=document.querySelector('.role-grid');
  if(!roleGrid)return;
  roleGrid.style.gridTemplateColumns='1fr';
  roleGrid.innerHTML=`
    <div style="max-width:420px;margin:0 auto;width:100%;">
      <div class="card card-gold">
        <div class="card-body" style="padding:var(--sp-8);">
          <form id="login-form" onsubmit="handleLogin(event)" style="display:flex;flex-direction:column;gap:var(--sp-4);">
            <div class="form-group">
              <label class="form-label">Utilizador</label>
              <div class="input-icon-wrap">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input type="text" class="form-input" id="login-username" placeholder="gerente · loja · stock" autocomplete="username">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Senha</label>
              <div class="input-icon-wrap">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <input type="password" class="form-input" id="login-password" placeholder="••••••••" autocomplete="current-password">
              </div>
            </div>
            <div id="login-error" style="display:none;background:var(--danger-bg);border:1px solid var(--danger-border);border-radius:var(--r-md);padding:10px 14px;color:var(--danger);font-size:13px;gap:8px;align-items:center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span></span>
            </div>
            <button type="submit" class="btn btn-primary btn-lg w-full" id="login-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
              Entrar
            </button>
          </form>
          <div style="margin-top:var(--sp-5);padding-top:var(--sp-5);border-top:1px solid var(--border-subtle);">
            <p style="font-size:11.5px;color:var(--text-muted);text-align:center;margin-bottom:var(--sp-3);">Credenciais de demonstração:</p>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--sp-2);">
              <div onclick="fillLogin('gerente','1234')" style="cursor:pointer;background:rgba(201,162,39,0.06);border:1px solid var(--border-gold);border-radius:var(--r-md);padding:var(--sp-3);text-align:center;transition:background 0.2s;" onmouseover="this.style.background='rgba(201,162,39,0.14)'" onmouseout="this.style.background='rgba(201,162,39,0.06)'">
                <div style="font-size:12px;font-weight:700;color:var(--text-gold);">gerente</div>
                <div style="font-size:10px;color:var(--text-muted);">senha: 1234</div>
              </div>
              <div onclick="fillLogin('loja','1234')" style="cursor:pointer;background:var(--info-bg);border:1px solid var(--info-border);border-radius:var(--r-md);padding:var(--sp-3);text-align:center;transition:background 0.2s;" onmouseover="this.style.background='rgba(74,158,255,0.18)'" onmouseout="this.style.background='var(--info-bg)'">
                <div style="font-size:12px;font-weight:700;color:var(--info);">loja</div>
                <div style="font-size:10px;color:var(--text-muted);">senha: 1234</div>
              </div>
              <div onclick="fillLogin('stock','1234')" style="cursor:pointer;background:var(--success-bg);border:1px solid var(--success-border);border-radius:var(--r-md);padding:var(--sp-3);text-align:center;transition:background 0.2s;" onmouseover="this.style.background='rgba(46,204,107,0.18)'" onmouseout="this.style.background='var(--success-bg)'">
                <div style="font-size:12px;font-weight:700;color:var(--success);">stock</div>
                <div style="font-size:10px;color:var(--text-muted);">senha: 1234</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

/* ──────────────────────────────────────────────
   PROVAS DE VINHO
   ──────────────────────────────────────────── */
let allProvas=[], provaFilter='todas';

const FALLBACK_PROVAS=[
  {id:1,titulo:"Grandes Vinhos do Douro",descricao:"Uma viagem pelos melhores vinhos da região do Douro, desde os clássicos aos modernos.",dataHora:"2026-04-05T19:00",capacidade:16,inscritos:11,precoPorPessoa:35,estado:"AGENDADA",vinhos:"Barca Velha, Quinta do Crasto, Niepoort Redoma"},
  {id:2,titulo:"Espumantes & Champagnes",descricao:"Degustação comparativa entre espumantes portugueses e champagnes franceses.",dataHora:"2026-04-12T18:30",capacidade:12,inscritos:12,precoPorPessoa:55,estado:"AGENDADA",vinhos:"Espumante Vinha D'Ouro, Graham's"},
  {id:3,titulo:"Alentejo em Destaque",descricao:"Os melhores tintos e brancos da região alentejana numa prova temática.",dataHora:"2026-03-15T19:30",capacidade:20,inscritos:18,precoPorPessoa:28,estado:"CONCLUIDA",vinhos:"Esporão Reserva, Mouchão, Ravasqueira"},
  {id:4,titulo:"Provas de Porto & Moscatel",descricao:"Vinhos generosos portugueses, do Vintage ao Tawny, passando pelo Moscatel de Setúbal.",dataHora:"2026-05-03T17:00",capacidade:10,inscritos:4,precoPorPessoa:42,estado:"AGENDADA",vinhos:"Graham's LBV, Bacalhôa Moscatel"},
];

async function loadProvas(){
  await checkApi();
  try{allProvas=await apiFetch('/provas');}catch{allProvas=FALLBACK_PROVAS;}
  updateProvasStats();
  filterProvas(provaFilter);
}

function updateProvasStats(){
  const total=allProvas.length;
  const agendadas=allProvas.filter(p=>p.estado==='AGENDADA').length;
  const inscritos=allProvas.reduce((s,p)=>s+(p.inscritos||0),0);
  const receita=allProvas.reduce((s,p)=>s+(p.inscritos||0)*(p.precoPorPessoa||0),0);
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('pv-total',total);set('pv-agendadas',agendadas);set('pv-inscritos',inscritos);set('pv-receita',fmt.eur(receita));
}

function filterProvas(estado){
  provaFilter=estado;
  document.querySelectorAll('[id^="pv-filter-"]').forEach(b=>b.classList.remove('active'));
  document.getElementById(`pv-filter-${estado}`)?.classList.add('active');
  const list=estado==='todas'?allProvas:allProvas.filter(p=>p.estado===estado);
  const cnt=document.getElementById('pv-count');if(cnt)cnt.textContent=`${list.length} prova(s)`;
  renderProvas(list);
}

function renderProvas(list){
  const grid=document.getElementById('provas-grid');if(!grid)return;
  if(!list.length){grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted);">Nenhuma prova encontrada</div>`;return;}
  const estadoBadge={AGENDADA:'badge-info',EM_CURSO:'badge-success',CONCLUIDA:'badge-muted',CANCELADA:'badge-danger'};
  const estadoLabel={AGENDADA:'Agendada',EM_CURSO:'Em Curso',CONCLUIDA:'Concluída',CANCELADA:'Cancelada'};
  grid.innerHTML=list.map(p=>{
    const dt=p.dataHora?new Date(p.dataHora):null;
    const dtFmt=dt?dt.toLocaleString('pt-PT',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}):'Data não definida';
    const cap=p.capacidade||0,ins=p.inscritos||0;
    const pct=cap?Math.min(100,Math.round(ins/cap*100)):0;
    const vinhosList=(p.vinhos||'').split(',').map(w=>w.trim()).filter(Boolean);
    return `<div class="prova-card">
      <div class="prova-card-header">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
          <div>
            <div class="prova-card-date">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              ${dtFmt}
            </div>
            <div class="prova-card-title">${p.titulo||'Prova sem título'}</div>
          </div>
          <span class="badge ${estadoBadge[p.estado]||'badge-muted'}" style="flex-shrink:0;">${estadoLabel[p.estado]||p.estado}</span>
        </div>
        ${p.descricao?`<div class="prova-card-desc" style="margin-top:8px;">${p.descricao}</div>`:''}
      </div>
      <div class="prova-card-body">
        <div class="prova-stat-row">
          <div class="prova-stat"><div class="prova-stat-val">${ins}/${cap}</div><div class="prova-stat-lbl">Inscritos</div></div>
          <div class="prova-stat"><div class="prova-stat-val">${fmt.eur(p.precoPorPessoa||0)}</div><div class="prova-stat-lbl">/ Pessoa</div></div>
          <div class="prova-stat"><div class="prova-stat-val">${fmt.eur(ins*(p.precoPorPessoa||0))}</div><div class="prova-stat-lbl">Receita</div></div>
        </div>
        <!-- Occupation bar -->
        <div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:5px;"><span>Ocupação</span><span>${pct}%</span></div>
          <div style="background:var(--bg-raised);height:5px;border-radius:3px;overflow:hidden;"><div style="height:100%;width:${pct}%;background:${pct>=100?'var(--success)':pct>70?'var(--warning)':'var(--info)'};border-radius:3px;transition:width 0.5s;"></div></div>
        </div>
        ${vinhosList.length?`<div class="prova-wines-list">${vinhosList.map(w=>`<span class="prova-wine-tag">🍷 ${w}</span>`).join('')}</div>`:'' }
      </div>
      <div class="prova-card-footer">
        <button class="btn btn-secondary btn-sm" onclick="openEditProvaModal(${p.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Editar
        </button>
        <div style="display:flex;gap:6px;">
          ${p.estado==='AGENDADA'?`<button class="btn btn-secondary btn-sm" onclick="changeProvaEstado(${p.id},'EM_CURSO')">Iniciar</button>`:''}
          ${p.estado==='EM_CURSO'?`<button class="btn btn-secondary btn-sm" onclick="changeProvaEstado(${p.id},'CONCLUIDA')">Concluir</button>`:''}
          ${p.estado!=='CANCELADA'&&p.estado!=='CONCLUIDA'?`<button class="btn btn-ghost btn-sm" onclick="changeProvaEstado(${p.id},'CANCELADA')">Cancelar</button>`:''}
        </div>
      </div>
    </div>`;
  }).join('');
}

function openAddProvaModal(){
  document.getElementById('prova-modal-title').textContent='Nova Prova de Vinho';
  document.getElementById('prova-id').value='';
  ['prova-titulo','prova-descricao','prova-notas'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('prova-capacidade').value='10';
  document.getElementById('prova-inscritos').value='0';
  document.getElementById('prova-preco').value='0';
  document.getElementById('prova-estado').value='AGENDADA';
  const d=new Date();d.setDate(d.getDate()+7);d.setHours(19,0,0);
  document.getElementById('prova-data').value=d.toISOString().slice(0,16);
  populateProvaWines([]);
  document.getElementById('prova-modal')?.classList.add('open');
}
function openEditProvaModal(id){
  const p=allProvas.find(x=>x.id===id);if(!p)return;
  document.getElementById('prova-modal-title').textContent='Editar Prova';
  document.getElementById('prova-id').value=id;
  document.getElementById('prova-titulo').value=p.titulo||'';
  document.getElementById('prova-descricao').value=p.descricao||'';
  document.getElementById('prova-notas').value=p.notas||'';
  document.getElementById('prova-capacidade').value=p.capacidade||10;
  document.getElementById('prova-inscritos').value=p.inscritos||0;
  document.getElementById('prova-preco').value=p.precoPorPessoa||0;
  document.getElementById('prova-estado').value=p.estado||'AGENDADA';
  if(p.dataHora) document.getElementById('prova-data').value=p.dataHora.slice(0,16);
  const selWines=(p.vinhos||'').split(',').map(w=>w.trim());
  populateProvaWines(selWines);
  document.getElementById('prova-modal')?.classList.add('open');
}
function populateProvaWines(selected){
  const container=document.getElementById('prova-wine-checks');if(!container)return;
  const wines=allProvas._wineCache||FALLBACK.vinhos;
  container.innerHTML=wines.map(v=>`
    <label style="display:flex;align-items:center;gap:8px;font-size:12.5px;cursor:pointer;padding:4px;">
      <input type="checkbox" value="${v.nome}" ${selected.includes(v.nome)?'checked':''} style="accent-color:var(--accent-gold);">
      <span>${v.nome} <span style="color:var(--text-muted);font-size:10px;">(${v.tipo})</span></span>
    </label>`).join('');
}
function closeProvaModal(){document.getElementById('prova-modal')?.classList.remove('open');}

async function saveProva(){
  const id=document.getElementById('prova-id')?.value;
  const checks=document.querySelectorAll('#prova-wine-checks input[type=checkbox]:checked');
  const vinhos=Array.from(checks).map(c=>c.value).join(', ');
  const body={
    titulo:document.getElementById('prova-titulo')?.value,
    descricao:document.getElementById('prova-descricao')?.value,
    dataHora:document.getElementById('prova-data')?.value,
    capacidade:+document.getElementById('prova-capacidade')?.value||10,
    inscritos:+document.getElementById('prova-inscritos')?.value||0,
    precoPorPessoa:+document.getElementById('prova-preco')?.value||0,
    estado:document.getElementById('prova-estado')?.value||'AGENDADA',
    notas:document.getElementById('prova-notas')?.value,
    vinhos,
  };
  if(!body.titulo){toast('Preencha o título','error');return;}
  try{
    if(id){await apiFetch(`/provas/${id}`,{method:'PUT',body:JSON.stringify(body)});toast('Prova atualizada');}
    else  {await apiFetch('/provas',{method:'POST',body:JSON.stringify(body)});toast('Prova criada');}
    closeProvaModal();loadProvas();
  }catch{
    if(id){const i=allProvas.findIndex(x=>x.id===+id);if(i>=0)allProvas[i]={...allProvas[i],...body};}
    else{allProvas.push({id:Date.now(),...body});}
    toast('Guardado (modo demo)');closeProvaModal();updateProvasStats();filterProvas(provaFilter);
  }
}

async function changeProvaEstado(id,estado){
  try{await apiFetch(`/provas/${id}`,{method:'PUT',body:JSON.stringify({estado})});}
  catch{const p=allProvas.find(x=>x.id===id);if(p)p.estado=estado;}
  toast('Estado atualizado');loadProvas();
}

/* ──────────────────────────────────────────────
   CAVES — Cellar Grid
   ──────────────────────────────────────────── */
const CAVE_CONFIGS={A:{rows:10,cols:12,nome:'Cave A — Principal'},B:{rows:8,cols:10,nome:'Cave B — Reserva'},C:{rows:6,cols:8,nome:'Cave C — Premium'}};
let caveData={}, currentCave='A', selectedSlot=null, caveVinhos=[];

async function loadCave(cave){
  currentCave=cave||'A';
  const cfg=CAVE_CONFIGS[currentCave];
  const nameEl=document.getElementById('cave-name');if(nameEl)nameEl.textContent=cfg.nome;
  // Load wines for the selector
  try{caveVinhos=await apiFetch('/vinhos');}catch{caveVinhos=FALLBACK.vinhos;}
  // Load cave data
  try{caveData=await apiFetch(`/caves/${currentCave}`);}catch{
    // Generate demo data
    caveData={};
    const demo=[
      {row:1,col:3,vinho:FALLBACK.vinhos[0]},{row:1,col:4,vinho:FALLBACK.vinhos[0]},
      {row:2,col:1,vinho:FALLBACK.vinhos[2]},{row:3,col:5,vinho:FALLBACK.vinhos[3]},
      {row:4,col:2,vinho:FALLBACK.vinhos[6]},{row:4,col:3,vinho:FALLBACK.vinhos[6]},
      {row:5,col:7,vinho:FALLBACK.vinhos[9]},{row:6,col:1,vinho:FALLBACK.vinhos[1]},
    ];
    demo.forEach(d=>{caveData[`${d.row}-${d.col}`]=d.vinho;});
  }
  renderCaveGrid();
  updateCaveStats();
  selectedSlot=null;
  resetSlotInfo();
}

function updateCaveStats(){
  const cfg=CAVE_CONFIGS[currentCave];
  const total=cfg.rows*cfg.cols;
  const occ=Object.keys(caveData).length;
  const free=total-occ;
  const pct=Math.round(occ/total*100);
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('cave-capacity',total);set('cave-occupied',occ);set('cave-free',free);set('cave-pct',pct+'%');
}

function renderCaveGrid(){
  const cfg=CAVE_CONFIGS[currentCave];
  const container=document.getElementById('cave-grid-container');if(!container)return;
  const typeClass={Tinto:'tinto',Branco:'branco','Rosé':'rose',Espumante:'espumante',Porto:'porto'};
  // Build grid with row labels
  const colHeaders=[''].concat(Array.from({length:cfg.cols},(_, i)=>String(i+1).padStart(2,'0')));
  let html=`<div class="cave-grid" style="grid-template-columns:24px repeat(${cfg.cols},56px);">`;
  // Column headers
  html+=colHeaders.map(h=>`<div class="cave-row-label" style="height:24px;">${h}</div>`).join('');
  // Rows
  for(let r=1;r<=cfg.rows;r++){
    html+=`<div class="cave-row-label">${String.fromCharCode(64+r)}</div>`;
    for(let c=1;c<=cfg.cols;c++){
      const key=`${r}-${c}`;
      const wine=caveData[key];
      const tc=wine?typeClass[wine.tipo]||'tinto':'';
      const active=selectedSlot===key?'style="outline:2px solid var(--accent-gold);outline-offset:2px;"':'';
      if(wine){
        const shortName=wine.nome.split(' ').slice(0,2).join(' ');
        html+=`<div class="cave-slot occupied ${tc}" onclick="selectSlot('${key}')" title="${wine.nome}" ${active}>
          <div class="cave-slot-label">${shortName}</div>
          ${wine.anoColheita?`<div class="cave-slot-year">${wine.anoColheita}</div>`:''}
        </div>`;
      } else {
        html+=`<div class="cave-slot" onclick="selectSlot('${key}')" title="Posição ${String.fromCharCode(64+r)}${c} — Vazia" ${active}><div style="font-size:9px;color:var(--border-subtle);">+</div></div>`;
      }
    }
  }
  html+='</div>';
  container.innerHTML=html;
}

function selectSlot(key){
  selectedSlot=key;
  renderCaveGrid();
  const [r,c]=key.split('-');
  const rowLabel=String.fromCharCode(64+parseInt(r));
  const wine=caveData[key];
  const infoEl=document.getElementById('slot-info-content');
  const actEl=document.getElementById('slot-actions');
  const clearBtn=document.getElementById('clear-slot-btn');
  if(infoEl){
    if(wine){
      infoEl.innerHTML=`<div style="font-weight:600;font-size:14px;margin-bottom:6px;">${wine.nome}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:2px;">Tipo: ${wine.tipo} · Região: ${wine.regiao||'—'}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:2px;">Colheita: ${wine.anoColheita||'—'} · Preço: ${fmt.eur(wine.preco)}</div>
        <div style="font-size:12px;color:var(--text-gold);margin-top:6px;font-weight:600;">Posição ${rowLabel}${c}</div>`;
    } else {
      infoEl.innerHTML=`<div style="color:var(--text-muted);font-size:13px;">Posição <strong style="color:var(--text-primary);">${rowLabel}${c}</strong> está vazia.</div>`;
    }
    infoEl.style.fontStyle='normal';
  }
  if(actEl){
    actEl.style.display='flex';
    // Populate wine select
    const sel=document.getElementById('slot-wine-select');
    if(sel){sel.innerHTML=caveVinhos.map(v=>`<option value="${v.id}">${v.nome} (${v.tipo} ${v.anoColheita||''})</option>`).join('');}
    if(clearBtn) clearBtn.style.display=wine?'flex':'none';
  }
}

function resetSlotInfo(){
  const infoEl=document.getElementById('slot-info-content');
  const actEl=document.getElementById('slot-actions');
  if(infoEl){infoEl.innerHTML='Clique numa posição para ver os detalhes';infoEl.style.fontStyle='italic';}
  if(actEl)actEl.style.display='none';
}

function assignWineToSlot(){
  if(!selectedSlot)return;
  const sel=document.getElementById('slot-wine-select');
  if(!sel)return;
  const winhoId=+sel.value;
  const wine=caveVinhos.find(v=>v.id===winhoId);
  if(!wine)return;
  caveData[selectedSlot]=wine;
  toast(`${wine.nome} colocado na posição ${selectedSlot}`,'success');
  renderCaveGrid();
  selectSlot(selectedSlot);
  updateCaveStats();
}

function clearSlot(){
  if(!selectedSlot)return;
  delete caveData[selectedSlot];
  toast('Posição esvaziada');
  renderCaveGrid();
  resetSlotInfo();
  selectedSlot=null;
  updateCaveStats();
}

/* ──────────────────────────────────────────────
   AUTO-INIT — detect current page
   ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.split('/').pop() || 'index.html';

  if (path !== 'index.html' && path !== '') Session.guard();

  switch(path) {
    case 'index.html': case '': case '/':
      initLogin(); checkApi(); break;
    case 'gerente.html':
      loadDashboard(); setInterval(()=>checkApi().then(updateApiBadge),30000); break;
    case 'loja.html':
      loadPOS(); setInterval(()=>checkApi().then(updateApiBadge),30000); break;
    case 'stock.html':
      loadStock();
      document.getElementById('stock-search')?.addEventListener('input',renderStock);
      document.getElementById('tipo-filter')?.addEventListener('change',renderStock);
      break;
    case 'gerente-vendas.html':
      loadVendas();
      document.getElementById('vendas-search')?.addEventListener('input',filterVendas);
      document.getElementById('estado-filter')?.addEventListener('change',filterVendas);
      break;
    case 'gerente-equipa.html':
      loadEquipa(); break;
    case 'gerente-relatorios.html':
      loadRelatorios(); break;
    case 'provas.html':
      // Cache wines for prova modal
      (async()=>{
        try{allProvas._wineCache=await apiFetch('/vinhos');}catch{allProvas._wineCache=FALLBACK.vinhos;}
        loadProvas();
      })();
      break;
    case 'caves.html':
      loadCave('A'); break;
  }
});
