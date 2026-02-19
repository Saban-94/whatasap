'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Search, Loader2, RefreshCw, Package as PackageIcon } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ProductForm from '@/components/ProductForm';

export default function ProductStudioPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className=\"min-h-screen bg-[#0b141a] text-white p-4 pb-24\">
      <header className=\"flex justify-between items-center mb-6\">
        <div>
          <h1 className=\"text-2xl font-black text-[#C9A227]\">SABAN STUDIO</h1>
          <p className=\"text-gray-400 text-sm\">ניהול מלאי ומוצרים בזמן אמת</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className=\"bg-[#C9A227] text-black p-3 rounded-xl font-bold flex items-center gap-2\"
        >
          <Plus size={20} /> מוצר חדש
        </button>
      </header>

      <div className=\"relative mb-6\">
        <Search className=\"absolute left-4 top-1/2 -translate-y-1/2 text-gray-400\" size={20} />
        <input 
          type=\"text\" 
          placeholder=\"חיפוש לפי שם או מק\"ט...\"
          className=\"w-full bg-[#202c33] border-none rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-[#C9A227]\"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className=\"flex flex-col items-center justify-center py-20\">
          <Loader2 className=\"animate-spin text-[#C9A227] mb-4\" size={40} />
          <p>טוען מלאי של סבן...</p>
        </div>
      ) : (
        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">
          {filteredItems.map(item => (
            <ProductCard key={item.id} product={item} onRefresh={fetchProducts} />
          ))}
        </div>
      )}

      {isFormOpen && (
        <ProductForm onClose={() => setIsFormOpen(false)} onSuccess={fetchProducts} />
      )}
    </div>
  );
}
