import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    react(),
    // خروجی gzip از قبل فشرده‌شده تولید می‌کند تا سرور مجبور نباشد هر بار فایل‌ها را فشرده کند
    viteCompression({ algorithm: "gzip", ext: ".gz" }),
    viteCompression({ algorithm: "brotliCompress", ext: ".br" }),
  ],
  build: {
    assetsInlineLimit: 0,
    cssCodeSplit: true,
  },
});
