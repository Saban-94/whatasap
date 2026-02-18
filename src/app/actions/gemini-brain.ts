'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import sabanMasterBrain from "@/data/saban_master_brain.json";

export async function getSabanSmartResponse(prompt: string, customerId: string) {
  let customerName = 'אחי';
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  console.log("--- 🏗️ SABAN-AI EMERGENCY REPAIR ---");

  if (!apiKey) {
    console.error("❌ מלשינון: API KEY חסר!");
    return "אחי, המפתח שלי לא מוגדר בשרת. בדוק את הגדרות Vercel.";
  }

  // אסטרטגיה: שימוש בשמות מודלים מלאים בגרסה v1 היציבה
  const modelStrategy = [
    { name: "models/gemini-1.5-flash" },
    { name: "models/gemini-1.5-pro" }
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
      console.log(`🚀 מלשינון: מנסה פורמט מלא למודל ${config.name}...`);
      
      // שימוש בגרסת v1 היציבה במקום v1beta
      const model = genAI.getGenerativeModel({ model: config.name }, { apiVersion: 'v1' });

      const systemPrompt = `
        אתה "גימני", המומחה של חברת "ח. סבן". הלקוח: ${customerName}.
        סגנון: חברי, מקצועי, סלנג בנייה.
        מלאי: ${JSON.stringify(sabanMasterBrain.slice(0, 5))}
      `;

      const result = await model.generateContent(systemPrompt + "\n\nשאלה: " + prompt);
      const response = await result.response;
      const text = response.text();

      if (text) {
        console.log(`✅ מלשינון: הצלחה עם ${config.name}!`);
        return text;
      }

    } catch (error: any) {
      console.warn(`⚠️ מלשינון: ${config.name} נכשל: ${error.message}`);
    }
  }

  return `אהלן ${customerName}, יש עומס זמני בגוגל. תנסה לשלוח שוב בעוד כמה שניות.`;
}
