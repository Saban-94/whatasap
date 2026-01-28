'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { 
  Calculator, ShoppingCart, Send, Search, Plus, Trash2, 
  ShieldCheck, Package, Info, ArrowRight, Construction 
} from 'lucide-react';
import Link from 'next/link';

// המוח המאוחד v2.0
import sabanUnifiedBrain from '@/data/saban_unified_v2_final.json';

export default function UnifiedSabanApp() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [calcInput, setCalcInput] = useState({ sqm: '', thickness: '5' });
  const [expertMsg, setExpertMsg] = useState<string | null>(null);

  // חיפוש חכם שסורק גם את הטריגרים של החוקים
  const filteredProducts = useMemo(() => {
    if (!search) return [];
    const term = search.toLowerCase();
    return sabanUnifiedBrain.products.filter((p: any) => 
      p.name.toLowerCase().includes(term) || 
      p.brand.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    ).slice(0, 5);
  }, [search]);

  // פונקציית החישוב המקצועית (עבודה שחורה ללא מגע אדם) 🧠
  const calculateNeededQty = (product: any) => {
    const sqm = parseFloat(calcInput.sqm);
    if (!sqm) return 1;

    // שליפת לוגיקת החישוב מתוך המוח
    const logic = product.technical?.expert_logic || {};
    
    // חישוב גבס PRO
    if (product.category === 'גבס') {
      if (product.name.includes('לוח')) return Math.ceil(sqm / 3);
      if (product.name.includes('ניצב')) return Math.ceil(sqm / 0.6);
      if (product.name.includes('בורג')) return Math.ceil(sqm * 10);
      return 1;
    }

    // חישוב איטום/טיח לפי ק"ג למ"ר
    const logicKey = Object.keys(logic)[0];
    if (logicKey && logic[logicKey].includes('ק"ג')) {
      const factor = parseFloat(logic[logicKey]) || 1.4;
      return Math.ceil((sqm * factor) / 25); // חלקי שק 25 ק"ג
    }

    return 1;
  };

  const handleAddToCart = (product: any) => {
    const qty = calculateNeededQty(product);
    setCart([...cart, { ...product, qty }]);
    
    // הקפצת חוק המומחה (Expert Tip)
    if (product.expert_tip) {
      setExpertMsg(product.expert_tip);
      setTimeout(() => setExpertMsg(null), 8000);
    }
    
    setSearch('');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pb-32 font-sans text-right">
      
      {/* HEADER יוקרתי */}
      <header className="bg-white p-6 rounded-b-[45px] shadow-sm flex justify-between items-center sticky top-0 z-50 border-b border-gray-50">
        <Link href="/dashboard" className="text-gray-400 p-2"><ArrowRight size={24} /></Link>
        <div className="text-center">
          <h1 className="text-xl font-black text-gray-800 tracking-tight italic">ח. סבן – מוח מאוחד v2.0</h1>
          <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">מנוע גבס PRO ואיטום הנדסי</p>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="p-6 space-y-6">
        
        {/* מחשבון שטח וקונסטרוקציה */}
        <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3 text-blue-600 font-black text-sm">
            <Calculator size={18} /> חישוב כמויות לאתר:
          </div>
          <input 
            type="number" 
            placeholder="כמה מטר רבוע (מ״ר)?" 
            className="w-full p-4 rounded-2xl bg-[#FDFBF7] border-none font-black text-2xl text-blue-600 focus:ring-0 shadow-inner"
            value={calcInput.sqm}
            onChange={e => setCalcInput({...calcInput, sqm: e.target.value})}
          />
        </div>

        {/* חיפוש מהיר */}
        <div className="relative">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="חפש מוצר או קטגוריה..."
            className="w-full p-5 pr-14 bg-white rounded-3xl shadow-sm border-none font-bold text-lg"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* תוצאות מבוססות Ruleset */}
        <div className="space-y-3">
          {filteredProducts.map((p: any, idx) => (
            <div key={idx} className="bg-white p-5 rounded-[30px] shadow-sm border border-gray-100 flex justify-between items-center transition-all active:scale-95" onClick={() => handleAddToCart(p)}>
              <div>
                <h4 className="font-black text-gray-800 text-sm leading-tight">{p.name}</h4>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg font-bold">{p.brand}</span>
                  <span className="text-[10px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-lg font-bold">{p.category}</span>
                </div>
                {calcInput.sqm && (
                  <p className="text-xs text-green-600 font-black mt-2 animate-pulse flex items-center gap-1">
                    <Package size={14} /> המלצת המוח: {calculateNeededQty(p)} יח׳
                  </p>
                )}
              </div>
              <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg"><Plus size={20} /></div>
            </div>
          ))}
        </div>

        {/* בועת מומחה (Expert Tip) */}
        {expertMsg && (
          <div className="bg-[#FFF9E6] p-5 rounded-[25px] border border-yellow-100 flex items-center gap-4 animate-in slide-in-from-bottom-2">
            <div className="bg-white p-2 rounded-xl shadow-sm text-yellow-600"><ShieldCheck size={24} /></div>
            <p className="text-xs font-bold text-yellow-800 leading-relaxed">{expertMsg}</p>
          </div>
        )}

        {/* סל הזמנה מאוחד */}
        {cart.length > 0 && (
          <section className="bg-white rounded-[40px] p-8 shadow-2xl border-t-8 border-[#1976D2] space-y-4">
            <h3 className="font-black text-xl text-gray-800 flex items-center gap-2">
              <ShoppingCart className="text-blue-600" size={24} /> סיכום הזמנה:
            </h3>
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                <div className="max-w-[70%]">
                  <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                  <p className="text-[10px] text-gray-400">מוצר משלים מומלץ: {item.linked_products_logic?.slice(0, 2).join(', ')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-xl font-black italic">x{item.qty}</span>
                  <button onClick={() => setCart(cart.filter(c => c.name !== item.name))} className="text-red-300"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
            <button className="w-full bg-[#1976D2] text-white py-5 rounded-2xl font-black text-xl shadow-xl flex items-center justify-center gap-3 mt-6">
               שלח הזמנה מדויקת לראמי <Send size={20} />
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
