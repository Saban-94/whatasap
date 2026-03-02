"use client"

import React, { useState, useRef, useCallback } from "react"
import { SendHorizonal, Paperclip, Mic, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatedOrb } from "./animated-orb"

export function Composer({ onSend, isStreaming, disabled }: any) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    if (!value.trim() || isStreaming || disabled) return
    onSend(value)
    setValue("")
  }, [value, isStreaming, disabled, onSend])

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 pb-4">
      <div className="relative flex flex-col gap-2 p-4 bg-white/90 backdrop-blur-2xl border border-slate-200 rounded-[32px] shadow-2xl transition-all focus-within:border-blue-500/30 focus-within:ring-4 focus-within:ring-blue-500/5">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="איך אפשר לעזור היום? (סיקה, דבקים...)"
            className="flex-1 resize-none bg-transparent px-2 py-3 text-[16px] font-bold text-[#0B2C63] placeholder:text-slate-400 focus:outline-none min-h-[52px] max-h-[150px]"
            dir="rtl"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!value.trim() || isStreaming}
            className={cn(
              "h-12 w-12 shrink-0 rounded-full flex items-center justify-center transition-all active:scale-95",
              !value.trim() || isStreaming
                ? "bg-slate-100 text-slate-400"
                : "bg-[#0B2C63] text-white shadow-lg shadow-blue-900/20"
            )}
          >
            {isStreaming ? (
              <AnimatedOrb size={24} />
            ) : (
              <SendHorizonal className="w-5 h-5 -rotate-180" />
            )}
          </button>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-1">
           <div className="flex gap-3 px-2">
              <Paperclip className="w-4 h-4 text-slate-300 hover:text-blue-500 cursor-pointer transition-colors" />
              <Mic className="w-4 h-4 text-slate-300 hover:text-blue-500 cursor-pointer transition-colors" />
           </div>
           <div className="flex items-center gap-2 opacity-30 px-2">
              <span className="text-[8px] font-black text-[#0B2C63] uppercase tracking-[3px]">Saban Intelligence</span>
              <Sparkles className="w-3 h-3 text-blue-600" />
           </div>
        </div>
      </div>
    </div>
  )
}
