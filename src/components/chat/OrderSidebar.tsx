"use client";
import React from "react";
import { Trash2, MessageCircle, ShoppingBag } from "lucide-react";

interface OrderItem {
  name: string;
  qty: number;
  sku?: string;
  specs?: {
    consumptionPerM2?: string;
  };
}

interface OrderSidebarProps {
  items: OrderItem[];
  onRemove: (sku: string) => void;
}

export default function OrderSidebar({ items, onRemove }: OrderSidebarProps) {
  const WHATSAPP_NUMBER = "972500000000"; // תעדכן כאן את המספר של המשרד

  const sendOrderToWhatsApp = () => {
    if (items.length === 0) return;

    let message = `*הזמנה חדשה מ-SabanOS* 🏗️\n`;
    message += `--------------------------\n`;
    
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      message += `   כמות: ${item.qty}\n`;
      message += `   מק"ט: ${item.sku || "כללי"}\n`;
      message += `--------------------------\n`;
    });

    message += `\n*סה"כ פריטים:* ${items.length}\n`;
    message += `*נא לאשר קבלת הזמנה.*`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="h-full flex flex-col bg-white font-heebo" dir="rtl">
      <div className="p-6 border-b bg-emerald-600 text-white shadow-md">
        <h2 className="flex items-center gap-2 font-black text-xl">
          <ShoppingBag size={24} /> סל הזמנה
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ShoppingBag size={48} className="mx-auto mb-2 opacity-20" />
            <p className="font-bold">הסל ריק כרגע</p>
          </div>
        ) : (
          items.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-200 transition-all shadow-sm">
              <div className="flex-1">
                <p className="font-black text-sm text-gray-900">{item.name}</p>
                <p className="text-xs text-emerald-600 font-bold">כמות: {item.qty}</p>
              </div>
              <button 
                onClick={() => onRemove(item.sku || item.name)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="p-4 border-t bg-gray-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <button
            onClick={sendOrderToWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
          >
            <MessageCircle size={24} fill="currentColor" />
            שלח הזמנה לווטסאפ
          </button>
          <p className="text-[10px] text-center mt-3 text-gray-500 font-bold">ההזמנה תישלח ישירות למחלקת המכירות</p>
        </div>
      )}
    </div>
  );
}
