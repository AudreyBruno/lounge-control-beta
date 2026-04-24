export const schema = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  numero TEXT,
  status BOOLEAN DEFAULT true,
  permite_venda_prazo BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS categoria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  status BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS produto (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  categoria_id INTEGER REFERENCES categoria(id),
  descricao TEXT NOT NULL,
  estoque INTEGER DEFAULT 0,
  valor REAL NOT NULL,
  movimenta_estoque BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS venda (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER REFERENCES clientes(id),
  valor_total REAL NOT NULL,
  valor_pago REAL DEFAULT 0,
  pago BOOLEAN DEFAULT false,
  data DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS venda_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  venda_id INTEGER REFERENCES venda(id),
  produto_id INTEGER REFERENCES produto(id),
  valor_unitario REAL,
  valor_total REAL,
  quantidade INTEGER
);

CREATE TABLE IF NOT EXISTS uso_interno (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  valor_total REAL,
  data DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS uso_interno_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uso_interno_id INTEGER REFERENCES uso_interno(id),
  produto_id INTEGER REFERENCES produto(id),
  valor_unitario REAL,
  valor_total REAL,
  quantidade INTEGER
);

CREATE TABLE IF NOT EXISTS contas_pagar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data_cadastro DATETIME,
  data_vencimento DATETIME,
  valor REAL,
  descricao TEXT
);

CREATE TABLE IF NOT EXISTS contas_receber (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  venda_id INTEGER REFERENCES venda(id),
  data_cadastro DATETIME,
  data_vencimento DATETIME,
  valor REAL,
  descricao TEXT,
  pago BOOLEAN DEFAULT false
);
`;
