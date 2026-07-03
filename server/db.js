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
    role TEXT NOT NULL DEFAULT 'subscriber', -- admin | editor | author | subscriber
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS site_content (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    blocks TEXT NOT NULL,          -- آرایه‌ی بلوک‌های محتوا به‌صورت JSON (مثل ویرایشگر بلوکی وردپرس)
    show_in_menu INTEGER NOT NULL DEFAULT 0,
    is_article INTEGER NOT NULL DEFAULT 0,  -- اگر ۱ باشد، در صفحه‌ی «مقالات» هم لیست می‌شود
    menu_order INTEGER NOT NULL DEFAULT 99,
    status TEXT NOT NULL DEFAULT 'published', -- published | draft
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payment_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    provider TEXT NOT NULL DEFAULT '',
    merchant_id TEXT NOT NULL DEFAULT '',
    api_key TEXT NOT NULL DEFAULT '',
    enabled INTEGER NOT NULL DEFAULT 0,
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

// --- مهاجرت سبک: اگر دیتابیس قدیمی‌تر است و ستون جدید را ندارد، اضافه‌اش کن ---
const pageColumns = db.prepare("PRAGMA table_info(pages)").all().map((c) => c.name);
if (!pageColumns.includes("is_article")) {
  db.exec("ALTER TABLE pages ADD COLUMN is_article INTEGER NOT NULL DEFAULT 0");
  console.log("[migrate] ستون is_article به جدول pages اضافه شد");
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

const pageCount = db.prepare("SELECT COUNT(*) AS c FROM pages").get().c;
if (pageCount === 0) {
  const now = new Date().toISOString();
  const adminUser = db.prepare("SELECT id, name FROM users WHERE role = 'admin' LIMIT 1").get();
  db.prepare(
    `INSERT INTO pages (id, title, slug, blocks, show_in_menu, is_article, menu_order, status, author_id, author_name, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, 0, 9, 'published', ?, ?, ?, ?)`
  ).run(
    "about-extra",
    "قوانین و مقررات",
    "rules",
    JSON.stringify([
      { type: "heading", content: "قوانین و مقررات فروشگاه" },
      { type: "paragraph", content: "کلیه محصولات فروشگاه نوین پلی‌تکنیک اورجینال و دارای گارانتی معتبر هستند. مهلت بازگشت کالا ۷ روز از تاریخ تحویل است." },
    ]),
    adminUser?.id || "system",
    adminUser?.name || "مدیر سایت",
    now, now
  );
  db.prepare(
    `INSERT INTO pages (id, title, slug, blocks, show_in_menu, is_article, menu_order, status, author_id, author_name, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, 1, 10, 'published', ?, ?, ?, ?)`
  ).run(
    "article-1",
    "چگونه از پروژکتور خود نگهداری کنیم؟",
    "projector-maintenance",
    JSON.stringify([
      { type: "heading", content: "چگونه از پروژکتور خود نگهداری کنیم؟" },
      { type: "paragraph", content: "نگهداری درست از پروژکتور عمر مفید لامپ و کیفیت تصویر را به‌طور چشمگیری افزایش می‌دهد. در این مقاله چند نکته‌ی کلیدی را مرور می‌کنیم." },
      { type: "paragraph", content: "۱. فیلتر هوا را هر چند ماه یک‌بار تمیز کنید تا از گرمای بیش‌ازحد جلوگیری شود.\n۲. دستگاه را در محیط بدون گردوغبار نگه دارید.\n۳. قبل از جابه‌جایی حتماً اجازه دهید لامپ کاملاً خنک شود." },
    ]),
    adminUser?.id || "system",
    adminUser?.name || "مدیر سایت",
    now, now
  );
  console.log("[seed] صفحات نمونه ساخته شدند");
}

const paymentRow = db.prepare("SELECT id FROM payment_settings WHERE id = 1").get();
if (!paymentRow) {
  db.prepare(
    "INSERT INTO payment_settings (id, provider, merchant_id, api_key, enabled, updated_at) VALUES (1, '', '', '', 0, ?)"
  ).run(new Date().toISOString());
}

export { uid };
