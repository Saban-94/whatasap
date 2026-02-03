'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [sqm, setSqm] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const prods = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(prods);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="min-h-screen bg-black text-[#C9A227] flex items-center justify-center">טוען נתונים...</div>;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 rtl" dir="rtl">
      <header className="border-b border-[#C9A227] pb-6 mb-8 text-center">
        <h1 className="text-[#C9A227] text-3xl font-bold italic">H. SABAN EXPERT</h1>
        <p className="text-gray-400 text-sm mt-2">יועץ מומחה לחומרי בניין</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="bg-[#1A1A1A] border border-[#C9A227]/20 rounded-2xl p-5 shadow-2xl hover:border-[#C9A227] transition-all group">
            <h2 className="text-[#C9A227] text-xl font-bold mb-2 group-hover:scale-105 transition-transform">{product.name}</h2>
            <p className="text-gray-400 text-sm h-12 overflow-hidden mb-4">{product.solution}</p>
            
            <div className="space-y-4 bg-black/40 p-4 rounded-xl border border-gray-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">כושר כיסוי: {product.coverage}</span>
                <span className="text-[#C9A227]">מקדם פחת: 25%</span>
              </div>
              
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  placeholder="שטח מ''ר" 
                  className="bg-gray-800 border border-gray-700 rounded-lg p-2 w-full text-white focus:outline-none focus:border-[#C9A227]"
                  onChange={(e) => setSqm(Number(e.target.value))}
                />
              </div>

              {sqm > 0 && (
                <div className="pt-2 border-t border-gray-800 text-center text-lg font-bold text-[#C9A227]">
                  {product.category === 'Paints' 
                    ? `צריך: ${Math.ceil(sqm / (parseFloat(product.coverage) || 1) / 0.75)} ליטר`
                    : `צריך: ${Math.ceil((sqm * 5 * (parseFloat(product.coverage) || 1.5)) / 25)} שקים`}
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
               <button className="flex-1 bg-[#C9A227] text-black font-bold py-2 rounded-lg text-sm hover:bg-yellow-500 transition-colors">הורד PDF</button>
               <button className="flex-1 border border-[#C9A227] text-[#C9A227] font-bold py-2 rounded-lg text-sm hover:bg-[#C9A227]/10 transition-colors">טיפים</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
