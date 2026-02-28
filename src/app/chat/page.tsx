"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Send, MessageSquareDashed, Smartphone, Bell, Volume2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import FloatingOrbs from "@/components/FloatingOrbs" // הקומפוננטה של העיגולים שיצרנו
import { MessageList } from "@/components/chat/MessageList" // וודא שהנתיב נכון
import { usePWAInstall } from "@/components/usePWAInstall"

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false)
  const { isInstallable, installPWA } = usePWAInstall()
  
  // צליל הודעה מקורי של סבן
  const playNotificationSound = () => {
    const audio = new Audio('/icons/whatsapp.mp3')
    audio.play().catch(e => console.log("Audio play blocked"))
  }

  // טעינת הודעות ראשונית (Welcome Message)
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "אהלן ראמי! אני המוח של ח. סבן. איך אני יכול לעזור לך עם המלאי היום?",
        createdAt: new Date()
      }
    ])
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
      
      if (data.text) {
        const assistantMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.text,
          uiBlueprint: data.uiBlueprint,
          createdAt: new Date()
        }
        setMessages(prev => [...prev, assistantMsg])
        playNotificationSound()
      }
    } catch (error) {
      console.error("Chat Error:", error)
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#fbfbfb] overflow-hidden font-sans selection:bg-blue-100" dir="rtl">
      
      {/* שכבת העיצוב: העיגולים הנושמים של סבן */}
      <FloatingOrbs />

      {/* Header - מעוצב בסגנון זכוכית (Glassmorphism) */}
      <header className="sticky top-0 z-30 w-full bg-white/70 backdrop-blur-2xl border-b border-slate-100/50 p-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0B2C63] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
               <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-[#0B2C63] leading-none tracking-tighter">Saban OS</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Intelligence Layer</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isInstallable && (
              <Button onClick={installPWA} variant="ghost" size="icon" className="rounded-full hover:bg-blue-50">
                <Smartphone size={18} className="text-blue-600" />
              </Button>
            )}
            <Button onClick={() => setMessages([])} variant="ghost" size="icon" className="rounded-full hover:bg-red-50">
              <MessageSquareDashed size={18} className="text-slate-400 hover:text-red-500" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="relative z-10 flex flex-col h-[calc(100dvh-150px)] overflow-y-auto px-4 pt-6">
        <div className="max-w-2xl mx-auto w-full">
           <MessageList messages={messages} isThinking={isThinking} />
        </div>
      </main>

      {/* Input Zone - ממוקם מעל העיגול התחתון */}
      <footer className="fixed bottom-0 left-0 w-full z-40 p-6 bg-gradient-to-t from-[#fbfbfb] via-[#fbfbfb]/95 to-transparent">
        <div className="max-w-2xl mx-auto">
          <div className="relative group transition-all duration-500">
            {/* אפקט הילה סביב השדה */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-orange-50 rounded-[32px] blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
            
            <div className="relative flex items-center bg-white border border-slate-100 shadow-2xl shadow-blue-100/20 rounded-[30px] p-2 pr-6 overflow-hidden transition-all duration-300 focus-within:border-blue-200">
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="שאל אותי על מחירים, מפרט טכני או מלאי..."
                className="flex-1 bg-transparent outline-none text-[15px] font-bold text-slate-800 placeholder:text-slate-300 py-3"
              />
              <Button 
                onClick={handleSend}
                disabled={isThinking}
                className={`ml-1 h-12 w-12 rounded-[22px] transition-all duration-500 ${
                  inputValue.trim() ? 'bg-[#0B2C63] scale-100 shadow-lg' : 'bg-slate-100 scale-90 grayscale'
                }`}
              >
                <Send size={18} className={inputValue.trim() ? 'text-white' : 'text-slate-400'} />
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center items-center gap-3 mt-4 opacity-40">
             <div className="h-[1px] w-8 bg-slate-200" />
             <span className="text-[9px] font-black tracking-[4px] text-[#0B2C63] uppercase italic">Hyper-Dynamic Interface</span>
             <div className="h-[1px] w-8 bg-slate-200" />
          </div>
        </div>
      </footer>
    </div>
  )
}
