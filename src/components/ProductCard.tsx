'use client';
import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { Plus, Minus, Info, Wrench, Droplets, Trash2, Edit3 } from 'lucide-react';

interface Props {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (sku: string) => void;
}

export default function ProductCard({ product, onEdit, onDelete }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`bg-white rounded-[2rem] border transition-all duration-300 ${isOpen ? 'border-emerald-500 shadow-xl' : 'border-slate-200 shadow-sm'}`}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl border flex items-center justify-center overflow-hidden">
            <img src={product.image || "/api/placeholder/200/200"} className="object-cover w-full h-full" alt={product.name} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-lg">{product.name}</h3>
            <p className="text-slate-400 text-xs font-bold">SKU: {product.sku}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => onEdit(product)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><Edit3 size={18}/></button>
          <button onClick={() => onDelete(product.sku)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-3 rounded-full ${isOpen ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}
          >
            {isOpen ? <Minus size={20}/> : <Plus size={20}/>}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-[2rem] animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-black text-emerald-700 flex items-center gap-2 text-sm"><Info size={16}/> מאפיינים</h4>
              <ul className="text-xs space-y-1 text-slate-600 font-bold">
                {product.features?.map((f, i) => <li key={i}>• {f}</li>) || <li>אין מאפיינים רשומים</li>}
              </ul>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="font-black text-slate-800 flex items-center gap-2 mb-3 text-sm"><Wrench size={16}/> הוראות יישום</h4>
              <div className="space-y-2">
                {product.instructions?.map((step, i) => (
                  <div key={i} className="flex gap-2 text-[11px] font-bold text-slate-500">
                    <span className="bg-slate-900 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] shrink-0">{i+1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
