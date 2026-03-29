-- Sample Data for Vinha D'Ouro
-- Use this to populate test data in the database

USE vinhadouro;

-- Sample Pessoas (People)
INSERT INTO pessoas (nome, telefone, email, endereco, cidade, codigo_postal, nif) VALUES
('João Silva', '919876543', 'joao@example.com', 'Rua A, 123', 'Lisboa', '1000-001', '123456789'),
('Maria Santos', '918765432', 'maria@example.com', 'Rua B, 456', 'Porto', '4000-001', '123456790'),
('Carlos Oliveira', '917654321', 'carlos@example.com', 'Rua C, 789', 'Braga', '4700-001', '123456791'),
('Ana Costa', '916543210', 'ana@example.com', 'Rua D, 321', 'Covilhã', '6200-001', '123456792'),
('Cliente Genérico', '915432109', 'cliente@example.com', 'Rua E, 654', 'Évora', '7000-001', '123456793');

-- Sample Utilizadores (Users)
INSERT INTO utilizadores (username, password, pessoa_id, role, ativo) VALUES
('joao.silva', 'password123', 1, 'ADMIN', TRUE),
('maria.santos', 'password123', 2, 'VENDEDOR', TRUE),
('carlos.oliveira', 'password123', 3, 'GERENTE', TRUE);

-- Sample Funcionarios (Employees)
INSERT INTO funcionarios (pessoa_id, posicao, data_admissao, salario, ativo) VALUES
(1, 'Gerente Geral', '2020-01-15', 2500.00, TRUE),
(2, 'Vendedor', '2021-03-20', 1200.00, TRUE),
(3, 'Encarregado de Armazém', '2022-06-10', 1500.00, TRUE);

-- Sample Vinhos (Wines)
INSERT INTO vinhos (nome, tipo, descricao, regiao, ano_colheita, preco, stock, stock_minimo, ativo) VALUES
('Douro Reserve 2019', 'Tinto', 'Vinho tinto encorpado do Douro', 'Douro', 2019, 45.50, 30, 5, TRUE),
('Vinho Verde 2023', 'Branco', 'Vinho verde fresco e jovem', 'Minho', 2023, 8.90, 50, 10, TRUE),
('Madeira Special', 'Fortificado', 'Vinho Madeira envelhecido', 'Madeira', 2010, 35.00, 15, 5, TRUE),
('Alentejo Robusto 2020', 'Tinto', 'Vinho tinto robusto do Alentejo', 'Alentejo', 2020, 22.50, 8, 10, TRUE),
('Champagne Style 2021', 'Espumante', 'Espumante bruto português', 'Bairrada', 2021, 28.00, 25, 5, TRUE),
('Vinho de Colheita 2015', 'Tinto', 'Tinto envelhecido em madeira', 'Douro', 2015, 55.00, 3, 5, TRUE),
('Branco da Bairrada 2022', 'Branco', 'Branco seco de qualidade', 'Bairrada', 2022, 15.90, 40, 10, TRUE);

-- Sample Vendas (Sales) - Today's date
INSERT INTO vendas (utilizador_id, cliente_id, data_venda, total, status) VALUES
(1, 5, NOW(), 0, 'COMPLETADA'),
(2, 5, DATE_SUB(NOW(), INTERVAL 1 DAY), 0, 'COMPLETADA'),
(1, NULL, DATE_SUB(NOW(), INTERVAL 2 DAY), 0, 'COMPLETADA');

-- Sample Itens Venda (Sale Items)
INSERT INTO itens_venda (venda_id, vinho_id, quantidade, preco_unitario, subtotal) VALUES
(1, 1, 2, 45.50, 91.00),
(1, 2, 3, 8.90, 26.70),
(2, 5, 1, 28.00, 28.00),
(3, 3, 2, 35.00, 70.00);

-- Update Vendas totals
UPDATE vendas SET total = 117.70 WHERE id = 1;
UPDATE vendas SET total = 28.00 WHERE id = 2;
UPDATE vendas SET total = 70.00 WHERE id = 3;

-- Display sample data
SELECT 'Pessoas:' as info;
SELECT id, nome, email, nif FROM pessoas;

SELECT '\nUtilizadores:' as info;
SELECT id, username, role FROM utilizadores;

SELECT '\nFuncionarios:' as info;
SELECT f.id, p.nome, f.posicao, f.salario FROM funcionarios f JOIN pessoas p ON f.pessoa_id = p.id;

SELECT '\nVinhos:' as info;
SELECT id, nome, tipo, preco, stock FROM vinhos;

SELECT '\nVendas:' as info;
SELECT v.id, u.username, v.data_venda, v.total, v.status FROM vendas v JOIN utilizadores u ON v.utilizador_id = u.id;

SELECT '\nItens Venda:' as info;
SELECT iv.id, iv.venda_id, vi.nome, iv.quantidade, iv.preco_unitario, iv.subtotal FROM itens_venda iv JOIN vinhos vi ON iv.vinho_id = vi.id;
