'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [sqm, setSqm] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const prods = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prods);
    };
    fetchProducts();
  }, []);

  return (
    <div className="bg-[#0A0A0A] text-white min-h-screen p-6 rtl" dir="rtl">
      <h1 className="text-[#C9A227] text-3xl font-bold mb-8">יועץ חומרי בניין - ח. סבן</h1>
      <div className="grid gap-6">
        {products.map(product => (
          <div key={product.id} className="border border-[#C9A227] p-4 rounded-lg bg-[#1A1A1A]">
            <h2 className="text-[#C9A227] text-xl">{product.name}</h2>
            <p className="text-sm text-gray-400">{product.solution}</p>
            
            {/* מחשבון חכם */}
            <div className="mt-4 p-3 bg-black rounded">
              <label className="block text-xs mb-1">הכנס מ"ר לחישוב:</label>
              <input 
                type="number" 
                onChange={(e) => setSqm(Number(e.target.value))}
                className="bg-gray-800 text-white p-1 w-full rounded border border-gray-700"
              />
              <div className="mt-2 text-[#C9A227] font-bold">
                כמות נדרשת: {product.category === 'Paints' 
                  ? Math.ceil(sqm / product.coverage / 0.75) + " ליטר"
                  : Math.ceil((sqm * 5 * product.coverage) / 25) + " שקים (25 ק\"ג)"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
