import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1]?.content?.toString().trim() || "";

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE!
    );
    
    // שליפה ממוקדת
    const { data: products } = await supabase
      .from("inventory")
      .select("*")
      .or(`product_name.ilike.%${lastMsg}%,sku.ilike.%${lastMsg}%`)
      .limit(1);

    const googleAI = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });
    const models = ["gemini-1.5-flash", "gemini-1.5-pro"]; // Fallback models
    
    let responseText = "";
    for (const modelId of models) {
      try {
        const { text } = await generateText({
          model: googleAI(modelId),
          system: `אתה מנהל המכירות הבכיר של ח. סבן. ענה בקיצור ובפורמט HTML (<b>).
          מלאי: ${JSON.stringify(products)}.
          חוק חישוב סיקה: (שטח*4)/25 + 1. תוצאה סופית מודגשת.`,
          messages,
          temperature: 0.2
        });
        if (text) { responseText = text; break; }
      } catch (e) { continue; }
    }

    const uiBlueprint = products && products.length > 0 ? {
      type: "product_card",
      data: {
        title: products[0].product_name,
        price: products[0].price,
        image: products[0].image_url || null,
        sku: products[0].sku,
        specs: { coverage: "4 ק\"ג למ\"ר", drying: "24 שעות" }
      }
    } : null;

    return Response.json({ text: responseText, products, uiBlueprint });
  } catch (error) {
    return Response.json({ text: "שגיאה בחיבור." }, { status: 500 });
  }
}
