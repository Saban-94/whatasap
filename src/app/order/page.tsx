'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { 
  Calculator, ShoppingCart, Send, Search, Plus, Trash2, 
  ShieldCheck, Package, ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

// --- מוח מאוחד מוטמע (Unified Brain Embedded) למניעת שגיאות Build ---
const SABAN_BRAIN = {
  products: [
    { brand: "Sika", name: "SikaTop Seal-107", category: "איטום", unit: "סט 25 ק״ג", factor: 3, tip: "שתי שכבות חובה. אל תשכח סרט איטום לפינות!" },
    { brand: "תרמוקיר", name: "פלסטומר 603 (AD 603)", category: "דבקים", unit: "שק 25 ק״ג", factor: 1.4, tip: "לאריחים גדולים חובה מריחה כפולה (גב אריח ותשתית)." },
    { brand: "כרמית (מיסטר פיקס)", name: "טיח 710", category: "טיח", unit: "שק 25 ק״ג", factor: 1.6, tip: "על בטון חלק חובה פריימר מקשר לפני היישום." },
    { brand: "אורבונד", name: "לוח גבס ירוק", category: "גבס", unit: "יחידה (3 מ״ר)", factor: "gypsum", tip: "בחדרים רטובים השתמש רק בברגים מושחרים עמידי חלודה." },
    { brand: "נירלט", name: "שליכט צבעוני EXTRA M150", category: "שליכט", unit: "דלי 24 ק״ג", factor: 2.3, tip: "חובה ליישם פריימר X בגוון השליכט 24 שעות מראש." }
  ]
};

export default function UnifiedSabanApp() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [sqm, setSqm] = useState('');
  const [expertMsg, setExpertMsg] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (!search) return [];
    const term = search.toLowerCase();
    return SABAN_BRAIN.products.filter(p => 
      p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term)
    );
  }, [search]);

  const calculateQty = (product: any) => {
    const s = parseFloat(sqm);
    if (!s) return 1;
    if (product.factor === "gypsum") return Math.ceil(s / 3);
    return Math.ceil((s * product.factor) / 25);
  };

  const handleAddToCart = (p: any) => {
    const qty = calculateQty(p);
    setCart([...cart, { ...p, qty }]);
    if (p.tip) {
      setExpertMsg(p.tip);
      setTimeout(() => setExpertMsg(null), 6000);
    }
    setSearch('');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pb-32 font-sans text-right">
      <header className="bg-white p-6 rounded-b-[45px] shadow-sm flex justify-between items-center sticky top-0 z-50 border-b border-gray-100">
        <Link href="/dashboard" className="text-gray-400 p-2"><ArrowRight size={24} /></Link>
        <div className="text-center">
          <h1 className="text-xl font-black text-gray-800 italic">ח. סבן – הזמנה חכמה</h1>
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">מוח מאוחד מבוסס מומחיות</p>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="p-6 space-y-6">
        <div className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-100">
          <label className="text-xs font-black text-gray-400 mb-3 block flex items-center gap-2">
            <Calculator size={16} className="text-blue-500" /> הזן שטח עבודה (מ״ר):
          </label>
          <input 
            type="number" 
            className="w-full p-4 rounded-2xl bg-[#FDFBF7] border-none font-black text-2xl text-blue-600 shadow-inner"
            value={sqm} onChange={e => setSqm(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="relative">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" placeholder="חפש חומר (דבק, גבס, סיקה...)" 
            className="w-full p-5 pr-14 bg-white rounded-3xl shadow-sm border-none font-bold text-lg"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {filteredProducts.map((p, i) => (
            <div key={i} className="bg-white p-5 rounded-[30px] shadow-sm border border-gray-100 flex justify-between items-center" onClick={() => handleAddToCart(p)}>
              <div>
                <h4 className="font-black text-gray-800 text-sm">{p.name}</h4>
                <p className="text-[10px] text-blue-500 font-bold uppercase">{p.brand} | {p.unit}</p>
                {sqm && <p className="text-xs text-green-600 font-black mt-2 animate-pulse"><Package size={14} className="inline ml-1" /> המלצת המוח: {calculateQty(p)} יח׳</p>}
              </div>
              <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg"><Plus size={20} /></div>
            </div>
          ))}
        </div>

        {expertMsg && (
          <div className="bg-[#FFF9E6] p-5 rounded-[25px] border border-yellow-100 flex items-center gap-4 animate-bounce">
            <ShieldCheck className="text-yellow-600" size={24} />
            <p className="text-xs font-bold text-yellow-800 leading-relaxed">{expertMsg}</p>
          </div>
        )}

        {cart.length > 0 && (
          <section className="bg-white rounded-[40px] p-8 shadow-2xl border-t-8 border-[#1976D2] space-y-4">
            <h3 className="font-black text-lg text-gray-800 flex items-center gap-2 font-black italic"><ShoppingCart size={20} /> סיכום הזמנה לאתר:</h3>
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                <span className="font-bold text-gray-700 text-sm">{item.name}</span>
                <div className="flex items-center gap-3">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-xl font-black italic text-sm">x{item.qty}</span>
                  <button onClick={() => setCart(cart.filter(c => c.name !== item.name))} className="text-red-300"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
            <button className="w-full bg-[#1976D2] text-white py-5 rounded-2xl font-black text-xl shadow-xl flex items-center justify-center gap-2 mt-4">
              <Send size={20} /> שלח הזמנה לביצוע
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
