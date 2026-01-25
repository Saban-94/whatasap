'use client';

import React, { useState, useEffect, useRef } from 'react';
import { db } from "@/lib/firebase"; 
import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp } from "firebase/firestore";

export default function SabanVipGroup() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [showContactCard, setShowContactCard] = useState<any>(null);
  const [tagMode, setTagMode] = useState<'public' | 'hidden'>('public');
  
  // נתוני צוות מבוססים על המערכת הלוגיסטית של ח. סבן
  const [staff] = useState([
    { id: 'rami', name: 'ראמי', dept: 'לוגיסטיקה', role: 'מנהל הפצה', email: 'rami@saban.co.il', phone: '050-8861080', ext: '101', avatar: 'https://whatasap.vercel.app/logo.png' },
    { id: 'galia', name: 'גליה', dept: 'משרד', role: 'הנהלת חשבונות', email: 'office@saban.co.il', phone: '050-1234567', ext: '102', avatar: 'https://whatasap.vercel.app/logo.png' }
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, "saban_chat"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    await addDoc(collection(db, "saban_chat"), {
      text: inputText,
      sender: "מנהל מערכת",
      type: tagMode === 'hidden' ? "internal" : "public",
      timestamp: serverTimestamp()
    });
    setInputText("");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#e5ddd5', direction: 'rtl', fontFamily: 'sans-serif' }}>
      
      {/* סרגל עליון - ח. סבן */}
      <header style={{ backgroundColor: '#075E54', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '45px', height: '45px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#075E54', fontWeight: 'bold', fontSize: '18px' }}>ח.ס</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>קבוצת הזמנות VIP - ח. סבן בלבד</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>צוות ניהול לוגיסטי מחובר ✅</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {staff.map(member => (
            <img 
              key={member.id}
              src={member.avatar} 
              onClick={() => setShowContactCard(member)}
              style={{ width: '35px', height: '35px', borderRadius: '50%', border: '2px solid white', cursor: 'pointer' }}
              title={member.name}
            />
          ))}
        </div>
      </header>

      {/* אזור ההודעות */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map((m) => (
          <div key={m.id} style={{ alignSelf: m.type === 'internal' ? 'center' : 'flex-start', maxWidth: '80%' }}>
            <div style={{ 
              backgroundColor: m.type === 'internal' ? '#fff3e0' : 'white', 
              padding: '10px 15px', 
              borderRadius: '15px', 
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              border: m.type === 'internal' ? '1px solid #ffe0b2' : 'none'
            }}>
              {m.type === 'internal' && <div style={{ fontSize: '10px', color: '#e65100', fontWeight: 'bold', marginBottom: '4px' }}>תיוג סמוי - צוות בלבד 🔒</div>}
              <div style={{ fontSize: '14px', color: '#333' }}>{m.text}</div>
              <div style={{ fontSize: '10px', color: '#999', marginTop: '4px', textAlign: 'left' }}>
                {m.timestamp?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* כרטיס איש קשר (מודל) */}
      {showContactCard && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', width: '320px', borderRadius: '20px', overflow: 'hidden', textAlign: 'center', position: 'relative' }}>
            <div style={{ backgroundColor: '#075E54', padding: '30px 20px', color: 'white' }}>
              <button onClick={() => setShowContactCard(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              <img src={showContactCard.avatar} style={{ width: '90px', height: '90px', borderRadius: '50%', border: '4px solid #25D366', marginBottom: '10px' }} />
              <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{showContactCard.name}</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>{showContactCard.role}</div>
            </div>
            <div style={{ padding: '20px', fontSize: '14px', color: '#555', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'right' }}>
              <div>🏢 מחלקה: <b>{showContactCard.dept}</b></div>
              <div>📧 אימייל: <b>{showContactCard.email}</b></div>
              <div>📞 נייד: <b>{showContactCard.phone}</b></div>
              <div>📟 שלוחה: <b>{showContactCard.ext}</b></div>
              <button style={{ marginTop: '10px', padding: '8px', borderRadius: '10px', border: '1px solid #ddd', cursor: 'pointer', fontSize: '12px' }}>שינוי לינק תמונת פרופיל</button>
            </div>
          </div>
        </div>
      )}

      {/* אזור הקלדה */}
      <footer style={{ backgroundColor: '#f0f0f0', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setTagMode(tagMode === 'public' ? 'hidden' : 'public')}
            style={{ 
              padding: '5px 12px', 
              borderRadius: '20px', 
              border: 'none', 
              fontSize: '11px', 
              fontWeight: 'bold',
              cursor: 'pointer',
              backgroundColor: tagMode === 'hidden' ? '#e65100' : '#ddd',
              color: tagMode === 'hidden' ? 'white' : '#666'
            }}
          >
            {tagMode === 'hidden' ? '🔒 תיוג סמוי פעיל' : '👁️ תיוג גלוי ללקוח'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            style={{ flex: 1, padding: '12px 20px', borderRadius: '25px', border: '1px solid #ddd', outline: 'none', fontSize: '14px' }}
            placeholder="כתוב הודעה או תייג @..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button 
            onClick={sendMessage}
            style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#075E54', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ➤
          </button>
        </div>
      </footer>
    </div>
  );
}
