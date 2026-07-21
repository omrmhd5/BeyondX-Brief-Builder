import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const defaultDbPath = path.join(process.cwd(), "data", "submissions.db");

export function getDbPath(): string {
  return process.env.DB_PATH ?? defaultDbPath;
}

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = getDbPath();
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("busy_timeout = 5000");

    db.exec(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        createdAt TEXT NOT NULL,
        companyName TEXT NOT NULL,
        sector TEXT NOT NULL,
        objective TEXT NOT NULL,
        audience TEXT NOT NULL,
        neededServices TEXT NOT NULL,
        budgetRange TEXT NOT NULL,
        deadline TEXT NOT NULL,
        summaryJson TEXT NOT NULL,
        aiModeUsed TEXT NOT NULL,
        fallbackApplied INTEGER NOT NULL DEFAULT 0
      )
    `);
  }

  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function resetDbForTests(): void {
  closeDb();
  const dbPath = getDbPath();
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
}
