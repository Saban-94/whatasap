export const dynamic = 'force-dynamic';

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  let activeModelName = "None";
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.trim();

    // 1. הגדרת מפתחות - בדיקה שהם קיימים
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

    // 2. חיבור ל-Supabase (עם הגנה)
    let products = [];
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase
          .from("inventory")
          .select("*")
          .or(`product_name.ilike.%${lastMsg}%,sku.ilike.%${lastMsg}%`)
          .limit(2);
        if (data) products = data;
      } catch (e) { console.error("Supabase Error:", e); }
    }

    // 3. חיפוש תמונה בגוגל (בבידוד מוחלט - שלא יפיל את השאילתה)
    if (products.length > 0 && process.env.GOOGLE_CSE_API_KEY) {
      try {
        const imgRes = await fetch(`https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_CSE_API_KEY}&cx=${process.env.GOOGLE_CSE_CX_ID}&q=${encodeURIComponent(products[0].product_name)}&searchType=image&num=1`, { next: { revalidate: 3600 } });
        const imgData = await imgRes.json();
        if (imgData.items?.[0]) products[0].image_url = imgData.items[0].link;
      } catch (e) { console.error("Google Image Error:", e); }
    }

    // 4. לופ מודלים חסין (Model Fallback)
    const models = ["gemini-3.1-flash-image-preview", "gemini-3-flash-preview", "gemini-1.5-flash-latest"];
    const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey! });
    
    let generatedText = "מצטער, לא הצלחתי לעבד את הבקשה.";
    
    for (const m of models) {
      try {
        const { text } = await generateText({
          model: googleAI(m),
          system: `אתה יועץ המכירות של ח. סבן חומרי בניין. ענה בעברית. מלאי זמין: ${JSON.stringify(products)}`,
          messages
        });
        generatedText = text;
        activeModelName = m;
        break; 
      } catch (e) { continue; }
    }

    return Response.json({ text: generatedText, products, activeModel: activeModelName });

  } catch (error: any) {
    console.error("Critical API Error:", error);
    return Response.json({ 
      text: "ראמי אחי, יש תקלה במפתחות או בחיבור. בדוק את ה-Logs ב-Vercel.",
      debug: error.message 
    });
  }
}
