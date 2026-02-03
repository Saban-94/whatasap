import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import productsData from "../../../data/data.json"; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    const systemInstruction = `
      אתה "היועץ ההנדסי של ח. סבן". מומחה לחומרי בניין, דבקים ואיטום.
      נתוני הקטלוג שלך: ${JSON.stringify(productsData)}.
      הנחיות:
      1. השתמש רק במוצרים מהקטלוג.
      2. לכל מוצר צרף "טיפ מקצוען" מהשדה pro_tip.
      3. חישובי כמויות כוללים 25% פחת כברירת מחדל.
      4. ענה בעברית מקצועית ותמציתית.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemInstruction }] },
        { role: "model", parts: [{ text: "שלום, אני יועץ ח. סבן. איך אוכל לעזור הנדסית היום?" }] },
        ...(history || []).map((h: any) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        })),
      ],
    });

    const result = await chat.sendMessage(message);
    const text = result.response.text();
    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
  }
}
