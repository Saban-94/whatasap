'use client';
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit } from "firebase/firestore";
import { useState, useEffect } from 'react';

export default function AdminUnifiedPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', type: 'product', imageUrl: '' });
  const [loading, setLoading] = useState(false);

  // טעינת נתונים (מוצרים והזמנות)
  const loadData = async () => {
    const pSnap = await getDocs(collection(db, "products"));
    setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    
    const oSnap = await getDocs(query(collection(db, "orders"), orderBy("timestamp", "desc"), limit(10)));
    setOrders(oSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { loadData(); }, []);

  // הוספת מוצר
  const addProduct = async () => {
    if (!form.name) return alert("חובה שם מוצר");
    setLoading(true);
    try {
      await addDoc(collection(db, "products"), form);
      alert("המוצר נוסף בהצלחה! ✅");
      setForm({ name: '', type: 'product', imageUrl: '' });
      loadData();
    } catch (e) { alert("שגיאה בהוספה"); }
    finally { setLoading(false); }
  };

  return (
    <main dir="rtl" style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto', backgroundColor: '#f9f9f9' }}>
      <h1 style={{ textAlign: 'center', color: '#075E54' }}>ניהול מאוחד - סבן 94</h1>

      {/* חלק 1: הוספת מוצר חדש */}
      <section style={sectionStyle}>
        <h3>➕ הוספת מוצר חדש לקטלוג</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          <input type="text" placeholder="שם המוצר" style={iS} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input type="text" placeholder="לינק לתמונת מוצר (URL)" style={iS} value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} />
          <select style={iS} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            <option value="product">חומר בניין</option>
            <option value="container">מכולה (הצבה/החלפה)</option>
          </select>
          <button onClick={addProduct} disabled={loading} style={btnS}>
            {loading ? "מעדכן..." : "שמור מוצר לקטלוג"}
          </button>
        </div>
      </section>

      {/* חלק 2: מעקב הזמנות אחרונות (מאזין) */}
      <section style={sectionStyle}>
        <h3>📦 הזמנות אחרונות מלקוחות</h3>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {orders.map(o => (
            <div key={o.id} style={orderCard}>
              <div><strong>{o.customer}</strong> | {o.phone}</div>
              <div style={{ fontSize: '14px', color: '#555' }}>{o.items}</div>
              <div style={{ fontSize: '12px', color: '#075E54', fontWeight: 'bold' }}>סטטוס: {o.status || 'חדש'}</div>
            </div>
          ))}
        </div>
      </section>

      {/* חלק 3: ניהול מוצרים קיימים */}
      <section style={sectionStyle}>
        <h3>📑 קטלוג מוצרים קיים</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
          {products.map(p => (
            <div key={p.id} style={productCard}>
              {p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '5px' }} />}
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '5px' }}>{p.name}</div>
              <button onClick={async () => { if(confirm("למחוק?")){ await deleteDoc(doc(db, "products", p.id)); loadData(); } }} style={delBtn}>מחק</button>
            </div>
          ))}
        </div>
      </section>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <a href="https://saban94.sharepoint.com/lists/InventoryManagement" target="_blank" style={{ color: '#075E54', fontWeight: 'bold' }}>לניהול מלאי מתקדם ב-SharePoint 🔗</a>
      </div>
    </main>
  );
}

// עיצובים
const sectionStyle = { background: '#fff', padding: '20px', borderRadius: '15px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const iS = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' as 'border-box' };
const btnS = { padding: '15px', background: '#075E54', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const orderCard = { padding: '10px', borderBottom: '1px solid #eee', marginBottom: '10px' };
const productCard = { padding: '10px', border: '1px solid #eee', borderRadius: '10px', textAlign: 'center' as 'center', background: '#fff' };
const delBtn = { background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '12px', marginTop: '5px' };
