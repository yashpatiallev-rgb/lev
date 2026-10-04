import React from 'react';
import { Plus, Feather } from 'lucide-react';
import { translations } from '../i18n/translations';

interface TopNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  language: 'en' | 'id';
  onToggleLanguage: () => void;
  onOpenAddModal: () => void;
  onToggleLowEnergy: () => void;
  isLowEnergyActive: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  onNavigate,
  language,
  onToggleLanguage,
  onOpenAddModal,
  onToggleLowEnergy,
  isLowEnergyActive,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 bg-[#F8F5F0]/90 backdrop-blur-md border-b border-[#EAE6DF] transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Wordmark: Human, calm, elegant */}
        <button
          onClick={() => onNavigate('today')}
          className="text-left group cursor-pointer focus-visible:outline-none flex items-baseline gap-2"
        >
          <span className="font-serif text-2xl font-medium tracking-tight text-[#29272A] transition-colors group-hover:text-[#B56F83]">
            Lev
          </span>
          <span className="hidden sm:inline-block text-[11px] font-medium text-[#716D70] tracking-wide">
            · {t.tagline}
          </span>
        </button>

        {/* Desktop Navigation Links: Exactly 4 clean destinations */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#716D70]">
          <button
            onClick={() => onNavigate('today')}
            className={`transition-colors hover:text-[#29272A] cursor-pointer ${
              currentView === 'today' ? 'text-[#B56F83] font-semibold border-b-2 border-[#B56F83] pb-0.5' : ''
            }`}
          >
            {t.nav.today}
          </button>
          <button
            onClick={() => onNavigate('plan')}
            className={`transition-colors hover:text-[#29272A] cursor-pointer ${
              currentView === 'plan' ? 'text-[#B56F83] font-semibold border-b-2 border-[#B56F83] pb-0.5' : ''
            }`}
          >
            {t.nav.plan}
          </button>
          <button
            onClick={() => onNavigate('health')}
            className={`transition-colors hover:text-[#29272A] cursor-pointer ${
              currentView === 'health' ? 'text-[#B56F83] font-semibold border-b-2 border-[#B56F83] pb-0.5' : ''
            }`}
          >
            {t.nav.health}
          </button>
          <button
            onClick={() => onNavigate('me')}
            className={`transition-colors hover:text-[#29272A] cursor-pointer ${
              currentView === 'me' ? 'text-[#B56F83] font-semibold border-b-2 border-[#B56F83] pb-0.5' : ''
            }`}
          >
            {t.nav.me}
          </button>
        </nav>

        {/* Primary Header Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Subtle low-energy mode indicator/toggle */}
          <button
            onClick={onToggleLowEnergy}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isLowEnergyActive
                ? 'bg-[#B56F83]/15 text-[#B56F83] ring-1 ring-[#B56F83]/30'
                : 'text-[#716D70] hover:text-[#29272A] hover:bg-[#F3E9E5]'
            }`}
            title={isLowEnergyActive ? 'Low-energy mode active' : 'Turn on low-energy mode'}
          >
            <Feather className="w-4 h-4 stroke-[1.8]" />
          </button>

          {/* Language Toggle: Clean, discreet badge */}
          <button
            onClick={onToggleLanguage}
            className="px-2.5 py-1 text-xs font-semibold text-[#716D70] hover:text-[#29272A] bg-[#F3E9E5]/60 hover:bg-[#F3E9E5] rounded-xl transition-colors cursor-pointer tracking-wider uppercase"
            title="Switch Language"
          >
            {language === 'en' ? 'ID' : 'EN'}
          </button>

          {/* Global Add Action: Muted Berry button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#B56F83] hover:bg-[#A25C70] rounded-xl shadow-xs transition-all duration-200 cursor-pointer hover:shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="hidden sm:inline font-medium">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
