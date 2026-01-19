'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { 
  collection, getDocs, addDoc, query, orderBy, serverTimestamp 
} from "firebase/firestore";

export default function SabanStudioCenter() {
  const [activeTab, setActiveTab] = useState('catalog'); // catalog, team, internal
  const [products, setProducts] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States לטפסים
  const [newProduct, setNewProduct] = useState({ name: '', price: '', type: 'product', image: '' });
  const [internalMsg, setInternalMsg] = useState('');

  const fetchData = async () => {
    try {
      const pSnap = await getDocs(query(collection(db, "products"), orderBy("name")));
      setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const tSnap = await getDocs(collection(db, "team"));
      setTeam(tSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Firebase fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveProduct = async () => {
    if (!newProduct.name) return alert("שם מוצר חובה");
    await addDoc(collection(db, "products"), newProduct);
    alert("מוצר נשמר!");
    setNewProduct({ name: '', price: '', type: 'product', image: '' });
    fetchData();
  };

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>טוען מרכז בקרה סבן...</div>;

  return (
    <main dir="rtl" style={mainStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <h2 style={{margin:0}}>SABAN 94 - STUDIO CENTER</h2>
        <nav style={navStyle}>
          <button style={tabBtn(activeTab==='catalog')} onClick={()=>setActiveTab('catalog')}>ניהול קטלוג</button>
          <button style={tabBtn(activeTab==='team')} onClick={()=>setActiveTab('team')}>לקוחות וצוות</button>
          <button style={tabBtn(activeTab==='internal')} onClick={()=>setActiveTab('internal')}>קשר סמוי</button>
        </nav>
      </header>

      {/* Tab: Catalog */}
      {activeTab === 'catalog' && (
        <section style={sectionStyle}>
          <h3>הוספת מוצר/מכולה</h3>
          <input style={iS} placeholder="שם המוצר" value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name:e.target.value})} />
          <input style={iS} placeholder="מחיר" value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price:e.target.value})} />
          <select style={iS} value={newProduct.type} onChange={e=>setNewProduct({...newProduct, type:e.target.value})}>
             <option value="product">חומר בניין</option>
             <option value="container">מכולה</option>
          </select>
          <button style={saveBtn} onClick={saveProduct}>שמור מוצר בקטלוג</button>
          
          <div style={gridStyle}>
            {products.map(p => (
              <div key={p.id} style={itemCard}>
                <strong>{p.name}</strong>
                <div>₪ {p.price}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab: Team */}
      {activeTab === 'team' && (
        <section style={sectionStyle}>
          <h3>רשימת לקוחות וצוות</h3>
          {team.map(m => (
            <div key={m.id} style={memberRow}>
              <span>{m.name} - <small>{m.project}</small></span>
              <button style={waBtn} onClick={()=>window.open(`https://wa.me/${m.phone}`)}>WhatsApp</button>
            </div>
          ))}
        </section>
      )}

      {/* Tab: Internal Messages */}
      {activeTab === 'internal' && (
        <section style={sectionStyle}>
          <h3 style={{color:'#f57c00'}}>הודעות פנימיות (ראמי/נתנאל/גליה)</h3>
          <textarea 
            style={{...iS, height:'100px'}} 
            placeholder="כתוב הודעה שתופיע רק לצוות הניהול..."
            value={internalMsg}
            onChange={e=>setInternalMsg(e.target.value)}
          ></textarea>
          <button style={{...saveBtn, background:'#f57c00'}} onClick={async()=>{
            await addDoc(collection(db, "internal_messages"), { text: internalMsg, time: serverTimestamp() });
            alert("הודעה נשלחה!");
            setInternalMsg('');
          }}>שלח הודעה חסויה</button>
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
const memberRow = { display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' };
const waBtn = { background: '#25D366', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' };
