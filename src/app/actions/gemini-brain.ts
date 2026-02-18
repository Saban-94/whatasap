'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import sabanMasterBrain from "@/data/saban_master_brain.json";

export async function getSabanSmartResponse(prompt: string, customerId: string) {
  // הגדרת משתנה השם מראש כדי שיהיה זמין גם בשגיאות
  let customerName = 'אחי';
  
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  console.log("--- 🛠️ בדיקת מערכות SABAN-AI ---");
  
  if (!apiKey) {
    console.error("❌ מלשינון: API KEY חסר!");
    return "אחי, כאן גימני. נראה שהמפתח שלי לא מוגדר ב-Vercel.";
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
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
      console.warn("⚠️ מלשינון: CRM לא זמין.");
    }

    // 2. בניית ה-Prompt
    const systemPrompt = `
      אתה "גימני", היועץ האישי של "ח. סבן".
      הלקוח: ${customerName}.
      תהיה חבר ומקצועי. פתח בברכה חמה.
      נתוני מחסן: ${JSON.stringify(sabanMasterBrain.slice(0, 10))}
    `;

    // 3. קריאה ל-AI
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nשאלה: " + prompt }] }]
    });

    const response = await result.response;
    console.log("✅ מלשינון: תשובה התקבלה!");
    return response.text();

  } catch (error: any) {
    console.error("❌ מלשינון - שגיאה:", error.message);
    // עכשיו customerName מוכר כאן בוודאות
    return `אהלן ${customerName}, כאן גימני. אחי, יש לי רגע 'קצר' בחיבור. תנסה שוב עוד דקה או תרים טלפון למשרד ונסדר אותך!`;
  }
}
