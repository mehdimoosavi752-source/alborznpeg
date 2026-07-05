# راهنمای نصب نسخه GitHub و Render با PostgreSQL

این بسته مخصوص Render است و با دیتابیس PostgreSQL کار می‌کند.

## آپلود روی GitHub

1. فایل ZIP را Extract کنید.
2. همه فایل‌ها و پوشه‌های داخل پوشه Extract شده را در ریشه مخزن GitHub آپلود کنید.
3. فایل‌های `index.html`، `server.js`، `package.json` و `render.yaml` باید مستقیم در صفحه اصلی مخزن دیده شوند.
4. فایل `.env` واقعی داخل این بسته نیست و نباید روی GitHub آپلود شود.

## نصب در Render

اگر با Blueprint نصب می‌کنید:

1. در Render گزینه `New` و سپس `Blueprint` را بزنید.
2. مخزن GitHub سایت را انتخاب کنید.
3. Render فایل `render.yaml` را می‌خواند و Web Service و PostgreSQL Database را می‌سازد.
4. هنگام ساخت، برای `ADMIN_PASSWORD` رمز مدیر را وارد کنید.
5. مقدار `DATABASE_URL` را دستی وارد نکنید، چون Blueprint آن را از دیتابیس Render می‌گیرد.

اگر از دیتابیس PostgreSQL آماده مثل Neon یا دیتابیس قبلی Render استفاده می‌کنید:

1. وارد Web Service سایت در Render شوید.
2. از بخش `Environment` مقدار `DATABASE_URL` را برابر Connection String دیتابیس قرار دهید.
3. سرویس را `Manual Deploy` یا `Restart` کنید.

## ورود مدیر

ایمیل پیش‌فرض مدیر:

```text
admin@asmdi.ir
```

رمز مدیر همان مقداری است که در Render برای `ADMIN_PASSWORD` وارد می‌کنید.

## تست بعد از نصب

بعد از Live شدن سرویس، این مسیر را باز کنید:

```text
/api/health
```

اگر پاسخ شامل `ok` و `database: postgresql` بود، سایت و دیتابیس درست وصل شده‌اند.

## نکته‌های مهم

- Connection String دیتابیس شامل رمز است. آن را داخل GitHub، فایل‌های سایت یا چت عمومی قرار ندهید.
- تا وقتی تنظیمات درگاه کامل نشده، سایت وارد پرداخت واقعی نمی‌شود و فقط پیام اطلاعیه ثبت‌نام را نشان می‌دهد.
- تنظیمات اطلاعیه ثبت‌نام و درگاه از داخل پنل مدیریت قابل تغییر است.
