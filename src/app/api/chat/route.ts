export const dynamic = 'force-dynamic';

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { supabase } from "@/lib/supabase";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.trim().toLowerCase();
    
    // משיכת המפתח מ-Vercel
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // הגנה: אם המפתח חסר, נחזיר הודעה ברורה במקום שגיאת שרת
    if (!geminiKey) {
      return Response.json({ 
        text: "ראמי, המפתח GOOGLE_GENERATIVE_AI_API_KEY חסר בהגדרות של Vercel. נא להוסיף אותו ולעשות Redeploy." 
      }, { status: 200 });
    }

    const googleAI = createGoogleGenerativeAI({
      apiKey: geminiKey,
    });

    // חיפוש במלאי סבן
    const { data: products } = await supabase
      .from("inventory")
      .select("*")
      .or(`product_name.ilike.%${lastMsg}%,sku.ilike.%${lastMsg}%`)
      .limit(3);

    const productContext = products?.length 
      ? `מלאי עדכני: ${JSON.stringify(products)}` 
      : "לא נמצא מוצר תואם במלאי.";

    // שימוש במודל 3.1 Flash Image Preview (הכי חדש שיש)
    const { text } = await generateText({
      model: googleAI("gemini-3.1-flash-preview"),
      system: `אתה המוח של ח. סבן חומרי בניין. השב בעברית.
               השתמש במידע מהמלאי: ${productContext}.
               תמיד תציין מחיר ומק"ט אם מצאת מוצר.`,
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
    console.error("Critical API Error:", error);
    return Response.json({ text: "מצטער, חלה שגיאה פנימית בסנכרון. נסה שוב." }, { status: 200 });
  }
}
