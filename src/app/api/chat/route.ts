import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import crypto from 'crypto';

const MODEL_NAME = "gemini-flash-latest";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    if (!message) return NextResponse.json({ error: "No message" }, { status: 400 });

    // --- שלב 1: בדיקה בארכיון (חיסכון במכסה) ---
    // יוצרים מזהה ייחודי לשאלה (ניקוי רווחים ואותיות קטנות/גדולות)
    const normalizedQuestion = message.trim().toLowerCase();
    const questionId = crypto.createHash('md5').update(normalizedQuestion).digest('hex');
    
    const archiveRef = doc(db, 'chat_archive', questionId);
    const archiveSnap = await getDoc(archiveRef);

    if (archiveSnap.exists()) {
      console.log("🚀 תשובה נשלפה מהארכיון של ח. סבן - חסכנו פנייה לגוגל");
      return NextResponse.json({ 
        text: archiveSnap.data().answer, 
        isFromArchive: true 
      });
    }

    // --- שלב 2: פנייה ל-Gemini (רק אם אין בזיכרון) ---
    const apiKey = process.env.GEMINI_API_KEY;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: "אתה יועץ הנדסי של ח. סבן. ענה בעברית מקצועית." }] },
          { role: "model", parts: [{ text: "שלום, אני המומחה של ח. סבן. איך לעזור?" }] },
          { role: "user", parts: [{ text: message }] }
        ]
      })
    });

    const data = await res.json();
    const aiAnswer = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (aiAnswer) {
      // --- שלב 3: שמירה בארכיון לשימוש עתידי ---
      await setDoc(archiveRef, {
        question: message,
        answer: aiAnswer,
        createdAt: new Date().toISOString()
      });
    }

    return NextResponse.json({ text: aiAnswer, isFromArchive: false });

  } catch (error: any) {
    console.error("Chat Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
