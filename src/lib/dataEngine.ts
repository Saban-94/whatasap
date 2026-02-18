import { getSabanSmartResponse } from "@/app/actions/gemini-brain";

export async function processSmartOrder(customerId: string, text: string) {
  try {
    // שליחה ישירה למוח של גימני - בלי פילטרים בדרך
    const aiResponse = await getSabanSmartResponse(text, customerId);
    
    return {
      role: "assistant",
      text: aiResponse,
      ts: Date.now(),
      meta: {
        // כאן ה-AI יכול להוסיף נתונים לוגיסטיים בהמשך
      }
    };
  } catch (error) {
    console.error("DataEngine Error:", error);
    return {
      role: "assistant",
      text: "אחי, המוח שלי רגע בטעינה. תכתוב לי שוב או שתרים טלפון למשרד ונסדר אותך.",
      ts: Date.now()
    };
  }
}
