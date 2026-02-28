export const dynamic = 'force-dynamic';

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content.trim();

    // 1. חיבור בטוח ל-Supabase עם מפתח ה-Service Role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    );

    // 2. חיבור ל-Gemini 3.1 Flash
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!geminiKey) throw new Error("Missing Gemini API Key");

    const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey });

    // 3. שליפת מוצרים מהמלאי לפי ה-SQL שלך (product_name, sku, category)
    const { data: products, error: dbError } = await supabase
      .from("inventory")
      .select("product_name, sku, price, category, supplier_name, department")
      .or(`product_name.ilike.%${lastMessage}%,sku.ilike.%${lastMessage}%`)
      .limit(3);

    if (dbError) console.error("Database Error:", dbError);

    const context = products?.length 
      ? `מוצרים שנמצאו במלאי סבן: ${JSON.stringify(products)}` 
      : "לא נמצא מוצר תואם במלאי.";

    // 4. יצירת תשובה עם המודל החדש
    const { text } = await generateText({
      model: googleAI("gemini-3.1-flash-preview"),
      system: `אתה נציג טכני של חברת "ח. סבן". ענה בעברית. 
               השתמש בנתונים הבאים מהמלאי: ${context}.
               אם מצאת מוצר, פרט את המק"ט והמחיר.`,
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
    // החזרת JSON תקין גם בשגיאה כדי למנוע 500 בדפדפן
    return Response.json({ 
      text: "אחי, יש לי תקלה בחיבור למחסן. וודא שמפתח ה-API מוגדר ב-Vercel.",
      error: error.message 
    }, { status: 200 });
  }
}
