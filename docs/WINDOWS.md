# the 100's — Setup Windows

> Guia passo-a-passo para correr o sistema num PC Windows.
> Tempo estimado: **15-20 min** (incluindo downloads).

---

## 0. O que vais precisar instalar

| Software | Onde apanhar | Notas |
|---|---|---|
| **Git** | https://git-scm.com/download/win | Instalador padrão, "Next" em tudo |
| **Python 3.10+** | https://www.python.org/downloads/windows/ | ⚠ **Marca a checkbox "Add Python to PATH"** no instalador |
| **MySQL 8** | https://dev.mysql.com/downloads/installer/ | Escolher "MySQL Installer for Windows" → **Custom** → Server + Workbench |

---

## 1. Clonar o repositório

Abre **PowerShell** (Win + X → Windows PowerShell):

```powershell
cd $HOME\Documents
git clone https://github.com/PedroGGomess/Vinha-D-Ouro.git the100s
cd the100s
```

> Vai pedir-te credenciais GitHub na primeira vez. Se for repo privado, usa um Personal Access Token como password.

---

## 2. Instalar dependências Python

```powershell
pip install flask flask-cors pymysql werkzeug cryptography openpyxl
```

> Se o comando `pip` não for reconhecido, fecha o PowerShell e abre novo (PATH atualizado).

---

## 3. Configurar a base de dados

### 3.1. Abrir o MySQL Workbench
1. Liga-te à instância local (`localhost:3306`, root + a tua password).
2. **File → Open SQL Script** → escolhe `setup_mysql.sql` da pasta do projeto.
3. Clica no ⚡ (Execute) — cria a base `vinhadouro` com tabelas e dados de demonstração.

### 3.2. Garantir que `tipo` aceita 'Madeira' (caso tenhas BD antiga)

Cola e executa no Workbench:

```sql
USE vinhadouro;
ALTER TABLE vinhos
  MODIFY tipo ENUM('Tinto','Branco','Rosé','Espumante','Porto','Madeira') DEFAULT 'Tinto';
```

---

## 4. Configurar o `.env`

```powershell
copy .env.example .env
notepad .env
```

No bloco de notas, **substitui apenas a linha `MYSQL_PASSWORD=`** com a tua password real do MySQL e guarda (`Ctrl+S`).

Exemplo:
```
MYSQL_PASSWORD=oTeuPasswordReal
```

---

## 5. Arrancar o servidor

```powershell
python server.py
```

Deve aparecer:
```
MySQL ligado com sucesso
the 100's — Sistema Premium v3.2
Site: http://localhost:8080
```

---

## 6. Abrir no browser

Abre o Chrome ou Edge e vai a:

```
http://localhost:8080
```

---

## 7. Credenciais de demo

| Utilizador | Password | Acesso |
|---|---|---|
| `gerente` | `1234` | Dashboard, Vendas, Relatórios, Equipa |
| `loja` | `1234` | Ponto de Venda |
| `stock` | `1234` | Inventário e Caves |
| `admin` | `1234` | Tudo |

> No primeiro login, o sistema faz **upgrade automático** das passwords plaintext para hash seguro (pbkdf2/scrypt). Não precisas de mexer.

---

## Problemas comuns

### "MySQL não disponível: Access denied"
- A tua `MYSQL_PASSWORD` no `.env` está errada. Verifica.

### "MySQL não disponível: cryptography package required"
```powershell
pip install cryptography
```

### "ModuleNotFoundError: No module named 'flask'"
- Falhou o passo 2. Repete `pip install flask flask-cors pymysql werkzeug cryptography openpyxl`.

### Porta 8080 já está a ser usada
Edita `server.py` no fim, linha que diz `port=8080`, troca para `8090` por exemplo.

### Madeira aparece como tipo vazio
- Repete o passo 3.2 (ALTER TABLE com 'Madeira').

### Imprimir fatura — popups bloqueados
- O browser pediu autorização. Aceita.

---

## Atualizar para a última versão

```powershell
cd $HOME\Documents\the100s
git pull
```

---

## Estrutura mínima do projeto (para abrir num IDE)

```
the100s/
├── index.html              ← Login
├── loja.html               ← POS
├── stock.html              ← Inventário
├── caves.html              ← Caves
├── gerente.html            ← Dashboard
├── gerente-vendas.html
├── gerente-relatorios.html
├── gerente-equipa.html
├── style.css
├── app.js
├── server.py               ← Backend Flask
├── setup_mysql.sql
├── .env.example            ← Copia para .env
└── assets/logo-the100s.png
```

---

*the 100's — Bottled Memories · ADS 2025/26 · Universidade Lusófona*
