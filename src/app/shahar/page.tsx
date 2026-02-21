'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, History, Truck, Sun, Moon, Package, CheckCircle2, Loader2 } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

export default function ShaharApp() {
  const [activeTab, setActiveTab] = useState<'chat' | 'tracking' | 'history'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      addBotMessage("**אהלן שחר אחי.** Ai-ח.סבן כאן. המשרד פתוח, ראמי בשיבוצים, מה הולך היום לאתר?");
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

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

      if (data.status === 'WAITING_FOR_RAMI') {
        setTimeout(() => {
          addBotMessage(`**ראמי מסארוה** קיבל את הבקשה שלך והוא מקליד תשובה בקנבס ההזמנות... ⏳`);
        }, 1500);
      }
    } catch (e) {
      addBotMessage(`**אחי, יש תקלה בתקשורת מול החמ"ל. נסה שוב.**`);
    }
  };

  return (
    <div className="bg-[#0b141a] text-[#e9edef] h-screen flex flex-col font-sans overflow-hidden" dir="rtl">
      
      {/* Header יוקרתי */}
      <header className="bg-[#202c33] p-4 flex items-center justify-between border-b border-white/5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center font-black shadow-lg">Ai</div>
          <div>
            <h1 className="text-md font-black">ח.סבן | לוגיסטיקה</h1>
            <p className="text-[10px] text-[#00a884] font-bold">סדרן פעיל: ראמי מסארוה</p>
          </div>
        </div>
        
        <div className="flex bg-[#2a3942] rounded-2xl p-1 shadow-inner">
          <button onClick={() => setActiveTab('chat')} className={`p-2 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-[#00a884] text-white' : 'text-gray-400'}`}><MessageSquare size={18}/></button>
          <button onClick={() => setActiveTab('tracking')} className={`p-2 rounded-xl transition-all ${activeTab === 'tracking' ? 'bg-[#00a884] text-white' : 'text-gray-400'}`}><Truck size={18}/></button>
          <button onClick={() => setActiveTab('history')} className={`p-2 rounded-xl transition-all ${activeTab === 'history' ? 'bg-[#00a884] text-white' : 'text-gray-400'}`}><History size={18}/></button>
        </div>
      </header>

      {/* אזור התוכן */}
      <main className="flex-1 overflow-hidden relative">
        
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col p-4 space-y-4 overflow-y-auto pb-32">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-xl ${msg.sender === 'ai' ? 'bg-[#202c33] border-r-4 border-[#C9A227]' : 'bg-[#005c4b]'}`}>
                  <p className="text-[15px] leading-relaxed">
                    {msg.text.split('**').map((part: string, i: number) => 
                      i % 2 === 1 ? <strong key={i} className="text-[#C9A227] font-black">{part}</strong> : part
                    )}
                  </p>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex items-center gap-2 text-[10px] text-[#00a884] font-bold animate-pulse px-2">
                <Loader2 size={12} className="animate-spin" /> מעדכן את המשרד...
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-black underline decoration-[#00a884]">מעקב הזמנה חיה</h2>
            <div className="bg-[#202c33] p-5 rounded-[2rem] border border-white/5 space-y-4">
              <div className="flex justify-between items-center text-xs opacity-60">
                <span>הזמנה #9902</span>
                <span className="text-[#00a884]">מועמס במחצבה</span>
              </div>
              <div className="flex items-center gap-4">
                <Truck className="text-[#C9A227]" size={30} />
                <div>
                  <p className="font-bold text-sm">פול-טריילר מצע א'</p>
                  <p className="text-[10px] opacity-50 text-white">נהג: סאמר | הגעה משוערת: 11:45</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-6 space-y-4 overflow-y-auto h-full">
            <h2 className="text-xl font-black">היסטוריה</h2>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#202c33]/40 p-4 rounded-2xl flex justify-between items-center border border-white/5">
                <div className="flex gap-3 items-center">
                  <Package className="text-gray-500" size={20} />
                  <div>
                    <p className="text-sm font-bold text-white">דבק 800 + מצע</p>
                    <p className="text-[10px] opacity-40 text-white">18/02/2026 | אבן יהודה</p>
                  </div>
                </div>
                <CheckCircle2 size={16} className="text-[#00a884]" />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* שורת קלט (רק בצ'אט) */}
      {activeTab === 'chat' && (
        <footer className="p-4 bg-[#0b141a] absolute bottom-0 w-full z-10">
          <div className="max-w-4xl mx-auto flex gap-2 bg-[#2a3942] p-2 rounded-[2.5rem] shadow-2xl border border-white/5">
            <input 
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="כתוב הודעה ל-Ai ח.סבן..."
              className="flex-1 bg-transparent p-4 outline-none font-bold text-sm text-white"
            />
            <button onClick={handleSend} className="bg-[#00a884] p-4 rounded-full text-white hover:scale-105 active:scale-90 transition-all shadow-lg">
              <Send size={20} />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
