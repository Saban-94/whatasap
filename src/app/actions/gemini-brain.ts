'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import sabanMasterBrain from "@/data/saban_master_brain.json";

export async function getSabanSmartResponse(prompt: string, customerId: string) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  let customerName = 'אחי';

  console.log("--- 🏗️ SABAN-AI SYSTEM RESTORE ---");

  if (!apiKey) {
    console.error("❌ מלשינון: API KEY חסר!");
    return "אחי, כאן גימני. המפתח שלי לא מוגדר בשרת.";
  }

  // אסטרטגיה מעודכנת: שימוש ב-v1beta עבור כולם כדי למנוע 404
  // ושימוש בגרסאות פלאש היציבות ביותר
  const modelStrategy = [
    { name: "gemini-1.5-flash-latest", version: "v1beta" },
    { name: "gemini-1.5-pro-latest", version: "v1beta" },
    { name: "gemini-1.5-flash", version: "v1beta" }
  ];

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const crmSnap = await getDoc(doc(doc(db, 'customer_memory', customerId)));
    if (crmSnap.exists()) {
      customerName = crmSnap.data().name || 'אחי';
    }
  } catch (e) {
    console.warn("⚠️ מלשינון: CRM לא זמין.");
  }

  for (const config of modelStrategy) {
    try {
      console.log(`🚀 מלשינון: מנסה ${config.name}...`);
      
      const model = genAI.getGenerativeModel({ model: config.name }, { apiVersion: config.version });

      const systemPrompt = `
        אתה "גימני", המומחה של חברת "ח. סבן".
        הלקוח: ${customerName}.
        סגנון: חברי, מקצועי, סלנג בנייה (נשמה, חביבי, סגור פינה).
        מלאי סבן: ${JSON.stringify(sabanMasterBrain.slice(0, 10))}
      `;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nשאלה: " + prompt }] }]
      });

      const response = await result.response;
      console.log(`✅ מלשינון: ${config.name} עובד!`);
      return response.text();

    } catch (error: any) {
      console.warn(`⚠️ מלשינון: ${config.name} נכשל: ${error.message}`);
      // אם זו שגיאת Quota (429), אנחנו עוברים למודל הבא מיד
    }
  }

  return `אהלן ${customerName}, יש עומס רגעי. תנסה שוב עוד דקה או תרים טלפון למשרד.`;
}
