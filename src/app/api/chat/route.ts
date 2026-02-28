import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { supabase } from "@/lib/supabase";

// הגדרת זמן ריצה מקסימלי ל-Vercel Edge
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.trim().toLowerCase();
    
    // משיכת המפתח מה-Environment Variables של Vercel
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!geminiKey) {
      return Response.json({ text: "Missing Google API Key in Vercel settings." }, { status: 500 });
    }

    // הגדרת המודל בצורה הנכונה לגרסת SDK latest
    const model = google("gemini-1.5-pro-latest", {
      apiKey: geminiKey,
    });

    // שאילתת מלאי מול Supabase (לפי העמודות ב-CSV שלך)
    const { data: products } = await supabase
      .from("inventory")
      .select("*")
      .or(`product_name.ilike.%${lastMsg}%,sku.ilike.%${lastMsg}%`)
      .limit(3);

    const productContext = products?.length 
      ? `נתוני מלאי זמינים: ${JSON.stringify(products)}` 
      : "לא נמצא מוצר תואם בחיפוש ישיר.";

    // יצירת התשובה באמצעות ה-SDK החדש
    const { text } = await generateText({
      model: model,
      system: `אתה המוח הטכני של חברת ח. סבן. השב בעברית מקצועית.
               נתונים מהמלאי: ${productContext}.
               אם מצאת מוצר, ציין מחיר (₪), צריכה למ"ר וזמן ייבוש. 
               אם לא מצאת, הצע מוצר דומה מהקטגוריה.`,
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
