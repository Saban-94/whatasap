'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Moon, Sun, MoreVertical, CheckCheck, Menu, Phone, Video, Search, Paperclip, Smile } from 'lucide-react';

// --- הגדרות תמונות פרופיל ---
const SHAHAR_IMG = "https://ui-avatars.com/api/?name=Shahar+Shaul&background=C9A227&color=fff"; // תמונת שחר
const AI_IMG = "https://ui-avatars.com/api/?name=Ai+Saban&background=00a884&color=fff"; // תמונת הבוט

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

  // הודעת פתיחה אוטומטית
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
        text: data.reply || "**אחי, ראמי לא עונה. נסה שוב.**",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "**שגיאת חיבור. המנוף של ראמי נפל.**",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className={`flex h-screen w-full transition-colors duration-300 ${isDarkMode ? 'bg-[#0b141a] text-[#e9edef]' : 'bg-[#f0f2f5] text-black'}`} dir="rtl">
      
      {/* Sidebar - Desktop */}
      <div className={`hidden md:flex w-1/3 border-l ${isDarkMode ? 'border-white/10 bg-[#111b21]' : 'border-black/10 bg-white'} flex-col`}>
        <header className={`p-4 flex justify-between items-center ${isDarkMode ? 'bg-[#202c33]' : 'bg-[#f0f2f5]'}`}>
          <img src={SHAHAR_IMG} alt="Shahar" className="w-10 h-10 rounded-full object-cover border-2 border-[#C9A227]" />
          <div className="flex gap-4 text-gray-400">
            <button onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
            <MoreVertical size={20}/>
          </div>
        </header>
        <div className="p-3">
          <div className={`flex items-center gap-3 p-2 rounded-lg ${isDarkMode ? 'bg-[#202c33]' : 'bg-gray-100'}`}>
             <Search size={18} className="text-gray-400 mr-2"/>
             <input placeholder="חפש או התחל צ'אט חדש" className="bg-transparent outline-none text-xs w-full p-1" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
           <div className={`p-4 flex items-center gap-3 cursor-pointer ${isDarkMode ? 'bg-[#2a3942]' : 'bg-gray-200'}`}>
              <img src={AI_IMG} alt="AI" className="w-12 h-12 rounded-full border-2 border-[#00a884]" />
              <div className="flex-1 border-b border-white/5 pb-2">
                <div className="flex justify-between items-center"><span className="font-bold">Ai-ח.סבן (ראמי)</span> <span className="text-[10px] opacity-50">עכשיו</span></div>
                <p className="text-xs opacity-60 truncate">סדרן פעיל: ראמי מסארוה</p>
              </div>
           </div>
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col relative h-full">
        
        {/* Header */}
        <header className={`p-3 flex items-center justify-between shadow-md z-10 ${isDarkMode ? 'bg-[#202c33]' : 'bg-[#f0f2f5]'}`}>
          <div className="flex items-center gap-3">
            <Menu className="md:hidden text-gray-400" />
            <img src={AI_IMG} alt="AI Avatar" className="w-10 h-10 rounded-full border border-[#00a884]" />
            <div>
              <h2 className="font-bold text-sm">Ai-ח.סבן</h2>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-green-500 font-bold">מחובר - ראמי זמין</span>
              </div>
            </div>
          </div>
          <div className="flex gap-5 text-gray-400 items-center">
            <Video size={20} className="hidden sm:block cursor-pointer"/>
            <Phone size={18} className="hidden sm:block cursor-pointer"/>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="md:hidden">{isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
            <MoreVertical size={20} className="cursor-pointer"/>
          </div>
        </header>

        {/* Chat Body */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 pb-28 ${isDarkMode ? 'bg-[#0b141a]' : 'bg-[#efeae2]'}`} 
             style={{backgroundImage: isDarkMode ? 'none' : 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundOpacity: 0.1}}>
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-lg shadow-sm relative ${
                msg.sender === 'ai' 
                ? (isDarkMode ? 'bg-[#202c33]' : 'bg-white') 
                : (isDarkMode ? 'bg-[#005c4b]' : 'bg-[#dcf8c6] text-black')
              }`}>
                <p className="text-[14.5px] leading-relaxed whitespace-pre-line">
                  {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-[#C9A227] font-black">{part}</strong> : part)}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1 opacity-50">
                  <span className="text-[9px]">{msg.timestamp}</span>
                  {msg.sender === 'user' && <CheckCheck size={13} className="text-blue-400" />}
                </div>
              </div>
            </div>
          ))}
          
          {isThinking && (
             <div className="flex justify-start">
                <div className={`px-4 py-2 rounded-lg text-[11px] font-bold italic animate-pulse ${isDarkMode ? 'bg-[#202c33]' : 'bg-white'}`}>
                  ראמי בודק מלאי...
                </div>
             </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Footer Input */}
        <footer className={`p-3 absolute bottom-0 w-full z-20 ${isDarkMode ? 'bg-[#202c33]' : 'bg-[#f0f2f5]'}`}>
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <div className="flex gap-3 text-gray-400 px-2">
              <Smile size={24} className="cursor-pointer"/>
              <Paperclip size={24} className="cursor-pointer"/>
            </div>
            <div className={`flex-1 flex items-center rounded-full px-4 py-1 shadow-inner ${isDarkMode ? 'bg-[#2a3942]' : 'bg-white'}`}>
               <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="הקלד הודעה..." 
                className="bg-transparent flex-1 py-2 outline-none text-sm"
               />
            </div>
            <button 
              onClick={handleSend}
              disabled={isThinking}
              className={`p-3 rounded-full text-white shadow-md transition-all active:scale-90 ${isThinking ? 'bg-gray-500' : 'bg-[#00a884] hover:bg-[#06cf9c]'}`}
            >
              <Send size={22} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
