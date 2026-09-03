import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Fredoka, Quicksand, Press_Start_2P } from 'next/font/google';
import './globals.css';

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
});

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-quicksand',
  display: 'swap',
});

const pressStart2P = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-press-start-2p',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'pixxelovee',
    template: '%s — pixxelovee',
  },
  description: 'Turn a memory into a pixel-art world.',
  openGraph: {
    siteName: 'pixxelovee',
    title: 'pixxelovee',
    description: 'Turn a memory into a pixel-art world.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${quicksand.variable} ${pressStart2P.variable}`}>
      <body className="bg-black font-sans text-white antialiased">{children}</body>
    </html>
  );
}
