'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone } from 'lucide-react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // בדיקה אם האפליקציה כבר מותקנת
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // האזנה לאירוע המוכנות להתקנה
    window.addEventListener('beforeinstallprompt', (e) => {
      // מניעת הופעת הבאנר המובנה של הדפדפן
      e.preventDefault();
      // שמירת האירוע כדי להפעיל אותו ידנית
      setDeferredPrompt(e);
    });

    // האזנה לאירוע התקנה מוצלחת
    window.addEventListener('appinstalled', () => {
      console.log('Saban OS הותקנה בהצלחה!');
      setIsInstalled(true);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // הצגת חלון ההתקנה של הדפדפן
    deferredPrompt.prompt();

    // המתנה לתשובת המשתמש
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install: ${outcome}`);

    // ניקוי האירוע
    setDeferredPrompt(null);
  };

  // אם האפליקציה כבר מותקנת או שהדפדפן לא מוכן להתקנה - אל תציג כלום
  if (isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="group relative flex items-center justify-center gap-3 bg-[#075e54] hover:bg-[#128c7e] text-white px-6 py-4 rounded-2xl shadow-[0_10px_30px_rgba(7,94,84,0.3)] transition-all active:scale-95 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </div>
      
      <Download className="w-5 h-5 group-hover:bounce" />
      <div className="flex flex-col items-start">
        <span className="text-sm font-bold leading-none">התקן אפליקציה</span>
        <span className="text-[10px] opacity-80 italic">Saban OS לנייד</span>
      </div>
    </button>
  );
}
