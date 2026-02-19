'use client';
import { useEffect, useState } from 'react';
import { fetchProducts, deleteProduct, createProduct, updateProduct } from '@/lib/api';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import ProductForm from '@/components/ProductForm';
import { Plus, Search, Loader2, RefreshCw } from 'lucide-react';

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

  async function handleCreate(data: Product) {
    try {
      await createProduct(data);
      await loadData();
      setIsModalOpen(false);
    } catch (e) {
      alert("שגיאה בשמירת מוצר");
    }
  }

  async function handleUpdate(data: Product) {
    try {
      await updateProduct(data.sku, data);
      await loadData();
      setEditingProduct(null);
    } catch (e) {
      alert("שגיאה בעדכון מוצר");
    }
  }

  const filtered = items.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && items.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-emerald-600" size={40}/>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">SabanOS Studio</h1>
            <p className="text-slate-500 font-bold text-sm">ניהול קטלוג ומלאי ח. סבן</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={loadData}
              className="p-3 text-slate-400 hover:text-emerald-600 transition-colors"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
            >
              <Plus size={20}/> מוצר חדש
            </button>
          </div>
        </header>

        <div className="relative mb-8">
          <input 
            type="text" 
            placeholder="חפש מוצר לפי שם או מק״ט..." 
            className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 pr-12 font-bold outline-none focus:ring-2 ring-emerald-500/20 shadow-sm"
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
              onEdit={(prod) => setEditingProduct(prod)} 
              onDelete={async (sku) => {
                if(confirm('בטוח שברצונך למחוק?')) {
                  await deleteProduct(sku);
                  loadData();
                }
              }} 
            />
          ))}
          {filtered.length === 0 && !loading && (
            <div className="col-span-full text-center py-20 bg-white rounded-[2rem] border border-dashed text-slate-400 font-bold">
              לא נמצאו מוצרים תואמים
            </div>
          )}
        </div>
      </div>

      {/* מודל הוספה */}
      {isModalOpen && (
        <ProductForm 
          onCancel={() => setIsModalOpen(false)} 
          onSubmit={handleCreate} 
        />
      )}

      {/* מודל עריכה */}
      {editingProduct && (
        <ProductForm 
          initial={editingProduct}
          onCancel={() => setEditingProduct(null)} 
          onSubmit={handleUpdate} 
        />
      )}
    </main>
  );
}
