"use client";
import React, { useState, useEffect } from "react";
import { Plus, Minus, Info, Droplets, Tool, CheckCircle, AlertCircle, ChevronDown } from "lucide-react";

export default function SabanStudioProfessional() {
  const [items, setItems] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // טעינת הקטלוג מה-API שבנינו
    fetch("/api/specs", { method: "POST", body: JSON.stringify({ mode: "studio" }) })
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white font-black text-emerald-600">טוען קטלוג מקצועי...</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-800 font-heebo p-4 md:p-10" dir="rtl">
      <header className="max-w-5xl mx-auto mb-12 flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900">סטודיו מוצרים</h1>
          <p className="text-emerald-600 font-bold italic">SabanOS — Technical Catalog Builder</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg">
          <Plus size={20} /> הוסף מוצר חדש
        </button>
      </header>

      <div className="max-w-5xl mx-auto space-y-6">
        {items.map((product) => (
          <div key={product.barcode} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
            {/* Header המוצר - תמיד גלוי */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-slate-50 rounded-2xl border flex items-center justify-center overflow-hidden">
                  <img src={product.image || "/api/placeholder/200/200"} className="object-cover w-full h-full" alt="" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{product.name}</h2>
                  <p className="text-slate-500 font-bold text-sm max-w-xl">{product.description || "לחץ על + למידע טכני מפורט"}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full">ברקוד: {product.barcode}</span>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full">מחלקה: {product.department}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => toggleExpand(product.barcode)}
                className={`p-4 rounded-full transition-all ${expandedId === product.barcode ? 'bg-emerald-600 text-white rotate-180' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
              >
                {expandedId === product.barcode ? <Minus size={24} /> : <Plus size={24} />}
              </button>
            </div>

            {/* פרטי מוצר מוסתרים - נפתחים בלחיצה */}
            {expandedId === product.barcode && (
              <div className="p-8 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-top duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* עמודה 1: מאפיינים ושימושים */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="flex items-center gap-2 font-black text-emerald-700 mb-3"><Info size={18}/> מאפיינים ויתרונות</h4>
                      <ul className="text-sm space-y-2 text-slate-600 font-bold">
                        {/* כאן יבואו נתונים מה-JSON */}
                        <li className="flex gap-2">• דו-רכיבי ומוכן לשימוש: ערכת נוזל ואבקה.</li>
                        <li className="flex gap-2">• גמישות: אינו נסדקת ועמידה בטמפרטורות קיצון.</li>
                        <li className="flex gap-2">• הידבקות מעולה לתשתיות בטון וטיח.</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="flex items-center gap-2 font-black text-blue-700 mb-3"><Droplets size={18}/> שימושים עיקריים</h4>
                      <div className="flex flex-wrap gap-2">
                        {["חדרים רטובים", "מרתפים", "מאגרי מים", "בריכות"].map(tag => (
                          <span key={tag} className="bg-white border border-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* עמודה 2: הוראות יישום */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200">
                    <h4 className="flex items-center gap-2 font-black text-slate-800 mb-4"><Tool size={18}/> הוראות יישום בסיסיות</h4>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] shrink-0">1</div>
                        <p className="text-xs font-bold text-slate-500">הכנת תשתית נקייה, יציבה ולחה.</p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] shrink-0">2</div>
                        <p className="text-xs font-bold text-slate-500">ערבוב מכני איטי של רכיב A ו-B עד לקבלת תערובת אחידה.</p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] shrink-0">3</div>
                        <p className="text-xs font-bold text-slate-500">מריחת שתי שכבות (אופקי ואנכי) בהפרש של 2-6 שעות.</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
