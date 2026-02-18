import products from "@/data/products.json";
import knowledge from "@/data/technical_knowledge.json";
import { fetchCustomerBrain } from "@/lib/customerMemory";
import { getSabanSmartResponse } from "@/app/actions/gemini-brain";

/**
 * מנוע הנתונים המאוחד של ח. סבן
 * משלב בין בינה מלאכותית (Gemini) לבין לוגיקה לוגיסטית קשיחה
 */
export async function processSmartOrder(customerId: string, text: string) {
  // 1. שליפת זיכרון לקוח מה-CRM
  const memory = await fetchCustomerBrain(customerId);
  const name = customerName(memory);

  // 2. הפעלת המוח של Gemini לקבלת ייעוץ אנושי ומקצועי
  let aiResponse = "";
  try {
    aiResponse = await getSabanSmartResponse(text, customerId);
  } catch (err) {
    console.error("AI Engine Error:", err);
    aiResponse = `שלום ${name}, אני מנתח את הבקשה שלך לפי המפרט הטכני של המחסן.`;
  }

  // 3. לוגיקה לוגיסטית (חישוב משקלים ורכב)
  const isBathroom = text.includes("מקלחת") || text.includes("אמבטיה") || text.includes("רטוב");
  
  let recommendations: any[] = [];
  let logistics = {
    truckType: "טנדר / משלוח קל",
    totalWeightKg: 0,
    needsCrane: false
  };

  if (isBathroom) {
    // חילוץ שטח מהטקסט (למשל "15 מ"ר")
    const areaMatch = text.match(/(\d+)\s*מ"ר/);
    const area = areaMatch ? parseInt(areaMatch[1]) : 10; 

    // חישוב לפי תקן סבן (3.12 מ"ר ללוח גבס, 1.5 שקי דבק למ"ר)
    const boards = Math.ceil(area / 3.12);
    const adhesive = Math.ceil(area * 1.5);

    recommendations = [
      { name: "לוח גבס ירוק עמיד לחות", qty: boards, barcode: "112260", weight: 25 },
      { name: "דבק פלסטומר 603", qty: adhesive, barcode: "14603", weight: 25 }
    ];

    // חישוב משקל כולל
    logistics.totalWeightKg = (boards * 25) + (adhesive * 25);
    
    // קביעת סוג רכב
    if (logistics.totalWeightKg > 1000) {
      logistics.truckType = "משאית עם מנוף";
      logistics.needsCrane = true;
    } else if (logistics.totalWeightKg > 500) {
      logistics.truckType = "משאית חלוקה קלה";
      logistics.needsCrane = false;
    }
  }

  // 4. החזרת תוצאה משולבת
  return {
    text: aiResponse, // התשובה האנושית מ-Gemini
    meta: {
      recommendations,
      logistics,
      projectPhase: isBathroom ? "גמר ואיטום" : "כללי",
      customerName: name
    }
  };
}

/**
 * מחלץ שם לקוח מתוך הזיכרון או מחזיר שם ברירת מחדל
 */
function customerName(memory: any): string {
  if (memory && memory.name) return memory.name;
  return "לקוח יקר";
}
