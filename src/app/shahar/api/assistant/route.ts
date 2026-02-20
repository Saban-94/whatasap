import { NextResponse } from 'next/server';

// מלאי "חם" לזיהוי מהיר (אפשר לשלוף מה-DB בהמשך)
const HOT_INVENTORY = [
  { name: 'סיקה 107 אפור (25 ק"ג)', sku: '19107', price: 125 },
  { name: 'לוח גבס רגיל 12.5', sku: '30012', price: 42 },
  { name: 'דבק 800 טמבור', sku: '20800', price: 48 },
  { name: 'מכולת פסולת 8 קוב', sku: '82003', price: 850 }
];

export async function POST(req: Request) {
  try {
    const { message, context, history } = await req.json();
    const text = message.toLowerCase();
    
    let reply = "";
    let detectedProducts: any[] = [];

    // 1. זיהוי מוצרים חכם
    const matches = HOT_INVENTORY.filter(item => 
      text.includes(item.name.split(' ')[0]) || text.includes(item.sku) || 
      (text.includes('גבס') && item.name.includes('גבס')) ||
      (text.includes('סיקה') && item.name.includes('סיקה'))
    );

    // 2. לוגיקה של ניהול שיחה אנושי (היועץ)
    if (text.includes('הובלת מנוף') || text.includes('יום ראשון')) {
      reply = `סגור שחר אחי, אני רושם לעצמי - הובלת מנוף ליום ראשון ב-07:00 ל${context.selectedProject?.name || 'אתר'}. אני אבדוק עם הסדרן שיוסי (הנהג) פנוי וחוזר אליך עם אישור סופי. רוצה שבינתיים אעמיס את ה-10 שקים של הסיקה על המשאית הזו?`;
    } 
    else if (matches.length > 1) {
      detectedProducts = matches;
      reply = `יש לי כמה סוגים של ${matches[0].name.split(' ')[0]}, הנה מה שיש במחסן כרגע. איזה מהם לשלוח ל${context.selectedProject?.name}?`;
    }
    else if (matches.length === 1) {
      detectedProducts = matches;
      const p = matches[0];
      if (text.includes('יש לכם')) {
        reply = `בטח שיש ${p.name}, המחסן מלא בזה. כמה יחידות להוסיף לך להזמנה של יום ראשון?`;
      } else {
        reply = `מעולה, הוספתי ${p.name} (מק"ט ${p.sku}) לרשימה. מה לגבי כלי עבודה או אביזרים משלימים? חסר משהו?`;
      }
    }
    else if (text.includes('לא תודה') || text.includes('זהו בינתיים')) {
      reply = `סבבה לגמרי שחר. סיכמנו על הסיקה וההובלה בראשון. אני שולח לך סיכום בוואטסאפ עוד רגע. אש עליך!`;
    }
    else {
      // תשובה גנרית אבל בסטייל של ח.סבן
      reply = `הבנתי אותך שחר יא תותח. אני בודק זמינות במחסן וחוזר אליך. יש עוד משהו שתרצה לסגור על הדרך?`;
    }

    return NextResponse.json({ reply, detectedProducts });

  } catch (e) {
    return NextResponse.json({ reply: "שחר אחי, יש איזה עומס במערכת, תנסה לשלוח שוב רגע." });
  }
}
