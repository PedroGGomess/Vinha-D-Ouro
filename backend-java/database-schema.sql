-- Vinha D'Ouro Database Schema
-- This script shows the expected database structure
-- The database should already exist with these tables

USE vinhadouro;

-- Pessoas Table (Base table for all individuals)
CREATE TABLE IF NOT EXISTS pessoas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco VARCHAR(500),
    cidade VARCHAR(100),
    codigo_postal VARCHAR(20),
    nif VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Funcionarios Table (Employees)
CREATE TABLE IF NOT EXISTS funcionarios (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    pessoa_id BIGINT NOT NULL,
    posicao VARCHAR(100) NOT NULL,
    data_admissao DATE NOT NULL,
    data_saida DATE,
    salario DECIMAL(10, 2),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pessoa_id) REFERENCES pessoas(id)
);

-- Utilizadores Table (Users)
CREATE TABLE IF NOT EXISTS utilizadores (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    pessoa_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso TIMESTAMP,
    FOREIGN KEY (pessoa_id) REFERENCES pessoas(id)
);

-- Vinhos Table (Wines)
CREATE TABLE IF NOT EXISTS vinhos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    regiao VARCHAR(100),
    ano_colheita INT,
    preco DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    stock_minimo INT NOT NULL DEFAULT 5,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendas Table (Sales)
CREATE TABLE IF NOT EXISTS vendas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    utilizador_id BIGINT NOT NULL,
    cliente_id BIGINT,
    data_venda TIMESTAMP NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETADA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id),
    FOREIGN KEY (cliente_id) REFERENCES pessoas(id)
);

-- Itens Venda Table (Sale Items)
CREATE TABLE IF NOT EXISTS itens_venda (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    venda_id BIGINT NOT NULL,
    vinho_id BIGINT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venda_id) REFERENCES vendas(id),
    FOREIGN KEY (vinho_id) REFERENCES vinhos(id)
);

-- Create Indexes for performance
CREATE INDEX idx_pessoas_nif ON pessoas(nif);
CREATE INDEX idx_pessoas_email ON pessoas(email);
CREATE INDEX idx_funcionarios_pessoa_id ON funcionarios(pessoa_id);
CREATE INDEX idx_utilizadores_username ON utilizadores(username);
CREATE INDEX idx_utilizadores_pessoa_id ON utilizadores(pessoa_id);
CREATE INDEX idx_vinhos_ativo ON vinhos(ativo);
CREATE INDEX idx_vinhos_stock ON vinhos(stock);
CREATE INDEX idx_vendas_utilizador_id ON vendas(utilizador_id);
CREATE INDEX idx_vendas_cliente_id ON vendas(cliente_id);
CREATE INDEX idx_vendas_data_venda ON vendas(data_venda);
CREATE INDEX idx_itens_venda_venda_id ON itens_venda(venda_id);
CREATE INDEX idx_itens_venda_vinho_id ON itens_venda(vinho_id);
