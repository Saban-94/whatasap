export const dynamic = 'force-dynamic';

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content.trim();

    // 1. חיבור ל-Supabase - וודא שהשמות ב-Vercel הם בדיוק אלו
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. חיבור ל-Gemini 3.1 Flash
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!geminiKey) throw new Error("Missing Gemini API Key in Vercel Environment");

    const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey });

    // 3. שליפת מוצרים מהמלאי לפי שמות העמודות ב-SQL שלך
    const { data: products, error: dbError } = await supabase
      .from("inventory")
      .select("product_name, sku, price, category, supplier_name, department")
      .or(`product_name.ilike.%${lastMessage}%,sku.ilike.%${lastMessage}%`)
      .limit(3);

    if (dbError) {
      console.error("Supabase Query Error:", dbError.message);
      throw dbError;
    }

    const context = products?.length 
      ? `מצאתי את המוצרים הבאים במלאי של סבן: ${JSON.stringify(products)}` 
      : "לא נמצא מוצר תואם בחיפוש במלאי.";

    // הגדרת המודל החדש והתקין לפי התיעוד מ-26 בפברואר
    const { text } = await generateText({
    model: googleAI("gemini-3-flash"),
     system: `אתה המוח הטכני של ח. סבן חומרי בניין. השב בעברית.
           נתוני מלאי מאומתים: ${JSON.stringify(products || [])}`,
  messages,
    });

    return Response.json({ 
      text, 
      uiBlueprint: products?.[0] ? {
        type: "product_card",
        data: products[0]
      } : null
    });

  } catch (error: any) {
    console.error("Critical API Error:", error);
    // החזרת תשובה ללקוח שלא "תשבור" את הצ'אט
    return Response.json({ 
      text: "מצטער ראמי, יש לי תקלה קלה בשליפת הנתונים מהמחסן. וודא שביצעת Redeploy אחרי עדכון המפתחות.",
      debug: error.message 
    }, { status: 200 });
  }
}
