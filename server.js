const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");
const { Pool } = require("pg");

const root = __dirname;
const port = Number(process.env.PORT || 8080);
const adminEmail = String(process.env.ADMIN_EMAIL || "admin@asmdi.ir").trim().toLowerCase();
const adminPassword = String(process.env.ADMIN_PASSWORD || "");
const adminName = String(process.env.ADMIN_NAME || "مدیر سایت").trim();
const sessions = new Map();
const loginAttempts = new Map();
const apiAttempts = new Map();
let chatWidgetOrigins = new Set();
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000;
const LOGIN_WINDOW = 15 * 60 * 1000;
const LOGIN_LIMIT = 8;
const API_WINDOW = 60 * 1000;
const API_LIMIT = 220;
setInterval(() => {
  const now = Date.now();
  for (const [sid, session] of sessions) if (session.expiresAt <= now) sessions.delete(sid);
  for (const [key, record] of loginAttempts) if (record.resetAt <= now) loginAttempts.delete(key);
  for (const [key, record] of apiAttempts) if (record.resetAt <= now) apiAttempts.delete(key);
}, 10 * 60 * 1000).unref();
const articleSeo = {
  "toefl-2026-changes": {
    title: "تغییرات آزمون TOEFL iBT در سال ۲۰۲۶ | موسسه علامه سخن",
    description: "راهنمای تغییرات نسخه جدید TOEFL iBT از ۲۱ ژانویه ۲۰۲۶، ساختار تطبیقی، مقیاس نمره ۱ تا ۶ و نکات ثبت‌نام.",
  },
  "toefl-mock-benefits": {
    title: "فواید آزمون آزمایشی TOEFL | موسسه علامه سخن",
    description: "فواید ماک TOEFL، زمان مناسب شرکت، تحلیل چهار مهارت و نقش شبیه‌سازی در کاهش استرس روز آزمون.",
  },
  "register-toefl-gre-iran": {
    title: "ثبت‌نام TOEFL و GRE از ایران و خرید ووچر | علامه سخن",
    description: "راهنمای ثبت‌نام TOEFL iBT و GRE از ایران، پرداخت ارزی، خرید ووچر و نکات امنیتی.",
  },
  "allameh-new-toefl-mock": {
    title: "آزمون آزمایشی TOEFL با فرمت جدید | علامه سخن",
    description: "معرفی ماک TOEFL فرمت جدید با سوالات استاندارد، محیط سنتر و ارزیابی Speaking و Writing.",
  },
  "ets-centers-tehran": {
    title: "مراکز ETS در تهران و انتخاب سنتر آزمون | علامه سخن",
    description: "راهنمای یافتن فهرست به‌روز مراکز ETS تهران و معیارهای انتخاب سنتر مناسب TOEFL و GRE.",
  },
  "toefl-test-guide": {
    title: "راهنمای کامل آزمون TOEFL iBT | موسسه علامه سخن",
    description: "آشنایی با چهار مهارت TOEFL iBT، آمادگی روز آزمون، مدارک و مسیر ثبت‌نام و خرید ووچر.",
  },
};
const pageSeo = {
  "/toefl": {
    page: "toefl",
    title: "آزمون TOEFL iBT در تهران | موسسه علامه سخن",
    description: "اطلاعات، تاریخ‌ها، ثبت‌نام و آمادگی آزمون TOEFL iBT در موسسه علامه سخن، مرکز رسمی آزمون‌های ETS در تهران.",
  },
  "/gre": {
    page: "gre",
    title: "آزمون GRE General در تهران | موسسه علامه سخن",
    description: "راهنمای آزمون GRE General، تاریخ‌ها، ثبت‌نام، ووچر و آمادگی GRE در موسسه علامه سخن.",
  },
  "/mock-toefl": {
    page: "mock-toefl",
    title: "آزمون آزمایشی TOEFL iBT | ماک تافل علامه سخن",
    description: "شبیه‌سازی TOEFL iBT با تجهیزات سنتر، سوالات استاندارد، محیط آزمون و ارزیابی تخصصی مهارت‌ها.",
  },
  "/mock-gre": {
    page: "mock-gre",
    title: "آزمون آزمایشی GRE General | موسسه علامه سخن",
    description: "آزمون Mock GRE General برای ارزیابی آمادگی، مدیریت زمان و شناخت نقاط قابل بهبود پیش از آزمون اصلی.",
  },
  "/mock": {
    page: "mock",
    title: "آزمون‌های آزمایشی زبان و آزمون بین‌المللی | علامه سخن",
    description: "آزمون‌های آزمایشی و تعیین سطح برای سنجش آمادگی زبان انگلیسی، TOEFL iBT و GRE General در موسسه علامه سخن.",
  },
  "/toefl-dates": {
    page: "toefl-dates",
    title: "تاریخ‌های آزمون TOEFL iBT | موسسه علامه سخن",
    description: "مشاهده تاریخ‌های فعال آزمون TOEFL iBT، ظرفیت‌ها و مسیر ثبت‌نام در موسسه علامه سخن.",
  },
  "/gre-dates": {
    page: "gre-dates",
    title: "تاریخ‌های آزمون GRE General | موسسه علامه سخن",
    description: "تقویم تاریخ‌های آزمون GRE General، ظرفیت‌های اعلام‌شده و ثبت درخواست آزمون در موسسه علامه سخن.",
  },
  "/mock-dates": {
    page: "mock-dates",
    title: "تاریخ آزمون‌های آزمایشی TOEFL و GRE | علامه سخن",
    description: "تقویم آزمون‌های آزمایشی Mock TOEFL iBT و Mock GRE General با شرایط شبیه‌سازی‌شده آزمون اصلی.",
  },
  "/exam-registration": {
    page: "exam-registration",
    title: "ثبت‌نام آزمون TOEFL iBT و GRE | موسسه علامه سخن",
    description: "فرم ثبت درخواست آزمون رسمی TOEFL iBT و GRE، انتخاب تاریخ، ثبت اطلاعات داوطلب و پیگیری از پنل کاربری.",
  },
  "/course-registration": {
    page: "course-registration",
    title: "ثبت‌نام دوره‌های زبان و آمادگی آزمون | علامه سخن",
    description: "ثبت‌نام دوره‌های زبان عمومی، آکادمیک، TOEFL، GRE، IELTS و کلاس‌های مهارتی در موسسه علامه سخن.",
  },
  "/placement": {
    page: "placement",
    title: "تعیین سطح زبان انگلیسی و TOEFL | موسسه علامه سخن",
    description: "آزمون تعیین سطح جنرال و تعیین سطح تخصصی TOEFL با Reading، Listening و Writing و ذخیره نتیجه در پنل کاربری.",
  },
  "/consultation": {
    page: "consultation",
    title: "رزرو مشاوره تخصصی زبان و آزمون | موسسه علامه سخن",
    description: "رزرو وقت مشاوره برای انتخاب دوره، تحلیل نتیجه آزمون و برنامه‌ریزی آمادگی TOEFL، GRE و زبان عمومی.",
  },
  "/toefl-voucher": {
    page: "toefl-voucher",
    title: "خرید ووچر TOEFL iBT | موسسه علامه سخن",
    description: "ثبت درخواست خرید ووچر TOEFL iBT با راهنمایی، پشتیبانی ثبت‌نام و بررسی اعتبار ووچر.",
  },
  "/gre-voucher": {
    page: "gre-voucher",
    title: "خرید ووچر GRE | موسسه علامه سخن",
    description: "ثبت درخواست خرید ووچر GRE و دریافت راهنمایی برای استفاده از کد ووچر و ثبت‌نام آزمون.",
  },
  "/about": {
    page: "about",
    title: "درباره موسسه علامه سخن | بیش از ۳۰ سال تجربه",
    description: "معرفی موسسه علامه سخن، مرکز آموزش زبان انگلیسی و آزمون‌های بین‌المللی TOEFL iBT و GRE.",
  },
  "/contact": {
    page: "contact",
    title: "ارتباط با موسسه علامه سخن | تلفن، آدرس و مشاوره",
    description: "راه‌های ارتباط با موسسه علامه سخن، شماره تماس، آدرس مرکز و ثبت پیام برای مشاوره دوره و آزمون.",
  },
  "/history": {
    page: "history",
    title: "تاریخچه موسسه علامه سخن | از ۱۳۷۴ تا امروز",
    description: "مروری بر تاریخچه موسسه علامه سخن، آغاز فعالیت آموزشی، توسعه دوره‌های آزمون و مرکز رسمی آزمون‌های بین‌المللی.",
  },
  "/stats": {
    page: "achievements",
    title: "آمار و افتخارات موسسه علامه سخن",
    description: "بیش از ۳۰ سال سابقه آموزش زبان، هزاران دانشجوی موفق و صدها دوره آموزشی در حوزه زبان و آزمون‌های بین‌المللی.",
  },
  "/achievements": {
    page: "achievements",
    title: "آمار و افتخارات موسسه علامه سخن",
    description: "بیش از ۳۰ سال سابقه آموزش زبان، هزاران دانشجوی موفق و صدها دوره آموزشی در حوزه زبان و آزمون‌های بین‌المللی.",
  },
  "/faq": {
    page: "faq",
    title: "سوالات پرتکرار زبان و آزمون | موسسه علامه سخن",
    description: "پاسخ به سوالات رایج درباره دوره‌های زبان، آزمون‌های TOEFL iBT و GRE، ثبت‌نام، ووچر و آزمون‌های آزمایشی.",
  },
  "/general": {
    page: "general",
    title: "دوره‌های زبان عمومی و آکادمیک | موسسه علامه سخن",
    description: "دوره‌های زبان عمومی و آکادمیک برای تقویت پایه زبان انگلیسی، مکالمه، خواندن، نوشتن و آمادگی مسیرهای بین‌المللی.",
  },
  "/specialized": {
    page: "specialized",
    title: "دوره‌های تخصصی TOEFL، IELTS و GRE | علامه سخن",
    description: "دوره‌های تخصصی بین‌المللی برای آمادگی آزمون‌های TOEFL iBT، IELTS Academic و General و GRE General.",
  },
  "/conversation": {
    page: "communication",
    title: "دوره مکالمه و مهارت‌های ارتباطی | موسسه علامه سخن",
    description: "کلاس‌های مکالمه و مهارت‌های ارتباطی برای تقویت fluency، اعتمادبه‌نفس و کاربرد زبان انگلیسی در موقعیت‌های واقعی.",
  },
  "/communication": {
    page: "communication",
    title: "دوره مکالمه و مهارت‌های ارتباطی | موسسه علامه سخن",
    description: "کلاس‌های مکالمه و مهارت‌های ارتباطی برای تقویت fluency، اعتمادبه‌نفس و کاربرد زبان انگلیسی در موقعیت‌های واقعی.",
  },
  "/newsletter": {
    page: "newsletter",
    title: "خبرنامه زبان و آزمون‌های بین‌المللی | موسسه علامه سخن",
    description: "آخرین مقاله‌ها، راهنماها و خبرهای آموزشی درباره TOEFL iBT، GRE، آزمون‌های آزمایشی و مسیر آمادگی زبان.",
  },
  "/gallery": {
    page: "gallery",
    title: "گالری تصاویر موسسه علامه سخن | فضای آموزش و آزمون",
    description: "تصاویر محیط آموزشی، تجهیزات و محل برگزاری آزمون‌های رسمی TOEFL iBT و GRE General در موسسه علامه سخن.",
  },
  "/library": {
    page: "library",
    title: "کتابخانه رایگان زبان انگلیسی | موسسه علامه سخن",
    description: "منابع رایگان زبان انگلیسی، کتاب، جزوه و فایل آموزشی دسته‌بندی‌شده بر اساس سطح و آزمون.",
  },
  "/learning-articles": {
    page: "learning-articles",
    title: "مقاله‌های آموزشی زبان و آزمون | موسسه علامه سخن",
    description: "مقاله‌های آموزشی برای زبان انگلیسی، TOEFL، GRE و آمادگی آزمون‌های بین‌المللی.",
  },
  "/learning-videos": {
    page: "learning-videos",
    title: "ویدیوهای آموزشی زبان و آزمون | موسسه علامه سخن",
    description: "ویدیوها و فایل‌های چندرسانه‌ای آموزشی برای زبان انگلیسی، TOEFL، GRE و مهارت‌های آزمون.",
  },
};

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: Number(process.env.DB_POOL_SIZE || 10),
});

function postgresPlaceholders(sql) {
  let index = 0;
  return String(sql).replace(/\?/g, () => `$${index += 1}`);
}

const pool = {
  async query(sql, params = []) {
    const result = await pgPool.query(postgresPlaceholders(sql), params);
    return [result.rows, result];
  },
  async execute(sql, params = []) {
    return this.query(sql, params);
  },
};

async function dbClient() {
  const client = await pgPool.connect();
  return {
    async query(sql, params = []) {
      return client.query(sql, params);
    },
    release() {
      client.release();
    },
  };
}

const privateCollections = new Set([
  "exam_registrations",
  "exam_waitlist",
  "exam_results",
  "course_registrations",
  "placement_registrations",
  "consultation_requests",
  "exam_submissions",
  "registration_assignments",
  "messages",
  "notifications",
  "notification_delivery_queue",
  "testimonials",
  "password_reset_requests",
  "audit_logs",
  "discount_campaigns",
  "discount_codes",
]);
const studentCreateCollections = new Set([
  "exam_registrations",
  "exam_waitlist",
  "course_registrations",
  "placement_registrations",
  "consultation_requests",
  "exam_submissions",
  "messages",
  "testimonials",
  "password_reset_requests",
]);
const publicReadCollections = new Set([
  "toefl_dates",
  "mock_dates",
  "gre_dates",
  "internal_exams",
  "consultation_slots",
  "settings",
  "articles",
  "site_content",
  "popups",
  "resource_categories",
  "learning_resources",
  "gallery_categories",
  "gallery_images",
]);

const collectionPermissions = {
  exam_registrations: "registrations",
  exam_waitlist: "registrations",
  exam_results: "results",
  course_registrations: "registrations",
  placement_registrations: "registrations",
  consultation_requests: "consultations",
  consultation_slots: "consultations",
  exam_submissions: "exams",
  internal_exams: "exams",
  registration_assignments: "assignments",
  messages: "messages",
  notifications: "notifications",
  notification_delivery_queue: "notifications",
  password_reset_requests: "users",
  audit_logs: "reports",
  toefl_dates: "dates",
  mock_dates: "dates",
  gre_dates: "dates",
  settings: "settings",
  articles: "articles",
  site_content: "content",
  popups: "popups",
  resource_categories: "resources",
  learning_resources: "resources",
  gallery_categories: "gallery",
  gallery_images: "gallery",
  discount_campaigns: "coupons",
  discount_codes: "coupons",
  testimonials: "content",
};

async function writeAudit(user, action, collection, documentId, details = {}) {
  if (!user || !["admin", "staff"].includes(String(user.role || "").toLowerCase())) return;
  const auditId = id("audit");
  await saveDocument("audit_logs", auditId, {
    actorId: user.uid,
    actorName: cleanText(user.name || user.email, 120),
    actorRole: user.role,
    action: cleanText(action, 80),
    collection: cleanText(collection, 80),
    documentId: cleanText(documentId, 120),
    details,
    createdAt: new Date().toISOString(),
  });
}

function id(prefix = "id") {
  const safe = String(prefix).replace(/[^a-zA-Z0-9_-]/g, "") || "id";
  return `${safe}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
}

function makePassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto.pbkdf2Sync(String(password), salt, 150000, 32, "sha256").toString("hex");
  return { salt, passwordHash };
}

function verifyPassword(user, password) {
  if (!user || !user.salt || !user.password_hash) return false;
  const actual = Buffer.from(user.password_hash, "hex");
  const expected = crypto.pbkdf2Sync(String(password), user.salt, 150000, 32, "sha256");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function parseJson(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function publicUser(row) {
  if (!row) return null;
  return {
    ...parseJson(row.data),
    uid: row.uid,
    email: row.email,
    role: row.role,
  };
}

async function initializeDatabase() {
  if (!adminPassword || adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD must be set to a strong password");
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_users (
      uid VARCHAR(80) PRIMARY KEY,
      email VARCHAR(190) NOT NULL UNIQUE,
      salt VARCHAR(64) NOT NULL,
      password_hash VARCHAR(128) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'student',
      data JSONB NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_documents (
      collection_name VARCHAR(80) NOT NULL,
      document_id VARCHAR(100) NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (collection_name, document_id)
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_collection_created
    ON app_documents (collection_name, created_at)
  `);

  const [rows] = await pool.execute("SELECT uid, data FROM app_users WHERE email = ? LIMIT 1", [adminEmail]);
  if (!rows.length) {
    const uid = id("admin");
    const secret = makePassword(adminPassword);
    const profile = {
      uid,
      name: adminName,
      email: adminEmail,
      role: "admin",
      createdAt: new Date().toISOString(),
      grades: {},
    };
    await pool.execute(
      "INSERT INTO app_users (uid, email, salt, password_hash, role, data) VALUES (?, ?, ?, ?, 'admin', ?)",
      [uid, adminEmail, secret.salt, secret.passwordHash, JSON.stringify(profile)]
    );
  } else {
    const profile = parseJson(rows[0].data);
    profile.name = adminName;
    profile.role = "admin";
    await pool.execute(
      "UPDATE app_users SET role = 'admin', data = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?",
      [JSON.stringify(profile), adminEmail]
    );
  }
  if (rows.length && process.env.RESET_ADMIN_PASSWORD === "true") {
    const secret = makePassword(adminPassword);
    await pool.execute(
      "UPDATE app_users SET salt = ?, password_hash = ? WHERE email = ?",
      [secret.salt, secret.passwordHash, adminEmail]
    );
    console.log(`Admin password reset for ${adminEmail}. Set RESET_ADMIN_PASSWORD=false and restart.`);
  }
}

function body(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 24 * 1024 * 1024) {
        reject(Object.assign(new Error("حجم اطلاعات بیش از حد مجاز است"), { status: 413 }));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(Object.assign(new Error("فرمت اطلاعات معتبر نیست"), { status: 400 }));
      }
    });
    req.on("error", reject);
  });
}

function send(res, status, data, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...securityHeaders(),
    ...headers,
  });
  res.end(JSON.stringify(data));
}

function fail(res, status, message) {
  send(res, status, { message });
}

function cookie(req, name) {
  const source = req.headers.cookie || "";
  const found = source.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : "";
}

function currentSession(req) {
  const sid = cookie(req, "as_session");
  const session = sid ? sessions.get(sid) : null;
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(sid);
    return null;
  }
  return session;
}

function ensureCsrfToken(session) {
  if (!session) return "";
  if (!session.csrfToken) session.csrfToken = crypto.randomBytes(32).toString("hex");
  return session.csrfToken;
}

function currentUser(req) {
  const session = currentSession(req);
  return session ? session.user : null;
}

function requestIsSecure(req) {
  const mode = String(process.env.COOKIE_SECURE || "auto").toLowerCase();
  if (mode === "true") return true;
  if (mode === "false") return false;
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  return forwardedProto === "https" || Boolean(req.socket && req.socket.encrypted);
}

function sessionCookie(req, sid) {
  const secure = requestIsSecure(req) ? "; Secure" : "";
  return `as_session=${sid}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${secure}`;
}

function securityHeaders() {
  const widgetSources = [...chatWidgetOrigins].join(" ");
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "0",
    "X-DNS-Prefetch-Control": "off",
    "X-Download-Options": "noopen",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), geolocation=(), microphone=(self), payment=(), usb=(), interest-cohort=()",
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Origin-Agent-Cluster": "?1",
    "X-Permitted-Cross-Domain-Policies": "none",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      `script-src 'self' 'unsafe-inline'${widgetSources ? ` ${widgetSources}` : ""}`,
      `script-src-elem 'self' 'unsafe-inline'${widgetSources ? ` ${widgetSources}` : ""}`,
      "script-src-attr 'unsafe-inline'",
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com${widgetSources ? ` ${widgetSources}` : ""}`,
      `font-src 'self' data: https://fonts.gstatic.com${widgetSources ? ` ${widgetSources}` : ""}`,
      "img-src 'self' data: blob: https:",
      "media-src 'self' data: blob: https:",
      `connect-src 'self'${widgetSources ? ` ${widgetSources} ${widgetSources.replaceAll("https://", "wss://")}` : ""}`,
      `frame-src 'self'${widgetSources ? ` ${widgetSources}` : ""}`,
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  };
}

function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "")
    .split(",")[0]
    .trim();
}

function loginRateLimited(req) {
  const key = clientIp(req);
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record || record.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW });
    return false;
  }
  record.count += 1;
  return record.count > LOGIN_LIMIT;
}

function clearLoginAttempts(req) {
  loginAttempts.delete(clientIp(req));
}

function apiRateLimited(req) {
  if (req.url === "/api/health") return false;
  const key = `${clientIp(req)}:${String(req.url || "").split("?")[0]}`;
  const now = Date.now();
  const record = apiAttempts.get(key);
  if (!record || record.resetAt <= now) {
    apiAttempts.set(key, { count: 1, resetAt: now + API_WINDOW });
    return false;
  }
  record.count += 1;
  return record.count > API_LIMIT;
}

function validateRequestOrigin(req) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return;
  if (String(req.headers["sec-fetch-site"] || "").toLowerCase() === "cross-site") {
    throw Object.assign(new Error("درخواست بین‌سایتی مجاز نیست"), { status: 403 });
  }
  const origin = req.headers.origin;
  if (!origin) return;
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    throw Object.assign(new Error("مبدأ درخواست معتبر نیست"), { status: 403 });
  }
  const requestHost = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  if (!requestHost || originHost !== requestHost) {
    throw Object.assign(new Error("مبدأ درخواست مجاز نیست"), { status: 403 });
  }
}

function cleanText(value, maxLength = 500) {
  return String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, maxLength);
}

function parseChatWidgetCode(value) {
  const code = String(value || "").trim();
  if (!code) return { code: "", origins: [] };
  if (code.length > 30000) {
    throw Object.assign(new Error("کد چت آنلاین بیش از حد مجاز طولانی است"), { status: 413 });
  }
  const scripts = [...code.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  if (!scripts.length) {
    throw Object.assign(new Error("کد باید شامل تگ script باشد"), { status: 400 });
  }
  const remaining = code
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();
  if (remaining) {
    throw Object.assign(new Error("فقط کدهای script سرویس چت قابل ثبت هستند"), { status: 400 });
  }
  const origins = new Set();
  function addOrigin(urlValue) {
    let parsed;
    try {
      parsed = new URL(urlValue);
    } catch {
      return;
    }
    if (parsed.protocol !== "https:") return;
    origins.add(parsed.origin);
    const labels = parsed.hostname.split(".");
    if (labels.length > 2) origins.add(`https://*.${labels.slice(-2).join(".")}`);
  }
  scripts.forEach((match) => {
    const srcMatch = match[1].match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    if (srcMatch) {
      let parsed;
      try {
        parsed = new URL(srcMatch[1]);
      } catch {
        throw Object.assign(new Error("آدرس اسکریپت چت معتبر نیست"), { status: 400 });
      }
      if (parsed.protocol !== "https:") {
        throw Object.assign(new Error("اسکریپت چت باید از آدرس امن HTTPS بارگذاری شود"), { status: 400 });
      }
      addOrigin(srcMatch[1]);
    }
    for (const urlMatch of match[2].matchAll(/https:\/\/[a-z0-9.-]+(?::\d+)?(?:\/[^\s"'`<>]*)?/gi)) {
      addOrigin(urlMatch[0]);
    }
  });
  return { code, origins: [...origins] };
}

function applyChatWidgetOrigins(origins) {
  chatWidgetOrigins = new Set(
    (Array.isArray(origins) ? origins : []).filter((origin) => /^https:\/\/(?:\*\.)?[a-z0-9.-]+(?::\d+)?$/i.test(origin))
  );
}

async function loadChatWidgetConfiguration() {
  const config = await getDocument("settings", "chat_widget");
  applyChatWidgetOrigins(config && config.active ? config.origins : []);
}

function normalizePopup(input, existing = {}) {
  const allowedPages = new Set([
    "all", "home", "newsletter", "toefl", "gre", "mock-toefl", "mock-gre",
    "toefl-dates", "gre-dates", "mock-dates", "general", "specialized",
    "communication", "course-registration", "exam-registration", "consultation",
    "about", "contact",
  ]);
  const data = { ...existing, ...input };
  const title = cleanText(data.title, 120);
  const popupBody = cleanText(data.body, 1200);
  if (!title || !popupBody) {
    throw Object.assign(new Error("عنوان و متن پاپ‌آپ الزامی است"), { status: 400 });
  }
  const link = cleanText(data.link, 500);
  if (link && !/^https?:\/\/[^\s]+$/i.test(link) && !/^#[a-z0-9-]+$/i.test(link)) {
    throw Object.assign(new Error("لینک پاپ‌آپ معتبر نیست"), { status: 400 });
  }
  const image = String(data.image || "");
  if (image && !/^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=\s]+$/i.test(image)) {
    throw Object.assign(new Error("فرمت تصویر پاپ‌آپ معتبر نیست"), { status: 400 });
  }
  if (image.length > 7 * 1024 * 1024) {
    throw Object.assign(new Error("حجم تصویر پاپ‌آپ بیش از حد مجاز است"), { status: 413 });
  }
  const startsAt = data.startsAt && !Number.isNaN(new Date(data.startsAt).getTime()) ? new Date(data.startsAt).toISOString() : "";
  const endsAt = data.endsAt && !Number.isNaN(new Date(data.endsAt).getTime()) ? new Date(data.endsAt).toISOString() : "";
  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
    throw Object.assign(new Error("زمان پایان باید بعد از زمان شروع باشد"), { status: 400 });
  }
  return {
    title,
    body: popupBody,
    targetPage: allowedPages.has(data.targetPage) ? data.targetPage : "home",
    frequency: data.frequency === "visit" ? "visit" : "session",
    startsAt,
    endsAt,
    image,
    buttonText: cleanText(data.buttonText, 50),
    link,
    active: data.active === true,
    createdAt: cleanText(data.createdAt, 40) || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function currentExamDateKey() {
  const values = {};
  new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date()).forEach((part) => {
    if (part.type !== "literal") values[part.type] = part.value;
  });
  return `${values.year}-${values.month}-${values.day}`;
}

function requireUser(req) {
  const user = currentUser(req);
  if (!user) throw Object.assign(new Error("ابتدا وارد حساب کاربری شوید"), { status: 401 });
  return user;
}

function requireAdmin(req) {
  const user = requireUser(req);
  if (String(user.role).toLowerCase() !== "admin") {
    throw Object.assign(new Error("این بخش فقط برای مدیر قابل دسترسی است"), { status: 403 });
  }
  return user;
}

function isSiteManager(user) {
  return user && String(user.role).toLowerCase() === "admin";
}

function hasPermission(user, permission) {
  if (isSiteManager(user)) return true;
  if (!user || String(user.role).toLowerCase() !== "staff") return false;
  return Array.isArray(user.permissions) && user.permissions.includes(permission);
}

function requirePermission(req, permission) {
  const user = requireUser(req);
  if (!hasPermission(user, permission)) {
    throw Object.assign(new Error("برای این بخش دسترسی ندارید"), { status: 403 });
  }
  return user;
}

function canManageCollection(user, collection) {
  if (collection === "exam_registrations" && hasPermission(user, "attendance")) return true;
  return isSiteManager(user) || hasPermission(user, collectionPermissions[collection]);
}

function applyDottedUpdate(target, update) {
  Object.keys(update || {}).forEach((key) => {
    const parts = key.split(".");
    let ref = target;
    for (let index = 0; index < parts.length - 1; index += 1) {
      if (!ref[parts[index]] || typeof ref[parts[index]] !== "object") ref[parts[index]] = {};
      ref = ref[parts[index]];
    }
    ref[parts[parts.length - 1]] = update[key];
  });
}

async function getDocument(collection, documentId) {
  if (collection === "users") {
    const [rows] = await pool.execute(
      "SELECT uid, email, role, data FROM app_users WHERE uid = ? LIMIT 1",
      [documentId]
    );
    return publicUser(rows[0]);
  }
  const [rows] = await pool.execute(
    "SELECT data FROM app_documents WHERE collection_name = ? AND document_id = ? LIMIT 1",
    [collection, documentId]
  );
  return rows.length ? parseJson(rows[0].data) : null;
}

async function saveDocument(collection, documentId, data) {
  await pool.execute(
    `INSERT INTO app_documents (collection_name, document_id, data)
     VALUES (?, ?, ?)
     ON CONFLICT (collection_name, document_id)
     DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP`,
    [collection, documentId, JSON.stringify(data)]
  );
}

function serviceStatusLabel(status) {
  const map = {
    requested: "ثبت درخواست",
    pending: "ثبت درخواست",
    preparing: "در حال آماده‌سازی",
    processing: "در حال آماده‌سازی",
    confirmed: "تأیید شد",
    completed: "انجام شد",
    sent: "ارسال شد",
    cancelled: "لغو شد",
  };
  return map[String(status || "").toLowerCase()] || cleanText(status || "ثبت درخواست", 80);
}

function serviceRequestTitle(collection, data) {
  if (collection === "exam_registrations") return data.examName || data.title || (data.type === "gre" ? "ثبت‌نام GRE" : "ثبت‌نام TOEFL");
  if (collection === "course_registrations") return data.category === "voucher" ? `${String(data.voucherType || "").toUpperCase()} Voucher` : data.courseName || "ثبت‌نام دوره";
  if (collection === "placement_registrations") return data.testName || "آزمون تعیین سطح";
  if (collection === "consultation_requests") return data.topic || data.title || "درخواست مشاوره";
  return data.title || data.examName || data.courseName || "درخواست خدمات";
}

function publicSettingsData(documentId, item) {
  if (!item) return item;
  const safe = { ...item };
  if (documentId === "signup") {
    delete safe.emailWebhookUrl;
    delete safe.smsWebhookUrl;
    delete safe.emailWebhookToken;
    delete safe.smsWebhookToken;
    delete safe.smsApiKey;
  }
  if (documentId === "payment") {
    if (safe.apiKey) safe.apiKeyConfigured = true;
    delete safe.apiKey;
  }
  return safe;
}

function deliveryChannels(settings) {
  const mode = String(settings.notificationChannel || "").toLowerCase();
  const email = mode === "email" || mode === "both" || (!mode && settings.emailEnabled);
  const sms = mode === "sms" || mode === "both" || (!mode && settings.smsEnabled);
  const smsWebhookUrl = cleanText(process.env.SMS_WEBHOOK_URL || settings.smsWebhookUrl || "", 600);
  return {
    email: email && settings.emailEnabled !== false,
    sms: sms && settings.smsEnabled === true && !!smsWebhookUrl,
  };
}

async function postDeliveryWebhook(url, payload, token) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Webhook failed: ${response.status}`);
}

async function queueExternalDelivery(type, recipient, payload, settings) {
  if (!recipient) return;
  const queueId = id("delivery");
  const webhookUrl = type === "email"
    ? cleanText(process.env.EMAIL_WEBHOOK_URL || settings.emailWebhookUrl || "", 600)
    : cleanText(process.env.SMS_WEBHOOK_URL || settings.smsWebhookUrl || "", 600);
  const token = type === "email"
    ? cleanText(process.env.EMAIL_WEBHOOK_TOKEN || settings.emailWebhookToken || "", 600)
    : cleanText(process.env.SMS_WEBHOOK_TOKEN || settings.smsWebhookToken || settings.smsApiKey || "", 600);
  if (type === "sms" && (settings.smsEnabled !== true || !webhookUrl)) return;
  const item = {
    type,
    recipient: cleanText(recipient, 190),
    subject: cleanText(payload.subject, 180),
    text: cleanText(payload.text, 2000),
    status: webhookUrl ? "queued" : "pending-configuration",
    provider: type === "sms" ? cleanText(settings.smsProvider, 120) : "email-webhook",
    createdAt: new Date().toISOString(),
  };
  await saveDocument("notification_delivery_queue", queueId, item);
  if (!webhookUrl) return;
  try {
    await postDeliveryWebhook(webhookUrl, {
      type,
      to: recipient,
      subject: payload.subject,
      text: payload.text,
      from: type === "email" ? settings.emailFrom : settings.smsSender,
      payload,
    }, token);
    item.status = "sent";
    item.sentAt = new Date().toISOString();
  } catch (error) {
    item.status = "failed";
    item.error = cleanText(error.message, 300);
  }
  await saveDocument("notification_delivery_queue", queueId, item);
}

function renderTemplate(settings, key, fallback, values = {}) {
  const templates = settings && typeof settings.notificationTemplates === "object" ? settings.notificationTemplates : {};
  const source = cleanText(templates[key] || fallback || "", 2000);
  return source.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, name) => {
    const value = values[name];
    return value === undefined || value === null ? "" : String(value);
  });
}

function adminSmsRecipients(settings) {
  return String(settings.smsAdminNumbers || "")
    .split(/\r?\n|,/)
    .map((item) => cleanText(item, 30).replace(/[^\d+]/g, ""))
    .filter(Boolean);
}

async function sendAutomaticSms(key, values, recipients, subject) {
  const settings = await getDocument("settings", "signup") || {};
  const channels = deliveryChannels(settings);
  if (!channels.sms) return;
  const text = renderTemplate(settings, key, values.defaultText || "", values);
  const list = Array.isArray(recipients) ? recipients : [recipients];
  await Promise.all(list.filter(Boolean).map((recipient) => queueExternalDelivery("sms", recipient, {
    subject: subject || "Allameh Sokhan Notification",
    text,
    key,
    values,
  }, settings)));
}

async function notifyProfileCreatedOrUpdated(profile, kind) {
  const settings = await getDocument("settings", "signup") || {};
  const admins = adminSmsRecipients(settings);
  const values = {
    name: profile.name || profile.email || "",
    email: profile.email || "",
    mobile: profile.mobile || "",
    defaultText: kind === "created" ? "New profile: {name} - {mobile} - {email}" : "Profile updated: {name} - {mobile}",
  };
  await sendAutomaticSms(kind === "created" ? "adminProfileCreated" : "adminProfileUpdated", values, admins, "Admin notification");
  if (profile.mobile) {
    await sendAutomaticSms(kind === "created" ? "studentProfileCreated" : "studentProfileUpdated", {
      ...values,
      defaultText: kind === "created" ? "Your Allameh Sokhan profile was created successfully." : "Your Allameh Sokhan profile was updated successfully.",
    }, profile.mobile, "Student notification");
  }
}

async function notifyMessageCreated(message) {
  if (!message || !message.text) return;
  const settings = await getDocument("settings", "signup") || {};
  if (message.senderRole === "student" && message.receiverId === "admin") {
    await sendAutomaticSms("adminStudentMessage", {
      name: message.senderName || "",
      text: message.text,
      defaultText: "New student message from {name}: {text}",
    }, adminSmsRecipients(settings), "New student message");
    return;
  }
  if (message.senderRole === "admin" && message.receiverId) {
    const user = await getDocument("users", message.receiverId);
    if (user && user.mobile) {
      await sendAutomaticSms("studentAdminReply", {
        name: user.name || user.email || "",
        text: message.text,
        defaultText: "You have a new reply from Allameh Sokhan.",
      }, user.mobile, "Admin reply");
    }
  }
}

async function notifyNewRegistration(data, service) {
  const settings = await getDocument("settings", "signup") || {};
  const values = {
    name: data.name || data.userName || "",
    email: data.email || "",
    mobile: data.mobile || "",
    service: service || data.examName || data.courseName || data.title || "",
    defaultText: "New request: {service} - {name} - {mobile}",
  };
  await sendAutomaticSms("adminRegistrationClick", values, adminSmsRecipients(settings), "New registration");
}

async function notifyServiceStatusChange(collection, documentId, data, actor, previous = {}) {
  const serviceCollections = new Set(["exam_registrations", "course_registrations", "placement_registrations", "consultation_requests"]);
  if (!serviceCollections.has(collection) || !data || !data.userId) return;
  const status = data.voucherStatus || data.status || "pending";
  const oldStatus = previous.voucherStatus || previous.status || "";
  if (oldStatus && oldStatus === status) return;
  const settings = await getDocument("settings", "signup") || {};
  const title = serviceRequestTitle(collection, data);
  const statusText = serviceStatusLabel(status);
  const body = `وضعیت درخواست «${title}» به «${statusText}» تغییر کرد.`;
  const notificationId = id("notification");
  await saveDocument("notifications", notificationId, {
    audience: "user",
    userId: cleanText(data.userId, 100),
    userName: cleanText(data.name || data.userName || data.email, 120),
    title: `به‌روزرسانی وضعیت ${title}`,
    body,
    kind: "service-status",
    collection,
    registrationId: cleanText(documentId, 120),
    status: cleanText(status, 80),
    createdAt: new Date().toISOString(),
    createdBy: actor ? actor.uid : "system",
  });
  const channels = deliveryChannels(settings);
  const payload = { subject: `به‌روزرسانی درخواست شما در موسسه علامه سخن`, text: body, collection, documentId, status, title };
  if (channels.email) await queueExternalDelivery("email", data.email, payload, settings);
  if (channels.sms) await queueExternalDelivery("sms", data.mobile, payload, settings);
}

async function createExamRegistration(actor, input) {
  const type = String(input.type || "").toLowerCase();
  const isMock = type === "mock";
  if (!["toefl", "gre", "mock"].includes(type)) {
    throw Object.assign(new Error("نوع آزمون معتبر نیست"), { status: 400 });
  }
  const mockType = isMock && input.mockType === "gre" ? "gre" : isMock ? "toefl" : "";
  const dateCollection = isMock ? "mock_dates" : `${type}_dates`;
  const dateId = cleanText(input.dateId, 100);
  if (!dateId) throw Object.assign(new Error("تاریخ آزمون انتخاب نشده است"), { status: 400 });

  const name = cleanText(input.name, 120);
  const email = cleanText(input.email, 190).toLowerCase();
  const mobile = cleanText(input.mobile, 20).replace(/\D/g, "");
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^09\d{9}$/.test(mobile)) {
    throw Object.assign(new Error("نام، ایمیل و شماره موبایل معتبر الزامی است"), { status: 400 });
  }

  const client = await dbClient();
  try {
    await client.query("BEGIN");
    const dateResult = await client.query(
      "SELECT data FROM app_documents WHERE collection_name = $1 AND document_id = $2 FOR UPDATE",
      [dateCollection, dateId]
    );
    if (!dateResult.rows.length) throw Object.assign(new Error("تاریخ انتخاب‌شده معتبر نیست"), { status: 404 });
    const dateInfo = parseJson(dateResult.rows[0].data);
    const today = currentExamDateKey();
    if (!dateInfo.date || dateInfo.date < today) throw Object.assign(new Error("این تاریخ دیگر فعال نیست"), { status: 409 });

    if (isMock) {
      const dateIsGre = /GRE/i.test(String(dateInfo.type || ""));
      if ((mockType === "gre") !== dateIsGre) throw Object.assign(new Error("نوع تاریخ آزمون با فرم ثبت‌نام هماهنگ نیست"), { status: 400 });
      const capacity = Math.max(1, Number(dateInfo.capacity || 1));
      const registered = Math.max(0, Number(dateInfo.registered || 0));
      const manualRegistered = Math.max(0, Number(dateInfo.manualRegistered || 0));
      if (registered + manualRegistered >= capacity) throw Object.assign(new Error("ظرفیت این آزمون تکمیل شده است"), { status: 409 });
    }

    const duplicate = await client.query(
      `SELECT document_id FROM app_documents
       WHERE collection_name = 'exam_registrations'
         AND data->>'userId' = $1 AND data->>'dateId' = $2
         AND COALESCE(data->>'status', '') <> 'cancelled'
       LIMIT 1`,
      [actor.uid, dateId]
    );
    if (duplicate.rows.length) throw Object.assign(new Error("شما قبلاً برای این تاریخ ثبت‌نام کرده‌اید"), { status: 409 });

    const registrationId = id("exam_registrations");
    const examName = isMock
      ? (mockType === "gre" ? "Mock GRE General" : "Mock TOEFL iBT")
      : (type === "gre" ? "GRE General" : "TOEFL iBT");
    const inputCoupon = input.discountCoupon && typeof input.discountCoupon === "object"
      ? input.discountCoupon
      : null;
    const discountCoupon = inputCoupon ? {
      code: cleanText(inputCoupon.code, 40).toUpperCase(),
      campaignId: cleanText(inputCoupon.campaignId, 100),
      title: cleanText(inputCoupon.title, 120),
      target: cleanText(inputCoupon.target, 40),
      discountType: inputCoupon.discountType === "amount" ? "amount" : "percent",
      value: Math.max(0, Number(inputCoupon.value || 0)),
    } : null;
    const registration = {
      userId: actor.uid,
      type,
      mockType,
      category: isMock ? `mock-${mockType}` : "exam",
      dateId,
      examName,
      examDate: cleanText(dateInfo.date, 20),
      examTime: cleanText(dateInfo.time || "09:00", 10),
      name,
      email,
      mobile,
      currentScore: cleanText(input.currentScore, 120),
      note: cleanText(input.note, 2000),
      assignmentId: cleanText(input.assignmentId, 100),
      discountCoupon,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    await client.query(
      "INSERT INTO app_documents (collection_name, document_id, data) VALUES ('exam_registrations', $1, $2)",
      [registrationId, JSON.stringify(registration)]
    );

    if (isMock) {
      dateInfo.registered = Math.max(0, Number(dateInfo.registered || 0)) + 1;
      await client.query(
        "UPDATE app_documents SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE collection_name = $2 AND document_id = $3",
        [JSON.stringify(dateInfo), dateCollection, dateId]
      );
    }
    await client.query("COMMIT");
    await notifyNewRegistration(registration, examName);
    return { id: registrationId, registration };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function csrfExempt(req, url) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return true;
  return ["/api/auth/login", "/api/auth/register", "/api/auth/request-password-reset"].includes(url.pathname);
}

function validateCsrf(req, url) {
  if (csrfExempt(req, url)) return;
  const session = currentSession(req);
  if (!session) {
    throw Object.assign(new Error("ابتدا وارد حساب کاربری شوید"), { status: 401 });
  }
  const expected = ensureCsrfToken(session);
  const received = String(req.headers["x-csrf-token"] || "");
  if (!received || received !== expected) {
    throw Object.assign(new Error("امنیت درخواست تایید نشد؛ صفحه را رفرش کنید"), { status: 403 });
  }
}

function ownsDocument(collection, item, user) {
  if (!item || !user) return false;
  if (collection === "messages") {
    return item.senderId === user.uid || item.receiverId === user.uid;
  }
  if (collection === "notifications") {
    return item.userId === user.uid || item.audience === "all";
  }
  return item.userId === user.uid;
}

async function handleAuth(req, res, pathname) {
  if (pathname === "/api/auth/login" && req.method === "POST") {
    if (loginRateLimited(req)) return fail(res, 429, "تعداد تلاش‌های ورود زیاد است؛ ۱۵ دقیقه دیگر دوباره تلاش کنید");
    const data = await body(req);
    const email = String(data.email || "").trim().toLowerCase();
    const [rows] = await pool.execute(
      "SELECT uid, email, salt, password_hash, role, data FROM app_users WHERE email = ? LIMIT 1",
      [email]
    );
    const row = rows[0];
    if (!row || !verifyPassword(row, data.password || "")) return fail(res, 401, "ایمیل یا رمز عبور اشتباه است");
    const user = publicUser(row);
    if (user.active === false) return fail(res, 403, "این حساب توسط مدیر سایت غیرفعال شده است");
    const sid = crypto.randomBytes(32).toString("hex");
    const session = { user, expiresAt: Date.now() + SESSION_MAX_AGE };
    ensureCsrfToken(session);
    sessions.set(sid, session);
    clearLoginAttempts(req);
    return send(res, 200, { user, csrfToken: session.csrfToken }, {
      "Set-Cookie": sessionCookie(req, sid),
    });
  }

  if (pathname === "/api/auth/register" && req.method === "POST") {
    const data = await body(req);
    const email = String(data.email || "").trim().toLowerCase();
    const password = String(data.password || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(res, 400, "ایمیل معتبر وارد کنید");
    if (password.length < 8) return fail(res, 400, "رمز عبور باید حداقل ۸ کاراکتر باشد");
    const [existing] = await pool.execute("SELECT uid FROM app_users WHERE email = ? LIMIT 1", [email]);
    if (existing.length) return fail(res, 409, "این ایمیل قبلاً ثبت شده است");

    const uid = id("user");
    const secret = makePassword(password);
    const user = {
      uid,
      name: email.split("@")[0],
      email,
      role: "student",
      createdAt: new Date().toISOString(),
      grades: {},
    };
    await pool.execute(
      "INSERT INTO app_users (uid, email, salt, password_hash, role, data) VALUES (?, ?, ?, ?, 'student', ?)",
      [uid, email, secret.salt, secret.passwordHash, JSON.stringify(user)]
    );
    const sid = crypto.randomBytes(32).toString("hex");
    const session = { user, expiresAt: Date.now() + SESSION_MAX_AGE };
    ensureCsrfToken(session);
    sessions.set(sid, session);
    return send(res, 200, { user, csrfToken: session.csrfToken }, {
      "Set-Cookie": sessionCookie(req, sid),
    });
  }

  if (pathname === "/api/auth/request-password-reset" && req.method === "POST") {
    if (loginRateLimited(req)) return fail(res, 429, "تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید");
    const data = await body(req);
    const email = String(data.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(res, 400, "ایمیل معتبر وارد کنید");
    const [rows] = await pool.execute("SELECT uid, data FROM app_users WHERE email = ? LIMIT 1", [email]);
    if (rows.length) {
      const profile = parseJson(rows[0].data);
      const resetId = id("password_reset");
      await saveDocument("password_reset_requests", resetId, {
        userId: rows[0].uid,
        email,
        name: cleanText(profile.name, 120),
        status: "open",
        createdAt: new Date().toISOString(),
      });
    }
    return send(res, 200, { ok: true, message: "اگر حسابی با این ایمیل وجود داشته باشد، درخواست برای مدیر ثبت می‌شود" });
  }

  if (pathname === "/api/auth/me" && req.method === "GET") {
    const session = currentSession(req);
    return send(res, 200, { user: session ? session.user : null, csrfToken: session ? ensureCsrfToken(session) : "" });
  }

  if (pathname === "/api/auth/csrf" && req.method === "GET") {
    const session = currentSession(req);
    if (!session) return fail(res, 401, "ابتدا وارد حساب کاربری شوید");
    return send(res, 200, { csrfToken: ensureCsrfToken(session) });
  }

  if (pathname === "/api/auth/logout" && req.method === "POST") {
    const sid = cookie(req, "as_session");
    if (sid) sessions.delete(sid);
    return send(res, 200, { ok: true }, {
      "Set-Cookie": "as_session=; Max-Age=0; HttpOnly; SameSite=Strict; Path=/",
    });
  }

  if (pathname === "/api/auth/change-password" && req.method === "POST") {
    const session = requireUser(req);
    const data = await body(req);
    const [rows] = await pool.execute(
      "SELECT salt, password_hash FROM app_users WHERE uid = ? LIMIT 1",
      [session.uid]
    );
    if (!rows[0] || !verifyPassword(rows[0], data.currentPassword || "")) {
      return fail(res, 401, "رمز عبور فعلی اشتباه است");
    }
    if (String(data.newPassword || "").length < 8) return fail(res, 400, "رمز جدید باید حداقل ۸ کاراکتر باشد");
    const secret = makePassword(data.newPassword);
    await pool.execute(
      "UPDATE app_users SET salt = ?, password_hash = ? WHERE uid = ?",
      [secret.salt, secret.passwordHash, session.uid]
    );
    return send(res, 200, { ok: true });
  }

  return false;
}

async function handleCollections(req, res, url) {
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] !== "api" || parts[1] !== "collections") return false;
  const collection = decodeURIComponent(parts[2] || "");
  const documentId = decodeURIComponent(parts[3] || "");
  if (!/^[a-z][a-z0-9_]{1,79}$/.test(collection)) return fail(res, 404, "مسیر نامعتبر است");

  const user = currentUser(req);
  const isAdmin = isSiteManager(user);
  const canManage = canManageCollection(user, collection);

  if (collection === "users") {
    if (!documentId && req.method === "GET") {
      const listActor = requireUser(req);
      if (!["users", "results", "notifications", "attendance", "reports"].some((permission) => hasPermission(listActor, permission))) {
        return fail(res, 403, "دسترسی مجاز نیست");
      }
      const [rows] = await pool.query("SELECT uid, email, role, data FROM app_users ORDER BY created_at DESC");
      return send(res, 200, { items: Object.fromEntries(rows.map((row) => [row.uid, publicUser(row)])) });
    }
    if (!documentId) return fail(res, 400, "شناسه کاربر لازم است");
    const canReadUser = user && (user.uid === documentId || ["users", "results", "notifications", "attendance", "reports"].some((permission) => hasPermission(user, permission)));
    if (!canReadUser) return fail(res, 403, "دسترسی مجاز نیست");

    if (req.method === "GET") {
      const item = await getDocument("users", documentId);
      return send(res, 200, { exists: !!item, item });
    }
    if (req.method === "PUT" || req.method === "PATCH") {
      let changes = await body(req);
      delete changes.uid;
      delete changes.email;
      delete changes.role;
      if (hasPermission(user, "results") && !hasPermission(user, "users") && user.uid !== documentId) {
        changes = Object.fromEntries(Object.entries(changes).filter(([key]) => key === "grades" || key.startsWith("grades.")));
      } else if (user.uid === documentId && !hasPermission(user, "users")) {
        const allowedProfileKeys = [
          "name", "mobile", "mobileVerified",
          "lastPage", "lastPageTitle", "lastActiveAt",
        ];
        changes = Object.fromEntries(Object.entries(changes).filter(([key]) => {
          return allowedProfileKeys.includes(key) || key.startsWith("examRegistrations.");
        }));
      }
      const [rows] = await pool.execute("SELECT data FROM app_users WHERE uid = ? LIMIT 1", [documentId]);
      if (!rows.length) return fail(res, 404, "کاربر پیدا نشد");
      const profile = parseJson(rows[0].data);
      const previousProfile = JSON.parse(JSON.stringify(profile));
      if (req.method === "PUT") Object.assign(profile, changes);
      else applyDottedUpdate(profile, changes);
      await pool.execute(
        "UPDATE app_users SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE uid = ?",
        [JSON.stringify(profile), documentId]
      );
      const profileFieldsChanged = Object.keys(changes).some((key) => ["name", "mobile", "mobileVerified"].includes(key));
      if (profileFieldsChanged || req.method === "PUT") {
        await notifyProfileCreatedOrUpdated(profile, previousProfile.mobile ? "updated" : "created");
      }
      if (isSiteManager(user) || String(user.role || "").toLowerCase() === "staff") {
        await writeAudit(user, "update-user", "users", documentId, { fields: Object.keys(changes).slice(0, 20) });
      }
      return send(res, 200, { ok: true });
    }
    return fail(res, 405, "عملیات مجاز نیست");
  }

  if (!documentId && req.method === "GET") {
    if (!publicReadCollections.has(collection)) requireUser(req);
    const [rows] = await pool.execute(
      "SELECT document_id, data FROM app_documents WHERE collection_name = ? ORDER BY created_at DESC",
      [collection]
    );
    let items = rows.map((row) => [row.document_id, parseJson(row.data)]);
    if (collection === "settings") {
      items = items.map(([key, item]) => [key, publicSettingsData(key, item)]);
    }
    if (collection === "popups" && !canManage) {
      const now = Date.now();
      items = items.filter(([, item]) => {
        const startsAt = item.startsAt ? new Date(item.startsAt).getTime() : 0;
        const endsAt = item.endsAt ? new Date(item.endsAt).getTime() : 0;
        return item.active === true
          && (!startsAt || startsAt <= now)
          && (!endsAt || endsAt >= now);
      });
    }
    const reportReadable = hasPermission(user, "reports") && ["exam_registrations", "exam_waitlist", "course_registrations", "placement_registrations", "audit_logs"].includes(collection);
    if (!canManage && !reportReadable && privateCollections.has(collection)) {
      items = items.filter(([, item]) => ownsDocument(collection, item, user));
    }
    if (!canManage && ["toefl_dates", "mock_dates", "gre_dates"].includes(collection)) {
      const today = currentExamDateKey();
      items = items.filter(([, item]) => item.date && item.date >= today);
    }
    const orderBy = url.searchParams.get("orderBy");
    if (orderBy) items.sort((a, b) => String(a[1][orderBy] || "").localeCompare(String(b[1][orderBy] || "")));
    return send(res, 200, { items: Object.fromEntries(items) });
  }

  if (!documentId && req.method === "POST") {
    const actor = requireUser(req);
    if (!canManage && !studentCreateCollections.has(collection)) return fail(res, 403, "این عملیات فقط برای مدیر مجاز است");
    let data = await body(req);
    if (collection === "popups") data = normalizePopup(data);
    if (collection === "exam_registrations" && !canManage) {
      const result = await createExamRegistration(actor, data);
      return send(res, 200, { id: result.id });
    }
    if (!canManage) {
      data.userId = actor.uid;
      if (collection === "testimonials") {
        data.userName = cleanText(actor.name || data.userName, 120);
        data.userEmail = cleanText(actor.email || data.userEmail, 190);
        data.displayName = cleanText(data.displayName || actor.name || "دانشجوی علامه سخن", 120);
        data.title = cleanText(data.title || "تجربه دانشجو", 160);
        data.body = cleanText(data.body || "", 1200);
        data.rating = Math.max(1, Math.min(5, Number(data.rating || 5)));
        data.status = "pending";
        data.targetPage = "home";
      }
      if (collection === "exam_waitlist") {
        data.dateId = cleanText(data.dateId, 100);
        data.examName = cleanText(data.examName, 120);
        data.examDate = cleanText(data.examDate, 20);
        data.examTime = cleanText(data.examTime, 10);
        data.name = cleanText(actor.name || data.name, 120);
        data.email = cleanText(actor.email, 190);
        data.mobile = cleanText(data.mobile || actor.mobile, 20);
        data.status = "waiting";
        data.createdAt = new Date().toISOString();
        const [duplicates] = await pool.execute(
          "SELECT document_id FROM app_documents WHERE collection_name = 'exam_waitlist' AND data->>'userId' = ? AND data->>'dateId' = ? AND COALESCE(data->>'status','waiting') = 'waiting' LIMIT 1",
          [actor.uid, data.dateId]
        );
        if (duplicates.length) return fail(res, 409, "شما قبلاً در فهرست انتظار این آزمون قرار گرفته‌اید");
      }
      if (collection === "password_reset_requests") {
        data.email = cleanText(actor.email, 190);
        data.name = cleanText(actor.name, 120);
        data.status = "open";
        data.createdAt = new Date().toISOString();
      }
      if (collection === "messages") {
        data.senderId = actor.uid;
        data.senderName = cleanText(actor.name || actor.email, 120);
        data.senderRole = "student";
        data.receiverId = "admin";
        data.receiverName = "مدیریت موسسه";
        data.conversationId = `admin_${actor.uid}`;
        data.text = cleanText(data.text, 4000);
        data.createdAt = new Date().toISOString();
        data.read = false;
      }
    }
    const newId = id(collection);
    await saveDocument(collection, newId, data);
    if (collection === "messages") await notifyMessageCreated(data);
    if (["exam_registrations", "course_registrations", "placement_registrations", "consultation_requests"].includes(collection)) {
      await notifyNewRegistration(data, data.examName || data.courseName || data.testName || data.topic || data.title || collection);
    }
    if (canManage) await writeAudit(actor, "create", collection, newId, { title: cleanText(data.title || data.examName || data.name, 120) });
    return send(res, 200, { id: newId });
  }

  if (!documentId) return fail(res, 400, "شناسه لازم است");
  const existing = await getDocument(collection, documentId);

  if (req.method === "GET") {
    if (!publicReadCollections.has(collection)) {
      const actor = requireUser(req);
      if (!canManage && !ownsDocument(collection, existing, actor)) return fail(res, 403, "دسترسی مجاز نیست");
    }
    if (collection === "popups" && !canManage && existing) {
      const now = Date.now();
      const startsAt = existing.startsAt ? new Date(existing.startsAt).getTime() : 0;
      const endsAt = existing.endsAt ? new Date(existing.endsAt).getTime() : 0;
      const visible = existing.active === true
        && (!startsAt || startsAt <= now)
        && (!endsAt || endsAt >= now);
      if (!visible) return send(res, 200, { exists: false, item: null });
    }
    return send(res, 200, { exists: !!existing, item: collection === "settings" ? publicSettingsData(documentId, existing) : existing });
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const actor = requireUser(req);
    let changes = await body(req);
    const previousData = existing ? JSON.parse(JSON.stringify(existing)) : {};
    if (!canManage) {
      if (collection === "consultation_slots" && existing && Object.hasOwn(changes, "booked")) {
        const booked = Number(existing.booked || 0);
        const capacity = Math.max(1, Number(existing.capacity || 1));
        if (booked >= capacity) return fail(res, 409, "ظرفیت این زمان مشاوره تکمیل شده است");
        changes = { booked: booked + 1 };
      } else if (collection === "registration_assignments" && ownsDocument(collection, existing, actor)) {
        const allowed = new Set(["status", "viewedAt", "registeredAt"]);
        changes = Object.fromEntries(Object.entries(changes).filter(([key]) => allowed.has(key)));
      } else if (collection === "messages" && existing && existing.receiverId === actor.uid) {
        changes = {
          read: changes.read === true,
          readAt: changes.read === true ? new Date().toISOString() : existing.readAt || "",
        };
      } else if (
        collection === "messages"
        && existing
        && existing.receiverId === "admin"
        && ["admin", "staff"].includes(String(actor.role || "").toLowerCase())
        && hasPermission(actor, "messages")
      ) {
        changes = {
          read: changes.read === true,
          readAt: changes.read === true ? new Date().toISOString() : existing.readAt || "",
        };
      } else {
        return fail(res, 403, "این عملیات فقط برای مدیر مجاز است");
      }
    }
    const data = existing || {};
    if (req.method === "PUT") Object.assign(data, changes);
    else applyDottedUpdate(data, changes);
    const finalData = collection === "popups" ? normalizePopup(data, existing || {}) : data;
    await saveDocument(collection, documentId, finalData);
    if (canManage && ["exam_registrations", "course_registrations", "placement_registrations", "consultation_requests"].includes(collection)) {
      await notifyServiceStatusChange(collection, documentId, finalData, actor, previousData);
    }
    if (canManage) await writeAudit(actor, "update", collection, documentId, { fields: Object.keys(changes).slice(0, 20) });
    return send(res, 200, { ok: true });
  }

  if (req.method === "DELETE") {
    const actor = requirePermission(req, collectionPermissions[collection] || "settings");
    await pool.execute(
      "DELETE FROM app_documents WHERE collection_name = ? AND document_id = ?",
      [collection, documentId]
    );
    await writeAudit(actor, "delete", collection, documentId);
    return send(res, 200, { ok: true });
  }

  return fail(res, 405, "عملیات مجاز نیست");
}

async function handlePublicTestimonials(req, res, url) {
  if (url.pathname !== "/api/testimonials/public" || req.method !== "GET") return false;
  const page = cleanText(url.searchParams.get("page") || "home", 80);
  const [rows] = await pool.execute(
    "SELECT document_id, data FROM app_documents WHERE collection_name = 'testimonials' ORDER BY created_at DESC"
  );
  const items = rows.map((row) => ({ id: row.document_id, ...parseJson(row.data) }))
    .filter((item) => item.status === "published" && String(item.targetPage || "home") === page)
    .slice(0, 12)
    .map((item) => ({
      id: cleanText(item.id || "", 160),
      displayName: cleanText(item.displayName || item.userName || "دانشجوی علامه سخن", 120),
      avatarUrl: String(item.avatarUrl || "").startsWith("data:image/") || String(item.avatarUrl || "").startsWith("https://") ? String(item.avatarUrl || "").slice(0, 1400000) : "",
      title: cleanText(item.title || "", 160),
      body: cleanText(item.body || "", 900),
      rating: Math.max(1, Math.min(5, Number(item.rating || 5))),
      targetPage: cleanText(item.targetPage || "home", 80),
      publishedAt: cleanText(item.publishedAt || item.createdAt || "", 60),
      replies: Array.isArray(item.replies) ? item.replies.filter((reply) => reply && reply.status === "published").slice(0, 8).map((reply) => ({
        displayName: cleanText(reply.displayName || reply.userName || "دانشجو", 120),
        body: cleanText(reply.body || "", 500),
        createdAt: cleanText(reply.createdAt || "", 60),
      })) : [],
    }));
  return send(res, 200, { items });
}

async function handleAdminUsers(req, res, url) {
  if (!url.pathname.startsWith("/api/admin/users")) return false;
  const manager = requireAdmin(req);
  const parts = url.pathname.split("/").filter(Boolean);
  const uid = decodeURIComponent(parts[3] || "");

  if (!uid && req.method === "POST") {
    const data = await body(req);
    const email = String(data.email || "").trim().toLowerCase();
    const password = String(data.password || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(res, 400, "ایمیل معتبر وارد کنید");
    if (password.length < 8) return fail(res, 400, "رمز عبور باید حداقل ۸ کاراکتر باشد");
    const [existing] = await pool.execute("SELECT uid FROM app_users WHERE email = ? LIMIT 1", [email]);
    if (existing.length) return fail(res, 409, "این ایمیل قبلاً ثبت شده است");
    const newUid = id("staff");
    const secret = makePassword(password);
    const profile = {
      uid: newUid,
      name: String(data.name || "ادمین").trim() || "ادمین",
      email,
      role: "staff",
      permissions: Array.isArray(data.permissions) ? data.permissions : [],
      active: true,
      createdBy: manager.uid,
      createdAt: new Date().toISOString(),
    };
    await pool.execute(
      "INSERT INTO app_users (uid, email, salt, password_hash, role, data) VALUES (?, ?, ?, ?, 'staff', ?)",
      [newUid, email, secret.salt, secret.passwordHash, JSON.stringify(profile)]
    );
    return send(res, 200, { user: profile });
  }

  if (uid && req.method === "PATCH") {
    const data = await body(req);
    const [rows] = await pool.execute("SELECT role, data FROM app_users WHERE uid = ? LIMIT 1", [uid]);
    if (!rows.length || rows[0].role !== "staff") return fail(res, 404, "ادمین مورد نظر پیدا نشد");
    const profile = parseJson(rows[0].data);
    if (typeof data.name === "string") profile.name = data.name.trim() || profile.name;
    if (Array.isArray(data.permissions)) profile.permissions = data.permissions;
    if (typeof data.active === "boolean") profile.active = data.active;
    await pool.execute("UPDATE app_users SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE uid = ?", [JSON.stringify(profile), uid]);
    if (typeof data.password === "string" && data.password) {
      if (data.password.length < 8) return fail(res, 400, "رمز عبور باید حداقل ۸ کاراکتر باشد");
      const secret = makePassword(data.password);
      await pool.execute("UPDATE app_users SET salt = ?, password_hash = ? WHERE uid = ?", [secret.salt, secret.passwordHash, uid]);
    }
    return send(res, 200, { user: profile });
  }

  if (uid && parts[4] === "reset-password" && req.method === "POST") {
    const data = await body(req);
    const temporaryPassword = String(data.password || "");
    if (temporaryPassword.length < 8) return fail(res, 400, "رمز موقت باید حداقل ۸ کاراکتر باشد");
    const [rows] = await pool.execute("SELECT uid, email FROM app_users WHERE uid = ? LIMIT 1", [uid]);
    if (!rows.length) return fail(res, 404, "کاربر پیدا نشد");
    const secret = makePassword(temporaryPassword);
    await pool.execute(
      "UPDATE app_users SET salt = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE uid = ?",
      [secret.salt, secret.passwordHash, uid]
    );
    await writeAudit(manager, "reset-password", "users", uid, { email: rows[0].email });
    return send(res, 200, { ok: true });
  }

  return fail(res, 405, "عملیات مجاز نیست");
}

async function handleChatWidget(req, res, url) {
  if (url.pathname === "/api/chat-widget" && req.method === "GET") {
    const config = await getDocument("settings", "chat_widget");
    return send(res, 200, {
      active: !!(config && config.active && config.code),
      code: config && config.active ? String(config.code || "") : "",
      updatedAt: config && config.updatedAt || "",
    });
  }

  if (url.pathname === "/api/admin/chat-widget" && req.method === "GET") {
    requireAdmin(req);
    const config = await getDocument("settings", "chat_widget");
    return send(res, 200, {
      active: !!(config && config.active),
      code: config && String(config.code || "") || "",
      updatedAt: config && config.updatedAt || "",
    });
  }

  if (url.pathname === "/api/admin/chat-widget" && req.method === "PUT") {
    const actor = requireAdmin(req);
    const input = await body(req);
    const parsed = parseChatWidgetCode(input.code);
    const config = {
      active: input.active === true && !!parsed.code,
      code: parsed.code,
      origins: parsed.origins,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.uid,
    };
    await saveDocument("settings", "chat_widget", config);
    applyChatWidgetOrigins(config.active ? config.origins : []);
    await writeAudit(actor, "update-chat-widget", "settings", "chat_widget", {
      active: config.active,
      origins: config.origins,
    });
    return send(res, 200, { ok: true, active: config.active });
  }

  if (url.pathname === "/api/admin/chat-widget" && req.method === "DELETE") {
    const actor = requireAdmin(req);
    await pool.execute(
      "DELETE FROM app_documents WHERE collection_name = 'settings' AND document_id = 'chat_widget'"
    );
    applyChatWidgetOrigins([]);
    await writeAudit(actor, "delete-chat-widget", "settings", "chat_widget");
    return send(res, 200, { ok: true });
  }

  return false;
}

const couponTargets = new Set([
  "courses", "official-toefl", "official-gre", "mock-toefl", "mock-gre",
  "consultation", "toefl-voucher", "gre-voucher",
]);

function couponCode() {
  return `AS-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

function activeCouponCampaign(campaign, target, now = Date.now()) {
  if (!campaign || campaign.active !== true || campaign.target !== target) return false;
  const startsAt = campaign.startsAt ? new Date(campaign.startsAt).getTime() : 0;
  const endsAt = campaign.endsAt ? new Date(campaign.endsAt).getTime() : 0;
  return (!startsAt || startsAt <= now) && (!endsAt || endsAt >= now);
}

async function generateDiscountCodes(campaignId, quantity, mode, client = null) {
  const activeClient = client || await dbClient();
  const total = mode === "shared" ? 1 : Math.min(500, Math.max(1, Number(quantity || 1)));
  const generated = [];
  try {
    for (let index = 0; index < total; index += 1) {
      let code = couponCode();
      let inserted = false;
      while (!inserted) {
        const duplicate = await activeClient.query(
          "SELECT document_id FROM app_documents WHERE collection_name = 'discount_codes' AND data->>'code' = $1 LIMIT 1",
          [code]
        );
        if (duplicate.rows.length) {
          code = couponCode();
          continue;
        }
        const documentId = id("discount_code");
        await activeClient.query(
          "INSERT INTO app_documents (collection_name, document_id, data) VALUES ('discount_codes', $1, $2)",
          [documentId, JSON.stringify({ code, campaignId, mode, used: false, usedBy: [], createdAt: new Date().toISOString() })]
        );
        generated.push(code);
        inserted = true;
      }
    }
  } finally {
    if (!client) activeClient.release();
  }
  return generated;
}

async function handleCoupons(req, res, url) {
  if (!url.pathname.startsWith("/api/coupons") && !url.pathname.startsWith("/api/admin/coupons")) return false;

  if (url.pathname === "/api/coupons/config" && req.method === "GET") {
    const target = cleanText(url.searchParams.get("target"), 50);
    if (!couponTargets.has(target)) return send(res, 200, { available: false });
    const [rows] = await pool.execute(
      "SELECT data FROM app_documents WHERE collection_name = 'discount_campaigns' ORDER BY updated_at DESC"
    );
    const campaign = rows.map((row) => parseJson(row.data)).find((item) => activeCouponCampaign(item, target));
    return send(res, 200, {
      available: !!campaign,
      target,
      hint: campaign ? cleanText(campaign.publicHint || "کد تخفیف خود را وارد کنید", 160) : "",
    });
  }

  if (url.pathname === "/api/coupons/validate" && req.method === "POST") {
    const actor = requireUser(req);
    const input = await body(req);
    const code = cleanText(input.code, 40).toUpperCase();
    const target = cleanText(input.target, 50);
    if (!code || !couponTargets.has(target)) return fail(res, 400, "کد یا خدمت انتخاب‌شده معتبر نیست");
    const [codes] = await pool.execute(
      "SELECT data FROM app_documents WHERE collection_name = 'discount_codes' AND UPPER(data->>'code') = ? LIMIT 1",
      [code]
    );
    if (!codes.length) return fail(res, 404, "کد تخفیف معتبر نیست");
    const codeData = parseJson(codes[0].data);
    const campaign = await getDocument("discount_campaigns", codeData.campaignId);
    if (!activeCouponCampaign(campaign, target)) return fail(res, 409, "این کد برای این خدمت یا در این تاریخ فعال نیست");
    if (codeData.mode === "shared") {
      if ((Array.isArray(codeData.usedBy) ? codeData.usedBy : []).includes(actor.uid)) return fail(res, 409, "شما قبلاً از این کد استفاده کرده‌اید");
    } else if (codeData.used === true) {
      return fail(res, 409, "این کد قبلاً استفاده شده است");
    }
    return send(res, 200, {
      valid: true,
      coupon: { code, discountType: campaign.discountType, value: campaign.value, target, title: campaign.name },
    });
  }

  if (url.pathname === "/api/coupons/redeem" && req.method === "POST") {
    const actor = requireUser(req);
    const input = await body(req);
    const code = cleanText(input.code, 40).toUpperCase();
    const target = cleanText(input.target, 50);
    if (!code || !couponTargets.has(target)) return fail(res, 400, "کد یا خدمت انتخاب‌شده معتبر نیست");
    const client = await dbClient();
    try {
      await client.query("BEGIN");
      const codeResult = await client.query(
        "SELECT document_id, data FROM app_documents WHERE collection_name = 'discount_codes' AND UPPER(data->>'code') = $1 FOR UPDATE",
        [code]
      );
      if (!codeResult.rows.length) throw Object.assign(new Error("کد تخفیف معتبر نیست"), { status: 404 });
      const codeId = codeResult.rows[0].document_id;
      const codeData = parseJson(codeResult.rows[0].data);
      const campaignResult = await client.query(
        "SELECT data FROM app_documents WHERE collection_name = 'discount_campaigns' AND document_id = $1 LIMIT 1",
        [codeData.campaignId]
      );
      if (!campaignResult.rows.length) throw Object.assign(new Error("کمپین این کد دیگر فعال نیست"), { status: 410 });
      const campaign = parseJson(campaignResult.rows[0].data);
      if (!activeCouponCampaign(campaign, target)) throw Object.assign(new Error("این کد برای این خدمت یا در این تاریخ فعال نیست"), { status: 409 });
      const usedBy = Array.isArray(codeData.usedBy) ? codeData.usedBy : [];
      if (codeData.mode === "shared") {
        if (usedBy.includes(actor.uid)) throw Object.assign(new Error("شما قبلاً از این کد استفاده کرده‌اید"), { status: 409 });
        codeData.usedBy = [...usedBy, actor.uid];
      } else {
        if (codeData.used === true) throw Object.assign(new Error("این کد قبلاً استفاده شده است"), { status: 409 });
        codeData.used = true;
        codeData.usedBy = [actor.uid];
      }
      codeData.usedAt = new Date().toISOString();
      await client.query(
        "UPDATE app_documents SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE collection_name = 'discount_codes' AND document_id = $2",
        [JSON.stringify(codeData), codeId]
      );
      await client.query("COMMIT");
      return send(res, 200, {
        ok: true,
        coupon: {
          code,
          campaignId: codeData.campaignId,
          discountType: campaign.discountType,
          value: campaign.value,
          target,
          title: campaign.name,
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  if (url.pathname === "/api/admin/coupons" && req.method === "POST") {
    const actor = requirePermission(req, "coupons");
    const input = await body(req);
    const target = cleanText(input.target, 50);
    const mode = input.mode === "shared" ? "shared" : "unique";
    const discountType = input.discountType === "amount" ? "amount" : "percent";
    const value = Number(input.value || 0);
    if (!cleanText(input.name, 120) || !couponTargets.has(target) || value <= 0) return fail(res, 400, "عنوان، خدمت و مقدار تخفیف معتبر الزامی است");
    if (discountType === "percent" && value > 100) return fail(res, 400, "درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد");
    const startsAt = input.startsAt ? new Date(input.startsAt).toISOString() : "";
    const endsAt = input.endsAt ? new Date(input.endsAt).toISOString() : "";
    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) return fail(res, 400, "زمان پایان باید بعد از شروع باشد");
    const campaignId = id("discount_campaign");
    const campaign = {
      name: cleanText(input.name, 120),
      target,
      discountType,
      value,
      mode,
      startsAt,
      endsAt,
      active: input.active !== false,
      publicHint: cleanText(input.publicHint, 160),
      createdAt: new Date().toISOString(),
      createdBy: actor.uid,
    };
    const client = await dbClient();
    try {
      await client.query("BEGIN");
      await client.query(
        "INSERT INTO app_documents (collection_name, document_id, data) VALUES ('discount_campaigns', $1, $2)",
        [campaignId, JSON.stringify(campaign)]
      );
      const codes = await generateDiscountCodes(campaignId, input.quantity, mode, client);
      await client.query("COMMIT");
      await writeAudit(actor, "create-coupon-campaign", "discount_campaigns", campaignId, { target, quantity: codes.length, mode });
      return send(res, 200, { id: campaignId, campaign, codes });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  const generateMatch = url.pathname.match(/^\/api\/admin\/coupons\/([^/]+)\/generate$/);
  if (generateMatch && req.method === "POST") {
    const actor = requirePermission(req, "coupons");
    const campaignId = decodeURIComponent(generateMatch[1]);
    const input = await body(req);
    const campaign = await getDocument("discount_campaigns", campaignId);
    if (!campaign) return fail(res, 404, "کمپین پیدا نشد");
    if (campaign.mode === "shared") return fail(res, 409, "کمپین عمومی یک کد مشترک دارد و نیاز به افزایش تعداد ندارد");
    const codes = await generateDiscountCodes(campaignId, input.quantity, "unique");
    await writeAudit(actor, "generate-coupon-codes", "discount_codes", campaignId, { quantity: codes.length });
    return send(res, 200, { codes });
  }

  return false;
}

function csvCell(value) {
  return `"${String(value == null ? "" : value).replace(/"/g, '""')}"`;
}

function dateDistanceFromToday(dateValue) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateValue || ""))) return null;
  const today = new Date(`${currentExamDateKey()}T00:00:00+03:30`);
  const target = new Date(`${dateValue}T00:00:00+03:30`);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

async function notificationExists(kind, registrationId) {
  const [rows] = await pool.execute(
    `SELECT document_id FROM app_documents
     WHERE collection_name = 'notifications'
       AND data->>'kind' = ?
       AND data->>'registrationId' = ?
     LIMIT 1`,
    [kind, registrationId]
  );
  return rows.length > 0;
}

async function createSystemNotification(data) {
  const notificationId = id("notification");
  await saveDocument("notifications", notificationId, {
    audience: "user",
    userId: cleanText(data.userId, 100),
    userName: cleanText(data.userName, 120),
    title: cleanText(data.title, 160),
    body: cleanText(data.body, 2000),
    kind: cleanText(data.kind, 80),
    registrationId: cleanText(data.registrationId, 100),
    createdAt: new Date().toISOString(),
    createdBy: "system",
  });
}

async function processExamReminders() {
  const [rows] = await pool.query(
    `SELECT document_id, data FROM app_documents
     WHERE collection_name = 'exam_registrations'
       AND COALESCE(data->>'status', '') <> 'cancelled'`
  );
  let created = 0;
  for (const row of rows) {
    const item = parseJson(row.data);
    const days = dateDistanceFromToday(item.examDate);
    if (![7, 1].includes(days)) continue;
    const kind = days === 7 ? "exam-reminder-7d" : "exam-reminder-1d";
    if (await notificationExists(kind, row.document_id)) continue;
    await createSystemNotification({
      userId: item.userId,
      userName: item.name,
      registrationId: row.document_id,
      kind,
      title: days === 7 ? "یک هفته تا آزمون شما باقی مانده است" : "یادآوری آزمون فردا",
      body: `${cleanText(item.examName || "آزمون", 120)} در تاریخ ${cleanText(item.examDate, 20)} ساعت ${cleanText(item.examTime || "09:00", 10)} برگزار می‌شود. لطفاً پیش از زمان شروع در محل آزمون حضور داشته باشید.`,
    });
    created += 1;
  }
  return created;
}

async function processSmartWaitlist() {
  const [dateRows] = await pool.query(
    "SELECT document_id, data FROM app_documents WHERE collection_name = 'mock_dates'"
  );
  let invited = 0;
  for (const dateRow of dateRows) {
    const dateInfo = parseJson(dateRow.data);
    if (!dateInfo.date || dateDistanceFromToday(dateInfo.date) < 0) continue;
    const [activeInvitations] = await pool.execute(
      `SELECT document_id FROM app_documents
       WHERE collection_name = 'exam_waitlist'
         AND data->>'dateId' = ?
         AND data->>'status' = 'invited'
         AND COALESCE(data->>'invitationExpiresAt', '') > ?`,
      [dateRow.document_id, new Date().toISOString()]
    );
    const available = Math.max(
      0,
      Number(dateInfo.capacity || 0) - Number(dateInfo.registered || 0) - Number(dateInfo.manualRegistered || 0) - activeInvitations.length
    );
    if (!available) continue;
    const [waitingRows] = await pool.execute(
      `SELECT document_id, data FROM app_documents
       WHERE collection_name = 'exam_waitlist'
         AND data->>'dateId' = ?
         AND COALESCE(data->>'status', 'waiting') = 'waiting'
       ORDER BY created_at ASC
       LIMIT ?`,
      [dateRow.document_id, available]
    );
    for (const waitingRow of waitingRows) {
      const waiting = parseJson(waitingRow.data);
      waiting.status = "invited";
      waiting.invitedAt = new Date().toISOString();
      waiting.invitationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await saveDocument("exam_waitlist", waitingRow.document_id, waiting);
      await createSystemNotification({
        userId: waiting.userId,
        userName: waiting.name,
        registrationId: waitingRow.document_id,
        kind: "waitlist-invitation",
        title: "ظرفیت آزمون برای شما باز شد",
        body: `برای ${cleanText(waiting.examName || dateInfo.type || "آزمون آزمایشی", 120)} در تاریخ ${cleanText(dateInfo.date, 20)} ظرفیت آزاد شده است. این فرصت تا ۲۴ ساعت برای شما فعال است؛ برای تکمیل ثبت‌نام به بخش آزمون‌های من مراجعه کنید.`,
      });
      invited += 1;
    }
  }
  return invited;
}

let automationRunning = false;
async function runSiteAutomations() {
  if (automationRunning) return { reminders: 0, invitations: 0 };
  automationRunning = true;
  try {
    const reminders = await processExamReminders();
    const invitations = await processSmartWaitlist();
    return { reminders, invitations };
  } finally {
    automationRunning = false;
  }
}

function monthKey(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}` : "";
}

async function handleAdminTools(req, res, url) {
  if (!url.pathname.startsWith("/api/admin/")) return false;
  if (url.pathname === "/api/admin/dashboard" && req.method === "GET") {
    requirePermission(req, "reports");
    const [usersResult, documentsResult] = await Promise.all([
      pool.query("SELECT uid, data, created_at FROM app_users WHERE role = 'student' ORDER BY created_at DESC"),
      pool.query(
        `SELECT collection_name, document_id, data, created_at FROM app_documents
         WHERE collection_name IN ('exam_registrations','course_registrations','placement_registrations','exam_waitlist','mock_dates','toefl_dates','gre_dates')
         ORDER BY created_at DESC`
      ),
    ]);
    const users = usersResult[0];
    const documents = documentsResult[0].map((row) => ({
      collection: row.collection_name,
      id: row.document_id,
      data: parseJson(row.data),
      createdAt: row.created_at,
    }));
    const exams = documents.filter((item) => item.collection === "exam_registrations");
    const courses = documents.filter((item) => item.collection === "course_registrations");
    const placements = documents.filter((item) => item.collection === "placement_registrations");
    const waiting = documents.filter((item) => item.collection === "exam_waitlist" && (item.data.status || "waiting") === "waiting");
    const popularMap = {};
    exams.forEach((item) => {
      const name = cleanText(item.data.examName || item.data.type || "آزمون", 120);
      popularMap[name] = (popularMap[name] || 0) + 1;
    });
    courses.forEach((item) => {
      const name = cleanText(item.data.courseName || "دوره آموزشی", 120);
      popularMap[name] = (popularMap[name] || 0) + 1;
    });
    const popular = Object.entries(popularMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    const trendMap = {};
    [...exams, ...courses, ...placements].forEach((item) => {
      const key = monthKey(item.data.createdAt || item.createdAt);
      if (key) trendMap[key] = (trendMap[key] || 0) + 1;
    });
    const trend = Object.entries(trendMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([month, count]) => ({ month, count }));
    const today = currentExamDateKey();
    const capacities = documents
      .filter((item) => ["mock_dates", "toefl_dates", "gre_dates"].includes(item.collection) && item.data.date >= today)
      .sort((a, b) => String(a.data.date).localeCompare(String(b.data.date)))
      .slice(0, 8)
      .map((item) => ({
        id: item.id,
        type: item.data.type || item.collection.replace("_dates", "").toUpperCase(),
        date: item.data.date,
        capacity: Number(item.data.capacity || 0),
        registered: Number(item.data.registered || 0),
        manualRegistered: Number(item.data.manualRegistered || 0),
        remaining: item.collection === "mock_dates"
          ? Math.max(0, Number(item.data.capacity || 0) - Number(item.data.registered || 0) - Number(item.data.manualRegistered || 0))
          : null,
      }));
    return send(res, 200, {
      totals: {
        students: users.length,
        exams: exams.length,
        courses: courses.length,
        placements: placements.length,
        waiting: waiting.length,
        confirmed: exams.filter((item) => item.data.status === "confirmed").length,
      },
      popular,
      trend,
      capacities,
    });
  }

  const studentProfileMatch = url.pathname.match(/^\/api\/admin\/students\/([^/]+)\/profile$/);
  if (studentProfileMatch && req.method === "GET") {
    requirePermission(req, "users");
    const uid = decodeURIComponent(studentProfileMatch[1]);
    const [userRows] = await pool.execute(
      "SELECT uid, email, role, data, created_at, updated_at FROM app_users WHERE uid = ? AND role = 'student' LIMIT 1",
      [uid]
    );
    if (!userRows.length) return fail(res, 404, "دانشجو پیدا نشد");
    const [documentRows] = await pool.query(
      `SELECT collection_name, document_id, data, created_at FROM app_documents
       WHERE collection_name IN ('exam_registrations','course_registrations','placement_registrations','exam_results','messages','notifications','exam_waitlist')
         AND (
           data->>'userId' = $1 OR
           data->>'senderId' = $1 OR
           data->>'receiverId' = $1
         )
       ORDER BY created_at DESC`,
      [uid]
    );
    const grouped = {};
    documentRows.forEach((row) => {
      if (!grouped[row.collection_name]) grouped[row.collection_name] = [];
      grouped[row.collection_name].push({ id: row.document_id, ...parseJson(row.data) });
    });
    return send(res, 200, {
      user: {
        ...publicUser(userRows[0]),
        createdAt: userRows[0].created_at,
        updatedAt: userRows[0].updated_at,
      },
      records: grouped,
    });
  }

  if (url.pathname === "/api/admin/automations/run" && req.method === "POST") {
    const actor = requireUser(req);
    if (!hasPermission(actor, "notifications") && !hasPermission(actor, "reports")) {
      return fail(res, 403, "برای اجرای یادآورها دسترسی ندارید");
    }
    const result = await runSiteAutomations();
    await writeAudit(actor, "run-automations", "system", "reminders-waitlist", result);
    return send(res, 200, result);
  }

  if (url.pathname === "/api/admin/reports.xlsx" && req.method === "GET") {
    const actor = requirePermission(req, "reports");
    const ExcelJS = require("exceljs");
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Allameh Sokhan";
    workbook.created = new Date();
    const [users, documents] = await Promise.all([
      pool.query("SELECT uid, email, role, data, created_at FROM app_users WHERE role = 'student' ORDER BY created_at DESC"),
      pool.query(
        `SELECT collection_name, document_id, data, created_at FROM app_documents
         WHERE collection_name IN ('exam_registrations','course_registrations','placement_registrations','exam_waitlist','discount_campaigns','discount_codes')
         ORDER BY created_at DESC`
      ),
    ]);
    function addSheet(name, columns, rows) {
      const sheet = workbook.addWorksheet(name, { views: [{ rightToLeft: true, state: "frozen", ySplit: 1 }] });
      sheet.columns = columns.map((column) => ({ header: column.header, key: column.key, width: column.width || 20 }));
      rows.forEach((row) => sheet.addRow(row));
      sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3730A3" } };
      sheet.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + columns.length)}1` };
      return sheet;
    }
    const docs = documents[0].map((row) => ({ collection: row.collection_name, id: row.document_id, ...parseJson(row.data), dbCreatedAt: row.created_at }));
    addSheet("دانشجویان", [
      { header: "شناسه", key: "uid", width: 24 }, { header: "نام", key: "name" }, { header: "ایمیل", key: "email", width: 30 },
      { header: "موبایل", key: "mobile" }, { header: "آخرین صفحه", key: "lastPageTitle", width: 28 },
      { header: "آخرین فعالیت", key: "lastActiveAt", width: 24 }, { header: "تاریخ عضویت", key: "createdAt", width: 24 },
    ], users[0].map((row) => ({ uid: row.uid, email: row.email, ...parseJson(row.data), createdAt: row.created_at })));
    addSheet("ثبت نام ها", [
      { header: "شناسه", key: "id", width: 25 }, { header: "نوع", key: "category" }, { header: "نام", key: "name" },
      { header: "ایمیل", key: "email", width: 28 }, { header: "موبایل", key: "mobile" }, { header: "عنوان", key: "title", width: 30 },
      { header: "تاریخ", key: "date" }, { header: "ساعت", key: "time" }, { header: "وضعیت", key: "status" },
      { header: "کد تخفیف", key: "coupon" }, { header: "زمان ثبت", key: "createdAt", width: 24 },
    ], docs.filter((item) => ["exam_registrations", "course_registrations", "placement_registrations", "exam_waitlist"].includes(item.collection)).map((item) => ({
      id: item.id, category: item.category || item.type || item.collection, name: item.name, email: item.email, mobile: item.mobile,
      title: item.examName || item.courseName || item.testName, date: item.examDate || item.courseDate || item.testDate,
      time: item.examTime || "", status: item.status, coupon: item.discountCoupon && item.discountCoupon.code || "", createdAt: item.createdAt || item.dbCreatedAt,
    })));
    addSheet("حضور و غیاب", [
      { header: "نام", key: "name" }, { header: "آزمون", key: "examName", width: 28 }, { header: "تاریخ", key: "examDate" },
      { header: "ساعت", key: "examTime" }, { header: "صندلی", key: "seatNumber" }, { header: "حضور", key: "attended" },
    ], docs.filter((item) => item.collection === "exam_registrations" && item.type === "mock").map((item) => ({
      ...item, attended: item.attended ? "حاضر" : "ثبت نشده",
    })));
    const campaigns = Object.fromEntries(docs.filter((item) => item.collection === "discount_campaigns").map((item) => [item.id, item]));
    addSheet("کدهای تخفیف", [
      { header: "کد", key: "code" }, { header: "کمپین", key: "campaign" }, { header: "خدمت", key: "target" },
      { header: "نوع", key: "discountType" }, { header: "مقدار", key: "value" }, { header: "مصرف شده", key: "used" },
      { header: "تعداد استفاده", key: "usedCount" }, { header: "تاریخ ساخت", key: "createdAt", width: 24 },
    ], docs.filter((item) => item.collection === "discount_codes").map((item) => {
      const campaign = campaigns[item.campaignId] || {};
      return {
        code: item.code, campaign: campaign.name || "", target: campaign.target || "", discountType: campaign.discountType || "",
        value: campaign.value || "", used: item.used ? "بله" : "خیر", usedCount: Array.isArray(item.usedBy) ? item.usedBy.length : 0, createdAt: item.createdAt,
      };
    }));
    const buffer = await workbook.xlsx.writeBuffer();
    await writeAudit(actor, "download-excel-report", "reports", "complete-workbook");
    res.writeHead(200, {
      ...securityHeaders(),
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="allameh-reports-${currentExamDateKey()}.xlsx"`,
      "Cache-Control": "no-store",
    });
    return res.end(Buffer.from(buffer));
  }

  const registrationMatch = url.pathname.match(/^\/api\/admin\/registrations\/([^/]+)\/confirm$/);
  if (registrationMatch && req.method === "POST") {
    const actor = requireUser(req);
    if (!hasPermission(actor, "registrations") && !hasPermission(actor, "attendance")) {
      return fail(res, 403, "برای تأیید ثبت‌نام دسترسی ندارید");
    }
    const registrationId = decodeURIComponent(registrationMatch[1]);
    const client = await dbClient();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        "SELECT data FROM app_documents WHERE collection_name = 'exam_registrations' AND document_id = $1 FOR UPDATE",
        [registrationId]
      );
      if (!result.rows.length) throw Object.assign(new Error("ثبت‌نام پیدا نشد"), { status: 404 });
      const registration = parseJson(result.rows[0].data);
      if (registration.status === "confirmed") {
        await client.query("COMMIT");
        return send(res, 200, { ok: true, registration, alreadyConfirmed: true });
      }
      const previousRegistration = { ...registration };
      registration.status = "confirmed";
      registration.confirmedAt = new Date().toISOString();
      registration.confirmedBy = actor.uid;
      registration.confirmedByName = cleanText(actor.name || actor.email, 120);
      await client.query(
        "UPDATE app_documents SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE collection_name = 'exam_registrations' AND document_id = $2",
        [JSON.stringify(registration), registrationId]
      );
      await client.query("COMMIT");
      await notifyServiceStatusChange("exam_registrations", registrationId, registration, actor, previousRegistration);
      await writeAudit(actor, "confirm-registration", "exam_registrations", registrationId, {
        examName: registration.examName,
        userId: registration.userId,
      });
      return send(res, 200, { ok: true, registration });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  if (url.pathname === "/api/admin/backup" && req.method === "GET") {
    const manager = requireAdmin(req);
    const [users] = await pool.query("SELECT uid, email, role, data, created_at, updated_at FROM app_users ORDER BY created_at");
    const [documents] = await pool.query("SELECT collection_name, document_id, data, created_at, updated_at FROM app_documents ORDER BY collection_name, created_at");
    await writeAudit(manager, "download-backup", "system", "database");
    const payload = JSON.stringify({
      generatedAt: new Date().toISOString(),
      version: 1,
      users: users.map((row) => ({ uid: row.uid, email: row.email, role: row.role, data: parseJson(row.data), createdAt: row.created_at, updatedAt: row.updated_at })),
      documents: documents.map((row) => ({ collection: row.collection_name, id: row.document_id, data: parseJson(row.data), createdAt: row.created_at, updatedAt: row.updated_at })),
    }, null, 2);
    res.writeHead(200, {
      ...securityHeaders(),
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="allameh-backup-${currentExamDateKey()}.json"`,
      "Cache-Control": "no-store",
    });
    return res.end(payload);
  }

  if (url.pathname === "/api/admin/registrations.csv" && req.method === "GET") {
    const actor = requirePermission(req, "reports");
    const [rows] = await pool.query(
      "SELECT document_id, data FROM app_documents WHERE collection_name IN ('exam_registrations','course_registrations','placement_registrations','exam_waitlist') ORDER BY created_at DESC"
    );
    const lines = [["شناسه", "نوع", "نام", "ایمیل", "موبایل", "عنوان", "تاریخ رویداد", "ساعت", "وضعیت", "زمان ثبت"].map(csvCell).join(",")];
    rows.forEach((row) => {
      const item = parseJson(row.data);
      lines.push([
        row.document_id, item.category || item.type || "", item.name || "", item.email || "", item.mobile || "",
        item.examName || item.courseName || item.testName || "", item.examDate || item.courseDate || item.testDate || "",
        item.examTime || "", item.status || "", item.createdAt || "",
      ].map(csvCell).join(","));
    });
    await writeAudit(actor, "download-report", "reports", "registrations");
    res.writeHead(200, {
      ...securityHeaders(),
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="registrations-${currentExamDateKey()}.csv"`,
      "Cache-Control": "no-store",
    });
    return res.end(`\uFEFF${lines.join("\n")}`);
  }
  return false;
}

function serveStatic(req, res) {
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405, { ...securityHeaders(), Allow: "GET, HEAD" });
    return res.end("Method not allowed");
  }
  let url;
  let requested;
  let seoRoute = null;
  try {
    url = new URL(req.url, "http://localhost");
    const rawRequested = decodeURIComponent(url.pathname.slice(1));
    const allowedRootFiles = new Set(["index.html", "newsletter.css", "newsletter.js", "robots.txt", "sitemap.xml", "favicon.ico", "site.webmanifest"]);
    seoRoute = pageSeo[url.pathname.replace(/\/$/, "")] || null;
    if (url.pathname !== "/" && !seoRoute && !url.pathname.startsWith("/news/") && !url.pathname.startsWith("/assets/") && !allowedRootFiles.has(rawRequested)) {
      res.writeHead(404, securityHeaders());
      return res.end("Not found");
    }
    requested = rawRequested;
  } catch {
    res.writeHead(400, securityHeaders());
    return res.end("Bad request");
  }
  const newsMatch = url.pathname.match(/^\/news\/([^/]+)\/?$/);
  requested = url.pathname === "/" || newsMatch || seoRoute ? "index.html" : requested;
  const target = path.resolve(root, requested);
  const assetsRoot = path.join(root, "assets");
  const invalidAssetPath = url.pathname.startsWith("/assets/") && !target.startsWith(`${assetsRoot}${path.sep}`);
  if (invalidAssetPath || (!target.startsWith(`${root}${path.sep}`) && target !== path.join(root, "index.html"))) {
    res.writeHead(403, securityHeaders());
    return res.end("Forbidden");
  }
  fs.readFile(target, (error, file) => {
    if (error) {
      res.writeHead(404, securityHeaders());
      return res.end("Not found");
    }
    const types = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".webmanifest": "application/manifest+json; charset=utf-8",
      ".xml": "application/xml; charset=utf-8",
      ".txt": "text/plain; charset=utf-8",
    };
    let output = file;
    if ((newsMatch || seoRoute) && path.extname(target).toLowerCase() === ".html") {
      const slug = newsMatch ? decodeURIComponent(newsMatch[1]) : "";
      const seo = newsMatch ? articleSeo[slug] : seoRoute;
      if (seo) {
        const canonical = newsMatch ? `https://asmdi.ir/news/${encodeURIComponent(slug)}` : `https://asmdi.ir${url.pathname.replace(/\/$/, "") || "/"}`;
        output = file.toString("utf8")
          .replace("<head>", "<head>\n<base href=\"/\">")
          .replace(/<title>[\s\S]*?<\/title>/i, `<title>${seo.title}</title>`)
          .replace(/<meta id="seo-description" name="description" content="[^"]*">/i, `<meta id="seo-description" name="description" content="${seo.description}">`)
          .replace(/<link id="seo-canonical" rel="canonical" href="[^"]*">/i, `<link id="seo-canonical" rel="canonical" href="${canonical}">`)
          .replace(/<meta id="seo-og-title" property="og:title" content="[^"]*">/i, `<meta id="seo-og-title" property="og:title" content="${seo.title}">`)
          .replace(/<meta id="seo-og-description" property="og:description" content="[^"]*">/i, `<meta id="seo-og-description" property="og:description" content="${seo.description}">`)
          .replace(/<meta id="seo-og-url" property="og:url" content="[^"]*">/i, `<meta id="seo-og-url" property="og:url" content="${canonical}">`)
          .replace(/<meta id="seo-twitter-title" name="twitter:title" content="[^"]*">/i, `<meta id="seo-twitter-title" name="twitter:title" content="${seo.title}">`)
          .replace(/<meta id="seo-twitter-description" name="twitter:description" content="[^"]*">/i, `<meta id="seo-twitter-description" name="twitter:description" content="${seo.description}">`)
          .replace("</head>", `${seoRoute ? `\n<script>window.__INITIAL_PAGE=${JSON.stringify(seoRoute.page)};</script>` : ""}\n</head>`);
      }
    }
    const extension = path.extname(target).toLowerCase();
    const contentType = types[extension] || "application/octet-stream";
    const payload = Buffer.isBuffer(output) ? output : Buffer.from(output);
    const etag = `"${crypto.createHash("sha1").update(payload).digest("hex")}"`;
    const versionedAsset = /[?&]v=/.test(req.url);
    const cacheControl = extension === ".html" || requested === "robots.txt" || requested === "sitemap.xml"
      ? "no-cache"
      : ([".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico"].includes(extension)
        ? "public, max-age=2592000, stale-while-revalidate=86400"
        : (versionedAsset ? "public, max-age=31536000, immutable" : "public, max-age=604800, stale-while-revalidate=86400"));
    if (req.headers["if-none-match"] === etag) {
      res.writeHead(304, { ...securityHeaders(), ETag: etag, "Cache-Control": cacheControl });
      return res.end();
    }
    const accepts = String(req.headers["accept-encoding"] || "");
    const compressible = /^(text\/|application\/javascript|application\/json|image\/svg\+xml)/.test(contentType);
    let responsePayload = payload;
    let encoding = "";
    if (compressible && payload.length > 1024 && /\bbr\b/.test(accepts)) {
      responsePayload = zlib.brotliCompressSync(payload, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } });
      encoding = "br";
    } else if (compressible && payload.length > 1024 && /\bgzip\b/.test(accepts)) {
      responsePayload = zlib.gzipSync(payload, { level: 6 });
      encoding = "gzip";
    }
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": cacheControl,
      ETag: etag,
      Vary: "Accept-Encoding",
      ...(encoding ? { "Content-Encoding": encoding } : {}),
      ...securityHeaders(),
    });
    res.end(req.method === "HEAD" ? undefined : responsePayload);
  });
}

async function handleApi(req, res) {
  if (apiRateLimited(req)) return fail(res, 429, "تعداد درخواست‌ها زیاد است؛ کمی بعد دوباره تلاش کنید");
  const url = new URL(req.url, "http://localhost");
  validateRequestOrigin(req);
  validateCsrf(req, url);
  if (url.pathname === "/api/health" && req.method === "GET") {
    await pool.query("SELECT 1");
    return send(res, 200, { ok: true, database: "postgresql" });
  }
  const authResult = await handleAuth(req, res, url.pathname);
  if (authResult !== false) return authResult;
  const adminUsersResult = await handleAdminUsers(req, res, url);
  if (adminUsersResult !== false) return adminUsersResult;
  const chatWidgetResult = await handleChatWidget(req, res, url);
  if (chatWidgetResult !== false) return chatWidgetResult;
  const couponsResult = await handleCoupons(req, res, url);
  if (couponsResult !== false) return couponsResult;
  const adminToolsResult = await handleAdminTools(req, res, url);
  if (adminToolsResult !== false) return adminToolsResult;
  const publicTestimonialsResult = await handlePublicTestimonials(req, res, url);
  if (publicTestimonialsResult !== false) return publicTestimonialsResult;
  const collectionResult = await handleCollections(req, res, url);
  if (collectionResult !== false) return collectionResult;
  return fail(res, 404, "یافت نشد");
}

async function start() {
  await initializeDatabase();
  await loadChatWidgetConfiguration();
  runSiteAutomations().catch((error) => console.error("Automation startup failed:", error));
  setInterval(() => {
    runSiteAutomations().catch((error) => console.error("Automation interval failed:", error));
  }, 60 * 60 * 1000).unref();
  const server = http.createServer((req, res) => {
    if (req.url.startsWith("/api/")) {
      handleApi(req, res).catch((error) => {
        console.error(error);
        if (!res.headersSent) fail(res, error.status || 500, error.status ? error.message : "خطای داخلی سرور");
      });
      return;
    }
    serveStatic(req, res);
  });
  server.requestTimeout = 30 * 1000;
  server.headersTimeout = 15 * 1000;
  server.keepAliveTimeout = 5 * 1000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Allameh Sokhan Node/MySQL: http://0.0.0.0:${port}`);
  });
}

start().catch((error) => {
  console.error("Startup failed:", error);
  process.exit(1);
});


