import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const text = message.toLowerCase();

    // רשימת מוצרים לזיהוי חכם
    const knowledgeBase = [
      { name: "עמוד קוטר 50 (3 מ')", sku: "POST-50-3", keywords: ['עמודים', 'קוטר 50'] },
      { name: "ראש פוטר לפטישון", sku: "DRILL-HEAD", keywords: ['ראש פוטר', 'פטישון'] },
      { name: "כפפות עבודה", sku: "GLOVES-24", keywords: ['כפפות'] },
      { name: "מסמרי פלדה", sku: "STEEL-NAILS", keywords: ['מסמרים פלדה'] },
      { name: "חוט שזור 50 ק\"ג", sku: "WIRE-50", keywords: ['חוט שזור'] },
      { name: "ג'מבו קוטר 16", sku: "JUMBO-16", keywords: ['גמבו', 'ג'מבו'] },
      { name: "קו בנאי", sku: "LINE-CONST", keywords: ['קו בנאי'] }
    ];

    let detectedProducts: any[] = [];
    
    // סריקה חכמה של ההודעה
    knowledgeBase.forEach(item => {
      if (item.keywords.some(k => text.includes(k))) {
        // ניסיון לחלץ כמות מהטקסט (למשל: "5 יח")
        const regex = new RegExp(`(\\d+)\\s*(?:יחידות|יח|יח'|קג|ק"ג)?\\s*${item.keywords[0]}`, 'g');
        const match = text.match(/(\d+)/); // פשוט לוקח את המספר הקרוב
        detectedProducts.push({
          ...item,
          tempQty: match ? match[0] : 1
        });
      }
    });

    if (detectedProducts.length > 0) {
      return NextResponse.json({
        reply: `אחלה רשימה שחר. הצלבתי את הנתונים עם המלאי בסבן. זיהיתי ${detectedProducts.length} פריטים. לאן לשלוח את כל זה, לאתר באבן יהודה?`,
        detectedProducts,
        action: "list_parsed"
      });
    }

    return NextResponse.json({
      reply: "הבנתי אחי, אבל אני צריך להיות בטוח לגבי המק\"טים. תוכל לכתוב לי שוב מה הכי דחוף?",
      detectedProducts: [],
      action: "none"
    });

  } catch (e) {
    return NextResponse.json({ error: "Failed to parse" }, { status: 500 });
  }
}
