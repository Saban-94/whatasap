import { NextResponse } from 'next/server';

const catalog = [
  { name: 'דבק 800 טמבור', sku: '20800', keywords: ['800'] },
  { name: 'דבק 500 עוז', sku: '20500', keywords: ['500'] },
  { name: 'סיקה 107 אפור', sku: '19107', keywords: ['107', 'סיקה'] },
  { name: 'פריימר 004', sku: '14004', keywords: ['004', 'פריימר'] }
];

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    // פירוק הרשימה לפי שורות או פסיקים
    const lines = message.split(/[\n,|-]/).filter((l: string) => l.trim().length > 1);
    
    let detectedProducts: any[] = [];

    lines.forEach((line: string) => {
      const cleanLine = line.trim().toLowerCase();
      
      // ניסיון הצלבה עם הקטלוג
      const match = catalog.find(p => p.keywords.some(k => cleanLine.includes(k)));
      
      if (match) {
        detectedProducts.push({ ...match, tempQty: 1 });
      } else {
        // --- המוצר לא זוהה? מקבל מק"ט 9999 ---
        detectedProducts.push({
          name: line.trim(), // השם המקורי ששחר כתב
          sku: '9999',       // מק"ט גנרי
          tempQty: 1,
          isManual: true     // סימון למערכת שזה מוצר ידני
        });
      }
    });

    const reply = `שחר אחי, עברתי על הרשימה. זיהיתי ${detectedProducts.filter(p => p.sku !== '9999').length} מוצרים מהקטלוג, ועוד ${detectedProducts.filter(p => p.sku === '9999').length} פריטים שהגדרתי כמק"ט ידני (9999). להוסיף הכל להזמנה לאתר?`;

    return NextResponse.json({ reply, detectedProducts });
  } catch (e) {
    return NextResponse.json({ error: "Fail" }, { status: 500 });
  }
}
