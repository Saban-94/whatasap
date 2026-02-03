'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, X, MessageCircle } from 'lucide-react';

export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'שלום! כאן המומחה ההנדסי של ח. סבן. איך אוכל לעזור בפרויקט שלך היום?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: messages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'משהו השתבש, נסה שוב אחי.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[999] font-sans">
      {/* כפתור הבועה הצף */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-[#C9A227] hover:scale-110 transition-transform p-4 rounded-full shadow-2xl text-black flex items-center justify-center"
        >
          <MessageCircle size={32} />
        </button>
      )}

      {/* חלון הצ'אט המלא */}
      {isOpen && (
        <div className="w-[380px] h-[600px] bg-[#f0f2f5] dark:bg-[#111b21] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-5">
          
          {/* כותרת - סגנון WhatsApp */}
          <div className="bg-[#075e54] dark:bg-[#202c33] p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#C9A227] rounded-full flex items-center justify-center text-black font-bold">
                ח.ס
              </div>
              <div>
                <h3 className="font-bold text-sm">ח. סבן - ייעוץ הנדסי</h3>
                <p className="text-[10px] text-gray-300">מחובר - מענה מהיר ב-AI</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 rounded-full p-1">
              <X size={20} />
            </button>
          </div>

          {/* גוף הצ'אט - בועות דיבור */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcd2de8.png')] bg-repeat opacity-90"
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm shadow-sm ${
                  m.role === 'user' 
                  ? 'bg-[#dcf8c6] dark:bg-[#005c4b] text-black dark:text-white rounded-tr-none' 
                  : 'bg-white dark:bg-[#202c33] text-black dark:text-white rounded-tl-none border border-gray-100 dark:border-none'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-[#202c33] p-3 rounded-lg text-xs animate-pulse dark:text-gray-400">
                  סבן בודק בקטלוג...
                </div>
              </div>
            )}
          </div>

          {/* שורת כתיבה */}
          <div className="p-3 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center gap-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="כתוב הודעה לח. סבן..."
              className="flex-1 p-2 rounded-full bg-white dark:bg-[#2a3942] text-sm focus:outline-none dark:text-white border-none shadow-sm"
            />
            <button 
              onClick={handleSend}
              className="bg-[#00a884] p-2 rounded-full text-white hover:bg-[#008f72] transition-colors shadow-md"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
