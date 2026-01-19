'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

export default function AdminPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [formMember, setFormMember] = useState({ name: '', project: '', phone: '' });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const snap = await getDocs(collection(db, "team"));
      setTeam(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addNewMember = async () => {
    if (!formMember.name || !formMember.phone) return alert("נא למלא שם וטלפון");
    try {
      await addDoc(collection(db, "team"), formMember);
      setFormMember({ name: '', project: '', phone: '' });
      fetchData();
      alert("לקוח/חבר צוות נוסף בהצלחה! ✅");
    } catch (e) {
      alert("שגיאה בהוספה");
    }
  };

  return (
    <main dir="rtl" style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#075E54' }}>ניהול לקוחות וצוות - ח. סבן</h2>
        
        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            style={inputStyle} 
            placeholder="שם מלא" 
            value={formMember.name}
            onChange={e => setFormMember({...formMember, name: e.target.value})} 
          />
          <input 
            style={inputStyle} 
            placeholder="פרויקט (למשל: תל אביב / אתר בניה)" 
            value={formMember.project}
            onChange={e => setFormMember({...formMember, project: e.target.value})} 
          />
          <input 
            style={inputStyle} 
            placeholder="מספר טלפון (וואטסאפ)" 
            value={formMember.phone}
            onChange={e => setFormMember({...formMember, phone: e.target.value})} 
          />
          
          <button 
            style={buttonStyle}
            onClick={addNewMember}
          >
            צור לקוח/חבר צוות במערכת
          </button>
        </div>

        <hr />

        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>רשימת אנשי קשר קיימים:</h3>
          {team.map(m => (
            <div key={m.id} style={rowStyle}>
              <div style={{ flex: 1 }}>
                <strong>{m.name}</strong>
                <div style={{ fontSize: '12px', color: '#666' }}>{m.project}</div>
              </div>
              <button 
                onClick={() => window.open(`https://wa.me/${m.phone}`, '_blank')}
                style={waBtnStyle}
              >
                WhatsApp
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// Styles
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' as 'border-box' };

const buttonStyle = { 
  width: '100%', padding: '15px', backgroundColor: '#25D366', color: '#fff', 
  border: 'none', borderRadius: '10px', fontWeight: 'bold' as 'bold', 
  cursor: 'pointer', position: 'relative' as 'relative', zIndex: 999 
};

const rowStyle = { 
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
  padding: '10px', borderBottom: '1px solid #eee' 
};

const waBtnStyle = { 
  backgroundColor: '#075E54', color: '#fff', border: 'none', 
  padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' 
};
