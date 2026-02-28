export const dynamic = 'force-dynamic';

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { supabase } from "@/lib/supabase";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.trim().toLowerCase();
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!geminiKey) return Response.json({ text: "Missing API Key" }, { status: 500 });

    const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey });

    // שליפה מהמלאי לפי המבנה של ה-CSV שלך
    const { data: products } = await supabase
      .from("inventory")
      .select("*")
      .or(`product_name.ilike.%${lastMsg}%,sku.ilike.%${lastMsg}%`)
      .limit(3);

    const productContext = products?.length 
      ? `מלאי מאומת: ${JSON.stringify(products)}` 
      : "לא נמצא מוצר במלאי.";

    const { text } = await generateText({
      model: googleAI("gemini-1.5-pro-latest"),
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
          specs: { coverage: products[0].coverage_per_sqm, drying: products[0].drying_time }
        }
      } : null
    });
  } catch (error) {
    return Response.json({ text: "שגיאת מערכת בסנכרון המלאי." });
  }
}
