import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Menu, X, ShoppingCart, Plus, Trash2, LogOut, Lock, User, UserPlus,
  Settings, LayoutGrid, FileText, ListOrdered, Wrench, Gamepad2,
  Monitor, Cpu, Phone, MapPin, Instagram, Send, MessageCircle,
  ChevronUp, ChevronDown, Check, Package, CreditCard,
  ShieldCheck, Zap, Clock, ChevronLeft, Layers, RotateCcw, Search,
  SlidersHorizontal, BadgeCheck, Truck, Mail, ChevronRight, Users as UsersIcon,
  Eye, EyeOff, Image as ImageIcon, Type, AlignLeft, MousePointerClick, Globe, LifeBuoy, Star,
} from "lucide-react";
import { api, resolveImageUrl } from "./lib/api.js";

/* ============================== ثابت‌ها ============================== */

const uid = (p = "id") => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const slugify = (s) => s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\u0600-\u06FF-]/g, "") || uid("p");

// متن یا شیء دوزبانه را با توجه به زبان فعلی برمی‌گرداند
const tr = (field, lang) => {
  if (field && typeof field === "object") return field[lang] || field.fa || field.en || "";
  return field || "";
};
const fmtNum = (n, lang) => new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US").format(n);
const fmtPrice = (n, lang) => (lang === "fa" ? `${fmtNum(n, lang)} تومان` : `${fmtNum(n, lang)} Toman`);
const fmtDate = (d, lang) => new Date(d).toLocaleDateString(lang === "fa" ? "fa-IR" : "en-US");
const fmtDateTime = (d, lang) => new Date(d).toLocaleString(lang === "fa" ? "fa-IR" : "en-US");

const PATTERNS = ["circuit", "hex", "scan", "dots", "grid", "wave"];
const patternStyle = (pattern) => {
  switch (pattern) {
    case "circuit": return { backgroundImage: "linear-gradient(115deg, rgba(220,38,38,0.35) 0%, transparent 40%), repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 1px, transparent 1px, transparent 22px), repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 1px, transparent 1px, transparent 22px)", backgroundColor: "#0a0a0a" };
    case "hex": return { backgroundImage: "radial-gradient(circle at 20% 20%, rgba(220,38,38,0.45), transparent 45%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.10), transparent 40%)", backgroundColor: "#111111" };
    case "scan": return { backgroundImage: "repeating-linear-gradient(180deg, rgba(220,38,38,0.20) 0px, rgba(220,38,38,0.20) 2px, transparent 2px, transparent 10px)", backgroundColor: "#0d0d0d" };
    case "dots": return { backgroundImage: "radial-gradient(rgba(255,255,255,0.16) 1.5px, transparent 1.5px)", backgroundSize: "14px 14px", backgroundColor: "#0a0a0a" };
    case "grid": return { backgroundImage: "linear-gradient(rgba(220,38,38,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.25) 1px, transparent 1px)", backgroundSize: "26px 26px", backgroundColor: "#0a0a0a" };
    default: return { backgroundImage: "repeating-linear-gradient(45deg, rgba(220,38,38,0.22) 0px, rgba(220,38,38,0.22) 2px, transparent 2px, transparent 16px)", backgroundColor: "#0a0a0a" };
  }
};

const ICONS = { Monitor, Cpu, Gamepad2, Wrench, ShieldCheck, Zap, Clock, Package, Layers, Truck, BadgeCheck };
const ICON_NAMES = Object.keys(ICONS);

const ROLE_LABELS = {
  admin: { fa: "مدیر", en: "Admin" },
  editor: { fa: "ویرایشگر", en: "Editor" },
  author: { fa: "نویسنده", en: "Author" },
  subscriber: { fa: "مشترک", en: "Subscriber" },
};
const ROLE_ORDER = ["subscriber", "author", "editor", "admin"];

/* ============================== فرهنگ لغت رابط کاربری ============================== */

const UI = {
  loginRegister: { fa: "ورود / ثبت‌نام", en: "Login / Register" },
  myAccount: { fa: "حساب من", en: "My Account" },
  adminPanel: { fa: "پنل مدیریت", en: "Admin Panel" },
  logout: { fa: "خروج", en: "Logout" },
  cart: { fa: "سبد خرید", en: "Cart" },
  cartEmpty: { fa: "سبد خرید شما خالی است", en: "Your cart is empty" },
  add: { fa: "افزودن", en: "Add" },
  addToCart: { fa: "افزودن به سبد", en: "Add to Cart" },
  total: { fa: "جمع کل", en: "Total" },
  checkout: { fa: "تسویه حساب", en: "Checkout" },
  everythingAtGlance: { fa: "همه‌چیز در یک نگاه", en: "Everything at a Glance" },
  whichSectionHome: { fa: "به کدوم بخش نیاز داری؟", en: "Where do you want to go?" },
  trustAuthenticity: { fa: "اصالت کالا تضمینی", en: "Guaranteed Authenticity" },
  trustWarranty: { fa: "گارانتی معتبر", en: "Valid Warranty" },
  trustShipping: { fa: "ارسال سریع سراسری", en: "Fast Nationwide Shipping" },
  trustReturn: { fa: "۷ روز مهلت بازگشت", en: "7-Day Return Policy" },
  ourServices: { fa: "خدمات ما", en: "Our Services" },
  servicesTitle: { fa: "تعمیر، اورهال و سرویس تخصصی", en: "Repair, Overhaul & Specialized Service" },
  servicesSubtitle: { fa: "تیم فنی نوین پلی‌تکنیک با ابزار تشخیص پیشرفته، مشکل شما را دقیق پیدا و مطمئن رفع می‌کند.", en: "Our technical team uses advanced diagnostic tools to pinpoint your issue and fix it right the first time." },
  originalShop: { fa: "فروشگاه اورجینال", en: "Genuine Products Shop" },
  shopTitle: { fa: "ویدئو پروژکتور", en: "Video Projectors" },
  shopSubtitle: { fa: "واردات مستقیم و مرجع فروش معتبرترین برندهای ویدئو پروژکتور با گارانتی معتبر", en: "Direct import and trusted retailer of the top projector brands, all backed by valid warranty" },
  searchPlaceholder: { fa: "جستجوی مدل یا برند...", en: "Search model or brand..." },
  filters: { fa: "فیلترها", en: "Filters" },
  category: { fa: "دسته‌بندی", en: "Category" },
  brand: { fa: "برند", en: "Brand" },
  allCategory: { fa: "همه", en: "All" },
  productsFound: { fa: "محصول یافت شد", en: "products found" },
  noProductsFound: { fa: "محصولی با این فیلتر پیدا نشد.", en: "No products match this filter." },
  backToShop: { fa: "بازگشت به فروشگاه", en: "Back to Shop" },
  warranty: { fa: "گارانتی", en: "Warranty" },
  technology: { fa: "تکنولوژی", en: "Technology" },
  resolution: { fa: "رزولوشن", en: "Resolution" },
  brightness: { fa: "روشنایی", en: "Brightness" },
  stock: { fa: "موجودی", en: "Stock" },
  units: { fa: "عدد", en: "units" },
  outOfStock: { fa: "ناموجود", en: "Out of stock" },
  relatedProducts: { fa: "محصولات مرتبط", en: "Related Products" },
  aboutUs: { fa: "درباره ما", en: "About Us" },
  whyNovin: { fa: "چرا نوین پلی‌تکنیک؟", en: "Why Novin Polytechnic?" },
  contactUs: { fa: "تماس با ما", en: "Contact Us" },
  contactUsNow: { fa: "همین حالا با ما در ارتباط باشید", en: "Get in Touch Right Now" },
  phoneCall: { fa: "تماس تلفنی", en: "Phone" },
  address: { fa: "آدرس", en: "Address" },
  yourName: { fa: "نام شما", en: "Your Name" },
  yourPhone: { fa: "شماره تماس", en: "Your Phone" },
  yourMessage: { fa: "پیام شما", en: "Your Message" },
  sendMessage: { fa: "ارسال پیام", en: "Send Message" },
  messageSent: { fa: "پیام شما ارسال شد، به‌زودی با شما تماس می‌گیریم.", en: "Your message has been sent — we'll contact you soon." },
  signInFirst: { fa: "برای مشاهده این صفحه ابتدا وارد شوید.", en: "Please sign in to view this page." },
  myOrders: { fa: "سفارش‌های من", en: "My Orders" },
  loading: { fa: "در حال بارگذاری...", en: "Loading..." },
  noOrdersYet: { fa: "هنوز سفارشی ثبت نکرده‌اید.", en: "You haven't placed any orders yet." },
  goToShop: { fa: "رفتن به فروشگاه", en: "Go to Shop" },
  itemsCount: { fa: "قلم کالا", en: "items" },
  blogTitle: { fa: "وبلاگ نوین پلی‌تکنیک", en: "Novin Polytechnic Blog" },
  articlesTitle: { fa: "مقالات آموزشی", en: "Learning Articles" },
  articlesSubtitle: { fa: "نکات نگهداری، راهنمای خرید و آموزش‌های تخصصی کامپیوتر، پلی‌استیشن و پروژکتور", en: "Maintenance tips, buying guides, and expert know-how on computers, PlayStation, and projectors" },
  noArticlesYet: { fa: "هنوز مقاله‌ای منتشر نشده است.", en: "No articles published yet." },
  readMore: { fa: "ادامه مطلب", en: "Read More" },
  support: { fa: "پشتیبانی", en: "Support" },
  faqTitle: { fa: "سوالات متداول", en: "Frequently Asked Questions" },
  faqSubtitle: { fa: "پاسخ سوالات پرتکرار درباره‌ی خدمات تعمیر و خرید از فروشگاه", en: "Answers to the questions we hear most often about repairs and shopping with us" },
  noFaqYet: { fa: "فعلاً سوالی ثبت نشده است.", en: "No questions added yet." },
  contactInfo: { fa: "اطلاعات تماس", en: "Contact Info" },
  finalizeOrder: { fa: "نهایی‌سازی خرید", en: "Finalize Order" },
  enterShippingInfo: { fa: "اطلاعات ارسال را وارد کنید", en: "Enter your shipping details" },
  fullName: { fa: "نام و نام خانوادگی", en: "Full Name" },
  mobileNumber: { fa: "شماره موبایل", en: "Mobile Number" },
  exactAddress: { fa: "آدرس دقیق", en: "Exact Address" },
  payableAmount: { fa: "مبلغ قابل پرداخت", en: "Amount Due" },
  connectingToGateway: { fa: "در حال اتصال به درگاه...", en: "Connecting to payment gateway..." },
  payOnline: { fa: "پرداخت آنلاین", en: "Pay Online" },
  payWith: { fa: "پرداخت با", en: "Pay with" },
  gatewaySimNote: { fa: "این بخش شبیه‌سازی درگاه پرداخت است؛ مدیر سایت هنوز اطلاعات درگاه واقعی را در پنل وارد نکرده است.", en: "This is a simulated payment gateway; the site admin hasn't configured a real gateway yet." },
  gatewayRealNote: { fa: "پرداخت شما از طریق درگاه بانکی معتبر انجام می‌شود.", en: "Your payment will be processed through a secure bank gateway." },
  orderPlaced: { fa: "سفارش شما ثبت شد!", en: "Your order has been placed!" },
  orderPlacedDesc: { fa: "همکاران ما به‌زودی برای هماهنگی ارسال با شما تماس می‌گیرند.", en: "Our team will contact you soon to arrange delivery." },
  gotIt: { fa: "متوجه شدم", en: "Got it" },
  signInToAccount: { fa: "ورود به حساب کاربری", en: "Sign In to Your Account" },
  registerNewUser: { fa: "ثبت‌نام کاربر جدید", en: "Create a New Account" },
  username: { fa: "نام کاربری", en: "Username" },
  password: { fa: "رمز عبور", en: "Password" },
  checking: { fa: "در حال بررسی...", en: "Checking..." },
  signIn: { fa: "ورود", en: "Sign In" },
  createAccount: { fa: "ثبت‌نام", en: "Register" },
  pageNotFound: { fa: "صفحه یافت نشد.", en: "Page not found." },
  productNotFound: { fa: "محصول یافت نشد.", en: "Product not found." },
  backToHome: { fa: "بازگشت به خانه", en: "Back to Home" },
  viewSite: { fa: "مشاهده سایت", en: "View Site" },
  savingDots: { fa: "در حال ذخیره...", en: "Saving..." },
  loadingSite: { fa: "در حال بارگذاری نوین پلی‌تکنیک...", en: "Loading Novin Polytechnic..." },
  heroFragment1: { fa: "دقیق دیده می‌شود", en: "Seen with precision" },
  heroFragment2: { fa: "دقیق تعمیر می‌شود", en: "Repaired with precision" },
  galleryKicker: { fa: "دسته‌بندی خدمات", en: "SERVICE CATEGORIES" },
  feedKicker: { fa: "همین حالا در نوین پلی‌تکنیک", en: "RIGHT NOW AT NOVIN POLYTECHNIC" },
  feedTitle: { fa: "چه خبر است؟", en: "What's Happening" },
};
const ui = (key, lang) => UI[key]?.[lang] || UI[key]?.fa || key;

const ADMIN_UI = {
  dashboard: { fa: "داشبورد", en: "Dashboard" },
  pages: { fa: "صفحات", en: "Pages" },
  hero: { fa: "بخش هیرو", en: "Hero Section" },
  services: { fa: "خدمات", en: "Services" },
  products: { fa: "محصولات", en: "Products" },
  menu: { fa: "منو", en: "Menu" },
  footer: { fa: "فوتر", en: "Footer" },
  about: { fa: "درباره ما", en: "About Us" },
  pageImages: { fa: "تصاویر بخش‌ها", en: "Section Images" },
  faq: { fa: "سوالات رایج", en: "FAQ" },
  orders: { fa: "سفارشات", en: "Orders" },
  messages: { fa: "پیام‌ها", en: "Messages" },
  reviews: { fa: "نظرات", en: "Reviews" },
  tickets: { fa: "تیکت‌ها", en: "Tickets" },
  notifications: { fa: "اعلان‌ها", en: "Notifications" },
  users: { fa: "کاربران", en: "Users" },
  payment: { fa: "درگاه پرداخت", en: "Payment Gateway" },
  settings: { fa: "تنظیمات", en: "Settings" },
  welcome: { fa: "خوش آمدید", en: "Welcome" },
  yourRole: { fa: "نقش شما", en: "Your role" },
  addService: { fa: "افزودن خدمت", en: "Add Service" },
  addProduct: { fa: "افزودن محصول", en: "Add Product" },
  newPage: { fa: "صفحه جدید", en: "New Page" },
  save: { fa: "ذخیره", en: "Save" },
  saveSettings: { fa: "ذخیره تنظیمات", en: "Save Settings" },
  savePage: { fa: "ذخیره صفحه", en: "Save Page" },
  cancel: { fa: "انصراف", en: "Cancel" },
  edit: { fa: "ویرایش", en: "Edit" },
  delete: { fa: "حذف", en: "Delete" },
  newQuestion: { fa: "سوال جدید", en: "New Question" },
  newColumn: { fa: "ستون جدید", en: "New Column" },
  newLink: { fa: "لینک جدید", en: "New Link" },
  faPersian: { fa: "فارسی", en: "Persian" },
  enEnglish: { fa: "انگلیسی", en: "English" },
  title: { fa: "عنوان", en: "Title" },
  description: { fa: "توضیحات", en: "Description" },
  icon: { fa: "آیکون", en: "Icon" },
  bgImage: { fa: "تصویر زمینه", en: "Background Image" },
  saved: { fa: "ذخیره شد", en: "Saved" },
  loadFailed: { fa: "ذخیره ناموفق بود", en: "Save failed" },
};
const aui = (key, lang) => ADMIN_UI[key]?.[lang] || ADMIN_UI[key]?.fa || key;

const DEFAULT_CONTENT = {
  settings: { siteName: { fa: "نوین پلی‌تکنیک", en: "Novin Polytechnic" }, tagline: { fa: "", en: "" }, phone: "", address: { fa: "", en: "" }, instagram: "", telegram: "" },
  hero: { eyebrow: { fa: "", en: "" }, title: { fa: "نوین پلی‌تکنیک", en: "Novin Polytechnic" }, subtitle: { fa: "", en: "" }, ctaText: { fa: "", en: "" }, ctaText2: { fa: "", en: "" } },
  services: [],
  products: [],
  menu: [],
  footer: { about: { fa: "", en: "" }, columns: [], copyright: { fa: "", en: "" } },
  about: { content: { fa: "", en: "" }, stats: [] },
  faq: [],
  pageHeaders: { services: {}, shop: {}, about: {}, contact: {}, faq: {}, articles: {} },
};

/* ============================== ابزارهای کمکی ============================== */

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}
function Reveal({ children, className = "", delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
function PatternBox({ pattern, image, className = "", children }) {
  if (image) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img src={resolveImageUrl(image)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        {children}
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden ${className}`} style={patternStyle(pattern)}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      {children}
    </div>
  );
}
function IconBadge({ name, className = "" }) {
  const Ico = ICONS[name] || Monitor;
  return <Ico className={className} />;
}
function TiltCard({ children, className = "" }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg)"; };
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={className} style={{ transition: "transform 0.2s ease-out", transformStyle: "preserve-3d" }}>{children}</div>;
}
function Logo({ size = 44, dark = false, name = "Novin Polytechnic" }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
        <polygon points="50,3 93,26 93,74 50,97 7,74 7,26" fill={dark ? "#0a0a0a" : "#ffffff"} stroke="#dc2626" strokeWidth="3" />
        <polygon points="50,15 82,32 82,68 50,85 18,68 18,32" fill="none" stroke={dark ? "#ffffff" : "#0a0a0a"} strokeWidth="1" opacity="0.15" />
        <text x="50" y="62" textAnchor="middle" fontSize="34" fontWeight="900" fill={dark ? "#ffffff" : "#0a0a0a"} fontFamily="Arial, sans-serif">NP</text>
        <rect x="18" y="68" width="64" height="3" fill="#dc2626" />
      </svg>
      <div className="leading-tight">
        <div className={`font-black text-lg tracking-tight ${dark ? "text-white" : "text-black"}`}>{name}</div>
        <div className="text-[10px] tracking-widest text-red-600">TECH & PROJECTOR</div>
      </div>
    </div>
  );
}

/* ============================== پوستر انیمیشنی هیرو ============================== */

function HeroPoster({ stats, lang }) {
  const s1 = stats?.[2]; // "۹۸٪ رضایت مشتری"
  const s2 = stats?.[1]; // "+۵۰۰۰ تعمیر موفق"
  return (
    <div className="relative mx-auto w-full max-w-lg aspect-[4/3] select-none">
      <div className="absolute inset-0 bg-red-50 rounded-[3rem] blur-2xl scale-90 opacity-70" />
      <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full drop-shadow-2xl">
        <defs>
          <linearGradient id="beamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <polygon points="60,178 255,92 255,148 60,222" fill="url(#beamGrad)" className="poster-beam" />
        <rect x="252" y="66" width="120" height="88" rx="12" fill="#0a0a0a" />
        <rect x="261" y="75" width="102" height="70" rx="5" fill="#dc2626" opacity="0.18" className="poster-screen-glow" />
        <rect x="10" y="160" width="88" height="56" rx="14" fill="#0a0a0a" />
        <circle cx="30" cy="188" r="13" fill="#dc2626" className="poster-lens" />
        <rect x="48" y="180" width="36" height="16" rx="4" fill="#ffffff" opacity="0.12" />
        <rect x="10" y="160" width="88" height="6" rx="3" fill="#dc2626" opacity="0.6" />
      </svg>

      <div className="absolute -top-4 right-2 sm:right-8 bg-white border border-black/10 shadow-xl rounded-2xl px-4 py-3 poster-float-1 flex items-center gap-2.5 max-w-[170px]">
        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0"><ShieldCheck className="text-red-600" size={16} /></div>
        <div>
          <p className="font-black text-sm leading-none">{s1 ? tr(s1.value, lang) : "98%"}</p>
          <p className="text-[10px] text-black/50 mt-0.5">{s1 ? tr(s1.label, lang) : (lang === "fa" ? "رضایت مشتری" : "Satisfaction")}</p>
        </div>
      </div>

      <div className="absolute bottom-2 left-0 sm:-left-4 bg-black border border-white/10 shadow-xl rounded-2xl px-4 py-3 poster-float-2 flex items-center gap-2.5 max-w-[170px]">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Wrench className="text-red-500" size={16} /></div>
        <div>
          <p className="font-black text-sm leading-none text-white">{s2 ? tr(s2.value, lang) : "5,000+"}</p>
          <p className="text-[10px] text-white/50 mt-0.5">{s2 ? tr(s2.label, lang) : (lang === "fa" ? "تعمیر موفق" : "Repairs Done")}</p>
        </div>
      </div>

      <div className="absolute top-[40%] left-[24%] bg-white border border-black/10 shadow-lg rounded-2xl p-2.5 poster-float-3">
        <Gamepad2 className="text-red-600" size={18} />
      </div>
    </div>
  );
}

/* ============================== روتینگ ساده با هش ============================== */

function parseHash() {
  const h = window.location.hash.replace(/^#\/?/, "");
  return h.split("/").filter(Boolean);
}
function navigate(path) {
  window.location.hash = path;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function useHashRoute() {
  const [route, setRoute] = useState(parseHash());
  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

/* ============================== اپلیکیشن اصلی ============================== */

function FloatingContact({ content, lang }) {
  const [open, setOpen] = useState(false);
  const s = content.settings;
  return (
    <div className="fixed bottom-5 left-5 z-30 flex flex-col items-start gap-3">
      {open && (
        <div className="flex flex-col gap-2 bg-white border border-black/10 rounded-2xl shadow-xl p-2 mb-1">
          <a href={`tel:${s.phone}`} className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl hover:bg-neutral-50 text-black/80"><Phone size={16} className="text-red-600" /> {lang === "fa" ? "تماس تلفنی" : "Call Us"}</a>
          <a href={`https://t.me/${s.telegram}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl hover:bg-neutral-50 text-black/80"><Send size={16} className="text-red-600" /> Telegram</a>
          <a href={`https://instagram.com/${s.instagram}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl hover:bg-neutral-50 text-black/80"><Instagram size={16} className="text-red-600" /> Instagram</a>
        </div>
      )}
      <button onClick={() => setOpen((v) => !v)} className="glow-pulse w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105">
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}

export default function NovinPolytechnic() {
  const [content, setContent] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const route = useHashRoute();

  const [lang, setLang] = useState(() => localStorage.getItem("novin_lang") || "fa");
  useEffect(() => { localStorage.setItem("novin_lang", lang); }, [lang]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({ enabled: false, provider: null });

  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState("dashboard");

  const refreshPages = useCallback(async () => {
    try { const { pages: list } = await api.getPagesPublic(); setPages(list); } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getContent();
        setContent(data);
      } catch (e) {
        setLoadError(lang === "fa" ? "اتصال به سرور برقرار نشد. سایت با محتوای پیش‌فرض نمایش داده می‌شود." : "Could not connect to the server. Showing default content.");
        setContent(DEFAULT_CONTENT);
      }
      await refreshPages();
      try { const st = await api.getPaymentStatus(); setPaymentStatus(st); } catch (e) { /* ignore */ }
      if (api.getToken()) {
        try { const { user } = await api.me(); setCurrentUser(user); } catch (e) { api.setToken(null); }
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshPages]);

  const persist = useCallback(async (next) => {
    setContent(next);
    setSaving(true);
    try { await api.updateContent(next); } catch (e) { setLoadError("Save failed: " + e.message); }
    setSaving(false);
  }, []);

  const update = (path, value) => {
    setContent((prev) => {
      const next = structuredClone(prev);
      let obj = next;
      for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
      obj[path[path.length - 1]] = value;
      persist(next);
      return next;
    });
  };

  const mergedMenu = useMemo(() => {
    if (!content) return [];
    const base = content.menu.filter((m) => m.visible).map((m) => ({ ...m }));
    const pageItems = pages.filter((p) => p.showInMenu).map((p) => ({ id: p.id, label: p.title, type: "page", target: p.id, visible: true, order: p.order }));
    return [...base, ...pageItems].sort((a, b) => a.order - b.order);
  }, [content, pages]);

  if (loading || !content) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir={lang === "fa" ? "rtl" : "ltr"}>
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-red-100" />
            <div className="absolute inset-0 rounded-full border-2 border-t-red-600 animate-spin" />
          </div>
          <div className="text-black/50 text-sm tracking-widest">{ui("loadingSite", lang)}</div>
        </div>
      </div>
    );
  }

  const goTo = (item) => {
    setMobileMenuOpen(false);
    if (item.type === "page") navigate(`page/${item.target}`);
    else navigate(item.target === "home" ? "" : item.target);
  };
  const goToUrl = (url) => {
    if (url.startsWith("page:")) navigate(`page/${url.split(":")[1]}`);
    else navigate(url === "home" ? "" : url);
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...product, qty: 1 }];
    });
    setShowCart(true);
  };
  const changeQty = (id, delta) => setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)).filter((i) => i.qty > 0));
  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const doLogin = async (username, password) => {
    try {
      const { token, user } = await api.login(username, password);
      api.setToken(token); setCurrentUser(user); setShowAuth(false);
      return null;
    } catch (e) { return e.message; }
  };
  const doRegister = async (username, password, name) => {
    try {
      const { token, user } = await api.register(username, password, name);
      api.setToken(token); setCurrentUser(user); setShowAuth(false);
      return null;
    } catch (e) { return e.message; }
  };
  const doLogout = () => { api.setToken(null); setCurrentUser(null); setUserMenuOpen(false); setShowAdmin(false); };

  const placeOrder = async (form) => {
    try {
      await api.createOrder({ orderType: "shop", items: cart, total: cartTotal, customer: form });
      setOrderDone(true); setCart([]);
    } catch (e) { alert("Order failed: " + e.message); }
  };
  const placeServiceRequest = async (form) => {
    await api.createOrder({
      orderType: "service",
      customer: { name: form.name, phone: form.phone, email: form.email },
      deviceInfo: form.deviceInfo,
      issueDescription: form.issueDescription,
    });
  };
  const sendMessage = async (form) => {
    try { await api.sendMessage(form); } catch (e) { /* handled inline in the form */ }
  };

  const role = currentUser?.role;
  const canPanel = ["admin", "editor", "author"].includes(role);
  const activePage = route[0] || "home";

  return (
    <div dir={lang === "fa" ? "rtl" : "ltr"} lang={lang} className="min-h-screen bg-white text-black font-sans" style={{ fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif" }}>
      <GlobalStyles />

      {loadError && (
        <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:left-4 sm:max-w-sm z-[70] bg-black text-white border border-red-700 rounded-xl p-3 text-xs flex items-start gap-2 shadow-xl">
          <span className="flex-1">{loadError}</span>
          <button onClick={() => setLoadError("")} className="text-white/50 hover:text-white shrink-0"><X size={14} /></button>
        </div>
      )}

      <Header
        content={content} visibleMenu={mergedMenu} goTo={goTo} activePage={activePage}
        mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}
        cartCount={cartCount} setShowCart={setShowCart}
        currentUser={currentUser} canPanel={canPanel}
        userMenuOpen={userMenuOpen} setUserMenuOpen={setUserMenuOpen}
        onAuthClick={() => setShowAuth(true)} onLogout={doLogout} onAdminClick={() => { setShowAdmin(true); setUserMenuOpen(false); }}
        onAccountClick={() => { navigate("account"); setUserMenuOpen(false); }}
        lang={lang} setLang={setLang}
      />

      <main key={route.join("/") + lang} className="page-fade">
        {activePage === "home" && <HomePage content={content} navigate={navigate} lang={lang} />}
        {activePage === "services" && <ServicesPage content={content} lang={lang} onRequestService={placeServiceRequest} />}
        {activePage === "shop" && <ShopPage content={content} addToCart={addToCart} lang={lang} />}
        {activePage === "articles" && <ArticlesPage pages={pages} content={content} lang={lang} />}
        {activePage === "faq" && <FAQPage content={content} lang={lang} />}
        {activePage === "about" && <AboutPage content={content} lang={lang} />}
        {activePage === "contact" && <ContactPage content={content} onSend={sendMessage} lang={lang} />}
        {activePage === "account" && <AccountPage currentUser={currentUser} onGoShop={() => navigate("shop")} lang={lang} />}
        {activePage === "product" && <ProductDetailPage content={content} id={route[1]} addToCart={addToCart} lang={lang} currentUser={currentUser} onNeedAuth={() => setShowAuth(true)} />}
        {activePage === "page" && <CustomPageView page={pages.find((p) => p.id === route[1])} lang={lang} />}
      </main>

      <ReviewsStrip lang={lang} />
      <Footer content={content} goToUrl={goToUrl} lang={lang} />
      <FloatingContact content={content} lang={lang} />

      {showCart && <CartDrawer cart={cart} total={cartTotal} onClose={() => setShowCart(false)} onChangeQty={changeQty} onRemove={removeFromCart} onCheckout={() => { setShowCart(false); setShowCheckout(true); }} lang={lang} />}
      {showCheckout && <CheckoutModal total={cartTotal} orderDone={orderDone} onClose={() => { setShowCheckout(false); setOrderDone(false); }} onSubmit={placeOrder} currentUser={currentUser} paymentStatus={paymentStatus} lang={lang} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={doLogin} onRegister={doRegister} lang={lang} />}

      {canPanel && showAdmin && (
        <AdminPanel
          content={content} update={update} saving={saving} role={role} currentUser={currentUser}
          onClose={() => setShowAdmin(false)} onLogout={doLogout} tab={adminTab} setTab={setAdminTab}
          refreshPages={refreshPages} lang={lang}
        />
      )}
    </div>
  );
}

/* ============================== استایل سراسری ============================== */

function GlobalStyles() {
  return (
    <style>{`
      @keyframes floatBlob { 0%,100% { transform: translate(0,0) scale(1);} 50% { transform: translate(24px,-30px) scale(1.08);} }
      .blob { animation: floatBlob 9s ease-in-out infinite; }
      @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0px rgba(220,38,38,0.35);} 50% { box-shadow: 0 0 22px rgba(220,38,38,0.45);} }
      .glow-pulse { animation: pulseGlow 2.4s ease-in-out infinite; }
      @keyframes pageFade { from { opacity:0; transform: translateY(10px);} to { opacity:1; transform: translateY(0);} }
      .page-fade { animation: pageFade 0.4s ease-out; }
      @keyframes posterFlicker { 0%,100%{opacity:.6;} 45%{opacity:.4;} 55%{opacity:.9;} }
      .poster-beam { animation: posterFlicker 4s ease-in-out infinite; transform-origin: right center; }
      @keyframes posterGlow { 0%,100%{opacity:.14;} 50%{opacity:.3;} }
      .poster-screen-glow { animation: posterGlow 2.6s ease-in-out infinite; }
      @keyframes posterLens { 0%,100%{opacity:1;} 50%{opacity:.55;} }
      .poster-lens { animation: posterLens 1.8s ease-in-out infinite; }
      @keyframes floatUD1 { 0%,100%{ transform: translateY(0);} 50%{ transform: translateY(-10px);} }
      @keyframes floatUD2 { 0%,100%{ transform: translateY(0);} 50%{ transform: translateY(10px);} }
      @keyframes floatUD3 { 0%,100%{ transform: translateY(0) translateX(0);} 50%{ transform: translateY(-6px) translateX(6px);} }
      .poster-float-1 { animation: floatUD1 3.4s ease-in-out infinite; }
      .poster-float-2 { animation: floatUD2 4s ease-in-out infinite; }
      .poster-float-3 { animation: floatUD3 3.1s ease-in-out infinite; }
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #f4f4f4; }
      ::-webkit-scrollbar-thumb { background: #dc2626; border-radius: 8px; }
      @keyframes marqueeScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      .marquee-track { animation: marqueeScroll 22s linear infinite; }
      @keyframes fadeSlide { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .feed-row { animation: fadeSlide 0.5s ease-out both; }
    `}</style>
  );
}

/* ============================== هدر ============================== */

function Header({ content, visibleMenu, goTo, activePage, mobileMenuOpen, setMobileMenuOpen, cartCount, setShowCart, currentUser, canPanel, userMenuOpen, setUserMenuOpen, onAuthClick, onLogout, onAdminClick, onAccountClick, lang, setLang }) {
  const siteName = tr(content.settings.siteName, lang) || "Novin Polytechnic";
  return (
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-white/90 border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <button onClick={() => navigate("")}><Logo name={siteName} /></button>
        <nav className="hidden lg:flex items-center gap-7">
          {visibleMenu.map((m) => (
            <button key={m.id} onClick={() => goTo(m)} className={`relative text-sm transition-colors group ${activePage === m.target || (m.type === "page" && activePage === "page") ? "text-red-600" : "text-black/70 hover:text-black"}`}>
              {tr(m.label, lang)}
              <span className={`absolute -bottom-1 right-0 h-[2px] bg-red-600 transition-all duration-300 ${activePage === m.target ? "w-full" : "w-0 group-hover:w-full"}`} />
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <button onClick={() => setLang(lang === "fa" ? "en" : "fa")} className="flex items-center gap-1.5 text-xs px-2.5 py-2 rounded-lg border border-black/15 hover:border-red-600 transition-colors font-bold">
            <Globe size={14} /> {lang === "fa" ? "EN" : "فا"}
          </button>
          <button onClick={() => setShowCart(true)} className="relative p-2 rounded-lg border border-black/15 hover:border-red-600 hover:bg-red-50 transition-colors">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="absolute -top-2 -left-2 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
          </button>

          {!currentUser ? (
            <button onClick={onAuthClick} className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors font-bold">
              <User size={14} /> {ui("loginRegister", lang)}
            </button>
          ) : (
            <div className="relative hidden sm:block">
              <button onClick={() => setUserMenuOpen((v) => !v)} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-black/15 hover:border-red-600 transition-colors font-bold">
                <User size={14} /> {currentUser.name}
                {canPanel && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-600">{tr(ROLE_LABELS[currentUser.role], lang)}</span>}
              </button>
              {userMenuOpen && (
                <div className="absolute left-0 mt-2 w-44 bg-white border border-black/10 rounded-xl overflow-hidden shadow-xl">
                  <button onClick={onAccountClick} className="w-full text-right px-4 py-2.5 text-xs hover:bg-neutral-50 flex items-center gap-2"><User size={13} /> {ui("myAccount", lang)}</button>
                  {canPanel && <button onClick={onAdminClick} className="w-full text-right px-4 py-2.5 text-xs hover:bg-neutral-50 flex items-center gap-2 text-red-600"><Settings size={13} /> {ui("adminPanel", lang)}</button>}
                  <button onClick={onLogout} className="w-full text-right px-4 py-2.5 text-xs hover:bg-neutral-50 flex items-center gap-2 text-black/60"><LogOut size={13} /> {ui("logout", lang)}</button>
                </div>
              )}
            </div>
          )}
          <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen((v) => !v)}>{mobileMenuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-black/10 bg-white px-4 py-4 flex flex-col gap-3">
          {visibleMenu.map((m) => <button key={m.id} onClick={() => goTo(m)} className="text-right text-black/70 hover:text-red-600 py-1">{tr(m.label, lang)}</button>)}
          <button onClick={() => setLang(lang === "fa" ? "en" : "fa")} className="text-right text-black/70 py-1 flex items-center gap-1.5"><Globe size={14} /> {lang === "fa" ? "English" : "فارسی"}</button>
          {!currentUser ? (
            <button onClick={onAuthClick} className="text-right text-red-600 font-bold py-1">{ui("loginRegister", lang)}</button>
          ) : (
            <>
              <button onClick={onAccountClick} className="text-right text-black/70 py-1">{ui("myAccount", lang)} ({currentUser.name})</button>
              {canPanel && <button onClick={onAdminClick} className="text-right py-1 font-bold text-red-600">{ui("adminPanel", lang)}</button>}
              <button onClick={onLogout} className="text-right text-black/60 py-1">{ui("logout", lang)}</button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

/* ============================== صفحه خانه ============================== */

function TrustBar({ lang }) {
  const items = [
    { icon: BadgeCheck, key: "trustAuthenticity" },
    { icon: ShieldCheck, key: "trustWarranty" },
    { icon: Truck, key: "trustShipping" },
    { icon: RotateCcw, key: "trustReturn" },
  ];
  return (
    <div className="border-y border-black/10 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2.5 text-black/70 text-xs sm:text-sm">
            <it.icon size={18} className="shrink-0 text-red-600" />
            <span>{ui(it.key, lang)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const HOME_LINKS = [
  { icon: Wrench, key: "services", pattern: "circuit", title: { fa: "خدمات تعمیر و اورهال", en: "Repair & Overhaul Services" }, desc: { fa: "لیست کامل خدمات تعمیرگاه", en: "The full list of our repair services" }, route: "services" },
  { icon: Package, key: "shop", pattern: "hex", title: { fa: "فروشگاه پروژکتور", en: "Projector Shop" }, desc: { fa: "خرید اورجینال با گارانتی", en: "Genuine products with warranty" }, route: "shop" },
  { icon: FileText, key: "articles", pattern: "scan", title: { fa: "مقالات آموزشی", en: "Learning Articles" }, desc: { fa: "نکات نگهداری و راهنمای خرید", en: "Maintenance tips & buying guides" }, route: "articles" },
  { icon: MessageCircle, key: "faq", pattern: "dots", title: { fa: "سوالات رایج", en: "FAQ" }, desc: { fa: "پاسخ سوالات پرتکرار مشتریان", en: "Answers to common questions" }, route: "faq" },
  { icon: UsersIcon, key: "about", pattern: "grid", title: { fa: "درباره ما", en: "About Us" }, desc: { fa: "آشنایی با نوین پلی‌تکنیک", en: "Get to know Novin Polytechnic" }, route: "about" },
  { icon: Mail, key: "contact", pattern: "wave", title: { fa: "تماس با ما", en: "Contact Us" }, desc: { fa: "راه‌های ارتباطی و آدرس", en: "How to reach us" }, route: "contact" },
];

function BrandMarquee({ content, lang }) {
  const brands = Array.from(new Set(content.products.map((p) => p.brand)));
  if (brands.length === 0) return null;
  const loop = [...brands, ...brands];
  return (
    <div className="border-y border-black/10 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-8">
        <span className="text-[11px] text-black/40 tracking-widest shrink-0 whitespace-nowrap">{lang === "fa" ? "برندهای موجود در فروشگاه" : "BRANDS WE CARRY"}</span>
        <div className="relative overflow-hidden flex-1">
          <div className="flex items-center gap-10 marquee-track whitespace-nowrap">
            {loop.map((b, i) => <span key={i} className="text-black/30 font-black text-lg tracking-tight shrink-0">{b}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function TechGalleryCarousel({ content, lang }) {
  const items = content.services.slice(0, 6);
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % items.length), 3200);
    return () => clearInterval(t);
  }, [items.length]);
  if (items.length === 0) return null;
  const current = items[active];
  return (
    <section className="bg-[#111111] py-16 px-4 sm:px-6 border-b border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <span className="text-white/40 text-xs tracking-[0.3em] font-bold">{ui("galleryKicker", lang)}</span>
          <span className="text-white/30 text-sm font-mono">{String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
        </div>
        <div className="relative rounded-2xl overflow-hidden">
          <PatternBox pattern={current.pattern} image={current.image} className="h-72 sm:h-96 flex items-end">
            <div className="relative z-10 p-8">
              <IconBadge name={current.icon} className="text-white mb-4" size={36} />
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">{tr(current.title, lang)}</h3>
              <p className="text-white/60 max-w-md text-sm leading-relaxed">{tr(current.desc, lang)}</p>
            </div>
          </PatternBox>
        </div>
        <div className="flex items-center gap-2 mt-5">
          {items.map((it, i) => (
            <button key={it.id} onClick={() => setActive(i)} className={`h-1 rounded-full transition-all ${i === active ? "w-10 bg-red-600" : "w-4 bg-white/15"}`} aria-label={tr(it.title, lang)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveStatusFeed({ content, lang }) {
  const rows = [
    ...content.services.slice(0, 2).map((s) => ({ tag: lang === "fa" ? "خدمت" : "Service", title: tr(s.title, lang), desc: tr(s.desc, lang) })),
    ...content.products.slice(0, 2).map((p) => ({ tag: lang === "fa" ? "محصول" : "Product", title: tr(p.name, lang), desc: tr(p.desc, lang) })),
  ];
  if (rows.length === 0) return null;
  return (
    <section className="py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <Reveal className="mb-12">
          <span className="text-red-600 text-xs tracking-[0.3em] font-bold">{ui("feedKicker", lang)}</span>
          <h2 className="text-3xl sm:text-4xl font-black mt-3">{ui("feedTitle", lang)}</h2>
        </Reveal>
        <div className="divide-y divide-black/10 border-t border-b border-black/10">
          {rows.map((r, i) => (
            <Reveal key={i} delay={i * 70}>
              <div className="feed-row py-6 flex items-start gap-6" style={{ animationDelay: `${i * 100}ms` }}>
                <span className="font-mono text-black/25 text-sm shrink-0 pt-0.5">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[10px] tracking-widest font-bold text-red-600 border border-red-200 bg-red-50 rounded-full px-2.5 py-1 shrink-0 mt-0.5">{r.tag}</span>
                <div className="min-w-0">
                  <h4 className="font-bold mb-1">{r.title}</h4>
                  <p className="text-black/50 text-sm leading-relaxed line-clamp-2">{r.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomePage({ content, navigate, lang }) {
  const h = content.hero;
  return (
    <>
      <section className="relative pt-40 pb-24 px-4 sm:px-6 overflow-hidden bg-[#0b0b0c] text-white">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-900/30 rounded-full blur-3xl blob" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-red-950/40 rounded-full blur-3xl blob" style={{ animationDelay: "2s" }} />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-right">
            <Reveal>
              <span className="inline-flex items-center gap-2 text-xs tracking-widest border border-red-800/50 bg-red-950/40 text-red-400 rounded-full px-4 py-1.5 mb-8">
                <Zap size={14} /> {tr(h.eyebrow, lang)}
              </span>
            </Reveal>
            <Reveal delay={80}>
              <p className="text-2xl sm:text-3xl font-light text-white/50 leading-tight mb-1">{ui("heroFragment1", lang)}</p>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-3xl sm:text-4xl font-black text-white leading-tight mb-6">{ui("heroFragment2", lang)}</p>
            </Reveal>
            <Reveal delay={220}><h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-6 text-red-500">{tr(h.title, lang)}</h1></Reveal>
            <Reveal delay={280}><p className="text-white/50 text-lg max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">{tr(h.subtitle, lang)}</p></Reveal>
            <Reveal delay={340}>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <button onClick={() => navigate("services")} className="glow-pulse bg-red-600 hover:bg-red-700 text-white transition-all px-8 py-3.5 rounded-xl font-bold hover:scale-105">{tr(h.ctaText, lang)}</button>
                <button onClick={() => navigate("shop")} className="border border-white/20 hover:border-red-500 hover:text-red-500 transition-all px-8 py-3.5 rounded-xl font-bold hover:scale-105">{tr(h.ctaText2, lang)}</button>
              </div>
            </Reveal>
          </div>
          <Reveal delay={200}><HeroPoster stats={content.about.stats} lang={lang} /></Reveal>
        </div>
      </section>

      <TechGalleryCarousel content={content} lang={lang} />
      <BrandMarquee content={content} lang={lang} />
      <TrustBar lang={lang} />
      <LiveStatusFeed content={content} lang={lang} />

      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-red-600 text-xs tracking-[0.3em] font-bold">{ui("everythingAtGlance", lang)}</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-3">{ui("whichSectionHome", lang)}</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {HOME_LINKS.map((item, idx) => (
              <Reveal key={item.route} delay={idx * 60}>
                <button onClick={() => navigate(item.route)} className="group relative w-full text-right rounded-2xl overflow-hidden border border-black/10 hover:border-red-600 hover:shadow-xl transition-all duration-300 bg-white">
                  <PatternBox pattern={item.pattern} className="h-24 flex items-center justify-between px-5">
                    <item.icon className="text-white group-hover:scale-110 transition-transform duration-300" size={30} />
                    <span className="text-white/25 font-black text-3xl">{String(idx + 1).padStart(2, "0")}</span>
                  </PatternBox>
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold mb-1">{tr(item.title, lang)}</h3>
                      <p className="text-black/50 text-xs">{tr(item.desc, lang)}</p>
                    </div>
                    <ChevronLeft className="text-black/20 group-hover:text-red-600 group-hover:-translate-x-1 transition-all shrink-0" size={18} />
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ServiceCard({ s, lang }) {
  return (
    <TiltCard className="group relative rounded-2xl overflow-hidden border border-black/10 hover:border-red-600 hover:shadow-lg transition-all duration-300 h-full bg-white">
      <PatternBox pattern={s.pattern} image={s.image} className="h-28 flex items-center justify-center">
        <IconBadge name={s.icon} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-300" size={38} />
      </PatternBox>
      <div className="p-6">
        <h3 className="font-bold text-lg mb-2">{tr(s.title, lang)}</h3>
        <p className="text-black/60 text-sm leading-relaxed">{tr(s.desc, lang)}</p>
      </div>
    </TiltCard>
  );
}

/* ============================== صفحه خدمات ============================== */

function SectionIllustration({ variant }) {
  const common = { width: 120, height: 90, viewBox: "0 0 160 120", className: "mx-auto" };
  switch (variant) {
    case "services": return (
      <svg {...common}>
        <rect x="30" y="20" width="80" height="55" rx="6" fill="#0a0a0a" />
        <rect x="38" y="28" width="64" height="39" rx="2" fill="#dc2626" opacity="0.15" />
        <rect x="55" y="75" width="30" height="8" rx="2" fill="#0a0a0a" />
        <circle cx="120" cy="30" r="18" fill="#dc2626" opacity="0.12" />
        <path d="M112 22 l16 16 M128 22 l-16 16" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
    case "shop": return (
      <svg {...common}>
        <polygon points="20,70 85,35 85,55 20,88" fill="#dc2626" opacity="0.15" />
        <rect x="84" y="18" width="46" height="34" rx="5" fill="#0a0a0a" />
        <rect x="90" y="24" width="34" height="22" rx="2" fill="#dc2626" opacity="0.2" />
        <circle cx="30" cy="80" r="7" fill="#0a0a0a" />
      </svg>
    );
    case "about": return (
      <svg {...common}>
        <rect x="35" y="35" width="90" height="50" rx="4" fill="#0a0a0a" />
        <polygon points="35,35 80,12 125,35" fill="#dc2626" opacity="0.7" />
        <rect x="55" y="55" width="14" height="30" fill="#dc2626" opacity="0.2" />
        <rect x="90" y="55" width="14" height="30" fill="#dc2626" opacity="0.2" />
      </svg>
    );
    case "contact": return (
      <svg {...common}>
        <rect x="30" y="30" width="100" height="60" rx="6" fill="#0a0a0a" />
        <polygon points="30,32 80,68 130,32" fill="none" stroke="#dc2626" strokeWidth="3" opacity="0.6" />
      </svg>
    );
    case "faq": return (
      <svg {...common}>
        <circle cx="80" cy="55" r="38" fill="#0a0a0a" />
        <text x="80" y="72" textAnchor="middle" fontSize="42" fontWeight="900" fill="#dc2626" fontFamily="Arial">؟</text>
      </svg>
    );
    case "articles": return (
      <svg {...common}>
        <rect x="35" y="20" width="70" height="85" rx="4" fill="#0a0a0a" />
        <rect x="45" y="34" width="50" height="4" fill="#dc2626" opacity="0.6" />
        <rect x="45" y="46" width="50" height="4" fill="#ffffff" opacity="0.15" />
        <rect x="45" y="58" width="34" height="4" fill="#ffffff" opacity="0.15" />
        <rect x="95" y="45" width="30" height="40" rx="3" fill="#dc2626" opacity="0.15" />
      </svg>
    );
    default: return null;
  }
}

function PageHeader({ eyebrow, title, subtitle, image, variant }) {
  return (
    <section className="relative pt-32 pb-14 px-4 sm:px-6 border-b border-black/10 overflow-hidden bg-neutral-50">
      <div className="absolute -top-10 -right-10 w-72 h-72 bg-red-100 rounded-full blur-3xl blob" />
      <div className="relative max-w-4xl mx-auto text-center">
        {image ? (
          <div className="w-28 h-20 mx-auto mb-4 rounded-xl overflow-hidden"><img src={resolveImageUrl(image)} alt="" className="w-full h-full object-cover" /></div>
        ) : variant ? (
          <div className="mb-4"><SectionIllustration variant={variant} /></div>
        ) : null}
        <span className="text-red-600 text-xs tracking-[0.3em] font-bold">{eyebrow}</span>
        <h1 className="text-3xl sm:text-5xl font-black mt-3">{title}</h1>
        {subtitle && <p className="text-black/60 mt-4 max-w-xl mx-auto">{subtitle}</p>}
      </div>
    </section>
  );
}

function ServicesPage({ content, lang, onRequestService }) {
  const [showRequest, setShowRequest] = useState(false);
  return (
    <div>
      <PageHeader eyebrow={ui("ourServices", lang)} title={ui("servicesTitle", lang)} subtitle={ui("servicesSubtitle", lang)} image={content.pageHeaders?.services?.image} variant="services" />
      <section className="py-10 px-4 sm:px-6 text-center">
        <button onClick={() => setShowRequest(true)} className="glow-pulse bg-red-600 hover:bg-red-700 text-white transition-all px-8 py-3.5 rounded-xl font-bold inline-flex items-center gap-2">
          <Wrench size={16} /> {lang === "fa" ? "درخواست تعمیر" : "Request a Repair"}
        </button>
      </section>
      <section className="pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.services.map((s, idx) => <Reveal key={s.id} delay={idx * 70}><ServiceCard s={s} lang={lang} /></Reveal>)}
        </div>
      </section>
      <TrustBar lang={lang} />
      {showRequest && <ServiceRequestModal onClose={() => setShowRequest(false)} onSubmit={onRequestService} lang={lang} />}
    </div>
  );
}

function ServiceRequestModal({ onClose, onSubmit, lang }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", deviceInfo: "", issueDescription: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k, v) => setForm({ ...form, [k]: v });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await onSubmit(form); setDone(true); } catch (err) { alert(err.message); }
    setBusy(false);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white border border-black/10 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 left-4 text-black/40 hover:text-black"><X size={18} /></button>
        {done ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4"><Check className="text-red-600" size={28} /></div>
            <h3 className="text-xl font-black mb-2">{lang === "fa" ? "درخواست شما ثبت شد!" : "Your request has been submitted!"}</h3>
            <p className="text-black/50 text-sm">{lang === "fa" ? "به‌زودی برای هماهنگی با شما تماس می‌گیریم." : "We'll contact you soon to arrange the details."}</p>
            <button onClick={onClose} className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold">{ui("gotIt", lang)}</button>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2"><Wrench size={18} className="text-red-600" /> {lang === "fa" ? "درخواست تعمیر" : "Request a Repair"}</h3>
            <p className="text-black/40 text-xs mb-5">{lang === "fa" ? "دستگاه و مشکل رو توضیح بدید تا سریع باهاتون تماس بگیریم." : "Describe your device and the issue, and we'll get back to you quickly."}</p>
            <form onSubmit={submit} className="space-y-3">
              <input required placeholder={ui("fullName", lang)} className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" value={form.name} onChange={(e) => set("name", e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder={ui("mobileNumber", lang)} dir="ltr" className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                <input type="email" placeholder={lang === "fa" ? "ایمیل (اختیاری)" : "Email (optional)"} dir="ltr" className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <input required placeholder={lang === "fa" ? "نوع دستگاه (مثلاً لپ‌تاپ ایسوس / PS5)" : "Device (e.g. Asus laptop / PS5)"} className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" value={form.deviceInfo} onChange={(e) => set("deviceInfo", e.target.value)} />
              <textarea required rows={3} placeholder={lang === "fa" ? "توضیح مشکل" : "Describe the issue"} className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm resize-none" value={form.issueDescription} onChange={(e) => set("issueDescription", e.target.value)} />
              <button disabled={busy} className="w-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 transition-colors py-3 rounded-xl font-bold">{busy ? ui("checking", lang) : (lang === "fa" ? "ارسال درخواست" : "Submit Request")}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================== محیط فروشگاه ============================== */

function ProductCard({ p, onAdd, dark, lang }) {
  return (
    <TiltCard className={`group rounded-2xl overflow-hidden border transition-colors duration-300 h-full flex flex-col ${dark ? "border-white/10 hover:border-red-600 bg-neutral-900" : "border-black/10 hover:border-red-600 bg-white"}`}>
      <button onClick={() => navigate(`product/${p.id}`)} className="text-right">
        <PatternBox pattern={p.pattern} image={p.image} className="h-40 flex items-center justify-center">
          <IconBadge name={p.icon} className="text-white group-hover:scale-110 transition-transform duration-300" size={52} />
          <span className="absolute top-3 left-3 text-[10px] bg-white/90 text-red-600 rounded-full px-2 py-1 font-bold">{tr(p.warranty, lang)}</span>
          <span className="absolute top-3 right-3 text-[10px] bg-black/70 border border-red-500/50 rounded-full px-2 py-1 text-red-400">{tr(p.category, lang)}</span>
        </PatternBox>
      </button>
      <div className="p-5 flex flex-col flex-1">
        <div className={`flex items-center justify-between mb-1 text-[11px] ${dark ? "text-white/40" : "text-black/40"}`}>
          <span>{p.brand}</span><span>{p.resolution}</span>
        </div>
        <button onClick={() => navigate(`product/${p.id}`)} className="text-right"><h3 className={`font-bold mb-2 hover:text-red-600 transition-colors ${dark ? "text-white" : "text-black"}`}>{tr(p.name, lang)}</h3></button>
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className={`text-[10px] rounded-full px-2 py-0.5 ${dark ? "bg-white/5 border border-white/10 text-white/50" : "bg-black/5 border border-black/10 text-black/50"}`}>{p.technology}</span>
          <span className={`text-[10px] rounded-full px-2 py-0.5 ${dark ? "bg-white/5 border border-white/10 text-white/50" : "bg-black/5 border border-black/10 text-black/50"}`}>{fmtNum(p.lumens, lang)} {lang === "fa" ? "لومن" : "Lumens"}</span>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-red-600 font-black">{fmtPrice(p.price, lang)}</span>
          <button onClick={onAdd} className="text-xs bg-red-600 hover:bg-red-700 text-white transition-colors px-3 py-2 rounded-lg font-bold flex items-center gap-1"><Plus size={14} /> {ui("add", lang)}</button>
        </div>
      </div>
    </TiltCard>
  );
}

function ShopPage({ content, addToCart, lang }) {
  const products = content.products;
  const catMap = new Map();
  products.forEach((p) => catMap.set(p.category.fa, p.category));
  const categories = [{ fa: "همه", en: "All" }, ...Array.from(catMap.values())];
  const brands = Array.from(new Set(products.map((p) => p.brand)));
  const [activeCat, setActiveCat] = useState("همه");
  const [activeBrands, setActiveBrands] = useState([]);
  const [q, setQ] = useState("");

  const toggleBrand = (b) => setActiveBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  const filtered = products.filter((p) => {
    if (activeCat !== "همه" && p.category.fa !== activeCat) return false;
    if (activeBrands.length && !activeBrands.includes(p.brand)) return false;
    if (q && !(tr(p.name, lang) + p.brand).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-white min-h-screen">
      <section className="relative pt-36 pb-10 px-4 sm:px-6 overflow-hidden border-b border-black/10 bg-black">
        <div className="relative max-w-7xl mx-auto text-center">
          {content.pageHeaders?.shop?.image ? (
            <div className="w-32 h-24 mx-auto mb-4 rounded-xl overflow-hidden"><img src={resolveImageUrl(content.pageHeaders.shop.image)} alt="" className="w-full h-full object-cover" /></div>
          ) : (
            <div className="mb-4 opacity-90"><SectionIllustration variant="shop" /></div>
          )}
          <span className="text-xs tracking-[0.3em] font-bold text-red-500">{ui("originalShop", lang)}</span>
          <h1 className="text-3xl sm:text-5xl font-black mt-3 text-white">{ui("shopTitle", lang)}</h1>
          <p className="text-white/60 mt-3 max-w-xl mx-auto">{ui("shopSubtitle", lang)}</p>
          <div className="max-w-md mx-auto mt-6 relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={ui("searchPlaceholder", lang)} className="w-full bg-neutral-900 border border-white/15 focus:border-red-600 outline-none rounded-xl pr-9 pl-4 py-3 text-sm text-white" />
          </div>
        </div>
      </section>

      <TrustBar lang={lang} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-[240px_1fr] gap-8">
        <aside className="lg:sticky lg:top-24 h-fit bg-neutral-50 border border-black/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4 text-sm font-bold"><SlidersHorizontal size={15} className="text-red-600" /> {ui("filters", lang)}</div>
          <div className="mb-6">
            <p className="text-xs text-black/40 mb-2">{ui("category", lang)}</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button key={c.fa} onClick={() => setActiveCat(c.fa)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${activeCat === c.fa ? "bg-red-600 border-red-600 text-white" : "border-black/15 text-black/60 hover:border-red-600"}`}>{tr(c, lang)}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-black/40 mb-2">{ui("brand", lang)}</p>
            <div className="space-y-2">
              {brands.map((b) => (
                <label key={b} className="flex items-center gap-2 text-sm text-black/70 cursor-pointer">
                  <input type="checkbox" checked={activeBrands.includes(b)} onChange={() => toggleBrand(b)} className="accent-red-600" /> {b}
                </label>
              ))}
            </div>
          </div>
        </aside>
        <div>
          <p className="text-black/40 text-xs mb-4">{fmtNum(filtered.length, lang)} {ui("productsFound", lang)}</p>
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-black/40 text-sm">{ui("noProductsFound", lang)}</div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((p, idx) => <Reveal key={p.id} delay={Math.min(idx, 6) * 60}><ProductCard p={p} onAdd={() => addToCart(p)} lang={lang} /></Reveal>)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ProductDetailPage({ content, id, addToCart, lang, currentUser, onNeedAuth }) {
  const p = content.products.find((x) => x.id === id);
  if (!p) return <div className="pt-40 pb-24 text-center text-black/50">{ui("productNotFound", lang)}</div>;
  const related = content.products.filter((x) => x.id !== p.id && x.category.fa === p.category.fa).slice(0, 3);
  const specs = [
    [ui("brand", lang), p.brand], [ui("category", lang), tr(p.category, lang)], [ui("technology", lang), p.technology],
    [ui("resolution", lang), p.resolution], [ui("brightness", lang), `${fmtNum(p.lumens, lang)} ${lang === "fa" ? "لومن" : "Lumens"}`],
    [ui("warranty", lang), tr(p.warranty, lang)], [ui("stock", lang), p.stock > 0 ? `${fmtNum(p.stock, lang)} ${ui("units", lang)}` : ui("outOfStock", lang)],
  ];
  return (
    <div className="pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate("shop")} className="flex items-center gap-1.5 text-black/50 hover:text-red-600 text-sm mb-8"><ChevronRight size={16} /> {ui("backToShop", lang)}</button>
        <div className="grid md:grid-cols-2 gap-10">
          <PatternBox pattern={p.pattern} image={p.image} className="h-80 md:h-full min-h-[320px] rounded-2xl flex items-center justify-center">
            <IconBadge name={p.icon} size={110} className="text-white" />
          </PatternBox>
          <div>
            <div className="flex gap-2 mb-3">
              <span className="text-[11px] border border-red-200 bg-red-50 rounded-full px-2.5 py-1 text-red-600">{tr(p.warranty, lang)} {ui("warranty", lang)}</span>
              <span className="text-[11px] border border-black/15 rounded-full px-2.5 py-1 text-black/60">{tr(p.category, lang)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mb-3">{tr(p.name, lang)}</h1>
            <p className="text-black/60 leading-relaxed mb-6">{tr(p.desc, lang)}</p>
            <div className="border border-black/10 rounded-xl overflow-hidden mb-6">
              {specs.map(([k, v], i) => (
                <div key={k} className={`flex justify-between text-sm px-4 py-2.5 ${i % 2 ? "bg-neutral-50" : ""}`}><span className="text-black/40">{k}</span><span className="font-bold">{v}</span></div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-red-600">{fmtPrice(p.price, lang)}</span>
              <button onClick={() => addToCart(p)} className="glow-pulse bg-red-600 hover:bg-red-700 text-white transition-colors px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Plus size={16} /> {ui("addToCart", lang)}</button>
            </div>
          </div>
        </div>

        <ProductReviews productId={p.id} lang={lang} currentUser={currentUser} onNeedAuth={onNeedAuth} />

        {related.length > 0 && (
          <div className="mt-20">
            <h3 className="font-bold text-lg mb-6">{ui("relatedProducts", lang)}</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{related.map((r) => <ProductCard key={r.id} p={r} onAdd={() => addToCart(r)} lang={lang} />)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductReviews({ productId, lang, currentUser, onNeedAuth }) {
  const [reviews, setReviews] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const load = async () => { try { const { reviews: list } = await api.getReviews(productId); setReviews(list); } catch (e) { setReviews([]); } };
  useEffect(() => { load(); }, [productId]); // eslint-disable-line

  const submit = async (e) => {
    e.preventDefault();
    if (!currentUser) { onNeedAuth(); return; }
    setBusy(true);
    try { await api.submitReview({ productId, rating, comment }); setSent(true); setComment(""); } catch (e) { alert(e.message); }
    setBusy(false);
  };

  return (
    <div className="mt-16 border-t border-black/10 pt-10">
      <h3 className="font-bold text-lg mb-6">{lang === "fa" ? "نظرات خریداران" : "Customer Reviews"}</h3>
      {reviews === null && <p className="text-black/40 text-sm">{ui("loading", lang)}</p>}
      {reviews && reviews.length === 0 && <p className="text-black/40 text-sm mb-6">{lang === "fa" ? "هنوز نظری برای این محصول ثبت نشده." : "No reviews for this product yet."}</p>}
      <div className="space-y-4 mb-8">
        {reviews?.map((r) => (
          <div key={r.id} className="border border-black/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1"><StarRow rating={r.rating} /><span className="text-xs font-bold">{r.userName}</span></div>
            <p className="text-black/60 text-sm">{r.comment}</p>
          </div>
        ))}
      </div>
      {sent ? (
        <p className="text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs inline-block">{lang === "fa" ? "نظر شما ثبت شد و پس از تایید مدیر نمایش داده می‌شود." : "Your review was submitted and will appear after admin approval."}</p>
      ) : (
        <form onSubmit={submit} className="border border-black/10 rounded-xl p-4 max-w-md space-y-3">
          <p className="text-sm font-bold">{lang === "fa" ? "نظر خودتون رو ثبت کنید" : "Leave a review"}</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} onClick={() => setRating(n)} className={n <= rating ? "text-yellow-500" : "text-black/20"}><Star size={20} fill={n <= rating ? "currentColor" : "none"} /></button>
            ))}
          </div>
          <textarea required rows={3} className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-3 py-2 text-sm resize-none" placeholder={lang === "fa" ? "نظرتون رو بنویسید..." : "Write your review..."} value={comment} onChange={(e) => setComment(e.target.value)} />
          <button disabled={busy} className={btnPrimary}>{busy ? ui("checking", lang) : (lang === "fa" ? "ثبت نظر" : "Submit Review")}</button>
        </form>
      )}
    </div>
  );
}

/* ============================== درباره ما ============================== */

function AboutPage({ content, lang }) {
  const a = content.about;
  return (
    <div>
      <PageHeader eyebrow={ui("aboutUs", lang)} title={ui("whyNovin", lang)} image={content.pageHeaders?.about?.image} variant="about" />
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal><p className="text-black/65 leading-loose text-lg">{tr(a.content, lang)}</p></Reveal>
          <Reveal delay={150}>
            <div className="grid grid-cols-3 gap-4 mt-12 max-w-lg mx-auto">
              {a.stats.map((st, i) => (
                <div key={i} className="border border-black/10 rounded-xl py-5"><div className="text-2xl font-black text-red-600">{tr(st.value, lang)}</div><div className="text-xs text-black/50 mt-1">{tr(st.label, lang)}</div></div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

/* ============================== تماس با ما ============================== */

function ContactPage({ content, onSend, lang }) {
  const s = content.settings;
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const submit = async (e) => { e.preventDefault(); await onSend(form); setSent(true); setForm({ name: "", phone: "", message: "" }); };
  return (
    <div>
      <PageHeader eyebrow={ui("contactUs", lang)} title={ui("contactUsNow", lang)} image={content.pageHeaders?.contact?.image} variant="contact" />
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <InfoCard icon={<Phone size={20} />} title={ui("phoneCall", lang)} value={s.phone} />
            <InfoCard icon={<MapPin size={20} />} title={ui("address", lang)} value={tr(s.address, lang)} />
            <InfoCard icon={<Instagram size={20} />} title="Instagram" value={`@${s.instagram}`} />
          </div>
          <form onSubmit={submit} className="border border-black/10 rounded-2xl p-6 bg-neutral-50 space-y-3">
            {sent && <p className="text-xs bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2">{ui("messageSent", lang)}</p>}
            <input required placeholder={ui("yourName", lang)} className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required placeholder={ui("yourPhone", lang)} className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <textarea required rows={4} placeholder={ui("yourMessage", lang)} className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <button className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Mail size={16} /> {ui("sendMessage", lang)}</button>
          </form>
        </div>
      </section>
    </div>
  );
}
function InfoCard({ icon, title, value }) {
  return (
    <div className="border border-black/10 hover:border-red-600 transition-colors rounded-xl p-5 flex items-center gap-4">
      <div className="text-red-600">{icon}</div>
      <div><div className="text-xs text-black/50 mb-0.5">{title}</div><div className="text-sm font-bold">{value}</div></div>
    </div>
  );
}

/* ============================== حساب کاربری ============================== */

function AccountPage({ currentUser, onGoShop, lang }) {
  const [orders, setOrders] = useState(null);
  const [tickets, setTickets] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);
  const [showNewTicket, setShowNewTicket] = useState(false);

  const loadTickets = async () => { try { const { tickets: list } = await api.myTickets(); setTickets(list); } catch (e) { setTickets([]); } };

  useEffect(() => {
    if (!currentUser) return;
    (async () => { try { const { orders: list } = await api.myOrders(); setOrders(list); } catch (e) { setOrders([]); } })();
    loadTickets();
  }, [currentUser]);

  if (!currentUser) return <div className="pt-40 pb-24 text-center text-black/50">{ui("signInFirst", lang)}</div>;

  if (activeTicket) return (
    <div className="pt-32 pb-20 px-4 sm:px-6 max-w-3xl mx-auto">
      <TicketThread ticketId={activeTicket} onBack={() => { setActiveTicket(null); loadTickets(); }} isAdmin={false} lang={lang} />
    </div>
  );

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center"><User className="text-red-600" size={24} /></div>
        <div>
          <h1 className="font-black text-xl">{currentUser.name}</h1>
          <p className="text-black/40 text-xs">{currentUser.username} — {tr(ROLE_LABELS[currentUser.role], lang)}</p>
        </div>
      </div>
      <h3 className="font-bold mb-4">{ui("myOrders", lang)}</h3>
      {orders === null && <p className="text-black/40 text-sm">{ui("loading", lang)}</p>}
      {orders && orders.length === 0 && (
        <div className="text-center py-12 border border-black/10 rounded-xl mb-10">
          <p className="text-black/40 text-sm mb-4">{ui("noOrdersYet", lang)}</p>
          <button onClick={onGoShop} className="text-red-600 text-sm">{ui("goToShop", lang)}</button>
        </div>
      )}
      <div className="space-y-3 mb-10">
        {orders?.map((o) => (
          <div key={o.id} className="border border-black/10 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-bold">{o.orderType === "service" ? (lang === "fa" ? "درخواست تعمیر" : "Repair Request") : `${fmtNum(o.items.length, lang)} ${ui("itemsCount", lang)}`}</span>
              <span className="text-red-600 font-black">{o.orderType === "service" ? tr(STATUS_LABELS[o.status], lang) : fmtPrice(o.total, lang)}</span>
            </div>
            <p className="text-black/40 text-xs">{tr(STATUS_LABELS[o.status], lang)}</p>
            <p className="text-black/30 text-[11px]">{fmtDateTime(o.date, lang)}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">{lang === "fa" ? "تیکت‌های پشتیبانی" : "Support Tickets"}</h3>
        <button onClick={() => setShowNewTicket(true)} className={btnPrimary}><Plus size={14} /> {lang === "fa" ? "تیکت جدید" : "New Ticket"}</button>
      </div>
      {tickets === null && <p className="text-black/40 text-sm">{ui("loading", lang)}</p>}
      {tickets && tickets.length === 0 && <p className="text-black/40 text-sm">{lang === "fa" ? "هنوز تیکتی ثبت نکرده‌اید." : "You haven't created any tickets yet."}</p>}
      <div className="space-y-2">
        {tickets?.map((t) => (
          <button key={t.id} onClick={() => setActiveTicket(t.id)} className="w-full text-right border border-black/10 rounded-xl p-4 hover:border-red-600 transition-colors flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">{t.subject}</p>
              <p className="text-black/30 text-[11px]">{fmtDateTime(t.updatedAt, lang)}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${t.status === "open" ? "bg-red-50 text-red-600 border border-red-200" : t.status === "answered" ? "bg-green-50 text-green-700 border border-green-200" : "bg-black/5 text-black/50 border border-black/10"}`}>
              {t.status === "open" ? (lang === "fa" ? "باز" : "Open") : t.status === "answered" ? (lang === "fa" ? "پاسخ داده شد" : "Answered") : (lang === "fa" ? "بسته" : "Closed")}
            </span>
          </button>
        ))}
      </div>

      {showNewTicket && <NewTicketModal lang={lang} onClose={() => setShowNewTicket(false)} onCreated={() => { setShowNewTicket(false); loadTickets(); }} />}
    </div>
  );
}

function NewTicketModal({ onClose, onCreated, lang }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await api.createTicket({ subject, message }); onCreated(); } catch (e) { alert(e.message); }
    setBusy(false);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white border border-black/10 rounded-2xl p-6">
        <button onClick={onClose} className="absolute top-4 left-4 text-black/40 hover:text-black"><X size={18} /></button>
        <h3 className="font-bold text-lg mb-4">{lang === "fa" ? "تیکت جدید" : "New Ticket"}</h3>
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder={lang === "fa" ? "موضوع" : "Subject"} className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} />
          <textarea required rows={4} placeholder={lang === "fa" ? "پیام شما" : "Your message"} className={inputCls + " resize-none"} value={message} onChange={(e) => setMessage(e.target.value)} />
          <button disabled={busy} className={btnPrimary + " w-full justify-center"}>{busy ? ui("checking", lang) : (lang === "fa" ? "ارسال تیکت" : "Send Ticket")}</button>
        </form>
      </div>
    </div>
  );
}

/* ============================== مقالات ============================== */

function getExcerpt(blocks, lang) {
  const p = blocks.find((b) => b.type === "paragraph");
  if (!p) return "";
  const text = tr(p.content, lang);
  return text.length > 130 ? text.slice(0, 130) + "..." : text;
}

function ArticlesPage({ pages, content, lang }) {
  const articles = pages.filter((p) => p.isArticle).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  return (
    <div>
      <PageHeader eyebrow={ui("blogTitle", lang)} title={ui("articlesTitle", lang)} subtitle={ui("articlesSubtitle", lang)} image={content?.pageHeaders?.articles?.image} variant="articles" />
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {articles.length === 0 ? (
            <p className="text-black/40 text-sm text-center py-12">{ui("noArticlesYet", lang)}</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {articles.map((a, idx) => (
                <Reveal key={a.id} delay={idx * 70}>
                  <TiltCard className="group rounded-2xl overflow-hidden border border-black/10 hover:border-red-600 hover:shadow-lg transition-all duration-300 h-full bg-white">
                    <button onClick={() => navigate(`page/${a.id}`)} className="text-right w-full">
                      <PatternBox pattern="scan" className="h-32 flex items-center justify-center">
                        <FileText className="text-white group-hover:scale-110 transition-transform duration-300" size={30} />
                      </PatternBox>
                      <div className="p-5">
                        <p className="text-[11px] text-black/40 mb-1">{fmtDate(a.updatedAt, lang)} · {a.authorName}</p>
                        <h3 className="font-bold mb-2 group-hover:text-red-600 transition-colors">{tr(a.title, lang)}</h3>
                        <p className="text-black/55 text-sm leading-relaxed">{getExcerpt(a.blocks, lang)}</p>
                        <span className="mt-3 inline-flex items-center gap-1 text-red-600 text-xs">{ui("readMore", lang)} <ChevronLeft size={13} /></span>
                      </div>
                    </button>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ============================== سوالات رایج ============================== */

function FAQItem({ item, lang }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-black/10 rounded-xl overflow-hidden bg-white">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between text-right p-4 font-bold text-sm">
        {tr(item.question, lang)}
        <ChevronDown className={`text-red-600 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} size={18} />
      </button>
      {open && <div className="px-4 pb-4 text-black/60 text-sm leading-relaxed">{tr(item.answer, lang)}</div>}
    </div>
  );
}

function FAQPage({ content, lang }) {
  return (
    <div>
      <PageHeader eyebrow={ui("support", lang)} title={ui("faqTitle", lang)} subtitle={ui("faqSubtitle", lang)} image={content.pageHeaders?.faq?.image} variant="faq" />
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-3">
          {content.faq.length === 0 ? (
            <p className="text-black/40 text-sm text-center py-12">{ui("noFaqYet", lang)}</p>
          ) : content.faq.map((item, idx) => <Reveal key={item.id} delay={idx * 50}><FAQItem item={item} lang={lang} /></Reveal>)}
        </div>
      </section>
    </div>
  );
}

/* ============================== صفحه سفارشی (بلوک‌محور، دوزبانه) ============================== */

function BlockRenderer({ block, lang }) {
  switch (block.type) {
    case "heading": return <h2 className="text-2xl sm:text-3xl font-black mb-4 mt-8 first:mt-0">{tr(block.content, lang)}</h2>;
    case "image": return (
      block.imageUrl ? (
        <div className="mb-6">
          <img src={resolveImageUrl(block.imageUrl)} alt={tr(block.content, lang)} className="w-full h-auto rounded-2xl" />
          {tr(block.content, lang) && <p className="text-black/40 text-xs mt-2">{tr(block.content, lang)}</p>}
        </div>
      ) : (
        <PatternBox pattern="grid" className="h-56 rounded-2xl flex items-center justify-center mb-6">
          <div className="text-center">
            <ImageIcon className="text-white/70 mx-auto mb-2" size={32} />
            {tr(block.content, lang) && <p className="text-white/70 text-xs">{tr(block.content, lang)}</p>}
          </div>
        </PatternBox>
      )
    );
    case "button": return <a href={block.url || "#"} className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold mb-6 transition-colors">{tr(block.content, lang)}</a>;
    default: return <p className="text-black/70 leading-loose mb-4 whitespace-pre-line">{tr(block.content, lang)}</p>;
  }
}

function CustomPageView({ page, lang }) {
  if (!page) return <div className="pt-40 pb-24 text-center text-black/50">{ui("pageNotFound", lang)}</div>;
  return (
    <section className="pt-36 pb-24 px-4 sm:px-6 min-h-[60vh]">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("")} className="flex items-center gap-1.5 text-red-600 text-sm mb-8"><ChevronRight size={16} /> {ui("backToHome", lang)}</button>
        <h1 className="text-3xl sm:text-4xl font-black mb-6">{tr(page.title, lang)}</h1>
        {page.blocks.map((b) => <BlockRenderer key={b.id} block={b} lang={lang} />)}
      </div>
    </section>
  );
}

function StarRow({ rating, size = 14 }) {
  return <span className="text-yellow-500 inline-flex" style={{ fontSize: size }}>{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>;
}

function ReviewsStrip({ lang }) {
  const [reviews, setReviews] = useState(null);
  useEffect(() => { api.getReviews().then(({ reviews: list }) => setReviews(list)).catch(() => setReviews([])); }, []);
  if (reviews && reviews.length === 0) return null;
  return (
    <section className="py-16 px-4 sm:px-6 bg-neutral-50 border-t border-black/10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-10">
          <span className="text-red-600 text-xs tracking-[0.3em] font-bold">{lang === "fa" ? "نظرات مشتریان" : "Customer Reviews"}</span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2">{lang === "fa" ? "چه کسانی به ما اعتماد کردن؟" : "What Our Customers Say"}</h2>
        </Reveal>
        {reviews === null ? (
          <p className="text-center text-black/40 text-sm">{ui("loading", lang)}</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.slice(0, 6).map((r, idx) => (
              <Reveal key={r.id} delay={idx * 60}>
                <div className="bg-white border border-black/10 rounded-2xl p-5 h-full">
                  <StarRow rating={r.rating} />
                  <p className="text-black/70 text-sm leading-relaxed mt-3 mb-4">"{r.comment}"</p>
                  <p className="text-black/40 text-xs font-bold">{r.userName}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================== فوتر ============================== */

function Footer({ content, goToUrl, lang }) {
  const f = content.footer;
  const s = content.settings;
  return (
    <footer className="border-t border-black/10 bg-black text-white pt-16 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        <div>
          <Logo size={40} dark name={tr(s.siteName, lang)} />
          <p className="text-white/50 text-sm leading-relaxed mt-4">{tr(f.about, lang)}</p>
          <div className="flex gap-3 mt-4">
            <a className="p-2 border border-white/15 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors" href="#"><Instagram size={16} /></a>
            <a className="p-2 border border-white/15 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors" href="#"><Send size={16} /></a>
            <a className="p-2 border border-white/15 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors" href="#"><MessageCircle size={16} /></a>
          </div>
        </div>
        {f.columns.map((col) => (
          <div key={col.id}>
            <h4 className="font-bold mb-4">{tr(col.title, lang)}</h4>
            <ul className="space-y-2">{col.links.map((l, i) => <li key={i}><button onClick={() => goToUrl(l.url)} className="text-white/50 hover:text-red-500 text-sm transition-colors">{tr(l.label, lang)}</button></li>)}</ul>
          </div>
        ))}
        <div>
          <h4 className="font-bold mb-4">{ui("contactInfo", lang)}</h4>
          <ul className="space-y-2 text-sm text-white/50"><li>{s.phone}</li><li>{tr(s.address, lang)}</li></ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-white/10 pt-6 text-center"><p className="text-white/40 text-xs">{tr(f.copyright, lang)}</p></div>
    </footer>
  );
}

/* ============================== سبد خرید ============================== */

function CartDrawer({ cart, total, onClose, onChangeQty, onRemove, onCheckout, lang }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm h-full bg-white border-l border-black/10 flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-black/10">
          <h3 className="font-bold flex items-center gap-2"><ShoppingCart size={18} className="text-red-600" /> {ui("cart", lang)}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 && <p className="text-black/40 text-sm text-center mt-10">{ui("cartEmpty", lang)}</p>}
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-3 border-b border-black/10 pb-4">
              <PatternBox pattern={item.pattern} className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0"><IconBadge name={item.icon} size={22} className="text-white" /></PatternBox>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{tr(item.name, lang)}</p>
                <p className="text-red-600 text-xs font-bold mt-1">{fmtPrice(item.price, lang)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => onChangeQty(item.id, -1)} className="w-6 h-6 rounded bg-black/5 hover:bg-black/10">-</button>
                  <span className="text-xs w-4 text-center">{fmtNum(item.qty, lang)}</span>
                  <button onClick={() => onChangeQty(item.id, 1)} className="w-6 h-6 rounded bg-black/5 hover:bg-black/10">+</button>
                  <button onClick={() => onRemove(item.id)} className="mr-auto text-black/30 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="p-5 border-t border-black/10">
            <div className="flex justify-between mb-4 text-sm"><span className="text-black/60">{ui("total", lang)}</span><span className="font-black text-red-600">{fmtPrice(total, lang)}</span></div>
            <button onClick={onCheckout} className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors py-3 rounded-xl font-bold flex items-center justify-center gap-2"><CreditCard size={16} /> {ui("checkout", lang)}</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== پرداخت ============================== */

function CheckoutModal({ total, onClose, onSubmit, orderDone, currentUser, paymentStatus, lang }) {
  const [form, setForm] = useState({ name: currentUser?.name || "", phone: "", email: "", province: "", city: "", postalCode: "", address: "" });
  const [processing, setProcessing] = useState(false);
  const set = (k, v) => setForm({ ...form, [k]: v });
  const submit = async (e) => { e.preventDefault(); setProcessing(true); await new Promise((r) => setTimeout(r, 1200)); await onSubmit(form); setProcessing(false); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white border border-black/10 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 left-4 text-black/40 hover:text-black"><X size={18} /></button>
        {orderDone ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4"><Check className="text-red-600" size={28} /></div>
            <h3 className="text-xl font-black mb-2">{ui("orderPlaced", lang)}</h3>
            <p className="text-black/50 text-sm">{ui("orderPlacedDesc", lang)}</p>
            <button onClick={onClose} className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold">{ui("gotIt", lang)}</button>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2"><CreditCard size={18} className="text-red-600" /> {ui("finalizeOrder", lang)}</h3>
            <p className="text-black/40 text-xs mb-5">{ui("enterShippingInfo", lang)}</p>
            <form onSubmit={submit} className="space-y-3">
              <input required placeholder={ui("fullName", lang)} className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" value={form.name} onChange={(e) => set("name", e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder={ui("mobileNumber", lang)} dir="ltr" className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                <input type="email" placeholder={lang === "fa" ? "ایمیل (اختیاری)" : "Email (optional)"} dir="ltr" className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder={lang === "fa" ? "استان" : "Province"} className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" value={form.province} onChange={(e) => set("province", e.target.value)} />
                <input required placeholder={lang === "fa" ? "شهر" : "City"} className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" value={form.city} onChange={(e) => set("city", e.target.value)} />
              </div>
              <input required placeholder={lang === "fa" ? "کد پستی" : "Postal Code"} dir="ltr" className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} />
              <textarea required placeholder={ui("exactAddress", lang)} rows={3} className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm resize-none" value={form.address} onChange={(e) => set("address", e.target.value)} />
              <div className="flex justify-between items-center py-3 border-t border-black/10 text-sm"><span className="text-black/60">{ui("payableAmount", lang)}</span><span className="font-black text-red-600">{fmtPrice(total, lang)}</span></div>
              <button disabled={processing} className="w-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 transition-colors py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                {processing ? ui("connectingToGateway", lang) : paymentStatus?.enabled ? `${ui("payWith", lang)} ${paymentStatus.provider}` : ui("payOnline", lang)}
              </button>
              <p className="text-black/30 text-[11px] text-center leading-relaxed pt-1">
                {paymentStatus?.enabled ? ui("gatewayRealNote", lang) : ui("gatewaySimNote", lang)}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================== ورود / ثبت‌نام عمومی ============================== */

function AuthModal({ onClose, onLogin, onRegister, lang }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const err = mode === "login" ? await onLogin(username, password) : await onRegister(username, password, name);
    setBusy(false);
    if (err) setError(err); else setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white border border-black/10 rounded-2xl p-6">
        <button onClick={onClose} className="absolute top-4 left-4 text-black/40 hover:text-black"><X size={18} /></button>
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-3">
            {mode === "login" ? <Lock className="text-red-600" size={22} /> : <UserPlus className="text-red-600" size={22} />}
          </div>
          <h3 className="font-bold text-lg">{mode === "login" ? ui("signInToAccount", lang) : ui("registerNewUser", lang)}</h3>
        </div>
        <div className="flex bg-black/5 rounded-lg p-1 mb-5">
          <button onClick={() => { setMode("login"); setError(""); }} className={`flex-1 text-xs py-2 rounded-md transition-colors ${mode === "login" ? "bg-red-600 text-white font-bold" : "text-black/50"}`}>{ui("signIn", lang)}</button>
          <button onClick={() => { setMode("register"); setError(""); }} className={`flex-1 text-xs py-2 rounded-md transition-colors ${mode === "register" ? "bg-red-600 text-white font-bold" : "text-black/50"}`}>{ui("createAccount", lang)}</button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && <input required placeholder={ui("fullName", lang)} value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" />}
          <input required placeholder={ui("username", lang)} value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" />
          <input required type="password" placeholder={ui("password", lang)} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" />
          {error && <p className="text-red-600 text-xs text-center">{error}</p>}
          <button disabled={busy} className="w-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 transition-colors py-2.5 rounded-xl font-bold">{busy ? ui("checking", lang) : mode === "login" ? ui("signIn", lang) : ui("createAccount", lang)}</button>
        </form>
      </div>
    </div>
  );
}

/* ============================== پنل مدیریت ============================== */

const ALL_ADMIN_TABS = [
  { id: "dashboard", icon: LayoutGrid, roles: ["admin", "editor", "author"] },
  { id: "pages", icon: FileText, roles: ["admin", "editor", "author"] },
  { id: "hero", icon: Zap, roles: ["admin", "editor"] },
  { id: "services", icon: Wrench, roles: ["admin", "editor"] },
  { id: "products", icon: Package, roles: ["admin", "editor"] },
  { id: "menu", icon: ListOrdered, roles: ["admin", "editor"] },
  { id: "footer", icon: Layers, roles: ["admin", "editor"] },
  { id: "about", icon: UsersIcon, roles: ["admin", "editor"] },
  { id: "pageImages", icon: ImageIcon, roles: ["admin", "editor"] },
  { id: "faq", icon: MessageCircle, roles: ["admin", "editor"] },
  { id: "orders", icon: ShoppingCart, roles: ["admin"] },
  { id: "messages", icon: Mail, roles: ["admin"] },
  { id: "reviews", icon: MessageCircle, roles: ["admin"] },
  { id: "tickets", icon: LifeBuoy, roles: ["admin"] },
  { id: "users", icon: UsersIcon, roles: ["admin"] },
  { id: "payment", icon: CreditCard, roles: ["admin"] },
  { id: "notifications", icon: Send, roles: ["admin"] },
  { id: "settings", icon: Settings, roles: ["admin"] },
];

function AdminPanel({ content, update, onClose, onLogout, tab, setTab, saving, role, currentUser, refreshPages, lang }) {
  const tabs = ALL_ADMIN_TABS.filter((t) => t.roles.includes(role));
  useEffect(() => { if (!tabs.find((t) => t.id === tab)) setTab("dashboard"); }, []); // eslint-disable-line
  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col" dir={lang === "fa" ? "rtl" : "ltr"}>
      <div className="h-16 border-b border-black/10 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-neutral-900 text-white">
        <div className="flex items-center gap-3">
          <Logo size={32} dark name={tr(content.settings.siteName, lang)} />
          <span className="text-xs text-white/40 hidden sm:inline">{ui("adminPanel", lang)} · {tr(ROLE_LABELS[role], lang)}</span>
          {saving && <span className="text-[10px] text-red-400 flex items-center gap-1"><RotateCcw size={10} className="animate-spin" /> {ui("savingDots", lang)}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-xs border border-white/20 hover:border-red-500 rounded-lg px-3 py-2">{ui("viewSite", lang)}</button>
          <button onClick={onLogout} className="text-xs bg-red-600 hover:bg-red-500 rounded-lg px-3 py-2 flex items-center gap-1.5 font-bold"><LogOut size={14} /> {ui("logout", lang)}</button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-16 sm:w-56 border-l border-black/10 py-4 flex flex-col gap-1 overflow-y-auto shrink-0 bg-neutral-900">
          {tabs.map((t) => {
            const Ico = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${tab === t.id ? "bg-red-600/15 text-red-400 border-r-2 border-red-500" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                <Ico size={16} className="shrink-0" /> <span className="hidden sm:inline">{aui(t.id, lang)}</span>
              </button>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-neutral-50">
          {tab === "dashboard" && <AdminDashboard content={content} role={role} currentUser={currentUser} lang={lang} />}
          {tab === "pages" && <AdminPages role={role} currentUser={currentUser} refreshPages={refreshPages} lang={lang} />}
          {tab === "hero" && <AdminHero content={content} update={update} lang={lang} />}
          {tab === "services" && <AdminServices content={content} update={update} lang={lang} />}
          {tab === "products" && <AdminProducts content={content} update={update} lang={lang} />}
          {tab === "menu" && <AdminMenu content={content} update={update} lang={lang} />}
          {tab === "footer" && <AdminFooter content={content} update={update} lang={lang} />}
          {tab === "about" && <AdminAbout content={content} update={update} lang={lang} />}
          {tab === "pageImages" && <AdminPageImages content={content} update={update} lang={lang} />}
          {tab === "faq" && <AdminFAQ content={content} update={update} lang={lang} />}
          {tab === "orders" && <AdminOrders lang={lang} />}
          {tab === "messages" && <AdminMessages lang={lang} />}
          {tab === "reviews" && <AdminReviews lang={lang} />}
          {tab === "tickets" && <AdminTickets lang={lang} />}
          {tab === "users" && <AdminUsers lang={lang} />}
          {tab === "payment" && <AdminPayment lang={lang} />}
          {tab === "notifications" && <AdminNotifications lang={lang} />}
          {tab === "settings" && <AdminSettings content={content} update={update} lang={lang} />}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children, action }) {
  return <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-black">{children}</h2>{action}</div>;
}
const inputCls = "w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-3 py-2 text-sm";
const cardCls = "border border-black/10 rounded-xl p-4 bg-white";
const btnPrimary = "bg-red-600 hover:bg-red-700 text-white transition-colors px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5";
const btnGhost = "border border-black/15 hover:border-red-600 transition-colors px-3 py-2 rounded-lg text-xs flex items-center gap-1.5";

// فیلد دوزبانه‌ی استاندارد پنل مدیریت: یک ورودی فارسی و یک ورودی انگلیسی کنار هم
function BField({ label, value, onChange, multiline, lang }) {
  const v = value || { fa: "", en: "" };
  const Comp = multiline ? "textarea" : "input";
  return (
    <div>
      {label && <span className="text-xs text-black/50 mb-1.5 block">{label}</span>}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-[10px] text-black/30 mb-0.5 block">{aui("faPersian", lang)}</span>
          <Comp dir="rtl" rows={multiline ? 3 : undefined} className={inputCls} value={v.fa} onChange={(e) => onChange({ ...v, fa: e.target.value })} />
        </div>
        <div>
          <span className="text-[10px] text-black/30 mb-0.5 block">{aui("enEnglish", lang)}</span>
          <Comp dir="ltr" rows={multiline ? 3 : undefined} className={inputCls} value={v.en} onChange={(e) => onChange({ ...v, en: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ content, role, currentUser, lang }) {
  const [userCount, setUserCount] = useState(null);
  useEffect(() => { if (role === "admin") api.listUsers().then(({ users }) => setUserCount(users.length)).catch(() => {}); }, [role]);
  const stats = [
    { label: aui("services", lang), value: content.services.length, icon: Wrench },
    { label: aui("products", lang), value: content.products.length, icon: Package },
  ];
  if (role === "admin") stats.push({ label: aui("users", lang), value: userCount ?? "…", icon: UsersIcon });
  const roleDesc = {
    admin: { fa: "دسترسی کامل به همه‌ی بخش‌ها.", en: "Full access to every section." },
    editor: { fa: "می‌توانید همه‌ی محتوای سایت را ویرایش کنید.", en: "You can edit all site content." },
    author: { fa: "می‌توانید صفحات جدید بسازید و فقط صفحات خودتان را ویرایش کنید.", en: "You can create new pages and edit only your own pages." },
  };
  return (
    <div>
      <SectionTitle>{aui("welcome", lang)}, {currentUser?.name} 👋</SectionTitle>
      <p className="text-black/50 text-sm mb-8">{aui("yourRole", lang)}: <b>{tr(ROLE_LABELS[role], lang)}</b> — {tr(roleDesc[role], lang)}</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => <div key={s.label} className={cardCls}><s.icon className="text-red-600 mb-2" size={20} /><div className="text-2xl font-black">{s.value}</div><div className="text-xs text-black/40 mt-1">{s.label}</div></div>)}
      </div>
    </div>
  );
}

function AdminHero({ content, update, lang }) {
  const h = content.hero;
  const set = (k, v) => update(["hero", k], v);
  return (
    <div className="max-w-2xl">
      <SectionTitle>{aui("hero", lang)}</SectionTitle>
      <div className="space-y-4">
        <BField label={lang === "fa" ? "برچسب بالای عنوان" : "Eyebrow label"} value={h.eyebrow} onChange={(v) => set("eyebrow", v)} lang={lang} />
        <BField label={aui("title", lang)} value={h.title} onChange={(v) => set("title", v)} lang={lang} />
        <BField label={lang === "fa" ? "توضیح زیر عنوان" : "Subtitle"} value={h.subtitle} onChange={(v) => set("subtitle", v)} multiline lang={lang} />
        <BField label={lang === "fa" ? "متن دکمه اول" : "Button 1 text"} value={h.ctaText} onChange={(v) => set("ctaText", v)} lang={lang} />
        <BField label={lang === "fa" ? "متن دکمه دوم" : "Button 2 text"} value={h.ctaText2} onChange={(v) => set("ctaText2", v)} lang={lang} />
      </div>
    </div>
  );
}
function Field({ label, children }) { return <label className="block"><span className="text-xs text-black/50 mb-1.5 block">{label}</span>{children}</label>; }
function PatternPicker({ value, onChange }) {
  return <div className="flex flex-wrap gap-2">{PATTERNS.map((p) => <button key={p} type="button" onClick={() => onChange(p)} className={`w-10 h-10 rounded-lg border-2 ${value === p ? "border-red-600" : "border-black/10"}`} style={patternStyle(p)} title={p} />)}</div>;
}
function IconPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ICON_NAMES.map((n) => { const Ico = ICONS[n]; return <button key={n} type="button" onClick={() => onChange(n)} className={`w-10 h-10 rounded-lg border flex items-center justify-center ${value === n ? "border-red-600 bg-red-50 text-red-600" : "border-black/10 text-black/50"}`}><Ico size={16} /></button>; })}
    </div>
  );
}

function ImageUploadField({ label, value, onChange, lang }) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const pick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const { url } = await api.uploadImage(file);
      onChange(url);
    } catch (err) {
      alert((lang === "fa" ? "آپلود ناموفق بود: " : "Upload failed: ") + err.message);
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  };
  return (
    <div>
      {label && <span className="text-xs text-black/50 mb-1.5 block">{label}</span>}
      {value ? (
        <div className="relative w-full h-28 rounded-lg overflow-hidden border border-black/10 mb-2">
          <img src={resolveImageUrl(value)} alt="" className="w-full h-full object-cover" />
          <button type="button" onClick={() => onChange("")} className="absolute top-1.5 left-1.5 bg-black/70 text-white rounded-full p-1"><X size={12} /></button>
        </div>
      ) : null}
      <label className={btnGhost + " cursor-pointer inline-flex"}>
        <ImageIcon size={12} /> {busy ? ui("loading", lang) : (lang === "fa" ? (value ? "تغییر تصویر" : "بارگذاری تصویر") : (value ? "Change Image" : "Upload Image"))}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={pick} disabled={busy} />
      </label>
    </div>
  );
}

function AdminServices({ content, update, lang }) {
  const set = (list) => update(["services"], list);
  const addItem = () => set([...content.services, { id: uid("srv"), icon: "Monitor", title: { fa: "خدمت جدید", en: "New Service" }, desc: { fa: "", en: "" }, pattern: "circuit", image: "" }]);
  const removeItem = (id) => set(content.services.filter((s) => s.id !== id));
  const editItem = (id, key, val) => set(content.services.map((s) => (s.id === id ? { ...s, [key]: val } : s)));
  return (
    <div>
      <SectionTitle action={<button onClick={addItem} className={btnPrimary}><Plus size={14} /> {aui("addService", lang)}</button>}>{aui("services", lang)}</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-4">
        {content.services.map((s) => (
          <div key={s.id} className={cardCls}>
            <div className="flex justify-between items-start mb-3 gap-2">
              <div className="flex-1"><BField label={aui("title", lang)} value={s.title} onChange={(v) => editItem(s.id, "title", v)} lang={lang} /></div>
              <button onClick={() => removeItem(s.id)} className="mt-5 text-black/30 hover:text-red-600 shrink-0"><Trash2 size={16} /></button>
            </div>
            <div className="mb-3"><BField label={aui("description", lang)} value={s.desc} onChange={(v) => editItem(s.id, "desc", v)} multiline lang={lang} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-[10px] text-black/40 mb-1 block">{aui("icon", lang)}</span><IconPicker value={s.icon} onChange={(v) => editItem(s.id, "icon", v)} /></div>
              <div><span className="text-[10px] text-black/40 mb-1 block">{aui("bgImage", lang)}</span><PatternPicker value={s.pattern} onChange={(v) => editItem(s.id, "pattern", v)} /></div>
            </div>
            <div className="mt-3"><ImageUploadField value={s.image} onChange={(v) => editItem(s.id, "image", v)} lang={lang} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminProducts({ content, update, lang }) {
  const set = (list) => update(["products"], list);
  const addItem = () => set([...content.products, {
    id: uid("prj"), name: { fa: "پروژکتور جدید", en: "New Projector" }, brand: "Brand", category: { fa: "خانگی", en: "Home" },
    technology: "3LCD", resolution: "Full HD", lumens: 2000, price: 10000000, warranty: { fa: "۱۲ ماه", en: "12 months" },
    desc: { fa: "", en: "" }, stock: 5, icon: "Monitor", pattern: "dots", image: "",
  }]);
  const removeItem = (id) => set(content.products.filter((p) => p.id !== id));
  const editItem = (id, key, val) => set(content.products.map((p) => (p.id === id ? { ...p, [key]: val } : p)));
  return (
    <div>
      <SectionTitle action={<button onClick={addItem} className={btnPrimary}><Plus size={14} /> {aui("addProduct", lang)}</button>}>{aui("products", lang)}</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-4">
        {content.products.map((p) => (
          <div key={p.id} className={cardCls}>
            <div className="flex justify-between items-start mb-3 gap-2">
              <div className="flex-1"><BField label={aui("title", lang)} value={p.name} onChange={(v) => editItem(p.id, "name", v)} lang={lang} /></div>
              <button onClick={() => removeItem(p.id)} className="mt-5 text-black/30 hover:text-red-600 shrink-0"><Trash2 size={16} /></button>
            </div>
            <div className="mb-3"><BField label={aui("description", lang)} value={p.desc} onChange={(v) => editItem(p.id, "desc", v)} multiline lang={lang} /></div>
            <div className="mb-3"><BField label={ui("category", lang)} value={p.category} onChange={(v) => editItem(p.id, "category", v)} lang={lang} /></div>
            <div className="mb-3"><BField label={ui("warranty", lang)} value={p.warranty} onChange={(v) => editItem(p.id, "warranty", v)} lang={lang} /></div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Field label={ui("brand", lang)}><input className={inputCls} value={p.brand} onChange={(e) => editItem(p.id, "brand", e.target.value)} /></Field>
              <Field label={ui("technology", lang)}><input className={inputCls} value={p.technology} onChange={(e) => editItem(p.id, "technology", e.target.value)} /></Field>
              <Field label={ui("resolution", lang)}><input className={inputCls} value={p.resolution} onChange={(e) => editItem(p.id, "resolution", e.target.value)} /></Field>
              <Field label={lang === "fa" ? "لومن" : "Lumens"}><input type="number" className={inputCls} value={p.lumens} onChange={(e) => editItem(p.id, "lumens", Number(e.target.value))} /></Field>
              <Field label={lang === "fa" ? "قیمت (تومان)" : "Price (Toman)"}><input type="number" className={inputCls} value={p.price} onChange={(e) => editItem(p.id, "price", Number(e.target.value))} /></Field>
              <Field label={ui("stock", lang)}><input type="number" className={inputCls} value={p.stock} onChange={(e) => editItem(p.id, "stock", Number(e.target.value))} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div><span className="text-[10px] text-black/40 mb-1 block">{aui("icon", lang)}</span><IconPicker value={p.icon} onChange={(v) => editItem(p.id, "icon", v)} /></div>
              <div><span className="text-[10px] text-black/40 mb-1 block">{aui("bgImage", lang)}</span><PatternPicker value={p.pattern} onChange={(v) => editItem(p.id, "pattern", v)} /></div>
            </div>
            <div className="mt-3"><ImageUploadField value={p.image} onChange={(v) => editItem(p.id, "image", v)} lang={lang} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- صفحات: ویرایشگر بلوکی دوزبانه ---------- */

const BLOCK_TYPES = [
  { type: "heading", label: { fa: "عنوان", en: "Heading" }, icon: Type },
  { type: "paragraph", label: { fa: "پاراگراف", en: "Paragraph" }, icon: AlignLeft },
  { type: "image", label: { fa: "تصویر", en: "Image" }, icon: ImageIcon },
  { type: "button", label: { fa: "دکمه", en: "Button" }, icon: MousePointerClick },
];

function AdminPages({ role, currentUser, refreshPages, lang }) {
  const [pages, setPages] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try { const { pages: list } = await api.getPagesAdmin(); setPages(list); } catch (e) { setPages([]); }
  };
  useEffect(() => { load(); }, []);

  const startNew = () => setEditing({ id: null, title: { fa: "صفحه جدید", en: "New Page" }, slug: "", blocks: [{ id: uid("blk"), type: "paragraph", content: { fa: "", en: "" } }], showInMenu: false, isArticle: false, status: "published" });
  const startEdit = (p) => setEditing({ ...p, blocks: p.blocks.map((b) => ({ ...b })) });

  const save = async () => {
    const payload = { title: editing.title, slug: editing.slug || slugify(editing.title.fa), blocks: editing.blocks, showInMenu: editing.showInMenu, isArticle: editing.isArticle, status: editing.status };
    try {
      if (editing.id) await api.updatePage(editing.id, payload);
      else await api.createPage(payload);
      setEditing(null);
      await load();
      await refreshPages();
    } catch (e) { alert(aui("loadFailed", lang) + ": " + e.message); }
  };
  const remove = async (id) => {
    if (!confirm(lang === "fa" ? "این صفحه حذف شود؟" : "Delete this page?")) return;
    try { await api.deletePage(id); await load(); await refreshPages(); } catch (e) { alert(aui("loadFailed", lang) + ": " + e.message); }
  };

  const canEditPage = (p) => role !== "author" || p.authorId === currentUser.id;

  if (editing) return <PageEditor page={editing} setPage={setEditing} onSave={save} onCancel={() => setEditing(null)} lang={lang} />;

  return (
    <div>
      <SectionTitle action={<button onClick={startNew} className={btnPrimary}><Plus size={14} /> {aui("newPage", lang)}</button>}>{aui("pages", lang)}</SectionTitle>
      {role === "author" && <p className="text-xs text-black/40 mb-4">{lang === "fa" ? "شما فقط صفحاتی را می‌بینید که خودتان ساخته‌اید." : "You only see pages you created yourself."}</p>}
      {pages === null && <p className="text-black/40 text-sm">{ui("loading", lang)}</p>}
      <div className="space-y-3">
        {pages?.map((p) => (
          <div key={p.id} className={cardCls + " flex items-center justify-between"}>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm">{tr(p.title, lang)}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.status === "published" ? "bg-green-50 text-green-700 border border-green-200" : "bg-yellow-50 text-yellow-700 border border-yellow-200"}`}>{p.status === "published" ? (lang === "fa" ? "منتشرشده" : "Published") : (lang === "fa" ? "پیش‌نویس" : "Draft")}</span>
                {p.showInMenu && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">{lang === "fa" ? "در منو" : "In menu"}</span>}
                {p.isArticle && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{lang === "fa" ? "مقاله" : "Article"}</span>}
              </div>
              <p className="text-black/40 text-xs mt-1">{lang === "fa" ? "نویسنده" : "Author"}: {p.authorName} · slug: {p.slug}</p>
            </div>
            {canEditPage(p) ? (
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => startEdit(p)} className={btnGhost}>{aui("edit", lang)}</button>
                <button onClick={() => remove(p.id)} className="text-black/30 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            ) : <span className="text-[10px] text-black/30">{lang === "fa" ? "فقط قابل مشاهده" : "View only"}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PageEditor({ page, setPage, onSave, onCancel, lang }) {
  const set = (k, v) => setPage({ ...page, [k]: v });
  const setBlock = (id, patch) => set("blocks", page.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const addBlock = (type) => set("blocks", [...page.blocks, { id: uid("blk"), type, content: { fa: "", en: "" }, url: "", imageUrl: "" }]);
  const removeBlock = (id) => set("blocks", page.blocks.filter((b) => b.id !== id));
  const moveBlock = (id, dir) => {
    const idx = page.blocks.findIndex((b) => b.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= page.blocks.length) return;
    const next = [...page.blocks];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    set("blocks", next);
  };

  return (
    <div className="max-w-2xl">
      <SectionTitle action={
        <div className="flex gap-2">
          <button onClick={onCancel} className={btnGhost}>{aui("cancel", lang)}</button>
          <button onClick={onSave} className={btnPrimary}>{aui("savePage", lang)}</button>
        </div>
      }>{page.id ? aui("edit", lang) : aui("newPage", lang)}</SectionTitle>

      <div className="space-y-4 mb-8">
        <BField label={aui("title", lang)} value={page.title} onChange={(v) => set("title", v)} lang={lang} />
        <Field label={lang === "fa" ? "نامک (slug) — در آدرس صفحه استفاده می‌شود" : "Slug — used in the page URL"}><input className={inputCls} dir="ltr" value={page.slug} onChange={(e) => set("slug", e.target.value)} placeholder="e.g. rules" /></Field>
        <div className="flex items-center gap-6 flex-wrap">
          <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={page.showInMenu} onChange={(e) => set("showInMenu", e.target.checked)} className="accent-red-600" /> {lang === "fa" ? "نمایش در منوی سایت" : "Show in site menu"}</label>
          <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={page.isArticle} onChange={(e) => set("isArticle", e.target.checked)} className="accent-red-600" /> {lang === "fa" ? "نمایش در صفحه‌ی «مقالات»" : "Show in Articles page"}</label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <span>{lang === "fa" ? "وضعیت:" : "Status:"}</span>
            <select className={inputCls + " w-auto"} value={page.status} onChange={(e) => set("status", e.target.value)}>
              <option value="published">{lang === "fa" ? "منتشرشده" : "Published"}</option>
              <option value="draft">{lang === "fa" ? "پیش‌نویس" : "Draft"}</option>
            </select>
          </label>
        </div>
      </div>

      <h3 className="font-bold text-sm mb-3">{lang === "fa" ? "بلوک‌های محتوا" : "Content Blocks"}</h3>
      <div className="space-y-3 mb-4">
        {page.blocks.map((b, i) => (
          <div key={b.id} className={cardCls}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-red-600">{tr(BLOCK_TYPES.find((t) => t.type === b.type)?.label, lang)}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => moveBlock(b.id, -1)} disabled={i === 0} className="disabled:opacity-20"><ChevronUp size={14} /></button>
                <button onClick={() => moveBlock(b.id, 1)} disabled={i === page.blocks.length - 1} className="disabled:opacity-20"><ChevronDown size={14} /></button>
                <button onClick={() => removeBlock(b.id)} className="text-black/30 hover:text-red-600 mr-2"><Trash2 size={14} /></button>
              </div>
            </div>
            <BField value={b.content} onChange={(v) => setBlock(b.id, { content: v })} multiline={b.type === "paragraph"} lang={lang} />
            {b.type === "image" && (
              <div className="mt-2"><ImageUploadField value={b.imageUrl} onChange={(v) => setBlock(b.id, { imageUrl: v })} lang={lang} /></div>
            )}
            {b.type === "button" && (
              <div className="mt-2"><Field label={lang === "fa" ? "لینک (مثلاً #/shop)" : "Link (e.g. #/shop)"}><input dir="ltr" className={inputCls} value={b.url} onChange={(e) => setBlock(b.id, { url: e.target.value })} /></Field></div>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {BLOCK_TYPES.map((t) => <button key={t.type} onClick={() => addBlock(t.type)} className={btnGhost}><t.icon size={12} /> {lang === "fa" ? "افزودن" : "Add"} {tr(t.label, lang)}</button>)}
      </div>
    </div>
  );
}

function AdminMenu({ content, update, lang }) {
  const set = (list) => update(["menu"], list);
  const toggle = (id) => set(content.menu.map((m) => (m.id === id ? { ...m, visible: !m.visible } : m)));
  const move = (id, dir) => {
    const sorted = [...content.menu].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((m) => m.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    [sorted[idx].order, sorted[swapIdx].order] = [sorted[swapIdx].order, sorted[idx].order];
    set(sorted);
  };
  const editLabel = (id, label) => set(content.menu.map((m) => (m.id === id ? { ...m, label } : m)));
  const sorted = [...content.menu].sort((a, b) => a.order - b.order);
  return (
    <div className="max-w-2xl">
      <SectionTitle>{aui("menu", lang)}</SectionTitle>
      <p className="text-black/40 text-xs mb-5">{lang === "fa" ? "ترتیب، عنوان و نمایش/عدم‌نمایش آیتم‌های ثابت منو را کنترل کنید. صفحاتی که در بخش «صفحات» گزینه‌ی «نمایش در منو» را فعال کرده باشند، خودکار به منو اضافه می‌شوند." : "Control the order, labels, and visibility of the fixed menu items. Pages with \"Show in site menu\" enabled are added automatically."}</p>
      <div className="space-y-2">
        {sorted.map((m, i) => (
          <div key={m.id} className="flex items-center gap-3 border border-black/10 rounded-lg p-3 bg-white">
            <div className="flex flex-col"><button onClick={() => move(m.id, -1)} disabled={i === 0} className="disabled:opacity-20"><ChevronUp size={14} /></button><button onClick={() => move(m.id, 1)} disabled={i === sorted.length - 1} className="disabled:opacity-20"><ChevronDown size={14} /></button></div>
            <div className="flex-1"><BField value={m.label} onChange={(v) => editLabel(m.id, v)} lang={lang} /></div>
            <label className="flex items-center gap-1.5 text-xs text-black/50 shrink-0 cursor-pointer"><input type="checkbox" checked={m.visible} onChange={() => toggle(m.id)} className="accent-red-600" /> {lang === "fa" ? "نمایش" : "Show"}</label>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminFooter({ content, update, lang }) {
  const f = content.footer;
  const setF = (k, v) => update(["footer", k], v);
  const setColumns = (cols) => setF("columns", cols);
  const addColumn = () => setColumns([...f.columns, { id: uid("col"), title: { fa: "ستون جدید", en: "New Column" }, links: [] }]);
  const removeColumn = (id) => setColumns(f.columns.filter((c) => c.id !== id));
  const editColTitle = (id, title) => setColumns(f.columns.map((c) => (c.id === id ? { ...c, title } : c)));
  const addLink = (id) => setColumns(f.columns.map((c) => (c.id === id ? { ...c, links: [...c.links, { label: { fa: "لینک جدید", en: "New Link" }, url: "home" }] } : c)));
  const editLink = (id, idx, key, val) => setColumns(f.columns.map((c) => (c.id === id ? { ...c, links: c.links.map((l, i) => (i === idx ? { ...l, [key]: val } : l)) } : c)));
  const removeLink = (id, idx) => setColumns(f.columns.map((c) => (c.id === id ? { ...c, links: c.links.filter((_, i) => i !== idx) } : c)));
  return (
    <div className="max-w-2xl">
      <SectionTitle>{aui("footer", lang)}</SectionTitle>
      <BField label={lang === "fa" ? "متن درباره ما در فوتر" : "Footer about text"} value={f.about} onChange={(v) => setF("about", v)} multiline lang={lang} />
      <div className="mt-4"><BField label={lang === "fa" ? "متن کپی‌رایت" : "Copyright text"} value={f.copyright} onChange={(v) => setF("copyright", v)} lang={lang} /></div>
      <div className="flex items-center justify-between mt-8 mb-3"><h3 className="font-bold text-sm">{lang === "fa" ? "ستون‌های لینک" : "Link Columns"}</h3><button onClick={addColumn} className={btnGhost}><Plus size={12} /> {aui("newColumn", lang)}</button></div>
      <div className="space-y-4">
        {f.columns.map((c) => (
          <div key={c.id} className={cardCls}>
            <div className="flex justify-between items-start gap-2 mb-3">
              <div className="flex-1"><BField value={c.title} onChange={(v) => editColTitle(c.id, v)} lang={lang} /></div>
              <button onClick={() => removeColumn(c.id)} className="mt-5 text-black/30 hover:text-red-600"><Trash2 size={16} /></button>
            </div>
            <div className="space-y-2">
              {c.links.map((l, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1"><BField value={l.label} onChange={(v) => editLink(c.id, i, "label", v)} lang={lang} /></div>
                  <button onClick={() => removeLink(c.id, i)} className="text-black/30 hover:text-red-600 shrink-0 mt-5"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => addLink(c.id)} className={btnGhost}><Plus size={12} /> {aui("newLink", lang)}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminAbout({ content, update, lang }) {
  const a = content.about;
  const setContent = (v) => update(["about", "content"], v);
  const setStats = (list) => update(["about", "stats"], list);
  const editStat = (i, key, v) => setStats(a.stats.map((s, idx) => (idx === i ? { ...s, [key]: v } : s)));
  const addStat = () => setStats([...a.stats, { value: { fa: "", en: "" }, label: { fa: "", en: "" } }]);
  const removeStat = (i) => setStats(a.stats.filter((_, idx) => idx !== i));

  return (
    <div className="max-w-2xl">
      <SectionTitle>{aui("about", lang)}</SectionTitle>
      <div className="mb-4">
        <ImageUploadField label={lang === "fa" ? "تصویر بالای صفحه‌ی درباره ما" : "About page header image"} value={content.pageHeaders?.about?.image} onChange={(v) => update(["pageHeaders", "about", "image"], v)} lang={lang} />
        <p className="text-black/30 text-[11px] mt-1">{lang === "fa" ? "اگر عکسی بارگذاری نکنید، یک گرافیک پیش‌فرض نمایش داده می‌شود." : "If you don't upload an image, a default illustration is shown instead."}</p>
      </div>
      <BField label={lang === "fa" ? "متن درباره ما" : "About text"} value={a.content} onChange={setContent} multiline lang={lang} />

      <div className="flex items-center justify-between mt-8 mb-3">
        <h3 className="font-bold text-sm">{lang === "fa" ? "آمار و ارقام" : "Stats"}</h3>
        <button onClick={addStat} className={btnGhost}><Plus size={12} /> {lang === "fa" ? "افزودن آمار" : "Add Stat"}</button>
      </div>
      <div className="space-y-3">
        {a.stats.map((s, i) => (
          <div key={i} className={cardCls}>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <BField label={lang === "fa" ? "عدد" : "Value"} value={s.value} onChange={(v) => editStat(i, "value", v)} lang={lang} />
              <BField label={lang === "fa" ? "برچسب" : "Label"} value={s.label} onChange={(v) => editStat(i, "label", v)} lang={lang} />
            </div>
            <button onClick={() => removeStat(i)} className="text-black/30 hover:text-red-600 text-xs flex items-center gap-1"><Trash2 size={12} /> {aui("delete", lang)}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminPageImages({ content, update, lang }) {
  const sections = [
    { key: "services", label: lang === "fa" ? "خدمات" : "Services" },
    { key: "shop", label: lang === "fa" ? "فروشگاه" : "Shop" },
    { key: "contact", label: lang === "fa" ? "تماس با ما" : "Contact" },
    { key: "faq", label: lang === "fa" ? "سوالات رایج" : "FAQ" },
    { key: "articles", label: lang === "fa" ? "مقالات" : "Articles" },
  ];
  return (
    <div className="max-w-2xl">
      <SectionTitle>{aui("pageImages", lang)}</SectionTitle>
      <p className="text-black/40 text-xs mb-5">{lang === "fa" ? "برای هر بخش می‌توانید یک تصویر بالای صفحه بارگذاری کنید. اگر عکسی نگذارید، یک گرافیک اختصاصی پیش‌فرض نمایش داده می‌شود. (تصویر بخش «درباره ما» در تب «درباره ما» قرار دارد.)" : "Upload a header image for each section. If left empty, a custom default illustration is shown. (The About Us image lives in the About tab.)"}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {sections.map((s) => (
          <div key={s.key} className={cardCls}>
            <p className="text-sm font-bold mb-2">{s.label}</p>
            <ImageUploadField value={content.pageHeaders?.[s.key]?.image} onChange={(v) => update(["pageHeaders", s.key, "image"], v)} lang={lang} />
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminFAQ({ content, update, lang }) {
  const set = (list) => update(["faq"], list);
  const addItem = () => set([...content.faq, { id: uid("faq"), question: { fa: "سوال جدید", en: "New question" }, answer: { fa: "", en: "" } }]);
  const removeItem = (id) => set(content.faq.filter((f) => f.id !== id));
  const editItem = (id, key, val) => set(content.faq.map((f) => (f.id === id ? { ...f, [key]: val } : f)));
  return (
    <div className="max-w-2xl">
      <SectionTitle action={<button onClick={addItem} className={btnPrimary}><Plus size={14} /> {aui("newQuestion", lang)}</button>}>{aui("faq", lang)}</SectionTitle>
      <div className="space-y-3">
        {content.faq.map((f) => (
          <div key={f.id} className={cardCls}>
            <div className="flex justify-between items-start gap-2 mb-2">
              <div className="flex-1"><BField label={lang === "fa" ? "سوال" : "Question"} value={f.question} onChange={(v) => editItem(f.id, "question", v)} lang={lang} /></div>
              <button onClick={() => removeItem(f.id)} className="mt-5 text-black/30 hover:text-red-600 shrink-0"><Trash2 size={16} /></button>
            </div>
            <BField label={lang === "fa" ? "پاسخ" : "Answer"} value={f.answer} onChange={(v) => editItem(f.id, "answer", v)} multiline lang={lang} />
          </div>
        ))}
        {content.faq.length === 0 && <p className="text-black/40 text-sm">{ui("noFaqYet", lang)}</p>}
      </div>
    </div>
  );
}

const SHOP_STATUSES = ["reviewing", "registered", "packing", "shipped", "delivered"];
const SERVICE_STATUSES = ["reviewing", "working", "ready", "delivered"];
const STATUS_LABELS = {
  reviewing: { fa: "در حال بررسی سفارش", en: "Order Under Review" },
  registered: { fa: "سفارش ثبت شد", en: "Order Registered" },
  packing: { fa: "در حال بسته‌بندی", en: "Packing" },
  shipped: { fa: "ارسال سفارش", en: "Shipped" },
  delivered: { fa: "سفارش تحویل شد", en: "Delivered" },
  working: { fa: "تکنسین‌ها مشغول هستند", en: "Technicians Working" },
  ready: { fa: "سفارش آماده تحویل هست", en: "Ready for Pickup" },
};

function AdminOrders({ lang }) {
  const [orders, setOrders] = useState(null);
  const load = async () => { try { const { orders: list } = await api.allOrders(); setOrders(list); } catch (e) { setOrders([]); } };
  useEffect(() => { load(); }, []);
  return (
    <div>
      <SectionTitle>{aui("orders", lang)}</SectionTitle>
      {orders === null && <p className="text-black/40 text-sm">{ui("loading", lang)}</p>}
      {orders && orders.length === 0 && <p className="text-black/40 text-sm">{lang === "fa" ? "هنوز سفارشی ثبت نشده است." : "No orders yet."}</p>}
      <div className="space-y-3">
        {orders?.map((o) => <AdminOrderRow key={o.id} order={o} lang={lang} onChanged={load} />)}
      </div>
    </div>
  );
}

function AdminOrderRow({ order: o, lang, onChanged }) {
  const isService = o.orderType === "service";
  const statuses = isService ? SERVICE_STATUSES : SHOP_STATUSES;
  const [status, setStatus] = useState(o.status);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifySms, setNotifySms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const apply = async () => {
    setBusy(true); setResult(null);
    try {
      const { notifyResult } = await api.setOrderStatus(o.id, status, { email: notifyEmail, sms: notifySms });
      setResult(notifyResult);
      await onChanged();
    } catch (e) { alert(e.message); }
    setBusy(false);
  };

  return (
    <div className={cardCls}>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-bold flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${isService ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
            {isService ? (lang === "fa" ? "خدمات" : "Service") : (lang === "fa" ? "فروشگاه" : "Shop")}
          </span>
          {o.customer?.name} <span className="text-black/30">({o.username})</span>
        </span>
        {!isService && <span className="text-red-600 font-black">{fmtPrice(o.total, lang)}</span>}
      </div>
      <p className="text-black/40 text-xs mb-1">{o.customer?.phone}{o.customer?.email ? ` · ${o.customer.email}` : ""}</p>
      {isService ? (
        <p className="text-black/40 text-xs mb-1">{lang === "fa" ? "دستگاه" : "Device"}: {o.deviceInfo} — {o.issueDescription}</p>
      ) : (
        <p className="text-black/40 text-xs mb-1">{[o.customer?.province, o.customer?.city, o.customer?.address, o.customer?.postalCode].filter(Boolean).join("، ")}</p>
      )}
      <p className="text-black/30 text-[11px] mb-3">{fmtDateTime(o.date, lang)}</p>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/10">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls + " w-auto"}>
          {statuses.map((s) => <option key={s} value={s}>{tr(STATUS_LABELS[s], lang)}</option>)}
        </select>
        <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} className="accent-red-600" /> {lang === "fa" ? "اطلاع ایمیل" : "Notify email"}</label>
        <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="checkbox" checked={notifySms} onChange={(e) => setNotifySms(e.target.checked)} className="accent-red-600" /> {lang === "fa" ? "اطلاع پیامک" : "Notify SMS"}</label>
        <button onClick={apply} disabled={busy} className={btnPrimary}>{busy ? ui("checking", lang) : (lang === "fa" ? "اعمال تغییر" : "Apply")}</button>
      </div>
      {result && (
        <p className="text-[11px] mt-2 text-black/50">
          {result.email && (result.email.ok ? (lang === "fa" ? "✓ ایمیل ارسال شد" : "✓ Email sent") : `✗ ${result.email.error}`)}
          {result.email && result.sms ? " · " : ""}
          {result.sms && (result.sms.ok ? (lang === "fa" ? "✓ پیامک ارسال شد" : "✓ SMS sent") : `✗ ${result.sms.error}`)}
        </p>
      )}
    </div>
  );
}

function AdminMessages({ lang }) {
  const [messages, setMessages] = useState(null);
  useEffect(() => { (async () => { try { const { messages: list } = await api.allMessages(); setMessages(list); } catch (e) { setMessages([]); } })(); }, []);
  return (
    <div>
      <SectionTitle>{aui("messages", lang)}</SectionTitle>
      {messages === null && <p className="text-black/40 text-sm">{ui("loading", lang)}</p>}
      {messages && messages.length === 0 && <p className="text-black/40 text-sm">{lang === "fa" ? "هنوز پیامی دریافت نشده است." : "No messages yet."}</p>}
      <div className="space-y-3">
        {messages?.map((m) => (
          <div key={m.id} className={cardCls}>
            <div className="flex justify-between text-sm mb-2"><span className="font-bold">{m.name}</span><span className="text-black/40 text-xs">{m.phone}</span></div>
            <p className="text-black/60 text-sm mb-1">{m.message}</p>
            <p className="text-black/30 text-[11px]">{fmtDateTime(m.date, lang)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminUsers({ lang }) {
  const [users, setUsers] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const load = async () => { try { const { users: list } = await api.listUsers(); setUsers(list); } catch (e) { setUsers([]); } };
  useEffect(() => { load(); }, []);

  const changeRole = async (u, role) => {
    setBusyId(u.id);
    try { await api.setUserRole(u.id, role); await load(); } catch (e) { alert(aui("loadFailed", lang) + ": " + e.message); }
    setBusyId(null);
  };

  return (
    <div className="max-w-3xl">
      <SectionTitle>{aui("users", lang)}</SectionTitle>
      <p className="text-black/40 text-xs mb-5">
        {lang === "fa"
          ? <>نقش‌ها دقیقاً مثل وردپرس: <b>مدیر</b> (دسترسی کامل)، <b>ویرایشگر</b> (مدیریت کل محتوای سایت)، <b>نویسنده</b> (فقط ساخت و ویرایش صفحات خودش)، <b>مشترک</b> (فقط حساب کاربری و خرید).</>
          : <>Roles work just like WordPress: <b>Admin</b> (full access), <b>Editor</b> (manages all site content), <b>Author</b> (creates and edits only their own pages), <b>Subscriber</b> (account and purchases only).</>}
      </p>
      {users === null && <p className="text-black/40 text-sm">{ui("loading", lang)}</p>}
      <div className="space-y-2">
        {users?.map((u) => (
          <div key={u.id} className="flex items-center justify-between border border-black/10 rounded-lg p-3 bg-white">
            <div><p className="text-sm font-bold">{u.name}</p><p className="text-black/40 text-xs">{u.username}</p></div>
            <select disabled={busyId === u.id} value={u.role} onChange={(e) => changeRole(u, e.target.value)} className={inputCls + " w-auto"}>
              {ROLE_ORDER.map((r) => <option key={r} value={r}>{tr(ROLE_LABELS[r], lang)}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminPayment({ lang }) {
  const [cfg, setCfg] = useState(null);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.getPaymentSettings().then(setCfg).catch(() => setCfg({ provider: "", merchantId: "", apiKey: "", enabled: false })); }, []);

  const set = (k, v) => setCfg({ ...cfg, [k]: v });
  const save = async () => {
    try { await api.updatePaymentSettings(cfg); setSaved(true); setTimeout(() => setSaved(false), 2000); } catch (e) { alert(aui("loadFailed", lang) + ": " + e.message); }
  };

  if (!cfg) return <p className="text-black/40 text-sm">{ui("loading", lang)}</p>;

  return (
    <div className="max-w-lg">
      <SectionTitle>{aui("payment", lang)}</SectionTitle>
      <p className="text-black/40 text-xs mb-5">{lang === "fa" ? "این اطلاعات فقط برای مدیر قابل مشاهده است و هرگز در بخش عمومی سایت نمایش داده نمی‌شود." : "This information is only visible to the admin and is never exposed on the public site."}</p>
      <div className="space-y-4">
        <Field label={lang === "fa" ? "نام درگاه" : "Gateway"}>
          <select className={inputCls} value={cfg.provider} onChange={(e) => set("provider", e.target.value)}>
            <option value="">{lang === "fa" ? "انتخاب کنید..." : "Select..."}</option>
            <option value="زرین‌پال">ZarinPal</option>
            <option value="به‌پرداخت ملت">BehPardakht</option>
            <option value="آیدی‌پی">IDPay</option>
            <option value="سایر">{lang === "fa" ? "سایر" : "Other"}</option>
          </select>
        </Field>
        <Field label={lang === "fa" ? "کد پذیرندگی (Merchant ID)" : "Merchant ID"}><input dir="ltr" className={inputCls} value={cfg.merchantId} onChange={(e) => set("merchantId", e.target.value)} /></Field>
        <Field label={lang === "fa" ? "کلید API" : "API Key"}>
          <div className="flex gap-2">
            <input dir="ltr" type={showKey ? "text" : "password"} className={inputCls} value={cfg.apiKey} onChange={(e) => set("apiKey", e.target.value)} />
            <button type="button" onClick={() => setShowKey((v) => !v)} className={btnGhost}>{showKey ? <EyeOff size={14} /> : <Eye size={14} />}</button>
          </div>
        </Field>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={cfg.enabled} onChange={(e) => set("enabled", e.target.checked)} className="accent-red-600" /> {lang === "fa" ? "درگاه پرداخت فعال باشد" : "Enable payment gateway"}
        </label>
        <button onClick={save} className={btnPrimary}>{aui("saveSettings", lang)}</button>
        {saved && <span className="text-green-600 text-xs mr-2">{aui("saved", lang)} ✓</span>}
      </div>
    </div>
  );
}

function AdminReviews({ lang }) {
  const [reviews, setReviews] = useState(null);
  const load = async () => { try { const { reviews: list } = await api.adminGetReviews(); setReviews(list); } catch (e) { setReviews([]); } };
  useEffect(() => { load(); }, []);

  const setApproved = async (id, approved) => { try { await api.adminSetReviewApproved(id, approved); await load(); } catch (e) { alert(e.message); } };
  const remove = async (id) => { if (!confirm(lang === "fa" ? "این نظر حذف شود؟" : "Delete this review?")) return; try { await api.adminDeleteReview(id); await load(); } catch (e) { alert(e.message); } };

  return (
    <div className="max-w-2xl">
      <SectionTitle>{aui("reviews", lang)}</SectionTitle>
      {reviews === null && <p className="text-black/40 text-sm">{ui("loading", lang)}</p>}
      {reviews && reviews.length === 0 && <p className="text-black/40 text-sm">{lang === "fa" ? "هنوز نظری ثبت نشده است." : "No reviews yet."}</p>}
      <div className="space-y-3">
        {reviews?.map((r) => (
          <div key={r.id} className={cardCls}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold text-sm flex items-center gap-1">{r.userName} <span className="text-yellow-500">{"★".repeat(r.rating)}</span></p>
                <p className="text-black/30 text-[11px]">{r.productId ? `${lang === "fa" ? "محصول" : "Product"}: ${r.productId}` : (lang === "fa" ? "نظر عمومی سایت" : "General site review")} · {fmtDateTime(r.date, lang)}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.approved ? "bg-green-50 text-green-700 border border-green-200" : "bg-yellow-50 text-yellow-700 border border-yellow-200"}`}>
                {r.approved ? (lang === "fa" ? "تاییدشده" : "Approved") : (lang === "fa" ? "در انتظار تایید" : "Pending")}
              </span>
            </div>
            <p className="text-black/60 text-sm mb-3">{r.comment}</p>
            <div className="flex gap-2">
              {!r.approved && <button onClick={() => setApproved(r.id, true)} className={btnPrimary}>{lang === "fa" ? "تایید" : "Approve"}</button>}
              {r.approved && <button onClick={() => setApproved(r.id, false)} className={btnGhost}>{lang === "fa" ? "لغو تایید" : "Unapprove"}</button>}
              <button onClick={() => remove(r.id)} className="text-black/30 hover:text-red-600"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminTickets({ lang }) {
  const [tickets, setTickets] = useState(null);
  const [active, setActive] = useState(null);
  const load = async () => { try { const { tickets: list } = await api.allTickets(); setTickets(list); } catch (e) { setTickets([]); } };
  useEffect(() => { load(); }, []);

  if (active) return <TicketThread ticketId={active} onBack={() => { setActive(null); load(); }} isAdmin lang={lang} />;

  return (
    <div className="max-w-2xl">
      <SectionTitle>{aui("tickets", lang)}</SectionTitle>
      {tickets === null && <p className="text-black/40 text-sm">{ui("loading", lang)}</p>}
      {tickets && tickets.length === 0 && <p className="text-black/40 text-sm">{lang === "fa" ? "هنوز تیکتی ثبت نشده است." : "No tickets yet."}</p>}
      <div className="space-y-2">
        {tickets?.map((t) => (
          <button key={t.id} onClick={() => setActive(t.id)} className={cardCls + " w-full text-right flex items-center justify-between hover:border-red-600 transition-colors"}>
            <div>
              <p className="font-bold text-sm">{t.subject}</p>
              <p className="text-black/40 text-xs">{t.userName} · {fmtDateTime(t.updatedAt, lang)}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${t.status === "open" ? "bg-red-50 text-red-600 border border-red-200" : t.status === "answered" ? "bg-green-50 text-green-700 border border-green-200" : "bg-black/5 text-black/50 border border-black/10"}`}>
              {t.status === "open" ? (lang === "fa" ? "باز" : "Open") : t.status === "answered" ? (lang === "fa" ? "پاسخ داده شد" : "Answered") : (lang === "fa" ? "بسته" : "Closed")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TicketThread({ ticketId, onBack, isAdmin, lang }) {
  const [data, setData] = useState(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => { try { setData(await api.getTicket(ticketId)); } catch (e) { alert(e.message); onBack(); } };
  useEffect(() => { load(); }, [ticketId]); // eslint-disable-line

  const send = async (e) => {
    e.preventDefault(); if (!reply.trim()) return;
    setBusy(true);
    try { await api.replyTicket(ticketId, reply); setReply(""); await load(); } catch (e) { alert(e.message); }
    setBusy(false);
  };
  const changeStatus = async (status) => { try { await api.setTicketStatus(ticketId, status); await load(); } catch (e) { alert(e.message); } };

  if (!data) return <p className="text-black/40 text-sm">{ui("loading", lang)}</p>;

  return (
    <div className="max-w-2xl">
      <SectionTitle action={isAdmin && (
        <select value={data.ticket.status} onChange={(e) => changeStatus(e.target.value)} className={inputCls + " w-auto"}>
          <option value="open">{lang === "fa" ? "باز" : "Open"}</option>
          <option value="answered">{lang === "fa" ? "پاسخ داده شد" : "Answered"}</option>
          <option value="closed">{lang === "fa" ? "بسته" : "Closed"}</option>
        </select>
      )}>{data.ticket.subject}</SectionTitle>
      <button onClick={onBack} className={btnGhost + " mb-4"}>{lang === "fa" ? "بازگشت" : "Back"}</button>
      <div className="space-y-3 mb-4">
        {data.messages.map((m) => (
          <div key={m.id} className={`rounded-xl p-3 max-w-[80%] ${m.sender === "admin" ? "bg-red-50 border border-red-100 mr-auto" : "bg-black/5 ml-auto"}`}>
            <p className="text-[11px] font-bold mb-1">{m.senderName}</p>
            <p className="text-sm text-black/70">{m.message}</p>
            <p className="text-[10px] text-black/30 mt-1">{fmtDateTime(m.date, lang)}</p>
          </div>
        ))}
      </div>
      {data.ticket.status !== "closed" && (
        <form onSubmit={send} className="flex gap-2">
          <input className={inputCls} placeholder={lang === "fa" ? "پاسخ..." : "Reply..."} value={reply} onChange={(e) => setReply(e.target.value)} />
          <button disabled={busy} className={btnPrimary}>{lang === "fa" ? "ارسال" : "Send"}</button>
        </form>
      )}
    </div>
  );
}

function AdminNotifications({ lang }) {
  const [cfg, setCfg] = useState(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => { api.getNotificationSettings().then(setCfg).catch(() => setCfg({ email: {}, sms: {} })); }, []);
  if (!cfg) return <p className="text-black/40 text-sm">{ui("loading", lang)}</p>;

  const setEmail = (k, v) => setCfg({ ...cfg, email: { ...cfg.email, [k]: v } });
  const setSms = (k, v) => setCfg({ ...cfg, sms: { ...cfg.sms, [k]: v } });
  const save = async () => { try { await api.updateNotificationSettings(cfg); setSaved(true); setTimeout(() => setSaved(false), 2000); } catch (e) { alert(e.message); } };

  return (
    <div className="max-w-lg">
      <SectionTitle>{aui("notifications", lang)}</SectionTitle>
      <p className="text-black/40 text-xs mb-5">{lang === "fa" ? "این تنظیمات برای ارسال خودکار پیامک/ایمیل تغییر وضعیت سفارش به مشتری استفاده می‌شود. می‌توانید فعلاً فقط فیلدها را آماده بگذارید و بعداً اطلاعات واقعی سرویس‌دهنده را وارد کنید." : "These settings are used to automatically notify customers about order status changes. You can leave the fields empty for now and fill in your real provider details later."}</p>

      <h3 className="font-bold text-sm mb-3">{lang === "fa" ? "سرویس ایمیل (SMTP)" : "Email Service (SMTP)"}</h3>
      <div className="space-y-3 mb-8">
        <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={cfg.email.enabled || false} onChange={(e) => setEmail("enabled", e.target.checked)} className="accent-red-600" /> {lang === "fa" ? "فعال باشد" : "Enabled"}</label>
        <div className="grid grid-cols-2 gap-2">
          <Field label="SMTP Host"><input dir="ltr" className={inputCls} value={cfg.email.host || ""} onChange={(e) => setEmail("host", e.target.value)} placeholder="smtp.gmail.com" /></Field>
          <Field label="Port"><input dir="ltr" type="number" className={inputCls} value={cfg.email.port || 587} onChange={(e) => setEmail("port", Number(e.target.value))} /></Field>
        </div>
        <Field label={lang === "fa" ? "نام کاربری ایمیل" : "Email Username"}><input dir="ltr" className={inputCls} value={cfg.email.user || ""} onChange={(e) => setEmail("user", e.target.value)} /></Field>
        <Field label={lang === "fa" ? "رمز عبور / App Password" : "Password / App Password"}><input dir="ltr" type="password" className={inputCls} value={cfg.email.pass || ""} onChange={(e) => setEmail("pass", e.target.value)} /></Field>
        <Field label={lang === "fa" ? "آدرس فرستنده" : "From Address"}><input dir="ltr" className={inputCls} value={cfg.email.from || ""} onChange={(e) => setEmail("from", e.target.value)} /></Field>
      </div>

      <h3 className="font-bold text-sm mb-3">{lang === "fa" ? "سرویس پیامک" : "SMS Service"}</h3>
      <div className="space-y-3 mb-8">
        <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={cfg.sms.enabled || false} onChange={(e) => setSms("enabled", e.target.checked)} className="accent-red-600" /> {lang === "fa" ? "فعال باشد" : "Enabled"}</label>
        <Field label={lang === "fa" ? "آدرس Webhook سرویس پیامک" : "SMS Webhook URL"}><input dir="ltr" className={inputCls} value={cfg.sms.webhookUrl || ""} onChange={(e) => setSms("webhookUrl", e.target.value)} placeholder="https://api.provider.com/send" /></Field>
        <Field label={lang === "fa" ? "کلید API" : "API Key"}><input dir="ltr" type="password" className={inputCls} value={cfg.sms.apiKey || ""} onChange={(e) => setSms("apiKey", e.target.value)} /></Field>
        <Field label={lang === "fa" ? "شماره/نام فرستنده" : "Sender Number/Name"}><input dir="ltr" className={inputCls} value={cfg.sms.sender || ""} onChange={(e) => setSms("sender", e.target.value)} /></Field>
        <p className="text-black/30 text-[11px]">{lang === "fa" ? "این فیلد به‌صورت عمومی برای هر سرویس پیامکی که یک آدرس API (webhook) بدهد کار می‌کند (مثلاً کاوه‌نگار، ippanel و...)." : "This works generically with any SMS provider that exposes an HTTP API endpoint (e.g. Kavenegar, ippanel, Twilio, etc.)."}</p>
      </div>

      <button onClick={save} className={btnPrimary}>{aui("saveSettings", lang)}</button>
      {saved && <span className="text-green-600 text-xs mr-2">{aui("saved", lang)} ✓</span>}
    </div>
  );
}

function AdminSettings({ content, update, lang }) {
  const s = content.settings;
  const set = (k, v) => update(["settings", k], v);
  return (
    <div className="max-w-xl">
      <SectionTitle>{aui("settings", lang)}</SectionTitle>
      <div className="space-y-4">
        <BField label={lang === "fa" ? "نام سایت" : "Site Name"} value={s.siteName} onChange={(v) => set("siteName", v)} lang={lang} />
        <BField label={lang === "fa" ? "شعار سایت" : "Tagline"} value={s.tagline} onChange={(v) => set("tagline", v)} lang={lang} />
        <Field label={lang === "fa" ? "شماره تماس" : "Phone"}><input dir="ltr" className={inputCls} value={s.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <BField label={ui("address", lang)} value={s.address} onChange={(v) => set("address", v)} multiline lang={lang} />
        <Field label="Instagram"><input dir="ltr" className={inputCls} value={s.instagram} onChange={(e) => set("instagram", e.target.value)} /></Field>
      </div>
    </div>
  );
}
