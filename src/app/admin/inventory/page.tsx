"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { 
  Loader2, 
  RefreshCcw, 
  Package, 
  Tag, 
  Factory, 
  Search,
  CheckCircle2,
  Coins
} from "lucide-react"

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('product_name', { ascending: true })
      
      if (data) {
        setItems(data)
        setFilteredItems(data)
      }
      if (error) console.error("Supabase Error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  useEffect(() => {
    const filtered = items.filter(item => 
      item.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.includes(searchQuery) ||
      item.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredItems(filtered)
  }, [searchQuery, items])

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto min-h-screen bg-[#F8FAFC]" dir="rtl">
      
      {/* Header & Search Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 gap-6">
        <div className="flex items-center gap-5">
          <div className="bg-[#0B2C63] p-4 rounded-2xl text-white shadow-xl shadow-blue-900/10">
            <Package size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#0B2C63] tracking-tight">ניהול מלאי סבן</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[2px]">Saban Cloud Live Sync</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 max-w-2xl w-full gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0B2C63] transition-colors" size={20} />
            <input 
              type="text"
              placeholder="חפש לפי שם מוצר, מקט או ספק..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 pl-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all font-bold text-slate-700 shadow-inner"
            />
          </div>
          <Button onClick={fetchInventory} disabled={loading} variant="outline" className="h-[52px] px-6 rounded-2xl border-slate-200 hover:bg-slate-50 transition-all font-bold text-[#0B2C63]">
            <RefreshCcw size={18} className={`${loading ? "animate-spin" : ""} ml-2`} />
            רענן
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="flex flex-col justify-center items-center p-32 gap-6">
            <Loader2 className="animate-spin text-[#0B2C63]" size={60} />
            <p className="text-slate-400 font-black text-xs uppercase tracking-[6px]">Loading Inventory Data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 font-black text-[#0B2C63] text-sm uppercase">שם המוצר</th>
                  <th className="px-8 py-6 font-black text-[#0B2C63] text-sm uppercase">מק"ט (SKU)</th>
                  <th className="px-8 py-6 font-black text-[#0B2C63] text-sm uppercase">קטגוריה</th>
                  <th className="px-8 py-6 font-black text-[#0B2C63] text-sm uppercase">ספק</th>
                  <th className="px-8 py-6 font-black text-[#0B2C63] text-sm uppercase">מחיר</th>
                  <th className="px-8 py-6 font-black text-[#0B2C63] text-sm uppercase text-center">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.length === 0 ? (
                  <tr><td colSpan={6} className="py-32 text-center text-slate-300 font-bold italic">לא נמצאו מוצרים תואמים לחיפוש שלך</td></tr>
                ) : (
                  filteredItems.map((item, idx) => (
                    <tr key={item.sku || idx} className="hover:bg-blue-50/30 transition-all duration-200 group">
                      <td className="px-8 py-6">
                        <div className="font-black text-slate-800 text-base leading-tight group-hover:text-[#0B2C63]">
                          {item.product_name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                          Department: {item.department || 'General'}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-mono text-[12px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100/50 shadow-sm">
                          {item.sku}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full font-black text-[10px] uppercase flex items-center gap-2 w-fit border border-slate-200/50 shadow-sm">
                          <Tag size={12} className="opacity-50" /> {item.category || 'כללי'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2.5 text-sm font-bold text-slate-500">
                          <Factory size={16} className="text-slate-300" />
                          <span className="max-w-[180px] truncate" title={item.supplier_name}>
                            {item.supplier_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-black text-[#0B2C63] text-lg">
                         <div className="flex items-center gap-1">
                            <span className="text-xs font-bold opacity-50 italic">₪</span>
                            {item.price || '0'}
                         </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center items-center">
                           <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-xl border border-green-100 shadow-sm animate-in fade-in zoom-in duration-300">
                              <CheckCircle2 size={14} className="text-green-500" />
                              <span className="text-[10px] font-black uppercase tracking-wider">Synced</span>
                           </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center px-4">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[6px] italic">
          Saban Logistics Intelligence Layer v3.2
        </p>
        <p className="text-[10px] font-bold text-slate-400">
          Showing {filteredItems.length} products
        </p>
      </div>
    </div>
  )
}
