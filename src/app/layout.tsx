import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import RegisterServiceWorker from '@/components/RegisterServiceWorker';
import InstallButton from '@/components/InstallButton';
import ChatWidget from '@/components/ChatWidget';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'H. Saban Expert Advisor',
  description: 'מערכת ניהול וייעוץ חומרי בניין ח. סבן',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        {/* PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1976D2" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <RegisterServiceWorker />
        {children}
        <InstallButton />
        <ChatWidget />
      </body>
    </html>
  );
}
