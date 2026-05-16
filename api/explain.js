module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { word, english, hindi } = req.body || {};
  if (!word) return res.status(400).json({ text: 'Word missing' });

  const prompt = `You are a fun, street-smart German tutor explaining "${word}" (English: "${english}", Hindi: "${hindi}") to an Indian/Pakistani A1 student.

Write in natural Hinglish like texting a close dost. NO bullet points. NO bold. NO headers. Flowing paragraphs only.

Structure:
Paragraph 1 — ONE vivid real-life scene in Germany where this word is used. Name a specific place (Bahnhof, Supermarkt, Café, Arzt, Wohnung etc). 2-3 sentences. Make them feel they are THERE.

Then write the exact German sentence a native would say in that moment.
Matlab: [casual Hinglish translation]

Memory trick: [one punchy, funny line linking German sound to Hindi/Urdu/English — make it stick]

Rules: one scene only, real sentence Germans say, 100-130 words total, no markdown.`;

  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return res.status(200).json({
      text: `Yaar, "${word}" ka matlab hai "${english}". Germany mein yeh word roz ki zindagi mein use hota hai — ek baar real situation mein suno toh pakka yaad ho jaayega!`
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 350, temperature: 0.85 }
        })
      }
    );

    const data = await response.json();

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    }
    throw new Error('Empty response');
  } catch (e) {
    return res.status(200).json({
      text: `Yaar, "${word}" ka matlab hai "${english}". Germany mein yeh word roz ki zindagi mein use hota hai!`
    });
  }
};
