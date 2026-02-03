'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, Camera, FileUp, ShoppingCart, History, HardHat } from 'lucide-react';

// --- Interfaces ---
interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  application_method: string;
  unit: string;
  image_url: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  product?: Product | null;
}

// --- קומפוננטת כרטיס מוצר ---
const ProductCard = ({ product }: { product: Product }) => (
  <div className="mt-3 bg-[#162127] rounded-xl overflow-hidden border border-gray-700 shadow-2xl max-w-[260px] mr-auto text-right">
    <img src={product.image_url} alt={product.name} className="w-full h-28 object-cover" />
    <div className="p-3">
      <h4 className="text-[#C9A227] font-bold text-sm leading-tight">{product.name}</h4>
      <p className="text-gray-400 text-[10px] line-clamp-2 my-1">{product.description}</p>
      <button className="w-full bg-[#C9A227] text-black font-black py-2 rounded-lg flex items-center justify-center gap-2 text-[10px] active:scale-95 transition-transform">
        <ShoppingCart size={12} /> בצע הזמנה
      </button>
    </div>
  </div>
);

function SabanChatContent() {
  const searchParams = useSearchParams();
  const [userName, setUserName] = useState('אחי');
  const [profileImg, setProfileImg] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = searchParams.get('user');
    if (user === 'shahar') {
      setUserName('שחר שאול');
      setProfileImg('https://randomuser.me/api/portraits/men/32.jpg');
    }
    setMessages([{ 
      role: 'assistant', 
      content: `שלום ${user === 'shahar' ? 'שחר אחי' : 'אחי'}, כאן המוקד של ח. סבן. איך אפשר לעזור היום?` 
    }]);
  }, [searchParams]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsThinking(true);
    
    setTimeout(() => {
      setIsThinking(false);
      if (text.includes("חול")) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "יש לנו בלה חול נקי במלאי:",
          product: {
            id: 101,
            name: "בלה חול נקי",
            category: "שלד",
            description: "חול מסונן לעבודות בנייה וריצוף.",
            application_method: "מנוף",
            unit: "בלה",
            image_url: "https://saban.co.il/placeholder.jpg"
          }
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "קיבלתי אחי, בודק לך במחסן." }]);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0b141a] overflow-hidden font-sans" dir="rtl">
      {/* Header - Fixed Height */}
      <header className="h-16 bg-[#202c33] flex items-center justify-between px-4 border-b border-gray-700 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            {profileImg ? (
              <img src={profileImg} className="w-10 h-10 rounded-full border-2 border-[#C9A227] object-cover" />
            ) : (
              <div className="w-10 h-10 bg-[#C9A227] rounded-full flex items-center justify-center font-bold text-black border-2 border-yellow-600">ח</div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#202c33] rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-sm font-black leading-none">ח. סבן - VIP</h1>
            <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter italic">היועץ ההנדסי איתך | {userName}</p>
          </div>
        </div>
        <History className="text-gray-400 cursor-pointer hover:text-[#C9A227]" size={22} />
      </header>

      {/* Messages - Scrolling Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcd2de8.png')] bg-fixed opacity-95"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-3 rounded-2xl shadow-xl text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-[#005c4b] text-white rounded-tl-none border-r-4 border-[#C9A227]' 
                : 'bg-[#202c33] text-white rounded-tr-none border border-gray-700 shadow-black/50'
            }`}>
              {m.content}
            </div>
            {m.product && <ProductCard product={m.product} />}
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-end p-2">
            <div className="text-[10px] text-[#C9A227] font-bold animate-pulse italic tracking-widest">
              סבן בודק במלאי...
            </div>
          </div>
        )}
      </div>

      {/* Footer - Control Center */}
      <footer className="bg-[#202c33] p-3 border-t border-gray-700 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,.pdf"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setMessages(prev => [...prev, { role: 'user', content: `העליתי קובץ: ${e.target.files![0].name}` }]);
              }
            }}
          />
          
          <div className="flex gap-1">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-gray-400 hover:text-[#C9A227] bg-[#2a3942] rounded-full active:scale-90 transition-all shadow-inner"
            >
              <FileUp size={22} />
            </button>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-gray-400 hover:text-[#C9A227] bg-[#2a3942] rounded-full active:scale-90 transition-all md:hidden shadow-inner"
            >
              <Camera size={22} />
            </button>
          </div>

          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="איך אפשר לעזור אחי?"
            className="flex-1 bg-[#2a3942] text-white p-3.5 rounded-2xl outline-none text-sm border border-transparent focus:border-[#C9A227]/40 shadow-inner"
          />

          <button 
            onClick={handleSend}
            className="p-3.5 bg-[#C9A227] text-black rounded-2xl hover:bg-[#e0b52d] active:scale-90 transition-all shadow-lg"
          >
            <Send size={22} />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="bg-[#0b141a] h-screen text-[#C9A227] flex items-center justify-center font-black">טוען VIP...</div>}>
      <SabanChatContent />
    </Suspense>
  );
}
