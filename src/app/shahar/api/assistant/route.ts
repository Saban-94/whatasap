import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message, history, context } = await req.json();

    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: `אתה גימני, מנהל התפעול של ח.סבן לוגיסטיקה. 
        הלקוח מולך הוא שחר שאול (VIP). דבר אליו כקולגה - חם, מקצועי, עם סלנג של ענף הבנייה.
        משימות:
        1. לזהות מוצרים מהמלאי: סיקה 107 (19107), דבק 800 (20800), מכולת פסולת 8 קוב החלפה (82001), מצע א טון (11730).
        2. תמיד להציע הובלת מנוף אם מדובר בציוד כבד (סיקה, גבס).
        3. אם שחר אומר "אבן יהודה", תאשר שאתה מכיר את האתר.
        4. בסוף כל זיהוי מוצר, שאל אם להעמיס את זה להזמנה של יום ראשון ב-07:00.`
    });

    const chat = model.startChat({ history: history || [] });
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // לוגיקת מיפוי מק"טים לממשק
    const inventoryMap: {[key: string]: any} = {
      'סיקה 107': { name: 'סיקה 107 אפור (25 ק"ג)', sku: '19107' },
      'דבק 800': { name: 'דבק 800 טמבור', sku: '20800' },
      'מכולה': { name: 'מכולת פסולת 8 קוב\' החלפה', sku: '82001' },
      'מצע א': { name: 'מצע א\' - טון', sku: '11730' }
    };

    const detectedProducts = Object.keys(inventoryMap)
      .filter(key => text.includes(key) || message.includes(key))
      .map(key => inventoryMap[key]);

    return NextResponse.json({ reply: text, detectedProducts });

  } catch (error) {
    return NextResponse.json({ reply: "שחר אחי, יש עומס בקו. שלח שוב?" }, { status: 500 });
  }
}
