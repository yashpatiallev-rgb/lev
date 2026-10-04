import React, { useState } from 'react';
import { Pill, Moon, Heart, Plus, Check, Clock, Sparkles, Bed, Activity, Smile, AlertCircle } from 'lucide-react';
import { translations } from '../i18n/translations';
import { Medication, MedicationLog, CycleEntry } from '../types';
import { getTodayKey, getOffsetDateKey } from '../services/storage';

interface HealthViewProps {
  language: 'en' | 'id';
  medications: Medication[];
  medLogs: MedicationLog[];
  cycleEntries: CycleEntry[];
  onLogMedication: (medId: string, status: 'taken' | 'missed' | 'snoozed') => void;
  onAddMedication: (med: Medication) => void;
  onLogCycleSymptom: (symptom: string) => void;
  onSaveCycleEntry?: (entry: CycleEntry) => void;
}

export const HealthView: React.FC<HealthViewProps> = ({
  language,
  medications,
  medLogs,
  cycleEntries,
  onLogMedication,
  onAddMedication,
  onLogCycleSymptom,
  onSaveCycleEntry,
}) => {
  const t = translations[language].health;
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'medication' | 'cycle'>('overview');
  const [showAddMedForm, setShowAddMedForm] = useState(false);

  // Health log local state for sleep & stress (stored or editable)
  const [sleepHours, setSleepHours] = useState<string>('7.5');
  const [stressLevel, setStressLevel] = useState<'low' | 'moderate' | 'high'>('low');

  // New med form state
  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('');
  const [newMedTime, setNewMedTime] = useState('08:00');
  const [newMedFood, setNewMedFood] = useState<'after_food' | 'before_food' | 'with_food' | 'any'>('after_food');
  const [newMedRefillDays, setNewMedRefillDays] = useState('30');

  // Cycle setup form state if no cycle entry exists
  const [setupCycleDay, setSetupCycleDay] = useState('14');
  const [setupPhase, setSetupPhase] = useState<'menstrual' | 'follicular' | 'ovulatory' | 'luteal'>('follicular');
  const [isSettingUpCycle, setIsSettingUpCycle] = useState(false);

  const todayKey = getTodayKey();
  const latestCycle = cycleEntries.length > 0 ? cycleEntries[0] : null;

  const handleCreateMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const med: Medication = {
      id: `med_${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDose.trim() || '1 dose',
      timeOfDay: newMedTime,
      frequency: 'daily',
      foodRelation: newMedFood,
      refillDate: getOffsetDateKey(parseInt(newMedRefillDays, 10) || 30),
      pillCount: parseInt(newMedRefillDays, 10) || 30,
    };

    onAddMedication(med);
    setNewMedName('');
    setNewMedDose('');
    setShowAddMedForm(false);
  };

  const handleInitialCycleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: CycleEntry = {
      date: todayKey,
      cycleDay: parseInt(setupCycleDay, 10) || 1,
      phase: setupPhase,
      isPeriodDay: setupPhase === 'menstrual',
      symptoms: [],
      energyLevel: 3,
    };
    if (onSaveCycleEntry) {
      onSaveCycleEntry(entry);
    }
    setIsSettingUpCycle(false);
  };

  const getMedStatusForToday = (medId: string) => {
    const log = medLogs.find((l) => l.medicationId === medId && l.date === todayKey);
    return log ? log.status : 'pending';
  };

  const takenMedsCount = medications.filter((m) => getMedStatusForToday(m.id) === 'taken').length;

  const availableSymptoms = [
    { id: 'cramps', label: t.cramps },
    { id: 'fatigue', label: t.fatigue },
    { id: 'headache', label: t.headache },
    { id: 'high_focus', label: t.highEnergy },
    { id: 'calm', label: t.calmMood },
    { id: 'bloating', label: t.bloating },
  ];

  return (
    <div className="space-y-6 sm:space-y-7 pb-20 max-w-xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#29272A]">
          {t.title}
        </h1>
        <p className="text-xs font-medium text-[#716D70] mt-1 tracking-wide">
          {language === 'id' ? 'Keseimbangan tubuh, rutinitas obat, dan kesadaran ritme biologis.' : 'Body balance, medication routines, and biological rhythm awareness.'}
        </p>
      </div>

      {/* Clean Sub-navigation with Muted Berry active indicator */}
      <div className="flex border-b border-[#EAE6DF] gap-6 text-[13px] sm:text-sm font-medium">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
            activeSubTab === 'overview'
              ? 'border-[#B56F83] text-[#B56F83] font-semibold'
              : 'border-transparent text-[#716D70] hover:text-[#29272A]'
          }`}
        >
          {language === 'id' ? 'Ringkasan Hari Ini' : 'Today’s Rhythm'}
        </button>
        <button
          onClick={() => setActiveSubTab('medication')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
            activeSubTab === 'medication'
              ? 'border-[#B56F83] text-[#B56F83] font-semibold'
              : 'border-transparent text-[#716D70] hover:text-[#29272A]'
          }`}
        >
          {t.medicationTab} {medications.length > 0 && `(${takenMedsCount}/${medications.length})`}
        </button>
        <button
          onClick={() => setActiveSubTab('cycle')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${
            activeSubTab === 'cycle'
              ? 'border-[#B56F83] text-[#B56F83] font-semibold'
              : 'border-transparent text-[#716D70] hover:text-[#29272A]'
          }`}
        >
          {t.cycleTab}
        </button>
      </div>

      {/* 1. OVERVIEW TAB: Comprehensive lifestyle health snapshot */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Functional Rhythm Grid (Clean, unboxed dividers) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Sleep */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#EAE6DF] space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#716D70]">
                <Bed className="w-3.5 h-3.5 text-[#9B91B5]" />
                <span className="font-medium">Sleep</span>
              </div>
              <div className="flex items-baseline gap-1 pt-0.5">
                <span className="text-xl font-semibold text-[#29272A]">{sleepHours}</span>
                <span className="text-xs text-[#716D70]">hours</span>
              </div>
              <p className="text-[10px] text-[#716D70]">Restful wakefulness</p>
            </div>

            {/* Stress State */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#EAE6DF] space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#716D70]">
                <Activity className="w-3.5 h-3.5 text-[#8FA58F]" />
                <span className="font-medium">Nervous System</span>
              </div>
              <div className="flex items-baseline gap-1 pt-0.5">
                <span className="text-xl font-semibold capitalize text-[#29272A]">{stressLevel}</span>
                <span className="text-xs text-[#8FA58F]">calm</span>
              </div>
              <p className="text-[10px] text-[#716D70]">Steady pacing today</p>
            </div>
          </div>

          {/* Medication Status Line */}
          <div className="flex items-center justify-between py-3 border-b border-[#EAE6DF] text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#F3E9E5] text-[#B56F83] flex items-center justify-center shrink-0">
                <Pill className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div>
                <span className="font-medium text-[#29272A] block">Medication & Supplements</span>
                <span className="text-[11px] text-[#716D70]">
                  {medications.length === 0
                    ? 'None scheduled yet'
                    : `${takenMedsCount} of ${medications.length} taken today`}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTab('medication')}
              className="text-xs text-[#B56F83] font-medium hover:underline cursor-pointer"
            >
              Manage →
            </button>
          </div>

          {/* Cycle Status Line */}
          <div className="flex items-center justify-between py-3 border-b border-[#EAE6DF] text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#F3E9E5] text-[#B56F83] flex items-center justify-center shrink-0">
                <Moon className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div>
                <span className="font-medium text-[#29272A] block">Biological Cycle</span>
                <span className="text-[11px] text-[#716D70]">
                  {latestCycle
                    ? `Day ${latestCycle.cycleDay} · ${latestCycle.phase} phase`
                    : 'Not tracked yet'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTab('cycle')}
              className="text-xs text-[#B56F83] font-medium hover:underline cursor-pointer"
            >
              {latestCycle ? 'View details →' : 'Set up →'}
            </button>
          </div>

          {/* Contextual Health Observation */}
          <div className="p-4 rounded-2xl bg-[#F3E9E5]/40 border border-[#EAE6DF] text-xs text-[#716D70] space-y-1">
            <div className="flex items-center gap-1.5 text-[#B56F83] font-semibold text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rhythm Observation</span>
            </div>
            <p className="leading-relaxed text-[#29272A]">
              {latestCycle && latestCycle.phase === 'luteal'
                ? 'Your energy naturally shifts inward during the luteal phase. Afternoon breaks help protect your evening calm.'
                : 'Sleep consistency directly supports daily task initiation. No rigid targets required.'}
            </p>
          </div>
        </div>
      )}

      {/* 2. MEDICATION TAB */}
      {activeSubTab === 'medication' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#716D70]">
              {medications.length} {medications.length === 1 ? 'routine' : 'routines'} active
            </span>
            <button
              onClick={() => setShowAddMedForm(!showAddMedForm)}
              className="flex items-center gap-1 text-xs font-medium text-white bg-[#B56F83] hover:bg-[#A25C70] px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addMedication}</span>
            </button>
          </div>

          {showAddMedForm && (
            <form onSubmit={handleCreateMed} className="bg-white border border-[#EAE6DF] p-4 rounded-2xl space-y-3 shadow-xs">
              <h3 className="text-xs font-semibold text-[#29272A]">New Routine</h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] text-[#716D70] font-medium mb-1">{t.medName}</label>
                  <input
                    type="text"
                    required
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="e.g. Iron, Vitamin D, or Prescription"
                    className="w-full px-3 py-1.5 text-xs bg-[#F8F5F0] border border-[#EAE6DF] rounded-lg text-[#29272A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#716D70] font-medium mb-1">{t.medDose}</label>
                  <input
                    type="text"
                    required
                    value={newMedDose}
                    onChange={(e) => setNewMedDose(e.target.value)}
                    placeholder="e.g. 1 tablet"
                    className="w-full px-3 py-1.5 text-xs bg-[#F8F5F0] border border-[#EAE6DF] rounded-lg text-[#29272A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] text-[#716D70] font-medium mb-1">{t.medTime}</label>
                  <input
                    type="time"
                    value={newMedTime}
                    onChange={(e) => setNewMedTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F8F5F0] border border-[#EAE6DF] rounded-lg text-[#29272A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#716D70] font-medium mb-1">{t.foodInstruction}</label>
                  <select
                    value={newMedFood}
                    onChange={(e) => setNewMedFood(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F8F5F0] border border-[#EAE6DF] rounded-lg text-[#29272A]"
                  >
                    <option value="after_food">{t.afterFood}</option>
                    <option value="before_food">{t.beforeFood}</option>
                    <option value="with_food">{t.withFood}</option>
                    <option value="bedtime">{t.bedtime}</option>
                    <option value="any">{t.anytime}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddMedForm(false)}
                  className="px-3 py-1 text-xs text-[#716D70] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 text-xs font-medium text-white bg-[#B56F83] rounded-xl cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          {medications.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#716D70] space-y-1">
              <p>{language === 'id' ? 'Belum ada rutinitas obat atau suplemen.' : 'No medications or supplements scheduled.'}</p>
              <p className="text-[11px] text-[#A09A9F]">
                {language === 'id' ? 'Jadwal dan dosis selalu berada di bawah kendalimu.' : 'Dosage and timing remain strictly user-governed.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#EAE6DF]/70">
              {medications.map((med) => {
                const status = getMedStatusForToday(med.id);
                const isTaken = status === 'taken';

                return (
                  <div key={med.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#29272A] text-[15px] sm:text-base">{med.name}</span>
                        <span className="text-xs text-[#716D70]">· {med.dosage}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#716D70] mt-0.5">
                        <span className="font-mono">{med.timeOfDay}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{med.foodRelation.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isTaken ? (
                        <span className="text-xs font-semibold text-[#8FA58F] flex items-center gap-1 bg-[#F3E9E5]/60 px-2.5 py-1 rounded-lg">
                          <Check className="w-3.5 h-3.5" />
                          <span>{t.takenStatus}</span>
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => onLogMedication(med.id, 'snoozed')}
                            className="px-2.5 py-1 text-xs text-[#716D70] hover:text-[#29272A] border border-[#EAE6DF] rounded-lg transition-colors cursor-pointer"
                          >
                            Snooze
                          </button>
                          <button
                            onClick={() => onLogMedication(med.id, 'taken')}
                            className="px-3 py-1 text-xs font-medium text-white bg-[#B56F83] hover:bg-[#A25C70] rounded-lg transition-colors cursor-pointer shadow-xs"
                          >
                            Take
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. WOMEN'S HEALTH & CYCLE TAB: Sophisticated, functional, non-stereotypical */}
      {activeSubTab === 'cycle' && (
        <div className="space-y-5">
          {latestCycle ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
                <div>
                  <span className="text-[11px] font-semibold text-[#B56F83] uppercase tracking-wider block">
                    {t.cycleHeading}
                  </span>
                  <h2 className="text-lg font-medium text-[#29272A] mt-0.5">
                    {t.dayOfCycle.replace('{day}', String(latestCycle.cycleDay))} ·{' '}
                    <span className="capitalize">{latestCycle.phase} phase</span>
                  </h2>
                </div>

                <button
                  onClick={() => setIsSettingUpCycle(true)}
                  className="text-xs text-[#B56F83] hover:underline font-medium cursor-pointer"
                >
                  {language === 'id' ? 'Ubah' : 'Update'}
                </button>
              </div>

              {/* Functional Recommendation */}
              <div className="p-3.5 rounded-2xl bg-[#F3E9E5]/50 border border-[#EAE6DF] text-xs text-[#29272A] leading-relaxed">
                <span className="block text-[11px] font-semibold text-[#B56F83] uppercase tracking-wider mb-1">
                  Schedule Harmony
                </span>
                <p>{t.cycleInsight}</p>
              </div>

              {/* Symptom chips */}
              <div>
                <span className="block text-xs font-medium text-[#716D70] mb-2">{t.symptomsTitle}</span>
                <div className="flex flex-wrap gap-2">
                  {availableSymptoms.map((sym) => {
                    const isLogged = latestCycle.symptoms?.includes(sym.label.toLowerCase());
                    return (
                      <button
                        key={sym.id}
                        onClick={() => onLogCycleSymptom(sym.label.toLowerCase())}
                        className={`px-3 py-1.5 text-xs rounded-xl border transition-colors cursor-pointer ${
                          isLogged
                            ? 'bg-[#B56F83] text-white border-[#B56F83]'
                            : 'bg-white border-[#EAE6DF] text-[#716D70] hover:border-[#B56F83] hover:text-[#29272A]'
                        }`}
                      >
                        {sym.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <h3 className="font-serif text-lg font-medium text-[#29272A]">
                {language === 'id' ? 'Siklus belum dicatat' : 'No cycle rhythm recorded yet'}
              </h3>
              <p className="text-xs text-[#716D70] max-w-sm mx-auto leading-relaxed">
                {language === 'id'
                  ? 'Catat fase siklus dan sensasi harianmu jika ingin menyelaraskan komitmen dengan ritme energimu.'
                  : 'Track your natural cycle rhythm to align demanding tasks with your natural energy.'}
              </p>

              {isSettingUpCycle ? (
                <form onSubmit={handleInitialCycleSave} className="max-w-xs mx-auto text-left bg-white border border-[#EAE6DF] p-4 rounded-2xl space-y-3">
                  <div>
                    <label className="block text-[10px] text-[#716D70] font-medium mb-1">Cycle Day (1-35)</label>
                    <input
                      type="number"
                      min="1"
                      max="35"
                      required
                      value={setupCycleDay}
                      onChange={(e) => setSetupCycleDay(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#F8F5F0] border border-[#EAE6DF] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#716D70] font-medium mb-1">Current Phase</label>
                    <select
                      value={setupPhase}
                      onChange={(e) => setSetupPhase(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs bg-[#F8F5F0] border border-[#EAE6DF] rounded-lg"
                    >
                      <option value="menstrual">Menstrual Phase</option>
                      <option value="follicular">Follicular Phase</option>
                      <option value="ovulatory">Ovulatory Phase</option>
                      <option value="luteal">Luteal Phase</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsSettingUpCycle(false)}
                      className="px-3 py-1 text-xs text-[#716D70] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1 text-xs font-medium text-white bg-[#B56F83] rounded-xl cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsSettingUpCycle(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#B56F83] hover:bg-[#A25C70] rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'id' ? 'Catat Ritme Hari Ini' : 'Log Today’s Rhythm'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
