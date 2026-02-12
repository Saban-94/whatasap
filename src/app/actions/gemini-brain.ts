import { GoogleGenerativeAI } from "@google/generative-ai";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function getSabanSmartResponse(prompt: string, customerId: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // הצלבה 1: משיכת היסטוריה מה-CRM הניהולי
  const crmSnap = await getDoc(doc(db, 'customer_memory', customerId));
  const crmData = crmSnap.exists() ? crmSnap.data() : {};

  // הצלבה 2: בדיקת עניין בשיפוץ (לוגיקה חכמה)
  const isRenovation = prompt.includes("שיפוץ") || prompt.includes("אמבטיה") || prompt.includes("רחצה");
  
  let renovationAdvice = "";
  if (isRenovation) {
    renovationAdvice = `
      הלקוח מתעניין בשיפוץ חדר רחצה. 
      לוגיקה: לכל 1 מ"ר נדרשים 1.2 שקי דבק קרמיקה של סבן. 
      בדוק אם יש לו פרויקט פעיל והצע לו חומרים מתאימים מהמלאי.
    `;
  }

  const systemPrompt = `
    אתה המוח של ח. סבן. הלקוח: ${crmData.name || 'שחר לוי'}.
    מידע מה-CRM: ${JSON.stringify(crmData.orderHistory || [])}.
    ${renovationAdvice}
    תפקידך לתת הצעה מדויקת המשלבת את היסטוריית הקניות שלו עם צרכי השיפוץ החדשים.
  `;

  const result = await model.generateContent([systemPrompt, prompt]);
  return result.response.text();
}
