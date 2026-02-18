'use client';

import React, { useState, useEffect } from 'react';
import { fetchCustomerBrain } from '@/lib/customerMemory';
// תיקון: ייבוא השם הנכון של ה-Action
import { getSabanSmartResponse } from '@/app/actions/gemini-brain'; 

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export default function WhatsAppChat({ clientId, clientName }: { clientId: string, clientName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  // פתיחה אוטומטית: ברכה אישית מבוססת זיכרון
  useEffect(() => {
    async function init() {
      try {
        const memory = await fetchCustomerBrain(clientId);
        // שימוש בפונקציה המעודכנת
        const greeting = await getSabanSmartResponse(`תן ברכת בוקר טוב אישית וקצרה ללקוח בשם ${clientName}`, clientId);
        setMessages([{ role: 'assistant', text: greeting }]);
      } catch (error) {
        console.error("Init Chat Error:", error);
        setMessages([{ role: 'assistant', text: `בוקר טוב ${clientName}, איך אוכל לעזור היום?` }]);
      }
    }
    init();
  }, [clientId, clientName]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');

    try {
      // שליחה ל-Gemini דרך ה-Action המעודכן
      const aiResponse = await getSabanSmartResponse(userMsg, clientId);
      setMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);
    } catch (error) {
      console.error("Send Message Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', text: "מצטער, אני מתקשה לענות כרגע. נסה שוב בעוד רגע." }]);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md border rounded-xl shadow-2xl bg-[#E5DDD5] mx-auto" dir="rtl">
      {/* Header WhatsApp Style */}
      <div className="bg-[#075E54] p-4 text-white rounded-t-xl flex items-center gap-3 shadow-md">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">👤</div>
        <div>
          <h3 className="font-bold leading-none">{clientName}</h3>
          <p className="text-[10px] opacity-80 mt-1">ח. סבן - יועץ בנייה חכם</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
        {messages.map((m, i) => (
          <div 
            key={i} 
            className={`p-3 rounded-lg max-w-[85%] shadow-sm text-sm ${
              m.role === 'user' 
                ? 'bg-[#DCF8C6] self-start rounded-tr-none' 
                : 'bg-white self-end rounded-tl-none border border-gray-200'
            }`}
          >
            <p className="leading-relaxed">{m.text}</p>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#F0F2F5] flex gap-2 items-center rounded-b-xl">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 p-2.5 bg-white border-none rounded-full px-4 outline-none text-sm shadow-sm"
          placeholder="הקלד הודעה..."
        />
        <button 
          onClick={handleSend} 
          className="bg-[#128C7E] text-white p-2 rounded-full w-11 h-11 flex items-center justify-center hover:bg-[#075E54] transition-colors shadow-md"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
