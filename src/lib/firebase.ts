import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "app-saban94-57361.firebaseapp.com",
  databaseURL: "https://app-saban94-57361-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "app-saban94-57361",
  storageBucket: "app-saban94-57361.appspot.com",
  messagingSenderId: "956627581512",
  appId: "1:956627581512:web:75d5830e1182ec015cfdff"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
// שינינו מ-rtdb ל-database כדי לתקן את השגיאה ב-Vercel
export const database = getDatabase(app); 

export default app;
