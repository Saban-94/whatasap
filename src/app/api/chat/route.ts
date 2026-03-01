export const dynamic = 'force-dynamic';

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content.trim();

    // 1. חיבור ל-Supabase - וודא שהמפתחות האלו קיימים ב-Vercel!
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    );

    // 2. הגדרת Gemini 3.1 Flash החדש
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!geminiKey) throw new Error("Missing Gemini API Key");

    const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey });

    // 3. שאילתה מותאמת בדיוק ל-SQL שלך (product_name, sku, category, supplier_name)
    const { data: products, error: dbError } = await supabase
      .from("inventory")
      .select("product_name, sku, price, category, supplier_name")
      .or(`product_name.ilike.%${lastMessage}%,sku.ilike.%${lastMessage}%`)
      .limit(3);

    if (dbError) throw dbError;

    const inventoryData = products?.length 
      ? `מצאתי את המוצרים הבאים במלאי סבן: ${JSON.stringify(products)}` 
      : "לא נמצא מוצר כזה במלאי הנוכחי.";

    // 4. יצירת התשובה עם המודל החדש
    const { text } = await generateText({
      model: googleAI("gemini-3.1-flash-preview"),
      system: `אתה המומחה הטכני של "ח. סבן". השב בעברית. 
               נתוני מלאי עדכניים: ${inventoryData}.
               אם מצאת מוצר, תמיד תציג את המק"ט (sku) והמחיר (price).`,
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
    console.error("Chat Error:", error);
    return Response.json({ 
      text: "מצטער ראמי, יש לי תקלה זמנית בסנכרון מול הנתונים. וודא שטבלת ה-inventory קיימת ב-Supabase.",
      error: error.message 
    }, { status: 200 });
  }
}
