"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, MoreVertical, Search, CheckCheck, Play, Plus, X, Gauge, Droplets, Construction } from "lucide-react";
import clsx from "clsx";

// --- Types ---
interface ProductSpec {
  consumptionPerM2: string;
  dryingTime: string;
  basis?: string;
  confidence: number;
  sources?: string[];
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

export default function SabanOSChat() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setMessages([{ 
      id: "1", from: "bot", 
      text: "אהלן רמי, כאן SabanOS. שלח שם מוצר ואשלוף לך מק\"ט, תמונה, נתוני צריכה וסרטון יישום.", 
      timestamp: new Date() 
    }]);
  }, []);

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  // --- API Calls ---
  const fetchSpecs = async (query: string): Promise<ProductSpec | null> => {
    try {
      const res = await fetch("/api/specs", {
        method: "POST",
        body: JSON.stringify({ query }),
        headers: { "Content-Type": "application/json" }
      });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  };

  const fetchGoogleMedia = async (query: string) => {
    // כאן אנחנו קוראים למנוע החיפוש שהגדרנו
    const cx = "635bc3eeee0194b16";
    const apiKey = "YOUR_GOOGLE_API_KEY"; // מומלץ להעביר ל-API Route כמו ה-specs
    try {
      const res = await fetch(`https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&searchType=image&num=1`);
      const data = await res.json();
      return {
        image: data.items?.[0]?.link || null,
        video: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query + " שיטת יישום")}`
      };
    } catch { return { image: null, video: null }; }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const currentInput = inputText;
    const userMsg: Message = { id: Date.now().toString(), from: "user", text: currentInput, timestamp: new Date() };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsThinking(true);

    // ריצה במקביל: גוגל מדיה + Gemini Specs
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
        sku: "99999", // כאן אפשר להוסיף לוגיקה לבדיקת מלאי מקומי
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
    <div className="flex h-screen bg-[#F0F2F5] text-[#111B21] font-sans selection:bg-[#00a884]/30 rtl" dir="rtl">
      
      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col relative bg-[#EFE7DE] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
        
        {/* Top Header */}
        <header className="h-[65px] bg-[#F0F2F5] flex items-center px-6 border-b border-[#D1D7DB] z-20 shadow-sm justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center font-black text-white ml-3 shadow-md">ס</div>
            <div>
              <h2 className="font-black text-lg tracking-tight">ח. סבן - יועץ AI</h2>
              <p className="text-[11px] text-[#00a884] font-bold">מחובר למלאי ולגוגל</p>
            </div>
          </div>
          <div className="flex gap-4 text-[#54656F]">
            <Search size={20} />
            <MoreVertical size={20} />
          </div>
        </header>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll pb-32">
          {messages.map((msg) => (
            <div key={msg.id} className={clsx("flex flex-col", msg.from === "user" ? "items-start" : "items-end")}>
              <div className={clsx(
                "p-3 rounded-2xl max-w-[85%] shadow-sm border",
                msg.from === "user" ? "bg-[#D9FDD3] border-[#B6F1AD]" : "bg-white border-[#E9EDEF]"
              )}>
                {msg.text && <p className="text-[15px] font-black leading-relaxed">{msg.text}</p>}

                {msg.type === "product-card" && msg.productData && (
                  <div className="mt-3 bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                    {msg.productData.image && (
                      <img src={msg.productData.image} alt={msg.productData.name} className="w-full h-44 object-cover" />
                    )}
                    <div className="p-4 space-y-3">
                      <h3 className="font-black text-[#00a884] text-lg underline decoration-2">{msg.productData.name}</h3>
                      
                      <div className="grid grid-cols-1 gap-2 text-[13px]">
                        <div className="flex items-center gap-2 font-black"><Gauge size={14} /> צריכה: <span className="text-[#00a884]">{msg.productData.specs?.consumptionPerM2 || "בבדיקה..."}</span></div>
                        <div className="flex items-center gap-2 font-black"><Droplets size={14} /> ייבוש: <span className="text-[#00a884]">{msg.productData.specs?.dryingTime || "בבדיקה..."}</span></div>
                        <div className="flex items-center gap-2 font-black"><Construction size={14} /> בסיס: <span className="text-gray-500">{msg.productData.specs?.basis || "מידע כללי"}</span></div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button onClick={() => setActiveVideo(msg.productData?.videoUrl || null)} className="flex-1 bg-red-600 text-white p-2 rounded-lg font-black text-xs flex items-center justify-center gap-1 shadow-md">
                          <Play size={14} fill="white" /> הדרכה
                        </button>
                        <button className="flex-1 bg-[#00a884] text-white p-2 rounded-lg font-black text-xs flex items-center justify-center gap-1 shadow-md">
                          <Plus size={14} /> הוסף לסל
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <span className="text-[9px] text-[#667781] font-bold mt-1 block text-left">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isThinking && <div className="text-[11px] font-black text-[#00a884] animate-pulse">SabanOS מחפש נתונים בגוגל...</div>}
          <div ref={chatEndRef} />
        </div>

        {/* Input Footer - No Floating Buttons */}
        <footer className="bg-[#F0F2F5] p-3 flex items-center gap-3 border-t border-[#D1D7DB] z-20">
          <Paperclip className="text-[#54656F] cursor-pointer" />
          <div className="flex-1 bg-white rounded-xl px-4 py-2.5 border border-[#D1D7DB]">
            <input 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="כתוב שם מוצר (למשל: סיקה 107)..." 
              className="bg-transparent outline-none w-full text-[15px] font-black" 
            />
          </div>
          <button onClick={handleSend} className="bg-[#00a884] p-3 rounded-full text-white shadow-lg">
            <Send size={20} fill="currentColor" />
          </button>
        </footer>

        {/* Floating PiP Video */}
        <AnimatePresence>
          {activeVideo && (
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="absolute bottom-24 left-4 z-50 w-64 bg-white rounded-xl shadow-2xl border-2 border-[#00a884] overflow-hidden">
              <div className="bg-[#00a884] p-1 flex justify-between items-center text-white px-2">
                <span className="text-[10px] font-black uppercase tracking-tighter">הדרכת וידאו</span>
                <X size={14} className="cursor-pointer" onClick={() => setActiveVideo(null)} />
              </div>
              <iframe src={activeVideo} className="w-full aspect-video" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
