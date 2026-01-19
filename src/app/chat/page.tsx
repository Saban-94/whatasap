'use client';

import React, { useState, useEffect, useRef } from 'react';
import { db } from "@/lib/firebase";
import { collection, addDoc, query, onSnapshot, orderBy } from "firebase/firestore";

// --- המוח של סבן: קטלוג ומשקלים ---
const CATALOG = [
  { name: 'חול ים בלה', category: 'חומרי מחצבה', weight: 1000, crane: true },
  { name: 'סומסום בלה', category: 'חומרי מחצבה', weight: 1000, crane: true },
  { name: 'טיט בלה', category: 'חומרי מחצבה', weight: 1000, crane: true },
  { name: 'מלט אפור', category: 'מלט', weight: 50, crane: false },
  { name: 'פלסטומר 603', category: 'איטום', weight: 25, crane: false },
  { name: 'סיקה', category: 'איטום', weight: 20, crane: false },
];

export default function SabanWhatsApp() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isStaff, setIsStaff] = useState(true); // מצב צוות/לקוח
  const [userAvatar, setUserAvatar] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=Nisha");
  const scrollRef = useRef<HTMLDivElement>(null);

  // האזנה להודעות מ-Firebase בזמן אמת
  useEffect(() => {
    const q = query(collection(db, "chat_messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, []);

  // מנוע Gemini: ניתוח טקסט חופשי להזמנה
  const analyzeMessage = (text: string) => {
    let detectedQty = parseInt(text.match(/\d+/)?.[0] || "0");
    let needsCrane = text.includes("בלה") || detectedQty > 40;
    
    if (detectedQty > 0) {
      return {
        isOrder: true,
        summary: `זוהתה הזמנה: ${detectedQty} יחידות`,
        logic: needsCrane ? "🏗️ חובת מנוף (PTO)" : "👷 פריקה ידנית (צוות שטח)"
      };
    }
    return null;
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const analysis = analyzeMessage(inputText);
    
    // 1. שלח הודעת לקוח (פומבית)
    await addDoc(collection(db, "chat_messages"), {
      text: inputText,
      sender: isStaff ? "רמי (מנהל)" : "לקוח: נישה אדריכלות",
      type: "public",
      timestamp: new Date(),
      avatar: isStaff ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Rami" : userAvatar
    });

    // 2. אם זו הזמנה, שלח ניתוח AI (פנימי - עין עיוורת)
    if (analysis) {
      await addDoc(collection(db, "chat_messages"), {
        text: `🤖 ניתוח Gemini: ${analysis.summary}. ${analysis.logic}`,
        sender: "Saban AI",
        type: "internal",
        timestamp: new Date(),
      });
    }

    setInputText("");
  };

  return (
    <div dir="rtl" style={s.app}>
      {/* Header וואטסאפ */}
      <header style={s.header}>
        <div style={s.headerInfo}>
          <img src={userAvatar} style={s.profilePic} />
          <div>
            <div style={s.userName}>נישה אדריכלות נוף</div>
            <div style={s.status}>מחובר • {isStaff ? "תצוגת ניהול" : "תצוגת לקוח"}</div>
          </div>
        </div>
        <button onClick={() => setIsStaff(!isStaff)} style={s.toggleBtn}>
          {isStaff ? "👁️ מצב לקוח" : "👨‍💼 מצב צוות"}
        </button>
      </header>

      {/* צ'אט נקי */}
      <div style={s.chatWindow}>
        {messages.map((msg) => (
          // עין עיוורת: לקוח לא רואה הודעות internal
          (!isStaff && msg.type === 'internal') ? null : (
            <div key={msg.id} style={msg.type === 'internal' ? s.internalWrapper : s.msgWrapper(msg.sender.includes("לקוח"))}>
              <div style={msg.type === 'internal' ? s.internalBubble : s.bubble(msg.sender.includes("לקוח"))}>
                {isStaff && <div style={s.senderName}>{msg.sender}</div>}
                <div style={s.msgText}>{msg.text}</div>
                <div style={s.time}>{new Date(msg.timestamp?.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
            </div>
          )
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Footer שליחה */}
      <footer style={s.footer}>
        <div style={s.inputContainer}>
          <button style={s.plusBtn}>+</button>
          <input 
            style={s.input} 
            placeholder="כתוב הודעה..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
        </div>
        <button onClick={sendMessage} style={s.sendBtn}>➤</button>
      </footer>
    </div>
  );
}

// --- עיצוב וואטסאפ (Modern Saban UI) ---
const s: any = {
  app: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#efe7dd', fontFamily: 'system-ui' },
  header: { background: '#075E54', color: '#fff', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' },
  headerInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  profilePic: { width: '40px', height: '40px', borderRadius: '50%', background: '#fff' },
  userName: { fontWeight: 'bold', fontSize: '16px' },
  status: { fontSize: '12px', opacity: 0.8 },
  toggleBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '11px' },
  
  chatWindow: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  msgWrapper: (isClient: boolean) => ({ display: 'flex', justifyContent: isClient ? 'flex-start' : 'flex-end', width: '100%' }),
  bubble: (isClient: boolean) => ({
    background: isClient ? '#fff' : '#dcf8c6',
    padding: '8px 12px',
    borderRadius: isClient ? '0 15px 15px 15px' : '15px 0 15px 15px',
    maxWidth: '80%',
    boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
    position: 'relative'
  }),
  internalWrapper: { display: 'flex', justifyContent: 'center', width: '100%', margin: '10px 0' },
  internalBubble: { background: '#fff3e0', color: '#e65100', padding: '10px 20px', borderRadius: '15px', fontSize: '13px', border: '1px solid #ffe0b2', textAlign: 'center', maxWidth: '90%' },
  
  senderName: { fontSize: '11px', fontWeight: 'bold', color: '#075E54', marginBottom: '3px' },
  msgText: { fontSize: '15px', color: '#333' },
  time: { fontSize: '10px', color: '#999', textAlign: 'left', marginTop: '4px' },
  
  footer: { background: '#f0f0f0', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' },
  inputContainer: { flex: 1, background: '#fff', borderRadius: '25px', display: 'flex', alignItems: 'center', padding: '0 15px' },
  input: { flex: 1, border: 'none', padding: '12px', outline: 'none', fontSize: '16px' },
  plusBtn: { background: 'none', border: 'none', fontSize: '24px', color: '#888', cursor: 'pointer' },
  sendBtn: { background: '#075E54', color: '#fff', width: '45px', height: '45px', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }
};
