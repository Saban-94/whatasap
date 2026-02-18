"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, MoreVertical, Search, CheckCheck, X, Sun, Moon, Info } from "lucide-react";
import clsx from "clsx";

export default function SabanChatPage() {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // מניעת שגיאת Hydration - רנדור רק לאחר טעינה בדפדפן
  useEffect(() => {
    setMounted(true);
    // הודעת פתיחה רק לאחר טעינה
    setMessages([
      { id: "1", from: "bot", text: "אהלן רמי, SabanOS מוכנה. איך אפשר לעזור היום?", timestamp: new Date() }
    ]);

    // טעינת סקריפט גוגל
    const script = document.createElement("script");
    script.src = "https://cse.google.com/cse.js?cx=1340c66f5e73a4076";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!mounted) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg = { id: Date.now().toString(), from: "user", text: inputText, timestamp: new Date() };
    setMessages(prev => [...prev, newMsg]);
    setInputText("");
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: (Date.now()+1).toString(), 
        from: "bot", 
        text: "ההודעה התקבלה במערכת סבן. בודק מלאי וזמינות הובלה...", 
        timestamp: new Date() 
      }]);
    }, 1000);
  };

  return (
    <div className={clsx(
      "flex h-screen font-sans overflow-hidden transition-colors duration-500",
      isDarkMode ? "bg-[#0b141a] text-[#e9edef]" : "bg-[#f0f2f5] text-[#111b21]"
    )} dir="rtl">
      
      {/* 1. Sidebar שמאל - רשימת שיחות */}
      <div className={clsx(
        "w-[25%] hidden md:flex flex-col border-l transition-colors",
        isDarkMode ? "bg-[#111b21] border-[#222d34]" : "bg-white border-[#d1d7db]"
      )}>
        <header className={clsx(
          "h-[60px] flex items-center px-4 justify-between transition-colors",
          isDarkMode ? "bg-[#202c33]" : "bg-[#f0f2f5]"
        )}>
          <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center font-bold text-white shadow-lg">ס</div>
          <div className="flex gap-4 items-center">
            {/* כפתור החלפת Theme */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-black/10 transition-all"
            >
              {isDarkMode ? <Sun size={20} className="text-[#8696a0]" /> : <Moon size={20} className="text-[#54656f]" />}
            </button>
            <CheckCheck size={20} className={isDarkMode ? "text-[#8696a0]" : "text-[#54656f]"} />
            <MoreVertical size={20} className={isDarkMode ? "text-[#8696a0]" : "text-[#54656f]"} />
          </div>
        </header>
        <div className="p-4">
          <div className={clsx(
            "rounded-lg flex items-center px-4 py-1.5 gap-4 transition-colors",
            isDarkMode ? "bg-[#202c33]" : "bg-[#f0f2f5]"
          )}>
            <Search size={18} className="text-[#8696a0]" />
            <input placeholder="חפש שיחה..." className="bg-transparent outline-none text-sm w-full" />
          </div>
        </div>
      </div>

      {/* 2. חלון צ'אט מרכזי */}
      <div className="flex-1 flex flex-col relative shadow-2xl border-r border-black/5">
        <header className={clsx(
          "h-[60px] flex items-center px-4 z-20 border-b transition-colors",
          isDarkMode ? "bg-[#202c33] border-[#0b141a]" : "bg-[#f0f2f5] border-[#d1d7db]"
        )}>
          <div className="mr-3">
            <h2 className="font-bold text-sm">SabanOS - יועץ לוגיסטי</h2>
            <p className="text-[11px] text-[#00a884]">מחובר למערכת המלאי</p>
          </div>
          <button 
            onClick={() => setShowSearch(!showSearch)} 
            className={clsx("mr-auto p-2 rounded-xl transition-all", showSearch ? "bg-[#00a884] text-white" : "text-gray-400")}
          >
            <Search size={20} />
          </button>
        </header>

        {/* גוף ההודעות עם רקע ווטסאפ קלאסי */}
        <div className={clsx(
          "flex-1 overflow-y-auto p-6 space-y-4 relative custom-scroll",
          isDarkMode ? "bg-[#0b141a]" : "bg-[#efe7de]"
        )}>
          {/* תמונת רקע ווטסאפ עדינה */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat"></div>

          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className={clsx("flex flex-col relative z-10", msg.from === "user" ? "mr-auto items-start" : "ml-auto items-end")}
              >
                <div className={clsx(
                  "p-3 rounded-2xl shadow-sm max-w-[85%] relative",
                  msg.from === "user" 
                    ? (isDarkMode ? "bg-[#005c4b] text-white" : "bg-[#d9fdd3] text-[#111b21]")
                    : (isDarkMode ? "bg-[#202c33] text-[#e9edef]" : "bg-white text-[#111b21]")
                )}>
                  <p className="text-[14.5px] leading-tight ml-4">{msg.text}</p>
                  <span className="text-[9px] opacity-60 mt-1 block text-left font-mono">
                    {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />

          {/* חיפוש גוגל בשכבה צפה */}
          <AnimatePresence>
            {showSearch && (
              <motion.div 
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                className={clsx(
                  "absolute inset-0 z-30 p-4 flex flex-col transition-colors",
                  isDarkMode ? "bg-[#0b141a]" : "bg-[#f0f2f5]"
                )}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-[#00a884]">חיפוש מוצרים - גוגל</h3>
                  <button onClick={() => setShowSearch(false)} className="text-gray-500"><X size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto gcse-container">
                  <div className="gcse-search"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* שדה כתיבה */}
        <footer className={clsx(
          "p-3 flex items-center gap-3 transition-colors",
          isDarkMode ? "bg-[#202c33]" : "bg-[#f0f2f5]"
        )}>
          <Paperclip className="text-[#8696a0] cursor-pointer" size={24} />
          <div className={clsx(
            "flex-1 rounded-xl px-4 py-2 transition-colors",
            isDarkMode ? "bg-[#2a3942]" : "bg-white shadow-sm"
          )}>
            <input 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && handleSend()} 
              placeholder="כתוב הודעה..." 
              className="bg-transparent outline-none w-full text-sm" 
            />
          </div>
          <button onClick={handleSend} className="bg-[#00a884] p-2.5 rounded-full text-white shadow-lg active:scale-90 transition-all">
            <Send size={20} fill="currentColor" />
          </button>
        </footer>
      </div>

      <style jsx global>{`
        .gcse-search { min-height: 400px; }
        .gsc-control-cse { 
          background-color: transparent !important; 
          border: none !important; 
          padding: 0 !important;
        }
        .gsc-input-box { 
          background-color: ${isDarkMode ? '#2a3942' : 'white'} !important; 
          border-radius: 12px !important;
        }
        .gs-title, .gs-snippet { color: ${isDarkMode ? '#e9edef' : '#111b21'} !important; }
      `}</style>
    </div>
  );
}
