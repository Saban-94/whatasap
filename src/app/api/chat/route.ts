// src/app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { fetchCustomerBrain } from '@/lib/customerMemory';
import { supabase } from '@/lib/supabase';
import { SABAN_AI_STUDIO_CONFIG } from '@/lib/saban-ai-training';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message, history, clientId = "אורח" } = await req.json();

    // 1. שליפת קונטקסט לקוח ומלאי
    const [customerContext, { data: products }] = await Promise.all([
      fetchCustomerBrain(clientId),
      supabase.from('products').select('name, sku, stock_quantity, price')
    ]);

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `
        ${SABAN_AI_STUDIO_CONFIG.training_instructions.identity}
        
        הקשר לקוח: ${customerContext}
        מלאי זמין: ${JSON.stringify(products)}

        חוקי ברזל:
        1. מנוף מעל ${SABAN_AI_STUDIO_CONFIG.logistics_rules.requires_rami_approval} מטר דורש אישור מראמי מסארוה.
        2. ${SABAN_AI_STUDIO_CONFIG.training_instructions.upsell}
        3. הדגש מילים ב**טקסט עבה**.
      `
    });

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    const text = result.response.text();

    // 2. זיהוי צורך באישור ראמי ושמירה למסד הנתונים
    const needsRami = message.includes('15') || text.includes('ראמי') || message.includes('חריג');

    if (message.includes('תזמין') || message.includes('אשר')) {
      await supabase.from('orders').insert([{
        client_name: clientId,
        status: needsRami ? 'WAITING_FOR_RAMI' : 'PENDING',
        ai_metadata: { 
          raw_message: message,
          insight: text,
          studio_version: SABAN_AI_STUDIO_CONFIG.version
        }
      }]);
    }

    return NextResponse.json({ 
      reply: text, 
      status: needsRami ? 'WAITING_FOR_RAMI' : 'OK' 
    });
  } catch (error: any) {
    console.error("Studio API Error:", error);
    return NextResponse.json({ reply: "**אחי, המנוף נתקע. ראמי מטפל בזה.**" });
  }
}
