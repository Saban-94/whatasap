"use client";
import React, { useState } from "react";
import { Play, ShoppingCart, Plus, Minus } from "lucide-react";

interface ProductCardProps {
  name: string;
  imageUrl?: string;
  specs?: {
    consumptionPerM2?: string;
    dryingTime?: string;
  };
  sku?: string;
  onAddToOrder: (qty: number) => void;
  onWatchTutorial?: () => void;
}

export default function ProductCard({ name, imageUrl, specs, sku, onAddToOrder, onWatchTutorial }: ProductCardProps) {
  const [qty, setQty] = useState(1);

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 mt-2 shadow-sm text-right" dir="rtl">
      {imageUrl && <img src={imageUrl} alt={name} className="w-full h-40 object-cover" />}
      <div className="p-4 space-y-3">
        <h3 className="font-black text-lg text-gray-900">{name}</h3>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-black border border-emerald-100">
          מק״ט: <span dir="ltr">{sku || "99999"}</span>
        </span>
        
        <div className="grid grid-cols-2 gap-2 py-2 border-y border-gray-50">
          <div className="text-xs font-black text-gray-500 italic">צריכה: <span className="text-black not-italic">{specs?.consumptionPerM2 || "—"}</span></div>
          <div className="text-xs font-black text-gray-500 italic">ייבוש: <span className="text-black not-italic">{specs?.dryingTime || "—"}</span></div>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button onClick={onWatchTutorial} className="bg-blue-50 text-blue-600 py-2 rounded-lg font-black text-xs flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors">
            <Play size={14} fill="currentColor" /> צפה בהדרכה
          </button>
          
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center border rounded-lg bg-gray-50" dir="ltr">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-1 px-2 text-emerald-700 font-bold hover:bg-gray-100 rounded-l-lg">-</button>
              <span className="w-8 text-center font-black text-sm">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-1 px-2 text-emerald-700 font-bold hover:bg-gray-100 rounded-r-lg">+</button>
            </div>
            <button 
              onClick={() => onAddToOrder(qty)}
              className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg font-black text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <ShoppingCart size={16} /> הוסף לסל
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
