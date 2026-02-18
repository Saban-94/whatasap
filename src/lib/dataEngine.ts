import products from "@/data/products.json";
import knowledge from "@/data/technical_knowledge.json";
// תיקון: ייבוא השם הנכון של הפונקציה מהקובץ
import { fetchCustomerBrain } from "@/lib/customerMemory";

export async function processSmartOrder(customerId: string, text: string) {
  // תיקון: שימוש ב-fetchCustomerBrain במקום getCustomerMemory
  const memory = await fetchCustomerBrain(customerId);
  
  // לוגיקת הניתוח הלוגיסטי של סבן
  const isBathroom = text.includes("מקלחת") || text.includes("אמבטיה") || text.includes("רטוב");
  
  let recommendations: any[] = [];
  let logistics = {
    truckType: "טנדר / משלוח קל",
    totalWeightKg: 0,
    needsCrane: false
  };

  if (isBathroom) {
    // חישוב מבוסס שטח (אם הוזכר מ"ר בטקסט)
    const areaMatch = text.match(/(\d+)\s*מ"ר/);
    const area = areaMatch ? parseInt(areaMatch[1]) : 10; // ברירת מחדל 10 מ"ר

    const boards = Math.ceil(area / 3.12);
    const adhesive = Math.ceil(area * 1.5);

    recommendations = [
      { name: "לוח גבס ירוק עמיד לחות", qty: boards, barcode: "112260" },
      { name: "דבק פלסטומר 603", qty: adhesive, barcode: "14603" }
    ];

    logistics.totalWeightKg = (boards * 25) + (adhesive * 25);
    if (logistics.totalWeightKg > 500) {
      logistics.truckType = "משאית חלוקה בינונית";
      logistics.needsCrane = true;
    }
  }

  return {
    text: `ניתוח מומחה עבור ${customerName(memory)}: בהתבסס על הנתונים, מומלץ להכין ${recommendations.length} פריטים לליקוט. האם תרצה שאפיק תעודת משלוח?`,
    meta: {
      recommendations,
      logistics,
      projectPhase: isBathroom ? "גמר ואיטום" : "כללי"
    }
  };
}

function customerName(memory: any) {
  return (memory && memory.name) ? memory.name : "לקוח";
}
