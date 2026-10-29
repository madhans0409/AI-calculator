import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowLeftRight, Bookmark, CalendarDays, Calculator, ChevronRight,
  Landmark, Plus, Sparkles, Trash2, Ruler, GraduationCap, RefreshCw, CircleHelp,
} from "lucide-react";
import { calculateFitnessPlan } from "./domain/fitness.js";
import { convertCurrency } from "./domain/currency.js";
import { fetchCurrencies, fetchExchangeRate } from "./services/currency.js";
import { Link } from "react-router-dom";
import "./App.css";

const STORAGE = {
  bookmarks: "ai-calculator-bookmarks",
  events: "calcmind-events",
  layout: "calcmind-layout",
};
const gradePoints = { O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, D: 4, F: 0 };
const units = {
  Length: { Meter: 1, Kilometer: 1000, Centimeter: 0.01, Millimeter: 0.001, Mile: 1609.344, Foot: 0.3048, Inch: 0.0254 },
  Weight: { Kilogram: 1, Gram: 0.001, Pound: 0.45359237, Ounce: 0.028349523125 },
  Temperature: { Celsius: "C", Fahrenheit: "F", Kelvin: "K" },
};
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const money = (value, currency) => {
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(value); }
  catch { return `${value.toFixed(2)} ${currency}`; }
};
const format = (value) => Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: 8 }) : "—";
const readSaved = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); }
  catch (error) { console.warn(`Could not read saved ${key} from browser storage.`, error); return []; }
};
const writeSaved = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (error) { console.warn(`Could not save ${key} to browser storage.`, error); }
};
const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

function App() {
  const [tab, setTab] = useState("math");
  const [layout, setLayout] = useState(() => {
    try { return localStorage.getItem(STORAGE.layout) || "standard"; }
    catch (error) { console.warn("Could not read the saved layout from browser storage.", error); return "standard"; }
  });
  const [expression, setExpression] = useState("sin(pi / 2) + sqrt(25)");
  const [mathResult, setMathResult] = useState("6");
  const [mathError, setMathError] = useState("");
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("8.5");
  const [years, setYears] = useState("2");
  const [compound, setCompound] = useState(true);
  const [currencyAmount, setCurrencyAmount] = useState("100");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  const [currencies, setCurrencies] = useState(() => ["AUD", "CAD", "CHF", "CNY", "EUR", "GBP", "INR", "JPY", "SGD", "USD"].map((code) => ({ code, name: code })));
  const [currencyListStatus, setCurrencyListStatus] = useState("Loading currency list…");
  const [rateAttempt, setRateAttempt] = useState(0);
  const [exchange, setExchange] = useState(null);
  const [rateStatus, setRateStatus] = useState("Loading reference rates…");
  const [courses, setCourses] = useState([{ id: makeId(), name: "", credits: "3", grade: "A" }]);
  const [bookmarks, setBookmarks] = useState(() => readSaved(STORAGE.bookmarks));
  const [unitType, setUnitType] = useState("Length");
  const [unitFrom, setUnitFrom] = useState("Meter");
  const [unitTo, setUnitTo] = useState("Kilometer");
  const [unitAmount, setUnitAmount] = useState("1");
  const [fitness, setFitness] = useState({ weight: "70", height: "170", age: "28", sex: "female", activity: "moderate", goal: "gain" });
  const [events, setEvents] = useState(() => readSaved(STORAGE.events));
  const [eventDraft, setEventDraft] = useState({ title: "", date: today(), time: "09:00", note: "" });

  useEffect(() => { writeSaved(STORAGE.bookmarks, bookmarks); }, [bookmarks]);
  useEffect(() => { writeSaved(STORAGE.events, events); }, [events]);
  useEffect(() => { writeSaved(STORAGE.layout, layout); }, [layout]);

  useEffect(() => {
    const controller = new AbortController();
    fetchCurrencies(controller.signal).then((values) => {
      setCurrencies(values);
      setCurrencyListStatus(`${values.length} currencies available`);
    }).catch((error) => {
      if (error.name !== "AbortError") setCurrencyListStatus(`${error.message} Using common currencies.`);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setExchange(null);
    setRateStatus(fromCurrency === toCurrency ? "Same currency · 1:1" : "Loading reference rates…");
    fetchExchangeRate(fromCurrency, toCurrency, controller.signal)
      .then((result) => {
        setExchange(result);
        const freshness = result.cached ? " · last known rate (provider unavailable)" : "";
        setRateStatus(fromCurrency === toCurrency
          ? `Same currency · 1:1 · checked ${result.date}`
          : `Reference rate · ${result.date} · ${result.provider || "rate provider"}${freshness}`);
      })
      .catch((error) => { if (error.name !== "AbortError") setRateStatus(error.message); });
    return () => controller.abort();
  }, [fromCurrency, toCurrency, rateAttempt]);

  const finance = useMemo(() => {
    const p = Number(principal);
    const r = Number(rate) / 100;
    const t = Number(years);
    if (![p, r, t].every(Number.isFinite) || p < 0 || r < 0 || t < 0) return { interest: 0, total: 0 };
    const total = compound ? p * (1 + r) ** t : p * (1 + r * t);
    return { interest: total - p, total };
  }, [principal, rate, years, compound]);
  const cgpa = useMemo(() => {
    const valid = courses.filter((course) => Number(course.credits) > 0);
    const credits = valid.reduce((sum, course) => sum + Number(course.credits), 0);
    const points = valid.reduce((sum, course) => sum + Number(course.credits) * gradePoints[course.grade], 0);
    return { value: credits ? points / credits : 0, credits };
  }, [courses]);
  const unitResult = useMemo(() => {
    const value = Number(unitAmount);
    if (!Number.isFinite(value)) return NaN;
    if (unitType === "Temperature") {
      const celsius = unitFrom === "Fahrenheit" ? (value - 32) * 5 / 9 : unitFrom === "Kelvin" ? value - 273.15 : value;
      return unitTo === "Fahrenheit" ? celsius * 9 / 5 + 32 : unitTo === "Kelvin" ? celsius + 273.15 : celsius;
    }
    return value * units[unitType][unitFrom] / units[unitType][unitTo];
  }, [unitAmount, unitFrom, unitTo, unitType]);
  const fitnessPlan = useMemo(() => calculateFitnessPlan(fitness), [fitness]);
  const amountValue = Number(currencyAmount);
  const currencyAmountValid = currencyAmount.trim() !== "" && Number.isFinite(amountValue) && amountValue >= 0;
  const convertedAmount = exchange && currencyAmountValid ? convertCurrency(amountValue, exchange.rate) : null;

  const calculateMath = async () => {
    try {
      const { evaluate } = await import("mathjs");
      const result = evaluate(expression);
      if (typeof result !== "number" || !Number.isFinite(result)) throw new Error("Expression must return a finite number.");
      setMathResult(format(result));
      setMathError("");
    } catch { setMathError("Enter a valid expression, for example sin(pi / 2), sqrt(25), or 2^8."); }
  };
  const appendFunction = (fn) => setExpression((value) => {
    const separator = value && /[\d)]$/.test(value) ? " * " : "";
    return `${value}${separator}${fn === "pi" || fn === "e" ? fn : `${fn}(`}`;
  });
  const saveBookmark = () => {
    const details = tab === "math" ? { title: expression, result: `= ${mathResult}`, type: "Scientific" }
      : tab === "money" ? { title: `${compound ? "Compound" : "Simple"} interest · ${rate}% for ${years} years`, result: money(finance.total, "INR"), type: "Interest" }
        : tab === "cgpa" ? { title: `${cgpa.credits} total credits`, result: `CGPA ${cgpa.value.toFixed(2)}`, type: "CGPA" }
          : tab === "currency" ? { title: `${currencyAmount} ${fromCurrency} → ${toCurrency}`, result: convertedAmount !== null ? money(convertedAmount, toCurrency) : "Rate unavailable", type: "Currency" }
            : tab === "units" ? { title: `${unitAmount} ${unitFrom} → ${unitTo}`, result: `${format(unitResult)} ${unitTo}`, type: "Units" }
              : { title: `${fitness.goal === "gain" ? "Gain" : "Loss"} plan`, result: fitnessPlan ? `${fitnessPlan.calories} kcal/day` : "Add valid measurements", type: "Fitness" };
    setBookmarks((items) => [{ id: makeId(), ...details }, ...items]);
  };
  const updateFitness = (field, value) => setFitness((current) => ({ ...current, [field]: value }));
  const addEvent = (event) => {
    event.preventDefault();
    if (!eventDraft.title.trim() || !eventDraft.date) return;
    setEvents((items) => [...items, { id: makeId(), ...eventDraft, title: eventDraft.title.trim() }].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)));
    setEventDraft((draft) => ({ ...draft, title: "", note: "" }));
  };
  const select = (value, onChange, options, label, names = null) => <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{names?.[option] || option}</option>)}</select>;
  const tools = [
    ["math", Calculator, "Scientific"], ["currency", ArrowLeftRight, "Currency"], ["money", Landmark, "Interest"],
    ["cgpa", GraduationCap, "CGPA"], ["units", Ruler, "Units"], ["fitness", Activity, "Fitness"],
    ["calendar", CalendarDays, "Calendar"],
  ];

  return <main className={`app-shell layout-${layout}`}>
    <header className="topbar">
      <a href="#" className="brand" aria-label="CalcMind home"><span className="brand-icon"><Calculator size={19} /></span><span>Calc<span className="brand-accent">Mind</span></span></a>
      <div className="topbar-actions">
        <Link className="help-link" to="/help"><CircleHelp size={16} /> Help portal</Link>
        <label className="layout-picker">Layout {select(layout, setLayout, ["standard", "compact", "focus"], "Choose layout", { standard: "Standard", compact: "Compact", focus: "Focus" })}</label>
        <button className="bookmark-button" onClick={() => document.getElementById("saved")?.scrollIntoView({ behavior: "smooth" })}><Bookmark size={16} /> Saved <span>{bookmarks.length}</span></button>
      </div>
    </header>
    <section className="hero-copy">
      <p className="eyebrow"><Sparkles size={13} /> YOUR EVERYDAY CALCULATION SPACE</p>
      <h1>Make room for <em>what’s next.</em></h1>
      <p>A thoughtful workspace for calculations, wellness planning, and everyday decisions.</p>
      <div className="hero-stats"><span><strong>07</strong> practical tools</span><span><strong>Private</strong> by design</span><span><strong>Help</strong> when you need it</span></div>
    </section>
    <nav className="tabs" aria-label="Calculator tools">{tools.map(([id, Icon, label]) => <button key={id} aria-current={tab === id ? "page" : undefined} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><Icon size={17} /> {label}</button>)}</nav>

    <section className="workspace">
      {tab === "math" && <div className="calculator-panel">
        <ToolHeading eyebrow="SCIENTIFIC CALCULATOR" title="Make a little math." onSave={saveBookmark} />
        <label htmlFor="expression">Expression <span className="hint">Trigonometry uses radians</span></label>
        <div className="expression-row"><input id="expression" value={expression} onChange={(event) => setExpression(event.target.value)} onKeyDown={(event) => event.key === "Enter" && calculateMath()} /><button onClick={calculateMath}>Calculate <ChevronRight size={17} /></button></div>
        <div className="function-keys">{["sin", "cos", "tan", "log", "sqrt", "abs", "pi", "e"].map((fn) => <button key={fn} onClick={() => appendFunction(fn)}>{fn}</button>)}</div>
        {mathError && <p className="error" role="alert">{mathError}</p>}
        <ResultCard label="ANSWER" value={mathResult} detail="Supports arithmetic, powers, brackets, trigonometry, logarithms, and more." />
      </div>}

      {tab === "currency" && <div className="calculator-panel">
        <ToolHeading eyebrow="LIVE REFERENCE RATES" title="A world of currencies." onSave={saveBookmark} />
        <label htmlFor="currency-amount">Amount to convert</label><input id="currency-amount" className="wide-input" type="number" min="0" step="any" value={currencyAmount} onChange={(event) => setCurrencyAmount(event.target.value)} />
        <div className="conversion-grid"><label>From{select(fromCurrency, setFromCurrency, currencies.map(({ code }) => code), "From currency", Object.fromEntries(currencies.map(({ code, name }) => [code, `${code} · ${name}`])))}</label><button className="swap-button" aria-label="Swap currencies" onClick={() => { setFromCurrency(toCurrency); setToCurrency(fromCurrency); }}><ArrowLeftRight size={18} /></button><label>To{select(toCurrency, setToCurrency, currencies.map(({ code }) => code), "To currency", Object.fromEntries(currencies.map(({ code, name }) => [code, `${code} · ${name}`])))}</label></div>
        <p className="currency-list-status" role="status">{currencyListStatus}</p>
        <ResultCard label="CONVERTED AMOUNT" value={convertedAmount !== null ? money(convertedAmount, toCurrency) : "—"} detail={`${rateStatus}${exchange ? ` · 1 ${fromCurrency} = ${format(exchange.rate)} ${toCurrency}` : ""}`} />
        {currencyAmount !== "" && !currencyAmountValid && <p className="error" role="alert">Enter a valid amount of zero or more.</p>}
        <button className="retry-rates" onClick={() => setRateAttempt((attempt) => attempt + 1)}><RefreshCw size={14} /> Refresh reference rate</button>
        <p className="fine-print">Reference rates are from Frankfurter, updated on business days, and are not a quote from your bank or card provider.</p>
      </div>}

      {tab === "money" && <div className="calculator-panel">
        <ToolHeading eyebrow="INTEREST PLANNER" title="Give your savings a timeline." onSave={saveBookmark} />
        <div className="form-grid">
          <label>Principal amount (INR)<input type="number" min="0" value={principal} onChange={(event) => setPrincipal(event.target.value)} /></label>
          <label>Annual interest rate (%)<input type="number" min="0" step="0.1" value={rate} onChange={(event) => setRate(event.target.value)} /></label>
          <label>Time (years)<input type="number" min="0" step="0.5" value={years} onChange={(event) => setYears(event.target.value)} /></label>
          <label>Interest type<select value={compound ? "compound" : "simple"} onChange={(event) => setCompound(event.target.value === "compound")}><option value="compound">Compound annually</option><option value="simple">Simple interest</option></select></label>
        </div>
        <div className="money-results"><div><span>Interest earned</span><strong>{money(finance.interest, "INR")}</strong></div><div><span>Total amount</span><strong>{money(finance.total, "INR")}</strong></div></div>
      </div>}

      {tab === "cgpa" && <div className="calculator-panel">
        <ToolHeading eyebrow="GRADE POINT AVERAGE" title="Keep your progress in view." onSave={saveBookmark} />
        <p className="subtle-copy">Add each course’s credit value and grade to calculate a weighted average.</p>
        <div className="course-head"><span>Course name</span><span>Credits</span><span>Grade</span><span /></div>
        {courses.map((course) => <div className="course-row" key={course.id}><input aria-label="Course name" placeholder="e.g. Mathematics" value={course.name} onChange={(event) => setCourses((items) => items.map((item) => item.id === course.id ? { ...item, name: event.target.value } : item))} /><input aria-label="Credits" type="number" min="0" step="0.5" value={course.credits} onChange={(event) => setCourses((items) => items.map((item) => item.id === course.id ? { ...item, credits: event.target.value } : item))} />{select(course.grade, (grade) => setCourses((items) => items.map((item) => item.id === course.id ? { ...item, grade } : item)), Object.keys(gradePoints), "Grade")}<button className="delete" aria-label="Remove course" onClick={() => setCourses((items) => items.filter((item) => item.id !== course.id))}><Trash2 size={16} /></button></div>)}
        <button className="add-course" onClick={() => setCourses((items) => [...items, { id: makeId(), name: "", credits: "3", grade: "A" }])}><Plus size={16} /> Add a course</button>
        <div className="cgpa-result"><span>Weighted CGPA<small>Across {cgpa.credits} credits</small></span><strong>{cgpa.value.toFixed(2)}<small>/ 10.00</small></strong></div>
      </div>}

      {tab === "units" && <div className="calculator-panel">
        <ToolHeading eyebrow="UNIT CONVERTER" title="Scale everyday measurements." onSave={saveBookmark} />
        <label>Measurement type</label><div className="type-chips">{Object.keys(units).map((type) => <button className={type === unitType ? "selected" : ""} key={type} onClick={() => { setUnitType(type); setUnitFrom(Object.keys(units[type])[0]); setUnitTo(Object.keys(units[type])[1]); }}>{type}</button>)}</div>
        <label className="amount-label" htmlFor="unit-amount">Amount</label><input id="unit-amount" className="wide-input" type="number" value={unitAmount} onChange={(event) => setUnitAmount(event.target.value)} />
        <div className="conversion-grid"><label>From{select(unitFrom, setUnitFrom, Object.keys(units[unitType]), "From unit")}</label><button className="swap-button" aria-label="Swap units" onClick={() => { setUnitFrom(unitTo); setUnitTo(unitFrom); }}><ArrowLeftRight size={18} /></button><label>To{select(unitTo, setUnitTo, Object.keys(units[unitType]), "To unit")}</label></div>
        <ResultCard label="CONVERTED VALUE" value={`${format(unitResult)} ${unitTo}`} />
      </div>}

      {tab === "fitness" && <div className="calculator-panel">
        <ToolHeading eyebrow="FITNESS PLANNER" title="Train toward your next milestone." onSave={saveBookmark} />
        <p className="subtle-copy">A practical starting point for a gradual weight-gain or weight-loss plan.</p>
        <div className="form-grid">
          <label>Current weight (kg)<input type="number" min="1" step="0.1" value={fitness.weight} onChange={(event) => updateFitness("weight", event.target.value)} /></label>
          <label>Height (cm)<input type="number" min="1" step="0.1" value={fitness.height} onChange={(event) => updateFitness("height", event.target.value)} /></label>
          <label>Age (years)<input type="number" min="16" max="100" value={fitness.age} onChange={(event) => updateFitness("age", event.target.value)} /></label>
          <label>Calculation profile<select value={fitness.sex} onChange={(event) => updateFitness("sex", event.target.value)}><option value="female">Female formula</option><option value="male">Male formula</option></select></label>
          <label>Activity level<select value={fitness.activity} onChange={(event) => updateFitness("activity", event.target.value)}><option value="sedentary">Mostly seated</option><option value="light">Light activity</option><option value="moderate">Moderately active</option><option value="active">Very active</option><option value="athlete">Athlete / intense training</option></select></label>
          <label>Your goal<select value={fitness.goal} onChange={(event) => updateFitness("goal", event.target.value)}><option value="gain">Gain weight gradually</option><option value="loss">Lose weight gradually</option></select></label>
        </div>
        {fitnessPlan ? <div className="fitness-results">
          <div className="fitness-primary"><span>DAILY CALORIE STARTING POINT</span><strong>{fitnessPlan.calories.toLocaleString()} <small>kcal</small></strong><p>Estimated maintenance: {fitnessPlan.maintenance.toLocaleString()} kcal/day</p></div>
          <div className="fitness-metrics"><div><span>Protein starting point</span><strong>{fitnessPlan.protein} g/day</strong></div><div><span>Gradual pace estimate</span><strong>~{fitnessPlan.weeklyChange} kg/week</strong></div></div>
        </div> : <p className="error" role="alert">Enter valid age, height, and weight to calculate a plan.</p>}
        <p className="fine-print">Estimate uses Mifflin–St Jeor and a modest calorie adjustment. Individual needs vary; this is not medical advice. Avoid aggressive restriction and consult a professional if you have health concerns.</p>
      </div>}

      {tab === "calendar" && <div className="calculator-panel">
        <ToolHeading eyebrow="YOUR SCHEDULE" title="Put good intentions on the calendar." />
        <p className="subtle-copy">Add workout sessions, weigh-ins, or personal milestones. Your schedule stays in this browser.</p>
        <form className="event-form" onSubmit={addEvent}>
          <label>Event<input required maxLength="80" placeholder="e.g. Upper body training" value={eventDraft.title} onChange={(event) => setEventDraft((draft) => ({ ...draft, title: event.target.value }))} /></label>
          <label>Date<input required type="date" value={eventDraft.date} onChange={(event) => setEventDraft((draft) => ({ ...draft, date: event.target.value }))} /></label>
          <label>Time<input required type="time" value={eventDraft.time} onChange={(event) => setEventDraft((draft) => ({ ...draft, time: event.target.value }))} /></label>
          <label className="event-note">Note (optional)<input maxLength="180" placeholder="A reminder for future you" value={eventDraft.note} onChange={(event) => setEventDraft((draft) => ({ ...draft, note: event.target.value }))} /></label>
          <button className="primary-button"><Plus size={16} /> Add to calendar</button>
        </form>
        <h3 className="list-heading">Upcoming schedule</h3>
        {events.filter((event) => event.date >= today()).length ? <div className="event-list">{events.filter((event) => event.date >= today()).map((event) => <article key={event.id}><div className="event-date"><strong>{new Date(`${event.date}T12:00:00`).toLocaleDateString(undefined, { day: "2-digit" })}</strong><span>{new Date(`${event.date}T12:00:00`).toLocaleDateString(undefined, { month: "short" })}</span></div><div className="event-copy"><strong>{event.title}</strong><span>{event.time}{event.note ? ` · ${event.note}` : ""}</span></div><button className="delete" aria-label={`Remove ${event.title}`} onClick={() => setEvents((items) => items.filter((item) => item.id !== event.id))}><Trash2 size={16} /></button></article>)}</div> : <div className="empty"><CalendarDays size={22} /><p>Nothing scheduled yet.</p><small>Add a session above to start your calendar.</small></div>}
      </div>}

    </section>

    <section id="saved" className="saved-section">
      <div className="saved-title"><div><p className="eyebrow">YOUR SHORTLIST</p><h2>Saved calculations</h2></div>{bookmarks.length > 0 && <button className="clear" onClick={() => setBookmarks([])}>Clear all</button>}</div>
      {bookmarks.length === 0 ? <div className="empty"><Bookmark size={22} /><p>No saved calculations yet.</p><small>Save a result to keep it close at hand.</small></div> : <div className="bookmark-list">{bookmarks.map((item) => <article key={item.id}><span className="type-pill">{item.type}</span><div><p>{item.title}</p><strong>{item.result}</strong></div><button aria-label="Delete saved calculation" onClick={() => setBookmarks((items) => items.filter((saved) => saved.id !== item.id))}><Trash2 size={16} /></button></article>)}</div>}
    </section>
    <footer><span>CalcMind</span> · A focused workspace for everyday calculations. Your saved data stays in this browser.</footer>
  </main>;
}

function ToolHeading({ eyebrow, title, onSave }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{onSave && <button className="save-text" onClick={onSave}><Bookmark size={15} /> Save result</button>}</div>;
}

function ResultCard({ label, value, detail }) {
  return <div className="result-card"><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div>;
}

export default App;
