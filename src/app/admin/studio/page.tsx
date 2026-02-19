'use client';
import { useEffect, useState } from 'react';
import { fetchProducts, deleteProduct, createProduct } from '@/lib/api';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { Plus, Search, Loader2 } from 'lucide-react';
import ProductForm from '@/components/ProductForm';

export default function ProductStudioPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await fetchProducts();
      setItems(data);
    } catch (e) {
      console.error("Error loading products");
    } finally {
      setLoading(false);
    }
  }
// הוסף את ה-States האלו בתוך הפונקציה ProductStudioPage
const [isModalOpen, setIsModalOpen] = useState(false);

// ועדכן את הכפתור ב-JSX:
<button 
  onClick={() => setIsModalOpen(true)} // פותח את המודל
  className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700"
>
  <Plus size={20}/> מוצר חדש
</button>

// ולמטה, לפני סגירת ה-main:
{isModalOpen && (
  <ProductForm 
    onCancel={() => setIsModalOpen(false)} 
    onSubmit={async (data) => {
      await createProduct(data); // קריאה ל-API שבנינו קודם
      setIsModalOpen(false);
      loadData(); // ריענון הרשימה
    }} 
  />
)}
  const filtered = items.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-emerald-600" size={40}/></div>;

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900">SabanOS Studio</h1>
            <p className="text-slate-500 font-bold text-sm">ניהול קטלוג מקצועי - ח. סבן</p>
          </div>
          <button className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700">
            <Plus size={20}/> מוצר חדש
          </button>
        </header>

        <div className="relative mb-8">
          <input 
            type="text" 
            placeholder="חפש מוצר לפי שם או מק״ט..." 
            className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 pr-12 font-bold outline-none focus:ring-2 ring-emerald-500/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <ProductCard 
              key={p.sku} 
              product={p} 
              onEdit={(prod) => console.log('Edit', prod)} 
              onDelete={async (sku) => {
                await deleteProduct(sku);
                loadData();
              }} 
            />
          ))}
        </div>
      </div>
    </main>
  );
}
