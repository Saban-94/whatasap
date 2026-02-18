'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import sabanMasterBrain from "@/data/saban_master_brain.json";

export async function getSabanSmartResponse(prompt: string, customerId: string) {
  // הגדרת משתנה השם מראש כדי שיהיה זמין גם ב-Catch
  let customerName = 'אחי';
  
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  console.log("--- 🛠️ SABAN-AI SYSTEM CHECK ---");
  
  if (!apiKey) {
    console.error("❌ מלשינון: API KEY חסר בשרת!");
    return "אחי, כאן גימני. נראה שהמפתח שלי לא מוגדר ב-Vercel. תבדוק את ה-Environment Variables.";
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // שימוש במודל Gemini 3 Flash המעודכן ל-2026
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview" 
    }, { apiVersion: 'v1' });

    // 1. משיכת נתונים מה-CRM
    try {
      const crmSnap = await getDoc(doc(db, 'customer_memory', customerId));
      if (crmSnap.exists()) {
        const crmData = crmSnap.data();
        customerName = crmData.name || 'אחי';
      }
    } catch (e) {
      console.warn("⚠️ מלשינון: לא הצלחתי לגשת ל-CRM, ממשיך עם שם ברירת מחדל.");
    }

    // 2. בניית הנחיית המערכת (System Prompt)
    const systemPrompt = `
      אתה "גימני", היועץ האישי והלב של "ח. סבן".
      הלקוח שפונה אליך הוא: ${customerName}.
      
      חוקי הדיבור שלך:
      - פתח תמיד בברכה חמה: "אהלן ${customerName} אחי, בוקר אור!".
      - תהיה מקצוען בנייה: אם הוא שואל על כמויות, חשב לפי המחירון.
      - תהיה חבר: תשתמש בסלנג מקצועי (חביבי, נשמה, סגור פינה).
      
      נתוני מלאי טכניים: ${JSON.stringify(sabanMasterBrain.slice(0, 10))}
    `;

    // 3. ביצוע הקריאה ל-AI
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nהודעת לקוח: " + prompt }] }]
    });

    const response = await result.response;
    const aiText = response.text();

    console.log("✅ מלשינון: Gemini הגיב בהצלחה!");
    return aiText;

  } catch (error: any) {
    console.error("❌ מלשינון - שגיאת תקשורת:", error.message);
    
    // טיפול בשגיאת גרסת מודל אם גוגל שינו שמות
    if (error.message?.includes("not found")) {
      return `אהלן ${customerName}, כאן גימני. נראה שגוגל מעדכנים גרסה למודל שלי כרגע. תנסה שוב עוד דקה או תרים טלפון למשרד.`;
    }

    return `אהלן ${customerName}, כאן גימני. אחי, יש לי רגע 'קצר' בחיבור. תנסה שוב עוד דקה או תרים טלפון למשרד ונסדר אותך!`;
  }
}
