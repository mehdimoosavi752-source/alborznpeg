import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { db, uid } from "./db.js";
import { signToken, authenticate, optionalAuthenticate, requireAdmin, requireEditor, requireAuthor } from "./auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8787;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

const toPublicUser = (u) => ({ id: u.id, username: u.username, name: u.name, role: u.role, createdAt: u.created_at });

/* ============================== سلامت سرور ============================== */
app.get("/api/health", (req, res) => res.json({ ok: true }));

/* ============================== احراز هویت ============================== */

app.post("/api/auth/register", (req, res) => {
  const { username, password, name } = req.body || {};
  if (!username || !password || !name) return res.status(400).json({ error: "همه فیلدها را پر کنید" });
  if (password.length < 6) return res.status(400).json({ error: "رمز عبور باید حداقل ۶ کاراکتر باشد" });

  const exists = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (exists) return res.status(409).json({ error: "این نام کاربری قبلاً ثبت شده است" });

  const id = uid("user");
  const hash = bcrypt.hashSync(password, 10);
  const createdAt = new Date().toISOString();
  db.prepare(
    "INSERT INTO users (id, username, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, 'subscriber', ?)"
  ).run(id, username, hash, name, createdAt);

  const user = { id, username, name, role: "subscriber", created_at: createdAt };
  const token = signToken(user);
  res.json({ token, user: toPublicUser(user) });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "نام کاربری و رمز عبور را وارد کنید" });

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "نام کاربری یا رمز عبور اشتباه است" });
  }
  const token = signToken(user);
  res.json({ token, user: toPublicUser(user) });
});

app.get("/api/auth/me", authenticate, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "کاربر یافت نشد" });
  res.json({ user: toPublicUser(user) });
});

/* ============================== محتوای سایت ============================== */

app.get("/api/content", (req, res) => {
  const row = db.prepare("SELECT data FROM site_content WHERE id = 1").get();
  res.json(JSON.parse(row.data));
});

app.put("/api/content", authenticate, requireEditor, (req, res) => {
  const content = req.body;
  if (!content || typeof content !== "object") return res.status(400).json({ error: "محتوای نامعتبر" });
  db.prepare("UPDATE site_content SET data = ?, updated_at = ? WHERE id = 1").run(
    JSON.stringify(content),
    new Date().toISOString()
  );
  res.json({ ok: true });
});

/* ============================== صفحات (مثل ویرایشگر صفحات وردپرس) ============================== */

function rowToPage(p) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    blocks: JSON.parse(p.blocks),
    showInMenu: !!p.show_in_menu,
    isArticle: !!p.is_article,
    order: p.menu_order,
    status: p.status,
    authorId: p.author_id,
    authorName: p.author_name,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

// عمومی: فقط صفحات منتشرشده (برای نمایش در سایت)
app.get("/api/pages", (req, res) => {
  const rows = db.prepare("SELECT * FROM pages WHERE status = 'published' ORDER BY menu_order ASC").all();
  res.json({ pages: rows.map(rowToPage) });
});

// پنل مدیریت: نویسنده فقط صفحات خودش را می‌بیند؛ ویرایشگر/مدیر همه را می‌بینند (شامل پیش‌نویس)
app.get("/api/pages/admin", authenticate, requireAuthor, (req, res) => {
  const isAuthorOnly = req.user.role === "author";
  const rows = isAuthorOnly
    ? db.prepare("SELECT * FROM pages WHERE author_id = ? ORDER BY updated_at DESC").all(req.user.id)
    : db.prepare("SELECT * FROM pages ORDER BY updated_at DESC").all();
  res.json({ pages: rows.map(rowToPage) });
});

app.post("/api/pages", authenticate, requireAuthor, (req, res) => {
  const { title, slug, blocks, showInMenu, status, isArticle } = req.body || {};
  if (!title || !slug) return res.status(400).json({ error: "عنوان و نامک صفحه الزامی است" });
  const exists = db.prepare("SELECT id FROM pages WHERE slug = ?").get(slug);
  if (exists) return res.status(409).json({ error: "این نامک (slug) قبلاً استفاده شده است" });

  const id = uid("page");
  const now = new Date().toISOString();
  const maxOrder = db.prepare("SELECT MAX(menu_order) AS m FROM pages").get().m || 0;
  db.prepare(
    `INSERT INTO pages (id, title, slug, blocks, show_in_menu, is_article, menu_order, status, author_id, author_name, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, title, slug, JSON.stringify(blocks || []), showInMenu ? 1 : 0, isArticle ? 1 : 0, maxOrder + 1, status === "draft" ? "draft" : "published", req.user.id, req.user.name, now, now);
  res.json({ ok: true, id });
});

function loadPageOr404(id, res) {
  const page = db.prepare("SELECT * FROM pages WHERE id = ?").get(id);
  if (!page) { res.status(404).json({ error: "صفحه یافت نشد" }); return null; }
  return page;
}

app.put("/api/pages/:id", authenticate, requireAuthor, (req, res) => {
  const page = loadPageOr404(req.params.id, res);
  if (!page) return;
  if (req.user.role === "author" && page.author_id !== req.user.id) {
    return res.status(403).json({ error: "شما فقط می‌توانید صفحات خودتان را ویرایش کنید" });
  }
  const { title, slug, blocks, showInMenu, order, status, isArticle } = req.body || {};
  db.prepare(
    `UPDATE pages SET title = ?, slug = ?, blocks = ?, show_in_menu = ?, is_article = ?, menu_order = ?, status = ?, updated_at = ? WHERE id = ?`
  ).run(
    title ?? page.title,
    slug ?? page.slug,
    JSON.stringify(blocks ?? JSON.parse(page.blocks)),
    showInMenu === undefined ? page.show_in_menu : (showInMenu ? 1 : 0),
    isArticle === undefined ? page.is_article : (isArticle ? 1 : 0),
    order ?? page.menu_order,
    status ?? page.status,
    new Date().toISOString(),
    page.id
  );
  res.json({ ok: true });
});

app.delete("/api/pages/:id", authenticate, requireAuthor, (req, res) => {
  const page = loadPageOr404(req.params.id, res);
  if (!page) return;
  if (req.user.role === "author" && page.author_id !== req.user.id) {
    return res.status(403).json({ error: "شما فقط می‌توانید صفحات خودتان را حذف کنید" });
  }
  db.prepare("DELETE FROM pages WHERE id = ?").run(page.id);
  res.json({ ok: true });
});

/* ============================== کاربران (فقط مدیر) ============================== */

app.get("/api/users", authenticate, requireAdmin, (req, res) => {
  const users = db.prepare("SELECT * FROM users ORDER BY created_at DESC").all();
  res.json({ users: users.map(toPublicUser) });
});

app.patch("/api/users/:id", authenticate, requireAdmin, (req, res) => {
  const { role } = req.body || {};
  if (!["subscriber", "author", "editor", "admin"].includes(role)) return res.status(400).json({ error: "نقش نامعتبر" });
  const result = db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "کاربر یافت نشد" });
  res.json({ ok: true });
});

/* ============================== سفارشات ============================== */

app.post("/api/orders", optionalAuthenticate, (req, res) => {
  const { items, total, customer } = req.body || {};
  if (!items?.length || !total || !customer?.name || !customer?.phone || !customer?.address) {
    return res.status(400).json({ error: "اطلاعات سفارش ناقص است" });
  }
  const id = uid("order");
  db.prepare(
    `INSERT INTO orders (id, username, items, total, customer_name, customer_phone, customer_address, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, req.user?.username || null, JSON.stringify(items), total, customer.name, customer.phone, customer.address, new Date().toISOString());
  res.json({ ok: true, id });
});

function rowToOrder(o) {
  return {
    id: o.id,
    username: o.username || "مهمان",
    items: JSON.parse(o.items),
    total: o.total,
    customer: { name: o.customer_name, phone: o.customer_phone, address: o.customer_address },
    date: o.created_at,
  };
}

app.get("/api/orders/mine", authenticate, (req, res) => {
  const rows = db.prepare("SELECT * FROM orders WHERE username = ? ORDER BY created_at DESC").all(req.user.username);
  res.json({ orders: rows.map(rowToOrder) });
});

app.get("/api/orders", authenticate, requireAdmin, (req, res) => {
  const rows = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
  res.json({ orders: rows.map(rowToOrder) });
});

/* ============================== پیام‌های تماس با ما ============================== */

app.post("/api/messages", (req, res) => {
  const { name, phone, message } = req.body || {};
  if (!name || !phone || !message) return res.status(400).json({ error: "همه فیلدها را پر کنید" });
  const id = uid("msg");
  db.prepare("INSERT INTO messages (id, name, phone, message, created_at) VALUES (?, ?, ?, ?, ?)").run(
    id, name, phone, message, new Date().toISOString()
  );
  res.json({ ok: true, id });
});

app.get("/api/messages", authenticate, requireAdmin, (req, res) => {
  const rows = db.prepare("SELECT * FROM messages ORDER BY created_at DESC").all();
  res.json({ messages: rows.map((m) => ({ id: m.id, name: m.name, phone: m.phone, message: m.message, date: m.created_at })) });
});

/* ============================== درگاه پرداخت (اطلاعات حساس، فقط مدیر) ============================== */
// نکته‌ی امنیتی مهم: apiKey هرگز از اینجا در endpoint عمومی برنمی‌گردد،
// چون هر بازدیدکننده‌ای GET /api/content را می‌بیند و اگر کلید آنجا بود لو می‌رفت.

app.get("/api/admin/payment-settings", authenticate, requireAdmin, (req, res) => {
  const row = db.prepare("SELECT * FROM payment_settings WHERE id = 1").get();
  res.json({
    provider: row.provider,
    merchantId: row.merchant_id,
    apiKey: row.api_key,
    enabled: !!row.enabled,
  });
});

app.put("/api/admin/payment-settings", authenticate, requireAdmin, (req, res) => {
  const { provider, merchantId, apiKey, enabled } = req.body || {};
  db.prepare(
    "UPDATE payment_settings SET provider = ?, merchant_id = ?, api_key = ?, enabled = ?, updated_at = ? WHERE id = 1"
  ).run(provider || "", merchantId || "", apiKey || "", enabled ? 1 : 0, new Date().toISOString());
  res.json({ ok: true });
});

// عمومی و امن: فقط می‌گوید درگاه فعال است یا نه، بدون افشای کلید
app.get("/api/payment-status", (req, res) => {
  const row = db.prepare("SELECT provider, enabled FROM payment_settings WHERE id = 1").get();
  res.json({ enabled: !!row.enabled, provider: row.enabled ? row.provider : null });
});

/* ============================== سرو کردن فرانت‌اند ساخته‌شده (تک‌سرویسی) ============================== */
// اگر پوشه‌ی client/dist وجود داشته باشد (یعنی فرانت‌اند build شده)، همین سرور آن را هم سرو می‌کند.
// این یعنی فقط یک سرویس روی Render لازم است، نه دو سرویس جدا.

const clientDist = path.join(__dirname, "../client/dist");
app.use(express.static(clientDist));
app.get(/^(?!\/api).*/, (req, res, next) => {
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`✅ سرور نوین پلی‌تکنیک روی پورت ${PORT} در حال اجراست`);
});
