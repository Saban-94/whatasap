import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import productsData from "@/data/data.json"; // טעינת הקטלוג שלך

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { message, history } = await req.json();

  // הגדרת המערכת - פקודות קבועות ל-AI
  const systemInstruction = `
    אתה עוזר הנדסי מומחה של חברת 'ח. סבן - חומרי בניין'.
    תפקידך לסייע לקבלנים בבחירת חומרים ובחישובי כמויות.
    השתמש אך ורק במידע מהקטלוג הבא: ${JSON.stringify(productsData)}.
    אם שואלים אותך על מוצר שלא קיים בקטלוג, הסבר בנימוס שאתה ממליץ רק על פתרונות מאושרים של ח. סבן.
    ענה תמיד בעברית מקצועית, קצרה ולעניין.
  `;

  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash", // מודל מהיר וחינמי
    systemInstruction 
  });

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(message);
  const response = await result.response;

  return NextResponse.json({ text: response.text() });
}
