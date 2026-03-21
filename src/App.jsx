import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   ARIA — AI Complaint Intelligence System
   Union Bank of India | Vercel-Ready Single File
   Customer View + Real-time Admin Dashboard
═══════════════════════════════════════════════════════════ */

// ── IN-MEMORY STORE (shared state) ───────────────────────
let complaintStore = [
  { id:"CMP-001", message:"I was charged double EMI this month, ₹4,200 extra debited from my account without any reason.", category:"Billing", sentiment:"Negative", priority:"High", status:"Resolved", time:"09:14 AM", reply:"We sincerely apologize for the double debit. Our billing team has reversed ₹4,200 to your account. Refund will reflect in 2-3 working days.", risk:"Medium" },
  { id:"CMP-002", message:"Net banking password reset is not working, I cannot login since yesterday.", category:"Technical", sentiment:"Neutral", priority:"Medium", status:"In Progress", time:"10:22 AM", reply:"Our technical team is aware and working on the issue. As a workaround, please use our mobile app or visit your nearest branch.", risk:"Low" },
  { id:"CMP-003", message:"Someone called pretending to be a bank employee and asked for my OTP. I think my account is compromised.", category:"Fraud", sentiment:"Negative", priority:"High", status:"Open", time:"11:45 AM", reply:"URGENT: We have immediately blocked suspicious activity on your account. Our fraud team will call you within 1 hour. Do NOT share OTP with anyone.", risk:"High" },
];
let storeListeners = [];
function notifyListeners() { storeListeners.forEach(fn => fn([...complaintStore])); }
function addComplaint(c) { complaintStore = [c, ...complaintStore]; notifyListeners(); }
function useComplaintStore() {
  const [data, setData] = useState([...complaintStore]);
  useEffect(() => {
    storeListeners.push(setData);
    return () => { storeListeners = storeListeners.filter(fn => fn !== setData); };
  }, []);
  return data;
}

// ── AI ENGINE (smart mock + optional API) ────────────────
async function analyzeComplaint(msg) {
  const m = msg.toLowerCase();
  const isFraud = /fraud|unauthorized|stolen|hack|otp|scam|phish|compromis/i.test(m);
  const isBilling = /bill|charg|debit|emi|refund|amount|double|extra|wrong/i.test(m);
  const isTech = /login|app|website|password|error|access|crash|slow|not work/i.test(m);
  const isAngry = /worst|terrible|angry|unacceptable|immediately|urgent|disgusting|furious/i.test(m);
  const category = isFraud ? "Fraud" : isBilling ? "Billing" : isTech ? "Technical" : "Service";
  const sentiment = isAngry || isFraud ? "Negative" : /thank|good|great|happy|satisfied/i.test(m) ? "Positive" : "Neutral";
  const priority = isFraud || isAngry ? "High" : isBilling || isTech ? "Medium" : "Low";
  const risk = isFraud ? "High" : priority === "Medium" ? "Medium" : "Low";

  try {
    const prompt = `You are an expert banking complaint analyst for Union Bank of India.
Analyze this complaint and return ONLY valid JSON (no markdown):
"${msg}"

{
  "summary": "2-3 sentence professional summary",
  "suggestedAction": "specific next action for the bank agent",
  "reply": "empathetic professional reply to customer in 2-3 sentences"
}`;
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 500 } })
    });
    if (res.ok) {
      const data = await res.json();
      const text = data.content ? data.content.map(i => i.text || "").join("") : data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (text) {
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        return { category, sentiment, priority, risk, ...parsed };
      }
    }
  } catch (e) {}

  // Smart fallback
  const replies = {
    Fraud: "URGENT: We have immediately flagged your account for security review. Our fraud investigation team has been alerted and will contact you within 2 hours. Please do not share any OTPs or passwords with anyone — Union Bank will never ask for these.",
    Billing: "We sincerely apologize for the billing issue you've experienced. Our accounts team has been notified and will investigate immediately. A resolution and any applicable refund will be processed within 3–5 working days.",
    Technical: "We understand how frustrating technical issues can be. Our technical team has been alerted and is working to resolve this. In the meantime, please try our mobile app or visit your nearest branch for assistance.",
    Service: "Thank you for reaching out to Union Bank. We have registered your complaint and assigned it to our customer service team for priority resolution. You will receive a callback within 4 business hours.",
  };
  const summaries = {
    Fraud: "Customer reports a potential fraud or security compromise on their account. Immediate investigation and account protection measures are required.",
    Billing: "Customer has raised a billing discrepancy complaint. The reported amount needs to be verified and corrected by the billing team.",
    Technical: "Customer is experiencing technical difficulties with banking services. The issue needs to be escalated to the technical support team.",
    Service: "Customer has raised a general service complaint. Requires assignment to the appropriate service resolution team.",
  };
  const actions = {
    Fraud: "Block account transactions immediately. Escalate to fraud investigation team. Call customer within 1 hour.",
    Billing: "Verify transaction records for the reported period. Initiate reversal if double charge confirmed. Update customer via SMS.",
    Technical: "Log technical ticket with IT team. Check system status for outages. Provide customer with alternative access methods.",
    Service: "Assign to nearest branch relationship manager. Schedule callback within 4 hours. Log in CRM system.",
  };
  return { category, sentiment, priority, risk, reply: replies[category], summary: summaries[category], suggestedAction: actions[category] };
}

// ── HELPERS ───────────────────────────────────────────────
let cmpCounter = 4;
function genId() { return `CMP-00${cmpCounter++}`; }
function timeNow() { return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }); }

const PRI_COLOR = { High: { bg: "#1a0000", border: "#7f1d1d", text: "#fca5a5", dot: "#ef4444" }, Medium: { bg: "#1a1200", border: "#78350f", text: "#fcd34d", dot: "#f59e0b" }, Low: { bg: "#001a0a", border: "#14532d", text: "#86efac", dot: "#22c55e" } };
const CAT_COLOR = { Fraud: "#ef4444", Billing: "#f59e0b", Technical: "#60a5fa", Service: "#a78bfa" };
const SENT_COLOR = { Negative: "#ef4444", Neutral: "#94a3b8", Positive: "#22c55e" };

// ── ICONS ─────────────────────────────────────────────────
const Icons = {
  Send: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Shield: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Dashboard: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  User: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Brain: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9.5 2a2.5 2.5 0 0 1 5 0"/><path d="M9.5 2C6 2 4 5 4 8s1 5 2 6l1 7h10l1-7c1-1 2-3 2-6s-2-6-5.5-6"/><path d="M12 6v7M9 10h6"/></svg>,
  X: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Alert: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Check: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  Zap: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Search: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  ArrowRight: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
};

// ═══════════════════════════════════════════════════════════
// CUSTOMER VIEW
// ═══════════════════════════════════════════════════════════
function CustomerView({ onSwitch }) {
  const [messages, setMessages] = useState([
    { from: "aria", text: "Hello! I'm ARIA, your AI complaint assistant for Union Bank of India. Please describe your issue and I'll analyze it instantly.", time: timeNow() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const submit = useCallback(async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages(p => [...p, { from: "user", text: msg, time: timeNow() }]);
    setLoading(true);
    setResult(null);

    setMessages(p => [...p, { from: "aria", text: "Analyzing your complaint with AI...", time: timeNow(), isTyping: true }]);

    await new Promise(r => setTimeout(r, 1800));
    const ai = await analyzeComplaint(msg);
    const id = genId();

    addComplaint({ id, message: msg, category: ai.category, sentiment: ai.sentiment, priority: ai.priority, status: "Open", time: timeNow(), reply: ai.reply, risk: ai.risk, summary: ai.summary, suggestedAction: ai.suggestedAction });

    setMessages(p => p.filter(m => !m.isTyping));
    setMessages(p => [...p, { from: "aria", text: ai.reply, time: timeNow(), isResult: true, ai, id }]);
    setResult({ ai, id });
    setLoading(false);
  }, [input, loading]);

  const onKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } };

  const pri = result ? PRI_COLOR[result.ai.priority] : null;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0e27 0%, #1a0533 50%, #0d1b3e 100%)", display: "flex", flexDirection: "column", fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .msg-in{animation:fadeUp .35s ease forwards}
        .dot{animation:pulse 1.2s ease-in-out infinite}
        .dot:nth-child(2){animation-delay:.2s}
        .dot:nth-child(3){animation-delay:.4s}
        .glass{background:rgba(255,255,255,0.06);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12)}
        .glass-dark{background:rgba(0,0,0,0.3);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.08)}
        .send-btn{background:linear-gradient(135deg,#7c3aed,#3b82f6);border:none;cursor:pointer;transition:all .2s}
        .send-btn:hover{transform:scale(1.05);opacity:.9}
        .send-btn:disabled{opacity:.4;cursor:not-allowed;transform:none}
        .inp{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:white;outline:none;transition:border .2s}
        .inp:focus{border-color:rgba(124,58,237,0.6)}
        .inp::placeholder{color:rgba(255,255,255,0.35)}
        .switch-btn{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:white;cursor:pointer;transition:all .2s}
        .switch-btn:hover{background:rgba(255,255,255,0.15)}
        .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:500}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:2px}
      `}</style>

      {/* Header */}
      <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icons.Shield />
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 600, fontSize: 15 }}>ARIA</div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>AI Complaint Intelligence · Union Bank</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Online</span>
          <button className="switch-btn" onClick={onSwitch} style={{ marginLeft: 8, padding: "6px 14px", borderRadius: 8, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <Icons.Dashboard /> Admin Dashboard
          </button>
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: "16px", maxWidth: 720, width: "100%", margin: "0 auto" }}>

        {messages.map((msg, i) => (
          <div key={i} className="msg-in" style={{ display: "flex", gap: 10, flexDirection: msg.from === "user" ? "row-reverse" : "row", alignItems: "flex-end" }}>
            {msg.from === "aria" && (
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icons.Brain />
              </div>
            )}
            <div style={{ maxWidth: "75%" }}>
              {msg.isTyping ? (
                <div className="glass" style={{ padding: "12px 16px", borderRadius: "18px 18px 18px 4px", display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    {[0,1,2].map(n => (
                      <div key={n} className="dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa" }} />
                    ))}
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>ARIA Engine analyzing…</span>
                </div>
              ) : (
                <div className={msg.from === "user" ? "glass-dark" : "glass"} style={{ padding: "12px 16px", borderRadius: msg.from === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px" }}>
                  <p style={{ color: "white", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{msg.text}</p>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginTop: 4, textAlign: msg.from === "user" ? "right" : "left" }}>{msg.time}</div>
                </div>
              )}

              {/* AI Result Card */}
              {msg.isResult && msg.ai && (
                <div className="msg-in glass" style={{ marginTop: 8, borderRadius: 14, padding: 14, border: `1px solid ${CAT_COLOR[msg.ai.category]}40` }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    <span className="badge" style={{ background: `${CAT_COLOR[msg.ai.category]}20`, color: CAT_COLOR[msg.ai.category], border: `1px solid ${CAT_COLOR[msg.ai.category]}40` }}>
                      {msg.ai.category}
                    </span>
                    <span className="badge" style={{ background: `${SENT_COLOR[msg.ai.sentiment]}20`, color: SENT_COLOR[msg.ai.sentiment], border: `1px solid ${SENT_COLOR[msg.ai.sentiment]}40` }}>
                      {msg.ai.sentiment}
                    </span>
                    <span className="badge" style={{ background: PRI_COLOR[msg.ai.priority].bg, color: PRI_COLOR[msg.ai.priority].text, border: `1px solid ${PRI_COLOR[msg.ai.priority].border}` }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: PRI_COLOR[msg.ai.priority].dot, display: "inline-block" }} />
                      {msg.ai.priority} Priority
                    </span>
                    <span className="badge" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 10 }}>
                      {msg.id}
                    </span>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}>
                    <Icons.Check /> Complaint registered · Appears in admin dashboard
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length === 1 && (
        <div style={{ padding: "0 16px 12px", maxWidth: 720, width: "100%", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              "I was charged double EMI this month",
              "Suspicious transaction on my account",
              "Net banking is not working",
              "I need a refund for wrong debit"
            ].map(q => (
              <button key={q} onClick={() => setInput(q)} style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "rgba(255,255,255,0.7)", padding: "6px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer", transition: "all .2s" }}
                onMouseOver={e => e.target.style.background = "rgba(124,58,237,0.3)"}
                onMouseOut={e => e.target.style.background = "rgba(124,58,237,0.15)"}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "12px 16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)", maxWidth: 720, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            className="inp"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Describe your complaint… (Press Enter to send)"
            rows={2}
            style={{ flex: 1, borderRadius: 14, padding: "12px 16px", fontSize: 13, resize: "none", lineHeight: 1.5 }}
          />
          <button className="send-btn" onClick={submit} disabled={!input.trim() || loading}
            style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
            {loading ? <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : <Icons.Send />}
          </button>
        </div>
        <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, marginTop: 6, textAlign: "center" }}>
          Powered by ARIA Intelligence Engine · Union Bank of India · Hackathon 2025
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════
function AdminDashboard({ onSwitch }) {
  const complaints = useComplaintStore();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [newIds, setNewIds] = useState(new Set());
  const prevLen = useRef(complaints.length);

  useEffect(() => {
    if (complaints.length > prevLen.current) {
      const newest = complaints[0];
      setNewIds(s => new Set([...s, newest.id]));
      setTimeout(() => setNewIds(s => { const n = new Set(s); n.delete(newest.id); return n; }), 3000);
    }
    prevLen.current = complaints.length;
  }, [complaints]);

  const filtered = complaints.filter(c => {
    const matchF = filter === "All" || c.priority === filter || c.category === filter || c.status === filter;
    const matchS = !search || c.message.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase());
    return matchF && matchS;
  });

  const stats = {
    total: complaints.length,
    high: complaints.filter(c => c.priority === "High").length,
    open: complaints.filter(c => c.status === "Open").length,
    fraud: complaints.filter(c => c.category === "Fraud").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #060d1f 0%, #0d1b3e 60%, #150d2e 100%)", fontFamily: "'Outfit', 'Inter', sans-serif", color: "white" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}50%{box-shadow:0 0 0 4px rgba(239,68,68,0.25)}}
        .fade-in{animation:fadeIn .3s ease forwards}
        .new-row{animation:glow .8s ease 3}
        .row-hover:hover{background:rgba(255,255,255,0.04)!important;cursor:pointer}
        .filter-btn{border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.55);background:transparent;cursor:pointer;padding:5px 12px;border-radius:6px;font-size:11px;transition:all .2s}
        .filter-btn.active{background:rgba(124,58,237,0.25);border-color:rgba(124,58,237,0.5);color:white}
        .filter-btn:hover{background:rgba(255,255,255,0.08)}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px}
        table{border-collapse:collapse;width:100%}
        th{text-align:left;padding:10px 14px;font-size:10px;font-weight:500;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid rgba(255,255,255,0.07)}
        td{padding:11px 14px;font-size:12px;border-bottom:1px solid rgba(255,255,255,0.05)}
      `}</style>

      {/* Header */}
      <div style={{ padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icons.Shield />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>ARIA Admin Dashboard</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>Real-time Complaint Intelligence · Union Bank of India</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "glow 2s infinite" }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Live</span>
          </div>
          <button onClick={onSwitch} style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", color: "white", padding: "6px 14px", borderRadius: 8, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Icons.User /> Customer View
          </button>
        </div>
      </div>

      <div style={{ padding: "20px 24px", maxWidth: 1400, margin: "0 auto" }}>

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total Complaints", value: stats.total, color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)" },
            { label: "High Priority", value: stats.high, color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" },
            { label: "Open Cases", value: stats.open, color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
            { label: "Fraud Cases", value: stats.fraud, color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)" },
          ].map(k => (
            <div key={k.label} style={{ background: k.bg, border: `1px solid ${k.border}`, borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>{k.label}</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: k.color, lineHeight: 1 }}>{k.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 340px" : "1fr", gap: 16 }}>
          {/* Table */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
            {/* Toolbar */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 160 }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search complaints…"
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: 8, padding: "6px 10px 6px 28px", fontSize: 11, outline: "none", boxSizing: "border-box" }} />
                <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }}><Icons.Search /></span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["All","High","Medium","Low","Fraud","Billing","Technical","Open","Resolved"].map(f => (
                  <button key={f} className={`filter-btn ${filter===f?"active":""}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, marginLeft: "auto" }}>{filtered.length} records</span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Complaint</th><th>Category</th><th>Sentiment</th><th>Priority</th><th>Status</th><th>Time</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const pri = PRI_COLOR[c.priority];
                    const isNew = newIds.has(c.id);
                    const isSelected = selected?.id === c.id;
                    return (
                      <tr key={c.id} className={`row-hover fade-in ${isNew?"new-row":""}`}
                        onClick={() => setSelected(isSelected ? null : c)}
                        style={{ background: isSelected ? "rgba(124,58,237,0.12)" : isNew ? "rgba(239,68,68,0.06)" : "transparent", transition: "background .2s" }}>
                        <td style={{ fontFamily: "monospace", color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
                          {isNew && <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#ef4444", marginRight: 5, verticalAlign: "middle" }} />}
                          {c.id}
                        </td>
                        <td style={{ color: "rgba(255,255,255,0.8)", maxWidth: 220 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.message}</div>
                        </td>
                        <td>
                          <span style={{ background: `${CAT_COLOR[c.category]}18`, color: CAT_COLOR[c.category], border: `1px solid ${CAT_COLOR[c.category]}35`, padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 500 }}>{c.category}</span>
                        </td>
                        <td>
                          <span style={{ color: SENT_COLOR[c.sentiment], fontSize: 11 }}>
                            <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: SENT_COLOR[c.sentiment], marginRight: 5, verticalAlign: "middle" }} />
                            {c.sentiment}
                          </span>
                        </td>
                        <td>
                          <span style={{ background: pri.bg, color: pri.text, border: `1px solid ${pri.border}`, padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <span style={{ width: 4, height: 4, borderRadius: "50%", background: pri.dot }} />{c.priority}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: c.status === "Resolved" ? "#22c55e" : c.status === "In Progress" ? "#f59e0b" : "#94a3b8", fontSize: 11 }}>
                            {c.status === "Resolved" && <Icons.Check />} {c.status}
                          </span>
                        </td>
                        <td style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>{c.time}</td>
                        <td>
                          <button onClick={e => { e.stopPropagation(); setSelected(isSelected ? null : c); }}
                            style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)", color: "rgba(167,139,250,0.8)", padding: "3px 8px", borderRadius: 6, fontSize: 10, cursor: "pointer" }}>
                            {isSelected ? "Close" : "Insights"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>No complaints found</div>
              )}
            </div>
          </div>

          {/* AI Insights Panel */}
          {selected && (
            <div className="fade-in" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 14, overflow: "hidden", height: "fit-content" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icons.Brain />
                  <span style={{ fontWeight: 500, fontSize: 13 }}>AI Insights</span>
                  <span style={{ background: "rgba(124,58,237,0.3)", color: "#a78bfa", padding: "1px 8px", borderRadius: 99, fontSize: 10 }}>ARIA</span>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 4 }}><Icons.X /></button>
              </div>

              <div style={{ padding: 16 }}>
                {/* ID + Badges */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: "monospace", color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 8 }}>{selected.id} · {selected.time}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ background: `${CAT_COLOR[selected.category]}20`, color: CAT_COLOR[selected.category], border: `1px solid ${CAT_COLOR[selected.category]}40`, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500 }}>{selected.category}</span>
                    <span style={{ background: PRI_COLOR[selected.priority].bg, color: PRI_COLOR[selected.priority].text, border: `1px solid ${PRI_COLOR[selected.priority].border}`, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 500 }}>{selected.priority} Priority</span>
                    <span style={{ background: selected.risk === "High" ? "rgba(239,68,68,0.15)" : selected.risk === "Medium" ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.15)", color: selected.risk === "High" ? "#fca5a5" : selected.risk === "Medium" ? "#fcd34d" : "#86efac", border: `1px solid ${selected.risk === "High" ? "rgba(239,68,68,0.3)" : selected.risk === "Medium" ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.3)"}`, padding: "3px 10px", borderRadius: 99, fontSize: 11 }}>Risk: {selected.risk}</span>
                  </div>
                </div>

                {/* Complaint */}
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px", marginBottom: 12, borderLeft: `3px solid ${CAT_COLOR[selected.category]}` }}>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, marginBottom: 4, textTransform: "uppercase", letterSpacing: ".05em" }}>Complaint</div>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, lineHeight: 1.6, margin: 0 }}>{selected.message}</p>
                </div>

                {/* AI Summary */}
                {selected.summary && (
                  <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, color: "#a78bfa" }}>
                      <Icons.Zap /><span style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".05em" }}>AI Summary</span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11.5, lineHeight: 1.6, margin: 0 }}>{selected.summary}</p>
                  </div>
                )}

                {/* Suggested Action */}
                {selected.suggestedAction && (
                  <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, color: "#fcd34d" }}>
                      <Icons.Alert /><span style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".05em" }}>Suggested Action</span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11.5, lineHeight: 1.6, margin: 0 }}>{selected.suggestedAction}</p>
                  </div>
                )}

                {/* AI Reply */}
                <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "10px 12px", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, color: "#86efac" }}>
                    <Icons.Check /><span style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".05em" }}>AI-Generated Reply</span>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11.5, lineHeight: 1.6, margin: 0 }}>{selected.reply}</p>
                </div>

                {/* Status Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  {["In Progress", "Resolved", "Escalated"].map(s => (
                    <button key={s} onClick={() => {
                      const updated = complaints.map(c => c.id === selected.id ? { ...c, status: s } : c);
                      complaintStore = updated; notifyListeners();
                      setSelected({ ...selected, status: s });
                    }} style={{ flex: 1, padding: "7px 4px", borderRadius: 8, fontSize: 10, cursor: "pointer", fontWeight: 500, transition: "all .2s",
                      background: selected.status === s ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.05)",
                      border: selected.status === s ? "1px solid rgba(124,58,237,0.6)" : "1px solid rgba(255,255,255,0.1)",
                      color: selected.status === s ? "white" : "rgba(255,255,255,0.5)" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 16, textAlign: "center", color: "rgba(255,255,255,0.15)", fontSize: 10 }}>
          ARIA Intelligence Engine · Union Bank of India · iDEA 2.0 Hackathon 2025 · Real-time AI Complaint Processing
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ROOT APP — hash-based routing (zero 404)
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState(window.location.hash === "#admin" ? "admin" : "customer");

  const switchTo = (v) => {
    setView(v);
    window.location.hash = v === "admin" ? "admin" : "";
  };

  return view === "admin"
    ? <AdminDashboard onSwitch={() => switchTo("customer")} />
    : <CustomerView onSwitch={() => switchTo("admin")} />;
}
