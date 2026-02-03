import products from '@/data/products_saban_engineering.json';
import customers from '@/data/customers.json';

// פונקציה שג'ימיני משתמש בה כדי להבין מי הלקוח ומה הוא קנה בעבר
export const getCustomerContext = (token: string) => {
  const customer = customers.find(c => c.magic_link_token === token);
  if (!customer) return null;

  // שליפת מוצרים שהלקוח אוהב או קנה בעבר מההיסטוריה (מבוסס על ה-CSV שניתחנו)
  const historyProducts = products.filter(p => 
    customer.active_projects.some(project => p.description.includes(project))
  );

  return { customer, historyProducts };
};

// פונקציה לחיפוש מוצרים חכם בקטלוג
export const searchCatalog = (query: string) => {
  return products.filter(p => 
    p.name.includes(query) || p.category.includes(query)
  ).slice(0, 5); // מחזיר רק 5 הכי רלוונטיים כדי לא להעמיס על ה-AI
};
