import unifiedBrainRaw from "@/data/saban_unified_brain.json";
import productsData from "@/data/products.json";
import inventoryData from "@/data/inventory.json";

// הגדרת טיפוסים גמישה למניעת שגיאות אינדקס ב-Build
const unifiedBrain = unifiedBrainRaw as any;
const calculators = unifiedBrain.calculators as Record<string, any>;

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  tags?: string[];
  image?: string;
  packaging_ratio?: number;
}

export async function processSmartOrder(context: string, query: string) {
  // חילוץ המערכים בבטחה מה-JSON
  const products: Product[] = (productsData as any).inventory || [];
  const inventory: any[] = Array.isArray(inventoryData) ? inventoryData : (inventoryData as any).inventory || [];

  // 1. זיהוי מחשבון מהמוח המאוחד בשיטה בטוחה ל-TypeScript
  const calcKeys = Object.keys(calculators);
  const detectedCalcKey = calcKeys.find(key => {
    const desc = calculators[key].description || "";
    return query.includes(key) || (desc && query.includes(desc.split(' ')[0]));
  });

  if (detectedCalcKey) {
    const calc = calculators[detectedCalcKey];
    const numbers = query.match(/\d+(\.\d+)?/g);
    const val = numbers ? parseFloat(numbers[0]) : 0;

    // לוגיקת חישוב ריצוף
    if (detectedCalcKey === 'tiling' && val > 0) {
      const waste = calc.waste_factor || 1.10;
      const totalArea = val * waste;
      const packSize = calc.packaging?.["60x60"] || 1.44;
      const totalUnits = Math.ceil(totalArea / packSize);
      
      return {
        text: `לפי חישוב המוח של ח. סבן: עבור ${val} מ"ר (כולל פחת הנדסי), תצטרך ${totalUnits} קרטונים של פורצלן 60/60.`,
        orderList: [{ name: "פורצלן 60/60", qty: totalUnits, price: 85, image: "/products/tile60.png" }],
        type: 'calculation'
      };
    }

    // לוגיקת חישוב בלוקים
    if (detectedCalcKey === 'blocks' && val > 0) {
      const blockSize = calc.sizes?.size_10 || 0.10;
      const totalBlocks = Math.ceil(val / blockSize);
      
      return {
        text: `עבור שטח נטו של ${val} מ"ר, תצטרך ${totalBlocks} בלוקים (לפי גודל סטנדרטי).`,
        orderList: [{ name: "בלוק 10", qty: totalBlocks, price: 4.5, image: "/products/block10.png" }],
        type: 'calculation'
      };
    }
  }

  // 2. זיהוי מוצר בטוח מהמערך
  const identifiedProduct = products.find(p => 
    query.includes(p.name) || (p.tags && p.tags.some(t => query.includes(t))) || query.includes(p.sku)
  );

  if (identifiedProduct) {
    const stock = inventory.find(i => i.product_id === identifiedProduct.id || i.barcode === identifiedProduct.sku);
    return {
      text: `מצאתי את ${identifiedProduct.name}. זמינות: ${stock?.quantity || 0} יחידות ב${stock?.warehouse || 'מחסן מרכזי'}.`,
      orderList: [{ ...identifiedProduct, available: stock?.quantity || 0 }],
      hasImage: !!identifiedProduct.image
    };
  }

  return {
    text: "אני סורק את המוח הלוגיסטי... לא מצאתי מוצר מדויק. נסה שם מוצר, מק\"ט או בקש חישוב כמויות.",
    orderList: []
  };
}
