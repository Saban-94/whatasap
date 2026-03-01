export const dynamic = 'force-dynamic';

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content.trim();

    // 1. איסוף מפתחות חסין - בודק את כל האופציות ששמנו ב-Vercel
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || 
                     process.env.GEMINI_API_KEY || 
                     process.env.gemini_key ||
                     process.env.GEMINI_KEY;

    if (!geminiKey) {
      return Response.json({ 
        text: "❌ שגיאה: לא נמצא מפתח Gemini ב-Vercel. וודא שהגדרת GOOGLE_GENERATIVE_AI_API_KEY." 
      }, { status: 200 });
    }

    // 2. חיבור ל-Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    );

    // 3. שליפת מוצר אחד לבדיקת ה-Database
    const { data: products } = await supabase
      .from("inventory")
      .select("product_name, sku, price")
      .or(`product_name.ilike.%${lastMessage}%,sku.ilike.%${lastMessage}%`)
      .limit(1);

    const context = products?.length ? JSON.stringify(products) : "אין נתוני מלאי תואמים";

    // 4. רשימת מודלים לבדיקה (לפי העדכונים של 2026)
    const modelsToTry = [
      "gemini-3.1-flash-image-preview", // הכי חדש
      "gemini-3-flash-preview",         // יציב
      "gemini-1.5-flash-latest"         // גיבוי אחרון
    ];

    let successText = "";
    let workingModel = "";

    // 5. הלופ החסין - מנסה מודל אחרי מודל
    for (const modelId of modelsToTry) {
      try {
        const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey });
        const { text } = await generateText({
          model: googleAI(modelId),
          system: `אתה נציג המכירות של ח. סבן. ענה בעברית. נתוני מלאי: ${context}`,
          messages,
        });
        
        successText = text;
        workingModel = modelId;
        break; // אם הצליח, יוצא מהלופ
      } catch (err) {
        console.error(`Failed with ${modelId}, trying next...`);
        continue;
      }
    }

    if (!workingModel) {
      throw new Error("כל המודלים נכשלו. וודא שהמפתח ב-Google AI Studio תקין.");
    }

    return Response.json({ 
      text: successText, 
      activeModel: workingModel,
      uiBlueprint: products?.[0] ? { type: "product_card", data: products[0] } : null
    });

  } catch (error: any) {
    return Response.json({ 
      text: "❌ תקלה סופית: המפתח ב-Vercel הוגדר אך גוגל דוחה אותו. וודא שאין רווחים במפתח.",
      debug: error.message 
    }, { status: 200 });
  }
}
