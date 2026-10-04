import React, { useState, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { BottomNav } from './components/BottomNav';
import { TodayView } from './components/TodayView';
import { PlanView } from './components/PlanView';
import { HealthView } from './components/HealthView';
import { MeView } from './components/MeView';
import { MoneyView } from './components/MoneyView';
import { WorldView } from './components/WorldView';
import { UniversalAddModal } from './components/UniversalAddModal';
import { LowEnergyModal } from './components/LowEnergyModal';
import { FutureMeModal } from './components/FutureMeModal';
import { EveningRitualModal } from './components/EveningRitualModal';

import {
  getStoredData,
  storage,
  getTodayKey,
  getOffsetDateKey,
  getSampleDemoSchedule,
} from './services/storage';

import {
  ScheduleItem,
  Medication,
  MedicationLog,
  CycleEntry,
  Expense,
  MoneyBudget,
  FutureMeNote,
  WorldState,
  UserPreferences,
  DailyCheckIn,
} from './types';

export default function App() {
  const initial = getStoredData();

  // Primary data states
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(initial.schedule);
  const [medications, setMedications] = useState<Medication[]>(initial.medications);
  const [medLogs, setMedLogs] = useState<MedicationLog[]>(initial.medLogs);
  const [cycleEntries, setCycleEntries] = useState<CycleEntry[]>(initial.cycle);
  const [expenses, setExpenses] = useState<Expense[]>(initial.expenses);
  const [budget, setBudget] = useState<MoneyBudget>(initial.budget);
  const [futureMeNotes, setFutureMeNotes] = useState<FutureMeNote[]>(initial.futureMe);
  const [worldState, setWorldState] = useState<WorldState>(initial.world);
  const [preferences, setPreferences] = useState<UserPreferences>(initial.preferences);
  const [dailyCheckIn, setDailyCheckIn] = useState<DailyCheckIn | null>(initial.checkIn);

  // 4 Primary Navigation Destinations: 'today' | 'plan' | 'health' | 'me' (plus contextual 'world' & 'money')
  const [currentView, setCurrentView] = useState<string>('today');
  const [previousView, setPreviousView] = useState<string>('today');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLowEnergyModalOpen, setIsLowEnergyModalOpen] = useState(false);
  const [isFutureMeModalOpen, setIsFutureMeModalOpen] = useState(false);
  const [isRitualModalOpen, setIsRitualModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    storage.saveSchedule(scheduleItems);
  }, [scheduleItems]);

  useEffect(() => {
    storage.saveMedications(medications);
  }, [medications]);

  useEffect(() => {
    storage.saveMedLogs(medLogs);
  }, [medLogs]);

  useEffect(() => {
    storage.saveCycle(cycleEntries);
  }, [cycleEntries]);

  useEffect(() => {
    storage.saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    storage.saveBudget(budget);
  }, [budget]);

  useEffect(() => {
    storage.saveFutureMe(futureMeNotes);
  }, [futureMeNotes]);

  useEffect(() => {
    storage.saveWorld(worldState);
  }, [worldState]);

  useEffect(() => {
    storage.savePreferences(preferences);
  }, [preferences]);

  // Language toggle
  const handleToggleLanguage = () => {
    setPreferences((prev) => ({
      ...prev,
      language: prev.language === 'en' ? 'id' : 'en',
    }));
  };

  // Low Energy Mode Toggle
  const handleToggleLowEnergy = () => {
    const nextState = !preferences.lowEnergyModeActive;
    setPreferences((prev) => ({
      ...prev,
      lowEnergyModeActive: nextState,
    }));
  };

  // Schedule handlers
  const handleToggleComplete = (id: string) => {
    setScheduleItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const completed = !item.isCompleted;
          return {
            ...item,
            isCompleted: completed,
            completedAt: completed ? new Date().toISOString() : undefined,
          };
        }
        return item;
      })
    );
  };

  const handleSnoozeItem = (id: string) => {
    setScheduleItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            isSnoozed: true,
            notes: (item.notes ? item.notes + ' · ' : '') + 'Snoozed +30m',
          };
        }
        return item;
      })
    );
  };

  const handleRescheduleToTomorrow = (id: string) => {
    const tomorrowKey = getOffsetDateKey(1);
    setScheduleItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, date: tomorrowKey } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    setScheduleItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReschedule = (id: string, newDate: string) => {
    setScheduleItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, date: newDate } : item))
    );
  };

  // Medication handlers
  const handleLogMedication = (
    medicationId: string,
    status: 'taken' | 'snoozed' | 'missed'
  ) => {
    const todayKey = getTodayKey();
    const targetMed = medications.find((m) => m.id === medicationId);
    if (!targetMed) return;

    const existingLogIdx = medLogs.findIndex(
      (l) => l.medicationId === medicationId && l.date === todayKey
    );

    const newLog: MedicationLog = {
      id: `log_${Date.now()}`,
      medicationId,
      medicationName: targetMed.name,
      dosage: targetMed.dosage,
      scheduledTime: targetMed.timeOfDay,
      date: todayKey,
      status,
      loggedAt: new Date().toISOString(),
    };

    if (existingLogIdx >= 0) {
      setMedLogs((prev) => {
        const copy = [...prev];
        copy[existingLogIdx] = newLog;
        return copy;
      });
    } else {
      setMedLogs((prev) => [newLog, ...prev]);
    }
  };

  const handleAddMedication = (med: Medication) => {
    setMedications((prev) => [med, ...prev]);
  };

  // Cycle symptom handler
  const handleLogCycleSymptom = (symptom: string) => {
    const todayKey = getTodayKey();
    setCycleEntries((prev) => {
      if (prev.length === 0) {
        return [
          {
            date: todayKey,
            cycleDay: 14,
            phase: 'follicular',
            isPeriodDay: false,
            symptoms: [symptom],
            energyLevel: 3,
          },
        ];
      }
      const latest = prev[0];
      const symptoms = latest.symptoms.includes(symptom)
        ? latest.symptoms.filter((s) => s !== symptom)
        : [...latest.symptoms, symptom];

      return [{ ...latest, symptoms }, ...prev.slice(1)];
    });
  };

  // Expense handlers
  const handleAddExpenses = (newExpenses: Expense[]) => {
    setExpenses((prev) => [...newExpenses, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Future Me
  const handleCreateFutureMeNote = (note: FutureMeNote) => {
    setFutureMeNotes((prev) => [note, ...prev]);
  };

  const handleReadFutureMeNote = (id: string) => {
    setFutureMeNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  // Ambience
  const handleSetAmbience = (amb: 'auto' | 'morning' | 'afternoon' | 'dusk' | 'night') => {
    setWorldState((prev) => ({ ...prev, activeAmbience: amb }));
  };

  // Triage update
  const handleApplyTriage = (updated: ScheduleItem[]) => {
    setScheduleItems(updated);
    setPreferences((prev) => ({ ...prev, lowEnergyModeActive: true }));
  };

  const handleRescheduleLaterToTomorrow = () => {
    const tomorrowKey = getOffsetDateKey(1);
    setScheduleItems((prev) =>
      prev.map((item) => {
        if (item.triageBucket === 'later' || item.priority === 'flexible') {
          return { ...item, date: tomorrowKey };
        }
        return item;
      })
    );
  };

  const handleUpdateName = (newName: string) => {
    setPreferences((prev) => ({ ...prev, name: newName }));
  };

  const handleLoadSampleSchedule = () => {
    const demoItems = getSampleDemoSchedule();
    setScheduleItems(demoItems);
  };

  const handleClearSchedule = () => {
    setScheduleItems([]);
  };

  // Navigation helpers for sub-hubs
  const handleOpenWorld = () => {
    setPreviousView(currentView === 'world' ? 'today' : currentView);
    setCurrentView('world');
  };

  const handleOpenMoney = () => {
    setPreviousView('me');
    setCurrentView('money');
  };

  const handleBackFromSubView = () => {
    setCurrentView(previousView || 'today');
  };

  // Items for today
  const todayKey = getTodayKey();
  const todayItems = scheduleItems.filter((i) => i.date === todayKey);

  // Normalize nav active state for the 4 core tabs
  const activeNavId =
    currentView === 'world'
      ? previousView === 'today'
        ? 'today'
        : 'me'
      : currentView === 'money'
      ? 'me'
      : currentView;

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#29272A] font-sans selection:bg-[#F3E9E5] selection:text-[#B56F83]">
      {/* Top Bar with 4 clean navigation links */}
      <TopNav
        currentView={activeNavId}
        onNavigate={setCurrentView}
        language={preferences.language}
        onToggleLanguage={handleToggleLanguage}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onToggleLowEnergy={handleToggleLowEnergy}
        isLowEnergyActive={preferences.lowEnergyModeActive}
      />

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-5 sm:pt-7 pb-20">
        {currentView === 'today' && (
          <TodayView
            language={preferences.language}
            userName={preferences.name}
            items={todayItems}
            isLowEnergyMode={preferences.lowEnergyModeActive}
            futureMeNotes={futureMeNotes}
            dailyCheckIn={dailyCheckIn}
            onSaveCheckIn={(checkIn) => {
              setDailyCheckIn(checkIn);
              storage.saveCheckIn(checkIn);
            }}
            onToggleComplete={handleToggleComplete}
            onSnoozeItem={handleSnoozeItem}
            onRescheduleToTomorrow={handleRescheduleToTomorrow}
            onDeleteItem={handleDeleteItem}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenLowEnergyModal={() => setIsLowEnergyModalOpen(true)}
            onOpenRitual={() => setIsRitualModalOpen(true)}
            onReadFutureMeNote={handleReadFutureMeNote}
            onUpdateName={handleUpdateName}
            onLoadSampleSchedule={handleLoadSampleSchedule}
            onClearSchedule={handleClearSchedule}
            onOpenWorld={handleOpenWorld}
          />
        )}

        {currentView === 'plan' && (
          <PlanView
            language={preferences.language}
            items={scheduleItems}
            onToggleComplete={handleToggleComplete}
            onReschedule={handleReschedule}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {currentView === 'health' && (
          <HealthView
            language={preferences.language}
            medications={medications}
            medLogs={medLogs}
            cycleEntries={cycleEntries}
            onLogMedication={handleLogMedication}
            onAddMedication={handleAddMedication}
            onLogCycleSymptom={handleLogCycleSymptom}
            onSaveCycleEntry={(entry) => setCycleEntries((prev) => [entry, ...prev])}
          />
        )}

        {currentView === 'me' && (
          <MeView
            language={preferences.language}
            preferences={preferences}
            budget={budget}
            expenses={expenses}
            worldState={worldState}
            futureMeNotes={futureMeNotes}
            onUpdatePreferences={(updated) => setPreferences((prev) => ({ ...prev, ...updated }))}
            onOpenMoney={handleOpenMoney}
            onOpenWorld={handleOpenWorld}
            onOpenFutureMe={() => setIsFutureMeModalOpen(true)}
            onOpenRitual={() => setIsRitualModalOpen(true)}
          />
        )}

        {currentView === 'money' && (
          <div>
            <button
              onClick={handleBackFromSubView}
              className="text-xs text-[#B56F83] hover:underline font-medium mb-3 flex items-center gap-1 cursor-pointer"
            >
              ← Back to {previousView === 'today' ? 'Today' : 'Me'}
            </button>
            <MoneyView
              language={preferences.language}
              budget={budget}
              expenses={expenses}
              onAddExpense={(exp) => handleAddExpenses([exp])}
              onDeleteExpense={handleDeleteExpense}
              onUpdateBudget={(updated) => setBudget(updated)}
            />
          </div>
        )}

        {currentView === 'world' && (
          <WorldView
            language={preferences.language}
            worldState={worldState}
            onSetAmbience={handleSetAmbience}
            onBack={handleBackFromSubView}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation: Exactly 4 Clean Destinations */}
      <BottomNav
        currentView={activeNavId}
        onNavigate={setCurrentView}
        language={preferences.language}
      />

      {/* Universal Add Modal */}
      <UniversalAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        language={preferences.language}
        onAddScheduleItems={(items) => setScheduleItems((prev) => [...prev, ...items])}
        onAddExpenses={handleAddExpenses}
        onAddMedication={handleAddMedication}
      />

      {/* Low Energy Mode Triage Modal */}
      <LowEnergyModal
        isOpen={isLowEnergyModalOpen}
        onClose={() => setIsLowEnergyModalOpen(false)}
        language={preferences.language}
        items={todayItems}
        onApplyTriage={handleApplyTriage}
        onRescheduleLaterToTomorrow={handleRescheduleLaterToTomorrow}
      />

      {/* Future Me Continuity Notes Modal */}
      <FutureMeModal
        isOpen={isFutureMeModalOpen}
        onClose={() => setIsFutureMeModalOpen(false)}
        language={preferences.language}
        notes={futureMeNotes}
        onCreateNote={handleCreateFutureMeNote}
      />

      {/* 30-Second Evening Wind Down Ritual Modal */}
      <EveningRitualModal
        isOpen={isRitualModalOpen}
        onClose={() => setIsRitualModalOpen(false)}
        language={preferences.language}
        onAddScheduleItems={(items) => setScheduleItems((prev) => [...prev, ...items])}
      />
    </div>
  );
}
