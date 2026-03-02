"use client";
import React, { useState } from "react";
import { MessageList } from "@/components/chat/message-list";
import { Composer } from "@/components/chat/composer";
import { Sparkles, Trash2 } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const send = async (content: string) => {
    if (!content.trim() || loading) return;
    
    const userMsg = { id: Date.now().toString(), role: 'user', content };
    setMessages(p => [...p, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      
      setMessages(p => [...p, { 
        id: (Date.now() + 1).toString(),
        role: 'assistant', 
        content: data.text, 
        products: data.products,
        uiBlueprint: data.uiBlueprint // השורה הזו מחזירה את העיצוב למסך!
      }]);
    } catch (e) {
      setMessages(p => [...p, { role: 'assistant', content: "תקלה בתקשורת." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="relative h-screen w-full bg-[#fbfbfb] dark:bg-slate-950 overflow-hidden" dir="rtl">
      {/* רקע יוקרתי */}
      <div className="fixed inset-0 pointer-events-none opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-slate-100 bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-600 w-5 h-5" />
            <span className="font-black text-[#0B2C63] text-xl italic tracking-tighter">SABAN AI</span>
          </div>
          <button onClick={() => setMessages([])} className="text-slate-300 hover:text-red-500 transition-colors">
            <Trash2 size={20} />
          </button>
        </div>

        {/* Message List */}
        <MessageList messages={messages} isStreaming={loading} />

        {/* Input Area */}
        <div className="p-6 bg-gradient-to-t from-[#fbfbfb] to-transparent">
          <div className="max-w-4xl mx-auto">
            <Composer onSend={send} isStreaming={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
