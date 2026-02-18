'use server'; // חובה! זה הופך את הפונקציה לשרתית ומאפשר גישה למפתחות

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import sabanMasterBrain from "@/data/saban_master_brain.json";

// שליפת המפתח בצורה מאובטחת מהשרת
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function getSabanSmartResponse(prompt: string, customerId: string) {
  try {
    // בדיקה אם המפתח קיים בכלל
    if (!apiKey) {
      throw new Error("Missing Gemini API Key");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 1. משיכת נתונים מה-CRM
    let crmData: any = {};
    try {
      const crmSnap = await getDoc(doc(db, 'customer_memory', customerId));
      crmData = crmSnap.exists() ? crmSnap.data() : {};
    } catch (e) {
      console.log("CRM Fetch failed, continuing with empty context");
    }
    
    const customerName = crmData.name || 'אחי';

    // 2. זיהוי צרכי שיפוץ
    const isRenovation = prompt.includes("שיפוץ") || prompt.includes("מקלחת") || prompt.includes("אמבטיה") || prompt.includes("בנייה");
    let technicalContext = "";
    
    if (isRenovation) {
      const adhesive = (sabanMasterBrain as any[]).find(p => p.name.includes("דבק") || p.name.includes("603"));
      const ratio = adhesive?.calculator?.ratio || 1.5;
      technicalContext = `
        הלקוח בשיפוץ. מוצר רלוונטי: ${adhesive?.name || "דבק 603"}. 
        יחס צריכה: ${ratio} שקים למ"ר.
      `;
    }

    // 3. הזרקת האישיות של סבן
    const systemPrompt = `
      אתה "גימני", היועץ הבכיר והנשמה של חברת "ח. סבן". 
      אתה מדבר עם ${customerName}.
      
      חוקי הדיבור שלך:
      - תמיד תפתח בברכה אישית וחמה: "אהלן ${customerName}, בוקר אור אחי!" או "שלום ${customerName} חביבי".
      - אתה מומחה בנייה ותיק. תדבר בגובה העיניים, תשתמש בסלנג מקצועי (אחי, נשמה, סגור פינה).
      - תהיה יועץ אקטיבי. אם חסר משהו בהזמנה לפי ההיגיון (כמו סרט משוריין לגבס), תשאל עליו.
      - אל תהיה רובוטי. אם הלקוח אומר "בוקר טוב", אל תענה "אני בודק זמינות", אלא תענה כמו חבר ששמח לעזור.

      מידע טכני: ${JSON.stringify(sabanMasterBrain.slice(0, 10))}
      היסטוריה: ${JSON.stringify(crmData.orderHistory || [])}
      הקשר: ${technicalContext}
    `;

    const result = await model.generateContent([systemPrompt, prompt]);
    const responseText = result.response.text();

    return responseText;

  } catch (error) {
    console.error("Gemini Brain Error:", error);
    // החזרת תשובה "אנושית" גם במקרה של תקלה טכנית
    return `אהלן ${customerId}, כאן גימני. אחי, יש לי רגע תקלה טכנית קטנה בחיבור למוח המרכזי. אל תדאג, תכתוב לי שוב עוד דקה או תרים טלפון למשרד ונסדר אותך מיד.`;
  }
}
