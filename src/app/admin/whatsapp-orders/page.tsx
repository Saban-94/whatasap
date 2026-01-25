'use client';

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase"; 
import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, doc, updateDoc } from "firebase/firestore";

export default function SabanEnterpriseChat() {
  const [activeTab, setActiveTab] = useState('chats');
  const [groups, setGroups] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  // נתוני טופס לאיש צוות חדש
  const [newStaff, setNewStaff] = useState({
    name: '', dept: '', role: '', phone: '', ext: '', email: '', avatar: ''
  });

  // טעינת קבוצות וצוות בזמן אמת
  useEffect(() => {
    const qGroups = query(collection(db, "saban_groups"), orderBy("timestamp", "desc"));
    const unsubGroups = onSnapshot(qGroups, (s) => setGroups(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    const qStaff = query(collection(db, "employees")); // שימוש באוסף הקיים שלך
    const unsubStaff = onSnapshot(qStaff, (s) => setStaff(s.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubGroups(); unsubStaff(); };
  }, []);

  const createMagicLink = (groupId: string) => {
    const link = `https://whatasap.vercel.app/join/${groupId}`;
    navigator.clipboard.writeText(link);
    alert("לינק קסם הועתק! שלח אותו למצטרפים החדשים.");
  };

  const handleAddStaff = async () => {
    await addDoc(collection(db, "employees"), { ...newStaff, createdAt: serverTimestamp() });
    setShowAddStaff(false);
    setNewStaff({ name: '', dept: '', role: '', phone: '', ext: '', email: '', avatar: '' });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f0f2f5', direction: 'rtl', fontFamily: 'sans-serif' }}>
      
      {/* סרגל לשוניות צדדי (כמו וואטסאפ) */}
      <div style={{ width: '60px', backgroundColor: '#202c33', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px 0', gap: '20px', color: '#aebac1' }}>
        <div onClick={() => setActiveTab('chats')} style={{ cursor: 'pointer', color: activeTab === 'chats' ? 'white' : 'inherit' }}>💬</div>
        <div onClick={() => setActiveTab('staff')} style={{ cursor: 'pointer', color: activeTab === 'staff' ? 'white' : 'inherit' }}>👥</div>
        <div onClick={() => setActiveTab('settings')} style={{ cursor: 'pointer', color: activeTab === 'settings' ? 'white' : 'inherit' }}>⚙️</div>
        <div style={{ marginTop: 'auto', marginBottom: '10px' }}>
             <img src="/logo.png" style={{ width: '35px', borderRadius: '50%' }} />
        </div>
      </div>

      {/* רשימת צ'אטים / צוות */}
      <div style={{ width: '350px', backgroundColor: 'white', borderLeft: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', backgroundColor: '#f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{activeTab === 'chats' ? 'צ\'אטים' : 'אנשי צוות'}</h2>
          <button 
            onClick={() => activeTab === 'chats' ? setShowAddGroup(true) : setShowAddStaff(true)}
            style={{ backgroundColor: '#00a884', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontSize: '20px' }}
          >+</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'chats' ? (
            groups.map(g => (
              <div key={g.id} onClick={() => setSelectedGroup(g)} style={{ padding: '15px', borderBottom: '1px solid #f0f2f5', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{g.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>לינק הצטרפות פעיל</div>
                </div>
                <button onClick={() => createMagicLink(g.id)} style={{ fontSize: '10px', border: '1px solid #00a884', color: '#00a884', padding: '2px 5px', borderRadius: '5px' }}>🔗 לינק</button>
              </div>
            ))
          ) : (
            staff.map(s => (
              <div key={s.id} style={{ padding: '15px', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={s.avatar || '/logo.png'} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>{s.name}</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>{s.role} | {s.dept}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* אזור הצגת תוכן מרכזי */}
      <div style={{ flex: 1, position: 'relative' }}>
        {showAddStaff && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'white', zIndex: 10, padding: '40px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3>הקמת איש צוות חדש (ראמי)</h3>
            <input placeholder="שם מלא" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} style={inputStyle} />
            <input placeholder="מחלקה" value={newStaff.dept} onChange={e => setNewStaff({...newStaff, dept: e.target.value})} style={inputStyle} />
            <input placeholder="תפקיד" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} style={inputStyle} />
            <input placeholder="נייד" value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} style={inputStyle} />
            <input placeholder="שלוחה" value={newStaff.ext} onChange={e => setNewStaff({...newStaff, ext: e.target.value})} style={inputStyle} />
            <input placeholder="אימייל" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} style={inputStyle} />
            <input placeholder="לינק לתמונת פרופיל" value={newStaff.avatar} onChange={e => setNewStaff({...newStaff, avatar: e.target.value})} style={inputStyle} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleAddStaff} style={{ backgroundColor: '#00a884', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>שמור איש צוות</button>
              <button onClick={() => setShowAddStaff(false)} style={{ backgroundColor: '#ccc', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>ביטול</button>
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
          {selectedGroup ? `צ'אט פעיל: ${selectedGroup.name}` : 'בחר קבוצה או איש צוות להתחלת העבודה'}
        </div>
      </div>
    </div>
  );
}

const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', width: '100%', maxWidth: '400px' };
