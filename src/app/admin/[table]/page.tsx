"use client"

import { useEffect, useState, use } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Loader2, Search, Edit, Trash2, Package, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DynamicAdminPage({ params }: { params: Promise<{ table: string }> }) {
  const { table } = use(params)
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchData = async () => {
    setLoading(true)
    const { data: res, error } = await supabase
      .from(table)
      .select('*')
      .limit(100)
    
    if (res) setData(res)
    if (error) console.error("Error:", error)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [table])

  const filteredData = data.filter(item => 
    JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-[#F8FAFC]" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 gap-6 mb-8">
        <div className="flex items-center gap-5">
          <Link href="/admin/dashboard" className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
            <ArrowRight size={24} className="text-slate-400" />
          </Link>
          <div className="bg-[#0B2C63] p-4 rounded-2xl text-white shadow-xl">
            <Package size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0B2C63] tracking-tight text-right uppercase">ניהול טבלה: {table}</h1>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest text-right">Database Control Center</p>
          </div>
        </div>

        <div className="flex flex-1 max-w-md w-full relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text"
            placeholder="חיפוש מהיר בנתונים..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-12 pl-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-sm"
          />
        </div>

        <Button onClick={fetchData} disabled={loading} className="bg-[#0B2C63] text-white rounded-2xl px-8 h-12 font-bold shadow-lg shadow-blue-900/10">
          {loading ? <Loader2 size={18} className="animate-spin" /> : "רענן נתונים"}
        </Button>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden text-right">
        {loading && data.length === 0 ? (
          <div className="p-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-[#0B2C63]" size={48} />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[4px]">Accessing Database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-right font-black text-[#0B2C63] text-sm uppercase">מידע גולמי (JSON)</th>
                  <th className="px-8 py-6 text-center font-black text-[#0B2C63] text-sm uppercase">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-20 text-center text-slate-300 font-bold italic">לא נמצאו נתונים תואמים</td>
                  </tr>
                ) : (
                  filteredData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="px-8 py-6 font-mono text-[11px] text-slate-500 leading-relaxed max-w-4xl break-all">
                        {JSON.stringify(item)}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-50 rounded-xl">
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-50 rounded-xl">
                            <Trash2 size={16} />
                          </Button>
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
    </div>
  )
}
