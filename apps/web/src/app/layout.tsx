import { PLATFORM_CONFIG } from '@gymos/config';
import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';
import React from 'react';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: `${PLATFORM_CONFIG.appName} — منصة التدريب والتغذية وإدارة الأندية الرياضية`,
  description: PLATFORM_CONFIG.tagline.ar,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${inter.variable} ${cairo.variable}`}>
      <body className="bg-white text-slate-900 antialiased selection:bg-amber-400 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
