'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, HardHat, Camera, FileUp, ShoppingCart, Play, User, History } from 'lucide-react';

// --- סוגי נתונים ---
interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  application_method: string;
  unit: string;
  image_url: string;
  video_url: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  product?: Product | null;
}

// --- קומפוננטת כרטיס מוצר ---
const ProductCard = ({ product }: { product: Product }) => (
  <div className="mt-4 bg-[#162127] rounded-2xl overflow-hidden border border-gray-700 shadow-2xl max-w-sm mr-auto ml-0 text-right font-sans">
    <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover border-b border-gray-700" />
    <div className="p-4 space-y-3">
      <h4 className="text-[#C9A227] font-black text-lg tracking-tighter leading-none">{product.name}</h4>
      <p className="text-gray-400 text-[11px] leading-tight">{product.description}</p>
      <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
        <div className="bg-[#202c33] p-2 rounded-lg border border-gray-800">
          <span className="text-gray-500 block uppercase mb-1 font-black">יישום</span>
          {product.application_method}
        </div>
        <div className="bg-[#202c33] p-2 rounded-lg border border-gray-800">
          <span className="text-gray-500 block uppercase mb-1 font-black">אריזה</span>
          {product.unit}
        </div>
      </div>
      <button className="w-full bg-[#C9A227] text-black font-black py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#e0b52d] transition-all text-xs">
        <ShoppingCart size={14} /> בצע הזמנה
      </button>
    </div>
  </div>
);

// --- הקומפוננטה הראשית עם Suspense ל-Vercel ---
function SabanChatContent() {
  const searchParams = useSearchParams();
  const [userName, setUserName] = useState('קבלן');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = searchParams.get('user');
    if (user === 'shahar') setUserName('שחר שאול');
    
    setMessages([
      { role: 'assistant', content: `אהלן ${user === 'shahar' ? 'שחר אחי' : 'אחי'}, ברוך הבא למוקד VIP של ח. סבן. אני רואה שאתה עובד על הפרויקט בבילו 53. מה להכין לך היום?` }
    ]);
  }, [searchParams]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsThinking(true);
    setTimeout(() => { setIsThinking(false); }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b141a] text-right" dir="rtl">
      {/* Header VIP */}
      <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-gray-700 shadow-xl z-10 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C9A227] rounded-full flex items-center justify-center text-black font-black text-xl border-2 border-yellow-600">ח</div>
          <div>
            <h1 className="font-bold text-white text-sm">ח. סבן - Intelligence</h1>
            <p className="text-[9px] text-green-500 font-black tracking-widest uppercase italic">VIP SERVICE | {userName}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-[#C9A227] transition-colors"><History size={20} /></button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcd2de8.png')] bg-repeat opacity-95">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
            <div className={`p-4 rounded-2xl shadow-xl max-w-[85%] ${m.role === 'user' ? 'bg-[#005c4b] text-white rounded-tl-none border-r-4 border-[#C9A227]' : 'bg-[#202c33] text-white rounded-tr-none border border-gray-700 font-sans'}`}>
              <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed font-medium">{m.content}</div>
            </div>
            {m.product && <ProductCard product={m.product} />}
          </div>
        ))}
        {isThinking && <div className="text-[10px] text-gray-500 font-bold italic pr-2">בודק במחסן ח. סבן...</div>}
      </div>

      {/* Input */}
      <div className="p-4 bg-[#202c33] border-t border-gray-700 shadow-inner">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button className="p-3 text-gray-400 hover:text-[#C9A227]"><FileUp size={24} /></button>
          <input 
            value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="איך אפשר לעזור אחי?" 
            className="flex-1 p-4 rounded-2xl bg-[#2a3942] text-white outline-none border border-transparent focus:border-[#C9A227] transition-all font-sans" 
          />
          <button onClick={handleSend} className="bg-[#C9A227] p-4 rounded-2xl text-black hover:bg-[#e0b52d] shadow-lg transition-all"><Send size={24} /></button>
        </div>
      </div>
    </div>
  );
}

// לטיפול בשגיאות Suspense ב-Next.js 16/15
export default function Home() {
  return (
    <Suspense fallback={<div className="bg-[#0b141a] h-screen text-[#C9A227] flex items-center justify-center font-black">טוען VIP...</div>}>
      <SabanChatContent />
    </Suspense>
  );
}
