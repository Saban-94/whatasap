'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Moon, Sun, MoreVertical, CheckCheck, Menu, Phone, Video, Search, Paperclip, Smile } from 'lucide-react';

// --- הגדרות תמונות ---
const SHAHAR_IMG = "https://ui-avatars.com/api/?name=Shahar+Shaul&background=C9A227&color=fff";
const AI_IMG = "https://ui-avatars.com/api/?name=Ai+Saban&background=00a884&color=fff";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export default function ShaharWhatsApp() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: Date.now(),
        text: "**אהלן שחר אחי.** Ai-ח.סבן כאן. המשרד פתוח, ראמי בשיבוצים, מה הולך היום לאתר?",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMsg: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
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
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: data.reply || "אחי, ראמי בשיחה אחרת. נסה שוב עוד רגע.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "**תקלה בשרת.** המנוף של ראמי לא מגיב.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className={`flex h-screen w-full transition-colors duration-300 font-sans ${isDarkMode ? 'bg-[#0b141a] text-[#e9edef]' : 'bg-[#f0f2f5] text-black'}`} dir="rtl">
      
      {/* Sidebar - Desktop Only */}
      <div className={`hidden md:flex w-[380px] border-l ${isDarkMode ? 'border-white/10 bg-[#111b21]' : 'border-black/10 bg-white'} flex-col`}>
        <header className={`p-4 flex justify-between items-center ${isDarkMode ? 'bg-[#202c33]' : 'bg-[#f0f2f5]'}`}>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#C9A227]">
            <img src={SHAHAR_IMG} alt="Shahar" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-4 text-gray-400">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="hover:text-[#00a884] transition-colors">
              {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            <MoreVertical size={20} className="cursor-pointer"/>
          </div>
        </header>
        
        <div className="p-3 overflow-hidden">
          <div className={`flex items-center gap-3 p-2 rounded-xl ${isDarkMode ? 'bg-[#202c33]' : 'bg-gray-100'}`}>
             <Search size={18} className="text-gray-400 mr-2"/>
             <input placeholder="חפש שיחה..." className="bg-transparent outline-none text-sm w-full py-1" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
           <div className={`p-4 flex items-center gap-3 cursor-pointer ${isDarkMode ? 'bg-[#2a3942]' : 'bg-gray-200'}`}>
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#00a884]">
                <img src={AI_IMG} alt="AI" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 border-b border-white/5 pb-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Ai-ח.סבן</span> 
                  <span className="text-[11px] opacity-60">14:20</span>
                </div>
                <p className="text-xs opacity-60 truncate font-medium">סדרן פעיל: ראמי מסארוה</p>
              </div>
           </div>
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col relative h-full bg-opacity-50">
        
        {/* Header */}
        <header className={`p-3 flex items-center justify-between shadow-md z-10 ${isDarkMode ? 'bg-[#202c33]' : 'bg-[#f0f2f5]'}`}>
          <div className="flex items-center gap-3">
            <Menu className="md:hidden text-gray-400" />
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#00a884]">
              <img src={AI_IMG} alt="AI Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-bold text-[15px]">Ai-ח.סבן</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#00a884] rounded-full animate-pulse shadow-[0_0_5px_#00a884]"></span>
                <span className="text-[10px] text-[#00a884] font-bold tracking-wide">ONLINE (RAMI)</span>
              </div>
            </div>
          </div>
          <div className="flex gap-5 text-gray-400 items-center pl-2">
            <Video size={20} className="hidden sm:block cursor-pointer hover:text-[#00a884]"/>
            <Phone size={18} className="hidden sm:block cursor-pointer hover:text-[#00a884]"/>
            <MoreVertical size={20} className="cursor-pointer"/>
          </div>
        </header>

        {/* Chat Body */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 pb-28 ${isDarkMode ? 'bg-[#0b141a]' : 'bg-[#efeae2]'}`} 
             style={{backgroundImage: isDarkMode ? 'none' : 'url("https://w0.peakpx.com/wallpaper/580/630/wallpaper-whatsapp-background.jpg")', backgroundSize: 'contain', backgroundBlendMode: 'overlay'}}>
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] sm:max-w-[70%] px-3 py-2 rounded-xl shadow-md relative ${
                msg.sender === 'ai' 
                ? (isDarkMode ? 'bg-[#202c33]' : 'bg-white text-black') 
                : (isDarkMode ? 'bg-[#005c4b] text-[#e9edef]' : 'bg-[#dcf8c6] text-black')
              }`}>
                <p className="text-[14.5px] leading-relaxed whitespace-pre-line">
                  {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-[#C9A227] font-black">{part}</strong> : part)}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1 opacity-50">
                  <span className="text-[10px]">{msg.timestamp}</span>
                  {msg.sender === 'user' && <CheckCheck size={14} className="text-[#53bdeb]" />}
                </div>
              </div>
            </div>
          ))}
          
          {isThinking && (
             <div className="flex justify-start">
                <div className={`px-4 py-2 rounded-xl text-[11px] font-bold italic animate-pulse ${isDarkMode ? 'bg-[#202c33]' : 'bg-white'}`}>
                  ראמי בשיבוץ...
                </div>
             </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Footer Input Area */}
        <footer className={`p-3 absolute bottom-0 w-full z-20 ${isDarkMode ? 'bg-[#202c33]' : 'bg-[#f0f2f5]'}`}>
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="flex gap-4 text-gray-400">
              <Smile size={24} className="cursor-pointer hover:text-[#00a884]"/>
              <Paperclip size={24} className="cursor-pointer hover:text-[#00a884]"/>
            </div>
            <div className={`flex-1 flex items-center rounded-full px-5 py-1 shadow-inner ${isDarkMode ? 'bg-[#2a3942]' : 'bg-white'}`}>
               <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="הקלד הודעה..." 
                className="bg-transparent flex-1 py-3 outline-none text-[15px]"
               />
            </div>
            <button 
              onClick={handleSend}
              disabled={isThinking}
              className={`p-3.5 rounded-full text-white shadow-xl transform transition-all active:scale-90 ${isThinking ? 'bg-gray-600' : 'bg-[#00a884] hover:bg-[#06cf9c]'}`}
            >
              <Send size={20} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
