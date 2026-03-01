export const dynamic = 'force-dynamic';

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content.trim();

    // חיבור ל-Supabase - שימוש ב-Service Role לעקיפת בעיות הרשאה
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    );

    // הגדרת Gemini 3.1 Flash
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey! });

    // חיפוש מוצרים - שליפת עמודות שקיימות בטוח ב-SQL שלך
    const { data: products, error: dbError } = await supabase
      .from("inventory")
      .select("product_name, sku, price, category, supplier_name")
      .or(`product_name.ilike.%${lastMessage}%,sku.ilike.%${lastMessage}%`)
      .limit(3);

    if (dbError) throw dbError;

    const inventoryContext = products?.length 
      ? `נתוני מלאי מאומתים מסבן: ${JSON.stringify(products)}` 
      : "המוצר לא נמצא במלאי הנוכחי.";

    const { text } = await generateText({
      model: googleAI("gemini-3.1-flash-preview"),
      system: `אתה עוזר טכני של "ח. סבן חומרי בניין". השב בעברית.
               מידע מהמלאי: ${inventoryContext}.
               אם מצאת מוצר, פרט מק"ט ומחיר. אם לא מצאת, הצע עזרה כללית.`,
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
      text: "ראמי אחי, יש תקלה בשאילתה למסד הנתונים. וודא ששמות העמודות בקוד תואמים ל-Supabase.",
      debug: error.message 
    }, { status: 200 });
  }
}
