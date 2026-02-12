'use client'
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';

export default function SeedPage() {
  const [status, setStatus] = useState('ממתין להפעלה...');

  const seedCustomerBrain = async () => {
    setStatus('מבצע זריעה לנתוני שחר שאול...');
    try {
      const clientId = 'שחר_שאול'; // מזהה ייחודי ללא רווחים ליתר ביטחון
      const brainRef = doc(db, 'customer_memory', clientId);

      await setDoc(brainRef, {
        clientId: clientId,
        name: 'שחר שאול',
        accumulatedKnowledge: 'לקוח ותיק בתחום השלד. מעדיף אספקה מוקדם בבוקר (7:00-8:00). רגיש מאוד לדיוק בסוג החול. יש לו אתר פעיל ברעננה עם מגבלת גישה למשאית גדולה.',
        projects: [
          { name: 'וילה רעננה', location: 'רחוב אחוזה 10, רעננה', lastProducts: ['בטון', 'חול מחצבה'] },
          { name: 'שיפוץ הרצליה', location: 'רחוב הנדיב 5, הרצליה', lastProducts: ['מכולה 8 קוב'] }
        ],
        preferences: {
          deliveryMethod: 'משאית מנוף קטנה (עקב רחובות צרים)',
          preferredHours: '07:00'
        },
        lastUpdate: new Date().toISOString()
      });

      setStatus('הזריעה הושלמה בהצלחה! המוח של שחר שאול מוכן.');
    } catch (error) {
      console.error(error);
      setStatus('שגיאה בזריעה: ' + error);
    }
  };

  return (
    <div className="p-20 text-center">
      <h1 className="text-2xl font-bold mb-4">אתחול זיכרון לקוח - ח. סבן</h1>
      <p className="mb-8">{status}</p>
      <button 
        onClick={seedCustomerBrain}
        className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold"
      >
        הפעל זריעת נתונים (Setup שחר שאול)
      </button>
    </div>
  );
}
