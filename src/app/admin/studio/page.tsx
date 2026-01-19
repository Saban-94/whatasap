'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  query,
  orderBy 
} from "firebase/firestore";

export default function SabanStudio() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
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

  // ניהול טאבים ועיצוב
  const tabStyle = (id: string) => ({
    padding: '12px 24px',
    cursor: 'pointer',
    backgroundColor: activeTab === id ? '#25D366' : '#fff',
    color: activeTab === id ? '#fff' : '#333',
    borderRadius: '12px',
    fontWeight: 'bold',
    border: 'none',
    transition: 'all 0.3s ease',
    boxShadow: activeTab === id ? '0 4px 10px rgba(37, 211, 102, 0.3)' : 'none'
  });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      טוען סטודיו סבן...
    </div>
  );

  return (
    <main dir="rtl" style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1a1a1a', margin: '0' }}>SABAN 94 <span style={{ color: '#25D366' }}>STUDIO</span></h1>
        <p style={{ color: '#666' }}>ניהול מלאי, לקוחות ותקשורת פנים-ארגונית</p>
      </header>

      <nav style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
        <button style={tabStyle('products')} onClick={() => setActiveTab('products')}>📦 קטלוג מוצרים</button>
        <button style={tabStyle('team')} onClick={() => setActiveTab('team')}>👥 ניהול לקוחות/צוות</button>
        <button style={tabStyle('internal')} onClick={() => setActiveTab('internal')}>💬 קשר סמוי</button>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* טאב מוצרים */}
        {activeTab === 'products' && (
          <section className="animate-in">
            <div style={gridStyle}>
              {products.map(p => (
                <div key={p.id} style={cardStyle}>
                  <img src={p.image || '/logo.png'} alt={p.name} style={imgStyle} />
                  <div style={{ padding: '15px' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>{p.name}</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>{p.description || 'אין תיאור מוצר'}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                      <span style={{ fontWeight: 'bold', color: '#25D366' }}>₪ {p.price || '0'}</span>
                      <button style={editBtnStyle}>ערוך</button>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ ...cardStyle, border: '2px dashed #ccc', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px', cursor: 'pointer' }}>
                <span style={{ fontSize: '3rem', color: '#ccc' }}>+</span>
                <span style={{ color: '#666' }}>הוסף מוצר חדש</span>
              </div>
            </div>
          </section>
        )}

        {/* טאב צוות/לקוחות */}
        {activeTab === 'team' && (
          <section style={cardStyle}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'right' }}>
                  <th style={thStyle}>שם</th>
                  <th style={thStyle}>פרויקט</th>
                  <th style={thStyle}>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {team.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#075E54', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                          {m.name?.substring(0,2)}
                        </div>
                        {m.name}
                      </div>
                    </td>
                    <td style={tdStyle}>{m.project || 'כללי'}</td>
                    <td style={tdStyle}>
                      <button 
                        style={{ ...waBtnStyle, position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
                        onClick={() => window.open(`https://wa.me/${m.phone}`, '_blank')}
                      >
                        שלח WhatsApp
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* טאב קשר סמוי */}
        {activeTab === 'internal' && (
          <section style={cardStyle}>
            <div style={{ backgroundColor: '#fff9c4', padding: '20px', borderRadius: '15px', marginBottom: '20px', borderRight: '5px solid #fbc02d' }}>
              <strong>💡 ערוץ פנימי (ראמי - נתנאל - גליה)</strong>
              <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem' }}>כאן מתאמים מלאי וחריגות מול המגרש והנהגים בלי שהלקוח קצה מעורב.</p>
            </div>
            <textarea 
              placeholder="כתוב הודעה דחופה לצוות..." 
              style={{ width: '100%', height: '150px', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '15px', boxSizing: 'border-box' }}
            />
            <button 
              style={{ width: '100%', padding: '15px', backgroundColor: '#fb8c00', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
              onClick={() => alert("הודעה נשלחה לצוות!")}
            >
              שלח הודעה לצוות
            </button>
          </section>
        )}

      </div>
    </main>
  );
}

// Styles
const gridStyle: any = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' };
const cardStyle: any = { backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', padding: '10px' };
const imgStyle: any = { width: '100%', height: '150px', objectFit: 'cover', borderRadius: '15px' };
const editBtnStyle: any = { padding: '6px 12px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' };
const thStyle: any = { padding: '15px', color: '#666', fontWeight: '600' };
const tdStyle: any = { padding: '15px', color: '#333' };
const waBtnStyle: any = { padding: '8px 16px', backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };
