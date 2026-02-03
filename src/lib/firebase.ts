import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// הגדרות הפרויקט של ח. סבן
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "app-saban94-57361.firebaseapp.com",
  databaseURL: "https://app-saban94-57361-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "app-saban94-57361",
  storageBucket: "app-saban94-57361.appspot.com",
  messagingSenderId: "956627581512",
  appId: "1:956627581512:web:75d5830e1182ec015cfdff"
};

// מניעת אתחול כפול של Firebase ב-Next.js
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/**
 * הגדרת Firestore עם פתרונות יציבות:
 * 1. experimentalForceLongPolling - עוקף בעיות פרוטוקול QUIC שראינו בלוגים.
 * 2. timeoutSeconds: 25 - מונע מהחיבור להתנתק לפני הזמן ע"י שרתים בדרך.
 */
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalLongPollingOptions: {
    timeoutSeconds: 25,
  },
});

export const auth = getAuth(app);

export default app;
