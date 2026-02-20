'use client';
import { FileText, Package, Trash2, Edit3, ExternalLink } from 'lucide-react';

export default function ProductCard({ product, onEdit, onDelete }: any) {
  // חילוץ תמונה ראשונה מהמערך או שימוש בתמונת ברירת מחדל
  const imageUrl = product.media_urls?.[0] || 'https://via.placeholder.com/300?text=SABAN+LOGISTICS';

  return (
    <div className="bg-[#202c33] rounded-3xl overflow-hidden border border-gray-800 hover:border-[#C9A227] transition-all group shadow-lg">
      <div className="relative h-48 w-full bg-[#111b21]">
        <img src={imageUrl} alt={product.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform" />
        <div className="absolute top-3 left-3 bg-[#C9A227] text-black text-[10px] font-black px-2 py-1 rounded-lg shadow-md">
          {product.category}
        </div>
      </div>

      <div className="p-5 text-right" dir="rtl">
        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-[#C9A227] text-xs font-mono mb-3">מק"ט: {product.sku}</p>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">{product.description}</p>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <button onClick={onEdit} className="p-2 bg-gray-800 rounded-xl hover:bg-gray-700 text-white transition-colors">
              <Edit3 size={18} />
            </button>
            <button onClick={onDelete} className="p-2 bg-red-900/30 rounded-xl hover:bg-red-900/50 text-red-500 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
          
          {product.pdf_url && (
            <a href={product.pdf_url} target="_blank" className="flex items-center gap-2 text-[#C9A227] hover:underline text-sm font-bold">
              מפרט טכני <FileText size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
