#!/usr/bin/env python3
"""
Vinha D'Ouro — Servidor Python + MySQL Melhorado
Versão com endpoints adicionais para caves, provas, stock e relatórios
Usa MySQL local — liga ao teu MySQL Workbench!
Corre: python3 server_improved.py
Site:  http://localhost:8080
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import datetime, json, os

# ── MySQL connection ──────────────────────────────────────
try:
    import pymysql
    import pymysql.cursors
    MYSQL_AVAILABLE = True
except ImportError:
    MYSQL_AVAILABLE = False

import sqlite3  # fallback

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=BASE_DIR, static_url_path='')
CORS(app)

# ── DB Config ─────────────────────────────────────────────
DB_TYPE   = 'mysql' if MYSQL_AVAILABLE else 'sqlite'
MYSQL_CFG = {
    'host':     'localhost',
    'port':     3306,
    'user':     'root',
    'password': '2006',
    'database': 'vinhadouro',
    'charset':  'utf8mb4',
    'cursorclass': None,  # set at runtime
    'autocommit': True,
}

def get_db():
    """Obter conexão com a base de dados (MySQL ou SQLite)"""
    if DB_TYPE == 'mysql' and MYSQL_AVAILABLE:
        try:
            cfg = {**MYSQL_CFG, 'cursorclass': pymysql.cursors.DictCursor}
            conn = pymysql.connect(**cfg)
            return conn, 'mysql'
        except Exception as e:
            print(f"  ⚠️  MySQL falhou ({e}), a usar SQLite como fallback")
    path = os.path.join(BASE_DIR, 'vinhadouro.db')
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn, 'sqlite'

def db_exec(conn, db_type, sql, params=()):
    """Executar uma query, tratando diferenças MySQL vs SQLite"""
    if db_type == 'mysql':
        sql = sql.replace('?', '%s')
        with conn.cursor() as cur:
            cur.execute(sql, params)
            return cur
    else:
        return conn.execute(sql, params)

def db_fetchall(conn, db_type, sql, params=()):
    """Buscar todos os registos"""
    cur = db_exec(conn, db_type, sql, params)
    if db_type == 'mysql':
        return cur.fetchall()
    return [dict(r) for r in cur.fetchall()]

def db_fetchone(conn, db_type, sql, params=()):
    """Buscar um único registo"""
    cur = db_exec(conn, db_type, sql, params)
    if db_type == 'mysql':
        return cur.fetchone()
    r = cur.fetchone()
    return dict(r) if r else None

def db_lastrowid(conn, db_type, cur):
    """Obter ID da última linha inserida"""
    if db_type == 'mysql':
        return cur.lastrowid
    return cur.lastrowid

# ── Init DB ───────────────────────────────────────────────
def init_db():
    """Inicializar base de dados"""
    conn, db_type = get_db()

    if db_type == 'mysql':
        _init_mysql(conn)
    else:
        _init_sqlite(conn)

    conn.close()
    print(f"  ✅  Base de dados inicializada ({db_type.upper()})")

def _init_mysql(conn):
    """Inicializar tabelas MySQL básicas (compatibilidade)"""
    with conn.cursor() as c:
        c.execute("""
        CREATE TABLE IF NOT EXISTS utilizadores (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pessoa_id INT,
            username VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('FUNCIONARIO','GERENTE','ARMAZENISTA','ADMIN') DEFAULT 'FUNCIONARIO',
            ativo TINYINT(1) DEFAULT 1,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)

        c.execute("""
        CREATE TABLE IF NOT EXISTS pessoas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(150) NOT NULL,
            email VARCHAR(150),
            telefone VARCHAR(30)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)

        c.execute("""
        CREATE TABLE IF NOT EXISTS funcionarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pessoa_id INT REFERENCES pessoas(id),
            cargo VARCHAR(100),
            salario DECIMAL(10,2) DEFAULT 0,
            data_admissao DATE,
            ativo TINYINT(1) DEFAULT 1,
            nivel_acesso VARCHAR(30) DEFAULT 'FUNCIONARIO'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)

        c.execute("""
        CREATE TABLE IF NOT EXISTS vinhos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(200) NOT NULL,
            tipo VARCHAR(50),
            regiao VARCHAR(100),
            produtor VARCHAR(150),
            ano_colheita INT,
            preco DECIMAL(10,2) DEFAULT 0,
            quantidade INT DEFAULT 0,
            descricao TEXT,
            imagem_url VARCHAR(500)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)

        c.execute("""
        CREATE TABLE IF NOT EXISTS vendas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            funcionario_id INT,
            data_venda DATETIME DEFAULT CURRENT_TIMESTAMP,
            metodo_pagamento VARCHAR(50),
            status VARCHAR(30) DEFAULT 'CONCLUIDA',
            total DECIMAL(10,2) DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)

        c.execute("""
        CREATE TABLE IF NOT EXISTS itens_venda (
            id INT AUTO_INCREMENT PRIMARY KEY,
            venda_id INT REFERENCES vendas(id),
            vinho_id INT REFERENCES vinhos(id),
            quantidade INT DEFAULT 1,
            preco_unitario DECIMAL(10,2) DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)

        c.execute("""
        CREATE TABLE IF NOT EXISTS provas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(200),
            data_evento DATETIME,
            descricao TEXT,
            max_participantes INT DEFAULT 20,
            preco_pessoa DECIMAL(10,2),
            vinho_ids JSON,
            ativo TINYINT DEFAULT 1,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)

        c.execute("""
        CREATE TABLE IF NOT EXISTS caves (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(200),
            localizacao VARCHAR(300),
            capacidade INT DEFAULT 0,
            temperatura_ideal DECIMAL(4,1),
            humidade_ideal DECIMAL(4,1),
            notas TEXT,
            ativo TINYINT DEFAULT 1,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)

        c.execute("""
        CREATE TABLE IF NOT EXISTS movimentos_stock (
            id INT AUTO_INCREMENT PRIMARY KEY,
            vinho_id INT,
            tipo ENUM('ENTRADA','SAIDA','AJUSTE','TRANSFERENCIA'),
            quantidade INT,
            motivo VARCHAR(300),
            funcionario_id INT,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (vinho_id) REFERENCES vinhos(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)

        c.execute("""
        CREATE TABLE IF NOT EXISTS clientes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            pessoa_id INT,
            nif VARCHAR(20),
            data_nascimento DATE,
            preferencias JSON,
            ativo TINYINT DEFAULT 1,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """)

        conn.commit()

        # Seed data
        c.execute("SELECT COUNT(*) as cnt FROM utilizadores")
        if c.fetchone()['cnt'] == 0:
            _seed_mysql(conn, c)

def _seed_mysql(conn, c):
    """Preencher dados iniciais MySQL"""
    # Inserir pessoas primeiro
    pessoas = [
        ("António Ferreira", "gerente@vinhadouro.pt", "912000001"),
        ("Sofia Martins", "loja@vinhadouro.pt", "912000002"),
        ("João Rodrigues", "stock@vinhadouro.pt", "912000003"),
        ("Admin Sistema", "admin@vinhadouro.pt", "912000004"),
    ]
    for p in pessoas:
        c.execute("INSERT IGNORE INTO pessoas (nome,email,telefone) VALUES (%s,%s,%s)", p)
    conn.commit()
    utilizadores = [
        (1, "gerente", "1234", "GERENTE"),
        (2, "loja",    "1234", "FUNCIONARIO"),
        (3, "stock",   "1234", "ARMAZENISTA"),
        (4, "admin",   "1234", "ADMIN"),
    ]
    for u in utilizadores:
        c.execute("INSERT IGNORE INTO utilizadores (pessoa_id,username,password_hash,role) VALUES (%s,%s,%s,%s)", u)

    vinhos = [
        ("Anselmo Mendes Alvarinho","Branco","Vinho Verde","Anselmo Mendes",2022,14.90,21,"Fresco e mineral, notas cítricas e floral",None),
        ("Barca Velha","Tinto","Douro","Casa Ferreirinha",2011,185.00,3,"O vinho mais icónico de Portugal. Complexidade única",None),
        ("Dirk Niepoort Charme","Tinto","Douro","Niepoort",2020,45.00,9,"Elegante e sofisticado, frutos vermelhos maduros",None),
        ("Esporão Branco Grande Escolha","Branco","Alentejo","Herdade do Esporão",2021,10.85,40,"Fresco, tropical, com boa mineralidade",None),
        ("Luis Pato Vinhas Velhas Branco","Branco","Bairrada","Luís Pato",2021,18.50,20,"Vinhas velhas com impressionante complexidade",None),
        ("Meia Encosta Rosé","Rosé","Bairrada","Adega de Cantanhede",2023,7.50,30,"Fresco, frutos vermelhos, fácil de beber",None),
        ("Mouchão Tonel 3-4","Tinto","Alentejo","Herdade do Mouchão",2015,62.00,2,"Vinho histórico. Castelão de excelência",None),
        ("Niepoort Redoma Tinto","Tinto","Douro","Niepoort",2020,27.00,15,"Elegante, terroir duriense puro",None),
        ("Quinta da Pellada Primus","Tinto","Dão","Quinta da Pellada",2018,32.00,11,"Tourigo Nacional velho de Dão. Premium",None),
        ("Quinta do Crasto Reserva","Tinto","Douro","Quinta do Crasto",2019,23.90,28,"Clássico do Douro. Frutas negras, taninos sedosos",None),
        ("Quinta do Vale Meão","Tinto","Douro","Quinta do Vale Meão",2020,55.00,7,"Grande terroir do Douro Superior. Ícone",None),
        ("Raposeira Superior Brut","Espumante","Beira Interior","Raposeira",None,12.40,18,"O espumante premium português. Pérolas finas",None),
    ]
    for v in vinhos:
        c.execute("""INSERT IGNORE INTO vinhos (nome,tipo,regiao,produtor,ano_colheita,preco,quantidade,descricao,imagem_url)
                     VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""", v)

    pessoas = [
        ("António Ferreira","antonio@vinhadouro.pt","912345678"),
        ("Sofia Martins","sofia@vinhadouro.pt","913456789"),
        ("João Rodrigues","joao@vinhadouro.pt","914567890"),
        ("Maria Costa","maria@vinhadouro.pt","915678901"),
    ]
    ids = []
    for p in pessoas:
        c.execute("INSERT IGNORE INTO pessoas (nome,email,telefone) VALUES (%s,%s,%s)", p)
        ids.append(c.lastrowid)

    funcionarios = [
        (ids[0],"Gerente",2800.00,"2022-01-15",1,"GERENTE"),
        (ids[1],"Operador POS",1200.00,"2023-03-01",1,"FUNCIONARIO"),
        (ids[2],"Armazenista",1150.00,"2023-06-15",1,"ARMAZENISTA"),
        (ids[3],"Operador POS",1200.00,"2024-01-10",1,"FUNCIONARIO"),
    ]
    for f in funcionarios:
        c.execute("INSERT IGNORE INTO funcionarios (pessoa_id,cargo,salario,data_admissao,ativo,nivel_acesso) VALUES (%s,%s,%s,%s,%s,%s)", f)

    import random
    metodos = ["Cartão","MB Way","Numerário","Cartão"]
    for i in range(8):
        dias = random.randint(0,30)
        dt = (datetime.datetime.now() - datetime.timedelta(days=dias)).strftime("%Y-%m-%d %H:%M:%S")
        total = round(random.uniform(15,200),2)
        c.execute("INSERT INTO vendas (funcionario_id,data_venda,metodo_pagamento,status,total) VALUES (%s,%s,%s,%s,%s)",
                  (1, dt, metodos[i%4], "CONCLUIDA", total))
        vid = c.lastrowid
        c.execute("INSERT INTO itens_venda (venda_id,vinho_id,quantidade,preco_unitario) VALUES (%s,%s,%s,%s)",
                  (vid, (i%12)+1, 1, total))

    conn.commit()

def _init_sqlite(conn):
    """Inicializar tabelas SQLite básicas"""
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS pessoas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT,
        telefone TEXT
    );
    CREATE TABLE IF NOT EXISTS utilizadores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pessoa_id INTEGER,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'FUNCIONARIO',
        ativo INTEGER DEFAULT 1,
        criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pessoa_id) REFERENCES pessoas(id)
    );
    CREATE TABLE IF NOT EXISTS pessoas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL, email TEXT, telefone TEXT
    );
    CREATE TABLE IF NOT EXISTS funcionarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pessoa_id INTEGER, cargo TEXT, salario REAL DEFAULT 0,
        data_admissao TEXT, ativo INTEGER DEFAULT 1, nivel_acesso TEXT DEFAULT 'FUNCIONARIO'
    );
    CREATE TABLE IF NOT EXISTS vinhos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL, tipo TEXT, regiao TEXT, produtor TEXT,
        ano_colheita INTEGER, preco REAL DEFAULT 0, quantidade INTEGER DEFAULT 0,
        descricao TEXT, imagem_url TEXT
    );
    CREATE TABLE IF NOT EXISTS vendas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        funcionario_id INTEGER, data_venda TEXT, metodo_pagamento TEXT,
        status TEXT DEFAULT 'CONCLUIDA', total REAL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS itens_venda (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venda_id INTEGER, vinho_id INTEGER,
        quantidade INTEGER DEFAULT 1, preco_unitario REAL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS provas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        data_evento TEXT,
        descricao TEXT,
        max_participantes INTEGER DEFAULT 20,
        preco_pessoa REAL,
        vinho_ids TEXT,
        ativo INTEGER DEFAULT 1,
        criado_em TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS caves (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        localizacao TEXT,
        capacidade INTEGER DEFAULT 0,
        temperatura_ideal REAL,
        humidade_ideal REAL,
        notas TEXT,
        ativo INTEGER DEFAULT 1,
        criado_em TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS movimentos_stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vinho_id INTEGER,
        tipo TEXT,
        quantidade INTEGER,
        motivo TEXT,
        funcionario_id INTEGER,
        criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vinho_id) REFERENCES vinhos(id)
    );
    CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pessoa_id INTEGER,
        nif TEXT,
        data_nascimento TEXT,
        preferencias TEXT,
        ativo INTEGER DEFAULT 1,
        criado_em TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)
    if conn.execute("SELECT COUNT(*) FROM utilizadores").fetchone()[0] == 0:
        _seed_sqlite(conn)

def _seed_sqlite(conn):
    """Preencher dados iniciais SQLite"""
    conn.executemany("INSERT INTO pessoas (nome,email,telefone) VALUES (?,?,?)", [
        ("António Ferreira","gerente@vinhadouro.pt","912000001"),
        ("Sofia Martins","loja@vinhadouro.pt","912000002"),
        ("João Rodrigues","stock@vinhadouro.pt","912000003"),
        ("Admin Sistema","admin@vinhadouro.pt","912000004"),
    ])
    conn.executemany("INSERT INTO utilizadores (pessoa_id,username,password_hash,role) VALUES (?,?,?,?)", [
        (1,"gerente","1234","GERENTE"),
        (2,"loja","1234","FUNCIONARIO"),
        (3,"stock","1234","ARMAZENISTA"),
        (4,"admin","1234","ADMIN"),
    ])
    vinhos = [
        ("Anselmo Mendes Alvarinho","Branco","Vinho Verde","Anselmo Mendes",2022,14.90,21,"Fresco e mineral",None),
        ("Barca Velha","Tinto","Douro","Casa Ferreirinha",2011,185.00,3,"O vinho mais icónico de Portugal",None),
        ("Dirk Niepoort Charme","Tinto","Douro","Niepoort",2020,45.00,9,"Elegante e sofisticado",None),
        ("Esporão Branco Grande Escolha","Branco","Alentejo","Herdade do Esporão",2021,10.85,40,"Fresco, tropical",None),
        ("Luis Pato Vinhas Velhas Branco","Branco","Bairrada","Luís Pato",2021,18.50,20,"Vinhas velhas",None),
        ("Meia Encosta Rosé","Rosé","Bairrada","Adega de Cantanhede",2023,7.50,30,"Fresco, frutos vermelhos",None),
        ("Mouchão Tonel 3-4","Tinto","Alentejo","Herdade do Mouchão",2015,62.00,2,"Vinho histórico",None),
        ("Niepoort Redoma Tinto","Tinto","Douro","Niepoort",2020,27.00,15,"Elegante, terroir",None),
        ("Quinta da Pellada Primus","Tinto","Dão","Quinta da Pellada",2018,32.00,11,"Tourigo Nacional",None),
        ("Quinta do Crasto Reserva","Tinto","Douro","Quinta do Crasto",2019,23.90,28,"Clássico do Douro",None),
        ("Quinta do Vale Meão","Tinto","Douro","Quinta do Vale Meão",2020,55.00,7,"Grande terroir",None),
        ("Raposeira Superior Brut","Espumante","Beira Interior","Raposeira",None,12.40,18,"Espumante premium",None),
    ]
    conn.executemany("INSERT INTO vinhos (nome,tipo,regiao,produtor,ano_colheita,preco,quantidade,descricao,imagem_url) VALUES (?,?,?,?,?,?,?,?,?)", vinhos)
    pessoas = [
        ("António Ferreira","antonio@vinhadouro.pt","912345678"),
        ("Sofia Martins","sofia@vinhadouro.pt","913456789"),
        ("João Rodrigues","joao@vinhadouro.pt","914567890"),
        ("Maria Costa","maria@vinhadouro.pt","915678901"),
    ]
    ids = []
    for p in pessoas:
        c = conn.execute("INSERT INTO pessoas (nome,email,telefone) VALUES (?,?,?)", p)
        ids.append(c.lastrowid)
    conn.executemany("INSERT INTO funcionarios (pessoa_id,cargo,salario,data_admissao,ativo,nivel_acesso) VALUES (?,?,?,?,?,?)", [
        (ids[0],"Gerente",2800.00,"2022-01-15",1,"GERENTE"),
        (ids[1],"Operador POS",1200.00,"2023-03-01",1,"FUNCIONARIO"),
        (ids[2],"Armazenista",1150.00,"2023-06-15",1,"ARMAZENISTA"),
        (ids[3],"Operador POS",1200.00,"2024-01-10",1,"FUNCIONARIO"),
    ])
    import random
    metodos = ["Cartão","MB Way","Numerário","Cartão"]
    for i in range(8):
        dias = random.randint(0,30)
        dt = (datetime.datetime.now()-datetime.timedelta(days=dias)).strftime("%Y-%m-%d %H:%M:%S")
        total = round(random.uniform(15,200),2)
        c2 = conn.execute("INSERT INTO vendas (funcionario_id,data_venda,metodo_pagamento,status,total) VALUES (?,?,?,?,?)",
                           (1,dt,metodos[i%4],"CONCLUIDA",total))
        conn.execute("INSERT INTO itens_venda (venda_id,vinho_id,quantidade,preco_unitario) VALUES (?,?,?,?)",
                     (c2.lastrowid,(i%12)+1,1,total))
    conn.commit()

# ── Static Files ──────────────────────────────────────────
@app.route('/')
def index():
    """Servir página principal"""
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Servir ficheiros estáticos"""
    if not filename.startswith('api/'):
        return send_from_directory(BASE_DIR, filename)

# ── Health ────────────────────────────────────────────────
@app.route('/api/health')
def health():
    """Verificar saúde da API"""
    try:
        conn, db_type = get_db()
        conn.close()
        return jsonify({'status':'ok','db':db_type,'version':'3.0'})
    except Exception as e:
        return jsonify({'status':'error','message':str(e)}), 500

# ── AUTH ──────────────────────────────────────────────────
@app.route('/api/login', methods=['POST'])
def login():
    """Autenticar utilizador"""
    try:
        d = request.get_json() or {}
        username = d.get('username','').strip().lower()
        password = d.get('password','')
        if not username or not password:
            return jsonify({'error':'Credenciais em falta'}), 400
        conn, db_type = get_db()
        u = db_fetchone(conn, db_type,
            "SELECT u.id, u.username, u.password_hash, u.role, p.nome "
            "FROM utilizadores u LEFT JOIN pessoas p ON u.pessoa_id = p.id "
            "WHERE LOWER(u.username)=? AND u.password_hash=?",
            (username, password))
        conn.close()
        if not u:
            return jsonify({'error':'Utilizador ou senha incorretos'}), 401
        # Map role to redirect page
        role_redirects = {'GERENTE':'gerente.html','FUNCIONARIO':'loja.html','ARMAZENISTA':'stock.html','ADMIN':'gerente.html'}
        return jsonify({'id':u['id'],'username':u['username'],'nome':u.get('nome') or u['username'],'role':u['role'],'redirect':role_redirects.get(u['role'],'loja.html')})
    except Exception as e:
        return jsonify({'error':str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    """Terminar sessão"""
    return jsonify({'ok':True})

# ── VINHOS ────────────────────────────────────────────────
@app.route('/api/vinhos', methods=['GET'])
def listar_vinhos():
    """Listar todos os vinhos"""
    try:
        conn, db_type = get_db()
        rows = db_fetchall(conn, db_type, "SELECT * FROM vinhos ORDER BY nome")
        conn.close()
        result = []
        for r in rows:
            result.append({
                'id':          r['id'],
                'nome':        r['nome'],
                'tipo':        r['tipo'],
                'regiao':      r['regiao'],
                'produtor':    r['produtor'],
                'anoColheita': r['ano_colheita'],
                'preco':       float(r['preco'] or 0),
                'quantidade':  r['quantidade'] or 0,
                'descricao':   r.get('descricao') or '',
                'imagemUrl':   r.get('imagem_url') or '',
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({'error':str(e)}), 500

@app.route('/api/vinhos', methods=['POST'])
def criar_vinho():
    """Criar novo vinho"""
    try:
        d = request.get_json()
        if not d.get('nome'):
            return jsonify({'error':'Nome é obrigatório'}), 400
        conn, db_type = get_db()
        if db_type == 'mysql':
            with conn.cursor() as c:
                c.execute("""INSERT INTO vinhos (nome,tipo,regiao,produtor,ano_colheita,preco,quantidade,descricao)
                             VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
                          (d.get('nome'),d.get('tipo'),d.get('regiao'),d.get('produtor'),
                           d.get('anoColheita'),d.get('preco',0),d.get('quantidade',0),d.get('descricao','')))
                new_id = c.lastrowid
            conn.commit()
        else:
            c = conn.execute("INSERT INTO vinhos (nome,tipo,regiao,produtor,ano_colheita,preco,quantidade,descricao) VALUES (?,?,?,?,?,?,?,?)",
                             (d.get('nome'),d.get('tipo'),d.get('regiao'),d.get('produtor'),
                              d.get('anoColheita'),d.get('preco',0),d.get('quantidade',0),d.get('descricao','')))
            new_id = c.lastrowid
            conn.commit()
        conn.close()
        return jsonify({'id':new_id,**d}), 201
    except Exception as e:
        return jsonify({'error':str(e)}), 500

@app.route('/api/vinhos/<int:vid>', methods=['PUT'])
def atualizar_vinho(vid):
    """Atualizar vinho existente"""
    try:
        d = request.get_json()
        conn, db_type = get_db()
        db_exec(conn, db_type, """UPDATE vinhos SET nome=?,tipo=?,regiao=?,produtor=?,
                                   ano_colheita=?,preco=?,quantidade=?,descricao=? WHERE id=?""",
                (d.get('nome'),d.get('tipo'),d.get('regiao'),d.get('produtor'),
                 d.get('anoColheita'),d.get('preco',0),d.get('quantidade',0),d.get('descricao',''),vid))
        conn.commit()
        conn.close()
        return jsonify({'id':vid,**d})
    except Exception as e:
        return jsonify({'error':str(e)}), 500

@app.route('/api/vinhos/<int:vid>', methods=['DELETE'])
def apagar_vinho(vid):
    """Apagar vinho"""
    try:
        conn, db_type = get_db()
        db_exec(conn, db_type, "DELETE FROM vinhos WHERE id=?", (vid,))
        conn.commit()
        conn.close()
        return jsonify({'ok':True})
    except Exception as e:
        return jsonify({'error':str(e)}), 500

@app.route('/api/vinhos/<int:vid>/stock', methods=['PUT'])
def atualizar_stock(vid):
    """Atualizar quantidade em stock"""
    try:
        d = request.get_json()
        qty = d.get('quantidade', 0)
        if qty < 0:
            return jsonify({'error':'Quantidade não pode ser negativa'}), 400
        conn, db_type = get_db()
        db_exec(conn, db_type, "UPDATE vinhos SET quantidade=? WHERE id=?", (qty, vid))
        conn.commit()
        conn.close()
        return jsonify({'id':vid,'quantidade':qty})
    except Exception as e:
        return jsonify({'error':str(e)}), 500

@app.route('/api/vinhos/stock-critico')
def stock_critico():
    """Listar vinhos com stock crítico"""
    try:
        conn, db_type = get_db()
        rows = db_fetchall(conn, db_type, "SELECT * FROM vinhos WHERE quantidade < 10 ORDER BY quantidade")
        conn.close()
        return jsonify([{'id':r['id'],'nome':r['nome'],'quantidade':r['quantidade'],'tipo':r['tipo']} for r in rows])
    except Exception as e:
        return jsonify({'error':str(e)}), 500

# ── FUNCIONÁRIOS ──────────────────────────────────────────
@app.route('/api/funcionarios', methods=['GET'])
def listar_funcionarios():
    """Listar todos os funcionários"""
    try:
        conn, db_type = get_db()
        rows = db_fetchall(conn, db_type, """
            SELECT f.*,p.nome,p.email,p.telefone FROM funcionarios f
            LEFT JOIN pessoas p ON f.pessoa_id=p.id ORDER BY p.nome
        """)
        conn.close()
        result = []
        for r in rows:
            result.append({
                'id':          r['id'],
                'nome':        r['nome'],
                'email':       r.get('email',''),
                'telefone':    r.get('telefone',''),
                'cargo':       r['cargo'],
                'salario':     float(r['salario'] or 0),
                'dataAdmissao':str(r['data_admissao']) if r.get('data_admissao') else '',
                'ativo':       r['ativo'],
                'nivelAcesso': r['nivel_acesso'],
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({'error':str(e)}), 500

@app.route('/api/funcionarios', methods=['POST'])
def criar_funcionario():
    """Criar novo funcionário"""
    try:
        d = request.get_json()
        if not d.get('nome'):
            return jsonify({'error':'Nome é obrigatório'}), 400
        conn, db_type = get_db()
        if db_type == 'mysql':
            with conn.cursor() as c:
                c.execute("INSERT INTO pessoas (nome,email) VALUES (%s,%s)", (d.get('nome'),d.get('email','')))
                pid = c.lastrowid
                c.execute("INSERT INTO funcionarios (pessoa_id,cargo,salario,data_admissao,ativo,nivel_acesso) VALUES (%s,%s,%s,%s,%s,%s)",
                          (pid,d.get('cargo'),d.get('salario',0),datetime.date.today().isoformat(),1,d.get('nivelAcesso','FUNCIONARIO')))
                new_id = c.lastrowid
            conn.commit()
        else:
            c = conn.execute("INSERT INTO pessoas (nome,email) VALUES (?,?)", (d.get('nome'),d.get('email','')))
            pid = c.lastrowid
            c2 = conn.execute("INSERT INTO funcionarios (pessoa_id,cargo,salario,data_admissao,ativo,nivel_acesso) VALUES (?,?,?,?,?,?)",
                              (pid,d.get('cargo'),d.get('salario',0),datetime.date.today().isoformat(),1,d.get('nivelAcesso','FUNCIONARIO')))
            new_id = c2.lastrowid
            conn.commit()
        conn.close()
        return jsonify({'id':new_id,**d}), 201
    except Exception as e:
        return jsonify({'error':str(e)}), 500

@app.route('/api/funcionarios/<int:fid>', methods=['PUT'])
def atualizar_funcionario(fid):
    """Atualizar funcionário"""
    try:
        d = request.get_json()
        conn, db_type = get_db()
        row = db_fetchone(conn, db_type, "SELECT pessoa_id FROM funcionarios WHERE id=?", (fid,))
        if row:
            pid = row['pessoa_id']
            db_exec(conn, db_type, "UPDATE pessoas SET nome=?,email=? WHERE id=?", (d.get('nome'),d.get('email',''),pid))
            db_exec(conn, db_type, "UPDATE funcionarios SET cargo=?,salario=?,ativo=?,nivel_acesso=? WHERE id=?",
                    (d.get('cargo'),d.get('salario',0),d.get('ativo',1),d.get('nivelAcesso','FUNCIONARIO'),fid))
        conn.commit()
        conn.close()
        return jsonify({'id':fid,**d})
    except Exception as e:
        return jsonify({'error':str(e)}), 500

# ── VENDAS ────────────────────────────────────────────────
@app.route('/api/vendas', methods=['GET'])
def listar_vendas():
    """Listar todas as vendas"""
    try:
        conn, db_type = get_db()
        if db_type == 'mysql':
            rows = db_fetchall(conn, db_type, """
                SELECT v.id, v.data_venda, v.metodo_pagamento, v.status, v.total,
                       p.nome as cliente_nome,
                       GROUP_CONCAT(vi.nome SEPARATOR ', ') as produtos_nomes
                FROM vendas v
                LEFT JOIN funcionarios f ON v.funcionario_id=f.id
                LEFT JOIN pessoas p ON f.pessoa_id=p.id
                LEFT JOIN itens_venda iv ON iv.venda_id=v.id
                LEFT JOIN vinhos vi ON iv.vinho_id=vi.id
                GROUP BY v.id ORDER BY v.data_venda DESC LIMIT 100
            """)
        else:
            rows = db_fetchall(conn, db_type, """
                SELECT v.id, v.data_venda, v.metodo_pagamento, v.status, v.total,
                       p.nome as cliente_nome,
                       GROUP_CONCAT(vi.nome, ', ') as produtos_nomes
                FROM vendas v
                LEFT JOIN funcionarios f ON v.funcionario_id=f.id
                LEFT JOIN pessoas p ON f.pessoa_id=p.id
                LEFT JOIN itens_venda iv ON iv.venda_id=v.id
                LEFT JOIN vinhos vi ON iv.vinho_id=vi.id
                GROUP BY v.id ORDER BY v.data_venda DESC LIMIT 100
            """)
        conn.close()
        result = []
        for r in rows:
            result.append({
                'id':               r['id'],
                'codigo':           f"VD-{r['id']:04d}",
                'cliente':          r.get('cliente_nome') or 'Cliente Geral',
                'produto':          r.get('produtos_nomes') or '—',
                'metodoPagamento':  r['metodo_pagamento'],
                'total':            float(r['total'] or 0),
                'status':           r['status'],
                'dataVenda':        str(r['data_venda']) if r.get('data_venda') else '',
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({'error':str(e)}), 500

@app.route('/api/vendas', methods=['POST'])
def criar_venda():
    """Criar nova venda"""
    try:
        d = request.get_json()
        itens    = d.get('itens', [])
        metodo   = d.get('metodoPagamento','Cartão')
        func_id  = d.get('funcionarioId',1)

        if d.get('vinhoId') and not itens:
            itens = [{'vinhoId':d['vinhoId'],'quantidade':d.get('quantidade',1)}]

        if not itens:
            return jsonify({'error':'Venda deve conter pelo menos um item'}), 400

        conn, db_type = get_db()
        total = 0.0
        item_data = []
        for item in itens:
            vid = item.get('vinhoId') or item.get('vinho_id')
            qty = item.get('quantidade',1)
            row = db_fetchone(conn, db_type, "SELECT preco,quantidade FROM vinhos WHERE id=?", (vid,))
            if row:
                preco = float(row['preco'] or 0)
                total += preco * qty
                item_data.append((vid, qty, preco))
                new_stock = max(0, (row['quantidade'] or 0) - qty)
                db_exec(conn, db_type, "UPDATE vinhos SET quantidade=? WHERE id=?", (new_stock, vid))

        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if db_type == 'mysql':
            with conn.cursor() as c:
                c.execute("INSERT INTO vendas (funcionario_id,data_venda,metodo_pagamento,status,total) VALUES (%s,%s,%s,%s,%s)",
                          (func_id,now,metodo,'CONCLUIDA',round(total,2)))
                venda_id = c.lastrowid
                for (vid,qty,preco) in item_data:
                    c.execute("INSERT INTO itens_venda (venda_id,vinho_id,quantidade,preco_unitario) VALUES (%s,%s,%s,%s)",
                              (venda_id,vid,qty,preco))
            conn.commit()
        else:
            c = conn.execute("INSERT INTO vendas (funcionario_id,data_venda,metodo_pagamento,status,total) VALUES (?,?,?,?,?)",
                             (func_id,now,metodo,'CONCLUIDA',round(total,2)))
            venda_id = c.lastrowid
            for (vid,qty,preco) in item_data:
                conn.execute("INSERT INTO itens_venda (venda_id,vinho_id,quantidade,preco_unitario) VALUES (?,?,?,?)",
                             (venda_id,vid,qty,preco))
            conn.commit()
        conn.close()
        return jsonify({'id':venda_id,'codigo':f"VD-{venda_id:04d}",'total':round(total,2),'status':'CONCLUIDA','metodoPagamento':metodo,'dataVenda':now}), 201
    except Exception as e:
        return jsonify({'error':str(e)}), 500

# ── PROVAS (Wine Tastings) ────────────────────────────────
@app.route('/api/provas', methods=['GET'])
def listar_provas():
    """Listar todas as provas de vinho"""
    try:
        conn, db_type = get_db()
        rows = db_fetchall(conn, db_type, "SELECT * FROM provas ORDER BY data_evento DESC LIMIT 50")
        conn.close()
        result = []
        for r in rows:
            result.append({
                'id':              r['id'],
                'nome':            r['nome'],
                'dataEvento':      str(r['data_evento']) if r.get('data_evento') else None,
                'descricao':       r.get('descricao',''),
                'maxParticipantes': r['max_participantes'],
                'precoPessoa':     float(r['preco_pessoa'] or 0),
                'vinhoIds':        json.loads(r['vinho_ids']) if r.get('vinho_ids') else [],
                'ativo':           r['ativo'],
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({'error':str(e)}), 500

@app.route('/api/provas', methods=['POST'])
def criar_prova():
    """Criar nova prova de vinho"""
    try:
        d = request.get_json()
        if not d.get('nome') or not d.get('dataEvento'):
            return jsonify({'error':'Nome e data são obrigatórios'}), 400

        conn, db_type = get_db()
        vinho_ids = json.dumps(d.get('vinhoIds',[]))
        db_exec(conn, db_type,
                "INSERT INTO provas (nome,data_evento,descricao,max_participantes,preco_pessoa,vinho_ids,ativo) VALUES (?,?,?,?,?,?,?)",
                (d.get('nome'), d.get('dataEvento'), d.get('descricao',''), d.get('maxParticipantes',20),
                 d.get('precoPessoa',0), vinho_ids, 1))
        conn.commit()
        conn.close()
        return jsonify({'ok':True}), 201
    except Exception as e:
        return jsonify({'error':str(e)}), 500

@app.route('/api/provas/<int:pid>', methods=['PUT'])
def atualizar_prova(pid):
    """Atualizar prova existente"""
    try:
        d = request.get_json()
        conn, db_type = get_db()

        fields, vals = [], []
        for key, col in [('nome','nome'),('dataEvento','data_evento'),('descricao','descricao'),
                         ('maxParticipantes','max_participantes'),('precoPessoa','preco_pessoa'),('ativo','ativo')]:
            if key in d:
                fields.append(f"{col}=?")
                vals.append(d[key])

        if 'vinhoIds' in d:
            fields.append("vinho_ids=?")
            vals.append(json.dumps(d['vinhoIds']))

        if fields:
            vals.append(pid)
            db_exec(conn, db_type, f"UPDATE provas SET {','.join(fields)} WHERE id=?", vals)
            conn.commit()

        conn.close()
        return jsonify({'ok':True})
    except Exception as e:
        return jsonify({'error':str(e)}), 500

@app.route('/api/provas/<int:pid>', methods=['DELETE'])
def apagar_prova(pid):
    """Apagar prova"""
    try:
        conn, db_type = get_db()
        db_exec(conn, db_type, "DELETE FROM provas WHERE id=?", (pid,))
        conn.commit()
        conn.close()
        return jsonify({'ok':True})
    except Exception as e:
        return jsonify({'error':str(e)}), 500

# ── CAVES (Wine Cellars) ──────────────────────────────────
@app.route('/api/caves', methods=['GET'])
def listar_caves():
    """Listar todas as caves"""
    try:
        conn, db_type = get_db()
        rows = db_fetchall(conn, db_type, "SELECT * FROM caves WHERE ativo=1 ORDER BY nome")
        conn.close()
        result = []
        for r in rows:
            result.append({
                'id':               r['id'],
                'nome':             r['nome'],
                'localizacao':      r.get('localizacao',''),
                'capacidade':       r['capacidade'],
                'temperaturaIdeal': float(r['temperatura_ideal']) if r.get('temperatura_ideal') else None,
                'humidadeIdeal':    float(r['humidade_ideal']) if r.get('humidade_ideal') else None,
                'notas':            r.get('notas',''),
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({'error':str(e)}), 500

@app.route('/api/caves', methods=['POST'])
def criar_cave():
    """Criar nova cave"""
    try:
        d = request.get_json()
        if not d.get('nome'):
            return jsonify({'error':'Nome é obrigatório'}), 400

        conn, db_type = get_db()
        db_exec(conn, db_type,
                "INSERT INTO caves (nome,localizacao,capacidade,temperatura_ideal,humidade_ideal,notas,ativo) VALUES (?,?,?,?,?,?,?)",
                (d.get('nome'), d.get('localizacao',''), d.get('capacidade',100),
                 d.get('temperaturaIdeal'), d.get('humidadeIdeal'), d.get('notas',''), 1))
        conn.commit()
        conn.close()
        return jsonify({'ok':True}), 201
    except Exception as e:
        return jsonify({'error':str(e)}), 500

@app.route('/api/caves/<int:cave_id>', methods=['PUT'])
def atualizar_cave(cave_id):
    """Atualizar cave"""
    try:
        d = request.get_json()
        conn, db_type = get_db()

        fields, vals = [], []
        for key, col in [('nome','nome'),('localizacao','localizacao'),('capacidade','capacidade'),
                         ('temperaturaIdeal','temperatura_ideal'),('humidadeIdeal','humidade_ideal'),('notas','notas')]:
            if key in d:
                fields.append(f"{col}=?")
                vals.append(d[key])

        if fields:
            vals.append(cave_id)
            db_exec(conn, db_type, f"UPDATE caves SET {','.join(fields)} WHERE id=?", vals)
            conn.commit()

        conn.close()
        return jsonify({'ok':True})
    except Exception as e:
        return jsonify({'error':str(e)}), 500

# ── MOVIMENTOS DE STOCK ───────────────────────────────────
@app.route('/api/movimentos-stock', methods=['GET'])
def listar_movimentos():
    """Listar movimentos de stock"""
    try:
        conn, db_type = get_db()
        rows = db_fetchall(conn, db_type, """
            SELECT m.*, v.nome as vinho_nome, f.pessoa_id, p.nome as funcionario_nome
            FROM movimentos_stock m
            LEFT JOIN vinhos v ON m.vinho_id = v.id
            LEFT JOIN funcionarios f ON m.funcionario_id = f.id
            LEFT JOIN pessoas p ON f.pessoa_id = p.id
            ORDER BY m.criado_em DESC LIMIT 100
        """)
        conn.close()
        result = []
        for r in rows:
            result.append({
                'id':               r['id'],
                'vinhoId':          r['vinho_id'],
                'vinhoNome':        r.get('vinho_nome',''),
                'tipo':             r['tipo'],
                'quantidade':       r['quantidade'],
                'motivo':           r.get('motivo',''),
                'funcionarioNome':  r.get('funcionario_nome',''),
                'criadoEm':         str(r['criado_em']) if r.get('criado_em') else '',
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({'error':str(e)}), 500

@app.route('/api/movimentos-stock', methods=['POST'])
def registar_movimento():
    """Registar novo movimento de stock"""
    try:
        d = request.get_json()
        if not d.get('vinhoId') or not d.get('tipo') or d.get('quantidade') is None:
            return jsonify({'error':'vinhoId, tipo e quantidade são obrigatórios'}), 400

        if d.get('tipo') not in ['entrada', 'saida']:
            return jsonify({'error':'tipo deve ser entrada ou saida'}), 400

        conn, db_type = get_db()

        # Atualizar stock do vinho
        vinho = db_fetchone(conn, db_type, "SELECT quantidade FROM vinhos WHERE id=?", (d.get('vinhoId'),))
        if vinho:
            current_qty = vinho['quantidade'] or 0
            if d.get('tipo') == 'entrada':
                new_qty = current_qty + d.get('quantidade',0)
            else:
                new_qty = max(0, current_qty - d.get('quantidade',0))

            db_exec(conn, db_type, "UPDATE vinhos SET quantidade=? WHERE id=?", (new_qty, d.get('vinhoId')))

        # Registar movimento
        db_exec(conn, db_type,
                "INSERT INTO movimentos_stock (vinho_id,tipo,quantidade,motivo,funcionario_id) VALUES (?,?,?,?,?)",
                (d.get('vinhoId'), d.get('tipo'), d.get('quantidade'), d.get('motivo',''), d.get('funcionarioId')))

        conn.commit()
        conn.close()
        return jsonify({'ok':True}), 201
    except Exception as e:
        return jsonify({'error':str(e)}), 500

# ── CLIENTES ──────────────────────────────────────────────
@app.route('/api/clientes', methods=['GET'])
def listar_clientes():
    """Listar todos os clientes"""
    try:
        conn, db_type = get_db()
        rows = db_fetchall(conn, db_type, """
            SELECT c.*, p.nome, p.email, p.telefone, p.morada
            FROM clientes c
            LEFT JOIN pessoas p ON c.pessoa_id = p.id
            WHERE c.ativo = 1
            ORDER BY p.nome
        """)
        conn.close()
        result = []
        for r in rows:
            result.append({
                'id':               r['id'],
                'nome':             r.get('nome',''),
                'email':            r.get('email',''),
                'telefone':         r.get('telefone',''),
                'morada':           r.get('morada',''),
                'nif':              r.get('nif',''),
                'dataNascimento':   str(r['data_nascimento']) if r.get('data_nascimento') else None,
                'preferencias':     json.loads(r['preferencias']) if r.get('preferencias') else {},
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({'error':str(e)}), 500

# ── RELATÓRIOS ────────────────────────────────────────────
@app.route('/api/relatorios/vendas-mensal', methods=['GET'])
def relatorio_vendas_mensal():
    """Relatório de vendas mensais"""
    try:
        conn, db_type = get_db()

        if db_type == 'mysql':
            rows = db_fetchall(conn, db_type, """
                SELECT
                    DATE_FORMAT(v.data_venda, '%Y-%m') as mes,
                    COUNT(*) as num_vendas,
                    SUM(v.total) as total_vendas,
                    AVG(v.total) as ticket_medio
                FROM vendas v
                WHERE v.status = 'CONCLUIDA'
                GROUP BY DATE_FORMAT(v.data_venda, '%Y-%m')
                ORDER BY mes DESC
                LIMIT 12
            """)
        else:
            rows = db_fetchall(conn, db_type, """
                SELECT
                    strftime('%Y-%m', v.data_venda) as mes,
                    COUNT(*) as num_vendas,
                    SUM(v.total) as total_vendas,
                    AVG(v.total) as ticket_medio
                FROM vendas v
                WHERE v.status = 'CONCLUIDA'
                GROUP BY strftime('%Y-%m', v.data_venda)
                ORDER BY mes DESC
                LIMIT 12
            """)

        conn.close()
        result = []
        for r in rows:
            result.append({
                'mes':          r['mes'],
                'numVendas':    r['num_vendas'],
                'totalVendas':  float(r['total_vendas'] or 0),
                'ticketMedio':  float(r['ticket_medio'] or 0),
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({'error':str(e)}), 500

@app.route('/api/relatorios/top-vinhos', methods=['GET'])
def relatorio_top_vinhos():
    """Relatório dos vinhos mais vendidos"""
    try:
        conn, db_type = get_db()
        rows = db_fetchall(conn, db_type, """
            SELECT
                v.id, v.nome, v.tipo, v.regiao, v.produtor,
                COUNT(iv.id) as num_vendas,
                SUM(iv.quantidade) as quantidade_vendida,
                SUM(iv.quantidade * iv.preco_unitario) as receita_total,
                v.preco
            FROM vinhos v
            LEFT JOIN itens_venda iv ON v.id = iv.vinho_id
            GROUP BY v.id, v.nome, v.tipo, v.regiao, v.produtor, v.preco
            ORDER BY receita_total DESC
            LIMIT 20
        """)
        conn.close()
        result = []
        for r in rows:
            result.append({
                'id':               r['id'],
                'nome':             r['nome'],
                'tipo':             r['tipo'],
                'regiao':           r['regiao'],
                'produtor':         r['produtor'],
                'numVendas':        r['num_vendas'] or 0,
                'quantidadeVendida': r['quantidade_vendida'] or 0,
                'receitaTotal':     float(r['receita_total'] or 0),
                'preco':            float(r['preco'] or 0),
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({'error':str(e)}), 500

# ── DASHBOARD ─────────────────────────────────────────────
@app.route('/api/dashboard')
def dashboard():
    """Dashboard com estatísticas principais"""
    try:
        conn, db_type = get_db()
        receita     = (db_fetchone(conn,db_type,"SELECT COALESCE(SUM(total),0) as v FROM vendas WHERE status='CONCLUIDA'") or {}).get('v',0)
        num_vendas  = (db_fetchone(conn,db_type,"SELECT COUNT(*) as v FROM vendas WHERE status='CONCLUIDA'") or {}).get('v',0)
        ticket      = round(float(receita)/num_vendas,2) if num_vendas else 0
        lucro       = round(float(receita)*0.34,2)
        stock_crit  = (db_fetchone(conn,db_type,"SELECT COUNT(*) as v FROM vinhos WHERE quantidade < 10") or {}).get('v',0)
        valor_stock = (db_fetchone(conn,db_type,"SELECT COALESCE(SUM(preco*quantidade),0) as v FROM vinhos") or {}).get('v',0)
        total_vinhos= (db_fetchone(conn,db_type,"SELECT COUNT(*) as v FROM vinhos") or {}).get('v',0)
        total_func  = (db_fetchone(conn,db_type,"SELECT COUNT(*) as v FROM funcionarios WHERE ativo=1") or {}).get('v',0)

        weekly, labels = [], []
        for i in range(6,-1,-1):
            d = datetime.date.today() - datetime.timedelta(days=i)
            lbl = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][d.weekday()] if i>0 else "Hj"
            if db_type == 'mysql':
                total_day = (db_fetchone(conn,db_type,"SELECT COALESCE(SUM(total),0) as v FROM vendas WHERE DATE(data_venda)=%s",(d.isoformat(),)) or {}).get('v',0)
            else:
                total_day = (db_fetchone(conn,db_type,"SELECT COALESCE(SUM(total),0) as v FROM vendas WHERE date(data_venda)=?",(d.isoformat(),)) or {}).get('v',0)
            weekly.append(round(float(total_day),2))
            labels.append(lbl)

        top_vinhos = db_fetchall(conn, db_type, "SELECT nome,tipo,preco,quantidade FROM vinhos ORDER BY (preco*quantidade) DESC LIMIT 5")
        conn.close()

        return jsonify({
            'receitaTotal':   round(float(receita),2),
            'vendas':         num_vendas,
            'lucroLiquido':   lucro,
            'ticketMedio':    ticket,
            'stockCritico':   stock_crit,
            'valorStock':     round(float(valor_stock),2),
            'totalVinhos':    total_vinhos,
            'totalFuncionarios': total_func,
            'vendasSemanais': weekly,
            'vendasLabels':   labels,
            'topVinhos':      [{'nome':r['nome'],'tipo':r['tipo'],'valor':round(float(r['preco'] or 0)*int(r['quantidade'] or 0),2)} for r in top_vinhos],
        })
    except Exception as e:
        return jsonify({'error':str(e)}), 500

# ── MAIN ──────────────────────────────────────────────────
if __name__ == '__main__':
    """Iniciar servidor"""
    # Test MySQL connection first
    if MYSQL_AVAILABLE:
        try:
            cfg = {**MYSQL_CFG}
            cfg.pop('cursorclass', None)
            cfg['cursorclass'] = pymysql.cursors.DictCursor
            test = pymysql.connect(**cfg)
            test.close()
            print("\n  ✅  MySQL ligado com sucesso!")
        except Exception as e:
            print(f"\n  ⚠️  MySQL não disponível: {e}")
            print("  ℹ️  A usar SQLite como fallback")
            globals()['DB_TYPE'] = 'sqlite'
    else:
        print("\n  ℹ️  PyMySQL não instalado, a usar SQLite")

    init_db()

    db_label = "MySQL (vinhadouro)" if DB_TYPE == 'mysql' else "SQLite (vinhadouro.db)"
    print("\n" + "═"*55)
    print("  🍷  Vinha D'Ouro — Sistema Premium v3.0")
    print("═"*55)
    print(f"  🌐  Site:     http://localhost:8080")
    print(f"  🔌  API:      http://localhost:8080/api/")
    print(f"  💾  BD:       {db_label}")
    print("═"*55)
    print("  Endpoints:")
    print("    • /api/vinhos            → Gestão de vinhos")
    print("    • /api/provas            → Provas de vinho")
    print("    • /api/caves             → Caves de armazenamento")
    print("    • /api/movimentos-stock  → Histórico de stock")
    print("    • /api/clientes          → Clientes da loja")
    print("    • /api/relatorios/*      → Relatórios")
    print("═"*55)
    print("  Abre → http://localhost:8080 ← no browser!\n")
    app.run(host='0.0.0.0', port=8080, debug=False)
