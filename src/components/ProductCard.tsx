'use client';
import React from 'react';
import { FileText, Trash2, Edit3, Clock, LayoutGrid } from 'lucide-react';

interface ProductCardProps {
  product: any;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const imageUrl = product.media_urls?.[0] || 'https://via.placeholder.com/400x300?text=SABAN+LOGISTICS';

  return (
    <div className="bg-[#202c33] rounded-3xl overflow-hidden border border-gray-800 hover:border-[#C9A227] transition-all group shadow-xl">
      {/* תמונה ומדיה */}
      <div className="relative h-44 w-full bg-[#111b21] flex items-center justify-center">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute top-3 left-3 bg-[#C9A227] text-black text-[10px] font-black px-2 py-1 rounded-lg shadow-md uppercase">
          {product.category || 'כללי'}
        </div>
      </div>

      {/* תוכן המוצר */}
      <div className="p-5 text-right" dir="rtl">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[#C9A227] text-xs font-mono font-bold tracking-wider">SKU: {product.sku}</p>
        </div>
        <h3 className="text-lg font-black text-white mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-gray-400 text-xs mb-4 line-clamp-2 h-8 leading-relaxed">
          {product.description || 'אין תיאור זמין למוצר זה.'}
        </p>
        
        {/* תעודת זהות טכנית - ה"מוח" של הכרטיס */}
        <div className="grid grid-cols-2 gap-2 my-4 border-y border-gray-800/50 py-3">
          <div className="text-center border-l border-gray-800/50">
            <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
              <LayoutGrid size={12} />
              <span className="text-[10px] font-bold uppercase">כיסוי ממוצע</span>
            </div>
            <span className="text-white font-black text-sm">{product.coverage_per_meter || '--'}</span>
            <span className="text-gray-500 text-[10px] mr-1">ק"ג/מ"ר</span>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
              <Clock size={12} />
              <span className="text-[10px] font-bold uppercase">זמן ייבוש</span>
            </div>
            <span className="text-white font-black text-sm">{product.drying_time_hours || '--'}</span>
            <span className="text-gray-500 text-[10px] mr-1">שעות</span>
          </div>
        </div>

        {/* כפתורי פעולה */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-2">
            <button onClick={onEdit} className="p-2 bg-gray-800 rounded-xl hover:bg-[#C9A227] hover:text-black text-white transition-all shadow-md active:scale-90">
              <Edit3 size={18} />
            </button>
            <button onClick={onDelete} className="p-2 bg-red-900/20 rounded-xl hover:bg-red-600 text-red-500 hover:text-white transition-all shadow-md active:scale-90">
              <Trash2 size={18} />
            </button>
          </div>
          
          {product.pdf_url && (
            <a 
              href={product.pdf_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-[#C9A227]/10 text-[#C9A227] px-3 py-1.5 rounded-xl hover:bg-[#C9A227] hover:text-black transition-all text-xs font-black shadow-sm"
            >
              מפרט PDF <FileText size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
