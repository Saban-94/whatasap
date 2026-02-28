import { createGoogle } from "@ai-sdk/google";
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

    // הדרך הנכונה להגדיר מפתח בגרסאות האחרונות
    const google = createGoogle({
      apiKey: geminiKey,
    });

    const { data: products } = await supabase
      .from("inventory")
      .select("*")
      .or(`product_name.ilike.%${lastMsg}%,sku.ilike.%${lastMsg}%`)
      .limit(3);

    const productContext = products?.length 
      ? `נתוני מלאי: ${JSON.stringify(products)}` 
      : "לא נמצא מוצר במלאי.";

    const { text } = await generateText({
      model: google("gemini-1.5-pro-latest"),
      system: `אתה המוח הטכני של ח. סבן. השב בעברית. נתונים: ${productContext}`,
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
    return Response.json({ text: "שגיאת מערכת" }, { status: 200 });
  }
}
