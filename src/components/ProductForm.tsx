'use client';
import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { X, Save, Package, Tag, Info } from 'lucide-react';

interface Props {
  initial?: Product;
  onCancel: () => void;
  onSubmit: (data: Product) => void;
}

export default function ProductForm({ initial, onCancel, onSubmit }: Props) {
  const [formData, setFormData] = useState<Product>(initial || {
    sku: '',
    name: '',
    description: '',
    category: '',
    image: '',
    features: [],
    instructions: [],
    stock: { quantity: 0, minThreshold: 5, unit: 'יח' }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] w-full max-w-2xl my-auto shadow-2xl border border-slate-100 overflow-hidden" dir="rtl">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              {initial ? <Tag className="text-blue-500" /> : <Package className="text-emerald-500" />}
              {initial ? 'עריכת מוצר' : 'הוספת מוצר ל-SabanOS'}
            </h2>
            <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 mb-2 mr-2">שם המוצר</label>
                <input 
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 font-bold focus:ring-2 ring-emerald-500/20 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 mb-2 mr-2">מק״ט (SKU)</label>
                <input 
                  required
                  disabled={!!initial}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 font-bold focus:ring-2 ring-emerald-500/20 outline-none disabled:opacity-50"
                  value={formData.sku}
                  onChange={e => setFormData({...formData, sku: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 mb-2 mr-2">קטגוריה</label>
              <input 
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 font-bold focus:ring-2 ring-emerald-500/20 outline-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 mb-2 mr-2">תיאור מוצר</label>
              <textarea 
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 font-bold focus:ring-2 ring-emerald-500/20 outline-none min-h-[100px]"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100">
               <h3 className="text-emerald-800 font-black text-sm mb-4">ניהול מלאי</h3>
               <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="number"
                    placeholder="כמות במלאי"
                    className="w-full bg-white border-none rounded-xl px-4 py-2 font-bold"
                    value={formData.stock?.quantity}
                    onChange={e => setFormData({...formData, stock: {...formData.stock!, quantity: Number(e.target.value)}})}
                  />
                  <input 
                    type="text"
                    placeholder="יחידת מידה (ק״ג/סט/יח)"
                    className="w-full bg-white border-none rounded-xl px-4 py-2 font-bold"
                    value={formData.stock?.unit}
                    onChange={e => setFormData({...formData, stock: {...formData.stock!, unit: e.target.value}})}
                  />
               </div>
            </div>
          </div>

          <div className="mt-10 flex gap-3">
            <button 
              type="submit"
              className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
            >
              <Save size={20}/> {initial ? 'עדכן שינויים' : 'שמור בבסיס הנתונים'}
            </button>
            <button type="button" onClick={onCancel} className="px-8 py-4 text-slate-400 font-bold hover:text-slate-600">ביטול</button>
          </div>
        </div>
      </form>
    </div>
  );
}
