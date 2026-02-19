'use client';
import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { X, Save } from 'lucide-react';

interface Props {
  initial?: Product;
  onCancel: () => void;
  onSubmit: (data: Product) => void;
}

export default function ProductForm({ initial, onCancel, onSubmit }: Props) {
  const [formData, setFormData] = useState<Partial<Product>>(initial || {
    sku: '', name: '', category: '', features: [], instructions: [],
    stock: { quantity: 0, minThreshold: 5 }
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-800">{initial ? 'עריכת מוצר' : 'הוספת מוצר חדש'}</h2>
            <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
            <div>
              <label className="block text-xs font-black text-slate-400 mb-2">שם המוצר</label>
              <input 
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 font-bold"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 mb-2">מק״ט (SKU)</label>
              <input 
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 font-bold"
                value={formData.sku}
                onChange={e => setFormData({...formData, sku: e.target.value})}
                disabled={!!initial}
              />
            </div>
            {/* ניתן להוסיף כאן עוד שדות כמו קטגוריה, מחיר וכו' */}
          </div>

          <div className="mt-10 flex gap-3">
            <button 
              onClick={() => onSubmit(formData as Product)}
              className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
            >
              <Save size={20}/> שמור מוצר ב-SabanOS
            </button>
            <button onClick={onCancel} className="px-8 py-4 text-slate-400 font-bold">ביטול</button>
          </div>
        </div>
      </div>
    </div>
  );
}
