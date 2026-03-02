import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let activeModelName = "None";
  try {
    const body = await req.json().catch(() => ({}));
    const messages = body.messages || [];

    if (messages.length === 0) {
      return Response.json({ text: "שלום! סבן AI מוכן לעזור לך עם מוצרים, חישובים ומידע כללי." });
    }

    const lastMsgObj = messages[messages.length - 1];
    const rawText = lastMsgObj.content || lastMsgObj.text || "";
    const lastMsg = rawText.toString().trim();

    // הגדרת מפתחות
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;
    
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // התיקון הקריטי: הוספת טיפוס any[] למניעת שגיאת Build
    let products: any[] = [];
    let businessInfo: any[] = [];

    if (lastMsg) {
      // 1. חיפוש מוצרים רלוונטיים
      const { data: prodData } = await supabase
        .from("inventory")
        .select("*")
        .or(`product_name.ilike.%${lastMsg}%,sku.ilike.%${lastMsg}%`)
        .limit(3);
      if (prodData) products = prodData;

      // 2. חיפוש מידע עסקי (business_info)
      const { data: bizData } = await supabase
        .from("business_info")
        .select("question, answer")
        .or(`question.ilike.%${lastMsg}%,category.ilike.%${lastMsg}%`)
        .limit(3);
      if (bizData) businessInfo = bizData;
    }

    // רשימת מודלים
    const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash"];
    if (!geminiKey) throw new Error("Missing Gemini API Key");
    
    const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey });
    let finalResponseText = "";
    
    for (const modelId of modelsToTry) {
      try {
        const { text } = await generateText({
          model: googleAI(modelId),
          system: `אתה יועץ המכירות והשירות של "ח. סבן חומרי בניין". 
          מידע עסקי: ${JSON.stringify(businessInfo)}
          מלאי זמין: ${JSON.stringify(products)}
          חוקי חישוב: דבקים (שטח*4)/25 + 1 רזרבה. ענה בעברית מקצועית ואדיבה.`,
          messages,
          temperature: 0.4
        });

        finalResponseText = text?.trim() || "";
        activeModelName = modelId;
        break; 
      } catch (err) {
        continue;
      }
    }

    return Response.json({ 
      text: finalResponseText, 
      products, 
      activeModel: activeModelName 
    });

  } catch (error: any) {
    return Response.json({ 
      text: "חלה שגיאה בעיבוד.",
      debug: error.message
    });
  }
}
