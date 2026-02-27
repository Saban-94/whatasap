import './globals.css';
import { Inter } from 'next/font/google';
import RegisterServiceWorker from '@/components/RegisterServiceWorker';
import NotificationManager from '@/components/NotificationManager';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Saban OS - ח. סבן',
  description: 'מערכת ניהול ולוגיסטיקה חכמה',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico', // שימוש בלוגו ח. סבן המקצועי
    apple: '/1000211661.jpg', // אייקון לאייפון
  },
  themeColor: '#00a884', // צבע ירוק סבן לפס העליון בנייד
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        {/* רישום ה-Service Worker לביצועים מהירים ואופליין */}
        <RegisterServiceWorker />
        
        {/* ניהול התראות דחיפה ללקוחות ונציגים */}
        <NotificationManager />
        
        <main className="min-h-screen">
          {children}
        </main>

        {/* האווטאר הנושם המרכזי יכול להיות מוטמע כאן כ-Global Overlay אם תרצה */}
        <div className="fixed bottom-6 right-6 z-[100]">
           {/* כאן יבוא הרכיב של ה-AI Orb במידה ותרצה אותו זמין מכל דף */}
        </div>
      </body>
    </html>
  );
}
