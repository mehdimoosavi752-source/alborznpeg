import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { api } from "./lib/api.js";

// پایش خطا: خطاهای پیش‌بینی‌نشده‌ی سمت مرورگر برای بررسی بعدی به سرور گزارش می‌شوند
function reportError(message, stack) {
  try {
    api.reportClientError({ message: String(message || "").slice(0, 500), stack: String(stack || "").slice(0, 2000), url: window.location.href });
  } catch (e) { /* اگر گزارش خطا هم خطا بدهد، نادیده گرفته می‌شود */ }
}
window.addEventListener("error", (e) => reportError(e.message, e.error?.stack));
window.addEventListener("unhandledrejection", (e) => reportError(e.reason?.message || String(e.reason), e.reason?.stack));

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
