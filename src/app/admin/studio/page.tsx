'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { 
  collection, getDocs, addDoc, query, orderBy, serverTimestamp, doc, onSnapshot 
} from "firebase/firestore";

export default function SabanStudioFinal() {
  const [activeTab, setActiveTab] = useState('team'); // ברירת מחדל לצוות
  const [products, setProducts] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States לטפסים
  const [newProduct, setNewProduct] = useState({ name: '', price: '', type: 'product', imageUrl: '' });
  const [newMember, setNewMember] = useState({ name: '', project: '', phone: '', avatar: '' });
  const [internalMsg, setInternalMsg] = useState('');

  useEffect(() => {
    // משיכת מוצרים וצוות
    const fetchData = async () => {
      const pSnap = await getDocs(query(collection(db, "products"), orderBy("name")));
      setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      const tSnap = await getDocs(collection(db, "team"));
      setTeam(tSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchData();

    // האזנה בזמן אמת להודעות פנימיות
    const qMsg = query(collection(db, "internal_messages"), orderBy("time", "desc"));
    const unsubscribe = onSnapshot(qMsg, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  const saveMember = async () => {
    if (!newMember.name || !newMember.phone) return alert("שם וטלפון חובה");
    await addDoc(collection(db, "team"), newMember);
    alert("חבר צוות/לקוח נוסף!");
    setNewMember({ name: '', project: '', phone: '', avatar: '' });
  };

  const saveProduct = async () => {
    if (!newProduct.name) return alert("שם מוצר חובה");
    await addDoc(collection(db, "products"), newProduct);
    alert("מוצר נוסף לקטלוג!");
    setNewProduct({ name: '', price: '', type: 'product', imageUrl: '' });
  };

  const sendMagicLink = (m: any) => {
    const link = `https://whatasap.vercel.app/order?uid=${m.id}`;
    const waText = `היי ${m.name}, זה הלינק האישי שלך להזמנות מח.סבן: ${link}`;
    window.open(`https://wa.me/${m.phone}?text=${encodeURIComponent(waText)}`);
  };

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>טוען מרכז בקרה סבן...</div>;

  return (
    <main dir="rtl" style={mainStyle}>
      <header style={headerStyle}>
        <h2 style={{margin:0}}>SABAN 94 - STUDIO</h2>
        <nav style={navStyle}>
          <button style={tabBtn(activeTab==='team')} onClick={()=>setActiveTab('team')}>👥 לקוחות וצוות</button>
          <button style={tabBtn(activeTab==='catalog')} onClick={()=>setActiveTab('catalog')}>📦 קטלוג מוצרים</button>
          <button style={tabBtn(activeTab==='internal')} onClick={()=>setActiveTab('internal')}>💬 קשר סמוי</button>
        </nav>
      </header>

      {/* Tab: Team & Magic Link */}
      {activeTab === 'team' && (
        <section style={sectionStyle}>
          <h3>הוספת לקוח חדש</h3>
          <input style={iS} placeholder="שם מלא" value={newMember.name} onChange={e=>setNewMember({...newMember, name:e.target.value})} />
          <input style={iS} placeholder="פרויקט" value={newMember.project} onChange={e=>setNewMember({...newMember, project:e.target.value})} />
          <input style={iS} placeholder="טלפון (972...)" value={newMember.phone} onChange={e=>setNewMember({...newMember, phone:e.target.value})} />
          <input style={iS} placeholder="לינק לתמונת פרופיל" value={newMember.avatar} onChange={e=>setNewMember({...newMember, avatar:e.target.value})} />
          <button style={saveBtn} onClick={saveMember}>צור לקוח במערכת</button>
          
          <div style={{marginTop:'20px'}}>
            {team.map(m => (
              <div key={m.id} style={memberRow}>
                <img src={m.avatar || 'https://via.placeholder.com/50'} style={avatarImg} alt="profile" />
                <div style={{flex:1, marginRight:'15px'}}>
                  <strong>{m.name}</strong><br/><small>{m.project}</small>
                </div>
                <button style={waBtn} onClick={()=>sendMagicLink(m)}>לינק קסם ✨</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab: Catalog with Image Link */}
      {activeTab === 'catalog' && (
        <section style={sectionStyle}>
          <h3>ניהול מוצרים</h3>
          <input style={iS} placeholder="שם המוצר" value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name:e.target.value})} />
          <input style={iS} placeholder="לינק לתמונת מוצר" value={newProduct.imageUrl} onChange={e=>setNewProduct({...newProduct, imageUrl:e.target.value})} />
          <button style={saveBtn} onClick={saveProduct}>שמור מוצר</button>
          
          <div style={gridStyle}>
            {products.map(p => (
              <div key={p.id} style={itemCard}>
                <img src={p.imageUrl || 'https://via.placeholder.com/100'} style={productImg} alt="product" />
                <strong>{p.name}</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab: Internal Messages (Display & Send) */}
      {activeTab === 'internal' && (
        <section style={sectionStyle}>
          <h3 style={{color:'#f57c00'}}>לוח הודעות פנימי (ראמי/נתנאל/גליה)</h3>
          <div style={messageBox}>
            {messages.map(msg => (
              <div key={msg.id} style={msgItem}>
                <small style={{color:'#888'}}>{msg.time?.toDate().toLocaleTimeString()}</small>
                <p style={{margin:'5px 0'}}>{msg.text}</p>
              </div>
            ))}
          </div>
          <div style={{marginTop:'15px'}}>
            <textarea style={{...iS, height:'80px'}} placeholder="הודעה לצוות..." value={internalMsg} onChange={e=>setInternalMsg(e.target.value)} />
            <button style={{...saveBtn, background:'#f57c00'}} onClick={async()=>{
              if(!internalMsg) return;
              await addDoc(collection(db, "internal_messages"), { text: internalMsg, time: serverTimestamp() });
              setInternalMsg('');
            }}>שלח הודעה</button>
          </div>
        </section>
      )}
    </main>
  );
}

// --- Styles ---
const mainStyle: any = { background: '#f0f2f5', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' };
const headerStyle: any = { background: '#075E54', color: '#fff', padding: '20px', borderRadius: '15px', textAlign: 'center', marginBottom: '20px' };
const navStyle: any = { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' };
const sectionStyle: any = { background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' };
const iS = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' as 'border-box' };
const saveBtn = { width: '100%', padding: '15px', background: '#075E54', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const tabBtn = (active: boolean) => ({ padding: '10px 20px', borderRadius: '20px', border: 'none', background: active ? '#25D366' : '#054d44', color: '#fff', cursor: 'pointer', fontWeight: 'bold' });
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' };
const itemCard = { padding: '15px', border: '1px solid #eee', borderRadius: '10px', textAlign: 'center' as 'center' };
const memberRow = { display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' };
const avatarImg = { width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' as 'cover', border: '2px solid #25D366' };
const productImg = { width: '100%', height: '100px', objectFit: 'cover' as 'cover', borderRadius: '8px', marginBottom: '5px' };
const waBtn = { background: '#25D366', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' };
const messageBox = { height: '250px', overflowY: 'auto' as 'auto', background: '#fff9c4', padding: '10px', borderRadius: '10px' };
const msgItem = { background: '#fff', padding: '10px', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
