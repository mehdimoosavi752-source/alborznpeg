import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Menu, X, ShoppingCart, Plus, Trash2, Pencil, Save, LogOut, Lock,
  Settings, LayoutGrid, FileText, ListOrdered, Home, Wrench, Gamepad2,
  Monitor, Cpu, Star, Phone, MapPin, Instagram, Send, MessageCircle,
  ChevronUp, ChevronDown, Check, Package, CreditCard, ArrowLeft,
  ShieldCheck, Zap, Clock, ScanLine, ChevronLeft, Layers, RotateCcw,
} from "lucide-react";
import { storage } from "./lib/storage.js";

/* ============================== ثابت‌ها و داده پیش‌فرض ============================== */

const STORAGE_KEY = "novin-site-content-v1";
const ADMIN_PASS_DEFAULT = "novin1404";

const uid = (p = "id") => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const PATTERNS = ["circuit", "hex", "scan", "dots", "grid", "wave"];

const patternStyle = (pattern) => {
  switch (pattern) {
    case "circuit":
      return {
        backgroundImage:
          "linear-gradient(115deg, rgba(220,38,38,0.35) 0%, transparent 40%), repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 22px), repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 22px)",
        backgroundColor: "#0a0a0a",
      };
    case "hex":
      return {
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(220,38,38,0.45), transparent 45%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.08), transparent 40%)",
        backgroundColor: "#111111",
      };
    case "scan":
      return {
        backgroundImage:
          "repeating-linear-gradient(180deg, rgba(220,38,38,0.18) 0px, rgba(220,38,38,0.18) 2px, transparent 2px, transparent 10px)",
        backgroundColor: "#0d0d0d",
      };
    case "dots":
      return {
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.18) 1.5px, transparent 1.5px)",
        backgroundSize: "14px 14px",
        backgroundColor: "#0a0a0a",
      };
    case "grid":
      return {
        backgroundImage:
          "linear-gradient(rgba(220,38,38,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.25) 1px, transparent 1px)",
        backgroundSize: "26px 26px",
        backgroundColor: "#0a0a0a",
      };
    default:
      return {
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(220,38,38,0.25) 0px, rgba(220,38,38,0.25) 2px, transparent 2px, transparent 16px)",
        backgroundColor: "#0a0a0a",
      };
  }
};

const ICONS = { Monitor, Cpu, Gamepad2, Wrench, ShieldCheck, Zap, Clock, Package, Star, Layers };
const ICON_NAMES = Object.keys(ICONS);

const DEFAULT_CONTENT = {
  settings: {
    siteName: "نوین پلی‌تکنیک",
    tagline: "مرکز تخصصی تعمیر، اورهال و فروش تجهیزات کامپیوتری و پلی‌استیشن",
    adminPassword: ADMIN_PASS_DEFAULT,
    phone: "021-91234567",
    address: "تهران، خیابان ولیعصر، پاساژ فناوری، طبقه دوم",
    instagram: "novin.polytechnic",
    telegram: "novinpolytechnic",
  },
  hero: {
    eyebrow: "تعمیرگاه و اورهال تخصصی",
    title: "نوین پلی‌تکنیک",
    subtitle: "تشخیص دقیق، تعمیر تخصصی، اورهال حرفه‌ای — برای کامپیوتر و پلی‌استیشن شما",
    ctaText: "مشاهده خدمات",
    ctaText2: "ورود به فروشگاه",
  },
  services: [
    { id: uid("srv"), icon: "Monitor", title: "تعمیر کامپیوتر و لپ‌تاپ", desc: "عیب‌یابی تخصصی سخت‌افزار و نرم‌افزار با دستگاه‌های تشخیص پیشرفته", pattern: "circuit" },
    { id: uid("srv"), icon: "Gamepad2", title: "تعمیر پلی‌استیشن", desc: "رفع خطای دیسک‌خور، اورهیت، HDMI و تعویض فن برای PS4 و PS5", pattern: "scan" },
    { id: uid("srv"), icon: "Cpu", title: "اورهال کامل سیستم", desc: "تعویض خمیر حرارتی، سرویس کامل، تست پایداری و بهینه‌سازی عملکرد", pattern: "hex" },
    { id: uid("srv"), icon: "ShieldCheck", title: "گارانتی تعمیرات", desc: "۳ ماه گارانتی روی تمامی خدمات تعمیر و قطعات تعویضی", pattern: "grid" },
    { id: uid("srv"), icon: "Zap", title: "تعمیر فوری", desc: "خدمات اکسپرس برای مشکلات ساده در کمتر از یک ساعت", pattern: "dots" },
    { id: uid("srv"), icon: "Package", title: "بازیابی اطلاعات", desc: "ریکاوری داده از هارد و SSD آسیب‌دیده با بالاترین نرخ موفقیت", pattern: "wave" },
  ],
  products: [
    { id: uid("prd"), name: "دسته بی‌سیم PS5 DualSense", price: 3200000, category: "لوازم جانبی", desc: "دسته اورجینال با ارتعاش هپتیک و ماشه تطبیقی", stock: 12, icon: "Gamepad2", pattern: "circuit" },
    { id: uid("prd"), name: "هارد اینترنال SSD 1TB", price: 2450000, category: "قطعات", desc: "افزایش سرعت بوت و لودینگ بازی‌ها به شکل چشمگیر", stock: 20, icon: "Cpu", pattern: "hex" },
    { id: uid("prd"), name: "خنک‌کننده PS5 با فن اضافه", price: 890000, category: "لوازم جانبی", desc: "کاهش دمای عملکرد و افزایش طول عمر کنسول", pattern: "scan", stock: 15, icon: "Zap" },
    { id: uid("prd"), name: "رم لپ‌تاپ 16GB DDR4", price: 1750000, category: "قطعات", desc: "ارتقای روان اجرای برنامه‌های سنگین و مولتی‌تسکینگ", pattern: "grid", stock: 30, icon: "Layers" },
    { id: uid("prd"), name: "پکیج خمیر حرارتی حرفه‌ای", price: 320000, category: "لوازم جانبی", desc: "هدایت حرارتی بالا، مناسب اورهال کامل سیستم", pattern: "dots", stock: 40, icon: "Package" },
    { id: uid("prd"), name: "پایه خنک‌کننده لپ‌تاپ", price: 640000, category: "لوازم جانبی", desc: "طراحی مینیمال با سه فن خاموش با نویز پایین", pattern: "wave", stock: 18, icon: "Monitor" },
  ],
  pages: [
    { id: "about", title: "درباره ما", slug: "about", showInMenu: true, order: 4, isSection: true,
      content: "نوین پلی‌تکنیک با بیش از یک دهه تجربه در تعمیر و اورهال تجهیزات کامپیوتری و کنسول‌های بازی، تیمی از متخصصان مجرب را گرد هم آورده تا بالاترین کیفیت خدمات را با شفافیت کامل ارائه دهد." },
  ],
  menu: [
    { id: uid("menu"), label: "خانه", type: "section", target: "home", visible: true, order: 1 },
    { id: uid("menu"), label: "خدمات", type: "section", target: "services", visible: true, order: 2 },
    { id: uid("menu"), label: "فروشگاه", type: "section", target: "shop", visible: true, order: 3 },
    { id: uid("menu"), label: "درباره ما", type: "page", target: "about", visible: true, order: 4 },
    { id: uid("menu"), label: "تماس با ما", type: "section", target: "contact", visible: true, order: 5 },
  ],
  footer: {
    about: "نوین پلی‌تکنیک؛ مرجع تخصصی تعمیر، اورهال و فروش تجهیزات کامپیوتری و پلی‌استیشن با گارانتی معتبر.",
    columns: [
      { id: uid("col"), title: "دسترسی سریع", links: [{ label: "خدمات", url: "services" }, { label: "فروشگاه", url: "shop" }, { label: "درباره ما", url: "about" }] },
      { id: uid("col"), title: "پشتیبانی", links: [{ label: "تماس با ما", url: "contact" }, { label: "شرایط گارانتی", url: "contact" }] },
    ],
    copyright: `© ${new Date().getFullYear()} نوین پلی‌تکنیک — تمامی حقوق محفوظ است.`,
  },
};

/* ============================== ابزارهای کمکی ============================== */

const toman = (n) => new Intl.NumberFormat("fa-IR").format(n) + " تومان";

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, className = "", delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
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

/* ============================== لوگو ============================== */

function Logo({ size = 44 }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
        <polygon points="50,3 93,26 93,74 50,97 7,74 7,26" fill="#0a0a0a" stroke="#dc2626" strokeWidth="3" />
        <polygon points="50,15 82,32 82,68 50,85 18,68 18,32" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.25" />
        <text x="50" y="62" textAnchor="middle" fontSize="34" fontWeight="900" fill="#ffffff" fontFamily="Arial, sans-serif">NP</text>
        <rect x="18" y="68" width="64" height="3" fill="#dc2626" />
      </svg>
      <div className="leading-tight">
        <div className="font-black text-white text-lg tracking-tight">نوین پلی‌تکنیک</div>
        <div className="text-[10px] text-red-500 tracking-widest">TECH REPAIR CENTER</div>
      </div>
    </div>
  );
}

/* ============================== اپلیکیشن اصلی ============================== */

export default function NovinPolytechnic() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderDone, setOrderDone] = useState(false);

  const [view, setView] = useState({ type: "home" });

  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState("dashboard");

  const scrollTargets = useRef({});

  /* ---------- بارگذاری اولیه از حافظه ---------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get(STORAGE_KEY);
        setContent(res && res.value ? JSON.parse(res.value) : DEFAULT_CONTENT);
      } catch (e) {
        try {
          await storage.set(STORAGE_KEY, JSON.stringify(DEFAULT_CONTENT));
        } catch (e2) { /* ignore */ }
        setContent(DEFAULT_CONTENT);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setContent(next);
    setSaving(true);
    try {
      await storage.set(STORAGE_KEY, JSON.stringify(next));
    } catch (e) { /* ignore silently in demo */ }
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
        <div className="text-red-600 flex flex-col items-center gap-3">
          <ScanLine className="animate-pulse" size={40} />
          <div className="text-white/70 text-sm tracking-widest">در حال بارگذاری نوین پلی‌تکنیک...</div>
        </div>
      </div>
    );
  }

  const visibleMenu = [...content.menu].filter((m) => m.visible).sort((a, b) => a.order - b.order);

  const goTo = (item) => {
    setMobileMenuOpen(false);
    if (item.type === "page") {
      setView({ type: "page", id: item.target });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setView({ type: "home" });
      setTimeout(() => {
        const el = scrollTargets.current[item.target];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...product, qty: 1 }];
    });
    setShowCart(true);
  };
  const changeQty = (id, delta) => {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)).filter((i) => i.qty > 0));
  };
  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const tryLogin = () => {
    if (passInput === content.settings.adminPassword) {
      setIsAdmin(true);
      setShowLogin(false);
      setShowAdmin(true);
      setPassInput("");
      setLoginErr("");
    } else {
      setLoginErr("رمز عبور اشتباه است");
    }
  };

  const placeOrder = async (form) => {
    const order = {
      id: uid("order"),
      items: cart,
      total: cartTotal,
      customer: form,
      date: new Date().toISOString(),
    };
    try {
      await storage.set(`order:${order.id}`, JSON.stringify(order));
    } catch (e) { /* ignore */ }
    setOrderDone(true);
    setCart([]);
  };

  return (
    <div dir="rtl" lang="fa" className="min-h-screen bg-black text-white font-sans" style={{ fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif" }}>
      <GlobalStyles />

      {/* ---------------- هدر ---------------- */}
      <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-black/80 border-b border-red-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <button onClick={() => goTo({ type: "section", target: "home" })}>
            <Logo />
          </button>

          <nav className="hidden lg:flex items-center gap-8">
            {visibleMenu.map((m) => (
              <button key={m.id} onClick={() => goTo(m)} className="relative text-sm text-white/80 hover:text-white transition-colors group">
                {m.label}
                <span className="absolute -bottom-1 right-0 w-0 h-[2px] bg-red-600 transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowCart(true)} className="relative p-2 rounded-lg border border-red-800/50 hover:border-red-500 hover:bg-red-950/30 transition-colors">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -left-2 bg-red-600 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
              )}
            </button>
            {isAdmin && (
              <button onClick={() => setShowAdmin(true)} className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition-colors font-bold">
                <Settings size={14} /> پنل مدیریت
              </button>
            )}
            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen((v) => !v)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-red-900/40 bg-black px-4 py-4 flex flex-col gap-3">
            {visibleMenu.map((m) => (
              <button key={m.id} onClick={() => goTo(m)} className="text-right text-white/80 hover:text-red-500 py-1">{m.label}</button>
            ))}
            {isAdmin && (
              <button onClick={() => setShowAdmin(true)} className="text-right text-red-500 font-bold py-1">پنل مدیریت</button>
            )}
          </div>
        )}
      </header>

      {/* ---------------- محتوای اصلی ---------------- */}
      {view.type === "page" ? (
        <CustomPageView page={content.pages.find((p) => p.id === view.id)} onBack={() => setView({ type: "home" })} />
      ) : (
        <>
          <Hero content={content} refMap={scrollTargets} goTo={goTo} />
          <Services content={content} refMap={scrollTargets} />
          <Shop content={content} refMap={scrollTargets} addToCart={addToCart} />
          <About content={content} />
          <Contact content={content} refMap={scrollTargets} />
        </>
      )}

      <Footer content={content} goTo={goTo} onAdminLinkClick={() => (isAdmin ? setShowAdmin(true) : setShowLogin(true))} />

      {/* ---------------- سبد خرید ---------------- */}
      {showCart && (
        <CartDrawer
          cart={cart} total={cartTotal}
          onClose={() => setShowCart(false)}
          onChangeQty={changeQty} onRemove={removeFromCart}
          onCheckout={() => { setShowCart(false); setShowCheckout(true); }}
        />
      )}

      {showCheckout && (
        <CheckoutModal
          total={cartTotal} orderDone={orderDone}
          onClose={() => { setShowCheckout(false); setOrderDone(false); }}
          onSubmit={placeOrder}
        />
      )}

      {/* ---------------- ورود مدیر ---------------- */}
      {showLogin && (
        <LoginModal
          value={passInput} error={loginErr}
          onChange={setPassInput}
          onSubmit={tryLogin}
          onClose={() => { setShowLogin(false); setLoginErr(""); setPassInput(""); }}
        />
      )}

      {/* ---------------- پنل مدیریت ---------------- */}
      {isAdmin && showAdmin && (
        <AdminPanel
          content={content} update={update} persist={persist} saving={saving}
          onClose={() => setShowAdmin(false)}
          onLogout={() => { setIsAdmin(false); setShowAdmin(false); }}
          tab={adminTab} setTab={setAdminTab}
        />
      )}
    </div>
  );
}

/* ============================== استایل سراسری و انیمیشن‌ها ============================== */

function GlobalStyles() {
  return (
    <style>{`
      @keyframes glitch {
        0%, 100% { text-shadow: 2px 0 #dc2626, -2px 0 #ffffff33; transform: translate(0,0); }
        20% { text-shadow: -2px 0 #dc2626, 2px 0 #ffffff33; transform: translate(-1px,0); }
        40% { text-shadow: 2px 1px #dc2626, -2px -1px #ffffff33; transform: translate(1px,0); }
        60% { text-shadow: -1px -1px #dc2626, 1px 1px #ffffff33; transform: translate(0,0); }
      }
      .glitch-text { animation: glitch 3.5s infinite; }
      @keyframes floatBlob {
        0%,100% { transform: translate(0,0) scale(1); }
        50% { transform: translate(30px,-40px) scale(1.1); }
      }
      .blob { animation: floatBlob 8s ease-in-out infinite; }
      @keyframes scanline {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100%); }
      }
      .scanline::after {
        content: ""; position: absolute; inset: 0; pointer-events:none;
        background: linear-gradient(180deg, transparent, rgba(220,38,38,0.15), transparent);
        animation: scanline 3s linear infinite;
      }
      @keyframes pulseGlow {
        0%,100% { box-shadow: 0 0 0px rgba(220,38,38,0.4); }
        50% { box-shadow: 0 0 24px rgba(220,38,38,0.55); }
      }
      .glow-pulse { animation: pulseGlow 2.4s ease-in-out infinite; }
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #0a0a0a; }
      ::-webkit-scrollbar-thumb { background: #7f1d1d; border-radius: 8px; }
    `}</style>
  );
}

/* ============================== بخش هیرو ============================== */

function Hero({ content, refMap, goTo }) {
  const h = content.hero;
  return (
    <section ref={(el) => (refMap.current.home = el)} className="relative pt-40 pb-28 px-4 sm:px-6 overflow-hidden">
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-red-700/25 rounded-full blur-3xl blob" />
      <div className="absolute bottom-0 -left-20 w-80 h-80 bg-red-900/30 rounded-full blur-3xl blob" style={{ animationDelay: "2s" }} />
      <div className="absolute inset-0 opacity-[0.06]" style={patternStyle("grid")} />

      <div className="relative max-w-5xl mx-auto text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-xs tracking-widest text-red-500 border border-red-800/60 rounded-full px-4 py-1.5 mb-6">
            <ScanLine size={14} /> {h.eyebrow}
          </span>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="glitch-text text-5xl sm:text-7xl font-black tracking-tight mb-6">
            {h.title}
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">{h.subtitle}</p>
        </Reveal>
        <Reveal delay={300}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button onClick={() => goTo({ type: "section", target: "services" })} className="glow-pulse bg-red-600 hover:bg-red-500 transition-all px-8 py-3.5 rounded-xl font-bold hover:scale-105">
              {h.ctaText}
            </button>
            <button onClick={() => goTo({ type: "section", target: "shop" })} className="border border-white/25 hover:border-red-500 hover:text-red-500 transition-all px-8 py-3.5 rounded-xl font-bold hover:scale-105">
              {h.ctaText2}
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================== بخش خدمات ============================== */

function Services({ content, refMap }) {
  return (
    <section ref={(el) => (refMap.current.services = el)} className="py-24 px-4 sm:px-6 border-t border-red-950/50">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="text-red-500 text-xs tracking-[0.3em] font-bold">خدمات ما</span>
          <h2 className="text-3xl sm:text-4xl font-black mt-3">تشخیص دقیق، تعمیر مطمئن</h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.services.map((s, idx) => (
            <Reveal key={s.id} delay={idx * 80}>
              <div className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-red-600/70 transition-all duration-300 h-full">
                <PatternBox pattern={s.pattern} className="h-28 flex items-center justify-center">
                  <IconBadge name={s.icon} className="text-white/90 relative z-10 group-hover:scale-110 group-hover:text-red-400 transition-transform duration-300" size={38} />
                </PatternBox>
                <div className="p-6 bg-neutral-950">
                  <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================== بخش فروشگاه ============================== */

function Shop({ content, refMap, addToCart }) {
  return (
    <section ref={(el) => (refMap.current.shop = el)} className="py-24 px-4 sm:px-6 border-t border-red-950/50 bg-gradient-to-b from-black to-neutral-950">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="text-red-500 text-xs tracking-[0.3em] font-bold">فروشگاه</span>
          <h2 className="text-3xl sm:text-4xl font-black mt-3">قطعات و لوازم جانبی اورجینال</h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.products.map((p, idx) => (
            <Reveal key={p.id} delay={idx * 80}>
              <div className="group rounded-2xl overflow-hidden border border-white/10 hover:border-red-600/70 transition-all duration-300 h-full flex flex-col scanline relative">
                <PatternBox pattern={p.pattern} className="h-40 flex items-center justify-center">
                  <IconBadge name={p.icon} className="text-white/90 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300" size={54} />
                  <span className="absolute top-3 left-3 text-[10px] bg-black/70 border border-red-700/50 rounded-full px-2 py-1 text-red-400">{p.category}</span>
                </PatternBox>
                <div className="p-5 bg-neutral-950 flex flex-col flex-1">
                  <h3 className="font-bold mb-1">{p.name}</h3>
                  <p className="text-white/55 text-xs leading-relaxed mb-4 flex-1">{p.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-red-500 font-black">{toman(p.price)}</span>
                    <button onClick={() => addToCart(p)} className="text-xs bg-red-600 hover:bg-red-500 transition-colors px-3 py-2 rounded-lg font-bold flex items-center gap-1">
                      <Plus size={14} /> افزودن
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================== درباره ما ============================== */

function About({ content }) {
  const about = content.pages.find((p) => p.id === "about");
  return (
    <section className="py-24 px-4 sm:px-6 border-t border-red-950/50">
      <div className="max-w-4xl mx-auto text-center">
        <Reveal>
          <span className="text-red-500 text-xs tracking-[0.3em] font-bold">درباره ما</span>
          <h2 className="text-3xl sm:text-4xl font-black mt-3 mb-6">چرا نوین پلی‌تکنیک؟</h2>
          <p className="text-white/65 leading-loose text-lg">{about?.content}</p>
        </Reveal>
        <Reveal delay={150}>
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-lg mx-auto">
            {[["+10", "سال تجربه"], ["+5000", "تعمیر موفق"], ["۹۸٪", "رضایت مشتری"]].map(([n, l]) => (
              <div key={l} className="border border-red-900/40 rounded-xl py-5">
                <div className="text-2xl font-black text-red-500">{n}</div>
                <div className="text-xs text-white/50 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================== تماس با ما ============================== */

function Contact({ content, refMap }) {
  const s = content.settings;
  return (
    <section ref={(el) => (refMap.current.contact = el)} className="py-24 px-4 sm:px-6 border-t border-red-950/50 bg-neutral-950">
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <span className="text-red-500 text-xs tracking-[0.3em] font-bold">تماس با ما</span>
          <h2 className="text-3xl sm:text-4xl font-black mt-3 mb-10">همین حالا با ما در ارتباط باشید</h2>
        </Reveal>
        <div className="grid sm:grid-cols-3 gap-4">
          <Reveal delay={80}><InfoCard icon={<Phone size={20} />} title="تماس تلفنی" value={s.phone} /></Reveal>
          <Reveal delay={160}><InfoCard icon={<MapPin size={20} />} title="آدرس" value={s.address} /></Reveal>
          <Reveal delay={240}><InfoCard icon={<Instagram size={20} />} title="اینستاگرام" value={`@${s.instagram}`} /></Reveal>
        </div>
      </div>
    </section>
  );
}
function InfoCard({ icon, title, value }) {
  return (
    <div className="border border-red-900/40 hover:border-red-600 transition-colors rounded-xl p-5 h-full">
      <div className="text-red-500 flex justify-center mb-3">{icon}</div>
      <div className="text-xs text-white/50 mb-1">{title}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}

/* ============================== صفحه سفارشی ============================== */

function CustomPageView({ page, onBack }) {
  if (!page) return null;
  return (
    <section className="pt-40 pb-24 px-4 sm:px-6 min-h-[60vh]">
      <div className="max-w-3xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-1.5 text-red-500 text-sm mb-8 hover:gap-2.5 transition-all">
          <ChevronRightIcon /> بازگشت به خانه
        </button>
        <h1 className="text-3xl sm:text-4xl font-black mb-6">{page.title}</h1>
        <p className="text-white/70 leading-loose whitespace-pre-line">{page.content}</p>
      </div>
    </section>
  );
}
function ChevronRightIcon() { return <ChevronRight size={16} />; }
function ChevronRight(props) { return <svg {...props} width={props.size||16} height={props.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>; }

/* ============================== فوتر ============================== */

function Footer({ content, goTo, onAdminLinkClick }) {
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
              {col.links.map((l, i) => (
                <li key={i}>
                  <button onClick={() => goTo({ type: "section", target: l.url })} className="text-white/50 hover:text-red-500 text-sm transition-colors">{l.label}</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h4 className="font-bold mb-4">اطلاعات تماس</h4>
          <ul className="space-y-2 text-sm text-white/50">
            <li>{s.phone}</li>
            <li>{s.address}</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-white/40 text-xs">{f.copyright}</p>
        <button onClick={onAdminLinkClick} className="text-white/25 hover:text-red-600 text-xs flex items-center gap-1 transition-colors">
          <Lock size={12} /> ورود مدیر
        </button>
      </div>
    </footer>
  );
}

/* ============================== سبد خرید ============================== */

function CartDrawer({ cart, total, onClose, onChangeQty, onRemove, onCheckout }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm h-full bg-neutral-950 border-l border-red-900/50 flex flex-col animate-[fadeIn_0.2s_ease]">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="font-bold flex items-center gap-2"><ShoppingCart size={18} className="text-red-500" /> سبد خرید</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 && <p className="text-white/40 text-sm text-center mt-10">سبد خرید شما خالی است</p>}
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-3 border-b border-white/10 pb-4">
              <PatternBox pattern={item.pattern} className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0">
                <IconBadge name={item.icon} size={22} />
              </PatternBox>
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
            <div className="flex justify-between mb-4 text-sm">
              <span className="text-white/60">جمع کل</span>
              <span className="font-black text-red-500">{toman(total)}</span>
            </div>
            <button onClick={onCheckout} className="w-full bg-red-600 hover:bg-red-500 transition-colors py-3 rounded-xl font-bold flex items-center justify-center gap-2">
              <CreditCard size={16} /> تسویه حساب
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== پرداخت ============================== */

function CheckoutModal({ total, onClose, onSubmit, orderDone }) {
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [processing, setProcessing] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));
    await onSubmit(form);
    setProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-neutral-950 border border-red-900/50 rounded-2xl p-6">
        <button onClick={onClose} className="absolute top-4 left-4 text-white/50 hover:text-white"><X size={18} /></button>
        {orderDone ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-600 flex items-center justify-center mx-auto mb-4">
              <Check className="text-red-500" size={28} />
            </div>
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
              <div className="flex justify-between items-center py-3 border-t border-white/10 text-sm">
                <span className="text-white/60">مبلغ قابل پرداخت</span>
                <span className="font-black text-red-500">{toman(total)}</span>
              </div>
              <button disabled={processing} className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 transition-colors py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                {processing ? "در حال اتصال به درگاه..." : "پرداخت آنلاین"}
              </button>
              <p className="text-white/30 text-[11px] text-center leading-relaxed pt-1">
                این بخش شبیه‌سازی درگاه پرداخت است. در نسخه نهاییِ سرور، اینجا به درگاه بانکی واقعی (مثل زرین‌پال یا به‌پرداخت ملت) متصل می‌شود.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================== ورود مدیر ============================== */

function LoginModal({ value, onChange, onSubmit, onClose, error }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-neutral-950 border border-red-900/50 rounded-2xl p-6">
        <button onClick={onClose} className="absolute top-4 left-4 text-white/50 hover:text-white"><X size={18} /></button>
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-red-600/15 border border-red-600 flex items-center justify-center mx-auto mb-3">
            <Lock className="text-red-500" size={22} />
          </div>
          <h3 className="font-bold text-lg">ورود مدیر سایت</h3>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-3">
          <input autoFocus type="password" placeholder="رمز عبور" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-black border border-white/15 focus:border-red-600 outline-none rounded-lg px-4 py-2.5 text-sm text-center tracking-widest" />
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button className="w-full bg-red-600 hover:bg-red-500 transition-colors py-2.5 rounded-xl font-bold">ورود</button>
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
          <button onClick={onClose} className="text-xs border border-white/20 hover:border-red-500 rounded-lg px-3 py-2 flex items-center gap-1.5">
            مشاهده سایت
          </button>
          <button onClick={onLogout} className="text-xs bg-red-600 hover:bg-red-500 rounded-lg px-3 py-2 flex items-center gap-1.5 font-bold">
            <LogOut size={14} /> خروج
          </button>
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
          {tab === "settings" && <AdminSettings content={content} update={update} />}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-black">{children}</h2>
      {action}
    </div>
  );
}
const inputCls = "w-full bg-neutral-950 border border-white/15 focus:border-red-600 outline-none rounded-lg px-3 py-2 text-sm";
const cardCls = "border border-white/10 rounded-xl p-4 bg-neutral-950/60";
const btnPrimary = "bg-red-600 hover:bg-red-500 transition-colors px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5";
const btnGhost = "border border-white/15 hover:border-red-500 transition-colors px-3 py-2 rounded-lg text-xs flex items-center gap-1.5";

function AdminDashboard({ content }) {
  const stats = [
    { label: "خدمات", value: content.services.length, icon: Wrench },
    { label: "محصولات", value: content.products.length, icon: Package },
    { label: "صفحات", value: content.pages.length, icon: FileText },
    { label: "آیتم‌های منو", value: content.menu.length, icon: ListOrdered },
  ];
  return (
    <div>
      <SectionTitle>خوش آمدید 👋</SectionTitle>
      <p className="text-white/50 text-sm mb-8">از منوی کناری هر بخش از سایت را ویرایش کنید. تغییرات بلافاصله روی سایت اعمال و ذخیره می‌شود.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={cardCls}>
            <s.icon className="text-red-500 mb-2" size={20} />
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-xs text-white/40 mt-1">{s.label}</div>
          </div>
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
        <Field label="برچسب بالای عنوان">
          <input className={inputCls} value={h.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} />
        </Field>
        <Field label="عنوان اصلی">
          <input className={inputCls} value={h.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="توضیح زیر عنوان">
          <textarea rows={3} className={inputCls} value={h.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="متن دکمه اول"><input className={inputCls} value={h.ctaText} onChange={(e) => set("ctaText", e.target.value)} /></Field>
          <Field label="متن دکمه دوم"><input className={inputCls} value={h.ctaText2} onChange={(e) => set("ctaText2", e.target.value)} /></Field>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs text-white/50 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

function PatternPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PATTERNS.map((p) => (
        <button key={p} type="button" onClick={() => onChange(p)} className={`w-10 h-10 rounded-lg border-2 ${value === p ? "border-red-500" : "border-white/10"}`} style={patternStyle(p)} title={p} />
      ))}
    </div>
  );
}
function IconPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ICON_NAMES.map((n) => {
        const Ico = ICONS[n];
        return (
          <button key={n} type="button" onClick={() => onChange(n)} className={`w-10 h-10 rounded-lg border flex items-center justify-center ${value === n ? "border-red-500 bg-red-600/10 text-red-500" : "border-white/10 text-white/50"}`}>
            <Ico size={16} />
          </button>
        );
      })}
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
            <div className="flex justify-between items-start mb-3">
              <input className={inputCls + " font-bold"} value={s.title} onChange={(e) => editItem(s.id, "title", e.target.value)} />
              <button onClick={() => removeItem(s.id)} className="mr-2 text-white/30 hover:text-red-500 shrink-0"><Trash2 size={16} /></button>
            </div>
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
  const addItem = () => set([...content.products, { id: uid("prd"), name: "محصول جدید", price: 100000, category: "دسته‌بندی", desc: "توضیحات محصول", stock: 10, icon: "Package", pattern: "dots" }]);
  const removeItem = (id) => set(content.products.filter((p) => p.id !== id));
  const editItem = (id, key, val) => set(content.products.map((p) => (p.id === id ? { ...p, [key]: val } : p)));
  return (
    <div>
      <SectionTitle action={<button onClick={addItem} className={btnPrimary}><Plus size={14} /> افزودن محصول</button>}>مدیریت فروشگاه</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-4">
        {content.products.map((p) => (
          <div key={p.id} className={cardCls}>
            <div className="flex justify-between items-start mb-3">
              <input className={inputCls + " font-bold"} value={p.name} onChange={(e) => editItem(p.id, "name", e.target.value)} />
              <button onClick={() => removeItem(p.id)} className="mr-2 text-white/30 hover:text-red-500 shrink-0"><Trash2 size={16} /></button>
            </div>
            <textarea rows={2} className={inputCls + " mb-3"} value={p.desc} onChange={(e) => editItem(p.id, "desc", e.target.value)} />
            <div className="grid grid-cols-3 gap-2 mb-3">
              <Field label="قیمت (تومان)"><input type="number" className={inputCls} value={p.price} onChange={(e) => editItem(p.id, "price", Number(e.target.value))} /></Field>
              <Field label="موجودی"><input type="number" className={inputCls} value={p.stock} onChange={(e) => editItem(p.id, "stock", Number(e.target.value))} /></Field>
              <Field label="دسته‌بندی"><input className={inputCls} value={p.category} onChange={(e) => editItem(p.id, "category", e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
  const removePage = (id) => {
    set(content.pages.filter((p) => p.id !== id));
    setMenu(content.menu.filter((m) => !(m.type === "page" && m.target === id)));
  };
  const editPage = (id, key, val) => set(content.pages.map((p) => (p.id === id ? { ...p, [key]: val } : p)));

  const toggleMenu = (pageId, val) => {
    editPage(pageId, "showInMenu", val);
    setMenu(content.menu.map((m) => (m.type === "page" && m.target === pageId ? { ...m, visible: val } : m)));
  };
  const syncLabel = (pageId, title) => {
    editPage(pageId, "title", title);
    setMenu(content.menu.map((m) => (m.type === "page" && m.target === pageId ? { ...m, label: title } : m)));
  };

  return (
    <div>
      <SectionTitle action={<button onClick={addPage} className={btnPrimary}><Plus size={14} /> صفحه جدید</button>}>مدیریت صفحات</SectionTitle>
      <div className="space-y-4">
        {content.pages.map((p) => (
          <div key={p.id} className={cardCls}>
            <div className="flex justify-between items-start mb-3 gap-3">
              <input className={inputCls + " font-bold"} value={p.title} onChange={(e) => syncLabel(p.id, e.target.value)} />
              {p.id !== "about" && <button onClick={() => removePage(p.id)} className="text-white/30 hover:text-red-500 shrink-0"><Trash2 size={16} /></button>}
            </div>
            <textarea rows={4} className={inputCls + " mb-3"} value={p.content} onChange={(e) => editPage(p.id, "content", e.target.value)} />
            <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
              <input type="checkbox" checked={p.showInMenu} onChange={(e) => toggleMenu(p.id, e.target.checked)} className="accent-red-600" />
              نمایش این صفحه در منوی سایت
            </label>
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
            <div className="flex flex-col">
              <button onClick={() => move(m.id, -1)} disabled={i === 0} className="disabled:opacity-20"><ChevronUp size={14} /></button>
              <button onClick={() => move(m.id, 1)} disabled={i === sorted.length - 1} className="disabled:opacity-20"><ChevronDown size={14} /></button>
            </div>
            <input className={inputCls} value={m.label} onChange={(e) => editLabel(m.id, e.target.value)} />
            <label className="flex items-center gap-1.5 text-xs text-white/50 shrink-0 cursor-pointer">
              <input type="checkbox" checked={m.visible} onChange={() => toggle(m.id)} className="accent-red-600" /> نمایش
            </label>
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
      <Field label="متن درباره ما در فوتر">
        <textarea rows={2} className={inputCls} value={f.about} onChange={(e) => setF("about", e.target.value)} />
      </Field>
      <Field label="متن کپی‌رایت">
        <input className={inputCls + " mt-3"} value={f.copyright} onChange={(e) => setF("copyright", e.target.value)} />
      </Field>

      <div className="flex items-center justify-between mt-8 mb-3">
        <h3 className="font-bold text-sm">ستون‌های لینک</h3>
        <button onClick={addColumn} className={btnGhost}><Plus size={12} /> ستون جدید</button>
      </div>
      <div className="space-y-4">
        {f.columns.map((c) => (
          <div key={c.id} className={cardCls}>
            <div className="flex justify-between items-center mb-3">
              <input className={inputCls + " font-bold"} value={c.title} onChange={(e) => editColTitle(c.id, e.target.value)} />
              <button onClick={() => removeColumn(c.id)} className="mr-2 text-white/30 hover:text-red-500"><Trash2 size={16} /></button>
            </div>
            <div className="space-y-2">
              {c.links.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <input className={inputCls} value={l.label} onChange={(e) => editLink(c.id, i, "label", e.target.value)} />
                  <button onClick={() => removeLink(c.id, i)} className="text-white/30 hover:text-red-500 shrink-0"><Trash2 size={14} /></button>
                </div>
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
      try {
        const list = await storage.list("order:");
        const keys = list?.keys || [];
        const results = [];
        for (const k of keys) {
          try {
            const r = await storage.get(k);
            if (r?.value) results.push(JSON.parse(r.value));
          } catch (e) { /* skip */ }
        }
        results.sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(results);
      } catch (e) { setOrders([]); }
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
            <div className="flex justify-between text-sm mb-2">
              <span className="font-bold">{o.customer?.name}</span>
              <span className="text-red-500 font-black">{toman(o.total)}</span>
            </div>
            <p className="text-white/40 text-xs mb-1">{o.customer?.phone} — {o.customer?.address}</p>
            <p className="text-white/30 text-[11px]">{o.items.length} قلم کالا • {new Date(o.date).toLocaleString("fa-IR")}</p>
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
        <Field label="رمز عبور پنل مدیریت"><input className={inputCls} value={s.adminPassword} onChange={(e) => set("adminPassword", e.target.value)} /></Field>
      </div>
    </div>
  );
}
