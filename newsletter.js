(function () {
  'use strict';

  var SITE_URL = 'https://asmdi.ir';
  var DEFAULT_SITE_CONTACT = {
    phoneCode: '021',
    phoneNumber: '88481980',
    mobileDisplay: '0937 900 1701',
    mobileRaw: '989379001701',
    email: 'Info@asmdi.ir',
    instagramUrl: 'https://www.instagram.com/allamehsokhan/',
    youtubeUrl: '',
    aparatUrl: '',
    whatsappUrl: 'https://wa.me/989379001701',
    baleUrl: 'https://ble.ir/09379001701',
    telegramUrl: 'tg://resolve?phone=989379001701'
  };
  var DEFAULT_INSTAGRAM_URL = DEFAULT_SITE_CONTACT.instagramUrl;
  var DEFAULT_ARTICLES = [
    {
      id: 'toefl-2026-changes',
      title: 'تغییرات آزمون TOEFL iBT در سال ۲۰۲۶؛ ساختار، نمره‌دهی و قوانین جدید',
      category: 'TOEFL iBT',
      excerpt: 'راهنمای تغییرات نسخه جدید TOEFL iBT از ۲۱ ژانویه ۲۰۲۶، ساختار تطبیقی، مقیاس نمره ۱ تا ۶ و نکات مهم ثبت‌نام.',
      image: 'assets/article-toefl-2026.jpg',
      publishedAt: '2026-06-11',
      keywords: 'تغییرات تافل ۲۰۲۶، ساختار جدید TOEFL iBT، نمره تافل، ثبت نام تافل',
      body: `
        <p>آزمون TOEFL iBT از <strong>۲۱ ژانویه ۲۰۲۶</strong> وارد مرحله تازه‌ای شده است. هدف ETS از این بازطراحی، نزدیک‌تر کردن محتوای آزمون به زبان واقعی محیط دانشگاه و ارائه تجربه‌ای کارآمدتر برای داوطلبان اعلام شده است. اگر برای پذیرش تحصیلی، مهاجرت یا ارائه مدرک زبان برنامه‌ریزی می‌کنید، باید ساختار و شیوه گزارش نمره جدید را در برنامه مطالعاتی خود در نظر بگیرید.</p>
        <div class="article-note">جزئیات اجرایی، هزینه و تاریخ‌های قابل رزرو ممکن است براساس کشور و مرکز آزمون تغییر کند. مرجع نهایی همیشه حساب کاربری و صفحات رسمی ETS است.</div>
        <h2>مهم‌ترین تغییرات نسخه جدید TOEFL</h2>
        <p>در نسخه جدید، بخش‌های Reading و Listening از طراحی تطبیقی چندمرحله‌ای استفاده می‌کنند؛ یعنی مسیر برخی سوال‌ها می‌تواند با توجه به عملکرد داوطلب تنظیم شود. محتوای آزمون نیز بیشتر بر کاربردهای واقعی زبان انگلیسی در دانشگاه و زندگی روزمره تمرکز دارد. زمان کل آزمون حدود دو ساعت است، اما مدت دقیق می‌تواند با توجه به مسیر آزمون کمی متفاوت باشد.</p>
        <h2>مقیاس نمره ۱ تا ۶</h2>
        <p>نمره هر چهار مهارت و نمره کل در مقیاس ۱ تا ۶ و با گام‌های نیم‌نمره‌ای گزارش می‌شود. ETS برای یک دوره انتقالی دوساله، نمره قابل مقایسه در مقیاس شناخته‌شده ۰ تا ۱۲۰ را نیز در کارنامه نمایش می‌دهد تا دانشگاه‌ها و داوطلبان فرصت تطبیق با سیستم جدید را داشته باشند. پیش از ارسال نمره، حدنصاب دانشگاه مقصد را مستقیماً بررسی کنید.</p>
        <h2>برای آمادگی چه چیزی باید تغییر کند؟</h2>
        <ul><li>تمرین را فقط به حفظ قالب سوال محدود نکنید و سرعت درک متن و صوت واقعی را بالا ببرید.</li><li>در آزمون‌های شبیه‌ساز، مدیریت زمان و تمرکز پیوسته را تمرین کنید.</li><li>پاسخ‌های Speaking و Writing را با معیارهای نمره‌دهی و بازخورد مدرس تحلیل کنید.</li><li>پیش از رزرو، اعتبار گذرنامه، شیوه نوشتن نام و قوانین روز آزمون را کنترل کنید.</li></ul>
        <h2>ثبت‌نام و منابع رسمی</h2>
        <p>برای مشاهده توضیحات رسمی ساختار جدید به <a href="https://www.ets.org/toefl/test-takers/ibt/about/content.html" target="_blank" rel="noopener">صفحه محتوای TOEFL iBT در ETS</a> مراجعه کنید. برای انتخاب تاریخ می‌توانید از <a href="#toefl-dates" onclick="showPage('toefl-dates')">تقویم آزمون TOEFL در علامه سخن</a> استفاده کنید و در صورت نیاز، درخواست <a href="#toefl-voucher" onclick="showPage('toefl-voucher')">خرید ووچر TOEFL iBT</a> را ثبت کنید.</p>`
    },
    {
      id: 'toefl-mock-benefits',
      title: 'آزمون آزمایشی TOEFL چه فایده‌ای دارد و چه زمانی باید در ماک شرکت کنیم؟',
      category: 'آزمون آزمایشی',
      excerpt: 'بررسی فواید آزمون ماک TOEFL، زمان مناسب شرکت، تحلیل چهار مهارت و نقش شبیه‌سازی در کاهش استرس روز آزمون.',
      image: 'assets/article-mock-benefits.jpg',
      publishedAt: '2026-06-11',
      keywords: 'آزمون آزمایشی تافل، ماک تافل، Mock TOEFL تهران، آمادگی TOEFL',
      body: `
        <p>مطالعه منابع و حل تمرین برای موفقیت در TOEFL ضروری است، اما تا زمانی که خود را در یک آزمون پیوسته، زمان‌دار و نزدیک به شرایط مرکز رسمی محک نزنید، تصویر کاملی از آمادگی خود ندارید. آزمون آزمایشی استاندارد فاصله میان «دانستن زبان» و «اجرای درست در روز آزمون» را مشخص می‌کند.</p>
        <h2>ماک دقیقاً چه چیزی را نشان می‌دهد؟</h2>
        <p>یک ماک مناسب باید چهار مهارت را در ترتیب و محدودیت زمانی منطقی بسنجد. نتیجه فقط یک عدد نیست؛ تحلیل زمان، افت تمرکز، نوع خطاهای Reading و Listening و کیفیت پاسخ‌های Speaking و Writing به شما می‌گوید کدام بخش برنامه نیاز به اصلاح دارد.</p>
        <h2>کاهش استرس با تجربه قبلی</h2>
        <p>محیط ناآشنا، هدفون، میکروفون، صدای سایر داوطلبان و فشار زمان می‌تواند عملکرد واقعی را پایین بیاورد. حضور در محیط شبیه مرکز آزمون، این عوامل را قابل پیش‌بینی می‌کند. داوطلب یاد می‌گیرد بدون توقف میان بخش‌ها حرکت کند و انرژی ذهنی خود را تا پایان حفظ کند.</p>
        <h2>چه زمانی شرکت کنیم؟</h2>
        <ul><li>یک نوبت در ابتدای برنامه برای تعیین نقطه شروع.</li><li>یک نوبت در میانه مسیر برای سنجش اثر برنامه مطالعاتی.</li><li>یک یا دو نوبت در هفته‌های پایانی برای تمرین اجرای کامل و مدیریت اضطراب.</li></ul>
        <p>تعداد زیاد آزمون بدون تحلیل، الزاماً باعث پیشرفت نمی‌شود. فاصله میان دو ماک باید برای بررسی خطاها و تمرین هدفمند کافی باشد. برای مشاهده برنامه‌ها وارد صفحه <a href="#mock-toefl" onclick="showPage('mock-toefl')">آزمون Mock TOEFL علامه سخن</a> یا <a href="#mock-dates" onclick="showPage('mock-dates')">تاریخ آزمون‌های آزمایشی</a> شوید.</p>`
    },
    {
      id: 'register-toefl-gre-iran',
      title: 'نحوه ثبت‌نام آزمون TOEFL iBT و GRE از ایران؛ پرداخت مستقیم یا ووچر',
      category: 'ثبت‌نام و ووچر',
      excerpt: 'راهنمای ثبت‌نام TOEFL و GRE از ایران، روش پرداخت ارزی، خرید ووچر، نکات امنیتی و کنترل اطلاعات هویتی.',
      image: 'assets/article-voucher-registration.jpg',
      publishedAt: '2026-06-11',
      keywords: 'ثبت نام تافل در ایران، ثبت نام GRE، خرید ووچر تافل، خرید ووچر GRE',
      body: `
        <p>ثبت‌نام TOEFL iBT و GRE از طریق حساب رسمی ETS انجام می‌شود. چالش اصلی برای بسیاری از داوطلبان داخل ایران، پرداخت ارزی و کنترل دقیق مشخصات هویتی است. شما می‌توانید هزینه را با کارت بین‌المللی معتبر پرداخت کنید یا از ووچر مجاز و متناسب با آزمون استفاده کنید.</p>
        <h2>مراحل مشترک ثبت‌نام</h2>
        <ul><li>حساب ETS را با ایمیل شخصی و قابل دسترس بسازید.</li><li>نام و نام خانوادگی را دقیقاً مطابق گذرنامه معتبر وارد کنید.</li><li>نوع آزمون، شهر، مرکز و تاریخ را انتخاب کنید.</li><li>پیش از پرداخت، زمان آزمون، سیاست تغییر تاریخ و مبلغ نهایی را دوباره بررسی کنید.</li><li>پس از پرداخت، ایمیل و شماره تأیید ثبت‌نام را نگه دارید.</li></ul>
        <h2>پرداخت آنلاین از ایران</h2>
        <p>اگر کارت ارزی بین‌المللی ندارید، شرکت‌های پرداخت ارزی ایرانی می‌توانند با دریافت معادل ریالی، پرداخت را انجام دهند. نمونه‌های شناخته‌شده شامل <a href="https://www.iranicard.ir/" target="_blank" rel="nofollow noopener">ایرانی‌کارت</a>، <a href="https://www.tehranpayment.com/" target="_blank" rel="nofollow noopener">تهران پیمنت</a> و <a href="https://payment24.ir/" target="_blank" rel="nofollow noopener">Payment24</a> هستند. این نام‌ها صرفاً نمونه‌اند و به‌معنای تضمین یا تأیید خدمات نیستند؛ پیش از سفارش، کارمزد، زمان انجام، شرایط بازگشت وجه و اعتبار روز سرویس را بررسی کنید.</p>
        <h2>ووچر چه مزیتی دارد؟</h2>
        <p>ووچر یک کد پرداخت مخصوص آزمون است و می‌تواند نیاز به ارائه اطلاعات کارت بانکی شخصی به چند واسطه را کاهش دهد. یکی از مزیت‌های مهم ووچر این است که می‌توانید آن را امروز تهیه کنید و تا پیش از پایان اعتبار کد، در زمان مناسب‌تری برای انتخاب تاریخ و تکمیل ثبت‌نام آزمون اقدام کنید. این انعطاف به داوطلب فرصت می‌دهد بدون نگرانی از مرحله پرداخت ارزی، برنامه آمادگی و تاریخ آزمون خود را دقیق‌تر تنظیم کند. با این حال، تاریخ انقضا، منطقه قابل استفاده، نوع آزمون و مبلغ پوشش داده‌شده باید پیش از خرید کاملاً بررسی شود. کد را از فروشنده قابل پیگیری تهیه کنید و در اختیار دیگران قرار ندهید.</p>
        <p>علامه سخن امکان ثبت درخواست جداگانه برای <a href="#toefl-voucher" onclick="showPage('toefl-voucher')">ووچر TOEFL iBT</a> و <a href="#gre-voucher" onclick="showPage('gre-voucher')">ووچر GRE</a> را فراهم کرده است. راهنمای رسمی ثبت‌نام نیز در صفحات <a href="https://www.ets.org/toefl/test-takers/ibt/register.html" target="_blank" rel="noopener">TOEFL</a> و <a href="https://www.ets.org/gre/test-takers/general-test/register.html" target="_blank" rel="noopener">GRE</a> در دسترس است.</p>`
    },
    {
      id: 'allameh-new-toefl-mock',
      title: 'آزمون‌های آزمایشی TOEFL علامه سخن با فرمت جدید چه ویژگی‌هایی دارند؟',
      category: 'خدمات علامه سخن',
      excerpt: 'معرفی ماک TOEFL با فرمت جدید، سوالات استاندارد، محیط نزدیک به آزمون اصلی و ارزیابی Speaking و Writing توسط مدرس Native.',
      image: 'assets/article-native-review.jpg',
      publishedAt: '2026-06-11',
      keywords: 'ماک تافل فرمت جدید، آزمون آموزشی تافل، تصحیح Native، نمره آزمایشی TOEFL',
      body: `
        <p>آزمون آزمایشی زمانی ارزشمند است که فقط ظاهر آزمون اصلی را تقلید نکند، بلکه تجربه تصمیم‌گیری زیر فشار زمان، کیفیت سوال، تجهیزات و ارزیابی پاسخ‌های تولیدی را نیز جدی بگیرد. ماک‌های علامه سخن با توجه به فرمت جدید TOEFL طراحی و بروزرسانی می‌شوند.</p>
        <h2>سوالات هدفمند و استاندارد</h2>
        <p>بانک سوال باید از نظر سطح دشواری، مهارت مورد سنجش و تنوع موضوع کنترل شود. سوال‌های بسیار ساده یا خارج از منطق آزمون می‌توانند اعتماد کاذب یا اضطراب بی‌دلیل ایجاد کنند. در طراحی ماک، هدف ارائه تخمینی واقع‌بینانه از وضعیت فعلی و ساختن نقشه تمرین بعدی است.</p>
        <h2>تجربه نزدیک به روز آزمون</h2>
        <p>شرکت‌کننده پشت سیستم مجزا، با هدفون و میکروفون آزمون می‌دهد و بخش‌ها را در زمان تعیین‌شده پشت سر می‌گذارد. فاصله مناسب میزها، آرامش سالن و حضور کادر آموزش‌دیده کمک می‌کند عوامل محیطی تا حد امکان به یک سنتر حرفه‌ای نزدیک باشد.</p>
        <h2>ارزیابی انسانی Speaking و Writing</h2>
        <p>پاسخ‌های گفتاری و نوشتاری توسط مدرس مجرب و در برنامه‌های منتخب توسط مدرس Native Speaker بررسی می‌شود. بازخورد بر وضوح پیام، سازمان‌دهی، دامنه واژگان، دقت زبانی و تناسب پاسخ متمرکز است. نمره ماک یک <strong>تخمین آموزشی</strong> است و تضمین نمره آزمون رسمی محسوب نمی‌شود، اما با اجرای استاندارد و تصحیح دقیق می‌تواند فاصله عملکرد فعلی تا هدف را روشن کند.</p>
        <p>برای انتخاب نوبت مناسب، صفحه <a href="#mock-toefl" onclick="showPage('mock-toefl')">آزمون آزمایشی TOEFL</a> و <a href="#mock-dates" onclick="showPage('mock-dates')">تقویم ماک‌ها</a> را ببینید.</p>`
    },
    {
      id: 'ets-centers-tehran',
      title: 'مراکز برگزاری آزمون‌های ETS در تهران؛ چگونه سنتر مناسب را انتخاب کنیم؟',
      category: 'مراکز آزمون',
      excerpt: 'راهنمای پیدا کردن فهرست رسمی و به‌روز سنترهای ETS در تهران و معیارهای انتخاب مرکز مناسب برای TOEFL iBT و GRE.',
      image: 'assets/article-ets-center.jpg',
      publishedAt: '2026-06-11',
      keywords: 'سنتر تافل تهران، مراکز ETS تهران، مرکز آزمون TOEFL، علامه سخن',
      body: `
        <p>نام و ظرفیت سنترهای ETS ثابت نیست و ممکن است با تاریخ، نوع آزمون یا وضعیت اجرایی هر مرکز تغییر کند. به همین دلیل، مطمئن‌ترین فهرست مراکز فعال همان فهرستی است که پس از ورود به حساب ETS، انتخاب آزمون و جست‌وجوی شهر Tehran نمایش داده می‌شود. تکیه بر فهرست‌های قدیمی اینترنتی می‌تواند به انتخاب تاریخ یا مرکز ناموجود منجر شود.</p>
        <div class="article-note">برای مشاهده نام رسمی مراکز، ابتدا تاریخ تقریبی خود را در سامانه ETS انتخاب کنید. فقط مرکزی را قطعی بدانید که در همان لحظه در مرحله رزرو آزمون نمایش داده می‌شود.</div>
        <h2>معیارهای مهم انتخاب سنتر</h2>
        <ul><li>کیفیت و به‌روز بودن سیستم‌ها، هدفون و میکروفون.</li><li>فاصله مناسب میان جایگاه‌ها و کنترل صدای محیط.</li><li>تهویه، نور و صندلی مناسب برای آزمونی چندساعته.</li><li>کادر آموزش‌دیده، مدیریت منظم ورود و توضیح روشن قوانین.</li><li>دسترسی شهری و زمان کافی برای رسیدن بدون استرس.</li></ul>
        <h2>تجربه آزمون در سنتر علامه سخن</h2>
        <p>در سنتر علامه سخن تلاش شده است سیستم‌ها و تجهیزات به‌صورت مستمر کنترل شوند، فاصله جایگاه‌ها برای تمرکز بهتر حفظ شود و فضای آرام سالن با مدیریت کادر مجرب و آموزش‌دیده همراه باشد. هدف ما ارائه تجربه‌ای منظم و محترمانه از ورود تا پایان آزمون است.</p>
        <p>برای بررسی تاریخ‌هایی که از طرف موسسه اعلام شده‌اند، <a href="#toefl-dates" onclick="showPage('toefl-dates')">تاریخ‌های TOEFL iBT</a> و <a href="#gre-dates" onclick="showPage('gre-dates')">تاریخ‌های GRE</a> را ببینید. پیش از پرداخت، موجود بودن همان نوبت را در سامانه رسمی ETS نیز کنترل کنید.</p>`
    },
    {
      id: 'toefl-test-guide',
      title: 'آشنایی کامل با آزمون TOEFL iBT؛ از چهار مهارت تا روز آزمون',
      category: 'راهنمای TOEFL',
      excerpt: 'راهنمای ساختار چهارمهارتی TOEFL iBT، آمادگی پیش از آزمون، مدارک لازم، مدیریت زمان و مسیر ثبت‌نام.',
      image: 'assets/article-toefl-guide.jpg',
      publishedAt: '2026-06-11',
      keywords: 'آزمون تافل چیست، ساختار TOEFL iBT، مهارت های تافل، ثبت نام تافل',
      body: `
        <p>TOEFL iBT یکی از آزمون‌های معتبر زبان انگلیسی برای سنجش توانایی استفاده از زبان در محیط دانشگاهی است. آزمون چهار مهارت Reading، Listening، Speaking و Writing را می‌سنجد و بسیاری از فعالیت‌ها نیازمند ترکیب بیش از یک مهارت‌اند؛ برای نمونه ممکن است متنی بخوانید، بخشی را بشنوید و سپس پاسخ گفتاری یا نوشتاری تولید کنید.</p>
        <h2>چهار مهارت آزمون</h2>
        <h3>Reading</h3><p>توانایی درک متن، پیدا کردن ارتباط ایده‌ها و پردازش واژگان در بافت بررسی می‌شود. تمرین سرعت خواندن باید همراه با فهم دقیق باشد.</p>
        <h3>Listening</h3><p>داوطلب باید ایده اصلی، جزئیات مهم، نگرش گوینده و ساختار گفتگو یا ارائه را تشخیص دهد. یادداشت‌برداری انتخابی از نوشتن همه کلمات مفیدتر است.</p>
        <h3>Speaking</h3><p>وضوح، سازمان‌دهی پاسخ و استفاده موثر از زبان اهمیت دارد. لهجه بومی شرط موفقیت نیست؛ قابل فهم بودن و انتقال کامل پیام مهم‌تر است.</p>
        <h3>Writing</h3><p>پاسخ باید دقیقاً به تکلیف داده‌شده مربوط باشد، ساختار منطقی داشته باشد و اطلاعات منابع را درست ترکیب کند.</p>
        <h2>پیش از روز آزمون</h2>
        <ul><li>نام حساب و مدرک هویتی را کاملاً یکسان ثبت کنید.</li><li>قوانین ورود، ساعت حضور و وسایل مجاز را از تأییدیه ETS بخوانید.</li><li>مسیر سنتر را از قبل بررسی کنید و برای تأخیر احتمالی زمان اضافه بگذارید.</li><li>حداقل یک آزمون کامل زمان‌دار انجام دهید.</li></ul>
        <p>اطلاعات رسمی و بروزرسانی‌های آزمون در <a href="https://www.ets.org/toefl/test-takers/ibt/about.html" target="_blank" rel="noopener">وب‌سایت ETS</a> منتشر می‌شود. برای اقدام از طریق موسسه، به <a href="#exam-registration" onclick="openExamRegistration('toefl')">ثبت‌نام TOEFL iBT</a> یا <a href="#toefl-voucher" onclick="showPage('toefl-voucher')">خرید ووچر TOEFL</a> بروید.</p>`
    }
  ];

  var EN_ARTICLES = {
    'toefl-2026-changes': {
      title: 'TOEFL iBT Changes in 2026: Structure, Scoring and Updated Rules',
      category: 'TOEFL iBT',
      excerpt: 'A practical guide to the latest TOEFL iBT format, scoring updates, registration points and what candidates should check before booking.',
      keywords: 'TOEFL iBT 2026 changes, TOEFL structure, TOEFL scoring, TOEFL registration',
      body: `
        <p>The TOEFL iBT is one of the most widely accepted English-language tests for university admission, scholarship applications, migration pathways and professional goals. Because ETS updates its policies, score-reporting details and test-day rules over time, every candidate should review the official ETS pages before booking a test date.</p>
        <div class="article-note">For the final and official version of dates, fees, rules and registration terms, always rely on your ETS account and official ETS pages.</div>
        <h2>What has changed and why it matters</h2>
        <p>Recent TOEFL iBT updates have focused on making the test experience shorter, clearer and closer to the language skills candidates need in academic settings. The test still measures the four main skills, but preparation should no longer be limited to memorizing fixed question patterns. Candidates need to practise understanding academic content, organizing answers quickly and producing clear spoken and written responses under time pressure.</p>
        <h2>What candidates should check before registration</h2>
        <ul><li>Make sure the name in your ETS account exactly matches your valid identification document.</li><li>Review the test center address, arrival time, allowed items and identification requirements.</li><li>Check score-reporting options and the institutions that should receive your scores.</li><li>Read the rescheduling, cancellation and refund rules before payment.</li><li>Confirm the test format and section timing on the official ETS website.</li></ul>
        <h2>How to prepare for the current TOEFL iBT</h2>
        <p>A good TOEFL preparation plan should combine language development with test execution. Reading practice should improve speed and accuracy. Listening practice should include note-taking and understanding lectures or conversations. Speaking practice should focus on organization, clarity and confidence. Writing practice should build structure, development and language control.</p>
        <ul><li>Practice with full-length timed tests, not only isolated questions.</li><li>Build academic reading speed and learn how to identify main ideas quickly.</li><li>Use listening practice that includes lectures, discussions and note-taking.</li><li>Record Speaking responses and review pronunciation, structure and delivery.</li><li>Get Writing feedback from a qualified instructor instead of only checking grammar.</li></ul>
        <h2>Why mock testing is important</h2>
        <p>A realistic mock test helps candidates understand how they perform when all sections are taken continuously. It also shows whether timing, stress, listening stamina or speaking confidence may reduce the final score. For this reason, a mock test should be part of the preparation plan, especially in the last weeks before the official exam.</p>
        <h2>Official resources and registration</h2>
        <p>You can read official information on the <a href="https://www.ets.org/toefl/test-takers/ibt/about.html" target="_blank" rel="noopener">ETS TOEFL iBT website</a>. You can also view <a href="#toefl-dates" onclick="showPage('toefl-dates')">TOEFL iBT dates at Allameh Sokhan</a>, register for TOEFL services or request a <a href="#toefl-voucher" onclick="showPage('toefl-voucher')">TOEFL iBT voucher</a>.</p>`
    },
    'toefl-mock-benefits': {
      title: 'Why Take a TOEFL Mock Test and When Is the Best Time?',
      category: 'Mock Tests',
      excerpt: 'Learn how a standard TOEFL mock test helps you measure readiness, reduce test-day stress and improve your four skills with targeted feedback.',
      keywords: 'TOEFL mock test, Mock TOEFL Tehran, TOEFL preparation, TOEFL practice test',
      body: `
        <p>Studying resources and solving practice questions are important, but a candidate only sees the real picture when the whole test is completed under timed and realistic conditions. A standard TOEFL mock test shows the gap between knowing English and performing well on test day.</p>
        <h2>What a good mock test reveals</h2>
        <p>A useful mock test checks Reading, Listening, Speaking and Writing in a continuous experience. The score is only one part of the result. Time management, concentration, response structure, listening stamina and writing quality all show what should be improved next. Many candidates know the language, but lose points because they are not used to the rhythm of the test.</p>
        <h2>Why a mock test is different from practice at home</h2>
        <p>Practice at home is flexible and useful, but it usually does not create the same pressure as the real test. In a test-center-style environment, candidates must manage the screen timer, headset, microphone, section transitions and the presence of other test takers. This experience helps them understand how calm and focused they can stay on the official test day.</p>
        <h2>Reducing test-day stress</h2>
        <p>Headphones, microphones, other candidates, screen timing and the pressure of moving between sections can affect performance. Experiencing these conditions before the official test helps candidates feel calmer and more prepared.</p>
        <h2>How feedback improves your next score</h2>
        <p>The best result of a mock test is not only the estimated score. The main value is the feedback that shows which parts need attention. For example, a candidate may need faster reading, better note-taking in Listening, clearer organization in Speaking or stronger development in Writing. When feedback is specific, the study plan becomes much more effective.</p>
        <h2>Recommended timing</h2>
        <ul><li>Take one mock test at the beginning to find your starting point.</li><li>Take another in the middle of preparation to measure progress.</li><li>Take one or two full mocks near the test date to practice execution and stress control.</li></ul>
        <h2>Who should take a TOEFL mock test?</h2>
        <p>A mock test is useful for candidates who are close to registration, students who need a target score for university admission, applicants who have taken TOEFL before and want to improve, and anyone who wants to understand their current level before paying for the official exam.</p>
        <p>View available <a href="#mock-toefl" onclick="showPage('mock-toefl')">Mock TOEFL services</a> or check the <a href="#mock-dates" onclick="showPage('mock-dates')">mock test calendar</a>.</p>`
    },
    'register-toefl-gre-iran': {
      title: 'How to Register for TOEFL iBT and GRE from Iran: Payment, Voucher and Safety Tips',
      category: 'Registration and Vouchers',
      excerpt: 'A step-by-step overview of TOEFL and GRE registration from Iran, including direct payment, voucher use, identity checks and safer booking habits.',
      keywords: 'TOEFL registration Iran, GRE registration Iran, TOEFL voucher, GRE voucher',
      body: `
        <p>TOEFL iBT and GRE registration is completed through ETS. For many candidates in Iran, the main challenge is international payment, accurate identity information and choosing a reliable test date or test center.</p>
        <h2>Main registration steps</h2>
        <ul><li>Create or sign in to your ETS account with an accessible email address.</li><li>Enter your name exactly as it appears on your valid passport.</li><li>Select the test, city, center and date.</li><li>Check the final fee, rescheduling rules and test-day requirements before payment.</li><li>Keep the confirmation email and registration number.</li></ul>
        <h2>Identity information is critical</h2>
        <p>Your name, surname and identification details must match your passport or the identification document accepted by ETS for your test location. A small spelling difference can create serious problems on test day. Before payment, review every detail carefully and avoid using nicknames, Persian spelling variations or unofficial translations.</p>
        <h2>Payment from Iran</h2>
        <p>If you do not have an international card, Iranian payment providers can sometimes complete the payment for you. Examples include <a href="https://www.iranicard.ir/" target="_blank" rel="nofollow noopener">Iranicard</a>, <a href="https://www.tehranpayment.com/" target="_blank" rel="nofollow noopener">Tehran Payment</a> and <a href="https://payment24.ir/" target="_blank" rel="nofollow noopener">Payment24</a>. These are examples only; always check fees, timing, refund rules and current reliability before ordering.</p>
        <h2>Why use a voucher?</h2>
        <p>A voucher is a payment code for the test. One advantage is that you can buy the voucher today and, depending on its expiry date and terms, complete your official registration later when you are ready to choose a date. This gives candidates more flexibility and can reduce the stress of arranging international payment at the last moment.</p>
        <h2>Voucher safety tips</h2>
        <ul><li>Buy vouchers only from reliable sources.</li><li>Check the test type before purchase; TOEFL and GRE vouchers are different.</li><li>Ask about the expiry date and usage conditions.</li><li>Keep the voucher code private until you use it in your ETS account.</li><li>After registration, save the ETS confirmation email.</li></ul>
        <h2>How Allameh Sokhan can help</h2>
        <p>Allameh Sokhan provides guidance for TOEFL iBT and GRE candidates, including registration support, test-date information and voucher requests. You can request a <a href="#toefl-voucher" onclick="showPage('toefl-voucher')">TOEFL iBT voucher</a> or a <a href="#gre-voucher" onclick="showPage('gre-voucher')">GRE voucher</a> from Allameh Sokhan.</p>`
    },
    'allameh-new-toefl-mock': {
      title: 'Allameh Sokhan TOEFL Mock Tests in the New Format',
      category: 'Mock TOEFL',
      excerpt: 'A closer look at Allameh Sokhan mock tests, realistic test-center conditions, standard questions and Native-level Speaking and Writing feedback.',
      keywords: 'TOEFL mock format, TOEFL simulation, TOEFL speaking writing feedback',
      body: `
        <p>Allameh Sokhan mock tests are designed to help candidates experience a realistic TOEFL-style environment before the official exam. The goal is to combine standard questions, professional supervision and meaningful score feedback.</p>
        <h2>Realistic test experience</h2>
        <p>The mock test is held in an exam-center setting with computers, headsets and controlled timing. This helps candidates practice concentration, section transitions and test-day discipline. The more familiar the test environment feels, the easier it becomes to focus on language performance instead of technical stress.</p>
        <h2>Standard questions and updated content</h2>
        <p>A useful TOEFL mock test should not be random practice. It should use questions that reflect the logic, difficulty and academic style of the official exam. At Allameh Sokhan, the mock test is designed to help candidates understand their current readiness and identify what should be improved before the official test.</p>
        <h2>Four-skill simulation</h2>
        <p>The mock test can cover all four TOEFL skills: Reading, Listening, Speaking and Writing. Candidates experience the pressure of moving from one skill to another, managing time and producing answers without long breaks. This is especially important for Speaking and Writing, where performance can change significantly under pressure.</p>
        <h2>Feedback that matters</h2>
        <p>Speaking and Writing responses are reviewed with attention to organization, language accuracy, development and clarity. Feedback from experienced and Native-level instructors helps candidates understand what to fix before the official exam. The purpose is not only to give a number, but to explain why that performance receives that score and what can raise it.</p>
        <h2>Why the test-center environment helps</h2>
        <p>Taking a mock test in a setting similar to the official exam helps candidates become familiar with headsets, microphones, computer screens, timing and the presence of other test takers. This makes the official exam less unfamiliar and can help reduce anxiety.</p>
        <p>See our <a href="#mock-toefl" onclick="showPage('mock-toefl')">Mock TOEFL page</a> and available <a href="#mock-dates" onclick="showPage('mock-dates')">mock test dates</a>.</p>`
    },
    'ets-centers-tehran': {
      title: 'ETS Test Centers in Tehran: Facilities, Test-Day Conditions and Candidate Comfort',
      category: 'ETS Centers',
      excerpt: 'A guide to ETS test centers in Tehran and the importance of equipment quality, spacing, quiet conditions and trained test-day staff.',
      keywords: 'ETS centers Tehran, TOEFL test center Tehran, GRE test center Tehran',
      body: `
        <p>Choosing a test center is not only about location. Equipment quality, desk spacing, noise control, staff experience and the overall atmosphere can all influence a candidate's test-day performance.</p>
        <h2>Why the test center matters</h2>
        <p>International exams such as TOEFL iBT and GRE require concentration for a long period of time. A quiet room, reliable systems, comfortable seating, proper desk spacing and trained staff can help candidates focus on the test instead of the environment. A poorly managed center can create unnecessary stress even for well-prepared candidates.</p>
        <h2>What to check before test day</h2>
        <ul><li>Confirm the exact address and travel time.</li><li>Read your ETS confirmation carefully.</li><li>Bring the required identification document.</li><li>Arrive early enough to complete check-in without stress.</li></ul>
        <h2>Important features of a suitable center</h2>
        <ul><li>Updated computers and stable technical equipment.</li><li>Working headphones and microphones for listening and speaking tasks.</li><li>Appropriate spacing between stations.</li><li>Calm test conditions with good noise control.</li><li>Professional staff who understand ETS procedures.</li></ul>
        <h2>Allameh Sokhan test environment</h2>
        <p>Allameh Sokhan focuses on updated systems, suitable spacing between stations, calm test conditions and trained staff support so candidates can concentrate on their performance. The center’s goal is to create a professional, organized and quiet environment for TOEFL iBT and GRE candidates.</p>
        <h2>Before choosing a date</h2>
        <p>Before selecting a test date, review your preparation timeline, travel time to the center and any university deadline you need to meet. You should also check the official ETS account for available seats and final confirmation.</p>
        <p>View the <a href="#gallery" onclick="showPage('gallery')">photo gallery</a>, TOEFL iBT information or GRE information pages for more details.</p>`
    },
    'toefl-test-guide': {
      title: 'Complete Introduction to TOEFL iBT: Sections, Skills and Test-Day Preparation',
      category: 'TOEFL Guide',
      excerpt: 'A clear introduction to the TOEFL iBT test, its four skills, preparation priorities and official ETS resources for candidates.',
      keywords: 'TOEFL iBT guide, TOEFL sections, TOEFL preparation, TOEFL test day',
      body: `
        <p>TOEFL iBT measures how well candidates can use English in academic settings. The test focuses on reading, listening, speaking and writing skills, often through integrated tasks that require candidates to understand information and then respond.</p>
        <h2>What TOEFL iBT is used for</h2>
        <p>Universities, colleges and institutions use TOEFL iBT scores to evaluate whether applicants can study, communicate and participate in English-speaking academic environments. A strong TOEFL score can support admission, scholarship and professional applications.</p>
        <h2>The four skills</h2>
        <h3>Reading</h3><p>Reading checks comprehension, vocabulary in context, relationships between ideas and the ability to process academic passages efficiently.</p>
        <h3>Listening</h3><p>Listening measures understanding of lectures and conversations, main ideas, details, speaker attitude and organization.</p>
        <h3>Speaking</h3><p>Speaking requires clear, organized and understandable responses. A native accent is not required; communication and structure matter more.</p>
        <h3>Writing</h3><p>Writing tasks require relevant answers, logical organization, accurate language and effective use of source information.</p>
        <h2>Integrated academic skills</h2>
        <p>One important feature of TOEFL iBT is that candidates may need to combine skills. For example, they may read a short passage, listen to a lecture and then write or speak about the relationship between the two sources. This is why TOEFL preparation should include academic thinking, note-taking and response organization.</p>
        <h2>How to build an effective study plan</h2>
        <ul><li>Start with a diagnostic mock test to understand your current level.</li><li>Set a realistic target score based on the requirement of your university or program.</li><li>Study vocabulary in context rather than memorizing isolated word lists.</li><li>Use timed practice for each section and full-length practice for stamina.</li><li>Get expert feedback on Speaking and Writing because self-checking is often not enough.</li></ul>
        <h2>Before the test</h2>
        <ul><li>Make sure your ETS account name matches your identity document.</li><li>Review arrival time, allowed items and test-center rules.</li><li>Practice at least one complete timed test.</li></ul>
        <h2>On test day</h2>
        <p>Arrive early, bring the required identification document and follow the instructions of the test center staff. During the test, focus on one section at a time. If one question feels difficult, do not allow it to affect the rest of the exam.</p>
        <p>Official information is available on the <a href="https://www.ets.org/toefl/test-takers/ibt/about.html" target="_blank" rel="noopener">ETS TOEFL iBT website</a>. You can also use Allameh Sokhan for <a href="#exam-registration" onclick="openExamRegistration('toefl')">TOEFL registration support</a> and <a href="#toefl-voucher" onclick="showPage('toefl-voucher')">TOEFL voucher requests</a>.</p>`
    }
  };

  var articleCache = [];
  var siteContentState = { overrides: {}, overridesEn: {}, contact: Object.assign({}, DEFAULT_SITE_CONTACT), instagramUrl: DEFAULT_INSTAGRAM_URL };
  var editableOriginals = {};
  var editableContentMeta = {};
  var selectedContentPage = '';
  var PAGE_LABELS = {
    home: 'صفحه خانه',
    about: 'درباره ما',
    history: 'تاریخچه موسسه',
    achievements: 'آمار و افتخارات',
    contact: 'ارتباط با ما',
    communication: 'مکالمه و مهارت ارتباطی',
    general: 'زبان عمومی و آکادمیک',
    specialized: 'دوره‌های تخصصی',
    toefl: 'آزمون TOEFL iBT',
    gre: 'آزمون GRE',
    gallery: 'گالری عکس',
    mock: 'آزمون‌های آزمایشی',
    'mock-toefl': 'Mock TOEFL',
    'mock-gre': 'Mock GRE',
    'mock-toefl-registration': 'ثبت‌نام Mock TOEFL',
    'mock-gre-registration': 'ثبت‌نام Mock GRE',
    'toefl-dates': 'تاریخ‌های TOEFL',
    'gre-dates': 'تاریخ‌های GRE',
    'mock-dates': 'تاریخ آزمون‌های آزمایشی',
    placement: 'تعیین سطح',
    consultation: 'مشاوره',
    'course-registration': 'ثبت‌نام دوره',
    'exam-registration': 'ثبت‌نام آزمون',
    'toefl-voucher': 'ووچر TOEFL',
    'gre-voucher': 'ووچر GRE',
    newsletter: 'خبرنامه'
  };
  var PERMISSIONS = {
    users: 'مشاهده کاربران',
    registrations: 'ثبت‌نام‌ها',
    attendance: 'فهرست روز آزمون',
    assignments: 'پیشنهاد به دانشجو',
    dates: 'تاریخ آزمون‌ها',
    consultations: 'مشاوره‌ها',
    exams: 'ساخت و مدیریت آزمون',
    articles: 'خبرنامه',
    resources: 'منابع آموزش رایگان',
    gallery: 'مدیریت گالری تصاویر',
    popups: 'پاپ‌آپ‌ها و اطلاعیه‌های سایت',
    content: 'متن‌های سایت',
    settings: 'قیمت و تنظیمات',
    messages: 'پیام‌ها'
    ,notifications: 'اعلان‌ها'
    ,results: 'نتایج و کارنامه'
    ,reports: 'گزارش‌ها و خروجی'
  };

  function articleMap() {
    var map = {};
    DEFAULT_ARTICLES.forEach(function (item) { map[item.id] = Object.assign({}, item, { published: true, builtIn: true }); });
    return map;
  }

  function loadArticles() {
    var map = articleMap();
    return db.collection('articles').get().then(function (snap) {
      snap.forEach(function (doc) {
        var data = doc.data();
        map[doc.id] = Object.assign({}, map[doc.id] || {}, data, { id: doc.id });
      });
      articleCache = Object.keys(map).map(function (id) { return map[id]; }).filter(function (a) { return a.published !== false; })
        .sort(function (a, b) { return String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')); });
      return articleCache;
    }).catch(function () {
      articleCache = Object.keys(map).map(function (id) { return map[id]; });
      return articleCache;
    });
  }

  function newsletterLanguage() {
    return (document.documentElement.lang === 'en' || localStorage.getItem('allameh_sokhan_language') === 'en') ? 'en' : 'fa';
  }

  function isEnglishNewsletter() {
    return newsletterLanguage() === 'en';
  }

  function newsText(fa, en) {
    return isEnglishNewsletter() ? en : fa;
  }

  function localizeArticle(article) {
    if (!article || !isEnglishNewsletter()) return article;
    var en = EN_ARTICLES[article.id] || {};
    if (!en.title && !article.titleEn && /[\u0600-\u06FF]/.test(String(article.title || article.body || ''))) {
      return Object.assign({}, article, {
        title: article.titleEn || article.title,
        category: article.categoryEn || article.category || 'Article',
        excerpt: article.excerptEn || article.excerpt || '',
        body: article.bodyEn || article.body || '',
        keywords: article.keywordsEn || article.keywords || ''
      });
    }
    return Object.assign({}, article, {
      title: article.titleEn || en.title || article.title,
      category: article.categoryEn || en.category || article.category,
      excerpt: article.excerptEn || en.excerpt || article.excerpt,
      body: article.bodyEn || en.body || article.body,
      keywords: article.keywordsEn || en.keywords || article.keywords
    });
  }

  function localizeArticles(articles) {
    return (articles || []).map(localizeArticle);
  }

  function currentArticleIdFromLocation() {
    var hashMatch = (location.hash || '').match(/^#article\/(.+)$/);
    if (hashMatch) return decodeURIComponent(hashMatch[1]);
    var pathMatch = (location.pathname || '').match(/^\/news\/([^/]+)\/?$/);
    return pathMatch ? decodeURIComponent(pathMatch[1]) : '';
  }

  function refreshNewsletterLanguageView() {
    applyContentOverrides();
    var newsletterPage = document.getElementById('page-newsletter');
    var articlePage = document.getElementById('page-article');
    if (newsletterPage && newsletterPage.classList.contains('active')) renderNewsletter();
    if (articlePage && articlePage.classList.contains('active')) {
      var currentArticle = currentArticleIdFromLocation() || (document.getElementById('article-content') && document.getElementById('article-content').getAttribute('data-current-article')) || '';
      if (currentArticle) openArticle(currentArticle, true);
    }
  }

  function formatNewsletterDate(value) {
    var date = new Date(value || Date.now());
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString(isEnglishNewsletter() ? 'en-GB' : 'fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  window.getSearchableArticles = function () {
    return loadArticles().then(function (articles) {
      return articles.map(function (article) {
        var localized = localizeArticle(article);
        return {
          id: localized.id,
          title: localized.title || '',
          excerpt: localized.excerpt || '',
          body: String(localized.body || '').replace(/<[^>]+>/g, ' ')
        };
      });
    });
  };

  function formatPlainArticle(body) {
    if (/<[a-z][\s\S]*>/i.test(body || '')) return body;
    return String(body || '').split(/\n{2,}/).map(function (block) {
      var clean = block.trim();
      if (!clean) return '';
      if (clean.indexOf('## ') === 0) return '<h2>' + escapeHtml(clean.slice(3)) + '</h2>';
      if (clean.indexOf('### ') === 0) return '<h3>' + escapeHtml(clean.slice(4)) + '</h3>';
      return '<p>' + escapeHtml(clean).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  function mediaUrl(value, fallback) {
    var url = String(value || fallback || '');
    if (!url || /^(data:|blob:|https?:\/\/|\/)/i.test(url)) return url;
    var clean = url.replace(/^\.?\//, '');
    return location.protocol === 'file:' ? clean : '/' + clean;
  }

  function renderNewsletter() {
    var grid = document.getElementById('newsletter-grid');
    if (!grid) return;
    grid.innerHTML = '<div class="chat-empty">در حال بارگذاری مقاله‌ها...</div>';
    loadArticles().then(function (articles) {
      grid.innerHTML = articles.map(function (article) {
        return '<article class="news-card"><img class="news-card-image" src="' + escapeHtml(mediaUrl(article.image, 'assets/article-toefl-guide.jpg')) + '" alt="' + escapeHtml(article.title) + '" loading="lazy" decoding="async"><div class="news-card-body">'
          + '<div class="news-card-meta"><span>' + escapeHtml(article.category || 'مقاله') + '</span><time>' + toPersianDate(article.publishedAt) + '</time></div>'
          + '<h2>' + escapeHtml(article.title) + '</h2><p>' + escapeHtml(article.excerpt || '') + '</p>'
          + '<a href="/news/' + encodeURIComponent(article.id) + '" onclick="event.preventDefault();openArticle(\'' + article.id + '\')">مطالعه مقاله ←</a>'
          + '</div></article>';
      }).join('') || '<div class="chat-empty">هنوز مقاله‌ای منتشر نشده است.</div>';
    });
  }

  function renderLatestArticles(articles, currentId) {
    var latest = document.getElementById('latest-news-list');
    if (!latest) return;
    latest.innerHTML = articles.filter(function (article) {
      return article.id !== currentId;
    }).slice(0, 5).map(function (article) {
      return '<div class="latest-news-item" onclick="openArticle(\'' + article.id + '\')"><img src="' + escapeHtml(mediaUrl(article.image, 'assets/article-toefl-guide.jpg'))
        + '" alt="' + escapeHtml(article.title) + '" loading="lazy" decoding="async"><div><strong>' + escapeHtml(article.title) + '</strong><time>' + toPersianDate(article.publishedAt) + '</time></div></div>';
    }).join('');
  }

  function toPersianDate(value) {
    var date = new Date(value || Date.now());
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  window.openArticle = function (id, skipHistory) {
    loadArticles().then(function (articles) {
      var index = articles.findIndex(function (item) { return item.id === id; });
      if (index < 0) return showPage('newsletter');
      var article = articles[index];
      document.querySelectorAll('.page').forEach(function (page) { page.classList.remove('active'); });
      document.getElementById('page-article').classList.add('active');
      document.getElementById('article-breadcrumb-title').textContent = article.title;
      document.getElementById('article-content').innerHTML = '<header class="article-header"><div class="article-category">' + escapeHtml(article.category || 'مقاله')
        + '</div><h1>' + escapeHtml(article.title) + '</h1><p class="article-lead">' + escapeHtml(article.excerpt || '')
        + '</p><div class="article-date">آخرین بروزرسانی: ' + toPersianDate(article.updatedAt || article.publishedAt) + '</div></header>'
        + '<img class="article-cover" src="' + escapeHtml(mediaUrl(article.image, 'assets/article-toefl-guide.jpg')) + '" alt="' + escapeHtml(article.title) + '" decoding="async">'
        + renderArticleMedia(article.media)
        + '<div class="article-body">' + sanitizeArticleHtml(formatPlainArticle(article.body || '')) + '</div>';
      renderLatestArticles(articles, article.id);
      var previous = articles[(index - 1 + articles.length) % articles.length];
      var next = articles[(index + 1) % articles.length];
      document.getElementById('article-pagination').innerHTML =
        '<button class="article-nav-btn previous" onclick="openArticle(\'' + previous.id + '\')"><span class="article-nav-icon">→</span><span><small>مقاله قبلی</small><strong>' + escapeHtml(previous.title) + '</strong></span></button>'
        + '<button class="article-nav-btn next" onclick="openArticle(\'' + next.id + '\')"><span><small>مقاله بعدی</small><strong>' + escapeHtml(next.title) + '</strong></span><span class="article-nav-icon">←</span></button>';
      updateSeo('article', article);
      if (!skipHistory) history.replaceState(null, '', '#article/' + article.id);
      window.scrollTo(0, 0);
    });
  };

  function renderArticleMedia(media) {
    if (!media || !media.data) return '';
    if (String(media.type || '').indexOf('video/') === 0) {
      return '<div class="article-media"><video controls preload="metadata" src="' + media.data + '">مرورگر شما پخش ویدیو را پشتیبانی نمی‌کند.</video></div>';
    }
    if (String(media.type || '').indexOf('audio/') === 0) {
      return '<div class="article-media"><audio controls preload="metadata" src="' + media.data + '">مرورگر شما پخش صدا را پشتیبانی نمی‌کند.</audio></div>';
    }
    return '';
  }

  function sanitizeArticleHtml(html) {
    var template = document.createElement('template');
    template.innerHTML = String(html || '');
    template.content.querySelectorAll('script,style,iframe,object,embed,form').forEach(function (node) { node.remove(); });
    template.content.querySelectorAll('*').forEach(function (node) {
      Array.prototype.slice.call(node.attributes || []).forEach(function (attr) {
        if (/^on/i.test(attr.name) || /javascript:/i.test(attr.value)) node.removeAttribute(attr.name);
      });
    });
    return template.innerHTML;
  }

  renderNewsletter = function () {
    var grid = document.getElementById('newsletter-grid');
    if (!grid) return;
    grid.innerHTML = '<div class="chat-empty">' + newsText('در حال بارگذاری مقاله‌ها...', 'Loading articles...') + '</div>';
    loadArticles().then(function (articles) {
      articles = localizeArticles(articles);
      grid.innerHTML = articles.map(function (article) {
        return '<article class="news-card"><img class="news-card-image" src="' + escapeHtml(mediaUrl(article.image, 'assets/article-toefl-guide.jpg')) + '" alt="' + escapeHtml(article.title) + '" loading="lazy" decoding="async"><div class="news-card-body">'
          + '<div class="news-card-meta"><span>' + escapeHtml(article.category || newsText('مقاله', 'Article')) + '</span><time>' + formatNewsletterDate(article.publishedAt) + '</time></div>'
          + '<h2>' + escapeHtml(article.title) + '</h2><p>' + escapeHtml(article.excerpt || '') + '</p>'
          + '<a href="/news/' + encodeURIComponent(article.id) + '" onclick="event.preventDefault();openArticle(\'' + article.id + '\')">' + newsText('مطالعه مقاله ←', 'Read article →') + '</a>'
          + '</div></article>';
      }).join('') || '<div class="chat-empty">' + newsText('هنوز مقاله‌ای منتشر نشده است.', 'No articles have been published yet.') + '</div>';
    });
  };

  renderLatestArticles = function (articles, currentId) {
    var latest = document.getElementById('latest-news-list');
    if (!latest) return;
    articles = localizeArticles(articles);
    latest.innerHTML = articles.filter(function (article) {
      return article.id !== currentId;
    }).slice(0, 5).map(function (article) {
      return '<div class="latest-news-item" onclick="openArticle(\'' + article.id + '\')"><img src="' + escapeHtml(mediaUrl(article.image, 'assets/article-toefl-guide.jpg'))
        + '" alt="' + escapeHtml(article.title) + '" loading="lazy" decoding="async"><div><strong>' + escapeHtml(article.title) + '</strong><time>' + formatNewsletterDate(article.publishedAt) + '</time></div></div>';
    }).join('');
  };

  window.openArticle = function (id, skipHistory) {
    loadArticles().then(function (rawArticles) {
      var index = rawArticles.findIndex(function (item) { return item.id === id; });
      if (index < 0) return showPage('newsletter');
      var articles = localizeArticles(rawArticles);
      var article = articles[index];
      var articlePage = document.getElementById('page-article');
      document.querySelectorAll('.page').forEach(function (page) { page.classList.remove('active'); });
      if (articlePage) articlePage.classList.add('active');
      var crumb = document.getElementById('article-breadcrumb-title');
      if (crumb) crumb.textContent = article.title;
      var content = document.getElementById('article-content');
      if (content) {
        content.setAttribute('data-current-article', article.id);
        content.innerHTML = '<header class="article-header"><div class="article-category">' + escapeHtml(article.category || newsText('مقاله', 'Article'))
          + '</div><h1>' + escapeHtml(article.title) + '</h1><p class="article-lead">' + escapeHtml(article.excerpt || '')
          + '</p><div class="article-date">' + newsText('آخرین بروزرسانی: ', 'Last updated: ') + formatNewsletterDate(article.updatedAt || article.publishedAt) + '</div></header>'
          + '<img class="article-cover" src="' + escapeHtml(mediaUrl(article.image, 'assets/article-toefl-guide.jpg')) + '" alt="' + escapeHtml(article.title) + '" decoding="async">'
          + renderArticleMedia(article.media)
          + '<div class="article-body">' + sanitizeArticleHtml(formatPlainArticle(article.body || '')) + '</div>';
      }
      renderLatestArticles(rawArticles, article.id);
      var previous = articles[(index - 1 + articles.length) % articles.length];
      var next = articles[(index + 1) % articles.length];
      var pagination = document.getElementById('article-pagination');
      if (pagination) {
        pagination.innerHTML =
          '<button class="article-nav-btn previous" onclick="openArticle(\'' + previous.id + '\')"><span class="article-nav-icon">→</span><span><small>' + newsText('مقاله قبلی', 'Previous article') + '</small><strong>' + escapeHtml(previous.title) + '</strong></span></button>'
          + '<button class="article-nav-btn next" onclick="openArticle(\'' + next.id + '\')"><span><small>' + newsText('مقاله بعدی', 'Next article') + '</small><strong>' + escapeHtml(next.title) + '</strong></span><span class="article-nav-icon">←</span></button>';
      }
      updateSeo('article', article);
      if (!skipHistory) history.replaceState(null, '', '#article/' + article.id);
      window.scrollTo(0, 0);
    });
  };

  var SEO = {
    home: ['موسسه علامه سخن | سنتر آزمون‌های تافل و جی آر ای', 'آموزش زبان، آمادگی TOEFL iBT و GRE، آزمون آزمایشی، ثبت‌نام و فروش ووچر در موسسه علامه سخن تهران.'],
    newsletter: ['خبرنامه آزمون‌های بین‌المللی | موسسه علامه سخن', 'مقالات و راهنماهای به‌روز TOEFL iBT، GRE، آزمون آزمایشی، ثبت‌نام و خرید ووچر.'],
    toefl: ['آزمون TOEFL iBT در تهران | موسسه علامه سخن', 'اطلاعات، تاریخ‌ها، ثبت‌نام و آمادگی آزمون TOEFL iBT در موسسه علامه سخن.'],
    gre: ['آزمون GRE در تهران | موسسه علامه سخن', 'راهنمای آزمون GRE، تاریخ‌ها، آمادگی، ثبت‌نام و ووچر GRE در موسسه علامه سخن.'],
    gallery: ['گالری تصاویر موسسه علامه سخن | فضای آموزش و آزمون', 'تصاویر محیط آموزشی، تجهیزات و محل برگزاری آزمون‌های رسمی TOEFL iBT و GRE General در موسسه علامه سخن.'],
    'mock-toefl': ['آزمون آزمایشی TOEFL iBT | ماک تافل علامه سخن', 'شبیه‌سازی TOEFL iBT با تجهیزات سنتر، سوالات استاندارد و ارزیابی تخصصی.'],
    'toefl-voucher': ['خرید ووچر TOEFL iBT | موسسه علامه سخن', 'ثبت درخواست خرید ووچر TOEFL iBT با راهنمایی و پشتیبانی ثبت‌نام.'],
    'gre-voucher': ['خرید ووچر GRE | موسسه علامه سخن', 'ثبت درخواست خرید ووچر GRE و دریافت راهنمایی برای ثبت‌نام آزمون.']
  };

  function updateSeo(page, article) {
    var title, description, url;
    if (article) {
      title = article.title + ' | موسسه علامه سخن';
      description = article.excerpt || '';
      url = SITE_URL + '/news/' + encodeURIComponent(article.id);
    } else {
      var data = SEO[page] || [document.title, document.getElementById('seo-description').content];
      title = data[0]; description = data[1]; url = SITE_URL + (page === 'home' ? '/' : '/#' + page);
    }
    document.title = title;
    document.getElementById('seo-description').content = description;
    document.getElementById('seo-og-title').content = title;
    document.getElementById('seo-og-description').content = description;
    document.getElementById('seo-canonical').href = url;
    document.getElementById('seo-og-url').content = url;
    var twitterTitle = document.getElementById('seo-twitter-title');
    var twitterDescription = document.getElementById('seo-twitter-description');
    if (twitterTitle) twitterTitle.content = title;
    if (twitterDescription) twitterDescription.content = description;
    var oldSchema = document.getElementById('article-schema');
    if (oldSchema) oldSchema.remove();
    if (article) {
      var schema = document.createElement('script');
      schema.id = 'article-schema';
      schema.type = 'application/ld+json';
      schema.textContent = JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article', headline: article.title,
        description: description, datePublished: article.publishedAt, dateModified: article.updatedAt || article.publishedAt,
        mainEntityOfPage: url, author: { '@type': 'Organization', name: 'موسسه علامه سخن' },
        publisher: { '@type': 'Organization', name: 'موسسه علامه سخن' }
      });
      document.head.appendChild(schema);
    }
  }

  function prepareEditableContent() {
    var nodes = document.querySelectorAll('.page:not(#page-admin):not(#page-dashboard) h1, .page:not(#page-admin):not(#page-dashboard) h2, .page:not(#page-admin):not(#page-dashboard) h3, .page:not(#page-admin):not(#page-dashboard) p, [data-content-key]');
    editableContentMeta = {};
    var pagePositions = {};
    Array.prototype.forEach.call(nodes, function (node, index) {
      if (node.classList && node.classList.contains('hero-institute-title')) return;
      if (node.closest && node.closest('.hero-institute-title')) return;
      var page = node.closest('.page');
      var pageId = page ? page.id.replace('page-', '') : 'site';
      var key = node.dataset.contentKey || (pageId + '.text.' + index);
      node.dataset.contentKey = key;
      if (!editableOriginals[key]) editableOriginals[key] = node.textContent.trim();
      pagePositions[pageId] = (pagePositions[pageId] || 0) + 1;
      var typeNames = { H1: 'عنوان اصلی', H2: 'عنوان بخش', H3: 'زیرعنوان', P: 'متن توضیحی' };
      editableContentMeta[key] = {
        key: key,
        pageId: pageId,
        pageLabel: PAGE_LABELS[pageId] || pageId,
        type: typeNames[node.tagName] || 'متن',
        order: pagePositions[pageId],
        label: (typeNames[node.tagName] || 'متن') + ' شماره ' + pagePositions[pageId]
      };
    });
  }

  function loadSiteContent() {
    prepareEditableContent();
    return db.collection('site_content').doc('main').get().then(function (snap) {
      siteContentState = snap.exists ? Object.assign({ overrides: {}, overridesEn: {}, contact: Object.assign({}, DEFAULT_SITE_CONTACT), instagramUrl: DEFAULT_INSTAGRAM_URL }, snap.data()) : { overrides: {}, overridesEn: {}, contact: Object.assign({}, DEFAULT_SITE_CONTACT), instagramUrl: DEFAULT_INSTAGRAM_URL };
      siteContentState.contact = Object.assign({}, DEFAULT_SITE_CONTACT, siteContentState.contact || {});
      if (siteContentState.instagramUrl && !siteContentState.contact.instagramUrl) siteContentState.contact.instagramUrl = siteContentState.instagramUrl;
      siteContentState.instagramUrl = siteContentState.contact.instagramUrl || DEFAULT_INSTAGRAM_URL;
      applyContentOverrides();
    }).catch(function () { applyContentOverrides(); });
  }

  function applyContentOverrides() {
    var english = isEnglishNewsletter();
    var overrides = english ? (siteContentState.overridesEn || {}) : (siteContentState.overrides || {});
    Object.keys(editableOriginals || {}).forEach(function (key) {
      var node = document.querySelector('[data-content-key="' + key + '"]');
      if (!node) return;
      if (Object.prototype.hasOwnProperty.call(overrides, key)) node.textContent = overrides[key];
    });
    applyContactSettings();
  }

  function telHref(raw) {
    return 'tel:+' + String(raw || '').replace(/\D/g, '');
  }

  function applyContactSettings() {
    var contact = Object.assign({}, DEFAULT_SITE_CONTACT, siteContentState.contact || {});
    tagExistingSocialLinks();
    tagExistingContactNodes();
    ensureOptionalSocialLinks(contact);
    var fixedDisplay = String(contact.phoneCode || DEFAULT_SITE_CONTACT.phoneCode) + ' ' + String(contact.phoneNumber || DEFAULT_SITE_CONTACT.phoneNumber);
    var fixedRaw = '98' + String(contact.phoneCode || '021').replace(/^0/, '') + String(contact.phoneNumber || '').replace(/\D/g, '');
    document.querySelectorAll('[data-contact="phone"]').forEach(function (node) { node.textContent = fixedDisplay; });
    document.querySelectorAll('a[data-contact-link="phone"],a.footer-info-link[href^="tel:+9821"]').forEach(function (node) { node.href = telHref(fixedRaw); });
    document.querySelectorAll('[data-contact="mobile"]').forEach(function (node) { node.textContent = contact.mobileDisplay || DEFAULT_SITE_CONTACT.mobileDisplay; });
    document.querySelectorAll('a[data-contact-link="mobile"],a.contact-social-number,a.footer-info-link[href^="tel:+989"]').forEach(function (node) { node.href = telHref(contact.mobileRaw || DEFAULT_SITE_CONTACT.mobileRaw); });
    document.querySelectorAll('[data-contact="email"]').forEach(function (node) { node.textContent = contact.email || DEFAULT_SITE_CONTACT.email; });
    document.querySelectorAll('a[data-contact-link="email"],a[href^="mailto:Info@asmdi.ir"]').forEach(function (node) { node.href = 'mailto:' + (contact.email || DEFAULT_SITE_CONTACT.email); });
    [
      ['instagram', contact.instagramUrl],
      ['youtube', contact.youtubeUrl],
      ['aparat', contact.aparatUrl],
      ['whatsapp', contact.whatsappUrl],
      ['bale', contact.baleUrl],
      ['telegram', contact.telegramUrl]
    ].forEach(function (pair) {
      document.querySelectorAll('[data-social="' + pair[0] + '"],.' + (pair[0] === 'instagram' ? 'footer-instagram-link' : 'never-match')).forEach(function (link) {
        link.href = pair[1] || '#';
        link.hidden = !pair[1];
        if (/^https?:\/\//i.test(pair[1] || '')) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
      });
    });
  }

  function tagExistingContactNodes() {
    document.querySelectorAll('a[href^="tel:+9821"]').forEach(function (link) {
      link.dataset.contactLink = 'phone';
      var number = link.querySelector('bdi,.footer-number,.contact-number') || link;
      number.dataset.contact = 'phone';
    });
    document.querySelectorAll('a[href^="tel:+989"],a.contact-social-number').forEach(function (link) {
      link.dataset.contactLink = 'mobile';
      var number = link.querySelector('bdi,.footer-number,.contact-number') || link;
      number.dataset.contact = 'mobile';
    });
    document.querySelectorAll('a[href^="mailto:"]').forEach(function (link) {
      link.dataset.contactLink = 'email';
      var label = link.querySelector('span[dir="ltr"]') || link;
      label.dataset.contact = 'email';
    });
  }

  function tagExistingSocialLinks() {
    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (!link.dataset.social && href.indexOf('wa.me') !== -1) link.dataset.social = 'whatsapp';
      if (!link.dataset.social && href.indexOf('ble.ir') !== -1) link.dataset.social = 'bale';
      if (!link.dataset.social && href.indexOf('tg://') === 0) link.dataset.social = 'telegram';
      if (!link.dataset.social && href.indexOf('instagram.com') !== -1) link.dataset.social = 'instagram';
    });
  }

  function createSocialIcon(kind, url, compact) {
    var a = document.createElement('a');
    a.className = compact ? 'footer-social-link' : 'contact-social-link';
    a.dataset.social = kind;
    a.href = url || '#';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', kind === 'youtube' ? 'YouTube' : 'Aparat');
    var img = document.createElement('img');
    img.src = kind === 'youtube' ? 'assets/contact-youtube.svg' : 'assets/contact-aparat.svg';
    img.alt = '';
    a.appendChild(img);
    return a;
  }

  function ensureOptionalSocialLinks(contact) {
    document.querySelectorAll('.footer-contact-row,.contact-socials,.exam-contact-links').forEach(function (row) {
      var compact = row.classList.contains('footer-contact-row');
      if (!row.querySelector('[data-social="youtube"]')) row.appendChild(createSocialIcon('youtube', contact.youtubeUrl, compact));
      if (!row.querySelector('[data-social="aparat"]')) row.appendChild(createSocialIcon('aparat', contact.aparatUrl, compact));
    });
  }

  window.buildContentEditor = function () {
    prepareEditableContent();
    var pageList = document.getElementById('content-page-list');
    if (!pageList) return;
    var pages = {};
    Object.keys(editableContentMeta).forEach(function (key) {
      var meta = editableContentMeta[key];
      if (!pages[meta.pageId]) pages[meta.pageId] = { id: meta.pageId, label: meta.pageLabel, count: 0 };
      pages[meta.pageId].count += 1;
    });
    var pageItems = Object.keys(pages).map(function (id) { return pages[id]; });
    if (!selectedContentPage || !pages[selectedContentPage]) selectedContentPage = pageItems.length ? pageItems[0].id : '';
    pageList.innerHTML = pageItems.map(function (page) {
      return '<button type="button" class="content-page-btn' + (page.id === selectedContentPage ? ' active' : '') + '" onclick="selectContentPage(\'' + page.id + '\')"><span>' + escapeHtml(page.label) + '</span><small>' + page.count + '</small></button>';
    }).join('');
    renderEditableContentList();
  };

  window.selectContentPage = function (pageId) {
    selectedContentPage = pageId;
    document.getElementById('content-editor-search').value = '';
    document.getElementById('content-editor-key').value = '';
    document.getElementById('content-editor-form').hidden = true;
    document.getElementById('content-editor-empty').hidden = false;
    buildContentEditor();
  };

  window.filterEditableContent = function () {
    renderEditableContentList();
  };

  function contactSettingsFromForm() {
    var current = Object.assign({}, DEFAULT_SITE_CONTACT, siteContentState.contact || {});
    var ids = {
      instagramUrl: 'content-instagram-url',
      youtubeUrl: 'content-youtube-url',
      aparatUrl: 'content-aparat-url',
      whatsappUrl: 'content-whatsapp-url',
      baleUrl: 'content-bale-url',
      telegramUrl: 'content-telegram-url',
      email: 'content-email',
      phoneCode: 'content-phone-code',
      phoneNumber: 'content-phone-number',
      mobileDisplay: 'content-mobile-display',
      mobileRaw: 'content-mobile-raw'
    };
    Object.keys(ids).forEach(function (key) {
      var input = document.getElementById(ids[key]);
      if (input) current[key] = input.value.trim();
    });
    return current;
  }

  function fillContactSettingsForm() {
    var contact = Object.assign({}, DEFAULT_SITE_CONTACT, siteContentState.contact || {});
    var values = {
      'content-instagram-url': contact.instagramUrl,
      'content-youtube-url': contact.youtubeUrl,
      'content-aparat-url': contact.aparatUrl,
      'content-whatsapp-url': contact.whatsappUrl,
      'content-bale-url': contact.baleUrl,
      'content-telegram-url': contact.telegramUrl,
      'content-email': contact.email,
      'content-phone-code': contact.phoneCode,
      'content-phone-number': contact.phoneNumber,
      'content-mobile-display': contact.mobileDisplay,
      'content-mobile-raw': contact.mobileRaw
    };
    Object.keys(values).forEach(function (id) {
      var input = document.getElementById(id);
      if (input) input.value = values[id] || '';
    });
  }

  function renderEditableContentList() {
    var list = document.getElementById('content-text-list');
    if (!list) return;
    var query = (document.getElementById('content-editor-search').value || '').trim().toLowerCase();
    var keys = Object.keys(editableContentMeta).filter(function (key) {
      if (editableContentMeta[key].pageId !== selectedContentPage) return false;
      var value = ((siteContentState.overrides || {})[key] || (siteContentState.overridesEn || {})[key] || editableOriginals[key] || '').toLowerCase();
      return !query || value.indexOf(query) !== -1 || editableContentMeta[key].type.toLowerCase().indexOf(query) !== -1;
    });
    var pageTitle = document.getElementById('content-selected-page-title');
    if (pageTitle) pageTitle.textContent = keys.length + ' متن در ' + ((keys[0] && editableContentMeta[keys[0]].pageLabel) || PAGE_LABELS[selectedContentPage] || 'این صفحه');
    var selectedKey = document.getElementById('content-editor-key').value;
    list.innerHTML = keys.map(function (key) {
      var meta = editableContentMeta[key];
      var current = (siteContentState.overrides || {})[key] || (siteContentState.overridesEn || {})[key] || editableOriginals[key] || '';
      var changed = Object.prototype.hasOwnProperty.call(siteContentState.overrides || {}, key) || Object.prototype.hasOwnProperty.call(siteContentState.overridesEn || {}, key);
      return '<button type="button" class="content-text-item' + (key === selectedKey ? ' active' : '') + '" onclick="selectEditableContent(\'' + key + '\')">'
        + '<span class="content-text-item-head"><span>' + escapeHtml(meta.type + ' ' + meta.order) + '</span>' + (changed ? '<em>ویرایش‌شده</em>' : '') + '</span>'
        + '<strong>' + escapeHtml(current.slice(0, 55) || 'متن بدون عنوان') + '</strong><p>' + escapeHtml(current.slice(0, 145)) + '</p></button>';
    }).join('') || '<div class="content-list-empty">متنی با این عبارت پیدا نشد.</div>';
  }

  window.selectEditableContent = function (key) {
    key = key || document.getElementById('content-editor-key').value;
    if (!key || !editableContentMeta[key]) return;
    document.getElementById('content-editor-key').value = key;
    document.getElementById('content-editor-value').value = (siteContentState.overrides || {})[key] || editableOriginals[key] || '';
    document.getElementById('content-editor-value-en').value = (siteContentState.overridesEn || {})[key] || '';
    document.getElementById('content-editor-type').textContent = editableContentMeta[key].pageLabel + ' / ' + editableContentMeta[key].type;
    document.getElementById('content-editor-label').textContent = editableContentMeta[key].label;
    document.getElementById('content-editor-empty').hidden = true;
    document.getElementById('content-editor-form').hidden = false;
    renderEditableContentList();
  };

  window.saveContentOverride = function () {
    var key = document.getElementById('content-editor-key').value;
    var value = document.getElementById('content-editor-value').value.trim();
    var valueEn = document.getElementById('content-editor-value-en').value.trim();
    siteContentState.overrides = siteContentState.overrides || {};
    siteContentState.overridesEn = siteContentState.overridesEn || {};
    if (key && value) siteContentState.overrides[key] = value;
    if (key && valueEn) siteContentState.overridesEn[key] = valueEn;
    db.collection('site_content').doc('main').set(siteContentState).then(function () {
      applyContentOverrides();
      renderEditableContentList();
      showAlert('content-editor-success', 'متن انتخاب‌شده ذخیره شد.');
    }).catch(function (e) { showAlert('content-editor-error', e.message); });
  };

  window.resetContentOverride = function () {
    var key = document.getElementById('content-editor-key').value;
    delete siteContentState.overrides[key];
    delete siteContentState.overridesEn[key];
    db.collection('site_content').doc('main').set(siteContentState).then(function () {
      var node = document.querySelector('[data-content-key="' + key + '"]');
      if (node) node.textContent = editableOriginals[key] || '';
      selectEditableContent();
      renderEditableContentList();
    });
  };

  window.loadContactSettingsAdmin = function () {
    loadSiteContent().then(function () {
      fillContactSettingsForm();
      showAlert('contact-settings-success', 'اطلاعات فعلی تماس و شبکه‌ها بارگذاری شد.');
    }).catch(function (e) { showAlert('contact-settings-error', e.message); });
  };

  window.saveContactSettings = function () {
    siteContentState.contact = contactSettingsFromForm();
    siteContentState.instagramUrl = siteContentState.contact.instagramUrl || DEFAULT_INSTAGRAM_URL;
    db.collection('site_content').doc('main').set(siteContentState).then(function () {
      applyContactSettings(siteContentState.contact);
      showAlert('contact-settings-success', 'اطلاعات تماس و شبکه‌ها ذخیره و روی سایت اعمال شد.');
    }).catch(function (e) { showAlert('contact-settings-error', e.message); });
  };

  window.loadAdminArticles = function () {
    var box = document.getElementById('admin-articles-list');
    if (!box) return;
    loadArticles().then(function (articles) {
      box.innerHTML = articles.map(function (item) {
        return '<div class="admin-article-item"><strong>' + escapeHtml(item.title) + '</strong><p>' + escapeHtml(item.category || '') + '</p>'
          + '<div class="admin-article-actions"><button onclick="editAdminArticle(\'' + item.id + '\')">ویرایش</button>'
          + '<button onclick="openArticle(\'' + item.id + '\')">نمایش</button></div></div>';
      }).join('');
    });
  };

  window.editAdminArticle = function (id) {
    loadArticles().then(function (articles) {
      var item = articles.find(function (article) { return article.id === id; });
      if (!item) return;
      document.getElementById('article-admin-id').value = id;
      document.getElementById('article-admin-title').value = item.title || '';
      document.getElementById('article-admin-title-en').value = item.titleEn || (EN_ARTICLES[id] && EN_ARTICLES[id].title) || '';
      document.getElementById('article-admin-category').value = item.category || '';
      document.getElementById('article-admin-category-en').value = item.categoryEn || (EN_ARTICLES[id] && EN_ARTICLES[id].category) || '';
      document.getElementById('article-admin-excerpt').value = item.excerpt || '';
      document.getElementById('article-admin-excerpt-en').value = item.excerptEn || (EN_ARTICLES[id] && EN_ARTICLES[id].excerpt) || '';
      document.getElementById('article-admin-body').value = item.body || '';
      document.getElementById('article-admin-body-en').value = item.bodyEn || (EN_ARTICLES[id] && EN_ARTICLES[id].body) || '';
      document.getElementById('article-admin-published').checked = item.published !== false;
      document.getElementById('article-admin-image').value = '';
      document.getElementById('article-admin-media').value = '';
      renderAdminMediaPreview(item);
    });
  };

  window.resetArticleEditor = function () {
    ['article-admin-id','article-admin-title','article-admin-title-en','article-admin-category','article-admin-category-en','article-admin-excerpt','article-admin-excerpt-en','article-admin-body','article-admin-body-en','article-admin-image','article-admin-media'].forEach(function (id) { document.getElementById(id).value = ''; });
    document.getElementById('article-admin-published').checked = true;
    document.getElementById('article-media-admin-preview').innerHTML = '';
  };

  window.saveAdminArticle = function () {
    var title = document.getElementById('article-admin-title').value.trim();
    var body = document.getElementById('article-admin-body').value.trim();
    if (!title || !body) return showAlert('article-admin-error', 'عنوان و متن مقاله را وارد کنید.');
    var id = document.getElementById('article-admin-id').value || ('article-' + Date.now().toString(36));
    var existing = articleCache.find(function (item) { return item.id === id; }) || {};
    var imageFile = document.getElementById('article-admin-image').files[0];
    var mediaFile = document.getElementById('article-admin-media').files[0];
    if (imageFile && imageFile.size > 5 * 1024 * 1024) return showAlert('article-admin-error', 'حجم تصویر باید کمتر از ۵ مگابایت باشد.');
    if (mediaFile && mediaFile.size > 12 * 1024 * 1024) return showAlert('article-admin-error', 'حجم ویدیو یا صدا باید کمتر از ۱۲ مگابایت باشد.');
    Promise.all([
      imageFile ? fileToDataUrl(imageFile) : Promise.resolve(existing.image || ''),
      mediaFile ? fileToDataUrl(mediaFile) : Promise.resolve(existing.media && existing.media.data || '')
    ]).then(function (files) {
      var data = {
        title: title,
        titleEn: document.getElementById('article-admin-title-en').value.trim(),
        category: document.getElementById('article-admin-category').value.trim() || 'خبرنامه',
        categoryEn: document.getElementById('article-admin-category-en').value.trim(),
        excerpt: document.getElementById('article-admin-excerpt').value.trim(),
        excerptEn: document.getElementById('article-admin-excerpt-en').value.trim(),
        body: body,
        bodyEn: document.getElementById('article-admin-body-en').value.trim(),
        image: files[0],
        media: mediaFile ? { data: files[1], type: mediaFile.type, name: mediaFile.name } : (existing.media || null),
        published: document.getElementById('article-admin-published').checked,
        publishedAt: existing.publishedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return db.collection('articles').doc(id).set(data);
    }).then(function () {
      showAlert('article-admin-success', 'مقاله ذخیره و لینک آن ساخته شد.');
      document.getElementById('article-admin-id').value = id;
      loadAdminArticles();
    }).catch(function (e) { showAlert('article-admin-error', e.message); });
  };

  function fileToDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(new Error('خواندن فایل انجام نشد.')); };
      reader.readAsDataURL(file);
    });
  }

  function renderAdminMediaPreview(item) {
    var box = document.getElementById('article-media-admin-preview');
    if (!box) return;
    var html = '';
    if (item.image) html += '<img src="' + mediaUrl(item.image) + '" alt=""><span>تصویر شاخص فعلی</span>';
    if (item.media && item.media.data) html += '<span>فایل رسانه‌ای فعلی: ' + escapeHtml(item.media.name || (String(item.media.type).indexOf('video/') === 0 ? 'ویدیو' : 'صدا')) + '</span>';
    box.innerHTML = html;
  }

  var popupCache = [];
  var activeSitePopup = null;

  function popupPageLabel(pageId) {
    return pageId === 'all' ? 'همه صفحات عمومی' : (PAGE_LABELS[pageId] || pageId || 'صفحه خانه');
  }

  function popupDateTimeValue(value) {
    if (!value) return '';
    var date = new Date(value);
    if (isNaN(date.getTime())) return '';
    var local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  function validPopupLink(value) {
    return !value || /^https?:\/\/[^\s]+$/i.test(value) || /^#[a-z0-9-]+$/i.test(value);
  }

  function collectPopupForm(existing, imageData) {
    var startsAt = document.getElementById('popup-admin-start').value;
    var endsAt = document.getElementById('popup-admin-end').value;
    return {
      title: document.getElementById('popup-admin-title').value.trim(),
      titleEn: document.getElementById('popup-admin-title-en').value.trim(),
      body: document.getElementById('popup-admin-body').value.trim(),
      bodyEn: document.getElementById('popup-admin-body-en').value.trim(),
      targetPage: document.getElementById('popup-admin-page').value || 'home',
      frequency: document.getElementById('popup-admin-frequency').value === 'visit' ? 'visit' : 'session',
      startsAt: startsAt ? new Date(startsAt).toISOString() : '',
      endsAt: endsAt ? new Date(endsAt).toISOString() : '',
      image: imageData || (existing && existing.image) || '',
      buttonText: document.getElementById('popup-admin-button-text').value.trim(),
      buttonTextEn: document.getElementById('popup-admin-button-text-en').value.trim(),
      link: document.getElementById('popup-admin-link').value.trim(),
      active: document.getElementById('popup-admin-active').checked,
      createdAt: existing && existing.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  function renderPopupImagePreview(image) {
    var box = document.getElementById('popup-image-preview');
    if (!box) return;
    box.classList.toggle('has-image', !!image);
    box.innerHTML = image ? '<img src="' + escapeHtml(mediaUrl(image)) + '" alt="پیش‌نمایش تصویر پاپ‌آپ">' : '';
  }

  window.resetPopupEditor = function () {
    ['popup-admin-id','popup-admin-title','popup-admin-title-en','popup-admin-body','popup-admin-body-en','popup-admin-start','popup-admin-end','popup-admin-image','popup-admin-button-text','popup-admin-button-text-en','popup-admin-link'].forEach(function (id) {
      var input = document.getElementById(id);
      if (input) input.value = '';
    });
    document.getElementById('popup-admin-page').value = 'home';
    document.getElementById('popup-admin-frequency').value = 'session';
    document.getElementById('popup-admin-active').checked = true;
    renderPopupImagePreview('');
  };

  window.loadAdminPopups = function () {
    var box = document.getElementById('admin-popups-list');
    if (!box) return;
    box.innerHTML = '<div class="chat-empty">در حال بارگذاری...</div>';
    db.collection('popups').get().then(function (snap) {
      popupCache = [];
      snap.forEach(function (doc) { popupCache.push(Object.assign({ id: doc.id }, doc.data())); });
      popupCache.sort(function (a, b) { return String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')); });
      box.innerHTML = popupCache.map(function (item) {
        return '<div class="admin-article-item popup-admin-item"><span class="popup-admin-status' + (item.active === true ? '' : ' off') + '">' + (item.active === true ? 'فعال' : 'غیرفعال') + '</span>'
          + '<strong>' + escapeHtml(item.title || 'بدون عنوان') + '</strong><p>نمایش در: ' + escapeHtml(popupPageLabel(item.targetPage)) + (item.endsAt ? ' · پایان: ' + toPersianDate(item.endsAt) : '') + '</p>'
          + '<div class="admin-article-actions"><button onclick="editAdminPopup(\'' + item.id + '\')">ویرایش</button><button onclick="previewSavedPopup(\'' + item.id + '\')">پیش‌نمایش</button><button onclick="deleteAdminPopup(\'' + item.id + '\')">حذف</button></div></div>';
      }).join('') || '<div class="chat-empty">هنوز پاپ‌آپی ساخته نشده است.</div>';
    }).catch(function (e) { box.innerHTML = '<div class="chat-empty">خطا: ' + escapeHtml(e.message) + '</div>'; });
  };

  window.editAdminPopup = function (id) {
    var item = popupCache.find(function (popup) { return popup.id === id; });
    if (!item) return;
    document.getElementById('popup-admin-id').value = id;
    document.getElementById('popup-admin-title').value = item.title || '';
    document.getElementById('popup-admin-title-en').value = item.titleEn || '';
    document.getElementById('popup-admin-body').value = item.body || '';
    document.getElementById('popup-admin-body-en').value = item.bodyEn || '';
    document.getElementById('popup-admin-page').value = item.targetPage || 'home';
    document.getElementById('popup-admin-frequency').value = item.frequency === 'visit' ? 'visit' : 'session';
    document.getElementById('popup-admin-start').value = popupDateTimeValue(item.startsAt);
    document.getElementById('popup-admin-end').value = popupDateTimeValue(item.endsAt);
    document.getElementById('popup-admin-button-text').value = item.buttonText || '';
    document.getElementById('popup-admin-button-text-en').value = item.buttonTextEn || '';
    document.getElementById('popup-admin-link').value = item.link || '';
    document.getElementById('popup-admin-active').checked = item.active === true;
    document.getElementById('popup-admin-image').value = '';
    renderPopupImagePreview(item.image || '');
    document.getElementById('admin-popups').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.saveAdminPopup = function () {
    var title = document.getElementById('popup-admin-title').value.trim();
    var body = document.getElementById('popup-admin-body').value.trim();
    var link = document.getElementById('popup-admin-link').value.trim();
    var startsAt = document.getElementById('popup-admin-start').value;
    var endsAt = document.getElementById('popup-admin-end').value;
    if (!title || !body) return showAlert('popup-admin-error', 'عنوان و متن پیام را وارد کنید.');
    if (!validPopupLink(link)) return showAlert('popup-admin-error', 'لینک باید با https:// یا نشانی داخلی مانند #newsletter شروع شود.');
    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) return showAlert('popup-admin-error', 'زمان پایان باید بعد از زمان شروع باشد.');
    var id = document.getElementById('popup-admin-id').value || ('popup-' + Date.now().toString(36));
    var existing = popupCache.find(function (popup) { return popup.id === id; }) || {};
    var imageFile = document.getElementById('popup-admin-image').files[0];
    if (imageFile && imageFile.size > 5 * 1024 * 1024) return showAlert('popup-admin-error', 'حجم تصویر باید کمتر از ۵ مگابایت باشد.');
    (imageFile ? fileToDataUrl(imageFile) : Promise.resolve(existing.image || '')).then(function (imageData) {
      var data = collectPopupForm(existing, imageData);
      return db.collection('popups').doc(id).set(data);
    }).then(function () {
      document.getElementById('popup-admin-id').value = id;
      showAlert('popup-admin-success', 'پاپ‌آپ ذخیره شد و طبق زمان‌بندی نمایش داده می‌شود.');
      loadAdminPopups();
    }).catch(function (e) { showAlert('popup-admin-error', e.message); });
  };

  window.deleteAdminPopup = function (id) {
    if (!confirm('این پاپ‌آپ حذف شود؟')) return;
    db.collection('popups').doc(id).delete().then(function () {
      if (document.getElementById('popup-admin-id').value === id) resetPopupEditor();
      loadAdminPopups();
    }).catch(function (e) { alert(e.message); });
  };

  function showSitePopup(item, preview) {
    var overlay = document.getElementById('site-popup-overlay');
    var card = overlay && overlay.querySelector('.site-popup-card');
    if (!overlay || !card || !item) return;
    activeSitePopup = preview ? null : item;
    var popupTitle = isEnglishNewsletter() ? (item.titleEn || item.title || '') : (item.title || item.titleEn || '');
    var popupBody = isEnglishNewsletter() ? (item.bodyEn || item.body || '') : (item.body || item.bodyEn || '');
    var popupButton = isEnglishNewsletter() ? (item.buttonTextEn || item.buttonText || '') : (item.buttonText || item.buttonTextEn || '');
    document.getElementById('site-popup-title').textContent = popupTitle;
    document.getElementById('site-popup-body').textContent = popupBody;
    var image = document.getElementById('site-popup-image');
    image.hidden = !item.image;
    image.src = item.image ? mediaUrl(item.image) : '';
    image.alt = item.image ? (item.title || 'تصویر اطلاعیه') : '';
    card.classList.toggle('has-image', !!item.image);
    var action = document.getElementById('site-popup-action');
    action.hidden = !(popupButton && item.link);
    action.textContent = popupButton || '';
    action.href = item.link || '#';
    action.target = /^https?:\/\//i.test(item.link || '') ? '_blank' : '';
    action.rel = action.target ? 'noopener' : '';
    action.onclick = function (event) {
      if (/^#[a-z0-9-]+$/i.test(item.link || '')) {
        event.preventDefault();
        closeSitePopup();
        showPage(item.link.slice(1));
      } else {
        closeSitePopup();
      }
    };
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    if (!preview && item.frequency !== 'visit') sessionStorage.setItem('allameh_popup_seen_' + item.id, '1');
    setTimeout(function () { document.querySelector('.site-popup-close').focus(); }, 30);
  }

  window.closeSitePopup = function () {
    var overlay = document.getElementById('site-popup-overlay');
    if (overlay) overlay.hidden = true;
    document.body.style.overflow = '';
    activeSitePopup = null;
  };

  window.previewSavedPopup = function (id) {
    var item = popupCache.find(function (popup) { return popup.id === id; });
    if (item) showSitePopup(item, true);
  };

  window.previewAdminPopup = function () {
    var id = document.getElementById('popup-admin-id').value;
    var existing = popupCache.find(function (popup) { return popup.id === id; }) || {};
    var imageFile = document.getElementById('popup-admin-image').files[0];
    (imageFile ? fileToDataUrl(imageFile) : Promise.resolve(existing.image || '')).then(function (imageData) {
      var item = collectPopupForm(existing, imageData);
      if (!item.title || !item.body) return showAlert('popup-admin-error', 'برای پیش‌نمایش، عنوان و متن را وارد کنید.');
      showSitePopup(item, true);
    });
  };

  function loadPopupForPage(pageId) {
    if (!pageId || pageId === 'admin' || pageId === 'dashboard') return;
    db.collection('popups').get().then(function (snap) {
      var candidates = [];
      snap.forEach(function (doc) {
        var item = Object.assign({ id: doc.id }, doc.data());
        if (item.targetPage === 'all' || item.targetPage === pageId) candidates.push(item);
      });
      candidates.sort(function (a, b) { return String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')); });
      var popup = candidates.find(function (item) {
        return item.frequency === 'visit' || !sessionStorage.getItem('allameh_popup_seen_' + item.id);
      });
      if (popup) setTimeout(function () { showSitePopup(popup, false); }, 450);
    }).catch(function () {});
  }

  var popupOverlay = document.getElementById('site-popup-overlay');
  if (popupOverlay) popupOverlay.addEventListener('click', function (event) {
    if (event.target === popupOverlay) closeSitePopup();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && popupOverlay && !popupOverlay.hidden) closeSitePopup();
  });

  var couponSelections = {};
  var discountCodeCache = {};
  var COUPON_TARGET_LABELS = {
    courses: 'ثبت‌نام دوره‌ها', 'official-toefl': 'آزمون رسمی TOEFL', 'official-gre': 'آزمون رسمی GRE',
    'mock-toefl': 'Mock TOEFL', 'mock-gre': 'Mock GRE', consultation: 'مشاوره',
    'toefl-voucher': 'خرید ووچر TOEFL', 'gre-voucher': 'خرید ووچر GRE'
  };

  window.toggleCouponQuantity = function () {
    var shared = document.getElementById('coupon-mode').value === 'shared';
    document.getElementById('coupon-quantity-group').style.display = shared ? 'none' : '';
  };

  function renderGeneratedCodes(codes, title) {
    var box = document.getElementById('coupon-code-output');
    if (!box) return;
    box.classList.add('active');
    box.innerHTML = '<strong>' + escapeHtml(title || 'کدهای ساخته‌شده') + '</strong><div class="coupon-code-list">'
      + (codes || []).map(function (code) { return '<code>' + escapeHtml(code) + '</code>'; }).join('') + '</div>';
  }

  window.createDiscountCampaign = function () {
    var startsAt = document.getElementById('coupon-start').value;
    var endsAt = document.getElementById('coupon-end').value;
    var payload = {
      name: document.getElementById('coupon-name').value.trim(),
      target: document.getElementById('coupon-target').value,
      discountType: document.getElementById('coupon-discount-type').value,
      value: Number(document.getElementById('coupon-value').value || 0),
      mode: document.getElementById('coupon-mode').value,
      quantity: Number(document.getElementById('coupon-quantity').value || 1),
      startsAt: startsAt ? new Date(startsAt).toISOString() : '',
      endsAt: endsAt ? new Date(endsAt).toISOString() : '',
      publicHint: document.getElementById('coupon-public-hint').value.trim(),
      active: document.getElementById('coupon-active').checked
    };
    if (!payload.name || !payload.value) return showAlert('coupon-error', 'عنوان و مقدار تخفیف را وارد کنید.');
    apiFetch('/api/admin/coupons', { method: 'POST', body: JSON.stringify(payload) }).then(function (result) {
      showAlert('coupon-success', 'کمپین ساخته شد و کدها آماده‌اند.');
      renderGeneratedCodes(result.codes, payload.mode === 'shared' ? 'کد عمومی کمپین' : 'کدهای یک‌بارمصرف');
      loadDiscountCampaigns();
    }).catch(function (e) { showAlert('coupon-error', e.message); });
  };

  window.loadDiscountCampaigns = function () {
    var box = document.getElementById('coupon-campaign-list');
    if (!box) return;
    Promise.all([db.collection('discount_campaigns').get(), db.collection('discount_codes').get()]).then(function (results) {
      var counts = {};
      results[1].forEach(function (doc) {
        var code = doc.data();
        counts[code.campaignId] = (counts[code.campaignId] || 0) + 1;
      });
      var campaigns = [];
      results[0].forEach(function (doc) { campaigns.push(Object.assign({ id: doc.id }, doc.data())); });
      campaigns.sort(function (a, b) { return String(b.createdAt || '').localeCompare(String(a.createdAt || '')); });
      box.innerHTML = campaigns.map(function (item) {
        var value = item.discountType === 'percent' ? item.value + '٪' : Number(item.value || 0).toLocaleString('fa-IR') + ' تومان';
        return '<div class="admin-article-item"><strong>' + escapeHtml(item.name) + '</strong><p>' + escapeHtml(COUPON_TARGET_LABELS[item.target] || item.target) + ' · ' + escapeHtml(value) + ' · ' + escapeHtml(item.mode === 'shared' ? 'کد عمومی' : (counts[item.id] || 0) + ' کد مجزا') + '</p>'
          + '<div class="admin-article-actions">' + (item.mode === 'unique' ? '<button onclick="addDiscountCodes(\'' + item.id + '\')">افزایش تعداد کد</button>' : '') + '<button onclick="deleteDiscountCampaign(\'' + item.id + '\')">غیرفعال و حذف</button></div></div>';
      }).join('') || '<div class="chat-empty">هنوز کمپینی ساخته نشده است.</div>';
    }).catch(function (e) { box.innerHTML = '<div class="chat-empty">خطا: ' + escapeHtml(e.message) + '</div>'; });
  };

  window.addDiscountCodes = function (campaignId) {
    var quantity = Number(prompt('چند کد یک‌بارمصرف جدید ساخته شود؟', '10') || 0);
    if (!quantity) return;
    apiFetch('/api/admin/coupons/' + encodeURIComponent(campaignId) + '/generate', { method: 'POST', body: JSON.stringify({ quantity: quantity }) })
      .then(function (result) { renderGeneratedCodes(result.codes, 'کدهای جدید'); loadDiscountCampaigns(); })
      .catch(function (e) { alert(e.message); });
  };

  window.deleteDiscountCampaign = function (campaignId) {
    if (!confirm('این کمپین حذف شود؟ کدهای آن دیگر قابل استفاده نخواهند بود.')) return;
    db.collection('discount_campaigns').doc(campaignId).delete().then(loadDiscountCampaigns).catch(function (e) { alert(e.message); });
  };

  function showCouponCodeOutput(codes, title) {
    var box = document.getElementById('coupon-code-output');
    if (!box) return;
    box.classList.add('active');
    box.dataset.codes = JSON.stringify(codes || []);
    box.innerHTML = '<div class="coupon-output-head"><strong>' + escapeHtml(title || 'کدهای تخفیف') + '</strong>'
      + '<button type="button" onclick="copyGeneratedCodes()">کپی همه</button></div><div class="coupon-code-list">'
      + (codes || []).map(function (code) { return '<code>' + escapeHtml(code) + '</code>'; }).join('') + '</div>';
  }

  window.copyGeneratedCodes = function () {
    var box = document.getElementById('coupon-code-output');
    var codes = box ? JSON.parse(box.dataset.codes || '[]') : [];
    if (!codes.length) return;
    navigator.clipboard.writeText(codes.join('\n')).then(function () {
      showAlert('coupon-success', 'کدها کپی شدند.');
    }).catch(function () { alert(codes.join('\n')); });
  };

  window.showCampaignCodes = function (campaignId) {
    var items = discountCodeCache[campaignId] || [];
    var codes = items.map(function (item) {
      var state = item.used ? ' (مصرف‌شده)' : (item.mode === 'shared' && item.usedBy ? ' (' + item.usedBy.length + ' استفاده)' : '');
      return String(item.code || item.id) + state;
    });
    showCouponCodeOutput(codes, 'کدهای کمپین');
    var output = document.getElementById('coupon-code-output');
    if (output) output.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  window.toggleDiscountCampaign = function (campaignId, active) {
    db.collection('discount_campaigns').doc(campaignId).update({ active: active, updatedAt: new Date().toISOString() })
      .then(window.loadDiscountCampaigns).catch(function (e) { alert(e.message); });
  };

  window.loadDiscountCampaigns = function () {
    var box = document.getElementById('coupon-campaign-list');
    if (!box) return;
    Promise.all([db.collection('discount_campaigns').get(), db.collection('discount_codes').get()]).then(function (results) {
      var counts = {};
      discountCodeCache = {};
      results[1].forEach(function (doc) {
        var code = Object.assign({ id: doc.id }, doc.data());
        counts[code.campaignId] = (counts[code.campaignId] || 0) + 1;
        if (!discountCodeCache[code.campaignId]) discountCodeCache[code.campaignId] = [];
        discountCodeCache[code.campaignId].push(code);
      });
      var campaigns = [];
      results[0].forEach(function (doc) { campaigns.push(Object.assign({ id: doc.id }, doc.data())); });
      campaigns.sort(function (a, b) { return String(b.createdAt || '').localeCompare(String(a.createdAt || '')); });
      box.innerHTML = campaigns.map(function (item) {
        var value = item.discountType === 'percent' ? item.value + '٪' : Number(item.value || 0).toLocaleString('fa-IR') + ' تومان';
        var modeLabel = item.mode === 'shared' ? 'کد عمومی' : (counts[item.id] || 0) + ' کد مجزا';
        var activeLabel = item.active !== false ? 'فعال' : 'غیرفعال';
        return '<div class="admin-article-item"><strong>' + escapeHtml(item.name) + '</strong><p>'
          + escapeHtml(COUPON_TARGET_LABELS[item.target] || item.target) + ' · ' + escapeHtml(value) + ' · '
          + escapeHtml(modeLabel) + ' · ' + activeLabel + '</p><div class="admin-article-actions">'
          + '<button onclick="showCampaignCodes(\'' + item.id + '\')">نمایش کدها</button>'
          + (item.mode === 'unique' ? '<button onclick="addDiscountCodes(\'' + item.id + '\')">افزایش تعداد کد</button>' : '')
          + '<button onclick="toggleDiscountCampaign(\'' + item.id + '\',' + (item.active !== false ? 'false' : 'true') + ')">'
          + (item.active !== false ? 'غیرفعال‌کردن' : 'فعال‌کردن') + '</button>'
          + '<button onclick="deleteDiscountCampaign(\'' + item.id + '\')">حذف</button></div></div>';
      }).join('') || '<div class="chat-empty">هنوز کمپینی ساخته نشده است.</div>';
    }).catch(function (e) {
      box.innerHTML = '<div class="chat-empty">خطا: ' + escapeHtml(e.message) + '</div>';
    });
  };

  function couponMarkup(target, hint) {
    return '<div class="coupon-entry" data-coupon-target="' + target + '"><span class="coupon-entry-label">ووچر تخفیف</span><p>' + escapeHtml(hint || 'اگر کد تخفیف دارید، آن را اینجا وارد کنید.') + '</p>'
      + '<div class="coupon-entry-row"><input class="form-input" id="coupon-input-' + target + '" autocomplete="off" placeholder="AS-XXXXXXXX"><button type="button" onclick="validateCouponCode(\'' + target + '\')">اعمال کد</button></div>'
      + '<div class="coupon-result" id="coupon-result-' + target + '"></div></div>';
  }

  window.loadCouponField = function (target, slotId) {
    var slot = document.getElementById(slotId);
    if (!slot || !COUPON_TARGET_LABELS[target]) return;
    apiFetch('/api/coupons/config?target=' + encodeURIComponent(target)).then(function (result) {
      slot.innerHTML = result.available ? couponMarkup(target, result.hint) : '';
    }).catch(function () { slot.innerHTML = ''; });
  };

  window.validateCouponCode = function (target) {
    if (!currentUser) return openModal('login');
    var input = document.getElementById('coupon-input-' + target);
    var resultBox = document.getElementById('coupon-result-' + target);
    var code = (input && input.value || '').trim().toUpperCase();
    if (!code) return;
    apiFetch('/api/coupons/validate', { method: 'POST', body: JSON.stringify({ code: code, target: target }) }).then(function (result) {
      couponSelections[target] = result.coupon;
      resultBox.className = 'coupon-result success';
      resultBox.textContent = result.coupon.discountType === 'percent'
        ? 'کد معتبر است: ' + result.coupon.value + '٪ تخفیف'
        : 'کد معتبر است: ' + Number(result.coupon.value || 0).toLocaleString('fa-IR') + ' تومان تخفیف';
    }).catch(function (e) {
      delete couponSelections[target];
      resultBox.className = 'coupon-result error';
      resultBox.textContent = e.message;
    });
  };

  window.redeemSelectedCoupon = function (target) {
    var selected = couponSelections[target];
    if (!selected) return Promise.resolve(null);
    return apiFetch('/api/coupons/redeem', { method: 'POST', body: JSON.stringify({ code: selected.code, target: target }) })
      .then(function (result) { delete couponSelections[target]; return result.coupon; });
  };

  function permissionCheckboxes() {
    var box = document.getElementById('staff-permissions');
    if (!box) return;
    box.innerHTML = Object.keys(PERMISSIONS).map(function (key) {
      return '<label><input type="checkbox" value="' + key + '" class="staff-permission"> ' + PERMISSIONS[key] + '</label>';
    }).join('');
  }

  window.createStaffAdmin = function () {
    var permissions = Array.prototype.map.call(document.querySelectorAll('.staff-permission:checked'), function (input) { return input.value; });
    apiFetch('/api/admin/users', { method: 'POST', body: JSON.stringify({
      name: document.getElementById('staff-name').value.trim(),
      email: document.getElementById('staff-email').value.trim(),
      password: document.getElementById('staff-password').value,
      permissions: permissions
    }) }).then(function () {
      showAlert('staff-success', 'ادمین ساخته شد و اکنون می‌تواند وارد پنل شود.');
      loadStaffAdmins();
    }).catch(function (e) { showAlert('staff-error', e.message); });
  };

  window.loadStaffAdmins = function () {
    var box = document.getElementById('staff-admin-list');
    if (!box) return;
    db.collection('users').get().then(function (snap) {
      var list = [];
      snap.forEach(function (doc) {
        var item = doc.data();
        if ((item.role || '').toLowerCase() === 'staff') list.push(Object.assign({ uid: doc.id }, item));
      });
      box.innerHTML = list.map(function (item) {
        var checks = Object.keys(PERMISSIONS).map(function (key) {
          return '<label><input type="checkbox" class="staff-edit-' + item.uid + '" value="' + key + '" ' + ((item.permissions || []).indexOf(key) !== -1 ? 'checked' : '') + '> ' + PERMISSIONS[key] + '</label>';
        }).join('');
        return '<div class="admin-article-item"><strong>' + escapeHtml(item.name || 'ادمین') + '</strong><p>' + escapeHtml(item.email || '')
          + '</p><div class="permission-grid">' + checks + '</div><label class="switch-line"><input id="staff-active-' + item.uid + '" type="checkbox" ' + (item.active === false ? '' : 'checked') + '> حساب فعال باشد</label>'
          + '<div class="admin-article-actions"><button onclick="updateStaffAdmin(\'' + item.uid + '\')">ذخیره دسترسی‌ها</button></div></div>';
      }).join('') || '<div class="chat-empty">ادمین محدودی ساخته نشده است.</div>';
    });
  };

  window.updateStaffAdmin = function (uid) {
    var permissions = Array.prototype.map.call(document.querySelectorAll('.staff-edit-' + uid + ':checked'), function (input) { return input.value; });
    apiFetch('/api/admin/users/' + encodeURIComponent(uid), { method: 'PATCH', body: JSON.stringify({
      permissions: permissions,
      active: document.getElementById('staff-active-' + uid).checked
    }) }).then(function () {
      alert('دسترسی‌های ادمین بروزرسانی شد.');
      loadStaffAdmins();
    }).catch(function (e) { alert(e.message); });
  };

  function applyAdminPermissions() {
    if (!currentUser) return;
    var manager = (currentUser.role || '').toLowerCase() === 'admin';
    var staff = (currentUser.role || '').toLowerCase() === 'staff';
    var permissions = currentUser.permissions || [];
    var map = {
      'an-overview':'reports',
      'an-students':'users','an-registrations':'registrations','an-assignments':'assignments','an-addgrade':'results',
      'an-attendance':'attendance',
      'an-toefl-dates':'dates','an-mock-dates':'dates','an-gre-dates':'dates','an-consultations':'consultations',
      'an-exam-builder':'exams','an-pricing':'settings','an-coupons':'coupons','an-settings':'settings','an-messages':'messages',
      'an-articles':'articles','an-faq':'content','an-testimonials':'content','an-popups':'popups','an-content':'content','an-contact-settings':'content','an-notifications':'notifications','an-reports':'reports'
    };
    Object.keys(map).forEach(function (id) {
      var link = document.getElementById(id);
      if (link) link.closest('li').style.display = manager || (staff && permissions.indexOf(map[id]) !== -1) ? '' : 'none';
    });
    var adminLink = document.getElementById('an-admins');
    if (adminLink) adminLink.closest('li').style.display = manager ? '' : 'none';
    var chatWidgetLink = document.getElementById('an-chat-widget');
    if (chatWidgetLink) chatWidgetLink.closest('li').style.display = manager ? '' : 'none';
    document.querySelector('#page-admin .sb-name').textContent = manager ? 'مدیر سایت' : 'ادمین';
  }

  var originalShowPage = window.showPage;
  window.showPage = function (id, skipHash) {
    originalShowPage(id, skipHash);
    updateSeo(id);
    if (id === 'newsletter') renderNewsletter();
    if (id === 'course-registration') loadCouponField('courses', 'coupon-slot-courses');
    if (id === 'mock-toefl-registration') loadCouponField('mock-toefl', 'coupon-slot-mock-toefl');
    if (id === 'mock-gre-registration') loadCouponField('mock-gre', 'coupon-slot-mock-gre');
    if (id === 'consultation') loadCouponField('consultation', 'coupon-slot-consultation');
    if (id === 'toefl-voucher') loadCouponField('toefl-voucher', 'coupon-slot-toefl-voucher');
    if (id === 'gre-voucher') loadCouponField('gre-voucher', 'coupon-slot-gre-voucher');
    loadPopupForPage(id);
  };

  var originalShowAdmin = window.showAdmin;
  window.showAdmin = function (section, skipHash) {
    if (currentUser && (currentUser.role || '').toLowerCase() === 'staff') {
      var needed = { overview:'reports',students:'users',registrations:'registrations',attendance:'attendance',assignments:'assignments',addgrade:'results','toefl-dates':'dates','mock-dates':'dates','gre-dates':'dates',consultations:'consultations','exam-builder':'exams',pricing:'settings',coupons:'coupons',settings:'settings',messages:'messages',notifications:'notifications',reports:'reports',articles:'articles',resources:'resources',gallery:'gallery',popups:'popups',content:'content','contact-settings':'content',testimonials:'content',faq:'content' }[section];
      if (needed && (currentUser.permissions || []).indexOf(needed) === -1) return alert('برای این بخش دسترسی ندارید.');
      if (section === 'admins' || section === 'chat-widget') return alert('این بخش فقط برای مدیر سایت است.');
    }
    originalShowAdmin(section, skipHash);
    if (section === 'articles') loadAdminArticles();
    if (section === 'popups') loadAdminPopups();
    if (section === 'coupons') loadDiscountCampaigns();
    if (section === 'content') buildContentEditor();
    if (section === 'contact-settings') fillContactSettingsForm();
    if (section === 'admins') {
      loadStaffAdmins();
      if (typeof loadPasswordResetRequests === 'function') loadPasswordResetRequests();
    }
  };

  var originalLoginUser = window.loginUser;
  window.loginUser = function (user, options) {
    var role = (user.role || '').toLowerCase();
    if (role !== 'staff') return originalLoginUser(user, options);
    currentUser = user;
    document.getElementById('nav-guest').style.display = 'none';
    document.getElementById('nav-user').style.display = 'flex';
    document.getElementById('nav-avatar').textContent = (user.name || 'ا').charAt(0);
    document.getElementById('nav-username').textContent = (user.name || 'ادمین').split(' ')[0];
    applyAdminPermissions();
    if (typeof refreshMessageMenuBadges === 'function') {
      clearInterval(adminBadgeTimer);
      refreshMessageMenuBadges();
      adminBadgeTimer = setInterval(refreshMessageMenuBadges, 30000);
    }
    if (options && options.preserveRoute) {
      if (typeof applyHashRoute === 'function') applyHashRoute();
      return;
    }
    document.querySelectorAll('.page').forEach(function (page) { page.classList.remove('active'); });
    document.getElementById('page-admin').classList.add('active');
    var first = Object.keys(PERMISSIONS).find(function (p) { return (user.permissions || []).indexOf(p) !== -1; });
    var firstSection = { users:'students',registrations:'registrations',attendance:'attendance',assignments:'assignments',dates:'toefl-dates',consultations:'consultations',exams:'exam-builder',articles:'articles',resources:'resources',gallery:'gallery',popups:'popups',content:'content',coupons:'coupons',settings:'pricing',messages:'messages',notifications:'notifications',results:'addgrade',reports:'overview' }[first] || 'password';
    showAdmin(firstSection);
  };

  var originalGoDashboard = window.goDashboard;
  window.goDashboard = function () {
    if (currentUser && (currentUser.role || '').toLowerCase() === 'staff') return loginUser(currentUser);
    originalGoDashboard();
    applyAdminPermissions();
  };

  function makePhoneLinks() {
    document.querySelectorAll('.contact-number,.contact-social-number').forEach(function (node) {
      if (node.tagName === 'A') return;
      var digits = String(node.textContent || '').replace(/\D/g, '');
      if (!digits) return;
      var link = document.createElement('a');
      link.className = node.className;
      link.href = 'tel:' + (digits.indexOf('0') === 0 ? '+98' + digits.slice(1) : digits);
      link.textContent = node.textContent;
      node.replaceWith(link);
    });
  }

  permissionCheckboxes();
  var popupImageInput = document.getElementById('popup-admin-image');
  if (popupImageInput) popupImageInput.addEventListener('change', function () {
    var file = this.files[0];
    if (!file) return renderPopupImagePreview('');
    if (file.size > 5 * 1024 * 1024) {
      this.value = '';
      return showAlert('popup-admin-error', 'حجم تصویر باید کمتر از ۵ مگابایت باشد.');
    }
    fileToDataUrl(file).then(renderPopupImagePreview);
  });
  makePhoneLinks();
  loadSiteContent();
  var initialNewsletterPage = document.getElementById('page-newsletter');
  if (initialNewsletterPage && initialNewsletterPage.classList.contains('active')) renderNewsletter();
  setTimeout(function () {
    var activePage = document.querySelector('.page.active');
    loadPopupForPage(activePage ? activePage.id.replace('page-', '') : 'home');
  }, 700);
  var newsletterLangObserver = new MutationObserver(function (mutations) {
    var changed = mutations.some(function (mutation) { return mutation.attributeName === 'lang'; });
    if (!changed) return;
    var newsletterPage = document.getElementById('page-newsletter');
    var articlePage = document.getElementById('page-article');
    if (newsletterPage && newsletterPage.classList.contains('active')) renderNewsletter();
    if (articlePage && articlePage.classList.contains('active')) {
      var currentArticle = (location.hash.match(/^#article\/(.+)$/) || [])[1];
      if (currentArticle) openArticle(decodeURIComponent(currentArticle), true);
    }
  });
  newsletterLangObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  window.addEventListener('allameh-language-change', refreshNewsletterLanguageView);
  var hashMatch = location.hash.match(/^#article\/(.+)$/);
  var pathMatch = location.pathname.match(/^\/news\/([^/]+)\/?$/);
  if (pathMatch) openArticle(decodeURIComponent(pathMatch[1]), true);
  else if (hashMatch) openArticle(decodeURIComponent(hashMatch[1]), true);
  window.addEventListener('hashchange', function () {
    var match = location.hash.match(/^#article\/(.+)$/);
    if (match) openArticle(decodeURIComponent(match[1]), true);
  });
})();

