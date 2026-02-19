"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../../components/chat/ProductCard";
import OrderSidebar from "../../components/chat/OrderSidebar";
import { useGoogleSearch } from "../../hooks/useGoogleSearch";
import { Send, X } from "lucide-react";
import clsx from "clsx";

export default function ChatPage() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [order, setOrder] = useState<any[]>([]);
  const [pipVideo, setPipVideo] = useState<string | null>(null);
  const { searchImages, searchVideo } = useGoogleSearch();

  useEffect(() => {
    setMounted(true);
    setMessages([{ id: "1", role: "bot", text: "שלום רמי, אני היועץ החכם של סבן. איזה מוצר נחפש היום?" }]);
  }, []);

  if (!mounted) return null;

  const handleSend = async () => {
    if (!input.trim()) return;
    const query = input;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", text: query }]);
    setInput("");

    // חיפושים מקבילים
    const [img, vid] = await Promise.all([searchImages(query), searchVideo(query)]);
    
    // שליפת specs (API נפרד)
    const specRes = await fetch("/api/specs", { method: "POST", body: JSON.stringify({ query }) });
    const specs = await specRes.json();

    setMessages(prev => [...prev, {
      id: (Date.now()+1).toString(),
      role: "bot",
      product: { query, imageUrl: img, tutorialUrl: vid, specs, sku: "99999" }
    }]);
  };

  return (
    <div className="flex h-screen bg-[#F0F2F5]" dir="rtl">
      <div className="flex-1 flex flex-col relative bg-[#EFE7DE] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
        <header className="h-14 bg-[#F0F2F5] border-b flex items-center px-6 justify-between">
            <h1 className="font-black text-emerald-700">SabanOS Logistics</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
          {messages.map(m => (
            <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-start" : "items-end"}`}>
              <div className={`p-3 rounded-xl max-w-[80%] shadow-sm ${m.role === "user" ? "bg-[#D9FDD3]" : "bg-white"}`}>
                {m.text && <p className="font-bold text-sm">{m.text}</p>}
                {m.product && <ProductCard name={m.product.query} imageUrl={m.product.imageUrl} specs={m.product.specs} sku={m.product.sku} onWatchTutorial={() => setPipVideo(m.product.tutorialUrl)} onAddToOrder={(q:number)=>setOrder(prev=>[...prev, {name:m.product.query, sku:m.product.sku, qty:q}])} />}
              </div>
            </div>
          ))}
        </div>

        <footer className="p-3 bg-[#F0F2F5] border-t flex items-center gap-3">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSend()} className="flex-1 bg-white rounded-xl p-3 outline-none font-bold" placeholder="כתוב מוצר..." />
          <button onClick={handleSend} className="bg-emerald-600 text-white p-3 rounded-full"><Send size={20}/></button>
        </footer>

        <AnimatePresence>
          {pipVideo && (
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="absolute bottom-24 right-4 w-64 h-40 bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-emerald-500 z-50">
              <button onClick={()=>setPipVideo(null)} className="absolute top-2 left-2 text-white bg-black/50 rounded-full p-1"><X size={16}/></button>
              <iframe src={pipVideo.replace("watch?v=", "embed/")} className="w-full h-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="w-[350px] hidden lg:block">
        <OrderSidebar items={order} onRemove={(sku:string)=>setOrder(prev=>prev.filter(it=>it.sku!==sku))} />
      </div>
    </div>
  );
}
