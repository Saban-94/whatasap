"use client";
import React, { useState, useEffect } from "react";
import { Search, Package, Plus, ExternalLink, RefreshCw, LayoutGrid } from "lucide-react";

export default function SabanStudio() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/specs", {
      method: "POST",
      body: JSON.stringify({ mode: "studio" }),
    })
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.barcode?.includes(searchTerm)
  );

  if (loading) return <div className="h-screen bg-[#0B0E11] flex items-center justify-center text-emerald-500 animate-pulse font-black">טוען קטלוג סבן...</div>;

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white font-heebo p-6" dir="rtl">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">SABAN STUDIO</h1>
          <p className="text-gray-400 mt-2 font-bold">ניהול קטלוג מוצרים ומדיה חכמה</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-3 text-gray-500" size={20} />
            <input 
              placeholder="חיפוש מהיר במלאי..." 
              className="bg-[#15191C] border border-gray-800 rounded-xl py-3 pr-11 pl-4 w-full md:w-80 outline-none focus:border-emerald-500 transition-all font-bold"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-500 p-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20">
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-[#15191C] p-6 rounded-2xl border border-gray-800 flex items-center gap-4">
          <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-500"><Package /></div>
          <div>
            <div className="text-2xl font-black">{items.length}</div>
            <div className="text-gray-500 text-sm font-bold">מוצרים רשומים</div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item, i) => (
          <div key={i} className="bg-[#15191C] rounded-3xl border border-gray-800 overflow-hidden hover:border-emerald-500/50 transition-all group">
            <div className="aspect-square relative bg-gray-900 flex items-center justify-center">
              <img 
                src={item.image || `https://placehold.co/400x400/15191c/emerald?text=${item.name}`} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                alt={item.name}
              />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black border border-white/10">
                {item.barcode || "NO-SKU"}
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="font-black text-lg mb-1 truncate">{item.name}</h3>
              <p className="text-gray-500 text-xs font-bold mb-4 h-8 line-clamp-2">{item.category} | {item.supplier}</p>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-black/40 p-2 rounded-lg text-center">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">מחלקה</div>
                  <div className="text-xs font-black text-emerald-400">{item.department || "כללי"}</div>
                </div>
                <div className="bg-black/40 p-2 rounded-lg text-center">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">מלאי</div>
                  <div className="text-xs font-black text-blue-400">זמין</div>
                </div>
              </div>

              <button className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2">
                ערוך מדיה ופרטים <ExternalLink size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
