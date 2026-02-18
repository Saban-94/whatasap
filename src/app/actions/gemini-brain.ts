'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import sabanMasterBrain from "@/data/saban_master_brain.json";

export async function getSabanSmartResponse(prompt: string, customerId: string) {
  let customerName = 'אחי';
  
  // רשימת המפתחות מה-Vercel
  const apiKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3
  ].filter(key => !!key); // משאיר רק מפתחות שבאמת קיימים

  console.log(`--- 🏗️ SABAN-AI MULTI-KEY SYSTEM (Total: ${apiKeys.length}) ---`);

  // משיכת שם לקוח מה-CRM
  try {
    const docRef = doc(db, 'customer_memory', customerId);
    const crmSnap = await getDoc(docRef);
    if (crmSnap.exists()) {
      customerName = crmSnap.data()?.name || 'אחי';
    }
  } catch (e) {
    console.warn("⚠️ CRM Offline");
  }

  // לולאת המפתחות - עוברת אחד אחד אם יש כישלון
  for (let i = 0; i < apiKeys.length; i++) {
    const currentKey = apiKeys[i]!;
    
    try {
      console.log(`🚀 מלשינון: מנסה מפתח מספר ${i + 1}...`);
      const genAI = new GoogleGenerativeAI(currentKey);
      
      // שימוש במודל הכי חדש מינואר 2026
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

      const systemPrompt = `
        אתה "גימני" מ-ח. סבן. הלקוח: ${customerName}.
        סגנון: חברי, מקצועי, סלנג בנייה.
        מלאי: ${JSON.stringify(sabanMasterBrain.slice(0, 5))}
      `;

      const result = await model.generateContent(systemPrompt + "\n\n" + prompt);
      const response = await result.response;
      const text = response.text();

      if (text) {
        console.log(`✅ הצלחה! מפתח ${i + 1} עובד.`);
        return text;
      }
    } catch (error: any) {
      console.error(`❌ מפתח ${i + 1} נכשל: ${error.message}`);
      // אם הגענו למפתח האחרון וכולם נכשלו
      if (i === apiKeys.length - 1) {
        return `אהלן ${customerName}, יש עומס רגעי אצל גוגל. תנסה לשלוח שוב בעוד דקה.`;
      }
      // אחרת - הלולאה ממשיכה למפתח הבא אוטומטית
      console.log("🔄 עובר למפתח הגיבוי הבא...");
    }
  }
}
