'use client';

import { useState } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import * as XLSX from 'xlsx';

export default function SabanBrainAnalysis() {
  const [analyzedDrivers, setAnalyzedDrivers] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // פונקציה לקריאת אקסל ללא ג'יבריש
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        await processLogistics(jsonData);
      } catch (err) {
        alert("שגיאה בפענוח הקובץ - וודא שזה אקסל תקין");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processLogistics = async (rows: any[][]) => {
    const rulesSnap = await getDocs(collection(db, "business_rules"));
    const rules = rulesSnap.docs.map(d => d.data());

    const driverMap: any = {};

    rows.forEach((row, index) => {
      if (index === 0 || !row[0]) return; // דילוג על כותרות

      const vId = row[0]?.toString(); // מספר משאית
      const time = row[1]?.toString(); // שעת פעילות
      const location = row[2]?.toString(); // מיקום
      const duration = parseInt(row[4]) || 0; // זמן מנוף PTO

      if (!driverMap[vId]) {
        driverMap[vId] = { id: vId, logs: [], efficiency: 100, loss: 0 };
      }

      const rule = rules.find(r => location.includes(r.item));
      const limit = rule?.maxTime || 30;
      const isAnomaly = duration > limit;

      if (isAnomaly) {
        driverMap[vId].efficiency -= 12;
        driverMap[vId].loss += (duration - limit) * 8.5; // חישוב הפסד משוער
      }

      driverMap[vId].logs.push({ time, location, duration, isAnomaly });
    });

    setAnalyzedDrivers(Object.values(driverMap));
  };

  return (
    <main dir="rtl" style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>SABAN <span style={{color:'#25D366'}}>LOGISTICS</span> BRAIN</h1>
          <p style={{color:'#666', margin:0}}>ניתוח חריגות והצלבת נתוני איתורן בזמן אמת</p>
        </div>
        <label style={uploadBtn}>
          {isProcessing ? 'מעבד נתונים...' : '📂 העלה דוח אקסל'}
          <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={{display:'none'}} />
        </label>
      </header>

      <div style={gridStyle}>
        {analyzedDrivers.map(driver => (
          <div key={driver.id} style={driverCard}>
            <div style={cardTop}>
              <h2 style={{margin:0, fontSize:'1.4rem'}}>🚚 משאית: {driver.id}</h2>
              <div style={scoreStyle(driver.efficiency)}>
                יעילות: {driver.efficiency < 0 ? 0 : driver.efficiency}%
              </div>
            </div>

            <div style={statsRow}>
              <div style={statBox}>
                <small>הפסד כספי משוער</small>
                <div style={{color: driver.loss > 0 ? '#d32f2f' : '#2ecc71', fontWeight:'900', fontSize:'1.3rem'}}>
                   ₪{driver.loss.toFixed(0)}
                </div>
              </div>
              <div style={statBox}>
                <small>סטטוס ביצוע</small>
                <div style={{fontWeight:'bold'}}>{driver.efficiency > 75 ? '🟢 תקין' : '🔴 חריג'}</div>
              </div>
            </div>

            <div style={logTable}>
              {driver.logs.map((log: any, i: number) => (
                <div key={i} style={rowStyle(log.isAnomaly)}>
                  <span style={timeStyle}>{log.time}</span>
                  <span style={{flex:1}}>{log.location}</span>
                  <span style={{fontWeight:'700'}}>{log.duration} דק'</span>
                </div>
              ))}
            </div>

            <button style={waBtn} onClick={() => window.open(`https://wa.me/97250XXXXXXX?text=דוח חריגות משאית ${driver.id}`)}>
              דווח חריגות לראמי
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

// --- Styles ---
const pageStyle: any = { background: '#f0f2f5', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Heebo', sans-serif" };
const headerStyle: any = { background: '#fff', padding: '25px 40px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '40px' };
const titleStyle: any = { margin: 0, fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-1px' };
const uploadBtn: any = { background: '#075E54', color: '#fff', padding: '15px 30px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: '0.3s' };

const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '30px' };
const driverCard: any = { background: '#fff', borderRadius: '25px', padding: '30px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', border: '1px solid #eef0f2' };
const cardTop = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const scoreStyle = (s: number) => ({ background: s > 75 ? '#e8f5e9' : '#ffebee', color: s > 75 ? '#2e7d32' : '#d32f2f', padding: '8px 15px', borderRadius: '12px', fontWeight: 'bold' });

const statsRow = { display: 'flex', gap: '15px', marginBottom: '25px' };
const statBox = { flex: 1, background: '#f8fafc', padding: '15px', borderRadius: '15px', textAlign: 'center' as 'center', border: '1px solid #f1f5f9' };

const logTable = { maxHeight: '200px', overflowY: 'auto' as 'auto', borderRadius: '15px', border: '1px solid #f1f5f9', padding: '10px' };
const rowStyle = (anomaly: boolean) => ({ display: 'flex', gap: '10px', padding: '12px', borderRadius: '10px', marginBottom: '5px', background: anomaly ? '#fff5f5' : 'transparent', color: anomaly ? '#d32f2f' : '#475569', fontSize: '14px' });
const timeStyle = { fontSize: '12px', color: '#94a3b8', width: '60px' };
const waBtn: any = { width: '100%', marginTop: '25px', padding: '15px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' };
