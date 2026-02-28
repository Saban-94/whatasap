"use client"

import { useState, useEffect } from "react"
import { Sparkles, Send, MessageSquareDashed, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import FloatingOrbs from "@/components/FloatingOrbs"
import { usePWAInstall } from "@/components/usePWAInstall"

// קומפוננטה פנימית לרשימת ההודעות
function InternalMessageList({ messages, isThinking }: { messages: any[], isThinking: boolean }) {
  return (
    <div className="space-y-6 pb-24">
      {messages.map((m) => (
        <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[85%] p-4 rounded-[26px] font-bold shadow-sm ${
            m.role === "user" ? "bg-[#0B2C63] text-white rounded-tr-none" : "bg-white text-slate-800 border border-slate-50 rounded-tl-none"
          }`}>
            {m.content}
          </div>
        </div>
      ))}
      {isThinking && (
        <div className="flex gap-2 items-center text-slate-400 text-[10px] font-black animate-pulse uppercase tracking-widest">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
          Saban AI is thinking...
        </div>
      )}
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  
  // תיקון השגיאה: התאמה לערכים שה-Hook באמת מחזיר
  const { deferredPrompt, prompt } = usePWAInstall()

  useEffect(() => {
    setMessages([{ 
      id: "w", 
      role: "assistant", 
      content: "אהלן ראמי! איך אני יכול לעזור היום?", 
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
        content: data.text 
      }])
    } catch (e) {
      console.error(e)
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#fbfbfb] overflow-hidden font-sans" dir="rtl">
      <FloatingOrbs />
      
      <header className="sticky top-0 z-30 w-full bg-white/70 backdrop-blur-2xl border-b border-slate-100/50 p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0B2C63] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
               <Sparkles className="text-white" size={20} />
            </div>
            <h1 className="text-lg font-black text-[#0B2C63] tracking-tighter">Saban OS</h1>
          </div>
          <div className="flex gap-2">
            {/* שימוש ב-deferredPrompt כדי לבדוק אם אפשר להתקין */}
            {deferredPrompt && (
              <Button onClick={prompt} variant="ghost" size="icon" className="rounded-full">
                <Smartphone size={18} className="text-blue-600" />
              </Button>
            )}
            <Button onClick={() => setMessages([])} variant="ghost" size="icon" className="rounded-full">
              <MessageSquareDashed size={18} className="text-slate-400" />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 h-[calc(100dvh-160px)] overflow-y-auto px-4 pt-6">
        <div className="max-w-2xl mx-auto w-full">
           <InternalMessageList messages={messages} isThinking={isThinking} />
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full z-40 p-6 bg-gradient-to-t from-[#fbfbfb] via-[#fbfbfb] to-transparent">
        <div className="max-w-2xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-orange-50 rounded-[32px] blur opacity-20 group-focus-within:opacity-40 transition"></div>
            <div className="relative flex items-center bg-white border border-slate-100 shadow-2xl rounded-[30px] p-2 pr-6 overflow-hidden">
              <input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-transparent outline-none text-[15px] font-bold text-slate-800 placeholder:text-slate-300 py-3"
                placeholder="שאל אותי על המלאי..."
              />
              <Button onClick={handleSend} disabled={isThinking} className="bg-[#0B2C63] h-12 w-12 rounded-[22px] transition-all active:scale-95">
                <Send size={18} className="text-white" />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
