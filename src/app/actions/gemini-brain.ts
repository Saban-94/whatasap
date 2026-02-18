'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import sabanMasterBrain from "@/data/saban_master_brain.json";

export async function getSabanSmartResponse(prompt: string, customerId: string) {
  // --- מלשינון בדיקת מפתח ---
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  console.log("--- 🛠️ בדיקת מערכות SABAN-AI (עדכון 2026) ---");
  
  if (!apiKey) {
    console.error("❌ מלשינון: המפתח (API KEY) חסר! המערכת תישאר במצב רובוטי.");
    return "אחי, כאן גימני. נראה שהמפתח שלי לא מוגדר ב-Vercel. תבדוק את GEMINI_API_KEY.";
  }
  
  console.log(`✅ מלשינון: מפתח זוהה (סיומת: ...${apiKey.slice(-4)})`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    /**
     * עדכון מודל 2026:
     * לפי העדכונים האחרונים, gemini-3-flash-preview הוא המודל החזק והמהיר ביותר 
     * המיועד לסוכנים (Agentic capabilities) וקידוד.
     */
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview" // המודל המעודכן ביותר לפי ינואר 2026
    });

    console.log("🚀 מלשינון: יוצר קשר עם Gemini 3 Flash...");

    // 1. שליפת נתוני CRM
    let crmData: any = {};
    try {
      const crmSnap = await getDoc(doc(db, 'customer_memory', customerId));
      crmData = crmSnap.exists() ? crmSnap.data() : {};
    } catch (e) {
      console.warn("⚠️ מלשינון: CRM לא זמין, ממשיך עם ידע כללי.");
    }
    
    const customerName = crmData.name || 'אחי';

    // 2. הגדרת ה-Prompt עם ה"נשמה" של סבן
    const systemPrompt = `
      אתה "גימני", המומחה הלוגיסטי והיועץ האישי של "ח. סבן".
      אתה משתמש במודל Gemini 3 החדש כדי לתת תשובות חכמות ומהירות.
      
      הלקוח: ${customerName}.
      
      הנחיות אישיות:
      - תהיה חבר! תפתח ב-"אהלן ${customerName} אחי, בוקר אור".
      - אתה מומחה בנייה - תן כמויות מדויקות (דבק, גבס, מלט).
      - אם הלקוח בשיפוץ מקלחת, תזכיר לו גבס ירוק ואיטום.
      - דבר בסלנג מקצועי ישראלי ("סגור פינה", "חביבי", "נשמה").

      מלאי נוכחי: ${JSON.stringify(sabanMasterBrain.slice(0, 15))}
      היסטוריה: ${JSON.stringify(crmData.orderHistory || [])}
    `;

    // 3. שליחה וקבלת תשובה
    const result = await model.generateContent(systemPrompt + "\n\nשאלה מהלקוח: " + prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ מלשינון: Gemini 3 הגיב בהצלחה!");
    return text;

  } catch (error: any) {
    console.error("❌ מלשינון - תקלה במוח המרכזי:");
    console.error("הודעה:", error.message);

    // טיפול ספציפי בשגיאת מודל לא נמצא (אם גוגל שינו משהו הבוקר)
    if (error.message?.includes("not found")) {
      return "אחי, גוגל עדכנו את המודלים והשם 'gemini-3-flash-preview' עדיין לא פתוח אצלך. נסה לשנות ל-gemini-2.0-flash.";
    }

    return `אהלן ${customerName}, כאן גימני. אחי, יש לי רגע 'קצר' בחיבור. תנסה שוב עוד דקה או תרים טלפון למשרד ונסדר אותך!`;
  }
}
