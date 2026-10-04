export type ScheduleItemType = 'event' | 'task' | 'reminder' | 'routine' | 'medication';

export type Priority = 'essential' | 'normal' | 'flexible';

export type RecurrenceType = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

export interface ScheduleItem {
  id: string;
  title: string;
  type: ScheduleItemType;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  durationMinutes?: number;
  isApproximate?: boolean;
  priority: Priority;
  isCompleted: boolean;
  completedAt?: string;
  isSnoozed?: boolean;
  snoozedUntil?: string;
  category?: 'health' | 'work' | 'personal' | 'study' | 'routine' | 'social' | 'wellness' | 'home';
  notes?: string;
  recurrence?: RecurrenceType;
  medicationInfo?: {
    dosage?: string;
    foodRelation?: 'before_food' | 'after_food' | 'with_food' | 'bedtime' | 'any';
  };
  triageBucket?: 'essential' | 'ifPossible' | 'later';
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  timeOfDay: string; // HH:mm
  frequency: 'daily' | 'twice_daily' | 'weekly' | 'as_needed';
  foodRelation: 'before_food' | 'after_food' | 'with_food' | 'bedtime' | 'any';
  refillDate?: string; // YYYY-MM-DD
  pillCount?: number;
  notes?: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  date: string; // YYYY-MM-DD
  status: 'taken' | 'snoozed' | 'missed' | 'pending';
  loggedAt?: string;
}

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export interface CycleEntry {
  date: string; // YYYY-MM-DD
  cycleDay: number;
  phase: CyclePhase;
  isPeriodDay: boolean;
  flow?: 'light' | 'medium' | 'heavy' | 'spotting';
  symptoms: string[];
  mood?: 'calm' | 'sensitive' | 'energized' | 'tired' | 'anxious' | 'grounded';
  energyLevel: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: 'food' | 'health' | 'commute' | 'utilities' | 'personal' | 'study' | 'leisure' | 'other';
  date: string; // YYYY-MM-DD
  time?: string;
  notes?: string;
}

export interface MoneyBudget {
  totalAvailable: number;
  safeToSpend: number;
  monthlyUpcoming: number;
  weeklyBudget: number;
  currency: string;
}

export interface FutureMeNote {
  id: string;
  content: string;
  createdAt: string; // ISO string
  deliverOn: string; // YYYY-MM-DD
  isRead: boolean;
  tag?: string;
}

export type MoodState = 'GOOD' | 'OKAY' | 'LOW' | 'HARD';

export interface DailyCheckIn {
  date: string; // YYYY-MM-DD
  mood_state: MoodState;
  timestamp: string; // ISO string
  optional_user_note?: string;
  isSkipped?: boolean;
}

export interface DailyReflection {
  date: string; // YYYY-MM-DD
  mood: 'good' | 'okay' | 'hard';
  tomorrowFocus?: string;
  noteToFutureMe?: string;
  timestamp: string;
}

export interface WorldElement {
  id: string;
  name: string;
  nameId: string; // Indonesian name
  category: 'tree' | 'fern' | 'flower' | 'water' | 'structure' | 'creature' | 'stone' | 'garden';
  discoveredAt: string;
  story: string;
  storyId: string;
  iconName: string;
  coordinates: { x: number; y: number }; // percentage 0-100 for ecosystem placement
}

export interface WorldState {
  discoveredIds: string[];
  growthScore: number;
  lastVisitedDate: string;
  activeAmbience: 'auto' | 'morning' | 'afternoon' | 'dusk' | 'night';
}

export interface UserPreferences {
  name: string;
  language: 'en' | 'id';
  lowEnergyModeActive: boolean;
  currency: string;
  showCycleModule: boolean;
  hasSeenWelcomeBackModal?: boolean;
  preferredWakeTime?: string;
  preferredSleepTime?: string;
}

export interface AIParseResult {
  scheduleItems: Array<{
    title: string;
    type: ScheduleItemType;
    date: string; // 'today' | 'tomorrow' | 'YYYY-MM-DD'
    startTime?: string;
    durationMinutes?: number;
    isApproximate?: boolean;
    priority: Priority;
    category?: string;
    notes?: string;
    recurrence?: RecurrenceType;
    medicationInfo?: {
      dosage?: string;
      foodRelation?: 'before_food' | 'after_food' | 'with_food' | 'bedtime' | 'any';
    };
  }>;
  expenses: Array<{
    title: string;
    amount: number;
    currency: string;
    category: 'food' | 'health' | 'commute' | 'utilities' | 'personal' | 'study' | 'leisure' | 'other';
  }>;
  medications: Array<{
    name: string;
    dosage?: string;
    timeOfDay?: string;
    foodRelation?: 'before_food' | 'after_food' | 'with_food' | 'bedtime' | 'any';
  }>;
  confidence: 'high' | 'medium' | 'low';
  clarificationMessage?: string;
  summaryText: string;
}
