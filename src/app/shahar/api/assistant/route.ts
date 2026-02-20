import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, customerId } = await req.json();

    // לוגיקה זמנית לזיהוי "שחר שאול" - תוחלף בשאילתת DB אמיתית
    const sites = {
      'מונש': 'כפר מונש (621221)',
      'יהודה': 'אבן יהודה (621212)',
      'ת"א': 'תל אביב (621278)'
    };

    let siteName = "הכללי";
    Object.entries(sites).forEach(([key, val]) => {
      if (message.includes(key)) siteName = val;
    });

    // סימולציית זיהוי מוצר לפי נתוני המפרטים שהעלית
    let detectedProducts = [];
    if (message.includes('107')) detectedProducts.push({ name: 'סיקה 107 אפור', sku: '19107', price: 0 });
    if (message.includes('004')) detectedProducts.push({ name: 'פריימר 004', sku: '14004', price: 0 });

    let reply = `אחלה שחר, רשמתי לפניי עבור פרויקט ${siteName}. `;
    
    if (detectedProducts.length > 0) {
      reply += `זיהיתי שאתה צריך ${detectedProducts.map(p => p.name).join(', ')}. \nהוספתי לך כפתורי הוספה מהירה מתחת להודעה.`;
    } else {
      reply += `אני רואה ששאלת לגבי המלאי. מה בדיוק אתה צריך להזמין היום?`;
    }

    return NextResponse.json({ reply, detectedProducts });
  } catch (error) {
    return NextResponse.json({ error: "API Failure" }, { status: 500 });
  }
}
