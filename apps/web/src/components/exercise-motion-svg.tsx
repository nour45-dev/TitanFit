'use client';

import React, { useEffect, useState } from 'react';
import type { ExerciseMotionType } from './exercise-motion-card';

interface ExerciseMotionSvgProps {
  motionType: ExerciseMotionType;
  isPlaying: boolean;
  baseDuration: number;
}

interface Pt {
  x: number;
  y: number;
}

/**
 * Exact 2-bone Inverse Kinematics solver (Law of Cosines).
 * Guarantees zero joint detachment and natural elbow/knee bending.
 */
function solve2BoneIK(
  root: Pt,
  target: Pt,
  len1: number,
  len2: number,
  bendDir: 1 | -1,
): { mid: Pt; end: Pt } {
  const dx = target.x - root.x;
  const dy = target.y - root.y;
  const rawDist = Math.hypot(dx, dy) || 0.001;
  const minDist = Math.abs(len1 - len2) + 1;
  const maxDist = len1 + len2 - 0.5;
  const d = Math.max(minDist, Math.min(maxDist, rawDist));

  const baseAngle = Math.atan2(dy, dx);
  const cosA = (len1 * len1 + d * d - len2 * len2) / (2 * len1 * d);
  const angleA = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const jointAngle = baseAngle + bendDir * angleA;

  const mid: Pt = {
    x: root.x + Math.cos(jointAngle) * len1,
    y: root.y + Math.sin(jointAngle) * len1,
  };
  const scale = d / rawDist;
  const end: Pt = {
    x: root.x + dx * scale,
    y: root.y + dy * scale,
  };
  return { mid, end };
}

/** Smooth 0 -> 1 -> 0 biomechanical curve with brief peak isometric hold */
function getRepProgress(cycle: number): number {
  const t = ((cycle % 1) + 1) % 1;
  if (t < 0.42) {
    const p = t / 0.42;
    return 0.5 - 0.5 * Math.cos(Math.PI * p);
  }
  if (t < 0.56) {
    return 1;
  }
  const p = (t - 0.56) / 0.44;
  return 0.5 + 0.5 * Math.cos(Math.PI * p);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function ExerciseMotionSvg({
  motionType,
  isPlaying,
  baseDuration,
}: ExerciseMotionSvgProps) {
  const [cycle, setCycle] = useState(0.22);

  useEffect(() => {
    if (!isPlaying) return;
    let rafId = 0;
    let lastTime = performance.now();
    const durationMs = Math.max(800, baseDuration * 1000);

    const tick = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      setCycle((prev) => (prev + dt / durationMs) % 1);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, baseDuration]);

  const rep = getRepProgress(cycle);

  const sharedDefs = (
    <defs>
      <linearGradient id="coachSkin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F6CFB2" />
        <stop offset="55%" stopColor="#E1A57E" />
        <stop offset="100%" stopColor="#B8764E" />
      </linearGradient>
      <linearGradient id="coachSkinDark" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D89870" />
        <stop offset="100%" stopColor="#9A5B37" />
      </linearGradient>
      <linearGradient id="coachShirt" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#26344B" />
        <stop offset="55%" stopColor="#121A2C" />
        <stop offset="100%" stopColor="#070B14" />
      </linearGradient>
      <linearGradient id="coachShorts" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="100%" stopColor="#090E18" />
      </linearGradient>
      <linearGradient id="gymLeather" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
      <linearGradient id="gymSteel" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="50%" stopColor="#64748B" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
      <linearGradient id="proChromeBar" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#F8FAFC" />
        <stop offset="50%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="proGoldPlate" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="45%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
      <radialGradient id="glowRed" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#EF4444" stopOpacity="0.9" />
        <stop offset="65%" stopColor="#DC2626" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="glowGold" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
        <stop offset="65%" stopColor="#D97706" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="glowEmerald" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
        <stop offset="65%" stopColor="#059669" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="glowCyan" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
        <stop offset="65%" stopColor="#0284C7" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
      </radialGradient>
      <filter id="glowBlur" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  );

  const Floor = ({ y = 196 }: { y?: number }) => (
    <g>
      <line x1="18" y1={y} x2="302" y2={y} stroke="#334155" strokeWidth="1.5" opacity="0.65" />
      <ellipse cx="160" cy={y + 2} rx="92" ry="5" fill="#020617" opacity="0.6" />
    </g>
  );

  const Sneaker = ({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) => (
    <g transform={`translate(${x}, ${y}) scale(${flip ? -1 : 1}, 1)`}>
      <path d="M -7 -5 L 11 -5 C 15 -5 17 -1 16 2 L -8 2 Z" fill="#0F172A" stroke="#334155" strokeWidth="0.8" />
      <rect x="-8" y="1" width="24" height="3" rx="1.2" fill="#F8FAFC" />
      <line x1="1" y1="-3" x2="7" y2="0" stroke="#D4AF37" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );

  const HeadSide = ({ x, y, angle = 0, flip = false }: { x: number; y: number; angle?: number; flip?: boolean }) => (
    <g transform={`translate(${x}, ${y}) rotate(${angle}) scale(${flip ? -1 : 1}, 1)`}>
      <rect x="-5" y="6" width="10" height="11" rx="4" fill="url(#coachSkinDark)" />
      <circle cx="0" cy="-2" r="12.5" fill="url(#coachSkin)" />
      {/* Neat Athletic Hair */}
      <path
        d="M -12.5 -4 C -12.5 -16 10 -17 12.5 -6 C 7 -10 -4 -10 -9 -4 Z"
        fill="#0F172A"
      />
      {/* Brow + Eye + Ear */}
      <circle cx="-5" cy="-1" r="2.6" fill="url(#coachSkinDark)" />
      <line x1="4" y1="-5" x2="9.5" y2="-4.5" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="7.2" cy="-2.2" r="1.3" fill="#0F172A" />
      {/* Clean Jawline Beard */}
      <path d="M -2 6 C 3 9 9 8 11 3 C 10 8 5 11 -1 9 Z" fill="#0F172A" opacity="0.85" />
    </g>
  );

  const HeadFront = ({ x, y }: { x: number; y: number }) => (
    <g transform={`translate(${x}, ${y})`}>
      <path d="M -13 15 Q 0 10 13 15 L 7 6 L -7 6 Z" fill="url(#coachSkinDark)" />
      <circle cx="0" cy="-3" r="13.5" fill="url(#coachSkin)" />
      <circle cx="-13" cy="-2" r="2.8" fill="url(#coachSkinDark)" />
      <circle cx="13" cy="-2" r="2.8" fill="url(#coachSkinDark)" />
      <path d="M -13.5 -6 C -13 -18 13 -18 13.5 -6 C 8 -12 -8 -12 -13.5 -6 Z" fill="#0F172A" />
      <line x1="-7.5" y1="-5.5" x2="-3" y2="-4.8" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="3" y1="-4.8" x2="7.5" y2="-5.5" stroke="#0F172A" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="-5.2" cy="-2.5" r="1.3" fill="#0F172A" />
      <circle cx="5.2" cy="-2.5" r="1.3" fill="#0F172A" />
      <path d="M -10 2 C -8 10 8 10 10 2 C 7 5.5 -7 5.5 -10 2 Z" fill="#0F172A" opacity="0.85" />
    </g>
  );

  const LimbSegment = ({
    a,
    b,
    width,
    fill,
  }: {
    a: Pt;
    b: Pt;
    width: number;
    fill: string;
  }) => (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={fill}
      strokeWidth={width}
      strokeLinecap="round"
    />
  );

  const ArmRig = ({
    shoulder,
    elbow,
    hand,
    sleeve = true,
    upperColor = 'url(#coachSkin)',
    foreColor = 'url(#coachSkin)',
  }: {
    shoulder: Pt;
    elbow: Pt;
    hand: Pt;
    sleeve?: boolean;
    upperColor?: string;
    foreColor?: string;
  }) => (
    <g>
      <LimbSegment a={shoulder} b={elbow} width={11} fill={upperColor} />
      {sleeve && (
        <circle cx={shoulder.x} cy={shoulder.y} r="7.5" fill="url(#coachShirt)" />
      )}
      <LimbSegment a={elbow} b={hand} width={9} fill={foreColor} />
      <circle cx={elbow.x} cy={elbow.y} r="5" fill={foreColor} />
      {/* Wrist Wrap & Hand */}
      <circle cx={hand.x} cy={hand.y} r="4.5" fill={foreColor} />
      <circle cx={hand.x} cy={hand.y} r="5" fill="none" stroke="#D4AF37" strokeWidth="1.6" opacity="0.85" />
    </g>
  );

  const GlowDot = ({ x, y, color }: { x: number; y: number; color: string }) => (
    <g transform={`translate(${x}, ${y})`}>
      <circle
        r={5 + rep * 6}
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        opacity={0.9 - rep * 0.65}
      />
      <circle r="3" fill={color} stroke="#FFFFFF" strokeWidth="1.1" />
    </g>
  );

  switch (motionType) {
    case 'BENCH_PRESS':
    case 'INCLINE_PRESS': {
      const isIncline = motionType === 'INCLINE_PRESS';
      const shoulder: Pt = isIncline ? { x: 112, y: 112 } : { x: 108, y: 126 };
      const handTarget: Pt = isIncline
        ? { x: 118, y: lerp(92, 54, rep) }
        : { x: 114, y: lerp(112, 66, rep) };
      const arm = solve2BoneIK(shoulder, handTarget, 34, 34, 1);

      return (
        <svg viewBox="0 0 320 220" className="w-full h-full max-h-[205px]">
          {sharedDefs}
          <Floor y={196} />

          {/* Bench Rack & Frame */}
          <rect x="64" y="64" width="7" height="132" rx="3" fill="url(#gymSteel)" />
          <rect x="52" y="191" width="214" height="5" rx="2.5" fill="#1E293B" />
          <rect x="148" y="152" width="9" height="40" rx="2" fill="#334155" />
          <rect x="224" y="152" width="9" height="40" rx="2" fill="#334155" />

          {isIncline ? (
            <g>
              <g transform="translate(154, 152) rotate(-28)">
                <rect x="-82" y="-9" width="84" height="12" rx="5" fill="url(#gymLeather)" stroke="#475569" strokeWidth="1" />
              </g>
              <rect x="158" y="146" width="74" height="12" rx="5" fill="url(#gymLeather)" stroke="#475569" strokeWidth="1" />
            </g>
          ) : (
            <rect x="68" y="144" width="164" height="12" rx="5" fill="url(#gymLeather)" stroke="#475569" strokeWidth="1" />
          )}

          {/* Grounded Leg */}
          <g>
            <LimbSegment
              a={isIncline ? { x: 214, y: 142 } : { x: 210, y: 138 }}
              b={{ x: 242, y: 150 }}
              width={16}
              fill="url(#coachShorts)"
            />
            <LimbSegment a={{ x: 242, y: 150 }} b={{ x: 246, y: 190 }} width={11} fill="url(#coachSkin)" />
            <Sneaker x={248} y={191} />
          </g>

          {/* Torso & Head */}
          <g transform={isIncline ? 'translate(154, 140) rotate(-28)' : 'translate(148, 134)'}>
            <path d="M -62 -10 C -52 -19 -14 -18 8 -11 L 60 -7 L 60 9 L -62 7 Z" fill="url(#coachShirt)" />
            <HeadSide x={-76} y={-5} angle={18} />
            <ellipse
              cx="-36"
              cy="-10"
              rx={14 + rep * 4}
              ry={9 + rep * 2}
              fill="url(#glowRed)"
              filter="url(#glowBlur)"
              opacity={0.4 + rep * 0.55}
            />
          </g>

          {/* 2-Segment IK Arm */}
          <ArmRig shoulder={shoulder} elbow={arm.mid} hand={arm.end} />

          {/* Level Barbell / Dumbbell */}
          <g transform={`translate(${arm.end.x}, ${arm.end.y})`}>
            <rect x="-18" y="-2.5" width="36" height="5" rx="2.5" fill="url(#proChromeBar)" />
            <circle cx="0" cy="0" r={isIncline ? 13 : 16} fill="url(#proGoldPlate)" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="4.5" fill="#1E293B" />
          </g>

          <GlowDot x={isIncline ? 122 : 114} y={isIncline ? 114 : 122} color="#EF4444" />
        </svg>
      );
    }

    case 'CABLE_FLY': {
      const lShoulder: Pt = { x: 134, y: 80 };
      const rShoulder: Pt = { x: 186, y: 80 };
      const lHandTarget: Pt = { x: lerp(78, 150, rep), y: lerp(88, 102, rep) };
      const rHandTarget: Pt = { x: lerp(242, 170, rep), y: lerp(88, 102, rep) };
      const lArm = solve2BoneIK(lShoulder, lHandTarget, 31, 31, -1);
      const rArm = solve2BoneIK(rShoulder, rHandTarget, 31, 31, 1);

      return (
        <svg viewBox="0 0 320 220" className="w-full h-full max-h-[205px]">
          {sharedDefs}
          <Floor y={198} />

          {/* Cable Crossover Frame */}
          <rect x="26" y="18" width="12" height="178" rx="4" fill="url(#gymSteel)" />
          <rect x="282" y="18" width="12" height="178" rx="4" fill="url(#gymSteel)" />
          <rect x="26" y="18" width="268" height="9" rx="4" fill="#334155" />
          <circle cx="40" cy="78" r="6" fill="#94A3B8" stroke="#D4AF37" strokeWidth="1.5" />
          <circle cx="280" cy="78" r="6" fill="#94A3B8" stroke="#D4AF37" strokeWidth="1.5" />

          {/* Live Cables Locked to Pulleys & Hands */}
          <line x1="40" y1="78" x2={lArm.end.x} y2={lArm.end.y} stroke="#94A3B8" strokeWidth="1.6" strokeDasharray="3 2" opacity="0.75" />
          <line x1="280" y1="78" x2={rArm.end.x} y2={rArm.end.y} stroke="#94A3B8" strokeWidth="1.6" strokeDasharray="3 2" opacity="0.75" />

          {/* Legs */}
          <LimbSegment a={{ x: 147, y: 132 }} b={{ x: 143, y: 162 }} width={15} fill="url(#coachShorts)" />
          <LimbSegment a={{ x: 173, y: 132 }} b={{ x: 177, y: 162 }} width={15} fill="url(#coachShorts)" />
          <LimbSegment a={{ x: 143, y: 162 }} b={{ x: 141, y: 192 }} width={11} fill="url(#coachSkin)" />
          <LimbSegment a={{ x: 177, y: 162 }} b={{ x: 179, y: 192 }} width={11} fill="url(#coachSkin)" />
          <Sneaker x={140} y={193} flip />
          <Sneaker x={180} y={193} />

          {/* Athletic Torso */}
          <path d="M 126 74 Q 160 66 194 74 L 182 134 L 138 134 Z" fill="url(#coachShirt)" />
          <HeadFront x={160} y={46} />

          {/* Glowing Pecs */}
          <ellipse cx="148" cy="92" rx={10 + rep * 3} ry={8 + rep * 2} fill="url(#glowRed)" filter="url(#glowBlur)" opacity={0.35 + rep * 0.6} />
          <ellipse cx="172" cy="92" rx={10 + rep * 3} ry={8 + rep * 2} fill="url(#glowRed)" filter="url(#glowBlur)" opacity={0.35 + rep * 0.6} />

          {/* Left & Right 2-Segment IK Arms */}
          <ArmRig shoulder={lShoulder} elbow={lArm.mid} hand={lArm.end} />
          <ArmRig shoulder={rShoulder} elbow={rArm.mid} hand={rArm.end} />

          <GlowDot x={160} y={92} color="#EF4444" />
        </svg>
      );
    }

    case 'BARBELL_SQUAT': {
      const ankle: Pt = { x: 162, y: 190 };
      const knee: Pt = {
        x: lerp(164, 184, rep),
        y: lerp(146, 152, rep),
      };
      const hip: Pt = {
        x: lerp(156, 134, rep),
        y: lerp(104, 142, rep),
      };
      const shoulder: Pt = {
        x: lerp(160, 154, rep),
        y: lerp(54, 96, rep),
      };
      const barPos: Pt = { x: shoulder.x - 6, y: shoulder.y - 3 };
      const elbow: Pt = { x: shoulder.x - 14, y: shoulder.y + 16 };

      return (
        <svg viewBox="0 0 320 220" className="w-full h-full max-h-[205px]">
          {sharedDefs}
          <Floor y={198} />

          <rect x="78" y="32" width="8" height="166" rx="3" fill="url(#gymSteel)" />
          <rect x="66" y="193" width="44" height="5" rx="2" fill="#1E293B" />

          {/* Lower Leg (Ankle -> Knee) */}
          <LimbSegment a={ankle} b={knee} width={13} fill="url(#coachSkin)" />
          <Sneaker x={ankle.x + 2} y={191} />

          {/* Thigh (Knee -> Hip) */}
          <LimbSegment a={knee} b={hip} width={19} fill="url(#coachShorts)" />
          <ellipse
            cx={(knee.x + hip.x) / 2 + 4}
            cy={(knee.y + hip.y) / 2}
            rx={10 + rep * 3}
            ry={16 + rep * 4}
            fill="url(#glowGold)"
            filter="url(#glowBlur)"
            opacity={0.38 + rep * 0.57}
          />

          {/* Torso (Hip -> Shoulder) */}
          <LimbSegment a={hip} b={shoulder} width={24} fill="url(#coachShirt)" />
          <HeadSide x={shoulder.x + 4} y={shoulder.y - 17} angle={lerp(0, 12, rep)} />

          {/* Arm Holding Barbell */}
          <ArmRig shoulder={shoulder} elbow={elbow} hand={barPos} sleeve={false} />

          {/* Barbell */}
          <g transform={`translate(${barPos.x}, ${barPos.y})`}>
            <circle cx="0" cy="0" r="18" fill="url(#proGoldPlate)" stroke="#0F172A" strokeWidth="1.8" />
            <circle cx="0" cy="0" r="5" fill="url(#proChromeBar)" />
          </g>

          <GlowDot x={(knee.x + hip.x) / 2 + 4} y={(knee.y + hip.y) / 2} color="#F59E0B" />
        </svg>
      );
    }

    case 'ROMANIAN_DEADLIFT': {
      const ankle: Pt = { x: 154, y: 190 };
      const knee: Pt = { x: lerp(156, 162, rep), y: lerp(146, 148, rep) };
      const hip: Pt = { x: lerp(154, 128, rep), y: lerp(104, 108, rep) };
      const shoulder: Pt = {
        x: lerp(156, 184, rep),
        y: lerp(54, 96, rep),
      };
      const hand: Pt = { x: shoulder.x - 2, y: shoulder.y + 46 };
      const elbow: Pt = { x: shoulder.x - 2, y: shoulder.y + 23 };

      return (
        <svg viewBox="0 0 320 220" className="w-full h-full max-h-[205px]">
          {sharedDefs}
          <Floor y={198} />

          <LimbSegment a={ankle} b={knee} width={13} fill="url(#coachSkin)" />
          <Sneaker x={ankle.x + 2} y={191} />

          <LimbSegment a={knee} b={hip} width={19} fill="url(#coachShorts)" />
          <ellipse
            cx={(knee.x + hip.x) / 2 - 7}
            cy={(knee.y + hip.y) / 2}
            rx={10 + rep * 3}
            ry={17 + rep * 4}
            fill="url(#glowGold)"
            filter="url(#glowBlur)"
            opacity={0.38 + rep * 0.57}
          />

          <LimbSegment a={hip} b={shoulder} width={24} fill="url(#coachShirt)" />
          <HeadSide x={shoulder.x + 8} y={shoulder.y - 14} angle={lerp(0, 32, rep)} />

          <ArmRig shoulder={shoulder} elbow={elbow} hand={hand} />

          <g transform={`translate(${hand.x}, ${hand.y})`}>
            <circle cx="0" cy="0" r="18" fill="url(#proGoldPlate)" stroke="#0F172A" strokeWidth="1.8" />
            <circle cx="0" cy="0" r="5" fill="url(#proChromeBar)" />
          </g>

          <GlowDot x={(knee.x + hip.x) / 2 - 7} y={(knee.y + hip.y) / 2} color="#F59E0B" />
        </svg>
      );
    }

    case 'LAT_PULLDOWN': {
      const shoulder: Pt = { x: 168, y: 84 };
      const barY = lerp(42, 86, rep);
      const handTarget: Pt = { x: 158, y: barY };
      const arm = solve2BoneIK(shoulder, handTarget, 30, 30, -1);

      return (
        <svg viewBox="0 0 320 220" className="w-full h-full max-h-[205px]">
          {sharedDefs}
          <Floor y={200} />

          {/* Machine */}
          <rect x="86" y="14" width="10" height="184" rx="3" fill="url(#gymSteel)" />
          <rect x="86" y="14" width="104" height="9" rx="3" fill="#334155" />
          <circle cx="158" cy="24" r="6" fill="#94A3B8" stroke="#D4AF37" strokeWidth="1.5" />
          <line x1="158" y1="24" x2={arm.end.x} y2={arm.end.y} stroke="#94A3B8" strokeWidth="1.6" strokeDasharray="3 2" />
          <rect x="116" y="144" width="70" height="11" rx="4" fill="url(#gymLeather)" />
          <rect x="148" y="155" width="9" height="43" rx="2" fill="#334155" />
          <rect x="114" y="118" width="24" height="10" rx="5" fill="url(#gymLeather)" stroke="#D4AF37" strokeWidth="1" />

          {/* Seated Legs */}
          <LimbSegment a={{ x: 168, y: 138 }} b={{ x: 126, y: 138 }} width={16} fill="url(#coachShorts)" />
          <LimbSegment a={{ x: 126, y: 138 }} b={{ x: 124, y: 190 }} width={12} fill="url(#coachSkin)" />
          <Sneaker x={122} y={191} flip />

          {/* Torso */}
          <LimbSegment a={{ x: 166, y: 138 }} b={shoulder} width={25} fill="url(#coachShirt)" />
          <HeadSide x={165} y={66} flip />

          <ellipse cx="173" cy="108" rx={12 + rep * 3} ry={17 + rep * 4} fill="url(#glowCyan)" filter="url(#glowBlur)" opacity={0.38 + rep * 0.57} />

          <ArmRig shoulder={shoulder} elbow={arm.mid} hand={arm.end} />

          {/* Lat Bar */}
          <g transform={`translate(${arm.end.x}, ${arm.end.y})`}>
            <rect x="-26" y="-2.5" width="52" height="5" rx="2.5" fill="url(#proChromeBar)" />
            <circle cx="0" cy="0" r="4.5" fill="#D4AF37" />
          </g>

          <GlowDot x={173} y={108} color="#38BDF8" />
        </svg>
      );
    }

    case 'BARBELL_ROW': {
      const ankle: Pt = { x: 138, y: 190 };
      const knee: Pt = { x: 146, y: 148 };
      const hip: Pt = { x: 132, y: 106 };
      const shoulder: Pt = { x: 174, y: 74 };
      const handTarget: Pt = { x: lerp(176, 158, rep), y: lerp(132, 98, rep) };
      const arm = solve2BoneIK(shoulder, handTarget, 30, 30, -1);

      return (
        <svg viewBox="0 0 320 220" className="w-full h-full max-h-[205px]">
          {sharedDefs}
          <Floor y={198} />

          <LimbSegment a={ankle} b={knee} width={13} fill="url(#coachSkin)" />
          <Sneaker x={ankle.x + 2} y={191} />
          <LimbSegment a={knee} b={hip} width={19} fill="url(#coachShorts)" />
          <LimbSegment a={hip} b={shoulder} width={24} fill="url(#coachShirt)" />
          <HeadSide x={184} y={60} angle={24} />

          <ellipse cx="152" cy="86" rx={12 + rep * 3} ry={16 + rep * 4} fill="url(#glowCyan)" filter="url(#glowBlur)" opacity={0.38 + rep * 0.57} />

          <ArmRig shoulder={shoulder} elbow={arm.mid} hand={arm.end} />

          <g transform={`translate(${arm.end.x}, ${arm.end.y})`}>
            <circle cx="0" cy="0" r="17" fill="url(#proGoldPlate)" stroke="#0F172A" strokeWidth="1.8" />
            <circle cx="0" cy="0" r="4.5" fill="url(#proChromeBar)" />
          </g>

          <GlowDot x={152} y={86} color="#38BDF8" />
        </svg>
      );
    }

    case 'LATERAL_RAISE': {
      const lShoulder: Pt = { x: 134, y: 80 };
      const rShoulder: Pt = { x: 186, y: 80 };
      const lHandTarget: Pt = { x: lerp(116, 74, rep), y: lerp(136, 82, rep) };
      const rHandTarget: Pt = { x: lerp(204, 246, rep), y: lerp(136, 82, rep) };
      const lArm = solve2BoneIK(lShoulder, lHandTarget, 30, 30, 1);
      const rArm = solve2BoneIK(rShoulder, rHandTarget, 30, 30, -1);

      return (
        <svg viewBox="0 0 320 220" className="w-full h-full max-h-[205px]">
          {sharedDefs}
          <Floor y={198} />

          <LimbSegment a={{ x: 147, y: 132 }} b={{ x: 143, y: 162 }} width={15} fill="url(#coachShorts)" />
          <LimbSegment a={{ x: 173, y: 132 }} b={{ x: 177, y: 162 }} width={15} fill="url(#coachShorts)" />
          <LimbSegment a={{ x: 143, y: 162 }} b={{ x: 141, y: 192 }} width={11} fill="url(#coachSkin)" />
          <LimbSegment a={{ x: 177, y: 162 }} b={{ x: 179, y: 192 }} width={11} fill="url(#coachSkin)" />
          <Sneaker x={140} y={193} flip />
          <Sneaker x={180} y={193} />

          <path d="M 126 74 Q 160 66 194 74 L 182 134 L 138 134 Z" fill="url(#coachShirt)" />
          <HeadFront x={160} y={46} />

          <ellipse cx="132" cy="78" rx={10 + rep * 3} ry={8 + rep * 3} fill="url(#glowGold)" filter="url(#glowBlur)" opacity={0.38 + rep * 0.57} />
          <ellipse cx="188" cy="78" rx={10 + rep * 3} ry={8 + rep * 3} fill="url(#glowGold)" filter="url(#glowBlur)" opacity={0.38 + rep * 0.57} />

          <ArmRig shoulder={lShoulder} elbow={lArm.mid} hand={lArm.end} />
          <ArmRig shoulder={rShoulder} elbow={rArm.mid} hand={rArm.end} />

          {/* Horizontal Dumbbells */}
          {[lArm.end, rArm.end].map((h, i) => (
            <g key={i} transform={`translate(${h.x}, ${h.y})`}>
              <rect x="-11" y="-2.5" width="22" height="5" rx="2" fill="url(#proChromeBar)" />
              <rect x="-14" y="-7" width="6" height="14" rx="2" fill="url(#proGoldPlate)" />
              <rect x="8" y="-7" width="6" height="14" rx="2" fill="url(#proGoldPlate)" />
            </g>
          ))}

          <GlowDot x={188} y={78} color="#F59E0B" />
        </svg>
      );
    }

    case 'TRICEPS_PUSHDOWN':
    case 'BICEPS_CURL':
    default: {
      const isBiceps = motionType === 'BICEPS_CURL';
      const pinColor = isBiceps ? '#EF4444' : '#10B981';
      const shoulder: Pt = { x: 150, y: 78 };
      const elbow: Pt = { x: 152, y: 112 };
      const angle = isBiceps
        ? lerp(1.38, -0.35, rep)
        : lerp(-0.15, 1.35, rep);
      const hand: Pt = {
        x: elbow.x + Math.cos(angle) * 34,
        y: elbow.y + Math.sin(angle) * 34,
      };

      return (
        <svg viewBox="0 0 320 220" className="w-full h-full max-h-[205px]">
          {sharedDefs}
          <Floor y={198} />

          {!isBiceps && (
            <g>
              <rect x="228" y="16" width="11" height="180" rx="3" fill="url(#gymSteel)" />
              <rect x="190" y="16" width="48" height="8" rx="3" fill="#334155" />
              <circle cx="195" cy="24" r="5" fill="#94A3B8" stroke="#D4AF37" strokeWidth="1.4" />
              <line x1="195" y1="24" x2={hand.x} y2={hand.y} stroke="#94A3B8" strokeWidth="1.6" strokeDasharray="3 2" />
            </g>
          )}

          <LimbSegment a={{ x: 148, y: 130 }} b={{ x: 149, y: 162 }} width={16} fill="url(#coachShorts)" />
          <LimbSegment a={{ x: 149, y: 162 }} b={{ x: 148, y: 192 }} width={12} fill="url(#coachSkin)" />
          <Sneaker x={148} y={192} />

          <path d="M 134 70 L 166 70 L 162 132 L 136 132 Z" fill="url(#coachShirt)" />
          <HeadSide x={152} y={49} />

          <ellipse
            cx={isBiceps ? 156 : 144}
            cy="95"
            rx={10 + rep * 3}
            ry={14 + rep * 3}
            fill={isBiceps ? 'url(#glowRed)' : 'url(#glowEmerald)'}
            filter="url(#glowBlur)"
            opacity={0.38 + rep * 0.57}
          />

          <ArmRig shoulder={shoulder} elbow={elbow} hand={hand} />

          {isBiceps ? (
            <g transform={`translate(${hand.x}, ${hand.y})`}>
              <rect x="-14" y="-2.5" width="28" height="5" rx="2" fill="url(#proChromeBar)" />
              <circle cx="-14" cy="0" r="8" fill="url(#proGoldPlate)" stroke="#0F172A" strokeWidth="1" />
              <circle cx="14" cy="0" r="8" fill="url(#proGoldPlate)" stroke="#0F172A" strokeWidth="1" />
            </g>
          ) : (
            <g transform={`translate(${hand.x}, ${hand.y})`}>
              <path d="M 0 0 L -8 13 M 0 0 L 8 13" stroke="#D4AF37" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="-8" cy="13" r="3.8" fill="#0F172A" stroke="#94A3B8" strokeWidth="1" />
              <circle cx="8" cy="13" r="3.8" fill="#0F172A" stroke="#94A3B8" strokeWidth="1" />
            </g>
          )}

          <GlowDot x={isBiceps ? 156 : 144} y={95} color={pinColor} />
        </svg>
      );
    }
  }
}
