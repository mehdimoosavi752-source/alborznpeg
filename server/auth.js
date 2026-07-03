import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn(
    "[هشدار امنیتی] متغیر محیطی JWT_SECRET تنظیم نشده؛ از یک مقدار موقت و ناامن استفاده می‌شود. حتماً قبل از استفاده‌ی واقعی، JWT_SECRET را در تنظیمات سرور تنظیم کنید."
  );
}
const SECRET = JWT_SECRET || "dev-only-insecure-secret-change-me";

export function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, name: user.name, role: user.role },
    SECRET,
    { expiresIn: "7d" }
  );
}

export function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "ابتدا وارد حساب کاربری خود شوید" });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: "نشست شما منقضی شده، دوباره وارد شوید" });
  }
}

// احراز هویت اختیاری: اگر توکن معتبر بود کاربر را ست می‌کند، وگرنه بدون خطا ادامه می‌دهد (برای سفارش مهمان)
export function optionalAuthenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try { req.user = jwt.verify(token, SECRET); } catch (e) { /* بدون کاربر ادامه بده */ }
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "شما دسترسی مدیریتی ندارید" });
  }
  next();
}

// ویرایشگر یا مدیر: دسترسی به مدیریت کل محتوای سایت (خدمات، محصولات، منو، فوتر، هیرو)
export function requireEditor(req, res, next) {
  if (!req.user || !["admin", "editor"].includes(req.user.role)) {
    return res.status(403).json({ error: "شما دسترسی ویرایش محتوا را ندارید" });
  }
  next();
}

// نویسنده، ویرایشگر یا مدیر: حداقل دسترسی برای ورود به پنل و ساخت/ویرایش صفحات
export function requireAuthor(req, res, next) {
  if (!req.user || !["admin", "editor", "author"].includes(req.user.role)) {
    return res.status(403).json({ error: "شما دسترسی لازم برای این بخش را ندارید" });
  }
  next();
}
