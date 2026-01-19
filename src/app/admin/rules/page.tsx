'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";

export default function BusinessRules() {
  const [rules, setRules] = useState<any[]>([]);
  const [newRule, setNewRule] = useState({ item: '', required: '', maxTime: '' });
  const [loading, setLoading] = useState(true);

  const fetchRules = async () => {
    try {
      const snap = await getDocs(collection(db, "business_rules"));
      setRules(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Error fetching rules:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

const addRule = async () => {
  if (!newRule.item || !newRule.required) return alert("נא למלא את כל השדות");
  
  try {
    console.log("🚀 מנסה לשלוח ל-Firebase:", newRule);
    
    // הוספת Timeout כדי שלא יחכה לנצח
    const docRef = await addDoc(collection(db, "business_rules"), newRule);
    
    console.log("✅ נשמר בהצלחה! ID:", docRef.id);
    setNewRule({ item: '', required: '', maxTime: '' });
    await fetchRules(); // ריענון הרשימה
    alert("החוק נוסף בהצלחה!");
    
  } catch (e: any) {
    console.error("❌ שגיאת Firebase מפורטת:", e);
    alert("שגיאה בשמירה: " + e.message);
  }
};

  const deleteRule = async (id: string) => {
    await deleteDoc(doc(db, "business_rules", id));
    fetchRules();
  };

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>טוען חוקי עסק...</div>;

  return (
    <main dir="rtl" style={containerStyle}>
      <header style={headerStyle}>
        <h2>🧠 הגדרות המוח של סבן</h2>
        <p>כאן מגדירים ל-Gemini מה נחשב חריגה</p>
      </header>

      <section style={cardStyle}>
        <h3>הוספת חוק לוגיסטי חדש</h3>
        <div style={formStyle}>
          <input 
            style={iS} 
            placeholder="שם המוצר (למשל: חול / מכולה)" 
            value={newRule.item} 
            onChange={e => setNewRule({...newRule, item: e.target.value})} 
          />
          <input 
            style={iS} 
            placeholder="ציוד חובה (למשל: מנוף 15)" 
            value={newRule.required} 
            onChange={e => setNewRule({...newRule, required: e.target.value})} 
          />
          <input 
            style={iS} 
            placeholder="זמן פריקה מקסימלי (בדקות)" 
            type="number"
            value={newRule.maxTime} 
            onChange={e => setNewRule({...newRule, maxTime: e.target.value})} 
          />
          <button 
            style={addBtnStyle} 
            onClick={addRule}
          >
            הוסף חוק למערכת
          </button>
        </div>
      </section>

      <section style={{marginTop: '20px'}}>
        <h3>חוקים פעילים</h3>
        {rules.map(r => (
          <div key={r.id} style={ruleRow}>
            <span><b>{r.item}</b> מחייב <b>{r.required}</b> (עד {r.maxTime} דק')</span>
            <button onClick={() => deleteRule(r.id)} style={delBtn}>מחק</button>
          </div>
        ))}
      </section>
    </main>
  );
}

// Styles
const containerStyle: any = { padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'sans-serif' };
const headerStyle: any = { textAlign: 'center', marginBottom: '20px', color: '#075E54' };
const cardStyle: any = { background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
const formStyle = { display: 'flex', flexDirection: 'column' as 'column', gap: '10px' };
const iS = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd' };
const addBtnStyle = { 
  padding: '15px', background: '#075E54', color: '#fff', border: 'none', 
  borderRadius: '8px', fontWeight: 'bold' as 'bold', cursor: 'pointer',
  position: 'relative' as 'relative', zIndex: 10, pointerEvents: 'auto' as 'auto'
};
const ruleRow = { 
  display: 'flex', justifyContent: 'space-between', background: '#fff', 
  padding: '15px', borderRadius: '10px', marginBottom: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' 
};
const delBtn = { background: 'none', border: 'none', color: 'red', cursor: 'pointer' };
