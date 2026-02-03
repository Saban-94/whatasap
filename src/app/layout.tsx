import './globals.css';
import RegisterServiceWorker from '@/components/RegisterServiceWorker';
import ChatWidget from '@/components/ChatWidget';
import InstallButton from '@/components/InstallButton';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <RegisterServiceWorker />
        {children}
          
        <div className="fixed bottom-4 right-4 z-50">
          <InstallButton />
        </div>
      </body>
    </html>
  );
}
