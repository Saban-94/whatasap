import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

// הגדרת Dynamic כדי למנוע Cache ישן ב-Vercel
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const messages = body.messages || [];

    if (messages.length === 0) {
      return Response.json({ text: "שלום! סבן AI מוכן לעזור לך." });
    }

    // שליפת מפתחות מה-Environment Variables
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

    if (!geminiKey || !supabaseUrl || !supabaseKey) {
      console.error("Missing API Keys");
      return Response.json({ text: "חלה שגיאה בתצורת השרת (מפתחות חסרים)." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const lastMsgObj = messages[messages.length - 1];
    const lastMsg = (lastMsgObj.content || "").toString().trim();

    // הגדרת מערכים עם טיפוס any[] למניעת שגיאות TypeScript Build
    let products: any[] = [];
    let businessInfo: any[] = [];

    // שליפת נתונים רלוונטיים מ-Supabase לפי הודעת המשתמש
    if (lastMsg) {
      const [prodRes, bizRes] = await Promise.all([
        supabase.from("inventory").select("*").ilike("product_name", `%${lastMsg}%`).limit(3),
        supabase.from("business_info").select("question, answer").ilike("question", `%${lastMsg}%`).limit(3)
      ]);

      if (prodRes.data) products = prodRes.data;
      if (bizRes.data) businessInfo = bizRes.data;
    }

    const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey });

    // שימוש במודל Gemini 3 Flash החדש (מעודכן למרץ 2026)
    const { text } = await generateText({
      model: googleAI("gemini-3-flash"), 
      system: `אתה עוזר מכירות מומחה של "ח. סבן חומרי בניין". 
      השתמש במידע הבא כדי לענות:
      מידע עסקי (שעות, סניפים): ${JSON.stringify(businessInfo)}
      מלאי זמין: ${JSON.stringify(products)}
      
      הנחיות:
      1. ענה בעברית מקצועית, אדיבה וקצרה.
      2. אם מדובר בחישוב דבק: (שטח במ"ר * 4) חלקי 25, ועוד שק אחד רזרבה.
      3. אם אין מידע ספציפי, ענה לפי הידע הכללי שלך על חומרי בניין.`,
      messages,
      temperature: 0.4,
    });

    return Response.json({ 
      text: text?.trim() || "לא הצלחתי לגבש תשובה, נסה שוב.",
      products 
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return Response.json({ 
      text: "סליחה, חלה שגיאה בעיבוד הבקשה.",
      error: error.message 
    }, { status: 500 });
  }
}
