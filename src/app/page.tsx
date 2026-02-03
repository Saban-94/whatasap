'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, MapPin, Truck, CheckCircle2, Package, AlertCircle, History, FileUp } from 'lucide-react';

// --- נתונים גולמיים (במציאות יימשכו מתיקיית ה-data) ---
const products = [
  { id: 11710, name: "סומסום - טון", category: "חומרי שלד" },
  { id: 11550, name: "טיט שק", category: "חומרי שלד" },
  { id: 12010, name: "בלוק בטון 10/20/40", category: "בלוקים" },
  { id: 170112, name: "סיליקון 112 MAPEI", category: "איטום ודבקים" },
  { id: 57976, name: "שימון 420ML WD40", category: "אספקה טכנית" }
];

// --- מנוע ניתוח רשימות ---
const analyzeList = (text: string) => {
  const lines = text.split('\n').filter(l => l.trim().length > 1);
  return lines.map(line => {
    const cleanLine = line.replace(/^- \[ \] |^- |^\d+\. /g, '').trim();
    const foundProduct = products.find(p => cleanLine.toLowerCase().includes(p.name.split(' ')[0].toLowerCase()));
    
    return {
      label: cleanLine,
      category: foundProduct ? foundProduct.category : "כללי",
      inStock: !!foundProduct,
      sku: foundProduct ? foundProduct.id : null
    };
  });
};

function SabanVIPChat() {
  const searchParams = useSearchParams();
  const [customer, setCustomer] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [analyzedItems, setAnalyzedItems] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = searchParams.get('user');
    if (user === 'shahar') {
      setCustomer({
        name: 'שחר שאול',
        image: 'https://randomuser.me/api/portraits/men/32.jpg'
      });
      setMessages([{ 
        role: 'assistant', 
        content: `אהלן שחר אחי! אני רואה שההזמנה האחרונה שלך הייתה טיח 710 לקפלנסקי. להוציא לך השלמה לשם או שיש פרויקט חדש?` 
      }]);
    }
  }, [searchParams]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isThinking, analyzedItems]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      if (userText.split('\n').length > 2) {
        setAnalyzedItems(analyzeList(userText));
        setMessages(prev => [...prev, { role: 'assistant', content: 'שחר אחי, פירקתי את הרשימה שלך למחלקות. הכל זמין במחסן "התלמיד".' }]);
      } else if (userText.includes("ויצמן") || userText.includes("תל אביב")) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'קיבלתי אחי. ויצמן 7 ת"א זה 24 דקות מהמחסן. מתי לשלוח?' }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'הבנתי אחי, בודק לך את זה מול המחסן.' }]);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0b141a] overflow-hidden font-sans" dir="rtl">
      {/* Header */}
      <header className="h-20 bg-[#202c33] flex items-center justify-between px-4 border-b border-gray-700 z-50 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12">
            {customer?.image ? (
              <img src={customer.image} className="h-full w-full rounded-full border-2 border-[#C9A227] object-cover" alt="Profile" />
            ) : (
              <div className="h-full w-full bg-[#C9A227] rounded-full flex items-center justify-center font-bold text-black border-2 border-yellow-600">ח</div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#202c33] rounded-full"></div>
          </div>
          <div className="text-right">
            <h1 className="text-white text-sm font-black leading-none">ח. סבן - LOGISTICS AI</h1>
            <p className="text-[10px] text-[#C9A227] font-bold mt-1 uppercase italic tracking-widest">VIP | {customer?.name || 'אורח'}</p>
          </div>
        </div>
        <History className="text-gray-400" size={24} />
      </header>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcd2de8.png')] bg-repeat opacity-95">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-start text-left' : 'items-end text-right'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`p-4 rounded-2xl shadow-xl max-w-[88%] text-sm leading-relaxed ${
              m.role === 'user' ? 'bg-[#005c4b] text-white rounded-tl-none border-r-4 border-[#C9A227]' : 'bg-[#202c33] text-white rounded-tr-none border border-gray-700'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {analyzedItems.length > 0 && (
          <div className="bg-[#162127]/95 backdrop-blur-md rounded-2xl p-4 border border-gray-700 shadow-2xl space-y-4 animate-in zoom-in-95 text-right">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="text-[#C9A227] font-black text-[10px] uppercase flex items-center gap-2"><Package size={14}/> שיקוף הזמנה</h3>
              <span className="text-[9px] text-gray-500">24 דקות למחסן</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {analyzedItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#1c272d] p-2 rounded-lg border border-gray-800">
                  <div className="flex items-center gap-2">
                    {item.inStock ? <CheckCircle2 className="text-green-500" size={14}/> : <AlertCircle className="text-yellow-500" size={14}/>}
                    <span className="text-white text-[11px] font-bold">{item.label}</span>
                  </div>
                  <span className="text-[8px] text-gray-500 font-black px-2 py-0.5 bg-black/30 rounded uppercase">{item.category}</span>
                </div>
              ))}
            </div>
            <button className="w-full bg-[#C9A227] text-black font-black py-3 rounded-xl text-[10px] uppercase shadow-lg active:scale-95 transition-all">אשר ושלח לסידור</button>
          </div>
        )}

        {isThinking && (
          <div className="text-[10px] text-[#C9A227] font-black animate-pulse text-right italic pr-2">סבן מחשב מרחק ומנתח רשימה...</div>
        )}
      </div>

      {/* Footer */}
      <footer className="p-4 bg-[#202c33] border-t border-gray-700 z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <textarea 
            rows={1}
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder="איך מתקדמים אחי?" 
            className="flex-1 p-3.5 rounded-2xl bg-[#2a3942] text-white outline-none border border-transparent focus:border-[#C9A227]/40 text-sm resize-none" 
          />
          <button onClick={handleSend} className="bg-[#C9A227] p-4 rounded-2xl text-black hover:bg-[#e0b52d] shadow-lg active:scale-90 transition-all font-black uppercase">שלח</button>
        </div>
      </footer>
    </div>
  );
}

// --- הקומפוננטה הראשית עם Suspense Boundary לפתרון שגיאת ה-Build ---
export default function Home() {
  return (
    <Suspense fallback={<div className="bg-[#0b141a] h-screen text-[#C9A227] flex items-center justify-center font-black italic uppercase">Saban VIP Loading...</div>}>
      <SabanVIPChat />
    </Suspense>
  );
}
