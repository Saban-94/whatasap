'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import sabanMasterBrain from "@/data/saban_master_brain.json";

export async function getSabanSmartResponse(prompt: string, customerId: string) {
  let customerName = 'אחי';
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  console.log("--- 🏗️ SABAN-AI SYSTEM RESTORE ---");

  if (!apiKey) {
    console.error("❌ מלשינון: API KEY חסר!");
    return "אחי, כאן גימני. המפתח שלי לא מוגדר בשרת.";
  }

  // שמות מודלים בסיסיים ללא תוספות - אלו השמות הכי עמידים
  const modelStrategy = [
    { name: "gemini-1.5-flash", version: "v1beta" },
    { name: "gemini-1.5-pro", version: "v1beta" }
  ];

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const docRef = doc(db, 'customer_memory', customerId);
    const crmSnap = await getDoc(docRef);
    if (crmSnap.exists()) {
      const data = crmSnap.data();
      customerName = data?.name || 'אחי';
    }
  } catch (e) {
    console.warn("⚠️ מלשינון: CRM לא זמין.");
  }

  for (const config of modelStrategy) {
    try {
      console.log(`🚀 מלשינון: מנסה לקרוא למודל ${config.name}...`);
      
      const model = genAI.getGenerativeModel({ model: config.name });

      const systemPrompt = `
        אתה "גימני", המומחה של חברת "ח. סבן".
        הלקוח: ${customerName}.
        סגנון: חברי, מקצועי, סלנג בנייה (נשמה, חביבי, סגור פינה).
        מלאי סבן: ${JSON.stringify(sabanMasterBrain.slice(0, 10))}
      `;

      // שימוש בפורמט הפשוט ביותר של generateContent
      const result = await model.generateContent(systemPrompt + "\n\nשאלה: " + prompt);
      const response = await result.response;
      const text = response.text();

      if (text) {
        console.log(`✅ מלשינון: מודל ${config.name} הצליח!`);
        return text;
      }

    } catch (error: any) {
      console.warn(`⚠️ מלשינון: ${config.name} נכשל: ${error.message}`);
    }
  }

  return `אהלן ${customerName}, יש עומס רגעי בגוגל. תנסה שוב עוד דקה אחי.`;
}
