'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { Truck, ShoppingCart, Send, ArrowRight, Search, Plus, Minus, Trash2, ShieldCheck, Calculator, Package } from 'lucide-react';
import Link from 'next/link';

// --- המוח המוטמע (במקום ייבוא חיצוני שגורם לשגיאה) ---
const sabanBrain = {
  products: [
    {
      brand: "תרמוקיר",
      name: "תרמוקיר 603 AD (פלסטומר 603) C2TE S1",
      category: "דבקים",
      unit: "שק 25 ק״ג",
      technical: {
        consumption_formula: {
          type: "kg_by_area_and_thickness_mm",
          parameters: { consumption_kg_per_m2_per_mm: 1.4 }
        }
      },
      expert_tip: "טיפ זהב: יישום בעובי 3-5 מ״מ מבטיח הדבקה מושלמת לפורצלן.",
      linked_products_logic: ["פריימר", "ספייסרים"]
    },
    {
      brand: "נירלט",
      name: "שליכט צבעוני EXTRA M150",
      category: "שליכט",
      unit: "דלי 24 ק״ג",
      technical: {
        consumption_formula: {
          type: "kg_by_area_and_yield_per_unit",
          parameters: { yield_m2_per_unit: 10.5 }
        }
      },
      expert_tip: "לתוצאה מקצועית: חובה ליישם פריימר X יממה לפני השליכט.",
      linked_products_logic: ["פריימר X", "ניילון הגנה"]
    },
    {
      brand: "אורבונד (Knauf)",
      name: "לוח גבס ירוק (עמיד לחות)",
      category: "גבס",
      unit: "יחידה (לוח)",
      technical: {
        consumption_formula: {
          type: "pieces_by_area_and_layers",
          parameters: { screws_per_m2_per_layer: 10 }
        }
      },
      expert_tip: "בחדרים רטובים יש להשתמש רק בברגים מושחרים עמידי חלודה.",
      linked_products_logic: ["ברגי גבס", "סרט שריון", "מרק גבס"]
    }
    // ניתן להוסיף כאן עוד מוצרים מה-JSON שלך
  ]
};

export default function SmartOrderPage() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [calcInput, setCalcInput] = useState({ sqm: '', thickness: '5' });
  const [expertMsg, setExpertMsg] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (!search) return [];
    return sabanBrain.products.filter(p => 
      p.name.includes(search) || p.brand.includes(search)
    ).slice(0, 5);
  }, [search]);

  const calculateNeededQty = (product: any) => {
    const area = parseFloat(calcInput.sqm);
    if (!area || isNaN(area)) return 1;
    const formula = product.technical?.consumption_formula;
    if (!formula) return 1;

    if (formula.type === "kg_by_area_and_thickness_mm") {
      const thick = parseFloat(calcInput.thickness) || 5;
      return Math.ceil((area * thick * 1.4) / 25);
    } 
    if (formula.type === "kg_by_area_and_yield_per_unit") {
      return Math.ceil(area / (formula.parameters.yield_m2_per_unit || 10));
    }
    if (formula.type === "pieces_by_area_and_layers") {
      return Math.ceil(area / 3); // לוח הוא ~3 מ"ר
    }
    return 1;
  };

  const handleAddToCart = (product: any) => {
    const qty = calculateNeededQty(product);
    setCart([...cart, { ...product, qty }]);
    if (product.linked_products_logic?.length) {
      setExpertMsg(`שחר, שים לב: עבור ${product.name} המוח ממליץ להוסיף ${product.linked_products_logic.join(', ')} 🫂`);
      setTimeout(() => setExpertMsg(null), 6000);
    }
    setSearch('');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pb-32 font-sans text-right">
      <header className="bg-white p-6 rounded-b-[45px] shadow-sm border-b border-gray-100 flex justify-between items-center sticky top-0 z-50">
        <Link href="/dashboard" className="text-gray-400"><ArrowRight size={24} /></Link>
        <div className="text-center">
          <h1 className="text-xl font-black text-gray-800">ח. סבן – מומחה החומרי בנין</h1>
          <p className="text-[10px] text-blue-500 font-bold tracking-widest uppercase">חישוב כמויות וסנכרון מלא</p>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="p-6 space-y-6">
        {/* מחשבון כמויות */}
        <div className="bg-blue-50 p-6 rounded-[35px] border border-blue-100 shadow-inner">
          <div className="flex items-center gap-2 mb-3 text-blue-800 font-black text-sm">
            <Calculator size={18} /> הזן שטח עבודה:
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="number" placeholder="כמות מ״ר" 
              className="p-4 rounded-2xl border-none font-black text-xl shadow-sm focus:ring-2 focus:ring-blue-400"
              value={calcInput.sqm} onChange={e => setCalcInput({...calcInput, sqm: e.target.value})}
            />
            <input 
              type="number" placeholder="עובי מ״מ" 
              className="p-4 rounded-2xl border-none font-black text-xl shadow-sm focus:ring-2 focus:ring-blue-400"
              value={calcInput.thickness} onChange={e => setCalcInput({...calcInput, thickness: e.target.value})}
            />
          </div>
        </div>

        {/* חיפוש */}
        <div className="relative">
          <Search className="absolute right-4 top-5 text-gray-400" size={20} />
          <input 
            type="text" placeholder="חפש מוצר (גבס, שליכט, 603...)" 
            className="w-full p-5 pr-14 bg-white rounded-3xl shadow-sm border-none font-bold text-lg"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* תוצאות חיפוש */}
        <div className="space-y-3">
          {filteredProducts.map((p, idx) => (
            <div key={idx} className="bg-white p-5 rounded-[30px] shadow-sm border border-gray-100 flex justify-between items-center" onClick={() => handleAddToCart(p)}>
              <div>
                <h4 className="font-black text-gray-800">{p.name}</h4>
                <p className="text-[10px] text-blue-500 font-bold">{p.brand} | {p.unit}</p>
                {calcInput.sqm && <p className="text-xs text-green-600 font-black mt-1 animate-pulse"><Package size={12} className="inline ml-1" /> המלצת המוח: {calculateNeededQty(p)} יח׳</p>}
              </div>
              <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg"><Plus size={20} /></div>
            </div>
          ))}
        </div>

        {/* הודעת מומחה */}
        {expertMsg && (
          <div className="bg-[#FFF9E6] p-5 rounded-[25px] border border-yellow-100 flex items-center gap-4 animate-bounce">
            <ShieldCheck className="text-yellow-600" size={24} />
            <p className="text-xs font-bold text-yellow-800 leading-relaxed">{expertMsg}</p>
          </div>
        )}

        {/* סל הזמנה */}
        {cart.length > 0 && (
          <section className="bg-white rounded-[40px] p-6 shadow-2xl border-t-8 border-[#1976D2]">
            <h3 className="font-black text-lg text-gray-800 mb-4 flex items-center gap-2"><ShoppingCart size={20} /> סיכום הזמנה חכמה:</h3>
            <div className="space-y-3 mb-6">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="font-bold text-gray-700 text-sm">{item.name}</span>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-xl font-black italic">x{item.qty}</span>
                </div>
              ))}
            </div>
            <button className="w-full bg-[#1976D2] text-white py-5 rounded-2xl font-black text-xl shadow-lg flex items-center justify-center gap-2">
              <Send size={20} /> שלח הזמנה מדויקת
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
