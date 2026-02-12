'use client'
import React, { useState, useEffect } from 'react';
import { fetchCustomerBrain } from '@/lib/customerMemory';
import { getSabanResponse } from '@/app/actions/gemini-brain'; // משתמש ב-Action הקיים שלך

export default function WhatsAppChat({ clientId, clientName }: { clientId: string, clientName: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  // פתיחה אוטומטית: "בוקר טוב שחר"
  useEffect(() => {
    async function init() {
      const memory = await fetchCustomerBrain(clientId);
      const greeting = await getSabanResponse(`תן ברכת בוקר טוב אישית ל${clientName}`, memory);
      setMessages([{ role: 'assistant', text: greeting }]);
    }
    init();
  }, [clientId]);

  const handleSend = async () => {
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');

    const memory = await fetchCustomerBrain(clientId);
    const aiResponse = await getSabanResponse(userMsg, memory);
    
    setMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md border rounded-xl shadow-2xl bg-[#E5DDD5]">
      {/* Header WhatsApp Style */}
      <div className="bg-[#075E54] p-4 text-white rounded-t-xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">👤</div>
        <div>
          <h3 className="font-bold">{clientName}</h3>
          <p className="text-xs opacity-80">ח. סבן - מענה חכם</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded-lg max-w-[85%] ${
            m.role === 'user' ? 'bg-[#DCF8C6] self-end ml-auto' : 'bg-white self-start shadow-sm'
          }`}>
            <p className="text-sm">{m.text}</p>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white/90 flex gap-2">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded-full px-4 outline-none focus:ring-1 ring-[#075E54]"
          placeholder="הקלד הודעה..."
        />
        <button onClick={handleSend} className="bg-[#128C7E] text-white p-2 rounded-full w-10 h-10">➔</button>
      </div>
    </div>
  );
}
