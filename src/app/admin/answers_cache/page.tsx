"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Loader2, Database, Trash2, RefreshCcw } from "lucide-react"

export default function AnswersCachePage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCache = async () => {
    setLoading(true)
    const { data } = await supabase.from('answers_cache').select('*').order('created_at', { ascending: false })
    if (data) setItems(data)
    setLoading(false)
  }

  useEffect(() => { fetchCache() }, [])

  return (
    <div className="p-8 max-w-7xl mx-auto bg-white min-h-screen" dir="rtl">
      <div className="flex items-center gap-4 mb-10 border-b pb-6">
        <Database className="text-[#0B2C63]" size={32} />
        <h1 className="text-2xl font-black text-[#0B2C63]">לוג תשובות (Cache)</h1>
      </div>

      <div className="border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 font-bold">שאלה</th>
              <th className="px-6 py-4 font-bold">תשובה</th>
              <th className="px-6 py-4 text-center">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-slate-700">{item.question}</td>
                <td className="px-6 py-4 text-slate-500 text-sm truncate max-w-xs">{item.answer}</td>
                <td className="px-6 py-4 text-center">
                  <Button variant="ghost" className="text-red-400"><Trash2 size={16} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
