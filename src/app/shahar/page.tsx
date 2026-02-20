'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Send, ShoppingCart, Moon, Sun, CreditCard, 
  History, MapPin, MessageSquare, Loader2, Sparkles, BrainCircuit
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
  
  const [projects] = useState([
    { id: 1, name: 'אבן יהודה', address: 'האתרוג 44, אבן יהודה' },
    { id: 2, name: 'כפר מונש', address: 'הרימון 5, כפר מונש' }
  ]);
  const [selectedProject, setSelectedProject] = useState(projects[0]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // טעינת זיכרון מ-LocalStorage
  useEffect(() => {
    const savedChat = localStorage.getItem('shahar_chat_v2');
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    } else {
      setTimeout(() => {
        addBotMessage(`אהלן שחר אחי, גימני כאן. מוכן להעמיס היום? האתר ב${selectedProject.name} מחכה לסחורה.`);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('shahar_chat_v2', JSON.stringify(messages));
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (text: string, products: any[] = []) => {
    setIsThinking(false);
    setIsTyping(true);
    const typingDuration = Math.min(Math.max(text.length * 10, 800), 2500);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now(), text, sender: 'ai', products, 
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
    setIsThinking(true);

    try {
      // קריאה ל-API ב-Vercel
      const res = await fetch('/shahar/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message: currentInput, 
            history: messages.slice(-6).map(m => ({ role: m.sender === 'ai' ? 'model' : 'user', parts: [{ text: m.text }] })),
            context: { selectedProject } 
        }),
      });
      const data = await res.json();
      addBotMessage(data.reply, data.detectedProducts);
    } catch (e) {
      setIsThinking(false);
      addBotMessage("שחר אחי, נראה שיש לי ניתוק קטן מהשרת של ח.סבן. תנסה שוב?");
    }
  };

  return (
    <div className={`${isDarkMode ? 'bg-[#0b141a] text-white' : 'bg-[#f0f2f5] text-black'} flex h-screen w-full font-sans transition-all duration-500 overflow-hidden`} dir="rtl">
      
      {/* Sidebar */}
      <div className={`w-80 border-l ${isDarkMode ? 'border-[#202c33] bg-[#111b21]' : 'border-gray-200 bg-white'} hidden lg:flex flex-col`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-white/5 transition-transform active:scale-90">
                {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} />}
             </button>
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#00a884] animate-pulse">Online</span>
                <img src={SHAHAR_PROFILE_PIC} className="w-10 h-10 rounded-full border-2 border-[#C9A227]" />
             </div>
          </div>

          <div className="bg-gradient-to-br from-[#C9A227] to-[#8e721b] p-6 rounded-[2rem] shadow-xl text-black mb-8 relative">
            <BrainCircuit className="absolute -top-4 -left-4 opacity-10 w-24 h-24" />
            <h2 className="text-2xl font-black tracking-tighter text-right">שחר שאול</h2>
            <div className="mt-6 flex justify-between items-end border-t border-black/10 pt-4">
               <div className="text-right">
                  <p className="text-[9px] font-bold opacity-60">פרויקט פעיל</p>
                  <p className="text-xs font-black">{selectedProject.name}</p>
               </div>
            </div>
          </div>

          <div className="space-y-1">
            <button onClick={() => router.push('/shahar/history')} className="w-full p-4 rounded-2xl bg-white/5 flex items-center gap-3 text-sm hover:bg-[#C9A227]/10 transition-all">
                <History size={18} /> היסטוריית הזמנות
            </button>
            <button onClick={() => router.push('/shahar/track')} className="w-full p-4 rounded-2xl bg-white/5 flex items-center gap-3 text-sm hover:bg-[#C9A227]/10 transition-all">
                <MapPin size={18} /> מעקב משלוח
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <header className={`${isDarkMode ? 'bg-[#202c33]/80' : 'bg-white/80'} backdrop-blur-md h-16 px-6 flex items-center justify-between z-20`}>
          <div className="flex items-center gap-4">
             <div className="relative">
                <img src={SABAN_AI_PROFILE_PIC} className="w-11 h-11 rounded-full border-2 border-[#00a884] object-cover shadow-lg" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#202c33] rounded-full" />
             </div>
             <div className="text-right">
               <p className="text-sm font-black">גימני - יועץ ח.סבן</p>
               <p className="text-[10px] text-[#00a884] font-bold">מחובר למלאי ולזיכרון שלך</p>
             </div>
          </div>
          <button onClick={() => setIsOrderOpen(true)} className="relative p-2">
             <ShoppingCart size={22} />
             {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[#C9A227] text-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">{cart.length}</span>}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-black/5">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'} items-end gap-3`}>
              {msg.sender === 'ai' && <img src={SABAN_AI_PROFILE_PIC} className="w-8 h-8 rounded-full mb-1" />}
              <div className={`max-w-[80%] p-4 rounded-[1.5rem] shadow-lg ${msg.sender === 'ai' ? (isDarkMode ? 'bg-[#202c33] rounded-tr-none' : 'bg-white') : 'bg-[#005c4b] rounded-tl-none text-white'}`}>
                <p className="text-[13px] md:text-sm leading-relaxed text-right">{msg.text}</p>
                {msg.products?.map((p: any) => (
                  <div key={p.sku + Math.random()} className="mt-4 bg-black/40 rounded-2xl p-4 border border-[#C9A227]/30">
                    <p className="text-xs font-black mb-2 text-right">{p.name}</p>
                    <button onClick={() => {setCart([...cart, {...p, qty: 1}]); setIsOrderOpen(true);}} className="w-full bg-[#00a884] text-white text-[10px] font-black py-2 rounded-xl">הוסף לסל שחר</button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start items-center gap-3">
                <div className="bg-[#202c33] px-4 py-3 rounded-2xl rounded-tr-none flex items-center gap-3 border border-white/5">
                    <Loader2 className="animate-spin text-[#C9A227]" size={16} />
                    <span className="text-xs text-gray-400 font-bold">גימני בודק במלאי...</span>
                </div>
            </div>
          )}

          {isTyping && (
            <div className="flex justify-start items-center gap-3">
                <div className="bg-[#202c33] px-4 py-3 rounded-2xl rounded-tr-none flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{animationDelay:'0.2s'}} />
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{animationDelay:'0.4s'}} />
                </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <footer className={`p-4 ${isDarkMode ? 'bg-[#202c33]' : 'bg-white border-t'}`}>
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <input 
              value={input} onChange={(e)=>setInput(e.target.value)} 
              onKeyDown={(e)=>e.key==='Enter' && handleSend()}
              placeholder="דבר איתי שחר אחי..." 
              className={`flex-1 p-4 rounded-2xl text-sm ${isDarkMode ? 'bg-[#2a3942]' : 'bg-gray-100 text-black'} outline-none`} 
            />
            <button onClick={handleSend} className="bg-[#00a884] p-4 rounded-full text-white transition-all active:scale-90 shadow-lg shadow-[#00a884]/20">
                <Send size={20} />
            </button>
          </div>
        </footer>
      </div>

      <OrderSidebar isOpen={isOrderOpen} setIsOpen={setIsOrderOpen} cart={cart} setCart={setCart} />
    </div>
  );
}
