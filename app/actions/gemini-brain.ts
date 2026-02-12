import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/src/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import sabanMasterBrain from "@/src/data/saban_master_brain.json";

// אתחול ה-AI של גוגל
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

/**
 * פונקציה לשליפת הזיכרון המצטבר של הלקוח מה-Firebase
 */
async function fetchCustomerContext(clientId: string) {
  try {
    const docRef = doc(db, "customer_memory", clientId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      return `
        מידע מצטבר על הלקוח מהזיכרון שלך:
        - שם: ${data.name}
        - ידע מצטבר: ${data.accumulatedKnowledge}
        - פרויקטים פעילים: ${JSON.stringify(data.projects)}
        - העדפות אספקה: ${data.preferences?.deliveryMethod || "לא הוגדר"}
        - שעות מועדפות: ${data.preferences?.preferredHours || "לא הוגדר"}
      `;
    }
    return "זהו לקוח חדש, אין עדיין מידע מצטבר בזיכרון. למד עליו במהלך השיחה.";
  } catch (error) {
    console.error("Error fetching customer context:", error);
    return "שגיאה בשליפת זיכרון הלקוח.";
  }
}

/**
 * הפונקציה המרכזית להפקת תגובה מגימיני (המוח של סבן)
 */
export async function getSabanResponse(userInput: string, clientId: string = "שחר_שאול") {
  try {
    // 1. שליפת ההקשר של הלקוח הספציפי
    const customerMemory = await fetchCustomerContext(clientId);

    // 2. בניית ה-System Prompt (הנחיות היסוד של המוח)
    const systemInstruction = `
      אתה "המוח של ח. סבן" - נציג שירות ומכירות אישי וחכם בוואטסאפ.
      תפקידך לנהל תהליך קנייה מלא מול הלקוח ללא צורך במגע אדם.

      הנחיות עבודה:
      1. זהות הלקוח: הלקוח מולך הוא ${clientId}. פנה אליו בשמו הפרטי בצורה חמה (למשל: "בוקר טוב שחר").
      2. ידע ארגוני: השתמש במידע של ח. סבן (מחירונים, לוגיקה לוגיסטית): ${JSON.stringify(sabanMasterBrain)}.
      3. זיכרון מצטבר: התבסס על המידע הבא מהיסטוריית הלקוח: ${customerMemory}.
      4. ניהול הזמנה: אם הלקוח רוצה להזמין, ודא לאיזה פרויקט זה מיועד. אם יש מגבלת גישה בזיכרון (למשל רחוב צר), הזכר לו את זה.
      5. סגנון כתיבה: קצר, ענייני, שירותי, בסגנון וואטסאפ (עם אימוג'ים מתאימים).
      6. מעקב: אם הלקוח שואל על סטטוס, בדוק בזיכרון הפרויקטים שלו.

      תהליך השיחה:
      - ברך את הלקוח (בוקר טוב/צהריים טובים).
      - שאל מה תרצה להזמין היום ולאיזה פרויקט.
      - אשר את פרטי ההזמנה וסוג ההובלה (מנוף/מכולה/ידני).
      - סגור בברכה: "ההזמנה נקלטה, נתראה בהזמנה הבאה!"
    `;

    // 3. הגדרת המודל
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
    });

    // 4. יצירת צ'אט והודעה
    const chat = model.startChat({
      history: [], // כאן ניתן להוסיף היסטוריית הודעות אחרונות מה-DB בעתיד
    });

    const result = await chat.sendMessage(userInput);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Gemini Response Error:", error);
    return "מצטער שחר, המוח של סבן זקוק לרגע למנוחה. תוכל לנסות שוב?";
  }
}
