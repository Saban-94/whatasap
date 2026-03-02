"use client";

import React from 'react';
import { ShoppingCart, Package, Tag, CheckCircle } from 'lucide-react';

interface ProductProps {
  product: {
    product_name: string;
    sku: string;
    price: number;
    description?: string;
    image_url?: string;
  };
}

export const ProductCard = ({ product }: ProductProps) => {
  return (
    <div className="my-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[30px] overflow-hidden shadow-2xl max-w-sm transition-all hover:scale-[1.02]">
      {product.image_url && (
        <div className="h-48 w-full bg-slate-100 dark:bg-slate-800 relative">
          <img 
            src={product.image_url} 
            alt={product.product_name}
            className="w-full h-full object-contain p-4"
          />
        </div>
      )}
      <div className="p-6 text-right" dir="rtl">
        <div className="flex justify-between items-start mb-2">
          <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase italic">
            SABAN STOCK
          </span>
          <span className="text-slate-400 text-[10px] font-mono">#{product.sku}</span>
        </div>
        
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
          {product.product_name}
        </h3>
        
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-3xl font-black text-blue-600">{product.price}</span>
          <span className="text-sm font-bold text-slate-500">₪ לפני מע"מ</span>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-green-500 text-sm font-bold">
            <CheckCircle size={16} />
            <span>זמין במלאי לאיסוף מיידי</span>
          </div>
          {product.description && (
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2 italic">
              {product.description}
            </p>
          )}
        </div>

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20">
          <ShoppingCart size={20} />
          להוספה להזמנה
        </button>
      </div>
    </div>
  );
};
