// این فایل جایگزین storage.js نسخه‌ی قبلی است.
// به‌جای ذخیره‌سازی محلی، با یک سرور واقعی (Express + SQLite) صحبت می‌کند
// که رمزهای عبور را هش می‌کند و دسترسی مدیریتی را واقعاً سمت سرور چک می‌کند.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";
const TOKEN_KEY = "novin_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch (e) {
    throw new Error("اتصال به سرور برقرار نشد. آدرس API یا اتصال اینترنت را بررسی کنید.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "خطایی رخ داد");
  return data;
}

export const api = {
  getToken,
  setToken,

  // محتوای سایت
  getContent: () => request("/api/content"),
  updateContent: (content) => request("/api/content", { method: "PUT", body: JSON.stringify(content) }),

  // احراز هویت
  register: (username, password, name) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify({ username, password, name }) }),
  login: (username, password) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  me: () => request("/api/auth/me"),

  // کاربران (فقط مدیر)
  listUsers: () => request("/api/users"),
  setUserRole: (id, role) => request(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify({ role }) }),

  // سفارشات
  createOrder: (payload) => request("/api/orders", { method: "POST", body: JSON.stringify(payload) }),
  myOrders: () => request("/api/orders/mine"),
  allOrders: () => request("/api/orders"),

  // پیام‌های تماس با ما
  sendMessage: (payload) => request("/api/messages", { method: "POST", body: JSON.stringify(payload) }),
  allMessages: () => request("/api/messages"),
};
