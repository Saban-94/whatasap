import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const text = message.toLowerCase();

    let detectedProducts = [];

    // לוגיקת זיהוי מורחבת לפי הקטלוג של שחר
    if (text.includes('800')) {
      detectedProducts.push({ name: 'דבק 800 טמבור - להדבקה פנימית', sku: '20800' });
    }
    if (text.includes('107')) {
      detectedProducts.push({ name: 'סיקה 107 אפור', sku: '19107' });
    }
    if (text.includes('004') || text.includes('פריימר')) {
      detectedProducts.push({ name: 'פריימר SAKRET 004', sku: '14004' });
    }

    let reply = "";

    if (detectedProducts.length > 0) {
      reply = `סגור שחר, מצאתי את ה-${detectedProducts[0].name} שחיפשת. להוסיף להזמנה של פרויקט שחר שאול?`;
    } else {
      reply = `אני בודק את המלאי עבור "${message}". איזה פרויקט זה שחר? אבן יהודה או כפר מונש?`;
    }

    return NextResponse.json({ reply, detectedProducts });
  } catch (error) {
    return NextResponse.json({ error: "API Error" }, { status: 500 });
  }
}
