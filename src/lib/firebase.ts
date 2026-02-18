import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// שימוש במפתחות כפי שהם מופיעים ב-Vercel שלך
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
};

// אתחול אפליקציה ראשית (CRM)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// הגנה: אתחול אפליקציית לקוח רק אם יש מפתחות ייעודיים, אחרת שימוש באפליקציה הראשית
const clientApp = process.env.NEXT_PUBLIC_FIREBASE_API_KEY_CLIENT 
  ? (getApps().length < 2 ? initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_CLIENT,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_CLIENT,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_CLIENT,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_CLIENT
    }, "clientApp") : getApp("clientApp"))
  : app;

// ייצוא המשתנים (מותאם למה ששאר הקבצים שלך מחפשים)
export const db = getFirestore(app);
export const database = getDatabase(app); 
export const dbCRM = getFirestore(app); 
export const dbClient = getFirestore(clientApp);
export { app };
