import * as SQLite from 'expo-sqlite';
import { uuid } from '../utils/uuid';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb() {
  if (!db) {
    // @ts-ignore newer API is async
    db = await (SQLite as any).openDatabaseAsync?.('farm.db') || (SQLite as any).openDatabase('farm.db');
  }
  return db!;
}

export async function initDb() {
  const d = await getDb();
  const schema = `
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT);
    CREATE TABLE IF NOT EXISTS outbox (
      id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      row_json TEXT,
      deleted_id TEXT,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS plots (
      id TEXT PRIMARY KEY,
      name TEXT,
      area REAL,
      crop_id TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS crops (
      id TEXT PRIMARY KEY,
      plot_id TEXT,
      name TEXT,
      sow_date TEXT,
      harvest_eta TEXT,
      stage TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS workers (
      id TEXT PRIMARY KEY,
      name TEXT,
      wage_type TEXT,
      rate REAL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      worker_id TEXT,
      date TEXT,
      plot_id TEXT,
      task_type TEXT,
      hours REAL,
      pieces REAL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS irrigation (
      id TEXT PRIMARY KEY,
      plot_id TEXT,
      schedule TEXT,
      duration INTEGER,
      actual_start TEXT,
      actual_end TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sprays (
      id TEXT PRIMARY KEY,
      plot_id TEXT,
      product TEXT,
      target_pest TEXT,
      dosage REAL,
      water_l REAL,
      operator TEXT,
      wind REAL,
      temp REAL,
      phi_date TEXT,
      rei_until TEXT,
      photos TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      plot_id TEXT,
      text TEXT,
      tags TEXT,
      photos TEXT,
      audio TEXT,
      updated_at TEXT
    );
  `;
  // Use execAsync if available (Expo SDK 50+), else split and run via transaction
  // @ts-ignore
  if (d.execAsync) {
    // @ts-ignore
    await d.execAsync(schema);
  } else {
    await new Promise<void>((resolve, reject) => {
      d.transaction(
        (tx) => {
          schema
            .split(';')
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((stmt) => {
              tx.executeSql(stmt + ';');
            });
        },
        (err) => reject(err as any),
        () => resolve()
      );
    });
  }
}

export async function upsert(table: string, row: Record<string, any>) {
  const d = await getDb();
  const cols = Object.keys(row);
  const placeholders = cols.map(() => '?').join(',');
  const sql = `INSERT OR REPLACE INTO ${table} (${cols.join(',')}) VALUES (${placeholders})`;
  const values = cols.map(k => row[k]);
  // @ts-ignore
  return d.runAsync ? d.runAsync(sql, values) : new Promise((resolve, reject) => d.transaction(tx => {
    tx.executeSql(sql, values, () => resolve(true), (_, err) => { reject(err); return false; });
  }));
}

export async function all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const d = await getDb();
  // @ts-ignore
  if (d.getAllAsync) return d.getAllAsync(sql, params);
  return new Promise((resolve, reject) => d.readTransaction(tx => {
    tx.executeSql(sql, params, (_, { rows }) => resolve(rows._array as T[]), (_, err) => { reject(err); return false; });
  }));
}

export async function queueUpsert(table: string, row: any) {
  const d = await getDb();
  const id = uuid();
  const payload = JSON.stringify(row);
  const now = Date.now();
  const sql = `INSERT INTO outbox (id, table_name, row_json, created_at) VALUES (?,?,?,?)`;
  // @ts-ignore
  return d.runAsync ? d.runAsync(sql, [id, table, payload, now]) : new Promise((resolve, reject) => d.transaction(tx => {
    tx.executeSql(sql, [id, table, payload, now], () => resolve(true), (_, err) => { reject(err); return false; });
  }));
}

export async function setMeta(key: string, value: string) {
  return upsert('metadata', { key, value });
}

export async function getMeta(key: string): Promise<string | null> {
  const rows = await all<{ value: string }>(`SELECT value FROM metadata WHERE key = ? LIMIT 1`, [key]);
  return rows.length ? rows[0].value : null;
}

