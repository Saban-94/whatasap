'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, MapPin, Truck, CheckCircle2, Package, AlertCircle, History, Camera, FileUp } from 'lucide-react';

// --- מנוע סיווג חכם (מבוסס על רשימת המק"טים החדשה) ---
const classifyProduct = (text: string) => {
  const clean = text.toLowerCase();
  if (/חול|מצע|סומסום|חצץ|חמרה|טיט|פומיס|מחצבה|בלוק/.test(clean)) return "חומרי שלד ובניין";
  if (/סיליקון|דבק|גלו|סופר גלו|112|11fc|107/.test(clean)) return "איטום ודבקים";
  if (/שימון|wd40|מסורית|מקדח|שאקל|חבל|סולם|פאוץ/.test(clean)) return "אספקה טכנית";
  if (/ספריי|צבע|שליכט|סיד|סילר|מדלל|מרק/.test(clean)) return "צבע וגמר";
  if (/כיסא|שולחן|נייר|אסלות|מגב|שקיות/.test(clean)) return "לוגיסטיקה וניקיון";
  return "כללי/אחר";
};

function SabanVIPSystem() {
  const searchParams = useSearchParams();
  const [customer, setCustomer] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [analyzedOrder, setAnalyzedOrder] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = searchParams.get('user');
    // מדמה זיהוי שחר שאול
    if (token === 'shahar') {
      setCustomer({
        name: 'שחר שאול',
        profile_image_url: 'https://randomuser.me/api/portraits/men/32.jpg',
        last_project: 'קפלנסקי 20, כפר סבא'
      });
      setMessages([{ 
        role: 'assistant', 
        content: `אהלן שחר אחי! אני רואה שהזמנת טיח 710 לקפלנסקי פעם שעברה. להוציא לך השלמה לשם, או שיש פרויקט חדש היום?` 
      }]);
    }
  }, [searchParams]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isThinking, analyzedOrder]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      if (userText.includes("חדש") || userText.includes("ויצמן") || userText.includes("תל אביב")) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'קיבלתי אחי. ויצמן 7 תל אביב זה בערך 24 דקות מהמחסן. תעלה את רשימת המוצרים ונארגן משאית.' }]);
      } else if (userText.split('\n').length > 3) {
        const items = userText.split('\n').filter(l => l.trim().length > 2);
        setAnalyzedOrder(items.map(item => ({ label: item, category: classifyProduct(item) })));
        setMessages(prev => [...prev, { role: 'assistant', content: 'שחר, פירקתי את הרשימה שלך למחלקות סידור. הכל זמין במחסן "התלמיד":' }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'הבנתי אחי. בודק לך במלאי...' }]);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0b141a] overflow-hidden" dir="rtl">
      {/* Header */}
      <header className="h-20 bg-[#202c33] flex items-center justify-between px-4 border-b border-gray-700 z-50 shadow-2xl">
        <div className="flex items-center gap-3 text-right">
          <div className="relative h-12 w-12">
            {customer?.profile_image_url ? (
              <img src={customer.profile_image_url} className="h-full w-full rounded-full border-2 border-[#C9A227] object-cover" alt="Profile" />
            ) : (
              <div className="h-full w-full bg-[#C9A227] rounded-full flex items-center justify-center font-black text-black border-2 border-yellow-600 shadow-inner">ח</div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#202c33] rounded-full"></div>
          </div>
          <div>
            <h1 className="text-white text-sm font-black leading-none">ח. סבן - LOGISTICS AI</h1>
            <p className="text-[10px] text-[#C9A227] font-bold mt-1 uppercase italic tracking-widest">VIP SERVICE | {customer?.name || 'אורח'}</p>
          </div>
        </div>
        <History className="text-gray-400" size={24} />
      </header>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcd2de8.png')] bg-repeat opacity-95">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-start text-left' : 'items-end text-right'}`}>
            <div className={`p-4 rounded-2xl shadow-xl max-w-[88%] text-sm leading-relaxed ${
              m.role === 'user' ? 'bg-[#005c4b] text-white rounded-tl-none border-r-4 border-[#C9A227]' : 'bg-[#202c33] text-white rounded-tr-none border border-gray-700 font-sans'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {analyzedOrder.length > 0 && (
          <div className="bg-[#162127]/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-700 shadow-2xl space-y-4 animate-in zoom-in-95 text-right">
            <h3 className="text-[#C9A227] font-black text-xs uppercase tracking-widest flex items-center gap-2 italic border-b border-gray-800 pb-2"><Package size={14}/> שיקוף הזמנה למחסן</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {analyzedOrder.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#1c272d] p-2 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-green-500" size={14}/>
                    <span className="text-white text-[11px] font-bold">{item.label}</span>
                  </div>
                  <span className="text-[9px] text-gray-500 uppercase font-black">{item.category}</span>
                </div>
              ))}
            </div>
            <button className="w-full bg-[#C9A227] text-black font-black py-3 rounded-xl text-[10px] uppercase shadow-lg active:scale-95 transition-all">אשר ושלח לסידור</button>
          </div>
        )}

        {isThinking && <div className="text-[10px] text-[#C9A227] font-black animate-pulse text-right italic pr-2">סבן בודק במלאי ומחשב מרחק...</div>}
      </div>

      {/* Footer */}
      <footer className="p-4 bg-[#202c33] border-t border-gray-700 shadow-2xl z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-3" dir="rtl">
          <input type="file" ref={fileInputRef} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-[#C9A227]"><FileUp size={24} /></button>
          <textarea 
            rows={1}
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder="איך מתקדמים אחי?" 
            className="flex-1 p-3.5 rounded-2xl bg-[#2a3942] text-white outline-none border border-transparent focus:border-[#C9A227]/40 text-sm resize-none font-sans" 
          />
          <button onClick={handleSend} className="bg-[#C9A227] p-4 rounded-2xl text-black font-black hover:bg-[#e0b52d] transition-all">שלח</button>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="bg-[#0b141a] h-screen text-[#C9A227] flex items-center justify-center font-black">טוען VIP...</div>}>
      <SabanVIPSystem />
    </Suspense>
  );
}
