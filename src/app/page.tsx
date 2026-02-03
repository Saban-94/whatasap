'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, ShoppingCart, History, FileCheck, MapPin, Truck, Package } from 'lucide-react';
import customerData from '@/data/customers.json';
import productData from '@/data/products.json';

// --- סוגי נתונים ---
interface OrderState {
  projectName: string;
  address: string;
  unloadingMethod: 'מנוף' | 'ידנית' | '';
  items: any[];
}

function SabanVIPChat() {
  const searchParams = useSearchParams();
  const [customer, setCustomer] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  // ניהול מצב הזמנה (Slot Filling)
  const [orderState, setOrderState] = useState<OrderState>({
    projectName: '',
    address: '',
    unloadingMethod: '',
    items: []
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = searchParams.get('user');
    const found = customerData.find(c => c.magic_link_token === token);
    if (found) {
      setCustomer(found);
      // הזרקת היסטוריה מה-CSV לשיחה הראשונה
      setMessages([{ 
        role: 'assistant', 
        content: `אהלן ${found.name} אחי! אני רואה שההזמנה האחרונה שלך הייתה טיח חוץ 710 לפרויקט בקפלנסקי. להוציא לך השלמה לשם, או שאנחנו על פרויקט חדש היום?` 
      }]);
    }
  }, [searchParams]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      
      // לוגיקת ניתוח (מוקצנת לצורך הדוגמה)
      if (!orderState.projectName && (userText.includes("כן") || userText.includes("קפלנסקי"))) {
        setOrderState(prev => ({ ...prev, projectName: 'קפלנסקי', address: 'קפלנסקי 20, כפר סבא' }));
        setMessages(prev => [...prev, { role: 'assistant', content: "סגור, רשמתי קפלנסקי. עכשיו אחי, איך פורקים? עם מנוף כמו תמיד או פריקה ידנית הפעם?" }]);
      } else if (orderState.projectName && !orderState.unloadingMethod) {
        if (userText.includes("מנוף") || userText.includes("ידנית")) {
          const method = userText.includes("מנוף") ? 'מנוף' : 'ידנית';
          setOrderState(prev => ({ ...prev, unloadingMethod: method }));
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `מעולה. אז יש לנו הכל: פרויקט ${orderState.projectName}, כתובת ${orderState.address}, ופריקה ב${method}. מאשר לשלוח את הטופס למחסן?` 
          }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "קיבלתי אחי. אני מעדכן את הפרטים." }]);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0b141a] overflow-hidden font-sans" dir="rtl">
      {/* Header VIP */}
      <header className="h-16 bg-[#202c33] flex items-center justify-between px-4 border-b border-gray-700 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          {customer?.profile_image_url ? (
            <img src={customer.profile_image_url} className="w-10 h-10 rounded-full border-2 border-[#C9A227] object-cover" />
          ) : (
            <div className="w-10 h-10 bg-[#C9A227] rounded-full flex items-center justify-center font-bold text-black border-2 border-yellow-600">ח</div>
          )}
          <div className="flex flex-col">
            <h1 className="text-white text-sm font-black">ח. סבן - Intelligence</h1>
            <p className="text-[10px] text-[#C9A227] font-bold tracking-widest italic uppercase">VIP {customer?.name || 'אורח'}</p>
          </div>
        </div>
        <History className="text-gray-400 cursor-pointer" size={22} />
      </header>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcd2de8.png')] bg-fixed opacity-95">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-3 rounded-2xl shadow-xl text-sm leading-relaxed ${
              m.role === 'user' ? 'bg-[#005c4b] text-white rounded-tl-none border-r-4 border-[#C9A227]' : 'bg-[#202c33] text-white rounded-tr-none border border-gray-700'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isThinking && <div className="text-[10px] text-[#C9A227] font-bold animate-pulse pr-2 italic">סבן מנתח נתונים...</div>}
      </div>

      {/* Order Summary Widget (Floating) */}
      {orderState.projectName && (
        <div className="absolute top-20 left-4 right-4 bg-[#162127]/90 backdrop-blur-md border border-gray-700 p-3 rounded-2xl shadow-2xl z-40 animate-in slide-in-from-top-5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-2">
                <span className="text-[10px] font-black text-[#C9A227] uppercase tracking-widest flex items-center gap-1"><FileCheck size={12}/> טופס הזמנה מתגבש</span>
                <span className="text-[9px] text-gray-500">ID: #SBN-{Math.floor(Math.random() * 9000)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="flex flex-col gap-1"><span className="text-gray-500 font-bold uppercase tracking-tighter flex items-center gap-1"><Package size={10}/> פרויקט</span><span className="text-white truncate">{orderState.projectName}</span></div>
                <div className="flex flex-col gap-1"><span className="text-gray-500 font-bold uppercase tracking-tighter flex items-center gap-1"><MapPin size={10}/> כתובת</span><span className="text-white truncate">{orderState.address}</span></div>
                <div className="flex flex-col gap-1"><span className="text-gray-500 font-bold uppercase tracking-tighter flex items-center gap-1"><Truck size={10}/> הובלה</span><span className={`${orderState.unloadingMethod ? 'text-green-500' : 'text-red-500 animate-pulse'} font-black`}>{orderState.unloadingMethod || 'ממתין...'}</span></div>
            </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#202c33] p-3 border-t border-gray-700 z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="איך מתקדמים אחי?"
            className="flex-1 bg-[#2a3942] text-white p-3.5 rounded-2xl outline-none text-sm border border-transparent focus:border-[#C9A227]/40 shadow-inner"
          />
          <button onClick={handleSend} className="p-3.5 bg-[#C9A227] text-black rounded-2xl hover:bg-[#e0b52d] shadow-lg"><Send size={22} /></button>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="bg-[#0b141a] h-screen text-[#C9A227] flex items-center justify-center font-black">טוען VIP...</div>}>
      <SabanVIPChat />
    </Suspense>
  );
}
