"use client";
import { useEffect, useState } from 'react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      setDeferredPrompt(null);
    }
  };

  if (!deferredPrompt) return null;

  return (
    <button 
      onClick={handleInstall}
      className="fixed bottom-20 left-4 bg-[#00a884] text-white px-4 py-2 rounded-full shadow-lg font-bold z-50 animate-bounce"
    >
      📥 התקן אפליקציה
    </button>
  );
}
