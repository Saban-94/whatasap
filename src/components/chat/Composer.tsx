"use client"

import type React from "react"
import { useState, useRef, useCallback, type KeyboardEvent } from "react"
import { Square, Brain, Paperclip, SendHorizonal, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
    <div className="relative w-full max-w-4xl mx-auto px-4">
      <div className="relative flex flex-col gap-2 p-4 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[32px] shadow-2xl">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="שאל אותי על סיקה, דבקים או חישובים..."
            className="flex-1 resize-none bg-transparent px-2 py-3 text-[16px] font-bold text-[#0B2C63] focus:outline-none"
            dir="rtl"
            rows={1}
          />
          <button
            onClick={handleSend}
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center transition-all",
              !value.trim() ? "bg-slate-100 text-slate-400" : "bg-[#0B2C63] text-white"
            )}
          >
            {isStreaming ? <AnimatedOrb size={24} /> : <SendHorizonal className="w-5 h-5 -rotate-180" />}
          </button>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-50">
           <div className="flex gap-2">
              <Paperclip className="w-4 h-4 text-slate-400 cursor-pointer" />
              <Mic className="w-4 h-4 text-slate-400 cursor-pointer" />
           </div>
           <span className="text-[9px] font-black text-[#0B2C63] opacity-30 uppercase tracking-[3px]">Saban Intelligence</span>
        </div>
      </div>
    </div>
  )
}
