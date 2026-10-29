const replies = {
  en: {
    greeting: "Hello! I can help with calculator questions, fitness estimates, currency conversions, and using CalcMind. What would you like to work on?",
    fitness: "For a fitness estimate, open Fitness and enter your age, height, weight, activity level, and goal. The calorie target is an estimate—not medical advice. Consider checking a major change with a qualified professional.",
    currency: "Open Currency, choose the currencies, and enter an amount. Rates are reference rates and may differ from what a bank or card provider charges.",
    calculator: "Open Scientific to evaluate expressions such as sqrt(25), sin(pi / 2), or 2^8. Trigonometry uses radians.",
    calendar: "Open Calendar to add a date, time, and note. Your events are stored in this browser.",
    fallback: "I can help with scientific calculations, currency conversion, fitness estimates, calendar planning, and CalcMind features. Try asking about one of those.",
  },
  es: { greeting: "¡Hola! Puedo ayudarte con cálculos, estimaciones de fitness, divisas y el uso de CalcMind. ¿Qué necesitas?", fitness: "Abre Fitness e introduce tu edad, altura, peso, actividad y objetivo. Las calorías son una estimación, no un consejo médico.", currency: "Abre Divisas, elige las monedas e introduce el importe. Los tipos son de referencia y pueden diferir de los de tu banco.", calculator: "Abre Científica para calcular expresiones como sqrt(25) o 2^8. La trigonometría usa radianes.", calendar: "Abre Calendario para añadir una fecha, hora y nota. Los eventos se guardan en este navegador.", fallback: "Puedo ayudar con cálculos, divisas, fitness, calendario y funciones de CalcMind. Pregúntame sobre uno de esos temas." },
  fr: { greeting: "Bonjour ! Je peux vous aider avec les calculs, le fitness, les devises et CalcMind. Que souhaitez-vous faire ?", fitness: "Ouvrez Fitness et indiquez votre âge, taille, poids, activité et objectif. Les calories sont une estimation, pas un avis médical.", currency: "Ouvrez Devises, choisissez les monnaies et saisissez un montant. Les taux sont indicatifs et peuvent différer de ceux de votre banque.", calculator: "Ouvrez Scientifique pour calculer sqrt(25) ou 2^8. La trigonométrie utilise les radians.", calendar: "Ouvrez Calendrier pour ajouter une date, une heure et une note. Les événements restent dans ce navigateur.", fallback: "Je peux vous aider pour les calculs, devises, fitness, calendrier et CalcMind. Posez une question sur l’un de ces sujets." },
  hi: { greeting: "नमस्ते! मैं गणना, फिटनेस अनुमान, मुद्रा विनिमय और CalcMind के उपयोग में सहायता कर सकता हूँ।", fitness: "Fitness खोलें और उम्र, लंबाई, वजन, गतिविधि और लक्ष्य भरें। कैलोरी केवल अनुमान है, चिकित्सा सलाह नहीं।", currency: "मुद्रा खोलें, मुद्राएँ चुनें और राशि दर्ज करें। दरें संदर्भ के लिए हैं और बैंक दरों से अलग हो सकती हैं।", calculator: "वैज्ञानिक कैलकुलेटर में sqrt(25) या 2^8 जैसे समीकरण हल करें। त्रिकोणमिति में रेडियन का उपयोग होता है।", calendar: "कैलेंडर में तारीख, समय और नोट जोड़ें। कार्यक्रम इसी ब्राउज़र में सहेजे जाते हैं।", fallback: "मैं गणना, मुद्रा, फिटनेस, कैलेंडर और CalcMind सुविधाओं में मदद कर सकता हूँ।" },
  zh: { greeting: "你好！我可以帮助你进行计算、健身估算、货币换算以及使用 CalcMind。", fitness: "打开健身工具，输入年龄、身高、体重、活动量和目标。热量仅为估算，不构成医疗建议。", currency: "打开货币工具，选择币种并输入金额。汇率仅供参考，可能与银行汇率不同。", calculator: "打开科学计算器，计算 sqrt(25) 或 2^8 等表达式。三角函数使用弧度。", calendar: "打开日历添加日期、时间和备注。事件保存在此浏览器中。", fallback: "我可以协助计算、货币换算、健身、日历和 CalcMind 功能。欢迎提出相关问题。" },
  ar: { greeting: "مرحباً! يمكنني مساعدتك في الحسابات واللياقة وتحويل العملات واستخدام CalcMind.", fitness: "افتح اللياقة وأدخل العمر والطول والوزن والنشاط والهدف. السعرات تقديرية وليست نصيحة طبية.", currency: "افتح العملات واختر العملتين وأدخل المبلغ. الأسعار استرشادية وقد تختلف عن أسعار البنك.", calculator: "افتح الحاسبة العلمية لحساب تعبيرات مثل sqrt(25) أو 2^8. تستخدم الدوال المثلثية الراديان.", calendar: "افتح التقويم لإضافة التاريخ والوقت وملاحظة. تحفظ الأحداث في هذا المتصفح.", fallback: "يمكنني المساعدة في الحساب والعملات واللياقة والتقويم وميزات CalcMind." },
  ta: { greeting: "வணக்கம்! கணக்கீடுகள், உடற்பயிற்சி மதிப்பீடுகள், நாணய மாற்றம் மற்றும் CalcMind பயன்பாடு குறித்து உதவ முடியும். என்ன தெரிந்துகொள்ள விரும்புகிறீர்கள்?", fitness: "Fitness பகுதியைத் திறந்து வயது, உயரம், எடை, செயல்பாட்டு நிலை, இலக்கு ஆகியவற்றை உள்ளிடுங்கள். கலோரி அளவு ஒரு மதிப்பீடு மட்டுமே; இது மருத்துவ ஆலோசனை அல்ல.", currency: "Currency பகுதியைத் திறந்து நாணயங்களைத் தேர்ந்தெடுத்து தொகையை உள்ளிடுங்கள். காட்டப்படும் மாற்று விகிதம் குறிப்புக்கானது; வங்கி விகிதத்திலிருந்து மாறுபடலாம்.", calculator: "Scientific பகுதியைத் திறந்து sqrt(25), sin(pi / 2), 2^8 போன்றவற்றைக் கணக்கிடுங்கள். முக்கோணவியல் கணக்குகள் radians-ஐப் பயன்படுத்துகின்றன.", calendar: "Calendar பகுதியில் தேதி, நேரம் மற்றும் குறிப்பைச் சேர்க்கலாம். நிகழ்வுகள் இந்த உலாவியில் சேமிக்கப்படும்.", fallback: "கணக்கீடு, நாணய மாற்றம், உடற்பயிற்சி மதிப்பீடு, அட்டவணை மற்றும் CalcMind பயன்பாடு குறித்து உதவ முடியும். அவற்றில் ஒன்றைப் பற்றி கேளுங்கள்." },
};
const API_BASE = import.meta.env?.VITE_API_BASE || "";

export function localAssistantReply(message, requestedLanguage = "auto") {
  const normalized = message.toLowerCase();
  const language = requestedLanguage === "auto"
    ? (/[\u0B80-\u0BFF]/u.test(message) ? "ta" : /[अ-ह]/u.test(message) ? "hi" : /[\u4e00-\u9fff]/u.test(message) ? "zh" : /[\u0600-\u06ff]/u.test(message) ? "ar" : /\b(hola|gracias|divisa|moneda)\b/i.test(message) ? "es" : /\b(bonjour|merci|devise|calcul)\b/i.test(message) ? "fr" : "en")
    : requestedLanguage;
  const copy = replies[language] || replies.en;
  const has = (term) => normalized.includes(term);
  const hasWord = (term) => new RegExp(`\\b${term}\\b`, "i").test(normalized);
  const key = ["hello", "hi", "hey", "hola", "bonjour", "ciao"].some(hasWord) || ["நலமா", "வணக்கம்", "नमस्ते", "你好", "مرحبا"].some(has) ? "greeting"
    : ["fitness", "weight", "calorie", "gym", "workout"].some(hasWord) || ["peso", "calor", "poids", "வயிற்று", "உடற்பயிற்சி", "எடை", "வலிமை", "वजन", "健身", "لياقة"].some(has) ? "fitness"
      : ["currency", "exchange", "money"].some(hasWord) || ["நாணய", "நாணயம்", "மாற்று விகிதம்", "பணம்", "divisa", "moneda", "devise", "मुद्रा", "货币", "عملة"].some(has) ? "currency"
        : ["calendar", "schedule", "event"].some(hasWord) || ["நாட்காட்டி", "அட்டவணை", "calendario", "agenda", "कैलेंडर", "日历", "تقويم"].some(has) ? "calendar"
          : ["calculator", "math", "calculate", "scientific"].some(hasWord) || ["கணக்கிடு", "கணக்கீடு", "கணக்கு", "கணிதம்", "cálculo", "calcul", "गणना", "计算"].some(has) ? "calculator" : "fallback";
  return copy[key];
}

export async function sendChatMessage(message, language) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, language }),
  });
  let data;
  try { data = await response.json(); }
  catch { throw new Error("Assistant service returned an invalid response. Please try again."); }
  if (!response.ok) throw new Error(data.error || "Assistant service is unavailable.");
  if (typeof data.reply !== "string" || !data.reply.trim()) throw new Error("Assistant returned an empty response.");
  return data.reply;
}
