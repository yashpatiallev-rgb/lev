import React, { useState } from 'react';
import {
  User,
  Wallet,
  Sprout,
  Mail,
  Moon,
  Globe,
  Feather,
  Shield,
  Bell,
  Clock,
  ChevronRight,
  Edit2,
  Check,
  Sparkles,
} from 'lucide-react';
import { translations } from '../i18n/translations';
import { UserPreferences, MoneyBudget, Expense, WorldState, FutureMeNote } from '../types';
import { formatDualCurrency } from './MoneyView';

interface MeViewProps {
  language: 'en' | 'id';
  preferences: UserPreferences;
  budget: MoneyBudget;
  expenses: Expense[];
  worldState: WorldState;
  futureMeNotes: FutureMeNote[];
  onUpdatePreferences: (pref: Partial<UserPreferences>) => void;
  onOpenMoney: () => void;
  onOpenWorld: () => void;
  onOpenFutureMe: () => void;
  onOpenRitual: () => void;
}

export const MeView: React.FC<MeViewProps> = ({
  language,
  preferences,
  budget,
  expenses,
  worldState,
  futureMeNotes,
  onUpdatePreferences,
  onOpenMoney,
  onOpenWorld,
  onOpenFutureMe,
  onOpenRitual,
}) => {
  const t = translations[language];
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(preferences.name || '');
  const [discreetMode, setDiscreetMode] = useState(true);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePreferences({ name: nameVal.trim() });
    setIsEditingName(false);
  };

  // Safe to spend preview in INR + IDR
  const safeDual = formatDualCurrency(budget.safeToSpend || 0, budget.currency || 'INR');

  return (
    <div className="space-y-6 sm:space-y-7 pb-20 max-w-xl mx-auto">
      {/* 1. PROFILE HEADER */}
      <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#F3E9E5] border border-[#E3D3CD] text-[#B56F83] flex items-center justify-center font-serif text-lg font-semibold shrink-0">
            {preferences.name ? preferences.name.charAt(0).toUpperCase() : <User className="w-6 h-6 stroke-[1.8]" />}
          </div>

          <div>
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                  placeholder="Enter name"
                  className="font-serif text-lg font-medium border-b border-[#B56F83] bg-transparent text-[#29272A] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2 py-0.5 text-xs font-medium text-white bg-[#B56F83] rounded-md"
                >
                  Save
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-[#29272A]">
                  {preferences.name || (language === 'id' ? 'Profil Pribadi' : 'Personal Profile')}
                </h1>
                <button
                  onClick={() => {
                    setNameVal(preferences.name);
                    setIsEditingName(true);
                  }}
                  className="text-[#A09A9F] hover:text-[#B56F83] p-1 rounded-md transition-colors cursor-pointer"
                  title="Edit name"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-xs text-[#716D70] mt-0.5">
              {language === 'id' ? 'Ritme hidup adaptif & ruang privat' : 'Adaptive life rhythm & personal sanctuary'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY LIFESTYLE HUBS (Money, Sanctuary, Future Me) */}
      <div className="space-y-3">
        {/* Money / Safe to Spend */}
        <div
          onClick={onOpenMoney}
          className="group p-4 rounded-2xl bg-white border border-[#EAE6DF] hover:border-[#B56F83]/40 transition-all duration-200 cursor-pointer flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F3E9E5] text-[#B56F83] flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#29272A]">{t.money.title}</span>
                <span className="text-[10px] font-mono text-[#716D70] bg-[#F8F5F0] px-1.5 py-0.5 rounded">
                  INR & IDR
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 text-xs text-[#716D70] mt-0.5 font-mono">
                <span className="font-semibold text-[#29272A]">{safeDual.inr}</span>
                <span>·</span>
                <span>{safeDual.idr}</span>
                <span className="font-sans text-[11px] text-[#716D70]">safe</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A09A9F] group-hover:text-[#B56F83] group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Your World Sanctuary */}
        <div
          onClick={onOpenWorld}
          className="group p-4 rounded-2xl bg-white border border-[#EAE6DF] hover:border-[#B56F83]/40 transition-all duration-200 cursor-pointer flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F3E9E5] text-[#8FA58F] flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#29272A]">{t.world.title}</span>
                <span className="text-[10px] text-[#8FA58F] font-medium bg-[#F3E9E5]/60 px-1.5 py-0.5 rounded">
                  {worldState.discoveredIds.length} discoveries
                </span>
              </div>
              <p className="text-xs text-[#716D70] mt-0.5">
                {language === 'id' ? 'Suaka alam yang bertumbuh bersamamu' : 'Living digital sanctuary that evolves with you'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A09A9F] group-hover:text-[#B56F83] group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Future Me Continuity Notes */}
        <div
          onClick={onOpenFutureMe}
          className="group p-4 rounded-2xl bg-white border border-[#EAE6DF] hover:border-[#B56F83]/40 transition-all duration-200 cursor-pointer flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F3E9E5] text-[#B56F83] flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#29272A]">{t.futureMe.title}</span>
                {futureMeNotes.filter((n) => !n.isRead).length > 0 && (
                  <span className="text-[10px] font-semibold text-[#B56F83] bg-[#F3E9E5] px-1.5 py-0.5 rounded">
                    New note
                  </span>
                )}
              </div>
              <p className="text-xs text-[#716D70] mt-0.5">
                {language === 'id' ? 'Pesan masa depan untuk dirimu sendiri' : 'Leave continuity notes for tomorrow or next week'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A09A9F] group-hover:text-[#B56F83] group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Evening Wind-Down Ritual */}
        <div
          onClick={onOpenRitual}
          className="group p-4 rounded-2xl bg-white border border-[#EAE6DF] hover:border-[#B56F83]/40 transition-all duration-200 cursor-pointer flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F3E9E5] text-[#9B91B5] flex items-center justify-center shrink-0">
              <Moon className="w-4 h-4 stroke-[1.8]" />
            </div>
            <div>
              <span className="text-sm font-medium text-[#29272A] block">{t.ritual.eveningTitle}</span>
              <p className="text-xs text-[#716D70] mt-0.5">{t.ritual.eveningSub}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#A09A9F] group-hover:text-[#B56F83] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      {/* 3. PREFERENCES & RHYTHM */}
      <div className="space-y-3 pt-2">
        <h2 className="text-[11px] font-semibold tracking-wider text-[#716D70] uppercase">
          {language === 'id' ? 'Preferensi & Ritme' : 'Preferences & Rhythm'}
        </h2>

        <div className="bg-white border border-[#EAE6DF] rounded-2xl divide-y divide-[#EAE6DF] shadow-xs">
          {/* Language Switch */}
          <div className="p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-[#716D70]" />
              <span className="font-medium text-[#29272A]">Language</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdatePreferences({ language: 'en' })}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  language === 'en' ? 'bg-[#B56F83] text-white shadow-xs' : 'text-[#716D70] hover:bg-[#F8F5F0]'
                }`}
              >
                English
              </button>
              <button
                onClick={() => onUpdatePreferences({ language: 'id' })}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  language === 'id' ? 'bg-[#B56F83] text-white shadow-xs' : 'text-[#716D70] hover:bg-[#F8F5F0]'
                }`}
              >
                Indonesia
              </button>
            </div>
          </div>

          {/* Low Energy Mode Toggle */}
          <div className="p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Feather className="w-4 h-4 text-[#716D70]" />
              <div>
                <span className="font-medium text-[#29272A] block">Low-Energy Mode</span>
                <span className="text-[11px] text-[#716D70]">
                  {language === 'id' ? 'Fokus ke hal esensial saja' : 'Focus on essentials, park flexible tasks'}
                </span>
              </div>
            </div>
            <button
              onClick={() => onUpdatePreferences({ lowEnergyModeActive: !preferences.lowEnergyModeActive })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                preferences.lowEnergyModeActive ? 'bg-[#B56F83]' : 'bg-[#D5CFC7]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  preferences.lowEnergyModeActive ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Wake & Sleep Times */}
          <div className="p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#716D70]" />
              <div>
                <span className="font-medium text-[#29272A] block">Daily Rhythm Hours</span>
                <span className="text-[11px] text-[#716D70]">
                  Wake {preferences.preferredWakeTime || '07:30'} · Sleep {preferences.preferredSleepTime || '23:00'}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-[#8FA58F] font-medium">Optimal</span>
          </div>
        </div>
      </div>

      {/* 4. PRIVACY & DISCRETION */}
      <div className="space-y-3 pt-2">
        <h2 className="text-[11px] font-semibold tracking-wider text-[#716D70] uppercase">
          {language === 'id' ? 'Privasi & Kenyamanan' : 'Privacy & Discretion'}
        </h2>

        <div className="bg-white border border-[#EAE6DF] rounded-2xl divide-y divide-[#EAE6DF] shadow-xs">
          {/* Discreet Notifications */}
          <div className="p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-[#716D70]" />
              <div>
                <span className="font-medium text-[#29272A] block">Discreet Notifications</span>
                <span className="text-[11px] text-[#716D70]">
                  {discreetMode ? 'Neutral labels (safe to view in public)' : 'Detailed reminders'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setDiscreetMode(!discreetMode)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                discreetMode ? 'bg-[#B56F83]' : 'bg-[#D5CFC7]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  discreetMode ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Local-first Reassurance */}
          <div className="p-3.5 flex items-start gap-2.5 text-xs text-[#716D70]">
            <Shield className="w-4 h-4 text-[#8FA58F] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {language === 'id'
                ? 'Semua jadwal, obat, dan catatan kesehatan tersimpan di perangkatmu secara lokal. Lev tidak menjual atau mengkomersialkan data pribadimu.'
                : 'All schedule, medication, and cycle data is saved privately in your local browser storage. Lev never tracks or commercializes sensitive information.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
