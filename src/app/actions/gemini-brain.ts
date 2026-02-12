import { GoogleGenerativeAI } from "@google/generative-ai";
import { doc, getDoc } from "firebase/firestore";
import { dbCRM } from "@/lib/firebase";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function getSabanSmartResponse(prompt: string, customerId: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // 1. משיכת נתוני לקוח והיסטוריה מה-CRM
  const crmSnap = await getDoc(doc(dbCRM, 'customer_memory', customerId));
  const crmData = crmSnap.exists() ? crmSnap.data() : {};

  // 2. לוגיקת שיפוץ חדר רחצה (Hardcoded Logic)
  const renoLogic = {
    bathroom: { items: ["דבק קרמיקה", "רובה", "איטום"], multiplier: 1.2 }
  };

  // 3. הנחיה לגימיני כולל הצלבה
  const systemPrompt = `
    אתה המוח של ח. סבן. אתה מדבר עם ${crmData.name || 'לקוח'}.
    פרויקט פעיל ב-CRM: ${crmData.project || 'כללי'}.
    היסטוריית הזמנות ב-CRM: ${JSON.stringify(crmData.orderHistory || [])}.
    
    אם הלקוח (כמו שחר) מתעניין בשיפוץ חדר רחצה, השתמש בלוגיקה: 
    על כל מ"ר צריך ${renoLogic.bathroom.multiplier} שקי דבק.
    
    ענה בצורה מקצועית, שירותית וזכור את כל מה שבוצע במאגר הניהולי.
  `;

  const result = await model.generateContent([systemPrompt, prompt]);
  return result.response.text();
}
