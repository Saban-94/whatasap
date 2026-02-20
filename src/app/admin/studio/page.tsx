'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Loader2, Package } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ProductForm from '@/components/ProductForm';

interface Product {
  id: string;
  sku: string;
  name: string;
  category?: string;
  stock_quantity: number;
  unit: string;
}

export default function SabanStudio() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const filtered = products.filter(p => 
    (p.name || '').toLowerCase().includes(query.toLowerCase()) || 
    (p.sku || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b141a] text-white p-6" dir="rtl">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#C9A227]">SABAN STUDIO</h1>
          <p className="text-gray-400">ניהול מלאי בזמן אמת</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-[#C9A227] text-black px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-transform active:scale-95"
        >
          <Plus size={20} /> הוספת מוצר
        </button>
      </header>

      <div className="relative mb-8">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input 
          type="text" 
          placeholder="חיפוש מוצר..."
          className="w-full bg-[#202c33] border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-[#C9A227]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#C9A227]" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <ProductCard 
              key={item.id} 
              product={item} 
              onEdit={() => {}} 
              onDelete={() => {}} 
            />
          ))}
        </div>
      )}

      {/* חיבור 100% תואם לממשק של ProductForm */}
      {showForm && (
        <ProductForm 
          onClose={() => setShowForm(false)} 
          onSuccess={loadInventory} 
        />
      )}
    </div>
  );
}
