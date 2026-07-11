// این فایل جایگزین storage.js نسخه‌ی قبلی است.
// به‌جای ذخیره‌سازی محلی، با یک سرور واقعی (Express + SQLite) صحبت می‌کند
// که رمزهای عبور را هش می‌کند و دسترسی مدیریتی را واقعاً سمت سرور چک می‌کند.

const API_URL = import.meta.env.VITE_API_URL || "";
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

export const resolveImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}${path}`;
};

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
  updateProfile: (payload) => request("/api/account/profile", { method: "PATCH", body: JSON.stringify(payload) }),
  changePassword: (payload) => request("/api/account/password", { method: "PATCH", body: JSON.stringify(payload) }),

  // آدرس‌ها
  myAddresses: () => request("/api/addresses/mine"),
  createAddress: (payload) => request("/api/addresses", { method: "POST", body: JSON.stringify(payload) }),
  updateAddress: (id, payload) => request(`/api/addresses/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteAddress: (id) => request(`/api/addresses/${id}`, { method: "DELETE" }),

  // لیست علاقه‌مندی‌ها
  myWishlist: () => request("/api/wishlist/mine"),
  addToWishlist: (productId) => request(`/api/wishlist/${encodeURIComponent(productId)}`, { method: "POST" }),
  removeFromWishlist: (productId) => request(`/api/wishlist/${encodeURIComponent(productId)}`, { method: "DELETE" }),

  // صفحات (مثل ویرایشگر صفحات وردپرس)
  getPagesPublic: () => request("/api/pages"),
  getPagesAdmin: () => request("/api/pages/admin"),
  createPage: (payload) => request("/api/pages", { method: "POST", body: JSON.stringify(payload) }),
  updatePage: (id, payload) => request(`/api/pages/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deletePage: (id) => request(`/api/pages/${id}`, { method: "DELETE" }),

  // درگاه پرداخت
  getPaymentSettings: () => request("/api/admin/payment-settings"),
  updatePaymentSettings: (payload) => request("/api/admin/payment-settings", { method: "PUT", body: JSON.stringify(payload) }),
  getPaymentStatus: () => request("/api/payment-status"),

  // کاربران (فقط مدیر)
  listUsers: () => request("/api/users"),
  setUserRole: (id, role) => request(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify({ role }) }),
  updateUser: (id, payload) => request(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  getUserDetail: (id) => request(`/api/admin/users/${id}/detail`),
  adminDeleteAddress: (id) => request(`/api/admin/addresses/${id}`, { method: "DELETE" }),

  // سفارشات
  createOrder: (payload) => request("/api/orders", { method: "POST", body: JSON.stringify(payload) }),
  myOrders: () => request("/api/orders/mine"),
  trackOrder: (code) => request(`/api/orders/track/${encodeURIComponent(code)}`),
  allOrders: () => request("/api/orders"),
  setOrderStatus: (id, status, notify) => request(`/api/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, notify }) }),

  // پیام‌های تماس با ما
  sendMessage: (payload) => request("/api/messages", { method: "POST", body: JSON.stringify(payload) }),
  allMessages: () => request("/api/messages"),
  updateMessage: (id, payload) => request(`/api/messages/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteMessage: (id) => request(`/api/messages/${id}`, { method: "DELETE" }),
  replyMessage: (id, reply, via) => request(`/api/messages/${id}/reply`, { method: "POST", body: JSON.stringify({ reply, via }) }),

  // آپلود تصویر
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const headers = {};
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_URL}/api/admin/upload`, { method: "POST", body: formData, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "آپلود ناموفق بود");
    return data;
  },

  // اعلان‌ها (ایمیل و پیامک)
  getNotificationSettings: () => request("/api/admin/notification-settings"),
  updateNotificationSettings: (payload) => request("/api/admin/notification-settings", { method: "PUT", body: JSON.stringify(payload) }),

  // نظرات مشتریان
  getReviews: (productId) => request(`/api/reviews${productId ? `?productId=${encodeURIComponent(productId)}` : ""}`),
  submitReview: (payload) => request("/api/reviews", { method: "POST", body: JSON.stringify(payload) }),
  adminGetReviews: () => request("/api/admin/reviews"),
  adminSetReviewApproved: (id, approved) => request(`/api/admin/reviews/${id}`, { method: "PATCH", body: JSON.stringify({ approved }) }),
  adminDeleteReview: (id) => request(`/api/admin/reviews/${id}`, { method: "DELETE" }),

  // تیکت‌های پشتیبانی
  createTicket: (payload) => request("/api/tickets", { method: "POST", body: JSON.stringify(payload) }),
  myTickets: () => request("/api/tickets/mine"),
  allTickets: () => request("/api/tickets"),
  getTicket: (id) => request(`/api/tickets/${id}`),
  replyTicket: (id, message) => request(`/api/tickets/${id}/messages`, { method: "POST", body: JSON.stringify({ message }) }),
  setTicketStatus: (id, status) => request(`/api/tickets/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),

  // پاپ‌آپ‌های زمان‌بندی‌شده
  getActivePopups: (page) => request(`/api/popups/active?page=${encodeURIComponent(page)}`),
  adminListPopups: () => request("/api/admin/popups"),
  adminCreatePopup: (payload) => request("/api/admin/popups", { method: "POST", body: JSON.stringify(payload) }),
  adminUpdatePopup: (id, payload) => request(`/api/admin/popups/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  adminDeletePopup: (id) => request(`/api/admin/popups/${id}`, { method: "DELETE" }),

  // کدهای تخفیف
  applyCoupon: (payload) => request("/api/coupons/apply", { method: "POST", body: JSON.stringify(payload) }),
  adminListCoupons: () => request("/api/admin/coupons"),
  adminCreateCoupon: (payload) => request("/api/admin/coupons", { method: "POST", body: JSON.stringify(payload) }),
  adminUpdateCoupon: (id, payload) => request(`/api/admin/coupons/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  adminDeleteCoupon: (id) => request(`/api/admin/coupons/${id}`, { method: "DELETE" }),

  // قالب‌های پیام ایمیل/پیامک
  adminListNotificationTemplates: () => request("/api/admin/notification-templates"),
  adminCreateNotificationTemplate: (payload) => request("/api/admin/notification-templates", { method: "POST", body: JSON.stringify(payload) }),
  adminUpdateNotificationTemplate: (id, payload) => request(`/api/admin/notification-templates/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  adminDeleteNotificationTemplate: (id) => request(`/api/admin/notification-templates/${id}`, { method: "DELETE" }),
};
