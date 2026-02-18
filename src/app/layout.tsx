import './globals.css';
import { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import RegisterServiceWorker from '@/components/RegisterServiceWorker';
import NotificationManager from '@/components/NotificationManager';
import InstallButton from '@/components/InstallButton';
import ChatWidget from '@/components/ChatWidget';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'H. Saban Logistics | Saban OS',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  themeColor: '#075e54',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        {/* טעינת ה-SDK של OneSignal */}
        <script 
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" 
          defer 
        ></script>
      </head>
      <body className={`${inter.className} bg-black text-white antialiased`}>
        {/* מנהל ההתראות וה-Service Worker */}
        <NotificationManager />
        <RegisterServiceWorker />
        
        <main>{children}</main>
        
        {/* כפתורי צפה */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
          <InstallButton />
          <ChatWidget />
        </div>
      </body>
    </html>
  );
}
