import type { Metadata, Viewport } from 'next';
import './globals.css';
import './ceremony.css';
import { Sparkles } from '@/components/Sparkles';

export const metadata: Metadata = {
  title: 'Agregaydos Awards 2026',
  description: 'A noite mais glamourosa do ano. Só para convidados.',
  robots: { index: false, follow: false },
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0c0507',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Montserrat:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,500&display=swap"
        />
      </head>
      <body>
        <Sparkles />
        {children}
      </body>
    </html>
  );
}
