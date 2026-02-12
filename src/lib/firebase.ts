import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // נוסף עבור איתוראן

// פרויקט א' - ה-CRM הניהולי (ח. סבן)
const firebaseConfigCRM = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_CRM,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_CRM,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_CRM,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_CRM,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_CRM,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_CRM,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL_CRM // נחוץ לאיתוראן
};

// פרויקט ב' - אפליקציית הלקוח (Whatasap / שיפוצים)
const firebaseConfigClient = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_CLIENT,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_CLIENT,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_CLIENT,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_CLIENT
};

// אתחול
const app = !getApps().length ? initializeApp(firebaseConfigCRM) : getApp();
const clientApp = getApps().length < 2 ? initializeApp(firebaseConfigClient, "clientApp") : getApp("clientApp");

export const db = getFirestore(app); // ה-DB הראשי
export const database = getDatabase(app); // עבור ניתוח איתוראן (פותר את ה-404 בבנייה)
export const dbClient = getFirestore(clientApp); // ה-DB של השיפוצים
