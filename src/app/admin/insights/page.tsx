'use client';

import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Saban94Insights() {
  const [analyzedDrivers, setAnalyzedDrivers] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalStats, setGlobalStats] = useState({ loss: 0, anomalies: 0, drivers: 0 });

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
        await runDeepAnalysis(jsonData);
      } catch (err) {
        alert("שגיאה בניתוח הקובץ");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const runDeepAnalysis = async (rows: any[][]) => {
    const rulesSnap = await getDocs(collection(db, "business_rules"));
    const rules = rulesSnap.docs.map(d => d.data());

    // זיכרון ה-AI: הצלבת כתובות מה-PDF שסרקנו
    const addressMemory: any = {
      "ישעיהו": "נישה אדריכלות נוף",
      "החרש": "נישה אדריכלות נוף",
      "התלמיד": "זבולון-עדיר",
      "סמטת הגן": "בועז נחשוני",
      "השומרון": "לקוח אבן יהודה",
      "קקטוס": "לקוח אבן יהודה"
    };

    const driverMap: any = {};
    let totalLoss = 0;
    let totalAnoms = 0;

    rows.forEach((row, index) => {
      if (index < 8 || !row[1]) return;
      const [time, driverName, , , duration, , address, , status] = row;
      const durInt = parseFloat(duration) || 0;

      if (!driverMap[driverName]) {
        driverMap[driverName] = { name: driverName, events: [], loss: 0, score: 100 };
      }

      // הצלבת לקוח מהזיכרון
      const matchedKey = Object.keys(addressMemory).find(k => address?.includes(k));
      const clientName = matchedKey ? addressMemory[matchedKey] : "כתובת לא מזוהה";

      const rule = rules.find(r => address?.includes(r.item)) || { maxTime: 30 };
      const isAnomaly = (status?.includes('עצירה') || status?.includes('PTO')) && durInt > rule.maxTime;

      if (isAnomaly) {
        const excess = durInt - rule.maxTime;
        const lossAmount = excess * 7.5;
        driverMap[driverName].loss += lossAmount;
        totalLoss += lossAmount;
        totalAnoms++;
      }

      // צמצום שורות לאירועים (Aggregation)
      const lastEvent = driverMap[driverName].events[driverMap[driverName].events.length - 1];
      if (!lastEvent || lastEvent.status !== status || lastEvent.address !== address) {
        driverMap[driverName].events.push({ time, address, status, duration: durInt, isAnomaly, clientName });
      } else {
        lastEvent.duration += durInt;
      }
    });

    setAnalyzedDrivers(Object.values(driverMap));
    setGlobalStats({ loss: totalLoss, anomalies: totalAnoms, drivers: Object.keys(driverMap).length });
  };

  return (
    <main dir="rtl" style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={{margin:0, fontSize:'1.8rem', fontWeight:900}}>SABAN <span style={{color:'#2ecc71'}}>LOGISTICS</span> INSIGHTS</h1>
          <p style={{margin:0, opacity:0.7}}>מערכת הצלבה חכמה: איתורן vs תעודות משלוח</p>
        </div>
        <label style={uploadBtn}>
          {isProcessing ? 'מעבד נתונים...' : '📂 טען דוח לניתוח הצלבה'}
          <input type="file" onChange={handleFileUpload} style={{display:'none'}} />
        </label>
      </header>

      <div style={statsGrid}>
        <div style={statCard}>
          <small>הפסד זמן מצטבר (₪)</small>
          <h2 style={{color:'#e74c3c', margin:'10px 0'}}>₪{globalStats.loss.toFixed(0)}</h2>
          <div style={trend}>מבוסס על חריגות פריקה</div>
        </div>
        <div style={statCard}>
          <small>חריגות שזוהו</small>
          <h2 style={{margin:'10px 0'}}>{globalStats.anomalies}</h2>
          <div style={trend}>אירועי המתנה מעל 30 דק'</div>
        </div>
      </div>

      <section style={mainContent}>
        <table style={table}>
          <thead>
            <tr style={thRow}>
              <th>נהג</th>
              <th>לקוח מזוהה</th>
              <th>חריגה אחרונה</th>
              <th>נזק כספי</th>
              <th>סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {analyzedDrivers.map(d => (
              <tr key={d.name} style={tr}>
                <td style={{fontWeight:'bold'}}>🚚 {d.name}</td>
                <td>{d.events.find((e:any)=>e.isAnomaly)?.clientName || "תקין"}</td>
                <td>{d.events.find((e:any)=>e.isAnomaly)?.duration.toFixed(0) || 0} דק'</td>
                <td style={{color: d.loss > 0 ? '#e74c3c' : '#2ecc71', fontWeight:900}}>₪{d.loss.toFixed(0)}</td>
                <td>
                  <span style={badge(d.loss)}>{d.loss > 300 ? 'בדיקת חיוב ⚠️' : 'יעיל ✅'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

// --- Styles ---
const pageStyle: any = { background: '#f4f7f6', minHeight: '100vh', padding: '40px', fontFamily: 'system-ui' };
const headerStyle: any = { background: '#075E54', color: '#fff', padding: '30px 40px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' };
const uploadBtn = { background: '#fff', color: '#075E54', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const statsGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' };
const statCard = { background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', textAlign: 'center' as 'center' };
const trend = { fontSize: '11px', color: '#95a5a6' };
const mainContent = { background: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' };
const table = { width: '100%', borderCollapse: 'collapse' as 'collapse', textAlign: 'right' as 'right' };
const thRow = { borderBottom: '2px solid #f1f3f5', color: '#95a5a6', fontSize: '13px' };
const tr = { borderBottom: '1px solid #f8f9fa', height: '60px' };
const badge = (loss: number) => ({
  background: loss > 300 ? '#ffebee' : '#e8f5e9',
  color: loss > 300 ? '#c62828' : '#2e7d32',
  padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold'
});
