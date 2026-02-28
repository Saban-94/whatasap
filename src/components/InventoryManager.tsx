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
  Zap, 
  CheckCircle2,
  AlertCircle
} from "lucide-react"

export default function InventoryManager() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInventory = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await supabase
        .from('inventory')
        .select('*')
        .order('product_name', { ascending: true })
      
      if (dbError) throw dbError
      if (data) setItems(data)
    } catch (err: any) {
      console.error("Error fetching inventory:", err)
      setError("לא הצלחתי לטעון את נתוני המלאי")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-[#0B2C63] p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
            <Package size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0B2C63] tracking-tight">ניהול מלאי סבן</h1>
            <p className="text-xs font-bold text-green-600 mt-1 uppercase tracking-wider">חיבור חי למסד הנתונים</p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={fetchInventory} 
            disabled={loading}
            className="flex-1 md:flex-none gap-2 rounded-xl border-slate-200 font-bold"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            רענן
          </Button>
          <Button 
            disabled={syncing}
            className="flex-1 md:flex-none gap-2 bg-[#0B2C63] hover:bg-[#081f4d] text-white rounded-xl shadow-md font-bold"
          >
            <Zap size={16} />
            סנכרון מלא
          </Button>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="flex flex-col justify-center items-center p-24 gap-4">
            <Loader2 className="animate-spin text-[#0B2C63]" size={48} />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Inventory...</p>
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
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-20 text-slate-400 font-bold">לא נמצאו מוצרים</td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="px-6 py-5 font-black text-slate-800">{item.product_name}</td>
                      <td className="px-6 py-5 font-mono text-[11px] font-bold text-blue-600/70 tracking-tighter italic">
                        {item.sku || '---'}
                      </td>
                      <td className="px-6 py-5">
                        <span className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full font-black text-[10px] uppercase flex items-center gap-1.5 w-fit">
                          <Tag size={12} /> {item.category || 'כללי'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-500 italic">
                        <div className="flex items-center gap-1.5">
                          <Factory size={14} className="opacity-40" /> {item.supplier_name || 'ספק סבן'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center items-center gap-2">
                           <CheckCircle2 size={16} className="text-green-500" />
                           <span className="text-[9px] font-black text-green-600 uppercase">Synced</span>
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
      
      <div className="text-center pt-4">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[4px]">Saban Control v3.1</p>
      </div>
    </div>
  )
}
