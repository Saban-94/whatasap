'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase'; 
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

export default function RulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [newRule, setNewRule] = useState({ item: '', required: '' });

  const fetchRules = async () => {
    const q = query(collection(db, "business_rules"), orderBy("item", "asc"));
    const querySnapshot = await getDocs(q);
    setRules(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { fetchRules(); }, []);

  const handleAdd = async () => {
    if (!newRule.item || !newRule.required) return;
    await addDoc(collection(db, "business_rules"), newRule);
    setNewRule({ item: '', required: '' });
    fetchRules();
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-50 min-h-screen rtl" dir="rtl">
      <div className="bg-white rounded-[30px] shadow-2xl p-6 border-t-8 border-blue-600">
        <h1 className="text-2xl font-black text-blue-900 mb-6 text-center">🧠 המוח של סבן</h1>
        
        <div className="space-y-4 mb-8">
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-600 mr-2">פריט בתעודה:</label>
            <input className="w-full p-3 rounded-2xl border bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" 
                   placeholder="למשל: טיט שק גדול" 
                   value={newRule.item} onChange={e => setNewRule({...newRule, item: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-600 mr-2">מה חייב להתווסף (פיקדון):</label>
            <input className="w-full p-3 rounded-2xl border bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" 
                   placeholder="למשל: פיקדון בלה" 
                   value={newRule.required} onChange={e => setNewRule({...newRule, required: e.target.value})} />
          </div>
          <button onClick={handleAdd} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95">
            שמור חוק בזיכרון 💾
          </button>
        </div>

        <div className="space-y-3">
          <h2 className="font-bold text-gray-700 mr-2">חוקים פעילים:</h2>
          {rules.length === 0 ? <p className="text-center text-gray-400 text-sm italic">אין חוקים מוגדרים עדיין</p> : null}
          {rules.map(rule => (
            <div key={rule.id} className="flex justify-between items-center bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
              <span className="text-sm font-medium">{rule.item} ⬅️ {rule.required}</span>
              <button onClick={async () => { await deleteDoc(doc(db, "business_rules", rule.id)); fetchRules(); }} 
                      className="text-red-500 text-xs font-bold hover:underline">מחק</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
