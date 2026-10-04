import React, { useState } from 'react';
import { translations } from '../i18n/translations';
import { MoodState, DailyCheckIn } from '../types';
import { Feather } from 'lucide-react';

interface MoodCheckInProps {
  language: 'en' | 'id';
  currentCheckIn: DailyCheckIn | null;
  onSaveCheckIn: (checkIn: DailyCheckIn) => void;
  onTriggerMakeTodayEasier?: () => void;
  isLowEnergyModeActive?: boolean;
}

export const MoodCheckIn: React.FC<MoodCheckInProps> = ({
  language,
  currentCheckIn,
  onSaveCheckIn,
  onTriggerMakeTodayEasier,
  isLowEnergyModeActive,
}) => {
  const t = translations[language].checkIn;
  const [isEditing, setIsEditing] = useState(false);
  const [animatingSelection, setAnimatingSelection] = useState<MoodState | null>(null);

  const moodOptions: Array<{ state: MoodState; emoji: string; label: string }> = [
    { state: 'GOOD', emoji: '🙂', label: t.good },
    { state: 'OKAY', emoji: '😐', label: t.okay },
    { state: 'LOW', emoji: '😮‍💨', label: t.low },
    { state: 'HARD', emoji: '😔', label: t.hard },
  ];

  const handleSelect = (state: MoodState) => {
    setAnimatingSelection(state);
    setTimeout(() => {
      const todayStr = new Date().toISOString().split('T')[0];
      const checkIn: DailyCheckIn = {
        date: todayStr,
        mood_state: state,
        timestamp: new Date().toISOString(),
        isSkipped: false,
      };
      onSaveCheckIn(checkIn);
      setAnimatingSelection(null);
      setIsEditing(false);
    }, 280);
  };

  const handleSkip = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const checkIn: DailyCheckIn = {
      date: todayStr,
      mood_state: 'OKAY',
      timestamp: new Date().toISOString(),
      isSkipped: true,
    };
    onSaveCheckIn(checkIn);
    setIsEditing(false);
  };

  // If already checked in (and not skipped) and not currently editing:
  if (currentCheckIn && !currentCheckIn.isSkipped && !isEditing) {
    const selected = moodOptions.find((m) => m.state === currentCheckIn.mood_state) || moodOptions[1];
    const isLow = currentCheckIn.mood_state === 'LOW';
    const isHard = currentCheckIn.mood_state === 'HARD';

    const statusText =
      currentCheckIn.mood_state === 'GOOD'
        ? t.statusGood
        : currentCheckIn.mood_state === 'OKAY'
        ? t.statusOkay
        : currentCheckIn.mood_state === 'LOW'
        ? t.statusLow
        : t.statusHard;

    return (
      <div className="py-2 transition-all duration-300">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-sm select-none" aria-hidden="true">{selected.emoji}</span>
            <span className="font-medium text-[#29272A]">{statusText}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-[11px] text-[#716D70] hover:text-[#29272A] transition-colors cursor-pointer ml-1"
            >
              · {t.change}
            </button>
          </div>

          {/* Gentle capacity prompt if hard day */}
          {isHard && !isLowEnergyModeActive && onTriggerMakeTodayEasier && (
            <button
              onClick={onTriggerMakeTodayEasier}
              className="flex items-center gap-1.5 text-[11px] text-[#B56F83] hover:text-[#A25C70] font-medium bg-[#F3E9E5] px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
            >
              <Feather className="w-3 h-3 text-[#B56F83]" />
              <span>{language === 'id' ? 'Buat hari ini lebih ringan' : 'Make today easier'}</span>
            </button>
          )}
        </div>

        {/* Minimal human response: no therapy, no quotes */}
        {isLow && (
          <p className="text-[11px] text-[#716D70] mt-1 font-medium">
            {language === 'id' ? 'Dimengerti. Jadwal hari ini akan dibuat lebih santai.' : 'Got it. I’ll keep today lighter.'}
          </p>
        )}
        {isHard && (
          <p className="text-[11px] text-[#716D70] mt-1 font-medium">
            {language === 'id' ? 'Kebutuhan dasarmu tetap terjaga. Istirahatlah sejenak.' : 'Your essentials are covered. Take things gently.'}
          </p>
        )}
      </div>
    );
  }

  // If skipped and not editing
  if (currentCheckIn?.isSkipped && !isEditing) {
    return (
      <div className="py-1 flex items-center justify-between text-[11px] text-[#716D70]">
        <span>{language === 'id' ? 'Kapasitas fleksibel' : 'Flexible pace'}</span>
        <button
          onClick={() => setIsEditing(true)}
          className="text-[#B56F83] hover:underline cursor-pointer font-medium"
        >
          {t.question}
        </button>
      </div>
    );
  }

  // Active check-in state: clean, minimal, non-dominant row
  return (
    <div className="py-2.5 transition-all duration-200">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-medium text-[#716D70]">
          {t.question}
        </span>
        <button
          type="button"
          onClick={handleSkip}
          className="text-[11px] text-[#716D70] hover:text-[#29272A] transition-colors cursor-pointer"
        >
          {t.skip}
        </button>
      </div>

      {/* 4 Small Elegant Option Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {moodOptions.map((opt) => {
          const isSelected = animatingSelection === opt.state;
          const isReceding = animatingSelection !== null && !isSelected;

          return (
            <button
              key={opt.state}
              type="button"
              onClick={() => handleSelect(opt.state)}
              className={`py-2 px-1 rounded-xl border text-xs flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-[#F3E9E5] border-[#B56F83] text-[#29272A] scale-102 font-medium shadow-xs'
                  : isReceding
                  ? 'opacity-40 scale-98 bg-white border-[#EAE6DF]'
                  : 'bg-white border-[#EAE6DF] text-[#29272A] hover:border-[#B56F83] hover:bg-[#F3E9E5]/40'
              }`}
            >
              <span className="text-base select-none" aria-hidden="true">{opt.emoji}</span>
              <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
