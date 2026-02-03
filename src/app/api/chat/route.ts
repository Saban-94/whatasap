import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import productsData from "../../../data/data.json";
// אתחול ה-AI עם המפתח שמוגדר ב-Environment Variables של Vercel
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // 1. הגדרת ה"הנחיות למערכת" (System Instructions)
    const systemInstruction = `
      אתה "היועץ ההנדסי של ח. סבן". אתה מומחה לחומרי בניין, דבקים, איטום ושיקום בטון.
      
      הנחיות עבודה:
      - בסיס הידע שלך הוא אך ורק הקטלוג הזה: ${JSON.stringify(productsData)}.
      - אם המשתמש שואל על מוצר שלא קיים בקטלוג, הצע את החלופה המקצועית הקרובה ביותר מבית ח. סבן.
      - תמיד ענה בעברית מקצועית, אדיבה ותמציתית.
      - בחישובי כמויות: השתמש בנתון ה-coverage מהקטלוג. אם המשתמש לא ציין עובי, הנח עובי סטנדרטי והוסף תמיד 25% פחת.
      - בכל תשובה הקשורה ליישום, הוסף "טיפ מקצוען" (Pro-Tip) המבוסס על השדה המתאים בקטלוג.
      - אל תמציא נתונים טכניים שלא מופיעים בקובץ.
    `;

    // 2. הגדרת המודל - שימוש ב-Flash לביצועים מהירים וחינמיים
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    // 3. יצירת צ'אט עם "הזרקת הקשר" (Context Injection)
    // כאן אנחנו פותרים את שגיאת ה-TypeScript על ידי הכנסת ההנחיות לתחילת ההיסטוריה
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemInstruction }],
        },
        {
          role: "model",
          parts: [{ text: "שלום, אני היועץ ההנדסי של ח. סבן. נטען במוחי כל המידע על מוצרי האיטום, הדבקה ושיקום הבטון שלנו. איך אוכל לעזור לך היום?" }],
        },
        // הזרקת היסטוריית השיחה שנשמרה ב-LocalStorage של המשתמש
        ...(history || []).map((h: any) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        })),
      ],
    });

    // 4. שליחת השאלה החדשה וקבלת התשובה
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "חלה שגיאה בעיבוד הבקשה. וודא שמפתח ה-API תקין ושהקטלוג נטען." },
      { status: 500 }
    );
  }
}
