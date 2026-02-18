import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";

// ייבוא נתוני המאגר המאוחד (מוצרים, מק"טים ויחס צריכה)
import sabanMasterBrain from "@/data/saban_master_brain.json";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function getSabanSmartResponse(prompt: string, customerId: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 1. משיכת נתונים מה-CRM (הבנה עם מי אנחנו מדברים ומה ההיסטוריה שלו)
    const crmSnap = await getDoc(doc(db, 'customer_memory', customerId));
    const crmData = crmSnap.exists() ? crmSnap.data() : {};
    const customerName = crmData.name || 'אחי';

    // 2. זיהוי צרכי שיפוץ וחילוץ לוגיקה טכנית מהמאגר
    const isRenovation = prompt.includes("שיפוץ") || prompt.includes("מקלחת") || prompt.includes("אמבטיה") || prompt.includes("בנייה");
    let technicalContext = "";
    
    if (isRenovation) {
      const adhesive = (sabanMasterBrain as any[]).find(p => p.name.includes("דבק") || p.name.includes("603"));
      const ratio = adhesive?.calculator?.ratio || 1.5; // יחס צריכה הנדסי ממוצע
      
      technicalContext = `
        הלקוח נמצא בתהליך עבודה. 
        לפי המפרט של ${adhesive?.name || "דבק פלסטומר 603"}:
        יחס הצריכה המדויק שלנו הוא ${ratio} ${adhesive?.calculator?.unit || "שקים"} לכל מ"ר.
        בדוק אם הוא קנה חומרי איטום לאחרונה - אם כן, הוא כנראה בשלב הריצוף והדבקה.
      `;
    }

    // 3. הגדרת האישיות של גימני (יועץ מקצועי + חבר)
    const systemPrompt = `
      אתה "גימני", היועץ הבכיר והלב של חברת "ח. סבן". אתה לא בוט, אתה אישיות.
      הלקוח שפונה אליך הוא: ${customerName}.
      
      חוקי הדיבור שלך:
      - בוקר טוב וברכה אישית: תמיד תפתח בברכה חמה (למשל: "אהלן ${customerName}, בוקר אור אחי!").
      - חברי ומקצועי בו זמנית: תשתמש בסלנג של ענף הבנייה ("חביבי", "נשמה", "סגור לך פינה"), אבל תהיה חד כתער בנתונים הטכניים.
      - יועץ אקטיבי: אם לקוח מבקש גבס למקלחת, תזכיר לו שחובה גבס ירוק (עמיד לחות) ואל תשכח לשאול אם יש לו מספיק דבק וסרט משוריין.
      - זיכרון: אם מופיע בהיסטוריה שלו שהוא קנה משהו לאחרונה, תתייחס לזה (למשל: "ראיתי ששבוע שעבר לקחת בלה חול, צריך עוד אחת או שסיימת עם התשתית?").

      מאגר המידע הטכני (המלאי של סבן): 
      ${JSON.stringify(sabanMasterBrain.slice(0, 15))}
      
      היסטוריית רכישות (מה-CRM): 
      ${JSON.stringify(crmData.orderHistory || [])}
      
      הקשר טכני נוכחי:
      ${technicalContext}
      
      משימה: ענה ללקוח בצורה שתגרום לו להרגיש שהוא מדבר עם המקצוען הכי טוב במשרד של סבן. תן לו ביטחון, תן לו כמויות מדויקות, ותהיה חבר.
    `;

    const result = await model.generateContent([systemPrompt, prompt]);
    return result.response.text();

  } catch (error) {
    console.error("Gemini Brain Error:", error);
    return "אחי, מצטער, המוח הטכני שלי רגע בהפסקה. אני זמין לשאלות בטלפון או בווטסאפ המשרדי ונסדר לך הכל.";
  }
}
