"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, Activity, ShieldCheck, Database, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SabanAIFinal() {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{model: string, ok: boolean} | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: "user", content: input }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: [...messages, userMsg] })
      })
      const data = await res.json()
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.text,
        uiBlueprint: data.uiBlueprint 
      }])
      
      if (data.activeModel) {
        setStatus({ model: data.activeModel, ok: true })
      }
    } catch (e) {
      setStatus({ model: "None", ok: false })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans" dir="rtl">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-100 p-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#0B2C63] p-2.5 rounded-2xl shadow-lg">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-[#0B2C63] leading-none">Saban AI 2026</h1>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Model Fallback System</p>
            </div>
          </div>

          {status && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${status.ok ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600'}`}>
              <ShieldCheck size={12} />
              {status.model}
            </div>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <main className="max-w-3xl mx-auto p-6 space-y-6 pb-32">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] p-4 rounded-3xl font-bold shadow-sm ${
              m.role === 'user' ? 'bg-[#0B2C63] text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-50 rounded-tl-none'
            }`}>
              {m.content}
            </div>

            {/* Product Card */}
            {m.uiBlueprint && (
              <div className="mt-4 p-5 bg-white rounded-[32px] shadow-2xl border border-blue-50 w-full max-w-[280px]">
                <h4 className="font-black text-[#0B2C63] text-lg">{m.uiBlueprint.data.product_name}</h4>
                <div className="text-blue-600 font-black text-xl mt-1">₪{m.uiBlueprint.data.price}</div>
                <div className="mt-4 bg-slate-50 p-3 rounded-2xl text-[10px] font-black text-slate-400 flex justify-between">
                  <span>SKU:</span> <span className="text-[#0B2C63]">{m.uiBlueprint.data.sku}</span>
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && <div className="text-[10px] font-black text-blue-600 animate-pulse uppercase tracking-[2px]">Saban AI Testing Models...</div>}
      </main>

      {/* Input Bar */}
      <footer className="fixed bottom-0 w-full p-6 bg-gradient-to-t from-[#F8FAFC] to-transparent">
        <div className="max-w-3xl mx-auto flex items-center bg-white border border-slate-100 shadow-2xl rounded-[30px] p-2 pr-6">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent outline-none font-bold text-slate-700 py-3"
            placeholder="חפש מוצר (למשל: סיקה)..."
          />
          <Button onClick={handleSend} disabled={loading} className="bg-[#0B2C63] h-12 w-12 rounded-[22px] hover:bg-blue-900 transition-all">
            <Send size={18} className="text-white" />
          </Button>
        </div>
      </footer>
    </div>
  )
}
