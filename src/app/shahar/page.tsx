'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Moon, Sun, MoreVertical, CheckCheck, Menu, Phone, Video, Search, Paperclip, Smile } from 'lucide-react';

// שימוש ברכיבים שכבר מותקנים אצלך
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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
        text: data.reply || "אחי, ראמי לא זמין כרגע.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "**שגיאת תקשורת.** תבדוק את האינטרנט אחי.",
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
          <Avatar className="border-2 border-[#C9A227]">
            <AvatarImage src={SHAHAR_IMG} />
            <AvatarFallback>ש</AvatarFallback>
          </Avatar>
          <div className="flex gap-4 text-gray-400">
            <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
            </Button>
            <MoreVertical size={20} className="cursor-pointer"/>
          </div>
        </header>
        
        <div className="p-3">
          <div className={`flex items-center gap-3 p-2 rounded-lg ${isDarkMode ? 'bg-[#202c33]' : 'bg-gray-100'}`}>
             <Search size={18} className="text-gray-400 mr-2"/>
             <Input placeholder="חפש שיחה..." className="bg-transparent border-none shadow-none focus-visible:ring-0 h-8 text-xs" />
          </div>
        </div>

        <ScrollArea className="flex-1">
           <div className={`p-4 flex items-center gap-3 cursor-pointer ${isDarkMode ? 'bg-[#2a3942]' : 'bg-gray-200'}`}>
              <Avatar className="w-12 h-12 border-2 border-[#00a884]">
                <AvatarImage src={AI_IMG} />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="flex-1 border-b border-white/5 pb-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Ai-ח.סבן</span> 
                  <span className="text-[10px] opacity-50">עכשיו</span>
                </div>
                <p className="text-xs opacity-60 truncate">סדרן: ראמי מסארוה</p>
              </div>
           </div>
        </ScrollArea>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col relative h-full">
        <header className={`p-3 flex items-center justify-between shadow-md z-10 ${isDarkMode ? 'bg-[#202c33]' : 'bg-[#f0f2f5]'}`}>
          <div className="flex items-center gap-3">
            <Menu className="md:hidden text-gray-400" />
            <Avatar className="border border-[#00a884]">
              <AvatarImage src={AI_IMG} />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-sm">Ai-ח.סבן</h2>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-green-500 font-bold uppercase italic">Online</span>
              </div>
            </div>
          </div>
          <div className="flex gap-5 text-gray-400 items-center">
            <Video size={20} className="hidden sm:block cursor-pointer hover:text-[#00a884]"/>
            <Phone size={18} className="hidden sm:block cursor-pointer hover:text-[#00a884]"/>
            <MoreVertical size={20} className="cursor-pointer"/>
          </div>
        </header>

        <ScrollArea className={`flex-1 p-4 ${isDarkMode ? 'bg-[#0b141a]' : 'bg-[#efeae2]'}`}>
          <div className="space-y-4 pb-20">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-lg shadow-sm relative ${
                  msg.sender === 'ai' 
                  ? (isDarkMode ? 'bg-[#202c33]' : 'bg-white text-black') 
                  : (isDarkMode ? 'bg-[#005c4b] text-white' : 'bg-[#dcf8c6] text-black')
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
                    ראמי מקליד...
                  </div>
               </div>
            )}
          </div>
        </ScrollArea>

        <footer className={`p-3 absolute bottom-0 w-full z-20 ${isDarkMode ? 'bg-[#202c33]' : 'bg-[#f0f2f5]'}`}>
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <div className="flex gap-3 text-gray-400 px-2">
              <Smile size={22} className="cursor-pointer hover:text-[#00a884]"/>
              <Paperclip size={22} className="cursor-pointer hover:text-[#00a884]"/>
            </div>
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="הקלד הודעה..." 
              className={`flex-1 border-none focus-visible:ring-1 focus-visible:ring-[#00a884] ${isDarkMode ? 'bg-[#2a3942]' : 'bg-white'}`}
            />
            <Button 
              onClick={handleSend}
              disabled={isThinking}
              className={`rounded-full h-12 w-12 ${isThinking ? 'bg-gray-500' : 'bg-[#00a884] hover:bg-[#06cf9c]'}`}
            >
              <Send size={20} />
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
