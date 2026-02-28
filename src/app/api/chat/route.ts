export const dynamic = 'force-dynamic';

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { supabase } from "@/lib/supabase";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.trim().toLowerCase();
    
    // בדיקה כפולה של שם המשתנה (לוודא שזה תואם ל-Vercel Secrets)
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      console.error("Missing Gemini API Key");
      return Response.json({ text: "שגיאה: חסר מפתח API במערכת." }, { status: 500 });
    }

    const googleAI = createGoogleGenerativeAI({
      apiKey: geminiKey,
    });

    // חיפוש במלאי לפי המבנה של סבן
    const { data: products } = await supabase
      .from("inventory")
      .select("*")
      .or(`product_name.ilike.%${lastMsg}%,sku.ilike.%${lastMsg}%`)
      .limit(3);

    const productContext = products?.length 
      ? `נתוני מלאי מאומתים: ${JSON.stringify(products)}` 
      : "המוצר לא נמצא במלאי הנוכחי.";

    const { text } = await generateText({
      model: googleAI("gemini-1.5-pro-latest"),
      system: `אתה המוח הטכני של חברת ח. סבן. השב בעברית.
               מידע מהמלאי: ${productContext}.
               אם מצאת "סיקה 107", פרט מחיר וצריכה.`,
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
    return Response.json({ text: "מצטער, חלה שגיאה פנימית בסנכרון המלאי." }, { status: 500 });
  }
}
