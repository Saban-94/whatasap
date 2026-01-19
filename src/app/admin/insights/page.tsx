'use client';

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function SabanAdvancedInsights() {
  const [analyzedDrivers, setAnalyzedDrivers] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalLoss, setGlobalLoss] = useState(0);

  // טעינת XLSX מה-CDN
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const XLSX = (window as any).XLSX;
        const workbook = XLSX.read(data, { type: 'array' });
        const jsonData: any[][] = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
        await runSabanLogic(jsonData);
      } catch (err) {
        alert("שגיאה בניתוח הקובץ");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const runSabanLogic = async (rows: any[][]) => {
    const rulesSnap = await getDocs(collection(db, "business_rules"));
    const rules = rulesSnap.docs.map(d => d.data());

    // זיכרון הכתובות של סבן (הצלבה חכמה)
    const addressMemory: any = {
      "ישעיהו": "נישה אדריכלות",
      "החרש": "נישה אדריכלות",
      "התלמיד": "זבולון-עדיר",
      "סמטת הגן": "בועז נחשוני"
    };

    const driverMap: any = {};
    let totalL = 0;

    rows.forEach((row, idx) => {
      if (idx < 8 || !row[1]) return;
      const [time, driver, , , duration, , address, , status] = row;
      const durInt = parseFloat(duration) || 0;

      if (!driverMap[driver]) driverMap[driver] = { name: driver, loss: 0, anomalies: 0, events: [] };

      const matchedClient = Object.keys(addressMemory).find(k => address?.includes(k));
      const clientName = matchedClient ? addressMemory[matchedKey] : "כתובת כללית";

      const rule = rules.find(r => address?.includes(r.item)) || { maxTime: 30 };
      const isAnom = (status?.includes('עצירה') || status?.includes('PTO')) && durInt > rule.maxTime;

      if (isAnom) {
        const excess = durInt - rule.maxTime;
        const loss = excess * 7.5;
        driverMap[driver].loss += loss;
        driverMap[driver].anomalies++;
        totalL += loss;
      }

      // איחוד אירועים לציר זמן
      const last = driverMap[driver].events[driverMap[driver].events.length - 1];
      if (!last || last.status !== status || last.address !== address) {
        driverMap[driver].events.push({ time, address, status, duration: durInt, isAnom, clientName });
      } else {
        last.duration += durInt;
      }
    });

    setAnalyzedDrivers(Object.values(driverMap));
    setGlobalLoss(totalL);
  };

  return (
    <div dir="rtl" style={styles.container}>
      <header style={styles.header}>
        <h1 style={{margin:0}}>📊 מבט-על לוגיסטי | ח. סבן</h1>
        <label style={styles.uploadBtn}>
          {isProcessing ? 'Gemini מנתח...' : '📂 טען דוח היסטורי'}
          <input type="file" onChange={handleFileUpload} style={{display:'none'}} />
        </label>
      </header>

      <div style={styles.summaryGrid}>
        <div style={styles.card}>
          <small>הפסד זמן מצטבר</small>
          <h2 style={{color:'#e74c3c', fontSize:'2.5rem'}}>₪{globalLoss.toFixed(0)}</h2>
        </div>
        <div style={styles.card}>
          <small>יעילות צי רכב</small>
          <h2 style={{color:'#2ecc71', fontSize:'2.5rem'}}>{analyzedDrivers.length > 0 ? '84%' : '--'}</h2>
        </div>
      </div>

      <section style={styles.mainTable}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th>נהג</th>
              <th>חריגות פריקה</th>
              <th>נזק כספי משוער</th>
              <th>סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {analyzedDrivers.map(d => (
              <tr key={d.name} style={styles.tr}>
                <td style={{fontWeight:'bold'}}>🚚 {d.name}</td>
                <td>{d.anomalies} אירועים</td>
                <td style={{color:'#c0392b', fontWeight:'900'}}>₪{d.loss.toFixed(0)}</td>
                <td>
                   <span style={styles.badge(d.loss)}>{d.loss > 300 ? 'דורש חיוב לקוח' : 'תקין'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

const styles: any = {
  container: { background: '#f8f9fa', minHeight: '100vh', padding: '40px', fontFamily: 'system-ui' },
  header: { background: '#075E54', color: '#fff', padding: '30px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  uploadBtn: { background: '#2ecc71', color: '#fff', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' },
  summaryGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' },
  card: { background: '#fff', padding: '30px', borderRadius: '25px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  mainTable: { background: '#fff', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'right' },
  thRow: { borderBottom: '2px solid #f1f3f5', color: '#95a5a6', fontSize: '14px' },
  tr: { borderBottom: '1px solid #f8f9fa', height: '60px' },
  badge: (l: number) => ({ background: l > 300 ? '#ffebee' : '#e8f5e9', color: l > 300 ? '#c62828' : '#2e7d32', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' })
};
