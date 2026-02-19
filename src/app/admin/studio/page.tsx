"use client";
import React, { useState } from "react";
import inventoryData from "@/data/inventory.json";
import { Save, Plus, Edit3, Image as ImageIcon } from "lucide-react";

export default function InventoryStudio() {
  const [products, setProducts] = useState(inventoryData);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-heebo" dir="rtl">
      <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
        <div>
          <h1 className="text-3xl font-black text-emerald-800">SabanOS Inventory Studio</h1>
          <p className="text-gray-500 font-bold">נהל את הזיכרון של המערכת</p>
        </div>
        <button className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg hover:bg-emerald-700 transition-all">
          <Save size={20} /> שמור שינויים
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {p.media?.imageUrl ? (
                  <img src={p.media.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="text-gray-300" />
                )}
              </div>
              <span className="text-[10px] font-black bg-gray-100 px-2 py-1 rounded">SKU: {p.sku}</span>
            </div>
            
            <input 
              className="w-full font-black text-lg mb-2 outline-none focus:text-emerald-600" 
              defaultValue={p.name} 
            />
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-bold">צריכה:</span>
                <input className="text-left font-black w-2/3 outline-none" defaultValue={p.specs.consumptionPerM2} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-bold">ייבוש:</span>
                <input className="text-left font-black w-2/3 outline-none" defaultValue={p.specs.dryingTime} />
              </div>
            </div>

            <button className="w-full py-2 bg-gray-50 text-gray-500 rounded-lg text-xs font-black group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors flex items-center justify-center gap-2">
              <Edit3 size={14} /> ערוך פרטי מדיה
            </button>
          </div>
        ))}
        
        <button className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center text-gray-400 hover:border-emerald-300 hover:text-emerald-500 transition-all">
          <Plus size={40} />
          <span className="font-black mt-2">הוסף מוצר חדש לזיכרון</span>
        </button>
      </div>
    </div>
  );
}
