import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   ARIA — AI Complaint Intelligence System
   Union Bank of India | Premium UI | Hackathon 2025
   Glassmorphism + AI Gradient Theme
═══════════════════════════════════════════════════════════ */

// ── SHARED STORE ──────────────────────────────────────────
let complaintStore = [
  { id:"CMP-001", message:"I was charged double EMI this month, ₹4,200 extra debited from my account without any reason.", category:"Billing", sentiment:"Negative", priority:"High", status:"Resolved", time:"09:14 AM", reply:"We sincerely apologize for the double debit. Our billing team has reversed ₹4,200 to your account. Refund will reflect in 2–3 working days.", risk:"Medium", summary:"Customer reports duplicate EMI deduction causing financial distress. Immediate billing review and reversal required.", suggestedAction:"Verify transaction records, initiate ₹4,200 reversal, confirm via SMS." },
  { id:"CMP-002", message:"Net banking password reset is not working, I cannot login since yesterday.", category:"Technical", sentiment:"Neutral", priority:"Medium", status:"In Progress", time:"10:22 AM", reply:"Our technical team is actively working on the login issue. As a temporary workaround, please use our mobile app or visit your nearest branch.", risk:"Low", summary:"Customer unable to access net banking due to password reset failure. Technical escalation needed.", suggestedAction:"Log IT ticket, check reset service status, provide alternative access." },
  { id:"CMP-003", message:"Someone called pretending to be a bank employee and asked for my OTP. I think my account is compromised.", category:"Fraud", sentiment:"Negative", priority:"High", status:"Open", time:"11:45 AM", reply:"URGENT: We have immediately blocked suspicious activity on your account. Our fraud team will call you within 1 hour. Never share OTP with anyone — Union Bank never asks for this.", risk:"High", summary:"Potential phishing attack reported. Customer may have shared sensitive credentials with fraudster.", suggestedAction:"Block account immediately. Escalate to fraud team. Call customer in 30 minutes." },
  { id:"CMP-004", message:"My loan statement for March is incorrect, the interest calculation seems wrong.", category:"Billing", sentiment:"Neutral", priority:"Medium", status:"Open", time:"01:30 PM", reply:"We have noted your concern about the loan statement. Our accounts team will review the interest calculation and send a corrected statement within 2 working days.", risk:"Low", summary:"Loan interest discrepancy reported by customer. Requires manual verification of calculation method.", suggestedAction:"Pull loan account records, verify interest calculation against RBI guidelines." },
];
let storeListeners = [];
function notifyListeners() { storeListeners.forEach(fn => fn([...complaintStore])); }
function addComplaint(c) { complaintStore = [c, ...complaintStore]; notifyListeners(); }
function useStore() {
  const [data, setData] = useState([...complaintStore]);
  useEffect(() => {
    storeListeners.push(setData);
    return () => { storeListeners = storeListeners.filter(f => f !== setData); };
  }, []);
  return data;
}

// ── AI ENGINE ─────────────────────────────────────────────
async function analyzeComplaint(msg) {
  const m = msg.toLowerCase();
  const isFraud = /fraud|unauthorized|stolen|hack|otp|scam|phish|compromis/i.test(m);
  const isBilling = /bill|charg|debit|emi|refund|amount|double|extra|wrong|statement/i.test(m);
  const isTech = /login|app|website|password|error|access|crash|slow|not work/i.test(m);
  const isAngry = /worst|terrible|angry|unacceptable|immediately|urgent|disgusting|furious/i.test(m);
  const category = isFraud ? "Fraud" : isBilling ? "Billing" : isTech ? "Technical" : "Service";
  const sentiment = isAngry || isFraud ? "Negative" : /thank|good|great|happy|satisfied/i.test(m) ? "Positive" : "Neutral";
  const priority = isFraud || isAngry ? "High" : isBilling || isTech ? "Medium" : "Low";
  const risk = isFraud ? "High" : priority === "Medium" ? "Medium" : "Low";

  try {
    const prompt = `You are an expert banking complaint analyst for Union Bank of India. Analyze this complaint and return ONLY valid JSON (no markdown, no backticks):
"${msg}"
{
  "summary": "2-3 sentence professional summary",
  "suggestedAction": "specific next action for bank agent",
  "reply": "empathetic professional reply to customer in 2-3 sentences"
}`;
    const res = await fetch("/api/analyze", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 500 } })
    });
    if (res.ok) {
      const data = await res.json();
      const text = data.content ? data.content.map(i => i.text || "").join("") : data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (text) { const p = JSON.parse(text.replace(/```json|```/g, "").trim()); return { category, sentiment, priority, risk, ...p }; }
    }
  } catch (e) {}

  const replies = {
    Fraud: "URGENT: We have immediately flagged your account for security review. Our fraud investigation team has been alerted and will contact you within 2 hours. Please do not share any OTPs — Union Bank will never ask for these.",
    Billing: "We sincerely apologize for the billing issue. Our accounts team has been notified and will investigate immediately. A resolution and any applicable refund will be processed within 3–5 working days.",
    Technical: "Our technical team has been alerted and is working to resolve this. Please try our mobile app as a workaround or visit your nearest branch for immediate assistance.",
    Service: "Thank you for reaching out. We have registered your complaint and assigned it for priority resolution. You will receive a callback within 4 business hours.",
  };
  const summaries = {
    Fraud: "Customer reports potential fraud or security compromise. Immediate investigation and account protection required.",
    Billing: "Customer raised billing discrepancy. Amount needs verification and correction by the billing team.",
    Technical: "Customer experiencing technical difficulty with banking services. Requires IT escalation.",
    Service: "General service complaint requiring assignment to the appropriate resolution team.",
  };
  const actions = {
    Fraud: "Block account transactions immediately. Escalate to fraud investigation team. Call customer within 30 minutes.",
    Billing: "Verify transaction records. Initiate reversal if confirmed. Update customer via SMS within 24 hours.",
    Technical: "Log IT ticket. Check system outage status. Provide alternative access methods to customer.",
    Service: "Assign to relationship manager. Schedule callback within 4 hours. Log in CRM.",
  };
  return { category, sentiment, priority, risk, reply: replies[category], summary: summaries[category], suggestedAction: actions[category] };
}

// ── CONSTANTS ─────────────────────────────────────────────
let counter = 5;
const genId = () => `CMP-00${counter++}`;
const now = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

const CAT = { Fraud: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)" }, Billing: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" }, Technical: { color: "#06b6d4", bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.3)" }, Service: { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.3)" } };
const PRI = { High: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", dot: "#ef4444", glow: "0 0 12px rgba(239,68,68,0.3)" }, Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", dot: "#f59e0b", glow: "0 0 12px rgba(245,158,11,0.3)" }, Low: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", dot: "#22c55e", glow: "0 0 12px rgba(34,197,94,0.3)" } };
const SENT = { Negative: "#ef4444", Neutral: "#94a3b8", Positive: "#22c55e" };

// ── SVG ICONS ─────────────────────────────────────────────
const Ic = {
  Send:()=><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Shield:()=><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Brain:()=><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9.5 2a2.5 2.5 0 0 1 5 0"/><path d="M9.5 2C6 2 4 5 4 8s1 5 2 6l1 7h10l1-7c1-1 2-3 2-6s-2-6-5.5-6"/><path d="M12 6v7M9 10h6"/></svg>,
  Dashboard:()=><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  User:()=><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Alert:()=><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Check:()=><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  Zap:()=><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  X:()=><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Search:()=><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Star:()=><svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Mic:()=><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
};

// ── GLOBAL STYLES ─────────────────────────────────────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(124,58,237,0.3);border-radius:99px}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shimmer{0%{opacity:0.4}50%{opacity:1}100%{opacity:0.4}}
@keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}60%{box-shadow:0 0 0 6px rgba(239,68,68,0.15)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.fade-up{animation:fadeUp 0.4s cubic-bezier(.16,1,.3,1) forwards}
.fade-in{animation:fadeIn 0.3s ease forwards}
.slide-right{animation:slideRight 0.35s cubic-bezier(.16,1,.3,1) forwards}
.dot1{animation:pulse 1.4s ease-in-out infinite}
.dot2{animation:pulse 1.4s ease-in-out 0.2s infinite}
.dot3{animation:pulse 1.4s ease-in-out 0.4s infinite}
.new-glow{animation:glowPulse 1s ease 3}
.float{animation:float 3s ease-in-out infinite}
.row-h:hover{background:rgba(124,58,237,0.06)!important;cursor:pointer}
.btn-pri{background:linear-gradient(135deg,#7c3aed,#06b6d4);border:none;color:white;cursor:pointer;border-radius:12px;font-weight:500;font-family:'Inter',sans-serif;transition:all .2s}
.btn-pri:hover{transform:translateY(-1px);box-shadow:0 8px 25px rgba(124,58,237,0.4)}
.btn-pri:active{transform:scale(0.97)}
.btn-pri:disabled{opacity:0.4;cursor:not-allowed;transform:none;box-shadow:none}
.btn-ghost{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.75);cursor:pointer;border-radius:10px;font-family:'Inter',sans-serif;font-size:12px;transition:all .2s;display:inline-flex;align-items:center;gap:6px;padding:7px 14px}
.btn-ghost:hover{background:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.2);color:white}
.glass{background:rgba(255,255,255,0.05);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.1)}
.glass2{background:rgba(255,255,255,0.03);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.07)}
.inp-s{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:white;font-family:'Inter',sans-serif;outline:none;transition:all .2s}
.inp-s::placeholder{color:rgba(255,255,255,0.3)}
.inp-s:focus{border-color:rgba(124,58,237,0.5);background:rgba(124,58,237,0.05)}
.filter-pill{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);cursor:pointer;padding:4px 11px;border-radius:99px;font-size:11px;font-family:'Inter',sans-serif;transition:all .2s}
.filter-pill:hover{background:rgba(124,58,237,0.1);border-color:rgba(124,58,237,0.3);color:rgba(255,255,255,0.8)}
.filter-pill.on{background:rgba(124,58,237,0.2);border-color:rgba(124,58,237,0.5);color:#a78bfa}
table{border-collapse:collapse;width:100%}
th{text-align:left;padding:10px 16px;font-size:10px;font-weight:600;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid rgba(255,255,255,0.06);white-space:nowrap}
td{padding:12px 16px;font-size:12px;border-bottom:1px solid rgba(255,255,255,0.04)}
`;

// ── BADGE ─────────────────────────────────────────────────
const Badge = ({ label, color, bg, border, dot }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:500, color, background:bg, border:`1px solid ${border}`, whiteSpace:"nowrap" }}>
    {dot && <span style={{ width:5, height:5, borderRadius:"50%", background:color, flexShrink:0 }} />}
    {label}
  </span>
);

// ═══════════════════════════════════════════════════════════
// CUSTOMER VIEW
// ═══════════════════════════════════════════════════════════
function CustomerView({ onSwitch }) {
  const [msgs, setMsgs] = useState([
    { from:"aria", text:"Hi! I'm ARIA — your AI-powered complaint assistant for Union Bank of India. Describe your issue and I'll analyze it instantly with our intelligence engine.", t:now(), init:true }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef(null);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const send = useCallback(async () => {
    if (!input.trim() || busy) return;
    const msg = input.trim();
    setInput(""); setBusy(true);
    setMsgs(p => [...p, { from:"user", text:msg, t:now() }]);
    setMsgs(p => [...p, { from:"aria", typing:true, t:now() }]);
    await new Promise(r => setTimeout(r, 400));
    setMsgs(p => [...p.filter(m => !m.typing), { from:"aria", text:"Analyzing your complaint...", t:now(), step:"analyzing" }]);
    await new Promise(r => setTimeout(r, 900));
    const ai = await analyzeComplaint(msg);
    const id = genId();
    addComplaint({ id, message:msg, ...ai, status:"Open", time:now() });
    setMsgs(p => [...p.filter(m => m.step !== "analyzing"), { from:"aria", text:ai.reply, t:now(), result:{ ai, id } }]);
    setBusy(false);
  }, [input, busy]);

  const quickPrompts = ["I was charged double EMI", "Suspicious transaction on my account", "Net banking not working", "Wrong interest on my loan"];

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#080c1f 0%,#150b2e 45%,#0c1832 100%)", display:"flex", flexDirection:"column", fontFamily:"'Inter',sans-serif" }}>
      <style>{G}</style>

      {/* Ambient bg orbs */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
        <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)", top:"-10%", left:"-5%" }} />
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(6,182,212,0.08) 0%,transparent 70%)", bottom:"10%", right:"5%" }} />
      </div>

      {/* Header */}
      <div className="glass" style={{ padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10, borderTop:"none", borderLeft:"none", borderRight:"none", borderRadius:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:12, background:"linear-gradient(135deg,#7c3aed,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(124,58,237,0.4)" }} className="float">
            <Ic.Shield />
          </div>
          <div>
            <div style={{ color:"white", fontWeight:700, fontSize:15, letterSpacing:"-0.3px" }}>ARIA</div>
            <div style={{ color:"rgba(255,255,255,0.4)", fontSize:10, marginTop:1 }}>AI Complaint Intelligence · Union Bank of India</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.2)", padding:"4px 10px", borderRadius:99 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e" }} className="dot1" />
            <span style={{ color:"#22c55e", fontSize:10, fontWeight:500 }}>ARIA Online</span>
          </div>
          <button className="btn-ghost" onClick={onSwitch}><Ic.Dashboard /> Admin View</button>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex:1, overflowY:"auto", padding:"24px 16px", display:"flex", flexDirection:"column", gap:16, maxWidth:740, width:"100%", margin:"0 auto", position:"relative", zIndex:1 }}>

        {/* Welcome card */}
        {msgs[0]?.init && msgs.length === 1 && (
          <div className="glass fade-up" style={{ borderRadius:20, padding:"20px 24px", border:"1px solid rgba(124,58,237,0.25)", marginBottom:8 }}>
            <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#7c3aed,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Ic.Brain />
              </div>
              <div>
                <div style={{ color:"white", fontWeight:600, fontSize:14, marginBottom:4 }}>Hello! I'm ARIA 👋</div>
                <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13, lineHeight:1.6 }}>Your AI-powered complaint assistant for Union Bank of India. I can analyze your issue instantly — detecting category, sentiment, and risk level — and connect you with the right team.</p>
              </div>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:16 }}>
              {quickPrompts.map(q => (
                <button key={q} onClick={() => setInput(q)} style={{ background:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.25)", color:"rgba(167,139,250,0.9)", padding:"6px 14px", borderRadius:99, fontSize:11, cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"all .2s" }}
                  onMouseOver={e => { e.currentTarget.style.background = "rgba(124,58,237,0.2)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "rgba(124,58,237,0.1)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.25)"; }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((msg, i) => {
          if (msg.init) return null;
          return (
            <div key={i} className="fade-up" style={{ display:"flex", gap:10, flexDirection:msg.from==="user"?"row-reverse":"row", alignItems:"flex-end" }}>
              {msg.from === "aria" && (
                <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 4px 12px rgba(124,58,237,0.3)" }}>
                  <Ic.Brain />
                </div>
              )}
              <div style={{ maxWidth:"72%", display:"flex", flexDirection:"column", gap:8 }}>
                {msg.typing ? (
                  <div className="glass" style={{ padding:"14px 18px", borderRadius:"20px 20px 20px 6px", display:"inline-flex", alignItems:"center", gap:8 }}>
                    <div style={{ display:"flex", gap:5 }}>
                      {[1,2,3].map(n => <div key={n} className={`dot${n}`} style={{ width:7, height:7, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#06b6d4)" }} />)}
                    </div>
                    <span style={{ color:"rgba(255,255,255,0.45)", fontSize:12 }}>ARIA is analyzing…</span>
                  </div>
                ) : msg.step === "analyzing" ? (
                  <div className="glass" style={{ padding:"12px 16px", borderRadius:"20px 20px 20px 6px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:14, height:14, border:"2px solid rgba(124,58,237,0.3)", borderTopColor:"#7c3aed", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
                      <span style={{ color:"rgba(255,255,255,0.6)", fontSize:12 }}>Processing with ARIA Intelligence Engine…</span>
                    </div>
                    <div style={{ display:"flex", gap:6, marginTop:10 }}>
                      {["Classifying","Sentiment check","Risk scoring"].map((s,si) => (
                        <div key={s} style={{ background:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.2)", borderRadius:6, padding:"3px 8px", fontSize:10, color:"rgba(167,139,250,0.7)", animation:`shimmer 1.4s ${si*0.3}s ease-in-out infinite` }}>{s}</div>
                      ))}
                    </div>
                  </div>
                ) : msg.from === "user" ? (
                  <div style={{ padding:"12px 16px", borderRadius:"20px 20px 6px 20px", background:"linear-gradient(135deg,rgba(124,58,237,0.4),rgba(6,182,212,0.25))", border:"1px solid rgba(124,58,237,0.3)" }}>
                    <p style={{ color:"white", fontSize:13, lineHeight:1.6 }}>{msg.text}</p>
                    <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10, marginTop:4, textAlign:"right" }}>{msg.t}</div>
                  </div>
                ) : (
                  <div className="glass" style={{ padding:"12px 16px", borderRadius:"20px 20px 20px 6px" }}>
                    <p style={{ color:"rgba(255,255,255,0.85)", fontSize:13, lineHeight:1.65 }}>{msg.text}</p>
                    <div style={{ color:"rgba(255,255,255,0.25)", fontSize:10, marginTop:4 }}>{msg.t}</div>
                  </div>
                )}

                {/* Result card */}
                {msg.result && (
                  <div className="glass fade-in" style={{ borderRadius:16, padding:14, border:`1px solid ${CAT[msg.result.ai.category]?.border || "rgba(124,58,237,0.3)"}`, background:`linear-gradient(135deg,${CAT[msg.result.ai.category]?.bg || "rgba(124,58,237,0.08)"},rgba(0,0,0,0.2))` }}>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
                      <Badge label={msg.result.ai.category} color={CAT[msg.result.ai.category]?.color} bg={CAT[msg.result.ai.category]?.bg} border={CAT[msg.result.ai.category]?.border} dot />
                      <Badge label={msg.result.ai.sentiment} color={SENT[msg.result.ai.sentiment]} bg={`${SENT[msg.result.ai.sentiment]}18`} border={`${SENT[msg.result.ai.sentiment]}30`} dot />
                      <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 8px", borderRadius:6, fontSize:10, fontWeight:500, color:"rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", fontFamily:"monospace" }}>{msg.result.id}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, color:"rgba(34,197,94,0.8)", fontSize:11 }}>
                      <Ic.Check />
                      <span>Complaint registered and routed to resolution team</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>

      {/* Input */}
      <div style={{ padding:"12px 16px 20px", position:"sticky", bottom:0, zIndex:10, maxWidth:740, width:"100%", margin:"0 auto" }}>
        <div className="glass" style={{ borderRadius:18, padding:"10px 10px 10px 16px", display:"flex", alignItems:"flex-end", gap:10, border:"1px solid rgba(124,58,237,0.2)" }}>
          <textarea className="inp-s" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} }}
            placeholder="Describe your complaint… Press Enter to send"
            rows={2} style={{ flex:1, borderRadius:10, padding:"8px 12px", fontSize:13, resize:"none", lineHeight:1.5, border:"none", background:"transparent" }} />
          <div style={{ display:"flex", gap:6, flexShrink:0 }}>
            <button className="btn-ghost" style={{ padding:"10px 12px", borderRadius:12 }}><Ic.Mic /></button>
            <button className="btn-pri" onClick={send} disabled={!input.trim()||busy} style={{ width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {busy ? <div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.25)", borderTopColor:"white", borderRadius:"50%", animation:"spin .7s linear infinite" }} /> : <Ic.Send />}
            </button>
          </div>
        </div>
        <div style={{ textAlign:"center", marginTop:8, color:"rgba(255,255,255,0.18)", fontSize:10 }}>
          ARIA Intelligence Engine · Union Bank of India · iDEA 2.0 Hackathon 2025
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════
function AdminDashboard({ onSwitch }) {
  const complaints = useStore();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [newIds, setNewIds] = useState(new Set());
  const [showAlert, setShowAlert] = useState(true);
  const prevLen = useRef(complaints.length);

  useEffect(() => {
    if (complaints.length > prevLen.current) {
      const newest = complaints[0];
      setNewIds(s => new Set([...s, newest.id]));
      setTimeout(() => setNewIds(s => { const n = new Set(s); n.delete(newest.id); return n; }), 4000);
    }
    prevLen.current = complaints.length;
  }, [complaints]);

  const filtered = complaints.filter(c => {
    const fok = filter==="All"||c.priority===filter||c.category===filter||c.status===filter;
    const sok = !search||[c.message,c.id,c.category].some(v=>v.toLowerCase().includes(search.toLowerCase()));
    return fok && sok;
  });

  const stats = {
    total: complaints.length,
    high: complaints.filter(c=>c.priority==="High").length,
    open: complaints.filter(c=>c.status==="Open").length,
    fraud: complaints.filter(c=>c.category==="Fraud").length,
    sentiment: Math.round(complaints.filter(c=>c.sentiment==="Positive").length / complaints.length * 100) || 0,
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#060b1a 0%,#0d1432 55%,#12082a 100%)", fontFamily:"'Inter',sans-serif", color:"white" }}>
      <style>{G}</style>

      {/* Ambient */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.07) 0%,transparent 70%)", top:"-15%", right:"-10%" }} />
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(6,182,212,0.06) 0%,transparent 70%)", bottom:"5%", left:"-5%" }} />
      </div>

      {/* Header */}
      <div className="glass2" style={{ padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"none", borderLeft:"none", borderRight:"none", borderRadius:0, position:"sticky", top:0, zIndex:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 14px rgba(124,58,237,0.35)" }}>
            <Ic.Shield />
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, letterSpacing:"-0.3px" }}>ARIA Admin Dashboard</div>
            <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10, marginTop:1 }}>Real-time Complaint Intelligence · Union Bank of India</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.18)", padding:"4px 10px", borderRadius:99 }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:"#22c55e" }} className="dot1" />
            <span style={{ color:"#22c55e", fontSize:10, fontWeight:500 }}>Live</span>
          </div>
          <button className="btn-ghost" onClick={onSwitch}><Ic.User /> Customer View</button>
        </div>
      </div>

      <div style={{ padding:"18px 24px", maxWidth:1440, margin:"0 auto", position:"relative", zIndex:1 }}>

        {/* Alert banner */}
        {showAlert && stats.high > 0 && (
          <div className="fade-up" style={{ background:"linear-gradient(135deg,rgba(239,68,68,0.12),rgba(239,68,68,0.06))", border:"1px solid rgba(239,68,68,0.25)", borderRadius:14, padding:"12px 18px", display:"flex", alignItems:"center", gap:12, marginBottom:16, boxShadow:PRI.High.glow }}>
            <div style={{ width:32, height:32, borderRadius:10, background:"rgba(239,68,68,0.15)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#ef4444" }}><Ic.Alert /></div>
            <div style={{ flex:1 }}>
              <span style={{ color:"#fca5a5", fontWeight:600, fontSize:13 }}>⚠️ {stats.high} High-Priority Complaints Detected</span>
              <span style={{ color:"rgba(255,255,255,0.45)", fontSize:12, marginLeft:8 }}>Immediate attention required — fraud risk cases flagged</span>
            </div>
            <button onClick={() => setShowAlert(false)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", cursor:"pointer", padding:4 }}><Ic.X /></button>
          </div>
        )}

        {/* KPI Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:18 }}>
          {[
            { label:"Total Complaints", v:stats.total, color:"#60a5fa", bg:"rgba(96,165,250,0.08)", border:"rgba(96,165,250,0.18)", icon:"📋" },
            { label:"High Priority 🚨", v:stats.high, color:"#ef4444", bg:"rgba(239,68,68,0.08)", border:"rgba(239,68,68,0.2)", icon:"🚨" },
            { label:"Open Cases", v:stats.open, color:"#f59e0b", bg:"rgba(245,158,11,0.08)", border:"rgba(245,158,11,0.18)", icon:"⏳" },
            { label:"Fraud Cases", v:stats.fraud, color:"#a78bfa", bg:"rgba(167,139,250,0.08)", border:"rgba(167,139,250,0.18)", icon:"🔐" },
            { label:"Positive Sentiment", v:`${stats.sentiment}%`, color:"#22c55e", bg:"rgba(34,197,94,0.08)", border:"rgba(34,197,94,0.18)", icon:"📊" },
          ].map((k,i) => (
            <div key={k.label} className="fade-up" style={{ animationDelay:`${i*0.05}s`, background:k.bg, border:`1px solid ${k.border}`, borderRadius:14, padding:"14px 18px", cursor:"default" }}
              onMouseOver={e => e.currentTarget.style.transform="translateY(-2px)"}
              onMouseOut={e => e.currentTarget.style.transform="translateY(0)"} >
              <div style={{ color:"rgba(255,255,255,0.4)", fontSize:10, marginBottom:8, textTransform:"uppercase", letterSpacing:".07em", fontWeight:600 }}>{k.label}</div>
              <div style={{ fontSize:30, fontWeight:700, color:k.color, lineHeight:1, letterSpacing:"-1px" }}>{k.v}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:selected?"1fr 360px":"1fr", gap:16, alignItems:"start" }}>

          {/* Table card */}
          <div className="glass2" style={{ borderRadius:16, overflow:"hidden" }}>
            {/* Toolbar */}
            <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <div style={{ position:"relative", flex:1, minWidth:180 }}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search complaints…"
                  className="inp-s" style={{ width:"100%", borderRadius:10, padding:"7px 12px 7px 30px", fontSize:12, boxSizing:"border-box" }} />
                <span style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.3)" }}><Ic.Search /></span>
              </div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {["All","High","Medium","Low","Fraud","Billing","Technical","Open","In Progress","Resolved"].map(f => (
                  <button key={f} className={`filter-pill ${filter===f?"on":""}`} onClick={()=>setFilter(f)}>{f}</button>
                ))}
              </div>
              <span style={{ color:"rgba(255,255,255,0.2)", fontSize:10, marginLeft:"auto", whiteSpace:"nowrap" }}>{filtered.length} records</span>
            </div>

            <div style={{ overflowX:"auto" }}>
              <table>
                <thead>
                  <tr><th>ID</th><th>Complaint</th><th>Category</th><th>Sentiment</th><th>Priority</th><th>Status</th><th>Time</th><th style={{ width:80 }}></th></tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const p = PRI[c.priority]; const isNew = newIds.has(c.id); const isSel = selected?.id===c.id;
                    return (
                      <tr key={c.id} className={`row-h fade-in ${isNew?"new-glow":""}`} onClick={()=>setSelected(isSel?null:c)}
                        style={{ background:isSel?"rgba(124,58,237,0.1)":isNew?"rgba(239,68,68,0.05)":"transparent", transition:"background .15s", borderLeft:isSel?"2px solid #7c3aed":"2px solid transparent" }}>
                        <td style={{ fontFamily:"monospace", color:"rgba(255,255,255,0.45)", fontSize:11 }}>
                          {isNew && <span style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background:"#ef4444", marginRight:5, verticalAlign:"middle", animation:"pulse 1s infinite" }} />}
                          {c.id}
                        </td>
                        <td style={{ maxWidth:200 }}><div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"rgba(255,255,255,0.75)", fontSize:12 }}>{c.message}</div></td>
                        <td><Badge label={c.category} color={CAT[c.category]?.color} bg={CAT[c.category]?.bg} border={CAT[c.category]?.border} dot /></td>
                        <td><span style={{ color:SENT[c.sentiment], fontSize:12, display:"flex", alignItems:"center", gap:4 }}><span style={{ width:5, height:5, borderRadius:"50%", background:SENT[c.sentiment], display:"inline-block" }}/>{c.sentiment}</span></td>
                        <td><Badge label={c.priority} color={p.color} bg={p.bg} border={p.border} dot /></td>
                        <td>
                          <span style={{ color:c.status==="Resolved"?"#22c55e":c.status==="In Progress"?"#f59e0b":"rgba(255,255,255,0.45)", fontSize:11, display:"flex", alignItems:"center", gap:4 }}>
                            {c.status==="Resolved"&&<Ic.Check/>}{c.status}
                          </span>
                        </td>
                        <td style={{ color:"rgba(255,255,255,0.25)", fontSize:10 }}>{c.time}</td>
                        <td>
                          <button onClick={e=>{e.stopPropagation();setSelected(isSel?null:c);}} style={{ background:isSel?"rgba(124,58,237,0.3)":"rgba(124,58,237,0.12)", border:`1px solid rgba(124,58,237,${isSel?"0.5":"0.25"})`, color:isSel?"#a78bfa":"rgba(167,139,250,0.6)", padding:"4px 10px", borderRadius:8, fontSize:10, cursor:"pointer", fontFamily:"'Inter',sans-serif", fontWeight:500, transition:"all .15s" }}>
                            {isSel?"Close":"Insights →"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length===0 && <div style={{ padding:40, textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:13 }}>No complaints match your filter</div>}
            </div>
          </div>

          {/* AI Insights Panel */}
          {selected && (
            <div className="slide-right glass2" style={{ borderRadius:16, overflow:"hidden", border:"1px solid rgba(124,58,237,0.25)" }}>
              <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"linear-gradient(135deg,rgba(124,58,237,0.15),rgba(6,182,212,0.08))", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#7c3aed,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center" }}><Ic.Brain /></div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:13 }}>AI Insights</div>
                    <div style={{ color:"rgba(255,255,255,0.35)", fontSize:10 }}>ARIA Intelligence Engine</div>
                  </div>
                </div>
                <button onClick={()=>setSelected(null)} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)", cursor:"pointer", borderRadius:8, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center" }}><Ic.X /></button>
              </div>

              <div style={{ padding:16, display:"flex", flexDirection:"column", gap:12 }}>
                {/* Meta */}
                <div>
                  <div style={{ fontFamily:"monospace", color:"rgba(255,255,255,0.35)", fontSize:10, marginBottom:8 }}>{selected.id} · {selected.time}</div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    <Badge label={selected.category} color={CAT[selected.category]?.color} bg={CAT[selected.category]?.bg} border={CAT[selected.category]?.border} dot />
                    <Badge label={`${selected.priority} Priority`} color={PRI[selected.priority].color} bg={PRI[selected.priority].bg} border={PRI[selected.priority].border} dot />
                    <Badge label={`Risk: ${selected.risk}`} color={selected.risk==="High"?"#ef4444":selected.risk==="Medium"?"#f59e0b":"#22c55e"} bg={selected.risk==="High"?"rgba(239,68,68,0.1)":selected.risk==="Medium"?"rgba(245,158,11,0.1)":"rgba(34,197,94,0.1)"} border={selected.risk==="High"?"rgba(239,68,68,0.25)":selected.risk==="Medium"?"rgba(245,158,11,0.25)":"rgba(34,197,94,0.25)"} />
                  </div>
                </div>

                {/* Complaint text */}
                <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:12, padding:"10px 14px", borderLeft:`3px solid ${CAT[selected.category]?.color||"#7c3aed"}` }}>
                  <div style={{ color:"rgba(255,255,255,0.3)", fontSize:9, textTransform:"uppercase", letterSpacing:".08em", marginBottom:5, fontWeight:600 }}>Complaint</div>
                  <p style={{ color:"rgba(255,255,255,0.75)", fontSize:12, lineHeight:1.65 }}>{selected.message}</p>
                </div>

                {/* AI Summary */}
                {selected.summary && (
                  <div style={{ background:"rgba(124,58,237,0.07)", border:"1px solid rgba(124,58,237,0.18)", borderRadius:12, padding:"10px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5, color:"#a78bfa", marginBottom:6 }}>
                      <Ic.Zap /><span style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:".08em" }}>AI Summary</span>
                    </div>
                    <p style={{ color:"rgba(255,255,255,0.65)", fontSize:12, lineHeight:1.65 }}>{selected.summary}</p>
                  </div>
                )}

                {/* Suggested action */}
                {selected.suggestedAction && (
                  <div style={{ background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.18)", borderRadius:12, padding:"10px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5, color:"#fcd34d", marginBottom:6 }}>
                      <Ic.Alert /><span style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:".08em" }}>Suggested Action</span>
                    </div>
                    <p style={{ color:"rgba(255,255,255,0.65)", fontSize:12, lineHeight:1.65 }}>{selected.suggestedAction}</p>
                  </div>
                )}

                {/* AI Reply */}
                <div style={{ background:"rgba(34,197,94,0.06)", border:"1px solid rgba(34,197,94,0.18)", borderRadius:12, padding:"10px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5, color:"#86efac", marginBottom:6 }}>
                    <Ic.Check /><span style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:".08em" }}>AI-Generated Reply</span>
                  </div>
                  <p style={{ color:"rgba(255,255,255,0.65)", fontSize:12, lineHeight:1.65 }}>{selected.reply}</p>
                </div>

                {/* Sentiment bar */}
                <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:"10px 14px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ color:"rgba(255,255,255,0.35)", fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:".07em" }}>Sentiment Analysis</span>
                    <span style={{ color:SENT[selected.sentiment], fontSize:11, fontWeight:600 }}>{selected.sentiment}</span>
                  </div>
                  <div style={{ height:5, borderRadius:99, background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
                    <div style={{ height:"100%", borderRadius:99, background:SENT[selected.sentiment], width:selected.sentiment==="Negative"?"80%":selected.sentiment==="Positive"?"30%":"55%", transition:"width .8s cubic-bezier(.16,1,.3,1)" }} />
                  </div>
                </div>

                {/* Status buttons */}
                <div>
                  <div style={{ color:"rgba(255,255,255,0.3)", fontSize:10, fontWeight:600, textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>Update Status</div>
                  <div style={{ display:"flex", gap:6 }}>
                    {["In Progress","Resolved","Escalated"].map(s => (
                      <button key={s} onClick={() => {
                        const upd = complaints.map(c => c.id===selected.id?{...c,status:s}:c);
                        complaintStore = upd; notifyListeners(); setSelected({...selected,status:s});
                      }} style={{ flex:1, padding:"7px 4px", borderRadius:10, fontSize:10, cursor:"pointer", fontWeight:600, fontFamily:"'Inter',sans-serif", transition:"all .2s",
                        background:selected.status===s?"rgba(124,58,237,0.3)":"rgba(255,255,255,0.04)",
                        border:`1px solid ${selected.status===s?"rgba(124,58,237,0.5)":"rgba(255,255,255,0.08)"}`,
                        color:selected.status===s?"#c4b5fd":"rgba(255,255,255,0.4)" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop:14, textAlign:"center", color:"rgba(255,255,255,0.12)", fontSize:10 }}>
          ARIA Intelligence Engine · Union Bank of India · iDEA 2.0 Hackathon 2025 · Real-time AI Complaint Processing
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ROOT — hash routing, zero 404
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState(window.location.hash==="#admin"?"admin":"customer");
  const go = v => { setView(v); window.location.hash = v==="admin"?"admin":""; };
  return view==="admin" ? <AdminDashboard onSwitch={()=>go("customer")} /> : <CustomerView onSwitch={()=>go("admin")} />;
}
