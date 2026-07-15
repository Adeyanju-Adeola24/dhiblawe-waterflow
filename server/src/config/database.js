import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'dhiblawe.db');
const MIGRATIONS_DIR = path.join(__dirname, '..', '..', 'migrations');

let db = null;
let SQL = null;

export async function initDb() {
  if (db) return db;
  SQL = await initSqlJs();
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }
  migrate();
  save();
  return db;
}

function migrate() {
  const files = fs.readdirSync(MIGRATIONS_DIR).sort();
  for (const f of files) {
    if (!f.endsWith('.sql')) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf-8');
    db.run(sql);
  }
}

export function save() {
  if (!db) return;
  const data = db.export();
  const buf = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buf);
}

export function getDb() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

export function queryAll(sql, params = []) {
  const stmt = getDb().prepare(sql);
  if (params.length) stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

export function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows[0] || null;
}

export function execute(sql, params = []) {
  const d = getDb();
  if (params.length) d.run(sql, params);
  else d.run(sql);
  save();
}

export function transaction(fn) {
  const d = getDb();
  d.run('BEGIN');
  try { fn(); d.run('COMMIT'); save(); }
  catch (e) { d.run('ROLLBACK'); throw e; }
}

if (import.meta.url && process.argv[1] && process.argv[1].endsWith('database.js')) {
  initDb().then(() => { console.log('Migration complete'); process.exit(0); });
}
