import productsData from "@/data/products.json";
import { fetchCustomerBrain } from "@/lib/customerMemory";
import { getSabanSmartResponse } from "@/app/actions/gemini-brain";

export async function processSmartOrder(customerId: string, text: string) {
  // 1. שליפת זיכרון לקוח
  const memory: any = await fetchCustomerBrain(customerId);
  let name = "לקוח";
  if (memory && typeof memory === 'object' && 'name' in memory) {
    name = memory.name;
  }

  // חילוץ המערך מתוך האובייקט (התאמה למבנה החדש של הקופיילוט)
  const inventory = (productsData as any).inventory || [];

  // 2. חיפוש מוצרים רלוונטיים
  const foundProducts = inventory.filter((p: any) => 
    p.description && 
    p.name &&
    text.includes(p.name.split(' ')[0])
  );

  // 3. בניית הזרקת ידע (Context Injection) לגימני
  let expertContext = "";
  if (foundProducts.length > 0) {
    expertContext = foundProducts.map((p: any) => 
      `מוצר: ${p.name}. תיאור: ${p.description}. לוגיקת חישוב: ${p.calculation_logic}. מפרט: ${JSON.stringify(p.technical_specs)}`
    ).join('\n');
  }

  // 4. הפעלת המוח של Gemini
  let aiResponse: string = ""; 
  try {
    const promptWithContext = foundProducts.length > 0 
      ? `השתמש בידע הטכני הבא כדי לענות ללקוח:\n${expertContext}\n\nשאלה: ${text}`
      : text;

    const response = await getSabanSmartResponse(promptWithContext, customerId);
    aiResponse = response || `שלום ${name}, המערכת בעומס קל. איך אוכל לעזור?`;
  } catch (err) {
    aiResponse = `אהלן ${name}, אני בודק לך את הפרטים במפרט הטכני.`;
  }

  // 5. חישוב לוגיסטי דינמי
  let recommendations: any[] = [];
  let totalWeight = 0;
  let hasHeavyItems = false;

  foundProducts.forEach((p: any) => {
    const areaMatch = text.match(/(\d+)\s*(מ"ר|מר|מטר)/);
    let qty = 1;
    
    if (areaMatch && p.calculation_logic) {
      const ratioMatch = p.calculation_logic.match(/(\d+(\.\d+)?)/);
      if (ratioMatch) {
        const area = parseInt(areaMatch[1]);
        const ratio = parseFloat(ratioMatch[1]);
        // הנחה: אם החישוב הוא בק"ג, מחלקים ב-25 ק"ג לשק
        qty = Math.ceil((area * ratio) / 25);
      }
    }

    recommendations.push({
      name: p.name,
      qty,
      description: p.description,
      calculation: p.calculation_logic
    });

    const weight = p.technical_specs?.unit_weight ? parseFloat(p.technical_specs.unit_weight) : 25;
    totalWeight += (qty * weight);
    if (p.logistics_tag === 'heavy' || weight >= 20) hasHeavyItems = true;
  });

  return {
    text: aiResponse,
    meta: {
      recommendations,
      logistics: {
        totalWeightKg: totalWeight,
        truckType: totalWeight > 1000 ? "משאית מנוף" : totalWeight > 0 ? "טנדר חלוקה" : "משלוח רגיל",
        needsCrane: totalWeight > 1000 || hasHeavyItems
      },
      customerName: name
    }
  };
}
