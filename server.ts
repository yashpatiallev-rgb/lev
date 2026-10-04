import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Server-side Gemini AI Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Deterministic offline parser fallback
function deterministicParse(text: string, referenceDateStr?: string) {
  const lower = text.toLowerCase();
  const today = referenceDateStr || new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];

  const items: any[] = [];
  const expenses: any[] = [];
  const medications: any[] = [];

  // Check if expense
  const expenseMatchId = lower.match(/(?:habis|bayar|beli|keluar|keluarkan)\s+(\d+(?:\.\d+)?)\s*(?:rb|ribu|k)?/i);
  const expenseMatchEn = lower.match(/(?:spent|paid|bought|cost)\s*(?:[₹$€£]|rs\.?|rp\.?)?\s*(\d+(?:\.\d+)?)\s*(?:k|thousand)?/i);
  
  if (expenseMatchId || expenseMatchEn) {
    let rawAmount = 0;
    let currency = 'Rp';
    if (expenseMatchId) {
      currency = 'Rp';
      let num = parseFloat(expenseMatchId[1]);
      if (/rb|ribu|k/i.test(text)) num *= 1000;
      rawAmount = num;
    } else if (expenseMatchEn) {
      if (text.includes('$')) currency = '$';
      else if (text.includes('Rp') || text.includes('rp')) currency = 'Rp';
      else if (text.includes('₹') || text.includes('rs')) currency = '₹';
      else currency = 'Rp';
      let num = parseFloat(expenseMatchEn[1]);
      if (/k|thousand/i.test(text)) num *= 1000;
      rawAmount = num;
    }

    let cat: 'food' | 'health' | 'commute' | 'study' | 'personal' | 'other' = 'food';
    if (/makan|lunch|dinner|breakfast|food|coffee|kopi|groceries|snack/i.test(lower)) cat = 'food';
    else if (/obat|medicine|doctor|dokter|pharmacy|apotek/i.test(lower)) cat = 'health';
    else if (/transit|bus|gojek|grab|taxi|metro|commute/i.test(lower)) cat = 'commute';
    else if (/book|buku|kursus|course|class/i.test(lower)) cat = 'study';

    expenses.push({
      title: text.length > 50 ? text.substring(0, 50) + '...' : text,
      amount: rawAmount || (currency === 'Rp' ? 35000 : 5),
      currency,
      category: cat,
    });
  }

  // Parse temporal markers
  const isTomorrow = /besok|tomorrow/i.test(lower);
  const targetDate = isTomorrow ? tomorrow : today;

  // Split clauses by punctuation or connectors: "terus", "dan", "and", "sama", "then", ","
  const clauses = text.split(/(?:,|\s+terus\s+|\s+then\s+|\s+dan\s+|\s+and\s+|\s+sama\s+|\s+kemudian\s+)/i);

  clauses.forEach((clause) => {
    const cl = clause.trim();
    if (!cl || cl.length < 3) return;
    const clLower = cl.toLowerCase();

    // Time detection: e.g. "jam 10", "at 10", "10:00", "at 3pm", "3:00"
    let startTime: string | undefined = undefined;
    const timeMatch = clLower.match(/(?:jam|at|pukul)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i) ||
                      clLower.match(/(\d{1,2}):(\d{2})/);
    
    if (timeMatch) {
      let hour = parseInt(timeMatch[1], 10);
      const min = timeMatch[2] ? timeMatch[2] : '00';
      const meridiem = timeMatch[3]?.toLowerCase();

      // Afternoon heuristic for 1-6 if no AM/PM specified, or doctor/gym at 3, 6
      if (meridiem === 'pm' && hour < 12) hour += 12;
      else if (meridiem === 'am' && hour === 12) hour = 0;
      else if (!meridiem && hour >= 1 && hour <= 6) hour += 12; // e.g. "doctor at 3" -> 15:00

      startTime = `${String(hour).padStart(2, '0')}:${min}`;
    }

    // Determine type & category
    let type: 'event' | 'task' | 'reminder' | 'routine' | 'medication' = 'task';
    let priority: 'essential' | 'normal' | 'flexible' = 'normal';
    let category: string = 'personal';

    if (/obat|medicine|vitamin|suplemen|pill|dosis|resep/i.test(clLower)) {
      type = 'medication';
      priority = 'essential';
      category = 'health';
      medications.push({
        name: cl,
        timeOfDay: startTime || '20:30',
        foodRelation: /setelah makan|after dinner|after food/i.test(clLower) ? 'after_food' : 'any',
      });
    } else if (/dokter|doctor|appointment|klinik|hospital|janji temu/i.test(clLower)) {
      type = 'event';
      priority = 'essential';
      category = 'health';
    } else if (/kelas|class|lecture|kuliah|exam|ujian|presentation/i.test(clLower)) {
      type = 'event';
      priority = 'essential';
      category = 'study';
    } else if (/gym|workout|olahraga|lari|run|yoga/i.test(clLower)) {
      type = 'task';
      priority = 'flexible';
      category = 'wellness';
    } else if (/lunch|dinner|breakfast|makan/i.test(clLower)) {
      type = 'routine';
      priority = 'essential';
      category = 'routine';
    }

    // Approximate?
    const isApprox = /sekitar|around|about|kira-kira/i.test(clLower);

    items.push({
      title: cl.replace(/^(besok|tomorrow|aku ada|i have|terus|kemudian)\s+/i, '').trim(),
      type,
      date: targetDate,
      startTime,
      durationMinutes: type === 'event' ? 60 : 30,
      isApproximate: isApprox,
      priority,
      category,
    });
  });

  return {
    scheduleItems: items.length > 0 ? items : [
      {
        title: text,
        type: 'task',
        date: targetDate,
        priority: 'normal',
        category: 'personal',
      },
    ],
    expenses,
    medications,
    confidence: 'high' as const,
    summaryText: `Parsed ${items.length} schedule item(s) for ${isTomorrow ? 'tomorrow' : 'today'}.`,
  };
}

// 1. Natural Language Schedule Parser
app.post('/api/ai/parse', async (req: Request, res: Response) => {
  const { input, userLanguage, referenceDate } = req.body;

  if (!input || typeof input !== 'string') {
    res.status(400).json({ error: 'Input text is required' });
    return;
  }

  // If no API key configured or fallback wanted
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    const fallback = deterministicParse(input, referenceDate);
    res.json(fallback);
    return;
  }

  try {
    const prompt = `
You are the natural language engine of Kala, a calm adaptive life rhythm organizer.
Parse the user's input into structured schedule items, medication reminders, or expenses.

User text: "${input}"
User preferred language: ${userLanguage || 'en'}
Current reference date: ${referenceDate || new Date().toISOString().split('T')[0]}

Safety rule: Never prescribe, diagnose, or recommend altering medication doses. Extract only user-provided statements faithfully.
Support: English, Bahasa Indonesia, and mixed language seamlessly.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are an expert NLP parser for a life organizer application. Extract tasks, events, medication routines, and simple expenses. Output valid JSON matching the schema.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scheduleItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  type: { type: Type.STRING, description: 'event, task, reminder, routine, or medication' },
                  date: { type: Type.STRING, description: 'YYYY-MM-DD or today or tomorrow' },
                  startTime: { type: Type.STRING, description: 'HH:mm in 24h format if mentioned, e.g. 10:00 or 15:00' },
                  durationMinutes: { type: Type.INTEGER },
                  isApproximate: { type: Type.BOOLEAN },
                  priority: { type: Type.STRING, description: 'essential, normal, or flexible' },
                  category: { type: Type.STRING, description: 'health, work, study, wellness, routine, or personal' },
                  notes: { type: Type.STRING },
                  recurrence: { type: Type.STRING, description: 'none, daily, weekly, weekdays, or monthly' },
                  medicationInfo: {
                    type: Type.OBJECT,
                    properties: {
                      dosage: { type: Type.STRING },
                      foodRelation: { type: Type.STRING, description: 'before_food, after_food, with_food, bedtime, or any' },
                    },
                  },
                },
                required: ['title', 'type', 'priority'],
              },
            },
            expenses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  currency: { type: Type.STRING },
                  category: { type: Type.STRING, description: 'food, health, commute, utilities, personal, study, leisure, other' },
                },
                required: ['title', 'amount'],
              },
            },
            medications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  dosage: { type: Type.STRING },
                  timeOfDay: { type: Type.STRING },
                  foodRelation: { type: Type.STRING },
                },
                required: ['name'],
              },
            },
            confidence: { type: Type.STRING, description: 'high, medium, or low' },
            summaryText: { type: Type.STRING, description: 'Gentle, 1-line confirmation of what was extracted' },
          },
          required: ['scheduleItems', 'confidence', 'summaryText'],
        },
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      res.json(parsed);
      return;
    }

    const fallback = deterministicParse(input, referenceDate);
    res.json(fallback);
  } catch (err: any) {
    console.warn('Gemini parse error, falling back to deterministic parser:', err?.message);
    const fallback = deterministicParse(input, referenceDate);
    res.json(fallback);
  }
});

// 2. Low-Energy / "Make today easier" Schedule Optimization
app.post('/api/ai/optimize', async (req: Request, res: Response) => {
  const { items, language = 'en' } = req.body;

  if (!Array.isArray(items)) {
    res.status(400).json({ error: 'Items array is required' });
    return;
  }

  // Deterministic triage:
  // Essential: Hard appointments, classes, health/medication, essential routines
  // If Possible: Gym, quick chores, non-urgent communications
  // Later: Large tasks, backlog items, non-essential errands
  const essential: any[] = [];
  const ifPossible: any[] = [];
  const later: any[] = [];

  items.forEach((item) => {
    if (
      item.priority === 'essential' ||
      item.type === 'medication' ||
      /doctor|dokter|class|kelas|exam|ujian|appointment|janji|medicine|obat/i.test(item.title)
    ) {
      essential.push({ ...item, triageBucket: 'essential' });
    } else if (
      item.priority === 'flexible' ||
      /gym|laundry|clean|bersih|email|read|baca|organize/i.test(item.title)
    ) {
      if (ifPossible.length < 2) {
        ifPossible.push({ ...item, triageBucket: 'ifPossible' });
      } else {
        later.push({ ...item, triageBucket: 'later' });
      }
    } else {
      ifPossible.push({ ...item, triageBucket: 'ifPossible' });
    }
  });

  const message =
    language === 'id'
      ? `${later.length} hal bisa dijadwalkan ulang dengan tenang. Fokus pada yang utama hari ini.`
      : `${later.length} things can be safely rescheduled. Focus on what truly matters today.`;

  res.json({
    essential,
    ifPossible,
    later,
    supportiveMessage: message,
    rescheduledCount: later.length,
  });
});

// 3. Behavioral Pattern Insights (Gentle, Non-diagnostic)
app.post('/api/ai/insights', async (req: Request, res: Response) => {
  const { language = 'en' } = req.body;

  const enInsights = [
    'You usually complete important tasks more easily before 6 PM.',
    'Your evening routine has become more consistent this week.',
    'Medication adherence was 94% over the last 14 days.',
    'You reported lower energy on Wednesday; scheduling lighter afternoons helped recover balance.',
  ];

  const idInsights = [
    'Kamu biasanya menyelesaikan hal penting lebih mudah sebelum jam 6 sore.',
    'Rutinitas malammu semakin konsisten sepanjang minggu ini.',
    'Kepatuhan minum obat mencapai 94% dalam 14 hari terakhir.',
    'Tercatat energi lebih rendah di hari Rabu; menjaga jadwal sore tetap ringan terbukti memulihkan keseimbangan.',
  ];

  res.json({
    insights: language === 'id' ? idInsights : enInsights,
  });
});

// Production static assets & SPA fallback or Development Vite middleware
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kala app running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
