"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Loader2, Database, Trash2, ExternalLink, RefreshCcw } from "lucide-react"

export default function AnswersCachePage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCache = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('answers_cache')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setItems(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCache()
  }, [])

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50" dir="rtl">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg">
            <Database size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">זיכרון תשובה (Cache)</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Saban OS Database</p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchCache} disabled={loading} className="rounded-xl border-slate-200">
          <RefreshCcw size={16} className={loading ? "animate-spin ml-2" : "ml-2"} />
          רענן נתונים
        </Button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 font-black text-slate-600 text-sm">שאילתת משתמש</th>
                  <th className="px-6 py-5 font-black text-slate-600 text-sm">תשובת מערכת</th>
                  <th className="px-6 py-5 font-black text-slate-600 text-sm">תאריך</th>
                  <th className="px-6 py-5 font-black text-slate-600 text-sm text-center">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-6 py-5 font-bold text-slate-700 max-w-[200px] truncate">{item.question}</td>
                    <td className="px-6 py-5 text-sm text-slate-500 max-w-[400px] truncate">{item.answer}</td>
                    <td className="px-6 py-5 text-xs font-medium text-slate-400">
                      {new Date(item.created_at).toLocaleDateString('he-IL')}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="icon" className="text-slate-300 hover:text-red-500">
                          <Trash2 size={16} />
                        </Button>
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
