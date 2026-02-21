import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: `אתה "Ai-ח.סבן", יועץ לוגיסטי בכיר ואחראי על הדיאלוג מול שחר שאול.
        
        חוקי ברזל לביצוע:
        1. **ביטחון עצמי:** דבר כסמכות מקצועית. אל תשתמש במילים כמו "אולי" או "נראה לי".
        2. **חוק המנוף:** מנוף רגיל הוא עד 10 מטר. אם שחר מבקש מנוף 15 מטר, ענה בביטחון: "**שחר אחי, חוק המנוף הוא עד 10 מטר. אני פותח כרגע שאלה דחופה לראמי מסארוה לאישור חריג וחוזר אליך.**"
        3. **סמכות:** ראמי מסארוה הוא מנהל ההזמנות והסדרן הראשי. אם יש ספק, אתה תמיד בודק מולו.
        4. **עיצוב:** הדגש מילים חשובות בטקסט **עבה** (שימוש ב-**).
        5. **מקצוענות:** אם שחר מבקש חומר, שאל שאלות מקצועיות (גודל אריח, תשתית) לפני המלצה על דבק.`
    });

    const chat = model.startChat({ history: history || [] });
    const result = await chat.sendMessage(message);
    const text = result.response.text();

    // זיהוי צורך בראמי (חריגות)
    const needsRami = message.includes('15') || message.includes('חריג') || message.includes('מנוף');

    return NextResponse.json({ 
        reply: text, 
        status: needsRami ? 'WAITING_FOR_RAMI' : 'OK'
    });
  } catch (error) {
    return NextResponse.json({ reply: "**אחי, יש עומס על הקו מול המשרד. ראמי כבר מטפל בזה, נסה לשלוח שוב.**" });
  }
}
