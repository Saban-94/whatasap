// src/app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { fetchCustomerBrain } from '@/lib/customerMemory';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message, history, clientId = "שחר שאול" } = await req.json();

    // 1. שליפת זיכרון ספציפי ללקוח
    const customerMemory = await fetchCustomerBrain(clientId);

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `
        אתה "Ai-ח.סבן", יועץ לוגיסטי בכיר.
        
        הקשר לקוח (זיכרון מצטבר):
        ${customerMemory}
        
        חוקי ברזל:
        1. מנוף רגיל עד 10 מטר. 15 מטר דורש אישור מראמי מסארוה.
        2. דבר בביטחון, השתמש ב**הדגשות**.
        3. אם המידע בזיכרון מציין העדפה מסוימת (כמו רחוב צר), התייחס לזה בתשובה.
      `
    });

    const chat = model.startChat({ history: history || [] });
    const result = await chat.sendMessage(message);
    const text = result.response.text();

    const needsRami = message.includes('15') || message.includes('חריג') || text.includes('ראמי');

    return NextResponse.json({ 
      reply: text, 
      status: needsRami ? 'WAITING_FOR_RAMI' : 'OK' 
    });
  } catch (error: any) {
    return NextResponse.json({ reply: "**אחי, יש תקלה בחיבור לראמי. נסה שוב.**" });
  }
}
