'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, ShieldCheck, ArrowRight, Package, Info } from 'lucide-react';
import Link from 'next/link';

// --- נתוני המוח המאוחד (מוטמעים למניעת שגיאות Build) ---
const UNIFIED_PRODUCTS = [
  {
    brand: "Sika",
    name: "SikaTop Seal-107 איטום צמנטי",
    category: "איטום",
    unit: "סט 25 ק״ג",
    image_url: "https://isr.sika.com/content/israel/main/he/solutions/construction/waterproofing/_jcr_content/product-image.img.jpg/107.jpg",
    expert_tip: "שתי שכבות חובה (3 ק״ג למ״ר סה״כ). סרטי פינות חובה בכל חיבור קיר-רצפה."
  },
  {
    brand: "תרמוקיר",
    name: "פלסטומר 603 (AD 603) דבק קרמיקה",
    category: "דבקים",
    unit: "שק 25 ק״ג",
    image_url: "https://www.termokir.co.il/wp-content/uploads/2015/03/603-AD.jpg",
    expert_tip: "לאריחי פורצלן גדולים (מעל 60 ס״מ) חובה לבצע מריחה כפולה - גם על התשתית וגם על גב האריח."
  },
  {
    brand: "כרמית (מיסטר פיקס)",
    name: "טיח 710 ליישור קירות",
    category: "טיח",
    unit: "שק 25 ק״ג",
    image_url: "https://www.mr-fix.co.il/wp-content/uploads/2016/01/710.jpg",
    expert_tip: "על בטון חלק חובה ליישם פריימר מקשר (כמו פריימר 101) לפני יישום הטיח."
  },
  {
    brand: "אורבונד",
    name: "לוח גבס ירוק (עמיד לחות)",
    category: "גבס",
    unit: "לוח (3 מ״ר)",
    image_url: "https://www.orbond.co.il/images/products/green-board.jpg",
    expert_tip: "בחדרים רטובים יש להשתמש רק בברגים מושחרים עמידי חלודה ובסרט שריון פיברגלס."
  },
  {
    brand: "נירלט",
    name: "שליכט צבעוני EXTRA M150",
    category: "שליכט",
    unit: "דלי 24 ק״ג",
    image_url: "https://nirlat.com/wp-content/uploads/2018/05/M150.jpg",
    expert_tip: "חובה ליישם פריימר X בגוון השליכט לפחות 24 שעות לפני תחילת העבודה."
  }
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
          <Link href="/dashboard" className="text-gray-400 p-2"><ArrowRight size={24} /></Link>
          <div className="text-center">
             <h1 className="text-xl font-black text-gray-800 italic">קטלוג מומחה – ח. סבן</h1>
             <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest text-center">מלאי מסונכרן ומידע טכני</p>
          </div>
          <div className="w-10"></div>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="חפש לפי שם, מותג או יישום..."
              className="w-full p-4 pr-12 bg-gray-50 rounded-2xl border-none font-bold shadow-inner text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all ${
                  activeCategory === cat ? 'bg-[#1976D2] text-white' : 'bg-white text-gray-400 border border-gray-100'
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
          {filteredProducts.map((product, idx) => (
            <div key={idx} className="bg-white rounded-[35px] overflow-hidden shadow-sm border border-gray-100 flex flex-col animate-in fade-in duration-500">
              <div className="h-44 bg-gray-50 flex items-center justify-center p-8 relative">
                 {product.image_url ? (
                   <img src={product.image_url} alt={product.name} className="h-full object-contain" />
                 ) : (
                   <Package size={40} className="text-gray-200" />
                 )}
                 <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-blue-600 shadow-sm border border-blue-50 uppercase">
                   {product.brand}
                 </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-lg font-black text-gray-800 leading-tight">{product.name}</h3>
                
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                  <BookOpen size={14} className="text-gray-300" />
                  <span>{product.category} | {product.unit}</span>
                </div>

                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                  <ShieldCheck className="text-blue-600 mt-1 shrink-0" size={18} />
                  <p className="text-xs font-bold text-blue-900 leading-relaxed italic">
                    <span className="block text-[9px] uppercase tracking-widest text-blue-400 mb-1">טיפ זהב מראמי:</span>
                    {product.expert_tip}
                  </p>
                </div>

                <Link 
                  href={`/order?search=${encodeURIComponent(product.name)}`} 
                  className="block w-full text-center bg-gray-900 text-white py-4 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg"
                >
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
