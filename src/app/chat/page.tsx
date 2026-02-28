"use client"

import FloatingOrbs from "@/components/FloatingOrbs" // וודא שקיים קומפוננט כזה
import { Sparkles } from "lucide-react"

export default function ChatPage() {
  return (
    <div className="relative min-h-screen bg-[#fbfbfb] overflow-hidden">
      {/* העיגול הנושם - הסגנון המקורי של סבן */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="fixed bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-orange-400/5 rounded-full blur-[100px] animate-bounce duration-[12s] pointer-events-none" />

      <div className="relative z-10 flex flex-col h-screen">
        {/* תוכן הצאט */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
           {/* רשימת הודעות */}
        </div>

        {/* שדה הקלט */}
        <div className="p-6 bg-white/80 backdrop-blur-2xl border-t border-slate-100">
          <div className="flex justify-center mb-4 opacity-50">
             <Sparkles className="text-[#0B2C63] animate-spin duration-[5s]" />
          </div>
          {/* Input component */}
        </div>
      </div>
    </div>
  )
}
