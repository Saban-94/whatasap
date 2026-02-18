import products from "@/data/products.json";
import { fetchCustomerBrain } from "@/lib/customerMemory";

// הגנה למקרה שקובץ הידע הטכני עדיין לא נוצר בשרת
let knowledge: any = { product_database: {} };
try {
  knowledge = require("@/data/technical_knowledge.json");
} catch (e) {
  console.log("technical_knowledge.json not found, using empty defaults");
}

export async function processSmartOrder(customerId: string, text: string) {
  // תיקון שם הפונקציה למה שקיים ב-lib/customerMemory.ts
  const memory = await fetchCustomerBrain(customerId);
  
  // 1. בדיקת ידע טכני מקומי (חסכון בעלויות API)
  const technicalMatch = Object.keys(knowledge.product_database).find(p => text.includes(p));
  if (technicalMatch && (text.includes("ייבוש") || text.includes("כמה זמן"))) {
    return {
      role: "assistant",
      text: `לגבי ${technicalMatch}: ${knowledge.product_database[technicalMatch].drying_time}.`,
      ts: Date.now()
    };
  }

  // 2. חישוב כמויות אוטומטי (לפי שטח מ"ר)
  const areaMatch = text.match(/(\d+(?:\.\d+)?)\s*מ"ר/);
  if (areaMatch && (text.includes("מקלחת") || text.includes("אמבטיה"))) {
    const area = parseFloat(areaMatch[1]);
    const boards = Math.ceil(area / 3.12); // חישוב לפי לוח סטנדרטי 2.60/1.20
    const adhesive = Math.ceil(area * 1.5); // נוסחת צריכת דבק ממוצעת
    
    return {
      role: "assistant",
      text: `ניתוח מומחה עבור ${area} מ"ר מקלחת: תצטרך ${boards} לוחות גבס ירוקים ו-${adhesive} שקי דבק. האם להכין לך את ההזמנה?`,
      meta: { 
        recommendations: [
          { name: "לוח גבס ירוק 2.60", qty: boards, category: "גבס" }, 
          { name: "דבק פלסטומר 603", qty: adhesive, category: "מלט ומוצריו" }
        ],
        projectPhase: "גבס ואיטום"
      },
      ts: Date.now()
    };
  }

  // 3. הצלבת מוצרים מהמלאי המאוחד (הזרקת ידע)
  const foundInStock = products.filter((p: any) => text.includes(p.name));
  if (foundInStock.length > 0) {
    return {
      role: "assistant",
      text: `זיהיתי שאתה צריך: ${foundInStock.map((p:any) => p.name).join(", ")}. הכל נמצא במלאי זמין.`,
      meta: { foundInStock },
      ts: Date.now()
    };
  }

  // 4. ברירת מחדל - החזרת תשובה כללית אם לא זוהה משהו טכני
  return {
    role: "assistant",
    text: "הבנתי, אני בודק לך את הפרטים מול המלאי המעודכן. תרצה להוסיף מידות מדויקות?",
    ts: Date.now()
  };
}
