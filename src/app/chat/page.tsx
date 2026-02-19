"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../../components/chat/ProductCard";
import OrderSidebar from "../../components/chat/OrderSidebar";
import { useGoogleSearch } from "../../hooks/useGoogleSearch";
import { Send, X, Loader2 } from "lucide-react";

export default function ChatPage() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [order, setOrder] = useState<any[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { searchImages, searchVideo } = useGoogleSearch();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    setMounted(true); 
    setMessages([{ id: "init", role: "bot", text: "אהלן רמי, SabanOS מוכנה. איזה חומר נבדוק?" }]);
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isSearching]);

  if (!mounted) return null;

  const handleSend = async () => {
    if (!input.trim()) return;
    const q = input;
    setMessages(prev => [...prev, { id: Date.now(), role: "user", text: q }]);
    setInput("");
    setIsSearching(true);

    try {
      const [imgData, vidData, specRes] = await Promise.all([
        searchImages(q),
        searchVideo(q),
        fetch("/api/specs", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }) 
        }).then(r => r.json())
      ]);

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "bot",
        product: { name: q, imageUrl: imgData?.imageUrl, tutorialUrl: vidData?.videoUrl, specs: specRes }
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: "err", role: "bot", text: "שגיאה בשליפת נתונים." }]);
    } finally { setIsSearching(false); }
  };

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden" dir="rtl">
      <div className="flex-1 flex flex-col relative bg-[#EFE7DE]">
        <div className="absolute inset-0 opacity-10 pointer-events-none z-0 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat"></div>
        
        <header className="h-16 bg-[#F0F2F5] border-b flex items-center px-6 shadow-sm z-20">
          <h1 className="font-black text-emerald-800 text-xl">SabanOS — Logistics AI</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28 z-10 custom-scroll">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-start" : "items-end"}`}>
              <div className={`p-4 rounded-2xl max-w-[85%] shadow-md border ${m.role === "user" ? "bg-[#D9FDD3] text-[#111B21]" : "bg-white text-[#111B21]"}`}>
                {m.text && <p className="font-bold text-[15px] leading-relaxed">{m.text}</p>}
                {m.product && <ProductCard {...m.product} onWatchTutorial={() => setVideo(m.product.tutorialUrl)} onAddToOrder={(q:any) => setOrder(prev => [...prev, { ...m.product, qty: q }])} />}
              </div>
            </div>
          ))}
          {isSearching && <div className="text-emerald-700 font-black text-xs animate-pulse p-2 bg-white/50 rounded-lg w-fit">מעבד נתונים...</div>}
          <div ref={chatEndRef} />
        </div>

        <footer className="p-4 bg-[#F0F2F5] border-t z-20 flex gap-3 shadow-lg">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} className="flex-1 p-3 rounded-xl border border-gray-300 outline-none font-bold text-black" placeholder="חפש מוצר..." />
          <button onClick={handleSend} className="bg-[#00a884] text-white p-3 rounded-full shadow-lg active:scale-95"><Send size={24} /></button>
        </footer>

        {video && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl overflow-hidden w-full max-w-lg shadow-2xl relative">
              <button onClick={() => setVideo(null)} className="absolute top-4 right-4 z-50 bg-white/90 rounded-full p-2 text-black shadow-md"><X /></button>
              <iframe src={video.replace("watch?v=", "embed/")} className="w-full aspect-video" allowFullScreen />
            </div>
          </div>
        )}
      </div>
      <div className="w-[380px] hidden xl:block bg-white border-r z-30">
        <OrderSidebar items={order} onRemove={(sku:string) => setOrder(p => p.filter(it => it.sku !== sku))} />
      </div>
    </div>
  );
}
