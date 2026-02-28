export const dynamic = 'force-dynamic';

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content.trim();

    // 1. חיבור ל-Supabase (שימוש בשמות המדויקים מהבדיקה שלך)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_KEY!
    );

    // 2. חיבור ל-Gemini 3.1 Flash (תמיכה בשמות וריאביליים)
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_KEY || process.env.GEMINI_API_KEY;
    
    if (!geminiKey) {
      return Response.json({ text: "אחי, המפתח של Gemini לא נמצא בקוד. בדוק שוב את השם ב-Vercel." }, { status: 200 });
    }

    const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey });

    // 3. שליפת מוצרים מהמלאי (לפי המבנה ב-SQL שלך)
    const { data: products, error: dbError } = await supabase
      .from("inventory")
      .select("product_name, sku, price, category, supplier_name, department")
      .or(`product_name.ilike.%${lastMessage}%,sku.ilike.%${lastMessage}%`)
      .limit(3);

    if (dbError) console.error("Database Error:", dbError);

    const context = products?.length 
      ? `נתונים מאומתים מהמלאי של סבן: ${JSON.stringify(products)}` 
      : "לא נמצא מוצר כזה במלאי הנוכחי.";

    // 4. יצירת התשובה עם המודל החדש 3.1
    const { text } = await generateText({
      model: googleAI("gemini-3.1-flash-preview"),
      system: `אתה נציג המכירות והתמיכה של "ח. סבן חומרי בניין". השב בעברית בלבד.
               השתמש במידע הבא מהמלאי: ${context}.
               אם מצאת מוצר, תמיד ציין את המק"ט (SKU) ואת המחיר (Price).`,
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
    console.error("Critical Chat Error:", error);
    return Response.json({ 
      text: "מצטער ראמי, יש תקלה בשליפת הנתונים. וודא שביצעת Redeploy ב-Vercel.",
      debug: error.message 
    }, { status: 200 });
  }
}
