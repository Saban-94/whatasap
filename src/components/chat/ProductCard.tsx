"use client";
import React, { useState } from "react";
import { Play, ShoppingCart, Plus, Minus } from "lucide-react";

export default function ProductCard({ name, imageUrl, specs, sku, notInInventory, onAddToOrder, onWatchTutorial }: any) {
  const [qty, setQty] = useState(1);

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 mt-2 text-right" dir="rtl">
      {imageUrl && <img src={imageUrl} alt={name} className="w-full h-44 object-cover" />}
      <div className="p-4 space-y-3">
        <h3 className="font-black text-lg text-gray-900">{name}</h3>
        <span className={`text-[10px] px-2 py-1 rounded font-black ${notInInventory ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          מק״ט: <span dir="ltr">{sku || "99999"}</span>
        </span>
        
        <div className="grid grid-cols-2 gap-3 border-y border-gray-50 py-3">
          <div><p className="text-gray-400 text-[10px] uppercase font-bold">צריכה למ״ר</p><p className="font-black text-sm" dir="ltr">{specs?.consumptionPerM2 || "—"}</p></div>
          <div><p className="text-gray-400 text-[10px] uppercase font-bold">זמן ייבוש</p><p className="font-black text-sm" dir="ltr">{specs?.dryingTime || "—"}</p></div>
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={onWatchTutorial} className="bg-gray-100 hover:bg-gray-200 py-2 rounded-lg font-black text-xs flex items-center justify-center gap-2">
            <Play size={14} fill="currentColor" /> צפה בהדרכה
          </button>
          <div className="flex items-center gap-2">
             <div className="flex items-center border rounded-lg bg-gray-50" dir="ltr">
                <button onClick={() => setQty(Math.max(1, qty-1))} className="p-2">-</button>
                <span className="w-8 text-center font-black">{qty}</span>
                <button onClick={() => setQty(qty+1)} className="p-2">+</button>
             </div>
             <button onClick={() => onAddToOrder(qty)} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg font-black text-sm flex items-center justify-center gap-2 shadow-sm">
                <ShoppingCart size={16} /> הוסף להזמנה
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
