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
  
  // מנועי חיפוש - המערכת תדלג ביניהם במידת הצורך
  const searchEngines = ["1340c66f5e73a4076", "635bc3eeee0194b16"];
  const [currentEngineIndex, setCurrentEngineIndex] = useState(0);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setMessages([
      { id: "1", from: "bot", text: "אהלן רמי, SabanOS מחוברת למנוע החיפוש החדש. שלח רשימה ונסדר לך הכל.", timestamp: new Date() }
    ]);

    // טעינת הסקריפט של גוגל עם המזהה החדש שסיפקת
    const script = document.createElement("script");
    script.src = `https://cse.google.com/cse.js?cx=${searchEngines[currentEngineIndex]}`;
    script.async = true;
    document.head.appendChild(script);
  }, [currentEngineIndex]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!mounted) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg = { id: Date.now().toString(), from: "user", text: inputText, timestamp: new Date() };
    setMessages(prev => [...prev, newMsg]);
    setInputText("");
    
    // בוט מגיב ומציע לפתוח חיפוש אם זוהה צורך במוצר
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: (Date.now()+1).toString(), 
        from: "bot", 
        text: "זיהיתי מוצר לחיפוש. פתחתי לך את חלונית גוגל לתוצאות ויזואליות.", 
        timestamp: new Date() 
      }]);
      setShowSearch(true);
    }, 1000);
  };

  return (
    <div className={clsx(
      "flex h-screen font-sans overflow-hidden transition-colors duration-500",
      isDarkMode ? "bg-[#0b141a] text-[#e9edef]" : "bg-[#f0f2f5] text-[#111b21]"
    )} dir="rtl">
      
      {/* Sidebar רשימת שיחות */}
      <div className={clsx(
        "w-[25%] hidden md:flex flex-col border-l transition-colors z-20",
        isDarkMode ? "bg-[#111b21] border-[#222d34]" : "bg-white border-[#d1d7db]"
      )}>
        <header className={clsx(
          "h-[60px] flex items-center px-4 justify-between transition-colors",
          isDarkMode ? "bg-[#202c33]" : "bg-[#f0f2f5]"
        )}>
          <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center font-bold text-white shadow-lg">ס</div>
          <div className="flex gap-4 items-center">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-black/10 transition-all">
              {isDarkMode ? <Sun size={20} className="text-[#8696a0]" /> : <Moon size={20} className="text-[#54656f]" />}
            </button>
            <CheckCheck size={20} className={isDarkMode ? "text-[#8696a0]" : "text-[#54656f]"} />
            <MoreVertical size={20} className={isDarkMode ? "text-[#8696a0]" : "text-[#54656f]"} />
          </div>
        </header>
        <div className="p-4">
          <p className="text-[10px] text-gray-500 font-black mb-2 uppercase italic tracking-widest">מנוע פעיל: {searchEngines[currentEngineIndex]}</p>
          <button 
            onClick={() => setCurrentEngineIndex((currentEngineIndex + 1) % searchEngines.length)}
            className="text-[10px] bg-[#00a884]/20 text-[#00a884] px-2 py-1 rounded hover:bg-[#00a884]/30"
          >
            החלף מנוע חיפוש
          </button>
        </div>
      </div>

      {/* אזור הצ'אט המרכזי */}
      <div className="flex-1 flex flex-col relative shadow-2xl z-10">
        <header className={clsx(
          "h-[60px] flex items-center px-4 z-20 border-b transition-colors",
          isDarkMode ? "bg-[#202c33] border-[#0b141a]" : "bg-[#f0f2f5] border-[#d1d7db]"
        )}>
          <div>
            <h2 className="font-bold text-sm">SabanOS - בקרה לוגיסטית</h2>
            <p className="text-[11px] text-[#00a884]">Google Multi-Engine Connected</p>
          </div>
          <button onClick={() => setShowSearch(!showSearch)} className="mr-auto p-2 text-gray-400 hover:text-[#00a884] transition-colors">
            <Search size={22} />
          </button>
        </header>

        {/* גוף הצ'אט */}
        <div className={clsx(
          "flex-1 overflow-y-auto p-6 space-y-4 relative custom-scroll pb-24", // הוספתי פאדינג תחתון כדי שהשדה לא יסתיר כלום
          isDarkMode ? "bg-[#0b141a]" : "bg-[#efe7de]"
        )}>
          {/* רקע ווטסאפ */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat"></div>

          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={clsx("flex flex-col relative z-10", msg.from === "user" ? "mr-auto items-start" : "ml-auto items-end")}>
                <div className={clsx(
                  "p-3 rounded-2xl shadow-sm max-w-[85%]",
                  msg.from === "user" ? (isDarkMode ? "bg-[#005c4b] text-white" : "bg-[#d9fdd3] text-[#111b21]") : (isDarkMode ? "bg-[#202c33] text-[#e9edef]" : "bg-white text-[#111b21]")
                )}>
                  <p className="text-[14.5px] leading-tight ml-4">{msg.text}</p>
                  <span className="text-[9px] opacity-60 mt-1 block font-mono italic">
                    {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />

          {/* חיפוש גוגל - ללא כפתורים צפים, רק חלונית נקייה */}
          <AnimatePresence>
            {showSearch && (
              <motion.div 
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                className={clsx("absolute inset-0 z-30 p-4 flex flex-col transition-colors", isDarkMode ? "bg-[#0b141a]" : "bg-[#f0f2f5]")}
              >
                <div className="flex justify-between items-center mb-4 border-b border-[#00a884]/20 pb-2">
                  <h3 className="font-bold text-[#00a884] italic">Saban Google Search</h3>
                  <button onClick={() => setShowSearch(false)} className="text-gray-500 hover:text-red-500"><X size={24} /></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scroll">
                  <div className="gcse-search"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* שדה כתיבה - נקי, רחב, ללא שום כפתור צף מעליו */}
        <footer className={clsx(
          "p-4 flex items-center gap-4 transition-colors z-20",
          isDarkMode ? "bg-[#202c33]" : "bg-[#f0f2f5]"
        )}>
          <Paperclip className="text-[#8696a0] cursor-pointer hover:text-[#00a884]" size={24} />
          <div className={clsx("flex-1 rounded-2xl px-4 py-3 transition-colors", isDarkMode ? "bg-[#2a3942]" : "bg-white shadow-sm")}>
            <input 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && handleSend()} 
              placeholder="כתוב רשימת מוצרים כאן..." 
              className="bg-transparent outline-none w-full text-[15px]" 
            />
          </div>
          <button onClick={handleSend} className="bg-[#00a884] p-3 rounded-full text-white shadow-2xl hover:scale-105 active:scale-95 transition-all">
            <Send size={22} fill="currentColor" />
          </button>
        </footer>
      </div>

      <style jsx global>{`
        .gcse-search { min-height: 400px; }
        .gsc-control-cse { background-color: transparent !important; border: none !important; padding: 0 !important; }
        .gsc-input-box { 
          background-color: ${isDarkMode ? '#2a3942' : 'white'} !important; 
          border-radius: 16px !important;
          border: 1px solid ${isDarkMode ? '#374151' : '#d1d7db'} !important;
        }
        .gs-title, .gs-snippet, .gs-promotion { color: ${isDarkMode ? '#e9edef' : '#111b21'} !important; }
        .gsc-search-button-v2 { background-color: #00a884 !important; border-radius: 12px !important; }
      `}</style>
    </div>
  );
}
