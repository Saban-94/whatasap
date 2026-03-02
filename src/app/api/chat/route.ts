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
          .or(`product_name.ilike.%${searchKeyword}%,sku.ilike.%${searchKeyword}%,description.ilike.%${searchKeyword}%`)
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
// בתוך פונקציית ה-generateText, תחת system:
system: `אתה מנהל המכירות של "ח. סבן חומרי בניין". 
הנחיה קריטית: עליך לבסס את תשובתך אך ורק על הנתונים מהטבלאות המצורפות.

סדר עדיפויות למתן תשובה:
1. בדוק בנתוני המלאי (Inventory): ${JSON.stringify(products)}. 
   אם המוצר קיים שם, השתמש במחיר, במק"ט ובשם המדויק מהטבלה. אל תמציא נתונים!
2. בדוק במידע העסקי (Business Info): ${JSON.stringify(businessInfo)}.
   השתמש במידע זה למענה על שעות פעילות, סניפים ומדיניות הובלות.

עיצוב התשובה:
- השתמש בתגיות <b> להדגשה עבה ומקצועית.
- הצג "כרטיס מוצר" בולט הכולל: 📦 מוצר, 🔢 מק"ט, 💰 מחיר (מהטבלה בלבד), ✅ סטטוס.
- בצע את חישוב הכמויות (שטח*4/25+1) רק לאחר הצגת נתוני המוצר מהטבלה.
- אם המוצר לא נמצא בטבלה, ציין זאת במפורש והצע עזרה כללית.
- אל תשתמש בסימני **.`,
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
