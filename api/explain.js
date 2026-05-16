module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { word, english, hindi } = req.body;

  const prompt = `You are a fun, street-smart German tutor explaining the word "${word}" (English: "${english}", Hindi: "${hindi}") to an Indian/Pakistani student learning German A1.

Speak EXACTLY like a close dost — natural Hinglish (Hindi + English mix). No formal language. No bullet points. No robotic dictionary style. Write in flowing paragraphs like texting a friend.

Follow this EXACT format:

[Paint a vivid real-life scene in Germany where this word naturally comes up. Make the student feel like they are THERE — in a shop, café, train station, doctor, flatmate conversation etc. Be very specific and visual. 2-3 sentences.]

[Write the EXACT German sentence a native speaker would say in that moment.]
Matlab: [translate in casual Hinglish]

Memory trick: [One punchy, funny, memorable line connecting the German sound to something in Hindi/Urdu/English. Make it stick.]

STRICT RULES:
- ONE specific scene only — not multiple examples
- The German sentence must be something real Germans say in daily life
- Memory trick must be clever, not generic
- Total: 100–140 words max
- NO bullet points, NO headers, NO asterisks or markdown`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (data.content && data.content[0] && data.content[0].text) {
      return res.status(200).json({ text: data.content[0].text });
    }
    throw new Error('Bad response from Claude');
  } catch (e) {
    return res.status(200).json({
      text: `Yaar, "${word}" ka matlab hai "${english}". Germany mein yeh word real life mein tab use hota hai jab tu wahan actually hoga — ek baar sun lo, pakka yaad ho jaayega!`
    });
  }
};
