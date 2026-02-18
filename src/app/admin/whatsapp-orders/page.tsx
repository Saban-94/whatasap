'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle2, Truck, Package, MessageSquare, Clock, ShieldCheck, User, Bot, Loader2 } from 'lucide-react';
import { processSmartOrder } from '@/lib/dataEngine';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  meta?: any;
}

export default function WhatsAppOrdersDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [activeAnalysis, setAnalysis] = useState<any>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // פונקציה שמדמה הקלדה אנושית
  const typeMessage = async (fullText: string, meta: any) => {
    setIsTyping(true);
    let displayedText = "";
    const words = fullText.split(" ");
    
    // יצירת הודעה ריקה שהולכת להתעדכן
    setMessages(prev => [...prev, { role: 'assistant', text: "", timestamp: new Date(), meta }]);

    for (const word of words) {
      displayedText += word + " ";
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].text = displayedText;
        return newMessages;
      });
      // מהירות הקלדה משתנה להרגשה אנושית
      await new Promise(res => setTimeout(res, 40 + Math.random() * 60));
    }
    setIsTyping(false);
  };

  const handleProcess = async () => {
    if (!input.trim() || isThinking || isTyping) return;
    
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText, timestamp: new Date() }]);
    setInput("");
    
    // שלב 1: "חשיבה"
    setIsThinking(true);
    
    try {
      // דיליי קטן כדי שיראו שהמערכת "חושבת"
      await new Promise(res => setTimeout(res, 1200));
      
      const result = await processSmartOrder("temp_id", userText);
      
      setIsThinking(false);
      
      // שלב 2: "הקלדה"
      await typeMessage(result.text, result.meta);
      
      setAnalysis(result.meta);
    } catch (err) {
      console.error("Error:", err);
      setIsThinking(false);
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f0f2f5] text-right font-sans overflow-hidden" dir="rtl">
      
      {/* פאנל ניתוח לוגיסטי (שמאל) */}
      <div className="hidden md:flex w-1/3 bg-white border-l shadow-2xl flex-col">
        <div className="p-6 bg-[#075e54] text-white flex items-center gap-3 shadow-md">
          <ShieldCheck size={24} className="text-green-300" />
          <h2 className="text-xl font-bold italic">SABAN LOGISTICS</h2>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-6 bg-gray-50/50">
          {activeAnalysis?.logistics ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 border-b pb-2">
                  <Package size={18} className="text-orange-500" /> פירוט מוצרים לליקוט
                </h3>
                {activeAnalysis.recommendations?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
                    <span className="font-medium text-gray-700">{item.name}</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full font-bold text-[#075e54]">x{item.qty}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 border-b pb-2">
                  <Truck size={18} className="text-blue-500" /> הנחיות הפצה
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between italic">
                    <span>כלי רכב מומלץ:</span>
                    <span className="font-bold text-blue-600">{activeAnalysis.logistics.truckType}</span>
                  </div>
                  <div className="flex justify-between italic">
                    <span>משקל מטען:</span>
                    <span className="font-bold">{activeAnalysis.logistics.totalWeightKg} ק"ג</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => window.print()} 
                className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Package size={20} /> הפקת תעודת ליקוט
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-30">
              <Bot size={60} />
              <p className="mt-4 font-bold">ממתין להודעת לקוח...</p>
            </div>
          )}
        </div>
      </div>

      {/* ממשק WhatsApp (ימין) */}
      <div className="flex-1 flex flex-col bg-[#e5ddd5] relative overflow-hidden">
        {/* Header */}
        <div className="bg-[#075e54] p-3 md:p-4 text-white flex items-center justify-between shadow-md z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              <User size={24} className="text-gray-600" />
            </div>
            <div>
              <h3 className="font-bold">שירות לקוחות ח. סבן</h3>
              <p className="text-[11px] text-green-200">מחובר למנוע Gemini v1.5</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-repeat relative" 
             style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundSize: '400px' }}>
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`p-3 rounded-2xl shadow-sm max-w-[85%] text-gray-900 ${
                msg.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'
              }`}>
                <p className="text-[15px] leading-relaxed">{msg.text}</p>
                <div className="flex justify-end items-center gap-1 mt-1 opacity-50">
                   <span className="text-[10px] font-mono">
                     {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                   </span>
                   {msg.role === 'user' && <CheckCircle2 size={12} className="text-blue-500" />}
                </div>
              </div>
            </div>
          ))}

          {/* אפקט חשיבה - אנושי */}
          {isThinking && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-[#075e54]" />
                <span className="text-xs font-bold text-gray-500">Gemini חושב על פתרון...</span>
              </div>
            </div>
          )}

          <div ref={scrollRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="bg-[#f0f2f5] p-3 md:p-4 flex gap-3 items-center border-t">
          <div className="flex-1 bg-white rounded-full flex items-center px-5 shadow-sm border border-gray-200 focus-within:border-[#075e54] transition-all">
            <input 
              className="flex-1 py-3 bg-transparent border-none focus:outline-none text-black text-sm md:text-base"
              placeholder="הודעה לוואטסאפ של סבן..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
              disabled={isThinking || isTyping}
            />
          </div>
          <button 
            onClick={handleProcess} 
            disabled={!input.trim() || isThinking || isTyping}
            className={`p-4 rounded-full transition-all shadow-md ${
              !input.trim() || isThinking || isTyping ? 'bg-gray-300' : 'bg-[#128c7e] hover:bg-[#075e54] text-white active:scale-90'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
