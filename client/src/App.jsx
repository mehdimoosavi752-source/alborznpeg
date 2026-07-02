import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Menu, X, ShoppingCart, Plus, Trash2, Save, LogOut, Lock, User, UserPlus,
  Settings, LayoutGrid, FileText, ListOrdered, Wrench, Gamepad2,
  Monitor, Cpu, Phone, MapPin, Instagram, Send, MessageCircle,
  ChevronUp, ChevronDown, Check, Package, CreditCard,
  ShieldCheck, Zap, Clock, ChevronLeft, Layers, RotateCcw, Search,
  SlidersHorizontal, BadgeCheck, Truck, Star, Mail, ChevronRight, Users as UsersIcon,
} from "lucide-react";
import { api } from "./lib/api.js";

/* ============================== ثابت‌ها ============================== */

const uid = (p = "id") => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const toman = (n) => new Intl.NumberFormat("fa-IR").format(n) + " تومان";

const PATTERNS = ["circuit", "hex", "scan", "dots", "grid", "wave"];
const patternStyle = (pattern) => {
  switch (pattern) {
    case "circuit": return { backgroundImage: "linear-gradient(115deg, rgba(225,29,58,0.35) 0%, transparent 40%), repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 1px, transparent 1px, transparent 22px), repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 1px, transparent 1px, transparent 22px)", backgroundColor: "#0c0c0e" };
    case "hex": return { backgroundImage: "radial-gradient(circle at 20% 20%, rgba(225,29,58,0.45), transparent 45%), radial-gradient(circle at 80% 70%, rgba(212,162,83,0.18), transparent 40%)", backgroundColor: "#131316" };
    case "scan": return { backgroundImage: "repeating-linear-gradient(180deg, rgba(225,29,58,0.18) 0px, rgba(225,29,58,0.18) 2px, transparent 2px, transparent 10px)", backgroundColor: "#0e0e10" };
    case "dots": return { backgroundImage: "radial-gradient(rgba(255,255,255,0.16) 1.5px, transparent 1.5px)", backgroundSize: "14px 14px", backgroundColor: "#0c0c0e" };
    case "grid": return { backgroundImage: "linear-gradient(rgba(225,29,58,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(225,29,58,0.22) 1px, transparent 1px)", backgroundSize: "26px 26px", backgroundColor: "#0c0c0e" };
    default: return { backgroundImage: "repeating-linear-gradient(45deg, rgba(212,162,83,0.22) 0px, rgba(212,162,83,0.22) 2px, transparent 2px, transparent 16px)", backgroundColor: "#0c0c0e" };
  }
};
const GOLD = "#d4a253";

const ICONS = { Monitor, Cpu, Gamepad2, Wrench, ShieldCheck, Zap, Clock, Package, Star, Layers, Truck, BadgeCheck };
const ICON_NAMES = Object.keys(ICONS);

const DEFAULT_CONTENT = {
  settings: {
    siteName: "نوین پلی‌تکنیک",
    tagline: "مرکز تخصصی تعمیر و اورهال تجهیزات، فروشگاه ویدئو پروژکتور",
    phone: "021-91234567",
    address: "تهران، خیابان ولیعصر، پاساژ فناوری، طبقه دوم",
    instagram: "novin.polytechnic",
    telegram: "novinpolytechnic",
  },
  hero: {
    eyebrow: "تعمیرگاه تخصصی و فروشگاه پروژکتور",
    title: "نوین پلی‌تکنیک",
    subtitle: "تشخیص دقیق، تعمیر تخصصی و اورهال حرفه‌ای کامپیوتر و پلی‌استیشن — همراه با فروشگاه اورجینال ویدئو پروژکتور",
    ctaText: "مشاهده خدمات",
    ctaText2: "ورود به فروشگاه",
  },
  services: [
    { id: uid("srv"), icon: "Monitor", title: "تعمیر کامپیوتر و لپ‌تاپ", desc: "عیب‌یابی تخصصی سخت‌افزار و نرم‌افزار با دستگاه‌های تشخیص پیشرفته", pattern: "circuit" },
    { id: uid("srv"), icon: "Gamepad2", title: "تعمیر پلی‌استیشن", desc: "رفع خطای دیسک‌خور، اورهیت، HDMI و تعویض فن برای PS4 و PS5", pattern: "scan" },
    { id: uid("srv"), icon: "Cpu", title: "اورهال کامل سیستم", desc: "تعویض خمیر حرارتی، سرویس کامل، تست پایداری و بهینه‌سازی عملکرد", pattern: "hex" },
    { id: uid("srv"), icon: "Zap", title: "کالیبراسیون و سرویس پروژکتور", desc: "تعویض لامپ، تمیزکاری فیلتر و تنظیم دقیق رنگ و فوکوس", pattern: "wave" },
    { id: uid("srv"), icon: "ShieldCheck", title: "گارانتی تعمیرات", desc: "۳ ماه گارانتی روی تمامی خدمات تعمیر و قطعات تعویضی", pattern: "grid" },
    { id: uid("srv"), icon: "Package", title: "بازیابی اطلاعات", desc: "ریکاوری داده از هارد و SSD آسیب‌دیده با بالاترین نرخ موفقیت", pattern: "dots" },
  ],
  products: [
    { id: uid("prj"), name: "اپسون EH-TW5825", brand: "Epson", category: "خانگی", technology: "3LCD", resolution: "Full HD 1080p", lumens: 2700, price: 28500000, warranty: "۲۴ ماه", desc: "پروژکتور سینمای خانگی با رنگ‌های طبیعی و کنتراست بالا، مناسب فضای نشیمن", stock: 4, icon: "Monitor", pattern: "circuit" },
    { id: uid("prj"), name: "بنکیو TH585", brand: "BenQ", category: "خانگی", technology: "DLP", resolution: "Full HD 1080p", lumens: 3500, price: 24900000, warranty: "۱۸ ماه", desc: "تجربه سینمایی با نرخ رفرش بالا، عالی برای فیلم و بازی روی پرده بزرگ", stock: 6, icon: "Monitor", pattern: "hex" },
    { id: uid("prj"), name: "پاناسونیک PT-VMZ50", brand: "Panasonic", category: "اداری و تجاری", technology: "3LCD لیزری", resolution: "WUXGA", lumens: 5000, price: 68000000, warranty: "۲۴ ماه", desc: "پروژکتور تجاری تمام‌عیار با منبع نوری لیزری برای اتاق کنفرانس و سالن همایش", stock: 2, icon: "Cpu", pattern: "grid" },
    { id: uid("prj"), name: "شیائومی Mi Smart 2", brand: "Xiaomi", category: "قابل‌حمل", technology: "LED هوشمند", resolution: "Full HD 1080p", lumens: 500, price: 15200000, warranty: "۱۲ ماه", desc: "پروژکتور جمع‌وجور هوشمند با اندروید داخلی، مناسب سفر و اتاق خواب", stock: 10, icon: "Zap", pattern: "dots" },
    { id: uid("prj"), name: "اپتما HD146X", brand: "Optoma", category: "خانگی", technology: "DLP", resolution: "Full HD 1080p", lumens: 3600, price: 21800000, warranty: "۱۸ ماه", desc: "قیمت مناسب و کیفیت تصویر بالا، انتخابی محبوب برای شروع سینمای خانگی", stock: 7, icon: "Monitor", pattern: "scan" },
    { id: uid("prj"), name: "ایکس‌جیمی Halo+", brand: "XGIMI", category: "قابل‌حمل", technology: "LED با باتری", resolution: "Full HD 1080p", lumens: 900, price: 32500000, warranty: "۱۲ ماه", desc: "پروژکتور باتری‌دار قابل‌حمل با اندروید تی‌وی، مناسب سینمای حیاط و کمپینگ", stock: 5, icon: "Layers", pattern: "wave" },
  ],
  pages: [
    { id: "about-extra", title: "قوانین و مقررات", slug: "rules", showInMenu: false, order: 9,
      content: "کلیه محصولات فروشگاه نوین پلی‌تکنیک اورجینال و دارای گارانتی معتبر هستند. مهلت بازگشت کالا ۷ روز از تاریخ تحویل است." },
  ],
  menu: [
    { id: uid("menu"), label: "خانه", type: "route", target: "home", visible: true, order: 1 },
    { id: uid("menu"), label: "خدمات", type: "route", target: "services", visible: true, order: 2 },
    { id: uid("menu"), label: "فروشگاه پروژکتور", type: "route", target: "shop", visible: true, order: 3 },
    { id: uid("menu"), label: "درباره ما", type: "route", target: "about", visible: true, order: 4 },
    { id: uid("menu"), label: "تماس با ما", type: "route", target: "contact", visible: true, order: 5 },
  ],
  footer: {
    about: "نوین پلی‌تکنیک؛ مرجع تخصصی تعمیر، اورهال تجهیزات کامپیوتری/پلی‌استیشن و فروش اورجینال ویدئو پروژکتور با گارانتی معتبر.",
    columns: [
      { id: uid("col"), title: "دسترسی سریع", links: [{ label: "خدمات", url: "services" }, { label: "فروشگاه پروژکتور", url: "shop" }, { label: "درباره ما", url: "about" }] },
      { id: uid("col"), title: "پشتیبانی", links: [{ label: "تماس با ما", url: "contact" }, { label: "قوانین و مقررات", url: "page:about-extra" }] },
    ],
    copyright: `© ${new Date().getFullYear()} نوین پلی‌تکنیک — تمامی حقوق محفوظ است.`,
  },
  about: {
    content: "نوین پلی‌تکنیک با بیش از یک دهه تجربه در تعمیر و اورهال تجهیزات کامپیوتری و کنسول‌های بازی، و همچنین واردات و فروش مستقیم ویدئو پروژکتور، تیمی از متخصصان مجرب را گرد هم آورده تا بالاترین کیفیت خدمات را با شفافیت کامل ارائه دهد.",
    stats: [["+10", "سال تجربه"], ["+5000", "تعمیر موفق"], ["۹۸٪", "رضایت مشتری"]],
  },
};
// این شیء فقط به‌عنوان fallback آفلاین استفاده می‌شود؛ محتوای واقعی از سرور خوانده می‌شود.

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
function PatternBox({ pattern, className = "", children }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={patternStyle(pattern)}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
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
    el.style.transform = `perspective(800px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg)"; };
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={className} style={{ transition: "transform 0.2s ease-out", transformStyle: "preserve-3d" }}>{children}</div>;
}
function ProjectorBeam() {
  const motes = useRef([...Array(16)].map(() => ({ l: Math.random() * 100, t: Math.random() * 100, d: Math.random() * 5, dur: 4 + Math.random() * 4 }))).current;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="beam-cone" />
      {motes.map((m, i) => (
        <span key={i} className="dust-mote" style={{ left: `${m.l}%`, top: `${m.t}%`, animationDelay: `${m.d}s`, animationDuration: `${m.dur}s` }} />
      ))}
    </div>
  );
}
function Logo({ size = 44 }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
        <polygon points="50,3 93,26 93,74 50,97 7,74 7,26" fill="#0a0a0a" stroke="#e11d3a" strokeWidth="3" />
        <polygon points="50,15 82,32 82,68 50,85 18,68 18,32" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.2" />
        <text x="50" y="62" textAnchor="middle" fontSize="34" fontWeight="900" fill="#ffffff" fontFamily="Arial, sans-serif">NP</text>
        <rect x="18" y="68" width="64" height="3" fill="#e11d3a" />
      </svg>
      <div className="leading-tight">
        <div className="font-black text-white text-lg tracking-tight">نوین پلی‌تکنیک</div>
        <div className="text-[10px] tracking-widest" style={{ color: GOLD }}>TECH & PROJECTOR</div>
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

export default function NovinPolytechnic() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const route = useHashRoute();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderDone, setOrderDone] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState("dashboard");

  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getContent();
        setContent(data);
      } catch (e) {
        setLoadError("اتصال به سرور برقرار نشد. سایت با محتوای پیش‌فرض (آفلاین) نمایش داده می‌شود.");
        setContent(DEFAULT_CONTENT);
      }
      // اگر قبلاً وارد شده بودیم، نشست را از روی توکن ذخیره‌شده بازیابی کن
      if (api.getToken()) {
        try {
          const { user } = await api.me();
          setCurrentUser(user);
        } catch (e) {
          api.setToken(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setContent(next);
    setSaving(true);
    try {
      await api.updateContent(next);
    } catch (e) {
      setLoadError("ذخیره‌سازی روی سرور ناموفق بود: " + e.message);
    }
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

  if (loading || !content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-red-900/40" />
            <div className="absolute inset-0 rounded-full border-2 border-t-red-600 animate-spin" />
          </div>
          <div className="text-white/60 text-sm tracking-widest">در حال بارگذاری نوین پلی‌تکنیک...</div>
        </div>
      </div>
    );
  }

  const visibleMenu = [...content.menu].filter((m) => m.visible).sort((a, b) => a.order - b.order);

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
      api.setToken(token);
      setCurrentUser(user);
      setShowAuth(false);
      return null;
    } catch (e) {
      return e.message;
    }
  };
  const doRegister = async (username, password, name) => {
    try {
      const { token, user } = await api.register(username, password, name);
      api.setToken(token);
      setCurrentUser(user);
      setShowAuth(false);
      return null;
    } catch (e) {
      return e.message;
    }
  };
  const doLogout = () => { api.setToken(null); setCurrentUser(null); setUserMenuOpen(false); setShowAdmin(false); };

  const placeOrder = async (form) => {
    try {
      await api.createOrder({ items: cart, total: cartTotal, customer: form });
      setOrderDone(true);
      setCart([]);
    } catch (e) {
      alert("ثبت سفارش ناموفق بود: " + e.message);
    }
  };
  const sendMessage = async (form) => {
    try { await api.sendMessage(form); } catch (e) { /* نمایش خطا در خود فرم انجام می‌شود */ }
  };

  const isAdmin = currentUser?.role === "admin";
  const activePage = route[0] || "home";

  return (
    <div dir="rtl" lang="fa" className="min-h-screen bg-neutral-950 text-white font-sans" style={{ fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif" }}>
      <GlobalStyles />

      {loadError && (
        <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:left-4 sm:max-w-sm z-[70] bg-red-950/95 border border-red-700 rounded-xl p-3 text-xs flex items-start gap-2">
          <span className="flex-1">{loadError}</span>
          <button onClick={() => setLoadError("")} className="text-white/50 hover:text-white shrink-0"><X size={14} /></button>
        </div>
      )}

      <Header
        content={content} visibleMenu={visibleMenu} goTo={goTo} activePage={activePage}
        mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}
        cartCount={cartCount} setShowCart={setShowCart}
        currentUser={currentUser} isAdmin={isAdmin}
        userMenuOpen={userMenuOpen} setUserMenuOpen={setUserMenuOpen}
        onAuthClick={() => setShowAuth(true)} onLogout={doLogout} onAdminClick={() => { setShowAdmin(true); setUserMenuOpen(false); }}
        onAccountClick={() => { navigate("account"); setUserMenuOpen(false); }}
      />

      <main key={route.join("/")} className="page-fade">
        {activePage === "home" && <HomePage content={content} navigate={navigate} />}
        {activePage === "services" && <ServicesPage content={content} />}
        {activePage === "shop" && <ShopPage content={content} addToCart={addToCart} />}
        {activePage === "about" && <AboutPage content={content} />}
        {activePage === "contact" && <ContactPage content={content} onSend={sendMessage} />}
        {activePage === "account" && <AccountPage currentUser={currentUser} onGoShop={() => navigate("shop")} />}
        {activePage === "product" && <ProductDetailPage content={content} id={route[1]} addToCart={addToCart} />}
        {activePage === "page" && <CustomPageView page={content.pages.find((p) => p.id === route[1])} />}
      </main>

      <Footer content={content} goToUrl={goToUrl} />

      {showCart && <CartDrawer cart={cart} total={cartTotal} onClose={() => setShowCart(false)} onChangeQty={changeQty} onRemove={removeFromCart} onCheckout={() => { setShowCart(false); setShowCheckout(true); }} />}
      {showCheckout && <CheckoutModal total={cartTotal} orderDone={orderDone} onClose={() => { setShowCheckout(false); setOrderDone(false); }} onSubmit={placeOrder} currentUser={currentUser} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={doLogin} onRegister={doRegister} />}

      {isAdmin && showAdmin && (
        <AdminPanel content={content} update={update} saving={saving} onClose={() => setShowAdmin(false)} onLogout={doLogout} tab={adminTab} setTab={setAdminTab} />
      )}
    </div>
  );
}

/* ============================== استایل سراسری ============================== */

function GlobalStyles() {
  return (
    <style>{`
      @keyframes glitch {
        0%,100% { text-shadow: 2px 0 #e11d3a, -2px 0 rgba(255,255,255,0.25); transform: translate(0,0);}
        20% { text-shadow: -2px 0 #e11d3a, 2px 0 rgba(255,255,255,0.25); transform: translate(-1px,0);}
        40% { text-shadow: 2px 1px #e11d3a, -2px -1px rgba(255,255,255,0.25); transform: translate(1px,0);}
        60% { text-shadow: -1px -1px #e11d3a, 1px 1px rgba(255,255,255,0.25); transform: translate(0,0);}
      }
      .glitch-text { animation: glitch 3.5s infinite; }
      @keyframes floatBlob { 0%,100% { transform: translate(0,0) scale(1);} 50% { transform: translate(30px,-40px) scale(1.1);} }
      .blob { animation: floatBlob 8s ease-in-out infinite; }
      @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0px rgba(225,29,58,0.4);} 50% { box-shadow: 0 0 24px rgba(225,29,58,0.55);} }
      .glow-pulse { animation: pulseGlow 2.4s ease-in-out infinite; }
      @keyframes pageFade { from { opacity:0; transform: translateY(10px);} to { opacity:1; transform: translateY(0);} }
      .page-fade { animation: pageFade 0.45s ease-out; }
      .beam-cone { position:absolute; top:-40px; right:-60px; width:900px; height:600px;
        background: radial-gradient(ellipse at top right, rgba(225,29,58,0.30), rgba(212,162,83,0.10) 42%, transparent 72%);
        clip-path: polygon(100% 0%, 100% 32%, 5% 100%, 0% 62%);
        filter: blur(8px); animation: flicker 4.5s ease-in-out infinite; }
      @keyframes flicker { 0%,100%{opacity:.55;} 45%{opacity:.35;} 55%{opacity:.85;} }
      .dust-mote { position:absolute; width:3px;height:3px;border-radius:50%; background:rgba(245,244,241,0.55);
        animation-name: floaty; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }
      @keyframes floaty { 0%,100%{ transform: translateY(0) translateX(0); opacity:.15;} 50%{ transform: translateY(-24px) translateX(12px); opacity:.75;} }
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #0a0a0a; }
      ::-webkit-scrollbar-thumb { background: #7f1d1d; border-radius: 8px; }
      .spotlight { position:relative; }
      .spotlight:hover::before { content:""; position:absolute; inset:0; pointer-events:none;
        background: radial-gradient(240px circle at var(--x,50%) var(--y,50%), rgba(225,29,58,0.12), transparent 70%); }
    `}</style>
  );
}

/* ============================== هدر ============================== */

function Header({ content, visibleMenu, goTo, activePage, mobileMenuOpen, setMobileMenuOpen, cartCount, setShowCart, currentUser, isAdmin, userMenuOpen, setUserMenuOpen, onAuthClick, onLogout, onAdminClick, onAccountClick }) {
  return (
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-black/85 border-b border-red-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <button onClick={() => navigate("")}>
          <Logo />
        </button>
        <nav className="hidden lg:flex items-center gap-8">
          {visibleMenu.map((m) => (
            <button key={m.id} onClick={() => goTo(m)} className={`relative text-sm transition-colors group ${activePage === m.target ? "text-red-500" : "text-white/80 hover:text-white"}`}>
              {m.label}
              <span className={`absolute -bottom-1 right-0 h-[2px] bg-red-600 transition-all duration-300 ${activePage === m.target ? "w-full" : "w-0 group-hover:w-full"}`} />
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowCart(true)} className="relative p-2 rounded-lg border border-red-800/50 hover:border-red-500 hover:bg-red-950/30 transition-colors">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="absolute -top-2 -left-2 bg-red-600 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
          </button>

          {!currentUser ? (
            <button onClick={onAuthClick} className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition-colors font-bold">
              <User size={14} /> ورود / ثبت‌نام
            </button>
          ) : (
            <div className="relative hidden sm:block">
              <button onClick={() => setUserMenuOpen((v) => !v)} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-white/15 hover:border-red-500 transition-colors font-bold">
                <User size={14} /> {currentUser.name}
                {isAdmin && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(212,162,83,0.15)", color: GOLD }}>مدیر</span>}
              </button>
              {userMenuOpen && (
                <div className="absolute left-0 mt-2 w-44 bg-neutral-950 border border-white/10 rounded-xl overflow-hidden shadow-xl">
                  <button onClick={onAccountClick} className="w-full text-right px-4 py-2.5 text-xs hover:bg-white/5 flex items-center gap-2"><User size={13} /> حساب من</button>
                  {isAdmin && <button onClick={onAdminClick} className="w-full text-right px-4 py-2.5 text-xs hover:bg-white/5 flex items-center gap-2" style={{ color: GOLD }}><Settings size={13} /> پنل مدیریت</button>}
                  <button onClick={onLogout} className="w-full text-right px-4 py-2.5 text-xs hover:bg-white/5 flex items-center gap-2 text-red-500"><LogOut size={13} /> خروج</button>
                </div>
              )}
            </div>
          )}
          <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen((v) => !v)}>{mobileMenuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-red-900/40 bg-black px-4 py-4 flex flex-col gap-3">
          {visibleMenu.map((m) => <button key={m.id} onClick={() => goTo(m)} className="text-right text-white/80 hover:text-red-500 py-1">{m.label}</button>)}
          {!currentUser ? (
            <button onClick={onAuthClick} className="text-right text-red-500 font-bold py-1">ورود / ثبت‌نام</button>
          ) : (
            <>
              <button onClick={onAccountClick} className="text-right text-white/80 py-1">حساب من ({currentUser.name})</button>
              {isAdmin && <button onClick={onAdminClick} className="text-right py-1 font-bold" style={{ color: GOLD }}>پنل مدیریت</button>}
              <button onClick={onLogout} className="text-right text-red-500 py-1">خروج</button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

/* ============================== صفحه خانه ============================== */

function TrustBar() {
  const items = [
    { icon: BadgeCheck, label: "اصالت کالا تضمینی" },
    { icon: ShieldCheck, label: "گارانتی معتبر" },
    { icon: Truck, label: "ارسال سریع سراسری" },
    { icon: RotateCcw, label: "۷ روز مهلت بازگشت" },
  ];
  return (
    <div className="border-y border-red-950/50 bg-neutral-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2.5 text-white/70 text-xs sm:text-sm">
            <it.icon size={18} style={{ color: GOLD }} className="shrink-0" />
            <span>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomePage({ content, navigate }) {
  const h = content.hero;
  return (
    <>
      <section className="relative pt-40 pb-24 px-4 sm:px-6 overflow-hidden">
        <ProjectorBeam />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-red-700/20 rounded-full blur-3xl blob" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-red-900/25 rounded-full blur-3xl blob" style={{ animationDelay: "2s" }} />
        <div className="relative max-w-5xl mx-auto text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-xs tracking-widest border rounded-full px-4 py-1.5 mb-6" style={{ color: GOLD, borderColor: "rgba(212,162,83,0.4)" }}>
              <Zap size={14} /> {h.eyebrow}
            </span>
          </Reveal>
          <Reveal delay={100}><h1 className="glitch-text text-5xl sm:text-7xl font-black tracking-tight mb-6">{h.title}</h1></Reveal>
          <Reveal delay={200}><p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">{h.subtitle}</p></Reveal>
          <Reveal delay={300}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button onClick={() => navigate("services")} className="glow-pulse bg-red-600 hover:bg-red-500 transition-all px-8 py-3.5 rounded-xl font-bold hover:scale-105">{h.ctaText}</button>
              <button onClick={() => navigate("shop")} className="border border-white/25 hover:border-red-500 hover:text-red-500 transition-all px-8 py-3.5 rounded-xl font-bold hover:scale-105">{h.ctaText2}</button>
            </div>
          </Reveal>
        </div>
      </section>

      <TrustBar />

      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal className="flex items-end justify-between mb-10">
            <div>
              <span className="text-red-500 text-xs tracking-[0.3em] font-bold">خدمات ما</span>
              <h2 className="text-2xl sm:text-3xl font-black mt-2">تعمیر و اورهال تخصصی</h2>
            </div>
            <button onClick={() => navigate("services")} className="text-xs text-white/60 hover:text-red-500 flex items-center gap-1 shrink-0">مشاهده همه <ChevronLeft size={14} /></button>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {content.services.slice(0, 3).map((s, idx) => (
              <Reveal key={s.id} delay={idx * 80}>
                <ServiceCard s={s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 bg-black border-y border-red-950/40">
        <div className="max-w-7xl mx-auto">
          <Reveal className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs tracking-[0.3em] font-bold" style={{ color: GOLD }}>فروشگاه</span>
              <h2 className="text-2xl sm:text-3xl font-black mt-2">پرفروش‌ترین ویدئو پروژکتورها</h2>
            </div>
            <button onClick={() => navigate("shop")} className="text-xs text-white/60 hover:text-red-500 flex items-center gap-1 shrink-0">ورود به فروشگاه <ChevronLeft size={14} /></button>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {content.products.slice(0, 3).map((p, idx) => (
              <Reveal key={p.id} delay={idx * 80}><ProductCard p={p} onAdd={() => navigate("shop")} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <span className="text-red-500 text-xs tracking-[0.3em] font-bold">درباره ما</span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 mb-4">چرا نوین پلی‌تکنیک؟</h2>
            <p className="text-white/60 leading-loose">{content.about.content.slice(0, 160)}...</p>
            <button onClick={() => navigate("about")} className="mt-5 text-red-500 text-sm inline-flex items-center gap-1">ادامه مطلب <ChevronLeft size={14} /></button>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function ServiceCard({ s }) {
  return (
    <TiltCard className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-red-600/70 transition-colors duration-300 h-full">
      <PatternBox pattern={s.pattern} className="h-28 flex items-center justify-center">
        <IconBadge name={s.icon} className="text-white/90 relative z-10 group-hover:scale-110 group-hover:text-red-400 transition-transform duration-300" size={38} />
      </PatternBox>
      <div className="p-6 bg-neutral-950">
        <h3 className="font-bold text-lg mb-2">{s.title}</h3>
        <p className="text-white/60 text-sm leading-relaxed">{s.desc}</p>
      </div>
    </TiltCard>
  );
}

/* ============================== صفحه خدمات ============================== */

function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <section className="relative pt-36 pb-14 px-4 sm:px-6 border-b border-red-950/40 overflow-hidden">
      <div className="absolute -top-10 -right-10 w-72 h-72 bg-red-700/15 rounded-full blur-3xl blob" />
      <div className="relative max-w-4xl mx-auto text-center">
        <span className="text-red-500 text-xs tracking-[0.3em] font-bold">{eyebrow}</span>
        <h1 className="text-3xl sm:text-5xl font-black mt-3">{title}</h1>
        {subtitle && <p className="text-white/60 mt-4 max-w-xl mx-auto">{subtitle}</p>}
      </div>
    </section>
  );
}

function ServicesPage({ content }) {
  return (
    <div>
      <PageHeader eyebrow="خدمات ما" title="تعمیر، اورهال و سرویس تخصصی" subtitle="تیم فنی نوین پلی‌تکنیک با ابزار تشخیص پیشرفته، مشکل شما را دقیق پیدا و مطمئن رفع می‌کند." />
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.services.map((s, idx) => (
            <Reveal key={s.id} delay={idx * 70}><ServiceCard s={s} /></Reveal>
          ))}
        </div>
      </section>
      <TrustBar />
    </div>
  );
}

/* ============================== محیط فروشگاه ============================== */

function ProductCard({ p, onAdd }) {
  return (
    <TiltCard className="group rounded-2xl overflow-hidden border border-white/10 hover:border-red-600/60 transition-colors duration-300 h-full flex flex-col bg-neutral-950">
      <button onClick={() => navigate(`product/${p.id}`)} className="text-right">
        <PatternBox pattern={p.pattern} className="h-40 flex items-center justify-center">
          <IconBadge name={p.icon} className="text-white/90 group-hover:scale-110 transition-transform duration-300" size={52} />
          <span className="absolute top-3 left-3 text-[10px] bg-black/70 border rounded-full px-2 py-1" style={{ borderColor: "rgba(212,162,83,0.4)", color: GOLD }}>{p.warranty} گارانتی</span>
          <span className="absolute top-3 right-3 text-[10px] bg-black/70 border border-red-700/50 rounded-full px-2 py-1 text-red-400">{p.category}</span>
        </PatternBox>
      </button>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-white/40">{p.brand}</span>
          <span className="text-[11px] text-white/40">{p.resolution}</span>
        </div>
        <button onClick={() => navigate(`product/${p.id}`)} className="text-right"><h3 className="font-bold mb-2 hover:text-red-500 transition-colors">{p.name}</h3></button>
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="text-[10px] bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-white/50">{p.technology}</span>
          <span className="text-[10px] bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-white/50">{p.lumens} لومن</span>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-red-500 font-black">{toman(p.price)}</span>
          <button onClick={onAdd} className="text-xs bg-red-600 hover:bg-red-500 transition-colors px-3 py-2 rounded-lg font-bold flex items-center gap-1"><Plus size={14} /> افزودن</button>
        </div>
      </div>
    </TiltCard>
  );
}

function ShopPage({ content, addToCart }) {
  const products = content.products;
  const categories = ["همه", ...Array.from(new Set(products.map((p) => p.category)))];
  const brands = Array.from(new Set(products.map((p) => p.brand)));
  const [activeCat, setActiveCat] = useState("همه");
  const [activeBrands, setActiveBrands] = useState([]);
  const [q, setQ] = useState("");

  const toggleBrand = (b) => setActiveBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));

  const filtered = products.filter((p) => {
    if (activeCat !== "همه" && p.category !== activeCat) return false;
    if (activeBrands.length && !activeBrands.includes(p.brand)) return false;
    if (q && !(p.name + p.brand).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-black min-h-screen">
      <section className="relative pt-36 pb-10 px-4 sm:px-6 overflow-hidden border-b border-red-950/40">
        <ProjectorBeam />
        <div className="relative max-w-7xl mx-auto text-center">
          <span className="text-xs tracking-[0.3em] font-bold" style={{ color: GOLD }}>فروشگاه اورجینال</span>
          <h1 className="text-3xl sm:text-5xl font-black mt-3">ویدئو پروژکتور</h1>
          <p className="text-white/60 mt-3 max-w-xl mx-auto">واردات مستقیم و مرجع فروش معتبرترین برندهای ویدئو پروژکتور با گارانتی معتبر</p>
          <div className="max-w-md mx-auto mt-6 relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی مدل یا برند..." className="w-full bg-neutral-950 border border-white/15 focus:border-red-600 outline-none rounded-xl pr-9 pl-4 py-3 text-sm" />
          </div>
        </div>
      </section>

      <TrustBar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-[240px_1fr] gap-8">
        <aside className="lg:sticky lg:top-24 h-fit bg-neutral-950/70 border border-white/10 rounded-2xl p-5 backdrop-blur">
          <div className="flex items-center gap-2 mb-4 text-sm font-bold"><SlidersHorizontal size={15} style={{ color: GOLD }} /> فیلترها</div>
          <div className="mb-6">
            <p className="text-xs text-white/40 mb-2">دسته‌بندی</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button key={c} onClick={() => setActiveCat(c)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${activeCat === c ? "bg-red-600 border-red-600" : "border-white/15 text-white/60 hover:border-red-500"}`}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-2">برند</p>
            <div className="space-y-2">
              {brands.map((b) => (
                <label key={b} className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                  <input type="checkbox" checked={activeBrands.includes(b)} onChange={() => toggleBrand(b)} className="accent-red-600" /> {b}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <p className="text-white/40 text-xs mb-4">{filtered.length} محصول یافت شد</p>
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-white/40 text-sm">محصولی با این فیلتر پیدا نشد.</div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((p, idx) => <Reveal key={p.id} delay={Math.min(idx, 6) * 60}><ProductCard p={p} onAdd={() => addToCart(p)} /></Reveal>)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ProductDetailPage({ content, id, addToCart }) {
  const p = content.products.find((x) => x.id === id);
  if (!p) return <div className="pt-40 pb-24 text-center text-white/50">محصول یافت نشد.</div>;
  const related = content.products.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 3);
  const specs = [["برند", p.brand], ["دسته‌بندی", p.category], ["تکنولوژی", p.technology], ["رزولوشن", p.resolution], ["روشنایی", `${p.lumens} لومن`], ["گارانتی", p.warranty], ["موجودی", p.stock > 0 ? `${p.stock} عدد` : "ناموجود"]];
  return (
    <div className="pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate("shop")} className="flex items-center gap-1.5 text-white/50 hover:text-red-500 text-sm mb-8"><ChevronRight size={16} /> بازگشت به فروشگاه</button>
        <div className="grid md:grid-cols-2 gap-10">
          <PatternBox pattern={p.pattern} className="h-80 md:h-full min-h-[320px] rounded-2xl flex items-center justify-center">
            <IconBadge name={p.icon} size={110} className="text-white/90" />
          </PatternBox>
          <div>
            <div className="flex gap-2 mb-3">
              <span className="text-[11px] border rounded-full px-2.5 py-1" style={{ borderColor: "rgba(212,162,83,0.4)", color: GOLD }}>{p.warranty} گارانتی</span>
              <span className="text-[11px] border border-red-700/50 rounded-full px-2.5 py-1 text-red-400">{p.category}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mb-3">{p.name}</h1>
            <p className="text-white/60 leading-relaxed mb-6">{p.desc}</p>
            <div className="border border-white/10 rounded-xl overflow-hidden mb-6">
              {specs.map(([k, v], i) => (
                <div key={k} className={`flex justify-between text-sm px-4 py-2.5 ${i % 2 ? "bg-white/[0.03]" : ""}`}>
                  <span className="text-white/40">{k}</span><span className="font-bold">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-red-500">{toman(p.price)}</span>
              <button onClick={() => addToCart(p)} className="glow-pulse bg-red-600 hover:bg-red-500 transition-colors px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Plus size={16} /> افزودن به سبد</button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <h3 className="font-bold text-lg mb-6">محصولات مرتبط</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((r) => <ProductCard key={r.id} p={r} onAdd={() => addToCart(r)} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== درباره ما ============================== */

function AboutPage({ content }) {
  const a = content.about;
  return (
    <div>
      <PageHeader eyebrow="درباره ما" title="چرا نوین پلی‌تکنیک؟" />
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal><p className="text-white/65 leading-loose text-lg">{a.content}</p></Reveal>
          <Reveal delay={150}>
            <div className="grid grid-cols-3 gap-4 mt-12 max-w-lg mx-auto">
              {a.stats.map(([n, l]) => (
                <div key={l} className="border border-red-900/40 rounded-xl py-5">
                  <div className="text-2xl font-black text-red-500">{n}</div>
                  <div className="text-xs text-white/50 mt-1">{l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

/* ============================== تماس با ما ============================== */

function ContactPage({ content, onSend }) {
  const s = content.settings;
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const submit = async (e) => { e.preventDefault(); await onSend(form); setSent(true); setForm({ name: "", phone: "", message: "" }); };
  return (
    <div>
      <PageHeader eyebrow="تماس با ما" title="همین حالا با ما در ارتباط باشید" />
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <InfoCard icon={<Phone size={20} />} title="تماس تلفنی" value={s.phone} />
            <InfoCard icon={<MapPin size={20} />} title="آدرس" value={s.address} />
            <InfoCard icon={<Instagram size={20} />} title="اینستاگرام" value={`@${s.instagram}`} />
          </div>
          <form onSubmit={submit} className="border border-white/10 rounded-2xl p-6 bg-neutral-950/60 space-y-3">
            {sent && <p className="text-xs bg-green-950/40 border border-green-800/50 text-green-400 rounded-lg px-3 py-2">پیام شما ارسال شد، به‌زودی با شما تماس می‌گیریم.</p>}
            <input required placeholder="نام شما" className="w-full bg-black border border-white/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required placeholder="شماره تماس" className="w-full bg-black border border-white/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <textarea required rows={4} placeholder="پیام شما" className="w-full bg-black border border-white/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <button className="w-full bg-red-600 hover:bg-red-500 transition-colors py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Mail size={16} /> ارسال پیام</button>
          </form>
        </div>
      </section>
    </div>
  );
}
function InfoCard({ icon, title, value }) {
  return (
    <div className="border border-red-900/40 hover:border-red-600 transition-colors rounded-xl p-5 flex items-center gap-4">
      <div style={{ color: GOLD }}>{icon}</div>
      <div><div className="text-xs text-white/50 mb-0.5">{title}</div><div className="text-sm font-bold">{value}</div></div>
    </div>
  );
}

/* ============================== حساب کاربری ============================== */

function AccountPage({ currentUser, onGoShop }) {
  const [orders, setOrders] = useState(null);
  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const { orders: list } = await api.myOrders();
        setOrders(list);
      } catch (e) { setOrders([]); }
    })();
  }, [currentUser]);

  if (!currentUser) return <div className="pt-40 pb-24 text-center text-white/50">برای مشاهده این صفحه ابتدا وارد شوید.</div>;

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 rounded-full bg-red-600/15 border border-red-600 flex items-center justify-center"><User className="text-red-500" size={24} /></div>
        <div>
          <h1 className="font-black text-xl">{currentUser.name}</h1>
          <p className="text-white/40 text-xs">{currentUser.username} {currentUser.role === "admin" && <span style={{ color: GOLD }}> — مدیر سایت</span>}</p>
        </div>
      </div>
      <h3 className="font-bold mb-4">سفارش‌های من</h3>
      {orders === null && <p className="text-white/40 text-sm">در حال بارگذاری...</p>}
      {orders && orders.length === 0 && (
        <div className="text-center py-12 border border-white/10 rounded-xl">
          <p className="text-white/40 text-sm mb-4">هنوز سفارشی ثبت نکرده‌اید.</p>
          <button onClick={onGoShop} className="text-red-500 text-sm">رفتن به فروشگاه</button>
        </div>
      )}
      <div className="space-y-3">
        {orders?.map((o) => (
          <div key={o.id} className="border border-white/10 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-1"><span className="font-bold">{o.items.length} قلم کالا</span><span className="text-red-500 font-black">{toman(o.total)}</span></div>
            <p className="text-white/30 text-[11px]">{new Date(o.date).toLocaleString("fa-IR")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== صفحه سفارشی ============================== */

function CustomPageView({ page }) {
  if (!page) return <div className="pt-40 pb-24 text-center text-white/50">صفحه یافت نشد.</div>;
  return (
    <section className="pt-36 pb-24 px-4 sm:px-6 min-h-[60vh]">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("")} className="flex items-center gap-1.5 text-red-500 text-sm mb-8"><ChevronRight size={16} /> بازگشت به خانه</button>
        <h1 className="text-3xl sm:text-4xl font-black mb-6">{page.title}</h1>
        <p className="text-white/70 leading-loose whitespace-pre-line">{page.content}</p>
      </div>
    </section>
  );
}

/* ============================== فوتر ============================== */

function Footer({ content, goToUrl }) {
  const f = content.footer;
  const s = content.settings;
  return (
    <footer className="border-t border-red-950/60 bg-black pt-16 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        <div>
          <Logo size={40} />
          <p className="text-white/50 text-sm leading-relaxed mt-4">{f.about}</p>
          <div className="flex gap-3 mt-4">
            <a className="p-2 border border-white/15 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors" href="#"><Instagram size={16} /></a>
            <a className="p-2 border border-white/15 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors" href="#"><Send size={16} /></a>
            <a className="p-2 border border-white/15 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors" href="#"><MessageCircle size={16} /></a>
          </div>
        </div>
        {f.columns.map((col) => (
          <div key={col.id}>
            <h4 className="font-bold mb-4">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l, i) => <li key={i}><button onClick={() => goToUrl(l.url)} className="text-white/50 hover:text-red-500 text-sm transition-colors">{l.label}</button></li>)}
            </ul>
          </div>
        ))}
        <div>
          <h4 className="font-bold mb-4">اطلاعات تماس</h4>
          <ul className="space-y-2 text-sm text-white/50"><li>{s.phone}</li><li>{s.address}</li></ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-white/10 pt-6 text-center">
        <p className="text-white/40 text-xs">{f.copyright}</p>
      </div>
    </footer>
  );
}

/* ============================== سبد خرید ============================== */

function CartDrawer({ cart, total, onClose, onChangeQty, onRemove, onCheckout }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm h-full bg-neutral-950 border-l border-red-900/50 flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="font-bold flex items-center gap-2"><ShoppingCart size={18} className="text-red-500" /> سبد خرید</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 && <p className="text-white/40 text-sm text-center mt-10">سبد خرید شما خالی است</p>}
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-3 border-b border-white/10 pb-4">
              <PatternBox pattern={item.pattern} className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0"><IconBadge name={item.icon} size={22} /></PatternBox>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{item.name}</p>
                <p className="text-red-500 text-xs font-bold mt-1">{toman(item.price)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => onChangeQty(item.id, -1)} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20">-</button>
                  <span className="text-xs w-4 text-center">{item.qty}</span>
                  <button onClick={() => onChangeQty(item.id, 1)} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20">+</button>
                  <button onClick={() => onRemove(item.id)} className="mr-auto text-white/30 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="p-5 border-t border-white/10">
            <div className="flex justify-between mb-4 text-sm"><span className="text-white/60">جمع کل</span><span className="font-black text-red-500">{toman(total)}</span></div>
            <button onClick={onCheckout} className="w-full bg-red-600 hover:bg-red-500 transition-colors py-3 rounded-xl font-bold flex items-center justify-center gap-2"><CreditCard size={16} /> تسویه حساب</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== پرداخت ============================== */

function CheckoutModal({ total, onClose, onSubmit, orderDone, currentUser }) {
  const [form, setForm] = useState({ name: currentUser?.name || "", phone: "", address: "" });
  const [processing, setProcessing] = useState(false);
  const submit = async (e) => { e.preventDefault(); setProcessing(true); await new Promise((r) => setTimeout(r, 1200)); await onSubmit(form); setProcessing(false); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-neutral-950 border border-red-900/50 rounded-2xl p-6">
        <button onClick={onClose} className="absolute top-4 left-4 text-white/50 hover:text-white"><X size={18} /></button>
        {orderDone ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-600 flex items-center justify-center mx-auto mb-4"><Check className="text-red-500" size={28} /></div>
            <h3 className="text-xl font-black mb-2">سفارش شما ثبت شد!</h3>
            <p className="text-white/50 text-sm">همکاران ما به‌زودی برای هماهنگی ارسال با شما تماس می‌گیرند.</p>
            <button onClick={onClose} className="mt-6 bg-red-600 hover:bg-red-500 px-6 py-2.5 rounded-xl font-bold">متوجه شدم</button>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2"><CreditCard size={18} className="text-red-500" /> نهایی‌سازی خرید</h3>
            <p className="text-white/40 text-xs mb-5">اطلاعات ارسال را وارد کنید</p>
            <form onSubmit={submit} className="space-y-3">
              <input required placeholder="نام و نام خانوادگی" className="w-full bg-black border border-white/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required placeholder="شماره موبایل" className="w-full bg-black border border-white/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <textarea required placeholder="آدرس دقیق" rows={3} className="w-full bg-black border border-white/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm resize-none" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <div className="flex justify-between items-center py-3 border-t border-white/10 text-sm"><span className="text-white/60">مبلغ قابل پرداخت</span><span className="font-black text-red-500">{toman(total)}</span></div>
              <button disabled={processing} className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 transition-colors py-3 rounded-xl font-bold flex items-center justify-center gap-2">{processing ? "در حال اتصال به درگاه..." : "پرداخت آنلاین"}</button>
              <p className="text-white/30 text-[11px] text-center leading-relaxed pt-1">این بخش شبیه‌سازی درگاه پرداخت است. در نسخه نهاییِ سرور، اینجا به درگاه بانکی واقعی متصل می‌شود.</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================== ورود / ثبت‌نام عمومی ============================== */

function AuthModal({ onClose, onLogin, onRegister }) {
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-neutral-950 border border-red-900/50 rounded-2xl p-6">
        <button onClick={onClose} className="absolute top-4 left-4 text-white/50 hover:text-white"><X size={18} /></button>
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-red-600/15 border border-red-600 flex items-center justify-center mx-auto mb-3">
            {mode === "login" ? <Lock className="text-red-500" size={22} /> : <UserPlus className="text-red-500" size={22} />}
          </div>
          <h3 className="font-bold text-lg">{mode === "login" ? "ورود به حساب کاربری" : "ثبت‌نام کاربر جدید"}</h3>
        </div>
        <div className="flex bg-white/5 rounded-lg p-1 mb-5">
          <button onClick={() => { setMode("login"); setError(""); }} className={`flex-1 text-xs py-2 rounded-md transition-colors ${mode === "login" ? "bg-red-600 font-bold" : "text-white/50"}`}>ورود</button>
          <button onClick={() => { setMode("register"); setError(""); }} className={`flex-1 text-xs py-2 rounded-md transition-colors ${mode === "register" ? "bg-red-600 font-bold" : "text-white/50"}`}>ثبت‌نام</button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && <input required placeholder="نام و نام خانوادگی" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black border border-white/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" />}
          <input required placeholder="نام کاربری" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black border border-white/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" />
          <input required type="password" placeholder="رمز عبور" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-white/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" />
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button disabled={busy} className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 transition-colors py-2.5 rounded-xl font-bold">{busy ? "در حال بررسی..." : mode === "login" ? "ورود" : "ثبت‌نام"}</button>
        </form>
      </div>
    </div>
  );
}

/* ============================== پنل مدیریت ============================== */

const ADMIN_TABS = [
  { id: "dashboard", label: "داشبورد", icon: LayoutGrid },
  { id: "hero", label: "بخش هیرو", icon: Zap },
  { id: "services", label: "خدمات", icon: Wrench },
  { id: "products", label: "محصولات", icon: Package },
  { id: "pages", label: "صفحات", icon: FileText },
  { id: "menu", label: "منو", icon: ListOrdered },
  { id: "footer", label: "فوتر", icon: Layers },
  { id: "orders", label: "سفارشات", icon: ShoppingCart },
  { id: "messages", label: "پیام‌ها", icon: Mail },
  { id: "users", label: "کاربران", icon: UsersIcon },
  { id: "settings", label: "تنظیمات", icon: Settings },
];

function AdminPanel({ content, update, onClose, onLogout, tab, setTab, saving }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col" dir="rtl">
      <div className="h-16 border-b border-red-900/50 flex items-center justify-between px-4 sm:px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Logo size={32} />
          <span className="text-xs text-white/40 hidden sm:inline">پنل مدیریت</span>
          {saving && <span className="text-[10px] text-red-500 flex items-center gap-1"><RotateCcw size={10} className="animate-spin" /> در حال ذخیره...</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-xs border border-white/20 hover:border-red-500 rounded-lg px-3 py-2">مشاهده سایت</button>
          <button onClick={onLogout} className="text-xs bg-red-600 hover:bg-red-500 rounded-lg px-3 py-2 flex items-center gap-1.5 font-bold"><LogOut size={14} /> خروج</button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-16 sm:w-56 border-l border-white/10 py-4 flex flex-col gap-1 overflow-y-auto shrink-0">
          {ADMIN_TABS.map((t) => {
            const Ico = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${tab === t.id ? "bg-red-600/15 text-red-500 border-r-2 border-red-600" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                <Ico size={16} className="shrink-0" /> <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto p-5 sm:p-8">
          {tab === "dashboard" && <AdminDashboard content={content} />}
          {tab === "hero" && <AdminHero content={content} update={update} />}
          {tab === "services" && <AdminServices content={content} update={update} />}
          {tab === "products" && <AdminProducts content={content} update={update} />}
          {tab === "pages" && <AdminPages content={content} update={update} />}
          {tab === "menu" && <AdminMenu content={content} update={update} />}
          {tab === "footer" && <AdminFooter content={content} update={update} />}
          {tab === "orders" && <AdminOrders />}
          {tab === "messages" && <AdminMessages />}
          {tab === "users" && <AdminUsers content={content} update={update} />}
          {tab === "settings" && <AdminSettings content={content} update={update} />}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children, action }) {
  return <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-black">{children}</h2>{action}</div>;
}
const inputCls = "w-full bg-neutral-950 border border-white/15 focus:border-red-600 outline-none rounded-lg px-3 py-2 text-sm";
const cardCls = "border border-white/10 rounded-xl p-4 bg-neutral-950/60";
const btnPrimary = "bg-red-600 hover:bg-red-500 transition-colors px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5";
const btnGhost = "border border-white/15 hover:border-red-500 transition-colors px-3 py-2 rounded-lg text-xs flex items-center gap-1.5";

function AdminDashboard({ content }) {
  const [userCount, setUserCount] = useState(null);
  useEffect(() => { api.listUsers().then(({ users }) => setUserCount(users.length)).catch(() => setUserCount(null)); }, []);
  const stats = [
    { label: "خدمات", value: content.services.length, icon: Wrench },
    { label: "محصولات", value: content.products.length, icon: Package },
    { label: "صفحات", value: content.pages.length, icon: FileText },
    { label: "کاربران", value: userCount ?? "…", icon: UsersIcon },
  ];
  return (
    <div>
      <SectionTitle>خوش آمدید 👋</SectionTitle>
      <p className="text-white/50 text-sm mb-8">از منوی کناری هر بخش از سایت را ویرایش کنید. تغییرات بلافاصله روی سایت اعمال و ذخیره می‌شود.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={cardCls}><s.icon className="text-red-500 mb-2" size={20} /><div className="text-2xl font-black">{s.value}</div><div className="text-xs text-white/40 mt-1">{s.label}</div></div>
        ))}
      </div>
    </div>
  );
}

function AdminHero({ content, update }) {
  const h = content.hero;
  const set = (k, v) => update(["hero", k], v);
  return (
    <div className="max-w-xl">
      <SectionTitle>ویرایش بخش هیرو</SectionTitle>
      <div className="space-y-4">
        <Field label="برچسب بالای عنوان"><input className={inputCls} value={h.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} /></Field>
        <Field label="عنوان اصلی"><input className={inputCls} value={h.title} onChange={(e) => set("title", e.target.value)} /></Field>
        <Field label="توضیح زیر عنوان"><textarea rows={3} className={inputCls} value={h.subtitle} onChange={(e) => set("subtitle", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="متن دکمه اول"><input className={inputCls} value={h.ctaText} onChange={(e) => set("ctaText", e.target.value)} /></Field>
          <Field label="متن دکمه دوم"><input className={inputCls} value={h.ctaText2} onChange={(e) => set("ctaText2", e.target.value)} /></Field>
        </div>
      </div>
    </div>
  );
}
function Field({ label, children }) { return <label className="block"><span className="text-xs text-white/50 mb-1.5 block">{label}</span>{children}</label>; }
function PatternPicker({ value, onChange }) {
  return <div className="flex flex-wrap gap-2">{PATTERNS.map((p) => <button key={p} type="button" onClick={() => onChange(p)} className={`w-10 h-10 rounded-lg border-2 ${value === p ? "border-red-500" : "border-white/10"}`} style={patternStyle(p)} title={p} />)}</div>;
}
function IconPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ICON_NAMES.map((n) => { const Ico = ICONS[n]; return <button key={n} type="button" onClick={() => onChange(n)} className={`w-10 h-10 rounded-lg border flex items-center justify-center ${value === n ? "border-red-500 bg-red-600/10 text-red-500" : "border-white/10 text-white/50"}`}><Ico size={16} /></button>; })}
    </div>
  );
}

function AdminServices({ content, update }) {
  const set = (list) => update(["services"], list);
  const addItem = () => set([...content.services, { id: uid("srv"), icon: "Monitor", title: "خدمت جدید", desc: "توضیحات این خدمت را وارد کنید", pattern: "circuit" }]);
  const removeItem = (id) => set(content.services.filter((s) => s.id !== id));
  const editItem = (id, key, val) => set(content.services.map((s) => (s.id === id ? { ...s, [key]: val } : s)));
  return (
    <div>
      <SectionTitle action={<button onClick={addItem} className={btnPrimary}><Plus size={14} /> افزودن خدمت</button>}>مدیریت خدمات</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-4">
        {content.services.map((s) => (
          <div key={s.id} className={cardCls}>
            <div className="flex justify-between items-start mb-3"><input className={inputCls + " font-bold"} value={s.title} onChange={(e) => editItem(s.id, "title", e.target.value)} /><button onClick={() => removeItem(s.id)} className="mr-2 text-white/30 hover:text-red-500 shrink-0"><Trash2 size={16} /></button></div>
            <textarea rows={2} className={inputCls + " mb-3"} value={s.desc} onChange={(e) => editItem(s.id, "desc", e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-[10px] text-white/40 mb-1 block">آیکون</span><IconPicker value={s.icon} onChange={(v) => editItem(s.id, "icon", v)} /></div>
              <div><span className="text-[10px] text-white/40 mb-1 block">تصویر زمینه</span><PatternPicker value={s.pattern} onChange={(v) => editItem(s.id, "pattern", v)} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminProducts({ content, update }) {
  const set = (list) => update(["products"], list);
  const addItem = () => set([...content.products, { id: uid("prj"), name: "پروژکتور جدید", brand: "برند", category: "خانگی", technology: "3LCD", resolution: "Full HD", lumens: 2000, price: 10000000, warranty: "۱۲ ماه", desc: "توضیحات محصول", stock: 5, icon: "Monitor", pattern: "dots" }]);
  const removeItem = (id) => set(content.products.filter((p) => p.id !== id));
  const editItem = (id, key, val) => set(content.products.map((p) => (p.id === id ? { ...p, [key]: val } : p)));
  return (
    <div>
      <SectionTitle action={<button onClick={addItem} className={btnPrimary}><Plus size={14} /> افزودن محصول</button>}>مدیریت فروشگاه پروژکتور</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-4">
        {content.products.map((p) => (
          <div key={p.id} className={cardCls}>
            <div className="flex justify-between items-start mb-3"><input className={inputCls + " font-bold"} value={p.name} onChange={(e) => editItem(p.id, "name", e.target.value)} /><button onClick={() => removeItem(p.id)} className="mr-2 text-white/30 hover:text-red-500 shrink-0"><Trash2 size={16} /></button></div>
            <textarea rows={2} className={inputCls + " mb-3"} value={p.desc} onChange={(e) => editItem(p.id, "desc", e.target.value)} />
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Field label="برند"><input className={inputCls} value={p.brand} onChange={(e) => editItem(p.id, "brand", e.target.value)} /></Field>
              <Field label="دسته‌بندی"><input className={inputCls} value={p.category} onChange={(e) => editItem(p.id, "category", e.target.value)} /></Field>
              <Field label="تکنولوژی"><input className={inputCls} value={p.technology} onChange={(e) => editItem(p.id, "technology", e.target.value)} /></Field>
              <Field label="رزولوشن"><input className={inputCls} value={p.resolution} onChange={(e) => editItem(p.id, "resolution", e.target.value)} /></Field>
              <Field label="لومن"><input type="number" className={inputCls} value={p.lumens} onChange={(e) => editItem(p.id, "lumens", Number(e.target.value))} /></Field>
              <Field label="گارانتی"><input className={inputCls} value={p.warranty} onChange={(e) => editItem(p.id, "warranty", e.target.value)} /></Field>
              <Field label="قیمت (تومان)"><input type="number" className={inputCls} value={p.price} onChange={(e) => editItem(p.id, "price", Number(e.target.value))} /></Field>
              <Field label="موجودی"><input type="number" className={inputCls} value={p.stock} onChange={(e) => editItem(p.id, "stock", Number(e.target.value))} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div><span className="text-[10px] text-white/40 mb-1 block">آیکون محصول</span><IconPicker value={p.icon} onChange={(v) => editItem(p.id, "icon", v)} /></div>
              <div><span className="text-[10px] text-white/40 mb-1 block">تصویر زمینه</span><PatternPicker value={p.pattern} onChange={(v) => editItem(p.id, "pattern", v)} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminPages({ content, update }) {
  const set = (list) => update(["pages"], list);
  const setMenu = (list) => update(["menu"], list);
  const addPage = () => {
    const id = uid("page");
    set([...content.pages, { id, title: "صفحه جدید", slug: id, showInMenu: false, order: 99, content: "متن این صفحه را اینجا بنویسید..." }]);
    setMenu([...content.menu, { id: uid("menu"), label: "صفحه جدید", type: "page", target: id, visible: false, order: content.menu.length + 1 }]);
  };
  const removePage = (id) => { set(content.pages.filter((p) => p.id !== id)); setMenu(content.menu.filter((m) => !(m.type === "page" && m.target === id))); };
  const editPage = (id, key, val) => set(content.pages.map((p) => (p.id === id ? { ...p, [key]: val } : p)));
  const toggleMenu = (pageId, val) => { editPage(pageId, "showInMenu", val); setMenu(content.menu.map((m) => (m.type === "page" && m.target === pageId ? { ...m, visible: val } : m))); };
  const syncLabel = (pageId, title) => { editPage(pageId, "title", title); setMenu(content.menu.map((m) => (m.type === "page" && m.target === pageId ? { ...m, label: title } : m))); };
  return (
    <div>
      <SectionTitle action={<button onClick={addPage} className={btnPrimary}><Plus size={14} /> صفحه جدید</button>}>مدیریت صفحات</SectionTitle>
      <div className="space-y-4">
        {content.pages.map((p) => (
          <div key={p.id} className={cardCls}>
            <div className="flex justify-between items-start mb-3 gap-3"><input className={inputCls + " font-bold"} value={p.title} onChange={(e) => syncLabel(p.id, e.target.value)} /><button onClick={() => removePage(p.id)} className="text-white/30 hover:text-red-500 shrink-0"><Trash2 size={16} /></button></div>
            <textarea rows={4} className={inputCls + " mb-3"} value={p.content} onChange={(e) => editPage(p.id, "content", e.target.value)} />
            <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer"><input type="checkbox" checked={p.showInMenu} onChange={(e) => toggleMenu(p.id, e.target.checked)} className="accent-red-600" /> نمایش این صفحه در منوی سایت</label>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminMenu({ content, update }) {
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
    <div className="max-w-xl">
      <SectionTitle>مدیریت منو</SectionTitle>
      <p className="text-white/40 text-xs mb-5">ترتیب، عنوان و نمایش/عدم‌نمایش آیتم‌های منوی بالای سایت را کنترل کنید.</p>
      <div className="space-y-2">
        {sorted.map((m, i) => (
          <div key={m.id} className="flex items-center gap-3 border border-white/10 rounded-lg p-3">
            <div className="flex flex-col"><button onClick={() => move(m.id, -1)} disabled={i === 0} className="disabled:opacity-20"><ChevronUp size={14} /></button><button onClick={() => move(m.id, 1)} disabled={i === sorted.length - 1} className="disabled:opacity-20"><ChevronDown size={14} /></button></div>
            <input className={inputCls} value={m.label} onChange={(e) => editLabel(m.id, e.target.value)} />
            <label className="flex items-center gap-1.5 text-xs text-white/50 shrink-0 cursor-pointer"><input type="checkbox" checked={m.visible} onChange={() => toggle(m.id)} className="accent-red-600" /> نمایش</label>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminFooter({ content, update }) {
  const f = content.footer;
  const setF = (k, v) => update(["footer", k], v);
  const setColumns = (cols) => setF("columns", cols);
  const addColumn = () => setColumns([...f.columns, { id: uid("col"), title: "ستون جدید", links: [] }]);
  const removeColumn = (id) => setColumns(f.columns.filter((c) => c.id !== id));
  const editColTitle = (id, title) => setColumns(f.columns.map((c) => (c.id === id ? { ...c, title } : c)));
  const addLink = (id) => setColumns(f.columns.map((c) => (c.id === id ? { ...c, links: [...c.links, { label: "لینک جدید", url: "home" }] } : c)));
  const editLink = (id, idx, key, val) => setColumns(f.columns.map((c) => (c.id === id ? { ...c, links: c.links.map((l, i) => (i === idx ? { ...l, [key]: val } : l)) } : c)));
  const removeLink = (id, idx) => setColumns(f.columns.map((c) => (c.id === id ? { ...c, links: c.links.filter((_, i) => i !== idx) } : c)));
  return (
    <div className="max-w-2xl">
      <SectionTitle>مدیریت فوتر</SectionTitle>
      <Field label="متن درباره ما در فوتر"><textarea rows={2} className={inputCls} value={f.about} onChange={(e) => setF("about", e.target.value)} /></Field>
      <Field label="متن کپی‌رایت"><input className={inputCls + " mt-3"} value={f.copyright} onChange={(e) => setF("copyright", e.target.value)} /></Field>
      <div className="flex items-center justify-between mt-8 mb-3"><h3 className="font-bold text-sm">ستون‌های لینک</h3><button onClick={addColumn} className={btnGhost}><Plus size={12} /> ستون جدید</button></div>
      <div className="space-y-4">
        {f.columns.map((c) => (
          <div key={c.id} className={cardCls}>
            <div className="flex justify-between items-center mb-3"><input className={inputCls + " font-bold"} value={c.title} onChange={(e) => editColTitle(c.id, e.target.value)} /><button onClick={() => removeColumn(c.id)} className="mr-2 text-white/30 hover:text-red-500"><Trash2 size={16} /></button></div>
            <div className="space-y-2">
              {c.links.map((l, i) => (
                <div key={i} className="flex gap-2"><input className={inputCls} value={l.label} onChange={(e) => editLink(c.id, i, "label", e.target.value)} /><button onClick={() => removeLink(c.id, i)} className="text-white/30 hover:text-red-500 shrink-0"><Trash2 size={14} /></button></div>
              ))}
              <button onClick={() => addLink(c.id)} className={btnGhost}><Plus size={12} /> لینک جدید</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState(null);
  useEffect(() => {
    (async () => {
      try { const { orders: list } = await api.allOrders(); setOrders(list); } catch (e) { setOrders([]); }
    })();
  }, []);
  return (
    <div>
      <SectionTitle>سفارشات ثبت‌شده</SectionTitle>
      {orders === null && <p className="text-white/40 text-sm">در حال بارگذاری...</p>}
      {orders && orders.length === 0 && <p className="text-white/40 text-sm">هنوز سفارشی ثبت نشده است.</p>}
      <div className="space-y-3">
        {orders?.map((o) => (
          <div key={o.id} className={cardCls}>
            <div className="flex justify-between text-sm mb-2"><span className="font-bold">{o.customer?.name} <span className="text-white/30">({o.username})</span></span><span className="text-red-500 font-black">{toman(o.total)}</span></div>
            <p className="text-white/40 text-xs mb-1">{o.customer?.phone} — {o.customer?.address}</p>
            <p className="text-white/30 text-[11px]">{o.items.length} قلم کالا • {new Date(o.date).toLocaleString("fa-IR")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminMessages() {
  const [messages, setMessages] = useState(null);
  useEffect(() => {
    (async () => {
      try { const { messages: list } = await api.allMessages(); setMessages(list); } catch (e) { setMessages([]); }
    })();
  }, []);
  return (
    <div>
      <SectionTitle>پیام‌های تماس با ما</SectionTitle>
      {messages === null && <p className="text-white/40 text-sm">در حال بارگذاری...</p>}
      {messages && messages.length === 0 && <p className="text-white/40 text-sm">هنوز پیامی دریافت نشده است.</p>}
      <div className="space-y-3">
        {messages?.map((m) => (
          <div key={m.id} className={cardCls}>
            <div className="flex justify-between text-sm mb-2"><span className="font-bold">{m.name}</span><span className="text-white/40 text-xs">{m.phone}</span></div>
            <p className="text-white/60 text-sm mb-1">{m.message}</p>
            <p className="text-white/30 text-[11px]">{new Date(m.date).toLocaleString("fa-IR")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try { const { users: list } = await api.listUsers(); setUsers(list); } catch (e) { setUsers([]); }
  };
  useEffect(() => { load(); }, []);

  const toggleRole = async (u) => {
    setBusyId(u.id);
    try {
      await api.setUserRole(u.id, u.role === "admin" ? "user" : "admin");
      await load();
    } catch (e) { alert("تغییر نقش ناموفق بود: " + e.message); }
    setBusyId(null);
  };

  return (
    <div className="max-w-2xl">
      <SectionTitle>مدیریت کاربران</SectionTitle>
      <p className="text-white/40 text-xs mb-5">هر کاربری که از سایت ثبت‌نام کند اینجا نمایش داده می‌شود. با فعال کردن نقش «مدیر»، دسترسی کامل پنل مدیریت (واقعاً سمت سرور) به او داده می‌شود.</p>
      {users === null && <p className="text-white/40 text-sm">در حال بارگذاری...</p>}
      <div className="space-y-2">
        {users?.map((u) => (
          <div key={u.id} className="flex items-center justify-between border border-white/10 rounded-lg p-3">
            <div><p className="text-sm font-bold">{u.name}</p><p className="text-white/40 text-xs">{u.username}</p></div>
            <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: u.role === "admin" ? GOLD : undefined }}>
              <input type="checkbox" checked={u.role === "admin"} disabled={busyId === u.id} onChange={() => toggleRole(u)} className="accent-red-600" /> نقش مدیر
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminSettings({ content, update }) {
  const s = content.settings;
  const set = (k, v) => update(["settings", k], v);
  return (
    <div className="max-w-lg">
      <SectionTitle>تنظیمات کلی سایت</SectionTitle>
      <div className="space-y-4">
        <Field label="نام سایت"><input className={inputCls} value={s.siteName} onChange={(e) => set("siteName", e.target.value)} /></Field>
        <Field label="شعار سایت"><input className={inputCls} value={s.tagline} onChange={(e) => set("tagline", e.target.value)} /></Field>
        <Field label="شماره تماس"><input className={inputCls} value={s.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="آدرس"><input className={inputCls} value={s.address} onChange={(e) => set("address", e.target.value)} /></Field>
        <Field label="آیدی اینستاگرام"><input className={inputCls} value={s.instagram} onChange={(e) => set("instagram", e.target.value)} /></Field>
      </div>
    </div>
  );
}
