import { NextResponse } from 'next/server';

const CATALOG = [
  { name: 'דבק 800 טמבור', sku: '20800', price: 45, category: 'דבקים', stock: 'במלאי' },
  { name: 'דבק 500 עוז', sku: '20500', price: 38, category: 'דבקים', stock: 'במלאי' },
  { name: 'סיקה 107 אפור', sku: '19107', price: 120, category: 'איטום', stock: 'במלאי' },
  { name: 'פריימר 004', sku: '14004', price: 85, category: 'צבע', stock: 'חסר זמנית' }
];

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();
    const text = message.toLowerCase();

    // לוגיקה של "יועץ חכם"
    let reply = "";
    let detectedProducts: any[] = [];

    // 1. חיפוש חכם בקטלוג
    const foundItems = CATALOG.filter(item => 
      text.includes(item.sku) || 
      text.includes(item.name.split(' ')[1]) ||
      (text.includes('דבק') && item.category === 'דבקים')
    );

    // 2. ניהול דיאלוג לפי סיטואציה
    if (foundItems.length > 0) {
      detectedProducts = foundItems;
      if (text.includes('יש לכם') || text.includes('מלאי')) {
        reply = `בטח שיש אחי, דבק ${foundItems[0].sku} מחכה לך על המדף. זה דבק חזק מאוד לעבודה שאתה עושה. כמה שקים להעמיס לך להזמנה של ${context.selectedProject?.name || 'האתר'}?`;
      } else {
        reply = `זיהיתי שאתה מחפש ${foundItems[0].name}. הוספתי לך אופציה להזמנה מהירה. צריך עוד משהו חוץ מזה? אולי פריימר?`;
      }
    } 
    
    // 3. טיפול בשאלות כלליות/שיחה
    else if (text.includes('בוקר טוב') || text.includes('אהלן')) {
      reply = `בוקר אור שחר יא תותח! איך השטח היום? אני פה לכל מה שחסר לך בח.סבן. מה על הפרק?`;
    }
    
    else if (text.includes('תודה') || text.includes('סבבה')) {
      reply = `בכיף אחי, בשביל זה אני פה. ברגע שתסיים את הרשימה רק תגיד לי "תשלח" ואני מוציא את המשאית.`;
    }

    // 4. ברירת מחדל חכמה (למידה והצלבה)
    else {
      reply = `הבנתי אותך אחי. אם זה משהו מיוחד שאין לי בקטלוג הרגיל, אני יכול להוציא לך את זה תחת מק"ט 9999. פשוט תכתוב לי את השם והכמות.`;
    }

    return NextResponse.json({ 
      reply, 
      detectedProducts,
      newContext: { ...context, lastSearch: foundItems[0]?.sku }
    });

  } catch (e) {
    return NextResponse.json({ reply: "אחי, המערכת קצת עמוסה, דבר איתי עוד שנייה." });
  }
}
