import React, { useState, useEffect } from 'react';
import {
  Trees,
  Volume2,
  VolumeX,
  Wind,
  Sprout,
} from 'lucide-react';
import { translations } from '../i18n/translations';
import { WorldElement, WorldState } from '../types';
import { WORLD_ELEMENTS_CATALOG } from '../services/storage';
import { ambientSound } from '../services/ambientAudio';
import { SanctuaryLandscape } from './SanctuaryLandscape';

interface WorldViewProps {
  language: 'en' | 'id';
  worldState: WorldState;
  onSetAmbience: (ambience: 'auto' | 'morning' | 'afternoon' | 'dusk' | 'night') => void;
  onUnlockElement?: (elementId: string) => void;
  onBack?: () => void;
}

export const WorldView: React.FC<WorldViewProps> = ({
  language,
  worldState,
  onSetAmbience,
  onUnlockElement,
  onBack,
}) => {
  const t = translations[language].world;
  const [selectedElement, setSelectedElement] = useState<WorldElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [season, setSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring');
  const [sanctuaryNote, setSanctuaryNote] = useState('');
  const [plantedNotes, setPlantedNotes] = useState<{ [elemId: string]: string }>({});
  const [justPlanted, setJustPlanted] = useState(false);

  // Compute active lighting
  const hour = new Date().getHours();
  let effectiveAmbience: 'morning' | 'afternoon' | 'dusk' | 'night' = 'morning';
  if (worldState.activeAmbience === 'auto') {
    if (hour >= 5 && hour < 11) effectiveAmbience = 'morning';
    else if (hour >= 11 && hour < 17) effectiveAmbience = 'afternoon';
    else if (hour >= 17 && hour < 20) effectiveAmbience = 'dusk';
    else effectiveAmbience = 'night';
  } else {
    effectiveAmbience = worldState.activeAmbience;
  }

  // Ambience label
  const ambienceLabel = {
    morning: t.ambientDawn,
    afternoon: t.ambientNoon,
    dusk: t.ambientDusk,
    night: t.ambientNight,
  }[effectiveAmbience];

  // Toggle ambient soundscape
  const handleToggleAudio = () => {
    if (isAudioPlaying) {
      ambientSound.stop();
      setIsAudioPlaying(false);
    } else {
      ambientSound.start(effectiveAmbience);
      setIsAudioPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      ambientSound.stop();
    };
  }, []);

  const discoveredElements = WORLD_ELEMENTS_CATALOG.filter((el) =>
    worldState.discoveredIds.includes(el.id)
  );

  const handlePlantReflection = (elemId: string) => {
    if (!sanctuaryNote.trim()) return;
    setPlantedNotes((prev) => ({ ...prev, [elemId]: sanctuaryNote.trim() }));
    ambientSound.playSingleChime();
    setJustPlanted(true);
    setTimeout(() => {
      setJustPlanted(false);
      setSanctuaryNote('');
    }, 1800);
  };

  return (
    <div className="space-y-6 sm:space-y-7 pb-20 max-w-2xl mx-auto">
      {/* 1. Header with Audio & Chime Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="text-xs text-[#B56F83] hover:underline font-medium mb-1.5 flex items-center gap-1 cursor-pointer"
            >
              ← {language === 'id' ? 'Kembali' : 'Back'}
            </button>
          )}
          <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#29272A]">
            {t.title}
          </h1>
          <p className="text-xs font-medium text-[#716D70] mt-1 tracking-wide">
            {t.sub}
          </p>
        </div>

        {/* Ambient audio toggle & chime trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => ambientSound.playSingleChime()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#716D70] hover:text-[#29272A] bg-white border border-[#EAE6DF] rounded-xl transition-all shadow-xs cursor-pointer"
            title="Ring Sanctuary Chime"
          >
            <Wind className="w-3.5 h-3.5 text-[#B56F83]" />
            <span>Chime</span>
          </button>

          <button
            onClick={handleToggleAudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border transition-all shadow-xs cursor-pointer ${
              isAudioPlaying
                ? 'bg-[#F3E9E5] border-[#B56F83] text-[#B56F83] font-semibold'
                : 'bg-white border-[#EAE6DF] text-[#716D70] hover:border-[#B56F83]'
            }`}
          >
            {isAudioPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#B56F83] animate-pulse" />
                <span>Stream & Wind</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#716D70]" />
                <span>Play Soundscape</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Natural Mountain Valley Sanctuary Container */}
      <div className="relative bg-white border border-[#EAE6DF] rounded-3xl overflow-hidden shadow-xs">
        {/* Floating Top Controls: Season & Time-of-Day Bar */}
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
          {/* Active Ambience indicator & Season Selector */}
          <div className="pointer-events-auto flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-xl backdrop-blur-md bg-white/85 border border-[#EAE6DF] shadow-xs text-[#29272A]">
              {ambienceLabel}
            </span>

            {/* Season Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-white/85 backdrop-blur-md px-2 py-1 rounded-xl border border-[#EAE6DF] text-[11px] text-[#716D70]">
              {(['spring', 'summer', 'autumn', 'winter'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSeason(s)}
                  className={`px-2 py-0.5 rounded-lg capitalize transition-colors cursor-pointer ${
                    season === s ? 'bg-[#B56F83] text-white font-medium' : 'hover:text-[#29272A]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Time-of-day Lighting Switcher */}
          <div className="pointer-events-auto flex items-center gap-1 bg-white/85 backdrop-blur-md px-2 py-1 rounded-xl border border-[#EAE6DF] text-xs">
            {(['auto', 'morning', 'afternoon', 'dusk', 'night'] as const).map((amb) => (
              <button
                key={amb}
                onClick={() => onSetAmbience(amb)}
                className={`px-2 py-0.5 rounded-lg capitalize transition-colors cursor-pointer text-[11px] ${
                  worldState.activeAmbience === amb
                    ? 'bg-[#B56F83] text-white font-medium'
                    : 'text-[#716D70] hover:text-[#29272A]'
                }`}
              >
                {amb === 'auto' ? 'Auto' : amb}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Layered Parallax Mountain Valley Scenery */}
        <SanctuaryLandscape
          ambience={effectiveAmbience}
          season={season}
          discoveredElements={discoveredElements}
          selectedElementId={selectedElement?.id || null}
          plantedNotes={plantedNotes}
          onSelectElement={(elem) => setSelectedElement(elem)}
          language={language}
        />

        {/* 4. Selected Landmark Inspection & Thought Planting Panel */}
        {selectedElement ? (
          <div className="p-5 sm:p-6 border-t border-[#EAE6DF] bg-white space-y-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold tracking-wider text-[#B56F83] uppercase">
                  {selectedElement.category}
                </span>
                <h3 className="text-lg font-serif font-medium text-[#29272A] mt-0.5">
                  {language === 'id' ? selectedElement.nameId : selectedElement.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedElement(null)}
                className="text-xs text-[#716D70] hover:text-[#29272A] cursor-pointer"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-[#716D70] leading-relaxed">
              {language === 'id' ? selectedElement.storyId : selectedElement.story}
            </p>

            {/* Plant a Thought or Grounding Intention */}
            <div className="pt-2 border-t border-[#EAE6DF] space-y-2">
              <label className="block text-[11px] font-medium text-[#716D70]">
                {language === 'id' ? 'Tanamkan pemikiran atau niat di tempat ini:' : 'Leave a thought or grounding intention at this landmark:'}
              </label>

              {plantedNotes[selectedElement.id] ? (
                <div className="p-3 bg-[#F3E9E5]/60 border border-[#EAE6DF] rounded-xl text-xs text-[#29272A] flex items-start justify-between gap-3">
                  <p className="italic">"{plantedNotes[selectedElement.id]}"</p>
                  <button
                    onClick={() =>
                      setPlantedNotes((prev) => {
                        const copy = { ...prev };
                        delete copy[selectedElement.id];
                        return copy;
                      })
                    }
                    className="text-[11px] text-[#A09A9F] hover:text-[#B56F83] cursor-pointer shrink-0"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sanctuaryNote}
                    onChange={(e) => setSanctuaryNote(e.target.value)}
                    placeholder={
                      language === 'id'
                        ? 'Contoh: "Hari ini aku ingin bernapas lebih lambat"'
                        : 'e.g. "Today I give myself permission to slow down"'
                    }
                    className="flex-1 px-3 py-1.5 text-xs bg-[#F8F5F0] border border-[#EAE6DF] rounded-xl text-[#29272A] placeholder-[#A09A9F] focus:outline-none"
                  />
                  <button
                    onClick={() => handlePlantReflection(selectedElement.id)}
                    disabled={!sanctuaryNote.trim()}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#B56F83] hover:bg-[#A25C70] disabled:opacity-40 rounded-xl transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    {justPlanted ? 'Planted' : 'Plant thought'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty Landmark Guidance Bar */
          <div className="p-4 sm:p-5 border-t border-[#EAE6DF] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#716D70]">
            <div className="flex items-center gap-2.5">
              <Sprout className="w-4 h-4 text-[#8FA58F] shrink-0" />
              <span>
                {language === 'id'
                  ? `${discoveredElements.length} dari ${WORLD_ELEMENTS_CATALOG.length} elemen telah bertumbuh.`
                  : `${discoveredElements.length} of ${WORLD_ELEMENTS_CATALOG.length} natural landmarks discovered.`}
              </span>
            </div>
            <span className="text-[11px] text-[#A09A9F]">
              Tap any landmark to read its story or plant a thought.
            </span>
          </div>
        )}
      </div>

      {/* 5. Discovery Catalog: Progression Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
          <h2 className="text-xs font-semibold tracking-wider text-[#716D70] uppercase">
            {language === 'id' ? 'Koleksi Penemuan Alam' : 'Sanctuary Discoveries'}
          </h2>
          <span className="text-xs text-[#B56F83] font-medium">
            {discoveredElements.length} unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {WORLD_ELEMENTS_CATALOG.map((item) => {
            const isUnlocked = worldState.discoveredIds.includes(item.id);
            const isSelected = selectedElement?.id === item.id;

            return (
              <button
                key={item.id}
                onClick={() => isUnlocked && setSelectedElement(item)}
                disabled={!isUnlocked}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isUnlocked
                    ? isSelected
                      ? 'bg-[#F3E9E5] border-[#B56F83] shadow-xs cursor-pointer'
                      : 'bg-white border-[#EAE6DF] hover:border-[#B56F83]/60 cursor-pointer shadow-xs'
                    : 'bg-[#F8F5F0]/60 border-[#EAE6DF]/60 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-semibold text-[#716D70] tracking-wider">
                    {item.category}
                  </span>
                  {isUnlocked ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8FA58F]" />
                  ) : (
                    <span className="text-[10px] text-[#A09A9F]">?</span>
                  )}
                </div>

                <div className="font-serif text-xs font-medium text-[#29272A] line-clamp-1">
                  {isUnlocked ? (language === 'id' ? item.nameId : item.name) : 'Hidden landmark'}
                </div>

                <div className="text-[10px] text-[#716D70] mt-0.5 line-clamp-1">
                  {isUnlocked ? 'Discovered' : 'Awaits quiet days'}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
