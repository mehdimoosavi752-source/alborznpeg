import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Menu, X, ShoppingCart, Plus, Trash2, LogOut, Lock, User, UserPlus,
  Settings, LayoutGrid, FileText, ListOrdered, Wrench, Gamepad2,
  Monitor, Cpu, Phone, MapPin, Instagram, Send, MessageCircle,
  ChevronUp, ChevronDown, Check, Package, CreditCard,
  ShieldCheck, Zap, Clock, ChevronLeft, Layers, RotateCcw, Search,
  SlidersHorizontal, BadgeCheck, Truck, Mail, ChevronRight, Users as UsersIcon,
  Eye, EyeOff, Image as ImageIcon, Type, AlignLeft, MousePointerClick,
} from "lucide-react";
import { api } from "./lib/api.js";

/* ============================== ثابت‌ها ============================== */

const uid = (p = "id") => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const toman = (n) => new Intl.NumberFormat("fa-IR").format(n) + " تومان";
const slugify = (s) => s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\u0600-\u06FF-]/g, "") || uid("p");

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

const ROLE_LABELS = { admin: "مدیر", editor: "ویرایشگر", author: "نویسنده", subscriber: "مشترک" };
const ROLE_ORDER = ["subscriber", "author", "editor", "admin"];

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
  services: [],
  products: [],
  menu: [],
  footer: { about: "", columns: [], copyright: "" },
  about: { content: "", stats: [] },
  faq: [],
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
function PatternBox({ pattern, className = "", children }) {
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
function Logo({ size = 44, dark = false }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
        <polygon points="50,3 93,26 93,74 50,97 7,74 7,26" fill={dark ? "#0a0a0a" : "#ffffff"} stroke="#dc2626" strokeWidth="3" />
        <polygon points="50,15 82,32 82,68 50,85 18,68 18,32" fill="none" stroke={dark ? "#ffffff" : "#0a0a0a"} strokeWidth="1" opacity="0.15" />
        <text x="50" y="62" textAnchor="middle" fontSize="34" fontWeight="900" fill={dark ? "#ffffff" : "#0a0a0a"} fontFamily="Arial, sans-serif">NP</text>
        <rect x="18" y="68" width="64" height="3" fill="#dc2626" />
      </svg>
      <div className="leading-tight">
        <div className={`font-black text-lg tracking-tight ${dark ? "text-white" : "text-black"}`}>نوین پلی‌تکنیک</div>
        <div className="text-[10px] tracking-widest text-red-600">TECH & PROJECTOR</div>
      </div>
    </div>
  );
}

/* ============================== پوستر انیمیشنی هیرو ============================== */

function HeroPoster() {
  return (
    <div className="relative mx-auto w-full max-w-md aspect-[4/3] select-none">
      <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full drop-shadow-xl">
        <defs>
          <linearGradient id="beamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.32" />
          </linearGradient>
        </defs>
        <polygon points="70,175 250,95 250,150 70,220" fill="url(#beamGrad)" className="poster-beam" />
        <rect x="248" y="68" width="112" height="82" rx="10" fill="#0a0a0a" />
        <rect x="256" y="76" width="96" height="66" rx="4" fill="#dc2626" opacity="0.18" className="poster-screen-glow" />
        <rect x="18" y="163" width="82" height="52" rx="12" fill="#0a0a0a" />
        <circle cx="36" cy="189" r="12" fill="#dc2626" className="poster-lens" />
        <rect x="52" y="182" width="34" height="14" rx="4" fill="#ffffff" opacity="0.12" />
      </svg>
      <div className="absolute -top-3 right-4 bg-white border border-black/10 shadow-lg rounded-2xl p-3 poster-float-1">
        <Monitor className="text-red-600" size={22} />
      </div>
      <div className="absolute bottom-6 left-0 bg-black shadow-lg rounded-2xl p-3 poster-float-2">
        <Gamepad2 className="text-red-500" size={22} />
      </div>
      <div className="absolute top-[38%] left-[28%] bg-white border border-black/10 shadow-lg rounded-2xl p-2.5 poster-float-3">
        <Cpu className="text-red-600" size={18} />
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
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const route = useHashRoute();

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
        setLoadError("اتصال به سرور برقرار نشد. سایت با محتوای پیش‌فرض (آفلاین) نمایش داده می‌شود.");
        setContent(DEFAULT_CONTENT);
      }
      await refreshPages();
      try { const st = await api.getPaymentStatus(); setPaymentStatus(st); } catch (e) { /* ignore */ }
      if (api.getToken()) {
        try { const { user } = await api.me(); setCurrentUser(user); } catch (e) { api.setToken(null); }
      }
      setLoading(false);
    })();
  }, [refreshPages]);

  const persist = useCallback(async (next) => {
    setContent(next);
    setSaving(true);
    try { await api.updateContent(next); } catch (e) { setLoadError("ذخیره‌سازی روی سرور ناموفق بود: " + e.message); }
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
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-red-100" />
            <div className="absolute inset-0 rounded-full border-2 border-t-red-600 animate-spin" />
          </div>
          <div className="text-black/50 text-sm tracking-widest">در حال بارگذاری نوین پلی‌تکنیک...</div>
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
      await api.createOrder({ items: cart, total: cartTotal, customer: form });
      setOrderDone(true); setCart([]);
    } catch (e) { alert("ثبت سفارش ناموفق بود: " + e.message); }
  };
  const sendMessage = async (form) => {
    try { await api.sendMessage(form); } catch (e) { /* خطا در خود فرم مدیریت می‌شود */ }
  };

  const role = currentUser?.role;
  const canPanel = ["admin", "editor", "author"].includes(role);
  const isAdmin = role === "admin";
  const activePage = route[0] || "home";

  return (
    <div dir="rtl" lang="fa" className="min-h-screen bg-white text-black font-sans" style={{ fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif" }}>
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
      />

      <main key={route.join("/")} className="page-fade">
        {activePage === "home" && <HomePage content={content} navigate={navigate} />}
        {activePage === "services" && <ServicesPage content={content} />}
        {activePage === "shop" && <ShopPage content={content} addToCart={addToCart} />}
        {activePage === "articles" && <ArticlesPage pages={pages} />}
        {activePage === "faq" && <FAQPage content={content} />}
        {activePage === "about" && <AboutPage content={content} />}
        {activePage === "contact" && <ContactPage content={content} onSend={sendMessage} />}
        {activePage === "account" && <AccountPage currentUser={currentUser} onGoShop={() => navigate("shop")} />}
        {activePage === "product" && <ProductDetailPage content={content} id={route[1]} addToCart={addToCart} />}
        {activePage === "page" && <CustomPageView page={pages.find((p) => p.id === route[1])} />}
      </main>

      <Footer content={content} goToUrl={goToUrl} />

      {showCart && <CartDrawer cart={cart} total={cartTotal} onClose={() => setShowCart(false)} onChangeQty={changeQty} onRemove={removeFromCart} onCheckout={() => { setShowCart(false); setShowCheckout(true); }} />}
      {showCheckout && <CheckoutModal total={cartTotal} orderDone={orderDone} onClose={() => { setShowCheckout(false); setOrderDone(false); }} onSubmit={placeOrder} currentUser={currentUser} paymentStatus={paymentStatus} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={doLogin} onRegister={doRegister} />}

      {canPanel && showAdmin && (
        <AdminPanel
          content={content} update={update} saving={saving} role={role} currentUser={currentUser}
          onClose={() => setShowAdmin(false)} onLogout={doLogout} tab={adminTab} setTab={setAdminTab}
          refreshPages={refreshPages}
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
    `}</style>
  );
}

/* ============================== هدر ============================== */

function Header({ visibleMenu, goTo, activePage, mobileMenuOpen, setMobileMenuOpen, cartCount, setShowCart, currentUser, canPanel, userMenuOpen, setUserMenuOpen, onAuthClick, onLogout, onAdminClick, onAccountClick }) {
  return (
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-white/90 border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <button onClick={() => navigate("")}><Logo /></button>
        <nav className="hidden lg:flex items-center gap-8">
          {visibleMenu.map((m) => (
            <button key={m.id} onClick={() => goTo(m)} className={`relative text-sm transition-colors group ${activePage === m.target || (m.type === "page" && activePage === "page") ? "text-red-600" : "text-black/70 hover:text-black"}`}>
              {m.label}
              <span className={`absolute -bottom-1 right-0 h-[2px] bg-red-600 transition-all duration-300 ${activePage === m.target ? "w-full" : "w-0 group-hover:w-full"}`} />
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowCart(true)} className="relative p-2 rounded-lg border border-black/15 hover:border-red-600 hover:bg-red-50 transition-colors">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="absolute -top-2 -left-2 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
          </button>

          {!currentUser ? (
            <button onClick={onAuthClick} className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors font-bold">
              <User size={14} /> ورود / ثبت‌نام
            </button>
          ) : (
            <div className="relative hidden sm:block">
              <button onClick={() => setUserMenuOpen((v) => !v)} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-black/15 hover:border-red-600 transition-colors font-bold">
                <User size={14} /> {currentUser.name}
                {canPanel && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-600">{ROLE_LABELS[currentUser.role]}</span>}
              </button>
              {userMenuOpen && (
                <div className="absolute left-0 mt-2 w-44 bg-white border border-black/10 rounded-xl overflow-hidden shadow-xl">
                  <button onClick={onAccountClick} className="w-full text-right px-4 py-2.5 text-xs hover:bg-neutral-50 flex items-center gap-2"><User size={13} /> حساب من</button>
                  {canPanel && <button onClick={onAdminClick} className="w-full text-right px-4 py-2.5 text-xs hover:bg-neutral-50 flex items-center gap-2 text-red-600"><Settings size={13} /> پنل مدیریت</button>}
                  <button onClick={onLogout} className="w-full text-right px-4 py-2.5 text-xs hover:bg-neutral-50 flex items-center gap-2 text-black/60"><LogOut size={13} /> خروج</button>
                </div>
              )}
            </div>
          )}
          <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen((v) => !v)}>{mobileMenuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-black/10 bg-white px-4 py-4 flex flex-col gap-3">
          {visibleMenu.map((m) => <button key={m.id} onClick={() => goTo(m)} className="text-right text-black/70 hover:text-red-600 py-1">{m.label}</button>)}
          {!currentUser ? (
            <button onClick={onAuthClick} className="text-right text-red-600 font-bold py-1">ورود / ثبت‌نام</button>
          ) : (
            <>
              <button onClick={onAccountClick} className="text-right text-black/70 py-1">حساب من ({currentUser.name})</button>
              {canPanel && <button onClick={onAdminClick} className="text-right py-1 font-bold text-red-600">پنل مدیریت</button>}
              <button onClick={onLogout} className="text-right text-black/60 py-1">خروج</button>
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
    <div className="border-y border-black/10 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2.5 text-black/70 text-xs sm:text-sm">
            <it.icon size={18} className="shrink-0 text-red-600" />
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
      <section className="relative pt-40 pb-24 px-4 sm:px-6 overflow-hidden bg-gradient-to-b from-white to-neutral-50">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-100 rounded-full blur-3xl blob" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-red-50 rounded-full blur-3xl blob" style={{ animationDelay: "2s" }} />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-right">
            <Reveal>
              <span className="inline-flex items-center gap-2 text-xs tracking-widest border border-red-200 bg-red-50 text-red-600 rounded-full px-4 py-1.5 mb-6">
                <Zap size={14} /> {h.eyebrow}
              </span>
            </Reveal>
            <Reveal delay={100}><h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6 text-black">{h.title}</h1></Reveal>
            <Reveal delay={200}><p className="text-black/60 text-lg max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">{h.subtitle}</p></Reveal>
            <Reveal delay={300}>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <button onClick={() => navigate("services")} className="glow-pulse bg-red-600 hover:bg-red-700 text-white transition-all px-8 py-3.5 rounded-xl font-bold hover:scale-105">{h.ctaText}</button>
                <button onClick={() => navigate("shop")} className="border border-black/20 hover:border-red-600 hover:text-red-600 transition-all px-8 py-3.5 rounded-xl font-bold hover:scale-105">{h.ctaText2}</button>
              </div>
            </Reveal>
          </div>
          <Reveal delay={150}><HeroPoster /></Reveal>
        </div>
      </section>

      <TrustBar />

      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-12">
            <span className="text-red-600 text-xs tracking-[0.3em] font-bold">همه‌چیز در یک نگاه</span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2">به کدوم بخش نیاز داری؟</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Wrench, title: "خدمات تعمیر و اورهال", desc: "لیست کامل خدمات تعمیرگاه", route: "services", pattern: "circuit" },
              { icon: Package, title: "فروشگاه پروژکتور", desc: "خرید اورجینال با گارانتی", route: "shop", pattern: "hex" },
              { icon: FileText, title: "مقالات آموزشی", desc: "نکات نگهداری و راهنمای خرید", route: "articles", pattern: "scan" },
              { icon: MessageCircle, title: "سوالات رایج", desc: "پاسخ سوالات پرتکرار مشتریان", route: "faq", pattern: "dots" },
              { icon: UsersIcon, title: "درباره ما", desc: "آشنایی با نوین پلی‌تکنیک", route: "about", pattern: "grid" },
              { icon: Mail, title: "تماس با ما", desc: "راه‌های ارتباطی و آدرس", route: "contact", pattern: "wave" },
            ].map((item, idx) => (
              <Reveal key={item.route} delay={idx * 60}>
                <button onClick={() => navigate(item.route)} className="group w-full text-right rounded-2xl overflow-hidden border border-black/10 hover:border-red-600 hover:shadow-lg transition-all duration-300 bg-white">
                  <PatternBox pattern={item.pattern} className="h-20 flex items-center justify-center">
                    <item.icon className="text-white group-hover:scale-110 transition-transform duration-300" size={30} />
                  </PatternBox>
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold mb-1">{item.title}</h3>
                      <p className="text-black/50 text-xs">{item.desc}</p>
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

function ServiceCard({ s }) {
  return (
    <TiltCard className="group relative rounded-2xl overflow-hidden border border-black/10 hover:border-red-600 hover:shadow-lg transition-all duration-300 h-full bg-white">
      <PatternBox pattern={s.pattern} className="h-28 flex items-center justify-center">
        <IconBadge name={s.icon} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-300" size={38} />
      </PatternBox>
      <div className="p-6">
        <h3 className="font-bold text-lg mb-2">{s.title}</h3>
        <p className="text-black/60 text-sm leading-relaxed">{s.desc}</p>
      </div>
    </TiltCard>
  );
}

/* ============================== صفحه خدمات ============================== */

function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <section className="relative pt-36 pb-14 px-4 sm:px-6 border-b border-black/10 overflow-hidden bg-neutral-50">
      <div className="absolute -top-10 -right-10 w-72 h-72 bg-red-100 rounded-full blur-3xl blob" />
      <div className="relative max-w-4xl mx-auto text-center">
        <span className="text-red-600 text-xs tracking-[0.3em] font-bold">{eyebrow}</span>
        <h1 className="text-3xl sm:text-5xl font-black mt-3">{title}</h1>
        {subtitle && <p className="text-black/60 mt-4 max-w-xl mx-auto">{subtitle}</p>}
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
          {content.services.map((s, idx) => <Reveal key={s.id} delay={idx * 70}><ServiceCard s={s} /></Reveal>)}
        </div>
      </section>
      <TrustBar />
    </div>
  );
}

/* ============================== محیط فروشگاه ============================== */

function ProductCard({ p, onAdd, dark }) {
  return (
    <TiltCard className={`group rounded-2xl overflow-hidden border transition-colors duration-300 h-full flex flex-col ${dark ? "border-white/10 hover:border-red-600 bg-neutral-900" : "border-black/10 hover:border-red-600 bg-white"}`}>
      <button onClick={() => navigate(`product/${p.id}`)} className="text-right">
        <PatternBox pattern={p.pattern} className="h-40 flex items-center justify-center">
          <IconBadge name={p.icon} className="text-white group-hover:scale-110 transition-transform duration-300" size={52} />
          <span className="absolute top-3 left-3 text-[10px] bg-white/90 text-red-600 rounded-full px-2 py-1 font-bold">{p.warranty} گارانتی</span>
          <span className="absolute top-3 right-3 text-[10px] bg-black/70 border border-red-500/50 rounded-full px-2 py-1 text-red-400">{p.category}</span>
        </PatternBox>
      </button>
      <div className="p-5 flex flex-col flex-1">
        <div className={`flex items-center justify-between mb-1 text-[11px] ${dark ? "text-white/40" : "text-black/40"}`}>
          <span>{p.brand}</span><span>{p.resolution}</span>
        </div>
        <button onClick={() => navigate(`product/${p.id}`)} className="text-right"><h3 className={`font-bold mb-2 hover:text-red-600 transition-colors ${dark ? "text-white" : "text-black"}`}>{p.name}</h3></button>
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className={`text-[10px] rounded-full px-2 py-0.5 ${dark ? "bg-white/5 border border-white/10 text-white/50" : "bg-black/5 border border-black/10 text-black/50"}`}>{p.technology}</span>
          <span className={`text-[10px] rounded-full px-2 py-0.5 ${dark ? "bg-white/5 border border-white/10 text-white/50" : "bg-black/5 border border-black/10 text-black/50"}`}>{p.lumens} لومن</span>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-red-600 font-black">{toman(p.price)}</span>
          <button onClick={onAdd} className="text-xs bg-red-600 hover:bg-red-700 text-white transition-colors px-3 py-2 rounded-lg font-bold flex items-center gap-1"><Plus size={14} /> افزودن</button>
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
    <div className="bg-white min-h-screen">
      <section className="relative pt-36 pb-10 px-4 sm:px-6 overflow-hidden border-b border-black/10 bg-black">
        <div className="relative max-w-7xl mx-auto text-center">
          <span className="text-xs tracking-[0.3em] font-bold text-red-500">فروشگاه اورجینال</span>
          <h1 className="text-3xl sm:text-5xl font-black mt-3 text-white">ویدئو پروژکتور</h1>
          <p className="text-white/60 mt-3 max-w-xl mx-auto">واردات مستقیم و مرجع فروش معتبرترین برندهای ویدئو پروژکتور با گارانتی معتبر</p>
          <div className="max-w-md mx-auto mt-6 relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی مدل یا برند..." className="w-full bg-neutral-900 border border-white/15 focus:border-red-600 outline-none rounded-xl pr-9 pl-4 py-3 text-sm text-white" />
          </div>
        </div>
      </section>

      <TrustBar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-[240px_1fr] gap-8">
        <aside className="lg:sticky lg:top-24 h-fit bg-neutral-50 border border-black/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4 text-sm font-bold"><SlidersHorizontal size={15} className="text-red-600" /> فیلترها</div>
          <div className="mb-6">
            <p className="text-xs text-black/40 mb-2">دسته‌بندی</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button key={c} onClick={() => setActiveCat(c)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${activeCat === c ? "bg-red-600 border-red-600 text-white" : "border-black/15 text-black/60 hover:border-red-600"}`}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-black/40 mb-2">برند</p>
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
          <p className="text-black/40 text-xs mb-4">{filtered.length} محصول یافت شد</p>
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-black/40 text-sm">محصولی با این فیلتر پیدا نشد.</div>
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
  if (!p) return <div className="pt-40 pb-24 text-center text-black/50">محصول یافت نشد.</div>;
  const related = content.products.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 3);
  const specs = [["برند", p.brand], ["دسته‌بندی", p.category], ["تکنولوژی", p.technology], ["رزولوشن", p.resolution], ["روشنایی", `${p.lumens} لومن`], ["گارانتی", p.warranty], ["موجودی", p.stock > 0 ? `${p.stock} عدد` : "ناموجود"]];
  return (
    <div className="pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate("shop")} className="flex items-center gap-1.5 text-black/50 hover:text-red-600 text-sm mb-8"><ChevronRight size={16} /> بازگشت به فروشگاه</button>
        <div className="grid md:grid-cols-2 gap-10">
          <PatternBox pattern={p.pattern} className="h-80 md:h-full min-h-[320px] rounded-2xl flex items-center justify-center">
            <IconBadge name={p.icon} size={110} className="text-white" />
          </PatternBox>
          <div>
            <div className="flex gap-2 mb-3">
              <span className="text-[11px] border border-red-200 bg-red-50 rounded-full px-2.5 py-1 text-red-600">{p.warranty} گارانتی</span>
              <span className="text-[11px] border border-black/15 rounded-full px-2.5 py-1 text-black/60">{p.category}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mb-3">{p.name}</h1>
            <p className="text-black/60 leading-relaxed mb-6">{p.desc}</p>
            <div className="border border-black/10 rounded-xl overflow-hidden mb-6">
              {specs.map(([k, v], i) => (
                <div key={k} className={`flex justify-between text-sm px-4 py-2.5 ${i % 2 ? "bg-neutral-50" : ""}`}><span className="text-black/40">{k}</span><span className="font-bold">{v}</span></div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-red-600">{toman(p.price)}</span>
              <button onClick={() => addToCart(p)} className="glow-pulse bg-red-600 hover:bg-red-700 text-white transition-colors px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Plus size={16} /> افزودن به سبد</button>
            </div>
          </div>
        </div>
        {related.length > 0 && (
          <div className="mt-20">
            <h3 className="font-bold text-lg mb-6">محصولات مرتبط</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{related.map((r) => <ProductCard key={r.id} p={r} onAdd={() => addToCart(r)} />)}</div>
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
          <Reveal><p className="text-black/65 leading-loose text-lg">{a.content}</p></Reveal>
          <Reveal delay={150}>
            <div className="grid grid-cols-3 gap-4 mt-12 max-w-lg mx-auto">
              {a.stats.map(([n, l]) => (
                <div key={l} className="border border-black/10 rounded-xl py-5"><div className="text-2xl font-black text-red-600">{n}</div><div className="text-xs text-black/50 mt-1">{l}</div></div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

/* ============================== مقالات ============================== */

function getExcerpt(blocks) {
  const p = blocks.find((b) => b.type === "paragraph");
  if (!p) return "";
  return p.content.length > 130 ? p.content.slice(0, 130) + "..." : p.content;
}

function ArticlesPage({ pages }) {
  const articles = pages.filter((p) => p.isArticle).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  return (
    <div>
      <PageHeader eyebrow="وبلاگ نوین پلی‌تکنیک" title="مقالات آموزشی" subtitle="نکات نگهداری، راهنمای خرید و آموزش‌های تخصصی کامپیوتر، پلی‌استیشن و پروژکتور" />
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {articles.length === 0 ? (
            <p className="text-black/40 text-sm text-center py-12">هنوز مقاله‌ای منتشر نشده است.</p>
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
                        <p className="text-[11px] text-black/40 mb-1">{new Date(a.updatedAt).toLocaleDateString("fa-IR")} · {a.authorName}</p>
                        <h3 className="font-bold mb-2 group-hover:text-red-600 transition-colors">{a.title}</h3>
                        <p className="text-black/55 text-sm leading-relaxed">{getExcerpt(a.blocks)}</p>
                        <span className="mt-3 inline-flex items-center gap-1 text-red-600 text-xs">ادامه مطلب <ChevronLeft size={13} /></span>
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

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-black/10 rounded-xl overflow-hidden bg-white">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between text-right p-4 font-bold text-sm">
        {item.question}
        <ChevronDown className={`text-red-600 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} size={18} />
      </button>
      {open && <div className="px-4 pb-4 text-black/60 text-sm leading-relaxed">{item.answer}</div>}
    </div>
  );
}

function FAQPage({ content }) {
  return (
    <div>
      <PageHeader eyebrow="پشتیبانی" title="سوالات متداول" subtitle="پاسخ سوالات پرتکرار درباره‌ی خدمات تعمیر و خرید از فروشگاه" />
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-3">
          {content.faq.length === 0 ? (
            <p className="text-black/40 text-sm text-center py-12">فعلاً سوالی ثبت نشده است.</p>
          ) : content.faq.map((item, idx) => <Reveal key={item.id} delay={idx * 50}><FAQItem item={item} /></Reveal>)}
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
          <form onSubmit={submit} className="border border-black/10 rounded-2xl p-6 bg-neutral-50 space-y-3">
            {sent && <p className="text-xs bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2">پیام شما ارسال شد، به‌زودی با شما تماس می‌گیریم.</p>}
            <input required placeholder="نام شما" className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required placeholder="شماره تماس" className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <textarea required rows={4} placeholder="پیام شما" className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <button className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Mail size={16} /> ارسال پیام</button>
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

function AccountPage({ currentUser, onGoShop }) {
  const [orders, setOrders] = useState(null);
  useEffect(() => {
    if (!currentUser) return;
    (async () => { try { const { orders: list } = await api.myOrders(); setOrders(list); } catch (e) { setOrders([]); } })();
  }, [currentUser]);

  if (!currentUser) return <div className="pt-40 pb-24 text-center text-black/50">برای مشاهده این صفحه ابتدا وارد شوید.</div>;

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center"><User className="text-red-600" size={24} /></div>
        <div>
          <h1 className="font-black text-xl">{currentUser.name}</h1>
          <p className="text-black/40 text-xs">{currentUser.username} — {ROLE_LABELS[currentUser.role]}</p>
        </div>
      </div>
      <h3 className="font-bold mb-4">سفارش‌های من</h3>
      {orders === null && <p className="text-black/40 text-sm">در حال بارگذاری...</p>}
      {orders && orders.length === 0 && (
        <div className="text-center py-12 border border-black/10 rounded-xl">
          <p className="text-black/40 text-sm mb-4">هنوز سفارشی ثبت نکرده‌اید.</p>
          <button onClick={onGoShop} className="text-red-600 text-sm">رفتن به فروشگاه</button>
        </div>
      )}
      <div className="space-y-3">
        {orders?.map((o) => (
          <div key={o.id} className="border border-black/10 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-1"><span className="font-bold">{o.items.length} قلم کالا</span><span className="text-red-600 font-black">{toman(o.total)}</span></div>
            <p className="text-black/30 text-[11px]">{new Date(o.date).toLocaleString("fa-IR")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== صفحه سفارشی (بلوک‌محور، مثل وردپرس) ============================== */

function BlockRenderer({ block }) {
  switch (block.type) {
    case "heading": return <h2 className="text-2xl sm:text-3xl font-black mb-4 mt-8 first:mt-0">{block.content}</h2>;
    case "image": return (
      <PatternBox pattern="grid" className="h-56 rounded-2xl flex items-center justify-center mb-6">
        <div className="text-center">
          <ImageIcon className="text-white/70 mx-auto mb-2" size={32} />
          {block.content && <p className="text-white/70 text-xs">{block.content}</p>}
        </div>
      </PatternBox>
    );
    case "button": return <a href={block.url || "#"} className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold mb-6 transition-colors">{block.content}</a>;
    default: return <p className="text-black/70 leading-loose mb-4 whitespace-pre-line">{block.content}</p>;
  }
}

function CustomPageView({ page }) {
  if (!page) return <div className="pt-40 pb-24 text-center text-black/50">صفحه یافت نشد.</div>;
  return (
    <section className="pt-36 pb-24 px-4 sm:px-6 min-h-[60vh]">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("")} className="flex items-center gap-1.5 text-red-600 text-sm mb-8"><ChevronRight size={16} /> بازگشت به خانه</button>
        <h1 className="text-3xl sm:text-4xl font-black mb-6">{page.title}</h1>
        {page.blocks.map((b) => <BlockRenderer key={b.id} block={b} />)}
      </div>
    </section>
  );
}

/* ============================== فوتر ============================== */

function Footer({ content, goToUrl }) {
  const f = content.footer;
  const s = content.settings;
  return (
    <footer className="border-t border-black/10 bg-black text-white pt-16 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        <div>
          <Logo size={40} dark />
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
            <ul className="space-y-2">{col.links.map((l, i) => <li key={i}><button onClick={() => goToUrl(l.url)} className="text-white/50 hover:text-red-500 text-sm transition-colors">{l.label}</button></li>)}</ul>
          </div>
        ))}
        <div>
          <h4 className="font-bold mb-4">اطلاعات تماس</h4>
          <ul className="space-y-2 text-sm text-white/50"><li>{s.phone}</li><li>{s.address}</li></ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-white/10 pt-6 text-center"><p className="text-white/40 text-xs">{f.copyright}</p></div>
    </footer>
  );
}

/* ============================== سبد خرید ============================== */

function CartDrawer({ cart, total, onClose, onChangeQty, onRemove, onCheckout }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm h-full bg-white border-l border-black/10 flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-black/10">
          <h3 className="font-bold flex items-center gap-2"><ShoppingCart size={18} className="text-red-600" /> سبد خرید</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 && <p className="text-black/40 text-sm text-center mt-10">سبد خرید شما خالی است</p>}
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-3 border-b border-black/10 pb-4">
              <PatternBox pattern={item.pattern} className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0"><IconBadge name={item.icon} size={22} className="text-white" /></PatternBox>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{item.name}</p>
                <p className="text-red-600 text-xs font-bold mt-1">{toman(item.price)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => onChangeQty(item.id, -1)} className="w-6 h-6 rounded bg-black/5 hover:bg-black/10">-</button>
                  <span className="text-xs w-4 text-center">{item.qty}</span>
                  <button onClick={() => onChangeQty(item.id, 1)} className="w-6 h-6 rounded bg-black/5 hover:bg-black/10">+</button>
                  <button onClick={() => onRemove(item.id)} className="mr-auto text-black/30 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="p-5 border-t border-black/10">
            <div className="flex justify-between mb-4 text-sm"><span className="text-black/60">جمع کل</span><span className="font-black text-red-600">{toman(total)}</span></div>
            <button onClick={onCheckout} className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors py-3 rounded-xl font-bold flex items-center justify-center gap-2"><CreditCard size={16} /> تسویه حساب</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== پرداخت ============================== */

function CheckoutModal({ total, onClose, onSubmit, orderDone, currentUser, paymentStatus }) {
  const [form, setForm] = useState({ name: currentUser?.name || "", phone: "", address: "" });
  const [processing, setProcessing] = useState(false);
  const submit = async (e) => { e.preventDefault(); setProcessing(true); await new Promise((r) => setTimeout(r, 1200)); await onSubmit(form); setProcessing(false); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white border border-black/10 rounded-2xl p-6">
        <button onClick={onClose} className="absolute top-4 left-4 text-black/40 hover:text-black"><X size={18} /></button>
        {orderDone ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4"><Check className="text-red-600" size={28} /></div>
            <h3 className="text-xl font-black mb-2">سفارش شما ثبت شد!</h3>
            <p className="text-black/50 text-sm">همکاران ما به‌زودی برای هماهنگی ارسال با شما تماس می‌گیرند.</p>
            <button onClick={onClose} className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold">متوجه شدم</button>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2"><CreditCard size={18} className="text-red-600" /> نهایی‌سازی خرید</h3>
            <p className="text-black/40 text-xs mb-5">اطلاعات ارسال را وارد کنید</p>
            <form onSubmit={submit} className="space-y-3">
              <input required placeholder="نام و نام خانوادگی" className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required placeholder="شماره موبایل" className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <textarea required placeholder="آدرس دقیق" rows={3} className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm resize-none" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <div className="flex justify-between items-center py-3 border-t border-black/10 text-sm"><span className="text-black/60">مبلغ قابل پرداخت</span><span className="font-black text-red-600">{toman(total)}</span></div>
              <button disabled={processing} className="w-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 transition-colors py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                {processing ? "در حال اتصال به درگاه..." : paymentStatus?.enabled ? `پرداخت با ${paymentStatus.provider}` : "پرداخت آنلاین"}
              </button>
              <p className="text-black/30 text-[11px] text-center leading-relaxed pt-1">
                {paymentStatus?.enabled ? "پرداخت شما از طریق درگاه بانکی معتبر انجام می‌شود." : "این بخش شبیه‌سازی درگاه پرداخت است؛ مدیر سایت هنوز اطلاعات درگاه واقعی را در پنل وارد نکرده است."}
              </p>
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white border border-black/10 rounded-2xl p-6">
        <button onClick={onClose} className="absolute top-4 left-4 text-black/40 hover:text-black"><X size={18} /></button>
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-3">
            {mode === "login" ? <Lock className="text-red-600" size={22} /> : <UserPlus className="text-red-600" size={22} />}
          </div>
          <h3 className="font-bold text-lg">{mode === "login" ? "ورود به حساب کاربری" : "ثبت‌نام کاربر جدید"}</h3>
        </div>
        <div className="flex bg-black/5 rounded-lg p-1 mb-5">
          <button onClick={() => { setMode("login"); setError(""); }} className={`flex-1 text-xs py-2 rounded-md transition-colors ${mode === "login" ? "bg-red-600 text-white font-bold" : "text-black/50"}`}>ورود</button>
          <button onClick={() => { setMode("register"); setError(""); }} className={`flex-1 text-xs py-2 rounded-md transition-colors ${mode === "register" ? "bg-red-600 text-white font-bold" : "text-black/50"}`}>ثبت‌نام</button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && <input required placeholder="نام و نام خانوادگی" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" />}
          <input required placeholder="نام کاربری" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" />
          <input required type="password" placeholder="رمز عبور" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white border border-black/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm" />
          {error && <p className="text-red-600 text-xs text-center">{error}</p>}
          <button disabled={busy} className="w-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 transition-colors py-2.5 rounded-xl font-bold">{busy ? "در حال بررسی..." : mode === "login" ? "ورود" : "ثبت‌نام"}</button>
        </form>
      </div>
    </div>
  );
}

/* ============================== پنل مدیریت (طراحی شبیه وردپرس) ============================== */

const ALL_ADMIN_TABS = [
  { id: "dashboard", label: "داشبورد", icon: LayoutGrid, roles: ["admin", "editor", "author"] },
  { id: "pages", label: "صفحات", icon: FileText, roles: ["admin", "editor", "author"] },
  { id: "hero", label: "بخش هیرو", icon: Zap, roles: ["admin", "editor"] },
  { id: "services", label: "خدمات", icon: Wrench, roles: ["admin", "editor"] },
  { id: "products", label: "محصولات", icon: Package, roles: ["admin", "editor"] },
  { id: "menu", label: "منو", icon: ListOrdered, roles: ["admin", "editor"] },
  { id: "footer", label: "فوتر", icon: Layers, roles: ["admin", "editor"] },
  { id: "faq", label: "سوالات رایج", icon: MessageCircle, roles: ["admin", "editor"] },
  { id: "orders", label: "سفارشات", icon: ShoppingCart, roles: ["admin"] },
  { id: "messages", label: "پیام‌ها", icon: Mail, roles: ["admin"] },
  { id: "users", label: "کاربران", icon: UsersIcon, roles: ["admin"] },
  { id: "payment", label: "درگاه پرداخت", icon: CreditCard, roles: ["admin"] },
  { id: "settings", label: "تنظیمات", icon: Settings, roles: ["admin"] },
];

function AdminPanel({ content, update, onClose, onLogout, tab, setTab, saving, role, currentUser, refreshPages }) {
  const tabs = ALL_ADMIN_TABS.filter((t) => t.roles.includes(role));
  useEffect(() => { if (!tabs.find((t) => t.id === tab)) setTab("dashboard"); }, []); // eslint-disable-line
  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col" dir="rtl">
      <div className="h-16 border-b border-black/10 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-neutral-900 text-white">
        <div className="flex items-center gap-3">
          <Logo size={32} dark />
          <span className="text-xs text-white/40 hidden sm:inline">پنل مدیریت · {ROLE_LABELS[role]}</span>
          {saving && <span className="text-[10px] text-red-400 flex items-center gap-1"><RotateCcw size={10} className="animate-spin" /> در حال ذخیره...</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-xs border border-white/20 hover:border-red-500 rounded-lg px-3 py-2">مشاهده سایت</button>
          <button onClick={onLogout} className="text-xs bg-red-600 hover:bg-red-500 rounded-lg px-3 py-2 flex items-center gap-1.5 font-bold"><LogOut size={14} /> خروج</button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-16 sm:w-56 border-l border-black/10 py-4 flex flex-col gap-1 overflow-y-auto shrink-0 bg-neutral-900">
          {tabs.map((t) => {
            const Ico = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${tab === t.id ? "bg-red-600/15 text-red-400 border-r-2 border-red-500" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                <Ico size={16} className="shrink-0" /> <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-neutral-50">
          {tab === "dashboard" && <AdminDashboard content={content} role={role} currentUser={currentUser} />}
          {tab === "pages" && <AdminPages role={role} currentUser={currentUser} refreshPages={refreshPages} />}
          {tab === "hero" && <AdminHero content={content} update={update} />}
          {tab === "services" && <AdminServices content={content} update={update} />}
          {tab === "products" && <AdminProducts content={content} update={update} />}
          {tab === "menu" && <AdminMenu content={content} update={update} />}
          {tab === "footer" && <AdminFooter content={content} update={update} />}
          {tab === "faq" && <AdminFAQ content={content} update={update} />}
          {tab === "orders" && <AdminOrders />}
          {tab === "messages" && <AdminMessages />}
          {tab === "users" && <AdminUsers />}
          {tab === "payment" && <AdminPayment />}
          {tab === "settings" && <AdminSettings content={content} update={update} />}
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

function AdminDashboard({ content, role, currentUser }) {
  const [userCount, setUserCount] = useState(null);
  useEffect(() => { if (role === "admin") api.listUsers().then(({ users }) => setUserCount(users.length)).catch(() => {}); }, [role]);
  const stats = [
    { label: "خدمات", value: content.services.length, icon: Wrench },
    { label: "محصولات", value: content.products.length, icon: Package },
  ];
  if (role === "admin") stats.push({ label: "کاربران", value: userCount ?? "…", icon: UsersIcon });
  return (
    <div>
      <SectionTitle>خوش آمدید، {currentUser?.name} 👋</SectionTitle>
      <p className="text-black/50 text-sm mb-8">
        نقش شما: <b>{ROLE_LABELS[role]}</b> — {role === "admin" && "دسترسی کامل به همه‌ی بخش‌ها."} {role === "editor" && "می‌توانید همه‌ی محتوای سایت (خدمات، محصولات، منو، فوتر، صفحات) را ویرایش کنید."} {role === "author" && "می‌توانید صفحات جدید بسازید و فقط صفحات خودتان را ویرایش کنید."}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => <div key={s.label} className={cardCls}><s.icon className="text-red-600 mb-2" size={20} /><div className="text-2xl font-black">{s.value}</div><div className="text-xs text-black/40 mt-1">{s.label}</div></div>)}
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
        <p className="text-xs text-black/40">پوستر انیمیشنی هیرو (تصویر پروژکتور و نور) خودکار طراحی شده و همیشه با برند سایت هماهنگ می‌ماند.</p>
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
            <div className="flex justify-between items-start mb-3"><input className={inputCls + " font-bold"} value={s.title} onChange={(e) => editItem(s.id, "title", e.target.value)} /><button onClick={() => removeItem(s.id)} className="mr-2 text-black/30 hover:text-red-600 shrink-0"><Trash2 size={16} /></button></div>
            <textarea rows={2} className={inputCls + " mb-3"} value={s.desc} onChange={(e) => editItem(s.id, "desc", e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-[10px] text-black/40 mb-1 block">آیکون</span><IconPicker value={s.icon} onChange={(v) => editItem(s.id, "icon", v)} /></div>
              <div><span className="text-[10px] text-black/40 mb-1 block">تصویر زمینه</span><PatternPicker value={s.pattern} onChange={(v) => editItem(s.id, "pattern", v)} /></div>
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
            <div className="flex justify-between items-start mb-3"><input className={inputCls + " font-bold"} value={p.name} onChange={(e) => editItem(p.id, "name", e.target.value)} /><button onClick={() => removeItem(p.id)} className="mr-2 text-black/30 hover:text-red-600 shrink-0"><Trash2 size={16} /></button></div>
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
              <div><span className="text-[10px] text-black/40 mb-1 block">آیکون محصول</span><IconPicker value={p.icon} onChange={(v) => editItem(p.id, "icon", v)} /></div>
              <div><span className="text-[10px] text-black/40 mb-1 block">تصویر زمینه</span><PatternPicker value={p.pattern} onChange={(v) => editItem(p.id, "pattern", v)} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- صفحات: ویرایشگر بلوکی مثل وردپرس ---------- */

const BLOCK_TYPES = [
  { type: "heading", label: "عنوان", icon: Type },
  { type: "paragraph", label: "پاراگراف", icon: AlignLeft },
  { type: "image", label: "تصویر", icon: ImageIcon },
  { type: "button", label: "دکمه", icon: MousePointerClick },
];

function AdminPages({ role, currentUser, refreshPages }) {
  const [pages, setPages] = useState(null);
  const [editing, setEditing] = useState(null); // page object being edited, or "new"

  const load = async () => {
    try { const { pages: list } = await api.getPagesAdmin(); setPages(list); } catch (e) { setPages([]); }
  };
  useEffect(() => { load(); }, []);

  const startNew = () => setEditing({ id: null, title: "صفحه جدید", slug: "", blocks: [{ id: uid("blk"), type: "paragraph", content: "" }], showInMenu: false, isArticle: false, status: "published" });
  const startEdit = (p) => setEditing({ ...p, blocks: p.blocks.map((b) => ({ ...b })) });

  const save = async () => {
    const payload = { title: editing.title, slug: editing.slug || slugify(editing.title), blocks: editing.blocks, showInMenu: editing.showInMenu, isArticle: editing.isArticle, status: editing.status };
    try {
      if (editing.id) await api.updatePage(editing.id, payload);
      else await api.createPage(payload);
      setEditing(null);
      await load();
      await refreshPages();
    } catch (e) { alert("ذخیره ناموفق بود: " + e.message); }
  };
  const remove = async (id) => {
    if (!confirm("این صفحه حذف شود؟")) return;
    try { await api.deletePage(id); await load(); await refreshPages(); } catch (e) { alert("حذف ناموفق بود: " + e.message); }
  };

  const canEditPage = (p) => role !== "author" || p.authorId === currentUser.id;

  if (editing) {
    return <PageEditor page={editing} setPage={setEditing} onSave={save} onCancel={() => setEditing(null)} />;
  }

  return (
    <div>
      <SectionTitle action={<button onClick={startNew} className={btnPrimary}><Plus size={14} /> صفحه جدید</button>}>مدیریت صفحات</SectionTitle>
      {role === "author" && <p className="text-xs text-black/40 mb-4">شما فقط صفحاتی را می‌بینید که خودتان ساخته‌اید.</p>}
      {pages === null && <p className="text-black/40 text-sm">در حال بارگذاری...</p>}
      <div className="space-y-3">
        {pages?.map((p) => (
          <div key={p.id} className={cardCls + " flex items-center justify-between"}>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm">{p.title}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.status === "published" ? "bg-green-50 text-green-700 border border-green-200" : "bg-yellow-50 text-yellow-700 border border-yellow-200"}`}>{p.status === "published" ? "منتشرشده" : "پیش‌نویس"}</span>
                {p.showInMenu && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">در منو</span>}
                {p.isArticle && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">مقاله</span>}
              </div>
              <p className="text-black/40 text-xs mt-1">نویسنده: {p.authorName} · slug: {p.slug}</p>
            </div>
            {canEditPage(p) ? (
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => startEdit(p)} className={btnGhost}>ویرایش</button>
                <button onClick={() => remove(p.id)} className="text-black/30 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            ) : <span className="text-[10px] text-black/30">فقط قابل مشاهده</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PageEditor({ page, setPage, onSave, onCancel }) {
  const set = (k, v) => setPage({ ...page, [k]: v });
  const setBlock = (id, patch) => set("blocks", page.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const addBlock = (type) => set("blocks", [...page.blocks, { id: uid("blk"), type, content: "", url: "" }]);
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
          <button onClick={onCancel} className={btnGhost}>انصراف</button>
          <button onClick={onSave} className={btnPrimary}>ذخیره صفحه</button>
        </div>
      }>{page.id ? "ویرایش صفحه" : "صفحه جدید"}</SectionTitle>

      <div className="space-y-4 mb-8">
        <Field label="عنوان صفحه"><input className={inputCls} value={page.title} onChange={(e) => set("title", e.target.value)} /></Field>
        <Field label="نامک (slug) — در آدرس صفحه استفاده می‌شود"><input className={inputCls} value={page.slug} onChange={(e) => set("slug", e.target.value)} placeholder="مثلاً: rules" /></Field>
        <div className="flex items-center gap-6 flex-wrap">
          <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={page.showInMenu} onChange={(e) => set("showInMenu", e.target.checked)} className="accent-red-600" /> نمایش در منوی سایت</label>
          <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={page.isArticle} onChange={(e) => set("isArticle", e.target.checked)} className="accent-red-600" /> نمایش در صفحه‌ی «مقالات»</label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <span>وضعیت:</span>
            <select className={inputCls + " w-auto"} value={page.status} onChange={(e) => set("status", e.target.value)}>
              <option value="published">منتشرشده</option>
              <option value="draft">پیش‌نویس</option>
            </select>
          </label>
        </div>
      </div>

      <h3 className="font-bold text-sm mb-3">بلوک‌های محتوا</h3>
      <div className="space-y-3 mb-4">
        {page.blocks.map((b, i) => (
          <div key={b.id} className={cardCls}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-red-600">{BLOCK_TYPES.find((t) => t.type === b.type)?.label}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => moveBlock(b.id, -1)} disabled={i === 0} className="disabled:opacity-20"><ChevronUp size={14} /></button>
                <button onClick={() => moveBlock(b.id, 1)} disabled={i === page.blocks.length - 1} className="disabled:opacity-20"><ChevronDown size={14} /></button>
                <button onClick={() => removeBlock(b.id)} className="text-black/30 hover:text-red-600 mr-2"><Trash2 size={14} /></button>
              </div>
            </div>
            {b.type === "paragraph" ? (
              <textarea rows={3} className={inputCls} value={b.content} onChange={(e) => setBlock(b.id, { content: e.target.value })} placeholder="متن پاراگراف..." />
            ) : b.type === "image" ? (
              <input className={inputCls} value={b.content} onChange={(e) => setBlock(b.id, { content: e.target.value })} placeholder="زیرنویس تصویر (توضیح کوتاه)" />
            ) : b.type === "button" ? (
              <div className="grid grid-cols-2 gap-2">
                <input className={inputCls} value={b.content} onChange={(e) => setBlock(b.id, { content: e.target.value })} placeholder="متن دکمه" />
                <input className={inputCls} value={b.url} onChange={(e) => setBlock(b.id, { url: e.target.value })} placeholder="لینک (مثلاً #/shop)" />
              </div>
            ) : (
              <input className={inputCls} value={b.content} onChange={(e) => setBlock(b.id, { content: e.target.value })} placeholder="متن عنوان" />
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {BLOCK_TYPES.map((t) => <button key={t.type} onClick={() => addBlock(t.type)} className={btnGhost}><t.icon size={12} /> افزودن {t.label}</button>)}
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
      <p className="text-black/40 text-xs mb-5">ترتیب، عنوان و نمایش/عدم‌نمایش آیتم‌های ثابت منو را کنترل کنید. صفحاتی که در بخش «صفحات» گزینه‌ی «نمایش در منو» را فعال کرده باشند، خودکار به انتهای منو اضافه می‌شوند.</p>
      <div className="space-y-2">
        {sorted.map((m, i) => (
          <div key={m.id} className="flex items-center gap-3 border border-black/10 rounded-lg p-3 bg-white">
            <div className="flex flex-col"><button onClick={() => move(m.id, -1)} disabled={i === 0} className="disabled:opacity-20"><ChevronUp size={14} /></button><button onClick={() => move(m.id, 1)} disabled={i === sorted.length - 1} className="disabled:opacity-20"><ChevronDown size={14} /></button></div>
            <input className={inputCls} value={m.label} onChange={(e) => editLabel(m.id, e.target.value)} />
            <label className="flex items-center gap-1.5 text-xs text-black/50 shrink-0 cursor-pointer"><input type="checkbox" checked={m.visible} onChange={() => toggle(m.id)} className="accent-red-600" /> نمایش</label>
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
            <div className="flex justify-between items-center mb-3"><input className={inputCls + " font-bold"} value={c.title} onChange={(e) => editColTitle(c.id, e.target.value)} /><button onClick={() => removeColumn(c.id)} className="mr-2 text-black/30 hover:text-red-600"><Trash2 size={16} /></button></div>
            <div className="space-y-2">
              {c.links.map((l, i) => (
                <div key={i} className="flex gap-2"><input className={inputCls} value={l.label} onChange={(e) => editLink(c.id, i, "label", e.target.value)} /><button onClick={() => removeLink(c.id, i)} className="text-black/30 hover:text-red-600 shrink-0"><Trash2 size={14} /></button></div>
              ))}
              <button onClick={() => addLink(c.id)} className={btnGhost}><Plus size={12} /> لینک جدید</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminFAQ({ content, update }) {
  const set = (list) => update(["faq"], list);
  const addItem = () => set([...content.faq, { id: uid("faq"), question: "سوال جدید", answer: "پاسخ این سوال را وارد کنید" }]);
  const removeItem = (id) => set(content.faq.filter((f) => f.id !== id));
  const editItem = (id, key, val) => set(content.faq.map((f) => (f.id === id ? { ...f, [key]: val } : f)));
  return (
    <div className="max-w-2xl">
      <SectionTitle action={<button onClick={addItem} className={btnPrimary}><Plus size={14} /> سوال جدید</button>}>مدیریت سوالات رایج</SectionTitle>
      <div className="space-y-3">
        {content.faq.map((f) => (
          <div key={f.id} className={cardCls}>
            <div className="flex justify-between items-start mb-2 gap-2">
              <input className={inputCls + " font-bold"} value={f.question} onChange={(e) => editItem(f.id, "question", e.target.value)} placeholder="متن سوال" />
              <button onClick={() => removeItem(f.id)} className="text-black/30 hover:text-red-600 shrink-0"><Trash2 size={16} /></button>
            </div>
            <textarea rows={2} className={inputCls} value={f.answer} onChange={(e) => editItem(f.id, "answer", e.target.value)} placeholder="متن پاسخ" />
          </div>
        ))}
        {content.faq.length === 0 && <p className="text-black/40 text-sm">هنوز سوالی اضافه نشده است.</p>}
      </div>
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState(null);
  useEffect(() => { (async () => { try { const { orders: list } = await api.allOrders(); setOrders(list); } catch (e) { setOrders([]); } })(); }, []);
  return (
    <div>
      <SectionTitle>سفارشات ثبت‌شده</SectionTitle>
      {orders === null && <p className="text-black/40 text-sm">در حال بارگذاری...</p>}
      {orders && orders.length === 0 && <p className="text-black/40 text-sm">هنوز سفارشی ثبت نشده است.</p>}
      <div className="space-y-3">
        {orders?.map((o) => (
          <div key={o.id} className={cardCls}>
            <div className="flex justify-between text-sm mb-2"><span className="font-bold">{o.customer?.name} <span className="text-black/30">({o.username})</span></span><span className="text-red-600 font-black">{toman(o.total)}</span></div>
            <p className="text-black/40 text-xs mb-1">{o.customer?.phone} — {o.customer?.address}</p>
            <p className="text-black/30 text-[11px]">{o.items.length} قلم کالا • {new Date(o.date).toLocaleString("fa-IR")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminMessages() {
  const [messages, setMessages] = useState(null);
  useEffect(() => { (async () => { try { const { messages: list } = await api.allMessages(); setMessages(list); } catch (e) { setMessages([]); } })(); }, []);
  return (
    <div>
      <SectionTitle>پیام‌های تماس با ما</SectionTitle>
      {messages === null && <p className="text-black/40 text-sm">در حال بارگذاری...</p>}
      {messages && messages.length === 0 && <p className="text-black/40 text-sm">هنوز پیامی دریافت نشده است.</p>}
      <div className="space-y-3">
        {messages?.map((m) => (
          <div key={m.id} className={cardCls}>
            <div className="flex justify-between text-sm mb-2"><span className="font-bold">{m.name}</span><span className="text-black/40 text-xs">{m.phone}</span></div>
            <p className="text-black/60 text-sm mb-1">{m.message}</p>
            <p className="text-black/30 text-[11px]">{new Date(m.date).toLocaleString("fa-IR")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const load = async () => { try { const { users: list } = await api.listUsers(); setUsers(list); } catch (e) { setUsers([]); } };
  useEffect(() => { load(); }, []);

  const changeRole = async (u, role) => {
    setBusyId(u.id);
    try { await api.setUserRole(u.id, role); await load(); } catch (e) { alert("تغییر نقش ناموفق بود: " + e.message); }
    setBusyId(null);
  };

  return (
    <div className="max-w-3xl">
      <SectionTitle>مدیریت کاربران</SectionTitle>
      <p className="text-black/40 text-xs mb-5">
        نقش‌ها دقیقاً مثل وردپرس: <b>مدیر</b> (دسترسی کامل)، <b>ویرایشگر</b> (مدیریت کل محتوای سایت)، <b>نویسنده</b> (فقط ساخت و ویرایش صفحات خودش)، <b>مشترک</b> (فقط حساب کاربری و خرید، بدون دسترسی به پنل).
      </p>
      {users === null && <p className="text-black/40 text-sm">در حال بارگذاری...</p>}
      <div className="space-y-2">
        {users?.map((u) => (
          <div key={u.id} className="flex items-center justify-between border border-black/10 rounded-lg p-3 bg-white">
            <div><p className="text-sm font-bold">{u.name}</p><p className="text-black/40 text-xs">{u.username}</p></div>
            <select disabled={busyId === u.id} value={u.role} onChange={(e) => changeRole(u, e.target.value)} className={inputCls + " w-auto"}>
              {ROLE_ORDER.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminPayment() {
  const [cfg, setCfg] = useState(null);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.getPaymentSettings().then(setCfg).catch(() => setCfg({ provider: "", merchantId: "", apiKey: "", enabled: false })); }, []);

  const set = (k, v) => setCfg({ ...cfg, [k]: v });
  const save = async () => {
    try { await api.updatePaymentSettings(cfg); setSaved(true); setTimeout(() => setSaved(false), 2000); } catch (e) { alert("ذخیره ناموفق بود: " + e.message); }
  };

  if (!cfg) return <p className="text-black/40 text-sm">در حال بارگذاری...</p>;

  return (
    <div className="max-w-lg">
      <SectionTitle>درگاه پرداخت بانکی</SectionTitle>
      <p className="text-black/40 text-xs mb-5">این اطلاعات فقط برای مدیر قابل مشاهده است و هرگز در بخش عمومی سایت نمایش داده نمی‌شود.</p>
      <div className="space-y-4">
        <Field label="نام درگاه">
          <select className={inputCls} value={cfg.provider} onChange={(e) => set("provider", e.target.value)}>
            <option value="">انتخاب کنید...</option>
            <option value="زرین‌پال">زرین‌پال (ZarinPal)</option>
            <option value="به‌پرداخت ملت">به‌پرداخت ملت (BehPardakht)</option>
            <option value="آیدی‌پی">آی‌دی‌پی (IDPay)</option>
            <option value="سایر">سایر</option>
          </select>
        </Field>
        <Field label="کد پذیرندگی (Merchant ID)"><input className={inputCls} value={cfg.merchantId} onChange={(e) => set("merchantId", e.target.value)} placeholder="مثلاً: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" /></Field>
        <Field label="کلید API">
          <div className="flex gap-2">
            <input type={showKey ? "text" : "password"} className={inputCls} value={cfg.apiKey} onChange={(e) => set("apiKey", e.target.value)} />
            <button type="button" onClick={() => setShowKey((v) => !v)} className={btnGhost}>{showKey ? <EyeOff size={14} /> : <Eye size={14} />}</button>
          </div>
        </Field>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={cfg.enabled} onChange={(e) => set("enabled", e.target.checked)} className="accent-red-600" /> درگاه پرداخت فعال باشد
        </label>
        <button onClick={save} className={btnPrimary}>ذخیره تنظیمات</button>
        {saved && <span className="text-green-600 text-xs mr-2">ذخیره شد ✓</span>}
        <p className="text-black/30 text-[11px] leading-relaxed pt-2">
          نکته: فعلاً وارد کردن این اطلاعات فقط آن‌ها را در دیتابیس ذخیره می‌کند و وضعیت «فعال» را به کاربران نشان می‌دهد. برای اتصال واقعی به درگاه (دریافت لینک پرداخت و تایید تراکنش)، باید endpoint های شروع/تایید پرداخت هم در سرور پیاده‌سازی شود — وقتی آماده باشید بگویید تا این بخش را هم تکمیل کنم.
        </p>
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
