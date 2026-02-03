'use client';
import React from 'react';
import { usePWAInstall } from './usePWAInstall';

export default function InstallButton() {
  const { deferredPrompt, prompt } = usePWAInstall();

  if (!deferredPrompt) return null;

  return (
    <button
      className="btn-huge"
      onClick={() => {
        void prompt();
      }}
      aria-label="Install app"
    >
      התקן את האפליקציה
    </button>
  );
}
