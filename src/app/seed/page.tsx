'use client';
import { db } from '@/lib/firebase'; 
import { collection, setDoc, doc } from 'firebase/firestore'; 

export default function SeedPage() {
  const sabanFullData = [
    {
      "product_name": "Sika MonoTop-610 / 910N",
      "category": "Repair",
      "engineering_solution": "ציפוי הגנה נגד קורוזיה וחיזוק הידבקות בין בטון ישן לחדש.",
      "coverage": 1.8,
      "pro_tip": "להרטיב את המצע עד מצב SSD לפני יישום.",
      "media": {
        "image": "https://gilar.co.il/products/%d7%a1%d7%99%d7%a7%d7%94-%d7%9e%d7%95%d7%a0%d7%95%d7%98%d7%95%d7%a4-610/",
        "video": "https://www.youtube.com/watch?v=KxKXmsY8-2c"
      }
    },
    // ... כל שאר המוצרים שלך כאן ...
    {
      "product_name": "Sikadur-730",
      "category": "Bonding",
      "engineering_solution": "דבק אפוקסי ייעודי להדבקת אלמנטי פלדה לבטון.",
      "coverage": 2.0,
      "pro_tip": "לנקות תחילה את חלודה ושומנים מהפלדה.",
      "media": {
        "image": "https://gilar.co.il/en/construction/structural-strengthening.html",
        "video": "https://www.youtube.com/watch?v=dVip0vCBf6w"
      }
    }
  ];

  const uploadMasterData = async () => {
    try {
      const colRef = collection(db, 'products');
      for (const prod of sabanFullData) {
        const docId = prod.product_name.replace(/\//g, "-").replace(/\s+/g, "_");
        await setDoc(doc(colRef, docId), prod);
      }
      alert('כל הנתונים ההנדסיים של ח. סבן הועלו בהצלחה!');
    } catch (e) {
      console.error(e);
      alert('שגיאה בהעלאה. וודא שחוקי ה-Firestore פתוחים.');
    }
  };

  return (
    <div className="p-10 text-center bg-black min-h-screen">
      <h1 className="text-[#C9A227] text-3xl mb-8 font-bold">מערכת הזרקת ידע - ח. סבן</h1>
      <button 
        onClick={uploadMasterData} 
        className="bg-[#C9A227] text-black font-black p-8 rounded-3xl shadow-2xl hover:scale-105 transition-transform"
      >
        העלה קטלוג מומחה מלא 🚀
      </button>
      <p className="mt-6 text-gray-500 text-sm">סה"כ מוצרים להזרקה: {sabanFullData.length}</p>
    </div>
  );
}
