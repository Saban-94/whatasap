'use client';

import { useEffect } from 'react';

export default function RegisterServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register only in production by default. Remove the check to test locally.
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('Service Worker registered:', reg);
          })
          .catch((err) => {
            console.error('Service Worker registration failed:', err);
          });
      } else {
        // Optionally register on localhost for testing:
        // navigator.serviceWorker.register('/sw.js').catch(console.error);
        console.log('Skipping SW registration in development.');
      }
    }
  }, []);

  return null;
}
