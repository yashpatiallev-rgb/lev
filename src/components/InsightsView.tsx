import React from 'react';
import { Compass, Sparkles, Clock, Heart, CheckCircle2, TrendingDown } from 'lucide-react';
import { translations } from '../i18n/translations';
import { ScheduleItem, MedicationLog, DailyCheckIn, Expense } from '../types';

interface InsightsViewProps {
  language: 'en' | 'id';
  scheduleItems?: ScheduleItem[];
  medLogs?: MedicationLog[];
  dailyCheckIn?: DailyCheckIn | null;
  expenses?: Expense[];
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  language,
  scheduleItems = [],
  medLogs = [],
  dailyCheckIn = null,
  expenses = [],
}) => {
  const t = translations[language].insights;

  // Calculate real factual observations based on genuine user activity
  const completedCount = scheduleItems.filter((i) => i.isCompleted).length;
  const takenMedsCount = medLogs.filter((l) => l.status === 'taken').length;
  const totalExpensesLogged = expenses.length;

  const realObservations: Array<{
    id: number;
    icon: any;
    text: string;
    tag: string;
  }> = [];

  if (completedCount > 0) {
    realObservations.push({
      id: 1,
      icon: CheckCircle2,
      text:
        language === 'id'
          ? `Kamu telah menyelesaikan ${completedCount} komitmen tanpa tekanan.`
          : `You have completed ${completedCount} commitments at your own pace.`,
      tag: language === 'id' ? 'Kemajuan Harian' : 'Daily Progress',
    });
  }

  if (dailyCheckIn && !dailyCheckIn.isSkipped) {
    const moodDesc =
      dailyCheckIn.mood_state === 'GOOD'
        ? language === 'id' ? 'kondisi baik' : 'feeling good'
        : dailyCheckIn.mood_state === 'LOW'
        ? language === 'id' ? 'energi rendah' : 'low energy'
        : dailyCheckIn.mood_state === 'HARD'
        ? language === 'id' ? 'hari yang berat' : 'a hard day'
        : language === 'id' ? 'kondisi stabil' : 'feeling okay';

    realObservations.push({
      id: 2,
      icon: Compass,
      text:
        language === 'id'
          ? `Hari ini kamu mencatat ${moodDesc}. Jadwalmu disesuaikan dengan kapasitas energimu.`
          : `You checked in today as ${moodDesc}. Lev adapts your schedule to honor your capacity.`,
      tag: language === 'id' ? 'Kapasitas Diri' : 'Self Capacity',
    });
  }

  if (takenMedsCount > 0) {
    realObservations.push({
      id: 3,
      icon: Heart,
      text:
        language === 'id'
          ? `Kamu telah mencatat ${takenMedsCount} rutinitas obat/vitamin tepat waktu.`
          : `You logged ${takenMedsCount} medication routine(s) successfully.`,
      tag: language === 'id' ? 'Kesehatan' : 'Health Consistency',
    });
  }

  if (totalExpensesLogged > 0) {
    realObservations.push({
      id: 4,
      icon: TrendingDown,
      text:
        language === 'id'
          ? `Tercatat ${totalExpensesLogged} pengeluaran sadar hari ini.`
          : `You logged ${totalExpensesLogged} mindful expense(s).`,
      tag: language === 'id' ? 'Keuangan' : 'Mindful Spending',
    });
  }

  return (
    <div className="space-y-7 pb-20">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-[#1F2421]">
          {t.title}
        </h1>
        <p className="text-xs font-medium text-[#78817B] mt-1 tracking-wide">
          {t.sub}
        </p>
      </div>

      {realObservations.length === 0 ? (
        /* Honest, clean empty state (NO FAKE PRELOADED STATS) */
        <div className="bg-white border border-[#E3DFD7] rounded-3xl p-8 text-center space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-[#EBF1ED] text-[#2D4A36] flex items-center justify-center mx-auto">
            <Compass className="w-5 h-5 stroke-[1.8]" />
          </div>
          <h3 className="font-serif text-base font-medium text-[#1F2421]">
            {language === 'id' ? 'Belum ada pengamatan' : 'No observations yet'}
          </h3>
          <p className="text-xs text-[#5E6460] max-w-md mx-auto leading-relaxed">
            {language === 'id'
              ? 'Lev tidak mengarang data palsu. Seiring kamu menggunakan jadwal dan menandai tugas, pengamatan lembut tentang ritme alamimu akan muncul di sini secara jujur.'
              : 'Lev does not fabricate fake data. As you organize your commitments and check in on your capacity, gentle observations about your natural pace will appear here over time.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {realObservations.map((obs) => {
            const Icon = obs.icon;
            return (
              <div
                key={obs.id}
                className="bg-white border border-[#E3DFD7] rounded-2xl p-5 shadow-xs flex items-start gap-4 transition-all hover:border-[#2D4A36]"
              >
                <div className="w-8 h-8 rounded-xl bg-[#EBF1ED] text-[#2D4A36] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-semibold text-[#557B62] uppercase tracking-wider block mb-1">
                    {obs.tag}
                  </span>
                  <p className="text-sm font-medium text-[#1F2421] leading-relaxed">
                    {obs.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gentle philosophy card */}
      <div className="bg-[#FAF8F5] border border-[#DDD8CE] p-5 rounded-2xl space-y-1">
        <h3 className="text-xs font-semibold text-[#1F2421]">
          {language === 'id' ? 'Pola Nyata, Bukan Penilaian' : 'Patterns, Not Judgment'}
        </h3>
        <p className="text-xs text-[#5E6460] leading-relaxed">
          {language === 'id'
            ? 'Lev mencatat kebiasaan untuk membantumu memahami ritme hidup, bukan menuntut kesempurnaan. Setiap hari adalah lembaran baru yang adaptif.'
            : 'Lev observes your daily rhythms to help you understand your natural cadence, not to demand rigid perfection. Every day adapts with you.'}
        </p>
      </div>
    </div>
  );
};
