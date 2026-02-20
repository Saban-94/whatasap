'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Send, ShoppingCart, Moon, Sun, CreditCard, 
  History, MapPin, Share2, MessageSquare, Loader2, Sparkles, BrainCircuit
} from 'lucide-react';
import OrderSidebar from './components/OrderSidebar';

const SHAHAR_PROFILE_PIC = "https://api.dicebear.com/7.x/pixel-art/svg?seed=ShaharShaul";
const SABAN_AI_PROFILE_PIC = "https://media-mrs2-1.cdn.whatsapp.net/v/t61.24694-24/524989315_1073256511118475_7315275522833323073_n.jpg?ccb=11-4&oh=01_Q5Aa3wFxRPXggH-pzRFes-D1aIk6klzJrTv9Ks5RbOrhtvKfvQ&oe=69A5059E&_nc_sid=5e03e0&_nc_cat=111";

export default function ShaharHyperApp() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  const [projects, setProjects] = useState([
    { id: 1, name: 'אבן יהודה', address: 'האתרוג 44, אבן יהודה' },
    { id: 2, name: 'כפר מונש', address: 'הרימון 5, כפר מונש' }
  ]);
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- מוח זוכר: טעינת היסטוריה מ-LocalStorage ---
  useEffect(() => {
    const savedChat = localStorage.getItem('shahar_chat_history');
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    } else {
      setTimeout(() => {
        addBotMessage(`אהלן שחר אחי, התגעגעתי. אני זוכר שאנחנו באמצע העבודה ב${selectedProject.name}. מה חסר לך שם היום?`);
      }, 1000);
    }
  }, []);

  // שמירת כל הודעה בזיכרון
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('shahar_chat_history', JSON.stringify(messages));
    }
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (text: string, products: any[] = []) => {
    setIsThinking(false);
    setIsTyping(true);
    
    // סימולציה של מהירות הקלדה אנושית (לפי אורך הטקסט)
    const typingDuration = Math.min(Math.max(text.length * 15, 1000), 3000);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text, 
        sender: 'ai', 
        products, 
        time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) 
      }]);
      setIsTyping(false);
    }, typingDuration);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), text: input, sender: 'user', time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');

    // שלב "היועץ חושב"
    setIsThinking(true);

    try {
      const res = await fetch('/shahar/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message: currentInput, 
            history: messages.slice(-10), // שולח לגימני את 10 ההודעות האחרונות לזיכרון
            context: { selectedProject } 
        }),
      });
      const data = await res.json();
      addBotMessage(data.reply, data.detectedProducts);
    } catch (e) {
      setIsThinking(false);
      addBotMessage("אחי, המוח שלי קצת עמוס. שלח לי שוב?");
    }
  };

  return (
    <div className={`${isDarkMode ? 'bg-[#0b141a] text-white' : 'bg-[#f0f2f5] text-black'} flex h-screen w-full font-sans transition-all duration-500 overflow-hidden`} dir="rtl">
      
      {/* Sidebar - לוח פיקוד */}
      <div className={`w-80 border-l ${isDarkMode ? 'border-[#202c33] bg-[#111b21]' : 'border-gray-200 bg-white'} hidden lg:flex flex-col`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-white/5 transition-transform active:scale-90">
                {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} />}
             </button>
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#00a884] animate-pulse">Online</span>
                <img src={SHAHAR_PROFILE_PIC} className="w-10 h-10 rounded-full border-2 border-[#C9A227] shadow-lg shadow-[#C9A227]/20" />
             </div>
          </div>

          <div className="bg-gradient-to-br from-[#C9A227] to-[#8e721b] p-6 rounded-[2rem] shadow-2xl text-black mb-8 relative overflow-hidden">
            <BrainCircuit className="absolute -top-4 -left-4 opacity-10 w-24 h-24" />
            <p className="text-[10px] font-black opacity-60">VIP LOGISTICS ACCESS</p>
            <h2 className="text-2xl font-black tracking-tighter">שחר שאול</h2>
            <div className="mt-6 flex justify-between items-end border-t border-black/10 pt-4">
               <div>
                  <p className="text-[9px] font-bold opacity-60">פרויקט פעיל</p>
                  <p className="text-xs font-black">{selectedProject.name}</p>
               </div>
               <span className="bg-black text-white text-[9px] px-2 py-1 rounded-full font-mono">ID: 621100</span>
            </div>
          </div>

          <div className="space-y-1 mb-8">
            <p className="text-[10px] font-bold text-gray-500 mr-2 mb-2">פעולות מהירות</p>
            <button onClick={() => router.push('/shahar/history')} className="w-full p-4 rounded-2xl bg-white/5 flex items-center gap-3 text-sm hover:bg-[#C9A227]/10 transition-all group">
                <History size={18} className="group-hover:rotate-[-20deg] transition-transform" /> היסטוריית הזמנות
            </button>
            <button onClick={() => router.push('/shahar/track')} className="w-full p-4 rounded-2xl bg-white/5 flex items-center gap-3 text-sm hover:bg-[#C9A227]/10 transition-all group">
                <MapPin size={18} className="group-hover:scale-110 transition-transform" /> מעקב משלוחים
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <header className={`${isDarkMode ? 'bg-[#202c33]/80' : 'bg-white/80'} backdrop-blur-md h-16 px-6 flex items-center justify-between z-20 sticky top-0`}>
          <div className="flex items-center gap-4">
             <div className="relative">
                <img src={SABAN_AI_PROFILE_PIC} className="w-11 h-11 rounded-full border-2 border-[#00a884] object-cover shadow-lg" />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00a884] border-2 border-[#202c33] rounded-full shadow-sm" />
             </div>
             <div>
               <p className="text-sm font-black tracking-wide">גימני - יועץ ח.סבן</p>
               <p className="text-[10px] text-[#00a884] font-bold">מחובר למלאי ולזיכרון שלך</p>
             </div>
          </div>
          <button onClick={() => setIsOrderOpen(true)} className="relative p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
             <ShoppingCart size={22} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
             {cart.length > 0 && (
               <span className="absolute -top-1 -right-1 bg-[#C9A227] text-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-[#202c33]">
                 {cart.length}
               </span>
             )}
          </button>
        </header>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-[url('https://i.ibb.co/S6mXvY7/whatsapp-bg.png')] bg-fixed opacity-95">
          {messages.map((msg, idx) => (
            <div key={msg.id} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'} items-end gap-3 group`}>
              {msg.sender === 'ai' && <img src={SABAN_AI_PROFILE_PIC} className="w-8 h-8 rounded-full shadow-md mb-1 hidden md:block" />}
              <div className={`max-w-[80%] md:max-w-[50%] p-4 rounded-[1.5rem] shadow-xl relative transition-all hover:scale-[1.01] ${msg.sender === 'ai' ? (isDarkMode ? 'bg-[#202c33] rounded-tr-none border border-white/5' : 'bg-white text-black') : 'bg-[#005c4b] rounded-tl-none text-white'}`}>
                <p className="text-[13px] md:text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                
                {msg.products?.map((p: any) => (
                  <div key={p.sku + Math.random()} className="mt-4 bg-black/40 rounded-2xl border border-[#C9A227]/30 p-4 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-3">
                       <span className="text-[9px] font-black bg-[#C9A227] text-black px-2 py-0.5 rounded uppercase">מק"ט {p.sku}</span>
                       <Sparkles size={14} className="text-[#C9A227]" />
                    </div>
                    <p className="text-xs font-black mb-4">{p.name}</p>
                    <button onClick={() => {setCart([...cart, {...p, qty: 1}]); setIsOrderOpen(true);}} className="w-full bg-[#00a884] text-white text-[10px] font-black py-3 rounded-xl shadow-lg shadow-[#00a884]/20 hover:bg-[#017561] transition-all">הוסף לסל שחר</button>
                  </div>
                ))}
                <span className="text-[8px] mt-2 opacity-30 block text-left font-mono">{msg.time}</span>
              </div>
              {msg.sender === 'user' && <img src={SHAHAR_PROFILE_PIC} className="w-8 h-8 rounded-full shadow-md mb-1 hidden md:block" />}
            </div>
          ))}

          {/* אפקט "היועץ חושב" (Thinking State) */}
          {isThinking && (
            <div className="flex justify-start items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-[#202c33] px-4 py-3 rounded-2xl rounded-tr-none flex items-center gap-3 border border-white/5">
                    <Loader2 className="animate-spin text-[#C9A227]" size={16} />
                    <span className="text-xs text-gray-400 font-bold">גימני בודק מלאי ומנתח נתונים...</span>
                </div>
            </div>
          )}

          {/* אפקט הקלדה (Typing Bubbles) */}
          {isTyping && (
            <div className="flex justify-start items-center gap-3">
                <div className="bg-[#202c33] px-4 py-3 rounded-2xl rounded-tr-none flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
          )}
          <div ref={scrollRef} className="h-4" />
        </div>

        {/* Chat Input */}
        <footer className={`p-4 md:p-6 ${isDarkMode ? 'bg-[#202c33]' : 'bg-white border-t'} z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]`}>
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <div className="flex-1 relative">
                <input 
                  value={input} 
                  onChange={(e)=>setInput(e.target.value)} 
                  onKeyDown={(e)=>e.key==='Enter' && handleSend()}
                  placeholder="כתוב פה שחר אחי..." 
                  className={`w-full p-4 pr-6 rounded-2xl text-sm transition-all ${isDarkMode ? 'bg-[#2a3942] focus:bg-[#324550]' : 'bg-gray-100 text-black'} outline-none border border-transparent focus:border-[#00a884]/30`} 
                />
            </div>
            <button 
              onClick={handleSend} 
              disabled={!input.trim()}
              className={`${input.trim() ? 'bg-[#00a884] scale-110 shadow-lg shadow-[#00a884]/30' : 'bg-gray-600 opacity-50'} p-4 rounded-full text-white transition-all active:scale-95`}
            >
                <Send size={20} />
            </button>
          </div>
        </footer>
      </div>

      <OrderSidebar isOpen={isOrderOpen} setIsOpen={setIsOrderOpen} cart={cart} setCart={setCart} />
    </div>
  );
}
