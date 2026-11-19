'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { ExerciseMotionType } from './exercise-motion-card';

interface ExerciseMotionSvgProps {
  motionType: ExerciseMotionType;
  isPlaying: boolean;
  baseDuration: number;
}

/**
 * Stylized athletic cartoon coach with 2-segment FK/IK joint rigging
 * so shoulders, elbows, wrists, hips, knees, and ankles stay naturally connected.
 */
export function ExerciseMotionSvg({
  motionType,
  isPlaying,
  baseDuration,
}: ExerciseMotionSvgProps) {
  const smoothTransition = {
    duration: baseDuration,
    repeat: Infinity,
    times: [0, 0.44, 0.56, 1],
    ease: 'easeInOut' as const,
  };

  const sharedDefs = (
    <defs>
      <linearGradient id="coachSkin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FAD6BC" />
        <stop offset="55%" stopColor="#E5A982" />
        <stop offset="100%" stopColor="#B9764E" />
      </linearGradient>
      <linearGradient id="coachSkinShadow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D6956D" />
        <stop offset="100%" stopColor="#9A5B37" />
      </linearGradient>
      <linearGradient id="coachShirt" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#263349" />
        <stop offset="50%" stopColor="#121A2B" />
        <stop offset="100%" stopColor="#070B14" />
      </linearGradient>
      <linearGradient id="coachShorts" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="100%" stopColor="#090D16" />
      </linearGradient>
      <linearGradient id="gymLeather" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="50%" stopColor="#1E293B" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
      <linearGradient id="gymSteel" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="50%" stopColor="#64748B" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
      <linearGradient id="proChromeBar" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#F8FAFC" />
        <stop offset="45%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="proGoldPlate" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="45%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
      <radialGradient id="proMuscleGlowRed" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#EF4444" stopOpacity="0.92" />
        <stop offset="60%" stopColor="#DC2626" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="proMuscleGlowGold" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.92" />
        <stop offset="60%" stopColor="#D97706" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="proMuscleGlowEmerald" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#10B981" stopOpacity="0.92" />
        <stop offset="60%" stopColor="#059669" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="proMuscleGlowCyan" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.92" />
        <stop offset="60%" stopColor="#0284C7" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
      </radialGradient>
      <filter id="proGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  );

  const CoachHeadSide = ({ facing = 1 }: { facing?: 1 | -1 }) => (
    <g transform={`scale(${facing}, 1)`}>
      <path d="M -5 8 L -5 18 L 6 18 L 5 7 Z" fill="url(#coachSkinShadow)" />
      <path
        d="M -11 -12 C -12 -22 10 -23 13 -11 C 15 -4 14 5 9 9 C 4 12 -6 11 -10 5 Z"
        fill="url(#coachSkin)"
      />
      <path
        d="M -12 -10 C -13 -23 8 -25 14 -14 C 10 -15 3 -15 -3 -12 C -7 -10 -8 -4 -9 0 L -12 -2 Z"
        fill="#0F172A"
      />
      <path d="M -2 5 C 3 9 10 8 12 3 C 11 9 5 12 -1 10 Z" fill="#0F172A" opacity="0.88" />
      <circle cx="-6" cy="-2" r="3" fill="url(#coachSkinShadow)" />
      <path d="M 5 -7 L 11 -6" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8.5" cy="-4" r="1.3" fill="#0F172A" />
    </g>
  );

  const CoachHeadFront = () => (
    <g>
      <path d="M -14 17 Q 0 11 14 17 L 8 6 L -8 6 Z" fill="url(#coachSkinShadow)" />
      <rect x="-13" y="-18" width="26" height="29" rx="12" fill="url(#coachSkin)" />
      <circle cx="-13" cy="-2" r="3" fill="url(#coachSkinShadow)" />
      <circle cx="13" cy="-2" r="3" fill="url(#coachSkinShadow)" />
      <path d="M -13 -7 C -14 -21 14 -21 13 -7 C 8 -13 -8 -13 -13 -7 Z" fill="#0F172A" />
      <path d="M -8 -6 L -3 -5 M 3 -5 L 8 -6" stroke="#0F172A" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="-5.5" cy="-3" r="1.4" fill="#0F172A" />
      <circle cx="5.5" cy="-3" r="1.4" fill="#0F172A" />
      <path d="M -11 2 C -9 11 9 11 11 2 C 8 6 -8 6 -11 2 Z" fill="#0F172A" opacity="0.88" />
    </g>
  );

  const StudioFloor = ({ y = 196 }: { y?: number }) => (
    <g>
      <line x1="16" y1={y} x2="304" y2={y} stroke="#334155" strokeWidth="1.5" opacity="0.65" />
      <ellipse cx="160" cy={y + 2} rx="92" ry="5" fill="#020617" opacity="0.65" />
    </g>
  );

  const Sneaker = () => (
    <g>
      <path d="M -7 0 L 13 0 C 16 0 18 4 17 7 L -8 7 Z" fill="#0F172A" stroke="#334155" strokeWidth="0.8" />
      <path d="M -8 6 L 17 6 L 17 9 L -8 9 Z" fill="#F8FAFC" />
      <path d="M 1 1 L 7 4" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );

  switch (motionType) {
    case 'BENCH_PRESS':
    case 'INCLINE_PRESS': {
      const isIncline = motionType === 'INCLINE_PRESS';
      return (
        <svg viewBox="0 0 320 220" className="w-full h-full max-h-[205px]">
          {sharedDefs}
          <StudioFloor y={196} />

          <rect x="64" y="64" width="7" height="132" rx="3" fill="url(#gymSteel)" />
          <rect x="52" y="191" width="214" height="5" rx="2.5" fill="#1E293B" />
          <rect x="148" y="152" width="10" height="40" rx="3" fill="#334155" />
          <rect x="228" y="152" width="10" height="40" rx="3" fill="#334155" />

          {isIncline ? (
            <g>
              <g transform="translate(154, 152) rotate(-28)">
                <rect x="-82" y="-10" width="84" height="13" rx="5" fill="url(#gymLeather)" stroke="#475569" strokeWidth="1" />
              </g>
              <rect x="158" y="146" width="74" height="12" rx="5" fill="url(#gymLeather)" stroke="#475569" strokeWidth="1" />
            </g>
          ) : (
            <rect x="68" y="144" width="166" height="13" rx="5" fill="url(#gymLeather)" stroke="#475569" strokeWidth="1" />
          )}

          <g transform={isIncline ? 'translate(222, 146)' : 'translate(218, 144)'}>
            <path d="M -8 -6 L 14 -6 C 19 -6 22 0 21 8 L 4 8 Z" fill="url(#coachShorts)" />
            <path d="M 10 2 L 32 4 L 36 42 L 22 42 L 18 14 L 4 12 Z" fill="url(#coachSkin)" />
            <g transform="translate(26, 41)">
              <Sneaker />
            </g>
          </g>

          <g transform={isIncline ? 'translate(154, 140) rotate(-28)' : 'translate(148, 134)'}>
            <path d="M -68 -10 C -60 -20 -18 -20 6 -12 L 58 -8 L 58 10 L -68 8 Z" fill="url(#coachShirt)" />
            <path d="M -52 -11 L -22 -11" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
            <g transform="translate(-82, -6) rotate(12)">
              <CoachHeadSide facing={1} />
            </g>
            <motion.ellipse
              cx="-40"
              cy="-10"
              rx="18"
              ry="11"
              fill="url(#proMuscleGlowRed)"
              filter="url(#proGlowFilter)"
              animate={isPlaying ? { scale: [0.95, 1.32, 1.32, 0.95], opacity: [0.42, 0.95, 0.95, 0.42] } : {}}
              transition={smoothTransition}
            />
          </g>

          <g transform={isIncline ? 'translate(110, 108)' : 'translate(104, 124)'}>
            <circle cx="0" cy="0" r="8" fill="url(#coachShirt)" />
            <motion.g
              animate={
                isPlaying
                  ? { rotate: isIncline ? [-8, -68, -68, -8] : [-5, -72, -72, -5] }
                  : { rotate: -8 }
              }
              transition={smoothTransition}
            >
              <path d="M 0 -7 L -42 -5 L -42 5 L 0 7 Z" fill="url(#coachSkinShadow)" />
              <g transform="translate(-42, 0)">
                <circle cx="0" cy="0" r="5.5" fill="url(#coachSkin)" />
                <motion.g
                  animate={
                    isPlaying
                      ? { rotate: isIncline ? [98, 158, 158, 98] : [95, 162, 162, 95] }
                      : { rotate: 95 }
                  }
                  transition={smoothTransition}
                >
                  <path d="M -5 0 L -3.5 -42 L 3.5 -42 L 5 0 Z" fill="url(#coachSkin)" />
                  <rect x="-4" y="-44" width="8" height="5" rx="1.5" fill="#D4AF37" />
                  <circle cx="0" cy="-47" r="5" fill="url(#coachSkin)" />
                  <g transform="translate(0, -48) rotate(-90)">
                    <rect x="-18" y="-2.5" width="36" height="5" rx="2.5" fill="url(#proChromeBar)" />
                    <circle cx="0" cy="0" r={isIncline ? 13 : 16} fill="url(#proGoldPlate)" stroke="#0F172A" strokeWidth="1.5" />
                    <circle cx="0" cy="0" r="4.5" fill="#1E293B" />
                  </g>
                </motion.g>
              </g>
            </motion.g>
          </g>

          <g transform={isIncline ? 'translate(120, 114)' : 'translate(112, 120)'}>
            <motion.circle r="6" fill="none" stroke="#EF4444" strokeWidth="1.6" animate={isPlaying ? { scale: [1, 2.2], opacity: [0.95, 0] } : {}} transition={{ duration: 1.5, repeat: Infinity }} />
            <circle r="3" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.2" />
          </g>
        </svg>
      );
    }

    case 'CABLE_FLY': {
      return (
        <svg viewBox="0 0 320 220" className="w-full h-full max-h-[205px]">
          {sharedDefs}
          <StudioFloor y={198} />

          <rect x="26" y="18" width="12" height="178" rx="4" fill="url(#gymSteel)" />
          <rect x="282" y="18" width="12" height="178" rx="4" fill="url(#gymSteel)" />
          <rect x="26" y="18" width="268" height="9" rx="4" fill="#334155" />
          <circle cx="40" cy="78" r="6" fill="#94A3B8" stroke="#D4AF37" strokeWidth="1.5" />
          <circle cx="280" cy="78" r="6" fill="#94A3B8" stroke="#D4AF37" strokeWidth="1.5" />

          <path d="M 134 128 L 186 128 L 190 156 L 164 156 L 160 140 L 156 156 L 130 156 Z" fill="url(#coachShorts)" />
          <path d="M 135 156 L 152 156 L 149 190 L 136 190 Z" fill="url(#coachSkin)" />
          <path d="M 168 156 L 185 156 L 184 190 L 171 190 Z" fill="url(#coachSkin)" />
          <g transform="translate(137, 189)"><Sneaker /></g>
          <g transform="translate(172, 189)"><Sneaker /></g>

          <path d="M 122 72 Q 160 64 198 72 L 186 130 L 134 130 Z" fill="url(#coachShirt)" />
          <path d="M 145 86 L 175 86" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" opacity="0.65" />

          <g transform="translate(160, 44)">
            <CoachHeadFront />
          </g>

          <motion.ellipse
            cx="147"
            cy="90"
            rx="12"
            ry="10"
            fill="url(#proMuscleGlowRed)"
            filter="url(#proGlowFilter)"
            animate={isPlaying ? { scale: [0.95, 1.35, 1.35, 0.95], opacity: [0.35, 0.95, 0.95, 0.35] } : {}}
            transition={smoothTransition}
          />
          <motion.ellipse
            cx="173"
            cy="90"
            rx="12"
            ry="10"
            fill="url(#proMuscleGlowRed)"
            filter="url(#proGlowFilter)"
            animate={isPlaying ? { scale: [0.95, 1.35, 1.35, 0.95], opacity: [0.35, 0.95, 0.95, 0.35] } : {}}
            transition={smoothTransition}
          />

          <g transform="translate(124, 78)">
            <circle cx="0" cy="0" r="8" fill="url(#coachSkin)" />
            <motion.g
              animate={isPlaying ? { rotate: [74, 18, 18, 74] } : { rotate: 74 }}
              transition={smoothTransition}
            >
              <path d="M -6 0 L -5 30 L 5 30 L 6 0 Z" fill="url(#coachSkin)" />
              <g transform="translate(0, 30)">
                <circle cx="0" cy="0" r="5" fill="url(#coachSkinShadow)" />
                <motion.g
                  animate={isPlaying ? { rotate: [-14, -28, -28, -14] } : { rotate: -14 }}
                  transition={smoothTransition}
                >
                  <path d="M -4.5 0 L -3.5 28 L 3.5 28 L 4.5 0 Z" fill="url(#coachSkin)" />
                  <rect x="-4" y="25" width="8" height="4" rx="1.5" fill="#D4AF37" />
                  <circle cx="0" cy="31" r="4.5" fill="url(#coachSkin)" />
                  <rect x="-5" y="30" width="10" height="5" rx="2" fill="#0F172A" stroke="#D4AF37" strokeWidth="1.2" />
                  <line x1="-4" y1="32" x2="-74" y2="-4" stroke="#94A3B8" strokeWidth="1.4" strokeDasharray="3 2" opacity="0.7" />
                </motion.g>
              </g>
            </motion.g>
          </g>

          <g transform="translate(196, 78)">
            <circle cx="0" cy="0" r="8" fill="url(#coachSkin)" />
            <motion.g
              animate={isPlaying ? { rotate: [-74, -18, -18, -74] } : { rotate: -74 }}
              transition={smoothTransition}
            >
              <path d="M -6 0 L -5 30 L 5 30 L 6 0 Z" fill="url(#coachSkin)" />
              <g transform="translate(0, 30)">
                <circle cx="0" cy="0" r="5" fill="url(#coachSkinShadow)" />
                <motion.g
                  animate={isPlaying ? { rotate: [14, 28, 28, 14] } : { rotate: 14 }}
                  transition={smoothTransition}
                >
                  <path d="M -4.5 0 L -3.5 28 L 3.5 28 L 4.5 0 Z" fill="url(#coachSkin)" />
                  <rect x="-4" y="25" width="8" height="4" rx="1.5" fill="#D4AF37" />
                  <circle cx="0" cy="31" r="4.5" fill="url(#coachSkin)" />
                  <rect x="-5" y="30" width="10" height="5" rx="2" fill="#0F172A" stroke="#D4AF37" strokeWidth="1.2" />
                  <line x1="4" y1="32" x2="74" y2="-4" stroke="#94A3B8" strokeWidth="1.4" strokeDasharray="3 2" opacity="0.7" />
                </motion.g>
              </g>
            </motion.g>
          </g>

          <g transform="translate(160, 90)">
            <motion.circle r="6" fill="none" stroke="#EF4444" strokeWidth="1.6" animate={isPlaying ? { scale: [1, 2.2], opacity: [0.95, 0] } : {}} transition={{ duration: 1.5, repeat: Infinity }} />
            <circle r="3" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.2" />
          </g>
        </svg>
      );
    }

    case 'BARBELL_SQUAT': {
      return (
        <svg viewBox="0 0 320 220" className="w-full h-full max-h-[205px]">
          {sharedDefs}
          <StudioFloor y={198} />

          <rect x="78" y="32" width="8" height="166" rx="3" fill="url(#gymSteel)" />
          <rect x="66" y="193" width="44" height="5" rx="2" fill="#1E293B" />

          <g transform="translate(158, 190)">
            <Sneaker />
            <motion.g
              animate={isPlaying ? { rotate: [4, 24, 24, 4] } : { rotate: 4 }}
              transition={smoothTransition}
            >
              <path d="M -7 0 L -8 -44 L 8 -44 L 6 0 Z" fill="url(#coachSkin)" />
              <g transform="translate(0, -44)">
                <circle cx="0" cy="0" r="7" fill="url(#coachSkinShadow)" />
                <motion.g
                  animate={isPlaying ? { rotate: [-12, -88, -88, -12] } : { rotate: -12 }}
                  transition={smoothTransition}
                >
                  <path d="M -9 0 L -11 -46 L 11 -46 L 9 0 Z" fill="url(#coachShorts)" />
                  <motion.ellipse
                    cx="3"
                    cy="-23"
                    rx="11"
                    ry="20"
                    fill="url(#proMuscleGlowGold)"
                    filter="url(#proGlowFilter)"
                    animate={isPlaying ? { scale: [0.95, 1.32, 1.32, 0.95], opacity: [0.42, 0.95, 0.95, 0.42] } : {}}
                    transition={smoothTransition}
                  />
                  <g transform="translate(0, -46)">
                    <circle cx="0" cy="0" r="8" fill="url(#coachShorts)" />
                    <motion.g
                      animate={isPlaying ? { rotate: [16, 94, 94, 16] } : { rotate: 16 }}
                      transition={smoothTransition}
                    >
                      <path d="M -12 0 L -14 -52 L 13 -52 L 11 0 Z" fill="url(#coachShirt)" />
                      <path d="M -4 -36 L 8 -36" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                      <motion.g
                        transform="translate(2, -65)"
                        animate={isPlaying ? { rotate: [-8, -28, -28, -8] } : { rotate: -8 }}
                        transition={smoothTransition}
                      >
                        <CoachHeadSide facing={1} />
                      </motion.g>
                      <g transform="translate(-4, -44)">
                        <path d="M -4 0 L -14 14 L -6 19 L 4 4 Z" fill="url(#coachSkin)" />
                        <path d="M -12 16 L -4 2 L 2 5 L -6 19 Z" fill="url(#coachSkinShadow)" />
                        <circle cx="-1" cy="-2" r="18" fill="url(#proGoldPlate)" stroke="#0F172A" strokeWidth="1.8" />
                        <circle cx="-1" cy="-2" r="5" fill="url(#proChromeBar)" />
                      </g>
                    </motion.g>
                  </g>
                </motion.g>
              </g>
            </motion.g>
          </g>

          <g transform="translate(154, 125)">
            <motion.circle r="6" fill="none" stroke="#F59E0B" strokeWidth="1.6" animate={isPlaying ? { scale: [1, 2.2], opacity: [0.95, 0] } : {}} transition={{ duration: 1.5, repeat: Infinity }} />
            <circle r="3" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.2" />
          </g>
        </svg>
      );
    }

    case 'ROMANIAN_DEADLIFT': {
      return (
        <svg viewBox="0 0 320 220" className="w-full h-full max-h-[205px]">
          {sharedDefs}
          <StudioFloor y={198} />

          <g transform="translate(152, 190)">
            <Sneaker />
            <motion.g
              animate={isPlaying ? { rotate: [2, 8, 8, 2] } : { rotate: 2 }}
              transition={smoothTransition}
            >
              <path d="M -7 0 L -8 -44 L 8 -44 L 6 0 Z" fill="url(#coachSkin)" />
              <g transform="translate(0, -44)">
                <circle cx="0" cy="0" r="6.5" fill="url(#coachSkinShadow)" />
                <motion.g
                  animate={isPlaying ? { rotate: [-4, -26, -26, -4] } : { rotate: -4 }}
                  transition={smoothTransition}
                >
                  <path d="M -9 0 L -11 -46 L 11 -46 L 9 0 Z" fill="url(#coachShorts)" />
                  <motion.ellipse
                    cx="-8"
                    cy="-24"
                    rx="10"
                    ry="20"
                    fill="url(#proMuscleGlowGold)"
                    filter="url(#proGlowFilter)"
                    animate={isPlaying ? { scale: [0.95, 1.32, 1.32, 0.95], opacity: [0.4, 0.95, 0.95, 0.4] } : {}}
                    transition={smoothTransition}
                  />
                  <g transform="translate(0, -46)">
                    <circle cx="0" cy="0" r="8" fill="url(#coachShorts)" />
                    <motion.g
                      animate={isPlaying ? { rotate: [6, 72, 72, 6] } : { rotate: 6 }}
                      transition={smoothTransition}
                    >
                      <path d="M -12 0 L -13 -54 L 12 -54 L 11 0 Z" fill="url(#coachShirt)" />
                      <g transform="translate(2, -67)">
                        <CoachHeadSide facing={1} />
                      </g>
                      <g transform="translate(3, -44)">
                        <motion.g
                          animate={isPlaying ? { rotate: [-6, -72, -72, -6] } : { rotate: -6 }}
                          transition={smoothTransition}
                        >
                          <path d="M -5 0 L -4 52 L 4 52 L 5 0 Z" fill="url(#coachSkin)" />
                          <rect x="-4" y="48" width="8" height="4" rx="1.5" fill="#D4AF37" />
                          <g transform="translate(0, 56)">
                            <circle cx="0" cy="0" r="18" fill="url(#proGoldPlate)" stroke="#0F172A" strokeWidth="1.8" />
                            <circle cx="0" cy="0" r="5" fill="url(#proChromeBar)" />
                          </g>
                        </motion.g>
                      </g>
                    </motion.g>
                  </g>
                </motion.g>
              </g>
            </motion.g>
          </g>

          <g transform="translate(134, 124)">
            <motion.circle r="6" fill="none" stroke="#F59E0B" strokeWidth="1.6" animate={isPlaying ? { scale: [1, 2.2], opacity: [0.95, 0] } : {}} transition={{ duration: 1.5, repeat: Infinity }} />
            <circle r="3" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.2" />
          </g>
        </svg>
      );
    }

    case 'LAT_PULLDOWN': {
      return (
        <svg viewBox="0 0 320 220" className="w-full h-full max-h-[205px]">
          {sharedDefs}
          <StudioFloor y={200} />

          <rect x="86" y="14" width="10" height="184" rx="3" fill="url(#gymSteel)" />
          <rect x="86" y="14" width="104" height="9" rx="3" fill="#334155" />
          <circle cx="172" cy="24" r="6" fill="#94A3B8" stroke="#D4AF37" strokeWidth="1.5" />
          <rect x="116" y="144" width="70" height="11" rx="4" fill="url(#gymLeather)" />
          <rect x="148" y="155" width="9" height="43" rx="2" fill="#334155" />
          <rect x="114" y="118" width="24" height="10" rx="5" fill="url(#gymLeather)" stroke="#D4AF37" strokeWidth="1" />

          <path d="M 152 132 L 182 132 L 182 146 L 124 146 L 124 134 Z" fill="url(#coachShorts)" />
          <path d="M 118 144 L 132 144 L 130 190 L 116 190 Z" fill="url(#coachSkin)" />
          <g transform="translate(118, 189)"><Sneaker /></g>

          <g transform="translate(166, 134) rotate(12)">
            <path d="M -14 0 L -18 -54 L 14 -54 L 12 0 Z" fill="url(#coachShirt)" />
            <g transform="translate(0, -68)">
              <CoachHeadSide facing={-1} />
            </g>
            <motion.ellipse
              cx="4"
              cy="-28"
              rx="14"
              ry="19"
              fill="url(#proMuscleGlowCyan)"
              filter="url(#proGlowFilter)"
              animate={isPlaying ? { scale: [0.95, 1.32, 1.32, 0.95], opacity: [0.4, 0.95, 0.95, 0.4] } : {}}
              transition={smoothTransition}
            />

            <g transform="translate(-4, -46)">
              <circle cx="0" cy="0" r="7.5" fill="url(#coachSkin)" />
              <motion.g
                animate={isPlaying ? { rotate: [172, 72, 72, 172] } : { rotate: 172 }}
                transition={smoothTransition}
              >
                <path d="M -5 0 L -4 32 L 4 32 L 5 0 Z" fill="url(#coachSkin)" />
                <g transform="translate(0, 32)">
                  <circle cx="0" cy="0" r="5" fill="url(#coachSkinShadow)" />
                  <motion.g
                    animate={isPlaying ? { rotate: [-12, -92, -92, -12] } : { rotate: -12 }}
                    transition={smoothTransition}
                  >
                    <path d="M -4 0 L -3.5 30 L 3.5 30 L 4 0 Z" fill="url(#coachSkin)" />
                    <rect x="-4" y="27" width="8" height="4" rx="1.5" fill="#D4AF37" />
                    <g transform="translate(0, 32)">
                      <rect x="-26" y="-2.5" width="52" height="5" rx="2.5" fill="url(#proChromeBar)" />
                      <circle cx="0" cy="0" r="4.5" fill="#D4AF37" />
                    </g>
                  </motion.g>
                </g>
              </motion.g>
            </g>
          </g>

          <g transform="translate(174, 100)">
            <motion.circle r="6" fill="none" stroke="#38BDF8" strokeWidth="1.6" animate={isPlaying ? { scale: [1, 2.2], opacity: [0.95, 0] } : {}} transition={{ duration: 1.5, repeat: Infinity }} />
            <circle r="3" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.2" />
          </g>
        </svg>
      );
    }

    case 'BARBELL_ROW': {
      return (
        <svg viewBox="0 0 320 220" className="w-full h-full max-h-[205px]">
          {sharedDefs}
          <StudioFloor y={198} />

          <g transform="translate(140, 190)">
            <Sneaker />
            <path d="M -6 0 L -2 -44 L 12 -44 L 8 0 Z" fill="url(#coachSkin)" transform="rotate(10)" />
            <g transform="translate(-7, -43)">
              <path d="M -9 0 L -15 -44 L 7 -44 L 11 0 Z" fill="url(#coachShorts)" />
              <g transform="translate(-3, -44) rotate(48)">
                <path d="M -12 0 L -14 -56 L 13 -56 L 12 0 Z" fill="url(#coachShirt)" />
                <g transform="translate(2, -68) rotate(-25)">
                  <CoachHeadSide facing={1} />
                </g>
                <motion.ellipse
                  cx="-4"
                  cy="-32"
                  rx="14"
                  ry="20"
                  fill="url(#proMuscleGlowCyan)"
                  filter="url(#proGlowFilter)"
                  animate={isPlaying ? { scale: [0.95, 1.32, 1.32, 0.95], opacity: [0.4, 0.95, 0.95, 0.4] } : {}}
                  transition={smoothTransition}
                />

                <g transform="translate(2, -46)">
                  <circle cx="0" cy="0" r="7.5" fill="url(#coachSkin)" />
                  <motion.g
                    animate={isPlaying ? { rotate: [-42, -96, -96, -42] } : { rotate: -42 }}
                    transition={smoothTransition}
                  >
                    <path d="M -5 0 L -4 30 L 4 30 L 5 0 Z" fill="url(#coachSkin)" />
                    <g transform="translate(0, 30)">
                      <circle cx="0" cy="0" r="5" fill="url(#coachSkinShadow)" />
                      <motion.g
                        animate={isPlaying ? { rotate: [-6, 62, 62, -6] } : { rotate: -6 }}
                        transition={smoothTransition}
                      >
                        <path d="M -4 0 L -3.5 28 L 3.5 28 L 4 0 Z" fill="url(#coachSkin)" />
                        <rect x="-4" y="25" width="8" height="4" rx="1.5" fill="#D4AF37" />
                        <g transform="translate(0, 31)">
                          <circle cx="0" cy="0" r="17" fill="url(#proGoldPlate)" stroke="#0F172A" strokeWidth="1.8" />
                          <circle cx="0" cy="0" r="4.5" fill="url(#proChromeBar)" />
                        </g>
                      </motion.g>
                    </g>
                  </motion.g>
                </g>
              </g>
            </g>
          </g>

          <g transform="translate(154, 84)">
            <motion.circle r="6" fill="none" stroke="#38BDF8" strokeWidth="1.6" animate={isPlaying ? { scale: [1, 2.2], opacity: [0.95, 0] } : {}} transition={{ duration: 1.5, repeat: Infinity }} />
            <circle r="3" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.2" />
          </g>
        </svg>
      );
    }

    case 'LATERAL_RAISE': {
      return (
        <svg viewBox="0 0 320 220" className="w-full h-full max-h-[205px]">
          {sharedDefs}
          <StudioFloor y={198} />

          <path d="M 134 128 L 186 128 L 190 156 L 164 156 L 160 140 L 156 156 L 130 156 Z" fill="url(#coachShorts)" />
          <path d="M 135 156 L 152 156 L 149 190 L 136 190 Z" fill="url(#coachSkin)" />
          <path d="M 168 156 L 185 156 L 184 190 L 171 190 Z" fill="url(#coachSkin)" />
          <g transform="translate(137, 189)"><Sneaker /></g>
          <g transform="translate(172, 189)"><Sneaker /></g>

          <path d="M 122 72 Q 160 64 198 72 L 186 130 L 134 130 Z" fill="url(#coachShirt)" />
          <path d="M 145 86 L 175 86" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" opacity="0.65" />

          <g transform="translate(160, 44)">
            <CoachHeadFront />
          </g>

          <motion.ellipse
            cx="124"
            cy="76"
            rx="12"
            ry="10"
            fill="url(#proMuscleGlowGold)"
            filter="url(#proGlowFilter)"
            animate={isPlaying ? { scale: [0.95, 1.35, 1.35, 0.95], opacity: [0.4, 0.95, 0.95, 0.4] } : {}}
            transition={smoothTransition}
          />
          <motion.ellipse
            cx="196"
            cy="76"
            rx="12"
            ry="10"
            fill="url(#proMuscleGlowGold)"
            filter="url(#proGlowFilter)"
            animate={isPlaying ? { scale: [0.95, 1.35, 1.35, 0.95], opacity: [0.4, 0.95, 0.95, 0.4] } : {}}
            transition={smoothTransition}
          />

          <g transform="translate(124, 77)">
            <circle cx="0" cy="0" r="8" fill="url(#coachSkin)" />
            <motion.g
              animate={isPlaying ? { rotate: [10, 82, 82, 10] } : { rotate: 10 }}
              transition={smoothTransition}
            >
              <path d="M -5.5 0 L -4.5 29 L 4.5 29 L 5.5 0 Z" fill="url(#coachSkin)" />
              <g transform="translate(0, 29)">
                <circle cx="0" cy="0" r="5" fill="url(#coachSkinShadow)" />
                <motion.g
                  animate={isPlaying ? { rotate: [-12, -16, -16, -12] } : { rotate: -12 }}
                  transition={smoothTransition}
                >
                  <path d="M -4 0 L -3.5 26 L 3.5 26 L 4 0 Z" fill="url(#coachSkin)" />
                  <rect x="-4" y="23" width="8" height="4" rx="1.5" fill="#D4AF37" />
                  <g transform="translate(0, 29)">
                    <rect x="-11" y="-2.5" width="22" height="5" rx="2" fill="url(#proChromeBar)" />
                    <rect x="-14" y="-7" width="6" height="14" rx="2" fill="url(#proGoldPlate)" />
                    <rect x="8" y="-7" width="6" height="14" rx="2" fill="url(#proGoldPlate)" />
                  </g>
                </motion.g>
              </g>
            </motion.g>
          </g>

          <g transform="translate(196, 77)">
            <circle cx="0" cy="0" r="8" fill="url(#coachSkin)" />
            <motion.g
              animate={isPlaying ? { rotate: [-10, -82, -82, -10] } : { rotate: -10 }}
              transition={smoothTransition}
            >
              <path d="M -5.5 0 L -4.5 29 L 4.5 29 L 5.5 0 Z" fill="url(#coachSkin)" />
              <g transform="translate(0, 29)">
                <circle cx="0" cy="0" r="5" fill="url(#coachSkinShadow)" />
                <motion.g
                  animate={isPlaying ? { rotate: [12, 16, 16, 12] } : { rotate: 12 }}
                  transition={smoothTransition}
                >
                  <path d="M -4 0 L -3.5 26 L 3.5 26 L 4 0 Z" fill="url(#coachSkin)" />
                  <rect x="-4" y="23" width="8" height="4" rx="1.5" fill="#D4AF37" />
                  <g transform="translate(0, 29)">
                    <rect x="-11" y="-2.5" width="22" height="5" rx="2" fill="url(#proChromeBar)" />
                    <rect x="-14" y="-7" width="6" height="14" rx="2" fill="url(#proGoldPlate)" />
                    <rect x="8" y="-7" width="6" height="14" rx="2" fill="url(#proGoldPlate)" />
                  </g>
                </motion.g>
              </g>
            </motion.g>
          </g>

          <g transform="translate(198, 75)">
            <motion.circle r="6" fill="none" stroke="#F59E0B" strokeWidth="1.6" animate={isPlaying ? { scale: [1, 2.2], opacity: [0.95, 0] } : {}} transition={{ duration: 1.5, repeat: Infinity }} />
            <circle r="3" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.2" />
          </g>
        </svg>
      );
    }

    case 'TRICEPS_PUSHDOWN':
    case 'BICEPS_CURL':
    default: {
      const isBiceps = motionType === 'BICEPS_CURL';
      const pinColor = isBiceps ? '#EF4444' : '#10B981';
      return (
        <svg viewBox="0 0 320 220" className="w-full h-full max-h-[205px]">
          {sharedDefs}
          <StudioFloor y={198} />

          {!isBiceps && (
            <g>
              <rect x="228" y="16" width="11" height="180" rx="3" fill="url(#gymSteel)" />
              <rect x="190" y="16" width="48" height="8" rx="3" fill="#334155" />
              <circle cx="195" cy="24" r="5" fill="#94A3B8" stroke="#D4AF37" strokeWidth="1.4" />
              <line x1="195" y1="29" x2="195" y2="114" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.65" />
            </g>
          )}

          <path d="M 134 128 L 166 128 L 168 156 L 136 156 Z" fill="url(#coachShorts)" />
          <path d="M 140 156 L 157 156 L 155 190 L 141 190 Z" fill="url(#coachSkin)" />
          <g transform="translate(143, 189)"><Sneaker /></g>

          <path d="M 130 68 L 168 68 L 164 130 L 134 130 Z" fill="url(#coachShirt)" />
          <g transform="translate(150, 44)">
            <CoachHeadSide facing={1} />
          </g>

          <path d="M 144 74 L 156 74 L 158 114 L 146 114 Z" fill="url(#coachSkin)" />
          <motion.ellipse
            cx={isBiceps ? 156 : 144}
            cy="94"
            rx="11"
            ry="16"
            fill={isBiceps ? 'url(#proMuscleGlowRed)' : 'url(#proMuscleGlowEmerald)'}
            filter="url(#proGlowFilter)"
            animate={isPlaying ? { scale: [0.95, 1.32, 1.32, 0.95], opacity: [0.4, 0.95, 0.95, 0.4] } : {}}
            transition={smoothTransition}
          />

          <g transform="translate(152, 114)">
            <circle cx="0" cy="0" r="6" fill="url(#coachSkinShadow)" />
            <motion.g
              animate={
                isPlaying
                  ? { rotate: isBiceps ? [8, -112, -112, 8] : [-82, 8, 8, -82] }
                  : { rotate: isBiceps ? 8 : -82 }
              }
              transition={smoothTransition}
            >
              <path d="M -4.5 0 L -3.5 34 L 3.5 34 L 4.5 0 Z" fill="url(#coachSkin)" />
              <rect x="-4" y="31" width="8" height="4" rx="1.5" fill="#D4AF37" />
              <circle cx="0" cy="36" r="4.5" fill="url(#coachSkin)" />
              {isBiceps ? (
                <g transform="translate(0, 38)">
                  <rect x="-14" y="-2.5" width="28" height="5" rx="2" fill="url(#proChromeBar)" />
                  <circle cx="-14" cy="0" r="8" fill="url(#proGoldPlate)" stroke="#0F172A" strokeWidth="1" />
                  <circle cx="14" cy="0" r="8" fill="url(#proGoldPlate)" stroke="#0F172A" strokeWidth="1" />
                </g>
              ) : (
                <g transform="translate(0, 37)">
                  <path d="M 0 0 L -8 14 M 0 0 L 8 14" stroke="#D4AF37" strokeWidth="3.5" strokeLinecap="round" />
                  <circle cx="-8" cy="14" r="3.8" fill="#0F172A" stroke="#94A3B8" strokeWidth="1" />
                  <circle cx="8" cy="14" r="3.8" fill="#0F172A" stroke="#94A3B8" strokeWidth="1" />
                </g>
              )}
            </motion.g>
          </g>

          <g transform={`translate(${isBiceps ? 156 : 144}, 94)`}>
            <motion.circle r="6" fill="none" stroke={pinColor} strokeWidth="1.6" animate={isPlaying ? { scale: [1, 2.2], opacity: [0.95, 0] } : {}} transition={{ duration: 1.5, repeat: Infinity }} />
            <circle r="3" fill={pinColor} stroke="#FFFFFF" strokeWidth="1.2" />
          </g>
        </svg>
      );
    }
  }
}
