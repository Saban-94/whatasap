'use client';
import React, { useState } from 'react';
// התיקון: החלפנו את calculator ב-Calculator (אות גדולה)
import { ShoppingCart, Calculator as CalcIcon, CheckCircle2, Info, Send, Search, Trash2 } from 'lucide-react';

export default function SabanCatalog() {
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // דוגמה למוצרים (במציאות המידע יישאב מה-JSON המאומת)
  const products = [
    { 
      id: '19107', 
      name: 'סיקה 107 אפור (25 ק"ג)', 
      brand: 'Sika', 
      price: 185, 
      image: 'https://i.postimg.cc/76dMJmFd/bqrwb.gif',
      drying: '4-6 שעות',
      consumption: 2.0 // ק"ג למ"ר
    },
    { 
      id: '17140', 
      name: 'רובה מאפי 140 (5 ק"ג)', 
      brand: 'MAPEI', 
      price: 45, 
      image: 'https://i.postimg.cc/76dMJmFd/bqrwb.gif',
      drying: '24 שעות',
      consumption: 0.5
    }
  ];

  const addToCart = (product: any, qty: number) => {
    if (qty <= 0) return;
    setCart([...cart, { ...product, qty }]);
  };

  const filteredProducts = products.filter(p => 
    p.name.includes(searchTerm) || p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 text-right font-sans pb-32" dir="rtl">
      
      {/* Header קטלוג VIP */}
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 italic uppercase tracking-tighter">קטלוג מומחה - ח. סבן</h1>
          <p className="text-blue-600 font-bold tracking-widest text-xs uppercase mt-1">Saban Verified Logistics Catalog</p>
        </div>
        
        <div className="relative w-full md:w-80">
           <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           <input 
            className="w-full p-4 pr-12 rounded-2xl bg-white shadow-sm border-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800"
            placeholder="חפש סיקה, מלט, רובה..."
            onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </header>

      {/* רשת המוצרים */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} onAdd={addToCart} />
        ))}
      </div>

      {/* באר הזמנה צף (Cart Summary) */}
      {cart.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-8 py-6 rounded-[35px] shadow-2xl flex items-center gap-8 z-[100] border border-white/10 backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-blue-400 italic">הזמנה נוכחית</span>
            <span className="text-xl font-black">{cart.length} פריטים בסל</span>
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20">
            <Send size={18} /> שלח הזמנה לראמי
          </button>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onAdd }: any) {
  const [sqm, setSqm] = useState<number | string>('');
  const neededQty = sqm ? Math.ceil((Number(sqm) * product.consumption) / 25) : 0;

  return (
    <div className="bg-white rounded-[50px] overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 group transition-all duration-500 flex flex-col h-full">
      <div className="h-64 overflow-hidden relative">
        <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={product.name} />
        <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm border border-gray-100">
           <CheckCircle2 size={14} className="text-blue-600" />
           <span className="text-[10px] font-black text-gray-800 uppercase italic tracking-tighter">מותג מאומת: {product.brand}</span>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <div className="mb-6">
          <h3 className="text-2xl font-black text-gray-900 leading-tight mb-2">{product.name}</h3>
          <div className="flex gap-4">
             <span className="text-[10px] font-bold bg-gray-50 px-3 py-1 rounded-full text-gray-500 uppercase italic">ייבוש: {product.drying}</span>
             <span className="text-[10px] font-bold bg-blue-50 px-3 py-1 rounded-full text-blue-600 uppercase italic tracking-tight">{product.brand} PRO</span>
          </div>
        </div>

        {/* מחשבון תצרוכת חכם */}
        <div className="bg-gray-50 p-6 rounded-[35px] mb-8 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <CalcIcon size={16} className="text-blue-600" />
            <span className="text-[10px] font-black text-gray-400 uppercase italic">מחשבון תצרוכת {product.brand}</span>
          </div>
          <div className="flex justify-between items-center gap-6">
            <input 
              type="number" 
              placeholder="כמה מ''ר?" 
              className="w-full p-4 rounded-2xl border-none font-bold text-center text-gray-800 shadow-inner focus:ring-2 focus:ring-blue-500"
              value={sqm}
              onChange={(e) => setSqm(e.target.value)}
            />
            <div className="text-left min-w-[80px]">
              <p className="text-[9px] font-black text-gray-400 uppercase leading-none">שקים נדרשים</p>
              <p className="text-2xl font-black text-blue-700 italic">{neededQty}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => onAdd(product, neededQty || 1)}
          className="w-full mt-auto bg-gray-900 text-white py-5 rounded-[25px] font-black flex items-center justify-center gap-3 hover:bg-blue-600 active:scale-95 transition-all shadow-xl"
        >
          <ShoppingCart size={20} /> הוסף לסל
        </button>
      </div>
    </div>
  );
}
