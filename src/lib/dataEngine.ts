import unifiedBrain from "@/data/saban_unified_brain.json";
import productsData from "@/data/products.json";
import inventoryData from "@/data/inventory.json";

// הגדרת טיפוסים בסיסית למניעת שגיאות Build
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
  // חילוץ המערכים מתוך האובייקטים (לפי מבנה הקבצים שלך)
  const products: Product[] = (productsData as any).inventory || [];
  const inventory: any[] = Array.isArray(inventoryData) ? inventoryData : (inventoryData as any).inventory || [];

  // 1. בדיקת מאגר הידע המקומי (מחשבונים) מתוך המוח המאוחד
  const calculators = (unifiedBrain as any).calculators;
  const calcKeys = Object.keys(calculators);
  
  const detectedCalcKey = calcKeys.find(key => 
    query.includes(calculators[key].description?.split(' ')[0]) || query.includes(key)
  );

  if (detectedCalcKey) {
    const calc = calculators[detectedCalcKey];
    const numbers = query.match(/\d+(\.\d+)?/g);
    const val = numbers ? parseFloat(numbers[0]) : 0;

    if (detectedCalcKey === 'tiling' && val > 0) {
      const totalArea = val * (calc.waste_factor || 1.10);
      const packSize = calc.packaging?.["60x60"] || 1.44;
      const totalUnits = Math.ceil(totalArea / packSize);
      
      return {
        text: `חישוב הנדסי עבור ${val} מ"ר (כולל פחת): תצטרך ${totalUnits} קרטונים של פורצלן 60/60.`,
        orderList: [{ name: "פורצלן 60/60", qty: totalUnits, price: 85, image: "/products/tile60.png" }],
        type: 'calculation'
      };
    }
  }

  // 2. זיהוי מוצר בטוח מתוך המערך
  const identifiedProduct = products.find(p => 
    query.includes(p.name) || (p.tags && p.tags.some(t => query.includes(t))) || query.includes(p.sku)
  );

  if (identifiedProduct) {
    const stock = inventory.find(i => i.product_id === identifiedProduct.id || i.barcode === identifiedProduct.sku);
    return {
      text: `מצאתי את ${identifiedProduct.name}. זמינות: ${stock?.quantity || 0} יחידות ב${stock?.warehouse || 'מחסן מרכזי'}.`,
      orderList: [{ ...identifiedProduct, available: stock?.quantity || 0 }],
      hasImage: !!(identifiedProduct.image)
    };
  }

  return {
    text: "אני סורק את המוח הלוגיסטי... לא מצאתי מוצר מדויק. נסה שם מוצר, מק\"ט או בקש חישוב כמויות.",
    orderList: []
  };
}
