'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { 
  Truck, ShoppingCart, Send, ArrowRight, Search, 
  Plus, Minus, Trash2, ShieldCheck, Info, AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

// ייבוא בסיס הנתונים המאוחד (בפרויקט אמיתי נטען מה-JSON שהעלית)
import sabanData from '@/data/saban_materials_expert_brain_100_products.json';

export default function SmartOrderPage() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userName] = useState('שחר שאול');
  const [expertMsg, setExpertMsg] = useState<string | null>(null);

  // סינון מוצרים מה-DB המאוחד (100 מוצרים)
  const filteredProducts = useMemo(() => {
    if (!search) return [];
    return sabanData.products.filter(p => 
      p.name.includes(search) || 
      p.brand.includes(search) || 
      p.category.includes(search)
    ).slice(0, 6);
  }, [search]);

  // פונקציית הוספה עם לוגיקה של "מוצר משלים" 🧠
  const handleAddToCart = (product: any) => {
    const existing = cart.find(item => item.name === product.name);
    
    if (existing) {
      setCart(cart.map(item => item.name === product.name ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }

    // הפעלת חוקי המומחה מה-JSON
    if (product.linked_products_logic && product.linked_products_logic.length > 0) {
      setExpertMsg(`שחר, שים לב: עבור ${product.name} מומלץ להוסיף: ${product.linked_products_logic.join(', ')} לחיבוק מושלם 🫂`);
      setTimeout(() => setExpertMsg(null), 6000);
    }
  };

  const calculateTotal = () => cart.reduce((acc, item) => acc + (item.qty * (item.price || 0)), 0);

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      // 1. שמירה ב-Firebase (סגירת מעגל לנהגים)
      await addDoc(collection(db, "tasks"), {
        client: userName,
        project: "גלגל המזלות 73",
        items: cart.map(i => `${i.name} (x${i.qty} ${i.unit})`).join(', '),
        status: "חדש",
        timestamp: serverTimestamp(),
      });

      // 2. שליחה ל-365 (ה-Flow של גליה)
      const flowUrl = "https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0828f74ee7e44228b96c93eab728f280/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lgdg1Hw--Z35PWOK6per2K02fql76m_WslheLXJL-eA";
      
      await fetch(flowUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: userName,
          details: cart.map(i => `${i.name} x${i.qty}`).join(', '),
          source: "Smart PWA Saban"
        })
      });

      alert("ההזמנה נשלחה בהצלחה לכל המערכות! 🎉");
      setCart([]);
    } catch (e) {
      alert("שגיאה בשליחה. נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pb-32 font-sans text-right">
      
      {/* HEADER המערכת */}
      <header className="bg-white p-6 rounded-b-[40px] shadow-sm border-b border-gray-100 flex justify-between items-center sticky top-0 z-50">
        <Link href="/dashboard" className="text-gray-400 p-2"><ArrowRight size={24} /></Link>
        <div className="text-center">
          <h1 className="text-xl font-black text-gray-800 tracking-tight">ח. סבן – יצירת הזמנה</h1>
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">מלאי בזמן אמת מול המחסן</p>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="p-6 space-y-6">
        
        {/* חיפוש מוצר חכם */}
        <div className="relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>
          <input 
            type="text"
            placeholder="חפש לפי שם / מק״ט / מותג..."
            className="w-full p-5 pr-14 bg-white rounded-3xl shadow-sm border-none focus:ring-4 focus:ring-blue-100 font-bold text-lg transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* תוצאות חיפוש מבוססות מוח */}
        {filteredProducts.length > 0 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
            {filteredProducts.map((p: any, idx) => (
              <div key={idx} className="saban-card flex items-center gap-4 bg-white hover:bg-blue-50/50 cursor-pointer" onClick={() => handleAddToCart(p)}>
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100">
                  {p.image_url ? <img src={p.image_url} alt={p.name} className="object-contain" /> : <Truck size={24} className="text-gray-300" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-gray-800 text-sm leading-tight">{p.name}</h4>
                  <p className="text-[10px] text-blue-600 font-bold">{p.brand} | {p.unit}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Plus size={20} /></div>
              </div>
            ))}
          </div>
        )}

        {/* הודעת מומחה צפה 🧠 */}
        {expertMsg && (
          <div className="bg-[#FFF9E6] p-5 rounded-[25px] border border-yellow-100 flex items-center gap-4 animate-bounce">
            <div className="bg-white p-2 rounded-xl shadow-sm text-yellow-600"><ShieldCheck size={20} /></div>
            <p className="text-xs font-bold text-yellow-800 leading-relaxed">{expertMsg}</p>
          </div>
        )}

        {/* סיכום הזמנה (Cart) */}
        {cart.length > 0 && (
          <section className="saban-card bg-white border-t-8 border-[#1976D2] shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-gray-800 flex items-center gap-2">
              <ShoppingCart size={20} className="text-blue-600" /> הפריטים שלך:
            </h3>
            <div className="divide-y divide-gray-50">
              {cart.map((item, i) => (
                <div key={i} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                    <p className="text-[10px] text-gray-400 italic">{item.expert_tip?.slice(0, 40)}...</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => {
                      const newQty = Math.max(1, item.qty - 1);
                      setCart(cart.map(c => c.name === item.name ? {...c, qty: newQty} : c));
                    }} className="bg-gray-100 p-1 rounded-md text-gray-500"><Minus size={16} /></button>
                    <span className="font-black text-blue-600 w-6 text-center">{item.qty}</span>
                    <button onClick={() => {
                      setCart(cart.map(c => c.name === item.name ? {...c, qty: c.qty + 1} : c));
                    }} className="bg-gray-100 p-1 rounded-md text-gray-500"><Plus size={16} /></button>
                    <button onClick={() => setCart(cart.filter(c => c.name !== item.name))} className="mr-2 text-red-300"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100">
               <div className="flex justify-between items-center mb-6">
                 <span className="font-bold text-gray-400">סה״כ פריטים: {cart.length}</span>
                 <span className="text-xl font-black text-gray-800 italic">מוכן לשילוח 🚛</span>
               </div>
               <button 
                onClick={handleSubmit}
                disabled={loading}
                className="btn-huge bg-[#1976D2] text-white"
               >
                 {loading ? "מעבד הזמנה..." : <><Send size={22} /> שלח הזמנה לביצוע</>}
               </button>
            </div>
          </section>
        )}

        {/* דף הדרכה קטן למטה */}
        <div className="text-center opacity-30 flex flex-col items-center gap-2 pt-10">
          <Info size={16} />
          <p className="text-[10px] font-bold">המערכת מסונכרנת מול המלאי של ראמי - ח. סבן</p>
        </div>
      </main>
    </div>
  );
}
