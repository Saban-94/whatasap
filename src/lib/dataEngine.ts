import productsData from "@/data/products.json";
import { fetchCustomerBrain } from "@/lib/customerMemory";
import { getSabanSmartResponse } from "@/app/actions/gemini-brain";

export async function processSmartOrder(customerId: string, text: string) {
  const memory: any = await fetchCustomerBrain(customerId);
  const name = (memory && typeof memory === 'object' && memory.name) ? memory.name : "אחי";
  
  // גישה למלאי המובנה
  const inventory = (productsData as any).inventory || [];

  // חיפוש מוצרים בטקסט (לפי מילה ראשונה בשם המוצר)
  const foundProducts = inventory.filter((p: any) => 
    p.name && text.toLowerCase().includes(p.name.split(' ')[0].toLowerCase())
  );

  let aiResponse = ""; 
  try {
    const expertContext = foundProducts.map((p: any) => 
      `- ${p.name}: ${p.description}. חישוב: ${p.calculation_logic}`
    ).join('\n');

    const prompt = `אתה המומחה של ח. סבן. ענה ל${name} בצורה מקצועית, נקייה ומודגשת. 
    בלי כוכביות (**). השתמש באימוג'י אחד בלבד לכל נושא. 
    ידע זמין: ${expertContext}\n\nשאלה: ${text}`;

    const raw = await getSabanSmartResponse(prompt, customerId);
    // ניקוי כוכביות וטקסט דהוי
    aiResponse = (raw || "").replace(/\*\*/g, '').trim();
  } catch (err) {
    aiResponse = `אהלן ${name}, אני בודק את המפרט הטכני בשבילך...`;
  }

  // הכנת רשימת המוצרים לימין (ה-Sidebar)
  const orderList = foundProducts.map((p: any) => ({
    id: p.barcode,
    name: p.name,
    qty: 1, // ברירת מחדל
    price: p.price || "לפי מחירון",
    image: p.image_url,
    // צבע לפי מחלקה: כחול לאיטום, ירוק לכל השאר
    color: p.department?.includes('איטום') ? '#3b82f6' : '#10b981'
  }));

  return {
    text: aiResponse,
    orderList: orderList, // הרשימה שתעבור לימין
    customerName: name,
    meta: { recommendations: orderList } // תאימות לדף הניהול
  };
}
