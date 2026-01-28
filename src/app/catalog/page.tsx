'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { Search, BookOpen, ShieldCheck, ArrowRight, Package, ShoppingCart, Tag } from 'lucide-react';
import Link from 'next/link';

// מוח מאוחד מוטמע למניעת שגיאות Build
const UNIFIED_PRODUCTS = [
  { brand: "Sika", name: "SikaTop Seal-107 איטום צמנטי", category: "איטום", unit: "סט 25 ק״ג", image: "https://isr.sika.com/content/israel/main/he/solutions/construction/waterproofing/_jcr_content/product-image.img.jpg/107.jpg", tip: "שתי שכבות חובה. אל תשכח סרט איטום לפינות!" },
  { brand: "תרמוקיר", name: "פלסטומר 603 (AD 603) דבק קרמיקה", category: "דבקים", unit: "שק 25 ק״ג", image: "https://www.termokir.co.il/wp-content/uploads/2015/03/603-AD.jpg", tip: "לאריחים גדולים חובה מריחה כפולה (גב אריח ותשתית)." },
  { brand: "כרמית", name: "טיח 710 ליישור קירות", category: "טיח", unit: "שק 25 ק״ג", image: "https://www.mr-fix.co.il/wp-content/uploads/2016/01/710.jpg", tip: "על בטון חלק חובה פריימר מקשר לפני יישום הטיח." },
  { brand: "אורבונד", name: "לוח גבס ירוק (עמיד לחות)", category: "גבס", unit: "לוח (3 מ״ר)", image: "https://www.orbond.co.il/images/products/green-board.jpg", tip: "בחדרים רטובים השתמש רק בברגים מושחרים עמידי חלודה." },
  { brand: "נירלט", name: "שליכט צבעוני EXTRA M150", category: "שליכט", unit: "דלי 24 ק״ג", image: "https://nirlat.com/wp-content/uploads/2018/05/M150.jpg", tip: "חובה ליישם פריימר X בגוון השליכט 24 שעות מראש." }
];

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('הכל');

  const categories = ['הכל', 'איטום', 'דבקים', 'טיח', 'גבס', 'שליכט'];

  const filteredProducts = useMemo(() => {
    return UNIFIED_PRODUCTS.filter((p) => {
      const matchesSearch = p.name.includes(searchTerm) || p.brand.includes(searchTerm);
      const matchesCategory = activeCategory === 'הכל' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pb-24 font-sans text-right">
      <header className="bg-white p-6 rounded-b-[45px] shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard" className="bg-gray-50 p-3 rounded-2xl text-gray-400"><ArrowRight size={24} /></Link>
          <div className="text-center">
             <h1 className="text-xl font-black text-gray-800 italic">קטלוג מומחה – ח. סבן</h1>
             <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">מידע טכני מסונכרן</p>
          </div>
          <div className="w-10"></div>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="חפש מוצר או יישום..."
              className="w-full p-4 pr-12 bg-gray-50 rounded-2xl border-none font-bold shadow-inner text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar font-bold">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] whitespace-nowrap transition-all ${
                  activeCategory === cat ? 'bg-[#1976D2] text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="p-6 grid grid-cols-1 gap-8 max-w-5xl mx-auto">
        {filteredProducts.map((product, idx) => (
          <div key={idx} className="bg-white rounded-[40px] shadow-sm border border-gray-50 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-500">
            <div className="h-48 bg-[#F9F9F9] flex items-center justify-center p-8 relative">
              <img src={product.image} alt={product.name} className="h-full object-contain group-hover:scale-105 transition-transform" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-blue-600 border border-blue-50">
                {product.brand}
              </div>
            </div>

            <div className="p-7 space-y-4 text-right">
              <h3 className="text-lg font-black text-gray-800 leading-tight">{product.name}</h3>
              <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                <span className="flex items-center gap-1"><Package size={14}/> {product.unit}</span>
                <span className="flex items-center gap-1"><BookOpen size={14}/> {product.category}</span>
              </div>

              <div className="bg-blue-50/50 p-4 rounded-[25px] border border-blue-100/50 flex items-start gap-3">
                <ShieldCheck className="text-blue-500 shrink-0 mt-1" size={18} />
                <p className="text-xs font-bold text-blue-900 italic">
                  <span className="block text-[9px] uppercase text-blue-400 mb-1 font-black">טיפ מומחה ח. סבן:</span>
                  {product.tip}
                </p>
              </div>

              <Link href={`/order?search=${encodeURIComponent(product.name)}`} className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-4 rounded-[20px] font-black text-sm hover:bg-blue-600 transition-all">
                <ShoppingCart size={18} /> הזמן עכשיו
              </Link>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
