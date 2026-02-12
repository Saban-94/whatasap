import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";

// ייבוא נתוני המאגר (כמערך מוצרים)
import sabanMasterBrain from "@/src/data/saban_master_brain.json";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function getSabanSmartResponse(prompt: string, customerId: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 1. משיכת נתונים מה-CRM (הצלבת היסטוריית הזמנות)
    const crmSnap = await getDoc(doc(db, 'customer_memory', customerId));
    const crmData = crmSnap.exists() ? crmSnap.data() : {};

    // 2. זיהוי צרכי שיפוץ (למשל עבור שחר לוי)
    const isRenovation = prompt.includes("שיפוץ") || prompt.includes("אמבטיה") || prompt.includes("חדר רחצה");
    let renovationContext = "";
    
    if (isRenovation) {
      // חילוץ לוגיקת חישוב מתוך המאגר (למשל עבור דבק קרמיקה)
      const adhesive = sabanMasterBrain.find(p => p.name.includes("דבק"));
      const ratio = adhesive?.calculator?.ratio || 1.2; // ברירת מחדל של 1.2 שקים למ"ר
      
      renovationContext = `
        הלקוח מתעניין בשיפוץ. 
        לפי המאגר הטכני שלנו עבור ${adhesive?.name || "דבק קרמיקה"}:
        יחס הצריכה הוא ${ratio} ${adhesive?.calculator?.unit || "שקים"} למ"ר.
        בדוק אם בהיסטוריה שלו יש רכישות דומות והמלץ בהתאם.
      `;
    }

    const systemPrompt = `
      אתה המוח המקצועי של ח. סבן.
      הלקוח איתו אתה מדבר: ${crmData.name || 'שחר לוי'}.
      
      רשימת מוצרים ומפרטים טכניים מהמאגר: 
      ${JSON.stringify(sabanMasterBrain.slice(0, 10))} // שולח רק את הרלוונטיים לחסכון במקום
      
      היסטוריית רכישות מה-CRM הניהולי: 
      ${JSON.stringify(crmData.orderHistory || [])}.
      
      ${renovationContext}
      
      תפקידך: לתת תשובה הנדסית מדויקת המשלבת בין מה שהלקוח קנה בעבר (מה-CRM) לבין המפרט הטכני של המוצרים (מהמאגר). 
      אם הוא שואל על כמויות לשיפוץ, בצע את החישוב לפי היחס המצוין.
    `;

    const result = await model.generateContent([systemPrompt, prompt]);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Brain Error:", error);
    return "מצטער, חלה שגיאה בתקשורת בין המוחות. אני זמין לשאלות טכניות בטלפון.";
  }
}
