import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface CustomerBrainProfile {
  clientId: string;
  name: string;
  accumulatedKnowledge: string; // הזיכרון שגימיני צבר
  projects: {
    name: string;
    location: string;
    lastProducts: string[];
  }[];
  preferences: {
    deliveryMethod: string;
    preferredHours: string;
  };
}

// שליפת הזיכרון עבור גימיני לפני תחילת השיחה
export async function fetchCustomerBrain(clientId: string): Promise<string> {
  const docRef = doc(db, 'customer_memory', clientId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) return "לקוח חדש. נהל שיחה ראשונית כדי להכיר את צרכיו.";

  const data = snap.data() as CustomerBrainProfile;
  return `
    זהו מידע מהזיכרון המצטבר שלך על ${data.name}:
    - ידע מצטבר: ${data.accumulatedKnowledge}
    - פרויקטים: ${data.projects.map(p => p.name + ' ב' + p.location).join(', ')}
    - העדפות אספקה: ${data.preferences.deliveryMethod}
  `;
}

// פונקציה לחיזוק המוח - עדכון הזיכרון
export async function strengthenBrain(clientId: string, newInsight: string) {
  const docRef = doc(db, 'customer_memory', clientId);
  await updateDoc(docRef, {
    accumulatedKnowledge: newInsight,
    lastUpdate: new Date().toISOString()
  });
}
