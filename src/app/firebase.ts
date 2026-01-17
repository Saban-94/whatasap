import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore, memoryLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2QjUvjfALcuoM1xZMVDIXcNpwCG1-tE8",
  authDomain: "saban-system-v2.firebaseapp.com",
  projectId: "saban-system-v2",
  storageBucket: "saban-system-v2.firebasestorage.app",
  messagingSenderId: "670637185194",
  appId: "1:670637185194:web:e897482997e75c110898d3",
};

// אתחול בטוח שמונע את שגיאת ה-Build
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
// יצירת ה-DB פעם אחת בלבד עם זיכרון מטמון בטוח
const db = initializeFirestore(app, { localCache: memoryLocalCache() });

export { db };
