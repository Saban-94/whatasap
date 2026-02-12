'use client'
import React, { useState } from 'react';
import { strengthenBrain } from '@/lib/customerMemory';

export default function BrainBoost() {
  const [clientId, setClientId] = useState('שחר שאול');
  const [insight, setInsight] = useState('');

  const onStrengthen = async () => {
    await strengthenBrain(clientId, insight);
    alert('הידע המצטבר עודכן! מעכשיו גימיני יזכור זאת בשיחות עם שחר.');
    setInsight('');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white rounded-xl shadow-sm border mt-10">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">💪 חיזוק המוח של ח. סבן</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">בחר לקוח:</label>
          <input value={clientId} onChange={e => setClientId(e.target.value)} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ידע חדש ללימוד (Insight):</label>
          <textarea 
            value={insight} 
            onChange={e => setInsight(e.target.value)} 
            className="w-full h-32 p-2 border rounded"
            placeholder="לדוגמה: שחר מעדיף מכולה 8 קוב בלבד לפרויקט ברמת גן עקב רחוב צר."
          />
        </div>

        <button 
          onClick={onStrengthen}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
        >
          למד את גימיני (Update Brain)
        </button>
      </div>
    </div>
  );
}
