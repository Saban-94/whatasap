'use client';
import { useEffect, useState } from 'react';

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  if (!deferredPrompt) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-50">
      <button 
        onClick={() => {
          deferredPrompt.prompt();
          setDeferredPrompt(null);
        }}
        className="btn-huge bg-[#1976D2] text-white shadow-2xl animate-bounce"
      >
        📲 התקן את אפליקציית ח. סבן
      </button>
    </div>
  );
}
