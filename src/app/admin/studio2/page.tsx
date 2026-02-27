'use client';
import React, { useState } from 'react';
import customerHistory from '@/data/customer_history.json';
import { Brain, Users, TrendingUp, Database, Save } from 'lucide-react';

export default function SabanAIStudio() {
  const [history] = useState(customerHistory);

  return (
    <div className="p-8 bg-[#0b141a] min-h-screen text-white font-sans" dir="rtl">
      <header className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-black text-[#00a884] flex items-center gap-3">
          <Brain size={32} /> SABAN AI STUDIO
        </h1>
        <button className="bg-[#00a884] px-6 py-2 rounded-full font-bold flex items-center gap-2">
          <Save size={20} /> שמור חוקים וזיכרון
        </button>
      </header>

      {/* KPIs מבוססי היסטוריית ווטסאפ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#111b21] p-5 rounded-xl border-r-4 border-blue-500">
          <Users className="text-blue-500 mb-2" />
          <p className="text-3xl font-black">{history.length}</p>
          <p className="text-xs text-gray-400">לקוחות מזוהים מהגיבוי</p>
        </div>
        <div className="bg-[#111b21] p-5 rounded-xl border-r-4 border-green-500">
          <TrendingUp className="text-green-500 mb-2" />
          <p className="text-3xl font-black">94%</p>
          <p className="text-xs text-gray-400">דיוק בזיהוי סלנג (NLP)</p>
        </div>
        <div className="bg-[#111b21] p-5 rounded-xl border-r-4 border-orange-500">
          <Database className="text-orange-500 mb-2" />
          <p className="text-3xl font-black">ACTIVE</p>
          <p className="text-xs text-gray-400">סנכרון אתרי עבודה פעיל</p>
        </div>
      </div>

      {/* ניהול לקוחות מההיסטוריה */}
      <div className="bg-[#111b21] rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-[#202c33] text-gray-400 text-xs uppercase">
            <tr>
              <th className="p-4">לקוח</th>
              <th className="p-4">אתרים נפוצים</th>
              <th className="p-4">הרגלי הזמנה</th>
              <th className="p-4">סטטוס אימון</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {history.map((client, i) => (
              <tr key={i} className="hover:bg-[#1a252b]">
                <td className="p-4 font-bold">{client.client_name}</td>
                <td className="p-4 text-sm text-gray-400">{client.frequent_sites[0]}</td>
                <td className="p-4 text-xs italic">{client.order_habits}</td>
                <td className="p-4">
                  <span className="bg-green-900/30 text-green-500 text-[10px] px-2 py-1 rounded">מאומן NLP</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
