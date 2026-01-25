'use client';

import React, { useState, useEffect, useRef } from 'react';
import { db } from "@/lib/firebase"; // שימוש בחיבור הקיים
import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { User, Phone, Mail, Building, Hash, Image as ImageIcon, AtSign, EyeOff, Eye } from 'lucide-react';

export default function SabanVipGroup() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [showContactCard, setShowContactCard] = useState<any>(null);
  const [tagMode, setTagMode] = useState<'public' | 'hidden'>('public');
  const [staff] = useState([
    { id: 'rami', name: 'ראמי', dept: 'לוגיסטיקה', role: 'מנהל הפצה', email: 'rami@saban.co.il', phone: '050-8861080', ext: '101', avatar: '/logo.png' },
    { id: 'galia', name: 'גליה', dept: 'משרד', role: 'הנהלת חשבונות', email: 'office@saban.co.il', phone: '050-1234567', ext: '102', avatar: '/logo.png' }
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, "saban_chat"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    await addDoc(collection(db, "saban_chat"), {
      text: inputText,
      sender: "מערכת ח.סבן",
      type: tagMode === 'hidden' ? "internal" : "public", // תיוג סמוי או גלוי
      timestamp: serverTimestamp()
    });
    setInputText("");
  };

  return (
    <div dir="rtl" className="flex flex-col h-screen bg-[#e5ddd5] font-sans">
      {/* Header - Saban Style */}
      <header className="bg-[#075E54] text-white p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#075E54] font-bold">ח.ס</div>
          <div>
            <h1 className="font-bold text-lg">קבוצת הזמנות VIP - ח. סבן בלבד</h1>
            <p className="text-xs opacity-80">ראמי, גליה, נתנאל והצוות</p>
          </div>
        </div>
        <div className="flex gap-4">
          {staff.map(member => (
            <img 
              key={member.id}
              src={member.avatar} 
              className="w-8 h-8 rounded-full border-2 border-white cursor-pointer hover:scale-110 transition-transform"
              onClick={() => setShowContactCard(member)}
              alt={member.name}
            />
          ))}
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.type === 'internal' ? 'justify-center' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
              m.type === 'internal' ? 'bg-[#fff3e0] border border-orange-200 text-orange-900 text-sm' : 'bg-white'
            }`}>
              {m.type === 'internal' && <span className="text-[10px] font-bold block mb-1">תיוג סמוי 🔒</span>}
              <p>{m.text}</p>
              <span className="text-[9px] text-gray-400 block mt-1 text-left">
                {m.timestamp?.toDate().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Contact Card Modal */}
      {showContactCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-[#075E54] p-8 text-center text-white relative">
              <button onClick={() => setShowContactCard(null)} className="absolute top-4 right-4 text-white/80 hover:text-white">✕</button>
              <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 border-4 border-[#25D366] overflow-hidden group relative">
                <img src={showContactCard.avatar} className="w-full h-full object-cover" alt="avatar" />
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <ImageIcon size={24} />
                  <input type="file" className="hidden" onChange={() => alert('עדכון לינק תמונה במערכת...')} />
                </label>
              </div>
              <h2 className="text-2xl font-bold">{showContactCard.name}</h2>
              <p className="text-white/80">{showContactCard.role}</p>
            </div>
            <div className="p-6 space-y-4 text-gray-700">
              <div className="flex items-center gap-4"><Building className="text-gray-400" size={20}/> <span>{showContactCard.dept}</span></div>
              <div className="flex items-center gap-4"><Mail className="text-gray-400" size={20}/> <span>{showContactCard.email}</span></div>
              <div className="flex items-center gap-4"><Phone className="text-gray-400" size={20}/> <span>{showContactCard.phone}</span></div>
              <div className="flex items-center gap-4"><Hash className="text-gray-400" size={20}/> <span>שלוחה: {showContactCard.ext}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Input */}
      <footer className="bg-[#f0f0f0] p-3 flex flex-col gap-2 shadow-inner">
        <div className="flex items-center gap-2 mb-1">
          <button 
            onClick={() => setTagMode(tagMode === 'public' ? 'hidden' : 'public')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              tagMode === 'hidden' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {tagMode === 'hidden' ? <EyeOff size={14}/> : <Eye size={14}/>}
            {tagMode === 'hidden' ? 'תיוג סמוי (לצוות)' : 'תיוג גלוי (ללקוח)'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center border border-gray-200 shadow-sm focus-within:border-[#25D366] transition-all">
            <AtSign size={18} className="text-gray-400 mr-2" />
            <input 
              className="w-full outline-none text-sm"
              placeholder="כתוב הודעה או תייג @..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
          </div>
          <button onClick={sendMessage} className="bg-[#075E54] text-white p-3 rounded-full shadow-md hover:bg-[#128C7E] transition-all active:scale-95">
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}

// שימוש ב-Styles מקבצי ה-globals.css שלך
const Send = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);
