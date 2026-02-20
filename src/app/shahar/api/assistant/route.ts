import { NextResponse } from 'next/server';

// כאן נגדיר את האישיות של גימני
const SYSTEM_PROMPT = `
אתה גימני, עוזר לוגיסטי חכם של סבן לוגיסטיקה. 
אתה מדבר עם שחר שאול, לקוח VIP. 
הסגנון שלך: מקצועי, חברי (אחי, שחר אהלן), יעיל מאוד.

היכולות שלך:
1. זיהוי פרויקטים: אבן יהודה, כפר מונש, ת"א.
2. ייעוץ מוצרים: אם שחר שואל על מוצר (כמו דבק 500), תסביר לו על השימוש (למשל: דבק צמנטי חזק) ותציע להוסיף.
3. ניהול סל: כששחר אומר "רוצה להזמין" או "תוסיף", תזהה את המוצר והכמות.
4. פתיחת פרויקט: אם שחר מזכיר מקום חדש, תשאל אותו אם לפתוח פרויקט חדש במערכת.

מבנה התשובה שלך חייב להיות ב-JSON כדי שהאפליקציה תבין:
{
  "reply": "הטקסט ששחר יראה",
  "detectedProducts": [{ "name": "שם מוצר", "sku": "מק"ט", "price": 0 }],
  "action": "none" | "open_project" | "show_summary",
  "currentProject": "שם הפרויקט שזוהה"
}
`;

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // כאן אנחנו מחברים את ה-SDK של Google Gemini
    // לצורך הדוגמה, אני בונה לוגיקה שמדמה את הבינה המלאכותית:
    let reply = "";
    let action = "none";
    let detectedProducts: any[] = [];

    if (message.includes("אבן יהודה")) {
        reply = "אחלה, אני מעדכן את ההזמנה הנוכחית לפרויקט אבן יהודה. מה חסר לך שם?";
    } else if (message.includes("500")) {
        reply = "דבק 500 זה בחירה מצוינת לריצוף חוץ. להוסיף לך משטח או לפי שקים?";
        detectedProducts = [{ name: "דבק 500 עוז", sku: "20500" }];
    } else if (message.includes("רוצה לבצע הזמנה") || message.includes("סיימתי")) {
        reply = "מעולה שחר. הנה סיכום ההזמנה שלך לפרויקט אבן יהודה. תעבור עליה רגע ואם הכל תקין, אני שולח לקבוצה.";
        action = "show_summary";
    } else {
        reply = "הבנתי שחר. בוא נתקדם - זה הולך לאבן יהודה או שפתחנו פרויקט חדש?";
    }

    return NextResponse.json({ reply, detectedProducts, action });
  } catch (error) {
    return NextResponse.json({ error: "Gemini Overload" }, { status: 500 });
  }
}
