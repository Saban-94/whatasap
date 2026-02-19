"use client";
import React, { useState, useEffect } from "react";
import { Save, Plus, Edit3, Image as ImageIcon, Loader2 } from "lucide-react";

export default function InventoryStudio() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // שליפת הנתונים מה-API במקום ייבוא ישיר למניעת שגיאות Build
  useEffect(() => {
    async function loadInventory() {
      try {
        const res = await fetch('/api/specs', { 
            method: 'POST', 
            body: JSON.stringify({ query: "GET_ALL_INVENTORY" }) // נטפל בזה ב-API
        });
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : data.inventory || []);
      } catch (e) {
        console.error("Failed to load inventory");
      } finally {
        setLoading(false);
      }
    }
    loadInventory();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-10 font-heebo" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Saban Studio</h1>
            <p className="text-slate-500 font-bold mt-1">ניהול מלאי וזיכרון AI - ח. סבן</p>
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-emerald-200 transition-all active:scale-95">
            <Save size={20} /> שמור שינויים במערכת
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((p, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-400 transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden">
                  {p.media?.imageUrl || p.image ? (
                    <img src={p.media?.imageUrl || p.image} alt="" className="w-full h-full object-cover" 
                         onError={(e:any) => e.target.src = 'https://placehold.co/200x200?text=No+Image'} />
                  ) : (
                    <ImageIcon className="text-slate-300" size={32} />
                  )}
                </div>
                <div className="text-left">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Barcode / SKU</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg text-xs">{p.barcode || p.sku || 'N/A'}</span>
                </div>
              </div>
              
              <input 
                className="w-full font-black text-xl text-slate-900 mb-4 outline-none focus:text-emerald-600 bg-transparent" 
                defaultValue={p.name} 
              />
              
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold text-xs">צריכה למ"ר:</span>
                  <input className="bg-transparent text-left font-black text-sm w-1/2 outline-none border-b border-transparent focus:border-emerald-300" defaultValue={p.specs?.consumptionPerM2 || p.consumption} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold text-xs">זמן ייבוש:</span>
                  <input className="bg-transparent text-left font-black text-sm w-1/2 outline-none border-b border-transparent focus:border-emerald-300" defaultValue={p.specs?.dryingTime || p.dryingTime} />
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  <Edit3 size={14} /> ערוך פרטים
                </button>
                <button className="w-12 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-100 transition-colors">
                  <ImageIcon size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
