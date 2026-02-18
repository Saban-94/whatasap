import products from "@/data/products.json";
import knowledge from "@/data/technical_knowledge.json";
// שימוש בשם הפונקציה המעודכן מהזיכרון של המערכת
import { fetchCustomerBrain } from "@/lib/customerMemory";
import { getSabanSmartResponse } from "@/app/actions/gemini-brain";

/**
 * מנוע הנתונים המאוחד של ח. סבן
 * מעבד הזמנות, מחשב לוגיסטיקה ומפעיל את ה-AI
 */
export async function processSmartOrder(customerId: string, text: string) {
  // 1. שליפת זיכרון לקוח מה-CRM - הגדרה כ-any למניעת שגיאת טיפוס ב-Build
  const memory: any = await fetchCustomerBrain(customerId);
  
  // חילוץ שם בטוח (Fallback ל"לקוח" אם לא נמצא)
  let name = "לקוח";
  if (memory && typeof memory === 'object' && 'name' in memory) {
    name = memory.name;
  }

  // 2. הפעלת המוח של Gemini לקבלת ייעוץ אישי
  let aiResponse: string = ""; 
  try {
    // הבטחת קבלת מחרוזת טקסט למניעת שגיאת Type 'undefined'
    const response = await getSabanSmartResponse(text, customerId);
    aiResponse = response || `שלום ${name}, אני זמין לשירותך. איך אוכל לעזור במחסן היום?`;
  } catch (err) {
    console.error("AI Engine Error:", err);
    aiResponse = `אהלן ${name}, יש עומס רגעי במערכת ה-AI. אני בודק לך את הפרטים ידנית.`;
  }

  // 3. לוגיקה לוגיסטית וחישוב משקלים (ח. סבן לוגיסטיקה)
  const isBathroom = text.includes("מקלחת") || text.includes("אמבטיה") || text.includes("רטוב");
  
  let recommendations: any[] = [];
  let logistics = {
    truckType: "טנדר / משלוח קל",
    totalWeightKg: 0,
    needsCrane: false
  };

  // דוגמה ללוגיקת חישוב שתורחב עם קובץ ה-100 מוצרים החדש
  if (isBathroom) {
    const areaMatch = text.match(/(\d+)\s*מ"ר/);
    const area = areaMatch ? parseInt(areaMatch[1]) : 10; 

    // חישוב לפי נתוני מומחה (לוח גבס ודבק)
    const boards = Math.ceil(area / 3.12);
    const adhesive = Math.ceil(area * 1.5);

    recommendations = [
      { name: "לוח גבס ירוק עמיד לחות", qty: boards, barcode: "112260", weight: 25 },
      { name: "דבק פלסטומר 603", qty: adhesive, barcode: "14603", weight: 25 }
    ];

    logistics.totalWeightKg = (boards * 25) + (adhesive * 25);
    
    // החלטה על סוג רכב לפי משקל כולל
    if (logistics.totalWeightKg > 1000) {
      logistics.truckType = "משאית עם מנוף";
      logistics.needsCrane = true;
    } else if (logistics.totalWeightKg > 500) {
      logistics.truckType = "משאית חלוקה קלה";
    }
  }

  return {
    text: aiResponse,
    meta: {
      recommendations,
      logistics,
      projectPhase: isBathroom ? "גמר ואיטום" : "כללי",
      customerName: name
    }
  };
}
