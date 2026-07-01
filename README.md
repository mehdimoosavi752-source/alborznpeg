# نوین پی تست البرز

نسخه آماده انتشار سایت استاتیک برای GitHub Pages و Render.

## ساختار

- `index.html`: صفحه اصلی
- `assets/`: تصاویر و فایل‌های گرافیکی
- `services/`: صفحات خدمات
- `_redirects`: تنظیم fallback برای Render
- `.nojekyll`: مناسب GitHub Pages

## اجرای محلی

کافی است فایل `index.html` را در مرورگر باز کنید.

## انتشار روی Render

اگر کل ریپو را به GitHub push کنید، فایل `render.yaml` در ریشه ریپو آماده است.

در Render:

1. New + Blueprint
2. اتصال به ریپوی GitHub
3. انتخاب همین ریپو
4. Deploy

Render پوشه `docs` را به عنوان سایت منتشر می‌کند. نسخه داخل `outputs/alborznpeg-redesign-v2` نسخه کاری/خروجی اصلی پروژه است.

## انتشار روی GitHub Pages

روش ساده:

1. فایل‌های همین پوشه را در branch مدنظر قرار دهید.
2. از Settings > Pages، مسیر انتشار را روی پوشه سایت تنظیم کنید.

نسخه آماده GitHub Pages داخل پوشه ریشه‌ای `docs/` کپی شده است.
