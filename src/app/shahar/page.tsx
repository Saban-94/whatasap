'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, History, Package, Truck, Loader2, CheckCircle2 } from 'lucide-react';

interface Message { id: number; text: string; sender: 'user' | 'ai'; }

export default function ShaharProfessionalApp() {
  const [activeTab, setActiveTab] = useState<'chat' | 'tracking' | 'history'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      addBotMessage("**אהלן שחר אחי.** הלוח של ראמי מתמלא, מה אנחנו שולחים היום לאתר?");
    }
  }, []);

  useEffect(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, isThinking]);

  const addBotMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now(), text, sender: 'ai' }]);
    setIsThinking(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), text: input, sender: 'user' }]);
    const currentInput = input;
    setInput('');
    setIsThinking(true);

    try {
      const res = await fetch('/shahar/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
      });
      const data = await res.json();
      addBotMessage(data.reply);
    } catch (e) {
      addBotMessage(`**אחי, הקו מול ראמי נפל. נסה שוב.**`);
    }
  };

  return (
    <div className="bg-[#0b141a] text-[#e9edef] h-screen flex flex-col font-sans" dir="rtl">
      
      {/* Top Header */}
      <header className="bg-[#202c33] p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center font-black">Ai</div>
          <h1 className="text-lg font-black tracking-tight">ח.סבן | לוגיסטיקה</h1>
        </div>
        <div className="flex bg-[#2a3942] rounded-xl p-1">
          <button onClick={() => setActiveTab('chat')} className={`p-2 rounded-lg transition-all ${activeTab === 'chat' ? 'bg-[#00a884] text-white' : 'text-gray-400'}`}><MessageSquare size={20}/></button>
          <button onClick={() => setActiveTab('tracking')} className={`p-2 rounded-lg transition-all ${activeTab === 'tracking' ? 'bg-[#00a884] text-white' : 'text-gray-400'}`}><Truck size={20}/></button>
          <button onClick={() => setActiveTab('history')} className={`p-2 rounded-lg transition-all ${activeTab === 'history' ? 'bg-[#00a884] text-white' : 'text-gray-400'}`}><History size={20}/></button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        
        {/* TAB 1: Chat Area */}
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col p-4 space-y-4 overflow-y-auto pb-32">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-lg ${msg.sender === 'ai' ? 'bg-[#202c33] border-r-4 border-[#C9A227]' : 'bg-[#005c4b]'}`}>
                  <p className="text-[15px] leading-relaxed">
                    {msg.text.split('**').map((part: string, i: number) => i % 2 === 1 ? <strong key={i} className="text-[#C9A227] font-black">{part}</strong> : part)}
                  </p>
                </div>
              </div>
            ))}
            {isThinking && <div className="text-[10px] animate-pulse text-[#00a884] font-bold">מעדכן את ראמי...</div>}
            <div ref={scrollRef} />
          </div>
        )}

        {/* TAB 2: Tracking Area */}
        {activeTab === 'tracking' && (
          <div className="p-6 space-y-4 animate-in fade-in zoom-in">
            <h2 className="text-xl font-black mb-6">מעקב הזמנה חיה</h2>
            <div className="bg-[#202c33] p-6 rounded-3xl border border-white/5 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-60">מספר הזמנה: #8804</span>
                <span className="bg-[#00a884]/20 text-[#00a884] px-3 py-1 rounded-full text-[10px] font-bold">בדרך לאתר</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#00a884] rounded-full flex items-center justify-center"><Truck className="text-white" /></div>
                <div>
                  <p className="font-bold">משאית דבל-דבל (מצע א')</p>
                  <p className="text-xs opacity-50">נהג: מוחמד | הגעה משוערת: 14:20</p>
                </div>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div className="bg-[#00a884] w-[75%] h-full rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: History Area */}
        {activeTab === 'history' && (
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-black">היסטוריית הזמנות</h2>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#202c33]/50 p-4 rounded-2xl flex justify-between items-center border border-white/5">
                <div className="flex gap-3">
                  <Package className="text-[#C9A227]" />
                  <div>
                    <p className="text-sm font-bold">מכולה 8 קוב - החלפה</p>
                    <p className="text-[10px] opacity-50">14/02/2026 | אבן יהודה</p>
                  </div>
                </div>
                <CheckCircle2 size={18} className="text-[#00a884]" />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Persistent Input (Only for Chat Tab) */}
      {activeTab === 'chat' && (
        <footer className="p-4 bg-[#0b141a] absolute bottom-0 w-full">
          <div className="max-w-4xl mx-auto flex gap-2 bg-[#2a3942] p-2 rounded-[2rem] shadow-2xl">
            <input 
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="כתוב הודעה ל-Ai ח.סבן..."
              className="flex-1 bg-transparent p-4 outline-none font-bold text-sm"
            />
            <button onClick={handleSend} className="bg-[#00a884] p-4 rounded-full hover:scale-105 active:scale-90 transition-all">
              <Send size={20} />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
