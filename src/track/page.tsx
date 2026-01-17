'use client';
import { useState } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2QjUvjfALcuoM1xZMVDIXcNpwCG1-tE8",
  authDomain: "saban-system-v2.firebaseapp.com",
  projectId: "saban-system-v2",
  storageBucket: "saban-system-v2.firebasestorage.app",
  messagingSenderId: "670637185194",
  appId: "1:670637185194:web:e897482997e75c110898d3",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default function TrackOrder() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const track = async () => {
    if (!phone) return alert("נא להזין מספר טלפון");
    setLoading(true);
    try {
      const q = query(
        collection(db, "orders"), 
        where("phone", "==", phone),
        orderBy("timestamp", "desc")
      );
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      alert("תקלה בחיפוש ההזמנות");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main dir="rtl" style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#075E54' }}>מעקב הזמנות - סבן 94</h2>
        
        <input 
          type="tel" 
          placeholder="הכנס מספר טלפון למעקב..." 
          style={sInput} 
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        
        <button onClick={track} disabled={loading} style={sButton}>
          {loading ? "מחפש..." : "בדוק סטטוס הזמנות"}
        </button>

        <div style={{ marginTop: '30px' }}>
          {orders.map((order, i) => (
            <div key={i} style={orderCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#888', fontSize: '12px' }}>{new Date(order.timestamp?.seconds * 1000).toLocaleDateString('he-IL')}</span>
                <span style={{ ...statusBadge, backgroundColor: getStatusColor(order.status) }}>{order.status || 'בטיפול'}</span>
              </div>
              <div style={{ fontWeight: 'bold' }}>{order.items}</div>
              <div style={{ fontSize: '14px', color: '#555', marginTop: '5px' }}>📍 {order.address}</div>
            </div>
          ))}
          {orders.length === 0 && !loading && phone && <p style={{ textAlign: 'center', color: '#888' }}>לא נמצאו הזמנות למספר זה</p>}
        </div>
      </div>
    </main>
  );
}

const getStatusColor = (status: string) => {
  switch(status) {
    case 'מוכן': return '#25D366';
    case 'בטיפול': return '#FFD700';
    case 'הושלם': return '#34B7F1';
    default: return '#ccc';
  }
};

const sInput = { width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #ddd', boxSizing: 'border-box' as 'border-box', fontSize: '18px' };
const sButton = { width: '100%', padding: '15px', background: '#075E54', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' };
const orderCard = { padding: '15px', border: '1px solid #eee', borderRadius: '12px', marginBottom: '15px', background: '#fcfcfc' };
const statusBadge = { padding: '5px 12px', borderRadius: '20px', color: '#fff', fontSize: '12px', fontWeight: 'bold' };
