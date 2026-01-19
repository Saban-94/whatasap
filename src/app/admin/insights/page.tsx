'use client';

import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function SabanHistoricalInsights() {
  const [analyzedData, setAnalyzedData] = useState<any[]>([]);
  const [totalLoss, setTotalLoss] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // טעינת ספריות חיצוניות (XLSX לניתוח ו-Chart.js לויזואליה)
  useEffect(() => {
    const scripts = [
      "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js",
      "https://cdn.jsdelivr.net/npm/chart.js"
    ];
    scripts.forEach(src => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      document.body.appendChild(s);
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
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[][] = window.XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      await performDeepAnalysis(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const performDeepAnalysis = async (rows: any[][]) => {
    const rulesSnap = await getDocs(collection(db, "business_rules"));
    const rules = rulesSnap.docs.map(d => d.data());
    
    const driverStats: any = {};
    let dailyLoss = 0;

    rows.forEach((row, index) => {
      if (index < 8 || !row[1]) return;
      const [time, vId, , , duration, , address, , status] = row;
      
      if (!driverStats[vId]) {
        driverStats[vId] = { name: vId, totalTime: 0, anomalies: 0, loss: 0, stops: [] };
      }

      const durInt = parseFloat(duration) || 0;
      const rule = rules.find(r => address?.includes(r.item)) || { maxTime: 30 };
      
      if (durInt > rule.maxTime && (status?.includes('עצירה') || status?.includes('PTO'))) {
        const excess = durInt - rule.maxTime;
        const lossAmount = excess * 7.5;
        driverStats[vId].loss += lossAmount;
        driverStats[vId].anomalies++;
        dailyLoss += lossAmount;
      }
      
      driverStats[vId].totalTime += durInt;
    });

    setAnalyzedData(Object.values(driverStats));
    setTotalLoss(dailyLoss);
    setIsProcessing(false);
  };

  return (
    <main dir="rtl" style={pageStyle}>
      {/* Top Navigation Bar */}
      <nav style={topNav}>
        <div style={logo}>SABAN 94 <span style={badge}>INSIGHTS</span></div>
        <label style={uploadAction}>
          {isProcessing ? 'מעבד נתונים...' : '➕ טען דוח היסטורי לניתוח'}
          <input type="file" onChange={handleFileUpload} style={{display:'none'}} />
        </label>
      </nav>

      <div style={contentGrid}>
        {/* Sidebar: Summary Stats */}
        <aside style={sidebar}>
          <div style={statCard}>
            <small>סה"כ הפסד זמן (מחושב)</small>
            <h1 style={{color:'#e74c3c', margin:'10px 0'}}>₪{totalLoss.toFixed(0)}</h1>
            <p style={{fontSize:'12px', opacity:0.6}}>מבוסס על חריגות מעל 30 דק'</p>
          </div>
          
          <div style={statCard}>
            <small>נהג הכי פחות יעיל היום</small>
            <h2 style={{margin:'10px 0'}}>{analyzedData.sort((a,b)=>b.loss-a.loss)[0]?.name || '-'}</h2>
          </div>
        </aside>

        {/* Main Content: Driver Leaderboard */}
        <section style={mainArea}>
          <div style={headerRow}>
            <h2>ניתוח ביצועי נהגים - היסטוריה</h2>
            <div style={dateRange}>18/01/2026 - היום</div>
          </div>

          <div style={tableCard}>
            <table style={table}>
              <thead>
                <tr style={thRow}>
                  <th>נהג / משאית</th>
                  <th>חריגות פריקה</th>
                  <th>זמן המתנה מצטבר</th>
                  <th>נזק כספי משוער</th>
                  <th>ציון Gemini</th>
                </tr>
              </thead>
              <tbody>
                {analyzedData.map(driver => (
                  <tr key={driver.name} style={trStyle}>
                    <td style={{fontWeight:'bold'}}>🚚 {driver.name}</td>
                    <td style={{color:'#e67e22'}}>{driver.anomalies} אירועים</td>
                    <td>{driver.totalTime.toFixed(0)} דקות</td>
                    <td style={{color:'#c0392b', fontWeight:'900'}}>₪{driver.loss.toFixed(0)}</td>
                    <td>
                      <div style={rank(driver.loss)}>
                        {driver.loss > 500 ? '🔴 חלש' : driver.loss > 200 ? '🟡 בינוני' : '🟢 מצוין'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {analyzedData.length === 0 && <div style={empty}>אין נתונים להצגה. אנא טען קובץ אקסל.</div>}
          </div>
        </section>
      </div>
    </main>
  );
}

// --- Styles (Modern Dark & Light Hybrid) ---
const pageStyle: any = { background: '#f4f7f6', minHeight: '100vh', fontFamily: 'system-ui' };
const topNav = { background: '#075E54', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' };
const logo = { fontSize: '1.5rem', fontWeight: '900' };
const badge = { background: '#2ecc71', padding: '2px 8px', borderRadius: '5px', fontSize: '12px', verticalAlign: 'middle' };
const uploadAction = { background: '#fff', color: '#075E54', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };

const contentGrid = { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px', padding: '40px' };
const sidebar = { display: 'flex', flexDirection: 'column' as 'column', gap: '20px' };
const statCard = { background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' };

const mainArea = { background: '#fff', borderRadius: '25px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' };
const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const dateRange = { background: '#f1f3f5', padding: '8px 15px', borderRadius: '10px', fontSize: '13px', color: '#666' };

const tableCard = { overflowX: 'auto' as 'auto' };
const table = { width: '100%', borderCollapse: 'collapse' as 'collapse' };
const thRow = { textAlign: 'right' as 'right', borderBottom: '2px solid #f1f3f5', color: '#95a5a6', fontSize: '14px' };
const trStyle = { borderBottom: '1px solid #f8f9fa', transition: '0.2s' };
const empty = { textAlign: 'center' as 'center', padding: '100px', color: '#ccc' };

const rank = (loss: number) => ({
  background: loss > 500 ? '#ffebee' : loss > 200 ? '#fff3e0' : '#e8f5e9',
  color: loss > 500 ? '#c62828' : loss > 200 ? '#ef6c00' : '#2e7d32',
  padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block'
});
