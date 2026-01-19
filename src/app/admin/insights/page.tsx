'use client';

import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function SabanLogisticsInsights() {
  const [analyzedData, setAnalyzedData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState({ loss: 0, anomalies: 0 });

  useEffect(() => {
    const scripts = ["https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"];
    scripts.forEach(src => {
      const s = document.createElement('script');
      s.src = src; s.async = true; document.body.appendChild(s);
    });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      // @ts-ignore
      const workbook = window.XLSX.read(data, { type: 'array' });
      const jsonData: any[][] = window.XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
      await analyzeHistory(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const analyzeHistory = async (rows: any[][]) => {
    const rulesSnap = await getDocs(collection(db, "business_rules"));
    const rules = rulesSnap.docs.map(d => d.data());
    const drivers: any = {};
    let totalL = 0;
    let totalA = 0;

    rows.forEach((row, idx) => {
      if (idx < 8 || !row[1]) return;
      const [time, vId, , , duration, , address, , status] = row;
      if (!drivers[vId]) drivers[vId] = { name: vId, loss: 0, anomalies: 0, events: [] };

      const dur = parseFloat(duration) || 0;
      const rule = rules.find(r => address?.includes(r.item)) || { maxTime: 30 };
      const isAnom = (status?.includes('עצירה') || status?.includes('PTO')) && dur > rule.maxTime;

      if (isAnom) {
        const loss = (dur - rule.maxTime) * 7.5;
        drivers[vId].loss += loss;
        drivers[vId].anomalies++;
        totalL += loss;
        totalA++;
      }
    });

    setAnalyzedData(Object.values(drivers));
    setSummary({ loss: totalL, anomalies: totalA });
    setIsProcessing(false);
  };

  return (
    <main dir="rtl" style={s.container}>
      <header style={s.header}>
        <div>
          <h1 style={s.title}>📊 ניתוח היסטורי וביצועי נהגים</h1>
          <p>הצלבת דוחות איתורן מול חוקי ח. סבן</p>
        </div>
        <label style={s.uploadBtn}>
          {isProcessing ? 'מעבד נתונים...' : '📂 טען דוח לניתוח עומק'}
          <input type="file" onChange={handleFileUpload} style={{display:'none'}} />
        </label>
      </header>

      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <small>סה"כ הפסד זמן היום</small>
          <h2 style={{color:'#e74c3c'}}>₪{summary.loss.toFixed(0)}</h2>
        </div>
        <div style={s.statCard}>
          <small>חריגות פריקה שזוהו</small>
          <h2>{summary.anomalies} אירועים</h2>
        </div>
      </div>

      <section style={s.tableCard}>
        <table style={s.table}>
          <thead>
            <tr style={s.thRow}>
              <th>נהג</th>
              <th>חריגות</th>
              <th>נזק כספי</th>
              <th>סטטוס Gemini</th>
            </tr>
          </thead>
          <tbody>
            {analyzedData.map(d => (
              <tr key={d.name} style={s.tr}>
                <td style={{fontWeight:'bold'}}>🚚 {d.name}</td>
                <td>{d.anomalies} חריגות</td>
                <td style={{color:'#c0392b', fontWeight:'900'}}>₪{d.loss.toFixed(0)}</td>
                <td><span style={s.badge(d.loss)}>{d.loss > 300 ? '🔴 דורש שיפור' : '🟢 יעיל'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

const s: any = {
  container: { background: '#f8f9fa', minHeight: '100vh', padding: '40px', fontFamily: 'system-ui' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  title: { margin: 0, color: '#075E54' },
  uploadBtn: { background: '#075E54', color: '#fff', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' },
  statCard: { background: '#fff', padding: '25px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' },
  tableCard: { background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { textAlign: 'right', borderBottom: '2px solid #f1f3f5', color: '#999', fontSize: '14px' },
  tr: { borderBottom: '1px solid #f8f9fa' },
  badge: (loss: number) => ({ background: loss > 300 ? '#ffebee' : '#e8f5e9', color: loss > 300 ? '#c62828' : '#2e7d32', padding: '5px 12px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' })
};
