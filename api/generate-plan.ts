import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { profile, city } = req.body || {};

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'No GEMINI_API_KEY configured on host.',
      });
    }

    const prompt = `You are EventEase, an expert event planning assistant for celebrations in India.
Event Occasion: ${profile?.type}
Event Name: ${profile?.name}
City: ${city || profile?.city || 'Bengaluru'}
Target Budget (INR): ₹${profile?.totalBudget ? Number(profile.totalBudget).toLocaleString('en-IN') : '2,00,000'}
Expected Guests: ${profile?.guestsCount || 80} (Children: ${profile?.guestBreakdown?.children || 0}, Seniors: ${profile?.guestBreakdown?.seniors || 0})
Occasion Specifics: ${JSON.stringify(profile?.occasionSpecifics || {})}

Tasks:
1. Suggest 2-3 authentic, curated themes with specific color palettes suited to this occasion and age mix.
2. Suggest 3-4 prioritized add-ons (must / nice / optional) for this budget.
3. Suggest 2 practical negotiation tips specifically for Indian vendors in ${city || profile?.city || 'Bengaluru'}.
4. Provide a recommended auspicious timing / Muhurat note.
5. Provide 2-3 specific elder or toddler comfort guardrails.

Format your response strictly as JSON with this schema:
{
  "themes": [
    { "name": "string", "description": "string", "colors": ["string"] }
  ],
  "addons": [
    { "name": "string", "priority": "must|nice|optional", "reason": "string" }
  ],
  "negotiationTips": {
    "catering": ["string"],
    "decor": ["string"],
    "photography": ["string"]
  },
  "muhuratNote": "string",
  "guardrails": [
    { "title": "string", "detail": "string", "badge": "string" }
  ]
}
Return only JSON without markdown fences.`;

    const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let text = null;

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        if (response && response.text) {
          text = response.text;
          break;
        }
      } catch (e: any) {
        console.warn(`Model ${model} error:`, e?.message);
      }
    }

    if (!text) {
      throw new Error('Gemini API did not respond');
    }

    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (err: any) {
    console.warn('Vercel generate-plan error:', err?.message);
    return res.status(200).json({
      success: false,
      fallback: true,
      error: err?.message,
    });
  }
}
