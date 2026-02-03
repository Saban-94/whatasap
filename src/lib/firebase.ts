import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "app-saban94-57361.firebaseapp.com",
  databaseURL: "https://app-saban94-57361-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "app-saban94-57361",
  storageBucket: "app-saban94-57361.appspot.com",
  messagingSenderId: "956627581512",
  appId: "1:956627581512:web:75d5830e1182ec015cfdff"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firestore - עם הגנה משגיאות QUIC/Streaming
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});

// Realtime Database - עבור הדיווחים והלוגיסטיקה
export const database = getDatabase(app, firebaseConfig.databaseURL);

export const auth = getAuth(app);
export default app;
