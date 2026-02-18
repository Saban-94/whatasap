'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import sabanMasterBrain from "@/data/saban_master_brain.json";

export async function getSabanSmartResponse(prompt: string, customerId: string) {
  let customerName = 'אחי';
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  console.log("--- 🛠️ SABAN-AI SYSTEM CHECK ---");
  
  if (!apiKey) {
    console.error("❌ מלשינון: API KEY חסר!");
    return "אחי, כאן גימני. נראה שהמפתח שלי לא מוגדר ב-Vercel.";
  }

  // הגדרת רשימת מודלים לפי סדר עדיפויות (למקרה של 404)
  const modelsToTry = ["gemini-1.5-flash", "gemini-3-flash-preview"]; 
  let lastError = "";

  const genAI = new GoogleGenerativeAI(apiKey);

  // 1. ניסיון משיכת נתונים מה-CRM
  try {
    const crmSnap = await getDoc(doc(db, 'customer_memory', customerId));
    if (crmSnap.exists()) {
      customerName = crmSnap.data().name || 'אחי';
    }
  } catch (e) {
    console.warn("⚠️ מלשינון: CRM לא זמין.");
  }

  // 2. לולאת ניסיונות (Retry Logic) למניעת קריסה
  for (const modelName of modelsToTry) {
    try {
      console.log(`🚀 מלשינון: מנסה קריאה עם מודל ${modelName}...`);
      
      const model = genAI.getGenerativeModel({ 
        model: modelName 
      }, { apiVersion: 'v1' });

      const systemPrompt = `
        אתה "גימני", היועץ האישי של "ח. סבן".
        הלקוח: ${customerName}.
        פתח בברכה חמה: "אהלן ${customerName} אחי, בוקר אור!".
        תהיה מקצוען בנייה (סלנג: חביבי, נשמה, סגור פינה).
        נתוני מלאי: ${JSON.stringify(sabanMasterBrain.slice(0, 10))}
      `;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nשאלה: " + prompt }] }]
      });

      const response = await result.response;
      console.log(`✅ מלשינון: הצלחה עם מודל ${modelName}!`);
      return response.text();

    } catch (error: any) {
      lastError = error.message;
      console.error(`⚠️ מלשינון: מודל ${modelName} נכשל. עובר למודל הבא...`);
      // אם הגענו לכאן, הלולאה תמשיך למודל הבא ברשימה
    }
  }

  // 3. אם כל המודלים נכשלו
  console.error("❌ מלשינון: כל המודלים נכשלו!", lastError);
  return `אהלן ${customerName}, כאן גימני. אחי, יש לי 'קצר' זמני בחיבור לגוגל. תנסה שוב עוד דקה או תרים טלפון למשרד ונסדר אותך!`;
}
