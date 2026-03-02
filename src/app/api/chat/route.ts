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
      return Response.json({ text: "שגיאה בתצורת השרת." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const lastMsg = (messages[messages.length - 1]?.content || "").toString().trim();
    
    // שליפה חכמה מהטבלאות
    let products: any[] = [];
    let businessInfo: any[] = [];
    
    if (lastMsg) {
      const searchWord = lastMsg.split(' ').filter((w: string) => w.length > 2)[0] || lastMsg;
      const [prodRes, bizRes] = await Promise.all([
        supabase.from("inventory").select("*").or(`product_name.ilike.%${searchWord}%,sku.ilike.%${searchWord}%`).limit(2),
        supabase.from("business_info").select("*").limit(5)
      ]);
      products = prodRes.data || [];
      businessInfo = bizRes.data || [];
    }

    const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey });
    const models = ["gemini-3.1-flash-image-preview", "gemini-3-flash-preview", "gemini-1.5-flash-latest"];
    
    let finalResponse = "";
    for (const modelId of models) {
      try {
        const { text } = await generateText({
          model: googleAI(modelId),
          system: `אתה מנהל המכירות של "ח. סבן חומרי בניין". 
          עליך להשתמש במידע מהטבלאות: מלאי: ${JSON.stringify(products)}, מידע עסקי: ${JSON.stringify(businessInfo)}.
          הנחיות:
          1. השתמש בתגיות HTML כמו <b> ו-<u> להדגשה עבה. אל תשתמש ב-**.
          2. אם נמצא מוצר, ציין שמוצג כרטיס מוצר מתחת לתשובה.
          3. חוק סיקה: (שטח*4)/25 + 1 רזרבה. הצג את החישוב בבירור.`,
          messages,
          temperature: 0.3,
        });
        if (text) { finalResponse = text.trim(); break; }
      } catch (e) { continue; }
    }

    return Response.json({ text: finalResponse, products });
  } catch (error: any) {
    return Response.json({ text: "שגיאה בחיבור.", error: error.message }, { status: 500 });
  }
}
