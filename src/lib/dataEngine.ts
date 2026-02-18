import productsData from "@/data/products.json";
import { fetchCustomerBrain } from "@/lib/customerMemory";

/**
 * פונקציה לטעינה בטוחה של קובץ הידע הטכני
 * מונע קריסה אם הקובץ לא קיים בשרת ה-Build
 */
const getTechnicalKnowledge = () => {
  try {
    return require("@/data/technical_knowledge.json");
  } catch (e) {
    return { product_database: {} };
  }
};

export async function processSmartOrder(customerId: string, text: string) {
  // 1. שליפת זיכרון הלקוח והידע הטכני
  const memory = await fetchCustomerBrain(customerId);
  const knowledge = getTechnicalKnowledge();
  
  // חילוץ מערך המלאי מתוך מבנה ה-JSON של סבן
  const inventory = (productsData as any).inventory || [];
  
  // 2. בדיקת ידע טכני מקומי (חסכון בעלויות API של Gemini)
  const technicalMatch = Object.keys(knowledge.product_database).find(p => text.includes(p));
  if (technicalMatch && (text.includes("ייבוש") || text.includes("כמה זמן"))) {
    return {
      role: "assistant",
      text: `לגבי ${technicalMatch}: ${knowledge.product_database[technicalMatch].drying_time}.`,
      ts: Date.now()
    };
  }

  // 3. מנוע חישוב כמויות אוטומטי (לפי שטח מ"ר מהטקסט)
  const areaMatch = text.match(/(\d+(?:\.\d+)?)\s*מ"ר/);
  if (areaMatch && (text.includes("מקלחת") || text.includes("אמבטיה") || text.includes("חדר רטוב"))) {
    const area = parseFloat(areaMatch[1]);
    const boards = Math.ceil(area / 3.12); // חישוב לפי לוח 2.60/1.20
    const adhesive = Math.ceil(area * 1.5); // נוסחת צריכת דבק ממוצעת
    
    return {
      role: "assistant",
      text: `ניתוח מומחה עבור ${area} מ"ר מקלחת: תצטרך ${boards} לוחות גבס ירוקים (עמידים בלחות) ו-${adhesive} שקי דבק. האם תרצה שאכניס להזמנה?`,
      meta: { 
        recommendations: [
          { name: "לוח גבס ירוק 2.60", qty: boards, category: "גבס", barcode: "112260" }, 
          { name: "דבק פלסטומר 603", qty: adhesive, category: "מלט ומוצריו", barcode: "14603" }
        ],
        projectPhase: "גבס ואיטום"
      },
      ts: Date.now()
    };
  }

  // 4. הצלבת מוצרים ישירה מהמלאי המאוחד (גישה למערך ה-inventory)
  const foundInStock = inventory.filter((p: any) => 
    text.includes(p.name) || (p.sub_category && text.includes(p.sub_category))
  );

  if (foundInStock.length > 0) {
    const productList = foundInStock.map((p: any) => p.name).join(", ");
    return {
      role: "assistant",
      text: `זיהיתי שאתה צריך: ${productList}. הכל זמין במלאי להעמסה.`,
      meta: { 
        foundInStock: foundInStock.map((p: any) => ({ name: p.name, barcode: p.barcode, supplier: p.supplier })) 
      },
      ts: Date.now()
    };
  }

  // 5. ברירת מחדל
  return {
    role: "assistant",
    text: "הבנתי את הבקשה. אני בודק זמינות מדויקת במחסן עבורך. יש דגם ספציפי שתרצה להוסיף?",
    ts: Date.now()
  };
}
