'use client';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const dummyProducts = [
  { name: 'SikaTop Seal-107 אפור', solution: 'איטום מיכלים, בריכות ומבנים', coverage: '2.0', category: 'Sealing' },
  { name: 'Sika Grout-214', solution: 'דיוס למכונות ומילוי חללים', coverage: '1.9', category: 'Construction' },
  { name: 'סבן - דבק קרמיקה S1', solution: 'הדבקת אריחים בסטנדרט גבוה', coverage: '1.5', category: 'Adhesives' },
  { name: 'Sika Monotop-612', solution: 'שיקום בטון מקצועי', coverage: '1.8', category: 'Repair' }
];

export default function SeedPage() {
  const uploadData = async () => {
    try {
      const colRef = collection(db, 'products');
      for (const prod of dummyProducts) {
        await addDoc(colRef, prod);
      }
      alert('הנתונים הוזרקו בהצלחה! חזור לקטלוג.');
    } catch (e) {
      console.error(e);
      alert('שגיאה: וודא שחוקי ה-Firestore ב-Console פתוחים (Read/Write).');
    }
  };

  return (
    <div className="p-10 text-center">
      <button onClick={uploadData} className="btn-huge bg-blue-600 text-white p-5">
        הזרק 10 מוצרים ראשונים לקטלוג 🚀
      </button>
    </div>
  );
}
