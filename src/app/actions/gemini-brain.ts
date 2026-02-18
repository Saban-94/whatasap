import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";

// תיקון נתיב הייבוא - ב-Next.js הסימן @ כבר מצביע לתיקיית src
import sabanMasterBrain from "@/data/saban_master_brain.json";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
export async function getSabanSmartResponse(prompt: string, customerId: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 1. משיכת נתונים מה-CRM (הצלבת היסטוריית הזמנות מ-Firestore)
    const crmSnap = await getDoc(doc(db, 'customer_memory', customerId));
    const crmData = crmSnap.exists() ? crmSnap.data() : {};

    // 2. זיהוי צרכי שיפוץ וחילוץ לוגיקה מהמאגר המאוחד
    const isRenovation = prompt.includes("שיפוץ") || prompt.includes("אמבטיה") || prompt.includes("חדר רחצה");
    let renovationContext = "";
    
    if (isRenovation) {
      // חילוץ לוגיקת חישוב מתוך המאגר (חיפוש גמיש לפי שם)
      const adhesive = (sabanMasterBrain as any[]).find(p => p.name.includes("דבק"));
      const ratio = adhesive?.calculator?.ratio || 1.2; // ברירת מחדל הנדסית
      
      renovationContext = `
        הלקוח מתעניין בשיפוץ. 
        לפי המאגר הטכני שלנו עבור ${adhesive?.name || "דבק קרמיקה"}:
        יחס הצריכה הוא ${ratio} ${adhesive?.calculator?.unit || "שקים"} למ"ר.
        בדוק אם בהיסטוריה שלו יש רכישות דומות והמלץ בהתאם כדי למנוע בזבוז חומר.
      `;
    }

    const systemPrompt = `
      אתה המוח המקצועי והיועץ הטכני של חברת "ה. סבן".
      הלקוח איתו אתה מדבר כרגע: ${crmData.name || 'לקוח רשום'}.
      
      נתונים טכניים מהמלאי (Inventory Data): 
      ${JSON.stringify(sabanMasterBrain.slice(0, 15))}
      
      היסטוריית רכישות מה-CRM (Customer History): 
      ${JSON.stringify(crmData.orderHistory || [])}.
      
      ${renovationContext}
      
      הנחיות עבודה:
      1. תן תשובה הנדסית מדויקת המשלבת בין רכישות עבר לבין המפרט הטכני הנוכחי.
      2. אם הלקוח שואל על כמויות, בצע חישוב "עד הגרגר האחרון" לפי היחס במאגר.
      3. היה שירותי, מקצועי, וזכור את שלב הפרויקט של הלקוח (למשל: אם קנה איטום, הוא לקראת שלב הריצוף).
      4. אם מוצר לא נמצא במלאי, ציין זאת והצע חלופה דומה.
    `;

    const result = await model.generateContent([systemPrompt, prompt]);
    return result.response.text();

  } catch (error) {
    console.error("Gemini Brain Error:", error);
    return "אחי, מצטער, חלה שגיאה בתקשורת בין המוחות הטכניים. אני זמין לשאלות בטלפון או בווטסאפ המשרדי.";
  }
}
