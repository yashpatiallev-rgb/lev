import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight } from 'lucide-react';
import { translations } from '../i18n/translations';
import { aiService } from '../services/aiService';
import { ScheduleItem, Expense, Medication, AIParseResult } from '../types';
import { getTodayKey } from '../services/storage';

interface UniversalAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'id';
  onAddScheduleItems: (items: ScheduleItem[]) => void;
  onAddExpenses: (expenses: Expense[]) => void;
  onAddMedication: (med: Medication) => void;
}

export const UniversalAddModal: React.FC<UniversalAddModalProps> = ({
  isOpen,
  onClose,
  language,
  onAddScheduleItems,
  onAddExpenses,
  onAddMedication,
}) => {
  const t = translations[language].addModal;

  const [activeTab, setActiveTab] = useState<'natural' | 'manual'>('natural');
  const [naturalText, setNaturalText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<AIParseResult | null>(null);

  // Manual form state
  const [manualType, setManualType] = useState<'task' | 'event' | 'reminder' | 'medication' | 'expense'>('task');
  const [manualTitle, setManualTitle] = useState('');
  const [manualDate, setManualDate] = useState(getTodayKey());
  const [manualTime, setManualTime] = useState('');
  const [manualDuration, setManualDuration] = useState('30');
  const [manualPriority, setManualPriority] = useState<'essential' | 'normal' | 'flexible'>('normal');
  const [manualCategory, setManualCategory] = useState('personal');
  const [manualAmount, setManualAmount] = useState('');
  const [manualCurrency, setManualCurrency] = useState<'Rp' | '$' | '₹'>('Rp');

  if (!isOpen) return null;

  const handleParseNatural = async () => {
    if (!naturalText.trim()) return;
    setIsParsing(true);
    try {
      const result = await aiService.parseNaturalLanguage(naturalText, language, getTodayKey());
      setParseResult(result);
    } catch (err) {
      console.error('Parse failed', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!parseResult) return;

    // Convert parsed schedule items
    if (parseResult.scheduleItems && parseResult.scheduleItems.length > 0) {
      const newItems: ScheduleItem[] = parseResult.scheduleItems.map((item, idx) => ({
        id: `item_${Date.now()}_${idx}`,
        title: item.title,
        type: item.type || 'task',
        date: item.date === 'tomorrow' ? getTodayKey() : (item.date || getTodayKey()),
        startTime: item.startTime,
        durationMinutes: item.durationMinutes || 30,
        isApproximate: item.isApproximate || false,
        priority: item.priority || 'normal',
        isCompleted: false,
        category: (item.category as any) || 'personal',
        medicationInfo: item.medicationInfo,
        triageBucket: item.priority === 'essential' ? 'essential' : 'ifPossible',
      }));
      onAddScheduleItems(newItems);
    }

    // Convert parsed expenses
    if (parseResult.expenses && parseResult.expenses.length > 0) {
      const newExpenses: Expense[] = parseResult.expenses.map((exp, idx) => ({
        id: `exp_${Date.now()}_${idx}`,
        title: exp.title,
        amount: exp.amount,
        currency: exp.currency || (language === 'id' ? 'Rp' : 'Rp'),
        category: exp.category || 'food',
        date: getTodayKey(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      }));
      onAddExpenses(newExpenses);
    }

    // Convert parsed medications
    if (parseResult.medications && parseResult.medications.length > 0) {
      parseResult.medications.forEach((med, idx) => {
        onAddMedication({
          id: `med_${Date.now()}_${idx}`,
          name: med.name,
          dosage: med.dosage || '1 dose',
          timeOfDay: med.timeOfDay || '20:30',
          frequency: 'daily',
          foodRelation: (med.foodRelation as any) || 'after_food',
        });
      });
    }

    // Reset and close
    setNaturalText('');
    setParseResult(null);
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    if (manualType === 'expense') {
      const exp: Expense = {
        id: `exp_${Date.now()}`,
        title: manualTitle,
        amount: parseFloat(manualAmount) || 0,
        currency: manualCurrency,
        category: (manualCategory as any) || 'other',
        date: manualDate || getTodayKey(),
      };
      onAddExpenses([exp]);
    } else if (manualType === 'medication') {
      const med: Medication = {
        id: `med_${Date.now()}`,
        name: manualTitle,
        dosage: '1 dose',
        timeOfDay: manualTime || '20:00',
        frequency: 'daily',
        foodRelation: 'after_food',
      };
      onAddMedication(med);
    } else {
      const item: ScheduleItem = {
        id: `item_${Date.now()}`,
        title: manualTitle,
        type: manualType,
        date: manualDate || getTodayKey(),
        startTime: manualTime || undefined,
        durationMinutes: parseInt(manualDuration, 10) || 30,
        priority: manualPriority,
        isCompleted: false,
        category: (manualCategory as any) || 'personal',
        triageBucket: manualPriority === 'essential' ? 'essential' : 'ifPossible',
      };
      onAddScheduleItems([item]);
    }

    // Reset and close
    setManualTitle('');
    setManualAmount('');
    onClose();
  };

  const samplePrompts = [
    language === 'id'
      ? 'Besok ada kelas jam 10, terus dokter jam 3, gym jam 6'
      : 'Class at 10, doctor at 3, gym around 6, and take medicine after dinner',
    language === 'id'
      ? 'Tadi habis 35 ribu buat makan siang'
      : 'I spent 250 on lunch',
    language === 'id'
      ? 'Minum Vitamin D setiap jam 9 pagi'
      : 'Take Vitamin D every morning at 9',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2421]/30 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] border border-[#DDD8CE] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE6DF]">
          <h2 className="text-base font-semibold text-[#1F2421]">{t.title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-[#78817B] hover:text-[#1F2421] transition-colors rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex px-6 pt-3 pb-1 border-b border-[#EAE6DF] gap-4 text-xs font-medium">
          <button
            onClick={() => {
              setActiveTab('natural');
              setParseResult(null);
            }}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'natural'
                ? 'border-[#2D4A36] text-[#2D4A36] font-semibold'
                : 'border-transparent text-[#78817B] hover:text-[#1F2421]'
            }`}
          >
            {t.naturalTab}
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'manual'
                ? 'border-[#2D4A36] text-[#2D4A36] font-semibold'
                : 'border-transparent text-[#78817B] hover:text-[#1F2421]'
            }`}
          >
            {t.structuredTab}
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'natural' ? (
            <div className="space-y-4">
              {!parseResult ? (
                <>
                  <div>
                    <label className="block text-xs text-[#5E6460] mb-2 font-medium">
                      {t.tellNaturally}
                    </label>
                    <textarea
                      value={naturalText}
                      onChange={(e) => setNaturalText(e.target.value)}
                      placeholder={t.naturalPlaceholder}
                      rows={4}
                      className="w-full p-3 text-sm bg-white border border-[#DDD8CE] rounded-xl text-[#1F2421] placeholder-[#9CA39E] focus:outline-none focus:border-[#2D4A36] transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  {/* Sample prompt chips */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-[#78817B]">Tap to try an example:</span>
                    <div className="flex flex-col gap-1.5">
                      {samplePrompts.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNaturalText(sample)}
                          className="text-left text-xs text-[#44624D] hover:text-[#2D4A36] transition-colors py-1 cursor-pointer truncate"
                        >
                          → {sample}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      disabled={isParsing || !naturalText.trim()}
                      onClick={handleParseNatural}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#2D4A36] hover:bg-[#233A2A] disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isParsing ? t.parsing : t.parseButton}</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Confirmation review stage */
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-[#F3F1EC] p-4 rounded-xl border border-[#DDD8CE]">
                    <div className="text-xs font-semibold text-[#2D4A36] mb-1">
                      {t.confirmTitle}
                    </div>
                    <p className="text-xs text-[#5E6460] mb-3">{parseResult.summaryText}</p>

                    <div className="space-y-2">
                      {parseResult.scheduleItems?.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between py-1.5 border-b border-[#E3DFD7] last:border-b-0 text-xs"
                        >
                          <div className="font-medium text-[#1F2421]">
                            {it.title}
                            <div className="text-[11px] text-[#78817B]">
                              {it.type} · {it.date || 'Today'} {it.startTime ? `· ${it.startTime}` : ''}
                            </div>
                          </div>
                          <span className="text-[11px] text-[#557B62] font-medium capitalize">
                            {it.priority}
                          </span>
                        </div>
                      ))}

                      {parseResult.expenses?.map((exp, idx) => (
                        <div
                          key={`exp_${idx}`}
                          className="flex items-center justify-between py-1 text-xs text-[#1F2421]"
                        >
                          <span>{exp.title}</span>
                          <span className="font-mono font-medium text-[#37523F]">
                            {exp.currency} {exp.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setParseResult(null)}
                      className="px-3 py-1.5 text-xs text-[#5E6460] hover:text-[#1F2421] transition-colors cursor-pointer"
                    >
                      {t.editParsed}
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAdd}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#2D4A36] hover:bg-[#233A2A] rounded-xl transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.addToSchedule}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Manual Form */
            <form onSubmit={handleManualSubmit} className="space-y-3.5">
              {/* Type selector */}
              <div className="grid grid-cols-5 gap-1 p-1 bg-[#EAE6DF] rounded-xl text-xs font-medium text-[#5E6460]">
                {(['task', 'event', 'reminder', 'medication', 'expense'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setManualType(type)}
                    className={`py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                      manualType === type
                        ? 'bg-white text-[#1F2421] shadow-xs font-semibold'
                        : 'hover:text-[#1F2421]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs text-[#5E6460] mb-1 font-medium">{t.titleLabel}</label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g. Health checkup, or Gym"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#DDD8CE] rounded-lg text-[#1F2421] focus:outline-none focus:border-[#2D4A36]"
                />
              </div>

              {manualType === 'expense' ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs text-[#5E6460] font-medium">Amount</label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setManualCurrency('Rp')}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                          manualCurrency === 'Rp' ? 'bg-[#2D4A36] text-white' : 'bg-[#FAF8F5] text-[#5E6460]'
                        }`}
                      >
                        Rp (IDR)
                      </button>
                      <button
                        type="button"
                        onClick={() => setManualCurrency('$')}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                          manualCurrency === '$' ? 'bg-[#2D4A36] text-white' : 'bg-[#FAF8F5] text-[#5E6460]'
                        }`}
                      >
                        $ (USD)
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    step="any"
                    required
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    placeholder={manualCurrency === 'Rp' ? '35000' : '15'}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DDD8CE] rounded-lg text-[#1F2421] focus:outline-none focus:border-[#2D4A36]"
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#5E6460] mb-1 font-medium">{t.dateLabel}</label>
                      <input
                        type="date"
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#DDD8CE] rounded-lg text-[#1F2421] focus:outline-none focus:border-[#2D4A36]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#5E6460] mb-1 font-medium">{t.timeLabel}</label>
                      <input
                        type="time"
                        value={manualTime}
                        onChange={(e) => setManualTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#DDD8CE] rounded-lg text-[#1F2421] focus:outline-none focus:border-[#2D4A36]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#5E6460] mb-1 font-medium">{t.priorityLabel}</label>
                      <select
                        value={manualPriority}
                        onChange={(e) => setManualPriority(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#DDD8CE] rounded-lg text-[#1F2421] focus:outline-none focus:border-[#2D4A36]"
                      >
                        <option value="essential">{t.essentialOption}</option>
                        <option value="normal">{t.normalOption}</option>
                        <option value="flexible">{t.flexibleOption}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#5E6460] mb-1 font-medium">{t.durationLabel}</label>
                      <input
                        type="number"
                        value={manualDuration}
                        onChange={(e) => setManualDuration(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#DDD8CE] rounded-lg text-[#1F2421] focus:outline-none focus:border-[#2D4A36]"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs text-[#5E6460] hover:text-[#1F2421] rounded-lg cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-[#2D4A36] hover:bg-[#233A2A] rounded-xl transition-colors cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
