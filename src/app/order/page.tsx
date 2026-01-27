'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useMemo, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, addDoc, server_timestamp } from "firebase/firestore";
import { 
  Calculator, Truck, ShoppingCart, Send, ArrowRight, Search, 
  Plus, Minus, Trash2, ShieldCheck, Info, Package, AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';

// המוח הטכני המאוחד (100 מוצרים + נוסחאות)
import sabanData from '@/data/saban_final_brain_v2.json';

export default function SmartOrderPage() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [calcInput, setCalcInput] = useState({ sqm: '', thickness: '5' });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [expertMsg, setExpertMsg] = useState<string | null>(null);

  // מנוע חיפוש חכם ב-100 המוצרים
  const filteredProducts = useMemo(() => {
    if (!search) return [];
    return sabanData.products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.brand.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 5);
  }, [search]);

  // מחשבון כמויות דינמי המבוסס על נוסחאות הפאטץ' 🧠
  const calculateNeededQty = (product: any) => {
    const area = parseFloat(calcInput.sqm);
    if (!area || isNaN(area)) return 1;

    const formula = product.technical?.consumption_formula;
    if (!formula) return 1;

    let result = 1;
    if (formula.type === "kg_by_area_and_thickness_mm") {
      const thickness = parseFloat(calcInput.thickness) || 5;
      const totalKg = area * thickness * (formula.parameters.consumption_kg_per_m2_per_mm || 1.4);
      result = Math.ceil(totalKg / 25); // שק ממוצע
    } else if (formula.type === "kg_by_area_and_yield_per_unit") {
      // עבור שליכט/צבע - מחושב לפי כושר כיסוי של הדלי
      const yieldPerUnit = formula.parameters.yield_m2_per_unit || 12;
      result = Math.ceil(area / yieldPerUnit);
    } else if (formula.type === "pieces_by_area_and_layers") {
      // עבור גבס (ברגים)
      result = Math.ceil(area * (formula.parameters.screws_per_m2_per_layer || 10));
    }
    return result;
  };

  const handleAddToCart = (product: any) => {
    const qty = calculateNeededQty(product);
    const existing = cart.find(item => item.name === product.name);
    
    if (existing) {
      setCart(cart.map(item => item.name === product.name ? { ...item, qty: item.qty + qty } : item));
    } else {
      setCart([...cart, { ...product, qty }]);
    }

    // הפעלת חוק המוצר המשלים 🫂
    if (product.linked_products_logic?.length > 0) {
      setExpertMsg(`שחר, שים לב: עבור ${product.name} המוח ממליץ להוסיף ${product.linked_products_logic[0].recommend.join(', ')}`);
      setTimeout(() => setExpertMsg(null), 7000);
    }
    
    setSearch('');
    setSelectedProduct(null);
  };

  const submitOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "tasks"), {
        client: "שחר שאול",
        items: cart.map(i => `${i.name} (x${i.qty})`).join(', '),
        status: "חדש",
        timestamp: new Date()
      });
      alert("הזמנה נשלחה בהצלחה ל-365 ולצוות! 🚀");
      setCart([]);
    } catch (e) { alert("שגיאה בשליחה."); }
    finally { setLoading(false); }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pb-32 font-sans text-right">
      
      {/* Header יוקרתי */}
      <header className="bg-white p-6 rounded-b-[45px] shadow-sm flex justify-between items-center sticky top-0 z-50 border-b border-gray-50">
        <Link href="/dashboard" className="text-gray-400 p-2"><ArrowRight size={24} /></Link>
        <div className="text-center">
          <h1 className="text-xl font-black text-gray-800 tracking-tight italic">ח. סבן – מומחה החומרים</h1>
          <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">מנוע חישוב וסנכרון 365</p>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="p-6 space-y-6">
        
        {/* מחשבון שטח צף */}
        <div className="saban-card bg-blue-50 border-blue-200 shadow-inner">
          <div className="flex items-center gap-2 mb-3">
             <Calculator className="text-blue-600" size={18} />
             <span className="text-sm font-black text-blue-900">מחשבון שטח עבודה:</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="number" 
              placeholder="כמות מ״ר" 
              className="p-4 rounded-2xl border-none font-black text-xl shadow-sm"
              value={calcInput.sqm}
              onChange={e => setCalcInput({...calcInput, sqm: e.target.value})}
            />
            <input 
              type="number" 
              placeholder="עובי (מ״מ)" 
              className="p-4 rounded-2xl border-none font-black text-xl shadow-sm"
              value={calcInput.thickness}
              onChange={e => setCalcInput({...calcInput, thickness: e.target.value})}
            />
          </div>
        </div>

        {/* חיפוש מוצרים */}
        <div className="relative">
          <Search className="absolute right-4 top-5 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="איזה מוצר לחשב?"
            className="w-full p-5 pr-14 bg-white rounded-3xl shadow-sm border-none font-bold text-lg"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* תוצאות חיפוש עם "טיפ זהב" */}
        {filteredProducts.map((p: any, idx) => (
          <div key={idx} className="saban-card bg-white hover:bg-blue-50/50 transition-all cursor-pointer" onClick={() => handleAddToCart(p)}>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-black text-gray-800 text-base">{p.name}</h4>
              <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-lg font-bold">{p.brand}</span>
            </div>
            {calcInput.sqm && (
              <div className="flex items-center gap-2 text-green-600 font-black text-xs animate-pulse mb-2">
                <Package size={14} /> המלצת המוח: {calculateNeededQty(p)} {p.unit}
              </div>
            )}
            <p className="text-[10px] text-gray-400 leading-tight italic">{p.expert_tip}</p>
          </div>
        ))}

        {/* התראת מומחה צפה */}
        {expertMsg && (
          <div className="bg-[#FFF9E6] p-5 rounded-[25px] border border-yellow-100 flex items-center gap-4 animate-bounce">
            <ShieldCheck className="text-yellow-600" size={24} />
            <p className="text-xs font-bold text-yellow-800 leading-relaxed">{expertMsg}</p>
          </div>
        )}

        {/* סל הזמנה סופי */}
        {cart.length > 0 && (
          <section className="saban-card bg-white border-t-8 border-[#1976D2] shadow-2xl">
            <h3 className="font-black text-lg text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingCart size={20} /> סיכום הזמנה חכמה:
            </h3>
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                  <p className="text-[10px] text-gray-400">{item.brand}</p>
                </div>
                <div className="flex items-center gap-3">
                   <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-xl font-black italic">x{item.qty}</span>
                   <button onClick={() => setCart(cart.filter(c => c.name !== item.name))} className="text-red-300 hover:text-red-500"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
            <button 
              onClick={submitOrder}
              disabled={loading}
              className="btn-huge bg-[#1976D2] text-white mt-6 shadow-blue-200"
            >
              {loading ? "מעבד נתונים..." : "שלח הזמנה מדויקת לביצוע"}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
