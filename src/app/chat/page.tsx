"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Search, Play, Plus, X, Droplets, Gauge, Construction } from "lucide-react";
import clsx from "clsx";

export default function SabanSmartChat() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [activeVideo, setActiveVideo] = useState<string | null>(null); // חלון וידאו מוזער
  const [selectedProduct, setSelectedProduct] = useState<any>(null); // מוצר לבחירת כמות
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setMessages([
      { 
        id: "1", from: "bot", 
        text: "שלום רמי, כאן היועץ הטכני של סבן. שלח שם מוצר לקבלת נתוני צריכה, ייבוש וסרטון הדרכה.", 
        timestamp: new Date() 
      }
    ]);
  }, []);

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  if (!mounted) return null;

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userText = inputText;
    setMessages(prev => [...prev, { id: Date.now().toString(), from: "user", text: userText, timestamp: new Date() }]);
    setInputText("");

    // סימולציית שליפת נתונים טכניים (במציאות יגיע מ-Gemini/Google)
    setTimeout(() => {
      const botMsg = {
        id: (Date.now() + 1).toString(),
        from: "bot",
        type: "product-card",
        name: userText.includes("סיקה") ? "סיקה טופסיל 107" : userText,
        consumption: "1.5 ק\"ג למ\"ר",
        drying: "4-6 שעות",
        method: "מריחה בשתי שכבות מוצלבות",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // לינק להטמעה
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-[#F0F2F5] text-[#111B21] overflow-hidden font-sans selection:bg-[#00a884]/30" dir="rtl">
      
      <div className="flex-1 flex flex-col relative bg-[#EFE7DE] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-100">
        
        {/* Header - עיצוב בהיר */}
        <header className="h-[65px] bg-[#F0F2F5] flex items-center px-6 border-b border-[#D1D7DB] z-20 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center font-black text-white ml-3 shadow-md">ס</div>
          <div>
            <h2 className="font-black text-lg tracking-tight">ח. סבן - ייעוץ טכני</h2>
            <p className="text-[12px] text-[#00a884] font-bold">מחובר למאגר נתונים גוגל</p>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scroll pb-32">
          {messages.map((msg) => (
            <div key={msg.id} className={clsx("flex flex-col", msg.from === "user" ? "items-start" : "items-end")}>
              <div className={clsx(
                "p-4 rounded-2xl max-w-[85%] shadow-sm relative border",
                msg.from === "user" ? "bg-[#D9FDD3] border-[#B6F1AD]" : "bg-white border-[#E9EDEF]"
              )}>
                {msg.text && <p className="text-[15px] font-black leading-relaxed">{msg.text}</p>}
                
                {msg.type === "product-card" && (
                  <div className="mt-4 space-y-3 bg-[#F8F9FA] p-4 rounded-xl border border-[#D1D7DB]">
                    <h3 className="text-[#00a884] font-black text-lg border-b pb-1">{msg.name}</h3>
                    
                    <div className="grid grid-cols-1 gap-2 text-[14px]">
                      <div className="flex items-center gap-2 font-black">
                        <Gauge size={16} className="text-[#54656F]" />
                        <span>צריכה: <span className="text-[#00a884]">{msg.consumption}</span></span>
                      </div>
                      <div className="flex items-center gap-2 font-black">
                        <Droplets size={16} className="text-[#54656F]" />
                        <span>זמן ייבוש: <span className="text-[#00a884]">{msg.drying}</span></span>
                      </div>
                      <div className="flex items-center gap-2 font-black">
                        <Construction size={16} className="text-[#54656F]" />
                        <span>שיטה: <span className="text-[#00a884]">{msg.method}</span></span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => setActiveVideo(msg.videoUrl)}
                        className="flex-1 bg-[#25D366] text-white p-2 rounded-lg font-black flex items-center justify-center gap-2 shadow-sm hover:bg-[#20bd5a]"
                      >
                        <Play size={16} fill="white" /> צפה בהדרכה
                      </button>
                      <button 
                        onClick={() => setSelectedProduct(msg)}
                        className="flex-1 bg-[#00a884] text-white p-2 rounded-lg font-black flex items-center justify-center gap-2 shadow-sm hover:bg-[#008f72]"
                      >
                        <Plus size={16} /> הוסף להזמנה
                      </button>
                    </div>
                  </div>
                )}
                <span className="text-[10px] text-[#667781] font-bold mt-2 block text-left uppercase">
                  {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* שדה כתיבה - ללא כפתור צף מסתיר */}
        <footer className="bg-[#F0F2F5] p-4 flex items-center gap-4 border-t border-[#D1D7DB] z-40">
          <Paperclip className="text-[#54656F] cursor-pointer" size={26} />
          <div className="flex-1 bg-white rounded-2xl px-5 py-3 border border-[#D1D7DB] shadow-sm">
            <input 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="כתוב מוצר לקבלת מפרט..." 
              className="bg-transparent outline-none w-full text-[16px] font-black placeholder:text-[#8696A0]" 
            />
          </div>
          <button onClick={handleSend} className="bg-[#00a884] p-3.5 rounded-full text-white shadow-lg active:scale-95 transition-all">
            <Send size={22} fill="currentColor" />
          </button>
        </footer>

        {/* --- חלון וידאו מוזער (Floating PiP) --- */}
        <AnimatePresence>
          {activeVideo && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="absolute bottom-28 left-6 z-50 w-[280px] bg-white rounded-2xl shadow-2xl border-4 border-[#00a884] overflow-hidden"
            >
              <div className="bg-[#00a884] p-2 flex justify-between items-center text-white">
                <span className="text-[10px] font-black uppercase">הדרכת יישום סבן</span>
                <X size={18} className="cursor-pointer" onClick={() => setActiveVideo(null)} />
              </div>
              <div className="aspect-video bg-black">
                <iframe 
                  src={activeVideo} 
                  className="w-full h-full" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- בחירת כמות מוצר --- */}
        <AnimatePresence>
          {selectedProduct && (
            <div className="absolute inset-0 z-[60] bg-black/40 flex items-center justify-center p-6 backdrop-blur-sm">
              <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-white p-8 rounded-[30px] w-full max-w-sm shadow-2xl">
                <h3 className="font-black text-xl mb-2 text-center">הוספה לסל: {selectedProduct.name}</h3>
                <p className="text-center text-sm font-bold text-gray-500 mb-6">כמה יחידות להוסיף לפרויקט?</p>
                <input type="number" defaultValue="1" className="w-full p-4 border-2 border-[#00a884] rounded-2xl text-center font-black text-2xl mb-6 outline-none" />
                <div className="flex gap-4">
                   <button onClick={() => setSelectedProduct(null)} className="flex-1 bg-gray-100 py-4 rounded-2xl font-black">ביטול</button>
                   <button onClick={() => setSelectedProduct(null)} className="flex-1 bg-[#00a884] text-white py-4 rounded-2xl font-black shadow-lg">אישור הוספה</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
