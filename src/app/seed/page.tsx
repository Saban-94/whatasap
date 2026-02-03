'use client';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

// הנתונים שהוצאנו מהקובץ data.json שהעלית
const sabanFullData = [
  {
    product_name: "דבק 132 C2TE-S1 (כרמית)",
    category: "Adhesives",
    engineering_solution: "דבק גמיש S1 לאריחים גדולים/מדוקקים, פנים/חוץ ובריכות",
    coverage: 1.5,
    application_method: "מסורית; Back-Butter; כיסוי ≥95%; פריימר 82-P בתשתיות חלקות",
    pro_tip: "S1 לגמישות; זמן פתוח E; החלקה T",
    diagnostic_questions: ["מה סוג התשתית?", "מה גודל האריח?", "פנים/חוץ/בריכה?"]
  },
  {
    product_name: "אקווניר EXTRA (נירלט)",
    category: "Paints",
    engineering_solution: "צבע אקרילי בטכנולוגיית USP למראה חלק ואחיד",
    coverage: 13.0,
    application_method: "הכנת קיר; פריימר 2X; 2 שכבות",
    pro_tip: "הפריימר הוא הבסיס - בלי זה הצבע עלול להתקלף",
    diagnostic_questions: ["אזור יישום?", "סוג תשתית?", "איזה ביצועים חשובים?"]
  }
  // ניתן להוסיף כאן את שאר המוצרים מהקובץ
];

export default function SeedPage() {
  const uploadMasterData = async () => {
    try {
      const colRef = collection(db, 'products');
      for (const prod of sabanFullData) {
        // שימוש בשם המוצר כ-ID כדי למנוע כפילויות
        const docId = prod.product_name.replace(/\//g, "-");
        await setDoc(docRef(colRef, docId), prod);
      }
      alert('כל הנתונים ההנדסיים הועלו בהצלחה!');
    } catch (e) {
      console.error(e);
      alert('שגיאה בהעלאה. וודא שחוקי ה-Firestore פתוחים.');
    }
  };

  return (
    <div className="p-10 text-center bg-black min-h-screen">
      <h1 className="text-sabanGold text-2xl mb-6 font-bold">מערכת הזרקת ידע - ח. סבן</h1>
      <button onClick={uploadMasterData} className="btn-huge bg-sabanGold text-black font-black p-6 rounded-2xl shadow-2xl">
        העלה קטלוג מומחה מלא 🚀
      </button>
    </div>
  );
}
