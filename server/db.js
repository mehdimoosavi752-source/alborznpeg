import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { DEFAULT_CONTENT } from "./seedContent.js";

const DB_PATH = process.env.DB_PATH || "./data.sqlite";
export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'subscriber', -- admin | editor | author | subscriber
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS site_content (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    blocks TEXT NOT NULL,          -- آرایه‌ی بلوک‌های محتوا به‌صورت JSON (مثل ویرایشگر بلوکی وردپرس)
    show_in_menu INTEGER NOT NULL DEFAULT 0,
    is_article INTEGER NOT NULL DEFAULT 0,  -- اگر ۱ باشد، در صفحه‌ی «مقالات» هم لیست می‌شود
    is_case_study INTEGER NOT NULL DEFAULT 0, -- اگر ۱ باشد، در بخش «نمونه‌کار» صفحه‌ی خدمات لیست می‌شود
    category TEXT NOT NULL DEFAULT '',      -- دسته‌بندی مقاله: buying-guide | maintenance | repair
    menu_order INTEGER NOT NULL DEFAULT 99,
    status TEXT NOT NULL DEFAULT 'published', -- published | draft
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payment_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    provider TEXT NOT NULL DEFAULT '',
    merchant_id TEXT NOT NULL DEFAULT '',
    api_key TEXT NOT NULL DEFAULT '',
    enabled INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_type TEXT NOT NULL DEFAULT 'shop',   -- shop | service
    status TEXT NOT NULL DEFAULT 'reviewing',
    username TEXT,
    items TEXT NOT NULL DEFAULT '[]',
    total INTEGER NOT NULL DEFAULT 0,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL DEFAULT '',
    customer_province TEXT NOT NULL DEFAULT '',
    customer_city TEXT NOT NULL DEFAULT '',
    customer_postal_code TEXT NOT NULL DEFAULT '',
    customer_address TEXT NOT NULL DEFAULT '',
    device_info TEXT NOT NULL DEFAULT '',
    issue_description TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notification_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    email_enabled INTEGER NOT NULL DEFAULT 0,
    email_host TEXT NOT NULL DEFAULT '',
    email_port INTEGER NOT NULL DEFAULT 587,
    email_user TEXT NOT NULL DEFAULT '',
    email_pass TEXT NOT NULL DEFAULT '',
    email_from TEXT NOT NULL DEFAULT '',
    sms_enabled INTEGER NOT NULL DEFAULT 0,
    sms_webhook_url TEXT NOT NULL DEFAULT '',
    sms_api_key TEXT NOT NULL DEFAULT '',
    sms_sender TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT,
    username TEXT NOT NULL,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    approved INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    user_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ticket_messages (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    sender TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS popups (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    message_fa TEXT NOT NULL DEFAULT '',
    message_en TEXT NOT NULL DEFAULT '',
    button_text_fa TEXT NOT NULL DEFAULT '',
    button_text_en TEXT NOT NULL DEFAULT '',
    button_url TEXT NOT NULL DEFAULT '',
    target_page TEXT NOT NULL DEFAULT 'all',
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );
`);

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// --- مهاجرت سبک: اگر دیتابیس قدیمی‌تر است و ستون جدید را ندارد، اضافه‌اش کن ---
const pageColumns = db.prepare("PRAGMA table_info(pages)").all().map((c) => c.name);
if (!pageColumns.includes("is_article")) {
  db.exec("ALTER TABLE pages ADD COLUMN is_article INTEGER NOT NULL DEFAULT 0");
  console.log("[migrate] ستون is_article به جدول pages اضافه شد");
}
if (!pageColumns.includes("is_case_study")) {
  db.exec("ALTER TABLE pages ADD COLUMN is_case_study INTEGER NOT NULL DEFAULT 0");
  console.log("[migrate] ستون is_case_study به جدول pages اضافه شد");
}
if (!pageColumns.includes("category")) {
  db.exec("ALTER TABLE pages ADD COLUMN category TEXT NOT NULL DEFAULT ''");
  console.log("[migrate] ستون category به جدول pages اضافه شد");
}

// --- بذرپاشی اولیه (فقط یک‌بار، اگر دیتابیس خالی باشد) ---

const userCount = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
if (userCount === 0) {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "novin1404";
  const hash = bcrypt.hashSync(adminPassword, 10);
  db.prepare(
    `INSERT INTO users (id, username, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, 'admin', ?)`
  ).run(uid("user"), adminUsername, hash, "مدیر سایت", new Date().toISOString());
  console.log(`[seed] حساب مدیر پیش‌فرض ساخته شد → کاربری: ${adminUsername}`);
}

const contentRow = db.prepare("SELECT id FROM site_content WHERE id = 1").get();
if (!contentRow) {
  db.prepare("INSERT INTO site_content (id, data, updated_at) VALUES (1, ?, ?)").run(
    JSON.stringify(DEFAULT_CONTENT),
    new Date().toISOString()
  );
  console.log("[seed] محتوای اولیه‌ی سایت ذخیره شد");
}

const now0 = new Date().toISOString();
const adminUser0 = db.prepare("SELECT id, name FROM users WHERE role = 'admin' LIMIT 1").get();
const authorId = adminUser0?.id || "system";
const authorName = adminUser0?.name || "مدیر سایت";

const insertPage = db.prepare(
  `INSERT OR IGNORE INTO pages (id, title, slug, blocks, show_in_menu, is_article, menu_order, status, author_id, author_name, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?)`
);
const T = (fa, en) => ({ fa, en });
const B = (type, fa, en, url) => ({ id: `blk_${Math.random().toString(36).slice(2, 9)}`, type, content: T(fa, en), url: url || "" });

insertPage.run(
  "about-extra",
  JSON.stringify(T("قوانین و مقررات", "Terms & Policy")),
  "rules",
  JSON.stringify([
    B("heading", "قوانین و مقررات فروشگاه", "Store Terms & Policy"),
    B("paragraph",
      "کلیه محصولات فروشگاه نوین پلی‌تکنیک البرز اورجینال هستند. مهلت بازگشت کالا ۷ روز از تاریخ تحویل است، به شرط سالم بودن کالا و بسته‌بندی.",
      "All products sold by Novin Polytechnic Alborz are genuine. Returns are accepted within 7 days of delivery, provided the product and its packaging are undamaged."),
    B("paragraph",
      "هزینه‌ی ارسال بر عهده‌ی خریدار است مگر در مواردی که به‌صورت جداگانه اعلام شود. هزینه و مدت‌زمان هر تعمیر پس از عیب‌یابی و پیش از شروع کار به‌صورت شفاف اعلام می‌شود.",
      "Shipping costs are the buyer's responsibility unless stated otherwise. The cost and duration of any repair is clearly communicated after diagnosis and before work begins."),
  ]),
  0, 0, 9, authorId, authorName, now0, now0
);

const articles = [
  {
    slug: "projector-maintenance",
    title: T("چگونه از پروژکتور خود درست نگهداری کنیم؟", "How to Properly Maintain Your Projector"),
    blocks: [
      B("heading", "چرا نگهداری پروژکتور اهمیت دارد؟", "Why Projector Maintenance Matters"),
      B("paragraph",
        "لامپ پروژکتور گرون‌ترین قطعه‌ی مصرفی دستگاهه، و بیشتر خرابی‌های زودرسی که می‌بینیم به‌خاطر گردوغبار و گرمای بیش‌ازحده، نه خود لامپ. چند دقیقه نگهداری منظم می‌تونه عمر لامپ رو دو برابر کنه.",
        "The lamp is the most expensive consumable part of a projector, and most of the premature failures we see come from dust and overheating, not the lamp itself. A few minutes of regular upkeep can double its lifespan."),
      B("heading", "چند نکته‌ی کاربردی", "A Few Practical Tips"),
      B("paragraph",
        "فیلتر هوا رو هر ۲ تا ۳ ماه با یه برس نرم یا هوای فشرده تمیز کنید. دستگاه رو در محیط بدون گردوغبار و با تهویه‌ی مناسب نگه دارید. قبل از جابه‌جایی، حتماً چند دقیقه صبر کنید تا فن خنک‌کننده به‌طور کامل خاموش بشه.",
        "Clean the air filter every 2–3 months with a soft brush or compressed air. Keep the unit in a dust-free, well-ventilated space. Before moving it, always wait a few minutes for the cooling fan to fully shut off."),
      B("paragraph",
        "اگه تصویر تار شده یا رنگ‌ها افت کرده، لزوماً لامپ خراب نیست — خیلی وقت‌ها فقط لنز کثیفه یا فوکوس به‌هم خورده. قبل از خرید لامپ جدید، بذارید یه سرویس ساده انجام بدیم.",
        "If the picture looks blurry or colors have faded, it's not necessarily the lamp — often it's just a dirty lens or a focus that's drifted. Before buying a new lamp, let us run a simple service check first."),
    ],
  },
  {
    slug: "home-projector-buying-guide",
    title: T("راهنمای خرید پروژکتور خانگی: به چه چیزهایی دقت کنیم؟", "Home Projector Buying Guide: What Actually Matters"),
    blocks: [
      B("heading", "لومن مهم‌تره یا رزولوشن؟", "Lumens or Resolution — Which Matters More?"),
      B("paragraph",
        "لومن میزان روشنایی تصویره و رزولوشن میزان جزئیاته. برای اتاقی که کامل تاریک می‌شه، ۲۰۰۰ تا ۳۰۰۰ لومن کافیه؛ ولی اگه نور محیط دارید، دنبال مدل‌های بالای ۳۵۰۰ لومن باشید وگرنه تصویر شسته به‌نظر می‌رسه.",
        "Lumens control brightness, resolution controls detail. For a room you can fully darken, 2000–3000 lumens is plenty. If there's ambient light, look for models above 3500 lumens or the image will look washed out."),
      B("heading", "DLP یا 3LCD؟", "DLP or 3LCD?"),
      B("paragraph",
        "پروژکتورهای DLP معمولاً کنتراست بهتر و نرخ رفرش بالاتری دارن که برای فیلم اکشن و بازی مناسب‌تره. 3LCD معمولاً رنگ‌های طبیعی‌تری می‌ده و برای تماشای طولانی‌مدت راحت‌تره. هیچ‌کدوم مطلقاً بهتر نیست، به ذوق و کاربرد شما بستگی داره.",
        "DLP projectors usually offer better contrast and higher refresh rates, which suits action movies and gaming. 3LCD tends to render more natural colors and is easier on the eyes for long viewing sessions. Neither is objectively better — it comes down to your taste and use case."),
      B("paragraph",
        "یه نکته که کمتر کسی بهش فکر می‌کنه: فاصله‌ی پرتاب (throw distance). قبل از خرید، اندازه‌ی اتاقتون رو اندازه بگیرید و از فروشنده بپرسید این مدل با اون فاصله چه اندازه تصویری می‌ده.",
        "One thing people often overlook: throw distance. Before buying, measure your room and ask the seller what screen size that specific model produces at that distance."),
    ],
  },
  {
    slug: "ps-repair-warning-signs",
    title: T("۵ نشانه‌ای که می‌گن پلی‌استیشن شما نیاز به تعمیر داره", "5 Warning Signs Your PlayStation Needs Repair"),
    blocks: [
      B("heading", "قبل از اینکه کامل خراب بشه", "Before It Fails Completely"),
      B("paragraph", "خیلی از خرابی‌های جدی پلی‌استیشن با یه علامت کوچیک شروع می‌شن. اگه زود متوجه بشید، تعمیرش هم ساده‌تر و ارزون‌تره.",
        "Most serious PlayStation faults start with a small warning sign. Catching it early usually means a simpler, cheaper repair."),
      B("heading", "۱. صدای فن بلندتر از حد معمول", "1. The Fan Is Louder Than Usual"),
      B("paragraph", "اگه کنسول یهو صداش زیاد شده، معمولاً یعنی گردوگیر داخلش پره یا خمیر حرارتی خشک شده. اگه نادیده بگیرید، ممکنه کنسول خودش رو خاموش کنه تا از سوختن جلوگیری بشه.",
        "If the console suddenly got noisier, it usually means dust buildup inside or dried-out thermal paste. Ignore it long enough and the console may start shutting itself off to prevent damage."),
      B("heading", "۲. دیسک‌خور صدای عجیب می‌ده یا دیسک رو پس می‌زنه", "2. The Disc Drive Makes Odd Noises or Ejects Discs"),
      B("paragraph", "این معمولاً یا لیزر ضعیف شده یا مکانیزم کشویی دیسک نیاز به تنظیم داره. هر چی دیرتر بیارید، احتمال خط‌ افتادن روی دیسک‌های بازی بیشتر می‌شه.",
        "This is usually either a weakening laser lens or a disc-loading mechanism that needs adjustment. The longer you wait, the more likely your game discs get scratched in the process."),
      B("heading", "۳ تا ۵: داغ‌کردن، ریستارت خودکار و مشکل HDMI", "3–5: Overheating, Random Restarts, and HDMI Issues"),
      B("paragraph", "کنسولی که خیلی داغ می‌کنه، خودش رو خاموش/روشن می‌کنه یا تصویری روی HDMI نمیاد، معمولاً به یه سرویس کامل نیاز داره، نه فقط یه تعمیر سریع.",
        "A console that runs very hot, restarts itself randomly, or shows nothing over HDMI usually needs a full service, not just a quick fix."),
    ],
  },
  {
    slug: "ssd-vs-hdd-upgrade",
    title: T("SSD یا HDD؟ کدام برای لپ‌تاپ شما بهتر است", "SSD vs HDD: Which Upgrade Is Right for Your Laptop"),
    blocks: [
      B("heading", "چرا این سوال مهمه", "Why This Question Matters"),
      B("paragraph", "اگه لپ‌تاپتون چند سالشه و کند شده، خیلی وقت‌ها مشکل CPU نیست — هارد قدیمیه که گلوگاه سرعته. تعویضش با SSD تنها ارتقایی هست که واقعاً حس می‌کنید.",
        "If your laptop is a few years old and feels slow, the CPU usually isn't the bottleneck — the old hard drive is. Swapping it for an SSD is the one upgrade you'll actually feel."),
      B("heading", "چقدر فرق می‌کنه؟", "How Big Is the Difference?"),
      B("paragraph", "بوت شدن ویندوز از ۱ تا ۲ دقیقه به زیر ۲۰ ثانیه می‌رسه. باز کردن برنامه‌های سنگین هم چند برابر سریع‌تر می‌شه. برای اکثر کاربرها، این تغییر محسوس‌تر از تعویض CPU یا رم اضافه‌ست.",
        "Windows boot time drops from 1–2 minutes to under 20 seconds. Heavy applications also open several times faster. For most users, this change is more noticeable than a CPU swap or extra RAM."),
      B("paragraph", "اگه فایل‌های حجیم زیاد ذخیره می‌کنید (مثل فیلم یا آرشیو عکس)، ترکیب SSD کوچیک برای ویندوز + هارد بزرگ برای فایل‌ها معمولاً بهترین جواب رو می‌ده.",
        "If you store a lot of large files — movies, photo archives — a combination of a smaller SSD for Windows plus a larger HDD for storage is usually the sweet spot."),
    ],
  },
  {
    slug: "why-computer-overheats",
    title: T("چرا کامپیوتر من داغ می‌کند و چطور آن را حل کنم؟", "Why Does My Computer Overheat, and How Do I Fix It?"),
    blocks: [
      B("heading", "علائم رو بشناسید", "Know the Symptoms"),
      B("paragraph", "خاموش شدن ناگهانی زیر بار کاری، کندی شدید بعد از چند دقیقه کارکردن، یا صدای فن که هیچ‌وقت آروم نمی‌گیره — همه نشونه‌ی گرمای بیش‌ازحدن.",
        "Sudden shutdowns under load, severe slowdowns after a few minutes of use, or a fan that never quiets down — these are all signs of overheating."),
      B("heading", "رایج‌ترین دلیل‌ها", "The Usual Culprits"),
      B("paragraph", "خشک‌شدن خمیر حرارتی روی CPU بعد از ۲ تا ۳ سال، گرفتگی فن و رادیاتور با گردوغبار، و قرار دادن لپ‌تاپ روی سطح نرم مثل تخت که راه خروج هوا رو می‌بنده — این سه مورد بیشتر خرابی‌هایی هستن که می‌بینیم.",
        "Thermal paste drying out on the CPU after 2–3 years, dust clogging the fan and heatsink, and placing a laptop on a soft surface like a bed that blocks airflow — these three cover most of the cases we see."),
      B("paragraph", "راه‌حل همیشه تعویض قطعه نیست. خیلی وقت‌ها یه تمیزکاری کامل و خمیر حرارتی جدید، مشکل رو کاملاً حل می‌کنه — خیلی ارزون‌تر از چیزی که فکرش رو می‌کنید.",
        "The fix isn't always a new part. Often, a thorough clean-out and fresh thermal paste solves it completely — for a lot less than you'd expect."),
    ],
  },
  {
    slug: "dlp-vs-3lcd",
    title: T("تفاوت DLP و 3LCD در پروژکتورها چیست؟", "DLP vs 3LCD Projectors: What's the Real Difference?"),
    blocks: [
      B("heading", "دو تکنولوژی، دو تجربه‌ی متفاوت", "Two Technologies, Two Different Experiences"),
      B("paragraph", "توی DLP، تصویر با میلیون‌ها آینه‌ی ریز ساخته می‌شه؛ توی 3LCD، نور از سه پنل رنگی عبور می‌کنه. این تفاوت فنی مستقیم روی چیزی که می‌بینید اثر می‌ذاره.",
        "In DLP, the image is formed by millions of tiny mirrors; in 3LCD, light passes through three colored panels. This technical difference directly affects what you see on screen."),
      B("heading", "کدوم برای چی بهتره؟", "Which One Suits What?"),
      B("paragraph", "DLP معمولاً کنتراست بهتر، سیاه عمیق‌تر و حرکت روون‌تری داره — برای اتاق سینمای خانگی تاریک، انتخاب محبوب‌تریه. 3LCD روشنایی و دقت رنگ بهتری در محیط‌های روشن‌تر می‌ده — برای دفتر یا کلاس درس مناسب‌تره.",
        "DLP typically has better contrast, deeper blacks, and smoother motion — a popular pick for a dark home cinema room. 3LCD delivers better brightness and color accuracy in brighter environments — a better fit for an office or classroom."),
      B("paragraph", "یه نکته: بعضی مدل‌های DLP قدیمی‌تر پدیده‌ای به اسم «rainbow effect» دارن که بعضی افراد حساسش هستن. اگه قبلاً دیده باشید و اذیتتون کرده، شاید 3LCD انتخاب بهتری باشه.",
        "One note: some older DLP models have a phenomenon called the 'rainbow effect,' which a portion of viewers are sensitive to. If you've noticed it before and it bothered you, 3LCD might be the safer choice."),
    ],
  },
  {
    slug: "data-recovery-basics",
    title: T("هارد یا SSD خراب شده؟ این کارها را نکنید", "Drive Failed? Here's What NOT to Do"),
    blocks: [
      B("heading", "اولین قانون: هرچی زودتر خاموشش کنید", "Rule One: Power It Off As Soon As Possible"),
      B("paragraph", "اگه هارد صدای عجیب می‌ده (تیک‌تیک یا جیغ‌جیغ)، سریع دستگاه رو خاموش کنید و روشنش نکنید. هر بار که روشنش کنید، احتمال آسیب بیشتر به سکتورهایی که هنوز سالمن بالا می‌ره.",
        "If a hard drive is making strange noises — clicking or grinding — power it down immediately and don't turn it back on. Every additional power-up increases the risk of damaging sectors that are still intact."),
      B("heading", "کارهایی که نباید انجام بدید", "What Not to Try Yourself"),
      B("paragraph", "هارد رو توی فریزر نذارید (یه ترفند قدیمی که معمولاً بیشتر آسیب می‌زنه)، خودتون بازش نکنید، و نرم‌افزارهای ریکاوری رایگان رو مستقیم روی همون درایو نصب نکنید. این کارها می‌تونن شانس بازیابی رو کاملاً از بین ببرن.",
        "Don't put the drive in the freezer (an old trick that usually does more harm than good), don't open the casing yourself, and don't install recovery software directly onto the failing drive. Any of these can permanently kill your chances of recovery."),
      B("paragraph", "برای SSD قوانین کمی فرق می‌کنه — خرابی‌هاش بیشتر الکترونیکیه تا مکانیکی، ولی اصل ماجرا یکیه: هرچی دیرتر بیارید و بیشتر باهاش کار کنید، احتمال بازگشت اطلاعات پایین‌تر میاد.",
        "SSDs are a bit different — failures tend to be electronic rather than mechanical — but the principle is the same: the longer you wait and the more you use it, the lower your chances of getting the data back."),
    ],
  },
  {
    slug: "repair-vs-replace-laptop",
    title: T("قبل از فروش یا تعویض لپ‌تاپ قدیمی، این را بخوانید", "Before You Sell or Replace That Old Laptop, Read This"),
    blocks: [
      B("heading", "همیشه خرید جدید ارزون‌تر نیست", "A New Laptop Isn't Always the Cheaper Option"),
      B("paragraph", "خیلی وقت‌ها لپ‌تاپ چهار پنج ساله فقط به یه اورهال نیاز داره: تعویض خمیر حرارتی، تمیزکاری فن، شاید یه SSD جدید. هزینه‌ش معمولاً یه‌دهم قیمت یه لپ‌تاپ نو هم نمی‌شه.",
        "Often a four- or five-year-old laptop just needs an overhaul: fresh thermal paste, a fan clean-out, maybe a new SSD. The cost is usually a fraction of buying a new machine."),
      B("heading", "کی واقعاً وقتشه تعویض کنید؟", "When Is It Actually Time to Replace?"),
      B("paragraph", "اگه مادربردش آسیب دیده، یا نسل CPU اونقدر قدیمیه که حتی با SSD هم نمی‌تونه نرم‌افزارهای امروزی رو راحت اجرا کنه، دیگه اورهال به‌صرفه نیست. ولی قبل از تصمیم‌گیری، بذارید یه ارزیابی رایگان انجام بدیم.",
        "If the motherboard is damaged, or the CPU generation is old enough that even an SSD can't make modern software run comfortably, an overhaul stops making sense. But before deciding, let us run a free assessment first."),
      B("paragraph", "این تصمیم رو بدون اطلاعات دقیق نگیرید. خیلی از مشتری‌هامون فکر می‌کردن لپ‌تاپشون از رده خارج شده، در حالی که با هزینه‌ی کم دوباره چند سال دیگه قابل استفاده شد.",
        "Don't make this call without real information. A lot of our customers assumed their laptop was done for, when in fact a small investment got them several more years out of it."),
  ],
  },
];

articles.forEach((a, idx) => {
  insertPage.run(
    `article-${idx + 1}`,
    JSON.stringify(a.title),
    a.slug,
    JSON.stringify(a.blocks),
    0, 1, 10 + idx,
    authorId, authorName, now0, now0
  );
});

console.log(`[seed] صفحات پایه بررسی و در صورت نیاز تکمیل شدند (شامل ${articles.length} مقاله)`);

// --- مهاجرت سبک: ستون‌های جدید جدول سفارشات برای پشتیبانی از سفارش خدمات و آدرس کامل ---
const orderColumns = db.prepare("PRAGMA table_info(orders)").all().map((c) => c.name);
const orderMigrations = [
  ["order_type", "TEXT NOT NULL DEFAULT 'shop'"],
  ["status", "TEXT NOT NULL DEFAULT 'reviewing'"],
  ["customer_province", "TEXT NOT NULL DEFAULT ''"],
  ["customer_city", "TEXT NOT NULL DEFAULT ''"],
  ["customer_postal_code", "TEXT NOT NULL DEFAULT ''"],
  ["device_info", "TEXT NOT NULL DEFAULT ''"],
  ["issue_description", "TEXT NOT NULL DEFAULT ''"],
  ["customer_email", "TEXT NOT NULL DEFAULT ''"],
  ["updated_at", "TEXT NOT NULL DEFAULT ''"],
];
for (const [col, def] of orderMigrations) {
  if (!orderColumns.includes(col)) {
    db.exec(`ALTER TABLE orders ADD COLUMN ${col} ${def}`);
    console.log(`[migrate] ستون ${col} به جدول orders اضافه شد`);
  }
}

const notifRow = db.prepare("SELECT id FROM notification_settings WHERE id = 1").get();
if (!notifRow) {
  db.prepare(
    "INSERT INTO notification_settings (id, updated_at) VALUES (1, ?)"
  ).run(new Date().toISOString());
}
const paymentRow = db.prepare("SELECT id FROM payment_settings WHERE id = 1").get();
if (!paymentRow) {
  db.prepare(
    "INSERT INTO payment_settings (id, provider, merchant_id, api_key, enabled, updated_at) VALUES (1, '', '', '', 0, ?)"
  ).run(new Date().toISOString());
}

export { uid };
