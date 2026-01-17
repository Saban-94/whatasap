'use client';
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', price: '', type: 'product' });
  const [loading, setLoading] = useState(false);

  // טעינת המוצרים הקיימים
  const loadProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { loadProducts(); }, []);

  // הוספת מוצר חדש
  const addProduct = async () => {
    if (!form.name) return alert("חובה להזין שם מוצר");
    setLoading(true);
    try {
      await addDoc(collection(db, "products"), form);
      alert("המוצר נוסף בהצלחה!");
      setForm({ name: '', price: '', type: 'product' });
      loadProducts();
    } catch (e) { alert("שגיאה בהוספה"); }
    finally { setLoading(false); }
  };

  // מחיקת מוצר
  const deleteProduct = async (id: string) => {
    if (confirm("בטוח שברצונך למחוק?")) {
      await deleteDoc(doc(db, "products", id));
      loadProducts();
    }
  };

  return (
    <main dir="rtl" style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#075E54' }}>לוח בקרה - סבן 94</h1>

      {/* קישורים מהירים לניהול לוגיסטי */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <a href="https://saban94.sharepoint.com/lists/InventoryManagement" target="_blank" style={linkBtn}>ניהול מלאי ב-SharePoint</a>
        <a href="https://make.powerautomate.com/" target="_blank" style={linkBtn}>ניהול אוטומציות (Flow)</a>
      </div>

      <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '15px' }}>
        <h3>הוספת מוצר חדש לקטלוג</h3>
        <input type="text" placeholder="שם המוצר (למשל: מכולה 8 קוב)" style={iS} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <select style={iS} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
          <option value="product">חומר בניין (רגיל)</option>
          <option value="container">מכולה (שירות הצבה/החלפה)</option>
        </select>
        <button onClick={addProduct} disabled={loading} style={btnS}>
          {loading ? "מוסיף..." : "הוסף מוצר"}
        </button>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>מוצרים קיימים בקטלוג:</h3>
        {products.map(p => (
          <div key={p.id} style={cardS}>
            <span>{p.name} ({p.type === 'container' ? 'מכולה' : 'חומר'})</span>
            <button onClick={() => deleteProduct(p.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>מחק</button>
          </div>
        ))}
      </div>
    </main>
  );
}

const iS = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' };
const btnS = { width: '100%', padding: '12px', background: '#075E54', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const linkBtn = { flex: 1, padding: '15px', background: '#25D366', color: '#fff', textAlign: 'center' as 'center', textDecoration: 'none', borderRadius: '10px', fontWeight: 'bold' };
const cardS = { display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #ddd', background: '#fff' };
