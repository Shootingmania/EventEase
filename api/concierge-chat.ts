import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req: any, res: any) {
  // Set CORS headers for Vercel deployment
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

  const { message, plan, history } = req.body || {};

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        reply: `Namaste! As your celebration concierge for ${plan?.name || 'your event'}: In ${plan?.city || 'India'}, vendors usually quote 15-20% above market rates. Focus on package bundling (e.g. photobook + reels, or live chaat counters included with dinner).`,
        aiPowered: false,
      });
    }

    const systemPrompt = `You are the EventEase Celebration Concierge, a helpful, polite, and culturally knowledgeable Indian event planning expert.
Current Celebration: ${plan?.name || 'Celebration'}
Occasion: ${plan?.type || 'Event'}
City: ${plan?.city || 'Bengaluru'}
Total Budget: ₹${plan?.totalBudget ? Number(plan.totalBudget).toLocaleString('en-IN') : '2,00,000'}
Guests: ${plan?.guestsCount || 100} (Seniors: ${plan?.guestBreakdown?.seniors || 0}, Children: ${plan?.guestBreakdown?.children || 0})
Venue: ${plan?.venueName || 'Local Banquet'}

Guidelines:
- Give practical, culturally authentic Indian advice (covering Muhurats, catering live counters, decibel limits, and vendor negotiation in ${plan?.city || 'India'}).
- Never hallucinate exact contract figures; refer to the provided budget.
- Keep answers warm, concise (2-4 sentences max), and directly actionable.`;

    let promptText = `${systemPrompt}\n\n`;
    if (Array.isArray(history) && history.length > 0) {
      promptText += `Previous conversation:\n`;
      for (const h of history.slice(-4)) {
        promptText += `${h.role === 'user' ? 'User' : 'Concierge'}: ${h.text}\n`;
      }
      promptText += `\n`;
    }
    promptText += `User Question: ${message}`;

    const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let text = null;

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: promptText,
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
      throw new Error('Gemini models did not return a response');
    }

    return res.status(200).json({
      reply: text.trim(),
      aiPowered: true,
    });
  } catch (err: any) {
    console.error('Vercel concierge-chat error:', err?.message);
    return res.status(200).json({
      reply: `For your ${plan?.type || 'event'} in ${plan?.city || 'India'}, negotiate by requesting complimentary upgrades (such as live chaat counters or extended sound check windows) instead of direct price deductions.`,
      aiPowered: false,
      error: err?.message,
    });
  }
}
