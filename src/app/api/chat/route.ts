import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const messages = body.messages || [];

    if (messages.length === 0) {
      return Response.json({ text: "שלום! סבן AI מוכן לעזור לך." });
    }

    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

    if (!geminiKey || !supabaseUrl || !supabaseKey) {
      return Response.json({ text: "שגיאה: חסרים מפתחות API בשרת." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const lastMsgObj = messages[messages.length - 1];
    const rawText = (lastMsgObj.content || "").toString().trim();
    
    // ניקוי מילת מפתח לחיפוש חכם (לוקח מילה משמעותית מההודעה)
    const searchKeyword = rawText.split(' ').filter((word: string) => word.length > 2)[0] || rawText;

    let products: any[] = [];
    let businessInfo: any[] = [];

    // שליפה חכמה וגמישה מ-Supabase
    if (searchKeyword) {
      const [prodRes, bizRes] = await Promise.all([
        supabase.from("inventory")
          .select("*")
          .or(`product_name.ilike.%${searchKeyword}%,sku.ilike.%${searchKeyword}%`)
          .limit(3),
        supabase.from("business_info")
          .select("question, answer")
          .limit(10) // טוען את כל המידע העסקי הרלוונטי לזיכרון הקרוב
      ]);
      products = prodRes.data || [];
      businessInfo = bizRes.data || [];
    }

    const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey });

    // רשימת מודלים לדילוג במקרה של שגיאה (Fallback)
    const modelsToTry = [
      "gemini-3.1-flash-image-preview", // Nano Banana 2
      "gemini-3-flash-preview",         // Gemini 3 Flash
      "gemini-3-flash",
      "gemini-1.5-flash-latest"         // גיבוי אחרון
    ];

    let finalResponseText = "";

    for (const modelId of modelsToTry) {
      try {
        const { text } = await generateText({
          model: googleAI(modelId),
          system: `אתה מנהל המכירות הבכיר של "ח. סבן חומרי בניין". 
          עליך לענות בפורמט HTML נקי (שימוש בתגיות <b> ו-<u> בלבד להדגשות).
          
          הנחיות קריטיות:
          1. אם נמצאו מוצרים במלאי (${JSON.stringify(products)}), הצג כרטיס מוצר מפורט:
             📦 מוצר: <b>[שם]</b> | 🔢 מק"ט: <b>[SKU]</b> | 💰 מחיר: <b>[מחיר]</b> ש"ח (לפני מע"מ).
          2. חוק חישוב סיקה/דבקים: (שטח במ"ר * 4) / 25 + 1 רזרבה. הצג את החישוב כשלב אחר שלב עם תוצאה מודגשת.
          3. השתמש במידע העסקי המצורף: ${JSON.stringify(businessInfo)} למענה על שעות פעילות ומיקום.
          4. אל תשתמש בסימני ** להדגשה. השתמש רק ב-<b>טקסט מודגש</b>.
          5. ענה בטון מקצועי, בטוח ושירותי.`,
          messages,
          temperature: 0.4,
        });

        if (text) {
          finalResponseText = text.trim();
          break; 
        }
      } catch (err) {
        console.warn(`מודל ${modelId} נכשל, מנסה את הבא...`);
        continue;
      }
    }

    if (!finalResponseText) throw new Error("כל המודלים נכשלו.");

    return Response.json({ 
      text: finalResponseText, 
      products 
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return Response.json({ text: "סליחה, המערכת בעומס זמני. נסה שוב בעוד רגע." }, { status: 500 });
  }
}
