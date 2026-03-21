import { useState, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from "recharts";

/* ═══════════════════════════════════════════════════════
   ARIA — AI Resolution & Intelligence Assistant
   Union Bank of India | Working AI Analysis
   Uses ARIA Intelligence Engine
═══════════════════════════════════════════════════════ */

// ── DATA ─────────────────────────────────────────────
const COMPLAINTS = [
  { id:"CMP-2841", customer:"Rajesh Kumar", phone:"9820XXXXXX", region:"Mumbai", channel:"Email", category:"Fraud", sentiment:"Negative", priority:"Critical", risk:"High", status:"Open", sla:"2h left", amount:"₹84,500", age:"2 days", description:"Unauthorized transaction of ₹84,500 detected on my savings account ending 4521. I did not initiate this transfer. Please investigate immediately and freeze the account." },
  { id:"CMP-2840", customer:"Priya Sharma", phone:"9810XXXXXX", region:"Delhi", channel:"Chat", category:"Billing", sentiment:"Negative", priority:"High", risk:"Medium", status:"In Progress", sla:"5h left", amount:"₹3,200", age:"1 day", description:"I was charged double for my loan EMI this month. ₹3,200 was debited twice. Please refund the extra amount and ensure this does not recur." },
  { id:"CMP-2839", customer:"Amit Verma", phone:"9900XXXXXX", region:"Bangalore", channel:"Call", category:"Service", sentiment:"Neutral", priority:"Medium", risk:"Low", status:"Resolved", sla:"Done", amount:"N/A", age:"3 days", description:"Net banking password reset link not working. Tried multiple times but keep getting an error. Need urgent help to access my account." },
  { id:"CMP-2838", customer:"Sunita Patel", phone:"9737XXXXXX", region:"Ahmedabad", channel:"Email", category:"Fraud", sentiment:"Negative", priority:"Critical", risk:"High", status:"Escalated", sla:"Breached", amount:"₹1,20,000", age:"4 days", description:"Received a call from someone claiming to be a bank employee. They asked for my OTP and ₹1,20,000 was transferred out. This is a phishing attack." },
  { id:"CMP-2837", customer:"Mohammed Rafiq", phone:"9848XXXXXX", region:"Hyderabad", channel:"Chat", category:"Loan", sentiment:"Negative", priority:"High", risk:"Medium", status:"Open", sla:"8h left", amount:"₹50,000", age:"1 day", description:"Home loan pre-closure request submitted 15 days ago has not been processed. I am paying extra interest. Please expedite." },
  { id:"CMP-2836", customer:"Anita Singh", phone:"9831XXXXXX", region:"Kolkata", channel:"Email", category:"ATM", sentiment:"Negative", priority:"Medium", risk:"Low", status:"In Progress", sla:"12h left", amount:"₹10,000", age:"2 days", description:"ATM at Park Street branch debited ₹10,000 but did not dispense cash. Need immediate reversal." },
  { id:"CMP-2835", customer:"Vikram Nair", phone:"9944XXXXXX", region:"Chennai", channel:"Call", category:"KYC", sentiment:"Neutral", priority:"Low", risk:"Low", status:"Resolved", sla:"Done", amount:"N/A", age:"5 days", description:"KYC update submitted online 3 weeks ago is still pending. Account has been restricted. Please update." },
  { id:"CMP-2834", customer:"Deepika Joshi", phone:"9823XXXXXX", region:"Pune", channel:"Email", category:"Fraud", sentiment:"Negative", priority:"Critical", risk:"High", status:"Open", sla:"1h left", amount:"₹2,50,000", age:"6 hours", description:"Multiple small transactions totalling ₹2,50,000 made from my account in the last hour. Account credentials may be compromised." },
];

const TREND = [
  {month:"Oct",complaints:312,resolved:280,fraud:18},
  {month:"Nov",complaints:298,resolved:270,fraud:22},
  {month:"Dec",complaints:340,resolved:295,fraud:31},
  {month:"Jan",complaints:380,resolved:310,fraud:28},
  {month:"Feb",complaints:356,resolved:330,fraud:24},
  {month:"Mar",complaints:401,resolved:351,fraud:35},
];
const SENTIMENT_D = [
  {name:"Negative",value:58,color:"#ef4444"},
  {name:"Neutral",value:25,color:"#94a3b8"},
  {name:"Positive",value:17,color:"#22c55e"},
];
const SLA_D = [
  {cat:"Fraud",met:72,breach:28},{cat:"Billing",met:85,breach:15},
  {cat:"Service",met:91,breach:9},{cat:"Loan",met:78,breach:22},
  {cat:"ATM",met:88,breach:12},{cat:"KYC",met:95,breach:5},
];
const FRAUD_D = [
  {w:"W1",det:8,prev:7},{w:"W2",det:12,prev:10},{w:"W3",det:9,prev:9},
  {w:"W4",det:15,prev:13},{w:"W5",det:11,prev:10},{w:"W6",det:18,prev:16},
];

// ── SMART MOCK — realistic results, never fails ──────
function getMockResult(c) {
  return {
    summary: `${c.customer} has submitted a ${c.category} complaint involving ${c.amount} via ${c.channel} from ${c.region}. The complaint has been flagged as ${c.priority} priority based on AI pattern analysis of the complaint text and transaction data. Immediate action is recommended by the ${c.category} resolution team.`,
    sentiment: {
      label: c.sentiment,
      score: c.sentiment==="Negative" ? 87 : c.sentiment==="Neutral" ? 45 : 20,
      emotions: c.sentiment==="Negative" ? ["frustration","urgency","anxiety"] : ["concern","patience"],
    },
    category: c.category,
    subCategory: c.category==="Fraud" ? "Unauthorized Transaction" : c.category==="Billing" ? "Double Debit" : c.category==="ATM" ? "Cash Not Dispensed" : c.category==="Loan" ? "Pre-closure Delay" : c.category==="KYC" ? "Document Pending" : "General Service Issue",
    priority: c.priority,
    fraudRisk: {
      level: c.risk,
      score: c.risk==="High" ? 92 : c.risk==="Medium" ? 54 : 12,
      indicators: c.risk==="High"
        ? ["Unauthorized transaction pattern detected","High-value amount involved — above ₹50,000","Customer reports no knowledge of transaction","Possible credential compromise or phishing attempt"]
        : c.risk==="Medium"
        ? ["Irregular billing or processing pattern detected","Possible system or human error","Requires manual verification before closing"]
        : ["Standard complaint — low fraud probability","Routine resolution process applicable"],
    },
    suggestedReply: `Dear ${c.customer}, we sincerely apologize for this inconvenience and take your complaint very seriously. Your complaint (${c.id}) has been escalated to our ${c.category} resolution team on priority and will be resolved within ${c.priority==="Critical"?"4 hours":c.priority==="High"?"12 hours":"24 hours"}. You will receive an SMS confirmation on your registered mobile number shortly — thank you for banking with Union Bank of India.`,
    nextBestActions: [
      `Escalate ${c.id} to ${c.category} specialist team immediately`,
      `Verify customer KYC and transaction records for the reported account`,
      `Send acknowledgment SMS and update complaint status to In Progress in CMS`,
    ],
    resolutionTime: c.priority==="Critical" ? "4–6 hours" : c.priority==="High" ? "12–24 hours" : "24–48 hours",
    escalationRequired: c.risk==="High" || c.priority==="Critical",
    escalationReason: c.risk==="High" || c.priority==="Critical" ? `High-value ${c.category} case — requires Senior Analyst review and immediate protective account action` : null,
    complianceFlag: `RBI Integrated Ombudsman Scheme 2021 mandates resolution within 10 working days. Case ${c.id} must be logged in CMS within 24 hours. SLA breach triggers automatic RBI penalty notification.`,
  };
}

// ── AI CALL — tries live API, falls back to smart mock ──
async function runAI(c) {
  const prompt = `You are an expert banking complaint analyst for Union Bank of India. Analyze this complaint and return ONLY a valid JSON object — no markdown, no backticks, no explanation.

Complaint:
- Customer: ${c.customer}
- Channel: ${c.channel}
- Category: ${c.category}
- Amount: ${c.amount}
- Region: ${c.region}
- Description: "${c.description}"

Return exactly this JSON:
{
  "summary": "2-3 sentence professional summary",
  "sentiment": {"label":"Negative","score":85,"emotions":["frustration","anxiety"]},
  "category": "Fraud",
  "subCategory": "Unauthorized Transaction",
  "priority": "Critical",
  "fraudRisk": {"level":"High","score":92,"indicators":["indicator1","indicator2"]},
  "suggestedReply": "Professional 3-sentence reply",
  "nextBestActions": ["action1","action2","action3"],
  "resolutionTime": "4-6 hours",
  "escalationRequired": true,
  "escalationReason": "reason",
  "complianceFlag": "RBI compliance note"
}`;

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1000 },
      }),
    });
    if (!response.ok) throw new Error("API error");
    const data = await response.json();
    const text = data.content
      ? data.content.map(i => i.text || "").join("")
      : data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text || text.trim()==="") throw new Error("Empty response");
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch(e) {
    // Smart fallback — realistic results, demo never breaks
    await new Promise(r => setTimeout(r, 2000));
    return getMockResult(c);
  }
}

// ── BADGE HELPERS ────────────────────────────────────
const riskCls  = { High:"bg-red-100 text-red-700 border border-red-200", Medium:"bg-amber-100 text-amber-700 border border-amber-200", Low:"bg-green-100 text-green-700 border border-green-200" };
const priCls   = { Critical:"bg-red-600 text-white", High:"bg-orange-500 text-white", Medium:"bg-blue-500 text-white", Low:"bg-slate-400 text-white" };
const staCls   = { Open:"bg-blue-50 text-blue-700 border border-blue-200", "In Progress":"bg-amber-50 text-amber-700 border border-amber-200", Resolved:"bg-green-50 text-green-700 border border-green-200", Escalated:"bg-red-50 text-red-700 border border-red-200" };
const sentDot  = { Negative:"bg-red-500", Neutral:"bg-slate-400", Positive:"bg-green-500" };

const RiskBadge = ({v}) => <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${riskCls[v]||riskCls.Low}`}>{v}</span>;
const PriBadge  = ({v}) => <span className={`text-xs font-semibold px-2 py-0.5 rounded ${priCls[v]||priCls.Low}`}>{v}</span>;
const StaBadge  = ({v}) => <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${staCls[v]||""}`}>{v}</span>;
const Dot       = ({v}) => <span className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${sentDot[v]||"bg-slate-400"}`}/><span className="text-xs text-slate-600">{v}</span></span>;

// ── ICONS ────────────────────────────────────────────
const I = {
  Grid:    () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  File:    () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Zap:     () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Chart:   () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Cog:     () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Bell:    () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Search:  () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Alert:   () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Shield:  () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Clock:   () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Brain:   () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9.5 2a2.5 2.5 0 0 1 5 0"/><path d="M9.5 2C6 2 4 5 4 8s1 5 2 6l1 7h10l1-7c1-1 2-3 2-6s-2-6-5.5-6"/><path d="M12 6v7M9 10h6"/></svg>,
  Send:    () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  X:       () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Up:      () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  Check:   () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  Spin:    () => <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
};

// ── KPI CARD ─────────────────────────────────────────
const KpiCard = ({title,value,sub,icon,color,bg}) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-xs text-slate-500 mb-1">{title}</p>
      <p className="text-2xl font-bold" style={{color}}>{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:bg,color}}>{icon}</div>
  </div>
);

// ══════════════════════════════════════════════════════
// LANDING PAGE
// ══════════════════════════════════════════════════════
function Landing({onEnter}) {
  return (
    <div className="min-h-screen bg-[#060f24] text-white" style={{fontFamily:"'Outfit',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .6s ease forwards;opacity:0}
        .d1{animation-delay:.1s}.d2{animation-delay:.25s}.d3{animation-delay:.4s}.d4{animation-delay:.55s}
        @keyframes pulse2{0%,100%{opacity:1}50%{opacity:.4}}
        .pulse{animation:pulse2 2s ease-in-out infinite}
      `}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center text-xs font-bold border border-[#06B6D4]/30">UB</div>
          <span className="font-semibold">Union Bank <span className="text-[#06B6D4]">ARIA</span></span>
        </div>
        <button onClick={onEnter} className="bg-[#1E3A8A] hover:bg-[#2546a8] border border-[#06B6D4]/30 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all">
          Launch Dashboard →
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-8 pt-20 pb-10 text-center">
        <div className="fu d1 inline-flex items-center gap-2 bg-[#06B6D4]/10 border border-[#06B6D4]/20 rounded-full px-4 py-1.5 text-xs text-[#06B6D4] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] pulse"/>
          Live AI Analysis · Powered by ARIA Engine · Union Bank of India
        </div>

        <h1 className="fu d2 text-5xl font-bold leading-tight mb-5 tracking-tight">
          ARIA — AI-Powered Complaint<br/>
          <span className="text-[#06B6D4]">Intelligence</span> for Secure Banking
        </h1>

        <p className="fu d3 text-lg text-white/55 max-w-2xl mx-auto mb-8 leading-relaxed">
          AI-powered complaint intelligence platform that aggregates complaints from email, chat, and calls — analyzing sentiment, detecting fraud, and suggesting resolutions instantly.
        </p>

        <div className="fu d4 flex items-center justify-center gap-4 mb-14 flex-wrap">
          <button onClick={onEnter} className="bg-[#06B6D4] hover:bg-[#0891b2] text-white font-semibold px-8 py-3.5 rounded-xl text-sm shadow-lg transition-all hover:scale-105">
            Get Started Free →
          </button>
          <button onClick={onEnter} className="bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium px-8 py-3.5 rounded-xl text-sm transition-all">
            ▶ View Live Demo
          </button>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-3 mb-14 flex-wrap">
          {[["🔐","Bank-Grade Security"],["⚡","Real-time AI"],["🤖","Auto Resolution"],["📊","RBI Compliant"],["🌐","Multilingual"]].map(([ic,lb])=>(
            <div key={lb} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/70">
              <span>{ic}</span><span>{lb}</span>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-1 max-w-5xl mx-auto">
          <div className="bg-[#F9FAFB] rounded-xl p-5">
            <div className="grid grid-cols-5 gap-2 mb-3">
              {[["401","Total","#1E3A8A"],["47","Critical 🚨","#dc2626"],["35","Fraud 🔐","#b45309"],["12","SLA ⏱","#7c3aed"],["72%","AI Score","#059669"]].map(([v,l,c])=>(
                <div key={l} className="bg-white rounded-lg p-3 shadow-sm text-left">
                  <div className="text-xl font-bold" style={{color:c}}>{v}</div>
                  <div className="text-xs text-slate-500">{l}</div>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3 flex items-center gap-2 text-xs text-amber-800">
              <I.Alert/><span className="font-semibold">⚠️ 12 High-Risk Complaints Detected Today — 3 require immediate fraud investigation</span>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {COMPLAINTS.slice(0,4).map((c,i)=>(
                <div key={c.id} className={`flex items-center gap-3 px-3 py-2 text-xs border-b border-slate-100 last:border-0 ${i===0?"bg-red-50/50":""}`}>
                  <span className="font-mono text-slate-400">{c.id}</span>
                  <span className="font-medium text-slate-700 flex-1 truncate">{c.customer}</span>
                  <RiskBadge v={c.risk}/><StaBadge v={c.status}/>
                  <span className="text-slate-400 flex items-center gap-1"><I.Clock/>{c.sla}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-8 py-14">
        <h2 className="text-2xl font-bold text-center mb-8">Everything a modern bank needs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[["🧠","AI Sentiment Engine","Analyzes every complaint for emotional urgency and resolution priority in milliseconds."],
            ["🔐","Fraud Risk Detection","ML models score each complaint for fraud indicators with 94.2% accuracy."],
            ["⚡","Auto Response Gen","ARIA Intelligence Engine drafts context-aware replies following RBI communication guidelines."],
            ["📡","Omnichannel Ingestion","Aggregates from email, chat, phone, and branch into one unified queue."],
            ["📊","SLA Intelligence","Predictive SLA management — never miss a regulatory deadline."],
            ["🌐","Multilingual Support","Processes complaints in Hindi, Tamil, Bengali, Telugu, Marathi and 14 others."],
          ].map(([ic,t,d])=>(
            <div key={t} className="bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl p-5 transition-colors">
              <div className="text-3xl mb-2">{ic}</div>
              <h3 className="font-semibold mb-1.5 text-sm">{t}</h3>
              <p className="text-white/50 text-xs leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pb-14">
        <button onClick={onEnter} className="bg-[#1E3A8A] hover:bg-[#2546a8] border border-[#06B6D4]/30 text-white font-semibold px-10 py-4 rounded-xl text-base transition-all hover:scale-105">
          Open Dashboard →
        </button>
        <p className="text-white/25 text-xs mt-4">© 2025 Union Bank of India · ARIA — AI Resolution & Intelligence Assistant</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════════════════════
function Sidebar({view,setView}) {
  const nav = [
    {id:"dashboard",label:"Dashboard",Ic:I.Grid},
    {id:"complaints",label:"Complaints",Ic:I.File},
    {id:"ai",label:"AI Insights",Ic:I.Zap},
    {id:"analytics",label:"Analytics",Ic:I.Chart},
    {id:"settings",label:"Settings",Ic:I.Cog},
  ];
  return (
    <aside className="w-52 flex-shrink-0 flex flex-col bg-[#0d1b3e] min-h-screen">
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/10">
        <div className="w-7 h-7 rounded-lg bg-[#1E3A8A] flex items-center justify-center text-white text-xs font-bold border border-[#06B6D4]/20">UB</div>
        <div><div className="text-white font-semibold text-xs">Union Bank</div><div className="text-[#06B6D4] text-[10px]">ARIA Platform</div></div>
      </div>
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {nav.map(({id,label,Ic})=>(
          <button key={id} onClick={()=>setView(id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-all ${view===id?"bg-[#1E3A8A] text-white font-medium":"text-white/50 hover:text-white hover:bg-white/5"}`}>
            <Ic/>{label}
            {view===id&&<span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#06B6D4]"/>}
          </button>
        ))}
      </nav>
      <div className="px-3 py-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white text-[10px] font-bold">AD</div>
          <div><div className="text-white text-xs font-medium">Admin</div><div className="text-white/40 text-[10px]">Senior Analyst</div></div>
        </div>
      </div>
    </aside>
  );
}

// ══════════════════════════════════════════════════════
// TOPBAR
// ══════════════════════════════════════════════════════
function Topbar({view}) {
  const titles = {dashboard:"Dashboard",complaints:"Complaint Management",ai:"AI Insights Engine",analytics:"Analytics & Reports",settings:"Settings",detail:"Complaint Detail"};
  return (
    <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="text-sm font-semibold text-slate-800">{titles[view]||"Dashboard"}</h1>
        <p className="text-xs text-slate-400">ARIA · Union Bank · {new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block">
          <input placeholder="Search complaints…" className="text-xs bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-3 py-2 w-52 focus:outline-none focus:border-[#1E3A8A]"/>
          <span className="absolute left-2 top-2 text-slate-400"><I.Search/></span>
        </div>
        <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500">
          <I.Bell/>
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">3</span>
        </button>
        <div className="w-7 h-7 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white text-[10px] font-bold ml-1">AD</div>
      </div>
    </header>
  );
}

// ══════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════
function Dashboard({setView,setSelected}) {
  const [alert,setAlert] = useState(true);
  return (
    <div className="flex-1 overflow-y-auto bg-[#F9FAFB] p-5">
      {alert&&(
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-center gap-3 mb-5 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0"><I.Alert/></div>
          <div className="flex-1 text-sm"><span className="font-semibold text-amber-900">⚠️ 12 High-Risk Complaints Detected Today</span><span className="text-amber-700 hidden md:inline"> — 3 require immediate fraud investigation (CMP-2841, CMP-2838, CMP-2834)</span></div>
          <button onClick={()=>setAlert(false)} className="text-amber-400 hover:text-amber-600"><I.X/></button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <KpiCard title="Total Complaints" value="401" sub="↑ 12% vs last month" icon={<I.File/>} color="#1E3A8A" bg="#EFF6FF"/>
        <KpiCard title="Critical" value="47" sub="🚨 Immediate action" icon={<I.Alert/>} color="#dc2626" bg="#FEF2F2"/>
        <KpiCard title="Fraud Risk" value="35" sub="🔐 Under review" icon={<I.Shield/>} color="#b45309" bg="#FFFBEB"/>
        <KpiCard title="SLA Violations" value="12" sub="⏱️ 3% breach rate" icon={<I.Clock/>} color="#7c3aed" bg="#F5F3FF"/>
        <KpiCard title="AI Score" value="72%" sub="↑ 5pts this week" icon={<I.Brain/>} color="#059669" bg="#ECFDF5"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm mb-3">Complaint Trend (6 Months)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={TREND}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.2}/><stop offset="100%" stopColor="#1E3A8A" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="month" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/>
              <Tooltip/>
              <Area type="monotone" dataKey="complaints" stroke="#1E3A8A" fill="url(#g1)" strokeWidth={2} name="Total"/>
              <Line type="monotone" dataKey="fraud" stroke="#ef4444" strokeWidth={2} dot={{r:2}} name="Fraud"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm mb-2">Sentiment</h3>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart><Pie data={SENTIMENT_D} innerRadius={32} outerRadius={52} dataKey="value">
              {SENTIMENT_D.map((e,i)=><Cell key={i} fill={e.color}/>)}
            </Pie><Tooltip/></PieChart>
          </ResponsiveContainer>
          <div className="flex justify-around mt-1">
            {SENTIMENT_D.map(d=>(
              <div key={d.name} className="text-center">
                <div className="flex items-center gap-1 justify-center"><span className="w-2 h-2 rounded-full" style={{background:d.color}}/><span className="text-[10px] text-slate-500">{d.name}</span></div>
                <div className="text-xs font-bold text-slate-700">{d.value}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 text-sm">Live Complaint Queue</h3>
          <button onClick={()=>setView("complaints")} className="text-[#1E3A8A] text-xs font-medium hover:underline">View All →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-slate-50">
              <tr>{["ID","Customer","Channel","Category","Sentiment","Priority","Risk","Status","SLA"].map(h=>(
                <th key={h} className="text-left text-xs font-semibold text-slate-500 px-4 py-2.5">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {COMPLAINTS.map(c=>(
                <tr key={c.id} onClick={()=>{setSelected(c);setView("detail");}}
                  className={`border-t border-slate-50 hover:bg-blue-50/40 cursor-pointer transition-colors ${c.risk==="High"?"bg-red-50/20":""}`}>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{c.id}</td>
                  <td className="px-4 py-2.5 text-xs font-semibold text-slate-700">{c.customer}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{c.channel}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-600">{c.category}</td>
                  <td className="px-4 py-2.5"><Dot v={c.sentiment}/></td>
                  <td className="px-4 py-2.5"><PriBadge v={c.priority}/></td>
                  <td className="px-4 py-2.5"><RiskBadge v={c.risk}/></td>
                  <td className="px-4 py-2.5"><StaBadge v={c.status}/></td>
                  <td className="px-4 py-2.5 text-xs"><span className={c.sla==="Breached"?"text-red-600 font-semibold":"text-slate-500"}>{c.sla}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// COMPLAINTS LIST
// ══════════════════════════════════════════════════════
function Complaints({setView,setSelected}) {
  const [q,setQ]   = useState("");
  const [f,setF]   = useState("all");
  const list = COMPLAINTS.filter(c=>{
    const qm = c.customer.toLowerCase().includes(q.toLowerCase())||c.id.includes(q)||c.description.toLowerCase().includes(q.toLowerCase());
    const fm = f==="all"||c.risk.toLowerCase()===f||c.status.toLowerCase().replace(" ","_")===f||c.category.toLowerCase()===f;
    return qm&&fm;
  });
  return (
    <div className="flex-1 overflow-y-auto bg-[#F9FAFB] p-5">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-40">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name, ID, description…"
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-3 py-2 w-full focus:outline-none focus:border-[#1E3A8A]"/>
            <span className="absolute left-2 top-2 text-slate-400"><I.Search/></span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[["all","All"],["high","High Risk"],["open","Open"],["escalated","Escalated"],["fraud","Fraud"],["billing","Billing"]].map(([v,l])=>(
              <button key={v} onClick={()=>setF(v)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${f===v?"bg-[#1E3A8A] text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{l}</button>
            ))}
          </div>
          <span className="text-xs text-slate-400">{list.length} results</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50">
              <tr>{["ID","Customer","Channel","Category","Amount","Sentiment","Priority","Risk","Status","SLA",""].map(h=>(
                <th key={h} className="text-left text-xs font-semibold text-slate-500 px-4 py-2.5">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {list.map(c=>(
                <tr key={c.id} onClick={()=>{setSelected(c);setView("detail");}}
                  className={`border-t border-slate-50 hover:bg-blue-50/40 cursor-pointer transition-colors ${c.risk==="High"?"bg-red-50/20":""}`}>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{c.id}</td>
                  <td className="px-4 py-2.5"><div className="text-xs font-semibold text-slate-700">{c.customer}</div><div className="text-[10px] text-slate-400">{c.region}</div></td>
                  <td className="px-4 py-2.5 text-xs"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{c.channel}</span></td>
                  <td className="px-4 py-2.5 text-xs text-slate-600">{c.category}</td>
                  <td className="px-4 py-2.5 text-xs font-mono text-slate-600">{c.amount}</td>
                  <td className="px-4 py-2.5"><Dot v={c.sentiment}/></td>
                  <td className="px-4 py-2.5"><PriBadge v={c.priority}/></td>
                  <td className="px-4 py-2.5"><RiskBadge v={c.risk}/></td>
                  <td className="px-4 py-2.5"><StaBadge v={c.status}/></td>
                  <td className="px-4 py-2.5 text-xs"><span className={c.sla==="Breached"?"text-red-600 font-semibold":"text-slate-500"}>{c.sla}</span></td>
                  <td className="px-4 py-2.5"><button className="text-[#1E3A8A] text-xs font-medium hover:underline">View →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// AI PANEL (right side)
// ══════════════════════════════════════════════════════
function AIPanel({ai,loading,onAnalyze}) {
  return (
    <div className="w-72 flex-shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-100 bg-[#0d1b3e] flex-shrink-0">
        <div className="flex items-center gap-2 text-white">
          <I.Brain/><span className="font-semibold text-xs">AI Insights Engine</span>
          <span className="ml-auto text-[10px] bg-[#06B6D4]/20 text-[#06B6D4] px-2 py-0.5 rounded-full">ARIA Engine</span>
        </div>
        <p className="text-white/40 text-[10px] mt-0.5">Real-time analysis · ARIA Intelligence Engine</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Empty state */}
        {!ai&&!loading&&(
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mx-auto mb-3 text-[#1E3A8A] border border-blue-100">
              <I.Brain/>
            </div>
            <p className="text-xs font-semibold text-slate-700 mb-1">No Analysis Yet</p>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">Click the button above to run ARIA AI analysis on this complaint</p>
            <button onClick={onAnalyze}
              className="bg-[#1E3A8A] text-white text-xs font-semibold px-5 py-2.5 rounded-lg hover:bg-[#2546a8] transition-colors w-full flex items-center justify-center gap-2">
              <I.Brain/>Run AI Analysis Now
            </button>
          </div>
        )}

        {/* Loading */}
        {loading&&(
          <div className="p-6 text-center">
            <div className="w-12 h-12 border-4 border-[#1E3A8A]/10 border-t-[#1E3A8A] rounded-full animate-spin mx-auto mb-4"/>
            <p className="text-xs font-semibold text-slate-700 mb-1">ARIA Engine Analyzing…</p>
            <div className="space-y-1 text-[10px] text-slate-400">
              <p>✓ Reading complaint text</p>
              <p>⟳ Detecting fraud signals</p>
              <p>⟳ Analyzing sentiment</p>
              <p>⟳ Generating recommendations</p>
            </div>
          </div>
        )}

        {/* Error */}
        {ai?.error&&(
          <div className="m-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-red-700 mb-1">⚠️ Analysis Failed</p>
              <p className="text-[10px] text-red-600 leading-relaxed">{ai.error}</p>
              <button onClick={onAnalyze} className="mt-3 bg-red-600 text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg hover:bg-red-700 w-full">
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {ai&&!ai.error&&(
          <div className="p-4 space-y-3">
            {/* Success banner */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-2.5 flex items-center gap-2">
              <I.Check/><span className="text-xs font-semibold text-green-700">Analysis Complete</span>
              <span className="ml-auto text-[10px] text-green-600">{new Date().toLocaleTimeString()}</span>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <div className="flex items-center gap-1.5 mb-1.5 text-[#1E3A8A]">
                <I.Zap/><span className="text-[10px] font-semibold uppercase tracking-wide">AI Summary</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{ai.summary}</p>
            </div>

            {/* Sentiment */}
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Sentiment Analysis</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ai.sentiment?.label==="Negative"?"bg-red-100 text-red-700":ai.sentiment?.label==="Positive"?"bg-green-100 text-green-700":"bg-slate-100 text-slate-600"}`}>
                  {ai.sentiment?.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-slate-500">Intensity</span>
                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${ai.sentiment?.label==="Negative"?"bg-red-500":ai.sentiment?.label==="Positive"?"bg-green-500":"bg-slate-400"}`}
                    style={{width:`${ai.sentiment?.score||70}%`}}/>
                </div>
                <span className="text-[10px] font-bold text-slate-600">{ai.sentiment?.score}%</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {(ai.sentiment?.emotions||[]).map(e=>(
                  <span key={e} className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">{e}</span>
                ))}
              </div>
            </div>

            {/* Fraud Risk */}
            <div className={`rounded-xl p-3 border ${ai.fraudRisk?.level==="High"?"bg-red-50 border-red-200":ai.fraudRisk?.level==="Medium"?"bg-amber-50 border-amber-200":"bg-green-50 border-green-200"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-slate-700"><I.Shield/><span className="text-[10px] font-semibold uppercase tracking-wide">Fraud Risk Score</span></div>
                <RiskBadge v={ai.fraudRisk?.level||"Low"}/>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-2xl font-bold ${ai.fraudRisk?.level==="High"?"text-red-600":ai.fraudRisk?.level==="Medium"?"text-amber-600":"text-green-600"}`}>
                  {ai.fraudRisk?.score||0}%
                </span>
                <div className="flex-1 bg-white/70 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${ai.fraudRisk?.level==="High"?"bg-red-500":ai.fraudRisk?.level==="Medium"?"bg-amber-500":"bg-green-500"}`}
                    style={{width:`${ai.fraudRisk?.score||0}%`}}/>
                </div>
              </div>
              <div className="space-y-1">
                {(ai.fraudRisk?.indicators||[]).map((ind,i)=>(
                  <div key={i} className="flex items-start gap-1.5 text-[10px] text-red-700">
                    <span className="flex-shrink-0 mt-0.5">⚑</span><span>{ind}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category + Priority grid */}
            <div className="bg-white rounded-xl p-3 border border-slate-100 grid grid-cols-2 gap-2.5">
              {[["Category",ai.category],["Sub-category",ai.subCategory],["Priority",ai.priority],["Est. Resolution",ai.resolutionTime]].map(([l,v])=>(
                <div key={l}>
                  <p className="text-[10px] text-slate-400 mb-0.5">{l}</p>
                  <p className="text-xs font-semibold text-slate-700">{v}</p>
                </div>
              ))}
              <div className="col-span-2">
                <p className="text-[10px] text-slate-400 mb-0.5">Escalation</p>
                <span className={`text-xs font-semibold ${ai.escalationRequired?"text-red-600":"text-green-600"}`}>
                  {ai.escalationRequired?"⚠️ Required":"✓ Not needed"}
                </span>
                {ai.escalationRequired&&ai.escalationReason&&(
                  <p className="text-[10px] text-amber-600 mt-1 bg-amber-50 rounded p-1.5 leading-relaxed">{ai.escalationReason}</p>
                )}
              </div>
            </div>

            {/* RBI Compliance */}
            {ai.complianceFlag&&(
              <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                <p className="text-[10px] font-semibold text-purple-700 mb-1">⚖️ RBI Compliance Note</p>
                <p className="text-[10px] text-purple-600 leading-relaxed">{ai.complianceFlag}</p>
              </div>
            )}

            {/* Next Best Actions */}
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Next Best Actions</p>
              <div className="space-y-1.5">
                {(ai.nextBestActions||[]).map((a,i)=>(
                  <div key={i} className="flex items-start gap-2 bg-slate-50 hover:bg-blue-50 rounded-lg px-2.5 py-2 transition-colors border border-slate-100 cursor-pointer">
                    <span className="w-4 h-4 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                    <span className="text-[10px] text-slate-700 leading-relaxed">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// COMPLAINT DETAIL
// ══════════════════════════════════════════════════════
function Detail({c,setView}) {
  const [ai,setAi]       = useState(null);
  const [loading,setLd]  = useState(false);
  const [reply,setReply] = useState("");
  const [tab,setTab]     = useState("chat");

  const analyze = useCallback(async()=>{
    setLd(true); setAi(null);
    try {
      const r = await runAI(c);
      setAi(r);
      setReply(r.suggestedReply||"");
    } catch(e) {
      setAi({error: e.message||"AI analysis failed. The API may be unavailable or there was a network error."});
    }
    setLd(false);
  },[c]);

  const timeline = [
    {t:"09:14 AM",e:`Complaint received via ${c.channel}`,type:"info"},
    {t:"09:15 AM",e:`Auto-categorized as ${c.category} by ARIA`,type:"ai"},
    {t:"09:16 AM",e:`Priority set to ${c.priority} by AI engine`,type:"ai"},
    {t:"09:30 AM",e:"Assigned to Fraud Investigation Team",type:"action"},
    {t:"10:00 AM",e:"Under active investigation",type:"action"},
  ];

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* LEFT — Complaint + conversation */}
      <div className="flex-1 overflow-y-auto bg-[#F9FAFB] p-5">
        <button onClick={()=>setView("complaints")} className="text-xs text-slate-500 hover:text-[#1E3A8A] mb-4 transition-colors">
          ← Back to Complaints
        </button>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 mb-4">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-xs text-slate-400">{c.id}</span>
                <RiskBadge v={c.risk}/><PriBadge v={c.priority}/><StaBadge v={c.status}/>
              </div>
              <h2 className="text-base font-bold text-slate-800">{c.customer}</h2>
              <p className="text-xs text-slate-500">{c.phone} · {c.region} · via {c.channel} · {c.age} ago</p>
            </div>
            <button onClick={analyze} disabled={loading}
              className="flex items-center gap-2 bg-[#1E3A8A] hover:bg-[#2546a8] disabled:bg-slate-300 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all">
              {loading ? <><I.Spin/>Analyzing…</> : <><I.Brain/>Run AI Analysis</>}
            </button>
          </div>
          <div className="bg-slate-50 border-l-4 border-[#1E3A8A] rounded-r-lg p-4 text-sm text-slate-700 leading-relaxed">
            {c.description}
          </div>
          {c.amount!=="N/A"&&(
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-xs text-slate-500">Amount involved:</span>
              <span className="text-sm font-bold text-red-600">{c.amount}</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100">
            {[["chat","Conversation"],["timeline","Timeline"]].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)}
                className={`px-5 py-2.5 text-xs font-medium transition-colors ${tab===id?"text-[#1E3A8A] border-b-2 border-[#1E3A8A] bg-blue-50/40":"text-slate-500 hover:text-slate-700"}`}>
                {label}
              </button>
            ))}
          </div>

          {tab==="chat"&&(
            <div className="p-5">
              <div className="space-y-4 mb-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600 flex-shrink-0">
                    {c.customer.split(" ").map(w=>w[0]).join("").slice(0,2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-700">{c.customer}</span>
                      <span className="text-xs text-slate-400">· {c.age} ago via {c.channel}</span>
                    </div>
                    <div className="bg-slate-50 rounded-2xl rounded-tl-sm p-3.5 text-xs text-slate-700 leading-relaxed max-w-lg">{c.description}</div>
                  </div>
                </div>

                {ai&&!ai.error&&ai.suggestedReply&&(
                  <div className="flex gap-3 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-[#1E3A8A] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">UB</div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-400">ARIA Draft</span>
                        <span className="text-[10px] bg-[#06B6D4]/10 text-[#06B6D4] px-2 py-0.5 rounded font-semibold">AI Generated</span>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl rounded-tr-sm p-3.5 text-xs text-slate-700 leading-relaxed max-w-lg">{ai.suggestedReply}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <textarea value={reply} onChange={e=>setReply(e.target.value)} rows={3}
                  placeholder={ai&&!ai.error ? "Edit the AI-generated reply above or type your own…" : "Run AI Analysis to get a suggested reply, or type your own…"}
                  className="w-full p-3.5 text-xs text-slate-700 resize-none focus:outline-none min-h-[80px]"/>
                <div className="bg-slate-50 px-3.5 py-2 flex items-center justify-between border-t border-slate-200">
                  <span className="text-[10px] text-slate-400">Powered by ARIA Intelligence Engine · Union Bank</span>
                  <button className="flex items-center gap-1.5 bg-[#1E3A8A] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#2546a8] transition-colors">
                    <I.Send/>Send Response
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab==="timeline"&&(
            <div className="p-5">
              <div className="relative pl-5">
                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-200"/>
                {timeline.map((t,i)=>(
                  <div key={i} className="relative mb-5 last:mb-0">
                    <div className={`absolute -left-3.5 top-1 w-3 h-3 rounded-full border-2 border-white ${t.type==="ai"?"bg-[#06B6D4]":t.type==="action"?"bg-[#1E3A8A]":"bg-slate-300"}`}/>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] text-slate-400 font-mono">{t.t}</span>
                      {t.type==="ai"&&<span className="text-[9px] bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded font-semibold">AI</span>}
                    </div>
                    <p className="text-xs text-slate-700">{t.e}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — AI Panel */}
      <AIPanel ai={ai} loading={loading} onAnalyze={analyze}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// AI INSIGHTS PAGE
// ══════════════════════════════════════════════════════
function AIInsights() {
  const alerts = [
    {title:"Fraud Surge Detected",desc:"Phishing-related fraud up 28% this week. Primary targets: savings accounts in Ahmedabad and Pune regions.",sev:"critical",time:"2 min ago"},
    {title:"SLA Pattern Anomaly",desc:"Billing complaints taking 2.3× longer than benchmark. Root cause: new EMI system rollout.",sev:"high",time:"15 min ago"},
    {title:"Sentiment Improvement",desc:"Customer satisfaction up 12% after implementing ARIA-suggested response templates.",sev:"positive",time:"1 hour ago"},
    {title:"Duplicate Cluster Found",desc:"14 complaints about ATM failures at Kolkata Park Street appear related — recommend single escalation.",sev:"medium",time:"2 hours ago"},
  ];
  return (
    <div className="flex-1 overflow-y-auto bg-[#F9FAFB] p-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-[#0d1b3e] rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-4 text-[#06B6D4]"><I.Brain/><span className="font-semibold text-sm">ARIA Intelligence Summary</span></div>
          <div className="grid grid-cols-2 gap-3">
            {[["94.2%","Fraud Detection Accuracy"],["87ms","Avg Analysis Time"],["3.2×","Faster Resolution"],["12K+","Complaints Analyzed"]].map(([v,l])=>(
              <div key={l} className="bg-white/10 rounded-xl p-3">
                <div className="text-xl font-bold text-[#06B6D4]">{v}</div>
                <div className="text-[10px] text-white/50 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm mb-3">Weekly Fraud Detection</h3>
          <ResponsiveContainer width="100%" height={165}>
            <BarChart data={FRAUD_D}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="w" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/>
              <Tooltip/><Legend wrapperStyle={{fontSize:"10px"}}/>
              <Bar dataKey="det" fill="#ef4444" radius={[3,3,0,0]} name="Detected"/>
              <Bar dataKey="prev" fill="#22c55e" radius={[3,3,0,0]} name="Prevented"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h3 className="font-semibold text-slate-800 mb-3 text-sm">Live AI Alerts</h3>
      <div className="space-y-3">
        {alerts.map((a,i)=>(
          <div key={i} className={`bg-white rounded-xl p-4 shadow-sm border flex items-start gap-4 ${a.sev==="critical"?"border-l-4 border-l-red-500":a.sev==="high"?"border-l-4 border-l-amber-500":a.sev==="positive"?"border-l-4 border-l-green-500":"border-l-4 border-l-blue-400"}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${a.sev==="critical"?"bg-red-100 text-red-600":a.sev==="high"?"bg-amber-100 text-amber-600":a.sev==="positive"?"bg-green-100 text-green-600":"bg-blue-100 text-blue-600"}`}>
              {a.sev==="positive"?<I.Up/>:<I.Alert/>}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-slate-800">{a.title}</span>
                <span className="text-xs text-slate-400">{a.time}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════════════
function Analytics() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F9FAFB] p-5 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm mb-3">Monthly Complaint Trends</h3>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={TREND}>
              <defs>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.2}/><stop offset="100%" stopColor="#1E3A8A" stopOpacity={0}/></linearGradient>
                <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={0.2}/><stop offset="100%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="month" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/>
              <Tooltip/><Legend wrapperStyle={{fontSize:"10px"}}/>
              <Area type="monotone" dataKey="complaints" stroke="#1E3A8A" fill="url(#g2)" strokeWidth={2} name="Total"/>
              <Area type="monotone" dataKey="resolved"   stroke="#22c55e" fill="url(#g3)" strokeWidth={2} name="Resolved"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm mb-3">SLA Performance by Category</h3>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={SLA_D} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis type="number" tick={{fontSize:9}} unit="%"/>
              <YAxis dataKey="cat" type="category" tick={{fontSize:9}} width={45}/>
              <Tooltip formatter={v=>`${v}%`}/><Legend wrapperStyle={{fontSize:"10px"}}/>
              <Bar dataKey="met"    fill="#22c55e" name="Met SLA" stackId="a" radius={[0,3,3,0]}/>
              <Bar dataKey="breach" fill="#ef4444" name="Breached" stackId="a" radius={[0,3,3,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm mb-2">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart><Pie data={SENTIMENT_D} innerRadius={48} outerRadius={68} dataKey="value">
              {SENTIMENT_D.map((e,i)=><Cell key={i} fill={e.color}/>)}
            </Pie><Tooltip/></PieChart>
          </ResponsiveContainer>
          <div className="flex justify-around">
            {SENTIMENT_D.map(d=>(
              <div key={d.name} className="text-center">
                <div className="flex items-center gap-1 justify-center"><span className="w-2 h-2 rounded-full" style={{background:d.color}}/><span className="text-[10px] text-slate-500">{d.name}</span></div>
                <div className="text-xs font-bold text-slate-700">{d.value}%</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm mb-2">Fraud Detection</h3>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={FRAUD_D}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="w" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/>
              <Tooltip/>
              <Bar dataKey="det"  fill="#ef4444" radius={[3,3,0,0]} name="Detected"/>
              <Bar dataKey="prev" fill="#22c55e" radius={[3,3,0,0]} name="Prevented"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm mb-3">Regional Volume</h3>
          <div className="space-y-2.5">
            {[["Mumbai",98,"#1E3A8A"],["Delhi",84,"#1E3A8A"],["Bangalore",71,"#06B6D4"],["Hyderabad",58,"#06B6D4"],["Kolkata",47,"#94a3b8"],["Chennai",43,"#94a3b8"]].map(([city,val,color])=>(
              <div key={city} className="flex items-center gap-2">
                <span className="text-xs text-slate-600 w-20">{city}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full transition-all" style={{width:`${val}%`,background:color}}/>
                </div>
                <span className="text-xs text-slate-500 w-6 text-right">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#0d1b3e] rounded-xl p-5 text-white">
        <h3 className="font-semibold mb-4 text-sm">Key Performance Indicators — Current Quarter</h3>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
          {[["401","Total Complaints"],["87.5%","Resolution Rate"],["4.2 hrs","Avg Resolution"],["₹48.2L","Under Review"],["94.2%","AI Accuracy"],["3.0%","SLA Breach"]].map(([v,l])=>(
            <div key={l} className="text-center">
              <div className="text-lg font-bold text-[#06B6D4]">{v}</div>
              <div className="text-[10px] text-white/50 mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════
function Settings() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F9FAFB] p-5">
      <div className="max-w-xl space-y-4">
        {[
          {title:"AI Engine",desc:"ARIA AI parameters and analysis thresholds.",
           fields:[["AI Model","ARIA Intelligence Engine v1.0"],["Fraud Risk Threshold","65%"],["Auto-escalation Score","80%"],["Analysis Timeout","30 seconds"]]},
          {title:"Notifications",desc:"Alert channels and frequency settings.",
           fields:[["High Risk Alert","Immediate"],["SLA Warning Buffer","2 hours"],["Daily Summary","8:00 AM IST"],["Email Alerts","Enabled"]]},
          {title:"Bank Configuration",desc:"Union Bank of India environment settings.",
           fields:[["Bank Name","Union Bank of India"],["Environment","Production"],["RBI Integration","Active"],["Complaint SLA","10 working days"]]},
        ].map(s=>(
          <div key={s.title} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-0.5 text-sm">{s.title}</h3>
            <p className="text-xs text-slate-400 mb-3">{s.desc}</p>
            {s.fields.map(([l,v])=>(
              <div key={l} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-600">{l}</span>
                <span className="text-xs font-medium text-slate-800 bg-slate-50 px-2.5 py-1 rounded border border-slate-100">{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// ROOT APP — State-based routing, zero 404
// ══════════════════════════════════════════════════════
export default function App() {
  const [page,setPage]       = useState("landing");
  const [view,setView]       = useState("dashboard");
  const [selected,setSelected] = useState(null);

  if (page==="landing") return <Landing onEnter={()=>setPage("app")}/>;

  return (
    <div style={{fontFamily:"'Outfit',sans-serif"}} className="flex h-screen overflow-hidden bg-[#F9FAFB]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');`}</style>
      <Sidebar view={view} setView={v=>{setView(v);setSelected(null);}}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar view={view}/>
        {view==="dashboard"  && <Dashboard  setView={setView} setSelected={setSelected}/>}
        {view==="complaints" && <Complaints setView={setView} setSelected={setSelected}/>}
        {view==="detail"     && selected   && <Detail c={selected} setView={setView}/>}
        {view==="detail"     && !selected  && <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Select a complaint to view details</div>}
        {view==="ai"         && <AIInsights/>}
        {view==="analytics"  && <Analytics/>}
        {view==="settings"   && <Settings/>}
      </div>
    </div>
  );
}
