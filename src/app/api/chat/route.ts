import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase'; // שימוש ב-Firestore שייצאנו
import { doc, getDoc, setDoc } from 'firebase/firestore';
import crypto from 'crypto'; // ליצירת מפתח ייחודי לכל שאלה

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    
    // 1. יצירת "טביעת אצבע" לשאלה (כדי למצוא אותה בארכיון)
    const questionId = crypto.createHash('md5').update(message.trim().toLowerCase()).digest('hex');

    // 2. בדיקה בארכיון (Firestore)
    const archiveRef = doc(db, 'chat_archive', questionId);
    const archiveSnap = await getDoc(archiveRef);

    if (archiveSnap.exists()) {
      console.log("שליפה מהארכיון - חסכנו פנייה ל-AI!");
      return NextResponse.json({ text: archiveSnap.data().answer, source: 'archive' });
    }

    // 3. אם לא בארכיון - פנייה ל-Gemini (הקוד הקיים שלך)
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: message }] }]
        // כאן נכנסת שאר הלוגיקה של ה-Payload שלך
      })
    });

    const data = await res.json();
    const aiAnswer = data.candidates[0].content.parts[0].text;

    // 4. שמירה בארכיון לשימוש חוזר
    await setDoc(archiveRef, {
      question: message,
      answer: aiAnswer,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ text: aiAnswer, source: 'gemini' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
