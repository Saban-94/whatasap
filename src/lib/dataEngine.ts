// src/lib/dataEngine.ts
import productsData from "@/data/products.json";
import customerHistory from "@/data/customer_history.json";

// מילון מונחים שנלמד מהשטח (מתוך ה-CSV)
const SLANG_MAP: Record<string, string> = {
  "אמרקאי": "שפכטל אמריקאי טמבור",
  "פיבה": "פיבה קרטון",
  "סוססום": "סומסום",
  "מסכן טיפ": "מסקינטייפ כחול",
  "סרט ניר": "סרט נייר קרטון"
};

export async function processSmartOrder(customerId: string, text: string) {
  let normalizedText = text;
  
  // נורמליזציה של סלנג למוצרים טכניים
  Object.keys(SLANG_MAP).forEach(slang => {
    if (text.includes(slang)) {
      normalizedText = text.replace(new RegExp(slang, 'g'), SLANG_MAP[slang]);
    }
  });

  // שליפת פרופיל לקוח מההיסטוריה (זיהוי לפי טלפון מה-CSV)
  const client = customerHistory.find(c => c.phone === customerId) || { client_name: "לקוח חדש" };

  const inventory = Array.isArray(productsData) ? productsData : [];
  const foundProducts = inventory.filter((p: any) => 
    normalizedText.toLowerCase().includes(p.name.toLowerCase())
  );

  return {
    text: `בוקר טוב ${client.client_name}, יטופל מיידית. רשמתי את המוצרים להזמנה.`,
    orderList: foundProducts.map(p => ({
      id: p.barcode,
      name: p.name,
      qty: 1, // ניתן להוסיף זיהוי כמויות רגקס כאן
      price: p.price || "לפי מחירון"
    }))
  };
}
