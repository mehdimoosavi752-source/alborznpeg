import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { db, uid } from "./db.js";
import { signToken, authenticate, optionalAuthenticate, requireAdmin } from "./auth.js";

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
    "INSERT INTO users (id, username, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, 'user', ?)"
  ).run(id, username, hash, name, createdAt);

  const user = { id, username, name, role: "user", created_at: createdAt };
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

app.put("/api/content", authenticate, requireAdmin, (req, res) => {
  const content = req.body;
  if (!content || typeof content !== "object") return res.status(400).json({ error: "محتوای نامعتبر" });
  db.prepare("UPDATE site_content SET data = ?, updated_at = ? WHERE id = 1").run(
    JSON.stringify(content),
    new Date().toISOString()
  );
  res.json({ ok: true });
});

/* ============================== کاربران (فقط مدیر) ============================== */

app.get("/api/users", authenticate, requireAdmin, (req, res) => {
  const users = db.prepare("SELECT * FROM users ORDER BY created_at DESC").all();
  res.json({ users: users.map(toPublicUser) });
});

app.patch("/api/users/:id", authenticate, requireAdmin, (req, res) => {
  const { role } = req.body || {};
  if (!["user", "admin"].includes(role)) return res.status(400).json({ error: "نقش نامعتبر" });
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

app.listen(PORT, () => {
  console.log(`✅ سرور نوین پلی‌تکنیک روی پورت ${PORT} در حال اجراست`);
});
