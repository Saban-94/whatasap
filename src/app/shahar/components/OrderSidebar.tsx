'use client';
import React from 'react';
import { X, ShoppingCart, Package, CheckCircle2, Trash2 } from 'lucide-react';

interface OrderSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  cart: any[];
  setCart: (cart: any[]) => void;
}

export default function OrderSidebar({ isOpen, setIsOpen, cart, setCart }: OrderSidebarProps) {
  const totalItems = cart.reduce((acc, curr) => acc + curr.qty, 0);

  const updateQty = (sku: string, delta: number) => {
    setCart(cart.map(item => 
      item.sku === sku ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  const removeItem = (sku: string) => {
    setCart(cart.filter(item => item.sku !== sku));
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 border-r border-[#202c33] bg-[#111b21] flex flex-col ${isOpen ? 'w-80 md:w-96' : 'w-0 overflow-hidden border-none'}`}>
      <header className="h-16 bg-[#202c33] p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 text-[#C9A227]">
          <ShoppingCart size={20} />
          <span className="font-bold text-sm uppercase tracking-wider">הזמנה חדשה</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
            <Package size={60} className="mb-4" />
            <p>הסל ריק</p>
            <p className="text-xs">דבר עם גימני כדי להוסיף מוצרים</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.sku} className="bg-[#202c33] rounded-xl p-4 border border-[#2a3942] relative group">
              <div className="flex justify-between items-start mb-2">
                <p className="font-bold text-sm leading-tight ml-4">{item.name}</p>
                <button onClick={() => removeItem(item.sku)} className="text-gray-500 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-3 bg-[#111b21] rounded-lg p-1">
                  <button className="w-8 h-8 flex items-center justify-center bg-[#2a3942] rounded hover:bg-[#C9A227] hover:text-black transition-colors" onClick={() => updateQty(item.sku, 1)}>+</button>
                  <span className="text-sm font-bold w-10 text-center">{item.qty} יח'</span>
                  <button className="w-8 h-8 flex items-center justify-center bg-[#2a3942] rounded hover:bg-[#C9A227] hover:text-black transition-colors" onClick={() => updateQty(item.sku, -1)}>-</button>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">מק"ט: {item.sku}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="p-4 bg-[#202c33] border-t border-gray-800">
          <div className="flex justify-between mb-4">
            <span className="text-sm">סה"כ פריטים:</span>
            <span className="font-bold text-[#C9A227]">{totalItems}</span>
          </div>
          <button className="w-full bg-[#C9A227] text-black font-black py-4 rounded-xl hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg">
            <CheckCircle2 size={20} /> שלח הזמנה לוואטסאפ
          </button>
        </div>
      )}
    </div>
  );
}
