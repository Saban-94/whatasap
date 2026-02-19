'use client';
import { useEffect, useState } from 'react';
import { fetchProducts, deleteProduct, createProduct, updateProduct } from '@/lib/api';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import ProductForm from '@/components/ProductForm';
import { Plus, Search, Loader2, RefreshCw, package as PackageIcon } from 'lucide-react';

export default function ProductStudioPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setItems(data);
    } catch (e) {
      console.error("Error loading products:", e);
    } finally {
      setLoading(false);
    }
  }

  const filtered = items.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && items.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={40}/>
        <p className="text-slate-900 font-black">טוען נתונים מ-SabanOS...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* Header - צבעים חזקים */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-200 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-1">SabanOS Studio</h1>
            <p className="text-slate-600 font-bold text-lg">ניהול קטלוג ומלאי ח. סבן</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={loadData}
              className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"
              title="רענן נתונים"
            >
              <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-3 shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
            >
              <Plus size={24} strokeWidth={3} /> מוצר חדש
            </button>
          </div>
        </header>

        {/* Search Bar - טקסט שחור וברור */}
        <div className="relative mb-12 shadow-sm">
          <input 
            type="text" 
            placeholder="חפש מוצר לפי שם או מק״ט..." 
            className="w-full bg-white border-2 border-slate-200 rounded-[2rem] px-8 py-5 pr-14 font-bold text-slate-900 text-xl outline-none focus:border-emerald-500 transition-all placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" size={28}/>
        </div>

        {/* Grid - כרטיסים */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(p => (
            <ProductCard 
              key={p.sku} 
              product={p} 
              onEdit={(prod) => setEditingProduct(prod)} 
              onDelete={async (sku) => {
                if(confirm(`למחוק את ${p.name}?`)) {
                  await deleteProduct(sku);
                  loadData();
                }
              }} 
            />
          ))}
          
          {/* Empty State */}
          {filtered.length === 0 && !loading && (
            <div className="col-span-full text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-slate-200">
              <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={40} className="text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">לא מצאנו כלום, אחי</h3>
              <p className="text-slate-500 font-bold text-lg">נסה לחפש מק"ט אחר או הוסף מוצר חדש</p>
            </div>
          )}
        </div>
      </div>

      {/* מודלים */}
      {isModalOpen && (
        <ProductForm 
          onCancel={() => setIsModalOpen(false)} 
          onSubmit={async (data) => {
            await createProduct(data);
            setIsModalOpen(false);
            loadData();
          }} 
        />
      )}

      {editingProduct && (
        <ProductForm 
          initial={editingProduct}
          onCancel={() => setEditingProduct(null)} 
          onSubmit={async (data) => {
            await updateProduct(data.sku, data);
            setEditingProduct(null);
            loadData();
          }} 
        />
      )}
    </main>
  );
}
