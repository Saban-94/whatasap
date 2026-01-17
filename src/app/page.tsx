'use client';
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OrderPage() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [loading, setLoading] = useState(false);
  
  // מצב לבחירת פעולת מכולה
  const [pendingContainer, setPendingContainer] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        setAllProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const addToCart = (product: any, action?: string) => {
    const nameWithAction = action ? `${product.name} - ${action}` : product.name;
    setCart([...cart, { ...product, name: nameWithAction, action: action || 'אספקה', qty: 1 }]);
    setPendingContainer(null);
    setSearch('');
  };

  const sendOrder = async () => {
    if (!form.phone || cart.length === 0) return alert("מלא פרטים ובחר מוצרים");
    setLoading(true);

    const payload = {
      customer: form.name || "לקוח",
      phone: form.phone,
      items: cart.map(i => `${i.name}`).join(", "),
      address: form.address || "איסוף עצמי",
      status: "חדש",
      timestamp: new Date()
    };

    try {
      await fetch("https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0828f74ee7e44228b96c93eab728f280/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lgdg1Hw--Z35PWOK6per2K02fql76m_WslheLXJL-eA", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      await addDoc(collection(db, "orders"), payload);
      alert("הזמנה נקלטה! ✅");
      setCart([]);
    } catch (err) { alert("שגיאת תקשורת"); }
    finally { setLoading(false); }
  };

  return (
    <main dir="rtl" style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '450px', margin: '0 auto' }}>
      <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#075E54' }}>סבן 94 - הזמנות</h2>
        
        <input type="text" placeholder="שם הלקוח" style={iS} onChange={e => setForm({...form, name: e.target.value})} />
        <input type="tel" placeholder="טלפון" style={iS} onChange={e => setForm({...form, phone: e.target.value})} />
        <input type="text" placeholder="כתובת/אתר בנייה" style={iS} onChange={e => setForm({...form, address: e.target.value})} />
        
        <div style={{ position: 'relative' }}>
          <input type="text" placeholder="🔍 חפש חומר או מכולה..." style={{...iS, borderColor: '#075E54'}} value={search} onChange={e => setSearch(e.target.value)} />
          {search.length > 1 && (
            <div style={{ position: 'absolute', width: '100%', background: '#fff', zIndex: 10, border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
              {allProducts.filter(p => p.name.includes(search)).map(p => (
                <div key={p.id} onClick={() => p.type === 'container' ? setPendingContainer(p) : addToCart(p)} style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}>{p.name}</div>
              ))}
            </div>
          )}
        </div>

        {/* פופ-אפ בחירת פעולה למכולה */}
        {pendingContainer && (
          <div style={modalS}>
            <h4>איזו פעולה לבצע ב{pendingContainer.name}?</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => addToCart(pendingContainer, 'הצבה')} style={actionBtn}>הצבה</button>
              <button onClick={() => addToCart(pendingContainer, 'החלפה')} style={actionBtn}>החלפה</button>
              <button onClick={() => addToCart(pendingContainer, 'הוצאה')} style={actionBtn}>הוצאה</button>
            </div>
            <button onClick={() => setPendingContainer(null)} style={{ marginTop: '10px', border: 'none', background: 'none', color: 'red' }}>ביטול</button>
          </div>
        )}

        <div style={{ margin: '15px 0', borderTop: '1px solid #eee', paddingTop: '10px' }}>
          <strong>עגלת הזמנה:</strong>
          {cart.map((c, i) => <div key={i} style={{ padding: '5px 0' }}>📦 {c.name}</div>)}
        </div>

        <button onClick={sendOrder} disabled={loading} style={btnS}>
          {loading ? "שולח..." : "שלח הזמנה למשרד"}
        </button>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link href="/track" style={{ color: '#075E54' }}>עקוב אחרי סטטוס מכולה/הזמנה</Link>
        </div>
      </div>
    </main>
  );
}

const iS = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' as 'border-box' };
const btnS = { width: '100%', padding: '15px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '18px' };
const modalS = { background: '#f9f9f9', padding: '15px', borderRadius: '10px', border: '2px solid #075E54', margin: '10px 0' };
const actionBtn = { flex: 1, padding: '10px', background: '#075E54', color: '#white', border: 'none', borderRadius: '5px', cursor: 'pointer', color: '#fff' };
