import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// המודל היציב ביותר שנמצא בבדיקה שלך
const MODEL_NAME = "gemini-flash-latest";

async function getCatalog() {
  // ניסיון לקרוא משני נתיבים אפשריים ב-Vercel
  const paths = [
    path.join(process.cwd(), 'data', 'data.json'),
    path.join(process.cwd(), 'src', 'data', 'data.json')
  ];
  
  for (const p of paths) {
    try {
      const data = await fs.readFile(p, 'utf8');
      return data;
    } catch (e) {
      continue;
    }
  }
  return "[]"; // מחזיר מערך ריק אם לא נמצא קובץ, כדי למנוע קריסה (500)
}

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Missing GEMINI_API_KEY in Vercel settings' }, { status: 500 });
  }

  try {
    const { message, history } = await req.json();
    const catalog = await getCatalog();

    const payload = {
      contents: [
        { 
          role: "user", 
          parts: [{ text: `אתה יועץ הנדסי מומחה של חברת ח. סבן. בסיס הידע שלך הוא הקטלוג הבא: ${catalog}. ענה תמיד בעברית מקצועית.` }] 
        },
        { role: "model", parts: [{ text: "שלום, אני מוכן לייעץ בשם ח. סבן." }] },
        ...(history || []).map((h: any) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }]
        })),
        { role: "user", parts: [{ text: message }] }
      ]
    };

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || 'Gemini API Error');
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה מהמודל.";
    
    return NextResponse.json({ text });

  } catch (err: any) {
    console.error("Chat API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
