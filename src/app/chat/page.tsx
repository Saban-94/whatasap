"use client"

import { useState, useEffect } from "react"
import { Sparkles, Send, MessageSquareDashed } from "lucide-react"
import { Button } from "@/components/ui/button"
import FloatingOrbs from "@/components/FloatingOrbs"

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isThinking, setIsThinking] = useState(false)

  useEffect(() => {
    setMessages([{ 
      id: "1", 
      role: "assistant", 
      content: "אהלן ראמי! אני מחובר למלאי סבן. שאל אותי על כל מוצר, מק\"ט או חומר בניין.", 
      createdAt: new Date() 
    }])
  }, [])

  const handleSend = async () => {
    if (!inputValue.trim() || isThinking) return
    const userMsg = { id: Date.now().toString(), role: "user", content: inputValue }
    setMessages(prev => [...prev, userMsg])
    setInputValue("")
    setIsThinking(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      })
      const data = await response.json()
      
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: data.text,
        uiBlueprint: data.uiBlueprint 
      }])
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#fbfbfb] overflow-hidden font-sans" dir="rtl">
      <FloatingOrbs />
      
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 p-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0B2C63] rounded-2xl flex items-center justify-center shadow-lg">
             <Sparkles className="text-white" size={20} />
          </div>
          <h1 className="text-lg font-black text-[#0B2C63] tracking-tighter uppercase italic">Saban AI 3.1</h1>
        </div>
      </header>

      <main className="relative z-10 h-[calc(100dvh-160px)] overflow-y-auto px-4 pt-6">
        <div className="max-w-2xl mx-auto w-full space-y-6 pb-12">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`max-w-[85%] p-4 rounded-[26px] font-bold shadow-sm ${
                m.role === "user" ? "bg-[#0B2C63] text-white rounded-tr-none" : "bg-white text-slate-800 border border-slate-50 rounded-tl-none shadow-blue-50/50"
              }`}>
                {m.content}
              </div>

              {/* הצגת כרטיס מוצר אם נמצא בחיפוש */}
              {m.uiBlueprint && m.uiBlueprint.type === "product_card" && (
                <div className="mt-4 p-5 bg-white rounded-[32px] shadow-2xl border border-slate-50 w-full max-w-[300px] animate-in zoom-in-95">
                  <h4 className="font-black text-[#0B2C63] text-lg leading-tight">{m.uiBlueprint.data.product_name}</h4>
                  <div className="flex items-baseline gap-1 mt-1 text-blue-600 font-black text-xl">
                    <span className="text-xs italic">₪</span>{m.uiBlueprint.data.price || '0'}
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="bg-slate-50 p-3 rounded-2xl text-[10px] font-black text-slate-500 uppercase flex justify-between">
                      <span>מק"ט:</span>
                      <span className="text-[#0B2C63]">{m.uiBlueprint.data.sku}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl text-[10px] font-black text-slate-500 uppercase flex justify-between">
                      <span>ספק:</span>
                      <span className="text-[#0B2C63] truncate max-w-[120px]">{m.uiBlueprint.data.supplier_name}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isThinking && <div className="text-[10px] font-black text-[#0B2C63] animate-pulse px-2">Saban AI חושב...</div>}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full z-40 p-6 bg-gradient-to-t from-[#fbfbfb] to-transparent">
        <div className="max-w-2xl mx-auto flex items-center bg-white border border-slate-100 shadow-2xl rounded-[30px] p-2 pr-6">
          <input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent outline-none font-bold text-slate-800 text-[15px] py-3"
            placeholder="חפש סיקה, מלט או מפרט טכני..."
          />
          <Button onClick={handleSend} disabled={isThinking} className="bg-[#0B2C63] h-12 w-12 rounded-[22px] shadow-lg shadow-blue-100 transition-all active:scale-95">
            <Send size={18} className="text-white" />
          </Button>
        </div>
      </footer>
    </div>
  )
}
