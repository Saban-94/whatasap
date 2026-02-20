'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ProductForm from '@/components/ProductForm';

export default function SabanStudio() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id: string) => {
    if (!confirm('למחוק מהמלאי?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    loadData();
  };

  return (
    <div className="min-h-screen bg-[#0b141a] text-white p-6 pb-32" dir="rtl">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-[#C9A227] tracking-tighter">SABAN STUDIO</h1>
        <button onClick={() => setShowForm(true)} className="bg-[#C9A227] text-black px-6 py-3 rounded-2xl font-bold flex items-center gap-2"><Plus size={20}/> הוסף</button>
      </header>

      {/* שורת חיפוש */}
      <div className="relative mb-8">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input className="w-full bg-[#202c33] border-none rounded-2xl py-4 pr-12 text-white" placeholder="חיפוש..." onChange={e => setQuery(e.target.value)} />
      </div>

      {loading ? <Loader2 className="animate-spin mx-auto mt-20 text-[#C9A227]" size={50} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.filter(p => p.name.includes(query)).map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onEdit={() => setEditingProduct(product)} 
              onDelete={() => handleDelete(product.id)} 
            />
          ))}
        </div>
      )}

      {(showForm || editingProduct) && (
        <ProductForm 
          product={editingProduct} 
          onClose={() => { setShowForm(false); setEditingProduct(null); }} 
          onSuccess={loadData} 
        />
      )}
    </div>
  );
}
