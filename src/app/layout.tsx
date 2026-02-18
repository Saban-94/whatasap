import './globals.css';
import { Inter } from 'next/font/google';
import RegisterServiceWorker from '@/components/RegisterServiceWorker';
import NotificationManager from '@/components/NotificationManager';
import ChatWidget from '@/components/ChatWidget';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Saban OS - ח. סבן',
  description: 'מערכת ניהול ולוגיסטיקה חכמה',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={inter.className}>
        <RegisterServiceWorker />
        <NotificationManager />
        
        <main className="min-h-screen bg-black text-white">
          {children}
        </main>

        {/* הצ'אט החדש והנקי של גימני */}
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-[350px]">
          <ChatWidget />
        </div>
      </body>
    </html>
  );
}
