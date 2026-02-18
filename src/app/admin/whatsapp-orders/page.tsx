'use client';

import React, { useState, useEffect, useRef } from 'react';
import { db } from "@/lib/firebase"; 
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Send, CheckCircle2, Truck, Package, MessageSquare, Clock } from 'lucide-react';
import { processSmartOrder } from '@/lib/dataEngine';

export default function WhatsAppOrdersDashboard() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [activeAnalysis, setAnalysis] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // האזנה להודעות נכנסות
  useEffect(() => {
    const q = query(collection(db, "whatsapp_messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsubscribe();
  }, []);

  const handleProcess = async () => {
    if (!input.trim()) return;
    const result = await processSmartOrder("temp_id", input);
    setAnalysis(result.meta);
    setMessages(prev => [...prev, { role: 'user', text: input, timestamp: new Date() }]);
    setInput("");
  };

  return (
    <div className="flex h-screen bg-[#f0f2f5] text-right" dir="rtl">
      
      {/* פאנל ניתוח לוגיסטי (למשרד) */}
      <div className="w-1/3 bg-white border-l shadow-lg flex flex-col">
        <div className="p-6 bg-[#075e54] text-white flex items-center gap-3">
          <Package size={24} />
          <h2 className="text-xl font-bold">ניתוח לוגיסטי</h2>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          {activeAnalysis ? (
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                <h3 className="font-bold text-green-800 flex items-center gap-2 mb-3">
                  <CheckCircle2 size={18} /> מוצרים מזוהים (מלאי)
                </h3>
                {activeAnalysis.recommendations.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm border-b py-2">
                    <span>{item.name}</span>
                    <span className="font-mono text-gray-500">{item.barcode}</span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-3">
                  <Truck size={18} /> תכנון אספקה
                </h3>
                <p className="text-sm">משאית: <b>{activeAnalysis.logistics.truckType}</b></p>
                <p className="text-sm">משקל: <b>{activeAnalysis.logistics.totalWeightKg} ק"ג</b></p>
                {activeAnalysis.logistics.needsCrane && (
                  <div className="mt-2 text-xs bg-red-100 text-red-600 p-1 px-2 rounded-full inline-block">דרוש מנוף</div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
              <MessageSquare size={48} />
              <p className="mt-2">הזן טקסט לצד ימין לניתוח</p>
            </div>
          )}
        </div>
      </div>

      {/* ממשק דמו WhatsApp (ללקוח/צ'אט) */}
      <div className="flex-1 flex flex-col bg-[#e5ddd5]">
        <div className="bg-[#075e54] p-4 text-white flex items-center gap-4 shadow-md">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#075e54] font-bold">
            ס
          </div>
          <div>
            <h3 className="font-bold">הזמנות ח. סבן</h3>
            <span className="text-xs opacity-75">מחובר - מעבד נתונים Gemini</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg shadow-sm max-w-[70%] ${msg.role === 'user' ? 'bg-[#dcf8c6]' : 'bg-white'}`}>
                <p className="text-sm">{msg.text}</p>
                <span className="text-[10px] text-gray-400 block mt-1">
                   <Clock size={10} className="inline ml-1" /> {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <div className="bg-[#f0f2f5] p-3 flex gap-2 items-center">
          <input 
            className="flex-1 p-3 rounded-full border-none focus:outline-none text-sm"
            placeholder="הדבק הודעת וואטסאפ של לקוח..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
          />
          <button onClick={handleProcess} className="bg-[#128c7e] text-white p-3 rounded-full">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
