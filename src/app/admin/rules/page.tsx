'use client';
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function RulesManager() {
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({ item: '', required: '', ratio: 1 });

  // משיכת החוקים מהמוח (Firebase)
  const fetchRules = async () => {
    const querySnapshot = await getDocs(collection(db, "business_rules"));
    setRules(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => { fetchRules(); }, []);

  const saveRule = async () => {
    await addDoc(collection(db, "business_rules"), newRule);
    setNewRule({ item: '', required: '', ratio: 1 });
    fetchRules();
  };

  return (
    <div dir="rtl" className="p-6 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">🧠 ניהול חוקי המוח - ח.סבן</h1>
      
      {/* טופס הוספת חוק */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-blue-100">
        <h2 className="font-semibold mb-3">הוסף חוק חדש (למשל: על כל שק גדול -> חובה בלה)</h2>
        <div className="grid grid-cols-1 gap-3">
          <input className="border p-2 rounded" placeholder="שם הפריט (למשל: טיט שק גדול)" 
                 value={newRule.item} onChange={e => setNewRule({...newRule, item: e.target.value})} />
          <input className="border p-2 rounded" placeholder="מה חייב להתווסף (למשל: פיקדון בלה)" 
                 value={newRule.required} onChange={e => setNewRule({...newRule, required: e.target.value})} />
          <button onClick={saveRule} className="bg-blue-600 text-white p-2 rounded-lg font-bold">שמור חוק בזיכרון 💾</button>
        </div>
      </div>

      {/* רשימת חוקים קיימת */}
      <div className="space-y-3">
        {rules.map(rule => (
          <div key={rule.id} className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center border-r-4 border-blue-500">
            <div>
              <span className="font-bold text-blue-700">{rule.item}</span> ⬅️ {rule.required}
            </div>
            <button onClick={async () => { await deleteDoc(doc(db, "business_rules", rule.id)); fetchRules(); }} 
                    className="text-red-500 text-sm">מחק</button>
          </div>
        ))}
      </div>
    </div>
  );
}
