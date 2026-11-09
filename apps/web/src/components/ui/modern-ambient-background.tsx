'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface ModernAmbientBackgroundProps {
  variant?: 'storefront' | 'full' | 'subtle';
  className?: string;
}

export const ModernAmbientBackground: React.FC<ModernAmbientBackgroundProps> = ({
  variant = 'full',
  className = '',
}) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden select-none ${className}`}
    >
      {/* 1. ATHLETIC BLUEPRINT / DOT MATRIX GRID WITH RADIAL FADE */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/[0.04] via-transparent to-transparent opacity-80" />
      
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.22] dark:opacity-[0.16] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_25%,#000_65%,transparent_100%)]"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern id="modern-fitness-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
              className="text-slate-300 dark:text-slate-700"
              strokeDasharray="2 6"
            />
            <circle cx="24" cy="24" r="1" className="fill-amber-500/40 dark:fill-amber-400/50" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#modern-fitness-grid)" />
      </svg>

      {/* 2. DYNAMIC FLOATING AMBIENT GLOW MESHES (ORBS) */}
      {/* Top Gold / Amber Luxury Energy Orb */}
      <motion.div
        animate={{
          x: [0, 25, -20, 0],
          y: [0, -35, 15, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-32 start-1/4 h-[480px] w-[520px] rounded-full bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-amber-600/5 blur-[100px] dark:from-amber-500/15 dark:via-orange-600/10 dark:to-transparent"
      />

      {/* Emerald / Athletic Green Glow Orb (Opposite Corner) */}
      <motion.div
        animate={{
          x: [0, -35, 20, 0],
          y: [0, 40, -25, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute top-1/3 end-[-100px] h-[550px] w-[500px] rounded-full bg-gradient-to-bl from-emerald-500/15 via-teal-500/10 to-transparent blur-[110px] dark:from-emerald-500/12 dark:via-teal-600/10"
      />

      {/* Electric Cyan / Sports Indigo Core Depth Orb */}
      <motion.div
        animate={{
          x: [0, 30, -30, 0],
          y: [0, -25, 30, 0],
          scale: [0.95, 1.12, 1, 0.95],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
        className="absolute bottom-10 start-[-80px] h-[450px] w-[480px] rounded-full bg-gradient-to-tr from-sky-500/12 via-indigo-500/8 to-transparent blur-[120px] dark:from-sky-500/10 dark:via-indigo-600/10"
      />

      {/* 3. MODERN FLOATING ATHLETIC GEOMETRIC WIREFRAMES */}
      {/* Precision Fitness Ring (Hexagonal / Circular Target) */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.05, 1],
        }}
        transition={{
          rotate: { duration: 90, repeat: Infinity, ease: 'linear' },
          scale: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute top-28 end-12 hidden h-44 w-44 rounded-full border border-dashed border-amber-500/25 dark:border-amber-400/20 lg:block"
      >
        <div className="absolute inset-4 rounded-full border border-slate-300/40 dark:border-slate-700/40" />
        <div className="absolute top-1/2 left-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-amber-500 shadow-sm shadow-amber-500" />
        <div className="absolute top-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
      </motion.div>

      {/* Athletic Velocity Bars (Left/Start) */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          opacity: [0.35, 0.65, 0.35],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 start-8 hidden space-y-2 lg:block"
      >
        <div className="h-0.5 w-16 bg-gradient-to-r from-amber-500/50 to-transparent" />
        <div className="h-0.5 w-24 bg-gradient-to-r from-amber-500/35 to-transparent" />
        <div className="h-0.5 w-12 bg-gradient-to-r from-emerald-500/40 to-transparent" />
      </motion.div>

      {/* Telemetry Precision Crosshairs */}
      <div className="absolute top-48 start-1/3 hidden h-6 w-6 items-center justify-center opacity-30 dark:opacity-20 xl:flex">
        <div className="h-full w-[1px] bg-slate-400 dark:bg-slate-600" />
        <div className="absolute h-[1px] w-full bg-slate-400 dark:bg-slate-600" />
      </div>
      <div className="absolute bottom-60 end-1/4 hidden h-6 w-6 items-center justify-center opacity-30 dark:opacity-20 xl:flex">
        <div className="h-full w-[1px] bg-amber-500/60" />
        <div className="absolute h-[1px] w-full bg-amber-500/60" />
      </div>
    </div>
  );
};
