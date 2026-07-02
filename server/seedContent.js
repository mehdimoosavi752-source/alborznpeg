// محتوای اولیه‌ی سایت که هنگام اولین اجرا در دیتابیس ذخیره می‌شود.
// این ساختار دقیقاً همان چیزی است که پنل مدیریت ویرایش می‌کند.

const uid = (p = "id") => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const DEFAULT_CONTENT = {
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
