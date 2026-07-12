/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {},
  },
  // برخی کلاس‌ها ممکن است در آینده به‌صورت پویا ساخته شوند؛ برای اطمینان اینجا نگه داشته می‌شوند
  safelist: [
    { pattern: /^(bg|text|border|from|via|to)-(red|black|white|neutral|amber|green|emerald|blue|purple|pink|fuchsia)-(50|100|200|300|400|500|600|700|800|900)$/ },
  ],
  plugins: [],
};
