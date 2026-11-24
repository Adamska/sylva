import type { Metadata, Viewport } from 'next';
import { Geist, IBM_Plex_Mono, Instrument_Serif } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const instrument = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-instrument' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono' });

export const metadata: Metadata = {
  title: 'Sylva — Procedural Botanical Atelier',
  description: 'Grow, sculpt and export procedural plants from formal L-system grammars.',
};

export const viewport: Viewport = {
  themeColor: '#07080a',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${instrument.variable} ${plexMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
