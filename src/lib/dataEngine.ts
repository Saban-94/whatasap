import products from "@/data/products.json";
import knowledge from "@/data/technical_knowledge.json";
import { getCustomerMemory } from "@/lib/customerMemory";

export async function processSmartOrder(customerId: string, text: string) {
  const memory = await getCustomerMemory(customerId);
  const words = text.split(" ");
  
  // 1. בדיקת ידע טכני מקומי (חסכון ב-API)
  const technicalMatch = Object.keys(knowledge.product_database).find(p => text.includes(p));
  if (technicalMatch && (text.includes("ייבוש") || text.includes("כמה זמן"))) {
    return {
      role: "assistant",
      text: `לגבי ${technicalMatch}: זמן הייבוש הוא ${knowledge.product_database[technicalMatch].drying_time}.`
    };
  }

  // 2. חישוב כמויות אוטומטי (לפי שטח)
  const areaMatch = text.match(/(\d+(?:\.\d+)?)\s*מ"ר/);
  if (areaMatch && (text.includes("מקלחת") || text.includes("אמבטיה"))) {
    const area = parseFloat(areaMatch[1]);
    const boards = Math.ceil(area / 3.12); // חישוב לפי לוח 2.60/1.20
    const adhesive = Math.ceil(area * 1.5); // נוסחת דבק
    
    return {
      role: "assistant",
      text: `עבור ${area} מ"ר מקלחת, תצטרך ${boards} לוחות ירוקים ו-${adhesive} שקי דבק. להוסיף להזמנה?`,
      meta: { recommendations: [{ name: "לוח גבס ירוק", qty: boards }, { name: "דבק פלסטומר", qty: adhesive }] }
    };
  }

  // 3. אם לא נמצא פתרון לוקאלי - פנייה ל-Gemini
  // כאן נכנס הקוד של callGemini ששולח גם את ה-Context של הלקוח
}
