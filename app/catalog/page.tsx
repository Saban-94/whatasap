'use client';
import React, { useState } from 'react';
import { ShoppingCart, calculator as CalcIcon, CheckCircle2, Info, Send, Search } from 'lucide-react';

export default function SabanCatalog() {
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // דוגמה למוצר מהמוח (במציאות זה מגיע מה-JSON שקופיילוט יצר)
  const products = [
    { 
      id: '19107', 
      name: 'סיקה 107 אפור', 
      brand: 'Sika', 
      price: 185, 
      image: 'https://i.postimg.cc/76dMJmFd/bqrwb.gif',
      drying: '4-6 שעות',
      consumption: 2.0 // ק"ג למ"ר
    }
  ];

  const addToCart = (product: any, qty: number) => {
    setCart([...cart, { ...product, qty }]);
    alert(`התווסף לסל: ${qty} יחידות של ${product.name}`);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 text-right font-sans" dir="rtl">
      {/* Header קטלוג */}
      <header className="max-w-7xl mx-auto mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 italic uppercase">קטלוג מומחה - ח. סבן</h1>
          <p className="text-blue-600 font-bold tracking-widest text-xs uppercase">Verified Technical Catalog</p>
        </div>
        <div className="relative w-64">
           <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           <input 
            className="w-full p-4 pr-12 rounded-2xl bg-white shadow-sm border-none focus:ring-2 focus:ring-blue-500 font-bold"
            placeholder="חפש מוצר או מותג..."
            onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map(product => (
          <ProductCard key={product.id} product={product} onAdd={addToCart} />
        ))}
      </div>

      {/* כפתור שליחה סופי (ל-365 ולוואטסאפ) */}
      {cart.length > 0 && (
        <button className="fixed bottom-10 left-10 bg-green-600 text-white px-10 py-5 rounded-full font-black shadow-2xl animate-bounce flex items-center gap-2">
          <Send size={20} /> שלח הזמנה לראמי ולמשרד ({cart.length})
        </button>
      )}
    </div>
  );
}

// קומפוננטת כרטיס מוצר חכמה
function ProductCard({ product, onAdd }: any) {
  const [sqm, setSqm] = useState(0);
  const neededQty = Math.ceil((sqm * product.consumption) / 25) || 0;

  return (
    <div className="bg-white rounded-[45px] overflow-hidden shadow-lg border border-gray-50 group hover:shadow-2xl transition-all duration-500">
      <div className="h-64 overflow-hidden relative">
        <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-blue-100 shadow-sm">
           <CheckCircle2 size={14} className="text-blue-600" />
           <span className="text-[10px] font-black text-gray-800 uppercase italic">מקור מאומת: {product.brand}</span>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div>
          <h3 className="text-2xl font-black text-gray-900 leading-none">{product.name}</h3>
          <p className="text-xs font-bold text-gray-400 mt-2">זמן ייבוש ממוצע: {product.drying}</p>
        </div>

        {/* מחשבון מ"ר מובנה */}
        <div className="bg-blue-50 p-6 rounded-[35px] border border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <CalcIcon size={18} className="text-blue-600" />
            <span className="text-[10px] font-black text-blue-800 uppercase">מחשבון תצרוכת חכם</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <input 
              type="number" 
              placeholder="כמה מ''ר?" 
              className="w-1/2 p-3 rounded-xl border-none font-bold text-center"
              onChange={(e) => setSqm(Number(e.target.value))}
            />
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase">כמות נדרשת</p>
              <p className="text-xl font-black text-blue-700 italic">{neededQty} יחידות</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => onAdd(product, neededQty || 1)}
          className="w-full bg-gray-900 text-white py-5 rounded-[25px] font-black flex items-center justify-center gap-2 hover:bg-blue-600 active:scale-95 transition-all"
        >
          <ShoppingCart size={20} /> הוסף לסל הזמנה
        </button>
      </div>
    </div>
  );
}
