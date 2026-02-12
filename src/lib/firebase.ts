import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfigCRM = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_CRM,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_CRM,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_CRM,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_CRM,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_CRM,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_CRM,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL_CRM
};

const firebaseConfigClient = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_CLIENT,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_CLIENT,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_CLIENT,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_CLIENT
};

// אתחול האפליקציות
const app = !getApps().length ? initializeApp(firebaseConfigCRM) : getApp();
const clientApp = getApps().length < 2 ? initializeApp(firebaseConfigClient, "clientApp") : getApp("clientApp");

// ייצוא המשתנים לשימוש בשאר המערכת
export const db = getFirestore(app);
export const database = getDatabase(app); 
export const dbCRM = getFirestore(app); 
export const dbClient = getFirestore(clientApp);
