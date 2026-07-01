# راهنمای دیپلوی سایت

این پروژه برای دو مسیر آماده شده است:

- Render Static Site
- GitHub Pages

## Render

فایل `render.yaml` در ریشه پروژه قرار دارد و به Render می‌گوید سایت از این مسیر منتشر شود:

```text
docs
```

مراحل:

1. یک ریپو در GitHub بسازید.
2. کل پروژه را push کنید.
3. وارد Render شوید.
4. گزینه `New + Blueprint` را بزنید.
5. ریپو را انتخاب کنید.
6. Deploy را بزنید.

اگر به‌جای Static Site اشتباها Web Service ساختید:

1. وارد Settings همان سرویس در Render شوید.
2. Build Command را روی این مقدار بگذارید:

```text
yarn build
```

3. Start Command را روی این مقدار بگذارید:

```text
yarn start
```

4. دوباره Deploy کنید.

نکته: خطای `bash: line 1: 0: command not found` یعنی Start Command روی `0` تنظیم شده و باید پاک یا با `yarn start` جایگزین شود.

## GitHub Pages

GitHub Pages معمولا انتشار از root یا `docs/` را راحت‌تر پشتیبانی می‌کند. برای همین نسخه آماده انتشار داخل `docs` قرار داده شده است.

مراحل:

1. ریپو را در GitHub باز کنید.
2. وارد Settings > Pages شوید.
3. Source را روی `Deploy from a branch` بگذارید.
4. Branch را انتخاب کنید.
5. Folder را روی `/docs` بگذارید.
6. Save را بزنید.

## مسیرهای مهم

```text
outputs/alborznpeg-redesign-v2/index.html
outputs/alborznpeg-redesign-v2/services/
outputs/alborznpeg-redesign-v2/assets/
docs/index.html
docs/services/
docs/assets/
render.yaml
```
