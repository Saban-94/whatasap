import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// הגדרות ה-Firebase עבור פרויקט app-saban94-57361
const firebaseConfig = {
  apiKey: "AIzaSyC...", // כאן יבוא ה-API Key המלא שלך
  authDomain: "app-saban94-57361.firebaseapp.com",
  databaseURL: "https://app-saban94-57361-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "app-saban94-57361",
  storageBucket: "app-saban94-57361.appspot.com",
  messagingSenderId: "956627...",
  appId: "1:956627..."
};

// אתחול האפליקציה (מונע אתחול כפול)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// ייצוא השירותים המרכזיים
export const db = getFirestore(app);        // עבור הקטלוג, ה-CRM והמוח ההנדסי
export const rtdb = getDatabase(app);    // עבור נתוני איתוראן ומיקומי משאיות בזמן אמת
export const auth = getAuth(app);        // עבור ניהול הרשאות עובדים (ורד, חכמת, נציגים)

export default app;
