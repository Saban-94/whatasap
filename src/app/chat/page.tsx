"use client"

import { useState, useEffect, useRef } from "react"
import { Sparkles, Send, MessageSquareDashed, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import FloatingOrbs from "@/components/FloatingOrbs"

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // גלילה אוטומטית להודעה האחרונה
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isThinking])

  useEffect(() => {
    setMessages([{ 
      id: "start", 
      role: "assistant", 
      content: "אהלן ראמי! אני מחובר למלאי סבן עם מודל Gemini 3.1. איך אני יכול לעזור?", 
      createdAt: new Date() 
    }])
  }, [])

  const handleSend = async () => {
    if (!inputValue.trim() || isThinking) return
    
    const userMsg = { 
      id: Date.now().toString(), 
      role: "user", 
      content: inputValue,
      createdAt: new Date()
    }
    
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
        uiBlueprint: data.uiBlueprint,
        createdAt: new Date()
      }])
    } catch (e) {
      console.error("Chat Error:", e)
      setMessages(prev => [...prev, { 
        id: "err", 
        role: "assistant", 
        content: "אופס, משהו השתבש בחיבור לשרת. נסה שוב בעוד רגע." 
      }])
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#fbfbfb] overflow-hidden font-sans" dir="rtl">
      {/* רקע אורבס נושם */}
      <FloatingOrbs />
      
      {/* Header יוקרתי */}
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 p-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0B2C63] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/10">
               <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-[#0B2C63] leading-none uppercase italic">Saban AI</h1>
              <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest">Gemini 3.1 Flash</span>
            </div>
          </div>
          <Button onClick={() => setMessages([])} variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 transition-colors">
            <MessageSquareDashed size={18} className="text-slate-400" />
          </Button>
        </div>
      </header>

      {/* אזור ההודעות */}
      <main ref={scrollRef} className="relative z-10 h-[calc(100dvh-160px)] overflow-y-auto px-4 pt-6 scroll-smooth">
        <div className="max-w-2xl mx-auto w-full space-y-6 pb-12">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] p-4 rounded-[26px] font-bold shadow-sm transition-all ${
                m.role === "user" ? "bg-[#0B2C63] text-white rounded-tr-none shadow-blue-900/10" : "bg-white text-slate-800 border border-slate-50 rounded-tl-none shadow-slate-200/50"
              }`}>
                {m.content}
              </div>

              {/* כרטיס מוצר ויזואלי במידה ונמצא מוצר */}
              {m.uiBlueprint && (
                <div className="mt-4 p-5 bg-white rounded-[32px] shadow-2xl border border-slate-50 w-full max-w-[280px] animate-in zoom-in-95 transition-transform hover:scale-[1.02]">
                  <h4 className="font-black text-[#0B2C63] text-lg leading-tight">{m.uiBlueprint.data.product_name}</h4>
                  <div className="flex items-baseline gap-1 mt-1 text-blue-600 font-black text-xl">
                    <span className="text-xs italic">₪</span>{m.uiBlueprint.data.price || '0'}
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="bg-slate-50 p-3 rounded-2xl text-[10px] font-black text-slate-500 uppercase flex justify-between border border-slate-100">
                      <span>מק"ט:</span>
                      <span className="text-[#0B2C63] font-mono tracking-tighter">{m.uiBlueprint.data.sku}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl text-[10px] font-black text-slate-500 uppercase flex justify-between border border-slate-100">
                      <span>ספק:</span>
                      <span className="text-[#0B2C63] truncate max-w-[120px]">{m.uiBlueprint.data.supplier_name}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isThinking && (
            <div className="flex items-center gap-2 text-[10px] font-black text-[#0B2C63] animate-pulse px-2 uppercase tracking-[2px]">
              <Loader2 size={12} className="animate-spin" />
              Saban AI Thinking...
            </div>
          )}
        </div>
      </main>

      {/* אזור הקלט */}
      <footer className="fixed bottom-0 left-0 w-full z-40 p-6 bg-gradient-to-t from-[#fbfbfb] via-[#fbfbfb] to-transparent">
        <div className="max-w-2xl mx-auto">
          <div className="relative flex items-center bg-white border border-slate-100 shadow-2xl rounded-[30px] p-2 pr-6 transition-all focus-within:ring-4 focus-within:ring-blue-50/50">
            <input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent outline-none font-bold text-slate-800 text-[15px] py-3 placeholder:text-slate-300"
              placeholder="שאל אותי על סיקה, בטון או דבק..."
            />
            <Button onClick={handleSend} disabled={isThinking} className="bg-[#0B2C63] h-12 w-12 rounded-[22px] shadow-lg shadow-blue-900/20 hover:bg-[#081f4d] transition-all active:scale-95">
              <Send size={18} className="text-white" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
