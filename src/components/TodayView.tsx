import React, { useState } from 'react';
import {
  Check,
  Clock,
  Sparkles,
  ArrowRight,
  Mail,
  Feather,
  Plus,
  Calendar,
  Edit2,
  Trash2,
  Sprout,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { translations } from '../i18n/translations';
import { ScheduleItem, FutureMeNote, DailyCheckIn } from '../types';
import { ambientSound } from '../services/ambientAudio';
import { MoodCheckIn } from './MoodCheckIn';

interface TodayViewProps {
  language: 'en' | 'id';
  userName: string;
  items: ScheduleItem[];
  isLowEnergyMode: boolean;
  futureMeNotes: FutureMeNote[];
  dailyCheckIn: DailyCheckIn | null;
  onSaveCheckIn: (checkIn: DailyCheckIn) => void;
  onToggleComplete: (id: string) => void;
  onSnoozeItem: (id: string) => void;
  onRescheduleToTomorrow: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenLowEnergyModal: () => void;
  onOpenRitual: () => void;
  onReadFutureMeNote: (id: string) => void;
  onUpdateName: (name: string) => void;
  onLoadSampleSchedule: () => void;
  onClearSchedule: () => void;
  onOpenWorld?: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  language,
  userName,
  items,
  isLowEnergyMode,
  futureMeNotes,
  dailyCheckIn,
  onSaveCheckIn,
  onToggleComplete,
  onSnoozeItem,
  onRescheduleToTomorrow,
  onDeleteItem,
  onOpenAddModal,
  onOpenLowEnergyModal,
  onOpenRitual,
  onReadFutureMeNote,
  onUpdateName,
  onLoadSampleSchedule,
  onClearSchedule,
  onOpenWorld,
}) => {
  const t = translations[language];
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [lastCompletedId, setLastCompletedId] = useState<string | null>(null);
  const [animatingItemId, setAnimatingItemId] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  // Formatted date: "Tuesday, October 6"
  const now = new Date();
  const dateFormatted = now.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Time-aware greeting
  const hour = now.getHours();
  let greeting = t.today.greeting;
  if (hour >= 12 && hour < 17) greeting = t.today.greetingAfternoon;
  else if (hour >= 17) greeting = t.today.greetingEvening;

  // Unread delivered notes for today
  const unreadNotes = futureMeNotes.filter((n) => !n.isRead);

  // Chronologically sorted schedule
  const sortedItems = [...items].sort((a, b) => {
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    return a.startTime.localeCompare(b.startTime);
  });

  // Determine the NEXT upcoming incomplete item
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const incompleteItemsWithTime = sortedItems.filter((item) => !item.isCompleted && item.startTime);
  const nextItem = incompleteItemsWithTime[0] || sortedItems.find((item) => !item.isCompleted);

  // Time notice for NEXT item
  let nextTimeNotice = '';
  if (nextItem && nextItem.startTime) {
    const [h, m] = nextItem.startTime.split(':').map(Number);
    const itemMinutes = h * 60 + m;
    const diff = itemMinutes - currentMinutes;

    if (diff > 0 && diff <= 120) {
      nextTimeNotice = t.today.inMinutes.replace('{min}', String(diff));
    } else {
      nextTimeNotice = t.today.startsAt.replace('{time}', nextItem.startTime);
    }
  }

  const handleComplete = (item: ScheduleItem) => {
    const willBeCompleted = !item.isCompleted;
    if (willBeCompleted) {
      setAnimatingItemId(item.id);
      ambientSound.playSingleChime();
      setLastCompletedId(item.id);
      setSuccessNotice(t.today.completedNotice);
      setTimeout(() => setAnimatingItemId(null), 500);
      setTimeout(() => setSuccessNotice(null), 3200);
    }
    onToggleComplete(item.id);
  };

  const handleUndoLast = () => {
    if (lastCompletedId) {
      onToggleComplete(lastCompletedId);
      setSuccessNotice(null);
      setLastCompletedId(null);
    }
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateName(nameInput.trim());
    setIsEditingName(false);
  };

  // Triage groupings if low energy active
  const essentialItems = sortedItems.filter((i) => i.triageBucket === 'essential' || i.priority === 'essential');
  const ifPossibleItems = sortedItems.filter((i) => i.triageBucket === 'ifPossible' || (i.priority === 'normal' && i.triageBucket !== 'essential'));
  const laterItems = sortedItems.filter((i) => i.triageBucket === 'later' || i.priority === 'flexible');

  // Timeline Row Component: Minimalist, card-free, elegant typography
  const renderTimelineRow = (item: ScheduleItem) => {
    const isNext = nextItem?.id === item.id;
    const isAnimating = animatingItemId === item.id;

    return (
      <div
        key={item.id}
        className={`group relative flex items-start gap-3 sm:gap-4 py-3.5 px-3 -mx-3 rounded-xl transition-all duration-200 ${
          item.isCompleted
            ? 'opacity-40'
            : isNext
            ? 'bg-[#F3E9E5]/50 border-l-2 border-[#B56F83] pl-3.5'
            : 'hover:bg-black/[0.015]'
        }`}
      >
        {/* Subtle Checkbox with Warm Berry Accent */}
        <div className="relative mt-0.5 shrink-0">
          <button
            onClick={() => handleComplete(item)}
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 cursor-pointer ${
              item.isCompleted
                ? 'bg-[#B56F83] border-[#B56F83] text-white shadow-xs'
                : 'border-[#D5CFC7] bg-white hover:border-[#B56F83]'
            } ${isAnimating ? 'scale-110 ring-4 ring-[#B56F83]/20' : ''}`}
            title={item.isCompleted ? t.item.undo : t.item.markDone}
          >
            {item.isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.4]" />}
          </button>
        </div>

        {/* Time Pillar */}
        <div className="w-13 sm:w-16 shrink-0 font-mono text-[13px] sm:text-sm font-medium text-[#716D70] pt-0.5">
          {item.startTime ? item.startTime : <span className="text-[11px] uppercase font-sans tracking-wide">All day</span>}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-[15px] sm:text-base tracking-tight transition-colors duration-200 ${
                item.isCompleted
                  ? 'line-through text-[#716D70]'
                  : 'font-medium text-[#29272A]'
              }`}
            >
              {item.title}
            </span>
          </div>

          {/* Clean, unboxed discreet metadata */}
          <div className="flex items-center gap-2 mt-0.5 text-xs sm:text-[13px] text-[#716D70]">
            {item.durationMinutes && (
              <span>{item.durationMinutes}m</span>
            )}
            {item.category && (
              <>
                <span aria-hidden="true" className="text-[#D5CFC7]">·</span>
                <span className="capitalize">{item.category}</span>
              </>
            )}
            {item.isApproximate && (
              <>
                <span aria-hidden="true" className="text-[#D5CFC7]">·</span>
                <span className="italic">{t.item.approximate}</span>
              </>
            )}
            {item.medicationInfo?.foodRelation && (
              <>
                <span aria-hidden="true" className="text-[#D5CFC7]">·</span>
                <span className="text-[#8FA58F] font-medium">
                  {item.medicationInfo.foodRelation === 'after_food'
                    ? 'After meal'
                    : item.medicationInfo.foodRelation === 'before_food'
                    ? 'Before meal'
                    : 'With meal'}
                </span>
              </>
            )}
          </div>

          {item.notes && (
            <p className="text-xs text-[#716D70] mt-1 line-clamp-1 italic">{item.notes}</p>
          )}
        </div>

        {/* Discreet Quick Controls on hover/touch */}
        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onSnoozeItem(item.id)}
            className="p-1.5 text-xs text-[#716D70] hover:text-[#29272A] hover:bg-[#F3E9E5] rounded-md transition-colors cursor-pointer"
            title={t.item.snooze30}
          >
            <Clock className="w-3.5 h-3.5 stroke-[1.8]" />
          </button>
          <button
            onClick={() => onRescheduleToTomorrow(item.id)}
            className="p-1.5 text-xs text-[#716D70] hover:text-[#29272A] hover:bg-[#F3E9E5] rounded-md transition-colors cursor-pointer"
            title={t.item.moveToTomorrow}
          >
            <ArrowRight className="w-3.5 h-3.5 stroke-[1.8]" />
          </button>
          <button
            onClick={() => onDeleteItem(item.id)}
            className="p-1.5 text-xs text-[#A09A9F] hover:text-[#B56F83] hover:bg-[#F3E9E5] rounded-md transition-colors cursor-pointer"
            title={t.item.delete}
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[1.8]" />
          </button>
        </div>
      </div>
    );
  };

  const completedTodayCount = sortedItems.filter((i) => i.isCompleted).length;

  return (
    <div className="space-y-6 sm:space-y-7 pb-20 max-w-xl mx-auto">
      {/* 1. HEADER: Strong visual hierarchy */}
      <div>
        <div className="flex items-baseline gap-2">
          {isEditingName ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name"
                className="font-serif text-2xl font-medium border-b border-[#B56F83] bg-transparent focus:outline-none text-[#29272A] pb-0.5"
              />
              <button
                type="submit"
                className="px-2.5 py-1 text-xs font-medium text-white bg-[#B56F83] rounded-md cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="text-xs text-[#716D70] hover:text-[#29272A] cursor-pointer"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#29272A]">
                {greeting}{userName ? `, ${userName}` : ''}
              </h1>
              <button
                onClick={() => {
                  setNameInput(userName);
                  setIsEditingName(true);
                }}
                className="text-[#A09A9F] hover:text-[#B56F83] p-1 rounded-md opacity-40 group-hover:opacity-100 transition-opacity cursor-pointer"
                title={userName ? "Edit name" : "Set your name"}
              >
                <Edit2 className="w-3.5 h-3.5 stroke-[1.8]" />
              </button>
              {!userName && (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-xs text-[#B56F83] hover:underline cursor-pointer font-medium"
                >
                  · set name
                </button>
              )}
            </div>
          )}
        </div>
        <p className="text-[14px] sm:text-[15px] font-medium text-[#716D70] mt-1 tracking-wide">
          {dateFormatted}
        </p>
      </div>

      {/* 2. MOOD & CAPACITY CHECK-IN: Lightweight, calm, directly beneath greeting */}
      <MoodCheckIn
        language={language}
        currentCheckIn={dailyCheckIn}
        onSaveCheckIn={onSaveCheckIn}
        onTriggerMakeTodayEasier={onOpenLowEnergyModal}
        isLowEnergyModeActive={isLowEnergyMode}
      />

      {/* Subtle feedback toast with autonomy undo */}
      {successNotice && (
        <div className="bg-[#F3E9E5] border border-[#E3D3CD] px-4 py-2 rounded-xl text-xs font-medium text-[#29272A] flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#B56F83]" />
            <span>{successNotice}</span>
          </div>
          {lastCompletedId && (
            <button
              onClick={handleUndoLast}
              className="text-[11px] font-semibold text-[#B56F83] hover:underline cursor-pointer ml-3 shrink-0"
            >
              Undo
            </button>
          )}
        </div>
      )}

      {/* Future Me delivered note (if available) */}
      {unreadNotes.length > 0 && (
        <div className="bg-[#F3E9E5]/60 border border-[#EAE6DF] rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#B56F83]">
              <Mail className="w-3.5 h-3.5" />
              {language === 'id' ? 'Pesan dari Dirimu Sebelumnya' : 'A note from past you'}
            </span>
            <span className="text-[11px] text-[#716D70]">
              {new Date(unreadNotes[0].createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-xs text-[#29272A] italic leading-relaxed">
            "{unreadNotes[0].content}"
          </p>
          <div className="mt-2.5 flex justify-end">
            <button
              onClick={() => onReadFutureMeNote(unreadNotes[0].id)}
              className="text-xs font-medium text-[#B56F83] hover:underline cursor-pointer"
            >
              {language === 'id' ? 'Tandai telah dibaca' : 'Acknowledge note'}
            </button>
          </div>
        </div>
      )}

      {/* 3. NEXT: High-clarity anchor (only if incomplete items exist) */}
      {nextItem && !isLowEnergyMode && (
        <div className="pt-1 pb-2">
          <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-[#716D70] mb-2 uppercase">
            <span>{t.today.nextUp}</span>
            {nextTimeNotice && (
              <span className="font-mono text-xs font-medium text-[#B56F83] lowercase">
                {nextTimeNotice}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 py-2 border-b border-[#EAE6DF]">
            <div>
              <div className="flex items-baseline gap-2">
                {nextItem.startTime && (
                  <span className="font-mono text-sm font-semibold text-[#29272A]">
                    {nextItem.startTime}
                  </span>
                )}
                <h2 className="text-lg font-medium tracking-tight text-[#29272A]">
                  {nextItem.title}
                </h2>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-[#716D70]">
                {nextItem.durationMinutes && <span>{nextItem.durationMinutes} min</span>}
                <span className="capitalize">· {nextItem.category || nextItem.type}</span>
              </div>
            </div>

            <button
              onClick={() => handleComplete(nextItem)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#B56F83] hover:bg-[#A25C70] rounded-xl transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>{t.item.markDone}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. TODAY: The Schedule Hero (Occupies majority of screen) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-[11px] font-semibold tracking-wider text-[#716D70] uppercase">
            {t.today.todaySchedule}
          </h2>

          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <button
                onClick={onClearSchedule}
                className="text-xs text-[#A09A9F] hover:text-[#B56F83] transition-colors cursor-pointer"
                title="Clear all tasks"
              >
                Clear all
              </button>
            )}

            <button
              onClick={onOpenLowEnergyModal}
              className="text-xs text-[#B56F83] hover:text-[#A25C70] font-medium flex items-center gap-1 cursor-pointer"
            >
              <Feather className="w-3.5 h-3.5 stroke-[1.8]" />
              <span>{isLowEnergyMode ? t.today.restoreNormalSchedule : t.today.makeTodayEasier}</span>
            </button>
          </div>
        </div>

        {/* Schedule List or Gentle Empty State */}
        {isLowEnergyMode ? (
          <div className="space-y-5 pt-1">
            {/* Essential Bucket */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-1">
                <span className="text-xs font-semibold text-[#29272A]">{t.today.essentialSection}</span>
                <span className="text-[11px] text-[#716D70]">{t.today.essentialSub}</span>
              </div>
              <div className="divide-y divide-[#EAE6DF]/60">
                {essentialItems.length > 0 ? (
                  essentialItems.map(renderTimelineRow)
                ) : (
                  <p className="text-xs text-[#716D70] py-3 italic">No critical commitments remaining.</p>
                )}
              </div>
            </div>

            {/* If Possible */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-1">
                <span className="text-xs font-semibold text-[#716D70]">{t.today.ifPossibleSection}</span>
                <span className="text-[11px] text-[#716D70]">{t.today.ifPossibleSub}</span>
              </div>
              <div className="divide-y divide-[#EAE6DF]/60">
                {ifPossibleItems.length > 0 ? (
                  ifPossibleItems.map(renderTimelineRow)
                ) : (
                  <p className="text-xs text-[#716D70] py-3 italic">Nothing pending in this bucket.</p>
                )}
              </div>
            </div>

            {/* Later */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-1">
                <span className="text-xs font-semibold text-[#716D70]">{t.today.laterSection}</span>
                <button
                  onClick={() => laterItems.forEach((i) => onRescheduleToTomorrow(i.id))}
                  className="text-[11px] text-[#B56F83] font-medium hover:underline cursor-pointer"
                >
                  {t.today.rescheduleAllLater}
                </button>
              </div>
              <div className="divide-y divide-[#EAE6DF]/60">
                {laterItems.length > 0 ? (
                  laterItems.map(renderTimelineRow)
                ) : (
                  <p className="text-xs text-[#716D70] py-3 italic">All clear. No postponed tasks.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#EAE6DF]/70">
            {sortedItems.length > 0 ? (
              sortedItems.map(renderTimelineRow)
            ) : (
              /* Clean Spacious Schedule State (Zero Clutter) */
              <div className="py-10 text-center space-y-3">
                <h3 className="font-serif text-lg font-medium text-[#29272A]">
                  {language === 'id' ? 'Hari ini masih bersih & tenang' : 'Your schedule is clear & open'}
                </h3>
                <p className="text-xs text-[#716D70] max-w-sm mx-auto leading-relaxed">
                  {language === 'id'
                    ? 'Tuliskan rencana harimu dengan bahasa santai. Lev akan menyusunnya dengan rapi.'
                    : 'Type your plans naturally. Lev organizes your commitments and protects your calm.'}
                </p>

                <div className="flex items-center justify-center gap-3 pt-3">
                  <button
                    onClick={onOpenAddModal}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#B56F83] hover:bg-[#A25C70] rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'id' ? 'Tambah Rencana' : 'Add your first plan'}</span>
                  </button>

                  <button
                    onClick={onLoadSampleSchedule}
                    className="px-3.5 py-2 text-xs font-medium text-[#716D70] hover:text-[#29272A] border border-[#EAE6DF] rounded-xl transition-colors cursor-pointer bg-white"
                  >
                    {language === 'id' ? 'Muat contoh' : 'Load sample day'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. CONTEXTUAL INSIGHT (Quiet, non-demanding) */}
      {completedTodayCount > 0 && (
        <div className="py-2.5 px-3.5 rounded-xl bg-[#F3E9E5]/40 border border-[#EAE6DF] text-xs text-[#716D70] flex items-center gap-2.5">
          <Sparkles className="w-3.5 h-3.5 text-[#B56F83] shrink-0" />
          <span>
            {language === 'id'
              ? `Kamu telah menyelesaikan ${completedTodayCount} komitmen hari ini tanpa tergesa-gesa.`
              : `You have completed ${completedTodayCount} commitment(s) today at a steady, calm pace.`}
          </span>
        </div>
      )}

      {/* 6. SUBTLE ENTRY POINT TO YOUR WORLD: Emotional sanctuary entry */}
      {onOpenWorld && (
        <div
          onClick={onOpenWorld}
          className="group relative overflow-hidden bg-gradient-to-r from-[#F3E9E5] to-[#F8F5F0] border border-[#EAE6DF] hover:border-[#B56F83]/40 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/80 border border-[#EAE6DF] flex items-center justify-center text-[#8FA58F] group-hover:scale-105 transition-transform shrink-0">
              <Sprout className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wide text-[#29272A]">
                  {language === 'id' ? 'Dunia Saya' : 'Your World'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#B56F83] animate-pulse" />
              </div>
              <p className="text-[11px] text-[#716D70] mt-0.5">
                {language === 'id'
                  ? 'Ada hal baru yang bertumbuh dengan tenang di suakamu.'
                  : 'Something new appeared in your living sanctuary.'}
              </p>
            </div>
          </div>
          <span className="text-xs text-[#B56F83] font-medium group-hover:translate-x-0.5 transition-transform whitespace-nowrap pl-2">
            Visit →
          </span>
        </div>
      )}
    </div>
  );
};
