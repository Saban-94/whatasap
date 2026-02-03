'use client';
import { useEffect } from 'react';

export default function RegisterServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // register only in production builds ideally
      // Adjust the NODE_ENV check if you want to test locally
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
        // You can register in development for testing if desired:
        // navigator.serviceWorker.register('/sw.js').catch(console.error);
        console.log('Skipping SW registration in development.');
      }
    }
  }, []);

  return null;
}
