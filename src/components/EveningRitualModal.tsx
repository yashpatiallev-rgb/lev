import React, { useState } from 'react';
import { X, Sparkles, Check, Smile, Meh, Frown } from 'lucide-react';
import { translations } from '../i18n/translations';
import { ScheduleItem } from '../types';
import { getOffsetDateKey } from '../services/storage';

interface EveningRitualModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'id';
  onAddScheduleItems: (items: ScheduleItem[]) => void;
}

export const EveningRitualModal: React.FC<EveningRitualModalProps> = ({
  isOpen,
  onClose,
  language,
  onAddScheduleItems,
}) => {
  const t = translations[language].ritual;
  const [mood, setMood] = useState<'good' | 'okay' | 'hard' | null>(null);
  const [tomorrowFocus, setTomorrowFocus] = useState('');
  const [futureNote, setFutureNote] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();

    // If a priority for tomorrow was entered, create it as tomorrow's essential item!
    if (tomorrowFocus.trim()) {
      const tomorrowKey = getOffsetDateKey(1);
      const item: ScheduleItem = {
        id: `focus_${Date.now()}`,
        title: tomorrowFocus.trim(),
        type: 'task',
        date: tomorrowKey,
        priority: 'essential',
        isCompleted: false,
        category: 'personal',
        triageBucket: 'essential',
      };
      onAddScheduleItems([item]);
    }

    setIsCompleted(true);
    setTimeout(() => {
      setIsCompleted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2421]/30 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] border border-[#DDD8CE] rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE6DF]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#37523F]" />
            <h2 className="text-sm font-semibold text-[#1F2421]">{t.eveningTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#78817B] hover:text-[#1F2421] transition-colors rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {isCompleted ? (
            <div className="py-8 text-center space-y-3 animate-in fade-in">
              <div className="w-10 h-10 rounded-full bg-[#EBF1ED] text-[#2D4A36] flex items-center justify-center mx-auto">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-serif font-medium text-[#1F2421]">
                {t.closeRitual}
              </h3>
              <p className="text-xs text-[#5E6460]">
                {language === 'id'
                  ? 'Hari ini telah selesai. Istirahatlah dengan tenang.'
                  : 'Today is complete. Rest easily and deeply.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleFinish} className="space-y-5">
              {/* Question 1: How was today? */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-2.5">
                  {t.howWasToday}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMood('good')}
                    className={`py-2 px-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      mood === 'good'
                        ? 'bg-[#2D4A36] text-white border-[#2D4A36]'
                        : 'bg-white border-[#DDD8CE] text-[#5E6460] hover:border-[#2D4A36]'
                    }`}
                  >
                    <span className="text-base">🙂</span>
                    <span className="text-[11px] font-medium">{t.goodMood}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMood('okay')}
                    className={`py-2 px-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      mood === 'okay'
                        ? 'bg-[#2D4A36] text-white border-[#2D4A36]'
                        : 'bg-white border-[#DDD8CE] text-[#5E6460] hover:border-[#2D4A36]'
                    }`}
                  >
                    <span className="text-base">😐</span>
                    <span className="text-[11px] font-medium">{t.okayMood}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMood('hard')}
                    className={`py-2 px-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      mood === 'hard'
                        ? 'bg-[#2D4A36] text-white border-[#2D4A36]'
                        : 'bg-white border-[#DDD8CE] text-[#5E6460] hover:border-[#2D4A36]'
                    }`}
                  >
                    <span className="text-base">😮‍💨</span>
                    <span className="text-[11px] font-medium">{t.hardMood}</span>
                  </button>
                </div>
              </div>

              {/* Question 2: One thing for tomorrow? */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                  {t.oneThingTomorrow}
                </label>
                <input
                  type="text"
                  value={tomorrowFocus}
                  onChange={(e) => setTomorrowFocus(e.target.value)}
                  placeholder={t.tomorrowPlaceholder}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#DDD8CE] rounded-xl text-[#1F2421] placeholder-[#9CA39E] focus:outline-none focus:border-[#2D4A36]"
                />
              </div>

              {/* Question 3: Anything for future you? */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                  {t.noteForFuture}
                </label>
                <input
                  type="text"
                  value={futureNote}
                  onChange={(e) => setFutureNote(e.target.value)}
                  placeholder={t.futurePlaceholder}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#DDD8CE] rounded-xl text-[#1F2421] placeholder-[#9CA39E] focus:outline-none focus:border-[#2D4A36]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-medium text-white bg-[#2D4A36] hover:bg-[#233A2A] rounded-xl transition-colors cursor-pointer"
                >
                  {t.closeRitual}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
