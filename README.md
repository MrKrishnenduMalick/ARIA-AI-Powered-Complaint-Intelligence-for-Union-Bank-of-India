# ARIA — AI Resolution & Intelligence Assistant
### Union Bank of India | Hackathon 2025

> AI-powered complaint intelligence platform that aggregates complaints from email, chat, and calls — analyzing sentiment, detecting fraud, and suggesting resolutions instantly using Claude AI.

---

## 🚀 Run Locally (3 commands)

```bash
npm install
npm run dev
# Open http://localhost:5173
```

---

## ☁️ Deploy to Vercel

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Leave all settings as default → click **Deploy**
4. Done — live URL in ~30 seconds ✅

> `vercel.json` is already included — no 404 errors guaranteed.

---

## ☁️ Deploy to Netlify

1. Run `npm run build`
2. Drag the `dist/` folder to [netlify.com/drop](https://app.netlify.com/drop)
3. Done ✅

> `public/_redirects` is already included — no 404 errors guaranteed.

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| AI | Anthropic Claude API |
| Deploy | Vercel / Netlify |

---

## 🧠 AI Features (Live)

Click **"Run AI Analysis"** on any complaint to get:

- Complaint summarization
- Sentiment analysis + emotion detection
- Fraud risk score with indicators
- RBI compliance flags
- AI-drafted customer response
- Next best action recommendations
- Auto escalation detection

---

## 📁 Project Structure

```
aria/
├── index.html
├── vercel.json          ← fixes 404 on Vercel
├── public/
│   └── _redirects       ← fixes 404 on Netlify
├── src/
│   ├── main.jsx
│   ├── index.css
│   └── App.jsx          ← entire app in one file
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 📜 License

Hackathon Demo — Union Bank of India · 2025
