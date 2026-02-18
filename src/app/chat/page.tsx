"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, MoreVertical, Search, CheckCheck, X, Info } from "lucide-react";
import clsx from "clsx";

export default function SabanChatPage() {
  const [messages, setMessages] = useState<any[]>([
    { id: "1", from: "bot", text: "אהלן רמי, כאן יועץ המכירות של סבן. השתמש בחימוש גוגל המובנה למציאת מוצרים וסרטונים.", timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState("");
  const [showSearch, setShowSearch] = useState(false); // מצב תצוגת חיפוש גוגל
  const chatEndRef = useRef<HTMLDivElement>(null);

  // טעינת הסקריפט של גוגל פעם אחת
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cse.google.com/cse.js?cx=1340c66f5e73a4076";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), from: "user", text: inputText, timestamp: new Date() }]);
    setInputText("");
    
    // סימולציית תגובה
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: (Date.now()+1).toString(), 
        from: "bot", 
        text: "חיפשתי את מה שביקשת במנוע של גוגל. בדוק את תוצאות החיפוש בחלון הייעודי.", 
        timestamp: new Date() 
      }]);
      setShowSearch(true);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-[#0b141a] text-[#e9edef] font-sans overflow-hidden" dir="rtl">
      
      {/* 1. Sidebar שמאל - רשימת שיחות */}
      <div className="w-[25%] bg-[#111b21] border-l border-[#222d34] hidden md:flex flex-col">
        <header className="h-[60px] bg-[#202c33] flex items-center px-4 justify-between">
          <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center font-bold">ס</div>
          <div className="flex gap-4 text-[#8696a0]">
            <CheckCheck size={20} />
            <MoreVertical size={20} />
          </div>
        </header>
        <div className="p-4 overflow-y-auto">
          <p className="text-xs text-gray-500 font-bold mb-4 uppercase tracking-widest">חיפוש מוצר מהיר</p>
          {/* כאן ניתן להוסיף רשימת מוצרים מהירה */}
        </div>
      </div>

      {/* 2. חלון צ'אט מרכזי */}
      <div className="flex-1 flex flex-col relative border-r border-[#222d34] shadow-2xl">
        <header className="h-[60px] bg-[#202c33] flex items-center px-4 border-b border-[#0b141a] z-20">
          <div className="mr-3">
            <h2 className="font-bold text-sm text-[#e9edef]">SabanOS AI Advisor</h2>
            <p className="text-[11px] text-[#00a884]">Google Search Enabled</p>
          </div>
          <button 
            onClick={() => setShowSearch(!showSearch)} 
            className={clsx("mr-auto p-2 rounded-xl transition-all", showSearch ? "bg-[#00a884] text-white" : "bg-[#2a3942] text-gray-400")}
          >
            <Search size={20} />
          </button>
        </header>

        {/* גוף ההודעות */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0b141a] custom-scroll relative">
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={clsx("flex flex-col", msg.from === "user" ? "mr-auto items-start" : "ml-auto items-end")}>
              <div className={clsx("p-3 rounded-2xl shadow-lg max-w-[80%]", msg.from === "user" ? "bg-[#005c4b]" : "bg-[#202c33]")}>
                <p className="text-[14px] leading-tight">{msg.text}</p>
                <span className="text-[9px] text-gray-400 mt-1 block">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </motion.div>
          ))}
          <div ref={chatEndRef} />

          {/* 3. רכיב החיפוש של גוגל - מוטמע כ-Overlay */}
          <AnimatePresence>
            {showSearch && (
              <motion.div 
                initial={{ x: "100%" }} 
                animate={{ x: 0 }} 
                exit={{ x: "100%" }} 
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute inset-0 z-30 bg-[#0b141a] p-4 flex flex-col"
              >
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                  <h3 className="font-bold text-[#00a884]">חיפוש מוצרים וסרטונים</h3>
                  <button onClick={() => setShowSearch(false)} className="text-gray-500 hover:text-white">
                    <X size={24} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scroll google-search-container">
                  {/* הרכיב של גוגל */}
                  <div className="gcse-search"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* פוטר כתיבה */}
        <footer className="bg-[#202c33] p-3 flex items-center gap-3">
          <Paperclip className="text-[#8696a0] cursor-pointer" size={24} />
          <div className="flex-1 bg-[#2a3942] rounded-xl px-4 py-2">
            <input 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && handleSend()} 
              placeholder="כתוב הודעה..." 
              className="bg-transparent outline-none w-full text-sm text-white" 
            />
          </div>
          <button onClick={handleSend} className="bg-[#00a884] p-2.5 rounded-full text-[#0b141a]">
            <Send size={20} fill="currentColor" />
          </button>
        </footer>
      </div>

      {/* 4. Sidebar ימין - סיכום הזמנה */}
      <div className="w-[20%] bg-[#111b21] hidden lg:flex flex-col p-4">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">סל הזמנה</h3>
        <div className="flex-1 italic text-[11px] text-gray-600 text-center mt-10">
          חפש מוצרים בגוגל והוסף אותם לכאן ידנית או דרך היועץ.
        </div>
      </div>

      {/* עיצוב משלים לחיפוש של גוגל כדי שיתאים ל-Dark Mode */}
      <style jsx global>{`
        .gcse-search { min-height: 400px; }
        .gsc-control-cse { 
          background-color: transparent !important; 
          border: none !important; 
          padding: 0 !important;
        }
        .gsc-search-button-v2 { background-color: #00a884 !important; border: none !important; }
        .gsc-input-box { background-color: #2a3942 !important; border: 1px solid #222d34 !important; color: white !important; }
        .gsc-input { color: white !important; }
        .gs-title, .gs-snippet { color: #e9edef !important; }
        .gs-promotion { background-color: #202c33 !important; }
      `}</style>
    </div>
  );
}
