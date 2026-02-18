import productsData from "@/data/products.json";
import { fetchCustomerBrain } from "@/lib/customerMemory";
import { getSabanSmartResponse } from "@/app/actions/gemini-brain";

export async function processSmartOrder(customerId: string, text: string) {
  const memory: any = await fetchCustomerBrain(customerId);
  const name = (memory && typeof memory === 'object' && memory.name) ? memory.name : "אלוף";
  const inventory = (productsData as any).inventory || [];

  const foundProducts = inventory.filter((p: any) => 
    p.name && text.toLowerCase().includes(p.name.split(' ')[0].toLowerCase())
  );

  let expertContext = foundProducts.map((p: any) => 
    `מוצר: ${p.name}. חישוב: ${p.calculation_logic}`
  ).join('\n');

  let aiResponse = ""; 
  try {
    const prompt = `אתה המומחה של ח. סבן. ענה ל${name} בצורה מקצועית. 
    בלי כוכביות (**). השתמש באימוג'י אחד בלבד לכל נושא.
    אם יש חישוב, הצג אותו בשורות נפרדות וברורות.
    ידע: ${expertContext}\n\nשאלה: ${text}`;

    const raw = await getSabanSmartResponse(prompt, customerId);
    // ניקוי כוכביות והדגשות ידניות
    aiResponse = (raw || "").replace(/\*\*/g, '').trim();
  } catch (err) {
    aiResponse = `שלום ${name}, אני בודק את הפרטים עבורך.`;
  }

  // יצירת מטה-דאטה עבור דף הניהול והצ'אט
  const meta = {
    customerName: name,
    recommendations: foundProducts.map((p: any) => ({
      id: p.barcode,
      name: p.name,
      qty: 1,
      price: p.price || "לפי מחירון",
      color: p.department === 'איטום' ? '#3b82f6' : '#10b981', // כחול לאיטום, ירוק לבנייה
      logistics: p.logistics_tag
    })),
    totalWeight: foundProducts.length * 25 // חישוב גס להדגמה
  };

  return {
    text: aiResponse,
    orderList: meta.recommendations,
    customerName: name,
    meta: meta // הוספת meta כדי לפתור את שגיאת ה-Build
  };
}
