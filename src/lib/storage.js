/**
 * جایگزین ساده window.storage برای اجرا خارج از محیط Claude.
 * فعلاً روی localStorage مرورگر کار می‌کند یعنی داده فقط روی همان
 * مرورگر ذخیره می‌شود و بین بازدیدکننده‌های مختلف مشترک نیست.
 *
 * برای یک سایت واقعی که پنل مدیریت باید برای همه بازدیدکننده‌ها
 * یکسان باشد، باید این فایل را با یک بک‌اند واقعی (مثلاً Supabase,
 * Firebase یا یک API اختصاصی) جایگزین کنید. امضای توابع را همینطور
 * نگه دارید تا بقیه کد بدون تغییر کار کند.
 */

const DB_KEY = "novin_polytechnic_db";

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY) || "{}");
  } catch (e) {
    return {};
  }
}
function writeAll(obj) {
  localStorage.setItem(DB_KEY, JSON.stringify(obj));
}

export const storage = {
  async get(key) {
    const all = readAll();
    if (!(key in all)) return null;
    return { key, value: all[key], shared: false };
  },
  async set(key, value) {
    const all = readAll();
    all[key] = value;
    writeAll(all);
    return { key, value, shared: false };
  },
  async delete(key) {
    const all = readAll();
    delete all[key];
    writeAll(all);
    return { key, deleted: true, shared: false };
  },
  async list(prefix = "") {
    const all = readAll();
    const keys = Object.keys(all).filter((k) => k.startsWith(prefix));
    return { keys, prefix, shared: false };
  },
};
