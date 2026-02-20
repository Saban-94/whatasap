'use client';
import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

// הגדרת הממשק שחייב להיות תואם לקריאה מהסטודיו
interface ProductFormProps {
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

export default function ProductForm({ onClose, onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    stock_quantity: 0,
    unit: 'יח'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-[#202c33] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#C9A227]">הוספת מוצר חדש</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">שם המוצר</label>
            <input 
              required
              className="w-full bg-[#111b21] border-none rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#C9A227]"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">מק"ט (SKU)</label>
              <input 
                required
                className="w-full bg-[#111b21] border-none rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#C9A227]"
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">קטגוריה</label>
              <input 
                className="w-full bg-[#111b21] border-none rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#C9A227]"
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#C9A227] text-black font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'שמור מוצר'}
          </button>
        </form>
      </div>
    </div>
  );
}
