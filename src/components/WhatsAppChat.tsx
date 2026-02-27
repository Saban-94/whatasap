'use client';
import React, { useState, useEffect, useRef } from 'react';
import { processSmartOrder } from '@/lib/dataEngine';
import { CheckCheck, Send, Paperclip, Smile } from 'lucide-react';

export default function WhatsAppGroupView({ initialClientId = "+972526458899" }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // הודעת פתיחה המדמה את הקבוצה
    setMessages([{
      id: 1,
      sender: 'system',
      text: 'קבוצת הזמנות ח. סבן *** הוקמה. ה-AI סורק הזמנות.',
      time: '08:00'
    }]);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input, sender: 'user', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // עיבוד ההזמנה דרך המוח של גימני
    const result = await processSmartOrder(initialClientId, input);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: result.text,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md mx-auto bg-[#0b141a] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-[#202c33] p-4 flex items-center gap-3 border-b border-gray-700">
        <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center font-bold">ח.ס</div>
        <div>
          <h2 className="text-white font-bold text-sm">הזמנות ח. סבן ***</h2>
          <p className="text-[#00a884] text-[10px] animate-pulse">גימני פעיל ומאומן</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-opacity-5">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-start' : m.sender === 'system' ? 'justify-center' : 'justify-end'}`}>
            <div className={`max-w-[80%] p-2 rounded-lg text-sm shadow-sm relative ${
              m.sender === 'user' ? 'bg-[#005c4b] text-white' : 
              m.sender === 'system' ? 'bg-[#182229] text-gray-400 text-[10px]' : 
              'bg-[#202c33] text-white border-r-4 border-[#00a884]'
            }`}>
              {m.text}
              <div className="flex justify-end items-center gap-1 mt-1 opacity-50 text-[10px]">
                <span>{m.time}</span>
                {m.sender !== 'system' && <CheckCheck size={12} className="text-[#53bdeb]" />}
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#202c33] flex items-center gap-2">
        <div className="flex gap-3 text-gray-400">
           <Smile size={20} />
           <Paperclip size={20} />
        </div>
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="הקלד הודעה (למשל: 12 באלות סומסום)" 
          className="flex-1 bg-[#2a3942] text-white rounded-full px-4 py-2 text-sm outline-none"
        />
        <button onClick={handleSend} className="bg-[#00a884] p-2 rounded-full text-white">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
