'use client';
import { db } from '@/lib/firebase'; 
import { collection, setDoc, doc } from 'firebase/firestore'; 

export default function SeedPage() {
  const sabanFullData = [
    {
      "product_name": "Sika MonoTop-610 / 910N",
      "category": "Repair",
      "engineering_solution": "ציפוי הגנה נגד קורוזיה וחיזוק הידבקות.",
      "coverage": 1.8,
      "pro_tip": "להרטיב את המצע עד מצב SSD לפני יישום."
    },
    // כאן תכניס את כל שאר המוצרים שלך
  ];

  const uploadMasterData = async () => {
    try {
      for (const prod of sabanFullData) {
        const docId = prod.product_name.replace(/\//g, "-").replace(/\s+/g, "_");
        await setDoc(doc(db, 'products', docId), prod);
      }
      alert('הזרקת המוח הצליחה! 🚀');
    } catch (e) {
      console.error(e);
      alert('שגיאה בהעלאה. בדוק את חיבור ה-Firebase.');
    }
  };

  return (
    <div className="p-10 text-center bg-black min-h-screen font-sans">
      <h1 className="text-[#C9A227] text-3xl mb-8 font-bold">מערכת הזרקת ידע - ח. סבן</h1>
      <button 
        onClick={uploadMasterData} 
        className="bg-[#C9A227] text-black font-black p-8 rounded-3xl shadow-2xl hover:scale-105 transition-transform"
      >
        הזרק קטלוג מומחה מלא 🧠
      </button>
    </div>
  );
}
