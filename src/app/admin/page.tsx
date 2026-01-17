'use client';
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit } from "firebase/firestore";
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', type: 'product', imageUrl: '' });
  const [loading, setLoading] = useState(false);

  // טעינת נתונים משולבת
  const loadData = async () => {
    try {
      const pSnap = await getDocs(collection(db, "products"));
      setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const oSnap = await getDocs(query(collection(db, "orders"), orderBy("timestamp", "desc"), limit(10)));
      setOrders(oSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error("Error loading data:", e); }
  };

  useEffect(() => { loadData(); }, []);

  const addProduct = async () => {
    if (!form.name) return alert("נא להזין שם מוצר");
    setLoading(true);
    try {
      await addDoc(collection(db, "products"), form);
      setForm({ name: '', type: 'product', imageUrl: '' });
      loadData();
      alert("המוצר נוסף לקטלוג! ✅");
    } catch (e) { alert("שגיאה בהוספה"); }
    finally { setLoading(false); }
  };

  return (
    <main dir="rtl" style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#075E54', margin: '0' }}>מרכז השליטה - סבן 94</h1>
        <p style={{ color: '#666' }}>ניהול מלאי, מוצרים והזמנות בזמן אמת</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        
        {/* חלק א: הוספת מוצר חדש */}
        <section style={cardStyle}>
          <h3 style={titleStyle}>➕ הוספת מוצר לקטלוג</h3>
          <input type="text" placeholder="שם המוצר" style={iS} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input type="text" placeholder="לינק לתמונה (URL)" style={iS} value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} />
          <select style={iS} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            <option value="product">חומר בניין רגיל</option>
            <option value="container">מכולה (שירות לוגיסטי)</option>
          </select>
          <button onClick={addProduct} disabled={loading} style={btnS}>
            {loading ? "מעבד..." : "הוסף מוצר למערכת"}
          </button>
        </section>

        {/* חלק ב: הזמנות אחרונות (מאזין) */}
        <section style={cardStyle}>
          <h3 style={titleStyle}>📦 הזמנות אחרונות מהאתר</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {orders.length > 0 ? orders.map(o => (
              <div key={o.id} style={orderItemStyle}>
                <div style={{ fontWeight: 'bold' }}>{o.customer} <span style={{ fontWeight: 'normal', fontSize: '12px' }}>({o.phone})</span></div>
                <div style={{ fontSize: '14px', color: '#444' }}>{o.items}</div>
                <div style={{ fontSize: '12px', color: '#075E54', marginTop: '5px' }}>🕒 {o.timestamp?.seconds ? new Date(o.timestamp.seconds * 1000).toLocaleTimeString() : 'עכשיו'}</div>
              </div>
            )) : <p>אין הזמנות חדשות כרגע</p>}
          </div>
        </section>

        {/* חלק ג: ניהול הקטלוג הקיים */}
        <section style={{ ...cardStyle, gridColumn: '1 / -1' }}>
          <h3 style={titleStyle}>📑 קטלוג מוצרים פעיל</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
            {products.map(p => (
              <div key={p.id} style={productCardStyle}>
                {p.imageUrl ? <img src={p.imageUrl} style={imgStyle} alt={p.name} /> : <div style={noImgStyle}>אין תמונה</div>}
                <div style={{ fontWeight: 'bold', margin: '10px 0' }}>{p.name}</div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>{p.type === 'container' ? 'מכולה' : 'חומר'}</div>
                <button onClick={async () => { if(confirm("למחוק מוצר?")){ await deleteDoc(doc(db, "products", p.id)); loadData(); } }} style={delBtnStyle}>מחק מוצר</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer style={{ textAlign: 'center', marginTop: '40px', padding: '20px', borderTop: '1px solid #ddd' }}>
        <a href="https://saban94.sharepoint.com/lists/InventoryManagement" target="_blank" style={linkBtnStyle}>מעבר לניהול מלאי ב-SharePoint 🔗</a>
      </footer>
    </main>
  );
}

// עיצובים (Styles)
const cardStyle = { background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
const titleStyle = { color: '#075E54', borderBottom: '2px solid #25D366', paddingBottom: '10px', marginBottom: '20px' };
const iS = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' as 'border-box' };
const btnS = { width: '100%', padding: '15px', background: '#075E54', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' };
const orderItemStyle = { padding: '12px', borderBottom: '1px solid #eee', marginBottom: '5px', backgroundColor: '#fcfcfc' };
const productCardStyle = { background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '10px', textAlign: 'center' as 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
const imgStyle = { width: '100%', height: '100px', objectFit: 'cover' as 'cover', borderRadius: '8px' };
const noImgStyle = { height: '100px', background: '#eee', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px' };
const delBtnStyle = { background: '#fff0f0', color: '#d32f2f', border: '1px solid #ffcdd2', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' };
const linkBtnStyle = { textDecoration: 'none', color: '#075E54', fontWeight: 'bold', fontSize: '16px' };
