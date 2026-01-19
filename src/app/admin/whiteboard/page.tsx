'use client';

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc } from "firebase/firestore";

export default function Saban365Whiteboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [newOrder, setNewOrder] = useState({ client: '', items: '', driver: '', address: '' });
  const [isAdding, setIsAdding] = useState(false);

  // 1. האזנה ללוח ההזמנות בזמן אמת
  useEffect(() => {
    const q = query(collection(db, "saban_orders"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 2. יצירת הזמנה ידנית (ראמי יוצר)
  const createOrder = async () => {
    if (!newOrder.client || !newOrder.items) return alert("מלא פרטי לקוח ומוצרים");
    
    await addDoc(collection(db, "saban_orders"), {
      ...newOrder,
      status: '🆕 חדש',
      timestamp: new Date(),
      pdfUrl: null // יתעדכן כשגליה תוציא תעודה
    });
    
    setNewOrder({ client: '', items: '', driver: '', address: '' });
    setIsAdding(false);
    alert("הזמנה נוצרה וסונכרנה ל-365");
  };

  // 3. שינוי סטטוס (התראה לצוות)
  const changeStatus = async (orderId: string, nextStatus: string) => {
    await updateDoc(doc(db, "saban_orders", orderId), { status: nextStatus });
    // כאן אפשר להוסיף שליחת התראה לנהג ב-Push
  };

  return (
    <div dir="rtl" style={styles.page}>
      <header style={styles.header}>
        <h1 style={{margin:0}}>SABAN 365 <span style={{color:'#2ecc71'}}>CONTROL</span></h1>
        <button onClick={() => setIsAdding(!isAdding)} style={styles.addBtn}>
          {isAdding ? '✖ סגור' : '➕ הזמנה ידנית'}
        </button>
      </header>

      {/* טופס יצירה מהירה (מופיע רק כשראמי לוחץ +) */}
      {isAdding && (
        <div style={styles.createPanel}>
          <input placeholder="שם הלקוח (למשל: נישה)" style={styles.input} value={newOrder.client} onChange={e => setNewOrder({...newOrder, client: e.target.value})} />
          <input placeholder="מוצרים (למשל: 50 מלט, 2 בלה)" style={styles.input} value={newOrder.items} onChange={e => setNewOrder({...newOrder, items: e.target.value})} />
          <input placeholder="כתובת אספקה" style={styles.input} value={newOrder.address} onChange={e => setNewOrder({...newOrder, address: e.target.value})} />
          <select style={styles.input} onChange={e => setNewOrder({...newOrder, driver: e.target.value})}>
            <option>בחר נהג...</option>
            <option value="חכמת">חכמת</option>
            <option value="עלי">עלי</option>
          </select>
          <button onClick={createOrder} style={styles.saveBtn}>צור הזמנה ושגר לצוות 🚀</button>
        </div>
      )}

      {/* ה-Whiteboard (לוח המשימות) */}
      <div style={styles.board}>
        {orders.map(order => (
          <div key={order.id} style={styles.card(order.status)}>
            <div style={styles.cardHeader}>
              <strong>{order.client}</strong>
              <span style={styles.badge}>{order.status}</span>
            </div>
            <p style={{margin:'10px 0', fontSize:'14px'}}>{order.items}</p>
            <small>📍 {order.address} | 🚚 {order.driver}</small>
            
            <div style={styles.actions}>
              <button onClick={() => changeStatus(order.id, '🚚 בדרך')} style={styles.actionBtn}>יצא לדרך</button>
              <button onClick={() => changeStatus(order.id, '✅ בוצע')} style={styles.actionBtnSuccess}>סיום פריקה</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Styles (Clean & Professional) ---
const styles: any = {
  page: { padding: '30px', background: '#f4f7f6', minHeight: '100vh', fontFamily: 'system-ui' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: '#075E54', color: '#fff', padding: '20px', borderRadius: '15px' },
  addBtn: { background: '#2ecc71', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  createPanel: { background: '#fff', padding: '20px', borderRadius: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' },
  saveBtn: { gridColumn: 'span 2', background: '#075E54', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
  board: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: (status: string) => ({
    background: '#fff', padding: '20px', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
    borderRight: `6px solid ${status.includes('✅') ? '#2ecc71' : '#f39c12'}`
  }),
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badge: { fontSize: '11px', background: '#f8f9fa', padding: '4px 8px', borderRadius: '10px' },
  actions: { marginTop: '15px', display: 'flex', gap: '10px' },
  actionBtn: { flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #eee', cursor: 'pointer', fontSize: '12px' },
  actionBtnSuccess: { flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: '#2ecc71', color: '#fff', fontWeight: 'bold', fontSize: '12px' }
};
