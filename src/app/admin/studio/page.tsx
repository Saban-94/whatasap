"use client";
import React, { useState, useEffect } from "react";
// שיניתי את Tool ל-Wrench כדי למנוע את השגיאה ב-Vercel
import { Plus, Minus, Info, Droplets, Wrench, CheckCircle, AlertCircle, ChevronDown, Loader2 } from "lucide-react";

export default function SabanStudioProfessional() {
  const [items, setItems] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/specs", { 
          method: "POST", 
          body: JSON.stringify({ mode: "studio" }) 
        });
        const data = await res.json();
        setItems(Array.isArray(data) ? data : data.inventory || []);
      } catch (e) {
        console.error("Load failed");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
      <span className="font-black text-slate-400">טוען קטלוג מקצועי - ח. סבן</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-800 font-heebo p-4 md:p-10" dir="rtl">
      <header className="max-w-5xl mx-auto mb-12 flex justify-between items-end border-b pb-6 border-slate-100">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">סטודיו מוצרים</h1>
          <p className="text-emerald-600 font-bold italic">SabanOS — Technical Catalog Builder</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg active:scale-95">
          <Plus size={20} /> הוסף מוצר חדש
        </button>
      </header>

      <div className="max-w-5xl mx-auto space-y-6">
        {items.map((product, idx) => {
          const id = product.barcode || product.sku || `item-${idx}`;
          const isExpanded = expandedId === id;

          return (
            <div key={id} className={`bg-white rounded-[2rem] border transition-all duration-300 ${isExpanded ? 'border-emerald-500 shadow-xl' : 'border-slate-200 shadow-sm hover:shadow-md'}`}>
              {/* Header המוצר - תמיד גלוי */}
              <div className="p-6 flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(id)}>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    <img 
                      src={product.image || `https://placehold.co/200x200?text=${product.name}`} 
                      className="object-cover w-full h-full" 
                      alt={product.name} 
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">{product.name}</h2>
                    <p className="text-slate-500 font-bold text-sm max-w-xl mt-1 line-clamp-1">
                      {product.description || "לחץ לצפייה במפרט טכני מלא, הוראות יישום ויתרונות"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">ברקוד: {id}</span>
                      {product.category && (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full">קטגוריה: {product.category}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-full transition-all duration-500 ${isExpanded ? 'bg-emerald-600 text-white rotate-180 shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                  {isExpanded ? <Minus size={24} /> : <Plus size={24} />}
                </div>
              </div>

              {/* פרטי מוצר מוסתרים - נפתחים בלחיצה */}
              {isExpanded && (
                <div className="p-8 bg-slate-50/50 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-heebo">
                    
                    {/* עמודה 1: מאפיינים ושימושים */}
                    <div className="space-y-8">
                      <div>
                        <h4 className="flex items-center gap-2 font-black text-emerald-700 mb-4 text-lg">
                          <Info size={20}/> מאפיינים ויתרונות
                        </h4>
                        <ul className="text-sm space-y-3 text-slate-700 font-bold leading-relaxed">
                          <li className="flex gap-2 items-start"><span className="text-emerald-500">✓</span> דו-רכיבי ומוכן לשימוש (נוזל פולימרי + אבקה).</li>
                          <li className="flex gap-2 items-start"><span className="text-emerald-500">✓</span> גמישות גבוהה: עמיד בשינויי טמפרטורה ומונע סדקים.</li>
                          <li className="flex gap-2 items-start"><span className="text-emerald-500">✓</span> הידבקות מעולה לבטון, טיח, לבנים ואבן.</li>
                          <li className="flex gap-2 items-start"><span className="text-emerald-500">✓</span> אטום למים אך נושם (מאפשר מעבר אדי מים).</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="flex items-center gap-2 font-black text-blue-700 mb-4 text-lg">
                          <Droplets size={20}/> שימושים עיקריים
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {["חדרים רטובים", "מרתפים", "מאגרי מים", "בריכות", "קירות תמך"].map(tag => (
                            <span key={tag} className="bg-white border border-blue-100 text-blue-700 px-4 py-2 rounded-xl text-xs font-black shadow-sm tracking-wide">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* עמודה 2: הוראות יישום */}
                    <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-2 h-full bg-slate-900"></div>
                      <h4 className="flex items-center gap-2 font-black text-slate-900 mb-6 text-lg">
                        <Wrench size={20}/> הוראות יישום בסיסיות
                      </h4>
                      <div className="space-y-6">
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-md">1</div>
                          <div>
                            <p className="text-xs font-black text-slate-800 uppercase mb-1">הכנת השטח</p>
                            <p className="text-xs font-bold text-slate-500">תשתית נקייה, יציבה ולחה (ללא מים עומדים).</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-md">2</div>
                          <div>
                            <p className="text-xs font-black text-slate-800 uppercase mb-1">ערבוב</p>
                            <p className="text-xs font-bold text-slate-500">ערבוב רכיב A ו-B במערבל איטי עד לקבלת תערובת חלקה.</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-md">3</div>
                          <div>
                            <p className="text-xs font-black text-slate-800 uppercase mb-1">יישום</p>
                            <p className="text-xs font-bold text-slate-500">מריחת שתי שכבות שתי וערב (אופקי ואז אנכי).</p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
