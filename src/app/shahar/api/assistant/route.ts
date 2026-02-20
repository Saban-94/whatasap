import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { message } = await req.json();

  // סימולציה של מנוע הפיענוח (מבוסס על הנתונים מה-CSV שהעלית)
  // בגרסת הפרודקשן זה ימשוך מ-Supabase
  const candidates = [
    { sku: '20834', name: 'דבק 834 טמבור 25 ק"ג' },
    { sku: '20851', name: 'דבק 851 טמבור 25 ק"ג' }
  ];

  // אם שחר כותב "דבק" בלי מספר - נחזיר מצב Ambiguous
  if (message === 'דבק' || message === 'תביא דבק') {
    return NextResponse.json({
      reply: "שחר אחי, יש לי כמה סוגי דבק במלאי. למה אתה מתכוון?",
      status: "ambiguous",
      input: message,
      candidates: candidates
    });
  }

  // פיענוח רגיל של מק"טים מוכרים מהקובץ
  let reply = "קיבלתי, בודק לך מלאי...";
  let detectedProducts = [];

  if (message.includes('107')) {
    detectedProducts.push({ name: 'סיקה 107 אפור', sku: '19107' });
    reply = "רשמתי, סיקה 107 לפרויקט שחר שאול. להוסיף להזמנה?";
  }

  return NextResponse.json({ reply, detectedProducts, status: "matched" });
}
