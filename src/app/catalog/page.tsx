'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, ShieldCheck, ArrowRight, Package, Info } from 'lucide-react';
import Link from 'next/link';

// טעינת המוח המאוחד v2.0
import sabanUnifiedBrain from '@/data/saban_unified_v2_final.json';

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('הכל');

  // רשימת קטגוריות מהמוח
  const categories = ['הכל', ...Array.from(new Set(sabanUnifiedBrain.products.map((p: any) => p.category)))];

  // סינון חכם
  const filteredProducts = useMemo(() => {
    return sabanUnifiedBrain.products.filter((p: any) => {
      const matchesSearch = p.name.includes(searchTerm) || p.brand.includes(searchTerm);
      const matchesCategory = activeCategory === 'הכל' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pb-24 font-sans text-right">
      {/* Header יוקרתי */}
      <header className="bg-white p-6 rounded-b-[45px] shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="flex justify-between items-center mb-4">
          <Link href="/dashboard" className="text-gray-400"><ArrowRight size={24} /></Link>
          <h1 className="text-xl font-black text-gray-800 italic">קטלוג מומחה – ח. סבן</h1>
          <div className="w-6"></div>
        </div>
        
        {/* חיפוש וסינון */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="חפש מוצר, מותג או יישום..."
              className="w-full p-4 pr-12 bg-gray-50 rounded-2xl border-none font-bold shadow-inner"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  activeCategory === cat ? 'bg-[#1976D2] text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 gap-6">
          {filteredProducts.map((product: any, idx: number) => (
            <div key={idx} className="bg-white rounded-[35px] overflow-hidden shadow-sm border border-gray-100 flex flex-col">
              {/* תמונת מוצר */}
              <div className="h-48 bg-gray-50 flex items-center justify-center p-6 relative">
                 {product.image_url ? (
                   <img src={product.image_url} alt={product.name} className="h-full object-contain" />
                 ) : (
                   <Package size={48} className="text-gray-200" />
                 )}
                 <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-blue-600 shadow-sm uppercase">
                   {product.brand}
                 </div>
              </div>

              {/* תוכן טכני */}
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-black text-gray-800 leading-tight">{product.name}</h3>
                
                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                  <BookOpen size={14} />
                  <span>קטגוריה: {product.category} | יחידה: {product.unit}</span>
                </div>

                {/* טיפ המומחה מהמוח */}
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                  <ShieldCheck className="text-blue-600 mt-1 shrink-0" size={18} />
                  <p className="text-xs font-bold text-blue-900 leading-relaxed italic">
                    <span className="block text-[10px] uppercase tracking-wider mb-1">טיפ זהב מראמי:</span>
                    {product.expert_tip}
                  </p>
                </div>

                <Link href={`/order?search=${product.name}`} className="block w-full text-center bg-gray-900 text-white py-4 rounded-2xl font-black text-sm active:scale-95 transition-all">
                  הזמן מוצר זה למחסן
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
