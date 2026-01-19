'use client';

import React, { useState, useEffect, useRef } from 'react';
import { db } from "@/lib/firebase";
import { collection, addDoc, query, onSnapshot, orderBy } from "firebase/firestore";

// --- קטלוג המוצרים והמוח הלוגיסטי של ח. סבן ---
const CATALOG: any = {
  "חול ים בלה": { weight: 1000, type: "בלה", crane: true },
  "סומסום בלה": { weight: 1000, type: "בלה", crane: true },
  "טיט בלה": { weight: 1000, type: "בלה", crane: true },
  "מלט אפור": { weight: 50, type: "שק", crane: false },
  "מלט לבן": { weight: 25, type: "שק", crane: false },
  "פלסטומר 603": { weight: 25, type: "שק", crane: false },
  "פלסטומר 255": { weight: 25, type: "שק", crane: false },
  "סיקה": { weight: 20, type: "גאלון", crane: false }
};

export default function SabanConnectApp() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isStaff, setIsStaff] = useState(true); // עין עיוורת: צוות/לקוח
  const scrollRef = useRef<HTMLDivElement>(null);

  // האזנה להודעות מה-Cloud
  useEffect(() => {
    const q = query(collection(db, "chat_messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, []);

  // מנוע הניתוח: הפיכת טקסט להזמנה חכמה
  const analyzeOrder = (text: string) => {
    const qtyMatch = text.match(/\d+/);
    const qty = qtyMatch ? parseInt(qtyMatch[0]) : 0;
    
    let needsCrane = false;
    let productFound = "";

    for (const item in CATALOG) {
      if (text.includes(item)) {
        productFound = item;
        if (CATALOG[item].crane || (CATALOG[item].type === "שק" && qty > 40)) {
          needsCrane = true;
        }
        break;
      }
    }

    if (qty > 0 && productFound) {
      return {
        summary: `${qty} יח' ${productFound}`,
        instruction: needsCrane ? "⚠️ דורש מנוף (PTO)" : "👷 פריקה ידנית (עובדים בשטח)"
      };
    }
    return null;
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const analysis = analyzeOrder(inputText);

    // 1. הודעה גלויה (Public)
    await addDoc(collection(db, "chat_messages"), {
      text: inputText,
      sender: isStaff ? "רמי (מנהל)" : "לקוח: נישה אדריכלות",
      type: "public",
      timestamp: new Date(),
      avatar: isStaff ? "R" : "N"
    });

    // 2. שכבת צוות (Internal - עין עיוורת)
    if (analysis) {
      await addDoc(collection(db, "chat_messages"), {
        text: `🤖 מנתח הזמנה: ${analysis.summary}. סטטוס: ${analysis.instruction}`,
        sender: "Gemini Logistics",
        type: "internal",
        timestamp: new Date()
      });
    }

    setInputText("");
  };

  return (
    <div dir="rtl" style={s.container}>
      {/* Header WhatsApp UI */}
      <header style={s.header}>
        <div style={s.headerContent}>
          <div style={s.avatar}>📦</div>
          <div>
            <div style={s.name}>הזמנות ח. סבן</div>
            <div style={s.online}>מחובר • {isStaff ? "מצב ניהול" : "מצב לקוח"}</div>
          </div>
        </div>
        <button onClick={() => setIsStaff(!isStaff)} style={s.toggle}>
           {isStaff ? "👁️ עין עיוורת" : "👨‍💼 נהל צוות"}
        </button>
      </header>

      {/* Chat Messages Area */}
      <div style={s.chatBody}>
        {messages.map((m) => (
          (!isStaff && m.type === 'internal') ? null : (
            <div key={m.id} style={m.type === 'internal' ? s.internalRow : s.msgRow(m.avatar === 'N')}>
               <div style={m.type === 'internal' ? s.internalBubble : s.bubble(m.avatar === 'N')}>
                  {isStaff && <small style={s.senderLabel}>{m.sender}</small>}
                  <div>{m.text}</div>
                  <div style={s.time}>
                    {m.timestamp?.seconds ? new Date(m.timestamp.seconds * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                  </div>
               </div>
            </div>
          )
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <footer style={s.footer}>
        <div style={s.inputWrapper}>
          <button style={s.plus}>+</button>
          <input 
            style={s.input} 
            placeholder="כתוב הודעה או הזמנה..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
        </div>
        <button onClick={handleSend} style={s.sendBtn}>➤</button>
      </footer>
    </div>
  );
}

// --- עיצוב וואטסאפ אולטרה-מקצועי ---
const s: any = {
  container: { height: '100vh', display: 'flex', flexDirection: 'column', background: '#e5ddd5', fontFamily: 'system-ui' },
  header: { background: '#075E54', color: '#fff', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  headerContent: { display: 'flex', alignItems: 'center', gap: '15px' },
  avatar: { width: '40px', height: '40px', background: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' },
  name: { fontWeight: 'bold', fontSize: '16px' },
  online: { fontSize: '12px', opacity: 0.8 },
  toggle: { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '11px' },
  chatBody: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  msgRow: (isClient: boolean) => ({ display: 'flex', justifyContent: isClient ? 'flex-start' : 'flex-end', width: '100%' }),
  bubble: (isClient: boolean) => ({
    background: isClient ? '#fff' : '#dcf8c6',
    padding: '8px 15px',
    borderRadius: isClient ? '0 15px 15px 15px' : '15px 0 15px 15px',
    maxWidth: '85%',
    boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
    position: 'relative'
  }),
  internalRow: { display: 'flex', justifyContent: 'center', width: '100%' },
  internalBubble: { background: '#fff3e0', border: '1px solid #ffe0b2', color: '#e65100', padding: '10px 20px', borderRadius: '15px', fontSize: '13px', textAlign: 'center', maxWidth: '90%' },
  senderLabel: { display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#075E54', marginBottom: '3px' },
  time: { fontSize: '10px', color: '#999', textAlign: 'left', marginTop: '4px' },
  footer: { background: '#f0f0f0', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px' },
  inputWrapper: { flex: 1, background: '#fff', borderRadius: '25px', display: 'flex', alignItems: 'center', padding: '0 15px' },
  input: { flex: 1, border: 'none', padding: '12px', outline: 'none', fontSize: '16px' },
  plus: { background: 'none', border: 'none', fontSize: '24px', color: '#888', cursor: 'pointer' },
  sendBtn: { background: '#075E54', color: '#fff', width: '45px', height: '45px', borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: '20px' }
};
