# Vinha D'Ouro — Como Correr o Sistema
**Grupo 13 | Análise e Desenho de Sistemas | Universidade Lusófona**

---

## 1. Só Frontend (sem servidor)
Abrir `index.html` diretamente no browser. **Funciona sem backend** com dados estáticos de demonstração.

---

## 2. Backend Python (Flask + MySQL)

### Pré-requisitos
- Python 3.8+
- MySQL a correr em `127.0.0.1:3306`

### Instalar dependências
```bash
pip install flask flask-cors pymysql
```

### Criar a base de dados
Abrir o MySQL Workbench → File → Open SQL Script → selecionar `setup_mysql.sql` → Execute (⚡)

### Configurar a password
Editar `server.py`, linha ~34:
```python
'password': 'TUA_PASSWORD_AQUI',
```

### Arrancar o servidor
```bash
python3 server.py
```
O servidor arranca em **http://localhost:8080**

> **Nota:** Se o MySQL não estiver disponível, o servidor usa SQLite automaticamente como fallback.

---

## 3. Backend Java (Spring Boot + MySQL)

### Pré-requisitos
- Java 17+
- Maven 3.6+
- MySQL a correr em `127.0.0.1:3306` com a base de dados `vinhadouro`

### Criar a base de dados
Correr `setup_mysql.sql` no MySQL Workbench (mesmo passo que acima).

### Configurar password da BD
Editar `backend/src/main/resources/application.properties`:
```properties
spring.datasource.password=TUA_PASSWORD_AQUI
```

### Arrancar o servidor
```bash
cd backend
mvn spring-boot:run
```
O servidor arranca em **http://localhost:8080**

---

## Endpoints da API

| Método | URL | Descrição |
|--------|-----|-----------|
| GET | /api/health | Verificar estado do servidor |
| POST | /api/login | Autenticação (username + password) |
| GET | /api/dashboard | KPIs do gerente |
| GET | /api/vinhos | Lista de vinhos |
| PUT | /api/vinhos/{id}/stock | Atualizar stock |
| GET | /api/vendas | Histórico de vendas |
| POST | /api/vendas | Registar venda |
| GET | /api/funcionarios | Lista de funcionários |
| GET | /api/provas | Eventos de prova de vinhos |
| POST | /api/provas | Criar prova |
| GET | /api/caves | Lista de caves |
| POST | /api/caves | Criar cave |
| GET | /api/movimentos-stock | Movimentos de stock |
| POST | /api/movimentos-stock | Registar movimento |
| GET | /api/clientes | Lista de clientes |
| GET | /api/relatorios/vendas-mensal | Relatório mensal |
| GET | /api/relatorios/top-vinhos | Top vinhos vendidos |

## Credenciais de Demo

| Utilizador | Password | Role | Acesso |
|------------|----------|------|--------|
| gerente | 1234 | GERENTE | Dashboard completo |
| loja | 1234 | FUNCIONARIO | Ponto de Venda |
| stock | 1234 | ARMAZENISTA | Inventário + Caves |
| admin | 1234 | ADMIN | Acesso total |

### Quando o backend está online
O indicador **"BD Ligada"** (verde) aparece no canto inferior da sidebar. Todos os dados passam a vir da base de dados MySQL real.

---
*Sistema desenvolvido por Eduardo Saavedra Lourenço, Kollan Andre Gafuro Intacua e Pedro Gabriel Matias Gomes*
