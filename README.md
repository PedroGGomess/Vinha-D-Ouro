# 🍷 the 100's — Sistema de Gestão de Loja de Vinhos Premium

**Grupo 13 | Análise e Desenho de Sistemas | Universidade Lusófona**

> Sistema completo de gestão para loja de vinhos premium com ponto de venda, gestão de inventário, caves e painel de gerente.

---

## 📁 Estrutura do Projeto

```
├── index.html              → Login (página inicial)
├── loja.html               → Ponto de Venda (PDV)
├── stock.html              → Gestão de Inventário
├── caves.html              → Gestão de Caves
├── gerente.html            → Dashboard do Gerente
├── gerente-vendas.html     → Histórico de Vendas
├── gerente-relatorios.html → Relatórios e Análises
├── gerente-equipa.html     → Gestão de Equipa
├── style.css               → Design System (dark luxury theme)
├── app.js                  → Lógica frontend unificada
├── server.py               → Backend Python (Flask + MySQL)
├── setup_mysql.sql         → Schema + dados iniciais MySQL
├── atualizar_bd.sql        → Script de atualização da BD
├── COMO_CORRER.md          → Guia detalhado de instalação
├── CLAUDE.md               → Documentação técnica do projeto
└── backend/                → Backend alternativo (Java Spring Boot)
```

---

## 🚀 Quick Start — Copiar e Colar no Terminal

### 1. Clonar o repositório

```bash
git clone https://github.com/PedroGGomess/Vinha-D-Ouro.git
cd Vinha-D-Ouro
```

### 2. Instalar dependências Python

```bash
pip install flask flask-cors pymysql
```

### 3. Configurar MySQL

Tens de ter o MySQL a correr em `localhost:3306`. Depois cria a base de dados:

```bash
mysql -u root -p < setup_mysql.sql
```

Se já tens a BD criada mas faltam tabelas, corre o script de atualização:

```bash
mysql -u root -p vinhadouro < atualizar_bd.sql
```

### 4. Configurar a password do MySQL

Abre o `server.py` e altera a password na linha 34:

```python
'password': 'A_TUA_PASSWORD',
```

### 5. Arrancar o servidor

```bash
python3 server.py
```

### 6. Abrir no browser

```
http://localhost:8080
```

---

## 🔑 Credenciais de Demo

| Utilizador | Password | Role | Acesso |
|------------|----------|------|--------|
| `gerente` | `1234` | GERENTE | Dashboard, vendas, relatórios, equipa |
| `loja` | `1234` | FUNCIONARIO | Ponto de Venda |
| `stock` | `1234` | ARMAZENISTA | Inventário, caves |
| `admin` | `1234` | ADMIN | Acesso total |

---

## 🔌 API Endpoints

| Método | URL | Descrição |
|--------|-----|-----------|
| `GET` | `/api/health` | Verificar estado do servidor |
| `POST` | `/api/login` | Autenticação |
| `GET` | `/api/dashboard` | KPIs do gerente |
| `GET` | `/api/vinhos` | Lista de vinhos |
| `PUT` | `/api/vinhos/{id}/stock` | Atualizar stock |
| `GET` | `/api/vendas` | Histórico de vendas |
| `POST` | `/api/vendas` | Registar venda |
| `GET` | `/api/funcionarios` | Lista de funcionários |
| `GET/POST` | `/api/caves` | Gestão de caves |
| `GET/POST` | `/api/movimentos-stock` | Movimentos de stock |
| `GET` | `/api/clientes` | Lista de clientes |
| `GET` | `/api/relatorios/vendas-mensal` | Relatório mensal |
| `GET` | `/api/relatorios/top-vinhos` | Top vinhos vendidos |

---

## 🎨 Design System

- **Tema:** Dark luxury (fundo `#050203`, acentos gold `#C9A227` e wine red `#8B3A44`)
- **Tipografia:** Playfair Display (títulos) + Inter (corpo)
- **Efeitos:** Glassmorphism, transições suaves 200-300ms
- **Responsivo:** Mobile-first com sidebar colapsável

---

## 🛠 Tecnologias

- **Frontend:** HTML5, CSS3 (custom properties), JavaScript vanilla
- **Backend principal (em uso):** Python 3.8+ / Flask / Flask-CORS
- **Backend alternativo (referência ADS):** Java 17 / Spring Boot 3.2 (pasta `backend/`) — implementação paralela mantida como documentação de design, sem ligação ao frontend em runtime
- **Base de Dados:** MySQL 8.0 (com fallback SQLite)
- **Fontes:** Google Fonts (Playfair Display, Inter, Cormorant Garamond)

---

## 💡 Modo Offline

O site funciona **sem backend** — basta abrir `index.html` no browser. Usa dados estáticos de demonstração e o indicador na sidebar mostra "BD Desligada".

---

## 👥 Autores

- **Eduardo Saavedra Lourenço**
- **Kollan Andre Gafuro Intacua**
- **Pedro Gabriel Matias Gomes**

*Universidade Lusófona — Análise e Desenho de Sistemas — 2025/2026*
