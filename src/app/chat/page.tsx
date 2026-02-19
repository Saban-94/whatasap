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
    setMessages([{ id: "init", role: "bot", text: "שלום רמי, אני היועץ הטכני של סבן. איזה מוצר נבדוק היום?" }]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSearching]);

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
        product: { 
          name: q, 
          imageUrl: imgData.imageUrl, 
          tutorialUrl: vidData.videoUrl, 
          specs: specRes,
          sku: "99999"
        }
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now(), role: "bot", text: "מצטער, הייתה לי תקלה בשליפת הנתונים. נסה שוב." }]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F0F2F5] font-sans overflow-hidden" dir="rtl">
      <div className="flex-1 flex flex-col relative bg-[#EFE7DE] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
        
        {/* Header */}
        <header className="h-14 bg-[#F0F2F5] border-b flex items-center px-6 justify-between shadow-sm z-10">
            <h1 className="font-black text-emerald-700 text-lg">SabanOS — Logistics AI</h1>
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">ס</div>
        </header>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 custom-scroll">
          {messages.map((m) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} className={`flex flex-col ${m.role === "user" ? "items-start" : "items-end"}`}>
              <div className={`p-3 rounded-2xl max-w-[85%] shadow-sm ${m.role === "user" ? "bg-[#D9FDD3]" : "bg-white border border-gray-100"}`}>
                {m.text && <p className="font-bold text-sm leading-relaxed">{m.text}</p>}
                {m.product && <ProductCard {...m.product} onWatchTutorial={() => setVideo(m.product.tutorialUrl)} onAddToOrder={(q) => setOrder(prev => [...prev, { ...m.product, qty: q }])} />}
              </div>
            </motion.div>
          ))}
          {isSearching && (
            <div className="flex items-center gap-2 text-emerald-700 font-black text-xs animate-pulse bg-white/80 p-2 rounded-lg w-fit ml-auto">
              <Loader2 className="animate-spin" size={14} /> SabanOS מעבד נתונים...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Footer Input */}
        <footer className="p-3 bg-[#F0F2F5] border-t flex gap-3 items-center z-10">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={e => e.key === "Enter" && handleSend()} 
            className="flex-1 p-3 rounded-xl outline-none font-black text-sm shadow-inner border border-gray-200" 
            placeholder="איזה מוצר נחפש? (למשל: סיקה 107)" 
          />
          <button onClick={handleSend} className="bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700 transition-colors shadow-md">
            <Send size={20} />
          </button>
        </footer>

        {/* PiP Video Window */}
        <AnimatePresence>
          {video && (
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="absolute bottom-20 left-4 w-72 bg-black rounded-2xl border-2 border-emerald-500 overflow-hidden shadow-2xl z-50">
              <div className="bg-emerald-500 p-1 flex justify-between px-2">
                <span className="text-[10px] font-black text-white">הדרכת וידאו סבן</span>
                <button onClick={() => setVideo(null)} className="text-white"><X size={14}/></button>
              </div>
              <iframe src={video.replace("watch?v=", "embed/")} className="w-full aspect-video" allowFullScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sidebar - Visible on Desktop */}
      <div className="w-80 hidden lg:block border-r border-gray-200 bg-white">
        <OrderSidebar 
          items={order} 
          onRemove={(sku:string) => setOrder(p => p.filter(it => it.sku !== sku))} 
        />
      </div>
    </div>
  );
}
