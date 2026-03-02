import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1]?.content?.toString().trim() || "";

    // חיבור ל-Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE!
    );
    
    // שליפה ממוקדת של מוצר אחד
    const { data: products } = await supabase
      .from("inventory")
      .select("*")
      .or(`product_name.ilike.%${lastMsg}%,sku.ilike.%${lastMsg}%`)
      .limit(1);

    const googleAI = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });
    
    /**
     * רשימת המודלים המובילים לפי עדכוני פברואר 2026:
     * 1. gemini-3.1-pro-preview - המודל הכי חזק להבנה עמוקה.
     * 2. gemini-3.1-flash-image-preview - המודל החדש (26.2) לאופטימיזציה ומהירות.
     * 3. gemini-3-flash-preview - המודל היציב לגיבוי.
     */
    const models = [
      "gemini-3.1-pro-preview", 
      "gemini-3.1-flash-image-preview", 
      "gemini-3-flash-preview"
    ];
    
    let responseText = "";
    let usedModel = "";

    // מנגנון דילוג חכם (The Brain Loop)
    for (const modelId of models) {
      try {
        const { text } = await generateText({
          model: googleAI(modelId),
          system: `אתה מנהל המכירות הבכיר של "ח. סבן". ענה בקיצור ובפורמט HTML (<b>).
          מלאי נוכחי: ${JSON.stringify(products || [])}.
          הנחיות:
          1. אם נמצא מוצר, ציין שפרטיו מופיעים בכרטיס המצורף.
          2. חוק סיקה: (שטח * 4) / 25 + 1 רזרבה. הצג תוצאה סופית מודגשת.
          3. השתמש ב-HTML בלבד (<b>), ללא סימני **.`,
          messages,
          temperature: 0.2
        });

        if (text) {
          responseText = text;
          usedModel = modelId; // שומרים איזה מודל הצליח
          break; // מצאנו מודל יציב, יוצאים מהלולאה
        }
      } catch (e) {
        console.error(`Model ${modelId} failed, skipping to next...`);
        continue; // המודל נכשל (Deprecation או עומס), עוברים לבא
      }
    }

    // אם כל המודלים נכשלו
    if (!responseText) {
      responseText = "<b>מצטער, המערכת בעומס זמני. אנא נסה שוב בעוד רגע.</b>";
    }

    // בניית ה-uiBlueprint לעיצוב המובייל החדש
    const uiBlueprint = (products && products.length > 0) ? {
      type: "product_card",
      data: {
        title: products[0].product_name,
        price: products[0].price,
        image: products[0].image_url,
        sku: products[0].sku,
        specs: { coverage: "4 ק\"ג למ\"ר", drying: "24 שעות" }
      }
    } : null;

    return new Response(JSON.stringify({ 
      text: responseText, 
      uiBlueprint,
      debug: { model: usedModel } // עוזר לנו לדעת מי עובד בזמן אמת
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Critical API Error:", error);
    return new Response(JSON.stringify({ 
      text: "שגיאת שרת פנימית.",
      error: error.message 
    }), { status: 500 });
  }
}
