import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { supabase } from "@/lib/supabase";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.trim().toLowerCase();
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!geminiKey) throw new Error("Missing Gemini API Key");

    // 1. הגדרת המודל בצורה נכונה עם המפתח
    const model = google("gemini-1.5-pro-latest", {
      apiKey: geminiKey,
    });

    // 2. חיפוש במלאי (Inventory)
    const { data: products } = await supabase
      .from("inventory")
      .select("*")
      .or(`product_name.ilike.%${lastMsg}%,sku.ilike.%${lastMsg}%`)
      .limit(3);

    const productContext = products?.length 
      ? `מידע מאומת מהמלאי: ${JSON.stringify(products)}` 
      : "לא נמצא מוצר מדויק במלאי כרגע.";

    // 3. יצירת התשובה
    const { text } = await generateText({
      model: model, // משתמש במודל שהגדרנו למעלה
      system: `אתה המוח הטכני של ח. סבן. עליך להחזיר תמיד תשובה מקצועית בעברית.
               השתמש במידע הבא מהמלאי: ${productContext}.
               אם נמצא מוצר, ציין מחיר, צריכה למ"ר וזמן ייבוש.`,
      messages,
    });

    return Response.json({ 
      text, 
      uiBlueprint: products?.[0] ? {
        type: "product_card",
        data: {
          title: products[0].product_name,
          price: products[0].price,
          image: products[0].image_url,
          specs: {
            coverage: products[0].coverage_per_sqm,
            drying: products[0].drying_time
          }
        }
      } : null
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return Response.json({ text: "חלה שגיאה בחיבור למערכת." }, { status: 200 });
  }
}
