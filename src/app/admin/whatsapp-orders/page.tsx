'use client';

import React, { useState, useEffect, useRef } from 'react';
import { db } from "@/lib/firebase"; 
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Send, CheckCircle2, Truck, Package, MessageSquare, Clock, ShieldCheck, User, Bot } from 'lucide-react';
import { processSmartOrder } from '@/lib/dataEngine';

export default function WhatsAppOrdersDashboard() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [activeAnalysis, setAnalysis] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // גלילה אוטומטית להודעה האחרונה
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleProcess = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const result = await processSmartOrder("temp_id", input);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: result.text, 
        meta: result.meta,
        timestamp: new Date() 
      }]);
      
      setAnalysis(result.meta);
    } catch (err) {
      console.error("Analysis Error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f0f2f5] text-right font-sans" dir="rtl">
      
      {/* פאנל ניתוח לוגיסטי (שמאל) */}
      <div className="hidden md:flex w-1/3 bg-white border-l shadow-2xl flex-col">
        <div className="p-6 bg-[#075e54] text-white flex items-center gap-3 shadow-md">
          <ShieldCheck size={24} className="text-green-300" />
          <h2 className="text-xl font-bold">מערכת בקרה סבן</h2>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {activeAnalysis?.logistics ? (
            <div className="animate-in fade-in duration-500">
              <div className="bg-green-50 p-5 rounded-2xl border border-green-200 shadow-sm mb-6">
                <h3 className="font-bold text-green-900 flex items-center gap-2 mb-4 border-b border-green-200 pb-2 text-base">
                  <Package size={20} /> מוצרים במלאי
                </h3>
                {activeAnalysis.recommendations?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-sm py-2 text-gray-700">
                    <span className="font-semibold text-gray-900">{item.name}</span>
                    <span className="bg-green-200 text-green-800 px-2 py-1 rounded-lg font-bold">x{item.qty}</span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200 shadow-sm">
                <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-4 border-b border-blue-200 pb-2 text-base">
                  <Truck size={20} /> סידור הובלה
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>סוג רכב:</span>
                    <span className="font-bold text-gray-900">{activeAnalysis.logistics.truckType || "לא נקבע"}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>משקל משוער:</span>
                    <span className="font-bold text-gray-900">{activeAnalysis.logistics.totalWeightKg || 0} ק"ג</span>
                  </div>
                  {activeAnalysis.logistics.needsCrane && (
                    <div className="bg-red-600 text-white text-center p-2 rounded-xl text-xs font-black animate-pulse shadow-md">
                      🚨 דרוש מנוף לפריקה
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-40">
              <div className="p-6 bg-gray-100 rounded-full italic font-bold text-2xl">SABAN OS</div>
              <p className="text-center font-bold">ממתין להודעה חדשה לניתוח...</p>
            </div>
          )}
        </div>
      </div>

      {/* ממשק WhatsApp (ימין) */}
      <div className="flex-1 flex flex-col bg-[#e5ddd5] relative overflow-hidden">
        <div className="bg-[#075e54] p-3 md:p-4 text-white flex items-center justify-between shadow-lg z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-white/20 flex items-center justify-center shadow-inner overflow-hidden">
               <User className="text-gray-500" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white leading-tight">לקוח וואטסאפ</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-[11px] text-green-100 font-medium">פעיל כרגע</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area with WhatsApp background */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-repeat" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundSize: '400px' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-[#128c7e] rounded-full flex items-center justify-center ml-2 shadow-md">
                  <Bot size={18} className="text-white" />
                </div>
              )}
              <div className={`p-3 rounded-2xl shadow-md max-w-[85%] md:max-w-[75%] relative ${
                msg.role === 'user' 
                ? 'bg-[#dcf8c6] text-gray-900 rounded-tr-none' 
                : 'bg-white text-gray-900 rounded-tl-none'
              }`}>
                <p className="text-sm md:text-[15px] leading-relaxed font-normal text-black">
                  {msg.text}
                </p>
                <div className="flex justify-end items-center gap-1 mt-1">
                   <span className="text-[10px] text-gray-500 font-mono">
                     {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                   </span>
                   {msg.role === 'user' && <CheckCircle2 size={12} className="text-blue-500" />}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="bg-white/90 p-2 px-4 rounded-full text-[11px] font-bold text-[#075e54] w-fit shadow-sm animate-pulse">
              Gemini מנתח נתונים...
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="bg-[#f0f2f5] p-3 md:p-4 flex gap-2 items-center border-t border-gray-200">
          <div className="flex-1 bg-white rounded-full flex items-center px-4 shadow-sm">
            <input 
              className="flex-1 py-3 bg-transparent border-none focus:outline-none text-black text-sm md:text-base placeholder:text-gray-400"
              placeholder="הדבק הודעת לקוח לניתוח מהיר..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
            />
          </div>
          <button 
            onClick={handleProcess} 
            className="bg-[#128c7e] hover:bg-[#075e54] text-white p-3.5 rounded-full transition-all shadow-md active:scale-90"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
