import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;
let SQL;

function saveDb() {
  if (!db) return;
  const dbPath = process.env.DATABASE_URL || path.join(__dirname, '..', '..', 'data', 'bycinema.db');
  if (dbPath === ':memory:') return;
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

function queryAll(sql, params = []) {
  if (params.length > 0) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  }
  const result = db.exec(sql);
  if (!result || result.length === 0) return [];
  const cols = result[0].columns;
  return (result[0].values || []).map((row) => {
    const obj = {};
    cols.forEach((c, i) => { obj[c] = row[i]; });
    return obj;
  });
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : undefined;
}

function execute(sql, params = []) {
  if (params.length > 0) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    stmt.step();
    stmt.free();
  } else {
    db.exec(sql);
  }
  saveDb();
  return { changes: db.getRowsModified() };
}

function insert(sql, params = []) {
  execute(sql, params);
  const result = db.exec('SELECT last_insert_rowid() as id');
  const id = result[0]?.values[0]?.[0];
  return { lastInsertRowid: Number(id) || 0, changes: db.getRowsModified() };
}

const api = {
  queryAll,
  queryOne,
  execute,
  insert,
  saveDb,
};

export function getDb() {
  if (!db || !SQL) throw new Error('Database not initialized');
  return api;
}

export async function initDatabase() {
  SQL = await initSqlJs();

  const dbPath = process.env.DATABASE_URL || path.join(__dirname, '..', '..', 'data', 'bycinema.db');

  const SCHEMA_SQL = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL, name TEXT NOT NULL, role TEXT DEFAULT 'user',
      createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL, description TEXT, posterUrl TEXT,
      year TEXT, genre TEXT,
      createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL, description TEXT,
      movieId INTEGER REFERENCES movies(id) ON DELETE CASCADE,
      createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL, description TEXT, price INTEGER NOT NULL,
      type TEXT, sizes TEXT DEFAULT '[]', colors TEXT DEFAULT '[]',
      imageUrl TEXT, gallery TEXT DEFAULT '[]',
      collectionId INTEGER REFERENCES collections(id) ON DELETE SET NULL,
      movieId INTEGER REFERENCES movies(id) ON DELETE CASCADE,
      stock INTEGER DEFAULT 0, isActive INTEGER DEFAULT 1,
      createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER REFERENCES users(id) ON DELETE SET NULL,
      items TEXT NOT NULL DEFAULT '[]', total INTEGER NOT NULL,
      status TEXT DEFAULT 'pending', shippingAddress TEXT, paymentIntentId TEXT,
      createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_products_movie ON products(movieId);
    CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collectionId);
    CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
    CREATE INDEX IF NOT EXISTS idx_products_active ON products(isActive);
    CREATE INDEX IF NOT EXISTS idx_collections_movie ON collections(movieId);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(userId);
  `;

  if (dbPath === ':memory:') {
    db = new SQL.Database();
    db.run('PRAGMA foreign_keys = ON');
    db.exec(SCHEMA_SQL);
  } else if (fs.existsSync(dbPath)) {
    db = new SQL.Database(fs.readFileSync(dbPath));
  } else {
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    db = new SQL.Database();
    db.run('PRAGMA foreign_keys = ON');
    db.exec(SCHEMA_SQL);
    saveDb();
  }
  console.log('Database initialized');
}
