import { GoogleGenerativeAI } from "@google/generative-ai";
// תיקון הנתיב: הורדנו את ה-src המיותר שהכשיל את הבנייה
import { db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";

// ייבוא נתוני המאגר (וודא שהנתיב תואם למיקום הקובץ במאגר)
import sabanMasterBrain from "@/data/saban_master_brain.json";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function getSabanSmartResponse(prompt: string, customerId: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 1. משיכת נתונים מה-CRM (הצלבה)
    const crmSnap = await getDoc(doc(db, 'customer_memory', customerId));
    const crmData = crmSnap.exists() ? crmSnap.data() : {};

    // 2. בדיקת לוגיקה לשיפוץ חדר רחצה (המוח החדש)
    const isRenovation = prompt.includes("שיפוץ") || prompt.includes("אמבטיה");
    let renovationContext = "";
    
    if (isRenovation) {
      renovationContext = `
        הלקוח מתעניין בשיפוץ. 
        לפי לוגיקת המאגר החדש: לכל 1 מ"ר נדרשים 1.2 שקי דבק קרמיקה.
        בדוק אם יש מוצרים תואמים במחירון סבן.
      `;
    }

    const systemPrompt = `
      אתה המוח של ח. סבן. הלקוח: ${crmData.name || 'שחר לוי'}.
      נתוני מפתח מהמאגר: ${JSON.stringify(sabanMasterBrain.logic || {})}
      היסטוריית CRM: ${JSON.stringify(crmData.orderHistory || [])}.
      ${renovationContext}
      ענה בצורה מקצועית המצליבה בין המאגרים.
    `;

    const result = await model.generateContent([systemPrompt, prompt]);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Brain Error:", error);
    return "מצטער, חלה שגיאה בחיבור בין המוחות. נסה שנית מאוחר יותר.";
  }
}
