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

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        setAllProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error("Firebase error", e); }
    };
    load();
  }, []);

  const sendOrder = async () => {
    if (!form.phone || cart.length === 0) return alert("מלא פרטים ובחר מוצרים");
    setLoading(true);

    const payload = {
      customer: form.name || "לקוח",
      phone: form.phone,
      items: cart.map(i => `${i.name} (x${i.qty})`).join(", "),
      address: form.address || "איסוף עצמי",
      status: "חדש",
      timestamp: new Date()
    };

    try {
      // שליחה ל-365
      await fetch("https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0828f74ee7e44228b96c93eab728f280/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lgdg1Hw--Z35PWOK6per2K02fql76m_WslheLXJL-eA", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // שמירה ב-Firebase
      await addDoc(collection(db, "orders"), payload);

      alert("הזמנה נקלטה! ✅");
      setCart([]);
    } catch (err) {
      alert("שגיאת תקשורת");
    } finally { setLoading(false); }
  };

  return (
    <main dir="rtl" style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '450px', margin: '0 auto' }}>
      <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#075E54' }}>סבן 94 - הזמנה</h2>
        
        <input type="text" placeholder="שם" style={iS} onChange={e => setForm({...form, name: e.target.value})} />
        <input type="tel" placeholder="טלפון" style={iS} onChange={e => setForm({...form, phone: e.target.value})} />
        
        <div style={{ position: 'relative' }}>
          <input type="text" placeholder="🔍 חפש מוצר..." style={{...iS, borderColor: '#075E54'}} value={search} onChange={e => setSearch(e.target.value)} />
          {search.length > 1 && (
            <div style={{ position: 'absolute', width: '100%', background: '#fff', zIndex: 10, border: '1px solid #eee' }}>
              {allProducts.filter(p => p.name.includes(search)).map(p => (
                <div key={p.id} onClick={() => {setCart([...cart, {...p, qty: 1}]); setSearch('');}} style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}>{p.name}</div>
              ))}
            </div>
          )}
        </div>

        <div style={{ margin: '15px 0' }}>{cart.map((c, i) => <div key={i}>{c.name} x {c.qty}</div>)}</div>

        <button onClick={sendOrder} disabled={loading} style={btnS}>
          {loading ? "שולח..." : "שלח הזמנה"}
        </button>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link href="/track" style={{ color: '#075E54', textDecoration: 'underline' }}>איפה ההזמנה שלי? עקוב כאן</Link>
        </div>
      </div>
    </main>
  );
}

const iS = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' as 'border-box' };
const btnS = { width: '100%', padding: '15px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
