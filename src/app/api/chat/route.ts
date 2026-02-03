import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import productsData from "@/data/data.json"; // וודא שהקובץ קיים בתיקייה src/data/

// אתחול ה-AI עם המפתח ששמרת ב-Vercel
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // 1. הגדרת ה"הנחיות למערכת" (System Instructions)
    // אנחנו מזריקים כאן את כל הידע ההנדסי של ח. סבן
    const systemInstruction = `
      אתה "היועץ ההנדסי של ח. סבן". אתה מומחה לחומרי בניין, דבקים, איטום ושיקום בטון.
      
      הנחיות קשיחות:
      1. השתמש אך ורק במידע מהקטלוג הבא: ${JSON.stringify(productsData)}.
      2. אם שואלים על מוצר שלא בקטלוג, הצע את החלופה הכי קרובה של ח. סבן.
      3. תמיד ענה בעברית מקצועית, אדיבה ותמציתית.
      4. בחישובי כמויות, השתמש בנתוני ה-coverage מהקטלוג והוסף 25% פחת כברירת מחדל.
      5. תן טיפים מקצועיים (Pro-Tips) בכל תשובה הקשורה ליישום בשטח.
    `;

    // 2. הגדרת המודל
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    // 3. התחלת צ'אט עם "הזרקת ידע" ראשונית (פותר את שגיאת ה-SystemInstruction)
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemInstruction }],
        },
        {
          role: "model",
          parts: [{ text: "שלום, אני היועץ המומחה של ח. סבן. נטען במוחי כל המידע ההנדסי על דבקים, איטום ושיקום. איך אוכל לעזור לך בפרויקט היום?" }],
        },
        // כאן נכנסת היסטוריית השיחה האמיתית מהדפדפן
        ...(history || []).map((h: any) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        })),
      ],
    });

    // 4. שליחת ההודעה החדשה של המשתמש
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "שגיאה בחיבור למוח ה-AI. וודא שמפתח ה-API תקין." },
      { status: 500 }
    );
  }
}
