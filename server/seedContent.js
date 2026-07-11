// محتوای اولیه‌ی سایت — کاملاً دوزبانه (فارسی/انگلیسی) و با لحن انسانی، نه تبلیغاتی و خشک.

const uid = (p = "id") => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const DEFAULT_CONTENT = {
  settings: {
    siteName: { fa: "نوین پلی‌تکنیک البرز", en: "Novin Polytechnic Alborz" },
    tagline: {
      fa: "تعمیر تخصصی کامپیوتر و پلی‌استیشن، بازیابی اطلاعات، و فروش اورجینال ویدئو پروژکتور",
      en: "Expert computer & PlayStation repair, data recovery, and genuine video projectors",
    },
    phone: "02632536821",
    mobile: "09124647963",
    address: {
      fa: "کرج، عظیمیه، میدان طالقانی، پاساژ آسیا، طبقه همکف، واحد ۲۱",
      en: "Ground Floor, Unit 21, Asia Passage, Taleghani Square, Azimieh, Karaj, Iran",
    },
    instagram: "https://instagram.com/eng.amin.rezvani",
    telegram: "09301100256",
    whatsapp: "09124647963",
    bale: "09124647963",
    aparat: "https://www.aparat.com/shorts/user/NovinPolytechnicAlborz/shorts",
    shopVideoUrl: "",
  },
  hero: {
    eyebrow: { fa: "بیش از ۱۰ سال تجربه در تعمیر و بازیابی اطلاعات", en: "10+ years of repair & data recovery experience" },
    title: { fa: "نوین پلی‌تکنیک البرز", en: "Novin Polytechnic Alborz" },
    subtitle: {
      fa: "هارد اکسترنالتون شناسایی نمی‌شه؟ اطلاعاتتون پاک شده؟ مشکلی نیست؛ ما با بهره‌مندی از نوین‌ترین و به‌روزترین دستگاه‌های تخصصی بازیابی و با توانایی و دانش بالای تیم فنی خود، امکان رفع مشکل و بازیابی اطلاعاتتون را از انواع هاردهای HDD و SSD داریم.",
      en: "Is your external hard drive not recognized? Has your data been deleted? No problem. With up-to-date specialist recovery equipment and a highly skilled technical team, we can recover data from HDD and SSD drives.",
    },
    ctaText: { fa: "خدمات و بازیابی اطلاعات", en: "Services & Data Recovery" },
    ctaText2: { fa: "رفتن به فروشگاه", en: "Browse the Shop" },
  },
  services: [
    {
      id: uid("srv"), icon: "HardDrive", pattern: "dots", image: "/assets/data-recovery.png", featured: true,
      title: { fa: "تعمیر هارد و بازیابی اطلاعات", en: "Hard Drive Repair & Data Recovery" },
      desc: { fa: "هارد اکسترنالتون شناسایی نمی‌شه؟ اطلاعاتتون پاک شده؟ مشکلی نیست؛ ما با بهره‌مندی از نوین‌ترین و به‌روزترین دستگاه‌های تخصصی بازیابی و با توانایی و دانش بالای تیم فنی خود، امکان رفع مشکل و بازیابی اطلاعاتتون را از انواع هاردهای HDD و SSD داریم.", en: "Is your external hard drive not recognized? Has your data been deleted? No problem. With up-to-date specialist recovery equipment and a highly skilled technical team, we can recover data from HDD and SSD drives." },
      priceRange: { fa: "از ۶۰۰,۰۰۰ تومان، بسته به شدت آسیب", en: "From 600,000 Toman, depending on severity" },
    },
    {
      id: uid("srv"), icon: "Monitor", pattern: "circuit", image: "/assets/laptop-repair.png",
      title: { fa: "تعمیر کامپیوتر و لپ‌تاپ", en: "Computer & Laptop Repair" },
      desc: { fa: "روشن نشدن، بلو اسکرین، کندی بیش‌ازحد یا صدای عجیب فن — قبل از تعویض قطعه، بذارید دقیق عیب‌یابی کنیم. خیلی وقت‌ها مشکل چیزی نیست که فکرش رو می‌کنید.", en: "Won't turn on, blue screens, painfully slow, or a fan that won't stop whining — before you replace anything, let us actually diagnose it. Often it's not what you think." },
      priceRange: { fa: "از ۲۵۰,۰۰۰ تا ۱,۵۰۰,۰۰۰ تومان", en: "250,000 – 1,500,000 Toman" },
    },
    {
      id: uid("srv"), icon: "Gamepad2", pattern: "scan", image: "/assets/ps5-repair.png",
      title: { fa: "تعمیر پلی‌استیشن ۴ و ۵", en: "PS4 & PS5 Repair" },
      desc: { fa: "دیسک‌خور دیسک رو نمی‌خونه، کنسول خیلی داغ می‌کنه یا روی صفحه‌ی HDMI هیچی نمیاد؟ این‌ها رایج‌ترین خرابی‌هایی هستن که هر هفته می‌بینیم و می‌دونیم دقیقاً از کجا شروع کنیم.", en: "Disc drive won't read, console runs hot, or nothing shows up on HDMI? These are the faults we see every single week — we know exactly where to start looking." },
      priceRange: { fa: "از ۳۰۰,۰۰۰ تا ۲,۰۰۰,۰۰۰ تومان", en: "300,000 – 2,000,000 Toman" },
    },
    {
      id: uid("srv"), icon: "Cpu", pattern: "hex", image: "/assets/repair-lab.png",
      title: { fa: "اورهال کامل سیستم", en: "Full System Overhaul" },
      desc: { fa: "تعویض خمیر حرارتی، تمیزکاری کامل داخل دستگاه، تست پایداری زیر بار و بهینه‌سازی نرم‌افزاری — برای سیستمی که چند ساله ازش استفاده می‌کنید و می‌خواید مثل روز اول کار کنه.", en: "New thermal paste, a proper internal clean-out, stress testing, and software tuning — for a machine you've had a few years that you want running like new again." },
      priceRange: { fa: "از ۴۰۰,۰۰۰ تا ۹۰۰,۰۰۰ تومان", en: "400,000 – 900,000 Toman" },
    },
    {
      id: uid("srv"), icon: "Zap", pattern: "wave", image: "/assets/projector-product.png",
      title: { fa: "سرویس و کالیبراسیون پروژکتور", en: "Projector Service & Calibration" },
      desc: { fa: "تعویض لامپ، تمیزکاری فیلتر گردوگیر و تنظیم دقیق فوکوس و رنگ — چه پروژکتور رو از ما خریده باشید چه جای دیگه.", en: "Lamp replacement, dust filter cleaning, and precise focus/color calibration — whether you bought the projector from us or somewhere else." },
      priceRange: { fa: "از ۵۰۰,۰۰۰ تومان (بدون قیمت لامپ)", en: "From 500,000 Toman (lamp cost separate)" },
    },
  ],
  products: [
    {
      id: uid("prj"), brand: "Epson", technology: "3LCD", resolution: "Full HD 1080p", lumens: 2700, price: 28500000, stock: 4, icon: "Monitor", pattern: "circuit", image: "/assets/projector-product.png",
      name: { fa: "اپسون EH-TW5825", en: "Epson EH-TW5825" },
      category: { fa: "خانگی", en: "Home Cinema" },
      desc: { fa: "اگه دنبال یه پروژکتور برای سینمای خانگی هستید که رنگ‌ها توش واقعی دربیان نه بیش‌ازحد اشباع، این مدل انتخاب خوبیه. کنتراستش برای دیدن فیلم توی اتاق نیمه‌تاریک عالیه.", en: "If you want a home cinema projector where colors look real instead of oversaturated, this is a solid pick. Contrast is great for movie nights in a dim room." },
    },
    {
      id: uid("prj"), brand: "BenQ", technology: "DLP", resolution: "Full HD 1080p", lumens: 3500, price: 24900000, stock: 6, icon: "Monitor", pattern: "hex", image: "/assets/projector-product.png",
      name: { fa: "بنکیو TH585", en: "BenQ TH585" },
      category: { fa: "خانگی", en: "Home Cinema" },
      desc: { fa: "نرخ رفرش بالاش رو حس می‌کنید وقتی فیلم اکشن یا بازی روی پرده‌ی بزرگ می‌بینید — تصویر شل نمی‌شه. قیمتش هم نسبت به کیفیتی که می‌ده منصفانه‌ست.", en: "You feel that high refresh rate during action movies or games on the big screen — nothing looks smeared. Fair price for what you get." },
    },
    {
      id: uid("prj"), brand: "Panasonic", technology: "3LCD Laser", resolution: "WUXGA", lumens: 5000, price: 68000000, stock: 2, icon: "Cpu", pattern: "grid", image: "/assets/projector-product.png",
      name: { fa: "پاناسونیک PT-VMZ50", en: "Panasonic PT-VMZ50" },
      category: { fa: "اداری و تجاری", en: "Business & Conference" },
      desc: { fa: "برای اتاق کنفرانس یا سالن همایش که نور محیط زیاده، منبع نوری لیزریش یعنی سال‌ها بدون نگرانی تعویض لامپ کار می‌کنه.", en: "For a conference room or event hall with a lot of ambient light, the laser light source means years of use without worrying about lamp replacement." },
    },
    {
      id: uid("prj"), brand: "Xiaomi", technology: "Smart LED", resolution: "Full HD 1080p", lumens: 500, price: 15200000, stock: 10, icon: "Zap", pattern: "dots", image: "/assets/projector-product.png",
      name: { fa: "شیائومی Mi Smart 2", en: "Xiaomi Mi Smart Projector 2" },
      category: { fa: "قابل‌حمل", en: "Portable" },
      desc: { fa: "کوچیک و سبکه، اندروید داخلیش یعنی مستقیم از نتفلیکس و یوتیوب پخش می‌کنید بدون هیچ دستگاه اضافه. برای اتاق خواب یا سفر عالیه.", en: "Small and light, with built-in Android so you stream Netflix and YouTube straight from it — no extra box needed. Great for a bedroom or travel." },
    },
    {
      id: uid("prj"), brand: "Optoma", technology: "DLP", resolution: "Full HD 1080p", lumens: 3600, price: 21800000, stock: 7, icon: "Monitor", pattern: "scan", image: "/assets/projector-product.png",
      name: { fa: "اپتما HD146X", en: "Optoma HD146X" },
      category: { fa: "خانگی", en: "Home Cinema" },
      desc: { fa: "اگه بودجه محدوده و می‌خواید اولین تجربه‌تون از سینمای خانگی رو شروع کنید، این مدل بیشترین کیفیت رو به ازای قیمتش می‌ده.", en: "If your budget is tight and this is your first home-cinema setup, this model gives you the most quality per toman." },
    },
    {
      id: uid("prj"), brand: "XGIMI", technology: "LED + Battery", resolution: "Full HD 1080p", lumens: 900, price: 32500000, stock: 5, icon: "Layers", pattern: "wave", image: "/assets/projector-product.png",
      name: { fa: "ایکس‌جیمی Halo+", en: "XGIMI Halo+" },
      category: { fa: "قابل‌حمل", en: "Portable" },
      desc: { fa: "باتری داخلیش رو حداقل ۲ ساعت پخش می‌کنه بدون برق — عالی برای سینمای حیاط یا کمپینگ که پریز برق دم دست نیست.", en: "The built-in battery streams for at least 2 hours without a wall outlet — perfect for a backyard movie night or camping trip." },
    },
  ],
  menu: [
    { id: uid("menu"), label: { fa: "خانه", en: "Home" }, type: "route", target: "home", visible: true, order: 1 },
    { id: uid("menu"), label: { fa: "خدمات", en: "Services" }, type: "route", target: "services", visible: true, order: 2 },
    { id: uid("menu"), label: { fa: "فروشگاه پروژکتور", en: "Projector Shop" }, type: "route", target: "shop", visible: true, order: 3 },
    { id: uid("menu"), label: { fa: "مقالات", en: "Articles" }, type: "route", target: "articles", visible: true, order: 4 },
    { id: uid("menu"), label: { fa: "سوالات رایج", en: "FAQ" }, type: "route", target: "faq", visible: true, order: 5 },
    { id: uid("menu"), label: { fa: "درباره ما", en: "About Us" }, type: "route", target: "about", visible: true, order: 6 },
    { id: uid("menu"), label: { fa: "تماس با ما", en: "Contact" }, type: "route", target: "contact", visible: true, order: 7 },
    { id: uid("menu"), label: { fa: "پیگیری سفارش", en: "Track Order" }, type: "route", target: "tracking", visible: true, order: 8 },
  ],
  faq: [
    {
      id: uid("faq"),
      question: { fa: "آیا امکان مشاوره پیش از خرید وجود دارد؟", en: "Can I get advice before buying?" },
      answer: { fa: "بله، برای انتخاب مدل مناسب با فضای شما و بودجه‌تان می‌توانید با ما در تماس باشید.", en: "Yes. Contact us for help selecting a model that suits your space and budget." },
    },
    {
      id: uid("faq"),
      question: { fa: "هزینه‌ی تعمیر یا اورهال چقدر می‌شه؟", en: "How much does a repair or overhaul cost?" },
      answer: { fa: "بستگی به نوع خرابی و مدل دستگاه داره. اول رایگان عیب‌یابی می‌کنیم، بعد پیش‌فاکتور دقیق می‌دیم و تا تایید نکنید کاری روی دستگاهتون انجام نمی‌شه.", en: "It depends on the fault and the model. We diagnose for free first, then give you an exact quote — nothing gets done until you approve it." },
    },
    {
      id: uid("faq"),
      question: { fa: "چند روز طول می‌کشه دستگاهم تعمیر بشه؟", en: "How long does a typical repair take?" },
      answer: { fa: "مشکلات ساده معمولاً همون روز یا فردا حل می‌شن. اورهال کامل یا تعمیرات تخصصی‌تر ممکنه ۲ تا ۴ روز کاری زمان ببره.", en: "Simple issues are usually fixed the same day or the next. A full overhaul or a more specialized repair can take 2 to 4 business days." },
    },
    {
      id: uid("faq"),
      question: { fa: "امکان بازگشت کالا وجود داره؟", en: "Can I return a product?" },
      answer: { fa: "تا ۷ روز بعد از تحویل، اگه بسته‌بندی و کالا سالم باشه، امکان بازگشت وجود داره.", en: "Yes, within 7 days of delivery, as long as the product and its packaging are undamaged." },
    },
    {
      id: uid("faq"),
      question: { fa: "ارسال به شهرستان‌ها هم انجام می‌شه؟", en: "Do you ship outside Tehran?" },
      answer: { fa: "بله، به سراسر کشور از طریق پست پیشتاز و تیپاکس ارسال می‌کنیم.", en: "Yes, we ship nationwide via Post Pishtaz and Tipax courier." },
    },
    {
      id: uid("faq"),
      question: { fa: "می‌تونم قبل از خرید پروژکتور رو ببینم؟", en: "Can I see the projector in person before buying?" },
      answer: { fa: "حتماً، توی فروشگاه چند مدل پرفروش رو نصب کردیم که می‌تونید نمونه‌ی واقعی رو ببینید و مقایسه کنید.", en: "Of course — we have a few best-selling models set up in-store so you can see the real picture quality and compare before deciding." },
    },
  ],
  footer: {
    about: {
      fa: "نوین پلی‌تکنیک البرز از سال ۱۳۹۲ در حال تعمیر تخصصی کامپیوتر و پلی‌استیشن، بازیابی اطلاعات و فروش مستقیم ویدئو پروژکتور است.",
      en: "Since 2013, Novin Polytechnic Alborz has specialized in computer and PlayStation repair, data recovery, and direct sales of video projectors.",
    },
    columns: [
      {
        id: uid("col"),
        title: { fa: "دسترسی سریع", en: "Quick Links" },
        links: [
          { label: { fa: "خدمات", en: "Services" }, url: "services" },
          { label: { fa: "فروشگاه پروژکتور", en: "Projector Shop" }, url: "shop" },
          { label: { fa: "مقالات", en: "Articles" }, url: "articles" },
          { label: { fa: "درباره ما", en: "About Us" }, url: "about" },
        ],
      },
      {
        id: uid("col"),
        title: { fa: "پشتیبانی", en: "Support" },
        links: [
          { label: { fa: "تماس با ما", en: "Contact" }, url: "contact" },
          { label: { fa: "سوالات رایج", en: "FAQ" }, url: "faq" },
          { label: { fa: "قوانین و مقررات", en: "Terms & Policy" }, url: "page:about-extra" },
        ],
      },
    ],
    copyright: { fa: `© ${new Date().getFullYear()} نوین پلی‌تکنیک البرز — تمامی حقوق محفوظ است.`, en: `© ${new Date().getFullYear()} Novin Polytechnic Alborz — All rights reserved.` },
  },
  about: {
    content: {
      fa: "نوین پلی‌تکنیک البرز را تیمی از تعمیرکارهای باتجربه راه‌اندازی کردند تا مشتری‌ها دقیقاً بدانند چه مشکلی رفع می‌شود و هزینه‌ها چگونه محاسبه می‌شوند. از همان ابتدا، عیب‌یابی شفاف و پیش‌فاکتور دقیق را اصل کارمان گذاشتیم. با افزایش درخواست مشتری‌ها برای پروژکتور، فروش مستقیم چند برند معتبر را نیز آغاز کردیم.",
      en: "Novin Polytechnic Alborz was founded by experienced technicians so customers can understand exactly what is being fixed and what it costs. From day one, transparent diagnostics and precise quotations have been central to our work. As customer demand for projectors grew, we also began direct sales of selected trusted brands.",
    },
    stats: [
      { value: { fa: "+۱۰", en: "10+" }, label: { fa: "سال تجربه", en: "Years of Experience" } },
      { value: { fa: "+۵۰۰۰", en: "5,000+" }, label: { fa: "تعمیر موفق", en: "Successful Repairs" } },
      { value: { fa: "۹۸٪", en: "98%" }, label: { fa: "رضایت مشتری", en: "Customer Satisfaction" } },
    ],
  },
  pageHeaders: {
    services: { image: "/assets/repair-lab.png" },
    shop: { image: "/assets/projector-product.png" },
    about: { image: "/assets/repair-lab.png" },
    contact: { image: "/assets/data-recovery.png" },
    faq: { image: "/assets/repair-lab.png" },
    articles: { image: "/assets/data-recovery.png" },
  },
};
