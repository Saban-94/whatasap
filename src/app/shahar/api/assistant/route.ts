import { NextResponse } from 'next/server';

const catalog = [
  { name: 'דבק 800 טמבור', sku: '20800', price: 45 },
  { name: 'דבק 500 עוז', sku: '20500', price: 38 },
  { name: 'סיקה 107 אפור', sku: '19107', price: 120 },
  { name: 'פריימר 004', sku: '14004', price: 85 }
];

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();
    const text = message.toLowerCase();
    let reply = "";
    let detectedProducts: any[] = [];
    let action = "none";
    let updatedContext = { ...context };

    // זיהוי רשימת מוצרים (הצלבה מאחורי הקלעים)
    catalog.forEach(item => {
      if (text.includes(item.sku) || text.includes(item.name.split(' ')[1])) {
        detectedProducts.push(item);
      }
    });

    if (text.includes('פרויקט חדש') || text.includes('פתח אתר')) {
      reply = "בשמחה אחי! תן לי שם לאתר וכתובת, אני מעלה אותו למערכת עכשיו.";
      action = "request_project_name";
    } 
    else if (detectedProducts.length > 0) {
      reply = `שחר, קלטתי את הרשימה. הצלבתי מק"טים מהקטלוג שלנו. הנה מה שזיהיתי:`;
      updatedContext.step = 'ordering';
    }
    else if (text.includes('תזמין') || text.includes('סיימתי')) {
      reply = "בחרנו רשימת מוצרים פצצה. לאן תרצה לשלוח אחי את המוצרים? כתוב לי פה רחוב, מספר ועיר, ואיזה תאריך ושעה הכי נוח לך שמחלקת ההזמנות של ח.סבן תעמיס ותצא?";
      action = "ask_delivery_details";
    }
    else {
      reply = "הבנתי אחי. בוא נתמקד - מה חסר לך כרגע בשטח?";
    }

    return NextResponse.json({ reply, detectedProducts, action, updatedContext });
  } catch (e) { return NextResponse.json({ error: "API Fail" }, { status: 500 }); }
}
