import {
  ScheduleItem,
  Medication,
  MedicationLog,
  CycleEntry,
  Expense,
  MoneyBudget,
  FutureMeNote,
  DailyReflection,
  WorldElement,
  WorldState,
  UserPreferences,
  DailyCheckIn,
} from '../types';

const STORAGE_KEYS = {
  SCHEDULE: 'kala_schedule_items',
  MEDICATIONS: 'kala_medications',
  MED_LOGS: 'kala_medication_logs',
  CYCLE: 'kala_cycle_entries',
  EXPENSES: 'kala_expenses',
  BUDGET: 'kala_budget',
  FUTURE_ME: 'kala_future_me_notes',
  REFLECTIONS: 'kala_reflections',
  WORLD_STATE: 'kala_world_state',
  PREFERENCES: 'kala_user_preferences',
  CHECK_IN: 'kala_daily_checkin',
};

// Formats a Date object to YYYY-MM-DD in local time
export const toDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getTodayKey = (): string => toDateKey(new Date());

export const getOffsetDateKey = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toDateKey(d);
};

// Expanded, rich Sanctuary World catalog
export const WORLD_ELEMENTS_CATALOG: WorldElement[] = [
  {
    id: 'elem_mossy_stone',
    name: 'Ancient Mossy Rock of Stillness',
    nameId: 'Batu Kuno Berlumut Kedamaian',
    category: 'stone',
    discoveredAt: '2026-09-15',
    story: 'Firm and weathered across seasons. A gentle anchor reminding you that quiet grounding begins by slowing down.',
    storyId: 'Kukuh dan tenang melintasi pergantian musim. Pengingat lembut bahwa ketenangan sejati berakar dari keheningan.',
    iconName: 'Shield',
    coordinates: { x: 22, y: 74 },
  },
  {
    id: 'elem_blue_fern',
    name: 'Silver-Blue Shade Ferns',
    nameId: 'Rumpun Pakis Biru Perak',
    category: 'fern',
    discoveredAt: '2026-09-20',
    story: 'Unfurls softly in dappled forest shade. Teaches the quiet grace of flourishing without rushing.',
    storyId: 'Merekah perlahan di balik teduh pepohonan, mengajarkan arti bertumbuh dengan sabar dan anggun.',
    iconName: 'Sprout',
    coordinates: { x: 38, y: 65 },
  },
  {
    id: 'elem_crystal_stream',
    name: 'Whispering Crystal Brook',
    nameId: 'Aliran Sungai Jernih',
    category: 'water',
    discoveredAt: '2026-09-28',
    story: 'Carves a winding path gently through granite stones, flowing around obstacles with effortless fluidity.',
    storyId: 'Mengalir lembut mengitari bebatuan tanpa melawan, melaju dengan keanggunan yang tenang.',
    iconName: 'Droplets',
    coordinates: { x: 50, y: 78 },
  },
  {
    id: 'elem_resting_bench',
    name: 'Cedar Reflection Bench',
    nameId: 'Bangku Kayu Teduh',
    category: 'structure',
    discoveredAt: '2026-10-01',
    story: 'Nestled beneath an ancient weeping willow. An open invitation to sit, breathe, and put down your mental load.',
    storyId: 'Diletakkan di bawah naungan pohon rindang. Undangan terbuka untuk duduk, bernapas, dan melepaskan beban pikiran.',
    iconName: 'Coffee',
    coordinates: { x: 68, y: 58 },
  },
  {
    id: 'elem_wild_lavender',
    name: 'Fragrant Wild Lavender Meadow',
    nameId: 'Padang Lavender Liar Harum',
    category: 'flower',
    discoveredAt: '2026-10-02',
    story: 'Sways in the afternoon breeze, releasing honeyed calming notes as twilight settles over the mountains.',
    storyId: 'Bergoyang lembut diterpa angin sore, menebarkan aroma menenangkan saat senja menyelimuti bukit.',
    iconName: 'Flower2',
    coordinates: { x: 80, y: 68 },
  },
  {
    id: 'elem_twilight_fireflies',
    name: 'Luminous Twilight Fireflies',
    nameId: 'Kunang-kunang Cahaya Senja',
    category: 'creature',
    discoveredAt: '2026-10-03',
    story: 'Drifting like warm golden sparks through the reeds, lighting your steps through the evening calm.',
    storyId: 'Melayang anggun bagai percikan cahaya hangat di antara ilalang, menerangi langkah dalam keheningan malam.',
    iconName: 'Sparkles',
    coordinates: { x: 42, y: 44 },
  },
  {
    id: 'elem_quiet_basin',
    name: 'Mirror Reflection Pond & Lotus',
    nameId: 'Kolam Cermin Teratai',
    category: 'water',
    discoveredAt: '2026-10-04',
    story: 'Glass-smooth waters reflecting sky and passing clouds. Where koi glide peacefully beneath floating water lilies.',
    storyId: 'Permukaan air hening bak kaca yang memantulkan langit dan awan, tempat teratai mekar dengan damai.',
    iconName: 'Sun',
    coordinates: { x: 28, y: 52 },
  },
  {
    id: 'elem_stone_lantern',
    name: 'Warm Stone Pagoda Lantern',
    nameId: 'Lentera Batu Hangat',
    category: 'structure',
    discoveredAt: '2026-10-04',
    story: 'Carved river granite holding a soft amber flame that flickers faithfully through rain and mountain mist.',
    storyId: 'Lentera batu sungai yang memancarkan nyala temaram hangat, setia menyala di tengah kabut pegunungan.',
    iconName: 'Compass',
    coordinates: { x: 58, y: 62 },
  },
  {
    id: 'elem_wind_chime',
    name: 'Bamboo Wind Chimes',
    nameId: 'Genta Angin Bambu',
    category: 'structure',
    discoveredAt: '2026-10-04',
    story: 'Hollow bamboo tuned to pentatonic frequencies, chiming resonant melodies with every wandering breeze.',
    storyId: 'Bambu alami yang berdenting lembut saat tersentuh angin, menyebarkan harmoni damai ke sekeliling.',
    iconName: 'Sparkles',
    coordinates: { x: 74, y: 48 },
  },
  {
    id: 'elem_stepping_stones',
    name: 'River Stepping Stones',
    nameId: 'Batu Pijakan Sungai',
    category: 'stone',
    discoveredAt: '2026-10-04',
    story: 'Smooth flat stones crossing the brook one measured stride at a time. Reminding you that life is lived step by step.',
    storyId: 'Batu pijakan pipih yang menyeberangi sungai selangkah demi selangkah. Pengingat untuk menjalani hidup perlahan.',
    iconName: 'Compass',
    coordinates: { x: 46, y: 84 },
  },
];

// Sample demo schedule available on demand (never forced on new users!)
export const getSampleDemoSchedule = (): ScheduleItem[] => {
  const today = getTodayKey();
  const tomorrow = getOffsetDateKey(1);

  return [
    {
      id: `sample_${Date.now()}_1`,
      title: 'Morning Vitamin & Water',
      type: 'medication',
      date: today,
      startTime: '08:00',
      durationMinutes: 10,
      priority: 'essential',
      isCompleted: true,
      category: 'health',
      medicationInfo: { dosage: '1 tablet', foodRelation: 'after_food' },
      triageBucket: 'essential',
    },
    {
      id: `sample_${Date.now()}_2`,
      title: 'Design Studio Critique',
      type: 'event',
      date: today,
      startTime: '10:00',
      endTime: '11:30',
      durationMinutes: 90,
      priority: 'essential',
      isCompleted: false,
      category: 'study',
      notes: 'Review wireframes with team',
      triageBucket: 'essential',
    },
    {
      id: `sample_${Date.now()}_3`,
      title: 'Nutritious lunch & quiet walk',
      type: 'routine',
      date: today,
      startTime: '12:30',
      durationMinutes: 45,
      priority: 'essential',
      isCompleted: false,
      category: 'wellness',
      triageBucket: 'essential',
    },
    {
      id: `sample_${Date.now()}_4`,
      title: 'Doctor checkup',
      type: 'event',
      date: today,
      startTime: '15:00',
      durationMinutes: 45,
      priority: 'essential',
      isCompleted: false,
      category: 'health',
      triageBucket: 'essential',
    },
    {
      id: `sample_${Date.now()}_5`,
      title: 'Gentle workout / Gym',
      type: 'task',
      date: today,
      startTime: '17:30',
      durationMinutes: 45,
      isApproximate: true,
      priority: 'flexible',
      isCompleted: false,
      category: 'wellness',
      triageBucket: 'ifPossible',
    },
    {
      id: `sample_${Date.now()}_6`,
      title: 'Evening wind-down & reading',
      type: 'routine',
      date: today,
      startTime: '20:30',
      durationMinutes: 30,
      priority: 'normal',
      isCompleted: false,
      category: 'routine',
      triageBucket: 'essential',
    },
  ];
};

export const getStoredData = () => {
  const load = <T>(key: string, fallback: T): T => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return fallback;
      return JSON.parse(data);
    } catch {
      return fallback;
    }
  };

  // One-time thorough cleanup of legacy pre-populated demo data from browser storage
  const isCleaned = localStorage.getItem('kala_clean_v5_pure_reset');
  if (!isCleaned) {
    localStorage.removeItem(STORAGE_KEYS.SCHEDULE);
    localStorage.removeItem(STORAGE_KEYS.MEDICATIONS);
    localStorage.removeItem(STORAGE_KEYS.MED_LOGS);
    localStorage.removeItem(STORAGE_KEYS.CYCLE);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.BUDGET);
    localStorage.removeItem(STORAGE_KEYS.FUTURE_ME);
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    localStorage.removeItem(STORAGE_KEYS.CHECK_IN);
    localStorage.removeItem('kala_clean_v3');
    localStorage.setItem('kala_clean_v5_pure_reset', 'true');
  }

  // Clean initial states for real users (NO preloaded tasks or fake data)
  const defaultSchedule: ScheduleItem[] = [];

  const defaultPreferences: UserPreferences = {
    name: '', // Empty by default so user can set their own name
    language: 'en',
    lowEnergyModeActive: false,
    currency: 'IDR', // Default base with dual IDR + USD display
    showCycleModule: true,
    preferredWakeTime: '07:30',
    preferredSleepTime: '23:00',
  };

  const defaultBudget: MoneyBudget = {
    totalAvailable: 0,
    safeToSpend: 0,
    monthlyUpcoming: 0,
    weeklyBudget: 0,
    currency: 'IDR',
  };

  const defaultWorld: WorldState = {
    discoveredIds: [
      'elem_mossy_stone',
      'elem_blue_fern',
      'elem_crystal_stream',
      'elem_resting_bench',
      'elem_wild_lavender',
      'elem_quiet_basin',
      'elem_stone_lantern',
    ],
    growthScore: 75,
    lastVisitedDate: getTodayKey(),
    activeAmbience: 'auto',
  };

  // Load raw stored data
  const rawSchedule = load<ScheduleItem[]>(STORAGE_KEYS.SCHEDULE, defaultSchedule);
  // Ensure legacy sample items are filtered out if any lingered
  const cleanSchedule = rawSchedule.filter((item) => !item.id.startsWith('sample_'));

  const rawMedications = load<Medication[]>(STORAGE_KEYS.MEDICATIONS, []);
  const cleanMedications = rawMedications.filter((m) => !m.id.startsWith('sample_'));

  const storedPreferences = load<UserPreferences>(STORAGE_KEYS.PREFERENCES, defaultPreferences);

  // Load today's check-in (reset if from previous day)
  const storedCheckIn = load<DailyCheckIn | null>(STORAGE_KEYS.CHECK_IN, null);
  const todayKey = getTodayKey();
  const validTodayCheckIn = storedCheckIn && storedCheckIn.date === todayKey ? storedCheckIn : null;

  return {
    schedule: cleanSchedule,
    medications: cleanMedications,
    medLogs: load<MedicationLog[]>(STORAGE_KEYS.MED_LOGS, []),
    cycle: load<CycleEntry[]>(STORAGE_KEYS.CYCLE, []),
    expenses: load<Expense[]>(STORAGE_KEYS.EXPENSES, []),
    budget: load<MoneyBudget>(STORAGE_KEYS.BUDGET, defaultBudget),
    futureMe: load<FutureMeNote[]>(STORAGE_KEYS.FUTURE_ME, []),
    world: load<WorldState>(STORAGE_KEYS.WORLD_STATE, defaultWorld),
    preferences: storedPreferences || defaultPreferences,
    checkIn: validTodayCheckIn,
  };
};

export const saveStoredData = (key: string, data: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Storage error for', key, err);
  }
};

export const storage = {
  saveSchedule: (items: ScheduleItem[]) => saveStoredData(STORAGE_KEYS.SCHEDULE, items),
  saveMedications: (items: Medication[]) => saveStoredData(STORAGE_KEYS.MEDICATIONS, items),
  saveMedLogs: (logs: MedicationLog[]) => saveStoredData(STORAGE_KEYS.MED_LOGS, logs),
  saveCycle: (entries: CycleEntry[]) => saveStoredData(STORAGE_KEYS.CYCLE, entries),
  saveExpenses: (items: Expense[]) => saveStoredData(STORAGE_KEYS.EXPENSES, items),
  saveBudget: (budget: MoneyBudget) => saveStoredData(STORAGE_KEYS.BUDGET, budget),
  saveFutureMe: (notes: FutureMeNote[]) => saveStoredData(STORAGE_KEYS.FUTURE_ME, notes),
  saveWorld: (state: WorldState) => saveStoredData(STORAGE_KEYS.WORLD_STATE, state),
  savePreferences: (pref: UserPreferences) => saveStoredData(STORAGE_KEYS.PREFERENCES, pref),
  saveCheckIn: (checkIn: DailyCheckIn) => saveStoredData(STORAGE_KEYS.CHECK_IN, checkIn),
};
