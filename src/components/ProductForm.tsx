'use client';
import React, { useState } from 'react';
import { X, Loader2, Image as ImageIcon, Video, FileText } from 'lucide-react';

interface Props {
  product?: any; // אם קיים, אנחנו במצב עריכה
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ product, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    category: product?.category || '',
    stock_quantity: product?.stock_quantity || 0,
    unit: product?.unit || 'יח',
    description: product?.description || '',
    media_urls: product?.media_urls || [], // מערך לינקים
    pdf_url: product?.pdf_url || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const method = product ? 'PUT' : 'POST';
    const url = product ? `/api/products/${product.id}` : '/api/products';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Operation failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-[#202c33] w-full max-w-2xl rounded-3xl p-8 shadow-2xl border border-gray-700 my-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-[#C9A227]">{product ? 'עריכת מוצר' : 'מוצר חדש בסבן'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={28} /></button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* פרטים בסיסיים */}
          <div className="space-y-4">
            <input placeholder="שם המוצר" className="w-full bg-[#111b21] p-4 rounded-xl border-none text-white focus:ring-2 focus:ring-[#C9A227]" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            
            <input placeholder="מק״ט" className="w-full bg-[#111b21] p-4 rounded-xl border-none text-white focus:ring-2 focus:ring-[#C9A227]" 
              value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required />
            
            <div className="flex gap-2">
              <input type="number" placeholder="כמות" className="w-2/3 bg-[#111b21] p-4 rounded-xl border-none text-white focus:ring-2 focus:ring-[#C9A227]" 
                value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: Number(e.target.value)})} />
              <input placeholder="יחידה" className="w-1/3 bg-[#111b21] p-4 rounded-xl border-none text-white focus:ring-2 focus:ring-[#C9A227]" 
                value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
            </div>
          </div>

          {/* מדיה וקבצים */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><ImageIcon size={16}/> לינקים לתמונות/סרטונים (מופרד בפסיק)</div>
            <textarea 
              placeholder="הדבק לינקים כאן..."
              className="w-full bg-[#111b21] p-4 rounded-xl border-none text-white h-24 focus:ring-2 focus:ring-[#C9A227]"
              value={formData.media_urls.join(', ')}
              onChange={e => setFormData({...formData, media_urls: e.target.value.split(',').map(s => s.trim())})}
            />
            
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><FileText size={16}/> לינק לקובץ PDF</div>
            <input placeholder="https://..." className="w-full bg-[#111b21] p-4 rounded-xl border-none text-white focus:ring-2 focus:ring-[#C9A227]" 
              value={formData.pdf_url} onChange={e => setFormData({...formData, pdf_url: e.target.value})} />
          </div>

          <button disabled={loading} className="md:col-span-2 w-full bg-[#C9A227] text-black font-black py-5 rounded-2xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-3">
            {loading ? <Loader2 className="animate-spin" /> : 'עדכן מלאי סבן'}
          </button>
        </form>
      </div>
    </div>
  );
}
