'use client';
import { initializeApp, getApps } from "firebase/app";
import { 
  initializeFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  memoryLocalCache 
} from "firebase/firestore";
import { useState, useEffect } from 'react';

const firebaseConfig = {
  apiKey: "AIzaSyC2QjUvjfALcuoM1xZMVDIXcNpwCG1-tE8",
  authDomain: "saban-system-v2.firebaseapp.com",
  projectId: "saban-system-v2",
  storageBucket: "saban-system-v2.firebasestorage.app",
  messagingSenderId: "670637185194",
  appId: "1:670637185194:web:e897482997e75c110898d3",
};

// אתחול Firebase עם הגנה משגיאות IndexedDB
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = initializeFirestore(app, { localCache: memoryLocalCache() });

export default function OrderPage() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [loading, setLoading] = useState(false);

  // טעינת מוצרים מ-Firebase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        setAllProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("שגיאה בטעינת מוצרים:", e);
      }
    };
    loadProducts();
  }, []);

  const sendOrder = async () => {
    if (!form.phone || cart.length === 0) {
      alert("נא למלא טלפון ולבחור לפחות מוצר אחד");
      return;
    }

    setLoading(true);
    const itemsSummary = cart.map(i => `${i.name} (x${i.qty})`).join(", ");
    
    const payload = {
      customer: form.name || "לקוח ללא שם",
      phone: form.phone,
      items: itemsSummary,
      address: form.address || "לא צוינה כתובת"
    };

    try {
      // 1. שליחה ל-Power Automate (365)
      const flowUrl = "https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0828f74ee7e44228b96c93eab728f280/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lgdg1Hw--Z35PWOK6per2K02fql76m_WslheLXJL-eA";
      
      const response = await fetch(flowUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // 2. שמירה ב-Firebase לגיבוי
      await addDoc(collection(db, "orders"), {
        ...payload,
        status: "חדש",
        createdAt: new Date().toISOString()
      });

      if (response.ok) {
        alert("ההזמנה נקלטה בהצלחה במערכת! ✅");
        
        // 3. פתיחת ווטסאפ לגיבוי סופי
        const waMsg = `הזמנה חדשה - סבן 94:\n👤 לקוח: ${payload.customer}\n📞 טלפון: ${payload.phone}\n📦 פריטים: ${payload.items}\n📍 כתובת: ${payload.address}`;
        window.open(`https://wa.me/972508860896?text=${encodeURIComponent(waMsg)}`, '_blank');
        
        setCart([]); // ניקוי עגלה
      } else {
        alert("הזמנה נשמרה בגיבוי, אך הייתה תקלה מול ה-365.");
      }
    } catch (error) {
      console.error("Error sending order:", error);
      alert("שגיאת תקשורת. נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = search.length > 1 
    ? allProducts.filter(p => p.name?.includes(search)) 
    : [];

  return (
    <main dir="rtl" style={{ padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '450px', margin: '0 auto', background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#075E54', marginBottom: '20px' }}>סבן 94 - מערכת הזמנות</h2>
        
        <input type="text" placeholder="שם הלקוח" style={sInput} onChange={e => setForm({...form, name: e.target.value})} />
        <input type="tel" placeholder="טלפון ליצירת קשר" style={sInput} onChange={e => setForm({...form, phone: e.target.value})} />
        <input type="text" placeholder="כתובת למשלוח" style={sInput} onChange={e => setForm({...form, address: e.target.value})} />
        
        <div style={{ position: 'relative', marginTop: '10px' }}>
          <input 
            type="text" 
            placeholder="🔍 חפש מוצר להוספה..." 
            style={{ ...sInput, borderColor: '#075E54', borderWidth: '2px' }} 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          {filtered.length > 0 && (
            <div style={{ position: 'absolute', width: '100%', background: 'white', zIndex: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
              {filtered.map(p => (
                <div key={p.id} onClick={() => {setCart([...cart, {...p, qty: 1}]); setSearch('');}} style={{ padding: '12px', borderBottom: '1px solid #eee', cursor: 'pointer' }}>
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
          <h4>העגלה שלך:</h4>
          {cart.length === 0 && <p style={{ color: '#888' }}>אין מוצרים בעגלה</p>}
          {cart.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span>{item.name}</span>
              <strong>x{item.qty}</strong>
            </div>
          ))}
        </div>

        <button 
          onClick={sendOrder} 
          disabled={loading} 
          style={{ 
            width: '100%', padding: '15px', background: loading ? '#ccc' : '#25D366', 
            color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', 
            fontSize: '18px', cursor: 'pointer', marginTop: '20px' 
          }}
        >
          {loading ? "מעבד הזמנה..." : "שלח הזמנה ל-365 ובווטסאפ"}
        </button>
      </div>
    </main>
  );
}

const sInput = { 
  width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '10px', 
  border: '1px solid #ddd', boxSizing: 'border-box' as 'border-box', fontSize: '16px' 
};
