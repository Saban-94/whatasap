'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { Search, BookOpen, ShieldCheck, ArrowRight, Package, ShoppingCart, Tag } from 'lucide-react';
import Link from 'next/link';

// נתונים מוטמעים (המוח של ח. סבן)
const PRODUCTS = [
  { brand: "Sika", name: "SikaTop Seal-107", category: "איטום", unit: "סט 25 ק״ג", image: "https://isr.sika.com/content/israel/main/he/solutions/construction/waterproofing/_jcr_content/product-image.img.jpg/107.jpg", tip: "שתי שכבות חובה. אל תשכח סרט איטום לפינות!" },
  { brand: "תרמוקיר", name: "פלסטומר 603 (AD 603)", category: "דבקים", unit: "שק 25 ק״ג", image: "https://www.termokir.co.il/wp-content/uploads/2015/03/603-AD.jpg", tip: "לאריחים גדולים חובה מריחה כפולה." },
  { brand: "אורבונד", name: "לוח גבס ירוק", category: "גבס", unit: "יחידה (3 מ״ר)", image: "https://www.orbond.co.il/images/products/green-board.jpg", tip: "בחדרים רטובים השתמש בברגים מושחרים." },
  { brand: "נירלט", name: "שליכט צבעוני EXTRA M150", category: "שליכט", unit: "דלי 24 ק״ג", image: "https://nirlat.com/wp-content/uploads/2018/05/M150.jpg", tip: "חובה פריימר X בגוון השליכט." }
];

export default function CatalogPage() {
  const [query, setQuery] = useState('');

  const filtered = PRODUCTS.filter(p => 
    p.name.includes(query) || p.brand.includes(query) || p.category.includes(query)
  );

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] text-right font-sans pb-20">
      {/* Header מעוצב */}
      <header className="bg-white px-6 pt-12 pb-8 rounded-b-[50px] shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard" className="bg-gray-50 p-3 rounded-2xl text-gray-400 hover:text-blue-600 transition-colors">
            <ArrowRight size={24} />
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter italic">קטלוג מומחה</h1>
            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.2em]">H. SABAN LOGISTICS</p>
          </div>
          <div className="w-12"></div>
        </div>

        {/* Search Bar פרימיום */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          <input 
            type="text"
            placeholder="חפש חומר, מותג או קטגוריה..."
            className="w-full p-5 pr-14 bg-gray-50 rounded-[25px] border-none font-bold text-gray-700 shadow-inner focus:ring-2 focus:ring-blue-100 transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </header>

      {/* רשימת מוצרים */}
      <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {filtered.map((product, idx) => (
          <div key={idx} className="bg-white rounded-[40px] shadow-sm border border-gray-50 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-500">
            {/* תמונת מוצר */}
            <div className="h-56 bg-[#F9F9F9] flex items-center justify-center p-10 relative">
              <img src={product.image} alt={product.name} className="h-full object-contain group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{product.brand}</span>
              </div>
            </div>

            {/* פרטים טכניים */}
            <div className="p-8 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-black text-gray-800 leading-tight">{product.name}</h3>
                <Tag size={18} className="text-gray-200" />
              </div>
              
              <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                <span className="flex items-center gap-1"><Package size={14}/> {product.unit}</span>
                <span className="flex items-center gap-1"><BookOpen size={14}/> {product.category}</span>
              </div>

              {/* בועת המוח של ראמי */}
              <div className="bg-blue-50/50 p-5 rounded-[25px] border border-blue-100/50 flex items-start gap-3">
                <ShieldCheck className="text-blue-500 shrink-0 mt-1" size={20} />
                <p className="text-xs font-bold text-blue-900 leading-relaxed italic">
                  <span className="block text-[9px] uppercase tracking-tighter text-blue-400 mb-1 font-black">טיפ מומחה ח. סבן:</span>
                  {product.tip}
                </p>
              </div>

              <Link href={`/order?search=${product.name}`} className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-5 rounded-[22px] font-black text-sm hover:bg-blue-600 transition-all shadow-lg shadow-gray-200">
                <ShoppingCart size={18} /> הזמן עכשיו למחסן
              </Link>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
