'use client';
import { db } from "@/lib/firebase";
  import { collection, addDoc, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { useState, useEffect } from 'react';

export default function AdminStudio() {
  const [activeTab, setActiveTab] = useState<'products' | 'team' | 'orders'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [formProduct, setFormProduct] = useState({ name: '', type: 'product', imageUrl: '' });
  const [formMember, setFormMember] = useState({ name: '', role: 'צוות', phone: '', project: '', address: '', profileImg: '' });

  useEffect(() => {
    const fetchData = async () => {
      const pSnap = await getDocs(collection(db, "products"));
      setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      const tSnap = await getDocs(collection(db, "team"));
      setTeam(tSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchData();
  }, []);

  const createMagicLink = (member: any) => {
    const baseUrl = "https://whatsapp-three-beryl.vercel.app/client/";
    const params = `?id=${member.id}&name=${encodeURIComponent(member.name)}&project=${encodeURIComponent(member.project)}&addr=${encodeURIComponent(member.address)}`;
    return baseUrl + params;
  };

  const sendWhatsApp = (member: any) => {
    const link = createMagicLink(member);
    const msg = `שלום ${member.name}, ברוך הבא למערכת VIP של ח.סבן חומרי בניין! 🏗️
אנו שמחים להעניק לך גישה לאפליקציית הניהול האישית שלך.

בלינק הבא תוכל לבצע הזמנות חומרים ומכולות ולעקוב אחרי אספקות:
${link}

🚨 הנחיות להתקנה:
1. פתח את הלינק.
2. לחץ על 'אפשרויות' (3 נקודות) ובחר "הוסף למסך הבית".
3. אשר קבלת התראות (Push) כדי שתדע כשהמכולה בדרך אליך!

אנחנו כאן לכל שאלה.`;
    window.open(`https://wa.me/972${member.phone.substring(1)}?text=${encodeURIComponent(msg)}`);
  };

  return (
    <main dir="rtl" style={containerStyle}>
      <header style={headerStyle}>
        <h2>SABAN 94 - STUDIO CENTER</h2>
        <nav style={navStyle}>
          <button onClick={() => setActiveTab('products')} style={tabBtn(activeTab === 'products')}>ניהול קטלוג</button>
          <button onClick={() => setActiveTab('team')} style={tabBtn(activeTab === 'team')}>לקוחות וצוות</button>
        </nav>
      </header>

      {/* ניהול קטלוג */}
      {activeTab === 'products' && (
        <section style={cardStyle}>
          <h3>הוספת מוצר/מכולה</h3>
          <input placeholder="שם המוצר" style={iS} onChange={e => setFormProduct({...formProduct, name: e.target.value})} />
          <input placeholder="לינק לתמונה" style={iS} onChange={e => setFormProduct({...formProduct, imageUrl: e.target.value})} />
          <select style={iS} onChange={e => setFormProduct({...formProduct, type: e.target.value})}>
            <option value="product">חומר בניין</option>
            <option value="container">מכולה (8 קוב)</option>
          </select>
          <button style={mainBtn} onClick={async () => { await addDoc(collection(db, "products"), formProduct); alert("נוסף!"); }}>שמור מוצר</button>
        </section>
      )}

      {/* ניהול לקוחות וצוות */}
      {activeTab === 'team' && (
        <section style={cardStyle}>
          <h3>יצירת לקוח חדש / איש צוות</h3>
          <input placeholder="שם מלא" style={iS} onChange={e => setFormMember({...formMember, name: e.target.value})} />
          <input placeholder="טלפון" style={iS} onChange={e => setFormMember({...formMember, phone: e.target.value})} />
          <input placeholder="פרויקט" style={iS} onChange={e => setFormMember({...formMember, project: e.target.value})} />
          <input placeholder="כתובת אתר" style={iS} onChange={e => setFormMember({...formMember, address: e.target.value})} />
          <input placeholder="לינק לתמונת פרופיל" style={iS} onChange={e => setFormMember({...formMember, profileImg: e.target.value})} />
          <button style={mainBtn} onClick={async () => { await addDoc(collection(db, "team"), formMember); alert("נוצר בהצלחה!"); }}>צור ושלח לינק קסם</button>

          <div style={{ marginTop: '20px' }}>
            {team.map(m => (
              <div key={m.id} style={itemRow}>
                <img src={m.profileImg || 'https://via.placeholder.com/40'} style={pImg} />
                <div style={{ flex: 1, marginRight: '10px' }}>
                  <strong>{m.name}</strong><br/>
                  <small>{m.project}</small>
                </div>
                <button onClick={() => sendWhatsApp(m)} style={waBtn}>שלח לינק קסם 💬</button>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

// עיצובים
const containerStyle = { background: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif', padding: '20px' };
const headerStyle = { background: '#075E54', color: '#fff', padding: '20px', borderRadius: '15px', textAlign: 'center' as 'center', marginBottom: '20px' };
const navStyle = { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' };
const tabBtn = (active: boolean) => ({ padding: '10px 20px', borderRadius: '20px', border: 'none', background: active ? '#25D366' : '#054d44', color: '#fff', cursor: 'pointer' });
const cardStyle = { background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' };
const iS = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd' };
const mainBtn = { width: '100%', padding: '15px', background: '#075E54', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' };
const itemRow = { display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' };
const pImg = { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' as 'cover' };
const waBtn = { background: '#25D366', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' };
