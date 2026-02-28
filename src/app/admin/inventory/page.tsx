"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCcw, Package, AlertCircle } from "lucide-react"

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInventory = async () => {
    setLoading(true)
    setError(null)
    try {
      // שליפה ישירה מהטבלה שלך
      const { data, error: dbError } = await supabase
        .from('inventory')
        .select('*')
      
      if (dbError) {
        setError(dbError.message)
        console.error("Supabase Error:", dbError)
      } else if (data) {
        setItems(data)
      }
    } catch (err) {
      setError("שגיאת חיבור למסד הנתונים")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-[#0B2C63] p-3 rounded-xl text-white">
            <Package size={24} />
          </div>
          <h1 className="text-2xl font-black text-[#0B2C63]">מלאי סבן - בדיקת סנכרון</h1>
        </div>
        <Button onClick={fetchInventory} disabled={loading} variant="outline" className="rounded-xl">
          <RefreshCcw size={16} className={loading ? "animate-spin ml-2" : "ml-2"} />
          בדוק חיבור
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3 font-bold border border-red-100">
          <AlertCircle size={20} />
          שגיאה: {error} (בדוק אם ה-Table קיימת ואם ה-RLS מאופשר)
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : items.length === 0 ? (
          <div className="p-20 text-center text-slate-400 font-bold">הטבלה קיימת אך היא ריקה, או שאין הרשאות קריאה (RLS)</div>
        ) : (
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 font-black text-[#0B2C63]">מוצר</th>
                <th className="px-6 py-4 font-black text-[#0B2C63]">מק"ט</th>
                <th className="px-6 py-4 font-black text-[#0B2C63]">מחיר</th>
                <th className="px-6 py-4 font-black text-[#0B2C63]">ספק</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.sku} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{item.product_name}</td>
                  <td className="px-6 py-4 font-mono text-sm text-blue-600">{item.sku}</td>
                  <td className="px-6 py-4 font-bold text-green-600">₪{item.price}</td>
                  <td className="px-6 py-4 text-slate-500">{item.supplier_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
