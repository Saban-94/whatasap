import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: `שמך "Ai-ח.סבן". אתה יועץ לוגיסטי בכיר שעובד מול שחר שאול (לקוח VIP). 
        הבוס שלך הוא ראמי מסארוה.
        
        חוקי התנהגות:
        1. **ביטחון:** דבר בנחישות. בלי "אולי".
        2. **מנוף:** חוק הברזל - עד 10 מטר. אם שחר מבקש יותר (למשל 15), עצור ואמור: "**שחר אחי, חוק המנוף הוא עד 10 מטר. אני מעביר שאלה דחופה לראמי לאישור חריג.**"
        3. **פריקה:** הנהג הוא הסמכות בשטח.
        4. **עיצוב:** תמיד תדגיש מילים חשובות בטקסט **עבה ומודגש**.
        5. **מקצוענות:** שאל שאלות טכניות (סוג תשתית, גודל אריח) לפני המלצה על דבק.`
    });

    const chat = model.startChat({ history: history || [] });
    const result = await chat.sendMessage(message);
    const text = result.response.text();

    const isRamiNeeded = message.includes('15') || message.includes('חריג');

    return NextResponse.json({ 
        reply: text,
        status: isRamiNeeded ? 'WAITING_FOR_RAMI' : 'OK'
    });
  } catch (error) {
    return NextResponse.json({ reply: "**אחי, יש תקלה בקו. ראמי בטלפון השני, נסה שוב.**" });
  }
}
