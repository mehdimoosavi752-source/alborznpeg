const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");
const { Pool } = require("pg");

const root = __dirname;
const port = Number(process.env.PORT || 8080);
const adminEmail = String(process.env.ADMIN_EMAIL || "admin@asmdi.ir").trim().toLowerCase();
const adminPassword = String(process.env.ADMIN_PASSWORD || "");
const adminName = String(process.env.ADMIN_NAME || "Ù…Ø¯ÛŒØ± Ø³Ø§ÛŒØª").trim();
const sessions = new Map();
const loginAttempts = new Map();
const apiAttempts = new Map();
let chatWidgetOrigins = new Set();
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000;
const LOGIN_WINDOW = 15 * 60 * 1000;
const LOGIN_LIMIT = 8;
const API_WINDOW = 60 * 1000;
const API_LIMIT = 220;
setInterval(() => {
  const now = Date.now();
  for (const [sid, session] of sessions) if (session.expiresAt <= now) sessions.delete(sid);
  for (const [key, record] of loginAttempts) if (record.resetAt <= now) loginAttempts.delete(key);
  for (const [key, record] of apiAttempts) if (record.resetAt <= now) apiAttempts.delete(key);
}, 10 * 60 * 1000).unref();
const articleSeo = {
  "toefl-2026-changes": {
    title: "ØªØºÛŒÛŒØ±Ø§Øª Ø¢Ø²Ù…ÙˆÙ† TOEFL iBT Ø¯Ø± Ø³Ø§Ù„ Û²Û°Û²Û¶ | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ø±Ø§Ù‡Ù†Ù…Ø§ÛŒ ØªØºÛŒÛŒØ±Ø§Øª Ù†Ø³Ø®Ù‡ Ø¬Ø¯ÛŒØ¯ TOEFL iBT Ø§Ø² Û²Û± Ú˜Ø§Ù†ÙˆÛŒÙ‡ Û²Û°Û²Û¶ØŒ Ø³Ø§Ø®ØªØ§Ø± ØªØ·Ø¨ÛŒÙ‚ÛŒØŒ Ù…Ù‚ÛŒØ§Ø³ Ù†Ù…Ø±Ù‡ Û± ØªØ§ Û¶ Ùˆ Ù†Ú©Ø§Øª Ø«Ø¨Øªâ€ŒÙ†Ø§Ù….",
  },
  "toefl-mock-benefits": {
    title: "ÙÙˆØ§ÛŒØ¯ Ø¢Ø²Ù…ÙˆÙ† Ø¢Ø²Ù…Ø§ÛŒØ´ÛŒ TOEFL | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "ÙÙˆØ§ÛŒØ¯ Ù…Ø§Ú© TOEFLØŒ Ø²Ù…Ø§Ù† Ù…Ù†Ø§Ø³Ø¨ Ø´Ø±Ú©ØªØŒ ØªØ­Ù„ÛŒÙ„ Ú†Ù‡Ø§Ø± Ù…Ù‡Ø§Ø±Øª Ùˆ Ù†Ù‚Ø´ Ø´Ø¨ÛŒÙ‡â€ŒØ³Ø§Ø²ÛŒ Ø¯Ø± Ú©Ø§Ù‡Ø´ Ø§Ø³ØªØ±Ø³ Ø±ÙˆØ² Ø¢Ø²Ù…ÙˆÙ†.",
  },
  "register-toefl-gre-iran": {
    title: "Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… TOEFL Ùˆ GRE Ø§Ø² Ø§ÛŒØ±Ø§Ù† Ùˆ Ø®Ø±ÛŒØ¯ ÙˆÙˆÚ†Ø± | Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ø±Ø§Ù‡Ù†Ù…Ø§ÛŒ Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… TOEFL iBT Ùˆ GRE Ø§Ø² Ø§ÛŒØ±Ø§Ù†ØŒ Ù¾Ø±Ø¯Ø§Ø®Øª Ø§Ø±Ø²ÛŒØŒ Ø®Ø±ÛŒØ¯ ÙˆÙˆÚ†Ø± Ùˆ Ù†Ú©Ø§Øª Ø§Ù…Ù†ÛŒØªÛŒ.",
  },
  "allameh-new-toefl-mock": {
    title: "Ø¢Ø²Ù…ÙˆÙ† Ø¢Ø²Ù…Ø§ÛŒØ´ÛŒ TOEFL Ø¨Ø§ ÙØ±Ù…Øª Ø¬Ø¯ÛŒØ¯ | Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ù…Ø¹Ø±ÙÛŒ Ù…Ø§Ú© TOEFL ÙØ±Ù…Øª Ø¬Ø¯ÛŒØ¯ Ø¨Ø§ Ø³ÙˆØ§Ù„Ø§Øª Ø§Ø³ØªØ§Ù†Ø¯Ø§Ø±Ø¯ØŒ Ù…Ø­ÛŒØ· Ø³Ù†ØªØ± Ùˆ Ø§Ø±Ø²ÛŒØ§Ø¨ÛŒ Speaking Ùˆ Writing.",
  },
  "ets-centers-tehran": {
    title: "Ù…Ø±Ø§Ú©Ø² ETS Ø¯Ø± ØªÙ‡Ø±Ø§Ù† Ùˆ Ø§Ù†ØªØ®Ø§Ø¨ Ø³Ù†ØªØ± Ø¢Ø²Ù…ÙˆÙ† | Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ø±Ø§Ù‡Ù†Ù…Ø§ÛŒ ÛŒØ§ÙØªÙ† ÙÙ‡Ø±Ø³Øª Ø¨Ù‡â€ŒØ±ÙˆØ² Ù…Ø±Ø§Ú©Ø² ETS ØªÙ‡Ø±Ø§Ù† Ùˆ Ù…Ø¹ÛŒØ§Ø±Ù‡Ø§ÛŒ Ø§Ù†ØªØ®Ø§Ø¨ Ø³Ù†ØªØ± Ù…Ù†Ø§Ø³Ø¨ TOEFL Ùˆ GRE.",
  },
  "toefl-test-guide": {
    title: "Ø±Ø§Ù‡Ù†Ù…Ø§ÛŒ Ú©Ø§Ù…Ù„ Ø¢Ø²Ù…ÙˆÙ† TOEFL iBT | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ø¢Ø´Ù†Ø§ÛŒÛŒ Ø¨Ø§ Ú†Ù‡Ø§Ø± Ù…Ù‡Ø§Ø±Øª TOEFL iBTØŒ Ø¢Ù…Ø§Ø¯Ú¯ÛŒ Ø±ÙˆØ² Ø¢Ø²Ù…ÙˆÙ†ØŒ Ù…Ø¯Ø§Ø±Ú© Ùˆ Ù…Ø³ÛŒØ± Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… Ùˆ Ø®Ø±ÛŒØ¯ ÙˆÙˆÚ†Ø±.",
  },
};
const pageSeo = {
  "/toefl": {
    page: "toefl",
    title: "Ø¢Ø²Ù…ÙˆÙ† TOEFL iBT Ø¯Ø± ØªÙ‡Ø±Ø§Ù† | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ø§Ø·Ù„Ø§Ø¹Ø§ØªØŒ ØªØ§Ø±ÛŒØ®â€ŒÙ‡Ø§ØŒ Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… Ùˆ Ø¢Ù…Ø§Ø¯Ú¯ÛŒ Ø¢Ø²Ù…ÙˆÙ† TOEFL iBT Ø¯Ø± Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†ØŒ Ù…Ø±Ú©Ø² Ø±Ø³Ù…ÛŒ Ø¢Ø²Ù…ÙˆÙ†â€ŒÙ‡Ø§ÛŒ ETS Ø¯Ø± ØªÙ‡Ø±Ø§Ù†.",
  },
  "/gre": {
    page: "gre",
    title: "Ø¢Ø²Ù…ÙˆÙ† GRE General Ø¯Ø± ØªÙ‡Ø±Ø§Ù† | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ø±Ø§Ù‡Ù†Ù…Ø§ÛŒ Ø¢Ø²Ù…ÙˆÙ† GRE GeneralØŒ ØªØ§Ø±ÛŒØ®â€ŒÙ‡Ø§ØŒ Ø«Ø¨Øªâ€ŒÙ†Ø§Ù…ØŒ ÙˆÙˆÚ†Ø± Ùˆ Ø¢Ù…Ø§Ø¯Ú¯ÛŒ GRE Ø¯Ø± Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†.",
  },
  "/mock-toefl": {
    page: "mock-toefl",
    title: "Ø¢Ø²Ù…ÙˆÙ† Ø¢Ø²Ù…Ø§ÛŒØ´ÛŒ TOEFL iBT | Ù…Ø§Ú© ØªØ§ÙÙ„ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ø´Ø¨ÛŒÙ‡â€ŒØ³Ø§Ø²ÛŒ TOEFL iBT Ø¨Ø§ ØªØ¬Ù‡ÛŒØ²Ø§Øª Ø³Ù†ØªØ±ØŒ Ø³ÙˆØ§Ù„Ø§Øª Ø§Ø³ØªØ§Ù†Ø¯Ø§Ø±Ø¯ØŒ Ù…Ø­ÛŒØ· Ø¢Ø²Ù…ÙˆÙ† Ùˆ Ø§Ø±Ø²ÛŒØ§Ø¨ÛŒ ØªØ®ØµØµÛŒ Ù…Ù‡Ø§Ø±Øªâ€ŒÙ‡Ø§.",
  },
  "/mock-gre": {
    page: "mock-gre",
    title: "Ø¢Ø²Ù…ÙˆÙ† Ø¢Ø²Ù…Ø§ÛŒØ´ÛŒ GRE General | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ø¢Ø²Ù…ÙˆÙ† Mock GRE General Ø¨Ø±Ø§ÛŒ Ø§Ø±Ø²ÛŒØ§Ø¨ÛŒ Ø¢Ù…Ø§Ø¯Ú¯ÛŒØŒ Ù…Ø¯ÛŒØ±ÛŒØª Ø²Ù…Ø§Ù† Ùˆ Ø´Ù†Ø§Ø®Øª Ù†Ù‚Ø§Ø· Ù‚Ø§Ø¨Ù„ Ø¨Ù‡Ø¨ÙˆØ¯ Ù¾ÛŒØ´ Ø§Ø² Ø¢Ø²Ù…ÙˆÙ† Ø§ØµÙ„ÛŒ.",
  },
  "/mock": {
    page: "mock",
    title: "Ø¢Ø²Ù…ÙˆÙ†â€ŒÙ‡Ø§ÛŒ Ø¢Ø²Ù…Ø§ÛŒØ´ÛŒ Ø²Ø¨Ø§Ù† Ùˆ Ø¢Ø²Ù…ÙˆÙ† Ø¨ÛŒÙ†â€ŒØ§Ù„Ù…Ù„Ù„ÛŒ | Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ø¢Ø²Ù…ÙˆÙ†â€ŒÙ‡Ø§ÛŒ Ø¢Ø²Ù…Ø§ÛŒØ´ÛŒ Ùˆ ØªØ¹ÛŒÛŒÙ† Ø³Ø·Ø­ Ø¨Ø±Ø§ÛŒ Ø³Ù†Ø¬Ø´ Ø¢Ù…Ø§Ø¯Ú¯ÛŒ Ø²Ø¨Ø§Ù† Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒØŒ TOEFL iBT Ùˆ GRE General Ø¯Ø± Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†.",
  },
  "/toefl-dates": {
    page: "toefl-dates",
    title: "ØªØ§Ø±ÛŒØ®â€ŒÙ‡Ø§ÛŒ Ø¢Ø²Ù…ÙˆÙ† TOEFL iBT | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ù…Ø´Ø§Ù‡Ø¯Ù‡ ØªØ§Ø±ÛŒØ®â€ŒÙ‡Ø§ÛŒ ÙØ¹Ø§Ù„ Ø¢Ø²Ù…ÙˆÙ† TOEFL iBTØŒ Ø¸Ø±ÙÛŒØªâ€ŒÙ‡Ø§ Ùˆ Ù…Ø³ÛŒØ± Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… Ø¯Ø± Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†.",
  },
  "/gre-dates": {
    page: "gre-dates",
    title: "ØªØ§Ø±ÛŒØ®â€ŒÙ‡Ø§ÛŒ Ø¢Ø²Ù…ÙˆÙ† GRE General | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "ØªÙ‚ÙˆÛŒÙ… ØªØ§Ø±ÛŒØ®â€ŒÙ‡Ø§ÛŒ Ø¢Ø²Ù…ÙˆÙ† GRE GeneralØŒ Ø¸Ø±ÙÛŒØªâ€ŒÙ‡Ø§ÛŒ Ø§Ø¹Ù„Ø§Ù…â€ŒØ´Ø¯Ù‡ Ùˆ Ø«Ø¨Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¢Ø²Ù…ÙˆÙ† Ø¯Ø± Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†.",
  },
  "/mock-dates": {
    page: "mock-dates",
    title: "ØªØ§Ø±ÛŒØ® Ø¢Ø²Ù…ÙˆÙ†â€ŒÙ‡Ø§ÛŒ Ø¢Ø²Ù…Ø§ÛŒØ´ÛŒ TOEFL Ùˆ GRE | Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "ØªÙ‚ÙˆÛŒÙ… Ø¢Ø²Ù…ÙˆÙ†â€ŒÙ‡Ø§ÛŒ Ø¢Ø²Ù…Ø§ÛŒØ´ÛŒ Mock TOEFL iBT Ùˆ Mock GRE General Ø¨Ø§ Ø´Ø±Ø§ÛŒØ· Ø´Ø¨ÛŒÙ‡â€ŒØ³Ø§Ø²ÛŒâ€ŒØ´Ø¯Ù‡ Ø¢Ø²Ù…ÙˆÙ† Ø§ØµÙ„ÛŒ.",
  },
  "/exam-registration": {
    page: "exam-registration",
    title: "Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… Ø¢Ø²Ù…ÙˆÙ† TOEFL iBT Ùˆ GRE | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "ÙØ±Ù… Ø«Ø¨Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¢Ø²Ù…ÙˆÙ† Ø±Ø³Ù…ÛŒ TOEFL iBT Ùˆ GREØŒ Ø§Ù†ØªØ®Ø§Ø¨ ØªØ§Ø±ÛŒØ®ØŒ Ø«Ø¨Øª Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø¯Ø§ÙˆØ·Ù„Ø¨ Ùˆ Ù¾ÛŒÚ¯ÛŒØ±ÛŒ Ø§Ø² Ù¾Ù†Ù„ Ú©Ø§Ø±Ø¨Ø±ÛŒ.",
  },
  "/course-registration": {
    page: "course-registration",
    title: "Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… Ø¯ÙˆØ±Ù‡â€ŒÙ‡Ø§ÛŒ Ø²Ø¨Ø§Ù† Ùˆ Ø¢Ù…Ø§Ø¯Ú¯ÛŒ Ø¢Ø²Ù…ÙˆÙ† | Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… Ø¯ÙˆØ±Ù‡â€ŒÙ‡Ø§ÛŒ Ø²Ø¨Ø§Ù† Ø¹Ù…ÙˆÙ…ÛŒØŒ Ø¢Ú©Ø§Ø¯Ù…ÛŒÚ©ØŒ TOEFLØŒ GREØŒ IELTS Ùˆ Ú©Ù„Ø§Ø³â€ŒÙ‡Ø§ÛŒ Ù…Ù‡Ø§Ø±ØªÛŒ Ø¯Ø± Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†.",
  },
  "/placement": {
    page: "placement",
    title: "ØªØ¹ÛŒÛŒÙ† Ø³Ø·Ø­ Ø²Ø¨Ø§Ù† Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒ Ùˆ TOEFL | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ø¢Ø²Ù…ÙˆÙ† ØªØ¹ÛŒÛŒÙ† Ø³Ø·Ø­ Ø¬Ù†Ø±Ø§Ù„ Ùˆ ØªØ¹ÛŒÛŒÙ† Ø³Ø·Ø­ ØªØ®ØµØµÛŒ TOEFL Ø¨Ø§ ReadingØŒ Listening Ùˆ Writing Ùˆ Ø°Ø®ÛŒØ±Ù‡ Ù†ØªÛŒØ¬Ù‡ Ø¯Ø± Ù¾Ù†Ù„ Ú©Ø§Ø±Ø¨Ø±ÛŒ.",
  },
  "/consultation": {
    page: "consultation",
    title: "Ø±Ø²Ø±Ùˆ Ù…Ø´Ø§ÙˆØ±Ù‡ ØªØ®ØµØµÛŒ Ø²Ø¨Ø§Ù† Ùˆ Ø¢Ø²Ù…ÙˆÙ† | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ø±Ø²Ø±Ùˆ ÙˆÙ‚Øª Ù…Ø´Ø§ÙˆØ±Ù‡ Ø¨Ø±Ø§ÛŒ Ø§Ù†ØªØ®Ø§Ø¨ Ø¯ÙˆØ±Ù‡ØŒ ØªØ­Ù„ÛŒÙ„ Ù†ØªÛŒØ¬Ù‡ Ø¢Ø²Ù…ÙˆÙ† Ùˆ Ø¨Ø±Ù†Ø§Ù…Ù‡â€ŒØ±ÛŒØ²ÛŒ Ø¢Ù…Ø§Ø¯Ú¯ÛŒ TOEFLØŒ GRE Ùˆ Ø²Ø¨Ø§Ù† Ø¹Ù…ÙˆÙ…ÛŒ.",
  },
  "/toefl-voucher": {
    page: "toefl-voucher",
    title: "Ø®Ø±ÛŒØ¯ ÙˆÙˆÚ†Ø± TOEFL iBT | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ø«Ø¨Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø®Ø±ÛŒØ¯ ÙˆÙˆÚ†Ø± TOEFL iBT Ø¨Ø§ Ø±Ø§Ù‡Ù†Ù…Ø§ÛŒÛŒØŒ Ù¾Ø´ØªÛŒØ¨Ø§Ù†ÛŒ Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… Ùˆ Ø¨Ø±Ø±Ø³ÛŒ Ø§Ø¹ØªØ¨Ø§Ø± ÙˆÙˆÚ†Ø±.",
  },
  "/gre-voucher": {
    page: "gre-voucher",
    title: "Ø®Ø±ÛŒØ¯ ÙˆÙˆÚ†Ø± GRE | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ø«Ø¨Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø®Ø±ÛŒØ¯ ÙˆÙˆÚ†Ø± GRE Ùˆ Ø¯Ø±ÛŒØ§ÙØª Ø±Ø§Ù‡Ù†Ù…Ø§ÛŒÛŒ Ø¨Ø±Ø§ÛŒ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø§Ø² Ú©Ø¯ ÙˆÙˆÚ†Ø± Ùˆ Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… Ø¢Ø²Ù…ÙˆÙ†.",
  },
  "/about": {
    page: "about",
    title: "Ø¯Ø±Ø¨Ø§Ø±Ù‡ Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù† | Ø¨ÛŒØ´ Ø§Ø² Û³Û° Ø³Ø§Ù„ ØªØ¬Ø±Ø¨Ù‡",
    description: "Ù…Ø¹Ø±ÙÛŒ Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†ØŒ Ù…Ø±Ú©Ø² Ø¢Ù…ÙˆØ²Ø´ Ø²Ø¨Ø§Ù† Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒ Ùˆ Ø¢Ø²Ù…ÙˆÙ†â€ŒÙ‡Ø§ÛŒ Ø¨ÛŒÙ†â€ŒØ§Ù„Ù…Ù„Ù„ÛŒ TOEFL iBT Ùˆ GRE.",
  },
  "/contact": {
    page: "contact",
    title: "Ø§Ø±ØªØ¨Ø§Ø· Ø¨Ø§ Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù† | ØªÙ„ÙÙ†ØŒ Ø¢Ø¯Ø±Ø³ Ùˆ Ù…Ø´Ø§ÙˆØ±Ù‡",
    description: "Ø±Ø§Ù‡â€ŒÙ‡Ø§ÛŒ Ø§Ø±ØªØ¨Ø§Ø· Ø¨Ø§ Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†ØŒ Ø´Ù…Ø§Ø±Ù‡ ØªÙ…Ø§Ø³ØŒ Ø¢Ø¯Ø±Ø³ Ù…Ø±Ú©Ø² Ùˆ Ø«Ø¨Øª Ù¾ÛŒØ§Ù… Ø¨Ø±Ø§ÛŒ Ù…Ø´Ø§ÙˆØ±Ù‡ Ø¯ÙˆØ±Ù‡ Ùˆ Ø¢Ø²Ù…ÙˆÙ†.",
  },
  "/history": {
    page: "history",
    title: "ØªØ§Ø±ÛŒØ®Ú†Ù‡ Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù† | Ø§Ø² Û±Û³Û·Û´ ØªØ§ Ø§Ù…Ø±ÙˆØ²",
    description: "Ù…Ø±ÙˆØ±ÛŒ Ø¨Ø± ØªØ§Ø±ÛŒØ®Ú†Ù‡ Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†ØŒ Ø¢ØºØ§Ø² ÙØ¹Ø§Ù„ÛŒØª Ø¢Ù…ÙˆØ²Ø´ÛŒØŒ ØªÙˆØ³Ø¹Ù‡ Ø¯ÙˆØ±Ù‡â€ŒÙ‡Ø§ÛŒ Ø¢Ø²Ù…ÙˆÙ† Ùˆ Ù…Ø±Ú©Ø² Ø±Ø³Ù…ÛŒ Ø¢Ø²Ù…ÙˆÙ†â€ŒÙ‡Ø§ÛŒ Ø¨ÛŒÙ†â€ŒØ§Ù„Ù…Ù„Ù„ÛŒ.",
  },
  "/stats": {
    page: "achievements",
    title: "Ø¢Ù…Ø§Ø± Ùˆ Ø§ÙØªØ®Ø§Ø±Ø§Øª Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ø¨ÛŒØ´ Ø§Ø² Û³Û° Ø³Ø§Ù„ Ø³Ø§Ø¨Ù‚Ù‡ Ø¢Ù…ÙˆØ²Ø´ Ø²Ø¨Ø§Ù†ØŒ Ù‡Ø²Ø§Ø±Ø§Ù† Ø¯Ø§Ù†Ø´Ø¬ÙˆÛŒ Ù…ÙˆÙÙ‚ Ùˆ ØµØ¯Ù‡Ø§ Ø¯ÙˆØ±Ù‡ Ø¢Ù…ÙˆØ²Ø´ÛŒ Ø¯Ø± Ø­ÙˆØ²Ù‡ Ø²Ø¨Ø§Ù† Ùˆ Ø¢Ø²Ù…ÙˆÙ†â€ŒÙ‡Ø§ÛŒ Ø¨ÛŒÙ†â€ŒØ§Ù„Ù…Ù„Ù„ÛŒ.",
  },
  "/achievements": {
    page: "achievements",
    title: "Ø¢Ù…Ø§Ø± Ùˆ Ø§ÙØªØ®Ø§Ø±Ø§Øª Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ø¨ÛŒØ´ Ø§Ø² Û³Û° Ø³Ø§Ù„ Ø³Ø§Ø¨Ù‚Ù‡ Ø¢Ù…ÙˆØ²Ø´ Ø²Ø¨Ø§Ù†ØŒ Ù‡Ø²Ø§Ø±Ø§Ù† Ø¯Ø§Ù†Ø´Ø¬ÙˆÛŒ Ù…ÙˆÙÙ‚ Ùˆ ØµØ¯Ù‡Ø§ Ø¯ÙˆØ±Ù‡ Ø¢Ù…ÙˆØ²Ø´ÛŒ Ø¯Ø± Ø­ÙˆØ²Ù‡ Ø²Ø¨Ø§Ù† Ùˆ Ø¢Ø²Ù…ÙˆÙ†â€ŒÙ‡Ø§ÛŒ Ø¨ÛŒÙ†â€ŒØ§Ù„Ù…Ù„Ù„ÛŒ.",
  },
  "/faq": {
    page: "faq",
    title: "Ø³ÙˆØ§Ù„Ø§Øª Ù¾Ø±ØªÚ©Ø±Ø§Ø± Ø²Ø¨Ø§Ù† Ùˆ Ø¢Ø²Ù…ÙˆÙ† | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ù¾Ø§Ø³Ø® Ø¨Ù‡ Ø³ÙˆØ§Ù„Ø§Øª Ø±Ø§ÛŒØ¬ Ø¯Ø±Ø¨Ø§Ø±Ù‡ Ø¯ÙˆØ±Ù‡â€ŒÙ‡Ø§ÛŒ Ø²Ø¨Ø§Ù†ØŒ Ø¢Ø²Ù…ÙˆÙ†â€ŒÙ‡Ø§ÛŒ TOEFL iBT Ùˆ GREØŒ Ø«Ø¨Øªâ€ŒÙ†Ø§Ù…ØŒ ÙˆÙˆÚ†Ø± Ùˆ Ø¢Ø²Ù…ÙˆÙ†â€ŒÙ‡Ø§ÛŒ Ø¢Ø²Ù…Ø§ÛŒØ´ÛŒ.",
  },
  "/general": {
    page: "general",
    title: "Ø¯ÙˆØ±Ù‡â€ŒÙ‡Ø§ÛŒ Ø²Ø¨Ø§Ù† Ø¹Ù…ÙˆÙ…ÛŒ Ùˆ Ø¢Ú©Ø§Ø¯Ù…ÛŒÚ© | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ø¯ÙˆØ±Ù‡â€ŒÙ‡Ø§ÛŒ Ø²Ø¨Ø§Ù† Ø¹Ù…ÙˆÙ…ÛŒ Ùˆ Ø¢Ú©Ø§Ø¯Ù…ÛŒÚ© Ø¨Ø±Ø§ÛŒ ØªÙ‚ÙˆÛŒØª Ù¾Ø§ÛŒÙ‡ Ø²Ø¨Ø§Ù† Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒØŒ Ù…Ú©Ø§Ù„Ù…Ù‡ØŒ Ø®ÙˆØ§Ù†Ø¯Ù†ØŒ Ù†ÙˆØ´ØªÙ† Ùˆ Ø¢Ù…Ø§Ø¯Ú¯ÛŒ Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ Ø¨ÛŒÙ†â€ŒØ§Ù„Ù…Ù„Ù„ÛŒ.",
  },
  "/specialized": {
    page: "specialized",
    title: "Ø¯ÙˆØ±Ù‡â€ŒÙ‡Ø§ÛŒ ØªØ®ØµØµÛŒ TOEFLØŒ IELTS Ùˆ GRE | Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ø¯ÙˆØ±Ù‡â€ŒÙ‡Ø§ÛŒ ØªØ®ØµØµÛŒ Ø¨ÛŒÙ†â€ŒØ§Ù„Ù…Ù„Ù„ÛŒ Ø¨Ø±Ø§ÛŒ Ø¢Ù…Ø§Ø¯Ú¯ÛŒ Ø¢Ø²Ù…ÙˆÙ†â€ŒÙ‡Ø§ÛŒ TOEFL iBTØŒ IELTS Academic Ùˆ General Ùˆ GRE General.",
  },
  "/conversation": {
    page: "communication",
    title: "Ø¯ÙˆØ±Ù‡ Ù…Ú©Ø§Ù„Ù…Ù‡ Ùˆ Ù…Ù‡Ø§Ø±Øªâ€ŒÙ‡Ø§ÛŒ Ø§Ø±ØªØ¨Ø§Ø·ÛŒ | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ú©Ù„Ø§Ø³â€ŒÙ‡Ø§ÛŒ Ù…Ú©Ø§Ù„Ù…Ù‡ Ùˆ Ù…Ù‡Ø§Ø±Øªâ€ŒÙ‡Ø§ÛŒ Ø§Ø±ØªØ¨Ø§Ø·ÛŒ Ø¨Ø±Ø§ÛŒ ØªÙ‚ÙˆÛŒØª fluencyØŒ Ø§Ø¹ØªÙ…Ø§Ø¯Ø¨Ù‡â€ŒÙ†ÙØ³ Ùˆ Ú©Ø§Ø±Ø¨Ø±Ø¯ Ø²Ø¨Ø§Ù† Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒ Ø¯Ø± Ù…ÙˆÙ‚Ø¹ÛŒØªâ€ŒÙ‡Ø§ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ.",
  },
  "/communication": {
    page: "communication",
    title: "Ø¯ÙˆØ±Ù‡ Ù…Ú©Ø§Ù„Ù…Ù‡ Ùˆ Ù…Ù‡Ø§Ø±Øªâ€ŒÙ‡Ø§ÛŒ Ø§Ø±ØªØ¨Ø§Ø·ÛŒ | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ú©Ù„Ø§Ø³â€ŒÙ‡Ø§ÛŒ Ù…Ú©Ø§Ù„Ù…Ù‡ Ùˆ Ù…Ù‡Ø§Ø±Øªâ€ŒÙ‡Ø§ÛŒ Ø§Ø±ØªØ¨Ø§Ø·ÛŒ Ø¨Ø±Ø§ÛŒ ØªÙ‚ÙˆÛŒØª fluencyØŒ Ø§Ø¹ØªÙ…Ø§Ø¯Ø¨Ù‡â€ŒÙ†ÙØ³ Ùˆ Ú©Ø§Ø±Ø¨Ø±Ø¯ Ø²Ø¨Ø§Ù† Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒ Ø¯Ø± Ù…ÙˆÙ‚Ø¹ÛŒØªâ€ŒÙ‡Ø§ÛŒ ÙˆØ§Ù‚Ø¹ÛŒ.",
  },
  "/newsletter": {
    page: "newsletter",
    title: "Ø®Ø¨Ø±Ù†Ø§Ù…Ù‡ Ø²Ø¨Ø§Ù† Ùˆ Ø¢Ø²Ù…ÙˆÙ†â€ŒÙ‡Ø§ÛŒ Ø¨ÛŒÙ†â€ŒØ§Ù„Ù…Ù„Ù„ÛŒ | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ø¢Ø®Ø±ÛŒÙ† Ù…Ù‚Ø§Ù„Ù‡â€ŒÙ‡Ø§ØŒ Ø±Ø§Ù‡Ù†Ù…Ø§Ù‡Ø§ Ùˆ Ø®Ø¨Ø±Ù‡Ø§ÛŒ Ø¢Ù…ÙˆØ²Ø´ÛŒ Ø¯Ø±Ø¨Ø§Ø±Ù‡ TOEFL iBTØŒ GREØŒ Ø¢Ø²Ù…ÙˆÙ†â€ŒÙ‡Ø§ÛŒ Ø¢Ø²Ù…Ø§ÛŒØ´ÛŒ Ùˆ Ù…Ø³ÛŒØ± Ø¢Ù…Ø§Ø¯Ú¯ÛŒ Ø²Ø¨Ø§Ù†.",
  },
  "/gallery": {
    page: "gallery",
    title: "Ú¯Ø§Ù„Ø±ÛŒ ØªØµØ§ÙˆÛŒØ± Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù† | ÙØ¶Ø§ÛŒ Ø¢Ù…ÙˆØ²Ø´ Ùˆ Ø¢Ø²Ù…ÙˆÙ†",
    description: "ØªØµØ§ÙˆÛŒØ± Ù…Ø­ÛŒØ· Ø¢Ù…ÙˆØ²Ø´ÛŒØŒ ØªØ¬Ù‡ÛŒØ²Ø§Øª Ùˆ Ù…Ø­Ù„ Ø¨Ø±Ú¯Ø²Ø§Ø±ÛŒ Ø¢Ø²Ù…ÙˆÙ†â€ŒÙ‡Ø§ÛŒ Ø±Ø³Ù…ÛŒ TOEFL iBT Ùˆ GRE General Ø¯Ø± Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†.",
  },
  "/library": {
    page: "library",
    title: "Ú©ØªØ§Ø¨Ø®Ø§Ù†Ù‡ Ø±Ø§ÛŒÚ¯Ø§Ù† Ø²Ø¨Ø§Ù† Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒ | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ù…Ù†Ø§Ø¨Ø¹ Ø±Ø§ÛŒÚ¯Ø§Ù† Ø²Ø¨Ø§Ù† Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒØŒ Ú©ØªØ§Ø¨ØŒ Ø¬Ø²ÙˆÙ‡ Ùˆ ÙØ§ÛŒÙ„ Ø¢Ù…ÙˆØ²Ø´ÛŒ Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒâ€ŒØ´Ø¯Ù‡ Ø¨Ø± Ø§Ø³Ø§Ø³ Ø³Ø·Ø­ Ùˆ Ø¢Ø²Ù…ÙˆÙ†.",
  },
  "/learning-articles": {
    page: "learning-articles",
    title: "Ù…Ù‚Ø§Ù„Ù‡â€ŒÙ‡Ø§ÛŒ Ø¢Ù…ÙˆØ²Ø´ÛŒ Ø²Ø¨Ø§Ù† Ùˆ Ø¢Ø²Ù…ÙˆÙ† | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "Ù…Ù‚Ø§Ù„Ù‡â€ŒÙ‡Ø§ÛŒ Ø¢Ù…ÙˆØ²Ø´ÛŒ Ø¨Ø±Ø§ÛŒ Ø²Ø¨Ø§Ù† Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒØŒ TOEFLØŒ GRE Ùˆ Ø¢Ù…Ø§Ø¯Ú¯ÛŒ Ø¢Ø²Ù…ÙˆÙ†â€ŒÙ‡Ø§ÛŒ Ø¨ÛŒÙ†â€ŒØ§Ù„Ù…Ù„Ù„ÛŒ.",
  },
  "/learning-videos": {
    page: "learning-videos",
    title: "ÙˆÛŒØ¯ÛŒÙˆÙ‡Ø§ÛŒ Ø¢Ù…ÙˆØ²Ø´ÛŒ Ø²Ø¨Ø§Ù† Ùˆ Ø¢Ø²Ù…ÙˆÙ† | Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†",
    description: "ÙˆÛŒØ¯ÛŒÙˆÙ‡Ø§ Ùˆ ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ Ú†Ù†Ø¯Ø±Ø³Ø§Ù†Ù‡â€ŒØ§ÛŒ Ø¢Ù…ÙˆØ²Ø´ÛŒ Ø¨Ø±Ø§ÛŒ Ø²Ø¨Ø§Ù† Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒØŒ TOEFLØŒ GRE Ùˆ Ù…Ù‡Ø§Ø±Øªâ€ŒÙ‡Ø§ÛŒ Ø¢Ø²Ù…ÙˆÙ†.",
  },
};

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: Number(process.env.DB_POOL_SIZE || 10),
});

function postgresPlaceholders(sql) {
  let index = 0;
  return String(sql).replace(/\?/g, () => `$${index += 1}`);
}

const pool = {
  async query(sql, params = []) {
    const result = await pgPool.query(postgresPlaceholders(sql), params);
    return [result.rows, result];
  },
  async execute(sql, params = []) {
    return this.query(sql, params);
  },
};

async function dbClient() {
  const client = await pgPool.connect();
  return {
    async query(sql, params = []) {
      return client.query(sql, params);
    },
    release() {
      client.release();
    },
  };
}

const privateCollections = new Set([
  "exam_registrations",
  "exam_waitlist",
  "exam_results",
  "course_registrations",
  "placement_registrations",
  "consultation_requests",
  "exam_submissions",
  "registration_assignments",
  "messages",
  "notifications",
  "notification_delivery_queue",
  "testimonials",
  "password_reset_requests",
  "audit_logs",
  "discount_campaigns",
  "discount_codes",
]);
const studentCreateCollections = new Set([
  "exam_registrations",
  "exam_waitlist",
  "course_registrations",
  "placement_registrations",
  "consultation_requests",
  "exam_submissions",
  "messages",
  "testimonials",
  "password_reset_requests",
]);
const publicReadCollections = new Set([
  "toefl_dates",
  "mock_dates",
  "gre_dates",
  "internal_exams",
  "consultation_slots",
  "settings",
  "articles",
  "site_content",
  "popups",
  "resource_categories",
  "learning_resources",
  "gallery_categories",
  "gallery_images",
]);

const collectionPermissions = {
  exam_registrations: "registrations",
  exam_waitlist: "registrations",
  exam_results: "results",
  course_registrations: "registrations",
  placement_registrations: "registrations",
  consultation_requests: "consultations",
  consultation_slots: "consultations",
  exam_submissions: "exams",
  internal_exams: "exams",
  registration_assignments: "assignments",
  messages: "messages",
  notifications: "notifications",
  notification_delivery_queue: "notifications",
  password_reset_requests: "users",
  audit_logs: "reports",
  toefl_dates: "dates",
  mock_dates: "dates",
  gre_dates: "dates",
  settings: "settings",
  articles: "articles",
  site_content: "content",
  popups: "popups",
  resource_categories: "resources",
  learning_resources: "resources",
  gallery_categories: "gallery",
  gallery_images: "gallery",
  discount_campaigns: "coupons",
  discount_codes: "coupons",
  testimonials: "content",
};

async function writeAudit(user, action, collection, documentId, details = {}) {
  if (!user || !["admin", "staff"].includes(String(user.role || "").toLowerCase())) return;
  const auditId = id("audit");
  await saveDocument("audit_logs", auditId, {
    actorId: user.uid,
    actorName: cleanText(user.name || user.email, 120),
    actorRole: user.role,
    action: cleanText(action, 80),
    collection: cleanText(collection, 80),
    documentId: cleanText(documentId, 120),
    details,
    createdAt: new Date().toISOString(),
  });
}

function id(prefix = "id") {
  const safe = String(prefix).replace(/[^a-zA-Z0-9_-]/g, "") || "id";
  return `${safe}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
}

function makePassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto.pbkdf2Sync(String(password), salt, 150000, 32, "sha256").toString("hex");
  return { salt, passwordHash };
}

function verifyPassword(user, password) {
  if (!user || !user.salt || !user.password_hash) return false;
  const actual = Buffer.from(user.password_hash, "hex");
  const expected = crypto.pbkdf2Sync(String(password), user.salt, 150000, 32, "sha256");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function parseJson(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function publicUser(row) {
  if (!row) return null;
  return {
    ...parseJson(row.data),
    uid: row.uid,
    email: row.email,
    role: row.role,
  };
}

async function initializeDatabase() {
  if (!adminPassword || adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD must be set to a strong password");
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_users (
      uid VARCHAR(80) PRIMARY KEY,
      email VARCHAR(190) NOT NULL UNIQUE,
      salt VARCHAR(64) NOT NULL,
      password_hash VARCHAR(128) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'student',
      data JSONB NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_documents (
      collection_name VARCHAR(80) NOT NULL,
      document_id VARCHAR(100) NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (collection_name, document_id)
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_collection_created
    ON app_documents (collection_name, created_at)
  `);

  const [rows] = await pool.execute("SELECT uid, data FROM app_users WHERE email = ? LIMIT 1", [adminEmail]);
  if (!rows.length) {
    const uid = id("admin");
    const secret = makePassword(adminPassword);
    const profile = {
      uid,
      name: adminName,
      email: adminEmail,
      role: "admin",
      createdAt: new Date().toISOString(),
      grades: {},
    };
    await pool.execute(
      "INSERT INTO app_users (uid, email, salt, password_hash, role, data) VALUES (?, ?, ?, ?, 'admin', ?)",
      [uid, adminEmail, secret.salt, secret.passwordHash, JSON.stringify(profile)]
    );
  } else {
    const profile = parseJson(rows[0].data);
    profile.name = adminName;
    profile.role = "admin";
    await pool.execute(
      "UPDATE app_users SET role = 'admin', data = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?",
      [JSON.stringify(profile), adminEmail]
    );
  }
  if (rows.length && process.env.RESET_ADMIN_PASSWORD === "true") {
    const secret = makePassword(adminPassword);
    await pool.execute(
      "UPDATE app_users SET salt = ?, password_hash = ? WHERE email = ?",
      [secret.salt, secret.passwordHash, adminEmail]
    );
    console.log(`Admin password reset for ${adminEmail}. Set RESET_ADMIN_PASSWORD=false and restart.`);
  }
}

function body(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 24 * 1024 * 1024) {
        reject(Object.assign(new Error("Ø­Ø¬Ù… Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø¨ÛŒØ´ Ø§Ø² Ø­Ø¯ Ù…Ø¬Ø§Ø² Ø§Ø³Øª"), { status: 413 }));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(Object.assign(new Error("ÙØ±Ù…Øª Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³Øª"), { status: 400 }));
      }
    });
    req.on("error", reject);
  });
}

function send(res, status, data, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...securityHeaders(),
    ...headers,
  });
  res.end(JSON.stringify(data));
}

function fail(res, status, message) {
  send(res, status, { message });
}

function cookie(req, name) {
  const source = req.headers.cookie || "";
  const found = source.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : "";
}

function currentSession(req) {
  const sid = cookie(req, "as_session");
  const session = sid ? sessions.get(sid) : null;
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(sid);
    return null;
  }
  return session;
}

function ensureCsrfToken(session) {
  if (!session) return "";
  if (!session.csrfToken) session.csrfToken = crypto.randomBytes(32).toString("hex");
  return session.csrfToken;
}

function currentUser(req) {
  const session = currentSession(req);
  return session ? session.user : null;
}

function requestIsSecure(req) {
  const mode = String(process.env.COOKIE_SECURE || "auto").toLowerCase();
  if (mode === "true") return true;
  if (mode === "false") return false;
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  return forwardedProto === "https" || Boolean(req.socket && req.socket.encrypted);
}

function sessionCookie(req, sid) {
  const secure = requestIsSecure(req) ? "; Secure" : "";
  return `as_session=${sid}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${secure}`;
}

function securityHeaders() {
  const widgetSources = [...chatWidgetOrigins].join(" ");
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "0",
    "X-DNS-Prefetch-Control": "off",
    "X-Download-Options": "noopen",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), geolocation=(), microphone=(self), payment=(), usb=(), interest-cohort=()",
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Origin-Agent-Cluster": "?1",
    "X-Permitted-Cross-Domain-Policies": "none",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      `script-src 'self' 'unsafe-inline'${widgetSources ? ` ${widgetSources}` : ""}`,
      `script-src-elem 'self' 'unsafe-inline'${widgetSources ? ` ${widgetSources}` : ""}`,
      "script-src-attr 'unsafe-inline'",
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com${widgetSources ? ` ${widgetSources}` : ""}`,
      `font-src 'self' data: https://fonts.gstatic.com${widgetSources ? ` ${widgetSources}` : ""}`,
      "img-src 'self' data: blob: https:",
      "media-src 'self' data: blob: https:",
      `connect-src 'self'${widgetSources ? ` ${widgetSources} ${widgetSources.replaceAll("https://", "wss://")}` : ""}`,
      `frame-src 'self'${widgetSources ? ` ${widgetSources}` : ""}`,
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  };
}

function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "")
    .split(",")[0]
    .trim();
}

function loginRateLimited(req) {
  const key = clientIp(req);
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record || record.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW });
    return false;
  }
  record.count += 1;
  return record.count > LOGIN_LIMIT;
}

function clearLoginAttempts(req) {
  loginAttempts.delete(clientIp(req));
}

function apiRateLimited(req) {
  if (req.url === "/api/health") return false;
  const key = `${clientIp(req)}:${String(req.url || "").split("?")[0]}`;
  const now = Date.now();
  const record = apiAttempts.get(key);
  if (!record || record.resetAt <= now) {
    apiAttempts.set(key, { count: 1, resetAt: now + API_WINDOW });
    return false;
  }
  record.count += 1;
  return record.count > API_LIMIT;
}

function validateRequestOrigin(req) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return;
  if (String(req.headers["sec-fetch-site"] || "").toLowerCase() === "cross-site") {
    throw Object.assign(new Error("Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¨ÛŒÙ†â€ŒØ³Ø§ÛŒØªÛŒ Ù…Ø¬Ø§Ø² Ù†ÛŒØ³Øª"), { status: 403 });
  }
  const origin = req.headers.origin;
  if (!origin) return;
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    throw Object.assign(new Error("Ù…Ø¨Ø¯Ø£ Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³Øª"), { status: 403 });
  }
  const requestHost = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  if (!requestHost || originHost !== requestHost) {
    throw Object.assign(new Error("Ù…Ø¨Ø¯Ø£ Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ù…Ø¬Ø§Ø² Ù†ÛŒØ³Øª"), { status: 403 });
  }
}

function cleanText(value, maxLength = 500) {
  return String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, maxLength);
}

function parseChatWidgetCode(value) {
  const code = String(value || "").trim();
  if (!code) return { code: "", origins: [] };
  if (code.length > 30000) {
    throw Object.assign(new Error("Ú©Ø¯ Ú†Øª Ø¢Ù†Ù„Ø§ÛŒÙ† Ø¨ÛŒØ´ Ø§Ø² Ø­Ø¯ Ù…Ø¬Ø§Ø² Ø·ÙˆÙ„Ø§Ù†ÛŒ Ø§Ø³Øª"), { status: 413 });
  }
  const scripts = [...code.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  if (!scripts.length) {
    throw Object.assign(new Error("Ú©Ø¯ Ø¨Ø§ÛŒØ¯ Ø´Ø§Ù…Ù„ ØªÚ¯ script Ø¨Ø§Ø´Ø¯"), { status: 400 });
  }
  const remaining = code
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();
  if (remaining) {
    throw Object.assign(new Error("ÙÙ‚Ø· Ú©Ø¯Ù‡Ø§ÛŒ script Ø³Ø±ÙˆÛŒØ³ Ú†Øª Ù‚Ø§Ø¨Ù„ Ø«Ø¨Øª Ù‡Ø³ØªÙ†Ø¯"), { status: 400 });
  }
  const origins = new Set();
  function addOrigin(urlValue) {
    let parsed;
    try {
      parsed = new URL(urlValue);
    } catch {
      return;
    }
    if (parsed.protocol !== "https:") return;
    origins.add(parsed.origin);
    const labels = parsed.hostname.split(".");
    if (labels.length > 2) origins.add(`https://*.${labels.slice(-2).join(".")}`);
  }
  scripts.forEach((match) => {
    const srcMatch = match[1].match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    if (srcMatch) {
      let parsed;
      try {
        parsed = new URL(srcMatch[1]);
      } catch {
        throw Object.assign(new Error("Ø¢Ø¯Ø±Ø³ Ø§Ø³Ú©Ø±ÛŒÙ¾Øª Ú†Øª Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³Øª"), { status: 400 });
      }
      if (parsed.protocol !== "https:") {
        throw Object.assign(new Error("Ø§Ø³Ú©Ø±ÛŒÙ¾Øª Ú†Øª Ø¨Ø§ÛŒØ¯ Ø§Ø² Ø¢Ø¯Ø±Ø³ Ø§Ù…Ù† HTTPS Ø¨Ø§Ø±Ú¯Ø°Ø§Ø±ÛŒ Ø´ÙˆØ¯"), { status: 400 });
      }
      addOrigin(srcMatch[1]);
    }
    for (const urlMatch of match[2].matchAll(/https:\/\/[a-z0-9.-]+(?::\d+)?(?:\/[^\s"'`<>]*)?/gi)) {
      addOrigin(urlMatch[0]);
    }
  });
  return { code, origins: [...origins] };
}

function applyChatWidgetOrigins(origins) {
  chatWidgetOrigins = new Set(
    (Array.isArray(origins) ? origins : []).filter((origin) => /^https:\/\/(?:\*\.)?[a-z0-9.-]+(?::\d+)?$/i.test(origin))
  );
}

async function loadChatWidgetConfiguration() {
  const config = await getDocument("settings", "chat_widget");
  applyChatWidgetOrigins(config && config.active ? config.origins : []);
}

function normalizePopup(input, existing = {}) {
  const allowedPages = new Set([
    "all", "home", "newsletter", "toefl", "gre", "mock-toefl", "mock-gre",
    "toefl-dates", "gre-dates", "mock-dates", "general", "specialized",
    "communication", "course-registration", "exam-registration", "consultation",
    "about", "contact",
  ]);
  const data = { ...existing, ...input };
  const title = cleanText(data.title, 120);
  const popupBody = cleanText(data.body, 1200);
  if (!title || !popupBody) {
    throw Object.assign(new Error("Ø¹Ù†ÙˆØ§Ù† Ùˆ Ù…ØªÙ† Ù¾Ø§Ù¾â€ŒØ¢Ù¾ Ø§Ù„Ø²Ø§Ù…ÛŒ Ø§Ø³Øª"), { status: 400 });
  }
  const link = cleanText(data.link, 500);
  if (link && !/^https?:\/\/[^\s]+$/i.test(link) && !/^#[a-z0-9-]+$/i.test(link)) {
    throw Object.assign(new Error("Ù„ÛŒÙ†Ú© Ù¾Ø§Ù¾â€ŒØ¢Ù¾ Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³Øª"), { status: 400 });
  }
  const image = String(data.image || "");
  if (image && !/^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=\s]+$/i.test(image)) {
    throw Object.assign(new Error("ÙØ±Ù…Øª ØªØµÙˆÛŒØ± Ù¾Ø§Ù¾â€ŒØ¢Ù¾ Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³Øª"), { status: 400 });
  }
  if (image.length > 7 * 1024 * 1024) {
    throw Object.assign(new Error("Ø­Ø¬Ù… ØªØµÙˆÛŒØ± Ù¾Ø§Ù¾â€ŒØ¢Ù¾ Ø¨ÛŒØ´ Ø§Ø² Ø­Ø¯ Ù…Ø¬Ø§Ø² Ø§Ø³Øª"), { status: 413 });
  }
  const startsAt = data.startsAt && !Number.isNaN(new Date(data.startsAt).getTime()) ? new Date(data.startsAt).toISOString() : "";
  const endsAt = data.endsAt && !Number.isNaN(new Date(data.endsAt).getTime()) ? new Date(data.endsAt).toISOString() : "";
  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
    throw Object.assign(new Error("Ø²Ù…Ø§Ù† Ù¾Ø§ÛŒØ§Ù† Ø¨Ø§ÛŒØ¯ Ø¨Ø¹Ø¯ Ø§Ø² Ø²Ù…Ø§Ù† Ø´Ø±ÙˆØ¹ Ø¨Ø§Ø´Ø¯"), { status: 400 });
  }
  return {
    title,
    body: popupBody,
    targetPage: allowedPages.has(data.targetPage) ? data.targetPage : "home",
    frequency: data.frequency === "visit" ? "visit" : "session",
    startsAt,
    endsAt,
    image,
    buttonText: cleanText(data.buttonText, 50),
    link,
    active: data.active === true,
    createdAt: cleanText(data.createdAt, 40) || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function currentExamDateKey() {
  const values = {};
  new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date()).forEach((part) => {
    if (part.type !== "literal") values[part.type] = part.value;
  });
  return `${values.year}-${values.month}-${values.day}`;
}

function requireUser(req) {
  const user = currentUser(req);
  if (!user) throw Object.assign(new Error("Ø§Ø¨ØªØ¯Ø§ ÙˆØ§Ø±Ø¯ Ø­Ø³Ø§Ø¨ Ú©Ø§Ø±Ø¨Ø±ÛŒ Ø´ÙˆÛŒØ¯"), { status: 401 });
  return user;
}

function requireAdmin(req) {
  const user = requireUser(req);
  if (String(user.role).toLowerCase() !== "admin") {
    throw Object.assign(new Error("Ø§ÛŒÙ† Ø¨Ø®Ø´ ÙÙ‚Ø· Ø¨Ø±Ø§ÛŒ Ù…Ø¯ÛŒØ± Ù‚Ø§Ø¨Ù„ Ø¯Ø³ØªØ±Ø³ÛŒ Ø§Ø³Øª"), { status: 403 });
  }
  return user;
}

function isSiteManager(user) {
  return user && String(user.role).toLowerCase() === "admin";
}

function hasPermission(user, permission) {
  if (isSiteManager(user)) return true;
  if (!user || String(user.role).toLowerCase() !== "staff") return false;
  return Array.isArray(user.permissions) && user.permissions.includes(permission);
}

function requirePermission(req, permission) {
  const user = requireUser(req);
  if (!hasPermission(user, permission)) {
    throw Object.assign(new Error("Ø¨Ø±Ø§ÛŒ Ø§ÛŒÙ† Ø¨Ø®Ø´ Ø¯Ø³ØªØ±Ø³ÛŒ Ù†Ø¯Ø§Ø±ÛŒØ¯"), { status: 403 });
  }
  return user;
}

function canManageCollection(user, collection) {
  if (collection === "exam_registrations" && hasPermission(user, "attendance")) return true;
  return isSiteManager(user) || hasPermission(user, collectionPermissions[collection]);
}

function applyDottedUpdate(target, update) {
  Object.keys(update || {}).forEach((key) => {
    const parts = key.split(".");
    let ref = target;
    for (let index = 0; index < parts.length - 1; index += 1) {
      if (!ref[parts[index]] || typeof ref[parts[index]] !== "object") ref[parts[index]] = {};
      ref = ref[parts[index]];
    }
    ref[parts[parts.length - 1]] = update[key];
  });
}

async function getDocument(collection, documentId) {
  if (collection === "users") {
    const [rows] = await pool.execute(
      "SELECT uid, email, role, data FROM app_users WHERE uid = ? LIMIT 1",
      [documentId]
    );
    return publicUser(rows[0]);
  }
  const [rows] = await pool.execute(
    "SELECT data FROM app_documents WHERE collection_name = ? AND document_id = ? LIMIT 1",
    [collection, documentId]
  );
  return rows.length ? parseJson(rows[0].data) : null;
}

async function saveDocument(collection, documentId, data) {
  await pool.execute(
    `INSERT INTO app_documents (collection_name, document_id, data)
     VALUES (?, ?, ?)
     ON CONFLICT (collection_name, document_id)
     DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP`,
    [collection, documentId, JSON.stringify(data)]
  );
}

function serviceStatusLabel(status) {
  const map = {
    requested: "Ø«Ø¨Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øª",
    pending: "Ø«Ø¨Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øª",
    preparing: "Ø¯Ø± Ø­Ø§Ù„ Ø¢Ù…Ø§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ",
    processing: "Ø¯Ø± Ø­Ø§Ù„ Ø¢Ù…Ø§Ø¯Ù‡â€ŒØ³Ø§Ø²ÛŒ",
    confirmed: "ØªØ£ÛŒÛŒØ¯ Ø´Ø¯",
    completed: "Ø§Ù†Ø¬Ø§Ù… Ø´Ø¯",
    sent: "Ø§Ø±Ø³Ø§Ù„ Ø´Ø¯",
    cancelled: "Ù„ØºÙˆ Ø´Ø¯",
  };
  return map[String(status || "").toLowerCase()] || cleanText(status || "Ø«Ø¨Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øª", 80);
}

function serviceRequestTitle(collection, data) {
  if (collection === "exam_registrations") return data.examName || data.title || (data.type === "gre" ? "Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… GRE" : "Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… TOEFL");
  if (collection === "course_registrations") return data.category === "voucher" ? `${String(data.voucherType || "").toUpperCase()} Voucher` : data.courseName || "Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… Ø¯ÙˆØ±Ù‡";
  if (collection === "placement_registrations") return data.testName || "Ø¢Ø²Ù…ÙˆÙ† ØªØ¹ÛŒÛŒÙ† Ø³Ø·Ø­";
  if (collection === "consultation_requests") return data.topic || data.title || "Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ù…Ø´Ø§ÙˆØ±Ù‡";
  return data.title || data.examName || data.courseName || "Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø®Ø¯Ù…Ø§Øª";
}

function publicSettingsData(documentId, item) {
  if (!item) return item;
  const safe = { ...item };
  if (documentId === "signup") {
    delete safe.emailWebhookUrl;
    delete safe.smsWebhookUrl;
    delete safe.emailWebhookToken;
    delete safe.smsWebhookToken;
    delete safe.smsApiKey;
  }
  if (documentId === "payment") {
    if (safe.apiKey) safe.apiKeyConfigured = true;
    delete safe.apiKey;
  }
  return safe;
}

function deliveryChannels(settings) {
  const mode = String(settings.notificationChannel || "").toLowerCase();
  const email = mode === "email" || mode === "both" || (!mode && settings.emailEnabled);
  const sms = mode === "sms" || mode === "both" || (!mode && settings.smsEnabled);
  const smsWebhookUrl = cleanText(process.env.SMS_WEBHOOK_URL || settings.smsWebhookUrl || "", 600);
  return {
    email: email && settings.emailEnabled !== false,
    sms: sms && settings.smsEnabled === true && !!smsWebhookUrl,
  };
}

async function postDeliveryWebhook(url, payload, token) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Webhook failed: ${response.status}`);
}

async function queueExternalDelivery(type, recipient, payload, settings) {
  if (!recipient) return;
  const queueId = id("delivery");
  const webhookUrl = type === "email"
    ? cleanText(process.env.EMAIL_WEBHOOK_URL || settings.emailWebhookUrl || "", 600)
    : cleanText(process.env.SMS_WEBHOOK_URL || settings.smsWebhookUrl || "", 600);
  const token = type === "email"
    ? cleanText(process.env.EMAIL_WEBHOOK_TOKEN || settings.emailWebhookToken || "", 600)
    : cleanText(process.env.SMS_WEBHOOK_TOKEN || settings.smsWebhookToken || settings.smsApiKey || "", 600);
  if (type === "sms" && (settings.smsEnabled !== true || !webhookUrl)) return;
  const item = {
    type,
    recipient: cleanText(recipient, 190),
    subject: cleanText(payload.subject, 180),
    text: cleanText(payload.text, 2000),
    status: webhookUrl ? "queued" : "pending-configuration",
    provider: type === "sms" ? cleanText(settings.smsProvider, 120) : "email-webhook",
    createdAt: new Date().toISOString(),
  };
  await saveDocument("notification_delivery_queue", queueId, item);
  if (!webhookUrl) return;
  try {
    await postDeliveryWebhook(webhookUrl, {
      type,
      to: recipient,
      subject: payload.subject,
      text: payload.text,
      from: type === "email" ? settings.emailFrom : settings.smsSender,
      payload,
    }, token);
    item.status = "sent";
    item.sentAt = new Date().toISOString();
  } catch (error) {
    item.status = "failed";
    item.error = cleanText(error.message, 300);
  }
  await saveDocument("notification_delivery_queue", queueId, item);
}

function renderTemplate(settings, key, fallback, values = {}) {
  const templates = settings && typeof settings.notificationTemplates === "object" ? settings.notificationTemplates : {};
  const source = cleanText(templates[key] || fallback || "", 2000);
  return source.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, name) => {
    const value = values[name];
    return value === undefined || value === null ? "" : String(value);
  });
}

function adminSmsRecipients(settings) {
  return String(settings.smsAdminNumbers || "")
    .split(/\r?\n|,/)
    .map((item) => cleanText(item, 30).replace(/[^\d+]/g, ""))
    .filter(Boolean);
}

async function sendAutomaticSms(key, values, recipients, subject) {
  const settings = await getDocument("settings", "signup") || {};
  const channels = deliveryChannels(settings);
  if (!channels.sms) return;
  const text = renderTemplate(settings, key, values.defaultText || "", values);
  const list = Array.isArray(recipients) ? recipients : [recipients];
  await Promise.all(list.filter(Boolean).map((recipient) => queueExternalDelivery("sms", recipient, {
    subject: subject || "Allameh Sokhan Notification",
    text,
    key,
    values,
  }, settings)));
}

async function notifyProfileCreatedOrUpdated(profile, kind) {
  const settings = await getDocument("settings", "signup") || {};
  const admins = adminSmsRecipients(settings);
  const values = {
    name: profile.name || profile.email || "",
    email: profile.email || "",
    mobile: profile.mobile || "",
    defaultText: kind === "created" ? "New profile: {name} - {mobile} - {email}" : "Profile updated: {name} - {mobile}",
  };
  await sendAutomaticSms(kind === "created" ? "adminProfileCreated" : "adminProfileUpdated", values, admins, "Admin notification");
  if (profile.mobile) {
    await sendAutomaticSms(kind === "created" ? "studentProfileCreated" : "studentProfileUpdated", {
      ...values,
      defaultText: kind === "created" ? "Your Allameh Sokhan profile was created successfully." : "Your Allameh Sokhan profile was updated successfully.",
    }, profile.mobile, "Student notification");
  }
}

async function notifyMessageCreated(message) {
  if (!message || !message.text) return;
  const settings = await getDocument("settings", "signup") || {};
  if (message.senderRole === "student" && message.receiverId === "admin") {
    await sendAutomaticSms("adminStudentMessage", {
      name: message.senderName || "",
      text: message.text,
      defaultText: "New student message from {name}: {text}",
    }, adminSmsRecipients(settings), "New student message");
    return;
  }
  if (message.senderRole === "admin" && message.receiverId) {
    const user = await getDocument("users", message.receiverId);
    if (user && user.mobile) {
      await sendAutomaticSms("studentAdminReply", {
        name: user.name || user.email || "",
        text: message.text,
        defaultText: "You have a new reply from Allameh Sokhan.",
      }, user.mobile, "Admin reply");
    }
  }
}

async function notifyNewRegistration(data, service) {
  const settings = await getDocument("settings", "signup") || {};
  const values = {
    name: data.name || data.userName || "",
    email: data.email || "",
    mobile: data.mobile || "",
    service: service || data.examName || data.courseName || data.title || "",
    defaultText: "New request: {service} - {name} - {mobile}",
  };
  await sendAutomaticSms("adminRegistrationClick", values, adminSmsRecipients(settings), "New registration");
}

async function notifyServiceStatusChange(collection, documentId, data, actor, previous = {}) {
  const serviceCollections = new Set(["exam_registrations", "course_registrations", "placement_registrations", "consultation_requests"]);
  if (!serviceCollections.has(collection) || !data || !data.userId) return;
  const status = data.voucherStatus || data.status || "pending";
  const oldStatus = previous.voucherStatus || previous.status || "";
  if (oldStatus && oldStatus === status) return;
  const settings = await getDocument("settings", "signup") || {};
  const title = serviceRequestTitle(collection, data);
  const statusText = serviceStatusLabel(status);
  const body = `ÙˆØ¶Ø¹ÛŒØª Ø¯Ø±Ø®ÙˆØ§Ø³Øª Â«${title}Â» Ø¨Ù‡ Â«${statusText}Â» ØªØºÛŒÛŒØ± Ú©Ø±Ø¯.`;
  const notificationId = id("notification");
  await saveDocument("notifications", notificationId, {
    audience: "user",
    userId: cleanText(data.userId, 100),
    userName: cleanText(data.name || data.userName || data.email, 120),
    title: `Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ ÙˆØ¶Ø¹ÛŒØª ${title}`,
    body,
    kind: "service-status",
    collection,
    registrationId: cleanText(documentId, 120),
    status: cleanText(status, 80),
    createdAt: new Date().toISOString(),
    createdBy: actor ? actor.uid : "system",
  });
  const channels = deliveryChannels(settings);
  const payload = { subject: `Ø¨Ù‡â€ŒØ±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø´Ù…Ø§ Ø¯Ø± Ù…ÙˆØ³Ø³Ù‡ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†`, text: body, collection, documentId, status, title };
  if (channels.email) await queueExternalDelivery("email", data.email, payload, settings);
  if (channels.sms) await queueExternalDelivery("sms", data.mobile, payload, settings);
}

async function createExamRegistration(actor, input) {
  const type = String(input.type || "").toLowerCase();
  const isMock = type === "mock";
  if (!["toefl", "gre", "mock"].includes(type)) {
    throw Object.assign(new Error("Ù†ÙˆØ¹ Ø¢Ø²Ù…ÙˆÙ† Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³Øª"), { status: 400 });
  }
  const mockType = isMock && input.mockType === "gre" ? "gre" : isMock ? "toefl" : "";
  const dateCollection = isMock ? "mock_dates" : `${type}_dates`;
  const dateId = cleanText(input.dateId, 100);
  if (!dateId) throw Object.assign(new Error("ØªØ§Ø±ÛŒØ® Ø¢Ø²Ù…ÙˆÙ† Ø§Ù†ØªØ®Ø§Ø¨ Ù†Ø´Ø¯Ù‡ Ø§Ø³Øª"), { status: 400 });

  const name = cleanText(input.name, 120);
  const email = cleanText(input.email, 190).toLowerCase();
  const mobile = cleanText(input.mobile, 20).replace(/\D/g, "");
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^09\d{9}$/.test(mobile)) {
    throw Object.assign(new Error("Ù†Ø§Ù…ØŒ Ø§ÛŒÙ…ÛŒÙ„ Ùˆ Ø´Ù…Ø§Ø±Ù‡ Ù…ÙˆØ¨Ø§ÛŒÙ„ Ù…Ø¹ØªØ¨Ø± Ø§Ù„Ø²Ø§Ù…ÛŒ Ø§Ø³Øª"), { status: 400 });
  }

  const client = await dbClient();
  try {
    await client.query("BEGIN");
    const dateResult = await client.query(
      "SELECT data FROM app_documents WHERE collection_name = $1 AND document_id = $2 FOR UPDATE",
      [dateCollection, dateId]
    );
    if (!dateResult.rows.length) throw Object.assign(new Error("ØªØ§Ø±ÛŒØ® Ø§Ù†ØªØ®Ø§Ø¨â€ŒØ´Ø¯Ù‡ Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³Øª"), { status: 404 });
    const dateInfo = parseJson(dateResult.rows[0].data);
    const today = currentExamDateKey();
    if (!dateInfo.date || dateInfo.date < today) throw Object.assign(new Error("Ø§ÛŒÙ† ØªØ§Ø±ÛŒØ® Ø¯ÛŒÚ¯Ø± ÙØ¹Ø§Ù„ Ù†ÛŒØ³Øª"), { status: 409 });

    if (isMock) {
      const dateIsGre = /GRE/i.test(String(dateInfo.type || ""));
      if ((mockType === "gre") !== dateIsGre) throw Object.assign(new Error("Ù†ÙˆØ¹ ØªØ§Ø±ÛŒØ® Ø¢Ø²Ù…ÙˆÙ† Ø¨Ø§ ÙØ±Ù… Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… Ù‡Ù…Ø§Ù‡Ù†Ú¯ Ù†ÛŒØ³Øª"), { status: 400 });
      const capacity = Math.max(1, Number(dateInfo.capacity || 1));
      const registered = Math.max(0, Number(dateInfo.registered || 0));
      const manualRegistered = Math.max(0, Number(dateInfo.manualRegistered || 0));
      if (registered + manualRegistered >= capacity) throw Object.assign(new Error("Ø¸Ø±ÙÛŒØª Ø§ÛŒÙ† Ø¢Ø²Ù…ÙˆÙ† ØªÚ©Ù…ÛŒÙ„ Ø´Ø¯Ù‡ Ø§Ø³Øª"), { status: 409 });
    }

    const duplicate = await client.query(
      `SELECT document_id FROM app_documents
       WHERE collection_name = 'exam_registrations'
         AND data->>'userId' = $1 AND data->>'dateId' = $2
         AND COALESCE(data->>'status', '') <> 'cancelled'
       LIMIT 1`,
      [actor.uid, dateId]
    );
    if (duplicate.rows.length) throw Object.assign(new Error("Ø´Ù…Ø§ Ù‚Ø¨Ù„Ø§Ù‹ Ø¨Ø±Ø§ÛŒ Ø§ÛŒÙ† ØªØ§Ø±ÛŒØ® Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… Ú©Ø±Ø¯Ù‡â€ŒØ§ÛŒØ¯"), { status: 409 });

    const registrationId = id("exam_registrations");
    const examName = isMock
      ? (mockType === "gre" ? "Mock GRE General" : "Mock TOEFL iBT")
      : (type === "gre" ? "GRE General" : "TOEFL iBT");
    const inputCoupon = input.discountCoupon && typeof input.discountCoupon === "object"
      ? input.discountCoupon
      : null;
    const discountCoupon = inputCoupon ? {
      code: cleanText(inputCoupon.code, 40).toUpperCase(),
      campaignId: cleanText(inputCoupon.campaignId, 100),
      title: cleanText(inputCoupon.title, 120),
      target: cleanText(inputCoupon.target, 40),
      discountType: inputCoupon.discountType === "amount" ? "amount" : "percent",
      value: Math.max(0, Number(inputCoupon.value || 0)),
    } : null;
    const registration = {
      userId: actor.uid,
      type,
      mockType,
      category: isMock ? `mock-${mockType}` : "exam",
      dateId,
      examName,
      examDate: cleanText(dateInfo.date, 20),
      examTime: cleanText(dateInfo.time || "09:00", 10),
      name,
      email,
      mobile,
      currentScore: cleanText(input.currentScore, 120),
      note: cleanText(input.note, 2000),
      assignmentId: cleanText(input.assignmentId, 100),
      discountCoupon,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    await client.query(
      "INSERT INTO app_documents (collection_name, document_id, data) VALUES ('exam_registrations', $1, $2)",
      [registrationId, JSON.stringify(registration)]
    );

    if (isMock) {
      dateInfo.registered = Math.max(0, Number(dateInfo.registered || 0)) + 1;
      await client.query(
        "UPDATE app_documents SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE collection_name = $2 AND document_id = $3",
        [JSON.stringify(dateInfo), dateCollection, dateId]
      );
    }
    await client.query("COMMIT");
    await notifyNewRegistration(registration, examName);
    return { id: registrationId, registration };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function csrfExempt(req, url) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return true;
  return ["/api/auth/login", "/api/auth/register", "/api/auth/request-password-reset"].includes(url.pathname);
}

function validateCsrf(req, url) {
  if (csrfExempt(req, url)) return;
  const session = currentSession(req);
  if (!session) {
    throw Object.assign(new Error("Ø§Ø¨ØªØ¯Ø§ ÙˆØ§Ø±Ø¯ Ø­Ø³Ø§Ø¨ Ú©Ø§Ø±Ø¨Ø±ÛŒ Ø´ÙˆÛŒØ¯"), { status: 401 });
  }
  const expected = ensureCsrfToken(session);
  const received = String(req.headers["x-csrf-token"] || "");
  if (!received || received !== expected) {
    throw Object.assign(new Error("Ø§Ù…Ù†ÛŒØª Ø¯Ø±Ø®ÙˆØ§Ø³Øª ØªØ§ÛŒÛŒØ¯ Ù†Ø´Ø¯Ø› ØµÙØ­Ù‡ Ø±Ø§ Ø±ÙØ±Ø´ Ú©Ù†ÛŒØ¯"), { status: 403 });
  }
}

function ownsDocument(collection, item, user) {
  if (!item || !user) return false;
  if (collection === "messages") {
    return item.senderId === user.uid || item.receiverId === user.uid;
  }
  if (collection === "notifications") {
    return item.userId === user.uid || item.audience === "all";
  }
  return item.userId === user.uid;
}

async function handleAuth(req, res, pathname) {
  if (pathname === "/api/auth/login" && req.method === "POST") {
    if (loginRateLimited(req)) return fail(res, 429, "ØªØ¹Ø¯Ø§Ø¯ ØªÙ„Ø§Ø´â€ŒÙ‡Ø§ÛŒ ÙˆØ±ÙˆØ¯ Ø²ÛŒØ§Ø¯ Ø§Ø³ØªØ› Û±Ûµ Ø¯Ù‚ÛŒÙ‚Ù‡ Ø¯ÛŒÚ¯Ø± Ø¯ÙˆØ¨Ø§Ø±Ù‡ ØªÙ„Ø§Ø´ Ú©Ù†ÛŒØ¯");
    const data = await body(req);
    const email = String(data.email || "").trim().toLowerCase();
    const [rows] = await pool.execute(
      "SELECT uid, email, salt, password_hash, role, data FROM app_users WHERE email = ? LIMIT 1",
      [email]
    );
    const row = rows[0];
    if (!row || !verifyPassword(row, data.password || "")) return fail(res, 401, "Ø§ÛŒÙ…ÛŒÙ„ ÛŒØ§ Ø±Ù…Ø² Ø¹Ø¨ÙˆØ± Ø§Ø´ØªØ¨Ø§Ù‡ Ø§Ø³Øª");
    const user = publicUser(row);
    if (user.active === false) return fail(res, 403, "Ø§ÛŒÙ† Ø­Ø³Ø§Ø¨ ØªÙˆØ³Ø· Ù…Ø¯ÛŒØ± Ø³Ø§ÛŒØª ØºÛŒØ±ÙØ¹Ø§Ù„ Ø´Ø¯Ù‡ Ø§Ø³Øª");
    const sid = crypto.randomBytes(32).toString("hex");
    const session = { user, expiresAt: Date.now() + SESSION_MAX_AGE };
    ensureCsrfToken(session);
    sessions.set(sid, session);
    clearLoginAttempts(req);
    return send(res, 200, { user, csrfToken: session.csrfToken }, {
      "Set-Cookie": sessionCookie(req, sid),
    });
  }

  if (pathname === "/api/auth/register" && req.method === "POST") {
    const data = await body(req);
    const email = String(data.email || "").trim().toLowerCase();
    const password = String(data.password || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(res, 400, "Ø§ÛŒÙ…ÛŒÙ„ Ù…Ø¹ØªØ¨Ø± ÙˆØ§Ø±Ø¯ Ú©Ù†ÛŒØ¯");
    if (password.length < 8) return fail(res, 400, "Ø±Ù…Ø² Ø¹Ø¨ÙˆØ± Ø¨Ø§ÛŒØ¯ Ø­Ø¯Ø§Ù‚Ù„ Û¸ Ú©Ø§Ø±Ø§Ú©ØªØ± Ø¨Ø§Ø´Ø¯");
    const [existing] = await pool.execute("SELECT uid FROM app_users WHERE email = ? LIMIT 1", [email]);
    if (existing.length) return fail(res, 409, "Ø§ÛŒÙ† Ø§ÛŒÙ…ÛŒÙ„ Ù‚Ø¨Ù„Ø§Ù‹ Ø«Ø¨Øª Ø´Ø¯Ù‡ Ø§Ø³Øª");

    const uid = id("user");
    const secret = makePassword(password);
    const user = {
      uid,
      name: email.split("@")[0],
      email,
      role: "student",
      createdAt: new Date().toISOString(),
      grades: {},
    };
    await pool.execute(
      "INSERT INTO app_users (uid, email, salt, password_hash, role, data) VALUES (?, ?, ?, ?, 'student', ?)",
      [uid, email, secret.salt, secret.passwordHash, JSON.stringify(user)]
    );
    const sid = crypto.randomBytes(32).toString("hex");
    const session = { user, expiresAt: Date.now() + SESSION_MAX_AGE };
    ensureCsrfToken(session);
    sessions.set(sid, session);
    return send(res, 200, { user, csrfToken: session.csrfToken }, {
      "Set-Cookie": sessionCookie(req, sid),
    });
  }

  if (pathname === "/api/auth/request-password-reset" && req.method === "POST") {
    if (loginRateLimited(req)) return fail(res, 429, "ØªØ¹Ø¯Ø§Ø¯ Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ Ø²ÛŒØ§Ø¯ Ø§Ø³ØªØ› Ú©Ù…ÛŒ Ø¨Ø¹Ø¯ Ø¯ÙˆØ¨Ø§Ø±Ù‡ ØªÙ„Ø§Ø´ Ú©Ù†ÛŒØ¯");
    const data = await body(req);
    const email = String(data.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(res, 400, "Ø§ÛŒÙ…ÛŒÙ„ Ù…Ø¹ØªØ¨Ø± ÙˆØ§Ø±Ø¯ Ú©Ù†ÛŒØ¯");
    const [rows] = await pool.execute("SELECT uid, data FROM app_users WHERE email = ? LIMIT 1", [email]);
    if (rows.length) {
      const profile = parseJson(rows[0].data);
      const resetId = id("password_reset");
      await saveDocument("password_reset_requests", resetId, {
        userId: rows[0].uid,
        email,
        name: cleanText(profile.name, 120),
        status: "open",
        createdAt: new Date().toISOString(),
      });
    }
    return send(res, 200, { ok: true, message: "Ø§Ú¯Ø± Ø­Ø³Ø§Ø¨ÛŒ Ø¨Ø§ Ø§ÛŒÙ† Ø§ÛŒÙ…ÛŒÙ„ ÙˆØ¬ÙˆØ¯ Ø¯Ø§Ø´ØªÙ‡ Ø¨Ø§Ø´Ø¯ØŒ Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¨Ø±Ø§ÛŒ Ù…Ø¯ÛŒØ± Ø«Ø¨Øª Ù…ÛŒâ€ŒØ´ÙˆØ¯" });
  }

  if (pathname === "/api/auth/me" && req.method === "GET") {
    const session = currentSession(req);
    return send(res, 200, { user: session ? session.user : null, csrfToken: session ? ensureCsrfToken(session) : "" });
  }

  if (pathname === "/api/auth/csrf" && req.method === "GET") {
    const session = currentSession(req);
    if (!session) return fail(res, 401, "Ø§Ø¨ØªØ¯Ø§ ÙˆØ§Ø±Ø¯ Ø­Ø³Ø§Ø¨ Ú©Ø§Ø±Ø¨Ø±ÛŒ Ø´ÙˆÛŒØ¯");
    return send(res, 200, { csrfToken: ensureCsrfToken(session) });
  }

  if (pathname === "/api/auth/logout" && req.method === "POST") {
    const sid = cookie(req, "as_session");
    if (sid) sessions.delete(sid);
    return send(res, 200, { ok: true }, {
      "Set-Cookie": "as_session=; Max-Age=0; HttpOnly; SameSite=Strict; Path=/",
    });
  }

  if (pathname === "/api/auth/change-password" && req.method === "POST") {
    const session = requireUser(req);
    const data = await body(req);
    const [rows] = await pool.execute(
      "SELECT salt, password_hash FROM app_users WHERE uid = ? LIMIT 1",
      [session.uid]
    );
    if (!rows[0] || !verifyPassword(rows[0], data.currentPassword || "")) {
      return fail(res, 401, "Ø±Ù…Ø² Ø¹Ø¨ÙˆØ± ÙØ¹Ù„ÛŒ Ø§Ø´ØªØ¨Ø§Ù‡ Ø§Ø³Øª");
    }
    if (String(data.newPassword || "").length < 8) return fail(res, 400, "Ø±Ù…Ø² Ø¬Ø¯ÛŒØ¯ Ø¨Ø§ÛŒØ¯ Ø­Ø¯Ø§Ù‚Ù„ Û¸ Ú©Ø§Ø±Ø§Ú©ØªØ± Ø¨Ø§Ø´Ø¯");
    const secret = makePassword(data.newPassword);
    await pool.execute(
      "UPDATE app_users SET salt = ?, password_hash = ? WHERE uid = ?",
      [secret.salt, secret.passwordHash, session.uid]
    );
    return send(res, 200, { ok: true });
  }

  return false;
}

async function handleCollections(req, res, url) {
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] !== "api" || parts[1] !== "collections") return false;
  const collection = decodeURIComponent(parts[2] || "");
  const documentId = decodeURIComponent(parts[3] || "");
  if (!/^[a-z][a-z0-9_]{1,79}$/.test(collection)) return fail(res, 404, "Ù…Ø³ÛŒØ± Ù†Ø§Ù…Ø¹ØªØ¨Ø± Ø§Ø³Øª");

  const user = currentUser(req);
  const isAdmin = isSiteManager(user);
  const canManage = canManageCollection(user, collection);

  if (collection === "users") {
    if (!documentId && req.method === "GET") {
      const listActor = requireUser(req);
      if (!["users", "results", "notifications", "attendance", "reports"].some((permission) => hasPermission(listActor, permission))) {
        return fail(res, 403, "Ø¯Ø³ØªØ±Ø³ÛŒ Ù…Ø¬Ø§Ø² Ù†ÛŒØ³Øª");
      }
      const [rows] = await pool.query("SELECT uid, email, role, data FROM app_users ORDER BY created_at DESC");
      return send(res, 200, { items: Object.fromEntries(rows.map((row) => [row.uid, publicUser(row)])) });
    }
    if (!documentId) return fail(res, 400, "Ø´Ù†Ø§Ø³Ù‡ Ú©Ø§Ø±Ø¨Ø± Ù„Ø§Ø²Ù… Ø§Ø³Øª");
    const canReadUser = user && (user.uid === documentId || ["users", "results", "notifications", "attendance", "reports"].some((permission) => hasPermission(user, permission)));
    if (!canReadUser) return fail(res, 403, "Ø¯Ø³ØªØ±Ø³ÛŒ Ù…Ø¬Ø§Ø² Ù†ÛŒØ³Øª");

    if (req.method === "GET") {
      const item = await getDocument("users", documentId);
      return send(res, 200, { exists: !!item, item });
    }
    if (req.method === "PUT" || req.method === "PATCH") {
      let changes = await body(req);
      delete changes.uid;
      delete changes.email;
      delete changes.role;
      if (hasPermission(user, "results") && !hasPermission(user, "users") && user.uid !== documentId) {
        changes = Object.fromEntries(Object.entries(changes).filter(([key]) => key === "grades" || key.startsWith("grades.")));
      } else if (user.uid === documentId && !hasPermission(user, "users")) {
        const allowedProfileKeys = [
          "name", "mobile", "mobileVerified",
          "lastPage", "lastPageTitle", "lastActiveAt",
        ];
        changes = Object.fromEntries(Object.entries(changes).filter(([key]) => {
          return allowedProfileKeys.includes(key) || key.startsWith("examRegistrations.");
        }));
      }
      const [rows] = await pool.execute("SELECT data FROM app_users WHERE uid = ? LIMIT 1", [documentId]);
      if (!rows.length) return fail(res, 404, "Ú©Ø§Ø±Ø¨Ø± Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯");
      const profile = parseJson(rows[0].data);
      const previousProfile = JSON.parse(JSON.stringify(profile));
      if (req.method === "PUT") Object.assign(profile, changes);
      else applyDottedUpdate(profile, changes);
      await pool.execute(
        "UPDATE app_users SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE uid = ?",
        [JSON.stringify(profile), documentId]
      );
      const profileFieldsChanged = Object.keys(changes).some((key) => ["name", "mobile", "mobileVerified"].includes(key));
      if (profileFieldsChanged || req.method === "PUT") {
        await notifyProfileCreatedOrUpdated(profile, previousProfile.mobile ? "updated" : "created");
      }
      if (isSiteManager(user) || String(user.role || "").toLowerCase() === "staff") {
        await writeAudit(user, "update-user", "users", documentId, { fields: Object.keys(changes).slice(0, 20) });
      }
      return send(res, 200, { ok: true });
    }
    return fail(res, 405, "Ø¹Ù…Ù„ÛŒØ§Øª Ù…Ø¬Ø§Ø² Ù†ÛŒØ³Øª");
  }

  if (!documentId && req.method === "GET") {
    if (!publicReadCollections.has(collection)) requireUser(req);
    const [rows] = await pool.execute(
      "SELECT document_id, data FROM app_documents WHERE collection_name = ? ORDER BY created_at DESC",
      [collection]
    );
    let items = rows.map((row) => [row.document_id, parseJson(row.data)]);
    if (collection === "settings") {
      items = items.map(([key, item]) => [key, publicSettingsData(key, item)]);
    }
    if (collection === "popups" && !canManage) {
      const now = Date.now();
      items = items.filter(([, item]) => {
        const startsAt = item.startsAt ? new Date(item.startsAt).getTime() : 0;
        const endsAt = item.endsAt ? new Date(item.endsAt).getTime() : 0;
        return item.active === true
          && (!startsAt || startsAt <= now)
          && (!endsAt || endsAt >= now);
      });
    }
    const reportReadable = hasPermission(user, "reports") && ["exam_registrations", "exam_waitlist", "course_registrations", "placement_registrations", "audit_logs"].includes(collection);
    if (!canManage && !reportReadable && privateCollections.has(collection)) {
      items = items.filter(([, item]) => ownsDocument(collection, item, user));
    }
    if (!canManage && ["toefl_dates", "mock_dates", "gre_dates"].includes(collection)) {
      const today = currentExamDateKey();
      items = items.filter(([, item]) => item.date && item.date >= today);
    }
    const orderBy = url.searchParams.get("orderBy");
    if (orderBy) items.sort((a, b) => String(a[1][orderBy] || "").localeCompare(String(b[1][orderBy] || "")));
    return send(res, 200, { items: Object.fromEntries(items) });
  }

  if (!documentId && req.method === "POST") {
    const actor = requireUser(req);
    if (!canManage && !studentCreateCollections.has(collection)) return fail(res, 403, "Ø§ÛŒÙ† Ø¹Ù…Ù„ÛŒØ§Øª ÙÙ‚Ø· Ø¨Ø±Ø§ÛŒ Ù…Ø¯ÛŒØ± Ù…Ø¬Ø§Ø² Ø§Ø³Øª");
    let data = await body(req);
    if (collection === "popups") data = normalizePopup(data);
    if (collection === "exam_registrations" && !canManage) {
      const result = await createExamRegistration(actor, data);
      return send(res, 200, { id: result.id });
    }
    if (!canManage) {
      data.userId = actor.uid;
      if (collection === "testimonials") {
        data.userName = cleanText(actor.name || data.userName, 120);
        data.userEmail = cleanText(actor.email || data.userEmail, 190);
        data.displayName = cleanText(data.displayName || actor.name || "Ø¯Ø§Ù†Ø´Ø¬ÙˆÛŒ Ø¹Ù„Ø§Ù…Ù‡ Ø³Ø®Ù†", 120);
        data.title = cleanText(data.title || "ØªØ¬Ø±Ø¨Ù‡ Ø¯Ø§Ù†Ø´Ø¬Ùˆ", 160);
        data.body = cleanText(data.body || "", 1200);
        data.rating = Math.max(1, Math.min(5, Number(data.rating || 5)));
        data.status = "pending";
        data.targetPage = "home";
      }
      if (collection === "exam_waitlist") {
        data.dateId = cleanText(data.dateId, 100);
        data.examName = cleanText(data.examName, 120);
        data.examDate = cleanText(data.examDate, 20);
        data.examTime = cleanText(data.examTime, 10);
        data.name = cleanText(actor.name || data.name, 120);
        data.email = cleanText(actor.email, 190);
        data.mobile = cleanText(data.mobile || actor.mobile, 20);
        data.status = "waiting";
        data.createdAt = new Date().toISOString();
        const [duplicates] = await pool.execute(
          "SELECT document_id FROM app_documents WHERE collection_name = 'exam_waitlist' AND data->>'userId' = ? AND data->>'dateId' = ? AND COALESCE(data->>'status','waiting') = 'waiting' LIMIT 1",
          [actor.uid, data.dateId]
        );
        if (duplicates.length) return fail(res, 409, "Ø´Ù…Ø§ Ù‚Ø¨Ù„Ø§Ù‹ Ø¯Ø± ÙÙ‡Ø±Ø³Øª Ø§Ù†ØªØ¸Ø§Ø± Ø§ÛŒÙ† Ø¢Ø²Ù…ÙˆÙ† Ù‚Ø±Ø§Ø± Ú¯Ø±ÙØªÙ‡â€ŒØ§ÛŒØ¯");
      }
      if (collection === "password_reset_requests") {
        data.email = cleanText(actor.email, 190);
        data.name = cleanText(actor.name, 120);
        data.status = "open";
        data.createdAt = new Date().toISOString();
      }
      if (collection === "messages") {
        data.senderId = actor.uid;
        data.senderName = cleanText(actor.name || actor.email, 120);
        data.senderRole = "student";
        data.receiverId = "admin";
        data.receiverName = "Ù…Ø¯ÛŒØ±ÛŒØª Ù…ÙˆØ³Ø³Ù‡";
        data.conversationId = `admin_${actor.uid}`;
        data.text = cleanText(data.text, 4000);
        data.createdAt = new Date().toISOString();
        data.read = false;
      }
    }
    const newId = id(collection);
    await saveDocument(collection, newId, data);
    if (collection === "messages") await notifyMessageCreated(data);
    if (["exam_registrations", "course_registrations", "placement_registrations", "consultation_requests"].includes(collection)) {
      await notifyNewRegistration(data, data.examName || data.courseName || data.testName || data.topic || data.title || collection);
    }
    if (canManage) await writeAudit(actor, "create", collection, newId, { title: cleanText(data.title || data.examName || data.name, 120) });
    return send(res, 200, { id: newId });
  }

  if (!documentId) return fail(res, 400, "Ø´Ù†Ø§Ø³Ù‡ Ù„Ø§Ø²Ù… Ø§Ø³Øª");
  const existing = await getDocument(collection, documentId);

  if (req.method === "GET") {
    if (!publicReadCollections.has(collection)) {
      const actor = requireUser(req);
      if (!canManage && !ownsDocument(collection, existing, actor)) return fail(res, 403, "Ø¯Ø³ØªØ±Ø³ÛŒ Ù…Ø¬Ø§Ø² Ù†ÛŒØ³Øª");
    }
    if (collection === "popups" && !canManage && existing) {
      const now = Date.now();
      const startsAt = existing.startsAt ? new Date(existing.startsAt).getTime() : 0;
      const endsAt = existing.endsAt ? new Date(existing.endsAt).getTime() : 0;
      const visible = existing.active === true
        && (!startsAt || startsAt <= now)
        && (!endsAt || endsAt >= now);
      if (!visible) return send(res, 200, { exists: false, item: null });
    }
    return send(res, 200, { exists: !!existing, item: collection === "settings" ? publicSettingsData(documentId, existing) : existing });
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const actor = requireUser(req);
    let changes = await body(req);
    const previousData = existing ? JSON.parse(JSON.stringify(existing)) : {};
    if (!canManage) {
      if (collection === "consultation_slots" && existing && Object.hasOwn(changes, "booked")) {
        const booked = Number(existing.booked || 0);
        const capacity = Math.max(1, Number(existing.capacity || 1));
        if (booked >= capacity) return fail(res, 409, "Ø¸Ø±ÙÛŒØª Ø§ÛŒÙ† Ø²Ù…Ø§Ù† Ù…Ø´Ø§ÙˆØ±Ù‡ ØªÚ©Ù…ÛŒÙ„ Ø´Ø¯Ù‡ Ø§Ø³Øª");
        changes = { booked: booked + 1 };
      } else if (collection === "registration_assignments" && ownsDocument(collection, existing, actor)) {
        const allowed = new Set(["status", "viewedAt", "registeredAt"]);
        changes = Object.fromEntries(Object.entries(changes).filter(([key]) => allowed.has(key)));
      } else if (collection === "messages" && existing && existing.receiverId === actor.uid) {
        changes = {
          read: changes.read === true,
          readAt: changes.read === true ? new Date().toISOString() : existing.readAt || "",
        };
      } else if (
        collection === "messages"
        && existing
        && existing.receiverId === "admin"
        && ["admin", "staff"].includes(String(actor.role || "").toLowerCase())
        && hasPermission(actor, "messages")
      ) {
        changes = {
          read: changes.read === true,
          readAt: changes.read === true ? new Date().toISOString() : existing.readAt || "",
        };
      } else {
        return fail(res, 403, "Ø§ÛŒÙ† Ø¹Ù…Ù„ÛŒØ§Øª ÙÙ‚Ø· Ø¨Ø±Ø§ÛŒ Ù…Ø¯ÛŒØ± Ù…Ø¬Ø§Ø² Ø§Ø³Øª");
      }
    }
    const data = existing || {};
    if (req.method === "PUT") Object.assign(data, changes);
    else applyDottedUpdate(data, changes);
    const finalData = collection === "popups" ? normalizePopup(data, existing || {}) : data;
    await saveDocument(collection, documentId, finalData);
    if (canManage && ["exam_registrations", "course_registrations", "placement_registrations", "consultation_requests"].includes(collection)) {
      await notifyServiceStatusChange(collection, documentId, finalData, actor, previousData);
    }
    if (canManage) await writeAudit(actor, "update", collection, documentId, { fields: Object.keys(changes).slice(0, 20) });
    return send(res, 200, { ok: true });
  }

  if (req.method === "DELETE") {
    const actor = requirePermission(req, collectionPermissions[collection] || "settings");
    await pool.execute(
      "DELETE FROM app_documents WHERE collection_name = ? AND document_id = ?",
      [collection, documentId]
    );
    await writeAudit(actor, "delete", collection, documentId);
    return send(res, 200, { ok: true });
  }

  return fail(res, 405, "Ø¹Ù…Ù„ÛŒØ§Øª Ù…Ø¬Ø§Ø² Ù†ÛŒØ³Øª");
}

async function handlePublicTestimonials(req, res, url) {
  if (url.pathname !== "/api/testimonials/public" || req.method !== "GET") return false;
  const page = cleanText(url.searchParams.get("page") || "home", 80);
  const [rows] = await pool.execute(
    "SELECT document_id, data FROM app_documents WHERE collection_name = 'testimonials' ORDER BY created_at DESC"
  );
  const items = rows.map((row) => ({ id: row.document_id, ...parseJson(row.data) }))
    .filter((item) => item.status === "published" && String(item.targetPage || "home") === page)
    .slice(0, 12)
    .map((item) => ({
      id: cleanText(item.id || "", 160),
      displayName: cleanText(item.displayName || item.userName || "دانشجوی علامه سخن", 120),
      avatarUrl: String(item.avatarUrl || "").startsWith("data:image/") || String(item.avatarUrl || "").startsWith("https://") ? String(item.avatarUrl || "").slice(0, 1400000) : "",
      title: cleanText(item.title || "", 160),
      body: cleanText(item.body || "", 900),
      rating: Math.max(1, Math.min(5, Number(item.rating || 5))),
      targetPage: cleanText(item.targetPage || "home", 80),
      publishedAt: cleanText(item.publishedAt || item.createdAt || "", 60),
      replies: Array.isArray(item.replies) ? item.replies.filter((reply) => reply && reply.status === "published").slice(0, 8).map((reply) => ({
        displayName: cleanText(reply.displayName || reply.userName || "دانشجو", 120),
        body: cleanText(reply.body || "", 500),
        createdAt: cleanText(reply.createdAt || "", 60),
      })) : [],
    }));
  return send(res, 200, { items });
}

async function handleAdminUsers(req, res, url) {
  if (!url.pathname.startsWith("/api/admin/users")) return false;
  const manager = requireAdmin(req);
  const parts = url.pathname.split("/").filter(Boolean);
  const uid = decodeURIComponent(parts[3] || "");

  if (!uid && req.method === "POST") {
    const data = await body(req);
    const email = String(data.email || "").trim().toLowerCase();
    const password = String(data.password || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(res, 400, "Ø§ÛŒÙ…ÛŒÙ„ Ù…Ø¹ØªØ¨Ø± ÙˆØ§Ø±Ø¯ Ú©Ù†ÛŒØ¯");
    if (password.length < 8) return fail(res, 400, "Ø±Ù…Ø² Ø¹Ø¨ÙˆØ± Ø¨Ø§ÛŒØ¯ Ø­Ø¯Ø§Ù‚Ù„ Û¸ Ú©Ø§Ø±Ø§Ú©ØªØ± Ø¨Ø§Ø´Ø¯");
    const [existing] = await pool.execute("SELECT uid FROM app_users WHERE email = ? LIMIT 1", [email]);
    if (existing.length) return fail(res, 409, "Ø§ÛŒÙ† Ø§ÛŒÙ…ÛŒÙ„ Ù‚Ø¨Ù„Ø§Ù‹ Ø«Ø¨Øª Ø´Ø¯Ù‡ Ø§Ø³Øª");
    const newUid = id("staff");
    const secret = makePassword(password);
    const profile = {
      uid: newUid,
      name: String(data.name || "Ø§Ø¯Ù…ÛŒÙ†").trim() || "Ø§Ø¯Ù…ÛŒÙ†",
      email,
      role: "staff",
      permissions: Array.isArray(data.permissions) ? data.permissions : [],
      active: true,
      createdBy: manager.uid,
      createdAt: new Date().toISOString(),
    };
    await pool.execute(
      "INSERT INTO app_users (uid, email, salt, password_hash, role, data) VALUES (?, ?, ?, ?, 'staff', ?)",
      [newUid, email, secret.salt, secret.passwordHash, JSON.stringify(profile)]
    );
    return send(res, 200, { user: profile });
  }

  if (uid && req.method === "PATCH") {
    const data = await body(req);
    const [rows] = await pool.execute("SELECT role, data FROM app_users WHERE uid = ? LIMIT 1", [uid]);
    if (!rows.length || rows[0].role !== "staff") return fail(res, 404, "Ø§Ø¯Ù…ÛŒÙ† Ù…ÙˆØ±Ø¯ Ù†Ø¸Ø± Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯");
    const profile = parseJson(rows[0].data);
    if (typeof data.name === "string") profile.name = data.name.trim() || profile.name;
    if (Array.isArray(data.permissions)) profile.permissions = data.permissions;
    if (typeof data.active === "boolean") profile.active = data.active;
    await pool.execute("UPDATE app_users SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE uid = ?", [JSON.stringify(profile), uid]);
    if (typeof data.password === "string" && data.password) {
      if (data.password.length < 8) return fail(res, 400, "Ø±Ù…Ø² Ø¹Ø¨ÙˆØ± Ø¨Ø§ÛŒØ¯ Ø­Ø¯Ø§Ù‚Ù„ Û¸ Ú©Ø§Ø±Ø§Ú©ØªØ± Ø¨Ø§Ø´Ø¯");
      const secret = makePassword(data.password);
      await pool.execute("UPDATE app_users SET salt = ?, password_hash = ? WHERE uid = ?", [secret.salt, secret.passwordHash, uid]);
    }
    return send(res, 200, { user: profile });
  }

  if (uid && parts[4] === "reset-password" && req.method === "POST") {
    const data = await body(req);
    const temporaryPassword = String(data.password || "");
    if (temporaryPassword.length < 8) return fail(res, 400, "Ø±Ù…Ø² Ù…ÙˆÙ‚Øª Ø¨Ø§ÛŒØ¯ Ø­Ø¯Ø§Ù‚Ù„ Û¸ Ú©Ø§Ø±Ø§Ú©ØªØ± Ø¨Ø§Ø´Ø¯");
    const [rows] = await pool.execute("SELECT uid, email FROM app_users WHERE uid = ? LIMIT 1", [uid]);
    if (!rows.length) return fail(res, 404, "Ú©Ø§Ø±Ø¨Ø± Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯");
    const secret = makePassword(temporaryPassword);
    await pool.execute(
      "UPDATE app_users SET salt = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE uid = ?",
      [secret.salt, secret.passwordHash, uid]
    );
    await writeAudit(manager, "reset-password", "users", uid, { email: rows[0].email });
    return send(res, 200, { ok: true });
  }

  return fail(res, 405, "Ø¹Ù…Ù„ÛŒØ§Øª Ù…Ø¬Ø§Ø² Ù†ÛŒØ³Øª");
}

async function handleChatWidget(req, res, url) {
  if (url.pathname === "/api/chat-widget" && req.method === "GET") {
    const config = await getDocument("settings", "chat_widget");
    return send(res, 200, {
      active: !!(config && config.active && config.code),
      code: config && config.active ? String(config.code || "") : "",
      updatedAt: config && config.updatedAt || "",
    });
  }

  if (url.pathname === "/api/admin/chat-widget" && req.method === "GET") {
    requireAdmin(req);
    const config = await getDocument("settings", "chat_widget");
    return send(res, 200, {
      active: !!(config && config.active),
      code: config && String(config.code || "") || "",
      updatedAt: config && config.updatedAt || "",
    });
  }

  if (url.pathname === "/api/admin/chat-widget" && req.method === "PUT") {
    const actor = requireAdmin(req);
    const input = await body(req);
    const parsed = parseChatWidgetCode(input.code);
    const config = {
      active: input.active === true && !!parsed.code,
      code: parsed.code,
      origins: parsed.origins,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.uid,
    };
    await saveDocument("settings", "chat_widget", config);
    applyChatWidgetOrigins(config.active ? config.origins : []);
    await writeAudit(actor, "update-chat-widget", "settings", "chat_widget", {
      active: config.active,
      origins: config.origins,
    });
    return send(res, 200, { ok: true, active: config.active });
  }

  if (url.pathname === "/api/admin/chat-widget" && req.method === "DELETE") {
    const actor = requireAdmin(req);
    await pool.execute(
      "DELETE FROM app_documents WHERE collection_name = 'settings' AND document_id = 'chat_widget'"
    );
    applyChatWidgetOrigins([]);
    await writeAudit(actor, "delete-chat-widget", "settings", "chat_widget");
    return send(res, 200, { ok: true });
  }

  return false;
}

const couponTargets = new Set([
  "courses", "official-toefl", "official-gre", "mock-toefl", "mock-gre",
  "consultation", "toefl-voucher", "gre-voucher",
]);

function couponCode() {
  return `AS-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

function activeCouponCampaign(campaign, target, now = Date.now()) {
  if (!campaign || campaign.active !== true || campaign.target !== target) return false;
  const startsAt = campaign.startsAt ? new Date(campaign.startsAt).getTime() : 0;
  const endsAt = campaign.endsAt ? new Date(campaign.endsAt).getTime() : 0;
  return (!startsAt || startsAt <= now) && (!endsAt || endsAt >= now);
}

async function generateDiscountCodes(campaignId, quantity, mode, client = null) {
  const activeClient = client || await dbClient();
  const total = mode === "shared" ? 1 : Math.min(500, Math.max(1, Number(quantity || 1)));
  const generated = [];
  try {
    for (let index = 0; index < total; index += 1) {
      let code = couponCode();
      let inserted = false;
      while (!inserted) {
        const duplicate = await activeClient.query(
          "SELECT document_id FROM app_documents WHERE collection_name = 'discount_codes' AND data->>'code' = $1 LIMIT 1",
          [code]
        );
        if (duplicate.rows.length) {
          code = couponCode();
          continue;
        }
        const documentId = id("discount_code");
        await activeClient.query(
          "INSERT INTO app_documents (collection_name, document_id, data) VALUES ('discount_codes', $1, $2)",
          [documentId, JSON.stringify({ code, campaignId, mode, used: false, usedBy: [], createdAt: new Date().toISOString() })]
        );
        generated.push(code);
        inserted = true;
      }
    }
  } finally {
    if (!client) activeClient.release();
  }
  return generated;
}

async function handleCoupons(req, res, url) {
  if (!url.pathname.startsWith("/api/coupons") && !url.pathname.startsWith("/api/admin/coupons")) return false;

  if (url.pathname === "/api/coupons/config" && req.method === "GET") {
    const target = cleanText(url.searchParams.get("target"), 50);
    if (!couponTargets.has(target)) return send(res, 200, { available: false });
    const [rows] = await pool.execute(
      "SELECT data FROM app_documents WHERE collection_name = 'discount_campaigns' ORDER BY updated_at DESC"
    );
    const campaign = rows.map((row) => parseJson(row.data)).find((item) => activeCouponCampaign(item, target));
    return send(res, 200, {
      available: !!campaign,
      target,
      hint: campaign ? cleanText(campaign.publicHint || "Ú©Ø¯ ØªØ®ÙÛŒÙ Ø®ÙˆØ¯ Ø±Ø§ ÙˆØ§Ø±Ø¯ Ú©Ù†ÛŒØ¯", 160) : "",
    });
  }

  if (url.pathname === "/api/coupons/validate" && req.method === "POST") {
    const actor = requireUser(req);
    const input = await body(req);
    const code = cleanText(input.code, 40).toUpperCase();
    const target = cleanText(input.target, 50);
    if (!code || !couponTargets.has(target)) return fail(res, 400, "Ú©Ø¯ ÛŒØ§ Ø®Ø¯Ù…Øª Ø§Ù†ØªØ®Ø§Ø¨â€ŒØ´Ø¯Ù‡ Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³Øª");
    const [codes] = await pool.execute(
      "SELECT data FROM app_documents WHERE collection_name = 'discount_codes' AND UPPER(data->>'code') = ? LIMIT 1",
      [code]
    );
    if (!codes.length) return fail(res, 404, "Ú©Ø¯ ØªØ®ÙÛŒÙ Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³Øª");
    const codeData = parseJson(codes[0].data);
    const campaign = await getDocument("discount_campaigns", codeData.campaignId);
    if (!activeCouponCampaign(campaign, target)) return fail(res, 409, "Ø§ÛŒÙ† Ú©Ø¯ Ø¨Ø±Ø§ÛŒ Ø§ÛŒÙ† Ø®Ø¯Ù…Øª ÛŒØ§ Ø¯Ø± Ø§ÛŒÙ† ØªØ§Ø±ÛŒØ® ÙØ¹Ø§Ù„ Ù†ÛŒØ³Øª");
    if (codeData.mode === "shared") {
      if ((Array.isArray(codeData.usedBy) ? codeData.usedBy : []).includes(actor.uid)) return fail(res, 409, "Ø´Ù…Ø§ Ù‚Ø¨Ù„Ø§Ù‹ Ø§Ø² Ø§ÛŒÙ† Ú©Ø¯ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ú©Ø±Ø¯Ù‡â€ŒØ§ÛŒØ¯");
    } else if (codeData.used === true) {
      return fail(res, 409, "Ø§ÛŒÙ† Ú©Ø¯ Ù‚Ø¨Ù„Ø§Ù‹ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø´Ø¯Ù‡ Ø§Ø³Øª");
    }
    return send(res, 200, {
      valid: true,
      coupon: { code, discountType: campaign.discountType, value: campaign.value, target, title: campaign.name },
    });
  }

  if (url.pathname === "/api/coupons/redeem" && req.method === "POST") {
    const actor = requireUser(req);
    const input = await body(req);
    const code = cleanText(input.code, 40).toUpperCase();
    const target = cleanText(input.target, 50);
    if (!code || !couponTargets.has(target)) return fail(res, 400, "Ú©Ø¯ ÛŒØ§ Ø®Ø¯Ù…Øª Ø§Ù†ØªØ®Ø§Ø¨â€ŒØ´Ø¯Ù‡ Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³Øª");
    const client = await dbClient();
    try {
      await client.query("BEGIN");
      const codeResult = await client.query(
        "SELECT document_id, data FROM app_documents WHERE collection_name = 'discount_codes' AND UPPER(data->>'code') = $1 FOR UPDATE",
        [code]
      );
      if (!codeResult.rows.length) throw Object.assign(new Error("Ú©Ø¯ ØªØ®ÙÛŒÙ Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³Øª"), { status: 404 });
      const codeId = codeResult.rows[0].document_id;
      const codeData = parseJson(codeResult.rows[0].data);
      const campaignResult = await client.query(
        "SELECT data FROM app_documents WHERE collection_name = 'discount_campaigns' AND document_id = $1 LIMIT 1",
        [codeData.campaignId]
      );
      if (!campaignResult.rows.length) throw Object.assign(new Error("Ú©Ù…Ù¾ÛŒÙ† Ø§ÛŒÙ† Ú©Ø¯ Ø¯ÛŒÚ¯Ø± ÙØ¹Ø§Ù„ Ù†ÛŒØ³Øª"), { status: 410 });
      const campaign = parseJson(campaignResult.rows[0].data);
      if (!activeCouponCampaign(campaign, target)) throw Object.assign(new Error("Ø§ÛŒÙ† Ú©Ø¯ Ø¨Ø±Ø§ÛŒ Ø§ÛŒÙ† Ø®Ø¯Ù…Øª ÛŒØ§ Ø¯Ø± Ø§ÛŒÙ† ØªØ§Ø±ÛŒØ® ÙØ¹Ø§Ù„ Ù†ÛŒØ³Øª"), { status: 409 });
      const usedBy = Array.isArray(codeData.usedBy) ? codeData.usedBy : [];
      if (codeData.mode === "shared") {
        if (usedBy.includes(actor.uid)) throw Object.assign(new Error("Ø´Ù…Ø§ Ù‚Ø¨Ù„Ø§Ù‹ Ø§Ø² Ø§ÛŒÙ† Ú©Ø¯ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ú©Ø±Ø¯Ù‡â€ŒØ§ÛŒØ¯"), { status: 409 });
        codeData.usedBy = [...usedBy, actor.uid];
      } else {
        if (codeData.used === true) throw Object.assign(new Error("Ø§ÛŒÙ† Ú©Ø¯ Ù‚Ø¨Ù„Ø§Ù‹ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø´Ø¯Ù‡ Ø§Ø³Øª"), { status: 409 });
        codeData.used = true;
        codeData.usedBy = [actor.uid];
      }
      codeData.usedAt = new Date().toISOString();
      await client.query(
        "UPDATE app_documents SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE collection_name = 'discount_codes' AND document_id = $2",
        [JSON.stringify(codeData), codeId]
      );
      await client.query("COMMIT");
      return send(res, 200, {
        ok: true,
        coupon: {
          code,
          campaignId: codeData.campaignId,
          discountType: campaign.discountType,
          value: campaign.value,
          target,
          title: campaign.name,
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  if (url.pathname === "/api/admin/coupons" && req.method === "POST") {
    const actor = requirePermission(req, "coupons");
    const input = await body(req);
    const target = cleanText(input.target, 50);
    const mode = input.mode === "shared" ? "shared" : "unique";
    const discountType = input.discountType === "amount" ? "amount" : "percent";
    const value = Number(input.value || 0);
    if (!cleanText(input.name, 120) || !couponTargets.has(target) || value <= 0) return fail(res, 400, "Ø¹Ù†ÙˆØ§Ù†ØŒ Ø®Ø¯Ù…Øª Ùˆ Ù…Ù‚Ø¯Ø§Ø± ØªØ®ÙÛŒÙ Ù…Ø¹ØªØ¨Ø± Ø§Ù„Ø²Ø§Ù…ÛŒ Ø§Ø³Øª");
    if (discountType === "percent" && value > 100) return fail(res, 400, "Ø¯Ø±ØµØ¯ ØªØ®ÙÛŒÙ Ù†Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø¯ Ø¨ÛŒØ´ØªØ± Ø§Ø² Û±Û°Û° Ø¨Ø§Ø´Ø¯");
    const startsAt = input.startsAt ? new Date(input.startsAt).toISOString() : "";
    const endsAt = input.endsAt ? new Date(input.endsAt).toISOString() : "";
    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) return fail(res, 400, "Ø²Ù…Ø§Ù† Ù¾Ø§ÛŒØ§Ù† Ø¨Ø§ÛŒØ¯ Ø¨Ø¹Ø¯ Ø§Ø² Ø´Ø±ÙˆØ¹ Ø¨Ø§Ø´Ø¯");
    const campaignId = id("discount_campaign");
    const campaign = {
      name: cleanText(input.name, 120),
      target,
      discountType,
      value,
      mode,
      startsAt,
      endsAt,
      active: input.active !== false,
      publicHint: cleanText(input.publicHint, 160),
      createdAt: new Date().toISOString(),
      createdBy: actor.uid,
    };
    const client = await dbClient();
    try {
      await client.query("BEGIN");
      await client.query(
        "INSERT INTO app_documents (collection_name, document_id, data) VALUES ('discount_campaigns', $1, $2)",
        [campaignId, JSON.stringify(campaign)]
      );
      const codes = await generateDiscountCodes(campaignId, input.quantity, mode, client);
      await client.query("COMMIT");
      await writeAudit(actor, "create-coupon-campaign", "discount_campaigns", campaignId, { target, quantity: codes.length, mode });
      return send(res, 200, { id: campaignId, campaign, codes });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  const generateMatch = url.pathname.match(/^\/api\/admin\/coupons\/([^/]+)\/generate$/);
  if (generateMatch && req.method === "POST") {
    const actor = requirePermission(req, "coupons");
    const campaignId = decodeURIComponent(generateMatch[1]);
    const input = await body(req);
    const campaign = await getDocument("discount_campaigns", campaignId);
    if (!campaign) return fail(res, 404, "Ú©Ù…Ù¾ÛŒÙ† Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯");
    if (campaign.mode === "shared") return fail(res, 409, "Ú©Ù…Ù¾ÛŒÙ† Ø¹Ù…ÙˆÙ…ÛŒ ÛŒÚ© Ú©Ø¯ Ù…Ø´ØªØ±Ú© Ø¯Ø§Ø±Ø¯ Ùˆ Ù†ÛŒØ§Ø² Ø¨Ù‡ Ø§ÙØ²Ø§ÛŒØ´ ØªØ¹Ø¯Ø§Ø¯ Ù†Ø¯Ø§Ø±Ø¯");
    const codes = await generateDiscountCodes(campaignId, input.quantity, "unique");
    await writeAudit(actor, "generate-coupon-codes", "discount_codes", campaignId, { quantity: codes.length });
    return send(res, 200, { codes });
  }

  return false;
}

function csvCell(value) {
  return `"${String(value == null ? "" : value).replace(/"/g, '""')}"`;
}

function dateDistanceFromToday(dateValue) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateValue || ""))) return null;
  const today = new Date(`${currentExamDateKey()}T00:00:00+03:30`);
  const target = new Date(`${dateValue}T00:00:00+03:30`);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

async function notificationExists(kind, registrationId) {
  const [rows] = await pool.execute(
    `SELECT document_id FROM app_documents
     WHERE collection_name = 'notifications'
       AND data->>'kind' = ?
       AND data->>'registrationId' = ?
     LIMIT 1`,
    [kind, registrationId]
  );
  return rows.length > 0;
}

async function createSystemNotification(data) {
  const notificationId = id("notification");
  await saveDocument("notifications", notificationId, {
    audience: "user",
    userId: cleanText(data.userId, 100),
    userName: cleanText(data.userName, 120),
    title: cleanText(data.title, 160),
    body: cleanText(data.body, 2000),
    kind: cleanText(data.kind, 80),
    registrationId: cleanText(data.registrationId, 100),
    createdAt: new Date().toISOString(),
    createdBy: "system",
  });
}

async function processExamReminders() {
  const [rows] = await pool.query(
    `SELECT document_id, data FROM app_documents
     WHERE collection_name = 'exam_registrations'
       AND COALESCE(data->>'status', '') <> 'cancelled'`
  );
  let created = 0;
  for (const row of rows) {
    const item = parseJson(row.data);
    const days = dateDistanceFromToday(item.examDate);
    if (![7, 1].includes(days)) continue;
    const kind = days === 7 ? "exam-reminder-7d" : "exam-reminder-1d";
    if (await notificationExists(kind, row.document_id)) continue;
    await createSystemNotification({
      userId: item.userId,
      userName: item.name,
      registrationId: row.document_id,
      kind,
      title: days === 7 ? "ÛŒÚ© Ù‡ÙØªÙ‡ ØªØ§ Ø¢Ø²Ù…ÙˆÙ† Ø´Ù…Ø§ Ø¨Ø§Ù‚ÛŒ Ù…Ø§Ù†Ø¯Ù‡ Ø§Ø³Øª" : "ÛŒØ§Ø¯Ø¢ÙˆØ±ÛŒ Ø¢Ø²Ù…ÙˆÙ† ÙØ±Ø¯Ø§",
      body: `${cleanText(item.examName || "Ø¢Ø²Ù…ÙˆÙ†", 120)} Ø¯Ø± ØªØ§Ø±ÛŒØ® ${cleanText(item.examDate, 20)} Ø³Ø§Ø¹Øª ${cleanText(item.examTime || "09:00", 10)} Ø¨Ø±Ú¯Ø²Ø§Ø± Ù…ÛŒâ€ŒØ´ÙˆØ¯. Ù„Ø·ÙØ§Ù‹ Ù¾ÛŒØ´ Ø§Ø² Ø²Ù…Ø§Ù† Ø´Ø±ÙˆØ¹ Ø¯Ø± Ù…Ø­Ù„ Ø¢Ø²Ù…ÙˆÙ† Ø­Ø¶ÙˆØ± Ø¯Ø§Ø´ØªÙ‡ Ø¨Ø§Ø´ÛŒØ¯.`,
    });
    created += 1;
  }
  return created;
}

async function processSmartWaitlist() {
  const [dateRows] = await pool.query(
    "SELECT document_id, data FROM app_documents WHERE collection_name = 'mock_dates'"
  );
  let invited = 0;
  for (const dateRow of dateRows) {
    const dateInfo = parseJson(dateRow.data);
    if (!dateInfo.date || dateDistanceFromToday(dateInfo.date) < 0) continue;
    const [activeInvitations] = await pool.execute(
      `SELECT document_id FROM app_documents
       WHERE collection_name = 'exam_waitlist'
         AND data->>'dateId' = ?
         AND data->>'status' = 'invited'
         AND COALESCE(data->>'invitationExpiresAt', '') > ?`,
      [dateRow.document_id, new Date().toISOString()]
    );
    const available = Math.max(
      0,
      Number(dateInfo.capacity || 0) - Number(dateInfo.registered || 0) - Number(dateInfo.manualRegistered || 0) - activeInvitations.length
    );
    if (!available) continue;
    const [waitingRows] = await pool.execute(
      `SELECT document_id, data FROM app_documents
       WHERE collection_name = 'exam_waitlist'
         AND data->>'dateId' = ?
         AND COALESCE(data->>'status', 'waiting') = 'waiting'
       ORDER BY created_at ASC
       LIMIT ?`,
      [dateRow.document_id, available]
    );
    for (const waitingRow of waitingRows) {
      const waiting = parseJson(waitingRow.data);
      waiting.status = "invited";
      waiting.invitedAt = new Date().toISOString();
      waiting.invitationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await saveDocument("exam_waitlist", waitingRow.document_id, waiting);
      await createSystemNotification({
        userId: waiting.userId,
        userName: waiting.name,
        registrationId: waitingRow.document_id,
        kind: "waitlist-invitation",
        title: "Ø¸Ø±ÙÛŒØª Ø¢Ø²Ù…ÙˆÙ† Ø¨Ø±Ø§ÛŒ Ø´Ù…Ø§ Ø¨Ø§Ø² Ø´Ø¯",
        body: `Ø¨Ø±Ø§ÛŒ ${cleanText(waiting.examName || dateInfo.type || "Ø¢Ø²Ù…ÙˆÙ† Ø¢Ø²Ù…Ø§ÛŒØ´ÛŒ", 120)} Ø¯Ø± ØªØ§Ø±ÛŒØ® ${cleanText(dateInfo.date, 20)} Ø¸Ø±ÙÛŒØª Ø¢Ø²Ø§Ø¯ Ø´Ø¯Ù‡ Ø§Ø³Øª. Ø§ÛŒÙ† ÙØ±ØµØª ØªØ§ Û²Û´ Ø³Ø§Ø¹Øª Ø¨Ø±Ø§ÛŒ Ø´Ù…Ø§ ÙØ¹Ø§Ù„ Ø§Ø³ØªØ› Ø¨Ø±Ø§ÛŒ ØªÚ©Ù…ÛŒÙ„ Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… Ø¨Ù‡ Ø¨Ø®Ø´ Ø¢Ø²Ù…ÙˆÙ†â€ŒÙ‡Ø§ÛŒ Ù…Ù† Ù…Ø±Ø§Ø¬Ø¹Ù‡ Ú©Ù†ÛŒØ¯.`,
      });
      invited += 1;
    }
  }
  return invited;
}

let automationRunning = false;
async function runSiteAutomations() {
  if (automationRunning) return { reminders: 0, invitations: 0 };
  automationRunning = true;
  try {
    const reminders = await processExamReminders();
    const invitations = await processSmartWaitlist();
    return { reminders, invitations };
  } finally {
    automationRunning = false;
  }
}

function monthKey(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}` : "";
}

async function handleAdminTools(req, res, url) {
  if (!url.pathname.startsWith("/api/admin/")) return false;
  if (url.pathname === "/api/admin/dashboard" && req.method === "GET") {
    requirePermission(req, "reports");
    const [usersResult, documentsResult] = await Promise.all([
      pool.query("SELECT uid, data, created_at FROM app_users WHERE role = 'student' ORDER BY created_at DESC"),
      pool.query(
        `SELECT collection_name, document_id, data, created_at FROM app_documents
         WHERE collection_name IN ('exam_registrations','course_registrations','placement_registrations','exam_waitlist','mock_dates','toefl_dates','gre_dates')
         ORDER BY created_at DESC`
      ),
    ]);
    const users = usersResult[0];
    const documents = documentsResult[0].map((row) => ({
      collection: row.collection_name,
      id: row.document_id,
      data: parseJson(row.data),
      createdAt: row.created_at,
    }));
    const exams = documents.filter((item) => item.collection === "exam_registrations");
    const courses = documents.filter((item) => item.collection === "course_registrations");
    const placements = documents.filter((item) => item.collection === "placement_registrations");
    const waiting = documents.filter((item) => item.collection === "exam_waitlist" && (item.data.status || "waiting") === "waiting");
    const popularMap = {};
    exams.forEach((item) => {
      const name = cleanText(item.data.examName || item.data.type || "Ø¢Ø²Ù…ÙˆÙ†", 120);
      popularMap[name] = (popularMap[name] || 0) + 1;
    });
    courses.forEach((item) => {
      const name = cleanText(item.data.courseName || "Ø¯ÙˆØ±Ù‡ Ø¢Ù…ÙˆØ²Ø´ÛŒ", 120);
      popularMap[name] = (popularMap[name] || 0) + 1;
    });
    const popular = Object.entries(popularMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    const trendMap = {};
    [...exams, ...courses, ...placements].forEach((item) => {
      const key = monthKey(item.data.createdAt || item.createdAt);
      if (key) trendMap[key] = (trendMap[key] || 0) + 1;
    });
    const trend = Object.entries(trendMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([month, count]) => ({ month, count }));
    const today = currentExamDateKey();
    const capacities = documents
      .filter((item) => ["mock_dates", "toefl_dates", "gre_dates"].includes(item.collection) && item.data.date >= today)
      .sort((a, b) => String(a.data.date).localeCompare(String(b.data.date)))
      .slice(0, 8)
      .map((item) => ({
        id: item.id,
        type: item.data.type || item.collection.replace("_dates", "").toUpperCase(),
        date: item.data.date,
        capacity: Number(item.data.capacity || 0),
        registered: Number(item.data.registered || 0),
        manualRegistered: Number(item.data.manualRegistered || 0),
        remaining: item.collection === "mock_dates"
          ? Math.max(0, Number(item.data.capacity || 0) - Number(item.data.registered || 0) - Number(item.data.manualRegistered || 0))
          : null,
      }));
    return send(res, 200, {
      totals: {
        students: users.length,
        exams: exams.length,
        courses: courses.length,
        placements: placements.length,
        waiting: waiting.length,
        confirmed: exams.filter((item) => item.data.status === "confirmed").length,
      },
      popular,
      trend,
      capacities,
    });
  }

  const studentProfileMatch = url.pathname.match(/^\/api\/admin\/students\/([^/]+)\/profile$/);
  if (studentProfileMatch && req.method === "GET") {
    requirePermission(req, "users");
    const uid = decodeURIComponent(studentProfileMatch[1]);
    const [userRows] = await pool.execute(
      "SELECT uid, email, role, data, created_at, updated_at FROM app_users WHERE uid = ? AND role = 'student' LIMIT 1",
      [uid]
    );
    if (!userRows.length) return fail(res, 404, "Ø¯Ø§Ù†Ø´Ø¬Ùˆ Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯");
    const [documentRows] = await pool.query(
      `SELECT collection_name, document_id, data, created_at FROM app_documents
       WHERE collection_name IN ('exam_registrations','course_registrations','placement_registrations','exam_results','messages','notifications','exam_waitlist')
         AND (
           data->>'userId' = $1 OR
           data->>'senderId' = $1 OR
           data->>'receiverId' = $1
         )
       ORDER BY created_at DESC`,
      [uid]
    );
    const grouped = {};
    documentRows.forEach((row) => {
      if (!grouped[row.collection_name]) grouped[row.collection_name] = [];
      grouped[row.collection_name].push({ id: row.document_id, ...parseJson(row.data) });
    });
    return send(res, 200, {
      user: {
        ...publicUser(userRows[0]),
        createdAt: userRows[0].created_at,
        updatedAt: userRows[0].updated_at,
      },
      records: grouped,
    });
  }

  if (url.pathname === "/api/admin/automations/run" && req.method === "POST") {
    const actor = requireUser(req);
    if (!hasPermission(actor, "notifications") && !hasPermission(actor, "reports")) {
      return fail(res, 403, "Ø¨Ø±Ø§ÛŒ Ø§Ø¬Ø±Ø§ÛŒ ÛŒØ§Ø¯Ø¢ÙˆØ±Ù‡Ø§ Ø¯Ø³ØªØ±Ø³ÛŒ Ù†Ø¯Ø§Ø±ÛŒØ¯");
    }
    const result = await runSiteAutomations();
    await writeAudit(actor, "run-automations", "system", "reminders-waitlist", result);
    return send(res, 200, result);
  }

  if (url.pathname === "/api/admin/reports.xlsx" && req.method === "GET") {
    const actor = requirePermission(req, "reports");
    const ExcelJS = require("exceljs");
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Allameh Sokhan";
    workbook.created = new Date();
    const [users, documents] = await Promise.all([
      pool.query("SELECT uid, email, role, data, created_at FROM app_users WHERE role = 'student' ORDER BY created_at DESC"),
      pool.query(
        `SELECT collection_name, document_id, data, created_at FROM app_documents
         WHERE collection_name IN ('exam_registrations','course_registrations','placement_registrations','exam_waitlist','discount_campaigns','discount_codes')
         ORDER BY created_at DESC`
      ),
    ]);
    function addSheet(name, columns, rows) {
      const sheet = workbook.addWorksheet(name, { views: [{ rightToLeft: true, state: "frozen", ySplit: 1 }] });
      sheet.columns = columns.map((column) => ({ header: column.header, key: column.key, width: column.width || 20 }));
      rows.forEach((row) => sheet.addRow(row));
      sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3730A3" } };
      sheet.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + columns.length)}1` };
      return sheet;
    }
    const docs = documents[0].map((row) => ({ collection: row.collection_name, id: row.document_id, ...parseJson(row.data), dbCreatedAt: row.created_at }));
    addSheet("Ø¯Ø§Ù†Ø´Ø¬ÙˆÛŒØ§Ù†", [
      { header: "Ø´Ù†Ø§Ø³Ù‡", key: "uid", width: 24 }, { header: "Ù†Ø§Ù…", key: "name" }, { header: "Ø§ÛŒÙ…ÛŒÙ„", key: "email", width: 30 },
      { header: "Ù…ÙˆØ¨Ø§ÛŒÙ„", key: "mobile" }, { header: "Ø¢Ø®Ø±ÛŒÙ† ØµÙØ­Ù‡", key: "lastPageTitle", width: 28 },
      { header: "Ø¢Ø®Ø±ÛŒÙ† ÙØ¹Ø§Ù„ÛŒØª", key: "lastActiveAt", width: 24 }, { header: "ØªØ§Ø±ÛŒØ® Ø¹Ø¶ÙˆÛŒØª", key: "createdAt", width: 24 },
    ], users[0].map((row) => ({ uid: row.uid, email: row.email, ...parseJson(row.data), createdAt: row.created_at })));
    addSheet("Ø«Ø¨Øª Ù†Ø§Ù… Ù‡Ø§", [
      { header: "Ø´Ù†Ø§Ø³Ù‡", key: "id", width: 25 }, { header: "Ù†ÙˆØ¹", key: "category" }, { header: "Ù†Ø§Ù…", key: "name" },
      { header: "Ø§ÛŒÙ…ÛŒÙ„", key: "email", width: 28 }, { header: "Ù…ÙˆØ¨Ø§ÛŒÙ„", key: "mobile" }, { header: "Ø¹Ù†ÙˆØ§Ù†", key: "title", width: 30 },
      { header: "ØªØ§Ø±ÛŒØ®", key: "date" }, { header: "Ø³Ø§Ø¹Øª", key: "time" }, { header: "ÙˆØ¶Ø¹ÛŒØª", key: "status" },
      { header: "Ú©Ø¯ ØªØ®ÙÛŒÙ", key: "coupon" }, { header: "Ø²Ù…Ø§Ù† Ø«Ø¨Øª", key: "createdAt", width: 24 },
    ], docs.filter((item) => ["exam_registrations", "course_registrations", "placement_registrations", "exam_waitlist"].includes(item.collection)).map((item) => ({
      id: item.id, category: item.category || item.type || item.collection, name: item.name, email: item.email, mobile: item.mobile,
      title: item.examName || item.courseName || item.testName, date: item.examDate || item.courseDate || item.testDate,
      time: item.examTime || "", status: item.status, coupon: item.discountCoupon && item.discountCoupon.code || "", createdAt: item.createdAt || item.dbCreatedAt,
    })));
    addSheet("Ø­Ø¶ÙˆØ± Ùˆ ØºÛŒØ§Ø¨", [
      { header: "Ù†Ø§Ù…", key: "name" }, { header: "Ø¢Ø²Ù…ÙˆÙ†", key: "examName", width: 28 }, { header: "ØªØ§Ø±ÛŒØ®", key: "examDate" },
      { header: "Ø³Ø§Ø¹Øª", key: "examTime" }, { header: "ØµÙ†Ø¯Ù„ÛŒ", key: "seatNumber" }, { header: "Ø­Ø¶ÙˆØ±", key: "attended" },
    ], docs.filter((item) => item.collection === "exam_registrations" && item.type === "mock").map((item) => ({
      ...item, attended: item.attended ? "Ø­Ø§Ø¶Ø±" : "Ø«Ø¨Øª Ù†Ø´Ø¯Ù‡",
    })));
    const campaigns = Object.fromEntries(docs.filter((item) => item.collection === "discount_campaigns").map((item) => [item.id, item]));
    addSheet("Ú©Ø¯Ù‡Ø§ÛŒ ØªØ®ÙÛŒÙ", [
      { header: "Ú©Ø¯", key: "code" }, { header: "Ú©Ù…Ù¾ÛŒÙ†", key: "campaign" }, { header: "Ø®Ø¯Ù…Øª", key: "target" },
      { header: "Ù†ÙˆØ¹", key: "discountType" }, { header: "Ù…Ù‚Ø¯Ø§Ø±", key: "value" }, { header: "Ù…ØµØ±Ù Ø´Ø¯Ù‡", key: "used" },
      { header: "ØªØ¹Ø¯Ø§Ø¯ Ø§Ø³ØªÙØ§Ø¯Ù‡", key: "usedCount" }, { header: "ØªØ§Ø±ÛŒØ® Ø³Ø§Ø®Øª", key: "createdAt", width: 24 },
    ], docs.filter((item) => item.collection === "discount_codes").map((item) => {
      const campaign = campaigns[item.campaignId] || {};
      return {
        code: item.code, campaign: campaign.name || "", target: campaign.target || "", discountType: campaign.discountType || "",
        value: campaign.value || "", used: item.used ? "Ø¨Ù„Ù‡" : "Ø®ÛŒØ±", usedCount: Array.isArray(item.usedBy) ? item.usedBy.length : 0, createdAt: item.createdAt,
      };
    }));
    const buffer = await workbook.xlsx.writeBuffer();
    await writeAudit(actor, "download-excel-report", "reports", "complete-workbook");
    res.writeHead(200, {
      ...securityHeaders(),
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="allameh-reports-${currentExamDateKey()}.xlsx"`,
      "Cache-Control": "no-store",
    });
    return res.end(Buffer.from(buffer));
  }

  const registrationMatch = url.pathname.match(/^\/api\/admin\/registrations\/([^/]+)\/confirm$/);
  if (registrationMatch && req.method === "POST") {
    const actor = requireUser(req);
    if (!hasPermission(actor, "registrations") && !hasPermission(actor, "attendance")) {
      return fail(res, 403, "Ø¨Ø±Ø§ÛŒ ØªØ£ÛŒÛŒØ¯ Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… Ø¯Ø³ØªØ±Ø³ÛŒ Ù†Ø¯Ø§Ø±ÛŒØ¯");
    }
    const registrationId = decodeURIComponent(registrationMatch[1]);
    const client = await dbClient();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        "SELECT data FROM app_documents WHERE collection_name = 'exam_registrations' AND document_id = $1 FOR UPDATE",
        [registrationId]
      );
      if (!result.rows.length) throw Object.assign(new Error("Ø«Ø¨Øªâ€ŒÙ†Ø§Ù… Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯"), { status: 404 });
      const registration = parseJson(result.rows[0].data);
      if (registration.status === "confirmed") {
        await client.query("COMMIT");
        return send(res, 200, { ok: true, registration, alreadyConfirmed: true });
      }
      const previousRegistration = { ...registration };
      registration.status = "confirmed";
      registration.confirmedAt = new Date().toISOString();
      registration.confirmedBy = actor.uid;
      registration.confirmedByName = cleanText(actor.name || actor.email, 120);
      await client.query(
        "UPDATE app_documents SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE collection_name = 'exam_registrations' AND document_id = $2",
        [JSON.stringify(registration), registrationId]
      );
      await client.query("COMMIT");
      await notifyServiceStatusChange("exam_registrations", registrationId, registration, actor, previousRegistration);
      await writeAudit(actor, "confirm-registration", "exam_registrations", registrationId, {
        examName: registration.examName,
        userId: registration.userId,
      });
      return send(res, 200, { ok: true, registration });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  if (url.pathname === "/api/admin/backup" && req.method === "GET") {
    const manager = requireAdmin(req);
    const [users] = await pool.query("SELECT uid, email, role, data, created_at, updated_at FROM app_users ORDER BY created_at");
    const [documents] = await pool.query("SELECT collection_name, document_id, data, created_at, updated_at FROM app_documents ORDER BY collection_name, created_at");
    await writeAudit(manager, "download-backup", "system", "database");
    const payload = JSON.stringify({
      generatedAt: new Date().toISOString(),
      version: 1,
      users: users.map((row) => ({ uid: row.uid, email: row.email, role: row.role, data: parseJson(row.data), createdAt: row.created_at, updatedAt: row.updated_at })),
      documents: documents.map((row) => ({ collection: row.collection_name, id: row.document_id, data: parseJson(row.data), createdAt: row.created_at, updatedAt: row.updated_at })),
    }, null, 2);
    res.writeHead(200, {
      ...securityHeaders(),
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="allameh-backup-${currentExamDateKey()}.json"`,
      "Cache-Control": "no-store",
    });
    return res.end(payload);
  }

  if (url.pathname === "/api/admin/registrations.csv" && req.method === "GET") {
    const actor = requirePermission(req, "reports");
    const [rows] = await pool.query(
      "SELECT document_id, data FROM app_documents WHERE collection_name IN ('exam_registrations','course_registrations','placement_registrations','exam_waitlist') ORDER BY created_at DESC"
    );
    const lines = [["Ø´Ù†Ø§Ø³Ù‡", "Ù†ÙˆØ¹", "Ù†Ø§Ù…", "Ø§ÛŒÙ…ÛŒÙ„", "Ù…ÙˆØ¨Ø§ÛŒÙ„", "Ø¹Ù†ÙˆØ§Ù†", "ØªØ§Ø±ÛŒØ® Ø±ÙˆÛŒØ¯Ø§Ø¯", "Ø³Ø§Ø¹Øª", "ÙˆØ¶Ø¹ÛŒØª", "Ø²Ù…Ø§Ù† Ø«Ø¨Øª"].map(csvCell).join(",")];
    rows.forEach((row) => {
      const item = parseJson(row.data);
      lines.push([
        row.document_id, item.category || item.type || "", item.name || "", item.email || "", item.mobile || "",
        item.examName || item.courseName || item.testName || "", item.examDate || item.courseDate || item.testDate || "",
        item.examTime || "", item.status || "", item.createdAt || "",
      ].map(csvCell).join(","));
    });
    await writeAudit(actor, "download-report", "reports", "registrations");
    res.writeHead(200, {
      ...securityHeaders(),
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="registrations-${currentExamDateKey()}.csv"`,
      "Cache-Control": "no-store",
    });
    return res.end(`\uFEFF${lines.join("\n")}`);
  }
  return false;
}

function serveStatic(req, res) {
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405, { ...securityHeaders(), Allow: "GET, HEAD" });
    return res.end("Method not allowed");
  }
  let url;
  let requested;
  let seoRoute = null;
  try {
    url = new URL(req.url, "http://localhost");
    const rawRequested = decodeURIComponent(url.pathname.slice(1));
    const allowedRootFiles = new Set(["index.html", "newsletter.css", "newsletter.js", "robots.txt", "sitemap.xml", "favicon.ico", "site.webmanifest"]);
    seoRoute = pageSeo[url.pathname.replace(/\/$/, "")] || null;
    if (url.pathname !== "/" && !seoRoute && !url.pathname.startsWith("/news/") && !url.pathname.startsWith("/assets/") && !allowedRootFiles.has(rawRequested)) {
      res.writeHead(404, securityHeaders());
      return res.end("Not found");
    }
    requested = rawRequested;
  } catch {
    res.writeHead(400, securityHeaders());
    return res.end("Bad request");
  }
  const newsMatch = url.pathname.match(/^\/news\/([^/]+)\/?$/);
  requested = url.pathname === "/" || newsMatch || seoRoute ? "index.html" : requested;
  const target = path.resolve(root, requested);
  const assetsRoot = path.join(root, "assets");
  const invalidAssetPath = url.pathname.startsWith("/assets/") && !target.startsWith(`${assetsRoot}${path.sep}`);
  if (invalidAssetPath || (!target.startsWith(`${root}${path.sep}`) && target !== path.join(root, "index.html"))) {
    res.writeHead(403, securityHeaders());
    return res.end("Forbidden");
  }
  fs.readFile(target, (error, file) => {
    if (error) {
      res.writeHead(404, securityHeaders());
      return res.end("Not found");
    }
    const types = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".webmanifest": "application/manifest+json; charset=utf-8",
      ".xml": "application/xml; charset=utf-8",
      ".txt": "text/plain; charset=utf-8",
    };
    let output = file;
    if ((newsMatch || seoRoute) && path.extname(target).toLowerCase() === ".html") {
      const slug = newsMatch ? decodeURIComponent(newsMatch[1]) : "";
      const seo = newsMatch ? articleSeo[slug] : seoRoute;
      if (seo) {
        const canonical = newsMatch ? `https://asmdi.ir/news/${encodeURIComponent(slug)}` : `https://asmdi.ir${url.pathname.replace(/\/$/, "") || "/"}`;
        output = file.toString("utf8")
          .replace("<head>", "<head>\n<base href=\"/\">")
          .replace(/<title>[\s\S]*?<\/title>/i, `<title>${seo.title}</title>`)
          .replace(/<meta id="seo-description" name="description" content="[^"]*">/i, `<meta id="seo-description" name="description" content="${seo.description}">`)
          .replace(/<link id="seo-canonical" rel="canonical" href="[^"]*">/i, `<link id="seo-canonical" rel="canonical" href="${canonical}">`)
          .replace(/<meta id="seo-og-title" property="og:title" content="[^"]*">/i, `<meta id="seo-og-title" property="og:title" content="${seo.title}">`)
          .replace(/<meta id="seo-og-description" property="og:description" content="[^"]*">/i, `<meta id="seo-og-description" property="og:description" content="${seo.description}">`)
          .replace(/<meta id="seo-og-url" property="og:url" content="[^"]*">/i, `<meta id="seo-og-url" property="og:url" content="${canonical}">`)
          .replace(/<meta id="seo-twitter-title" name="twitter:title" content="[^"]*">/i, `<meta id="seo-twitter-title" name="twitter:title" content="${seo.title}">`)
          .replace(/<meta id="seo-twitter-description" name="twitter:description" content="[^"]*">/i, `<meta id="seo-twitter-description" name="twitter:description" content="${seo.description}">`)
          .replace("</head>", `${seoRoute ? `\n<script>window.__INITIAL_PAGE=${JSON.stringify(seoRoute.page)};</script>` : ""}\n</head>`);
      }
    }
    const extension = path.extname(target).toLowerCase();
    const contentType = types[extension] || "application/octet-stream";
    const payload = Buffer.isBuffer(output) ? output : Buffer.from(output);
    const etag = `"${crypto.createHash("sha1").update(payload).digest("hex")}"`;
    const versionedAsset = /[?&]v=/.test(req.url);
    const cacheControl = extension === ".html" || requested === "robots.txt" || requested === "sitemap.xml"
      ? "no-cache"
      : ([".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico"].includes(extension)
        ? "public, max-age=2592000, stale-while-revalidate=86400"
        : (versionedAsset ? "public, max-age=31536000, immutable" : "public, max-age=604800, stale-while-revalidate=86400"));
    if (req.headers["if-none-match"] === etag) {
      res.writeHead(304, { ...securityHeaders(), ETag: etag, "Cache-Control": cacheControl });
      return res.end();
    }
    const accepts = String(req.headers["accept-encoding"] || "");
    const compressible = /^(text\/|application\/javascript|application\/json|image\/svg\+xml)/.test(contentType);
    let responsePayload = payload;
    let encoding = "";
    if (compressible && payload.length > 1024 && /\bbr\b/.test(accepts)) {
      responsePayload = zlib.brotliCompressSync(payload, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } });
      encoding = "br";
    } else if (compressible && payload.length > 1024 && /\bgzip\b/.test(accepts)) {
      responsePayload = zlib.gzipSync(payload, { level: 6 });
      encoding = "gzip";
    }
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": cacheControl,
      ETag: etag,
      Vary: "Accept-Encoding",
      ...(encoding ? { "Content-Encoding": encoding } : {}),
      ...securityHeaders(),
    });
    res.end(req.method === "HEAD" ? undefined : responsePayload);
  });
}

async function handleApi(req, res) {
  if (apiRateLimited(req)) return fail(res, 429, "ØªØ¹Ø¯Ø§Ø¯ Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ Ø²ÛŒØ§Ø¯ Ø§Ø³ØªØ› Ú©Ù…ÛŒ Ø¨Ø¹Ø¯ Ø¯ÙˆØ¨Ø§Ø±Ù‡ ØªÙ„Ø§Ø´ Ú©Ù†ÛŒØ¯");
  const url = new URL(req.url, "http://localhost");
  validateRequestOrigin(req);
  validateCsrf(req, url);
  if (url.pathname === "/api/health" && req.method === "GET") {
    await pool.query("SELECT 1");
    return send(res, 200, { ok: true, database: "postgresql" });
  }
  const authResult = await handleAuth(req, res, url.pathname);
  if (authResult !== false) return authResult;
  const adminUsersResult = await handleAdminUsers(req, res, url);
  if (adminUsersResult !== false) return adminUsersResult;
  const chatWidgetResult = await handleChatWidget(req, res, url);
  if (chatWidgetResult !== false) return chatWidgetResult;
  const couponsResult = await handleCoupons(req, res, url);
  if (couponsResult !== false) return couponsResult;
  const adminToolsResult = await handleAdminTools(req, res, url);
  if (adminToolsResult !== false) return adminToolsResult;
  const publicTestimonialsResult = await handlePublicTestimonials(req, res, url);
  if (publicTestimonialsResult !== false) return publicTestimonialsResult;
  const collectionResult = await handleCollections(req, res, url);
  if (collectionResult !== false) return collectionResult;
  return fail(res, 404, "ÛŒØ§ÙØª Ù†Ø´Ø¯");
}

async function start() {
  await initializeDatabase();
  await loadChatWidgetConfiguration();
  runSiteAutomations().catch((error) => console.error("Automation startup failed:", error));
  setInterval(() => {
    runSiteAutomations().catch((error) => console.error("Automation interval failed:", error));
  }, 60 * 60 * 1000).unref();
  const server = http.createServer((req, res) => {
    if (req.url.startsWith("/api/")) {
      handleApi(req, res).catch((error) => {
        console.error(error);
        if (!res.headersSent) fail(res, error.status || 500, error.status ? error.message : "Ø®Ø·Ø§ÛŒ Ø¯Ø§Ø®Ù„ÛŒ Ø³Ø±ÙˆØ±");
      });
      return;
    }
    serveStatic(req, res);
  });
  server.requestTimeout = 30 * 1000;
  server.headersTimeout = 15 * 1000;
  server.keepAliveTimeout = 5 * 1000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Allameh Sokhan Node/MySQL: http://0.0.0.0:${port}`);
  });
}

start().catch((error) => {
  console.error("Startup failed:", error);
  process.exit(1);
});


