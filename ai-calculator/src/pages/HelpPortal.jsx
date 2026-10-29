import { useState } from "react";
import { ArrowLeft, Bot, Calculator, Send, Sparkles, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { localAssistantReply, sendChatMessage } from "../services/assistant.js";

const replyLanguages = [
  ["auto", "Auto-detect"], ["en", "English"], ["es", "Español"], ["fr", "Français"],
  ["hi", "हिन्दी"], ["ta", "தமிழ்"], ["zh", "中文"], ["ar", "العربية"],
];

export default function HelpPortal() {
  const [language, setLanguage] = useState("auto");
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", text: localAssistantReply("hello") }]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message || busy) return;

    setMessages((items) => [...items, { role: "user", text: message }]);
    setDraft("");
    setBusy(true);
    try {
      const reply = await sendChatMessage(message, language);
      setMessages((items) => [...items, { role: "assistant", text: reply }]);
    } catch (error) {
      const fallback = localAssistantReply(message, language);
      setMessages((items) => [...items, {
        role: "assistant",
        text: `${fallback}\n\n${error.message} This reply came from the built-in help guide.`,
      }]);
    } finally {
      setBusy(false);
    }
  };

  return <main className="app-shell help-page">
    <header className="topbar">
      <Link to="/" className="brand" aria-label="Back to CalcMind"><span className="brand-icon"><Calculator size={19} /></span><span>Calc<span className="brand-accent">Mind</span></span></Link>
      <Link to="/" className="help-link"><ArrowLeft size={16} /> Back to calculators</Link>
    </header>
    <section className="hero-copy help-hero">
      <p className="eyebrow"><Sparkles size={13} /> CALCMIND SUPPORT</p>
      <h1>Your own <em>Help portal.</em></h1>
      <p>Ask a question about using CalcMind, doing a calculation, currency conversion, fitness estimates, or your schedule.</p>
    </section>
    <section className="help-workspace">
      <div className="help-panel">
        <div className="help-panel-heading">
          <span className="help-bot-icon"><Bot size={19} /></span>
          <div><strong>CalcMind assistant</strong><small><span className="online-dot" /> Ready to help</small></div>
          <label>Reply in <select aria-label="Reply language" value={language} onChange={(event) => setLanguage(event.target.value)}>{replyLanguages.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>
        </div>
        <div className="chat-history help-chat-history" aria-live="polite">
          {messages.map((message, index) => <article className={`chat-message ${message.role}`} key={`${index}-${message.role}`}>
            <span className="chat-avatar">{message.role === "assistant" ? <Bot size={16} /> : <UserRound size={16} />}</span>
            <p dir="auto">{message.text}</p>
          </article>)}
          {busy && <p className="chat-loading">Preparing a reply…</p>}
        </div>
        <form className="chat-form" onSubmit={sendMessage}>
          <input aria-label="Ask the CalcMind assistant" maxLength="1000" placeholder="Type your question…" value={draft} onChange={(event) => setDraft(event.target.value)} />
          <button aria-label="Send question" disabled={busy || !draft.trim()}><Send size={17} /></button>
        </form>
        <p className="fine-print">The built-in help guide is always available. Add a server-side AI provider key for broader AI answers. Do not share private or sensitive information here.</p>
      </div>
      <aside className="help-topics">
        <h2>Quick help</h2>
        <p>Currency: select source and destination currencies, enter an amount, and check the displayed rate date.</p>
        <p>Scientific: enter an expression such as <code>sqrt(25)</code> or <code>2^8</code>. Trigonometry uses radians.</p>
        <p>Fitness: calorie and protein numbers are general estimates, not medical advice.</p>
        <p>Saved calculations and calendar events stay in this browser.</p>
      </aside>
    </section>
    <footer><span>CalcMind Help</span> · If a live service is unavailable, the built-in help guide provides a fallback reply.</footer>
  </main>;
}
