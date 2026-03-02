"use client";
import React, { useState } from "react";
// שימוש בשמות קבצים מדויקים (PascalCase לרכיבים)
import { MessageList } from "@/components/chat/message-list";
import { Composer } from "@/components/chat/Composer"; 
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      
      setMessages(p => [...p, { 
        id: (Date.now() + 1).toString(),
        role: 'assistant', 
        content: data.text, 
        products: data.products,
        uiBlueprint: data.uiBlueprint 
      }]);
    } catch (e) {
      console.error("Chat Error:", e);
      setMessages(p => [...p, { role: 'assistant', content: "תקלה בתקשורת עם המחסן." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="relative h-screen w-full bg-[#fbfbfb] overflow-hidden" dir="rtl">
      {/* רקע יוקרתי SabanOS */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Header יוקרתי */}
        <div className="p-4 flex justify-between items-center border-b border-slate-100 bg-white/70 backdrop-blur-lg">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#0B2C63] rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="font-black text-[#0B2C63] text-xl italic tracking-tighter">SABAN AI</span>
          </div>
          <button onClick={() => setMessages([])} className="p-2 text-slate-300 hover:text-red-500 transition-all active:scale-90">
            <Trash2 size={20} />
          </button>
        </div>

        {/* Message List המונפש */}
        <MessageList messages={messages} isStreaming={loading} />

        {/* Input Area */}
        <div className="p-6 bg-gradient-to-t from-[#fbfbfb] via-[#fbfbfb] to-transparent">
          <div className="max-w-4xl mx-auto">
            <Composer onSend={send} isStreaming={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
