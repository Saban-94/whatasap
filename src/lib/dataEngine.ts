// src/lib/dataEngine.ts
import productsData from "@/data/products.json";
import customerHistory from "@/data/customer_history.json";

// מילון נורמליזציה שנלמד מהיסטוריית הווצאפ
const SLANG_MAP: Record<string, string> = {
  "אמרקאי": "שפכטל אמריקאי טמבור",
  "פיבה": "פיבה קרטון",
  "סוססום": "סומסום",
  "שומשום": "סומסום",
  "סיקה פליקס": "סיקה פלקס 118",
  "ניר סרט": "סרט נייר קרטון",
  "מסכן טיפ": "מסקינטייפ (נייר דבק כחול)"
};

export async function processSmartOrder(customerId: string, text: string) {
  // 1. נורמליזציה של הטקסט לפי היסטוריית הווצאפ
  let normalizedText = text;
  Object.keys(SLANG_MAP).forEach(slang => {
    if (text.includes(slang)) {
      normalizedText = text.replace(new RegExp(slang, 'g'), SLANG_MAP[slang]);
    }
  });

  // 2. שליפת פרופיל לקוח מהזיכרון
  const clientProfile = customerHistory.find(c => c.phone === customerId || c.client_name.includes(customerId));

  // 3. לוגיקת זיהוי מוצרים משופרת
  const inventory = Array.isArray(productsData) ? productsData : [];
  const foundProducts = inventory.filter((p: any) => {
    const productName = p.name?.toLowerCase() || "";
    return normalizedText.toLowerCase().includes(productName) || 
           (clientProfile?.favorite_products.some(fav => productName.includes(fav.toLowerCase())));
  });

  return {
    text: `אהלן ${clientProfile?.client_name || 'אחי'}, זיהיתי את ההזמנה. לאתר ב${clientProfile?.frequent_sites[0] || 'רגיל'}?`,
    orderList: foundProducts.map(p => ({
      id: p.barcode,
      name: p.name,
      qty: normalizedText.match(new RegExp(`(\\d+)\\s+${p.name}`)) ? parseInt(RegExp.$1) : 1,
      price: p.price || "לפי מחירון VIP"
    }))
  };
}
