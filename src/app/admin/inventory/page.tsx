"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCcw, Package, Tag, Factory, Zap, CheckCircle2 } from "lucide-react"
import { toast } from "sonner" // או כל ספריית נוטיפיקציות שיש לך

export default function InventoryManager() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  // 1. פונקציית שליפה רגילה
  const fetchInventory = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('product_name', { ascending: true })
    
    if (data) setItems(data)
    if (error) toast.error("שגיאה בטעינת המלאי")
    setLoading(false)
  }

  // 2. פונקציית סנכרון אקטיבי (סימולציה של משיכה מ-API חיצוני או קובץ)
  const handleActiveSync = async () => {
    setSyncing(true)
    toast.info("מתחיל סנכרון מול מאגר ספקים...")

    try {
      // כאן אתה יכול לקרוא ל-Edge Function או API חיצוני
      // דוגמה לקריאה ל-Route שמעדכן את ה-DB:
      const response = await fetch('/api/inventory/sync', { method: 'POST' })
      const result = await response.json()

      if (response.ok) {
        toast.success(`הסנכרון הושלם: עודכנו ${result.updatedCount} מוצרים`)
        fetchInventory() // רענון הרשימה לאחר העדכון
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error("הסנכרון נכשל, מנסה רענון מקומי...")
      fetchInventory()
    } finally {
      setSyncing(false)
    }
  }

  // 3. האזנה בזמן אמת (Realtime) לשינויים ב-Supabase
  useEffect(() => {
    fetchInventory()

    // מאזין לכל שינוי בטבלת inventory ומעדכן את המסך בלי רענון
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        (payload) => {
          console.log('שינוי זוהה במלאי:', payload)
          fetchInventory() // מרענן את הנתונים כשיש שינוי ב-DB
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header עם כפתור סנכרון חכם */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-[#0B2C63] p-3 rounded-xl text-white shadow-lg shadow-blue-100">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0B2C63]">ניהול מלאי חכם</h1>
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              מחובר בזמן אמת ל-Saban Cloud
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={fetchInventory} 
            disabled={loading}
            className="gap-2 border-slate-200"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            רענון
          </Button>

          <Button 
            onClick={handleActiveSync} 
            disabled={syncing}
            className="gap-2 bg-orange-500 hover:bg-orange-600 text-white border-none shadow-md"
          >
            {syncing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Zap size={16} />
            )}
            סנכרון ספקים (Active Sync)
          </Button>
        </div>
      </div>

      {/* טבלת המלאי */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="flex flex-col justify-center items-center p-20 gap-4">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="text-slate-400 font-bold">טוען נתונים מהמחסן...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-right font-bold py-4 text-[#0B2C63]">מוצר</TableHead>
                <TableHead className="text-right font-bold py-4 text-[#0B2C63]">מק"ט (SKU)</TableHead>
                <TableHead className="text-right font-bold py-4 text-[#0B2C63]">סטטוס סנכרון</TableHead>
                <TableHead className="text-right font-bold py-4 text-[#0B2C63]">ספק</TableHead>
                <TableHead className="text-center font-bold">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <TableCell className="text-right py-4 font-bold text-slate-700">
                    {item.product_name}
                  </TableCell>
                  <TableCell className="text-right py-4 font-mono text-xs text-blue-600">
                    {item.sku || '-'}
                  </TableCell>
                  <TableCell className="text-right py-4 text-sm">
                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md flex items-center gap-1 w-fit border border-green-100 text-[10px] font-black uppercase">
                      <CheckCircle2 size={10} /> מעודכן
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-4 text-sm">
                    <span className="flex items-center gap-1 text-slate-500 font-medium">
                      <Factory size={12} /> {item.supplier_name}
                    </span>
                  </TableCell>
                  <TableCell className="text-center flex justify-center gap-2 py-4">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      ערוך
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
