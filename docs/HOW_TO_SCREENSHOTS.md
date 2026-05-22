# Como tirar os 5 screenshots da app

Os screenshots 3-7 da lista de entregáveis precisam de ser tirados com a app a correr e o browser aberto. Aqui está o guião exato para os obter todos em ~3 minutos.

## Preparação (uma única vez)

```bash
cd "/Users/pedrogomes/Library/Mobile Documents/com~apple~CloudDocs/Faculdade - PDF/The100's"
python3 server.py
```

→ servidor a correr em `http://localhost:8080`. Deixa o terminal aberto.

Pasta destino dos PNGs: `docs/screenshots/` (cria com `mkdir -p docs/screenshots`)

## Atalhos macOS

- **`⌘ + Shift + 4`** → cursor em mira; arrasta um retângulo, larga, grava em Desktop
- **`⌘ + Shift + 4` + `Espaço`** → modo "captura janela inteira" (incluindo sombra). Carrega `Option` antes de clicar para tirar sem sombra.
- **`⌘ + Shift + 5`** → mini-toolbar com opções de captura
- Por defeito grava em `~/Desktop/Screen Shot YYYY-MM-DD às HH.MM.SS.png` — depois renomeias e movias para `docs/screenshots/`.

> 💡 Dica de qualidade: maximiza a janela do browser para 1440×900 ou mais antes de capturar.

---

## 📸 Os 5 screenshots, um a um

### 3. `screenshot_login.png` — Página de login

1. Abre browser em **`http://localhost:8080`** (faz logout antes se já estiveres autenticado: clica no avatar)
2. Aguarda 1s para as animações terminarem
3. `⌘ + Shift + 4` + `Espaço` → clica na janela
4. Renomeia para **`screenshot_login.png`** e move para `docs/screenshots/`

### 4. `screenshot_dashboard.png` — Dashboard executivo

1. Login com **`gerente` / `1234`**
2. A página deve carregar automaticamente em `gerente.html`
3. Aguarda que os KPIs animem (count-up termina em ~1.5s) e que as cards façam stagger fade-in
4. `⌘ + Shift + 4` + `Espaço` → captura
5. Renomeia para **`screenshot_dashboard.png`**

### 5. `screenshot_pos.png` — Ponto de venda com carrinho

1. Na sidebar, clica em **"Loja"** (ou navega para `http://localhost:8080/loja.html`)
2. Adiciona **2-3 vinhos** ao carrinho (clica nas cards — o carrinho lateral atualiza)
3. Aguarda 0.5s entre cada clique para a animação "fly-to-cart" terminar
4. `⌘ + Shift + 4` + `Espaço` → captura janela com carrinho visível
5. Renomeia para **`screenshot_pos.png`**

### 6. `screenshot_caves.png` — Gestão de caves

1. Na sidebar, clica em **"Caves"** (ou navega para `http://localhost:8080/caves.html`)
2. Garante que estás na vista visual (Caves A/B/C com a grelha de slots)
3. Opcional: clica num slot para mostrar o painel lateral com o vinho (mais informativo)
4. `⌘ + Shift + 4` + `Espaço` → captura
5. Renomeia para **`screenshot_caves.png`**

### 7. `screenshot_relatorios.png` — Relatórios

1. Na sidebar, clica em **"Relatórios"** (ou `gerente-relatorios.html`)
2. Aguarda que os gráficos/tabelas carreguem
3. Scroll até veres pelo menos o **Top Vinhos** + **Vendas Mensais** visíveis
4. `⌘ + Shift + 4` + `Espaço` → captura
5. Renomeia para **`screenshot_relatorios.png`**

---

## Comando para mover todos os PNGs para a pasta certa (após capturar)

Se gravaste tudo no Desktop:

```bash
mkdir -p "/Users/pedrogomes/Library/Mobile Documents/com~apple~CloudDocs/Faculdade - PDF/The100's/docs/screenshots"
mv ~/Desktop/screenshot_*.png "/Users/pedrogomes/Library/Mobile Documents/com~apple~CloudDocs/Faculdade - PDF/The100's/docs/screenshots/"
```

## Verificar

```bash
ls -la "/Users/pedrogomes/Library/Mobile Documents/com~apple~CloudDocs/Faculdade - PDF/The100's/docs/screenshots/"
```

Deves ver:
- `screenshot_login.png`
- `screenshot_dashboard.png`
- `screenshot_pos.png`
- `screenshot_caves.png`
- `screenshot_relatorios.png`

---

## Bónus — anti-aliasing perfeito no Mac retina

Os screenshots em ecrã retina ficam em 2× (ex.: 2880×1800). Se quiseres reduzir para 1× sem perda visual:

```bash
sips -Z 1440 docs/screenshots/screenshot_*.png
```

Isto faz resize máximo a 1440px do lado maior, mantendo aspect ratio.
