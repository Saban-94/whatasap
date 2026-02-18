"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Search, PlayCircle, Loader2 } from "lucide-react";
import clsx from "clsx";

export default function SabanSmartChat() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // הגדרות מנועי חיפוש (דילוג אוטומטי)
  const GOOGLE_API_KEY = "YOUR_API_KEY"; // להחליף במפתח שלך
  const CX_LIST = ["1340c66f5e73a4076", "635bc3eeee0194b16"];

  useEffect(() => {
    setMounted(true);
    setMessages([{ id: "1", from: "bot", text: "אהלן רמי, אני סורק עבורך מלאי ומדיה בגוגל במקביל. מה נדרש?", timestamp: new Date() }]);
  }, []);

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const searchGoogleShadow = async (query: string) => {
    // מחפש תמונה וסרטון במקביל
    try {
      const res = await fetch(`https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${CX_LIST[0]}&q=${encodeURIComponent(query)}&searchType=image&num=1`);
      const data = await res.json();
      return {
        image: data.items?.[0]?.link || null,
        video: `https://www.youtube.com/results?search_query=${encodeURIComponent(query + " שיטת יישום")}`
      };
    } catch { return { image: null, video: null }; }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const userText = inputText;
    setMessages(prev => [...prev, { id: Date.now().toString(), from: "user", text: userText, timestamp: new Date() }]);
    setInputText("");
    setIsSearching(true);

    // לוגיקה: חיפוש מאחורי הקלעים
    const media = await searchGoogleShadow(userText);
    
    // דימוי בדיקת מלאי
    const isInStock = Math.random() > 0.3; // כאן תבוא הבדיקה מול ה-DB שלך

    setTimeout(() => {
      const botMsg = {
        id: (Date.now() + 1).toString(),
        from: "bot",
        text: isInStock 
          ? `מצאתי במלאי! הנה גם סרטון יישום ותמונה שתראה שזה מה שחיפשת:` 
          : `אחי, חסר במחסן כרגע, אבל מצאתי לך את המפרט המדויק מגוגל כדי שנזמין לך מיוחד:`,
        media: media,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      setIsSearching(false);
    }, 1000);
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-[#0b141a] text-white overflow-hidden font-sans" dir="rtl">
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-[60px] bg-[#202c33] flex items-center px-6 border-b border-black/20">
          <h2 className="font-bold text-[#00a884]">SabanOS Pro-Advisor</h2>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll pb-32">
          {messages.map((msg) => (
            <div key={msg.id} className={clsx("flex flex-col", msg.from === "user" ? "mr-auto items-start" : "ml-auto items-end")}>
              <div className={clsx("p-3 rounded-2xl max-w-[80%] shadow-lg", msg.from === "user" ? "bg-[#005c4b]" : "bg-[#202c33]")}>
                <p className="text-sm">{msg.text}</p>
                
                {msg.media?.image && (
                  <img src={msg.media.image} className="mt-2 rounded-lg w-full h-40 object-cover border border-white/10" alt="product" />
                )}
                
                {msg.media?.video && (
                  <button onClick={() => window.open(msg.media.video, '_blank')} className="mt-2 flex items-center gap-2 text-[10px] bg-red-600/20 text-red-500 p-2 rounded-lg w-full font-bold">
                    <PlayCircle size={14} /> לצפייה בשיטת יישום לחץ כאן
                  </button>
                )}
              </div>
            </div>
          ))}
          {isSearching && (
            <div className="flex items-center gap-2 text-[#8696a0] text-xs italic animate-pulse">
              <Loader2 size={14} className="animate-spin" /> מחפש במלאי ובגוגל...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* שדה כתיבה - נקי ללא כפתורים צפים */}
        <footer className="absolute bottom-0 w-full bg-[#202c33] p-4 flex items-center gap-4 border-t border-black/20">
          <div className="flex-1 bg-[#2a3942] rounded-2xl px-4 py-3 border border-white/5">
            <input 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="כתוב מוצר... (למשל: סיקה 107)" 
              className="bg-transparent outline-none w-full text-sm" 
            />
          </div>
          <button onClick={handleSend} className="bg-[#00a884] p-3 rounded-full hover:scale-105 transition-transform shadow-xl">
            <Send size={20} fill="currentColor" />
          </button>
        </footer>
      </div>
    </div>
  );
}
