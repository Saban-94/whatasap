'use client';

import { useState, useEffect } from "react";
import { processSmartOrder } from "@/lib/dataEngine";

// הגדרת ה-Props של הקומפוננטה
interface SmartChatViewProps {
  customerId: string;
}

// הגדרת מבנה הודעה
interface Message {
  role: 'user' | 'assistant';
  text: string;
  ts?: number;
  meta?: any;
}

export default function SmartChatView({ customerId }: SmartChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', text: input, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      // שליחה למנוע החכם של ח. סבן
      const response = await processSmartOrder(customerId, input);
      
      const botMsg: Message = { 
        role: 'assistant', 
        text: response.text, 
        meta: response.meta,
        ts: Date.now() 
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#e5ddd5]" dir="rtl">
      {/* Header WhatsApp Style */}
      <div className="bg-[#075e54] text-white p-4 flex items-center shadow-lg gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#075e54] font-bold">
          ס
        </div>
        <div>
          <div className="font-bold text-lg">ה. סבן - שירות לקוחות</div>
          <div className="text-xs text-green-200">יועץ Gemini פעיל</div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm relative ${
              msg.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'
            }`}>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">{msg.text}</div>
              
              {/* הצגת המלצות קנייה מהמוח המקומי */}
              {msg.meta?.recommendations && (
                <div className="mt-3 border-t pt-2 space-y-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">הצעה לכתב כמיות:</p>
                  {msg.meta.recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="bg-white/50 p-2 rounded-lg border flex justify-between text-xs">
                      <span className="font-bold">{rec.name}</span>
                      <span>x{rec.qty}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-[10px] text-gray-400 mt-1 text-left">
                {msg.ts ? new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#f0f2f5] flex gap-2 items-center">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 border-none rounded-full px-5 py-3 focus:outline-none shadow-sm text-sm"
          placeholder="הקלד הודעה..."
        />
        <button 
          onClick={handleSend} 
          className="bg-[#128c7e] text-white rounded-full p-3 shadow-md hover:bg-[#075e54] transition-all"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
