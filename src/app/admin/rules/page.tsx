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
    console.log("🔍 מנסה למשוך חוקים...");
    try {
      // הוספת מנגנון בטיחות: אם אחרי 5 שניות אין תשובה, שחרר טעינה
      const timeout = setTimeout(() => setLoading(false), 5000);
      
      const snap = await getDocs(collection(db, "business_rules"));
      clearTimeout(timeout);
      
      setRules(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("❌ שגיאת טעינה:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRules(); }, []);

  const addRule = async () => {
    if (!newRule.item || !newRule.required) return alert("נא למלא את כל השדות");
    
    try {
      console.log("🚀 שולח חוק חדש...");
      // שימוש ב-AddDoc עם טיפול בשגיאה
      await addDoc(collection(db, "business_rules"), newRule);
      
      setNewRule({ item: '', required: '', maxTime: '' });
      await fetchRules();
      alert("✅ החוק נוסף בהצלחה!");
    } catch (e: any) {
      console.error("❌ שגיאה בהוספה:", e);
      alert("שגיאת Firebase: " + e.message);
    }
  };

  if (loading) return (
    <div style={{textAlign:'center', padding:'50px'}}>
      <p>טוען חוקי עסק מול Firebase...</p>
      <button onClick={() => setLoading(false)} style={{color:'blue', textDecoration:'underline', background:'none', border:'none', cursor:'pointer'}}>
        לחיצה לשחרור טעינה ידני
      </button>
    </div>
  );

  return (
    <main dir="rtl" style={{padding:'20px', fontFamily:'sans-serif'}}>
      <h2 style={{color:'#075E54'}}>🧠 המוח של סבן - הגדרת חוקים</h2>
      
      <div style={{background:'#fff', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 10px rgba(0,0,0,0.1)'}}>
        <input style={iS} placeholder="שם המוצר" value={newRule.item} onChange={e=>setNewRule({...newRule, item:e.target.value})} />
        <input style={iS} placeholder="ציוד חובה" value={newRule.required} onChange={e=>setNewRule({...newRule, required:e.target.value})} />
        <input style={iS} placeholder="זמן מקסימלי (דקות)" type="number" value={newRule.maxTime} onChange={e=>setNewRule({...newRule, maxTime:e.target.value})} />
        <button onClick={addRule} style={btnStyle}>הוסף חוק</button>
      </div>

      <div style={{marginTop:'20px'}}>
        {rules.map(r => (
          <div key={r.id} style={{padding:'10px', borderBottom:'1px solid #ddd', display:'flex', justifyContent:'space-between'}}>
            <span>{r.item} - {r.required} ({r.maxTime} דק')</span>
          </div>
        ))}
      </div>
    </main>
  );
}

const iS = { width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'5px', border:'1px solid #ccc', boxSizing:'border-box' as 'border-box' };
const btnStyle = { width:'100%', padding:'15px', background:'#25D366', color:'#fff', border:'none', borderRadius:'5px', fontWeight:'bold' as 'bold', cursor:'pointer' };
