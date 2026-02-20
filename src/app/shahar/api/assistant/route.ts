import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, currentContext } = await req.json();
    const text = message.toLowerCase();

    let reply = "";
    let detectedProducts: any[] = [];
    let action = "none";
    let newContext = currentContext || { project: 'אבן יהודה' };

    // --- מנוע זיהוי מוצרים מדויק ---
    const catalog = [
      { name: 'דבק 800 טמבור - פנים', sku: '20800', keywords: ['800'] },
      { name: 'דבק 500 עוז - פנים', sku: '20500', keywords: ['500'] },
      { name: 'סיקה 107 אפור', sku: '19107', keywords: ['107', 'סיקה'] },
      { name: 'פריימר 004', sku: '14004', keywords: ['004', 'פריימר'] }
    ];

    // חיפוש מוצר לפי מילת מפתח
    const matchedProduct = catalog.find(p => p.keywords.some(k => text.includes(k)));

    if (matchedProduct) {
      detectedProducts = [matchedProduct];
      reply = `סגור אחי, מצאתי ${matchedProduct.name}. להוסיף להזמנה לאתר ב${newContext.project}?`;
    } 
    // טיפול בסיכום הזמנה
    else if (text.includes('תזמין') || text.includes('סיימתי') || text.includes('אישור')) {
      reply = `מעולה שחר. מכין לך סיכום הזמנה זריז ל${newContext.project}.`;
      action = "show_summary";
    }
    // שיחה כללית
    else {
      reply = `הבנתי שחר. בודק לך במלאי לגבי "${message}". תרצה להוסיף עוד משהו או שנסגור את ההזמנה?`;
    }

    return NextResponse.json({ reply, detectedProducts, action, newContext });
  } catch (error) {
    return NextResponse.json({ error: "AI Error" }, { status: 500 });
  }
}
