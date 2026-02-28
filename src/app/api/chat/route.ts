export const dynamic = 'force-dynamic';

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { supabase } from "@/lib/supabase";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content.trim();
    
    // משיכת המפתח מ-Vercel
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!geminiKey) throw new Error("Missing Gemini API Key");

    const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey });

    // 1. שלב החיפוש ב-Database: שליפת מוצרים רלוונטיים מהמלאי של סבן
    const { data: products } = await supabase
      .from("inventory")
      .select("*")
      .or(`product_name.ilike.%${lastMessage}%,sku.ilike.%${lastMessage}%,category.ilike.%${lastMessage}%`)
      .limit(3);

    // 2. בניית הקשר (Context) עבור הבינה המלאכותית
    const inventoryContext = products && products.length > 0 
      ? `נתונים מאומתים מהמלאי של סבן: ${JSON.stringify(products)}` 
      : "לא נמצא מוצר תואם במלאי כרגע.";

    // 3. יצירת תשובה עם Gemini 3.1 Flash
    const { text } = await generateText({
      model: googleAI("gemini-3.1-flash-preview"),
      system: `אתה עוזר טכני מקצועי של חברת "ח. סבן חומרי בניין". 
               ענה בעברית בלבד. השתמש בנתוני המלאי המצורפים כדי לתת תשובה מדויקת.
               אם נמצא מוצר, ציין מחיר, מק"ט (SKU) וספק.
               נתוני מלאי: ${inventoryContext}`,
      messages,
    });

    // 4. החזרת התשובה יחד עם "Blueprint" לממשק הויזואלי
    return Response.json({ 
      text, 
      uiBlueprint: products?.[0] ? {
        type: "product_card",
        data: products[0]
      } : null
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return Response.json({ text: "מצטער, חלה שגיאה בחיבור למערכת המלאי." }, { status: 500 });
  }
}
