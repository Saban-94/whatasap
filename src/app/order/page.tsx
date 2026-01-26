'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { Truck, ShoppingCart, Send, ArrowRight, Search, Plus, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';

// פונקציית ברירת המחדל שחייבת להיות מיוצאת (מתקן את שגיאת ה-Build)
export default function OrderPage() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userName] = useState('שחר שאול'); // המוח יזהה לפי ה-Login

  const form = {
    project: "גלגל המזלות 73",
    deliveryType: "פריקה עם מנוף"
  };

  // שליפת מוצרים אמיתית מהמאגר
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        setAllProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("שגיאה בשליפת מוצרים:", e);
      }
    };
    loadProducts();
  }, []);

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  // שליחה אמיתית לסגירת מעגל
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("הסל ריק");
    
    setLoading(true);
    try {
      // 1. שמירה ב-Firebase (סוגר מעגל לדשבורד)
      await addDoc(collection(db, "tasks"), {
        client: userName,
        project: form.project,
        items: cart.map(i => `${i.name} (x${i.qty})`).join(', '),
        status: "חדש",
        timestamp: serverTimestamp(),
        deliveryType: form.deliveryType
      });

      // 2. שליחה ל-365 (Power Automate)
      const flowUrl = "https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0828f74ee7e44228b96c93eab728f280/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lgdg1Hw--Z35PWOK6per2K02fql76m_WslheLXJL-eA";
      
      await fetch(flowUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: userName,
          project: form.project,
          order_details: cart.map(i => `${i.name} x${i.qty}`).join(', ')
        })
      });

      alert("הזמנה נשלחה בהצלחה ל-365 ולנהגים! 🎉");
      setCart([]);
    } catch (err) {
      alert("שגיאה בשליחה. בדוק חיבור אינטרנט.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pb-24 font-sans text-right">
      {/* Header יוקרתי */}
      <header className="bg-white p-6 rounded-b-[40px] shadow-sm border-b border-gray-100 flex justify-between items-center">
        <Link href="/dashboard" className="text-gray-400"><ArrowRight size={24} /></Link>
        <h1 className="text-xl font-black text-gray-800">הזמנת חומרים - {form.project}</h1>
        <div className="w-6"></div>
      </header>

      <main className="p-6 space-y-6">
        {/* חיפוש מוצרים */}
        <div className="relative">
          <Search className="absolute right-4 top-4 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="חפש מוצר (גבס, מלט, חול...)"
            className="w-full p-4 pr-12 bg-white rounded-2xl shadow-sm border-none focus:ring-2 focus:ring-blue-400 font-bold"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* תוצאות חיפוש - המוח סורק */}
        <div className="grid grid-cols-1 gap-3">
          {allProducts.filter(p => p.name.includes(search)).slice(0, 4).map(product => (
            <div key={product.id} className="saban-card flex justify-between items-center bg-white">
              <div>
                <p className="font-black text-gray-800">{product.name}</p>
                <p className="text-xs text-gray-400">מחיר מחירון: {product.price || 'לפי הסכם'}</p>
              </div>
              <button 
                onClick={() => addToCart(product)}
                className="bg-blue-50 p-3 rounded-xl text-blue-600 active:scale-90 transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* סל קניות צף */}
        {cart.length > 0 && (
          <section className="saban-card bg-white border-t-4 border-blue-500 shadow-xl">
            <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-gray-800">
              <ShoppingCart size={20} /> הסל של {userName}
            </h3>
            <div className="space-y-3 mb-6">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="font-bold text-gray-700">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-black italic">x{item.qty}</span>
                    <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-red-400"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="btn-huge bg-[#1976D2] text-white"
            >
              {loading ? "שולח נתונים..." : <><Send size={20} /> שלח הזמנה לביצוע</>}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
