'use client';

import { useState } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import * as XLSX from 'xlsx'; // חובה להתקין: npm install xlsx

export default function SabanLogicAnalyzer() {
  const [analyzedDrivers, setAnalyzedDrivers] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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

        await processData(jsonData);
      } catch (err) {
        alert("שגיאה בפענוח הקובץ. וודא שזה קובץ אקסל תקין.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processData = async (rows: any[][]) => {
    const rulesSnap = await getDocs(collection(db, "business_rules"));
    const rules = rulesSnap.docs.map(d => d.data());

    const driverStats: any = {};

    rows.forEach((row, index) => {
      if (index === 0 || !row[0]) return; // דילוג על כותרות או שורות ריקות

      // מיפוי עמודות (רכב, שעה, מיקום, זמן מנוף)
      const vId = row[0]?.toString();
      const time = row[1]?.toString();
      const location = row[2]?.toString();
      const duration = parseInt(row[4]) || 0;

      if (!driverStats[vId]) {
        driverStats[vId] = { id: vId, actions: [], score: 100, costLoss: 0 };
      }

      const rule = rules.find(r => location.includes(r.item));
      const maxAllowed = rule?.maxTime || 30;
      const isAnomaly = duration > maxAllowed;

      if (isAnomaly) {
        driverStats[vId].score -= 10;
        driverStats[vId].costLoss += (duration - maxAllowed) * 8; // חישוב הפסד משוער
      }

      driverStats[vId].actions.push({ time, location, duration, isAnomaly });
    });

    setAnalyzedDrivers(Object.values(driverStats));
  };

  return (
    <main dir="rtl" style={pageContainer}>
      <header style={headerStyle}>
        <div>
          <h1 style={{color: '#075E54', margin: 0}}>🧠 ניתוח לוגיסטי - ח. סבן</h1>
          <p style={{color: '#666'}}>הצלבת נתוני איתורן מול חוקי עסק</p>
        </div>
        <label style={uploadBtn}>
          📂 העלה דוח איתורן (Excel)
          <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} style={{display: 'none'}} />
        </label>
      </header>

      {isProcessing && <p style={{textAlign: 'center'}}>Gemini מנתח נתונים... ⏳</p>}

      <div style={gridStyle}>
        {analyzedDrivers.map(driver => (
          <div key={driver.id} style={driverCard}>
            <div style={cardHeader}>
              <h3 style={{margin: 0}}>🚚 משאית: {driver.id}</h3>
              <span style={scoreBadge(driver.score)}>יעילות: {driver.score}%</span>
            </div>

            <div style={statsRow}>
              <div style={statBox}>
                <small>הפסד משוער</small>
                <div style={{color: '#d32f2f', fontWeight: 'bold', fontSize: '1.2rem'}}>₪{driver.costLoss}</div>
              </div>
              <div style={statBox}>
                <small>סטטוס</small>
                <div style={{color: driver.score > 70 ? '#2e7d32' : '#d32f2f'}}>{driver.score > 70 ? 'רווחי' : 'חריג'}</div>
              </div>
            </div>

            <div style={logContainer}>
              {driver.actions.map((a: any, i: number) => (
                <div key={i} style={logRow(a.isAnomaly)}>
                  <span style={{fontSize: '0.8rem', color: '#888'}}>{a.time}</span>
                  <span style={{flex: 1, marginRight: '10px'}}>{a.location}</span>
                  <span style={{fontWeight: 'bold'}}>{a.duration} דק'</span>
                </div>
              ))}
            </div>

            <button style={waBtn} onClick={() => window.open(`https://wa.me/97250XXXXXXX?text=נמצאו חריגות למשאית ${driver.id}`)}>
              שלח דוח לראמי / נהג
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

// --- Styles ---
const pageContainer: any = { background: '#f4f7f6', minHeight: '100vh', padding: '30px', fontFamily: 'sans-serif' };
const headerStyle: any = { background: '#fff', padding: '25px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '30px' };
const uploadBtn: any = { background: '#075E54', color: '#fff', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' };
const driverCard: any = { background: '#fff', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const scoreBadge = (s: number) => ({ background: s > 70 ? '#e8f5e9' : '#ffebee', color: s > 70 ? '#2e7d32' : '#d32f2f', padding: '5px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem' });
const statsRow = { display: 'flex', gap: '10px', marginBottom: '15px' };
const statBox = { flex: 1, background: '#f8f9fa', padding: '10px', borderRadius: '10px', textAlign: 'center' as 'center' };
const logContainer = { maxHeight: '150px', overflowY: 'auto' as 'auto', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '5px' };
const logRow = (anomaly: boolean) => ({ display: 'flex', padding: '8px', borderRadius: '6px', marginBottom: '4px', background: anomaly ? '#fff5f5' : 'transparent', color: anomaly ? '#d32f2f' : '#333' });
const waBtn: any = { width: '100%', marginTop: '15px', padding: '12px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
