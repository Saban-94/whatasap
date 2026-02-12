import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // הוסף את זה
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: "https://ituran-94-default-rtdb.asia-southeast1.firebasedatabase.app" // וודא שהלינק נכון
};

// אתחול האפליקציה (מונע אתחול כפול)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// ייצוא השירותים
export const db = getFirestore(app);
export const storage = getStorage(app);
export const database = getDatabase(app); // זה המשתנה שהיה חסר ל-Vercel
