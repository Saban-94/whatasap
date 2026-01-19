'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";

export default function SabanStudio() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [internalMsg, setInternalMsg] = useState('');
  const [loading, setLoading] = useState(true);

  // פונקציה למשיכת נתונים
  const fetchData = async () => {
    setLoading(true);
    try {
      const prodSnap = await getDocs(query(collection(db, "products"), orderBy("name")));
      setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const teamSnap = await getDocs(collection(db, "team"));
      setTeam(teamSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error fetching studio data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sendInternalMessage = async () => {
    if (!internalMsg.trim()) return alert("נא לכתוב הודעה");
    try {
      await addDoc(collection(db, "internal_messages"), {
        text: internalMsg,
        sender: "ניהול",
        timestamp: serverTimestamp()
      });
      setInternalMsg('');
      alert("הודעה נשלחה לצוות (ראמי, נתנאל וגליה) ✅");
    } catch (e) {
      alert("שגיאה בשליחה");
    }
  };

  if (loading) return <div style={centerStyle}>טוען סטודיו סבן 94...</div>;

  return (
    <main dir="rtl" style={mainWrapper}>
      <header style={headerStyle}>
        <h1 style={logoStyle}>SABAN 94 <span style={{ color: '#25D366' }}>STUDIO</span></h1>
        <p style={{ color: '#666' }}>מערכת ניהול ובקרה - ח. סבן</p>
      </header>

      {/* תפריט ניווט */}
      <nav style={navStyle}>
        <button style={tabStyle(activeTab === 'products')} onClick={() => setActiveTab('products')}>📦 מוצרים</button>
        <button style={tabStyle(activeTab === 'team')} onClick={() => setActiveTab('team')}>👥 לקוחות/צוות</button>
        <button style={tabStyle(activeTab === 'internal')} onClick={() => setActiveTab('internal')}>💬 קשר סמוי</button>
      </nav>

      <div style={contentWrapper}>
        
        {/* טאב מוצרים */}
        {activeTab === 'products' && (
          <div style={gridStyle}>
            {products.map(p => (
              <div key={p.id} style={cardStyle}>
                <div style={imgPlaceholder}>{p.name[0]}</div>
                <div style={{ padding: '15px' }}>
                  <h3 style={{ margin: '0' }}>{p.name}</h3>
                  <p style={priceStyle}>₪ {p.price || '0'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* טאב לקוחות וצוות */}
        {activeTab === 'team' && (
          <div style={cardStyle}>
            <div style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '15px' }}>ניהול אנשי קשר</h3>
              {team.map(m => (
                <div key={m.id} style={memberRow}>
                  <div style={avatarStyle}>{m.name?.substring(0,2)}</div>
                  <div style={{ flex: 1, marginRight: '15px' }}>
                    <strong>{m.name}</strong>
                    <div style={{ fontSize: '12px', color: '#888' }}>{m.project || 'פרויקט כללי'}</div>
                  </div>
                  <button 
                    style={waBtn}
                    onClick={() => window.open(`https://wa.me/${m.phone}`, '_blank')}
                  >
                    WhatsApp
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* טאב קשר סמוי (צ'אט פנימי) */}
        {activeTab === 'internal' && (
          <div style={cardStyle}>
            <div style={alertBox}>
              <strong>💡 ערוץ תיאום פנימי</strong>
              <p>הודעות כאן נשלחות ישירות לראמי, נתנאל וגליה לצורך תיאום לוגיסטי מהיר.</p>
            </div>
            <div style={{ padding: '20px' }}>
              <textarea 
                placeholder="הודעה דחופה לצוות (מלאי, חריגות, נהגים)..." 
                style={textareaStyle}
                value={internalMsg}
                onChange={(e) => setInternalMsg(e.target.value)}
              />
              <button 
                style={magicBtn}
                onClick={sendInternalMessage}
              >
                שלח הודעה פנימית
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// --- Styles ---
const mainWrapper: any = { backgroundColor: '#F0F2F5', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' };
const headerStyle: any = { textAlign: 'center', marginBottom: '30px' };
const logoStyle: any = { fontSize: '2rem', fontWeight: '900', color: '#1C1E21', margin: 0 };
const navStyle: any = { display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' };
const contentWrapper: any = { maxWidth: '800px', margin: '0 auto' };

const tabStyle = (active: boolean) => ({
  padding: '10px 20px',
  borderRadius: '25px',
  border: 'none',
  backgroundColor: active ? '#25D366' : '#fff',
  color: active ? '#fff' : '#555',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
});

const cardStyle: any = { backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const gridStyle: any = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const imgPlaceholder: any = { height: '100px', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#adb5bd' };
const priceStyle: any = { color: '#25D366', fontWeight: 'bold', marginTop: '5px' };

const memberRow: any = { display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' };
const avatarStyle: any = { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#075E54', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };

const waBtn: any = { 
  backgroundColor: '#25D366', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', pointerEvents: 'auto' 
};

const alertBox: any = { backgroundColor: '#FFF9C4', padding: '15px', borderRight: '5px solid #FBC02D', color: '#856404', fontSize: '14px' };
const textareaStyle: any = { width: '100%', height: '120px', padding: '15px', borderRadius: '10px', border: '1px solid #ddd', boxSizing: 'border-box', marginBottom: '15px', fontSize: '16px' };

const magicBtn: any = { 
  width: '100%', padding: '15px', backgroundColor: '#FB8C00', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', pointerEvents: 'auto', position: 'relative', zIndex: 10 
};

const centerStyle: any = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' };
