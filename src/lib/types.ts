// דוגמה למוצר מעובד לפי הממשק שלך
const processedProduct: Product = {
  sku: "SBN-9021",
  name: "משאבת מים טבולה - סדרת הנדסה",
  description: "משאבה מקצועית לעבודה מאומצת, עמידה בפני קורוזיה...",
  barcode: "7290001234567",
  category: "Pumps",
  features: ["הגנה טרמית", "ציר נירוסטה", "פעולה שקטה"],
  specs: {
    "הספק": "1.5 HP",
    "מתח": "220V",
    "קוטר יציאה": "2 inch"
  },
  stock: {
    quantity: 45,
    minThreshold: 10,
    unit: "pcs",
    location: "A-12",
    price: 850,
    currency: "ILS"
  },
  lastUpdated: new Date().toISOString()
};
