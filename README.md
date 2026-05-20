<div align="center">

<img src="frontend/assets/logo-the100s.png" alt="the 100's" width="180"/>

# the 100's

### Sistema de Gestão de Loja de Vinhos Premium

*Bottled Memories — uma curadoria dos melhores vinhos portugueses,*
*do Douro ao Alentejo, do Porto à Madeira.*

[![License: MIT](https://img.shields.io/badge/License-MIT-C9A96E.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Status](https://img.shields.io/badge/status-Pronto%20para%20demo-7BB78F)](#-quick-start)

**Projeto pessoal de Pedro Gabriel Matias Gomes**
the 100's — Bottled Memories · © 2026

</div>

---

## ✨ Destaques

- 🏛️ **Identidade premium "Bottled Memories"** — paleta gold + ink, tipografia Cormorant Garamond + Inter
- 🛒 **Ponto de Venda completo** — catálogo agrupado por tipo, carrinho, 4 métodos de pagamento (Cartão, Numerário com troco, MB Way, Multibanco com referência gerada)
- 📊 **Dashboard editável** — utilizador escolhe que widgets ver; preferências persistidas em localStorage
- 📤 **Exports Excel premium** — relatórios formatados com `openpyxl` (1 sheet para vendas, 4 sheets para análises)
- 🧾 **Fatura digital com QR code** — gerada com `api.qrserver.com`, envio por **Email / SMS / WhatsApp** via `mailto:` / `sms:` / `wa.me`
- 🍷 **Cave 3D** — gestão visual de slots em 3 caves (A/B/C), persistente
- 🔐 **Auth com tokens** — `secrets.token_urlsafe`, hash de passwords (pbkdf2/scrypt via `werkzeug.security`), decorators de role
- 🔄 **Devoluções** — pesquisa em tempo real, reposição automática de stock
- 🎬 **Animações** — count-up nas métricas, stagger nas grids, transições suaves (respeita `prefers-reduced-motion`)

---

## 📁 Estrutura do Projeto

```
the100s/
├── README.md                          ← este ficheiro
├── LICENSE                            ← MIT
├── requirements.txt                   ← deps Python
├── .env.example                       ← template config
├── .gitignore
│
├── server.py                          ← Backend Flask + MySQL (1700+ linhas)
├── setup_mysql.sql                    ← Schema + dados iniciais
│
├── frontend/                          ← Tudo o que o browser carrega
│   ├── index.html                     ← Login premium "Bottled Memories"
│   ├── loja.html                      ← Ponto de Venda (POS)
│   ├── stock.html                     ← Gestão de inventário
│   ├── caves.html                     ← Gestão de caves A/B/C
│   ├── gerente.html                   ← Dashboard executivo
│   ├── gerente-vendas.html            ← Histórico de vendas
│   ├── gerente-relatorios.html        ← Relatórios & análises
│   ├── gerente-equipa.html            ← Gestão de equipa
│   ├── style.css                      ← Design System (4200+ linhas)
│   ├── app.js                         ← Lógica frontend (2700+ linhas)
│   └── assets/
│       └── logo-the100s.png
│
├── docs/                              ← Documentação técnica + entregas
│   ├── Manual_Codigo_the100s.docx     ← Manual completo (defesa)
│   ├── Relatorio_BD_the100s.docx      ← Entrega Bases de Dados
│   ├── Relatorio_Final_Implementacao.pdf
│   ├── COMO_CORRER.md                 ← Setup macOS/Linux
│   ├── WINDOWS.md                     ← Setup Windows
│   ├── CLAUDE.md                      ← Documentação técnica
│   └── diagramas/
│       ├── Diagrama_ER_the100s.png
│       ├── Diagrama_ER_the100s.html
│       └── Diagrama_ER_the100s.pptx
│
└── backend-java/                      ← Backend alternativo Spring Boot
                                         (apenas referência arquitetural,
                                         não usado em runtime)
```

---

## 🚀 Quick Start

### Requisitos
- **Python 3.10+** (com `pip`)
- **MySQL 8.0** a correr em `localhost:3306` *(opcional — fallback automático para SQLite)*

### 1. Clonar & instalar

```bash
git clone https://github.com/PedroGGomess/Vinha-D-Ouro.git the100s
cd the100s
pip install -r requirements.txt
```

### 2. Configurar a base de dados (MySQL)

```bash
mysql -u root -p < setup_mysql.sql
```

### 3. Configurar credenciais

```bash
cp .env.example .env
# Editar .env e substituir MYSQL_PASSWORD pela tua password real
```

### 4. Arrancar o servidor

```bash
python3 server.py
```

Abre o browser em **http://localhost:8080** 🎉

> 💡 **Sem MySQL?** O sistema arranca automaticamente em modo SQLite com dados de demonstração. Útil para clones rápidos.

> 🪟 **Windows?** Vê o guia detalhado em [`docs/WINDOWS.md`](docs/WINDOWS.md).

---

## 🔑 Credenciais de Demo

| Utilizador | Password | Role          | Acesso                                          |
|------------|----------|---------------|-------------------------------------------------|
| `gerente`  | `1234`   | GERENTE       | Dashboard, vendas, relatórios, equipa, loja     |
| `loja`     | `1234`   | FUNCIONARIO   | Ponto de Venda                                  |
| `stock`    | `1234`   | ARMAZENISTA   | Inventário, caves                               |
| `admin`    | `1234`   | ADMIN         | Acesso total                                    |

> 🔐 Ao primeiro login, o sistema faz **upgrade automático** das passwords de plaintext para hash `pbkdf2:sha256` / `scrypt`.

---

## 🏗️ Arquitetura

```
┌──────────────────────────────────────────────────────────────┐
│  BROWSER (Safari / Chrome / Edge)                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  frontend/  → HTML + style.css + app.js                │  │
│  │  · Session, apiFetch, escHtml, fmt, toast, countUp     │  │
│  │  · Páginas estáticas + lógica em vanilla JS            │  │
│  └────────────────────────────────────────────────────────┘  │
│                            ▲                                 │
│           HTTP/JSON · Authorization: Bearer <token>          │
│                            ▼                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  server.py  (Flask · porto 8080)                       │  │
│  │  · /api/login          → autentica + emite token       │  │
│  │  · /api/vinhos         → catálogo                      │  │
│  │  · /api/vendas         → POS + histórico               │  │
│  │  · /api/export/*.xlsx  → relatórios openpyxl premium   │  │
│  │  · @requires_auth · @requires_role(...)                │  │
│  └────────────────────────────────────────────────────────┘  │
│                            ▲                                 │
│             pymysql (DictCursor)  ou  sqlite3                │
│                            ▼                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  MySQL 8.0  (vinhadouro)                               │  │
│  │  9 tabelas · 3 vistas · 13 índices · 24 vinhos seed    │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

### Backend
- **Python 3.10+** · **Flask 3.1** · **Flask-CORS**
- **PyMySQL** com `DictCursor` · fallback **SQLite**
- **Werkzeug.security** para hash de passwords
- **openpyxl** para exports Excel premium
- **secrets** para tokens criptograficamente seguros

### Frontend
- **HTML5** semântico (`<aside>`, `<nav>`, `aria-live`, `role`)
- **CSS3** com Custom Properties — paleta the 100's
- **JavaScript vanilla** — zero frameworks
- **Google Fonts** — Playfair Display, Inter, Cormorant Garamond

### Base de Dados
- **MySQL 8.0** (charset `utf8mb4`)
- **SQLite** como fallback (mesmo schema, mesmas queries)

---

## 🔌 API Endpoints (resumo)

| Método      | Endpoint                                   | Descrição                                     |
|-------------|--------------------------------------------|-----------------------------------------------|
| `GET`       | `/api/health`                              | Estado do servidor + tipo de BD               |
| `POST`      | `/api/login`                               | Autenticação → devolve token Bearer           |
| `POST`      | `/api/logout`                              | Revoga o token atual                          |
| `GET`       | `/api/me`                                  | Info do utilizador autenticado                |
| `GET`       | `/api/vinhos` · `/api/vinhos/<id>`         | Catálogo                                      |
| `POST/PUT/DELETE` | `/api/vinhos/*`                      | Gestão de vinhos *(role-protected)*           |
| `GET`       | `/api/vendas` · `/api/vendas/<id>`         | Histórico + detalhes                          |
| `POST`      | `/api/vendas`                              | Criar venda *(@requires_auth)*                |
| `POST`      | `/api/devolucoes`                          | Processar devolução                           |
| `GET/POST/PUT` | `/api/caves/*`                          | Gestão de caves                               |
| `GET/POST`  | `/api/movimentos-stock`                    | Auditoria de inventário                       |
| `GET`       | `/api/dashboard`                           | KPIs agregados                                |
| `GET`       | `/api/relatorios/vendas-mensal`            | Vendas por mês                                |
| `GET`       | `/api/relatorios/top-vinhos`               | Ranking por receita                           |
| `GET`       | `/api/export/vendas.xlsx`                  | Excel premium (1 sheet)                       |
| `GET`       | `/api/export/relatorio.xlsx`               | Excel premium (4 sheets)                      |

> 25 endpoints REST · todas as escritas protegidas por `@requires_auth` ou `@requires_role(...)`

---

## 🔐 Segurança

| Vetor                | Defesa                                                                |
|----------------------|-----------------------------------------------------------------------|
| **Brute force login**| Tokens válidos por 8h, revogados em logout                            |
| **SQL Injection**    | Queries parametrizadas (`?` / `%s`); IDs tipados via Flask routing    |
| **XSS**              | `escHtml()` em todo o conteúdo proveniente da API; toasts com `textContent` |
| **Passwords**        | Hash `pbkdf2:sha256` / `scrypt` via `werkzeug.security` + auto-upgrade |
| **CORS**             | Restrito a `localhost:8080` e `127.0.0.1:8080`                        |
| **Autorização**      | `@requires_role(...)` em endpoints sensíveis                          |
| **Segredos**         | `.env` no `.gitignore`; `.env.example` committed                      |

---

## 📦 Catálogo seed (24 vinhos)

| Categoria  | Quantidade | Exemplos                                                       |
|------------|------------|----------------------------------------------------------------|
| Tinto      | 7          | Barca Velha · Quinta do Crasto Reserva · Mouchão Tonel 3-4     |
| Branco     | 4          | Anselmo Mendes Alvarinho · Niepoort Redoma Branco              |
| Rosé       | 2          | Mateus Rosé · Quinta dos Murças Rosé                           |
| Espumante  | 2          | Raposeira Super Reserva · Murganheira Bruto                    |
| Porto      | 5          | Graham's 20 Years Tawny · Taylor's Vintage 2017 · Niepoort LBV |
| Madeira    | 4          | Blandy's 10 Years Malmsey · D'Oliveiras Boal 1989              |

---

## 📚 Documentação

| Documento                                | Conteúdo                                                  |
|------------------------------------------|-----------------------------------------------------------|
| [`docs/Manual_Codigo_the100s.docx`](docs/Manual_Codigo_the100s.docx) | Manual completo do código — defesa académica (12 capítulos) |
| [`docs/Relatorio_BD_the100s.docx`](docs/Relatorio_BD_the100s.docx)   | Relatório Bases de Dados — entrega formal                 |
| [`docs/COMO_CORRER.md`](docs/COMO_CORRER.md)         | Guia detalhado de instalação (macOS/Linux)                |
| [`docs/WINDOWS.md`](docs/WINDOWS.md)                 | Guia detalhado de instalação (Windows)                    |
| [`docs/CLAUDE.md`](docs/CLAUDE.md)                   | Documentação técnica adicional                            |
| [`docs/diagramas/`](docs/diagramas/)                 | Diagrama Entidade-Associação (`.png`, `.html`, `.pptx`)   |

---

## 👥 Autor & créditos

| Nome                              | Função                                                                  |
|-----------------------------------|-------------------------------------------------------------------------|
| **Pedro Gabriel Matias Gomes** 👑 | **Criador & proprietário** — arquitetura, backend Flask + MySQL, frontend completo (POS, dashboard, caves, relatórios, equipa), design system, segurança, base de dados, talão fiscal AT-compliant, documentação & QA |
| Eduardo Saavedra Lourenço         | Contribuição menor — revisão de queries SQL                              |

> 📌 **Este é um projeto pessoal de Pedro Gabriel Matias Gomes.**
> Não pertence a nenhuma instituição de ensino — o autor mantém todos os direitos sobre o código, design, identidade visual ("the 100's", "Bottled Memories") e respetivos ativos. Licença MIT para uso livre por terceiros, mas a autoria e marca permanecem exclusivamente do Pedro.

---

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT** — vê [`LICENSE`](LICENSE) para detalhes.

---

<div align="center">

**the 100's** · *Bottled Memories*

[⬆ Voltar ao topo](#the-100s)

</div>
