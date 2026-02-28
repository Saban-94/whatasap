"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
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

  // 1. פונקציית שליפת הנתונים מהטבלה
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

  // 2. פונקציית סנכרון אקטיבי (קוראת ל-API של הצאט או למנוע עדכון)
  const handleActiveSync = async () => {
    setSyncing(true)
    try {
      // כאן המערכת יכולה להפעיל תהליך של משיכת נתונים ממאגר חיצוני
      // לצורך הדוגמה, אנחנו מבצעים רענון עמוק
      await fetchInventory()
      alert("הסנכרון מול המאגר הושלם בהצלחה")
    } catch (err) {
      alert("הסנכרון נכשל")
    } finally {
      setSyncing(false)
    }
  }

  // 3. האזנה לשינויים בזמן אמת (Realtime)
  useEffect(() => {
    fetchInventory()

    const channel = supabase
      .channel('inventory-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        () => {
          fetchInventory() // מרענן אוטומטית כשיש שינוי ב-DB
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header - לוח בקרה */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-[#0B2C63] p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
            <Package size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0B2C63] tracking-tight">ניהול מלאי סבן</h1>
            <div className="flex items-center gap-2 text-xs font-bold text-green-600 mt-1 uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              חיבור חי למסד הנתונים
            </div>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={fetchInventory} 
            disabled={loading}
            className="flex-1 md:flex-none gap-2 rounded-xl border-slate-200 font-bold text-slate-600"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            רענן
          </Button>

          <Button 
            onClick={handleActiveSync} 
            disabled={syncing}
            className="flex-1 md:flex-none gap-2 bg-[#0B2C63] hover:bg-[#081f4d] text-white rounded-xl shadow-md font-bold"
          >
            {syncing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            סנכרון מלא
          </Button>
        </div>
      </div>

      {/* הודעת שגיאה */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm animate-in fade-in">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* טבלת נתונים */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="flex flex-col justify-center items-center p-24 gap-4">
            <Loader2 className="animate-spin text-[#0B2C63]" size={48} />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Saban Inventory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="text-right font-black py-5 text-[#0B2C63] pr-8">שם המוצר</TableHead>
                  <TableHead className="text-right font-black py-5 text-[#0B2C63]">מק"ט (SKU)</TableHead>
                  <TableHead className="text-right font-black py-5 text-[#0B2C63]">קטגוריה</TableHead>
                  <TableHead className="text-right font-black py-5 text-[#0B2C63]">ספק</TableHead>
                  <TableHead className="text-center font-black py-5 text-[#0B2C63] pl-8">סטטוס</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-slate-400 font-bold">
                      לא נמצאו מוצרים במלאי
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, idx) => (
                    <TableRow key={item.id || idx} className="hover:bg-blue-50/30 transition-colors border-slate-50 group">
                      <TableCell className="text-right py-5 pr-8 font-black text-slate-800">
                        {item.product_name}
                      </TableCell>
                      <TableCell className="text-right py-5 font-mono text-[11px] font-bold text-blue-600/70 tracking-tighter">
                        {item.sku || '---'}
                      </TableCell>
                      <TableCell className="text-right py-5 text-sm">
                        <span className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full font-black text-[10px] uppercase flex items-center gap-1.5 w-fit">
                          <Tag size={12} /> {item.category || 'כללי'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right py-5 text-sm">
                        <span className="flex items-center gap-1.5 text-slate-500 font-bold">
                          <Factory size={14} className="opacity-40" /> {item.supplier_name || 'ספק לא רשום'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-5 pl-8">
                        <div className="flex justify-center items-center gap-2">
                           <CheckCircle2 size={16} className="text-green-500" />
                           <span className="text-[10px] font-black text-green-600 uppercase">Synchronized</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[4px]">Saban Logistics Control System v3.1</p>
      </div>
    </div>
  )
}
