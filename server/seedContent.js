// محتوای اولیه‌ی سایت — کاملاً دوزبانه (فارسی/انگلیسی) و با لحن انسانی، نه تبلیغاتی و خشک.

const uid = (p = "id") => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const DEFAULT_CONTENT = {
  settings: {
    siteName: { fa: "نوین پلی‌تکنیک", en: "Novin Polytechnic" },
    tagline: {
      fa: "از تعمیر تخصصی کامپیوتر و پلی‌استیشن تا فروش اورجینال ویدئو پروژکتور",
      en: "Expert computer & PlayStation repair, plus genuine video projectors",
    },
    phone: "021-91234567",
    address: {
      fa: "تهران، خیابان ولیعصر، پاساژ فناوری، طبقه دوم، واحد ۱۴",
      en: "2nd Floor, Unit 14, Fanavari Passage, Valiasr St., Tehran, Iran",
    },
    instagram: "novin.polytechnic",
    telegram: "novinpolytechnic",
  },
  hero: {
    eyebrow: { fa: "بیش از ۱۰ سال تجربه در تعمیر و فروش", en: "10+ years of repair & retail experience" },
    title: { fa: "نوین پلی‌تکنیک", en: "Novin Polytechnic" },
    subtitle: {
      fa: "دستگاهتون روشن نمی‌شه، کند شده یا صدا می‌ده؟ قبل از هر تصمیمی بیارینش پیش ما تا رایگان عیب‌یابی کنیم. اگه هم دنبال یه پروژکتور خوب برای خونه یا دفتر می‌گردین، از بین چند برند معتبر با گارانتی واقعی انتخاب کنید.",
      en: "Something wrong with your PC or PlayStation? Bring it in for a free diagnosis before you decide anything. Looking for a projector instead? Pick from a handful of trusted brands, all backed by real warranty.",
    },
    ctaText: { fa: "مشاهده خدمات تعمیر", en: "See Repair Services" },
    ctaText2: { fa: "رفتن به فروشگاه", en: "Browse the Shop" },
  },
  services: [
    {
      id: uid("srv"), icon: "Monitor", pattern: "circuit",
      title: { fa: "تعمیر کامپیوتر و لپ‌تاپ", en: "Computer & Laptop Repair" },
      desc: { fa: "روشن نشدن، بلو اسکرین، کندی بیش‌ازحد یا صدای عجیب فن — قبل از تعویض قطعه، بذارید دقیق عیب‌یابی کنیم. خیلی وقت‌ها مشکل چیزی نیست که فکرش رو می‌کنید.", en: "Won't turn on, blue screens, painfully slow, or a fan that won't stop whining — before you replace anything, let us actually diagnose it. Often it's not what you think." },
    },
    {
      id: uid("srv"), icon: "Gamepad2", pattern: "scan",
      title: { fa: "تعمیر پلی‌استیشن ۴ و ۵", en: "PS4 & PS5 Repair" },
      desc: { fa: "دیسک‌خور دیسک رو نمی‌خونه، کنسول خیلی داغ می‌کنه یا روی صفحه‌ی HDMI هیچی نمیاد؟ این‌ها رایج‌ترین خرابی‌هایی هستن که هر هفته می‌بینیم و می‌دونیم دقیقاً از کجا شروع کنیم.", en: "Disc drive won't read, console runs hot, or nothing shows up on HDMI? These are the faults we see every single week — we know exactly where to start looking." },
    },
    {
      id: uid("srv"), icon: "Cpu", pattern: "hex",
      title: { fa: "اورهال کامل سیستم", en: "Full System Overhaul" },
      desc: { fa: "تعویض خمیر حرارتی، تمیزکاری کامل داخل دستگاه، تست پایداری زیر بار و بهینه‌سازی نرم‌افزاری — برای سیستمی که چند ساله ازش استفاده می‌کنید و می‌خواید مثل روز اول کار کنه.", en: "New thermal paste, a proper internal clean-out, stress testing, and software tuning — for a machine you've had a few years that you want running like new again." },
    },
    {
      id: uid("srv"), icon: "Zap", pattern: "wave",
      title: { fa: "سرویس و کالیبراسیون پروژکتور", en: "Projector Service & Calibration" },
      desc: { fa: "تعویض لامپ، تمیزکاری فیلتر گردوگیر و تنظیم دقیق فوکوس و رنگ — چه پروژکتور رو از ما خریده باشید چه جای دیگه.", en: "Lamp replacement, dust filter cleaning, and precise focus/color calibration — whether you bought the projector from us or somewhere else." },
    },
    {
      id: uid("srv"), icon: "ShieldCheck", pattern: "grid",
      title: { fa: "گارانتی واقعی روی تعمیرات", en: "Real Repair Warranty" },
      desc: { fa: "۳ ماه گارانتی روی کار انجام‌شده و قطعات تعویضی. اگه همون مشکل برگشت، هزینه‌ی اضافه نمی‌گیریم.", en: "3 months of warranty on the work itself and any replaced parts. If the same issue comes back, you won't pay for it again." },
    },
    {
      id: uid("srv"), icon: "Package", pattern: "dots",
      title: { fa: "بازیابی اطلاعات از هارد و SSD", en: "Data Recovery from HDD/SSD" },
      desc: { fa: "هارد یا SSD صدمه دیده و فایل‌های مهمتون توشه؟ قبل از اینکه خودتون چیزی امتحان کنید که وضع رو بدتر کنه، با ما تماس بگیرید.", en: "Damaged drive with important files still on it? Before trying anything yourself that might make it worse, get in touch first." },
    },
    {
      id: uid("srv"), icon: "Truck", pattern: "circuit",
      title: { fa: "نصب و راه‌اندازی پروژکتور در محل", en: "On-Site Projector Installation" },
      desc: { fa: "برای دفاتر و سالن‌های کنفرانس، نصب سقفی، کابل‌کشی و تنظیم اولیه رو خودمون انجام می‌دیم؛ فقط کافیه بگید پروژکتور رو کجا می‌خواید.", en: "For offices and conference rooms, we handle ceiling mounting, cabling, and initial setup — just tell us where you want the projector." },
    },
  ],
  products: [
    {
      id: uid("prj"), brand: "Epson", technology: "3LCD", resolution: "Full HD 1080p", lumens: 2700, price: 28500000, stock: 4, icon: "Monitor", pattern: "circuit",
      name: { fa: "اپسون EH-TW5825", en: "Epson EH-TW5825" },
      category: { fa: "خانگی", en: "Home Cinema" },
      warranty: { fa: "۲۴ ماه", en: "24 months" },
      desc: { fa: "اگه دنبال یه پروژکتور برای سینمای خانگی هستید که رنگ‌ها توش واقعی دربیان نه بیش‌ازحد اشباع، این مدل انتخاب خوبیه. کنتراستش برای دیدن فیلم توی اتاق نیمه‌تاریک عالیه.", en: "If you want a home cinema projector where colors look real instead of oversaturated, this is a solid pick. Contrast is great for movie nights in a dim room." },
    },
    {
      id: uid("prj"), brand: "BenQ", technology: "DLP", resolution: "Full HD 1080p", lumens: 3500, price: 24900000, stock: 6, icon: "Monitor", pattern: "hex",
      name: { fa: "بنکیو TH585", en: "BenQ TH585" },
      category: { fa: "خانگی", en: "Home Cinema" },
      warranty: { fa: "۱۸ ماه", en: "18 months" },
      desc: { fa: "نرخ رفرش بالاش رو حس می‌کنید وقتی فیلم اکشن یا بازی روی پرده‌ی بزرگ می‌بینید — تصویر شل نمی‌شه. قیمتش هم نسبت به کیفیتی که می‌ده منصفانه‌ست.", en: "You feel that high refresh rate during action movies or games on the big screen — nothing looks smeared. Fair price for what you get." },
    },
    {
      id: uid("prj"), brand: "Panasonic", technology: "3LCD Laser", resolution: "WUXGA", lumens: 5000, price: 68000000, stock: 2, icon: "Cpu", pattern: "grid",
      name: { fa: "پاناسونیک PT-VMZ50", en: "Panasonic PT-VMZ50" },
      category: { fa: "اداری و تجاری", en: "Business & Conference" },
      warranty: { fa: "۲۴ ماه", en: "24 months" },
      desc: { fa: "برای اتاق کنفرانس یا سالن همایش که نور محیط زیاده، منبع نوری لیزریش یعنی سال‌ها بدون نگرانی تعویض لامپ کار می‌کنه.", en: "For a conference room or event hall with a lot of ambient light, the laser light source means years of use without worrying about lamp replacement." },
    },
    {
      id: uid("prj"), brand: "Xiaomi", technology: "Smart LED", resolution: "Full HD 1080p", lumens: 500, price: 15200000, stock: 10, icon: "Zap", pattern: "dots",
      name: { fa: "شیائومی Mi Smart 2", en: "Xiaomi Mi Smart Projector 2" },
      category: { fa: "قابل‌حمل", en: "Portable" },
      warranty: { fa: "۱۲ ماه", en: "12 months" },
      desc: { fa: "کوچیک و سبکه، اندروید داخلیش یعنی مستقیم از نتفلیکس و یوتیوب پخش می‌کنید بدون هیچ دستگاه اضافه. برای اتاق خواب یا سفر عالیه.", en: "Small and light, with built-in Android so you stream Netflix and YouTube straight from it — no extra box needed. Great for a bedroom or travel." },
    },
    {
      id: uid("prj"), brand: "Optoma", technology: "DLP", resolution: "Full HD 1080p", lumens: 3600, price: 21800000, stock: 7, icon: "Monitor", pattern: "scan",
      name: { fa: "اپتما HD146X", en: "Optoma HD146X" },
      category: { fa: "خانگی", en: "Home Cinema" },
      warranty: { fa: "۱۸ ماه", en: "18 months" },
      desc: { fa: "اگه بودجه محدوده و می‌خواید اولین تجربه‌تون از سینمای خانگی رو شروع کنید، این مدل بیشترین کیفیت رو به ازای قیمتش می‌ده.", en: "If your budget is tight and this is your first home-cinema setup, this model gives you the most quality per toman." },
    },
    {
      id: uid("prj"), brand: "XGIMI", technology: "LED + Battery", resolution: "Full HD 1080p", lumens: 900, price: 32500000, stock: 5, icon: "Layers", pattern: "wave",
      name: { fa: "ایکس‌جیمی Halo+", en: "XGIMI Halo+" },
      category: { fa: "قابل‌حمل", en: "Portable" },
      warranty: { fa: "۱۲ ماه", en: "12 months" },
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
  ],
  faq: [
    {
      id: uid("faq"),
      question: { fa: "آیا محصولات فروشگاه گارانتی دارند؟", en: "Do the products come with a warranty?" },
      answer: { fa: "بله، همه‌ی پروژکتورها گارانتی شرکتی معتبر دارن؛ مدت دقیقش توی صفحه‌ی هر محصول نوشته شده، معمولاً بین ۱۲ تا ۲۴ ماه.", en: "Yes, every projector comes with a genuine manufacturer warranty. The exact duration is listed on each product page, usually between 12 and 24 months." },
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
      fa: "نوین پلی‌تکنیک از سال ۱۳۹۲ در حال تعمیر تخصصی کامپیوتر و پلی‌استیشنه، و چند سالیه فروش مستقیم ویدئو پروژکتور رو هم شروع کرده. کارمون رو با گارانتی واقعی پشتیبانی می‌کنیم.",
      en: "Since 2013, Novin Polytechnic has specialized in computer and PlayStation repair, and more recently started selling video projectors directly. Everything we do is backed by real warranty.",
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
    copyright: { fa: `© ${new Date().getFullYear()} نوین پلی‌تکنیک — تمامی حقوق محفوظ است.`, en: `© ${new Date().getFullYear()} Novin Polytechnic — All rights reserved.` },
  },
  about: {
    content: {
      fa: "نوین پلی‌تکنیک رو یه تیم کوچیک از تعمیرکارهای باتجربه راه انداختن که خسته شده بودن از اینکه مشتری‌ها نمی‌دونستن دقیقاً چه مشکلی داره حل می‌شه و چقدر هزینه می‌بره. برای همین از همون اول، عیب‌یابی رایگان و پیش‌فاکتور شفاف رو اصل کارمون گذاشتیم. چند سال بعد، چون خیلی از مشتری‌ها برای پروژکتورهاشون هم سراغمون می‌اومدن، فروش مستقیم چند برند معتبر رو هم شروع کردیم — با همون اصل: گارانتی واقعی و بدون حرف اضافه.",
      en: "Novin Polytechnic started as a small team of experienced repair technicians who were tired of customers never knowing exactly what was being fixed or what it would cost. So from day one, free diagnostics and a transparent quote became our baseline. A few years later, since so many customers were also coming to us about their projectors, we started selling a handful of trusted brands directly — with the same principle: real warranty, no surprises.",
    },
    stats: [
      { value: { fa: "+۱۰", en: "10+" }, label: { fa: "سال تجربه", en: "Years of Experience" } },
      { value: { fa: "+۵۰۰۰", en: "5,000+" }, label: { fa: "تعمیر موفق", en: "Successful Repairs" } },
      { value: { fa: "۹۸٪", en: "98%" }, label: { fa: "رضایت مشتری", en: "Customer Satisfaction" } },
    ],
  },
};
