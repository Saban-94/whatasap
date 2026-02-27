import products from "@/data/products.json";
import inventory from "@/data/inventory.json";
import knowledge from "@/data/technical_knowledge.json";

export async function processSmartOrder(context: string, query: string) {
  // 1. זיהוי מוצר לפי מילות מפתח (סיקה, קרמיקה וכו')
  const identifiedProduct = products.find(p => 
    query.includes(p.name) || (p.tags && p.tags.some(t => query.includes(t)))
  );

  // 2. לוגיקת חישוב כמויות (למשל קרמיקה 60/60)
  let calculationResult = null;
  if (query.includes("מטר") || query.includes("חשב")) {
    const sqMeter = parseFloat(query.replace(/[^0-9.]/g, ''));
    if (identifiedProduct?.packaging_ratio) {
      const cartons = Math.ceil(sqMeter / identifiedProduct.packaging_ratio);
      calculationResult = {
        required: sqMeter,
        units: cartons,
        unitName: "קרטונים",
        ratio: identifiedProduct.packaging_ratio
      };
    }
  }

  // 3. שליפת ידע טכני ממאגר קיים (חיסכון במכסת AI)
  const techInfo = knowledge.find(k => identifiedProduct && k.product_id === identifiedProduct.id);

  // 4. בניית התשובה
  if (identifiedProduct) {
    const stock = inventory.find(i => i.product_id === identifiedProduct.id);
    let text = `מצאתי עבורך את ${identifiedProduct.name}. \n`;
    
    if (calculationResult) {
      text += `📏 עבור ${calculationResult.required} מ"ר, תצטרך ${calculationResult.units} ${calculationResult.unitName} (לפי יחס של ${calculationResult.ratio} למארז). \n`;
    }
    
    if (techInfo) {
      text += `🛠️ מפרט טכני: ${techInfo.description} \n`;
    }

    text += `📦 במלאי: ${stock?.quantity || 0} יחידות זמינות ב${stock?.warehouse || "מחסן מרכזי"}.`;

    return {
      text,
      orderList: [{ ...identifiedProduct, qty: calculationResult?.units || 1, available: stock?.quantity || 0 }],
      hasImage: !!identifiedProduct.image
    };
  }

  return { text: "אני סורק את המוח... לא מצאתי מוצר תואם. נסה לרשום שם מוצר או מק\"ט.", orderList: [] };
}
