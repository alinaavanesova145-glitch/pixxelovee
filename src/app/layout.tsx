import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

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
    <html lang="en">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
