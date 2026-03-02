"use client"

import type React from "react"
import { useState, useRef, useCallback, type KeyboardEvent, useEffect } from "react"
import { Square, Mic, MicOff, Brain, Paperclip, X, SendHorizonal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { AnimatedOrb } from "./animated-orb"

export type AIModel = "google/gemini-2.0-flash-001" | "openai/gpt-4o" | "anthropic/claude-sonnet-4"

export const AI_MODELS: { id: AIModel; name: string; icon: string }[] = [
  { id: "google/gemini-2.0-flash-001", name: "Gemini", icon: "/icons/ai.png" },
  { id: "openai/gpt-4o", name: "GPT-4o", icon: "/images/gpt.png" },
  { id: "anthropic/claude-sonnet-4", name: "Claude", icon: "/images/claude.svg" },
]

interface ComposerProps {
  onSend: (content: string) => void
  isStreaming: boolean
  disabled?: boolean
}

export function Composer({ onSend, isStreaming, disabled }: ComposerProps) {
  const [value, setValue] = useState("")
  const [selectedModel, setSelectedModel] = useState<AIModel>("google/gemini-2.0-flash-001")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [])

  const handleSend = useCallback(() => {
    if (!value.trim() || isStreaming || disabled) return
    onSend(value)
    setValue("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [value, isStreaming, disabled, onSend])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 pb-6">
      <div 
        className={cn(
          "relative flex flex-col gap-2 p-4 bg-white/80 backdrop-blur-xl border border-white/20 rounded-[32px] shadow-2xl transition-all duration-300",
          "focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/30"
        )}
      >
        <div className="flex items-end gap-3">
          {/* שדה הטקסט */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              handleInput()
            }}
            onKeyDown={handleKeyDown}
            placeholder="איך אפשר לעזור היום? (סיקה, דבקים, חישובים...)"
            disabled={isStreaming || disabled}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent px-2 py-3 text-[16px] font-bold text-[#0B2C63] placeholder:text-slate-400 focus:outline-none disabled:opacity-50",
              "max-h-[150px] overflow-y-auto no-scrollbar"
            )}
            dir="rtl"
          />

          {/* כפתור שליחה מונפש */}
          <button
            onClick={handleSend}
            disabled={!value.trim() || isStreaming || disabled}
            className={cn(
              "relative h-12 w-12 shrink-0 rounded-full flex items-center justify-center transition-all active:scale-90",
              !value.trim() || isStreaming || disabled
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-[#0B2C63] text-white shadow-lg shadow-blue-900/20"
            )}
          >
            {isStreaming ? (
              <div className="flex items-center justify-center">
                 <AnimatedOrb size={32} />
                 <Square className="w-3 h-3 absolute fill-white" />
              </div>
            ) : (
              <SendHorizonal className="w-5 h-5 -rotate-180" />
            )}
          </button>
        </div>

        {/* שורת כלים תחתונה */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-slate-100">
              <Paperclip className="w-4 h-4 text-slate-400" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-slate-100">
              <Mic className="w-4 h-4 text-slate-400" />
            </Button>
            
            <div className="h-4 w-[1px] bg-slate-200 mx-2" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 rounded-full px-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  <Brain className="w-3.5 h-3.5" />
                  {AI_MODELS.find(m => m.id === selectedModel)?.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="rounded-2xl border-slate-100 shadow-xl">
                {AI_MODELS.map((model) => (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className="flex items-center gap-3 rounded-xl cursor-pointer"
                  >
                    <span className="text-sm font-bold">{model.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-2 opacity-40">
             <span className="text-[9px] font-black uppercase tracking-[3px] text-[#0B2C63]">Saban Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  )
}
