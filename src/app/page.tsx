'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Send, MapPin, Clock, Truck, CheckCircle } from 'lucide-react';

function SabanIntelligenceChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState('INIT'); // INIT -> ADDRESS -> TIME -> CONFIRM
  const [isThinking, setIsThinking] = useState(false);

  // אתחול השיחה עם שחר
  useEffect(() => {
    setMessages([{ 
      role: 'assistant', 
      content: 'אהלן שחר שאול אחי! ראיתי שהזמנת טיח 710 לקפלנסקי פעם שעברה. להוציא לך השלמה לשם, או שאנחנו על פרויקט חדש היום?' 
    }]);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setInput('');
    setIsThinking(true);

    // מנוע ניהול שלבים (State Machine)
    setTimeout(() => {
      setIsThinking(false);
      
      if (step === 'INIT' && (userText.includes("חדש") || userText.includes("לא"))) {
        setStep('ADDRESS');
        setMessages(prev => [...prev, { role: 'assistant', content: 'סבבה אחי, הבנתי. תכתוב לי את הכתובת החדשה לאספקה ונראה כמה זמן ייקח למשאית להגיע.' }]);
      } 
      else if (step === 'ADDRESS') {
        setStep('TIME');
        // כאן המערכת "כאילו" מחשבת מרחק
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `קיבלתי: ${userText}. בדקתי, הכתובת שלך במרחק 24 דקות מהמחסנים שלנו. תציין תאריך ושעת אספקה מבוקשת.` 
        }]);
      }
      else if (step === 'TIME') {
        setStep('CONFIRM');
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `מעולה אחי. שלחתי בקשה למחלקת הזמנות לבדיקת צפי לזמן שביקשת (${userText}). ברגע שיהיה אישור סופי מהמחסן, תקבל כאן עדכון מדויק. מה עוד להוסיף להזמנה?` 
        }]);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0b141a] text-right font-sans" dir="rtl">
      {/* Header - Saban Intelligence */}
      <header className="bg-[#202c33] p-4 border-b border-gray-700 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C9A227] rounded-full flex items-center justify-center font-bold text-black border-2 border-yellow-600">ח</div>
            <h1 className="text-white font-black text-sm uppercase">Saban Logistics Intelligence</h1>
        </div>
        <div className="flex gap-2">
            <span className={`h-2 w-2 rounded-full ${step === 'CONFIRM' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
        </div>
      </header>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcd2de8.png')] bg-fixed">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-xl text-sm leading-relaxed ${
              m.role === 'user' ? 'bg-[#005c4b] text-white rounded-tl-none border-r-4 border-[#C9A227]' : 'bg-[#202c33] text-white rounded-tr-none border border-gray-700'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isThinking && <div className="text-[10px] text-[#C9A227] font-black animate-pulse italic">ג'ימיני מחשב מרחק לוגיסטי...</div>}
      </div>

      {/* Status Bar */}
      <div className="bg-[#162127] p-2 flex gap-4 overflow-x-auto border-t border-gray-800">
        <div className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full border ${step === 'ADDRESS' ? 'text-[#C9A227] border-[#C9A227]' : 'text-gray-600 border-gray-800'}`}>
            <MapPin size={12}/> כתובת
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full border ${step === 'TIME' ? 'text-[#C9A227] border-[#C9A227]' : 'text-gray-600 border-gray-800'}`}>
            <Clock size={12}/> זמן אספקה
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full border ${step === 'CONFIRM' ? 'text-[#C9A227] border-[#C9A227]' : 'text-gray-600 border-gray-800'}`}>
            <CheckCircle size={12}/> אישור מחסן
        </div>
      </div>

      {/* Input */}
      <footer className="bg-[#202c33] p-4">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="איך מתקדמים אחי?"
            className="flex-1 bg-[#2a3942] text-white p-4 rounded-2xl outline-none focus:border-[#C9A227] border border-transparent transition-all shadow-inner"
          />
          <button onClick={handleSend} className="bg-[#C9A227] p-4 rounded-2xl text-black hover:bg-[#e0b52d] active:scale-95 transition-all shadow-lg font-black italic">שלח</button>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="bg-[#0b141a] h-screen text-[#C9A227] flex items-center justify-center font-black italic uppercase tracking-widest">Saban Intelligence Loading...</div>}>
      <SabanIntelligenceChat />
    </Suspense>
  );
}
