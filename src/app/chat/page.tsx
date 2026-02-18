"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, MoreVertical, Search, CheckCheck } from "lucide-react";
import clsx from "clsx";

// --- Types ---
type Product = { sku: string; name: string; price: number; img?: string; unknown?: boolean; category?: string; };
type Message = { id: string; from: "user" | "bot"; text?: string; type?: "text" | "ai-advisor"; items?: Product[]; timestamp: Date; };

// --- Mock Data (במציאות זה יגיע מ-inventory.json) ---
const inventory: Product[] = [
  { sku: "871223", name: "לוח גבס לבן 12.5", price: 39, category: "גבס" },
  { sku: "14603", name: "סיקה טופ-סיל 107 אפור", price: 145, category: "איטום" },
  { sku: "330900", name: "מלט שחור 25 ק\"ג", price: 28, category: "מלט" }
];

export default function SabanChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", from: "bot", text: "אהלן רמי, כאן יועץ המכירות של סבן. שלח לי רשימת חומרים ונבנה הזמנה.", timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState("");
  const [orderItems, setOrderItems] = useState<Product[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // גלילה אוטומטית להודעה האחרונה
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- לוגיקת היועץ (מובנית בתוך השדה) ---
  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), from: "user", text: inputText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText;
    setInputText("");

    // סימולציה של "הבוט חושב"
    setTimeout(() => {
      const words = currentInput.toLowerCase().split(" ");
      const detected: Product[] = [];

      // זיהוי מוצרים
      inventory.forEach(p => {
        if (words.some(word => p.name.toLowerCase().includes(word))) {
          detected.push(p);
        }
      });

      // אם יש מילים שלא זוהו כחלק ממוצר (וזה נראה כמו שם מוצר)
      if (detected.length === 0 && currentInput.length > 5) {
        detected.push({ sku: "99999", name: currentInput, price: 0, unknown: true });
      }

      if (detected.length > 0) {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          from: "bot",
          type: "ai-advisor",
          items: detected,
          text: "זיהיתי את המוצרים הבאים. להוסיף אותם לסל הפרויקט?",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);

        // בדיקה למוצרי עזר (Upsell)
        if (currentInput.includes("גבס")) {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              from: "bot",
              text: "שמת לב שחסרים לך ניצבים או מסלולים לגבס? להוסיף לך הצעה?",
              timestamp: new Date()
            }]);
          }, 800);
        }
      }
    }, 800);
  };

  const addToOrder = (product: Product) => {
    setOrderItems(prev => [...prev, product]);
  };

  return (
    <div className="flex h-screen bg-[#0b141a] text-[#e9edef] font-sans overflow-hidden" dir="rtl">
      
      {/* 1. Sidebar שמאל - רשימת שיחות (Future) */}
      <div className="w-[30%] bg-[#111b21] border-l border-[#222d34] flex flex-col">
        <header className="h-[60px] bg-[#202c33] flex items-center px-4 justify-between">
          <div className="w-10 h-10 rounded-full bg-gray-600" />
          <div className="flex gap-5 text-[#8696a0]">
            <CheckCheck size={20} />
            <MoreVertical size={20} />
          </div>
        </header>
        <div className="p-3 bg-[#111b21]">
          <div className="bg-[#202c33] rounded-lg flex items-center px-4 py-1.5 gap-4">
            <Search size={18} className="text-[#8696a0]" />
            <input placeholder="חפש שיחה או הזמנה..." className="bg-transparent outline-none text-sm w-full" />
          </div>
        </div>
      </div>

      {/* 2. חלון צ'אט מרכזי */}
      <div className="flex-1 flex flex-col bg-[#0b141a] relative shadow-2xl">
        {/* Header צ'אט */}
        <header className="h-[60px] bg-[#202c33] flex items-center px-4 z-10 border-r border-[#222d34]">
          <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center font-bold">ס</div>
          <div className="mr-3">
            <h2 className="font-bold text-sm">יועץ מכירות - ח. סבן</h2>
            <p className="text-[11px] text-[#00a884]">פעיל כעת</p>
          </div>
        </header>

        {/* גוף ההודעות */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-fixed opacity-90 custom-scroll">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={clsx("flex flex-col max-w-[70%]", msg.from === "user" ? "mr-auto items-start" : "ml-auto items-end")}
              >
                <div className={clsx(
                  "p-3 rounded-xl shadow-md relative group",
                  msg.from === "user" ? "bg-[#005c4b] text-white rounded-tr-none" : "bg-[#202c33] text-[#e9edef] rounded-tl-none"
                )}>
                  {msg.text && <p className="text-[14.5px] leading-tight ml-8">{msg.text}</p>}
                  
                  {/* הצגת כרטיסי מוצר מהיועץ */}
                  {msg.type === "ai-advisor" && msg.items && (
                    <div className="mt-3 space-y-2 w-full min-w-[250px]">
                      {msg.items.map((item, idx) => (
                        <div key={idx} className="bg-[#111b21] p-3 rounded-lg border border-white/5 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-sm text-[#00a884]">{item.name}</p>
                            <p className="text-[10px] text-gray-500">מק"ט: {item.sku}</p>
                          </div>
                          <button 
                            onClick={() => addToOrder(item)}
                            className="bg-[#00a884] text-white text-[10px] px-2 py-1 rounded font-black hover:bg-[#06cf9c]"
                          >
                            הוסף
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <span className="text-[10px] text-gray-400 mt-1 block text-left">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* שדה כתיבה חכם (ללא כפתורים צפים) */}
        <footer className="bg-[#202c33] p-3 flex items-center gap-3">
          <Paperclip className="text-[#8696a0] cursor-pointer hover:text-[#e9edef]" size={24} />
          <div className="flex-1 bg-[#2a3942] rounded-xl px-4 py-2 flex items-center">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="כתוב רשימת חומרים להזמנה..."
              className="bg-transparent outline-none w-full text-[15px]"
            />
          </div>
          <button onClick={handleSend} className="bg-[#00a884] p-2.5 rounded-full text-[#0b141a] hover:bg-[#06cf9c] transition-all shadow-lg">
            <Send size={20} fill="currentColor" />
          </button>
        </footer>
      </div>

      {/* 3. Sidebar ימין - סיכום הזמנה חיה */}
      <div className="w-[25%] bg-[#111b21] border-r border-[#222d34] flex flex-col">
        <header className="h-[60px] bg-[#202c33] flex items-center px-4 border-b border-[#0b141a]">
          <h2 className="font-bold text-sm flex items-center gap-2">
            <div className="w-2 h-4 bg-[#00a884] rounded-full"></div>
            סיכום הזמנה
          </h2>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scroll">
          {orderItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 italic text-center">
              <p className="text-xs">הסל ריק.<br/>הוסף מוצרים מהצ'אט.</p>
            </div>
          ) : (
            orderItems.map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ x: 20, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }}
                className={clsx(
                  "p-3 rounded-xl border border-white/5 shadow-inner",
                  item.unknown ? "bg-red-500/10 border-red-500/30" : "bg-[#202c33]"
                )}
              >
                <div className="flex justify-between items-start">
                  <p className="font-bold text-xs">{item.name}</p>
                  <span className="text-[10px] font-black text-[#00a884]">{item.price} ₪</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-gray-500 font-mono italic">#{item.sku}</span>
                  {item.unknown && <span className="text-[9px] bg-red-600 text-white px-1 rounded">דרוש בירור</span>}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* כפתור סגירה למנהל */}
        <div className="p-4 bg-[#202c33] border-t border-[#0b141a]">
          <div className="flex justify-between mb-4 font-black">
            <span>סה"כ:</span>
            <span className="text-[#00a884] text-xl tracking-tighter">
              {orderItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)} ₪
            </span>
          </div>
          <button className="w-full bg-[#00a884] text-[#0b141a] py-3 rounded-xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
            שלח למחלקת הזמנות
          </button>
        </div>
      </div>
    </div>
  );
}
