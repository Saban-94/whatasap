import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();
    const text = message.toLowerCase();
    
    // לוגיקה להקמת פרויקט
    if (context.step === 'waiting_for_address') {
      return NextResponse.json({
        reply: `מזל טוב אחי! הקמתי את הפרויקט בכתובת ${message}. הוא מופיע לך עכשיו ברשימת האתרים בצד. מה נשלח לשם קודם?`,
        action: 'CREATE_PROJECT',
        projectName: context.tempProjectName,
        projectAddress: message
      });
    }

    if (text.includes('פרויקט חדש') || text.includes('פתח אתר')) {
      const nameMatch = message.match(/פרויקט\s+(.+)/);
      const name = nameMatch ? nameMatch[1] : "אתר חדש";
      return NextResponse.json({
        reply: `בכיף אחי. מה הכתובת המדויקת של פרויקט ${name}?`,
        action: 'ASK_ADDRESS',
        tempProjectName: name
      });
    }

    // פיענוח רשימת מוצרים עם מק"ט 9999 כברירת מחדל
    // ... (לוגיקת הקטלוג מהשלב הקודם)
    
    return NextResponse.json({ reply: "אני איתך שחר, בוא נתקדם." });
  } catch (e) { return NextResponse.json({ error: "Fail" }); }
}
