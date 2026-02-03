'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, MapPin, Clock, Truck, CheckCircle2, Package, AlertCircle, ShoppingCart } from 'lucide-react';
import productData from '@/data/products.json';

// --- לוגיקת ניתוח מוצרים (The Engine) ---
const classifyProduct = (text: string) => {
  const clean = text.toLowerCase();
  if (/מלט|טיח|חול|סומסום|בטון|בלוק|אזכורית/.test(clean)) return "חומרי שלד ובניין";
  if (/שקע|תקע|פאזי|נורה|כבל/.test(clean)) return "חשמל ותאורה";
  if (/ברגים|ביט|מסורית|מקדח|שאקל|חבל|סולם/.test(clean)) return "פרזול ואספקה טכנית";
  if (/צבע|רולר|מגש|פוליתאן|ספרי/.test(clean)) return "צבע וגמר";
  if (/כיסא|שולחן|נייר|אסלות|מגב|שקיות/.test(clean)) return "לוגיסטיקה וניקיון";
  return "כללי/אחר";
};

export default function SabanIntelligenceApp() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState('INIT'); // INIT -> ADDRESS -> REVIEW -> FINAL
  const [isThinking, setIsThinking] = useState(false);
  const [orderSummary, setOrderSummary] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // אתחול שיחה עם היסטוריה של שחר (מה-CSV)
  useEffect(() => {
    const user = searchParams.get('user');
    if (user === 'shahar') {
      setMessages([{ 
        role: 'assistant', 
        content: `אהלן שחר שאול אחי! אני רואה שהזמנת טיח 710 לקפלנסקי פעם שעברה. להוציא לך השלמה לשם, או שאנחנו על פרויקט חדש היום?` 
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
      
      // 1. שלב זיהוי פרויקט וכתובת
      if (step === 'INIT' && (userText.includes("חדש") || userText.includes("לא"))) {
        setStep('ADDRESS');
        setMessages(prev => [...prev, { role: 'assistant', content: 'סגור אחי. לאן להוציא את המשאית? תן לי כתובת מדויקת.' }]);
      } 
      // 2. שלב ניתוח רשימת מוצרים ומרחק
      else if (step === 'ADDRESS') {
        setStep('REVIEW');
        const items = userText.split('\n').filter(l => l.trim() !== '');
        const analyzed = items.map(item => ({
          label: item,
          category: classifyProduct(item),
          inStock: productData.some(p => p.name.includes(item.split(' ')[0]))
        }));
        setOrderSummary(analyzed);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `קיבלתי אחי: ${userText}. ויצמן 7 תל אביב זה בערך 24 דקות מהמחסן. פירקתי את הרשימה שלך לפי מחלקות. הנה מה שזיהיתי במלאי:` 
        }]);
      }
      // 3. אישור סופי
      else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'מעולה אחי. שלחתי למחלקת סידור. תקבל עדכון ברגע שהמשאית יוצאת.' }]);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0b141a] text-right font-sans overflow-hidden" dir="rtl">
      {/* Header */}
      <header className="h-16 bg-[#202c33] flex items-center justify-between px-4 border-b border-gray-700 shadow-xl z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C9A227] rounded-full flex items-center justify-center font-black text-black border-2 border-yellow-600 shadow-inner text-xl">ח</div>
          <div>
            <h1 className="text-white text-sm font-black leading-none uppercase">Saban Logistics</h1>
            <p className="text-[9px] text-green-500 font-bold mt-1 animate-pulse italic">ONLINE INTELLIGENCE</p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcd2de8.png')] bg-fixed opacity-95">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'}`}>
            <div className={`p-4 rounded-2xl shadow-xl max-w-[85%] ${m.role === 'user' ? 'bg-[#005c4b] text-white rounded-tl-none border-r-4 border-[#C9A227]' : 'bg-[#202c33] text-white rounded-tr-none border border-gray-700'}`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
            </div>
          </div>
        ))}

        {/* Product Analysis Mirror */}
        {orderSummary.length > 0 && step === 'REVIEW' && (
          <div className="bg-[#162127] rounded-2xl p-4 border border-gray-700 shadow-2xl space-y-4 animate-in slide-in-from-bottom-5">
            <h3 className="text-[#C9A227] font-black text-xs flex items-center gap-2 border-b border-gray-800 pb-2 uppercase tracking-widest"><Package size={14}/> סיכום פריטים לסידור</h3>
            <div className="space-y-3">
              {orderSummary.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-gray-800 pb-2 last:border-0">
                  <div className="flex items-center gap-3">
                    {item.inStock ? <CheckCircle2 className="text-green-500" size={14}/> : <AlertCircle className="text-yellow-500" size={14}/>}
                    <div>
                      <p className="text-white text-xs font-bold leading-none">{item.label}</p>
                      <p className="text-[9px] text-gray-500 mt-1 uppercase">{item.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setStep('FINAL')} className="w-full bg-[#C9A227] text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg active:scale-95 transition-all uppercase italic">אשר ושגר למחלקת סידור</button>
          </div>
        )}

        {isThinking && <div className="text-[10px] text-[#C9A227] font-black animate-pulse italic pr-2 tracking-widest">מחשב מרחק מהמחסן ומנתח מלאי...</div>}
      </div>

      {/* Footer Info Bar */}
      {step === 'REVIEW' && (
        <div className="bg-[#1c272d] p-2 flex items-center justify-center gap-4 border-t border-gray-800">
           <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold bg-[#0b141a] px-3 py-1 rounded-full"><MapPin size={12} className="text-[#C9A227]"/> 24 דקות למחסן</div>
           <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold bg-[#0b141a] px-3 py-1 rounded-full"><Truck size={12} className="text-[#C9A227]"/> צפי פריקה: 11:30</div>
        </div>
      )}

      {/* Input */}
      <footer className="p-4 bg-[#202c33] border-t border-gray-700 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <input 
            value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="איך מתקדמים אחי?" 
            className="flex-1 p-4 rounded-2xl bg-[#2a3942] text-white outline-none border border-transparent focus:border-[#C9A227]/40 shadow-inner text-sm" 
          />
          <button onClick={handleSend} className="bg-[#C9A227] p-4 rounded-2xl text-black hover:bg-[#e0b52d] shadow-lg active:scale-90 transition-all font-black uppercase italic">שלח</button>
        </div>
      </footer>
    </div>
  );
}
