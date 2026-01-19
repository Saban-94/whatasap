'use client';

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

// הגדרת הדף כ-Default Export הכרחית למניעת 404
export default function InsightsPage() {
  const [analyzedDrivers, setAnalyzedDrivers] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState({ loss: 0, count: 0 });

  useEffect(() => {
    // טעינת ספריית הפענוח
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
        if (!XLSX) return alert("המערכת טוענת רכיבים, נסה שוב");

        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        await processData(jsonData);
      } catch (err) {
        alert("שגיאה בניתוח הקובץ");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processData = async (rows: any[][]) => {
    const rulesSnap = await getDocs(collection(db, "business_rules"));
    const rules = rulesSnap.docs.map(d => d.data());
    const driverMap: any = {};
    let totalLoss = 0;

    rows.forEach((row, idx) => {
      if (idx < 8 || !row[1]) return;
      const [time, driver, , , duration, , address, , status] = row;
      const durInt = parseFloat(duration) || 0;

      if (!driverMap[driver]) driverMap[driver] = { name: driver, loss: 0, alerts: 0 };

      const rule = rules.find(r => address?.includes(r.item)) || { maxTime: 30 };
      if ((status?.includes('עצירה') || status?.includes('PTO')) && durInt > rule.maxTime) {
        const loss = (durInt - rule.maxTime) * 7.5;
        driverMap[driver].loss += loss;
        driverMap[driver].alerts++;
        totalLoss += loss;
      }
    });

    setAnalyzedDrivers(Object.values(driverMap));
    setSummary({ loss: totalLoss, count: Object.keys(driverMap).length });
  };

  return (
    <div dir="rtl" style={{ padding: '30px', fontFamily: 'system-ui', background: '#f0f2f5', minHeight: '100vh' }}>
      <header style={{ background: '#075E54', color: '#fff', padding: '25px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0 }}>המוח של סבן - Insights</h1>
          <p style={{ margin: 0, opacity: 0.8 }}>ניתוח חריגות והפסדים כספיים</p>
        </div>
        <label style={{ background: '#2ecc71', color: '#fff', padding: '12px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
          {isProcessing ? 'מעבד...' : 'טען דוח איתורן'}
          <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <small>סה"כ נזק משוער (זמן המתנה)</small>
          <h2 style={{ color: '#e74c3c', fontSize: '2.5rem', margin: '10px 0' }}>₪{summary.loss.toFixed(0)}</h2>
        </div>
        <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <small>נהגים מנותחים</small>
          <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>{summary.count}</h2>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f3f5', color: '#95a5a6' }}>
              <th style={{ padding: '15px' }}>נהג</th>
              <th>מספר חריגות</th>
              <th>הפסד כספי</th>
              <th>סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {analyzedDrivers.map(d => (
              <tr key={d.name} style={{ borderBottom: '1px solid #f8f9fa' }}>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>🚚 {d.name}</td>
                <td>{d.alerts} אירועים</td>
                <td style={{ color: '#c0392b', fontWeight: 'bold' }}>₪{d.loss.toFixed(0)}</td>
                <td>
                  <span style={{ background: d.loss > 300 ? '#ffebee' : '#e8f5e9', color: d.loss > 300 ? '#c62828' : '#2e7d32', padding: '5px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                    {d.loss > 300 ? 'דורש בירור' : 'תקין'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
