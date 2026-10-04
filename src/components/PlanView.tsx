import React, { useState } from 'react';
import { Calendar, ChevronRight, Plus, ArrowRight, Clock, Check, Sparkles } from 'lucide-react';
import { translations } from '../i18n/translations';
import { ScheduleItem } from '../types';
import { getTodayKey, getOffsetDateKey } from '../services/storage';
import { ambientSound } from '../services/ambientAudio';

interface PlanViewProps {
  language: 'en' | 'id';
  items: ScheduleItem[];
  onToggleComplete: (id: string) => void;
  onReschedule: (id: string, newDate: string) => void;
  onOpenAddModal: () => void;
}

export const PlanView: React.FC<PlanViewProps> = ({
  language,
  items,
  onToggleComplete,
  onReschedule,
  onOpenAddModal,
}) => {
  const t = translations[language];
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);
  const [animatingItemId, setAnimatingItemId] = useState<string | null>(null);

  const handlePlanComplete = (item: ScheduleItem) => {
    if (!item.isCompleted) {
      setAnimatingItemId(item.id);
      ambientSound.playSingleChime();
      setTimeout(() => setAnimatingItemId(null), 500);
    }
    onToggleComplete(item.id);
  };

  // Generate 7 upcoming days
  const upcomingDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateKey = getOffsetDateKey(i);
    const dayName = d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      weekday: 'short',
    });
    const dayNumber = d.getDate();
    return { offset: i, dateKey, dayName, dayNumber };
  });

  const selectedDateKey = upcomingDays[selectedDayOffset].dateKey;
  const dayItems = items.filter((item) => item.date === selectedDateKey);

  // Reschedulable flexible items
  const flexibleBacklog = items.filter(
    (item) => !item.isCompleted && item.priority === 'flexible' && item.date !== selectedDateKey
  );

  return (
    <div className="space-y-6 sm:space-y-7 pb-20 max-w-xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#29272A]">
          {t.plan.title}
        </h1>
        <p className="text-xs font-medium text-[#716D70] mt-1 tracking-wide">
          {t.plan.sub}
        </p>
      </div>

      {/* 7-day Horizontal Date Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {upcomingDays.map((day) => {
          const isSelected = day.offset === selectedDayOffset;
          const isToday = day.offset === 0;
          return (
            <button
              key={day.offset}
              onClick={() => setSelectedDayOffset(day.offset)}
              className={`flex flex-col items-center justify-center min-w-[54px] py-2.5 px-2 rounded-2xl transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#B56F83] text-white shadow-xs'
                  : 'bg-white border border-[#EAE6DF] text-[#716D70] hover:border-[#B56F83] hover:text-[#29272A]'
              }`}
            >
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {day.dayName}
              </span>
              <span
                className={`text-base font-semibold mt-0.5 ${
                  isSelected ? 'text-white' : 'text-[#29272A]'
                }`}
              >
                {day.dayNumber}
              </span>
              {isToday && (
                <span
                  className={`text-[9px] mt-0.5 tracking-tight font-medium ${
                    isSelected ? 'text-white/80' : 'text-[#B56F83]'
                  }`}
                >
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Commitments for selected day */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
          <h2 className="text-xs font-semibold tracking-wider text-[#716D70] uppercase">
            {upcomingDays[selectedDayOffset].dayName},{' '}
            {new Date(selectedDateKey + 'T00:00:00').toLocaleDateString(
              language === 'id' ? 'id-ID' : 'en-US',
              { month: 'short', day: 'numeric' }
            )}
          </h2>

          <button
            onClick={onOpenAddModal}
            className="text-xs text-[#B56F83] font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'id' ? 'Tambah hari ini' : 'Add to this day'}</span>
          </button>
        </div>

        {dayItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#716D70] space-y-1">
            <p>{language === 'id' ? 'Belum ada agenda di tanggal ini.' : 'No commitments for this day yet.'}</p>
            <p className="text-[11px] text-[#A09A9F]">
              {language === 'id' ? 'Hari yang lapang memberi ruang untuk bernapas.' : 'Spacious days allow life to breathe.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAE6DF]/70">
            {dayItems.map((item) => {
              const isAnimating = animatingItemId === item.id;
              return (
                <div key={item.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handlePlanComplete(item)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                        item.isCompleted
                          ? 'bg-[#B56F83] border-[#B56F83] text-white'
                          : 'border-[#D5CFC7] bg-white hover:border-[#B56F83]'
                      } ${isAnimating ? 'scale-110' : ''}`}
                    >
                      {item.isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.2]" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[15px] sm:text-base tracking-tight ${
                            item.isCompleted ? 'line-through text-[#716D70]' : 'font-medium text-[#29272A]'
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.priority === 'essential' && (
                          <span className="text-[10px] uppercase font-semibold text-[#B56F83] bg-[#F3E9E5] px-1.5 py-0.5 rounded">
                            Essential
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[#716D70]">
                        {item.startTime ? <span>{item.startTime}</span> : <span>All day</span>}
                        {item.durationMinutes && (
                          <>
                            <span aria-hidden="true" className="text-[#D5CFC7]">·</span>
                            <span>{item.durationMinutes}m</span>
                          </>
                        )}
                        {item.category && (
                          <>
                            <span aria-hidden="true" className="text-[#D5CFC7]">·</span>
                            <span className="capitalize">{item.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reschedule to another day */}
                  <select
                    value={item.date}
                    onChange={(e) => onReschedule(item.id, e.target.value)}
                    className="text-[11px] bg-white border border-[#EAE6DF] rounded-lg px-2 py-1 text-[#716D70] hover:text-[#29272A] cursor-pointer focus:outline-none"
                    title="Reschedule to another day"
                  >
                    <option value={getTodayKey()}>Today</option>
                    <option value={getOffsetDateKey(1)}>Tomorrow</option>
                    <option value={getOffsetDateKey(2)}>In 2 days</option>
                    <option value={getOffsetDateKey(3)}>In 3 days</option>
                    <option value={getOffsetDateKey(7)}>Next week</option>
                  </select>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Flexible Backlog */}
      {flexibleBacklog.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
            <div>
              <h3 className="text-xs font-semibold text-[#29272A]">{t.plan.canReschedule}</h3>
              <p className="text-[11px] text-[#716D70]">Items that can move comfortably</p>
            </div>
            <button
              onClick={() => flexibleBacklog.forEach((i) => onReschedule(i.id, selectedDateKey))}
              className="text-xs text-[#B56F83] hover:underline font-medium cursor-pointer"
            >
              Move to selected day
            </button>
          </div>

          <div className="divide-y divide-[#EAE6DF]/70">
            {flexibleBacklog.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-[#29272A]">{item.title}</span>
                  <span className="text-[11px] text-[#716D70] ml-2">from {item.date}</span>
                </div>
                <button
                  onClick={() => onReschedule(item.id, selectedDateKey)}
                  className="px-2.5 py-1 text-[11px] font-medium text-[#B56F83] bg-[#F3E9E5] hover:bg-[#F3E9E5]/80 rounded-lg transition-colors cursor-pointer"
                >
                  Bring to {upcomingDays[selectedDayOffset].dayName}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contextual rhythm tip */}
      <div className="py-3 px-4 rounded-2xl bg-[#F3E9E5]/40 border border-[#EAE6DF] text-xs text-[#716D70] flex items-center gap-2.5">
        <Sparkles className="w-3.5 h-3.5 text-[#B56F83] shrink-0" />
        <span>
          {language === 'id'
            ? 'Tugas terpenting cenderung lebih mudah diselesaikan di paruh pertama hari.'
            : 'Focus commitments are typically completed with greater ease when placed earlier in your rhythm.'}
        </span>
      </div>
    </div>
  );
};
