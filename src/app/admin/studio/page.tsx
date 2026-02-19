"use client";
import React, { useState, useEffect } from "react";
import { Save, Plus, Trash2, CheckCircle, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";

export default function SabanStudioLight() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" }); // ה"מלשינון"

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch("/api/specs", { method: "POST", body: JSON.stringify({ mode: "studio" }) });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.inventory || []);
    } catch (e) {
      logStatus("error", "שגיאה בטעינת המלאי");
    } finally {
      setLoading(false);
    }
  };

  const logStatus = (type: "success" | "error", msg: string) => {
    setStatus({ type, message: msg });
    setTimeout(() => setStatus({ type: "", message: "" }), 5000);
  };

  const handleSave = async () => {
    logStatus("error", "Vercel בסביבת JSON לא ניתן לערוך קובץ - יש לחבר בסיס נתונים (Supabase)");
    // כאן בעתיד תבוא הקריאה ל-Database
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white text-emerald-600"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-heebo p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header - Light Design */}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-800">ניהול קטלוג - ח. סבן</h1>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">Saban Logistics Studio</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-slate-50 transition-all">
              <Plus size={20} /> מוצר חדש
            </button>
            <button onClick={handleSave} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all">
              <Save size={20} /> שמור שינויים
            </button>
          </div>
        </header>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all relative group">
              <button className="absolute top-4 left-4 text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-50">
                   {item.image ? <img src={item.image} className="object-cover w-full h-full" /> : <ImageIcon className="text-slate-300" />}
                </div>
                <div>
                  <input className="font-black text-lg text-slate-800 outline-none focus:text-emerald-600 w-full" defaultValue={item.name} />
                  <div className="text-[10px] font-bold text-slate-400">ברקוד: {item.barcode || "N/A"}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <label className="block text-[10px] font-black text-slate-400 mb-1">נתוני צריכה</label>
                  <input className="w-full bg-transparent font-bold text-sm outline-none" defaultValue={item.specs?.consumptionPerM2 || item.consumption} />
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <label className="block text-[10px] font-black text-slate-400 mb-1">קישור לתמונה/מדיה</label>
                  <input className="w-full bg-transparent font-bold text-xs text-blue-600 outline-none" defaultValue={item.image || item.media?.imageUrl} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* המלשינון (Status Logger) */}
        {status.message && (
          <div className={`fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-bounce z-50 ${
            status.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"
          }`}>
            {status.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-black text-sm">{status.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
