"use client";
import React, { useState, useEffect, useRef } from "react";
import { Send, User, Bot, Plus, Minus, Info, Wrench, Droplets, Loader2, ImageIcon } from "lucide-react";

export default function SabanChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/specs", {
        method: "POST",
        body: JSON.stringify({ query: input }),
      });
      const data = await res.json();

      const botMsg = { 
        role: "bot", 
        content: data.description || "הנה הפרטים שמצאתי עבורך:",
        product: data // הנתונים הטכניים שג'מיני שלף
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "bot", content: "מצטער, הייתה לי שגיאה קטנה בשליפה. נסה שוב?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F0F2F5] font-heebo" dir="rtl">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden">
        
        {/* Header */}
        <header className="h-20 bg-white border-b flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-200">S</div>
            <div>
              <h1 className="font-black text-slate-800 text-lg leading-tight">SabanOS</h1>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">Logistics Intelligence</p>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8FAFC]">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[85%] rounded-3xl p-5 shadow-sm ${
                msg.role === "user" ? "bg-white border border-slate-200 text-slate-800" : "bg-slate-900 text-white"
              }`}>
                <p className="font-bold leading-relaxed">{msg.content}</p>

                {/* כרטיס מוצר חכם - מופיע רק אם יש נתוני מוצר */}
                {msg.product && msg.product.name && (
                  <div className="mt-4 bg-white rounded-2xl border border-slate-100 overflow-hidden text-slate-900 shadow-xl">
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-xl border flex items-center justify-center overflow-hidden shrink-0">
                        <img src={msg.product.localMedia?.imageUrl || msg.product.image || "https://placehold.co/100"} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-sm">{msg.product.name}</h4>
                        <button 
                          onClick={() => setExpandedProduct(expandedProduct === i.toString() ? null : i.toString())}
                          className="mt-1 flex items-center gap-1 text-[11px] font-black text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          {expandedProduct === i.toString() ? <Minus size={14}/> : <Plus size={14}/>}
                          למידע טכני ומדיה
                        </button>
                      </div>
                    </div>

                    {/* החלק המורחב (האקורדיון) */}
                    {expandedProduct === i.toString() && (
                      <div className="p-5 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-top duration-300">
                        <div className="grid grid-cols-1 gap-4 text-[12px]">
                          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <span className="text-slate-400 font-bold flex items-center gap-1"><Info size={14}/> צריכה:</span>
                            <span className="font-black text-slate-800">{msg.product.consumptionPerM2 || "לפי הוראות יצרן"}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <span className="text-slate-400 font-bold flex items-center gap-1"><Wrench size={14}/> ייבוש:</span>
                            <span className="font-black text-slate-800">{msg.product.dryingTime || "משתנה לפי תנאי שטח"}</span>
                          </div>
                          <div className="pt-2">
                            <span className="text-slate-400 font-bold block mb-2 uppercase text-[10px] tracking-widest">הוראות יישום:</span>
                            <p className="text-slate-600 font-medium leading-relaxed bg-white p-3 rounded-xl border border-slate-100 italic">
                                יש ליישם שתי שכבות שתי וערב על תשתית לחה ונקייה. 
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-end">
              <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">SabanOS מעבד נתונים...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <footer className="p-6 bg-white border-t flex gap-3 items-center">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="חפש מוצר (למשל: סיקה 107 או צמנט...)"
            className="flex-1 bg-slate-100 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-emerald-500/20 font-bold text-slate-800 transition-all"
          />
          <button 
            onClick={handleSendMessage}
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-90"
          >
            <Send size={24} />
          </button>
        </footer>
      </div>
    </div>
  );
}
