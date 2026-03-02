import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const messages = body.messages || [];

    if (messages.length === 0) {
      return Response.json({ text: "שלום! סבן AI מוכן לעזור." });
    }

    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

    if (!geminiKey || !supabaseUrl || !supabaseKey) {
      return Response.json({ text: "שגיאה: חסרים מפתחות API." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const lastMsg = messages[messages.length - 1]?.content?.toString().trim() || "";

    // שליפת נתונים מ-Supabase
    let products: any[] = [];
    let businessInfo: any[] = [];
    if (lastMsg) {
      const [prodRes, bizRes] = await Promise.all([
        supabase.from("inventory").select("*").ilike("product_name", `%${lastMsg}%`).limit(3),
        supabase.from("business_info").select("question, answer").ilike("question", `%${lastMsg}%`).limit(3)
      ]);
      products = prodRes.data || [];
      businessInfo = bizRes.data || [];
    }

    const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey });

    // --- מנגנון דילוג מקצועי בין מודלים (Model Fallback) ---
    // הרשימה מסודרת מהחדש והחזק ביותר ליציב ביותר
    const modelsToTry = [
      "gemini-3.1-flash-image-preview", // Nano Banana 2 (הכי חדש - 26.02.26)
      "gemini-3-flash-preview",         // Gemini 3 Flash Preview (ינואר 2026)
      "gemini-3-flash",                 // Gemini 3 Flash Standard
      "gemini-1.5-flash-latest"         // גיבוי אחרון בהחלט
    ];

    let finalResponseText = "";
    let usedModel = "";
// --- המשך הלולאה המקצועית שכתבת ---
    for (const modelId of modelsToTry) {
      try {
        console.log(`מנסה להשתמש במודל: ${modelId}...`);
        const { text } = await generateText({
          model: googleAI(modelId),
          system: `אתה מנהל המכירות הבכיר של "ח. סבן חומרי בניין". 
          עליך לענות בעברית מקצועית, מודגשת וברורה.

          הנחיות עיצוב ותוכן:
          1. השתמש בכתב מודגש (Bold) עבור נתונים קריטיים, שמות מוצרים וכמויות.
          2. אם נמצאו מוצרים במלאי (${JSON.stringify(products)}), הצג "כרטיס מוצר" מעוצב:
             📦 מוצר: [שם המוצר]
             🔢 מק"ט: [SKU]
             💰 מחיר: [מחיר] ש"ח (לפני מע"מ)
             ✅ סטטוס: במלאי / בהזמנה
          3. חוק חישוב כמויות לסיקה/דבקים: (שטח במ"ר * 4) / 25 + 1 רזרבה. 
             הצג את החישוב בצורה ברורה: (שטח X מ"ר * 4 ק"ג) / 25 ק"ג + 1 רזרבה = Y סטים.
          4. אל תשתמש בסימני ** עבור הדגשה, השתמש בפורמט טקסט נקי ובולט.
          5. מידע עסקי נוסף: ${JSON.stringify(businessInfo)}`,
          messages,
          temperature: 0.4,
        });

        if (text) {
          finalResponseText = text.trim();
          usedModel = modelId;
          break; // הצלחנו! יוצאים מהלולאה וממשיכים לשלב ה-Response
        }
      } catch (err: any) {
        console.warn(`המודל ${modelId} נכשל, עובר למודל הבא...`);
        continue; 
      }
    }

    if (!finalResponseText) {
      throw new Error("כל המודלים נכשלו במתן תשובה.");
    }

    return Response.json({ 
      text: finalResponseText, 
      products,
      modelUsed: usedModel 
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return Response.json({ text: "סליחה, המערכת בעומס זמני. נסה שוב בעוד רגע." }, { status: 500 });
  }
}
