export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "API_KEY not set in Vercel environment variables" });
  }

  try {
    const { messages } = req.body;
    const userMessage = messages[0].content;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Gemini API error" });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Return in same format as Anthropic so App.jsx works unchanged
    return res.status(200).json({
      content: [{ type: "text", text }]
    });

  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
