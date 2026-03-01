export const dynamic = 'force-dynamic';

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  let activeModelName = "None";
  try {
    // 1. קבלת גוף ההודעה עם הגנה מלאה
    const body = await req.json().catch(() => ({}));
    const messages = body.messages || [];

    if (messages.length === 0) {
      return Response.json({ text: "שלום ראמי, סבן AI מוכן לעבודה. איך אוכל לעזור?" });
    }

    // 2. חילוץ טקסט חסין - מונע את שגיאת ה-trim()
    const lastMsgObj = messages[messages.length - 1];
    // בודק את כל השדות האפשריים (content, text) ומבטיח מחרוזת
    const rawText = lastMsgObj.content || lastMsgObj.text || "";
    const lastMsg = rawText.toString().trim();

    // 3. מפתחות סביבה
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

    // 4. שליפת נתונים מ-Supabase (מבודד)
    let products = [];
    if (lastMsg && supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase
          .from("inventory")
          .select("*")
          .or(`product_name.ilike.%${lastMsg}%,sku.ilike.%${lastMsg}%`)
          .limit(2);
        if (data) products = data;
      } catch (e) { console.error("DB Error:", e); }
    }

    // 5. לופ מודלים מעודכן לפי התיעוד מ-26 בפברואר
    const modelsToTry = [
      "gemini-3.1-flash-image-preview", // המודל החדש (Nano Banana 2)
      "gemini-3-flash-preview",         // יציב ומהיר
      "gemini-1.5-flash-latest"         // גיבוי אחרון
    ];

    if (!geminiKey) throw new Error("Missing Gemini API Key");
    const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey });

    let finalResponseText = "";
    
    for (const modelId of modelsToTry) {
      try {
        const { text } = await generateText({
          model: googleAI(modelId),
          system: `אתה יועץ המכירות של ח. סבן חומרי בניין. ענה בעברית רהוטה. נתוני מלאי: ${JSON.stringify(products)}`,
          messages
        });
        finalResponseText = text;
        activeModelName = modelId;
        break; 
      } catch (err) {
        console.warn(`Model ${modelId} failed, moving to next.`);
        continue;
      }
    }

    return Response.json({ 
      text: finalResponseText, 
      products, 
      activeModel: activeModelName 
    });

  } catch (error: any) {
    console.error("CRITICAL ERROR:", error.message);
    return Response.json({ 
      text: "ראמי אחי, קרתה שגיאה בתקשורת עם המודלים החדשים. וודא שהמפתח ב-Vercel מעודכן.",
      debug: error.message
    });
  }
}
