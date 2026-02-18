import productsData from "@/data/products.json";
import { fetchCustomerBrain } from "@/lib/customerMemory";
import { getSabanSmartResponse } from "@/app/actions/gemini-brain";

/**
 * מנקה את הטקסט ומעצב אותו בצורה מקצועית ללא כוכביות
 */
function cleanAndStyleText(text: string) {
  return text
    .replace(/\*\*/g, '') // הסרת כוכביות
    .replace(/🏗️|⚖️|📐|📦|🚚|💰/g, '') // ניקוי אימוג'ים קיימים כדי לשלוט בהם מחדש
    .trim();
}

export async function processSmartOrder(customerId: string, text: string) {
  const memory: any = await fetchCustomerBrain(customerId);
  const name = (memory && typeof memory === 'object' && memory.name) ? memory.name : "אלוף";
  
  const inventory = (productsData as any).inventory || [];

  // חיפוש מוצרים
  const foundProducts = inventory.filter((p: any) => 
    p.name && text.toLowerCase().includes(p.name.split(' ')[0].toLowerCase())
  );

  let expertContext = foundProducts.map((p: any) => 
    `מוצר: ${p.name}. מפרט: ${p.description}. חישוב: ${p.calculation_logic}`
  ).join('\n');

  let aiResponse = ""; 
  try {
    const prompt = `אתה המומחה של ח. סבן. ענה ל${name} בצורה מקצועית ונקייה. 
    בלי כוכביות (**). השתמש באימוג'י אחד בלבד לכל נושא. 
    אם יש חישוב, הצג אותו בשורות נפרדות.
    ידע זמין: ${expertContext}\n\nשאלה: ${text}`;

    const raw = await getSabanSmartResponse(prompt, customerId);
    aiResponse = cleanAndStyleText(raw || "");
  } catch (err) {
    aiResponse = `שלום ${name}, אני בודק את המפרט הטכני עבורך.`;
  }

  // הכנת המלצות צבעוניות לממשק
  const recommendations = foundProducts.map((p: any) => {
    const areaMatch = text.match(/(\d+)/);
    const area = areaMatch ? parseInt(areaMatch[0]) : 1;
    
    return {
      id: p.barcode,
      name: p.name,
      qty: 1, // ברירת מחדל, הלקוח יוכל לערוך
      price: p.price || "לפי מחירון",
      color: p.department === 'איטום' ? '#3b82f6' : '#10b981', // כחול לאיטום, ירוק לאחרים
      image: p.image_url
    };
  });

  return {
    text: aiResponse,
    orderList: recommendations,
    customerName: name
  };
}
