import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize server-side Gemini client with official httpOptions telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
  });
});

// Helper to call Gemini with multi-model fallback
async function callGemini(contents: string): Promise<string | null> {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (e) {
      console.warn(`Model ${model} warning:`, (e as Error).message);
    }
  }
  return null;
}

// Endpoint: AI Creative Plan Generator
app.post('/api/generate-plan', async (req, res) => {
  const { profile, budgetSplit, city } = req.body;

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: false,
        fallback: true,
        message: 'No GEMINI_API_KEY provided; using deterministic Indian event templates.',
      });
    }

    const prompt = `You are EventEase, an expert event planning assistant for celebrations in India.
Event Occasion: ${profile.type}
Event Name: ${profile.name}
City: ${city || profile.city || 'Bengaluru'}
Target Budget (INR): ₹${profile.totalBudget?.toLocaleString('en-IN')}
Expected Guests: ${profile.guestsCount} (Children: ${profile.guestBreakdown?.children || 0}, Seniors: ${profile.guestBreakdown?.seniors || 0})
Occasion Specifics: ${JSON.stringify(profile.occasionSpecifics || {})}

Tasks:
1. Suggest 2-3 authentic, curated themes with specific color palettes suited to this occasion and age mix.
2. Suggest 3-4 prioritized add-ons (must / nice / optional) for this budget.
3. Suggest 2 practical negotiation tips specifically for Indian vendors in ${city || profile.city || 'Bengaluru'}.
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

    const text = await callGemini(prompt);
    if (!text) {
      throw new Error('All Gemini model endpoints busy or unreachable');
    }

    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    res.json({
      success: true,
      data: parsed,
    });
  } catch (err) {
    console.warn('Gemini generate-plan fallback engaged:', (err as Error).message);
    res.json({
      success: false,
      fallback: true,
      error: (err as Error).message,
    });
  }
});

// Endpoint: Live AI Concierge Chat
app.post('/api/concierge-chat', async (req, res) => {
  const { message, plan, history } = req.body;

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        reply: `Namaste! As your celebration concierge for ${plan?.name || 'your event'}: In ${plan?.city || 'India'}, vendors usually quote 15-20% above market rates. Focus on package bundling (e.g. photobook + reels, or live chaat counters included with dinner).`,
        aiPowered: false,
      });
    }

    const systemPrompt = `You are the EventEase Celebration Concierge, a helpful, polite, and culturally knowledgeable Indian event planning expert.
Current Celebration: ${plan?.name}
Occasion: ${plan?.type}
City: ${plan?.city}
Total Budget: ₹${plan?.totalBudget ? Number(plan.totalBudget).toLocaleString('en-IN') : '2,00,000'}
Guests: ${plan?.guestsCount || 100} (Seniors: ${plan?.guestBreakdown?.seniors || 0}, Children: ${plan?.guestBreakdown?.children || 0})
Venue: ${plan?.venueName || 'Local Grounds'}

Guidelines:
- Give practical, culturally authentic Indian advice (covering Muhurats, catering live counters, decibel limits, vendor negotiation).
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

    const text = await callGemini(promptText);
    if (!text) {
      throw new Error('Gemini models currently at capacity');
    }

    res.json({
      reply: text.trim(),
      aiPowered: true,
    });
  } catch (err) {
    console.error('Gemini concierge chat fallback:', (err as Error).message);
    res.json({
      reply: `For ${plan?.city || 'Indian celebrations'}, we recommend bundling vendor deliverables (like candid photography with family reels) and requesting complimentary items (such as a welcome mocktail dispenser or live chaat counter) rather than direct fee reductions.`,
      aiPowered: false,
      error: (err as Error).message,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EventEase full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
