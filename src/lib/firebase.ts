import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// הגדרות פרויקט א' - ה-CRM המרכזי
const firebaseConfigCRM = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_CRM,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_CRM,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_CRM,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_CRM,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_CRM,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_CRM
};

// הגדרות פרויקט ב' - אפליקציית הלקוח (Whatasap)
const firebaseConfigClient = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_CLIENT,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_CLIENT,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_CLIENT,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_CLIENT,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_CLIENT,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_CLIENT
};

// אתחול כפול חכם
const appCRM = !getApps().length ? initializeApp(firebaseConfigCRM) : getApp();
const appClient = getApps().length < 2 
  ? initializeApp(firebaseConfigClient, "clientApp") 
  : getApp("clientApp");

export const dbCRM = getFirestore(appCRM);
export const dbClient = getFirestore(appClient);
