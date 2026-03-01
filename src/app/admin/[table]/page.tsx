"use client"

import { useEffect, useState, use } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Loader2, Search, Edit, Trash2, Package } from "lucide-react"

export default function DynamicAdminPage({ params }: { params: Promise<{ table: string }> }) {
  const { table } = use(params)
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    const { data: res } = await supabase.from(table).select('*').limit(50)
    if (res) setData(res)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [table])

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-white" dir="rtl">
      <div className="flex justify-between items-center mb-10 border-b pb-6">
        <div className="flex items-center gap-4">
          <Package className="text-[#0B2C63]" size={32} />
          <h1 className="text-2xl font-black text-[#0B2C63]">ניהול טבלה: {table}</h1>
        </div>
        <Button onClick={fetchData} className="bg-[#0B2C63] text-white rounded-xl">רענן נתונים</Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border shadow-sm">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : (
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-600">נתונים</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-center">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                    {JSON.stringify(item).substring(0, 100)}...
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <Button variant="ghost" size="sm" className="text-blue-500"><Edit size={16} /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500"><Trash2 size={16} /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
