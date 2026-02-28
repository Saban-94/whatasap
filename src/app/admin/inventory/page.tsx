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
  CheckCircle2
} from "lucide-react"

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchInventory = async () => {
    setLoading(true)
    try {
      // שליפת העמודות המדויקות לפי קובץ ה-SQL שלך
      const { data, error } = await supabase
        .from('inventory')
        .select('product_name, sku, category, supplier_name, price, department')
        .order('product_name', { ascending: true })
      
      if (data) {
        setItems(data)
        setFilteredItems(data)
      }
      if (error) console.error("Error fetching inventory:", error)
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
      item.sku?.includes(searchQuery)
    )
    setFilteredItems(filtered)
  }, [searchQuery, items])

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto min-h-screen bg-[#fbfbfb]" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-[#0B2C63] p-3 rounded-2xl text-white shadow-lg">
            <Package size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0B2C63]">מלאי מחסן סבן</h1>
            <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1">Live DB Connection</p>
          </div>
        </div>

        {/* תיקון השגיאה ב-Input */}
        <div className="flex flex-1 max-w-md w-full relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="חפש מוצר או מקט..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 font-bold text-sm"
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchInventory} disabled={loading} className="rounded-xl border-slate-200 font-bold">
            <RefreshCcw size={16} className={loading ? "animate-spin ml-2" : "ml-2"} />
            רענן
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="flex flex-col justify-center items-center p-24 gap-4">
            <Loader2 className="animate-spin text-[#0B2C63]" size={48} />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[4px]">Fetching Data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 font-black text-[#0B2C63] text-sm">שם המוצר</th>
                  <th className="px-6 py-5 font-black text-[#0B2C63] text-sm">מק"ט (SKU)</th>
                  <th className="px-6 py-5 font-black text-[#0B2C63] text-sm">קטגוריה</th>
                  <th className="px-6 py-5 font-black text-[#0B2C63] text-sm">ספק</th>
                  <th className="px-6 py-5 font-black text-[#0B2C63] text-sm text-center">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-6 py-5 font-black text-slate-800">{item.product_name}</td>
                    <td className="px-6 py-5 font-mono text-[11px] font-bold text-blue-600/70">{item.sku || '---'}</td>
                    <td className="px-6 py-5">
                      <span className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full font-black text-[9px] uppercase flex items-center gap-1.5 w-fit">
                        <Tag size={10} /> {item.category || 'כללי'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-500 italic">
                       {item.supplier_name || '---'}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span className="text-[9px] font-black text-green-600 uppercase">Synced</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
