'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Timer,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Dumbbell,
  Flame,
} from 'lucide-react';

export type ExerciseMotionType =
  | 'INCLINE_PRESS'
  | 'BENCH_PRESS'
  | 'CABLE_FLY'
  | 'LATERAL_RAISE'
  | 'TRICEPS_PUSHDOWN'
  | 'BICEPS_CURL'
  | 'LAT_PULLDOWN'
  | 'BARBELL_ROW'
  | 'BARBELL_SQUAT'
  | 'ROMANIAN_DEADLIFT';

export interface ExerciseMotionItem {
  id: string;
  motionType: ExerciseMotionType;
  nameAr: string;
  nameEn: string;
  targetMuscleAr: string;
  targetMuscleEn: string;
  secondaryMuscleAr?: string;
  secondaryMuscleEn?: string;
  sets: number;
  reps: string;
  restSec: number;
  cuesAr: string;
  cuesEn: string;
  tempo?: string;
  difficultyAr?: string;
  difficultyEn?: string;
}

/**
 * Animated SVG Vector Engine demonstrating precise human biomechanical trajectory
 */
function ExerciseMotionVisualCanvas({
  motionType,
  isPlaying,
  speedMultiplier = 1,
}: {
  motionType: ExerciseMotionType;
  isPlaying: boolean;
  speedMultiplier?: number;
}) {
  const baseDuration = 3.5 / speedMultiplier;

  // Render dedicated vector motion illustration per exercise
  switch (motionType) {
    case 'INCLINE_PRESS':
    case 'BENCH_PRESS':
      return (
        <svg viewBox="0 0 240 180" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="chestGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Bench Frame */}
          <rect x="40" y="140" width="160" height="8" rx="4" fill="#334155" />
          <path d="M 50 140 L 40 165" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
          <path d="M 190 140 L 200 165" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
          <rect x="55" y="105" width="130" height="12" rx="4" fill="#1E293B" transform="rotate(-15 55 105)" />

          {/* Torso & Head */}
          <ellipse cx="70" cy="85" rx="12" ry="12" fill="#E2E8F0" />
          <rect x="78" y="85" width="70" height="20" rx="8" fill="#3B82F6" transform="rotate(-15 78 85)" />

          {/* Target Pectorals Activation Pulse */}
          <motion.circle
            cx="115"
            cy="84"
            r="16"
            fill="url(#chestGlow)"
            animate={
              isPlaying
                ? {
                    scale: [1, 1.45, 1],
                    opacity: [0.3, 0.9, 0.3],
                  }
                : {}
            }
            transition={{
              duration: baseDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Arms & Dumbbell Movement */}
          <motion.g
            animate={
              isPlaying
                ? {
                    y: [0, -32, 0],
                    x: [0, -6, 0],
                  }
                : {}
            }
            transition={{
              duration: baseDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Forearm & Hand */}
            <path d="M 105 84 L 115 55 L 125 50" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            {/* Dumbbell / Barbell Bar */}
            <line x1="100" y1="46" x2="140" y2="46" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
            {/* Weight Plates */}
            <rect x="94" y="36" width="8" height="20" rx="3" fill="url(#goldGradient)" />
            <rect x="138" y="36" width="8" height="20" rx="3" fill="url(#goldGradient)" />
          </motion.g>

          {/* Concentric / Eccentric Trajectory Indicator Path */}
          <path
            d="M 120 78 L 115 46"
            stroke="#D97706"
            strokeWidth="2"
            strokeDasharray="3 3"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      );

    case 'BARBELL_SQUAT':
      return (
        <svg viewBox="0 0 240 180" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <linearGradient id="squatGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="quadGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Gym Floor Ground Line */}
          <line x1="20" y1="160" x2="220" y2="160" stroke="#334155" strokeWidth="4" strokeLinecap="round" />

          {/* Feet */}
          <ellipse cx="100" cy="158" rx="10" ry="4" fill="#64748B" />
          <ellipse cx="140" cy="158" rx="10" ry="4" fill="#64748B" />

          {/* Dynamic Lifter Body: Squatting Down & Rising */}
          <motion.g
            animate={
              isPlaying
                ? {
                    y: [0, 26, 0],
                  }
                : {}
            }
            transition={{
              duration: baseDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Shins to Knees */}
            <line x1="100" y1="156" x2="94" y2="118" stroke="#94A3B8" strokeWidth="7" strokeLinecap="round" />
            <line x1="140" y1="156" x2="146" y2="118" stroke="#94A3B8" strokeWidth="7" strokeLinecap="round" />

            {/* Thighs / Quadriceps with Muscle Glow */}
            <line x1="94" y1="118" x2="110" y2="88" stroke="#38BDF8" strokeWidth="8" strokeLinecap="round" />
            <line x1="146" y1="118" x2="130" y2="88" stroke="#38BDF8" strokeWidth="8" strokeLinecap="round" />

            {/* Quadriceps Contraction Pulse */}
            <motion.circle
              cx="120"
              cy="104"
              r="18"
              fill="url(#quadGlow)"
              animate={
                isPlaying
                  ? {
                      scale: [1, 1.4, 1],
                      opacity: [0.2, 0.85, 0.2],
                    }
                  : {}
              }
              transition={{
                duration: baseDuration,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Torso */}
            <path d="M 110 88 L 130 88 L 124 50 L 116 50 Z" fill="#1E293B" stroke="#475569" strokeWidth="2" />
            {/* Head */}
            <circle cx="120" cy="38" r="10" fill="#E2E8F0" />

            {/* Barbell on Traps */}
            <line x1="45" y1="52" x2="195" y2="52" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" />
            {/* Plates */}
            <rect x="55" y="32" width="10" height="40" rx="3" fill="url(#squatGold)" />
            <rect x="175" y="32" width="10" height="40" rx="3" fill="url(#squatGold)" />
          </motion.g>

          {/* Depth Guidance Dot */}
          <circle cx="120" cy="115" r="3" fill="#D97706" opacity="0.7" />
        </svg>
      );

    case 'ROMANIAN_DEADLIFT':
      return (
        <svg viewBox="0 0 240 180" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <linearGradient id="rdlPlates" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="hamGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Floor */}
          <line x1="20" y1="160" x2="220" y2="160" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="110" cy="158" rx="14" ry="4" fill="#64748B" />

          {/* Legs with slight knee bend */}
          <path d="M 110 156 L 105 115 L 95 85" stroke="#94A3B8" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

          {/* Hamstrings & Glutes Contraction Glow */}
          <motion.circle
            cx="98"
            cy="100"
            r="16"
            fill="url(#hamGlow)"
            animate={
              isPlaying
                ? {
                    scale: [1, 1.45, 1],
                    opacity: [0.3, 0.9, 0.3],
                  }
                : {}
            }
            transition={{
              duration: baseDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Hip Hinge Torso & Barbell */}
          <motion.g
            animate={
              isPlaying
                ? {
                    rotate: [0, 48, 0],
                  }
                : {}
            }
            style={{ transformOrigin: '95px 85px' }}
            transition={{
              duration: baseDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Flat Neutral Spine Torso */}
            <line x1="95" y1="85" x2="95" y2="35" stroke="#38BDF8" strokeWidth="10" strokeLinecap="round" />
            {/* Head */}
            <circle cx="95" cy="22" r="9" fill="#E2E8F0" />

            {/* Hanging Arms */}
            <line x1="95" y1="42" x2="115" y2="82" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
            {/* Barbell Sliding Along Thighs/Shins */}
            <line x1="85" y1="82" x2="145" y2="82" stroke="#64748B" strokeWidth="5" strokeLinecap="round" />
            <rect x="80" y="66" width="8" height="32" rx="2" fill="url(#rdlPlates)" />
            <rect x="142" y="66" width="8" height="32" rx="2" fill="url(#rdlPlates)" />
          </motion.g>
        </svg>
      );

    case 'LAT_PULLDOWN':
    case 'BARBELL_ROW':
      return (
        <svg viewBox="0 0 240 180" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <linearGradient id="backGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Cable Pulldown Tower Frame */}
          <path d="M 60 160 L 60 25 L 180 25 L 180 160" stroke="#334155" strokeWidth="4" fill="none" />
          <circle cx="120" cy="25" r="6" fill="#64748B" />

          {/* Seated Bench */}
          <rect x="90" y="115" width="60" height="10" rx="3" fill="#1E293B" />
          <line x1="120" y1="125" x2="120" y2="160" stroke="#475569" strokeWidth="5" />

          {/* Lifter Body Back View */}
          <circle cx="120" cy="72" r="11" fill="#E2E8F0" />
          <path d="M 104 88 L 136 88 L 130 120 L 110 120 Z" fill="#1E293B" stroke="#475569" strokeWidth="2" />

          {/* Latissimus Dorsi Muscle Expansion Glow */}
          <motion.ellipse
            cx="120"
            cy="98"
            rx="18"
            ry="12"
            fill="url(#backGlow)"
            animate={
              isPlaying
                ? {
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0.9, 0.3],
                  }
                : {}
            }
            transition={{
              duration: baseDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Cable & Lat Bar Pulling Down to Clavicle */}
          <motion.g
            animate={
              isPlaying
                ? {
                    y: [0, 28, 0],
                  }
                : {}
            }
            transition={{
              duration: baseDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Cable Wire */}
            <line x1="120" y1="25" x2="120" y2="52" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="2 2" />
            {/* Curved Wide Grip Bar */}
            <path d="M 70 60 Q 120 52 170 60" stroke="#D97706" strokeWidth="5" fill="none" strokeLinecap="round" />
            {/* Arms Holding Bar */}
            <path d="M 106 88 L 85 64" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
            <path d="M 134 88 L 155 64" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
          </motion.g>
        </svg>
      );

    case 'LATERAL_RAISE':
      return (
        <svg viewBox="0 0 240 180" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <linearGradient id="deltGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Floor & Feet */}
          <line x1="40" y1="160" x2="200" y2="160" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          <line x1="110" y1="110" x2="108" y2="158" stroke="#64748B" strokeWidth="7" strokeLinecap="round" />
          <line x1="130" y1="110" x2="132" y2="158" stroke="#64748B" strokeWidth="7" strokeLinecap="round" />

          {/* Torso & Head */}
          <circle cx="120" cy="50" r="10" fill="#E2E8F0" />
          <path d="M 106 65 L 134 65 L 128 110 L 112 110 Z" fill="#1E293B" stroke="#475569" strokeWidth="2" />

          {/* Side Delts Glow */}
          <motion.circle
            cx="100"
            cy="68"
            r="10"
            fill="url(#deltGlow)"
            animate={
              isPlaying
                ? {
                    scale: [1, 1.45, 1],
                    opacity: [0.3, 0.9, 0.3],
                  }
                : {}
            }
            transition={{
              duration: baseDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.circle
            cx="140"
            cy="68"
            r="10"
            fill="url(#deltGlow)"
            animate={
              isPlaying
                ? {
                    scale: [1, 1.45, 1],
                    opacity: [0.3, 0.9, 0.3],
                  }
                : {}
            }
            transition={{
              duration: baseDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Left Arm Lifting Outward */}
          <motion.g
            animate={
              isPlaying
                ? {
                    rotate: [0, -68, 0],
                  }
                : {}
            }
            style={{ transformOrigin: '106px 66px' }}
            transition={{
              duration: baseDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <line x1="106" y1="66" x2="88" y2="110" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
            <rect x="80" y="105" width="16" height="8" rx="2" fill="#D97706" />
          </motion.g>

          {/* Right Arm Lifting Outward */}
          <motion.g
            animate={
              isPlaying
                ? {
                    rotate: [0, 68, 0],
                  }
                : {}
            }
            style={{ transformOrigin: '134px 66px' }}
            transition={{
              duration: baseDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <line x1="134" y1="66" x2="152" y2="110" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
            <rect x="144" y="105" width="16" height="8" rx="2" fill="#D97706" />
          </motion.g>
        </svg>
      );

    case 'TRICEPS_PUSHDOWN':
    case 'BICEPS_CURL':
    default:
      return (
        <svg viewBox="0 0 240 180" className="w-full h-full drop-shadow-md select-none">
          <defs>
            <linearGradient id="armGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <line x1="40" y1="160" x2="200" y2="160" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          <circle cx="110" cy="50" r="10" fill="#E2E8F0" />
          <path d="M 98 65 L 122 65 L 118 120 L 102 120 Z" fill="#1E293B" stroke="#475569" strokeWidth="2" />
          <line x1="106" y1="120" x2="104" y2="158" stroke="#64748B" strokeWidth="7" strokeLinecap="round" />
          <line x1="116" y1="120" x2="118" y2="158" stroke="#64748B" strokeWidth="7" strokeLinecap="round" />

          {/* Cable Rope Above */}
          <line x1="135" y1="20" x2="135" y2="60" stroke="#CBD5E1" strokeWidth="3" strokeDasharray="2 2" />

          {/* Pinned Upper Arm */}
          <line x1="118" y1="68" x2="128" y2="95" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />

          {/* Forearm Hinge Flexing/Extending */}
          <motion.g
            animate={
              isPlaying
                ? {
                    rotate: [0, 60, 0],
                  }
                : {}
            }
            style={{ transformOrigin: '128px 95px' }}
            transition={{
              duration: baseDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <line x1="128" y1="95" x2="138" y2="132" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round" />
            {/* Grip Handle */}
            <circle cx="138" cy="132" r="5" fill="#D97706" />
          </motion.g>

          {/* Muscle Pulse */}
          <motion.circle
            cx="126"
            cy="86"
            r="12"
            fill="url(#armGlow)"
            animate={
              isPlaying
                ? {
                    scale: [1, 1.4, 1],
                    opacity: [0.2, 0.8, 0.2],
                  }
                : {}
            }
            transition={{
              duration: baseDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </svg>
      );
  }
}

export function ExerciseMotionCard({
  exercise,
  isAr: isArProp,
  locale = 'ar',
  doneSets = 0,
  onCompleteSet,
}: {
  exercise: ExerciseMotionItem;
  isAr?: boolean;
  locale?: string;
  doneSets?: number;
  onCompleteSet?: () => void;
}) {
  const isAr = isArProp !== undefined ? isArProp : locale === 'ar';
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [activePhase, setActivePhase] = useState<'ECCENTRIC' | 'HOLD' | 'CONCENTRIC'>('ECCENTRIC');

  const isFullyDone = doneSets >= exercise.sets;

  // Real-time repetition phase timer loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActivePhase((prev) => {
        if (prev === 'ECCENTRIC') return 'HOLD';
        if (prev === 'HOLD') return 'CONCENTRIC';
        return 'ECCENTRIC';
      });
    }, 1100 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border transition shadow-sm ${
        isFullyDone
          ? 'border-emerald-500/50 bg-emerald-500/5 dark:border-emerald-500/40 dark:bg-emerald-500/10'
          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#121623] dark:hover:border-slate-700'
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5">
        {/* Visual Animation Column */}
        <div className="relative flex flex-col items-center justify-between overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 dark:border-slate-800 dark:from-slate-900/90 dark:to-slate-950 p-3 md:col-span-5">
          {/* Top Pill Controls */}
          <div className="flex w-full items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#D4AF37]/20 px-2.5 py-0.5 text-[11px] font-black text-amber-800 dark:text-[#F3E5AB]">
              <Sparkles className="h-3 w-3 text-[#D4AF37]" />
              {isAr ? 'حركة ثلاثية الأبعاد' : '3D Motion Biomechanics'}
            </span>
            <div className="flex items-center gap-1">
              {[1, 0.5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-extrabold transition ${
                    speed === s
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="ms-1 rounded-full p-1 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
                title={isPlaying ? 'إيقاف الحركة' : 'تشغيل الحركة'}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* SVG Vector Motion Canvas */}
          <div className="my-2 h-36 w-full max-w-[200px]">
            <ExerciseMotionVisualCanvas
              motionType={exercise.motionType}
              isPlaying={isPlaying}
              speedMultiplier={speed}
            />
          </div>

          {/* Live Rhythm & Phase Indicator */}
          <div className="w-full rounded-xl border border-slate-200 bg-white/80 p-2 text-center text-xs dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between text-[11px] font-extrabold">
              <span
                className={`transition ${
                  activePhase === 'ECCENTRIC'
                    ? 'text-sky-600 dark:text-sky-400 font-black'
                    : 'text-slate-400'
                }`}
              >
                {isAr ? '١. إنزال بطيء (3s)' : '1. Eccentric (3s)'}
              </span>
              <span
                className={`transition ${
                  activePhase === 'HOLD'
                    ? 'text-amber-600 dark:text-amber-400 font-black'
                    : 'text-slate-400'
                }`}
              >
                {isAr ? '٢. ثبات (1s)' : '2. Hold (1s)'}
              </span>
              <span
                className={`transition ${
                  activePhase === 'CONCENTRIC'
                    ? 'text-emerald-600 dark:text-emerald-400 font-black'
                    : 'text-slate-400'
                }`}
              >
                {isAr ? '٣. انقباض (1s)' : '3. Concentric (1s)'}
              </span>
            </div>
          </div>
        </div>

        {/* Content & Form Instruction Column */}
        <div className="flex flex-col justify-between space-y-3 md:col-span-7">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {isAr ? exercise.nameAr : exercise.nameEn}
              </h3>
              {isFullyDone && (
                <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-black text-white">
                  {isAr ? 'أنهيت التمرين ✓' : 'Completed ✓'}
                </span>
              )}
            </div>

            {/* Target Muscle Badges */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="rounded-lg bg-amber-500/15 px-2.5 py-1 font-bold text-amber-800 dark:text-amber-300">
                {isAr ? 'العضلة الأساسية: ' : 'Target: '}
                <strong className="font-black">{isAr ? exercise.targetMuscleAr : exercise.targetMuscleEn}</strong>
              </span>
              {exercise.secondaryMuscleAr && (
                <span className="rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-1 font-bold">
                  {isAr ? 'المساعدة: ' : 'Secondary: '}
                  {isAr ? exercise.secondaryMuscleAr : exercise.secondaryMuscleEn}
                </span>
              )}
            </div>

            {/* Form Cues / Instructions */}
            <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800/80 dark:bg-slate-900/50">
              <p className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{isAr ? 'تعليمات الأداء السليم وتفادي الإصابات:' : 'Pro Execution Form Cue:'}</span>
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">
                {isAr ? exercise.cuesAr : exercise.cuesEn}
              </p>
            </div>
          </div>

          {/* Sets, Reps & Rest Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
              <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-2xs dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {exercise.sets} {isAr ? 'مجموعات' : 'Sets'} × {exercise.reps}
              </span>
              <span className="rounded-xl bg-amber-500/15 px-3 py-1.5 text-amber-800 dark:text-amber-300">
                <Timer className="inline h-3.5 w-3.5 me-1 text-[#D4AF37]" />
                {isAr ? `راحة: ${exercise.restSec} ثانية` : `Rest: ${exercise.restSec}s`}
              </span>
            </div>

            {/* Set Progression Circles & Complete Set Button */}
            {onCompleteSet && (
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {Array.from({ length: exercise.sets }).map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-2.5 w-5 rounded-full transition ${
                        idx < doneSets ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={onCompleteSet}
                  className={`rounded-xl px-4 py-2 text-xs font-extrabold transition shadow-xs ${
                    isFullyDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-950 dark:bg-slate-800 dark:hover:bg-amber-500'
                  }`}
                >
                  {isFullyDone
                    ? isAr
                      ? `تم بالكامل (${doneSets}/${exercise.sets})`
                      : `Completed (${doneSets}/${exercise.sets})`
                    : isAr
                      ? `+ أتممت مجموعة (${doneSets}/${exercise.sets})`
                      : `+ Complete Set (${doneSets}/${exercise.sets})`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
