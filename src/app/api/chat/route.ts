// src/app/api/chat/route.ts
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];

    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

    if (!geminiKey || !supabaseUrl || !supabaseKey) {
       return Response.json({ text: "חסרים מפתחות API ב-Vercel" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const lastMsg = messages[messages.length - 1]?.content || "";

    // שליפת נתונים - כאן התיקון הקריטי
    let products: any[] = [];
    let businessInfo: any[] = [];

    const { data: pData } = await supabase.from("inventory").select("*").ilike("product_name", `%${lastMsg}%`).limit(2);
    if (pData) products = pData;

    const { data: bData } = await supabase.from("business_info").select("*").limit(5);
    if (bData) businessInfo = bData;

    const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey });
    
    const { text } = await generateText({
      model: googleAI("gemini-1.5-flash"),
      system: `אתה עוזר של ח. סבן. מידע עסקי: ${JSON.stringify(businessInfo)}. מלאי: ${JSON.stringify(products)}.`,
      messages
    });

    return Response.json({ text });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return Response.json({ text: "סליחה, המערכת בעומס. נסה שוב." }, { status: 500 });
  }
}
