-- ============================================================
--  the 100's — Setup MySQL Melhorado
--  Corre este script no MySQL Workbench (File → Open SQL Script)
--  e depois clica em "Execute" (raio ⚡)
--  Inclui: clientes, caves, movimentos_stock e muito mais!
-- ============================================================

-- 1. Criar a base de dados (se ainda não existir)
CREATE DATABASE IF NOT EXISTS vinhadouro
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vinhadouro;

-- ============================================================
--  TABELAS BASE
-- ============================================================

-- 2. Tabela de Pessoas (base para clientes e funcionários)
CREATE TABLE IF NOT EXISTS pessoas (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nome       VARCHAR(200) NOT NULL,
  email      VARCHAR(200) UNIQUE,
  telefone   VARCHAR(30),
  morada     VARCHAR(300),
  criado_em  DATETIME DEFAULT CURRENT_TIMESTAMP,
  comentario TEXT,
  COMMENT = 'Base de dados de todas as pessoas (clientes, funcionários, etc.)'
) ENGINE=InnoDB;

-- 3. Tabela de Clientes (especializada para clientes de loja)
CREATE TABLE IF NOT EXISTS clientes (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  pessoa_id    INT NOT NULL UNIQUE,
  nif          VARCHAR(20) UNIQUE,
  data_nascimento DATE,
  preferencias JSON COMMENT 'Preferências de vinho em JSON: {"tipos": ["Tinto", "Branco"], "regioes": ["Douro"]}',
  ativo        TINYINT(1) DEFAULT 1,
  criado_em    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pessoa_id) REFERENCES pessoas(id) ON DELETE CASCADE,
  COMMENT = 'Clientes da loja com dados específicos'
) ENGINE=InnoDB;

-- 4. Tabela de Funcionários
CREATE TABLE IF NOT EXISTS funcionarios (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  pessoa_id  INT NOT NULL,
  cargo      VARCHAR(100),
  salario    DECIMAL(10,2) DEFAULT 0,
  nivel      ENUM('FUNCIONARIO','GERENTE','ADMIN') DEFAULT 'FUNCIONARIO',
  ativo      TINYINT(1) DEFAULT 1,
  criado_em  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pessoa_id) REFERENCES pessoas(id) ON DELETE CASCADE,
  COMMENT = 'Dados laborais dos funcionários'
) ENGINE=InnoDB;

-- 5. Tabela de Utilizadores (login)
CREATE TABLE IF NOT EXISTS utilizadores (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  pessoa_id     INT,
  username      VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('FUNCIONARIO','GERENTE','ARMAZENISTA','ADMIN') DEFAULT 'FUNCIONARIO',
  ativo         TINYINT(1) DEFAULT 1,
  criado_em     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pessoa_id) REFERENCES pessoas(id) ON DELETE CASCADE,
  COMMENT = 'Credenciais de acesso ao sistema'
) ENGINE=InnoDB;

-- 6. Tabela de Vinhos
CREATE TABLE IF NOT EXISTS vinhos (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nome         VARCHAR(200) NOT NULL,
  tipo         ENUM('Tinto','Branco','Rosé','Espumante','Porto') DEFAULT 'Tinto',
  regiao       VARCHAR(100),
  produtor     VARCHAR(200),
  ano_colheita INT,
  preco        DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantidade   INT DEFAULT 0,
  stock_minimo INT DEFAULT 10,
  descricao    TEXT,
  imagem_url   VARCHAR(500),
  ativo        TINYINT(1) DEFAULT 1,
  criado_em    DATETIME DEFAULT CURRENT_TIMESTAMP,
  COMMENT = 'Catálogo de vinhos'
) ENGINE=InnoDB;

-- 7. Tabela de Caves (locais de armazenamento)
CREATE TABLE IF NOT EXISTS caves (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nome            VARCHAR(200) NOT NULL,
  localizacao     VARCHAR(300),
  capacidade      INT DEFAULT 100,
  temperatura_ideal DECIMAL(5,1),
  humidade_ideal  DECIMAL(5,1),
  notas           TEXT,
  ativo           TINYINT(1) DEFAULT 1,
  criado_em       DATETIME DEFAULT CURRENT_TIMESTAMP,
  COMMENT = 'Caves de armazenamento de vinhos'
) ENGINE=InnoDB;

-- 8. Tabela de Vendas
CREATE TABLE IF NOT EXISTS vendas (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  codigo          VARCHAR(50) UNIQUE,
  pessoa_id       INT,
  cliente_id      INT,
  funcionario_id  INT,
  total           DECIMAL(10,2) NOT NULL DEFAULT 0,
  metodo_pagamento ENUM('DINHEIRO','CARTAO','MB_WAY','TRANSFERENCIA') DEFAULT 'DINHEIRO',
  estado          ENUM('PENDENTE','CONCLUIDA','CANCELADA') DEFAULT 'CONCLUIDA',
  notas           TEXT,
  criado_em       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pessoa_id) REFERENCES pessoas(id),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id),
  COMMENT = 'Registro de vendas'
) ENGINE=InnoDB;

-- 9. Tabela de Itens de Venda
CREATE TABLE IF NOT EXISTS itens_venda (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  venda_id    INT NOT NULL,
  vinho_id    INT NOT NULL,
  quantidade  INT NOT NULL DEFAULT 1,
  preco_unit  DECIMAL(10,2) NOT NULL,
  subtotal    DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
  FOREIGN KEY (vinho_id) REFERENCES vinhos(id),
  COMMENT = 'Items individuais de cada venda'
) ENGINE=InnoDB;

-- 10. Tabela de Movimentos de Stock
CREATE TABLE IF NOT EXISTS movimentos_stock (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  vinho_id     INT NOT NULL,
  tipo         ENUM('entrada','saida') NOT NULL,
  quantidade   INT NOT NULL,
  motivo       VARCHAR(200),
  funcionario_id INT,
  criado_em    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vinho_id) REFERENCES vinhos(id),
  FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id),
  COMMENT = 'Histórico de movimentos de stock (entradas e saídas)'
) ENGINE=InnoDB;

-- ============================================================
--  ÍNDICES PARA PERFORMANCE
--  Nota: Usamos DROP/CREATE para garantir idempotência
-- ============================================================

-- Pessoas
CREATE INDEX idx_pessoas_email ON pessoas(email);
CREATE INDEX idx_pessoas_telefone ON pessoas(telefone);

-- Clientes
CREATE INDEX idx_clientes_nif ON clientes(nif);

-- Utilizadores (username já tem UNIQUE, não precisa índice extra)

-- Vinhos
CREATE INDEX idx_vinhos_tipo ON vinhos(tipo);
CREATE INDEX idx_vinhos_regiao ON vinhos(regiao);
CREATE INDEX idx_vinhos_quantidade ON vinhos(quantidade);
CREATE INDEX idx_vinhos_ativo ON vinhos(ativo);

-- Vendas
CREATE INDEX idx_vendas_pessoa_id ON vendas(pessoa_id);
CREATE INDEX idx_vendas_cliente_id ON vendas(cliente_id);
CREATE INDEX idx_vendas_funcionario_id ON vendas(funcionario_id);
CREATE INDEX idx_vendas_criado_em ON vendas(criado_em);
CREATE INDEX idx_vendas_estado ON vendas(estado);

-- Itens de Venda
CREATE INDEX idx_itens_venda_venda_id ON itens_venda(venda_id);
CREATE INDEX idx_itens_venda_vinho_id ON itens_venda(vinho_id);

-- Movimentos Stock
CREATE INDEX idx_movimentos_stock_vinho_id ON movimentos_stock(vinho_id);
CREATE INDEX idx_movimentos_stock_criado_em ON movimentos_stock(criado_em);
CREATE INDEX idx_movimentos_stock_tipo ON movimentos_stock(tipo);

-- ============================================================
--  VISTAS ÚTEIS
-- ============================================================

-- Vista: Stock baixo (abaixo do mínimo)
CREATE OR REPLACE VIEW v_stock_baixo AS
SELECT
  id, nome, tipo, regiao, produtor, quantidade, stock_minimo,
  (stock_minimo - quantidade) AS deficit
FROM vinhos
WHERE quantidade < stock_minimo AND ativo = 1
ORDER BY deficit DESC;

-- Vista: Vendas de hoje
CREATE OR REPLACE VIEW v_vendas_hoje AS
SELECT
  v.id, v.codigo, p.nome as cliente, v.total, v.metodo_pagamento,
  GROUP_CONCAT(vi.nome SEPARATOR ', ') as produtos,
  f.pessoa_id
FROM vendas v
LEFT JOIN pessoas p ON v.pessoa_id = p.id
LEFT JOIN clientes c ON v.cliente_id = c.id
LEFT JOIN itens_venda iv ON v.id = iv.venda_id
LEFT JOIN vinhos vi ON iv.vinho_id = vi.id
LEFT JOIN funcionarios f ON v.funcionario_id = f.id
WHERE DATE(v.criado_em) = CURDATE() AND v.estado = 'CONCLUIDA'
GROUP BY v.id
ORDER BY v.criado_em DESC;

-- Vista: Top vinhos por receita
CREATE OR REPLACE VIEW v_top_vinhos AS
SELECT
  v.id, v.nome, v.tipo, v.regiao, v.produtor,
  COUNT(iv.id) as vendas, SUM(iv.quantidade) as quantidade_total,
  SUM(iv.subtotal) as receita_total, v.preco
FROM vinhos v
LEFT JOIN itens_venda iv ON v.id = iv.vinho_id
WHERE v.ativo = 1
GROUP BY v.id
ORDER BY receita_total DESC
LIMIT 20;

-- Vista: Movimentos de stock por vinho
CREATE OR REPLACE VIEW v_movimentos_resumo AS
SELECT
  v.id, v.nome, v.quantidade as stock_atual,
  COALESCE(SUM(CASE WHEN m.tipo = 'entrada' THEN m.quantidade ELSE 0 END), 0) as entradas,
  COALESCE(SUM(CASE WHEN m.tipo = 'saida' THEN m.quantidade ELSE 0 END), 0) as saidas
FROM vinhos v
LEFT JOIN movimentos_stock m ON v.id = m.vinho_id
WHERE v.ativo = 1
GROUP BY v.id
ORDER BY v.nome;

-- ============================================================
--  DADOS INICIAIS
-- ============================================================

-- Pessoas base
INSERT IGNORE INTO pessoas (id, nome, email, telefone) VALUES
(1,  'Pedro Gomes',   'pedro@vinhadouro.pt',  '912 345 678'),
(2,  'Ana Ferreira',  'ana@vinhadouro.pt',    '913 456 789'),
(3,  'Rui Almeida',   'rui@vinhadouro.pt',    '914 567 890'),
(4,  'Sofia Mendes',  'sofia@vinhadouro.pt',  '915 678 901'),
(5,  'Cliente Balcão','balcao@vinhadouro.pt', NULL),
(6,  'João Silva',    'joao@vinhadouro.pt',   '916 789 012'),
(7,  'Maria Santos',  'maria@vinhadouro.pt',  '917 890 123'),
(8,  'Carlos Costa',  'carlos@vinhadouro.pt', '918 901 234');

-- Clientes
INSERT IGNORE INTO clientes (id, pessoa_id, nif, data_nascimento, preferencias, ativo) VALUES
(1, 5, '123456789', '1980-05-15', '{"tipos": ["Tinto", "Rosé"], "regioes": ["Douro", "Alentejo"]}', 1),
(2, 6, '234567890', '1975-08-20', '{"tipos": ["Branco"], "regioes": ["Vinho Verde", "Dão"]}', 1),
(3, 7, '345678901', '1990-03-10', '{"tipos": ["Espumante", "Porto"], "regioes": ["Douro"]}', 1),
(4, 8, '456789012', '1985-11-25', '{"tipos": ["Tinto"], "regioes": ["Alentejo"]}', 1);

-- Funcionários
INSERT IGNORE INTO funcionarios (id, pessoa_id, cargo, salario, nivel, ativo) VALUES
(1, 1, 'Gerente Geral',     2500.00, 'GERENTE',     1),
(2, 2, 'Vendedora',         1400.00, 'FUNCIONARIO', 1),
(3, 3, 'Armazenista',       1300.00, 'FUNCIONARIO', 1),
(4, 4, 'Assistente Vendas', 1350.00, 'FUNCIONARIO', 1);

-- Utilizadores
-- Estas linhas guardam passwords em plaintext ("1234") apenas para o setup inicial.
-- No primeiro login bem-sucedido, server.py faz upgrade automático para hash pbkdf2:sha256.
-- Em produção, usar diretamente generate_password_hash() (werkzeug) ou bcrypt.
INSERT IGNORE INTO utilizadores (id, pessoa_id, username, password_hash, role, ativo) VALUES
(1, 1, 'gerente', '1234', 'GERENTE',     1),
(2, 2, 'loja',    '1234', 'FUNCIONARIO', 1),
(3, 3, 'stock',   '1234', 'ARMAZENISTA', 1),
(4, 4, 'admin',   '1234', 'ADMIN',       1);

-- Caves (locais de armazenamento)
INSERT IGNORE INTO caves (id, nome, localizacao, capacidade, temperatura_ideal, humidade_ideal, notas) VALUES
(1, 'Cave Principal',     'Subsolo Zona A',    500, 12.5, 65.0, 'Cave climatizada com controlo total'),
(2, 'Cave Secundária',    'Subsolo Zona B',    300, 12.5, 65.0, 'Cave para stock de longa duração'),
(3, 'Montra Loja',         'Piso 1',          50,  16.0, 55.0, 'Ambiente expositor para vinhos premium em destaque');

-- Vinhos (catálogo ampliado com 20+ vinhos)
INSERT IGNORE INTO vinhos (id, nome, tipo, regiao, produtor, ano_colheita, preco, quantidade, stock_minimo, descricao, ativo) VALUES
(1,  'Barca Velha',                     'Tinto',     'Douro',        'Casa Ferreirinha',         2011, 280.00, 24,  5,  'O vinho mais icónico de Portugal. Complexo e elegante, com notas de fruta madura, especiarias e madeira fina.', 1),
(2,  'Quinta do Crasto Reserva',        'Tinto',     'Douro',        'Quinta do Crasto',         2020, 28.50,  96,  12, 'Intenso e encorpado, com aromas de ameixa, cereja negra e toques de baunilha. Acabamento longo e sedoso.', 1),
(3,  'Herdade do Esporão Reserva',      'Tinto',     'Alentejo',     'Esporão',                  2019, 18.90, 144, 20, 'Clássico alentejano com corpo pleno, fruta madura e taninos elegantes. Excelente relação qualidade-preço.', 1),
(4,  'Anselmo Mendes Alvarinho',        'Branco',    'Vinho Verde',  'Anselmo Mendes',           2022, 16.50,  72,  15, 'Frescura inigualável com notas cítricas, floral e mineral. O melhor Alvarinho da região do Minho.', 1),
(5,  'Casa de Santar Reserva',          'Branco',    'Dão',          'Casa de Santar',           2021, 14.80,  60,  12, 'Elegante e equilibrado, com aroma a pêssego, pêra e toque subtil de amêndoa. Final persistente e fresco.', 1),
(6,  'Quinta dos Murças Rosé',          'Rosé',      'Douro',        'Quinta dos Murças',        2022, 12.50,  48,  10, 'Rosé premium do Douro com cor salmão vibrante. Notas de morango, framboesa e uma acidez refrescante.', 1),
(7,  'Graham''s Late Bottled Vintage',  'Porto',     'Douro',        'Graham''s',                2018, 19.90,  36,  8,  'Porto LBV com toda a estrutura e complexidade de um vintage. Ameixa, chocolate e especiarias num final eterno.', 1),
(8,  'Luís Pato Baga',                  'Tinto',     'Bairrada',     'Luís Pato',                2018, 22.00,  54,  10, 'Baga clássica da Bairrada com perfil elegante, acidez fresca e taninos firmes. Evolui magnificamente.', 1),
(9,  'Niepoort Redoma Branco',          'Branco',    'Douro',        'Niepoort',                 2021, 24.50,  42,  8,  'Branco de altitude com grande mineralidade. Complexo, untuoso e com potencial de guarda excepcional.', 1),
(10, 'Mouchão Tonel 3-4',               'Tinto',     'Alentejo',     'Herdade de Mouchão',       2017, 45.00,  18,  5,  'Um dos tintos mais ricos e complexos do Alentejo. Alicante Bouschet profundo com décadas de história.', 1),
(11, 'Bacalhôa Moscatel de Setúbal',    'Porto',     'Setúbal',      'Bacalhôa Vinhos',          2015, 16.80,  30,  6,  'Moscatel suntuoso com cor âmbar dourado, aromas de flor de laranjeira, mel e figo seco. Doce perfeição.', 1),
(12, 'Ravasqueira Syrah',               'Tinto',     'Alentejo',     'Monte da Ravasqueira',     2020, 17.50,  66, 12, 'Syrah de excelência alentejana. Pimenta preta, violeta e fruta escura num tinto moderno e sedutor.', 1),
(13, 'Dirk Niepoort Charme',            'Tinto',     'Douro',        'Niepoort',                 2020, 35.00,  28,  8,  'Elegante e sofisticado, frutos vermelhos maduros com notas florais. Taninhos sedosos e final persistente.', 1),
(14, 'Esporão Branco Grande Escolha',   'Branco',    'Alentejo',     'Herdade do Esporão',       2021, 10.85,  120, 20, 'Fresco, tropical, com boa mineralidade. Excelente aperitivo ou acompanhamento para peixes delicados.', 1),
(15, 'Luis Pato Vinhas Velhas Branco',  'Branco',    'Bairrada',     'Luís Pato',                2021, 18.50,  45,  10, 'Vinhas velhas com impressionante complexidade. Estrutura firme e final mineral muito persistente.', 1),
(16, 'Meia Encosta Rosé',               'Rosé',      'Bairrada',     'Adega de Cantanhede',      2023, 7.50,   80,  15, 'Fresco, frutos vermelhos, fácil de beber. Perfeito para ocasiões informais de convívio.', 1),
(17, 'Quinta da Pellada Primus',        'Tinto',     'Dão',          'Quinta da Pellada',        2018, 32.00,  35,  8,  'Tourigo Nacional velho de Dão. Premium de excelência, com estrutura e potencial de envelhecimento.', 1),
(18, 'Quinta do Vale Meão',             'Tinto',     'Douro',        'Quinta do Vale Meão',      2020, 55.00,  12,  5,  'Grande terroir do Douro Superior. Ícone internacional com reconhecimento crítico em todo o mundo.', 1),
(19, 'Raposeira Superior Brut',         'Espumante', 'Beira Interior','Raposeira',                2020, 12.40,  90,  20, 'O espumante premium português. Pérolas finas, elegância na boca e acabamento seco perfeito.', 1),
(20, 'Casal Mendes Vinho Verde',        'Branco',    'Vinho Verde',  'Casal Mendes',             2023, 5.50,  200, 30, 'Leve e refrescante, com notas de maçã verde e cítricos. O melhor custo-benefício para consumo diário.', 1),
(21, 'Herdade do Rocim Trincadeira',    'Tinto',     'Alentejo',     'Herdade do Rocim',         2019, 14.50,  75,  12, 'Trincadeira puro com elegância. Acidez vibrante e taninos estruturados. Ótima evolução em garrafa.', 1),
(22, 'Adega de Borba Garrafeira',       'Tinto',     'Alentejo',     'Adega de Borba',           2015, 25.00,  22,  6,  'Vinho de guarda com 8 anos. Terciários complexos, estrutura fina e final sedoso e persistente.', 1);

-- Vendas de exemplo
INSERT IGNORE INTO vendas (id, codigo, pessoa_id, cliente_id, funcionario_id, total, metodo_pagamento, estado, criado_em) VALUES
(1,  'VD-2026-001', 5, 1, 2, 285.00, 'CARTAO',       'CONCLUIDA', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(2,  'VD-2026-002', 5, 2, 2, 57.00,  'DINHEIRO',     'CONCLUIDA', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3,  'VD-2026-003', 6, 3, 4, 140.00, 'MB_WAY',       'CONCLUIDA', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(4,  'VD-2026-004', 7, 4, 2, 94.50,  'CARTAO',       'CONCLUIDA', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(5,  'VD-2026-005', 8, 1, 4, 178.00, 'DINHEIRO',     'CONCLUIDA', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(6,  'VD-2026-006', 5, 2, 2, 45.00,  'MB_WAY',       'CONCLUIDA', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(7,  'VD-2026-007', 6, 3, 4, 224.00, 'CARTAO',       'CONCLUIDA', NOW()),
(8,  'VD-2026-008', 7, 4, 2, 67.50,  'TRANSFERENCIA','PENDENTE',  NOW());

-- Itens das vendas
INSERT IGNORE INTO itens_venda (venda_id, vinho_id, quantidade, preco_unit, subtotal) VALUES
(1, 1,  1, 280.00, 280.00),
(1, 6,  1,  12.50,  12.50),
(2, 3,  2,  18.90,  37.80),
(2, 20, 1,   5.50,   5.50),
(3, 2,  2,  28.50,  57.00),
(3, 7,  2,  19.90,  39.80),
(3, 4,  1,  16.50,  16.50),
(4, 9,  2,  24.50,  49.00),
(4, 5,  3,  14.80,  44.40),
(5, 10, 2,  45.00,  90.00),
(5, 8,  2,  22.00,  44.00),
(5, 11, 2,  16.80,  33.60),
(6, 4,  2,  16.50,  33.00),
(6, 6,  1,  12.50,  12.50),
(7, 1,  1, 280.00, 280.00),
(7, 12, 1,  17.50,  17.50),
(7, 5,  1,  14.80,  14.80),
(8, 3,  2,  18.90,  37.80),
(8, 12, 1,  17.50,  17.50),
(8, 6,  1,  12.50,  12.50);

-- Movimentos de stock
INSERT IGNORE INTO movimentos_stock (id, vinho_id, tipo, quantidade, motivo, funcionario_id, criado_em) VALUES
(1, 1, 'entrada', 10, 'Compra a produtor', 3, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(2, 1, 'saida',   3, 'Venda balcão', 2, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(3, 2, 'entrada', 20, 'Compra a produtor', 3, DATE_SUB(NOW(), INTERVAL 25 DAY)),
(4, 2, 'saida',   2, 'Venda balcão', 2, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(5, 3, 'entrada', 30, 'Compra a distribuidor', 3, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(6, 3, 'saida',   2, 'Venda balcão', 2, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(7, 4, 'entrada', 25, 'Compra a produtor', 3, DATE_SUB(NOW(), INTERVAL 18 DAY)),
(8, 5, 'entrada', 15, 'Compra a produtor', 3, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(9, 6, 'saida',   1, 'Venda balcão', 2, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(10, 10, 'entrada', 5, 'Reposição especial', 3, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(11, 20, 'entrada', 50, 'Compra a distribuidor', 3, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(12, 20, 'saida', 10, 'Venda balcão', 2, DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ============================================================
SELECT 'Vinha D''Ouro — base de dados melhorada criada com sucesso! ✓' AS status;
-- ============================================================
