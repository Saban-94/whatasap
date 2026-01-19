'use client';

import React, { useState, useEffect, useRef } from 'react';
import { db } from "@/lib/firebase";
import { collection, addDoc, query, onSnapshot, orderBy } from "firebase/firestore";

// --- המוח של סבן: הגדרות מוצרים ומשקלים ---
const SABAN_RULES = {
  MAX_MANUAL_BAGS: 40, // מעל 40 שקים = מנוף
  HEAVY_ITEMS: ['בלה', 'חול', 'סומסום', 'טיט', 'בלוק'], // מוצרים שמחייבים מנוף
  PRICE_PER_WAIT_MIN: 7.5 // עלות דקת המתנה
};

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isStaff, setIsStaff] = useState(true); // מצב עין עיוורת
  const scrollRef = useRef<HTMLDivElement>(null);

  // האזנה להודעות ב-Firebase
  useEffect(() => {
    const q = query(collection(db, "saban_chat"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, []);

  // מנוע Gemini: זיהוי טקסט חופשי והפיכתו להזמנה
  const parseOrder = (text: string) => {
    const qty = parseInt(text.match(/\d+/)?.[0] || "0");
    const needsCrane = SABAN_RULES.HEAVY_ITEMS.some(item => text.includes(item)) || qty > SABAN_RULES.MAX_MANUAL_BAGS;
    
    if (qty > 0) {
      return {
        valid: true,
        summary: `הזמנה מזוהה: ${qty} יח'`,
        logistics: needsCrane ? "🏗️ משאית מנוף דרושה" : "👷 פריקה ידנית בשטח"
      };
    }
    return null;
  };

  const onSend = async () => {
    if (!inputText.trim()) return;

    const analysis = parseOrder(inputText);

    // 1. הודעה גלויה ללקוח
    await addDoc(collection(db, "saban_chat"), {
      text: inputText,
      sender: isStaff ? "רמי" : "נישה אדריכלות",
      role: isStaff ? "staff" : "client",
      type: "public",
      timestamp: new Date()
    });

    // 2. שכבת הניהול (עין עיוורת)
    if (analysis) {
      await addDoc(collection(db, "saban_chat"), {
        text: `📊 ניתוח לוגיסטי: ${analysis.summary}. ${analysis.logistics}`,
        sender: "Saban AI",
        type: "internal",
        timestamp: new Date()
      });
    }

    setInputText("");
  };

  return (
    <div dir="rtl" style={styles.app}>
      {/* Header WhatsApp Look */}
      <header style={styles.header}>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <div style={styles.avatar}>📦</div>
          <div>
            <div style={{fontWeight:'bold'}}>Saban Connect</div>
            <div style={{fontSize:'12px', opacity:0.8}}>{isStaff ? 'מצב מנהל' : 'מצב לקוח'}</div>
          </div>
        </div>
        <button onClick={() => setIsStaff(!isStaff)} style={styles.eyeBtn}>
          {isStaff ? '👁️ עין עיוורת' : '👨‍💼 כניסת צוות'}
        </button>
      </header>

      {/* Chat Area */}
      <div style={styles.chatWindow}>
        {messages.map((m) => (
          (!isStaff && m.type === 'internal') ? null : (
            <div key={m.id} style={m.type === 'internal' ? styles.internalRow : styles.msgRow(m.role === 'client')}>
              <div style={m.type === 'internal' ? styles.internalBubble : styles.bubble(m.role === 'client')}>
                {isStaff && <div style={styles.senderName}>{m.sender}</div>}
                <div>{m.text}</div>
                <div style={styles.time}>
                   {m.timestamp?.seconds ? new Date(m.timestamp.seconds * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                </div>
              </div>
            </div>
          )
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <footer style={styles.footer}>
        <div style={styles.inputBox}>
          <button style={styles.plus}>+</button>
          <input 
            style={styles.input} 
            placeholder="כתוב הזמנה חופשית..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSend()}
          />
        </div>
        <button onClick={onSend} style={styles.sendBtn}>➤</button>
      </footer>
    </div>
  );
}

// --- עיצוב וואטסאפ נקי ---
const styles: any = {
  app: { height: '100vh', display: 'flex', flexDirection: 'column', background: '#e5ddd5', fontFamily: 'system-ui' },
  header: { background: '#075E54', color: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  avatar: { width: '35px', height: '35px', background: '#fff', borderRadius: '50%', color: '#075E54', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  eyeBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '5px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '11px' },
  chatWindow: { flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px' },
  msgRow: (isClient: boolean) => ({ display: 'flex', justifyContent: isClient ? 'flex-start' : 'flex-end' }),
  bubble: (isClient: boolean) => ({
    background: isClient ? '#fff' : '#dcf8c6',
    padding: '8px 12px',
    borderRadius: isClient ? '0 12px 12px 12px' : '12px 0 12px 12px',
    maxWidth: '85%',
    boxShadow: '0 1px 1px rgba(0,0,0,0.1)'
  }),
  internalRow: { display: 'flex', justifyContent: 'center', margin: '10px 0' },
  internalBubble: { background: '#fff3e0', border: '1px solid #ffe0b2', color: '#e65100', padding: '10px 15px', borderRadius: '12px', fontSize: '13px', textAlign: 'center' },
  senderName: { fontSize: '10px', fontWeight: 'bold', color: '#075E54', marginBottom: '3px' },
  time: { fontSize: '9px', color: '#999', textAlign: 'left', marginTop: '3px' },
  footer: { background: '#f0f0f0', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px' },
  inputBox: { flex: 1, background: '#fff', borderRadius: '25px', display: 'flex', alignItems: 'center', padding: '0 10px' },
  input: { flex: 1, border: 'none', padding: '10px', outline: 'none' },
  plus: { background: 'none', border: 'none', fontSize: '20px', color: '#888', cursor: 'pointer' },
  sendBtn: { background: '#075E54', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', border: 'none', cursor: 'pointer' }
};
