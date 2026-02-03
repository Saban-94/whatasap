'use client';
import { useState, useEffect, useRef } from 'react';

export default function ChatWidget() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('saban_chat');
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('saban_chat', JSON.stringify(messages));
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMsg = { role: 'user', content: input };
    setMessages([...messages, newMsg]);
    setInput('');

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: input, history: messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))}),
    });
    const data = await res.json();
    setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#C9A227] rounded-full shadow-2xl flex items-center justify-center text-2xl border-2 border-black"
      >
        {isOpen ? '✕' : '💬'}
      </button>
      
      {isOpen && (
        <div className="absolute bottom-20 left-0 w-80 h-96 bg-black border border-[#C9A227] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-[#C9A227] p-3 text-black font-bold text-center">יועץ מומחה - ח. סבן</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block p-2 rounded-lg ${m.role === 'user' ? 'bg-[#C9A227] text-black' : 'bg-gray-800 text-white'}`}>
                  {m.content}
                </span>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
          <div className="p-3 border-t border-gray-800 flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-gray-900 text-white p-2 rounded-lg text-sm outline-none border border-gray-700"
              placeholder="שאל אותי על מוצרים..."
            />
            <button onClick={sendMessage} className="text-[#C9A227] font-bold">שלח</button>
          </div>
        </div>
      )}
    </div>
  );
}
