import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: `אתה "Ai-ח.סבן", יועץ לוגיסטי בכיר. הלקוח הוא שחר (VIP).
        1. **ביטחון מוחלט**: דבר כסמכות. בלי "אולי".
        2. **חוקי ראמי**: מנוף מעל 10 מטר דורש אישור ראמי.
        3. **קטלוג**: השתמש במוצרים מהקובץ (מצע א', דבק 800, מכולות).
        4. **רציפות**: אל תעצור. אם חסר מידע, שאל שאלה אחת ברורה.`
    });

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    const text = result.response.text();

    const isUrgent = message.includes('15') || message.includes('מנוף');

    return NextResponse.json({ 
        reply: text, 
        status: isUrgent ? 'WAITING_FOR_RAMI' : 'OK' 
    });
  } catch (error) {
    return NextResponse.json({ reply: "**אחי, ראמי בקו השני. נסה שוב.**" });
  }
}
