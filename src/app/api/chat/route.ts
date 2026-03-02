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
    const lastMsg = (lastMsgObj.content || "").toString().trim();

    let products: any[] = [];
    let businessInfo: any[] = [];

    if (lastMsg) {
      const [prodRes, bizRes] = await Promise.all([
        supabase.from("inventory").select("*").ilike("product_name", `%${lastMsg}%`).limit(3),
        supabase.from("business_info").select("question, answer").ilike("question", `%${lastMsg}%`).limit(3)
      ]);
      if (prodRes.data) products = prodRes.data;
      if (bizRes.data) businessInfo = bizRes.data;
    }

    const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey });

    const { text } = await generateText({
      model: googleAI("gemini-3-flash"), // המודל החדש ביותר
      system: `אתה יועץ המכירות של "ח. סבן חומרי בניין". 
      מידע עסקי: ${JSON.stringify(businessInfo)}
      מלאי: ${JSON.stringify(products)}
      חוק חישוב דבק: (שטח * 4) / 25 + 1 רזרבה.`,
      messages,
      temperature: 0.4,
    });

    return Response.json({ 
      text: text?.trim() || "לא הצלחתי לגבש תשובה.",
      products 
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return Response.json({ text: "חלה שגיאה בעיבוד.", error: error.message }, { status: 500 });
  }
}
