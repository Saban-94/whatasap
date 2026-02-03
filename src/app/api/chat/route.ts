import { NextRequest, NextResponse } from 'next/server';
import productsData from "../../../data/data.json"; 

const PRIMARY_MODEL = "gemini-1.5-flash-latest";
const FALLBACK_MODEL = "gemini-1.5-pro"; // מודל גיבוי חזק

export async function POST(req: NextRequest) {
  // בדיקת מפתח API
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY missing in Vercel settings.' },
      { status: 500 }
    );
  }

  try {
    const { message, history } = await req.json();

    const systemInstruction = `
      אתה "היועץ ההנדסי של ח. סבן". מומחה לחומרי בניין ואיטום.
      השתמש רק בקטלוג: ${JSON.stringify(productsData)}.
      ענה בעברית מקצועית, צרף Pro-Tip לכל מוצר והוסף 25% פחת בחישובים.
    `;

    const payload = {
      contents: [
        { role: "user", parts: [{ text: systemInstruction }] },
        { role: "model", parts: [{ text: "הבנתי, אני מוכן לייעץ בשם ח. סבן." }] },
        ...(history || []).map((h: any) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        })),
        { role: "user", parts: [{ text: message }] }
      ]
    };

    // ניסיון ראשון עם המודל הראשי
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${PRIMARY_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      return NextResponse.json({ text: data.candidates[0].content.parts[0].text });
      
    } catch (e) {
      // ניסיון שני עם מודל הגיבוי
      console.warn("Primary model failed, trying fallback...");
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${FALLBACK_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      return NextResponse.json({ text: data.candidates[0].content.parts[0].text, note: "fallback used" });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
