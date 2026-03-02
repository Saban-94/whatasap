"use client";
import React, { useState, useRef, useEffect } from "react";
import { ProductCard } from "@/components/chat/ProductCard";
import { Send, Loader2, Bot } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(p => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      setMessages(p => [...p, { role: 'assistant', content: data.text, products: data.products }]);
    } catch (e) {
      setMessages(p => [...p, { role: 'assistant', content: "שגיאת תקשורת." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto pt-20 pb-32">
        <div className="space-y-8">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[90%] p-5 rounded-[30px] ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-100 rounded-bl-none border border-white/5'}`}>
                <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: m.content }} />
                {/* הצגת כרטיסי מוצר בתוך התשובה */}
                {m.products && m.products.map((p: any) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          ))}
          {loading && <div className="text-blue-500 font-bold animate-pulse italic">סבן AI בודק במלאי...</div>}
          <div ref={scrollRef} />
        </div>
      </div>
      {/* Input מובייל ודסקטופ חסין */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent">
        <div className="max-w-4xl mx-auto relative">
          <input className="w-full bg-slate-800 p-5 pl-16 rounded-full outline-none border border-white/5 focus:border-blue-500 font-bold" placeholder="שאל אותי על סיקה, דבקים או שעות פתיחה..." value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && send()} />
          <button onClick={send} className="absolute left-2 top-2 bottom-2 w-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-all"><Send size={20} /></button>
        </div>
      </div>
    </div>
  );
}
