import unifiedBrain from "@/data/saban_unified_brain.json";
import products from "@/data/products.json";
import inventory from "@/data/inventory.json";

export async function processSmartOrder(context: string, query: string) {
  // 1. בדיקת מאגר הידע המקומי למניעת שימוש מופרז ב-AI (מחשבונים)
  const calcKeys = Object.keys(unifiedBrain.calculators);
  const detectedCalc = calcKeys.find(key => query.includes(key) || 
    (unifiedBrain.calculators[key].description && query.includes(unifiedBrain.calculators[key].description.split(' ')[0])));

  if (detectedCalc) {
    const calc = unifiedBrain.calculators[detectedCalc];
    const numbers = query.match(/\d+(\.\d+)?/g);
    const val = numbers ? parseFloat(numbers[0]) : 0;

    // לוגיקת חישוב ריצוף
    if (detectedCalc === 'tiling') {
      const area = val;
      const totalArea = area * calc.waste_factor;
      const packSize = calc.packaging["60x60"]; // ברירת מחדל
      const totalUnits = Math.ceil(totalArea / packSize);
      
      return {
        text: `לפי חישוב המוח של ח. סבן: עבור ${area} מ"ר (כולל 10% פחת הנדסי), תצטרך ${totalUnits} קרטונים של פורצלן 60/60.`,
        orderList: [{ name: "פורצלן 60/60", qty: totalUnits, price: 85, image: "/products/tile60.png" }],
        type: 'calculation'
      };
    }
    
    // לוגיקת חישוב בלוקים
    if (detectedCalc === 'blocks') {
      const netM2 = val;
      const blockSize = calc.sizes.size_10; // דוגמה לבלוק 10
      const totalBlocks = Math.ceil(netM2 / blockSize);
      
      return {
        text: `עבור שטח קיר נטו של ${netM2} מ"ר, תצטרך ${totalBlocks} בלוקים (לפי גודל סטנדרטי).`,
        orderList: [{ name: "בלוק 10", qty: totalBlocks, price: 4.5, image: "/products/block10.png" }],
        type: 'calculation'
      };
    }
  }

  // 2. חיפוש מוצר וזיהוי תמונה במלאי
  const identifiedProduct = products.find(p => 
    query.includes(p.name) || (p.tags && p.tags.some(t => query.includes(t)))
  );

  if (identifiedProduct) {
    const stock = inventory.find(i => i.product_id === identifiedProduct.id);
    return {
      text: `מצאתי את ${identifiedProduct.name} במאגר. ${identifiedProduct.description || ''} \n זמינות: ${stock?.quantity || 0} יחידות ב${stock?.warehouse || 'מחסן מרכזי'}.`,
      orderList: [{ ...identifiedProduct, available: stock?.quantity || 0 }],
      hasImage: !!identifiedProduct.image
    };
  }

  // 3. רק אם אין תשובה במאגר - שימוש ב-Gemini (כמוצא אחרון)
  return {
    text: "אני סורק את המוח הלוגיסטי... לא מצאתי תשובה מדויקת במאגר הקיים. נסה לרשום מוצר ספציפי או לבצע חישוב.",
    orderList: []
  };
}
