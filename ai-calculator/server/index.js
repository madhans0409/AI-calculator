import { createServer } from "node:http";

const port = Number(process.env.API_PORT || 3001);
const host = process.env.API_HOST || "127.0.0.1";
const allowedOrigin = process.env.ALLOWED_ORIGIN || "";
const languageNames = { en: "English", es: "Spanish", fr: "French", hi: "Hindi", ta: "Tamil", zh: "Chinese", ar: "Arabic", de: "German", it: "Italian", pt: "Portuguese", ja: "Japanese", ko: "Korean", ru: "Russian", bn: "Bengali", ur: "Urdu", tr: "Turkish", nl: "Dutch", pl: "Polish", sv: "Swedish", th: "Thai", vi: "Vietnamese", id: "Indonesian", uk: "Ukrainian" };
const copy = {
  en: { greeting: "Hello! I can help with calculator questions, fitness estimates, currency conversions, and using CalcMind. What would you like to work on?", fitness: "Open Fitness and enter your age, height, weight, activity, and goal. The calorie target is an estimate, not medical advice.", currency: "Open Currency, choose currencies, and enter an amount. Reference rates may differ from what your bank charges.", calculator: "Open Scientific to evaluate expressions such as sqrt(25), sin(pi / 2), or 2^8. Trigonometry uses radians.", calendar: "Open Calendar to schedule a date, time, and note. Events are saved in this browser.", fallback: "I can help with calculations, currency conversion, fitness estimates, calendar planning, and CalcMind features. Try asking about one of those." },
  es: { greeting: "¡Hola! Puedo ayudarte con cálculos, estimaciones de fitness, divisas y el uso de CalcMind. ¿Qué necesitas?", fitness: "Abre Fitness e introduce tu edad, altura, peso, actividad y objetivo. Las calorías son una estimación, no un consejo médico.", currency: "Abre Divisas, elige las monedas e introduce el importe. Los tipos son de referencia y pueden diferir de los de tu banco.", calculator: "Abre Científica para calcular expresiones como sqrt(25) o 2^8. La trigonometría usa radianes.", calendar: "Abre Calendario para añadir una fecha, hora y nota. Los eventos se guardan en este navegador.", fallback: "Puedo ayudar con cálculos, divisas, fitness, calendario y funciones de CalcMind." },
  fr: { greeting: "Bonjour ! Je peux vous aider avec les calculs, le fitness, les devises et CalcMind. Que souhaitez-vous faire ?", fitness: "Ouvrez Fitness et indiquez votre âge, taille, poids, activité et objectif. Les calories sont une estimation, pas un avis médical.", currency: "Ouvrez Devises, choisissez les monnaies et saisissez un montant. Les taux sont indicatifs et peuvent différer de ceux de votre banque.", calculator: "Ouvrez Scientifique pour calculer sqrt(25) ou 2^8. La trigonométrie utilise les radians.", calendar: "Ouvrez Calendrier pour ajouter une date, une heure et une note. Les événements restent dans ce navigateur.", fallback: "Je peux vous aider pour les calculs, devises, fitness, calendrier et CalcMind." },
  hi: { greeting: "नमस्ते! मैं गणना, फिटनेस अनुमान, मुद्रा विनिमय और CalcMind के उपयोग में सहायता कर सकता हूँ।", fitness: "Fitness खोलें और उम्र, लंबाई, वजन, गतिविधि और लक्ष्य भरें। कैलोरी केवल अनुमान है, चिकित्सा सलाह नहीं।", currency: "मुद्रा खोलें, मुद्राएँ चुनें और राशि दर्ज करें। दरें संदर्भ के लिए हैं और बैंक दरों से अलग हो सकती हैं।", calculator: "वैज्ञानिक कैलकुलेटर में sqrt(25) या 2^8 जैसे समीकरण हल करें। त्रिकोणमिति में रेडियन का उपयोग होता है।", calendar: "कैलेंडर में तारीख, समय और नोट जोड़ें। कार्यक्रम इसी ब्राउज़र में सहेजे जाते हैं।", fallback: "मैं गणना, मुद्रा, फिटनेस, कैलेंडर और CalcMind सुविधाओं में मदद कर सकता हूँ।" },
  ta: { greeting: "வணக்கம்! கணக்கீடுகள், உடற்பயிற்சி மதிப்பீடுகள், நாணய மாற்றம் மற்றும் CalcMind பயன்பாடு குறித்து உதவ முடியும். என்ன தெரிந்துகொள்ள விரும்புகிறீர்கள்?", fitness: "Fitness பகுதியைத் திறந்து வயது, உயரம், எடை, செயல்பாட்டு நிலை, இலக்கு ஆகியவற்றை உள்ளிடுங்கள். கலோரி அளவு ஒரு மதிப்பீடு மட்டுமே; இது மருத்துவ ஆலோசனை அல்ல.", currency: "Currency பகுதியைத் திறந்து நாணயங்களைத் தேர்ந்தெடுத்து தொகையை உள்ளிடுங்கள். காட்டப்படும் மாற்று விகிதம் குறிப்புக்கானது; வங்கி விகிதத்திலிருந்து மாறுபடலாம்.", calculator: "Scientific பகுதியைத் திறந்து sqrt(25), sin(pi / 2), 2^8 போன்றவற்றைக் கணக்கிடுங்கள். முக்கோணவியல் கணக்குகள் radians-ஐப் பயன்படுத்துகின்றன.", calendar: "Calendar பகுதியில் தேதி, நேரம் மற்றும் குறிப்பைச் சேர்க்கலாம். நிகழ்வுகள் இந்த உலாவியில் சேமிக்கப்படும்.", fallback: "கணக்கீடு, நாணய மாற்றம், உடற்பயிற்சி மதிப்பீடு, அட்டவணை மற்றும் CalcMind பயன்பாடு குறித்து உதவ முடியும். அவற்றில் ஒன்றைப் பற்றி கேளுங்கள்." },
  zh: { greeting: "你好！我可以帮助你进行计算、健身估算、货币换算以及使用 CalcMind。", fitness: "打开健身工具，输入年龄、身高、体重、活动量和目标。热量仅为估算，不构成医疗建议。", currency: "打开货币工具，选择币种并输入金额。汇率仅供参考，可能与银行汇率不同。", calculator: "打开科学计算器，计算 sqrt(25) 或 2^8 等表达式。三角函数使用弧度。", calendar: "打开日历添加日期、时间和备注。事件保存在此浏览器中。", fallback: "我可以协助计算、货币换算、健身、日历和 CalcMind 功能。" },
  ar: { greeting: "مرحباً! يمكنني مساعدتك في الحسابات واللياقة وتحويل العملات واستخدام CalcMind.", fitness: "افتح اللياقة وأدخل العمر والطول والوزن والنشاط والهدف. السعرات تقديرية وليست نصيحة طبية.", currency: "افتح العملات واختر العملتين وأدخل المبلغ. الأسعار استرشادية وقد تختلف عن أسعار البنك.", calculator: "افتح الحاسبة العلمية لحساب تعبيرات مثل sqrt(25) أو 2^8. تستخدم الدوال المثلثية الراديان.", calendar: "افتح التقويم لإضافة التاريخ والوقت وملاحظة. تحفظ الأحداث في هذا المتصفح.", fallback: "يمكنني المساعدة في الحساب والعملات واللياقة والتقويم وميزات CalcMind." },
};

function localReply(message, requestedLanguage = "auto") {
  const language = requestedLanguage === "auto"
    ? (/[\u0B80-\u0BFF]/u.test(message) ? "ta" : /[अ-ह]/u.test(message) ? "hi" : /[\u4e00-\u9fff]/u.test(message) ? "zh" : /[\u0600-\u06ff]/u.test(message) ? "ar" : /\b(hola|gracias|divisa|moneda)\b/i.test(message) ? "es" : /\b(bonjour|merci|devise)\b/i.test(message) ? "fr" : "en")
    : requestedLanguage;
  const normalized = message.toLowerCase();
  const has = (term) => normalized.includes(term);
  const hasWord = (term) => new RegExp(`\\b${term}\\b`, "i").test(normalized);
  const topic = ["hello", "hi", "hey", "hola", "bonjour", "ciao"].some(hasWord) || ["நலமா", "வணக்கம்", "नमस्ते", "你好", "مرحبا"].some(has) ? "greeting"
    : ["fitness", "weight", "calorie", "gym", "workout"].some(hasWord) || ["peso", "calor", "poids", "वजन", "健身", "لياقة"].some(has) ? "fitness"
      : ["currency", "exchange", "money"].some(hasWord) || ["நாணயம்", "மாற்று விகிதம்", "பணம்", "divisa", "moneda", "devise", "मुद्रा", "货币", "عملة"].some(has) ? "currency"
        : ["calendar", "schedule", "event"].some(hasWord) || ["நாட்காட்டி", "அட்டவணை", "calendario", "agenda", "कैलेंडर", "日历", "تقويم"].some(has) ? "calendar"
          : ["calculator", "math", "calculate", "scientific"].some(hasWord) || ["கணக்கிடு", "கணக்கு", "கணிதம்", "cálculo", "calcul", "गणना", "计算"].some(has) ? "calculator" : "fallback";
  return (copy[language] || copy.en)[topic];
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 16_384) throw Object.assign(new Error("Request body is too large."), { status: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw Object.assign(new Error("Request body must be valid JSON."), { status: 400 }); }
}

function send(response, status, payload, origin = "") {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...(origin ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {}),
  });
  response.end(JSON.stringify(payload));
}

let cachedCurrencies = null;
let currenciesCachedAt = 0;
let cachedExchangeRates = new Map();
async function getCurrencyDirectory() {
  if (cachedCurrencies && Date.now() - currenciesCachedAt < 24 * 60 * 60 * 1000) return cachedCurrencies;
  try {
    const upstream = await fetch("https://api.frankfurter.app/currencies", { signal: AbortSignal.timeout(8_000) });
    if (!upstream.ok) throw new Error(`Frankfurter returned HTTP ${upstream.status}.`);
    const payload = await upstream.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Frankfurter returned an invalid currency list.");
    cachedCurrencies = Object.fromEntries(Object.entries(payload).filter(([code, name]) => /^[A-Z]{3}$/.test(code) && typeof name === "string"));
    if (Object.keys(cachedCurrencies).length === 0) throw new Error("Frankfurter returned an empty currency list.");
  } catch (frankfurterError) {
    try {
      const upstream = await fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(8_000) });
      if (!upstream.ok) throw new Error(`ExchangeRate-API returned HTTP ${upstream.status}.`);
      const payload = await upstream.json();
      if (payload.result !== "success" || !payload.rates || typeof payload.rates !== "object") throw new Error("ExchangeRate-API returned an invalid currency list.");
      const displayNames = new Intl.DisplayNames(["en"], { type: "currency" });
      cachedCurrencies = Object.fromEntries(Object.keys(payload.rates)
        .filter((code) => /^[A-Z]{3}$/.test(code))
        .map((code) => [code, displayNames.of(code) || code]));
    } catch (fallbackError) {
      throw new Error(`Currency providers are unavailable (${frankfurterError.message}; ${fallbackError.message}). Check your internet connection and retry.`);
    }
  }
  currenciesCachedAt = Date.now();
  return cachedCurrencies;
}

async function fetchExchangeRate(from, to) {
  const cacheKey = `${from}:${to}`;
  const cached = cachedExchangeRates.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < 15 * 60 * 1000) return cached.value;
  try {
    const response = await fetch(`https://api.frankfurter.app/latest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { signal: AbortSignal.timeout(8_000) });
    if (!response.ok) throw new Error(`Frankfurter returned HTTP ${response.status}.`);
    const data = await response.json();
    const rate = data.rates?.[to];
    if (!Number.isFinite(rate) || rate <= 0 || typeof data.date !== "string") throw new Error("Frankfurter did not return this currency pair.");
    const value = { rate, date: data.date, provider: "Frankfurter" };
    cachedExchangeRates.set(cacheKey, { value, cachedAt: Date.now() });
    return value;
  } catch (frankfurterError) {
    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`, { signal: AbortSignal.timeout(8_000) });
      if (!response.ok) throw new Error(`ExchangeRate-API returned HTTP ${response.status}.`);
      const data = await response.json();
      const rate = data.rates?.[to];
      if (data.result !== "success" || !Number.isFinite(rate) || rate <= 0) throw new Error("ExchangeRate-API did not return this currency pair.");
      const date = typeof data.time_last_update_utc === "string"
        ? new Date(data.time_last_update_utc).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);
      const value = { rate, date, provider: "ExchangeRate-API" };
      cachedExchangeRates.set(cacheKey, { value, cachedAt: Date.now() });
      return value;
    } catch (fallbackError) {
      if (cached) return { ...cached.value, cached: true };
      throw new Error(`No live rate is available (${frankfurterError.message}; ${fallbackError.message}). Check your internet connection and retry.`);
    }
  }
}

const server = createServer(async (request, response) => {
  const origin = request.headers.origin || "";
  const corsOrigin = allowedOrigin && origin === allowedOrigin ? origin : "";
  if (origin && allowedOrigin && !corsOrigin) return send(response, 403, { error: "Origin is not allowed." });
  if (request.method === "OPTIONS") {
    response.writeHead(204, { "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", ...(corsOrigin ? { "Access-Control-Allow-Origin": corsOrigin, Vary: "Origin" } : {}) });
    return response.end();
  }
  const requestUrl = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);
  if (request.method === "GET" && requestUrl.pathname === "/api/health") return send(response, 200, { status: "ok" }, corsOrigin);
  if (request.method === "GET" && requestUrl.pathname === "/api/currencies") {
    try {
      const currencies = await getCurrencyDirectory();
      return send(response, 200, Object.entries(currencies)
        .map(([code, name]) => ({ code, name }))
        .sort((a, b) => a.code.localeCompare(b.code)), corsOrigin);
    } catch (error) {
      console.error("Currency list request failed:", error.message);
      return send(response, 502, { error: "Could not load the currency list. Please try again." }, corsOrigin);
    }
  }
  if (request.method === "GET" && requestUrl.pathname === "/api/rates") {
    const from = requestUrl.searchParams.get("from") || "";
    const to = requestUrl.searchParams.get("to") || "";
    if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to)) return send(response, 400, { error: "Provide valid three-letter currency codes." }, corsOrigin);
    let supportedCurrencies;
    try { supportedCurrencies = await getCurrencyDirectory(); }
    catch (error) {
      console.error("Currency list request failed:", error.message);
      return send(response, 502, { error: "Could not verify currencies with the rate provider. Please retry." }, corsOrigin);
    }
    if (!supportedCurrencies[from] || !supportedCurrencies[to]) return send(response, 400, { error: "The selected currency is not supported by the reference-rate provider." }, corsOrigin);
    if (from === to) return send(response, 200, { rate: 1, date: new Date().toISOString().slice(0, 10) }, corsOrigin);
    try {
      const quote = await fetchExchangeRate(from, to);
      return send(response, 200, quote, corsOrigin);
    } catch (error) {
      console.error("Currency rate request failed:", error.message);
      return send(response, 502, { error: error.message }, corsOrigin);
    }
  }
  if (request.method !== "POST" || requestUrl.pathname !== "/api/chat") return send(response, 404, { error: "API route not found." }, corsOrigin);

  try {
    const body = await readJson(request);
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const language = body.language || "auto";
    if (!message || message.length > 1000) return send(response, 400, { error: "Message must be between 1 and 1000 characters." }, corsOrigin);
    if (language !== "auto" && !languageNames[language]) return send(response, 400, { error: "Unsupported reply language." }, corsOrigin);
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return send(response, 200, { reply: localReply(message, language), mode: "built-in" }, corsOrigin);
    const selectedLanguage = language === "auto" ? "the language used by the user" : languageNames[language];
    const upstream = await fetch(process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(20_000),
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: `You are CalcMind, a concise multilingual calculator and everyday planning assistant. Reply in ${selectedLanguage}. Be clear when estimates are uncertain. Do not present fitness outputs as medical advice.` },
          { role: "user", content: message },
        ],
        max_tokens: 500,
      }),
    });
    if (!upstream.ok) return send(response, 502, { error: `AI provider returned HTTP ${upstream.status}.` }, corsOrigin);
    const data = await upstream.json();
    const reply = data.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) return send(response, 502, { error: "AI provider returned an empty response." }, corsOrigin);
    return send(response, 200, { reply, mode: "ai" }, corsOrigin);
  } catch (error) {
    const status = error.status || 502;
    console.error("API request failed:", error.message);
    return send(response, status, { error: status >= 500 ? "The API could not complete this request. Please try again." : error.message }, corsOrigin);
  }
});

server.listen(port, host, () => console.log(`CalcMind API listening at http://${host}:${port}`));
