'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, MapPin, Clock, Truck, CheckCircle2, Package, AlertCircle, ShoppingCart, History } from 'lucide-react';
import productData from '@/data/products.json';
import customerData from '@/data/customers.json';

// --- מנוע ניתוח רשימות ---
const analyzeList = (text: string) => {
  const items = text.split('\n').filter(l => l.trim().length > 2);
  return items.map(item => {
    const clean = item.toLowerCase();
    let category = "כללי";
    if (/מלט|טיח|חול|סומסום|בטון|בלוק|אזכורית|דיקט|עץ/.test(clean)) category = "חומרי שלד";
    if (/שקע|תקע|פאזי|נורה|כבל/.test(clean)) category = "חשמל";
    if (/ברגים|ביט|מסורית|מקדח|שאקל|חבל|סולם|פאוץ/.test(clean)) category = "פרזול וכלים";
    if (/צבע|רולר|מגש|פוליתאן|ספרי/.test(clean)) category = "צבע וגמר";
    if (/כיסא|שולחן|נייר|אסלות|מגב|שקיות/.test(clean)) category = "לוגיסטיקה";

    return {
      label: item.replace(/^- \[ \] |^- |^\d+\. /g, ''),
      category,
      inStock: productData.some(p => p.name.toLowerCase().includes(clean.split(' ')[0]))
    };
  });
};

function SabanVIPSystem() {
  const searchParams = useSearchParams();
  const [customer, setCustomer] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [analyzedOrder, setAnalyzedOrder] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = searchParams.get('user');
    const found = customerData.find(c => c.magic_link_token === token);
    if (found) {
      setCustomer(found);
      setMessages([{ 
        role: 'assistant', 
        content: `אהלן ${found.name} אחי! אני רואה שהזמנת טיח 710 לקפלנסקי פעם שעברה. להוציא לך השלמה לשם, או שאנחנו על פרויקט חדש היום?` 
      }]);
    }
  }, [searchParams]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isThinking, analyzedOrder]);

  const handleSend = () => {
    if (!input.trim() || isThinking) return;
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      
      if (userText.includes("ויצמן") || userText.includes("תל אביב") || userText.includes("כתובת")) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `קיבלתי אחי. ויצמן 7 תל אביב זה בערך 24 דקות מהמחסן שלנו. תציין תאריך ושעת אספקה מבוקשת ונעלה הכל לסידור.` 
        }]);
      } else if (userText.split('\n').length > 3) {
        const results = analyzeList(userText);
        setAnalyzedOrder(results);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `שחר, פירקתי את הרשימה שלך למחלקות סידור. הנה מה שזיהיתי במלאי במחסן "התלמיד":` 
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `קיבלתי אחי. מה עוד להוסיף להזמנה לפני שאני סוגר מול המחסן?` }]);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0b141a] overflow-hidden" dir="rtl">
      {/* Header קבוע - לא זז */}
      <header className="h-20 bg-[#202c33] flex items-center justify-between px-4 border-b border-gray-700 z-50 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12">
            {customer?.profile_image_url ? (
              <img src={customer.profile_image_url} className="h-full w-full rounded-full border-2 border-[#C9A227] object-cover shadow-lg" alt="Profile" />
            ) : (
              <div className="h-full w-full bg-[#C9A227] rounded-full flex items-center justify-center font-black text-black border-2 border-yellow-600 shadow-inner text-xl">ח</div>
            )}
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#202c33] rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-sm font-black leading-none tracking-tight">ח. סבן - LOGISTICS AI</h1>
            <p className="text-[10px] text-[#C9A227] font-bold mt-1 uppercase italic tracking-widest">VIP SERVICE | {customer?.name || 'אורח'}</p>
          </div>
        </div>
        <History className="text-gray-400 hover:text-[#C9A227] transition-colors cursor-pointer" size={24} />
      </header>

      {/* אזור הצ'אט - flex-1 מבטיח שלא יגלוש */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcd2de8.png')] bg-fixed opacity-95"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`p-4 rounded-2xl shadow-xl max-w-[88%] text-sm leading-relaxed ${
              m.role === 'user' ? 'bg-[#005c4b] text-white rounded-tl-none border-r-4 border-[#C9A227]' : 'bg-[#202c33] text-white rounded-tr-none border border-gray-700'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {/* הצגת ניתוח הרשימה של שחר */}
        {analyzedOrder.length > 0 && (
          <div className="bg-[#162127]/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-700 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="text-[#C9A227] font-black text-xs uppercase tracking-widest flex items-center gap-2 italic"><Package size={14}/> שיקוף הזמנה למחסן</h3>
              <span className="text-[9px] text-gray-500 font-bold">24 דקות למחסן</span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {analyzedOrder.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#1c272d] p-2 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-3">
                    {item.inStock ? <CheckCircle2 className="text-green-500" size={14}/> : <AlertCircle className="text-yellow-500" size={14}/>}
                    <span className="text-white text-[11px] font-bold">{item.label}</span>
                  </div>
                  <span className="text-[9px] text-gray-500 uppercase font-black">{item.category}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
               <button className="flex-1 bg-[#C9A227] text-black font-black py-3 rounded-xl text-[10px] uppercase shadow-lg active:scale-95 transition-all">אשר ושלח לסידור</button>
               <button className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl text-[10px] uppercase border border-gray-700">הוסף מוצרים</button>
            </div>
          </div>
        )}

        {isThinking && (
          <div className="flex justify-end p-2">
            <div className="text-[10px] text-[#C9A227] font-black animate-pulse italic tracking-[0.2em]">מחשב מרחק ומפענח רשימה...</div>
          </div>
        )}
      </div>

      {/* Footer - קבוע בתחתית */}
      <footer className="p-4 bg-[#202c33] border-t border-gray-700 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <textarea 
            rows={1}
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder="הדבק רשימה או כתוב הודעה..." 
            className="flex-1 p-3.5 rounded-2xl bg-[#2a3942] text-white outline-none border border-transparent focus:border-[#C9A227]/40 shadow-inner text-sm resize-none overflow-hidden font-sans" 
          />
          <button onClick={handleSend} className="bg-[#C9A227] p-4 rounded-2xl text-black hover:bg-[#e0b52d] shadow-lg active:scale-90 transition-all font-black uppercase italic">שלח</button>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="bg-[#0b141a] h-screen text-[#C9A227] flex items-center justify-center font-black italic uppercase tracking-widest">Saban VIP Loading...</div>}>
      <SabanVIPSystem />
    </Suspense>
  );
}
