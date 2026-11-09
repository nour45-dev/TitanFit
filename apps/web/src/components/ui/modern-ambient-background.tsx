'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Activity, Apple, Dumbbell, Flame, Heart, Timer, Zap } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Shared sports-themed SVG building blocks                           */
/* ------------------------------------------------------------------ */

/** Olympic weight plate: rim, grip ring, 5 lightening holes and centre bore. */
export function WeightPlate({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" aria-hidden="true">
      <circle cx="100" cy="100" r="96" stroke="currentColor" strokeWidth="3" />
      <circle cx="100" cy="100" r="84" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 5" />
      <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="2" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <circle
          key={deg}
          cx={100 + 40 * Math.cos((deg * Math.PI) / 180)}
          cy={100 + 40 * Math.sin((deg * Math.PI) / 180)}
          r="7"
          stroke="currentColor"
          strokeWidth="2"
        />
      ))}
      <circle cx="100" cy="100" r="13" stroke="currentColor" strokeWidth="3" />
      <text x="100" y="26" textAnchor="middle" fontSize="9" fontWeight="800" fill="currentColor" letterSpacing="3">
        20 KG
      </text>
    </svg>
  );
}

/** Apple-Fitness-style concentric activity rings that continuously "fill". */
export function ActivityRings({ className = '', reduced = false }: { className?: string; reduced?: boolean }) {
  const rings = [
    { r: 84, color: '#f43f5e', delay: 0 },
    { r: 62, color: '#22c55e', delay: 0.4 },
    { r: 40, color: '#06b6d4', delay: 0.8 },
  ];
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" aria-hidden="true">
      {rings.map(({ r, color, delay }) => {
        const c = 2 * Math.PI * r;
        return (
          <g key={r} transform="rotate(-90 100 100)">
            <circle cx="100" cy="100" r={r} stroke={color} strokeOpacity="0.15" strokeWidth="14" />
            <motion.circle
              cx="100"
              cy="100"
              r={r}
              stroke={color}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={c}
              initial={{ strokeDashoffset: c }}
              animate={reduced ? { strokeDashoffset: c * 0.25 } : { strokeDashoffset: [c, c * 0.18, c * 0.18, c] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay }}
            />
          </g>
        );
      })}
    </svg>
  );
}

/** ECG / heartbeat line that draws itself in a loop. */
export function HeartbeatLine({ className = '', reduced = false }: { className?: string; reduced?: boolean }) {
  const d =
    'M0 60 H120 L140 60 L152 18 L168 104 L184 36 L196 60 H340 L360 60 L372 22 L388 100 L404 40 L416 60 H560 L580 60 L592 14 L608 106 L624 34 L636 60 H800';
  return (
    <svg viewBox="0 0 800 120" preserveAspectRatio="none" className={className} fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeOpacity="0.18" strokeWidth="2" strokeLinejoin="round" />
      <motion.path
        d={d}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={reduced ? { pathLength: 1, opacity: 0.8 } : { pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.7, 1] }}
      />
    </svg>
  );
}

const FLOATERS = [
  { Icon: Dumbbell, left: '6%', size: 34, dur: 22, delay: 0, color: 'text-amber-500' },
  { Icon: Flame, left: '19%', size: 28, dur: 26, delay: 4, color: 'text-orange-500' },
  { Icon: Heart, left: '33%', size: 26, dur: 24, delay: 9, color: 'text-rose-500' },
  { Icon: Apple, left: '48%', size: 30, dur: 28, delay: 2, color: 'text-emerald-500' },
  { Icon: Timer, left: '62%', size: 26, dur: 25, delay: 7, color: 'text-sky-500' },
  { Icon: Zap, left: '76%', size: 28, dur: 23, delay: 11, color: 'text-yellow-500' },
  { Icon: Activity, left: '90%', size: 30, dur: 27, delay: 5, color: 'text-fuchsia-500' },
];

/* ------------------------------------------------------------------ */
/*  Page-wide fixed background (sits BEHIND all content)               */
/* ------------------------------------------------------------------ */

export const ModernAmbientBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
  const reduced = !!useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none ${className}`}
    >
      {/* Base wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/70 via-white to-slate-50 dark:from-[#0b1020] dark:via-[#090D16] dark:to-[#070a12]" />

      {/* Diagonal speed streaks */}
      <div
        className="absolute inset-0 opacity-[0.5] dark:opacity-[0.35]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, transparent 0 46px, rgba(245,158,11,0.06) 46px 48px)',
        }}
      />

      {/* Blueprint dots */}
      <div
        className="absolute inset-0 text-slate-400 opacity-[0.25] dark:text-slate-500 dark:opacity-[0.18] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_20%,#000_40%,transparent_100%)]"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1.2px)',
          backgroundSize: '26px 26px',
        }}
      />

      {/* Glow orbs */}
      <motion.div
        animate={reduced ? undefined : { x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-40 start-[10%] h-[460px] w-[460px] rounded-full bg-amber-400/25 blur-[110px] dark:bg-amber-500/15"
      />
      <motion.div
        animate={reduced ? undefined : { x: [0, -50, 30, 0], y: [0, 40, -20, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 -end-32 h-[520px] w-[520px] rounded-full bg-emerald-400/20 blur-[120px] dark:bg-emerald-500/12"
      />
      <motion.div
        animate={reduced ? undefined : { x: [0, 30, -30, 0], y: [0, -40, 25, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-40 start-1/4 h-[480px] w-[480px] rounded-full bg-sky-400/20 blur-[120px] dark:bg-sky-500/12"
      />

      {/* Rotating weight plates */}
      <motion.div
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-24 -end-24 hidden text-amber-500/25 dark:text-amber-400/15 md:block"
      >
        <WeightPlate className="h-[360px] w-[360px]" />
      </motion.div>
      <motion.div
        animate={reduced ? undefined : { rotate: -360 }}
        transition={{ duration: 110, repeat: Infinity, ease: 'linear' }}
        className="absolute -bottom-32 -start-32 hidden text-slate-500/20 dark:text-slate-400/12 md:block"
      >
        <WeightPlate className="h-[440px] w-[440px]" />
      </motion.div>

      {/* Activity rings */}
      <div className="absolute bottom-24 end-10 hidden opacity-70 dark:opacity-60 xl:block">
        <ActivityRings reduced={reduced} className="h-36 w-36" />
      </div>

      {/* Heartbeat strip along the bottom */}
      <HeartbeatLine
        reduced={reduced}
        className="absolute inset-x-0 bottom-6 h-24 w-full text-rose-500 opacity-60 dark:opacity-50"
      />

      {/* Rising sport icons */}
      {!reduced &&
        FLOATERS.map(({ Icon, left, size, dur, delay, color }) => (
          <motion.div
            key={left}
            initial={{ y: '105vh', opacity: 0, rotate: -15 }}
            animate={{ y: '-15vh', opacity: [0, 0.5, 0.5, 0], rotate: 25 }}
            transition={{ duration: dur, repeat: Infinity, ease: 'linear', delay }}
            style={{ left }}
            className={`absolute ${color}`}
          >
            <Icon style={{ width: size, height: size }} strokeWidth={1.6} />
          </motion.div>
        ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Hero-local backdrop (inside the hero card, behind its content)     */
/* ------------------------------------------------------------------ */

export const SportsHeroBackdrop: React.FC = () => {
  const reduced = !!useReducedMotion();
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(245,158,11,0.16),transparent_45%),radial-gradient(circle_at_10%_90%,rgba(16,185,129,0.12),transparent_45%)]" />
      <motion.div
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-20 -start-20 text-amber-500/20 dark:text-amber-400/15"
      >
        <WeightPlate className="h-72 w-72" />
      </motion.div>
      <div className="absolute -bottom-6 end-4 opacity-60">
        <ActivityRings reduced={reduced} className="h-40 w-40" />
      </div>
      <HeartbeatLine
        reduced={reduced}
        className="absolute inset-x-0 top-1/2 h-28 w-full -translate-y-1/2 text-rose-500 opacity-30"
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Scrolling sports ticker                                            */
/* ------------------------------------------------------------------ */

const TICKER_AR = ['PUSH', 'PULL', 'LEGS', 'كارديو', 'تغذية', 'استشفاء', 'قوة', 'تحمّل', 'ماكروز', 'التزام'];
const TICKER_EN = ['PUSH', 'PULL', 'LEGS', 'CARDIO', 'NUTRITION', 'RECOVERY', 'STRENGTH', 'ENDURANCE', 'MACROS', 'CONSISTENCY'];

export const SportsTicker: React.FC<{ isAr: boolean }> = ({ isAr }) => {
  const words = isAr ? TICKER_AR : TICKER_EN;
  const row = [...words, ...words];
  return (
    <div
      aria-hidden="true"
      dir="ltr"
      className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-slate-950 py-2.5 shadow-lg [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
    >
      <div className="tf-marquee flex w-max items-center gap-8 whitespace-nowrap">
        {[...row, ...row].map((w, i) => (
          <span key={`${w}-${i}`} className="flex items-center gap-8 text-sm font-black tracking-[0.25em] text-amber-300">
            {w}
            <Dumbbell className="h-4 w-4 text-amber-500" />
          </span>
        ))}
      </div>
    </div>
  );
};
