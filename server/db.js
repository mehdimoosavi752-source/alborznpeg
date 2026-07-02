import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { DEFAULT_CONTENT } from "./seedContent.js";

const DB_PATH = process.env.DB_PATH || "./data.sqlite";
export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS site_content (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    username TEXT,
    items TEXT NOT NULL,
    total INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// --- بذرپاشی اولیه (فقط یک‌بار، اگر دیتابیس خالی باشد) ---

const userCount = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
if (userCount === 0) {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "novin1404";
  const hash = bcrypt.hashSync(adminPassword, 10);
  db.prepare(
    `INSERT INTO users (id, username, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, 'admin', ?)`
  ).run(uid("user"), adminUsername, hash, "مدیر سایت", new Date().toISOString());
  console.log(`[seed] حساب مدیر پیش‌فرض ساخته شد → کاربری: ${adminUsername}`);
}

const contentRow = db.prepare("SELECT id FROM site_content WHERE id = 1").get();
if (!contentRow) {
  db.prepare("INSERT INTO site_content (id, data, updated_at) VALUES (1, ?, ?)").run(
    JSON.stringify(DEFAULT_CONTENT),
    new Date().toISOString()
  );
  console.log("[seed] محتوای اولیه‌ی سایت ذخیره شد");
}

export { uid };
