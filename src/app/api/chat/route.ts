export const dynamic = 'force-dynamic';

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  let activeModelName = "None";
  try {
    // 1. הגנה על קבלת ה-Body
    const body = await req.json().catch(() => ({}));
    const messages = body.messages || [];

    if (messages.length === 0) {
      return Response.json({ text: "שלום ראמי, איך אוכל לעזור היום?" });
    }

    // 2. חילוץ טקסט חסין (מונע שגיאת trim על undefined)
    const lastMsgObj = messages[messages.length - 1];
    const lastMsgRaw = lastMsgObj.content || lastMsgObj.text || "";
    const lastMsg = lastMsgRaw.toString().trim();

    // 3. הגדרת מפתחות מה-Environment
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

    // 4. שליפת נתונים מ-Supabase (מבודד - שלא יפיל את ה-API)
    let products = [];
    if (lastMsg && supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase
          .from("inventory")
          .select("*")
          .or(`product_name.ilike.%${lastMsg}%,sku.ilike.%${lastMsg}%`)
          .limit(2);
        if (!error && data) products = data;
      } catch (e) {
        console.error("Supabase Error Context:", e);
      }
    }

    // 5. חיפוש תמונה בגוגל (אופציונלי - מבודד)
    if (products.length > 0 && process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_CX_ID) {
      try {
        const imgRes = await fetch(
          `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_CSE_API_KEY}&cx=${process.env.GOOGLE_CSE_CX_ID}&q=${encodeURIComponent(products[0].product_name)}&searchType=image&num=1`
        );
        const imgData = await imgRes.json();
        if (imgData.items?.[0]) products[0].image_url = imgData.items[0].link;
      } catch (e) {
        console.error("Image Search Error:", e);
      }
    }

    // 6. לופ מודלים (Fallback) - לפי עדכוני מרץ 2026
    const modelsToTry = [
      "gemini-3.1-flash-image-preview", 
      "gemini-3-flash-preview", 
      "gemini-1.5-flash-latest"
    ];

    if (!geminiKey) throw new Error("Missing Gemini API Key");
    const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey });

    let finalResponseText = "";
    
    for (const modelId of modelsToTry) {
      try {
        const { text } = await generateText({
          model: googleAI(modelId),
          system: `אתה יועץ המכירות של ח. סבן חומרי בניין. ענה בעברית. נתוני מלאי: ${JSON.stringify(products)}`,
          messages
        });
        finalResponseText = text;
        activeModelName = modelId;
        break; // הצלחה - יוצא מהלופ
      } catch (err) {
        console.warn(`Model ${modelId} failed, trying next...`);
        continue;
      }
    }

    if (!activeModelName || activeModelName === "None") {
      throw new Error("All AI models failed to respond.");
    }

    return Response.json({ 
      text: finalResponseText, 
      products, 
      activeModel: activeModelName 
    });

  } catch (error: any) {
    console.error("CRITICAL API ERROR:", error.message);
    return Response.json({ 
      text: "ראמי אחי, המערכת זיהתה שגיאה קריטית. וודא שהמפתחות ב-Vercel מעודכנים.",
      debug: error.message,
      status: "error"
    });
  }
}
