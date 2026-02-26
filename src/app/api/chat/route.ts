// src/app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { fetchCustomerBrain } from '@/lib/customerMemory';
import { supabase } from '@/lib/supabase';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message, history, clientId = "שחר שאול" } = await req.json();

    // 1. שליפת נתונים מקבילית (זיכרון לקוח + מלאי)
    const [customerContext, { data: products }] = await Promise.all([
      fetchCustomerBrain(clientId),
      supabase.from('products').select('name, sku, stock_quantity, price')
    ]);

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `
        אתה "Ai-ח.סבן", המוח הלוגיסטי של סבן הנדסה.
        
        הקשר לקוח נוכחי:
        ${customerContext}
        
        מלאי זמין כרגע:
        ${JSON.stringify(products)}

        חוקי ברזל:
        1. מנוף עד 10 מטר בלבד. 15 מטר דורש אישור מראמי מסארוה.
        2. אם הלקוח מבקש משהו שנוגד את הזיכרון (למשל רחוב צר), ציין זאת.
        3. הדגש מילים ב**טקסט עבה**.
        4. סמכותיות ומקצוענות מעל הכל.
      `
    });

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    const text = result.response.text();

    const needsRami = message.includes('15') || text.includes('ראמי') || message.includes('חריג');

    return NextResponse.json({ 
      reply: text, 
      status: needsRami ? 'WAITING_FOR_RAMI' : 'OK' 
    });
  } catch (error: any) {
    console.error("Critical Brain Error:", error);
    return NextResponse.json({ reply: "**אחי, המערכת בעומס. ראמי בודק את זה.**" });
  }
}
