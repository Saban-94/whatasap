import products from "@/data/products.json";
import knowledge from "@/data/technical_knowledge.json";
// שימוש בשם הפונקציה הנכון מהקובץ customerMemory
import { fetchCustomerBrain } from "@/lib/customerMemory";
import { getSabanSmartResponse } from "@/app/actions/gemini-brain";

export async function processSmartOrder(customerId: string, text: string) {
  // 1. שליפת זיכרון לקוח מה-CRM - הגדרת הטיפוס כ-any כדי למנוע שגיאת Build
  const memory: any = await fetchCustomerBrain(customerId);
  
  // חילוץ שם בטוח למניעת קריסה
  let name = "לקוח";
  if (memory && typeof memory === 'object' && 'name' in memory) {
    name = memory.name;
  }

  // 2. הפעלת המוח של Gemini לקבלת ייעוץ אישי
  let aiResponse = "";
  try {
    aiResponse = await getSabanSmartResponse(text, customerId);
  } catch (err) {
    console.error("AI Engine Error:", err);
    aiResponse = `שלום ${name}, אני מנתח את הבקשה שלך לפי המפרט הטכני של המחסן.`;
  }

  // 3. לוגיקה לוגיסטית וחישוב משקלים עבור ח. סבן
  const isBathroom = text.includes("מקלחת") || text.includes("אמבטיה") || text.includes("רטוב");
  
  let recommendations: any[] = [];
  let logistics = {
    truckType: "טנדר / משלוח קל",
    totalWeightKg: 0,
    needsCrane: false
  };

  if (isBathroom) {
    // חילוץ שטח מהטקסט (למשל "10 מ"ר")
    const areaMatch = text.match(/(\d+)\s*מ"ר/);
    const area = areaMatch ? parseInt(areaMatch[1]) : 10; 

    // חישוב כמויות לוחות גבס ודבק
    const boards = Math.ceil(area / 3.12);
    const adhesive = Math.ceil(area * 1.5);

    recommendations = [
      { name: "לוח גבס ירוק עמיד לחות", qty: boards, barcode: "112260", weight: 25 },
      { name: "דבק פלסטומר 603", qty: adhesive, barcode: "14603", weight: 25 }
    ];

    logistics.totalWeightKg = (boards * 25) + (adhesive * 25);
    
    // קביעת סוג רכב לפי משקל
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
