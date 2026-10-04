import { AIParseResult, ScheduleItem } from '../types';

export const aiService = {
  async parseNaturalLanguage(
    text: string,
    userLanguage: 'en' | 'id' = 'en',
    referenceDate?: string
  ): Promise<AIParseResult> {
    try {
      const res = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text, userLanguage, referenceDate }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Network parse fallback triggered:', err);
      // Local client-side fallback
      return fallbackParse(text, userLanguage, referenceDate);
    }
  },

  async optimizeSchedule(
    items: ScheduleItem[],
    language: 'en' | 'id' = 'en'
  ): Promise<{
    essential: ScheduleItem[];
    ifPossible: ScheduleItem[];
    later: ScheduleItem[];
    supportiveMessage: string;
    rescheduledCount: number;
  }> {
    try {
      const res = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, language }),
      });

      if (!res.ok) throw new Error('Failed to optimize');
      return await res.json();
    } catch {
      // Local client-side triage
      const essential: ScheduleItem[] = [];
      const ifPossible: ScheduleItem[] = [];
      const later: ScheduleItem[] = [];

      items.forEach((item) => {
        if (
          item.priority === 'essential' ||
          item.type === 'medication' ||
          /doctor|dokter|class|kelas|exam|appointment|janji|medicine|obat/i.test(item.title)
        ) {
          essential.push({ ...item, triageBucket: 'essential' });
        } else if (
          item.priority === 'flexible' ||
          /gym|laundry|clean|bersih|email|read|organize/i.test(item.title)
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

      return {
        essential,
        ifPossible,
        later,
        supportiveMessage:
          language === 'id'
            ? `${later.length} hal bisa dijadwalkan ulang dengan tenang. Fokus pada yang utama hari ini.`
            : `${later.length} things can be safely rescheduled. Focus on what truly matters today.`,
        rescheduledCount: later.length,
      };
    }
  },
};

function fallbackParse(text: string, language: 'en' | 'id', referenceDate?: string): AIParseResult {
  const lower = text.toLowerCase();
  const today = referenceDate || new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];

  const isTomorrow = /besok|tomorrow/i.test(lower);
  const targetDate = isTomorrow ? tomorrow : today;

  const items: any[] = [];
  const expenses: any[] = [];
  const medications: any[] = [];

  // Expense detection
  const expMatch = lower.match(/(?:spent|paid|habis|beli|bayar)\s*(?:[₹$€£]|rs\.?|rp\.?)?\s*(\d+(?:\.\d+)?)\s*(?:k|rb|ribu|thousand)?/i);
  if (expMatch) {
    let amt = parseFloat(expMatch[1]);
    if (/k|rb|ribu/i.test(lower)) amt *= 1000;
    expenses.push({
      title: text.substring(0, 40),
      amount: amt || 100,
      currency: text.includes('$') ? '$' : text.includes('₹') ? '₹' : 'Rp',
      category: /makan|lunch|dinner|kopi|coffee/i.test(lower) ? 'food' : 'personal',
    });
  }

  // Split clauses
  const parts = text.split(/(?:,|\s+terus\s+|\s+then\s+|\s+dan\s+|\s+and\s+|\s+sama\s+|\s+kemudian\s+)/i);
  parts.forEach((part) => {
    const p = part.trim();
    if (!p || p.length < 3) return;
    const pLower = p.toLowerCase();

    // Time detection: e.g. "jam 10", "at 3", "6:00", "around 6"
    let startTime: string | undefined = undefined;
    const timeMatch = pLower.match(/(?:jam|at|pukul)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i) ||
                      pLower.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1], 10);
      const min = timeMatch[2] ? timeMatch[2] : '00';
      const meridiem = timeMatch[3]?.toLowerCase();

      if (meridiem === 'pm' && hour < 12) hour += 12;
      else if (meridiem === 'am' && hour === 12) hour = 0;
      else if (!meridiem && hour >= 1 && hour <= 6) hour += 12;

      startTime = `${String(hour).padStart(2, '0')}:${min}`;
    }

    let type: any = 'task';
    let priority: any = 'normal';
    let category = 'personal';

    if (/obat|medicine|vitamin|suplemen|pill/i.test(pLower)) {
      type = 'medication';
      priority = 'essential';
      category = 'health';
      medications.push({
        name: p,
        timeOfDay: startTime || '21:00',
        foodRelation: /setelah makan|after dinner|after food/i.test(pLower) ? 'after_food' : 'any',
      });
    } else if (/dokter|doctor|appointment|klinik/i.test(pLower)) {
      type = 'event';
      priority = 'essential';
      category = 'health';
    } else if (/kelas|class|lecture|kuliah/i.test(pLower)) {
      type = 'event';
      priority = 'essential';
      category = 'study';
    } else if (/gym|workout|olahraga/i.test(pLower)) {
      type = 'task';
      priority = 'flexible';
      category = 'wellness';
    }

    items.push({
      title: p.replace(/^(besok|tomorrow|aku ada|i have|terus|kemudian)\s+/i, '').trim(),
      type,
      date: targetDate,
      startTime,
      durationMinutes: type === 'event' ? 60 : 30,
      isApproximate: /sekitar|around|about/i.test(pLower),
      priority,
      category,
    });
  });

  return {
    scheduleItems: items.length > 0 ? items : [{
      title: text,
      type: 'task',
      date: targetDate,
      priority: 'normal',
      category: 'personal',
    }],
    expenses,
    medications,
    confidence: 'high',
    summaryText: language === 'id'
      ? `Terurai ${items.length} jadwal untuk ${isTomorrow ? 'besok' : 'hari ini'}.`
      : `Extracted ${items.length} schedule item(s) for ${isTomorrow ? 'tomorrow' : 'today'}.`,
  };
}
