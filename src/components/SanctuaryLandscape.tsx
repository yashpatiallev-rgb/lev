import React, { useState, useEffect, useRef } from 'react';
import { WorldElement } from '../types';
import { Sprout, Droplets, Sparkles, Flower2, Shield, Compass } from 'lucide-react';

interface SanctuaryLandscapeProps {
  ambience: 'morning' | 'afternoon' | 'dusk' | 'night';
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  discoveredElements: WorldElement[];
  selectedElementId: string | null;
  plantedNotes: { [id: string]: string };
  onSelectElement: (elem: WorldElement) => void;
  language: 'en' | 'id';
}

export const SanctuaryLandscape: React.FC<SanctuaryLandscapeProps> = ({
  ambience,
  season,
  discoveredElements,
  selectedElementId,
  plantedNotes,
  onSelectElement,
  language,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // IntersectionObserver to pause animations when out of viewport
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Subtle interactive parallax on mouse move (desktop)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setParallaxOffset({ x: x * 12, y: y * 8 });
  };

  const handleMouseLeave = () => {
    setParallaxOffset({ x: 0, y: 0 });
  };

  // Coherent lighting palette per diurnal state (Indie game restrained natural palette)
  const lighting = {
    morning: {
      skyGradient: 'linear-gradient(180deg, #CDE0D5 0%, #E3EBE4 45%, #F5EDE4 80%, #F8F5F0 100%)',
      skyHaze: 'rgba(255, 245, 230, 0.45)',
      sunColor: '#FFF2C6',
      sunGlow: 'radial-gradient(circle, rgba(255, 242, 198, 0.85) 0%, rgba(255, 230, 160, 0.35) 45%, transparent 70%)',
      mountainsFar: '#8BA698',
      mountainsFarHaze: 'rgba(205, 224, 213, 0.5)',
      mountainsMid: '#5C7C6B',
      mountainsNear: '#3A5B49',
      valleyFloor: '#2F4D3C',
      waterSurface: '#568A80',
      waterShimmer: '#BEE0D8',
      pineNeedleDeep: '#1F382A',
      pineNeedleMid: '#2B4A38',
      pineNeedleLight: '#436B53',
      woodTone: '#3D312A',
      ambientTint: 'rgba(255, 240, 215, 0.08)',
      isDay: true,
    },
    afternoon: {
      skyGradient: 'linear-gradient(180deg, #BDD7E5 0%, #D8E7F0 50%, #EDF3F7 80%, #F8F5F0 100%)',
      skyHaze: 'rgba(255, 255, 255, 0.35)',
      sunColor: '#FFFDEB',
      sunGlow: 'radial-gradient(circle, rgba(255, 253, 235, 0.9) 0%, rgba(255, 245, 195, 0.3) 45%, transparent 70%)',
      mountainsFar: '#7F9E93',
      mountainsFarHaze: 'rgba(189, 215, 229, 0.45)',
      mountainsMid: '#517464',
      mountainsNear: '#315442',
      valleyFloor: '#254434',
      waterSurface: '#49818C',
      waterShimmer: '#BCE4EC',
      pineNeedleDeep: '#183124',
      pineNeedleMid: '#244332',
      pineNeedleLight: '#396048',
      woodTone: '#382B24',
      ambientTint: 'transparent',
      isDay: true,
    },
    dusk: {
      skyGradient: 'linear-gradient(180deg, #5A4E66 0%, #876779 35%, #B87B7F 65%, #DF9D87 88%, #F3D2BA 100%)',
      skyHaze: 'rgba(235, 160, 140, 0.3)',
      sunColor: '#FFC499',
      sunGlow: 'radial-gradient(circle, rgba(255, 196, 153, 0.9) 0%, rgba(235, 130, 115, 0.4) 50%, transparent 75%)',
      mountainsFar: '#5D4A61',
      mountainsFarHaze: 'rgba(135, 103, 121, 0.4)',
      mountainsMid: '#48384C',
      mountainsNear: '#322536',
      valleyFloor: '#231826',
      waterSurface: '#544761',
      waterShimmer: '#DDB6C4',
      pineNeedleDeep: '#1E1423',
      pineNeedleMid: '#2C1D32',
      pineNeedleLight: '#3E2A46',
      woodTone: '#2A1F1B',
      ambientTint: 'rgba(220, 130, 110, 0.12)',
      isDay: false,
    },
    night: {
      skyGradient: 'linear-gradient(180deg, #0E121B 0%, #151C2A 40%, #1F283C 75%, #2B354C 100%)',
      skyHaze: 'rgba(40, 55, 85, 0.4)',
      sunColor: '#E6EFFD',
      sunGlow: 'radial-gradient(circle, rgba(230, 239, 253, 0.85) 0%, rgba(160, 190, 230, 0.25) 45%, transparent 70%)',
      mountainsFar: '#1A2130',
      mountainsFarHaze: 'rgba(21, 28, 42, 0.6)',
      mountainsMid: '#141A26',
      mountainsNear: '#0E131C',
      valleyFloor: '#090D13',
      waterSurface: '#192435',
      waterShimmer: '#6B8EBF',
      pineNeedleDeep: '#0A0E13',
      pineNeedleMid: '#0F151E',
      pineNeedleLight: '#182230',
      woodTone: '#16110E',
      ambientTint: 'rgba(15, 20, 35, 0.25)',
      isDay: false,
    },
  }[ambience];

  // Seasonal foliage accent
  const seasonalFoliage = {
    spring: { accent: '#E8B6C0', name: 'Sakura blossom' },
    summer: { accent: '#4E7E5A', name: 'Deep emerald canopy' },
    autumn: { accent: '#C8783E', name: 'Golden maple & ginkgo' },
    winter: { accent: '#CCD8D4', name: 'Snow dusted boughs' },
  }[season];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[420px] sm:h-[480px] rounded-3xl overflow-hidden select-none border border-[#EAE6DF] shadow-xs"
      style={{ background: lighting.skyGradient }}
    >
      {/* ============================================================ */}
      {/* LAYER 0: SKY, CELESTIAL BODY & CLOUD FORMATIONS             */}
      {/* ============================================================ */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${parallaxOffset.x * 0.15}px, ${parallaxOffset.y * 0.15}px, 0)`,
        }}
      >
        {/* Sun or Moon with Atmospheric Glow */}
        <div
          className="absolute top-10 left-16 sm:left-28 w-32 h-32 rounded-full pointer-events-none transition-all duration-1000 flex items-center justify-center"
          style={{ background: lighting.sunGlow }}
        >
          <div
            className="w-11 h-11 rounded-full shadow-sm"
            style={{ backgroundColor: lighting.sunColor }}
          />
        </div>

        {/* Night Stars */}
        {!lighting.isDay && isVisible && (
          <div className="absolute inset-0 pointer-events-none opacity-85">
            {[
              { top: '14%', left: '26%', size: 'w-1 h-1' },
              { top: '20%', left: '42%', size: 'w-1.5 h-1.5' },
              { top: '8%', left: '58%', size: 'w-1 h-1' },
              { top: '24%', left: '74%', size: 'w-1.5 h-1.5' },
              { top: '16%', left: '88%', size: 'w-1 h-1' },
              { top: '30%', left: '15%', size: 'w-1 h-1' },
              { top: '32%', left: '62%', size: 'w-1 h-1' },
            ].map((star, idx) => (
              <div
                key={idx}
                style={{ top: star.top, left: star.left }}
                className={`absolute ${star.size} bg-white rounded-full ${
                  prefersReducedMotion ? 'opacity-70' : 'animate-pulse'
                }`}
              />
            ))}
          </div>
        )}

        {/* Volumetric Cloud Banks */}
        <div
          className="absolute top-14 left-0 right-0 h-28 pointer-events-none opacity-40 blur-xs transition-opacity duration-1000"
          style={{
            background: `radial-gradient(ellipse 55% 40% at 50% 50%, ${lighting.skyHaze} 0%, transparent 80%)`,
            animation: !prefersReducedMotion && isVisible ? 'mist-drift 22s ease-in-out infinite' : 'none',
          }}
        />
      </div>

      {/* ============================================================ */}
      {/* LAYER 1: FAR ALPINE MOUNTAIN RANGES (Atmospheric perspective) */}
      {/* ============================================================ */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${parallaxOffset.x * 0.3}px, ${parallaxOffset.y * 0.3}px, 0)`,
        }}
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Distant Alpine Peaks */}
        <path
          d="M0 290 
             L110 240 L220 285 L360 210 L480 275 L620 185 L740 260 L890 195 L1020 270 L1130 225 L1200 255 
             L1200 600 L0 600 Z"
          fill={lighting.mountainsFar}
          opacity="0.6"
        />
        {/* Atmospheric Valley Haze Blanket */}
        <rect x="0" y="240" width="1200" height="120" fill={lighting.mountainsFarHaze} opacity="0.45" />
      </svg>

      {/* ============================================================ */}
      {/* LAYER 2: MID-GROUND CONIFEROUS RIDGELINES & CRESTING FORESTS */}
      {/* ============================================================ */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${parallaxOffset.x * 0.55}px, ${parallaxOffset.y * 0.55}px, 0)`,
        }}
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Mid-distance Rolling Mountain Ridge with Organic Treeline */}
        <path
          d="M0 350 
             C120 320 240 370 380 330 
             C520 290 660 360 800 320 
             C940 280 1080 340 1200 310 
             L1200 600 L0 600 Z"
          fill={lighting.mountainsMid}
          opacity="0.85"
        />

        {/* Dense Conifer Treeline Silhouette along the ridge crest */}
        <g fill={lighting.pineNeedleDeep} opacity="0.7">
          {[
            120, 140, 165, 185, 230, 255, 310, 335, 360, 420, 450, 480, 520, 560,
            620, 650, 690, 730, 780, 820, 870, 910, 950, 1010, 1050, 1100, 1140,
          ].map((x, i) => {
            const y = 310 + Math.sin(x * 0.008) * 25;
            const h = 18 + (i % 4) * 5;
            return (
              <polygon
                key={i}
                points={`${x},${y} ${x - 5},${y + h} ${x + 5},${y + h}`}
              />
            );
          })}
        </g>
      </svg>

      {/* ============================================================ */}
      {/* LAYER 3: VALLEY FLOOR, MEADOW BANKS & WINDING RIVER          */}
      {/* ============================================================ */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${parallaxOffset.x * 0.8}px, ${parallaxOffset.y * 0.8}px, 0)`,
        }}
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="riverGrad" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor={lighting.waterSurface} stopOpacity="0.8" />
            <stop offset="100%" stopColor={lighting.waterSurface} stopOpacity="1" />
          </linearGradient>

          <radialGradient id="toroGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF2B2" stopOpacity="1" />
            <stop offset="45%" stopColor="#FFAA33" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFAA33" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Fore-mountains & Green Foothill Slopes */}
        <path
          d="M0 410 C160 380 340 435 520 400 C720 365 920 425 1200 380 L1200 600 L0 600 Z"
          fill={lighting.mountainsNear}
        />

        {/* Valley Floor Meadow Ground */}
        <path
          d="M0 450 C220 425 460 470 680 440 C880 415 1060 460 1200 430 L1200 600 L0 600 Z"
          fill={lighting.valleyFloor}
        />

        {/* Winding Alpine River with Realistic Perspective */}
        <path
          d="M510 420 
             C540 435 530 480 490 510 
             C445 545 510 575 540 600 
             L310 600 
             C290 575 340 545 375 510 
             C425 465 440 435 430 420 Z"
          fill="url(#riverGrad)"
        />

        {/* Flowing Water Shimmers */}
        <g
          stroke={lighting.waterShimmer}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
          style={{
            animation: !prefersReducedMotion && isVisible ? 'water-gleam 4s ease-in-out infinite' : 'none',
          }}
        >
          <path d="M445 445 C465 442 485 447 505 444" />
          <path d="M400 485 C430 481 465 487 495 483" />
          <path d="M430 535 C465 530 500 537 535 532" strokeWidth="2.2" />
          <path d="M370 570 C410 564 455 572 495 566" />
        </g>

        {/* Riverbed Smooth Granite Stones */}
        <ellipse cx="460" cy="470" rx="16" ry="7.5" fill="#58635B" />
        <ellipse cx="458" cy="468" rx="13.5" ry="5.5" fill="#717D74" />
        <ellipse cx="420" cy="515" rx="22" ry="9.5" fill="#4B544E" />
        <ellipse cx="417" cy="513" rx="19" ry="7.5" fill="#636F66" />
        <ellipse cx="485" cy="555" rx="18" ry="8" fill="#444C46" />
        <ellipse cx="483" cy="553" rx="15" ry="6" fill="#5B655E" />

        {/* Water Lilies on Riverbank */}
        <ellipse cx="375" cy="545" rx="13" ry="5.5" fill="#2E4A37" />
        <circle cx="377" cy="543" r="3.5" fill="#FCE6EA" />
        <circle cx="377" cy="543" r="1.5" fill="#FCE59F" />

        {/* Architectural Sanctuary: Traditional Cedar Tea Pavilion (Right bank) */}
        <g transform="translate(860, 315)">
          {/* Stone Base */}
          <polygon points="15,110 165,110 175,125 5,125" fill="#4E5550" />
          
          {/* Cedar Pillars */}
          <rect x="32" y="55" width="6.5" height="55" fill={lighting.woodTone} />
          <rect x="75" y="55" width="5" height="55" fill={lighting.woodTone} />
          <rect x="115" y="55" width="5" height="55" fill={lighting.woodTone} />
          <rect x="148" y="55" width="6.5" height="55" fill={lighting.woodTone} />

          {/* Shoji Screen Walls with Warm Luminous Interior */}
          <rect
            x="38"
            y="65"
            width="37"
            height="42"
            fill="#FFF6DC"
            opacity={lighting.isDay ? 0.65 : 0.9}
          />
          <rect
            x="120"
            y="65"
            width="28"
            height="42"
            fill="#FFF6DC"
            opacity={lighting.isDay ? 0.65 : 0.9}
          />

          {/* Shoji Lattice Grids */}
          <line x1="56" y1="65" x2="56" y2="107" stroke={lighting.woodTone} strokeWidth="1" />
          <line x1="38" y1="86" x2="75" y2="86" stroke={lighting.woodTone} strokeWidth="1" />
          <line x1="134" y1="65" x2="134" y2="107" stroke={lighting.woodTone} strokeWidth="1" />
          <line x1="120" y1="86" x2="148" y2="86" stroke={lighting.woodTone} strokeWidth="1" />

          {/* Lower Sweeping Roof */}
          <path
            d="M10 60 C35 48 145 48 170 60 C160 47 135 46 90 42 C45 46 20 47 10 60 Z"
            fill={lighting.woodTone}
          />

          {/* Upper Tier Pagoda Roof with Curved Upturned Eaves */}
          <rect x="52" y="24" width="76" height="20" fill="#2E231D" />
          <path
            d="M25 28 C55 10 125 10 155 28 C140 14 115 6 90 4 C65 6 40 14 25 28 Z"
            fill="#221A15"
          />
          <polygon points="88,4 92,4 90,-4" fill="#C99E52" />
        </g>

        {/* Traditional Stone Lantern (Tōrō) on Left Riverbank */}
        <g transform="translate(290, 420) scale(0.95)">
          <ellipse cx="30" cy="85" rx="22" ry="7" fill="#3D453F" />
          <rect x="24" y="65" width="12" height="20" fill="#5E6861" />
          <polygon points="12,65 48,65 44,58 16,58" fill="#4E5650" />
          
          {/* Light Chamber with Soft Breathing Amber Lamp */}
          <rect x="18" y="42" width="24" height="16" fill="#3A403B" />
          <circle cx="30" cy="50" r="15" fill="url(#toroGlow)" />
          <rect x="23" y="45" width="14" height="10" fill="#FFDC73" />

          {/* Pagoda Roof */}
          <path
            d="M4 42 C14 35 46 35 56 42 C50 33 40 31 30 29 C20 31 10 33 4 42 Z"
            fill="#474F49"
          />
          <circle cx="30" cy="26" r="4" fill="#58625B" />
        </g>
      </svg>

      {/* ============================================================ */}
      {/* LAYER 4: IMMEDIATE FOREGROUND VEGETATION & GNARLED PINE      */}
      {/* ============================================================ */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${parallaxOffset.x * 1.1}px, ${parallaxOffset.y * 1.1}px, 0)`,
        }}
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Ancient Japanese Pine Bonsai (Left Foreground) */}
        <g transform="translate(70, 210)">
          {/* Trunk with Organic Wood Grain Curves */}
          <path
            d="M75 320 C70 240 95 210 82 150 C70 110 92 70 86 35 C80 5 100 -15 118 -32"
            stroke={lighting.woodTone}
            strokeWidth="20"
            strokeLinecap="round"
            fill="none"
          />
          {/* Cantilever Branch reaching over river */}
          <path
            d="M84 155 C125 148 160 168 200 155 C230 146 258 152 280 148"
            stroke={lighting.woodTone}
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M78 95 C48 85 22 90 0 85"
            stroke={lighting.woodTone}
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Multi-layered Cloud Canopy Needle Clusters */}
          {/* Canopy 1 */}
          <g transform="translate(118, -35)">
            <ellipse cx="0" cy="0" rx="42" ry="18" fill={lighting.pineNeedleDeep} />
            <ellipse cx="4" cy="-3" rx="35" ry="14" fill={lighting.pineNeedleMid} />
            <ellipse cx="6" cy="-5" rx="26" ry="9" fill={lighting.pineNeedleLight} />
          </g>
          {/* Canopy 2 */}
          <g transform="translate(85, 30)">
            <ellipse cx="0" cy="0" rx="48" ry="20" fill={lighting.pineNeedleDeep} />
            <ellipse cx="5" cy="-4" rx="40" ry="15" fill={lighting.pineNeedleMid} />
            <ellipse cx="7" cy="-6" rx="30" ry="10" fill={lighting.pineNeedleLight} />
          </g>
          {/* Canopy 3: Over the river */}
          <g transform="translate(200, 150)">
            <ellipse cx="0" cy="0" rx="54" ry="22" fill={lighting.pineNeedleDeep} />
            <ellipse cx="6" cy="-4" rx="44" ry="16" fill={lighting.pineNeedleMid} />
            <ellipse cx="8" cy="-6" rx="32" ry="11" fill={lighting.pineNeedleLight} />
          </g>
          {/* Canopy 4 */}
          <g transform="translate(275, 145)">
            <ellipse cx="0" cy="0" rx="44" ry="17" fill={lighting.pineNeedleDeep} />
            <ellipse cx="5" cy="-3" rx="35" ry="13" fill={lighting.pineNeedleMid} />
          </g>
          {/* Canopy 5: Left flank */}
          <g transform="translate(-8, 85)">
            <ellipse cx="0" cy="0" rx="42" ry="17" fill={lighting.pineNeedleDeep} />
            <ellipse cx="-4" cy="-3" rx="34" ry="13" fill={lighting.pineNeedleMid} />
          </g>
        </g>

        {/* Foreground Wild Highland Lavender & Botanical Ferns (Right foreground) */}
        <g transform="translate(680, 470)">
          {/* Deep green grass fronds */}
          <path d="M0 80 Q15 30 35 0 Q20 40 10 80 Z" fill="#2E4735" />
          <path d="M20 80 Q40 20 65 -15 Q45 35 35 80 Z" fill="#3A5943" />
          
          {/* Wild Lavender Stalks */}
          <line x1="38" y1="80" x2="56" y2="8" stroke="#3A5943" strokeWidth="2.5" />
          <ellipse cx="57" cy="22" rx="5" ry="7.5" fill="#7E6088" />
          <ellipse cx="58" cy="12" rx="4" ry="6.5" fill="#9577A0" />
          <ellipse cx="59" cy="4" rx="3.5" ry="5.5" fill="#AE91B8" />

          <line x1="70" y1="80" x2="85" y2="16" stroke="#3A5943" strokeWidth="2.5" />
          <ellipse cx="84" cy="30" rx="5" ry="7.5" fill="#7E6088" />
          <ellipse cx="85" cy="20" rx="4" ry="6.5" fill="#9577A0" />
          <ellipse cx="86" cy="11" rx="3.5" ry="5.5" fill="#AE91B8" />
        </g>
      </svg>

      {/* ============================================================ */}
      {/* LAYER 5: AMBIENT PARTICLES (Spores, Fireflies, Petals)       */}
      {/* ============================================================ */}
      {isVisible && !prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {/* Floating Fireflies (Dusk & Night) */}
          {!lighting.isDay &&
            [
              { left: '20%', top: '65%', delay: '0s' },
              { left: '44%', top: '75%', delay: '1.4s' },
              { left: '60%', top: '68%', delay: '2.8s' },
              { left: '78%', top: '58%', delay: '0.9s' },
              { left: '35%', top: '52%', delay: '2.1s' },
            ].map((f, i) => (
              <span
                key={i}
                style={{
                  left: f.left,
                  top: f.top,
                  animationDelay: f.delay,
                  animation: 'firefly-glow 4.2s ease-in-out infinite',
                }}
                className="absolute w-2 h-2 rounded-full bg-[#FFE885] shadow-[0_0_8px_#FFE885]"
              />
            ))}

          {/* Falling Seasonal Petals or Leaves (Spring & Autumn) */}
          {(season === 'spring' || season === 'autumn') &&
            [
              { left: '15%', top: '25%', delay: '0s' },
              { left: '28%', top: '35%', delay: '2.5s' },
              { left: '48%', top: '20%', delay: '5s' },
              { left: '72%', top: '30%', delay: '1.2s' },
              { left: '88%', top: '22%', delay: '3.8s' },
            ].map((p, i) => (
              <span
                key={i}
                style={{
                  left: p.left,
                  top: p.top,
                  backgroundColor: seasonalFoliage.accent,
                  animationDelay: p.delay,
                  animation: 'petal-fall 8s linear infinite',
                }}
                className="absolute w-2.5 h-1.5 rounded-full opacity-70 pointer-events-none"
              />
            ))}
        </div>
      )}

      {/* Global Atmospheric Tint Overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-1000 z-15"
        style={{ backgroundColor: lighting.ambientTint }}
      />

      {/* ============================================================ */}
      {/* LAYER 6: INTERACTIVE DISCOVERY LANDMARKS (Glassmorphic Pins) */}
      {/* ============================================================ */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {discoveredElements.map((elem) => {
          const isSelected = selectedElementId === elem.id;
          const hasNote = Boolean(plantedNotes[elem.id]);

          return (
            <button
              key={elem.id}
              onClick={() => onSelectElement(elem)}
              style={{
                left: `${elem.coordinates.x}%`,
                top: `${elem.coordinates.y}%`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-full backdrop-blur-md transition-all duration-300 pointer-events-auto cursor-pointer group ${
                isSelected
                  ? 'bg-white shadow-lg scale-125 z-30 ring-2 ring-[#B56F83]'
                  : 'bg-white/85 hover:bg-white hover:scale-115 shadow-xs z-10'
              }`}
              title={language === 'id' ? elem.nameId : elem.name}
            >
              <div className="w-4 h-4 flex items-center justify-center text-[#29272A]">
                {elem.category === 'tree' || elem.category === 'fern' ? (
                  <Sprout className="w-3.5 h-3.5 text-[#3A5B44]" />
                ) : elem.category === 'water' ? (
                  <Droplets className="w-3.5 h-3.5 text-[#4A7A85]" />
                ) : elem.category === 'creature' ? (
                  <Sparkles className="w-3.5 h-3.5 text-[#B56F83]" />
                ) : elem.category === 'flower' ? (
                  <Flower2 className="w-3.5 h-3.5 text-[#B56F83]" />
                ) : elem.category === 'stone' ? (
                  <Shield className="w-3.5 h-3.5 text-[#5F6862]" />
                ) : (
                  <Compass className="w-3.5 h-3.5 text-[#3E5545]" />
                )}
              </div>

              {/* Personal Reflection Stone Beacon */}
              {hasNote && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#B56F83] rounded-full border border-white" />
              )}

              {/* Refined Hover label */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap bg-[#29272A] text-white text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-md z-40 pointer-events-none">
                {language === 'id' ? elem.nameId : elem.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
