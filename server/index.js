import "dotenv/config";
import express from "express";
import cors from "cors";
import compression from "compression";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import multer from "multer";
import nodemailer from "nodemailer";
import sharp from "sharp";
import rateLimit from "express-rate-limit";
import { db, uid } from "./db.js";
import { signToken, authenticate, optionalAuthenticate, requireAdmin, requireEditor, requireAuthor } from "./auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8787;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// Migration for traceable orders on existing databases.
try { db.exec("ALTER TABLE orders ADD COLUMN tracking_code TEXT"); } catch (e) { /* column already exists */ }

app.use(compression());
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// جلوگیری از حدس رمز عبور با درخواست‌های پیاپی (brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "تعداد تلاش‌های ورود بیش از حد مجاز بود؛ چند دقیقه دیگر دوباره امتحان کنید." },
});

/* ============================== آپلود تصویر ============================== */

const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir, { maxAge: "30d" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("فقط فایل تصویر مجاز است"));
    cb(null, true);
  },
});

app.post("/api/admin/upload", authenticate, requireEditor, (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message || "آپلود ناموفق بود" });
    if (!req.file) return res.status(400).json({ error: "فایلی ارسال نشد" });
    try {
      // بهینه‌سازی خودکار: تغییر اندازه (حداکثر عرض ۱۹۲۰px) و تبدیل به WebP برای کاهش چشمگیر حجم
      const isAnimated = req.file.mimetype === "image/gif";
      const filename = `${uid("img")}.${isAnimated ? "gif" : "webp"}`;
      const outPath = path.join(uploadsDir, filename);
      if (isAnimated) {
        fs.writeFileSync(outPath, req.file.buffer);
      } else {
        await sharp(req.file.buffer, { animated: false })
          .rotate()
          .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(outPath);
      }
      res.json({ url: `/uploads/${filename}` });
    } catch (e) {
      res.status(400).json({ error: "پردازش تصویر ناموفق بود: " + e.message });
    }
  });
});

const toPublicUser = (u) => ({ id: u.id, username: u.username, name: u.name, role: u.role, phone: u.phone || "", email: u.email || "", createdAt: u.created_at });

/* ============================== سلامت سرور ============================== */
app.get("/api/health", (req, res) => res.json({ ok: true }));

/* ============================== احراز هویت ============================== */

app.post("/api/auth/register", authLimiter, (req, res) => {
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

app.post("/api/auth/login", authLimiter, (req, res) => {
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

app.patch("/api/account/profile", authenticate, (req, res) => {
  const { name, phone, email } = req.body || {};
  if (!name || !String(name).trim()) return res.status(400).json({ error: "نام نمی‌تواند خالی باشد" });
  db.prepare("UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?").run(
    String(name).trim(), phone || "", email || "", req.user.id
  );
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  const token = signToken(user);
  res.json({ ok: true, token, user: toPublicUser(user) });
});

app.patch("/api/account/password", authenticate, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) return res.status(400).json({ error: "رمز عبور فعلی و جدید را وارد کنید" });
  if (newPassword.length < 6) return res.status(400).json({ error: "رمز عبور جدید باید حداقل ۶ کاراکتر باشد" });
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(401).json({ error: "رمز عبور فعلی اشتباه است" });
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, user.id);
  res.json({ ok: true });
});

/* ============================== آدرس‌ها ============================== */

function rowToAddress(a) {
  return {
    id: a.id, title: a.title, receiverName: a.receiver_name, phone: a.phone,
    province: a.province, city: a.city, postalCode: a.postal_code, address: a.address,
    isDefault: !!a.is_default, createdAt: a.created_at,
  };
}

app.get("/api/addresses/mine", authenticate, (req, res) => {
  const rows = db.prepare("SELECT * FROM addresses WHERE username = ? ORDER BY is_default DESC, created_at DESC").all(req.user.username);
  res.json({ addresses: rows.map(rowToAddress) });
});

app.post("/api/addresses", authenticate, (req, res) => {
  const { title, receiverName, phone, province, city, postalCode, address, isDefault } = req.body || {};
  if (!receiverName || !phone || !city || !address) return res.status(400).json({ error: "اطلاعات آدرس ناقص است" });
  const id = uid("addr");
  const now = new Date().toISOString();
  if (isDefault) db.prepare("UPDATE addresses SET is_default = 0 WHERE username = ?").run(req.user.username);
  db.prepare(
    `INSERT INTO addresses (id, username, title, receiver_name, phone, province, city, postal_code, address, is_default, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, req.user.username, title || "", receiverName, phone, province || "", city, postalCode || "", address, isDefault ? 1 : 0, now);
  res.json({ ok: true, id });
});

function findAddressForUser(id, username, isAdmin) {
  const row = db.prepare("SELECT * FROM addresses WHERE id = ?").get(id);
  if (!row) return null;
  if (!isAdmin && row.username !== username) return null;
  return row;
}

app.put("/api/addresses/:id", authenticate, (req, res) => {
  const isAdmin = req.user.role === "admin";
  const row = findAddressForUser(req.params.id, req.user.username, isAdmin);
  if (!row) return res.status(404).json({ error: "آدرس یافت نشد" });
  const { title, receiverName, phone, province, city, postalCode, address, isDefault } = req.body || {};
  if (isDefault) db.prepare("UPDATE addresses SET is_default = 0 WHERE username = ?").run(row.username);
  db.prepare(
    `UPDATE addresses SET title = ?, receiver_name = ?, phone = ?, province = ?, city = ?, postal_code = ?, address = ?, is_default = ? WHERE id = ?`
  ).run(title ?? row.title, receiverName ?? row.receiver_name, phone ?? row.phone, province ?? row.province, city ?? row.city, postalCode ?? row.postal_code, address ?? row.address, isDefault ? 1 : (isDefault === false ? 0 : row.is_default), row.id);
  res.json({ ok: true });
});

app.delete("/api/addresses/:id", authenticate, (req, res) => {
  const isAdmin = req.user.role === "admin";
  const row = findAddressForUser(req.params.id, req.user.username, isAdmin);
  if (!row) return res.status(404).json({ error: "آدرس یافت نشد" });
  db.prepare("DELETE FROM addresses WHERE id = ?").run(row.id);
  res.json({ ok: true });
});

/* ============================== لیست علاقه‌مندی‌ها ============================== */

app.get("/api/wishlist/mine", authenticate, (req, res) => {
  const rows = db.prepare("SELECT product_id FROM wishlist WHERE username = ? ORDER BY created_at DESC").all(req.user.username);
  res.json({ productIds: rows.map((r) => r.product_id) });
});

app.post("/api/wishlist/:productId", authenticate, (req, res) => {
  const id = uid("wish");
  try {
    db.prepare("INSERT INTO wishlist (id, username, product_id, created_at) VALUES (?, ?, ?, ?)").run(
      id, req.user.username, req.params.productId, new Date().toISOString()
    );
  } catch (e) { /* از قبل در لیست بوده */ }
  res.json({ ok: true });
});

app.delete("/api/wishlist/:productId", authenticate, (req, res) => {
  db.prepare("DELETE FROM wishlist WHERE username = ? AND product_id = ?").run(req.user.username, req.params.productId);
  res.json({ ok: true });
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

function parseTitle(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && ("fa" in parsed || "en" in parsed)) return parsed;
  } catch (e) { /* legacy plain-string title */ }
  return { fa: raw, en: raw };
}

function rowToPage(p) {
  return {
    id: p.id,
    title: parseTitle(p.title),
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
  if (!title || !title.fa || !slug) return res.status(400).json({ error: "عنوان (فارسی) و نامک صفحه الزامی است" });
  const exists = db.prepare("SELECT id FROM pages WHERE slug = ?").get(slug);
  if (exists) return res.status(409).json({ error: "این نامک (slug) قبلاً استفاده شده است" });

  const id = uid("page");
  const now = new Date().toISOString();
  const maxOrder = db.prepare("SELECT MAX(menu_order) AS m FROM pages").get().m || 0;
  db.prepare(
    `INSERT INTO pages (id, title, slug, blocks, show_in_menu, is_article, menu_order, status, author_id, author_name, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, JSON.stringify(title), slug, JSON.stringify(blocks || []), showInMenu ? 1 : 0, isArticle ? 1 : 0, maxOrder + 1, status === "draft" ? "draft" : "published", req.user.id, req.user.name, now, now);
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
    title ? JSON.stringify(title) : page.title,
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
  const target = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!target) return res.status(404).json({ error: "کاربر یافت نشد" });
  const { role, name, phone, email } = req.body || {};
  if (role !== undefined && !["subscriber", "author", "editor", "admin"].includes(role)) {
    return res.status(400).json({ error: "نقش نامعتبر" });
  }
  db.prepare("UPDATE users SET role = ?, name = ?, phone = ?, email = ? WHERE id = ?").run(
    role ?? target.role, name !== undefined ? name : target.name, phone !== undefined ? phone : target.phone, email !== undefined ? email : target.email, target.id
  );
  res.json({ ok: true });
});

// جزئیات کامل یک کاربر برای مدیر: پروفایل + آدرس‌ها + علاقه‌مندی‌ها + خلاصه سفارش‌ها
app.get("/api/admin/users/:id/detail", authenticate, requireAdmin, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!user) return res.status(404).json({ error: "کاربر یافت نشد" });
  const addresses = db.prepare("SELECT * FROM addresses WHERE username = ? ORDER BY is_default DESC, created_at DESC").all(user.username).map(rowToAddress);
  const wishlistRows = db.prepare("SELECT product_id FROM wishlist WHERE username = ? ORDER BY created_at DESC").all(user.username);
  const orders = db.prepare("SELECT * FROM orders WHERE username = ? ORDER BY created_at DESC LIMIT 20").all(user.username).map(rowToOrder);
  res.json({
    user: toPublicUser(user),
    addresses,
    wishlistProductIds: wishlistRows.map((r) => r.product_id),
    orders,
  });
});

app.delete("/api/admin/addresses/:id", authenticate, requireAdmin, (req, res) => {
  db.prepare("DELETE FROM addresses WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

/* ============================== کدهای تخفیف ============================== */

function rowToCoupon(c) {
  return {
    id: c.id,
    code: c.code,
    label: c.label,
    type: c.type,
    value: c.value,
    maxDiscount: c.max_discount,
    minOrderTotal: c.min_order_total,
    appliesTo: c.applies_to,
    usageLimitTotal: c.usage_limit_total,
    limitOnePerUser: !!c.limit_one_per_user,
    usedCount: c.used_count,
    startDate: c.start_date,
    endDate: c.end_date,
    enabled: !!c.enabled,
    createdAt: c.created_at,
  };
}

// اعتبارسنجی کد تخفیف؛ commitUsage=false یعنی فقط پیش‌نمایش (هنگام تایپ کد در سبد خرید)
function evaluateCoupon(code, { subtotal, orderType, username }) {
  const clean = String(code || "").trim().toUpperCase();
  if (!clean) return { ok: false, error: "کد تخفیف را وارد کنید" };
  const c = db.prepare("SELECT * FROM coupons WHERE UPPER(code) = ?").get(clean);
  if (!c) return { ok: false, error: "کد تخفیف پیدا نشد" };
  if (!c.enabled) return { ok: false, error: "این کد تخفیف غیرفعال است" };
  const now = new Date().toISOString();
  if (c.start_date && now < c.start_date) return { ok: false, error: "این کد تخفیف هنوز شروع نشده است" };
  if (c.end_date && now > c.end_date) return { ok: false, error: "این کد تخفیف منقضی شده است" };
  if (c.applies_to !== "all" && orderType && c.applies_to !== orderType) {
    return { ok: false, error: "این کد تخفیف برای این نوع سفارش معتبر نیست" };
  }
  if (subtotal < (c.min_order_total || 0)) {
    return { ok: false, error: `حداقل مبلغ سفارش برای این کد ${c.min_order_total.toLocaleString("fa-IR")} تومان است` };
  }
  if (c.usage_limit_total > 0 && c.used_count >= c.usage_limit_total) {
    return { ok: false, error: "ظرفیت استفاده از این کد تخفیف تمام شده است" };
  }
  if (c.limit_one_per_user) {
    if (!username) return { ok: false, error: "برای استفاده از کد تخفیف ابتدا وارد حساب کاربری شوید" };
    const used = db.prepare("SELECT id FROM coupon_uses WHERE coupon_id = ? AND username = ?").get(c.id, username);
    if (used) return { ok: false, error: "شما قبلاً از این کد تخفیف استفاده کرده‌اید" };
  }
  let discount = c.type === "percent" ? Math.floor((subtotal * c.value) / 100) : c.value;
  if (c.type === "percent" && c.max_discount > 0) discount = Math.min(discount, c.max_discount);
  discount = Math.max(0, Math.min(discount, subtotal));
  return { ok: true, coupon: rowToCoupon(c), discount };
}

app.post("/api/coupons/apply", authenticate, (req, res) => {
  const { code, subtotal, orderType } = req.body || {};
  const result = evaluateCoupon(code, { subtotal: Number(subtotal) || 0, orderType: orderType || "shop", username: req.user.username });
  if (!result.ok) return res.status(400).json({ error: result.error });
  res.json({ ok: true, discount: result.discount, code: result.coupon.code, type: result.coupon.type, value: result.coupon.value });
});

app.get("/api/admin/coupons", authenticate, requireAdmin, (req, res) => {
  const rows = db.prepare("SELECT * FROM coupons ORDER BY created_at DESC").all();
  res.json({ coupons: rows.map(rowToCoupon) });
});

app.post("/api/admin/coupons", authenticate, requireAdmin, (req, res) => {
  const b = req.body || {};
  if (!b.code || !b.startDate || !b.endDate) return res.status(400).json({ error: "کد، تاریخ شروع و تاریخ انقضا الزامی است" });
  const existing = db.prepare("SELECT id FROM coupons WHERE UPPER(code) = ?").get(String(b.code).trim().toUpperCase());
  if (existing) return res.status(400).json({ error: "این کد تخفیف قبلاً ثبت شده است" });
  const id = uid("coupon");
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO coupons (id, code, label, type, value, max_discount, min_order_total, applies_to, usage_limit_total, limit_one_per_user, used_count, start_date, end_date, enabled, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`
  ).run(
    id, String(b.code).trim().toUpperCase(), b.label || "", b.type === "fixed" ? "fixed" : "percent",
    Number(b.value) || 0, Number(b.maxDiscount) || 0, Number(b.minOrderTotal) || 0, ["all", "shop", "service"].includes(b.appliesTo) ? b.appliesTo : "all",
    Number(b.usageLimitTotal) || 0, b.limitOnePerUser === false ? 0 : 1,
    b.startDate, b.endDate, b.enabled === false ? 0 : 1, now, now
  );
  res.json({ ok: true, id });
});

app.put("/api/admin/coupons/:id", authenticate, requireAdmin, (req, res) => {
  const c = db.prepare("SELECT * FROM coupons WHERE id = ?").get(req.params.id);
  if (!c) return res.status(404).json({ error: "کد تخفیف پیدا نشد" });
  const b = req.body || {};
  if (b.code) {
    const dupe = db.prepare("SELECT id FROM coupons WHERE UPPER(code) = ? AND id != ?").get(String(b.code).trim().toUpperCase(), c.id);
    if (dupe) return res.status(400).json({ error: "این کد تخفیف قبلاً ثبت شده است" });
  }
  db.prepare(
    `UPDATE coupons SET code=?, label=?, type=?, value=?, max_discount=?, min_order_total=?, applies_to=?, usage_limit_total=?, limit_one_per_user=?, start_date=?, end_date=?, enabled=?, updated_at=? WHERE id=?`
  ).run(
    b.code ? String(b.code).trim().toUpperCase() : c.code, b.label ?? c.label, b.type === "fixed" ? "fixed" : (b.type === "percent" ? "percent" : c.type),
    b.value === undefined ? c.value : Number(b.value) || 0, b.maxDiscount === undefined ? c.max_discount : Number(b.maxDiscount) || 0,
    b.minOrderTotal === undefined ? c.min_order_total : Number(b.minOrderTotal) || 0,
    ["all", "shop", "service"].includes(b.appliesTo) ? b.appliesTo : c.applies_to,
    b.usageLimitTotal === undefined ? c.usage_limit_total : Number(b.usageLimitTotal) || 0,
    b.limitOnePerUser === undefined ? c.limit_one_per_user : (b.limitOnePerUser ? 1 : 0),
    b.startDate ?? c.start_date, b.endDate ?? c.end_date, b.enabled === undefined ? c.enabled : (b.enabled ? 1 : 0),
    new Date().toISOString(), c.id
  );
  res.json({ ok: true });
});

app.delete("/api/admin/coupons/:id", authenticate, requireAdmin, (req, res) => {
  db.prepare("DELETE FROM coupons WHERE id = ?").run(req.params.id);
  db.prepare("DELETE FROM coupon_uses WHERE coupon_id = ?").run(req.params.id);
  res.json({ ok: true });
});

/* ============================== رزرو نوبت ============================== */

function rowToReservation(r) {
  return { id: r.id, username: r.username, name: r.name, phone: r.phone, note: r.note, date: r.res_date, timeSlot: r.time_slot, status: r.status, createdAt: r.created_at };
}

app.get("/api/reservations/settings", (req, res) => {
  const rs = db.prepare("SELECT * FROM reservation_settings WHERE id = 1").get();
  res.json({
    enabled: !!rs.enabled, slots: JSON.parse(rs.slots || "[]"), closedWeekdays: JSON.parse(rs.closed_weekdays || "[]"),
    note: { fa: rs.note_fa, en: rs.note_en },
  });
});

app.get("/api/reservations/availability", (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "تاریخ الزامی است" });
  const rs = db.prepare("SELECT * FROM reservation_settings WHERE id = 1").get();
  const taken = db.prepare("SELECT time_slot FROM reservations WHERE res_date = ? AND status != 'cancelled'").all(date).map((r) => r.time_slot);
  res.json({ slots: JSON.parse(rs.slots || "[]"), taken });
});

app.post("/api/reservations", authenticate, (req, res) => {
  const rs = db.prepare("SELECT * FROM reservation_settings WHERE id = 1").get();
  if (!rs.enabled) return res.status(400).json({ error: "رزرو نوبت در حال حاضر فعال نیست" });
  const { name, phone, note, date, timeSlot } = req.body || {};
  if (!name || !phone || !date || !timeSlot) return res.status(400).json({ error: "همه‌ی فیلدهای لازم را پر کنید" });
  const slots = JSON.parse(rs.slots || "[]");
  if (!slots.includes(timeSlot)) return res.status(400).json({ error: "بازه‌ی زمانی نامعتبر است" });
  const taken = db.prepare("SELECT id FROM reservations WHERE res_date = ? AND time_slot = ? AND status != 'cancelled'").get(date, timeSlot);
  if (taken) return res.status(400).json({ error: "این بازه‌ی زمانی قبلاً رزرو شده است" });
  const id = uid("rsv");
  const now = new Date().toISOString();
  db.prepare("INSERT INTO reservations (id, username, name, phone, note, res_date, time_slot, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)").run(
    id, req.user.username, name, phone, note || "", date, timeSlot, now, now
  );
  res.json({ ok: true, id });
});

app.get("/api/reservations/mine", authenticate, (req, res) => {
  const rows = db.prepare("SELECT * FROM reservations WHERE username = ? ORDER BY res_date DESC, time_slot DESC").all(req.user.username);
  res.json({ reservations: rows.map(rowToReservation) });
});

app.get("/api/admin/reservations", authenticate, requireAdmin, (req, res) => {
  const rows = db.prepare("SELECT * FROM reservations ORDER BY res_date DESC, time_slot DESC").all();
  res.json({ reservations: rows.map(rowToReservation) });
});

app.put("/api/admin/reservations/:id", authenticate, requireAdmin, (req, res) => {
  const r = db.prepare("SELECT * FROM reservations WHERE id = ?").get(req.params.id);
  if (!r) return res.status(404).json({ error: "رزرو پیدا نشد" });
  const { status } = req.body || {};
  if (!["pending", "confirmed", "cancelled", "done"].includes(status)) return res.status(400).json({ error: "وضعیت نامعتبر" });
  db.prepare("UPDATE reservations SET status = ?, updated_at = ? WHERE id = ?").run(status, new Date().toISOString(), r.id);
  res.json({ ok: true });
});

app.get("/api/admin/reservation-settings", authenticate, requireAdmin, (req, res) => {
  const rs = db.prepare("SELECT * FROM reservation_settings WHERE id = 1").get();
  res.json({
    enabled: !!rs.enabled, slots: JSON.parse(rs.slots || "[]"), closedWeekdays: JSON.parse(rs.closed_weekdays || "[]"),
    noteFa: rs.note_fa, noteEn: rs.note_en,
  });
});

app.put("/api/admin/reservation-settings", authenticate, requireAdmin, (req, res) => {
  const b = req.body || {};
  db.prepare(
    "UPDATE reservation_settings SET enabled=?, slots=?, closed_weekdays=?, note_fa=?, note_en=?, updated_at=? WHERE id=1"
  ).run(
    b.enabled ? 1 : 0, JSON.stringify(Array.isArray(b.slots) ? b.slots : []), JSON.stringify(Array.isArray(b.closedWeekdays) ? b.closedWeekdays : []),
    b.noteFa || "", b.noteEn || "", new Date().toISOString()
  );
  res.json({ ok: true });
});

/* ============================== آمار داشبورد مدیریت ============================== */

app.get("/api/admin/stats/overview", authenticate, requireAdmin, (req, res) => {
  const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); sixMonthsAgo.setDate(1);
  const monthlyRows = db.prepare(
    `SELECT substr(created_at,1,7) as month, SUM(total) as revenue, COUNT(*) as count
     FROM orders WHERE order_type = 'shop' AND created_at >= ? GROUP BY month ORDER BY month ASC`
  ).all(sixMonthsAgo.toISOString());
  const monthly = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i); d.setDate(1);
    const key = d.toISOString().slice(0, 7);
    const found = monthlyRows.find((r) => r.month === key);
    monthly.push({ month: key, revenue: found?.revenue || 0, count: found?.count || 0 });
  }
  const totalRevenue = db.prepare("SELECT SUM(total) as t FROM orders WHERE order_type = 'shop'").get().t || 0;
  const totalOrders = db.prepare("SELECT COUNT(*) as c FROM orders").get().c || 0;
  const pendingTickets = db.prepare("SELECT COUNT(*) as c FROM tickets WHERE status != 'closed'").get().c || 0;
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE created_at >= ?").get(todayStart.toISOString()).c || 0;
  const upcomingReservations = db.prepare("SELECT COUNT(*) as c FROM reservations WHERE res_date >= date('now') AND status != 'cancelled'").get().c || 0;
  const deliveredOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'delivered'").get().c || 0;
  const activeCoupons = db.prepare("SELECT COUNT(*) as c FROM coupons WHERE enabled = 1 AND (end_date = '' OR end_date >= ?)").get(new Date().toISOString()).c || 0;
  const newMessages = db.prepare("SELECT COUNT(*) as c FROM messages WHERE status = 'new'").get().c || 0;
  const pendingReservations = db.prepare("SELECT COUNT(*) as c FROM reservations WHERE status = 'pending'").get().c || 0;
  res.json({ monthly, totalRevenue, totalOrders, pendingTickets, todayOrders, upcomingReservations, deliveredOrders, activeCoupons, newMessages, pendingReservations });
});

app.get("/api/stats/public", (req, res) => {
  const deliveredOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'delivered'").get().c || 0;
  res.json({ deliveredOrders });
});

/* ============================== سفارشات (فروشگاه و خدمات) ============================== */

const SHOP_STATUSES = ["reviewing", "registered", "packing", "shipped", "delivered"];
const SERVICE_STATUSES = ["reviewing", "working", "ready", "delivered"];

app.post("/api/orders", authenticate, (req, res) => {
  const { orderType, items, total, customer, deviceInfo, issueDescription, couponCode, usePoints } = req.body || {};
  const type = orderType === "service" ? "service" : "shop";
  if (!customer?.name || !customer?.phone) return res.status(400).json({ error: "اطلاعات مشتری ناقص است" });
  if (type === "shop" && (!items?.length || !total || !customer?.address)) {
    return res.status(400).json({ error: "اطلاعات سفارش ناقص است" });
  }
  if (type === "service" && (!deviceInfo || !issueDescription)) {
    return res.status(400).json({ error: "توضیح دستگاه و مشکل الزامی است" });
  }

  let runningTotal = total || 0;
  let discountAmount = 0;
  let appliedCouponRow = null;
  if (couponCode) {
    const result = evaluateCoupon(couponCode, { subtotal: runningTotal, orderType: type, username: req.user.username });
    if (!result.ok) return res.status(400).json({ error: result.error });
    discountAmount = result.discount;
    runningTotal = Math.max(0, runningTotal - discountAmount);
    appliedCouponRow = result.coupon;
  }

  let pointsUsed = 0, pointsDiscount = 0;
  if (usePoints && type === "shop") {
    const pr = evaluatePointsRedeem(req.user.username, runningTotal);
    if (!pr.ok) return res.status(400).json({ error: pr.error });
    pointsUsed = pr.pointsUsed; pointsDiscount = pr.discount;
    runningTotal = Math.max(0, runningTotal - pointsDiscount);
  }
  const finalTotal = runningTotal;

  const id = uid("order");
  const trackingCode = `NP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO orders (id, order_type, status, username, items, total, customer_name, customer_phone, customer_email, customer_province, customer_city, customer_postal_code, customer_address, device_info, issue_description, created_at, updated_at, tracking_code, coupon_code, discount_amount, points_used, points_discount)
     VALUES (?, ?, 'reviewing', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, type, req.user?.username || null, JSON.stringify(items || []), finalTotal,
    customer.name, customer.phone, customer.email || "", customer.province || "", customer.city || "", customer.postalCode || "", customer.address || "",
    deviceInfo || "", issueDescription || "", now, now, trackingCode, appliedCouponRow?.code || "", discountAmount, pointsUsed, pointsDiscount
  );

  if (appliedCouponRow) {
    db.prepare("INSERT INTO coupon_uses (id, coupon_id, username, order_id, used_at) VALUES (?, ?, ?, ?, ?)").run(
      uid("cpu"), appliedCouponRow.id, req.user.username, id, now
    );
    db.prepare("UPDATE coupons SET used_count = used_count + 1 WHERE id = ?").run(appliedCouponRow.id);
  }
  if (pointsUsed > 0) {
    db.prepare("UPDATE users SET points = points - ? WHERE username = ?").run(pointsUsed, req.user.username);
    db.prepare("INSERT INTO points_ledger (id, username, change, reason, order_id, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
      uid("plg"), req.user.username, -pointsUsed, "استفاده در سفارش", id, now
    );
  }

  res.json({ ok: true, id, trackingCode, discount: discountAmount, pointsDiscount, total: finalTotal });
});

function rowToOrder(o) {
  return {
    id: o.id,
    orderType: o.order_type,
    status: o.status,
    username: o.username || "مهمان",
    items: JSON.parse(o.items),
    total: o.total,
    couponCode: o.coupon_code || "",
    discountAmount: o.discount_amount || 0,
    pointsUsed: o.points_used || 0,
    pointsDiscount: o.points_discount || 0,
    customer: { name: o.customer_name, phone: o.customer_phone, email: o.customer_email, province: o.customer_province, city: o.customer_city, postalCode: o.customer_postal_code, address: o.customer_address },
    deviceInfo: o.device_info,
    issueDescription: o.issue_description,
    date: o.created_at,
    updatedAt: o.updated_at,
    trackingCode: o.tracking_code || `NP-${o.id.slice(-8).toUpperCase()}`,
  };
}

app.get("/api/orders/track/:code", (req, res) => {
  const code = String(req.params.code || "").trim();
  const order = db.prepare("SELECT * FROM orders WHERE tracking_code = ? OR id = ?").get(code, code);
  if (!order) return res.status(404).json({ error: "کد رهگیری پیدا نشد" });
  const safe = rowToOrder(order);
  res.json({ order: { trackingCode: safe.trackingCode, orderType: safe.orderType, status: safe.status, date: safe.date, updatedAt: safe.updatedAt } });
});

app.get("/api/orders/mine", authenticate, (req, res) => {
  const rows = db.prepare("SELECT * FROM orders WHERE username = ? ORDER BY created_at DESC").all(req.user.username);
  res.json({ orders: rows.map(rowToOrder) });
});

app.get("/api/orders", authenticate, requireAdmin, (req, res) => {
  const rows = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
  res.json({ orders: rows.map(rowToOrder) });
});

app.patch("/api/orders/:id/status", authenticate, requireAdmin, async (req, res) => {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
  if (!order) return res.status(404).json({ error: "سفارش یافت نشد" });
  const { status, notify } = req.body || {};
  const validStatuses = order.order_type === "service" ? SERVICE_STATUSES : SHOP_STATUSES;
  if (!validStatuses.includes(status)) return res.status(400).json({ error: "وضعیت نامعتبر برای این نوع سفارش" });

  db.prepare("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?").run(status, new Date().toISOString(), order.id);

  if (status === "delivered" && order.order_type === "shop" && !order.points_awarded && order.username) {
    const ls = db.prepare("SELECT * FROM loyalty_settings WHERE id = 1").get();
    const earned = ls && ls.earn_per_toman > 0 ? Math.floor(order.total / ls.earn_per_toman) : 0;
    if (earned > 0) {
      db.prepare("UPDATE users SET points = points + ? WHERE username = ?").run(earned, order.username);
      db.prepare("INSERT INTO points_ledger (id, username, change, reason, order_id, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
        uid("plg"), order.username, earned, "خرید از فروشگاه", order.id, new Date().toISOString()
      );
    }
    db.prepare("UPDATE orders SET points_awarded = 1 WHERE id = ?").run(order.id);
  }

  const notifyResult = { email: null, sms: null };
  if (notify?.email) notifyResult.email = await sendEmailNotification(order, status);
  if (notify?.sms) notifyResult.sms = await sendSmsNotification(order, status);
  res.json({ ok: true, notifyResult });
});

/* ============================== باشگاه مشتریان (امتیاز) ============================== */

app.get("/api/loyalty/me", authenticate, (req, res) => {
  const user = db.prepare("SELECT points FROM users WHERE username = ?").get(req.user.username);
  const ledger = db.prepare("SELECT * FROM points_ledger WHERE username = ? ORDER BY created_at DESC LIMIT 30").all(req.user.username);
  const ls = db.prepare("SELECT * FROM loyalty_settings WHERE id = 1").get();
  res.json({
    points: user?.points || 0,
    ledger: ledger.map((l) => ({ id: l.id, change: l.change, reason: l.reason, orderId: l.order_id, date: l.created_at })),
    settings: { enabled: !!ls.enabled, redeemValueToman: ls.redeem_value_toman, minRedeemPoints: ls.min_redeem_points, maxRedeemPercent: ls.max_redeem_percent, earnPerToman: ls.earn_per_toman },
  });
});

app.post("/api/loyalty/redeem-preview", authenticate, (req, res) => {
  const { subtotal } = req.body || {};
  const result = evaluatePointsRedeem(req.user.username, Number(subtotal) || 0);
  if (!result.ok) return res.status(400).json({ error: result.error });
  res.json({ ok: true, pointsUsed: result.pointsUsed, discount: result.discount });
});

function evaluatePointsRedeem(username, subtotal) {
  const ls = db.prepare("SELECT * FROM loyalty_settings WHERE id = 1").get();
  if (!ls.enabled) return { ok: false, error: "استفاده از امتیاز در حال حاضر فعال نیست" };
  const user = db.prepare("SELECT points FROM users WHERE username = ?").get(username);
  const points = user?.points || 0;
  if (points < ls.min_redeem_points) return { ok: false, error: `حداقل ${ls.min_redeem_points} امتیاز برای استفاده لازم است` };
  const maxByPercent = Math.floor((subtotal * ls.max_redeem_percent) / 100 / ls.redeem_value_toman);
  const pointsUsed = Math.max(0, Math.min(points, maxByPercent));
  if (pointsUsed <= 0) return { ok: false, error: "امکان استفاده از امتیاز برای این مبلغ سفارش وجود ندارد" };
  const discount = Math.min(pointsUsed * ls.redeem_value_toman, subtotal);
  return { ok: true, pointsUsed, discount };
}

app.get("/api/admin/loyalty-settings", authenticate, requireAdmin, (req, res) => {
  const ls = db.prepare("SELECT * FROM loyalty_settings WHERE id = 1").get();
  res.json({
    enabled: !!ls.enabled, earnPerToman: ls.earn_per_toman, redeemValueToman: ls.redeem_value_toman,
    minRedeemPoints: ls.min_redeem_points, maxRedeemPercent: ls.max_redeem_percent,
  });
});

app.put("/api/admin/loyalty-settings", authenticate, requireAdmin, (req, res) => {
  const b = req.body || {};
  db.prepare(
    "UPDATE loyalty_settings SET enabled=?, earn_per_toman=?, redeem_value_toman=?, min_redeem_points=?, max_redeem_percent=?, updated_at=? WHERE id=1"
  ).run(
    b.enabled ? 1 : 0, Number(b.earnPerToman) || 10000, Number(b.redeemValueToman) || 1000,
    Number(b.minRedeemPoints) || 0, Number(b.maxRedeemPercent) || 100, new Date().toISOString()
  );
  res.json({ ok: true });
});

/* ============================== پیام‌های تماس با ما ============================== */

app.post("/api/messages", (req, res) => {
  const { name, phone, email, message } = req.body || {};
  if (!name || !phone || !message) return res.status(400).json({ error: "همه فیلدها را پر کنید" });
  const id = uid("msg");
  db.prepare("INSERT INTO messages (id, name, phone, email, message, status, created_at) VALUES (?, ?, ?, ?, ?, 'new', ?)").run(
    id, name, phone, email || "", message, new Date().toISOString()
  );
  res.json({ ok: true, id });
});

app.get("/api/messages", authenticate, requireAdmin, (req, res) => {
  const rows = db.prepare("SELECT * FROM messages ORDER BY created_at DESC").all();
  res.json({
    messages: rows.map((m) => ({
      id: m.id, name: m.name, phone: m.phone, email: m.email, message: m.message,
      status: m.status || "new", adminReply: m.admin_reply || "", repliedVia: m.replied_via || "", repliedAt: m.replied_at || "",
      date: m.created_at,
    })),
  });
});

app.patch("/api/messages/:id", authenticate, requireAdmin, (req, res) => {
  const row = db.prepare("SELECT * FROM messages WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "پیام پیدا نشد" });
  const { name, phone, email, message, status } = req.body || {};
  db.prepare(
    "UPDATE messages SET name = ?, phone = ?, email = ?, message = ?, status = ? WHERE id = ?"
  ).run(
    name ?? row.name, phone ?? row.phone, email ?? row.email, message ?? row.message, status ?? row.status, req.params.id
  );
  res.json({ ok: true });
});

app.delete("/api/messages/:id", authenticate, requireAdmin, (req, res) => {
  db.prepare("DELETE FROM messages WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

app.post("/api/messages/:id/reply", authenticate, requireAdmin, async (req, res) => {
  const row = db.prepare("SELECT * FROM messages WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "پیام پیدا نشد" });
  const { reply, via } = req.body || {};
  if (!reply) return res.status(400).json({ error: "متن پاسخ را وارد کنید" });

  let result = { ok: false, error: "روش ارسال نامعتبر است" };
  if (via === "email") result = await sendRawEmail(row.email, `پاسخ به پیام شما — ${STORE_NAME}`, reply);
  else if (via === "sms") result = await sendRawSms(row.phone, reply);

  if (result.ok) {
    db.prepare("UPDATE messages SET admin_reply = ?, replied_via = ?, replied_at = ?, status = 'replied' WHERE id = ?").run(
      reply, via, new Date().toISOString(), req.params.id
    );
  }
  res.json(result);
});

/* ============================== اعلان‌ها: ایمیل و پیامک ============================== */
// نکته: اطلاعات این بخش حساس است (رمز ایمیل، کلید API پیامک) و فقط برای مدیر برگردانده می‌شود.

const STORE_NAME = "نوین پلی‌تکنیک البرز";

async function sendRawEmail(to, subject, text) {
  const cfg = db.prepare("SELECT * FROM notification_settings WHERE id = 1").get();
  if (!cfg.email_enabled || !cfg.email_host || !cfg.email_user) return { ok: false, error: "سرویس ایمیل هنوز تنظیم نشده است" };
  if (!to) return { ok: false, error: "برای این پیام ایمیلی ثبت نشده است" };
  try {
    const transporter = nodemailer.createTransport({
      host: cfg.email_host, port: cfg.email_port || 587, secure: (cfg.email_port || 587) === 465,
      auth: { user: cfg.email_user, pass: cfg.email_pass },
    });
    await transporter.sendMail({ from: cfg.email_from || cfg.email_user, to, subject, text });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function sendRawSms(to, text) {
  const cfg = db.prepare("SELECT * FROM notification_settings WHERE id = 1").get();
  if (!cfg.sms_enabled || !cfg.sms_webhook_url) return { ok: false, error: "سرویس پیامک هنوز تنظیم نشده است" };
  if (!to) return { ok: false, error: "برای این پیام شماره‌ای ثبت نشده است" };
  try {
    const res2 = await fetch(cfg.sms_webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(cfg.sms_api_key ? { Authorization: `Bearer ${cfg.sms_api_key}` } : {}) },
      body: JSON.stringify({ to, sender: cfg.sms_sender, message: text }),
    });
    if (!res2.ok) return { ok: false, error: `سرویس پیامک خطا داد (${res2.status})` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

const STATUS_LABELS_FA = {
  reviewing: "در حال بررسی سفارش",
  registered: "سفارش ثبت شد",
  packing: "در حال بسته‌بندی",
  shipped: "سفارش ارسال شد",
  delivered: "سفارش تحویل شد",
  working: "تکنسین‌ها مشغول بررسی و تعمیر هستند",
  ready: "سفارش آماده‌ی تحویل است",
};

function renderTemplate(str, vars) {
  return String(str || "").replace(/\{\{(\w+)\}\}/g, (m, key) => (vars[key] !== undefined ? vars[key] : m));
}

function getTemplate(key) {
  return db.prepare("SELECT * FROM notification_templates WHERE key = ?").get(key);
}

async function sendEmailNotification(order, status) {
  const cfg = db.prepare("SELECT * FROM notification_settings WHERE id = 1").get();
  if (!cfg.email_enabled || !cfg.email_host || !cfg.email_user) return { ok: false, error: "سرویس ایمیل هنوز تنظیم نشده است" };
  if (!order.customer_email) return { ok: false, error: "برای این سفارش ایمیل مشتری ثبت نشده است" };
  const vars = {
    storeName: STORE_NAME, customerName: order.customer_name, trackingCode: order.tracking_code || order.id,
    status: STATUS_LABELS_FA[status] || status, orderType: order.order_type === "service" ? "خدمات" : "خرید",
  };
  const tpl = getTemplate(`order_status_${status}_email`);
  const subject = tpl && tpl.enabled ? renderTemplate(tpl.subject, vars) : `به‌روزرسانی سفارش شما`;
  const text = tpl && tpl.enabled ? renderTemplate(tpl.body, vars) : `وضعیت جدید سفارش شما: ${STATUS_LABELS_FA[status] || status}`;
  try {
    const transporter = nodemailer.createTransport({
      host: cfg.email_host, port: cfg.email_port || 587, secure: (cfg.email_port || 587) === 465,
      auth: { user: cfg.email_user, pass: cfg.email_pass },
    });
    await transporter.sendMail({ from: cfg.email_from || cfg.email_user, to: order.customer_email, subject, text });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function sendSmsNotification(order, status) {
  const cfg = db.prepare("SELECT * FROM notification_settings WHERE id = 1").get();
  if (!cfg.sms_enabled || !cfg.sms_webhook_url) return { ok: false, error: "سرویس پیامک هنوز تنظیم نشده است" };
  const vars = {
    storeName: STORE_NAME, customerName: order.customer_name, trackingCode: order.tracking_code || order.id,
    status: STATUS_LABELS_FA[status] || status, orderType: order.order_type === "service" ? "خدمات" : "خرید",
  };
  const tpl = getTemplate(`order_status_${status}_sms`);
  const message = tpl && tpl.enabled ? renderTemplate(tpl.body, vars) : `${STATUS_LABELS_FA[status] || status} — نوین پلی‌تکنیک البرز`;
  try {
    const res2 = await fetch(cfg.sms_webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(cfg.sms_api_key ? { Authorization: `Bearer ${cfg.sms_api_key}` } : {}) },
      body: JSON.stringify({ to: order.customer_phone, sender: cfg.sms_sender, message }),
    });
    if (!res2.ok) return { ok: false, error: `سرویس پیامک خطا داد (${res2.status})` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

app.get("/api/admin/notification-templates", authenticate, requireAdmin, (req, res) => {
  const rows = db.prepare("SELECT * FROM notification_templates ORDER BY channel ASC, key ASC").all();
  res.json({
    templates: rows.map((t) => ({
      id: t.id, key: t.key, label: t.label, channel: t.channel, subject: t.subject, body: t.body,
      isSystem: !!t.is_system, enabled: !!t.enabled, updatedAt: t.updated_at,
    })),
  });
});

app.post("/api/admin/notification-templates", authenticate, requireAdmin, (req, res) => {
  const { key, label, channel, subject, body, enabled } = req.body || {};
  if (!key || !label) return res.status(400).json({ error: "کلید و عنوان قالب الزامی است" });
  const existing = db.prepare("SELECT id FROM notification_templates WHERE key = ?").get(key);
  if (existing) return res.status(400).json({ error: "قالبی با این کلید قبلاً وجود دارد" });
  const id = uid("tpl");
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO notification_templates (id, key, label, channel, subject, body, is_system, enabled, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`
  ).run(id, key, label, channel === "sms" ? "sms" : "email", subject || "", body || "", enabled === false ? 0 : 1, now, now);
  res.json({ ok: true, id });
});

app.put("/api/admin/notification-templates/:id", authenticate, requireAdmin, (req, res) => {
  const t = db.prepare("SELECT * FROM notification_templates WHERE id = ?").get(req.params.id);
  if (!t) return res.status(404).json({ error: "قالب پیدا نشد" });
  const { label, subject, body, enabled } = req.body || {};
  db.prepare(
    `UPDATE notification_templates SET label=?, subject=?, body=?, enabled=?, updated_at=? WHERE id=?`
  ).run(
    label ?? t.label, subject === undefined ? t.subject : subject, body === undefined ? t.body : body,
    enabled === undefined ? t.enabled : (enabled ? 1 : 0), new Date().toISOString(), t.id
  );
  res.json({ ok: true });
});

app.delete("/api/admin/notification-templates/:id", authenticate, requireAdmin, (req, res) => {
  const t = db.prepare("SELECT * FROM notification_templates WHERE id = ?").get(req.params.id);
  if (!t) return res.status(404).json({ error: "قالب پیدا نشد" });
  if (t.is_system) return res.status(400).json({ error: "قالب‌های سیستمی قابل حذف نیستند؛ می‌توانید غیرفعالش کنید" });
  db.prepare("DELETE FROM notification_templates WHERE id = ?").run(t.id);
  res.json({ ok: true });
});

app.get("/api/admin/notification-settings", authenticate, requireAdmin, (req, res) => {
  const row = db.prepare("SELECT * FROM notification_settings WHERE id = 1").get();
  res.json({
    email: { enabled: !!row.email_enabled, host: row.email_host, port: row.email_port, user: row.email_user, pass: row.email_pass, from: row.email_from },
    sms: { enabled: !!row.sms_enabled, webhookUrl: row.sms_webhook_url, apiKey: row.sms_api_key, sender: row.sms_sender },
  });
});

app.put("/api/admin/notification-settings", authenticate, requireAdmin, (req, res) => {
  const { email = {}, sms = {} } = req.body || {};
  db.prepare(
    `UPDATE notification_settings SET
      email_enabled = ?, email_host = ?, email_port = ?, email_user = ?, email_pass = ?, email_from = ?,
      sms_enabled = ?, sms_webhook_url = ?, sms_api_key = ?, sms_sender = ?, updated_at = ?
     WHERE id = 1`
  ).run(
    email.enabled ? 1 : 0, email.host || "", email.port || 587, email.user || "", email.pass || "", email.from || "",
    sms.enabled ? 1 : 0, sms.webhookUrl || "", sms.apiKey || "", sms.sender || "",
    new Date().toISOString()
  );
  res.json({ ok: true });
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

/* ============================== نظرات مشتریان ============================== */

function rowToReview(r) {
  return { id: r.id, productId: r.product_id || null, username: r.username, userName: r.user_name, rating: r.rating, comment: r.comment, date: r.created_at };
}

// عمومی: فقط نظرات تاییدشده. اگر productId داده شود فقط نظرات همان محصول، وگرنه نظرات عمومی (بدون محصول) برای نوار نظرات بالای فوتر.
app.get("/api/reviews", (req, res) => {
  const { productId } = req.query;
  const rows = productId
    ? db.prepare("SELECT * FROM reviews WHERE approved = 1 AND product_id = ? ORDER BY created_at DESC").all(productId)
    : db.prepare("SELECT * FROM reviews WHERE approved = 1 AND (product_id IS NULL OR product_id = '') ORDER BY created_at DESC LIMIT 12").all();
  res.json({ reviews: rows.map(rowToReview) });
});

app.post("/api/reviews", authenticate, (req, res) => {
  const { productId, rating, comment } = req.body || {};
  const r = Number(rating);
  if (!r || r < 1 || r > 5 || !comment) return res.status(400).json({ error: "امتیاز (۱ تا ۵) و متن نظر الزامی است" });
  const id = uid("rev");
  db.prepare(
    "INSERT INTO reviews (id, product_id, username, user_name, rating, comment, approved, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)"
  ).run(id, productId || null, req.user.username, req.user.name, r, comment, new Date().toISOString());
  res.json({ ok: true, id, pending: true });
});

app.get("/api/admin/reviews", authenticate, requireAdmin, (req, res) => {
  const rows = db.prepare("SELECT * FROM reviews ORDER BY created_at DESC").all();
  res.json({ reviews: rows.map((r) => ({ ...rowToReview(r), approved: !!r.approved })) });
});

app.patch("/api/admin/reviews/:id", authenticate, requireAdmin, (req, res) => {
  const { approved } = req.body || {};
  const result = db.prepare("UPDATE reviews SET approved = ? WHERE id = ?").run(approved ? 1 : 0, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "نظر یافت نشد" });
  res.json({ ok: true });
});

app.delete("/api/admin/reviews/:id", authenticate, requireAdmin, (req, res) => {
  db.prepare("DELETE FROM reviews WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

/* ============================== تیکت‌های پشتیبانی ============================== */

function rowToTicket(t) {
  return { id: t.id, username: t.username, userName: t.user_name, subject: t.subject, status: t.status, createdAt: t.created_at, updatedAt: t.updated_at };
}

app.post("/api/tickets", authenticate, (req, res) => {
  const { subject, message } = req.body || {};
  if (!subject || !message) return res.status(400).json({ error: "موضوع و متن پیام الزامی است" });
  const id = uid("tic");
  const now = new Date().toISOString();
  db.prepare("INSERT INTO tickets (id, username, user_name, subject, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'open', ?, ?)")
    .run(id, req.user.username, req.user.name, subject, now, now);
  db.prepare("INSERT INTO ticket_messages (id, ticket_id, sender, sender_name, message, created_at) VALUES (?, ?, 'user', ?, ?, ?)")
    .run(uid("tmsg"), id, req.user.name, message, now);
  res.json({ ok: true, id });
});

app.get("/api/tickets/mine", authenticate, (req, res) => {
  const rows = db.prepare("SELECT * FROM tickets WHERE username = ? ORDER BY updated_at DESC").all(req.user.username);
  res.json({ tickets: rows.map(rowToTicket) });
});

app.get("/api/tickets", authenticate, requireAdmin, (req, res) => {
  const rows = db.prepare("SELECT * FROM tickets ORDER BY updated_at DESC").all();
  res.json({ tickets: rows.map(rowToTicket) });
});

function loadTicketWithAccess(id, user, res) {
  const ticket = db.prepare("SELECT * FROM tickets WHERE id = ?").get(id);
  if (!ticket) { res.status(404).json({ error: "تیکت یافت نشد" }); return null; }
  if (user.role !== "admin" && ticket.username !== user.username) { res.status(403).json({ error: "دسترسی ندارید" }); return null; }
  return ticket;
}

app.get("/api/tickets/:id", authenticate, (req, res) => {
  const ticket = loadTicketWithAccess(req.params.id, req.user, res);
  if (!ticket) return;
  const messages = db.prepare("SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC").all(ticket.id);
  res.json({
    ticket: rowToTicket(ticket),
    messages: messages.map((m) => ({ id: m.id, sender: m.sender, senderName: m.sender_name, message: m.message, date: m.created_at })),
  });
});

app.post("/api/tickets/:id/messages", authenticate, (req, res) => {
  const ticket = loadTicketWithAccess(req.params.id, req.user, res);
  if (!ticket) return;
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: "متن پیام الزامی است" });
  const now = new Date().toISOString();
  const sender = req.user.role === "admin" ? "admin" : "user";
  db.prepare("INSERT INTO ticket_messages (id, ticket_id, sender, sender_name, message, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(uid("tmsg"), ticket.id, sender, req.user.name, message, now);
  const newStatus = sender === "admin" ? "answered" : "open";
  db.prepare("UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?").run(newStatus, now, ticket.id);
  res.json({ ok: true });
});

app.patch("/api/tickets/:id", authenticate, requireAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!["open", "answered", "closed"].includes(status)) return res.status(400).json({ error: "وضعیت نامعتبر" });
  const result = db.prepare("UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?").run(status, new Date().toISOString(), req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "تیکت یافت نشد" });
  res.json({ ok: true });
});

/* ============================== پاپ‌آپ‌های زمان‌بندی‌شده ============================== */

function rowToPopup(p) {
  return {
    id: p.id,
    label: p.label,
    message: { fa: p.message_fa, en: p.message_en },
    buttonText: { fa: p.button_text_fa, en: p.button_text_en },
    buttonUrl: p.button_url,
    imageUrl: p.image_url || "",
    targetPage: p.target_page,
    startDate: p.start_date,
    endDate: p.end_date,
    enabled: !!p.enabled,
    createdAt: p.created_at,
  };
}

app.get("/api/popups/active", (req, res) => {
  const page = req.query.page || "home";
  const now = new Date().toISOString();
  const rows = db.prepare(
    `SELECT * FROM popups WHERE enabled = 1 AND start_date <= ? AND end_date >= ? AND (target_page = 'all' OR target_page = ?)`
  ).all(now, now, page);
  res.json({ popups: rows.map(rowToPopup) });
});

app.get("/api/admin/popups", authenticate, requireEditor, (req, res) => {
  const rows = db.prepare("SELECT * FROM popups ORDER BY created_at DESC").all();
  res.json({ popups: rows.map(rowToPopup) });
});

app.post("/api/admin/popups", authenticate, requireEditor, (req, res) => {
  const { label, message, buttonText, buttonUrl, imageUrl, targetPage, startDate, endDate, enabled } = req.body || {};
  if (!label || !startDate || !endDate) return res.status(400).json({ error: "عنوان داخلی و بازه‌ی تاریخ الزامی است" });
  const id = uid("popup");
  db.prepare(
    `INSERT INTO popups (id, label, message_fa, message_en, button_text_fa, button_text_en, button_url, image_url, target_page, start_date, end_date, enabled, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, label, message?.fa || "", message?.en || "", buttonText?.fa || "", buttonText?.en || "",
    buttonUrl || "", imageUrl || "", targetPage || "all", startDate, endDate, enabled ? 1 : 0, new Date().toISOString()
  );
  res.json({ ok: true, id });
});

app.put("/api/admin/popups/:id", authenticate, requireEditor, (req, res) => {
  const p = db.prepare("SELECT * FROM popups WHERE id = ?").get(req.params.id);
  if (!p) return res.status(404).json({ error: "پاپ‌آپ یافت نشد" });
  const { label, message, buttonText, buttonUrl, imageUrl, targetPage, startDate, endDate, enabled } = req.body || {};
  db.prepare(
    `UPDATE popups SET label=?, message_fa=?, message_en=?, button_text_fa=?, button_text_en=?, button_url=?, image_url=?, target_page=?, start_date=?, end_date=?, enabled=? WHERE id=?`
  ).run(
    label ?? p.label, message?.fa ?? p.message_fa, message?.en ?? p.message_en,
    buttonText?.fa ?? p.button_text_fa, buttonText?.en ?? p.button_text_en, buttonUrl ?? p.button_url, imageUrl ?? p.image_url,
    targetPage ?? p.target_page, startDate ?? p.start_date, endDate ?? p.end_date,
    enabled === undefined ? p.enabled : (enabled ? 1 : 0), p.id
  );
  res.json({ ok: true });
});

app.delete("/api/admin/popups/:id", authenticate, requireEditor, (req, res) => {
  db.prepare("DELETE FROM popups WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

/* ============================== سئو: sitemap.xml ============================== */

app.get("/sitemap.xml", (req, res) => {
  const base = `${req.protocol}://${req.get("host")}`;
  const pages = db.prepare("SELECT slug, updated_at FROM pages WHERE status = 'published'").all();
  const staticRoutes = ["", "services", "shop", "articles", "faq", "about", "contact", "tracking"];
  let products = [];
  try { products = JSON.parse(db.prepare("SELECT data FROM site_content WHERE id = 1").get().data).products || []; } catch (e) { /* ignore */ }
  const urls = [
    ...staticRoutes.map((r) => `  <url><loc>${base}/${r}</loc><changefreq>weekly</changefreq><priority>${r ? "0.7" : "1.0"}</priority></url>`),
    ...pages.map((p) => `  <url><loc>${base}/page/${p.slug}</loc><lastmod>${(p.updated_at || "").slice(0, 10)}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`),
    ...products.map((p) => `  <url><loc>${base}/product/${p.id}</loc><changefreq>weekly</changefreq><priority>0.65</priority></url>`),
  ];
  res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`);
});

/* ============================== رندر ساده برای ربات‌های جستجو/هوش مصنوعی ============================== */
// این اپ یک SPA است؛ خیلی از خزنده‌های هوش مصنوعی (برخلاف گوگل) جاوااسکریپت را اجرا نمی‌کنند.
// برای این‌که این ربات‌ها محتوای واقعی سایت را ببینند، یک نسخه‌ی HTML ساده و کامل از اطلاعات کلیدی کسب‌وکار
// (خدمات، محصولات، سوالات متداول، اطلاعات تماس) فقط به User-Agent های شناخته‌شده‌ی ربات نمایش داده می‌شود؛
// کاربران عادی همان اپ کامل React را دریافت می‌کنند.
const BOT_UA_REGEX = /googlebot|bingbot|yandex|duckduckbot|baiduspider|gptbot|chatgpt-user|oai-searchbot|claudebot|claude-web|anthropic-ai|perplexitybot|ccbot|bytespider|applebot|facebookexternalhit|linkedinbot|slackbot|twitterbot|whatsapp/i;

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

app.get(/^(?!\/api|\/uploads).*/, (req, res, next) => {
  const ua = req.headers["user-agent"] || "";
  if (!BOT_UA_REGEX.test(ua)) return next();
  try {
    const row = db.prepare("SELECT data FROM site_content WHERE id = 1").get();
    const c = JSON.parse(row.data);
    const base = `${req.protocol}://${req.get("host")}`;
    const s = c.settings || {};
    const siteName = escapeHtml(tr_fa(s.siteName) || "نوین پلی‌تکنیک البرز");
    const segs = req.path.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
    const seg0 = segs[0] || "";

    const wrap = (title, description, canonicalPath, bodyHtml) => {
      res.set("Cache-Control", "public, max-age=1800");
      res.type("html").send(`<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${base}${canonicalPath}" />
</head>
<body>
${bodyHtml}
<p><a href="${base}/">${lang_view_full()}</a></p>
</body>
</html>`);
    };
    function lang_view_full() { return "مشاهده‌ی نسخه‌ی کامل و تعاملی سایت"; }

    if (seg0 === "product" && segs[1]) {
      const p = (c.products || []).find((x) => x.id === segs[1]);
      if (!p) return next();
      const title = `${escapeHtml(tr_fa(p.name))} — ${siteName}`;
      const desc = escapeHtml(tr_fa(p.desc) || "").slice(0, 160);
      const body = `<h1>${escapeHtml(tr_fa(p.name))}</h1><p>برند: ${escapeHtml(p.brand || "")}</p><p>${escapeHtml(tr_fa(p.desc) || "")}</p><p><strong>قیمت: ${Number(p.price || 0).toLocaleString("fa-IR")} تومان</strong></p>`;
      return wrap(title, desc, `/product/${p.id}`, body);
    }

    if (seg0 === "page" && segs[1]) {
      const page = db.prepare("SELECT * FROM pages WHERE slug = ? AND status = 'published'").get(segs[1]);
      if (!page) return next();
      const pageTitle = tr_fa(parseTitle(page.title)) || page.title;
      let blocksText = "";
      try {
        const blocks = JSON.parse(page.blocks || "[]");
        blocksText = blocks.filter((b) => b.type === "text" || b.type === "heading").map((b) => `<p>${escapeHtml(tr_fa(b.content))}</p>`).join("\n");
      } catch (e) { /* ignore */ }
      const title = `${escapeHtml(pageTitle)} — ${siteName}`;
      const body = `<h1>${escapeHtml(pageTitle)}</h1>${blocksText}`;
      return wrap(title, pageTitle, `/page/${page.slug}`, body);
    }

    if (seg0 === "services") {
      const html = (c.services || []).map((sv) => `<li><h2>${escapeHtml(sv.title?.fa)}</h2><p>${escapeHtml(sv.desc?.fa)}</p>${sv.priceRange?.fa ? `<p><strong>${escapeHtml(sv.priceRange.fa)}</strong></p>` : ""}</li>`).join("\n");
      return wrap(`خدمات تعمیر — ${siteName}`, "تعمیر تخصصی کامپیوتر، لپ‌تاپ، پلی‌استیشن و بازیابی اطلاعات.", "/services", `<h1>خدمات ما</h1><ul>${html}</ul>`);
    }

    if (seg0 === "shop") {
      const html = (c.products || []).map((p) => `<li><a href="${base}/product/${p.id}"><h2>${escapeHtml(p.name?.fa)}</h2></a><p>${escapeHtml(p.desc?.fa)}</p><p>قیمت: ${Number(p.price || 0).toLocaleString("fa-IR")} تومان</p></li>`).join("\n");
      return wrap(`فروشگاه ویدئو پروژکتور — ${siteName}`, "فروش اورجینال انواع ویدئو پروژکتور با گارانتی.", "/shop", `<h1>فروشگاه</h1><ul>${html}</ul>`);
    }

    if (seg0 === "faq") {
      const html = (c.faq || []).map((f) => `<li><h2>${escapeHtml(f.question?.fa)}</h2><p>${escapeHtml(f.answer?.fa)}</p></li>`).join("\n");
      return wrap(`سوالات متداول — ${siteName}`, "پاسخ به پرتکرارترین سوالات مشتریان.", "/faq", `<h1>سوالات متداول</h1><ul>${html}</ul>`);
    }

    if (seg0 === "articles") {
      const articles = db.prepare("SELECT title, slug FROM pages WHERE status = 'published' AND is_article = 1").all();
      const html = articles.map((a) => `<li><a href="${base}/page/${a.slug}">${escapeHtml(tr_fa(parseTitle(a.title)))}</a></li>`).join("\n");
      return wrap(`مقالات — ${siteName}`, "مقالات آموزشی درباره‌ی تعمیر و نگهداری کامپیوتر و سخت‌افزار.", "/articles", `<h1>مقالات</h1><ul>${html}</ul>`);
    }

    if (seg0 === "contact") {
      const body = `<h1>تماس با ما</h1><p>تلفن: ${escapeHtml(s.phone || "02632536821")}${s.mobile ? ` — موبایل: ${escapeHtml(s.mobile)}` : ""}</p><p>آدرس: ${escapeHtml(tr_fa(s.address) || "")}</p>`;
      return wrap(`تماس با ما — ${siteName}`, "اطلاعات تماس و آدرس نوین پلی‌تکنیک البرز.", "/contact", body);
    }

    // صفحه‌ی اصلی و سایر مسیرهای ناشناخته: خلاصه‌ی کامل کسب‌وکار
    const servicesHtml = (c.services || []).map((sv) => `<li><h3>${escapeHtml(sv.title?.fa)}</h3><p>${escapeHtml(sv.desc?.fa)}</p></li>`).join("\n");
    const productsHtml = (c.products || []).map((p) => `<li><h3>${escapeHtml(p.name?.fa)} (${escapeHtml(p.brand)})</h3><p>${escapeHtml(p.desc?.fa)}</p><p>قیمت: ${Number(p.price || 0).toLocaleString("fa-IR")} تومان</p></li>`).join("\n");
    const faqHtml = (c.faq || []).map((f) => `<li><h3>${escapeHtml(f.question?.fa)}</h3><p>${escapeHtml(f.answer?.fa)}</p></li>`).join("\n");
    const articles = db.prepare("SELECT title, slug FROM pages WHERE status = 'published' AND is_article = 1").all();
    const articlesHtml = articles.map((a) => `<li><a href="${base}/page/${a.slug}">${escapeHtml(tr_fa(parseTitle(a.title)))}</a></li>`).join("\n");
    const body = `<h1>${siteName}</h1>
<p>${escapeHtml(tr_fa(s.tagline) || "تعمیر تخصصی کامپیوتر، لپ‌تاپ، پلی‌استیشن و فروش اورجینال ویدئو پروژکتور در کرج")}</p>
<section><h2>خدمات</h2><ul>${servicesHtml}</ul></section>
<section><h2>محصولات فروشگاه (ویدئو پروژکتور)</h2><ul>${productsHtml}</ul></section>
<section><h2>سوالات متداول</h2><ul>${faqHtml}</ul></section>
${articles.length ? `<section><h2>مقالات</h2><ul>${articlesHtml}</ul></section>` : ""}
<section><h2>تماس با ما</h2><p>تلفن: ${escapeHtml(s.phone || "02632536821")}${s.mobile ? ` — موبایل: ${escapeHtml(s.mobile)}` : ""}</p><p>آدرس: ${escapeHtml(tr_fa(s.address) || "")}</p></section>`;
    return wrap(`${siteName} | تعمیر کامپیوتر، پلی‌استیشن و فروش ویدئو پروژکتور`, tr_fa(s.tagline) || "تعمیر تخصصی کامپیوتر، لپ‌تاپ و پلی‌استیشن، بازیابی اطلاعات و فروشگاه اورجینال ویدئو پروژکتور در کرج.", "/", body);
  } catch (e) {
    return next();
  }
});

function tr_fa(v) { return typeof v === "object" && v ? v.fa : v; }

/* ============================== پشتیبان‌گیری خودکار از دیتابیس ============================== */
// هر ۲۴ ساعت یک نسخه‌ی پشتیبان از فایل دیتابیس گرفته می‌شود و ۱۴ نسخه‌ی آخر نگه داشته می‌شود.
// این جایگزین دیسک دائمی نیست؛ اگر روی Render دیسک دائمی وصل نکرده باشید، این پوشه هم با هر دیپلوی پاک می‌شود—
// پس بهتر است هم دیسک دائمی وصل باشد و هم این پشتیبان‌ها به‌عنوان لایه‌ی حفاظتی دوم وجود داشته باشند.
const backupsDir = process.env.BACKUPS_DIR || path.join(path.dirname(process.env.DB_PATH || "./data.sqlite"), "backups");
if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
const DB_FILE_PATH = process.env.DB_PATH || "./data.sqlite";

function runBackup() {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) return;
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dest = path.join(backupsDir, `backup-${stamp}.sqlite`);
    fs.copyFileSync(DB_FILE_PATH, dest);
    const files = fs.readdirSync(backupsDir).filter((f) => f.startsWith("backup-")).sort();
    while (files.length > 14) fs.unlinkSync(path.join(backupsDir, files.shift()));
    console.log(`[backup] نسخه‌ی پشتیبان ذخیره شد: ${dest}`);
  } catch (e) {
    console.error("[backup] خطا در پشتیبان‌گیری:", e.message);
  }
}
setTimeout(runBackup, 60 * 1000); // ۱ دقیقه بعد از بالا آمدن سرور
setInterval(runBackup, 24 * 60 * 60 * 1000); // هر ۲۴ ساعت

app.get("/api/admin/backups", authenticate, requireAdmin, (req, res) => {
  const files = fs.existsSync(backupsDir)
    ? fs.readdirSync(backupsDir).filter((f) => f.startsWith("backup-")).sort().reverse().map((f) => {
        const stat = fs.statSync(path.join(backupsDir, f));
        return { name: f, sizeKb: Math.round(stat.size / 1024), createdAt: stat.mtime.toISOString() };
      })
    : [];
  res.json({ backups: files });
});

app.get("/api/admin/backups/:name/download", authenticate, requireAdmin, (req, res) => {
  const safeName = path.basename(req.params.name);
  const filePath = path.join(backupsDir, safeName);
  if (!safeName.startsWith("backup-") || !fs.existsSync(filePath)) return res.status(404).json({ error: "فایل پیدا نشد" });
  res.download(filePath);
});

app.post("/api/admin/backups/run-now", authenticate, requireAdmin, (req, res) => {
  runBackup();
  res.json({ ok: true });
});

/* ============================== پایش خطا (جایگزین سبک Sentry) ============================== */
// خطاهای سمت سرور و سمت کاربر (مرورگر) در دیتابیس ذخیره می‌شوند تا در پنل مدیریت قابل مشاهده باشند،
// بدون نیاز به ثبت‌نام در یک سرویس ثالث.

function logError(source, message, stack, url, userAgent) {
  try {
    db.prepare("INSERT INTO error_logs (id, source, message, stack, url, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      uid("err"), source, String(message || "").slice(0, 2000), String(stack || "").slice(0, 4000), String(url || "").slice(0, 500), String(userAgent || "").slice(0, 300), new Date().toISOString()
    );
    const count = db.prepare("SELECT COUNT(*) as c FROM error_logs").get().c;
    if (count > 500) {
      const excess = db.prepare("SELECT id FROM error_logs ORDER BY created_at ASC LIMIT ?").all(count - 500);
      const del = db.prepare("DELETE FROM error_logs WHERE id = ?");
      excess.forEach((r) => del.run(r.id));
    }
  } catch (e) { /* اگر خود لاگ کردن خطا بدهد، نادیده گرفته می‌شود */ }
}

process.on("uncaughtException", (err) => { console.error("[uncaughtException]", err); logError("server", err.message, err.stack, "", ""); });
process.on("unhandledRejection", (err) => { console.error("[unhandledRejection]", err); logError("server", err?.message || String(err), err?.stack || "", "", ""); });

const clientErrorLimiter = rateLimit({ windowMs: 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });
app.post("/api/client-error", clientErrorLimiter, (req, res) => {
  const { message, stack, url } = req.body || {};
  logError("client", message, stack, url, req.headers["user-agent"] || "");
  res.json({ ok: true });
});

app.get("/api/admin/error-logs", authenticate, requireAdmin, (req, res) => {
  const rows = db.prepare("SELECT * FROM error_logs ORDER BY created_at DESC LIMIT 200").all();
  res.json({ errors: rows.map((r) => ({ id: r.id, source: r.source, message: r.message, stack: r.stack, url: r.url, userAgent: r.user_agent, createdAt: r.created_at })) });
});

app.delete("/api/admin/error-logs", authenticate, requireAdmin, (req, res) => {
  db.prepare("DELETE FROM error_logs").run();
  res.json({ ok: true });
});

/* ============================== سرو کردن فرانت‌اند ساخته‌شده (تک‌سرویسی) ============================== */
// اگر پوشه‌ی client/dist وجود داشته باشد (یعنی فرانت‌اند build شده)، همین سرور آن را هم سرو می‌کند.
// این یعنی فقط یک سرویس روی Render لازم است، نه دو سرویس جدا.

const clientDist = path.join(__dirname, "../client/dist");
app.use(express.static(clientDist, {
  maxAge: "1y",
  immutable: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith("index.html")) res.setHeader("Cache-Control", "no-cache");
  },
}));
app.get(/^(?!\/api).*/, (req, res, next) => {
  res.set("Cache-Control", "no-cache");
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

// هندلر سراسری خطا؛ اگر مسیری خطای غیرمنتظره بدهد، اینجا گرفته و ثبت می‌شود
app.use((err, req, res, next) => {
  console.error("[express error]", err);
  logError("server", err.message, err.stack, req.originalUrl, req.headers["user-agent"] || "");
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "خطای غیرمنتظره‌ای رخ داد" });
});

app.listen(PORT, () => {
  console.log(`✅ سرور نوین پلی‌تکنیک البرز روی پورت ${PORT} در حال اجراست`);
});
