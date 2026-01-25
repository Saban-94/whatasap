import { NextResponse } from 'next/server';
import { db } from "@/lib/firebase"; // שימוש בחיבור הקיים שלך
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // בדיקה שמדובר בהודעת טקסט נכנסת
        if (body.typeWebhook === 'incomingMessageReceived' && body.messageData.typeMessage === 'textMessage') {
            const messageText = body.messageData.textMessageData.textMessage;
            const senderName = body.senderData.senderName;
            const chatId = body.senderData.chatId; // מזהה הקבוצה או איש הקשר

            // שמירה ב-Firebase לאוסף שמוצג בדף whatsapp-orders שיצרנו
            await addDoc(collection(db, "whatsapp_orders"), {
                text: messageText,
                sender: senderName,
                chatId: chatId,
                timestamp: serverTimestamp(),
                status: 'חדש'
            });

            return NextResponse.json({ success: true });
        }
        
        return NextResponse.json({ status: 'ignored' });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
