"use client"
import { useState } from "react"
import { Send, Activity, ShieldCheck } from "lucide-react"

export default function ChatTester() {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [activeModel, setActiveModel] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    setLoading(true)
    const userMsg = { role: "user", content: input }
    setMessages(prev => [...prev, userMsg])
    
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [...messages, userMsg] })
    })
    const data = await res.json()
    
    setMessages(prev => [...prev, { role: "assistant", content: data.text }])
    setActiveModel(data.activeModel) // כאן אנחנו תופסים את המודל שעבד
    setLoading(false)
    setInput("")
  }

  return (
    <div className="p-6 max-w-2xl mx-auto" dir="rtl">
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 mb-6">
        <h1 className="text-xl font-black text-[#0B2C63] flex items-center gap-2">
          <Activity className="text-blue-500" />
          בודק מודלים Saban AI
        </h1>
        {activeModel && (
          <div className="mt-2 flex items-center gap-2 text-green-600 font-bold text-sm">
            <ShieldCheck size={16} />
            מודל פעיל: {activeModel}
          </div>
        )}
      </div>

      <div className="space-y-4 mb-24">
        {messages.map((m, i) => (
          <div key={i} className={`p-4 rounded-2xl font-bold ${m.role === 'user' ? 'bg-blue-50 mr-auto' : 'bg-slate-50 ml-auto'}`}>
            {m.content}
          </div>
        ))}
      </div>

      <div className="fixed bottom-6 left-0 w-full px-6">
        <div className="max-w-2xl mx-auto flex gap-2 bg-white p-2 rounded-2xl shadow-2xl border">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            className="flex-1 p-2 outline-none font-bold" 
            placeholder="כתוב 'סיקה' לבדיקה..."
          />
          <button onClick={sendMessage} className="bg-[#0B2C63] text-white p-3 rounded-xl">
            {loading ? "בודק..." : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}
