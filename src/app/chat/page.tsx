"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Search, Play, Plus, X, Gauge, Droplets, Construction, Loader2 } from "lucide-react";
import clsx from "clsx";

// --- Types ---
interface ProductSpec {
  consumptionPerM2: string;
  dryingTime: string;
  basis?: string;
  confidence: number;
}

interface Message {
  id: string;
  from: "user" | "bot";
  text?: string;
  type?: "text" | "product-card";
  productData?: {
    name: string;
    sku: string;
    image?: string;
    videoUrl?: string;
    specs?: ProductSpec;
  };
  timestamp: Date;
}

export default function SabanChatProduction() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | undefined>(undefined);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // הגדרות מנועי חיפוש (דילוג אוטומטי)
  const CX_LIST = ["1340c66f5e73a4076", "635bc3eeee0194b16"];
  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""; 

  useEffect(() => {
    setMounted(true);
    setMessages([{ 
      id: "1", from: "bot", 
      text: "שלום רמי, כאן SabanOS. שלח מוצר לקבלת נתונים טכניים, תמונה וסרטון הדרכה.", 
      timestamp: new Date() 
    }]);
  }, []);

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const fetchSpecs = async (query: string): Promise<ProductSpec | null> => {
    try {
      const res = await fetch("/api/specs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  };

  const fetchGoogleMedia = async (query: string) => {
    try {
      const res = await fetch(`https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${CX_LIST[0]}&q=${encodeURIComponent(query)}&searchType=image&num=1`);
      const data = await res.json();
      return {
        image: data.items?.[0]?.link || undefined,
        video: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query + " שיטת יישום")}`
      };
    } catch { return { image: undefined, video: undefined }; }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const currentInput = inputText;
    setMessages(prev => [...prev, { id: Date.now().toString(), from: "user", text: currentInput, timestamp: new Date() }]);
    setInputText("");
    setIsThinking(true);

    // ביצוע מקבילי: גוגל + Gemini
    const [media, specs] = await Promise.all([
      fetchGoogleMedia(currentInput),
      fetchSpecs(currentInput)
    ]);

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      from: "bot",
      type: "product-card",
      productData: {
        name: currentInput,
        sku: "99999",
        image: media.image,
        videoUrl: media.video,
        specs: specs || undefined
      },
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsThinking(false);
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-[#F0F2F5] text-[#111B21] font-sans rtl" dir="rtl">
      <div className="flex-1 flex flex-col relative bg-[#EFE7DE] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
        
        {/* Header - עיצוב בהיר ועבה */}
        <header className="h-[65px] bg-[#F0F2F5] flex items-center px-6 border-b border-[#D1D7DB] z-20 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center font-black text-white ml-3 shadow-md">ס</div>
          <h2 className="font-black text-lg tracking-tight">SabanOS - יועץ טכני חכם</h2>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scroll pb-32">
          {messages.map((msg) => (
            <div key={msg.id} className={clsx("flex flex-col", msg.from === "user" ? "items-start" : "items-end")}>
              <div className={clsx(
                "p-4 rounded-2xl max-w-[85%] shadow-sm border",
                msg.from === "user" ? "bg-[#D9FDD3] border-[#B6F1AD]" : "bg-white border-[#E9EDEF]"
              )}>
                {msg.text && <p className="text-[15px] font-black leading-relaxed">{msg.text}</p>}

                {msg.type === "product-card" && msg.productData && (
                  <div className="mt-4 bg-[#F8F9FA] rounded-xl overflow-hidden border border-[#D1D7DB]">
                    {msg.productData.image && <img src={msg.productData.image} className="w-full h-40 object-cover" />}
                    <div className="p-4 space-y-3">
                      <h3 className="font-black text-[#00a884] text-lg">{msg.productData.name}</h3>
                      <div className="grid grid-cols-1 gap-1 text-sm font-black">
                        <div className="flex items-center gap-2"><Gauge size={14} /> צריכה: <span className="text-[#00a884]">{msg.productData.specs?.consumptionPerM2 || "בבדיקה..."}</span></div>
                        <div className="flex items-center gap-2"><Droplets size={14} /> ייבוש: <span className="text-[#00a884]">{msg.productData.specs?.dryingTime || "בבדיקה..."}</span></div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => setActiveVideo(msg.productData?.videoUrl)} className="flex-1 bg-red-600 text-white p-2 rounded-lg font-black text-xs flex items-center justify-center gap-1"><Play size={14} fill="white" /> הדרכה</button>
                        <button className="flex-1 bg-[#00a884] text-white p-2 rounded-lg font-black text-xs flex items-center justify-center gap-1"><Plus size={14} /> הוסף</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex items-center gap-2 text-[#00a884] font-black text-xs animate-pulse">
              <Loader2 size={16} className="animate-spin" /> מחפש נתונים בגוגל ובמלאי...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input - ללא כפתור צף */}
        <footer className="p-4 bg-[#F0F2F5] border-t border-[#D1D7DB] flex items-center gap-4">
          <div className="flex-1 bg-white rounded-2xl px-5 py-3 border border-[#D1D7DB] shadow-sm">
            <input 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="כתוב מוצר..." 
              className="bg-transparent outline-none w-full text-[16px] font-black" 
            />
          </div>
          <button onClick={handleSend} className="bg-[#00a884] p-3.5 rounded-full text-white shadow-lg"><Send size={22} fill="currentColor" /></button>
        </footer>

        {/* נגן וידאו צף */}
        <AnimatePresence>
          {activeVideo && (
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="absolute bottom-28 left-6 z-50 w-64 bg-white rounded-xl shadow-2xl border-2 border-[#00a884] overflow-hidden">
              <div className="bg-[#00a884] p-2 flex justify-between items-center text-white text-[10px] font-black">
                <span>הדרכת יישום</span>
                <X size={14} className="cursor-pointer" onClick={() => setActiveVideo(undefined)} />
              </div>
              <iframe src={activeVideo} className="w-full aspect-video" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
