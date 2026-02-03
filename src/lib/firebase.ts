import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// הגדרות Firebase - משיכת נתונים מ-Environment Variables של Vercel
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "app-saban94-57361.firebaseapp.com",
  projectId: "app-saban94-57361",
  storageBucket: "app-saban94-57361.appspot.com",
  messagingSenderId: "956627581512",
  appId: "1:956627581512:web:75d5830e1182ec015cfdff",
};

// אתחול האפליקציה (מניעת כפילות ב-Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/**
 * 1. Firestore (db)
 * מיועד לקטלוג המוצרים והזרקת הידע.
 * הגדרת experimentalAutoDetectLongPolling פותרת את בעיות ה-QUIC שראינו.
 */
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});

/**
 * 2. Realtime Database (database)
 * מיועד לדיווחים היומיים וללוגיסטיקה (analysis/daily-report).
 * הוספת הייצוא הזה פותרת את שגיאת ה-Compile של Turbopack.
 */
export const database = getDatabase(
  app,
  "https://app-saban94-57361-default-rtdb.europe-west1.firebasedatabase.app"
);

export const auth = getAuth(app);

export default app;
