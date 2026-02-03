import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC...", // API Key של פרויקט app-saban94-57361
  authDomain: "app-saban94-57361.firebaseapp.com",
  databaseURL: "https://app-saban94-57361-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "app-saban94-57361",
  storageBucket: "app-saban94-57361.appspot.com",
  messagingSenderId: "956627...",
  appId: "1:956627..."
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);   // לקטלוג ולמוח
export const rtdb = getDatabase(app); // לאיתוראן בזמן אמת
export default app;
