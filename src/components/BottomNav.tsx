import React from 'react';
import { Clock, Calendar, Heart, User } from 'lucide-react';
import { translations } from '../i18n/translations';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  language: 'en' | 'id';
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate, language }) => {
  const t = translations[language].nav;

  // Maximum 4 primary destinations as requested
  const tabs = [
    { id: 'today', label: t.today, icon: Clock },
    { id: 'plan', label: t.plan, icon: Calendar },
    { id: 'health', label: t.health, icon: Heart },
    { id: 'me', label: t.me, icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#F8F5F0]/95 backdrop-blur-md border-t border-[#EAE6DF] pb-safe transition-colors">
      <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
                isActive ? 'text-[#B56F83]' : 'text-[#716D70] hover:text-[#29272A]'
              }`}
            >
              <Icon
                className={`w-[22px] h-[22px] transition-transform duration-200 ${
                  isActive ? 'stroke-[2.2] scale-105' : 'stroke-[1.6]'
                }`}
              />
              <span
                className={`text-[11px] tracking-tight mt-1 whitespace-nowrap transition-colors ${
                  isActive ? 'font-semibold text-[#B56F83]' : 'font-medium text-[#716D70]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
