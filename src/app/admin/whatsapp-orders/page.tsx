'use client';
import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Package, AlertCircle, CheckCircle2, Loader2, RefreshCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function WhatsappOrders() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);

  // 1. משיכת הודעות וואטסאפ (סימולציה או חיבור ל-Webhooks)
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      // כאן תבוא השליפה מהטבלה של הוואטסאפ שלך
      const { data, error } = await supabase
        .from('whatsapp_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!error) setMessages(data || []);
      setLoading(false);
    };

    fetchMessages();
  }, []);

  // 2. המוח של גימני - יצירת תשובה חכמה ללקוח
  const getAiSuggestion = async (messageId: string, text: string) => {
    setAiSuggestions(prev => ({ ...prev, [messageId]: 'חושב על תשובה...' }));
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      
      setAiSuggestions(prev => ({ ...prev, [messageId]: data.reply }));
    } catch (err) {
      setAiSuggestions(prev => ({ ...prev, [messageId]: 'שגיאה ביצירת תשובה' }));
    }
  };

  const handleSendMessage = async (id: string, replyText: string) => {
    setSendingId(id);
    // כאן תבוא הלוגיקה של שליחת הודעה דרך ה-API של וואטסאפ (Twilio/Meta)
    console.log(`Sending to ${id}: ${replyText}`);
    
    // סימולציית הצלחה
    setTimeout(() => {
      setSendingId(null);
      alert('הודעה נשלחה בהצלחה!');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0b141a] text-white p-6 pb-20" dir="rtl">
      <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#C9A227]">WhatsApp Orders</h1>
          <p className="text-gray-400">ניהול שיחות ומכירות חכם</p>
        </div>
        <div className="bg-[#202c33] p-3 rounded-2xl flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-bold">API מחובר</span>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#C9A227] mb-4" size={40} />
          <p className="text-gray-400">טוען הודעות אחרונות...</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((msg) => (
            <div key={msg.id} className="bg-[#202c33] rounded-3xl p-6 border border-gray-800 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#C9A227] p-2 rounded-full text-black">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <p className="font-black text-white">{msg.customer_name || 'לקוח'}</p>
                    <p className="text-xs text-gray-500">{msg.customer_phone}</p>
                  </div>
                </div>
                <span className="text-[10px] text-gray-600 font-mono">{new Date(msg.created_at).toLocaleString('he-IL')}</span>
              </div>

              <div className="bg-[#111b21] p-4 rounded-2xl mb-4 border-r-4 border-[#C9A227]">
                <p className="text-sm italic text-gray-300">"{msg.message_text}"</p>
              </div>

              {/* אזור הצעת ה-AI */}
              <div className="space-y-3">
                {!aiSuggestions[msg.id] ? (
                  <button 
                    onClick={() => getAiSuggestion(msg.id, msg.message_text)}
                    className="text-[11px] bg-gray-800 text-gray-400 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <RefreshCcw size={12} /> צור הצעה חכמה (גימני)
                  </button>
                ) : (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-[#C9A227] block mb-1 uppercase tracking-widest">הצעת גימני ללקוח:</label>
                    <textarea 
                      className="w-full bg-[#111b21] border border-gray-800 rounded-xl p-4 text-sm text-gray-200 focus:ring-1 focus:ring-[#C9A227] min-h-[100px]"
                      value={aiSuggestions[msg.id]}
                      onChange={(e) => setAiSuggestions({...aiSuggestions, [msg.id]: e.target.value})}
                    />
                    <div className="flex justify-end mt-3">
                      <button 
                        disabled={sendingId === msg.id}
                        onClick={() => handleSendMessage(msg.id, aiSuggestions[msg.id])}
                        className="bg-[#C9A227] text-black px-6 py-2 rounded-xl font-black flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50"
                      >
                        {sendingId === msg.id ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        שלח בוואטסאפ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
