'use client';

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";

// --- קטלוג מוצרים ומשקלים (המוח של סבן) ---
const SABAN_CATALOG = {
  "חומרי מחצבה": [
    { name: "חול ים (בלה)", weight: 1000, type: "בלה", crane: true },
    { name: "סומסום (בלה)", weight: 1000, type: "בלה", crane: true },
    { name: "טיט (בלה)", weight: 1000, type: "בלה", crane: true },
  ],
  "מלט ודבקים": [
    { name: "מלט אפור", weight: 50, type: "שק", crane: false },
    { name: "מלט לבן", weight: 25, type: "שק", crane: false },
    { name: "פלסטומר 603", weight: 25, type: "שק", crane: false },
    { name: "פלסטומר 255", weight: 25, type: "שק", crane: false },
    { name: "סיקה (Sika)", weight: 20, type: "גאלון", crane: false },
  ]
};

export default function SabanAdvancedStudio() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isStaffView, setIsStaffView] = useState(true);
  const [analyzedOrder, setAnalyzedOrder] = useState<any>(null);

  // טעינת רכיב האקסל מה-CDN
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // --- מנוע הניתוח של Gemini (טקסט חופשי) ---
  const handleSendMessage = () => {
    if (!inputText) return;

    const newMsg = {
      id: Date.now(),
      text: inputText,
      sender: "לקוח: נישה אדריכלות",
      type: "public",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    processAIOrder(inputText);
    setInputText("");
  };

  const processAIOrder = (text: string) => {
    // סימולציה של זיהוי כמויות ומוצרים (המוח של Gemini)
    let qty = parseInt(text.match(/\d+/)?.[0] || "0");
    let isHeavy = text.includes("בלה") || text.includes("חול") || text.includes("סומסום");
    
    // חוק ה-40 שקים של רמי
    const needsCrane = isHeavy || qty > 40;

    const aiResponse = {
      id: Date.now() + 1,
      sender: "Saban AI Brain",
      text: `ניתוח הזמנה: ${qty} יחידות. ${needsCrane ? "⚠️ דורש מנוף (PTO)" : "✅ פריקה ידנית (עובדים בשטח)"}.`,
      type: "internal",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTimeout(() => {
      setMessages(prev => [...prev, aiResponse]);
      setAnalyzedOrder({ qty, needsCrane });
    }, 1000);
  };

  return (
    <div dir="rtl" style={styles.appContainer}>
      {/* תפריט עליון - בורר מצבים (צוות/לקוח) */}
      <nav style={styles.topNav}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>👤</div>
          <div>
            <h4 style={{margin:0}}>נישה אדריכלות נוף</h4>
            <small style={{color:'#2ecc71'}}>מחובר • תצוגת {isStaffView ? 'צוות' : 'לקוח'}</small>
          </div>
        </div>
        <button onClick={() => setIsStaffView(!isStaffView)} style={styles.toggleBtn}>
          {isStaffView ? '👁️ עין עיוורת' : '👨‍💼 מצב ניהול'}
        </button>
      </nav>

      {/* אזור הצ'אט */}
      <section style={styles.chatArea}>
        <div style={styles.dateDivider}>היום, 19 בינואר</div>
        
        {messages.map((msg) => (
          // עין עיוורת: אם המצב הוא לקוח, אל תציג הודעות internal
          (!isStaffView && msg.type === 'internal') ? null : (
            <div key={msg.id} style={msg.type === 'internal' ? styles.internalMsg : styles.publicMsg}>
              <div style={styles.msgHeader}>{msg.sender}</div>
              <div style={styles.msgBody}>{msg.text}</div>
              <div style={styles.msgTime}>{msg.time}</div>
            </div>
          )
        ))}
      </section>

      {/* הצגת ניתוח הזמנה לצוות בלבד */}
      {isStaffView && analyzedOrder && (
        <div style={styles.orderSummary}>
          <strong>📋 טיוטת הזמנה לגליה:</strong>
          <span>כמות: {analyzedOrder.qty} | מנוף: {analyzedOrder.needsCrane ? 'כן' : 'לא'}</span>
          <button style={styles.galiaBtn}>שגר לגליה ב-365 🚀</button>
        </div>
      )}

      {/* Footer שליחת הודעה */}
      <footer style={styles.inputArea}>
        <button style={styles.plusBtn}>+</button>
        <input 
          style={styles.input} 
          placeholder="כתוב הודעה ללקוח או הזמנה..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage} style={styles.sendBtn}>➤</button>
      </footer>
    </div>
  );
}

// --- עיצוב משודרג (WhatsApp Enterprise) ---
const styles: any = {
  appContainer: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#e5ddd5', fontFamily: 'system-ui' },
  topNav: { background: '#075E54', color: '#fff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '40px', height: '40px', background: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#075E54', fontWeight: 'bold' },
  toggleBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px' },
  
  chatArea: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  dateDivider: { alignSelf: 'center', background: '#dcf8c6', padding: '5px 15px', borderRadius: '10px', fontSize: '12px', color: '#555', marginBottom: '15px' },
  
  publicMsg: { alignSelf: 'flex-start', background: '#fff', padding: '10px 15px', borderRadius: '15px 15px 15px 0', maxWidth: '80%', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', position: 'relative' },
  internalMsg: { alignSelf: 'center', background: '#fff3e0', border: '1px solid #ffe0b2', color: '#e65100', padding: '12px', borderRadius: '15px', maxWidth: '90%', fontSize: '14px', textAlign: 'center' },
  
  msgHeader: { fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', color: '#075E54' },
  msgBody: { fontSize: '15px', color: '#333' },
  msgTime: { fontSize: '10px', color: '#999', textAlign: 'left', marginTop: '4px' },

  orderSummary: { background: '#fff', borderTop: '2px solid #2ecc71', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' },
  galiaBtn: { background: '#2ecc71', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },

  inputArea: { background: '#f0f0f0', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px' },
  input: { flex: 1, background: '#fff', border: 'none', padding: '12px 18px', borderRadius: '25px', outline: 'none' },
  plusBtn: { fontSize: '24px', color: '#075E54', background: 'none', border: 'none', cursor: 'pointer' },
  sendBtn: { background: '#075E54', color: '#fff', width: '45px', height: '45px', borderRadius: '50%', border: 'none', cursor: 'pointer' }
};
