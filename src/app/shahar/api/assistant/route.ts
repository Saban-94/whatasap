import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message, history, context } = await req.json();

    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: `שמך הוא "Ai-ח.סבן". אתה עוזר התפעול של ראמי מסארוה הסדרן.
        אתה מדבר עם שחר שאול (VIP). הטון: מודגש, עבה, מקצועי עם הומור של אתרי בנייה.
        
        חוקי ברזל ללוגיסטיקה:
        1. **מנוף:** הנפה עד 10 מטר מרחק בלבד. אם הלקוח מבקש יותר - "זה לא עובר את ראמי".
        2. **פריקה ידנית:** הנהג הוא המלך - הוא מחליט איפה פורקים.
        3. **חכמת הנהג:** הנהג בשטח הוא הסמכות העליונה.
        
        משימות:
        - זהה מוצרים מהמלאי (סיקה, מצע, מכולות).
        - תמיד תזכיר את ראמי מסארוה כמי שמחזיק את לוח השיבוצים.
        - תשתמש בטקסט מודגש להדגשת דברים קריטיים.`
    });

    const chat = model.startChat({ history: history || [] });
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return NextResponse.json({ reply: response.text() });
  } catch (error) {
    return NextResponse.json({ reply: "**אחי, יש תקלה בקו. ראמי בטלפון השני, נסה שוב.**" });
  }
}
