"use client";
import React from "react";

export default function OrderSidebar({ items, onRemove, onQtyChange }: any) {
  const totalItems = items.reduce((acc: number, it: any) => acc + it.qty, 0);

  return (
    <div className="flex h-full flex-col bg-white border-r" dir="rtl">
      <div className="p-5 border-b bg-gray-50/50">
        <h2 className="font-black text-xl">סיכום הזמנה</h2>
        <p className="text-xs text-gray-500 font-bold">{totalItems} יחידות בסל</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F8FA]">
        {items.map((it: any) => (
          <div key={it.sku} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <p className="font-black text-sm">{it.name}</p>
            <div className="flex justify-between items-center mt-2">
              <span className={`text-[10px] font-black ${it.sku === "99999" ? "text-red-600" : "text-gray-400"}`}>
                מק״ט: <span dir="ltr">{it.sku}</span>
              </span>
              <button onClick={() => onRemove(it.sku)} className="text-red-500 text-xs font-bold hover:underline">הסר</button>
            </div>
          </div>
        ))}
      </div>
      <div className="p-5 border-t">
        <button className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all">
          שליחה למחלקת הזמנות ח. סבן
        </button>
      </div>
    </div>
  );
}
