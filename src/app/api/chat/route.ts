export const dynamic = 'force-dynamic';

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { supabase } from "@/lib/supabase";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.trim().toLowerCase();
    
    // שליפת המפתח בצורה בטוחה
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!geminiKey) {
      return Response.json({ text: "שגיאה: חסר API Key בהגדרות Vercel." }, { status: 200 });
    }

    // הגדרת המודל החדש (נכון ל-28 בפברואר 2026)
    const googleAI = createGoogleGenerativeAI({
      apiKey: geminiKey,
    });

    // חיפוש במלאי סבן ב-Supabase
    const { data: products } = await supabase
      .from("inventory")
      .select("*")
      .or(`product_name.ilike.%${lastMsg}%,sku.ilike.%${lastMsg}%`)
      .limit(3);

    const { text } = await generateText({
      model: googleAI("gemini-3.1-flash-preview"), // המודל המעודכן
      system: `אתה המוח הטכני של ח. סבן חומרי בניין. השב בעברית.
               נתוני מלאי מאומתים: ${JSON.stringify(products || [])}`,
      messages,
    });

    return Response.json({ 
      text, 
      uiBlueprint: products?.[0] ? {
        type: "product_card",
        data: {
          title: products[0].product_name,
          price: products[0].price,
          image: products[0].image_url
        }
      } : null
    });

  } catch (error: any) {
    console.error("Gemini 3.1 Error:", error);
    return Response.json({ text: "מצטער ראמי, יש לי תקלה קלה בסנכרון מול המודל החדש. תנסה שוב בעוד רגע?" }, { status: 200 });
  }
}
