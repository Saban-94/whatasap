'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import sabanMasterBrain from "@/data/saban_master_brain.json";

/**
 * פונקציה חכמה לקבלת תשובה מגימני - ח. סבן
 * כוללת מעבר אוטומטי בין מודלים ומערכת דיווח (מלשינון)
 */
export async function getSabanSmartResponse(prompt: string, customerId: string) {
  // 1. הגדרת המפתח והמלשינון הראשוני
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  let customerName = 'אחי';

  console.log("--- 🏗️ SABAN-AI LOG-REPORT START ---");

  if (!apiKey) {
    console.error("❌ מלשינון: API KEY חסר ב-Vercel! המערכת מושבתת.");
    return "אחי, כאן גימני. נראה שהמפתח שלי לא מוגדר בשרת. דבר עם המשרד.";
  }

  // 2. רשימת מודלים לניסיון לפי סדר עדיפויות
  // ננסה קודם את 2.0, אחר כך את 1.5 היציב, ובסוף את 3 Preview
  const modelStrategy = [
    { name: "gemini-2.0-flash", version: "v1beta" },
    { name: "gemini-1.5-flash", version: "v1" },
    { name: "gemini-3-flash-preview", version: "v1" }
  ];

  const genAI = new GoogleGenerativeAI(apiKey);

  // 3. משיכת נתונים מה-CRM (Firebase)
  try {
    const crmSnap = await getDoc(doc(db, 'customer_memory', customerId));
    if (crmSnap.exists()) {
      const crmData = crmSnap.data();
      customerName = crmData.name || 'אחי';
      console.log(`✅ מלשינון: לקוח זוהה במערכת: ${customerName}`);
    }
  } catch (e) {
    console.warn("⚠️ מלשינון: תקלה בגישה ל-Firebase, ממשיך כסוכן עצמאי.");
  }

  // 4. לולאת הניסיונות (Automatic Fallback)
  let lastError = "";

  for (const config of modelStrategy) {
    try {
      console.log(`🚀 מלשינון: מנסה קריאה למודל ${config.name} (${config.version})...`);
      
      const model = genAI.getGenerativeModel({ 
        model: config.name 
      }, { apiVersion: config.version });

      const systemPrompt = `
        אתה "גימני", היועץ האישי והנשמה של חברת "ח. סבן".
        אתה מדבר עם ${customerName}.
        
        אישיות:
        - פתח בברכה חמה: "אהלן ${customerName} אחי, בוקר אור!".
        - תהיה חבר מקצוען. דבר בגובה העיניים (חביבי, נשמה, סגור פינה).
        - ידע טכני: אם לקוח שואל על דבק או גבס, תן לו כמויות לפי המחירון שלנו.
        
        מידע מהמחסן (Top Products): 
        ${JSON.stringify(sabanMasterBrain.slice(0, 10))}
      `;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nשאלה מהלקוח: " + prompt }] }]
      });

      const response = await result.response;
      const text = response.text();

      if (text) {
        console.log(`✅ מלשינון: מודל ${config.name} הצליח לספק תשובה!`);
        return text;
      }

    } catch (error: any) {
      lastError = error.message;
      console.warn(`⚠️ מלשינון: מודל ${config.name} נכשל. סיבה: ${lastError}`);
      // הלולאה תמשיך אוטומטית למודל הבא ברשימה
    }
  }

  // 5. אם הגענו לכאן - כל הניסיונות נכשלו
  console.error("❌ מלשינון קריטי: כל המודלים נכשלו בקבלת תשובה!");
  return `אהלן ${customerName}, כאן גימני. אחי, יש רגע עומס כבד בשרתים של גוגל. אל תדאג, תנסה לשלוח שוב בעוד דקה או תרים טלפון למשרד ונסגור לך הכל.`;
}
