export const dynamic = 'force-dynamic';

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1].content.trim();

  // 1. רשימת המודלים לבדיקה (מהחדש ליציב)
  const modelsToTry = [
    "gemini-3.1-flash-image-preview", // הכי חדש (פברואר 2026)
    "gemini-3-flash-preview",         // יציב יותר (ינואר 2026)
    "gemini-1.5-flash-latest"         // מודל גיבוי
  ];

  // 2. חיבור ל-Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!
  );

  // 3. שליפת נתונים מהמחסן (בדיקה שה-DB עובד)
  const { data: products } = await supabase
    .from("inventory")
    .select("product_name, sku, price")
    .or(`product_name.ilike.%${lastMessage}%,sku.ilike.%${lastMessage}%`)
    .limit(1);

  const context = products?.length ? JSON.stringify(products) : "אין מוצר כזה";

  // 4. לופ בדיקת מודלים עד להצלחה
  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying model: ${modelName}...`);
      
      const googleAI = createGoogleGenerativeAI({ 
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_KEY 
      });

      const { text } = await generateText({
        model: googleAI(modelName),
        system: `אתה נציג סבן. השב בעברית. נתוני מחסן: ${context}`,
        messages,
      });

      // אם הגענו לכאן, המודל עבד!
      return Response.json({ 
        text, 
        activeModel: modelName,
        uiBlueprint: products?.[0] ? { type: "product_card", data: products[0] } : null
      });

    } catch (error: any) {
      console.error(`Model ${modelName} failed:`, error.message);
      // אם זה המודל האחרון ברשימה וגם הוא נכשל
      if (modelName === modelsToTry[modelsToTry.length - 1]) {
        return Response.json({ 
          text: "ראמי, כל המודלים נכשלו. וודא שהמפתח (API Key) תקין ב-Vercel.",
          error: error.message 
        }, { status: 200 });
      }
      // אחרת, ממשיך למודל הבא ברשימה
      continue;
    }
  }
}
