'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Camera, MoreVertical, CheckCircle2, AlertCircle, Truck, Package } from 'lucide-react';
import { processSmartOrder } from '@/lib/dataEngine'; // המנוע שבנינו
import { calculateLogistics } from '@/lib/logisticsEngine';

export default function SmartWhatsAppOrders() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // גלילה אוטומטית לסוף הצ'אט
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    
    // הפעלת ה"מוח" - בדיקת מלאי, לוגיסטיקה והמלצות
    const result = await processSmartOrder("customer_1", input);
    
    const botMsg = { 
      role: 'assistant', 
      text: result.text, 
      meta: result.meta,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages(prev => [...prev, botMsg]);
    setAnalysis(result.meta); // עדכון הניתוח בצד לטובת המשרד
    setInput("");
  };

  return (
    <div className="flex h-screen bg-[#f0f2f5] font-sans text-right" dir="rtl">
      
      {/* צד שמאל - פירוט הזמנה למשרד (Admin Panel) */}
      <div className="hidden md:flex w-1/3 bg-white border-r flex-col shadow-xl">
        <div className="p-6 bg-[#075e54] text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package size={24} /> ניתוח הזמנה - ח. סבן
          </h2>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {analysis ? (
            <>
              <div className="bg-green-50 p-4 rounded-2xl border border-green-200">
                <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle2 size={18}/> מוצרים שזוהו במלאי
                </h3>
                <ul className="text-sm space-y-1">
                  {analysis.recommendations?.map((item: any, idx: number) => (
                    <li key={idx} className="flex justify-between border-b pb-1">
                      <span>{item.name}</span>
                      <span className="font-bold">x {item.qty}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <Truck size={18}/> לוגיסטיקה ואספקה
                </h3>
                <p className="text-sm"><strong>משאית:</strong> {analysis.logistics?.truckType}</p>
                <p className="text-sm"><strong>משקל משוער:</strong> {analysis.logistics?.totalWeightKg} ק"ג</p>
                {analysis.logistics?.needsCrane && (
                  <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full mt-2 inline-block">דרוש מנוף</span>
                )}
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-center mt-10">המתן להודעת לקוח לניתוח נתונים...</div>
          )}
        </div>
      </div>

      {/* צד ימין - ממשק ה-WhatsApp */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="bg-[#075e54] p-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
               <img src="/icons/logo.png" alt="Saban" />
            </div>
            <div>
              <p className="font-bold">תומר אלמקייס (פרויקט רעננה)</p>
              <p className="text-xs text-green-200">מחובר - יועץ Gemini פעיל</p>
            </div>
          </div>
          <MoreVertical size={20} />
        </div>

        {/* Messages Wall */}
        <div 
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat"
        >
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-2 px-3 rounded-xl shadow-sm relative ${
                msg.role === 'user' ? 'bg-[#dcf8c6]' : 'bg-white'
              }`}>
                <p className="text-sm text-gray-800">{msg.text}</p>
                <span className="text-[10px] text-gray-500 block mt-1 text-left">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="bg-[#f0f2f5] p-3 flex items-center gap-3">
          <button className="text-gray-500"><Camera size={24} /></button>
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="הקלד הודעה..."
            className="flex-1 p-2 px-4 rounded-full border-none focus:outline-none text-sm"
          />
          <button 
            onClick={handleSendMessage}
            className="bg-[#128c7e] text-white p-2 rounded-full hover:bg-[#075e54] transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
