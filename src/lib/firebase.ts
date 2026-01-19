import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// בדיקת תקינות - אם ה-Project ID ריק, נשתמש בערך קשיח כגיבוי
if (!firebaseConfig.projectId) {
  console.error("⚠️ Vercel Environment Variables missing! Using hardcoded fallback.");
  firebaseConfig.projectId = "ituran-9722e";
  firebaseConfig.apiKey = "AIzaSyAXb3Of5uay1-hR9Z7WGyNwzSuUaqa4OvU";
  // תוסיף כאן את השאר אם אתה רוצה גיבוי מלא
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
