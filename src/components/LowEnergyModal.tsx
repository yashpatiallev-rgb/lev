import React, { useState } from 'react';
import { X, Feather, Check, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { translations } from '../i18n/translations';
import { ScheduleItem } from '../types';

interface LowEnergyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'id';
  items: ScheduleItem[];
  onApplyTriage: (updatedItems: ScheduleItem[]) => void;
  onRescheduleLaterToTomorrow: () => void;
}

export const LowEnergyModal: React.FC<LowEnergyModalProps> = ({
  isOpen,
  onClose,
  language,
  items,
  onApplyTriage,
  onRescheduleLaterToTomorrow,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  // Split items into 3 calm buckets
  const essentialItems = items.filter(
    (item) =>
      item.triageBucket === 'essential' ||
      item.priority === 'essential' ||
      item.type === 'medication' ||
      /doctor|dokter|class|appointment/i.test(item.title)
  );

  const ifPossibleItems = items.filter(
    (item) =>
      item.triageBucket === 'ifPossible' ||
      (item.priority === 'normal' && !essentialItems.includes(item))
  );

  const laterItems = items.filter(
    (item) =>
      item.triageBucket === 'later' ||
      (item.priority === 'flexible' && !essentialItems.includes(item) && !ifPossibleItems.includes(item))
  );

  const handleConfirmAndActivate = () => {
    // Tag each item with its clean triage bucket
    const updated = items.map((item) => {
      if (essentialItems.some((e) => e.id === item.id)) return { ...item, triageBucket: 'essential' as const };
      if (ifPossibleItems.some((e) => e.id === item.id)) return { ...item, triageBucket: 'ifPossible' as const };
      return { ...item, triageBucket: 'later' as const };
    });
    onApplyTriage(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2421]/30 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] border border-[#DDD8CE] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE6DF]">
          <div className="flex items-center gap-2">
            <Feather className="w-4 h-4 text-[#37523F]" />
            <h2 className="text-sm font-semibold text-[#1F2421]">
              {t.today.makeTodayEasier}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#78817B] hover:text-[#1F2421] transition-colors rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Supportive affirmation message */}
          <div className="bg-[#EBF1ED] border border-[#C6DAC9] p-4 rounded-xl text-xs text-[#284433] leading-relaxed">
            <p className="font-medium mb-1">
              {language === 'id'
                ? 'Hari yang padat tidak harus melelahkan.'
                : 'A full day doesn’t have to feel like a mountain.'}
            </p>
            <p className="text-[#3F5B47]">
              {language === 'id'
                ? `${laterItems.length} hal fleksibel dapat digeser ke esok hari tanpa rasa bersalah. Kami menjaga komitmen penting dan kesehatan dasar Anda tetap aman.`
                : `${laterItems.length} flexible things can be safely rescheduled with zero guilt. We protect your doctor appointments, medication, and baseline peace.`}
            </p>
          </div>

          {/* 3 Calm Buckets */}
          <div className="space-y-4">
            {/* 1. Essential */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#1F2421] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#37523F]" />
                  {t.today.essentialSection}
                </span>
                <span className="text-[11px] text-[#78817B] font-normal">
                  {t.today.essentialSub}
                </span>
              </div>
              <div className="bg-white border border-[#E3DFD7] rounded-xl p-3 space-y-2 text-xs">
                {essentialItems.length === 0 ? (
                  <p className="text-[#78817B] italic">No hard commitments today.</p>
                ) : (
                  essentialItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-[#1F2421]">
                      <span className="font-medium truncate">{item.title}</span>
                      <span className="text-[11px] text-[#78817B] shrink-0 font-mono">
                        {item.startTime || 'Scheduled'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2. If possible */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#1F2421] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#678A73]" />
                  {t.today.ifPossibleSection}
                </span>
                <span className="text-[11px] text-[#78817B] font-normal">
                  {t.today.ifPossibleSub}
                </span>
              </div>
              <div className="bg-white border border-[#E3DFD7] rounded-xl p-3 space-y-2 text-xs">
                {ifPossibleItems.length === 0 ? (
                  <p className="text-[#78817B] italic">None. Your day is already light.</p>
                ) : (
                  ifPossibleItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-[#3E4540]">
                      <span className="truncate">{item.title}</span>
                      <span className="text-[11px] text-[#78817B] shrink-0 font-mono">
                        {item.startTime || 'Flexible'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. Later */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#1F2421] mb-1.5">
                <span>{t.today.laterSection}</span>
                <span className="text-[11px] text-[#78817B] font-normal">
                  {t.today.laterSub}
                </span>
              </div>
              <div className="bg-[#F7F5EE] border border-[#DDD8CE] rounded-xl p-3 space-y-2 text-xs text-[#5E6460]">
                {laterItems.length === 0 ? (
                  <p className="text-[#78817B] italic">No postponed items.</p>
                ) : (
                  laterItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span className="truncate">{item.title}</span>
                      <span className="text-[11px] text-[#78817B] font-normal">
                        Can move to tomorrow
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {laterItems.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onRescheduleLaterToTomorrow();
                  onClose();
                }}
                className="w-full sm:w-auto text-xs text-[#37523F] hover:text-[#233A2A] font-medium py-1.5 cursor-pointer underline underline-offset-4 decoration-[#B5C5BA]"
              >
                {t.today.rescheduleAllLater}
              </button>
            )}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs text-[#5E6460] hover:text-[#1F2421] rounded-xl cursor-pointer"
              >
                {t.addModal.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmAndActivate}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#2D4A36] hover:bg-[#233A2A] rounded-xl transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'Aktifkan Rencana Ringan' : 'Apply Light Schedule'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
