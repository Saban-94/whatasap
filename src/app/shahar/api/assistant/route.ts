import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, history, currentContext } = await req.json();
    const text = message.toLowerCase();

    let reply = "";
    let detectedProducts: any[] = [];
    let action = "none";
    let newContext = currentContext || { step: 'idle', project: '' };

    // לוגיקה דינמית לפי מצב השיחה (State Management)
    if (text.includes('הזמנה') || text.includes('סיימתי') || text.includes('תזמין')) {
      reply = "סגור אחי. הנה סיכום ההזמנה לפרויקט " + (newContext.project || "אבן יהודה") + ". תאשר לי שזה תקין וזה עף לקבוצה.";
      action = "show_summary";
    } 
    else if (text.includes('אבן יהודה') || text.includes('מונש')) {
      newContext.project = text.includes('יהודה') ? 'אבן יהודה' : 'כפר מונש';
      reply = `סגור, מעדכן שההזמנה הזו הולכת ל${newContext.project}. מה להוסיף לסל?`;
    }
    else if (text.includes('500') || text.includes('דבק')) {
      detectedProducts = [{ name: 'דבק 500 עוז - להדבקה פנימית', sku: '20500', price: 0 }];
      reply = "דבק 500 זה אחלה מוצר. להוסיף לך אותו להזמנה?";
    }
    else if (text.includes('חדש') || text.includes('פרויקט')) {
      reply = "בשמחה אחי. איפה האתר החדש? תן לי כתובת ואני פותח אותו במערכת.";
      action = "open_project";
    }
    else {
      reply = "הבנתי שחר. תגיד לי אם להוסיף מוצרים או שאנחנו סוגרים את ההזמנה לאתר?";
    }

    return NextResponse.json({ reply, detectedProducts, action, newContext });
  } catch (error) {
    return NextResponse.json({ error: "AI Error" }, { status: 500 });
  }
}
