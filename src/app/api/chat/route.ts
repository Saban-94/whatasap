export const dynamic = 'force-dynamic';

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { supabase } from "@/lib/supabase";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.trim().toLowerCase();
    
    // משיכת המפתח מה-Secrets (תמיכה בשמות השונים ב-Vercel)
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      return Response.json({ text: "Missing Gemini API Key in environment variables." }, { status: 500 });
    }

    // הגדרת ה-SDK של גוגל עם המודל החדש 3.1
    const googleAI = createGoogleGenerativeAI({
      apiKey: geminiKey,
    });

    // חיפוש במלאי סבן (לפי העמודות ב-CSV שלך)
    const { data: products } = await supabase
      .from("inventory")
      .select("*")
      .or(`product_name.ilike.%${lastMsg}%,sku.ilike.%${lastMsg}%`)
      .limit(3);

    const productContext = products?.length 
      ? `מידע מאומת מהמלאי: ${JSON.stringify(products)}` 
      : "המוצר לא נמצא במלאי הנוכחי של סבן.";

    // יצירת התשובה עם מודל 3.1 Flash Image Preview
    const { text } = await generateText({
      model: googleAI("gemini-3.1-flash-preview"),
      system: `אתה המוח הטכני של "ח. סבן חומרי בניין". עליך לענות בעברית מקצועית.
               השתמש בנתונים הבאים מהמלאי: ${productContext}.
               תמיד תציין מחיר (₪), מק"ט (SKU) ופרטים טכניים אם קיימים.
               אם מצאת "סיקה 107", תן דגש על צריכה למ"ר וזמן ייבוש.`,
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
          },
          features: products[0].features || []
        }
      } : null
    });

  } catch (error: any) {
    console.error("Saban AI Error:", error);
    return Response.json({ text: "חלה שגיאה בסנכרון מול מודל Gemini 3.1." }, { status: 200 });
  }
}
