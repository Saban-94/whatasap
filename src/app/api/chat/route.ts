import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { supabase } from "@/lib/supabase";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.trim().toLowerCase();
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!geminiKey) {
      return Response.json({ text: "Missing Gemini API Key" }, { status: 500 });
    }

    // התיקון: שימוש בשם הפונקציה המדויק לגרסת ה-SDK החדשה
    const googleAI = createGoogleGenerativeAI({
      apiKey: geminiKey,
    });

    // חיפוש חכם במלאי (Inventory)
    const { data: products } = await supabase
      .from("inventory")
      .select("*")
      .or(`product_name.ilike.%${lastMsg}%,sku.ilike.%${lastMsg}%`)
      .limit(3);

    const productContext = products?.length 
      ? `נתוני מלאי זמינים: ${JSON.stringify(products)}` 
      : "לא נמצא מוצר מדויק במלאי כרגע.";

    // יצירת התשובה
    const { text } = await generateText({
      model: googleAI("gemini-1.5-pro-latest"),
      system: `אתה המוח הטכני של ח. סבן חומרי בניין. השב בעברית מקצועית.
               נתוני מלאי מאומתים: ${productContext}.
               אם נמצא מוצר, ציין מחיר (₪), צריכה למ"ר וזמן ייבוש.
               אם לא נמצא, הצע מוצר דומה או בקש מהמשתמש להיות ספציפי יותר.`,
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
          sku: products[0].sku,
          specs: {
            coverage: products[0].coverage_per_sqm,
            drying: products[0].drying_time
          }
        }
      } : null
    });

  } catch (error: any) {
    console.error("Saban AI Error:", error);
    return Response.json({ text: "מצטער, חלה שגיאה בחיבור למערכת סבן." }, { status: 200 });
  }
}
