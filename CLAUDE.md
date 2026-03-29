# Vinha D'Ouro — Instruções do Projeto

## Sobre o Projeto
Sistema de gestão para loja de vinhos premium. Projeto de faculdade (Análise e Desenho de Sistemas — Universidade Lusófona, Grupo 13).

## Tecnologias
- **Frontend**: HTML5, CSS3 (design system dark luxury), JavaScript vanilla
- **Backend opção 1**: Python Flask + MySQL/SQLite (server.py)
- **Backend opção 2**: Java Spring Boot 3.2 + MySQL (pasta backend/)
- **Base de Dados**: MySQL 8.0 (vinhadouro)
- **Fontes**: Playfair Display, Inter, Cormorant Garamond
- **Design**: Dark theme, gold + wine red accents, glassmorphism

## Estrutura do Projeto
```
vinha-douro-site/
├── index.html              # Login (página inicial)
├── loja.html               # Ponto de Venda (PDV)
├── stock.html              # Gestão de Inventário
├── caves.html              # Gestão de Caves
├── provas.html             # Provas de Vinhos
├── gerente.html            # Dashboard do Gerente
├── gerente-vendas.html     # Histórico de Vendas
├── gerente-relatorios.html # Relatórios e Análises
├── gerente-equipa.html     # Gestão de Equipa
├── style.css               # Design System completo
├── app.js                  # Lógica frontend unificada
├── server.py               # Backend Python (Flask)
├── setup_mysql.sql         # Schema + dados MySQL
├── COMO_CORRER.md          # Guia de instalação
├── backend/                # Backend Java Spring Boot
│   ├── pom.xml
│   └── src/main/java/pt/vinhadouro/
│       ├── model/          # Entidades JPA
│       ├── repository/     # Spring Data repos
│       ├── service/        # Lógica de negócio
│       ├── controller/     # REST controllers
│       ├── dto/            # Data Transfer Objects
│       └── config/         # CORS, Security
└── Diagrama_ER_*.pptx      # Diagramas ER
```

## Convenções de Código

### Frontend
- CSS usa custom properties (--wine-*, --gold-*, --bg-*, --text-*)
- JavaScript segue padrão modular com objetos (Session, fmt, etc.)
- Todas as páginas usam sidebar + main-content layout
- Dados estáticos de fallback quando API offline
- Comunicação com API via fetch() para /api/*

### Backend Python (server.py)
- Flask com CORS habilitado
- Suporta MySQL (pymysql) com fallback SQLite
- Endpoints em /api/*
- Respostas sempre em JSON
- Corre em http://localhost:8080

### Backend Java (backend/)
- Spring Boot 3.2, Java 17
- Maven para build
- Spring Data JPA com MySQL
- Lombok nos modelos
- Mesmos endpoints /api/* que o Python
- Corre em http://localhost:8080

### Base de Dados
- Nome: vinhadouro
- Charset: utf8mb4
- Tabelas: pessoas, funcionarios, utilizadores, vinhos, vendas, itens_venda, clientes, provas, participantes_prova, caves, movimentos_stock
- Views: v_stock_baixo, v_vendas_hoje, v_top_vinhos

## Regras de Design (UI/UX)
- Manter tema escuro (--bg-void: #050203) com acentos dourados (#C9A227) e vinho (#8B3A44)
- Contraste de texto mínimo 4.5:1
- Botões interativos com tamanho mínimo 44x44px
- Transições suaves (200-300ms ease)
- Glassmorphism nos cards (backdrop-filter: blur)
- Tipografia: Playfair Display para títulos, Inter para corpo
- Todas as páginas devem ser responsivas (mobile-first)
- Sidebar colapsável em mobile

## Roles de Utilizador
- GERENTE: acesso total (dashboard, vendas, relatórios, equipa)
- FUNCIONARIO: acesso à loja (PDV) e provas
- ARMAZENISTA: acesso a stock e caves
- ADMIN: acesso total

## Credenciais de Demo
- gerente / 1234 → Painel do Gerente
- loja / 1234 → Ponto de Venda
- stock / 1234 → Inventário
- admin / 1234 → Acesso total

## Autores
Eduardo Saavedra Lourenço, Kollan Andre Gafuro Intacua, Pedro Gabriel Matias Gomes
