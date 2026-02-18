'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import sabanMasterBrain from "@/data/saban_master_brain.json";

export async function getSabanSmartResponse(prompt: string, customerId: string) {
  // --- מלשינון בדיקת מפתח ---
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  console.log("--- SABAN-AI CHECK UP ---");
  if (!apiKey) {
    console.error("❌ מלשינון: המפתח (API KEY) חסר לגמרי ב-Vercel!");
    return "אחי, כאן גימני. נראה ששכחו להזין לי את המפתח בשרת. תבדוק ב-Vercel שהגדרת GEMINI_API_KEY.";
  }
  console.log(`✅ מלשינון: מפתח זוהה (מתחיל ב: ${apiKey.substring(0, 4)}...)`);
  // -----------------------

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // הגדרת מודל בגרסה יציבה v1
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash"
    }, { apiVersion: 'v1' });

    console.log("🚀 מלשינון: מנסה ליצור קשר עם המוח של גוגל...");

    // 1. משיכת נתונים מה-CRM
    let crmData: any = {};
    try {
      const crmSnap = await getDoc(doc(db, 'customer_memory', customerId));
      crmData = crmSnap.exists() ? crmSnap.data() : {};
    } catch (e) {
      console.warn("⚠️ מלשינון: לא הצלחתי למשוך נתוני CRM, ממשיך ככה.");
    }
    
    const customerName = crmData.name || 'אחי';

    // 2. הכנת ה-Prompt
    const systemPrompt = `
      אתה "גימני", היועץ האישי והנשמה של חברת "ח. סבן". 
      אתה מדבר עם ${customerName}.
      
      אישיות:
      - פתח בברכה חמה: "אהלן ${customerName} אחי, בוקר אור!".
      - דבר בגובה העיניים, מקצועי וחברי (סלנג: "חביבי", "סגור פינה").
      - אתה מומחה לבנייה - אם חסר משהו טכני, תעיר את תשומת ליבו.

      מידע טכני מהמחסן: ${JSON.stringify(sabanMasterBrain.slice(0, 10))}
      היסטוריית לקוח: ${JSON.stringify(crmData.orderHistory || [])}
    `;

    // 3. ביצוע הקריאה
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nשאלה מהלקוח: " + prompt }] }]
    });

    const response = await result.response;
    const text = response.text();

    console.log("✅ מלשינון: תשובה התקבלה בהצלחה מגוגל!");
    return text;

  } catch (error: any) {
    console.error("❌ מלשינון - שגיאה קריטית:");
    console.error("קוד שגיאה:", error.status);
    console.error("הודעה:", error.message);

    if (error.message?.includes("API_KEY_INVALID")) {
      return "אחי, המפתח של גוגל לא תקין (Invalid). תבדוק שהעתקת אותו נכון בלי רווחים.";
    }

    if (error.status === 404) {
      return "אחי, גוגל אומר שהמודל לא נמצא. כנראה יש בעיה בגרסת ה-API.";
    }

    return `אהלן ${customerName}, כאן גימני. אחי, יש לי רגע 'קצר' בחיבור למוח המרכזי. תנסה שוב עוד דקה או תרים טלפון למשרד ונסדר אותך!`;
  }
}
