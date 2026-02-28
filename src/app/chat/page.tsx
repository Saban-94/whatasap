"use client"

import { useState, useEffect } from "react"
import { Sparkles, Send, MessageSquareDashed } from "lucide-react"
import { Button } from "@/components/ui/button"
import FloatingOrbs from "@/components/FloatingOrbs"
import { usePWAInstall } from "@/components/usePWAInstall"

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const { deferredPrompt, prompt } = usePWAInstall()

  useEffect(() => {
    // רישום הודעת פתיחה
    setMessages([{ 
      id: "w", 
      role: "assistant", 
      content: "אהלן ראמי! איך אפשר לעזור היום בסבן?", 
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
        id: Date.now().toString(), 
        role: "assistant", 
        content: data.text || "סליחה, לא הצלחתי לעבד את הבקשה.",
        uiBlueprint: data.uiBlueprint 
      }])
    } catch (e) {
      console.error("Frontend Fetch Error:", e)
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#fbfbfb] overflow-hidden" dir="rtl">
      <FloatingOrbs />
      
      <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0B2C63] rounded-2xl flex items-center justify-center shadow-lg">
               <Sparkles className="text-white" size={20} />
            </div>
            <h1 className="text-lg font-black text-[#0B2C63]">Saban AI</h1>
          </div>
          <div className="flex gap-2">
            {deferredPrompt && (
              <Button onClick={prompt} variant="ghost" size="icon" className="text-blue-600">
                📥
              </Button>
            )}
            <Button onClick={() => setMessages([])} variant="ghost" size="icon">
              <MessageSquareDashed size={18} />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 h-[calc(100dvh-160px)] overflow-y-auto px-4 pt-6">
        <div className="max-w-2xl mx-auto w-full space-y-6 pb-10">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`max-w-[85%] p-4 rounded-[24px] font-bold shadow-sm ${
                m.role === "user" ? "bg-[#0B2C63] text-white rounded-tr-none" : "bg-white text-slate-800 border border-slate-50 rounded-tl-none"
              }`}>
                {m.content}
              </div>
              {m.uiBlueprint && (
                <div className="mt-4 p-4 bg-white rounded-[32px] shadow-2xl border border-slate-50 w-full max-w-[280px] animate-in zoom-in-95">
                  <h4 className="font-black text-[#0B2C63]">{m.uiBlueprint.data.title}</h4>
                  <p className="text-sm font-bold text-slate-500 mt-1">₪{m.uiBlueprint.data.price}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-black uppercase text-slate-400">
                    <div className="bg-slate-50 p-2 rounded-xl text-center">צריכה: {m.uiBlueprint.data.specs?.coverage}</div>
                    <div className="bg-slate-50 p-2 rounded-xl text-center">ייבוש: {m.uiBlueprint.data.specs?.drying}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isThinking && <div className="text-[10px] font-black text-blue-600 animate-pulse uppercase tracking-widest">Saban AI חושב...</div>}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full z-40 p-6 bg-gradient-to-t from-[#fbfbfb] to-transparent">
        <div className="max-w-2xl mx-auto flex items-center bg-white border border-slate-100 shadow-2xl rounded-[28px] p-2 pr-6 focus-within:border-blue-200 transition-all">
          <input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent outline-none font-bold text-slate-800"
            placeholder="חפש סיקה, מלט או דבק..."
          />
          <Button onClick={handleSend} disabled={isThinking} className="bg-[#0B2C63] h-12 w-12 rounded-[20px]">
            <Send size={18} className="text-white" />
          </Button>
        </div>
      </footer>
    </div>
  )
}
