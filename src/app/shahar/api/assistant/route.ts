import { NextResponse } from 'next/server';

// כאן אנחנו מגדירים את הזיכרון והלוגיקה
export async function POST(req: Request) {
  try {
    const { message, context, history } = await req.json();
    const text = message.toLowerCase();

    // לוגיקה פשוטה לזיהוי מוצרים מהמלאי (אפשר להרחיב את המערך הזה)
    const inventory = [
      { name: 'דבק 800 טמבור', sku: '20800' },
      { name: 'חול מילוי', sku: '11801' },
      { name: 'טיט שק גדול', sku: '104252' }
    ];

    const foundProduct = inventory.find(p => text.includes(p.sku) || text.includes(p.name));

    let reply = "";
    if (foundProduct) {
      reply = `בטח שחר אחי, יש לנו ${foundProduct.name} במלאי. להוסיף לך להזמנה ל${context.selectedProject?.name || 'אתר'}?`;
    } else if (text.includes('בוקר טוב')) {
      reply = "בוקר אור שחר יא תותח! איך אני יכול לעזור לך היום בח.סבן?";
    } else {
      reply = "הבנתי אותך שחר. אני בודק את זה מול המחסן. תרצה שאוסיף משהו נוסף לרשימה?";
    }

    return NextResponse.json({ 
      reply, 
      detectedProducts: foundProduct ? [foundProduct] : [] 
    });

  } catch (e) {
    return NextResponse.json({ reply: "אחי, יש לי תקלה קטנה בחיבור. נסה שוב?" }, { status: 500 });
  }
}
