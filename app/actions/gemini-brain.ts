import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchCustomerBrain } from "@/lib/customerMemory"; // המנוע החדש שבנינו
import sabanMasterBrain from "@/src/data/saban_master_brain.json";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function getSabanResponse(userInput: string, clientId: string) {
  try {
    // 1. שליפת הזיכרון המצטבר של הלקוח מה-Firebase
    const customerContext = await fetchCustomerBrain(clientId);

    // 2. הגדרת ה"אישיות" והלוגיקה העסקית של ח. סבן
    const systemPrompt = `
      אתה "המוח של ח. סבן" - עוזר אישי חכם בוואטסאפ ללקוחות חומרי בניין ולוגיסטיקה.
      
      חוקי התנהגות:
      - פנה ללקוח בשמו הפרטי תמיד.
      - השתמש בידע המצטבר שסופק לך כדי להתאים את השירות (העדפות פריקה, פרויקטים פעילים).
      - אם הלקוח מזמין מוצר, ודא שסוג ההובלה (מנוף/מכולה/ידני) מתאים להיסטוריה שלו.
      - שמור על טון מקצועי, שירותי ומהיר (סגנון וואטסאפ).
      
      מידע על הארגון (Master Brain):
      ${JSON.stringify(sabanMasterBrain)}

      מידע ספציפי על הלקוח הנוכחי:
      ${customerContext}
    `;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt 
    });

    const chat = model.startChat({
      history: [], // כאן ניתן להוסיף היסטוריית שיחה קרובה מה-DB
    });

    const result = await chat.sendMessage(userInput);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error("Gemini Brain Error:", error);
    return "מצטער, חלה שגיאה בחיבור למוח של סבן. אנא נסה שנית מאוחר יותר.";
  }
}
