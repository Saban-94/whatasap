'use client';

import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function SabanLogicAnalyzer() {
  const [analyzedDrivers, setAnalyzedDrivers] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // טעינת ספריית האקסל באופן דינמי ללא טרמינל
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
        // @ts-ignore - XLSX נטען מה-CDN
        const XLSX = window.XLSX;
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        await processLogistics(jsonData);
      } catch (err) {
        console.error(err);
        alert("שגיאה בפענוח. וודא שזה קובץ אקסל תקין.");
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
      if (index === 0 || !row[0]) return;

      const vId = row[0]?.toString(); 
      const time = row[1]?.toString(); 
      const location = row[2]?.toString(); 
      const duration = parseInt(row[4]) || 0; 

      if (!driverMap[vId]) {
        driverMap[vId] = { id: vId, logs: [], score: 100, loss: 0 };
      }

      const rule = rules.find(r => location?.includes(r.item));
      const limit = rule?.maxTime || 30;
      const isAnomaly = duration > limit;

      if (isAnomaly) {
        driverMap[vId].score -= 10;
        driverMap[vId].loss += (duration - limit) * 8.5;
      }

      driverMap[vId].logs.push({ time, location, duration, isAnomaly });
    });

    setAnalyzedDrivers(Object.values(driverMap));
  };

  return (
    <main dir="rtl" style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={logoStyle}>SABAN <span style={{color:'#25D366'}}>AI</span> LOGISTICS</h1>
          <p style={{color:'#666', margin:0}}>ניתוח חריגות והצלבת נתוני איתורן (גרסת ענן)</p>
        </div>
        <label style={uploadBtn}>
          {isProcessing ? 'מעבד...' : '📂 העלאת דוח אקסל'}
          <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={{display:'none'}} />
        </label>
      </header>

      <div style={gridStyle}>
        {analyzedDrivers.map(driver => (
          <div key={driver.id} style={driverCard}>
            <div style={cardTop}>
              <h2 style={{margin:0, fontSize:'1.4rem'}}>🚚 משאית: {driver.id}</h2>
              <div style={scoreBadge(driver.score)}>יעילות: {driver.score}%</div>
            </div>

            <div style={statsBox}>
              <div style={statItem}>
                <small>הפסד משוער</small>
                <div style={lossStyle(driver.loss)}>₪{driver.loss.toFixed(0)}</div>
              </div>
              <div style={statItem}>
                <small>סטטוס</small>
                <div style={{fontWeight:'bold'}}>{driver.score > 75 ? '🟢 תקין' : '🔴 חריג'}</div>
              </div>
            </div>

            <div style={logTable}>
              {driver.logs.map((log: any, i: number) => (
                <div key={i} style={rowStyle(log.isAnomaly)}>
                  <span style={timeText}>{log.time}</span>
                  <span style={{flex:1, marginRight:'10px'}}>{log.location}</span>
                  <span style={{fontWeight:'bold'}}>{log.duration} דק'</span>
                </div>
              ))}
            </div>

            <button style={waBtn} onClick={() => window.open(`https://wa.me/97250XXXXXXX?text=נמצאו חריגות למשאית ${driver.id}`)}>
              דווח לראמי בוואטסאפ 📱
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

// --- Styles (Clean & Light) ---
const pageStyle: any = { background: '#f8f9fa', minHeight: '100vh', padding: '30px', fontFamily: 'system-ui, sans-serif' };
const headerStyle: any = { background: '#fff', padding: '25px 40px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '30px' };
const logoStyle = { margin: 0, fontWeight: 900, fontSize: '1.8rem', letterSpacing: '-1px' };
const uploadBtn: any = { background: '#075E54', color: '#fff', padding: '15px 30px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '25px' };
const driverCard: any = { background: '#fff', borderRadius: '25px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #edf2f7' };
const cardTop = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const scoreBadge = (s: number) => ({ background: s > 75 ? '#e8f5e9' : '#ffebee', color: s > 75 ? '#2e7d32' : '#d32f2f', padding: '6px 15px', borderRadius: '10px', fontWeight: 'bold' });
const statsBox = { display: 'flex', background: '#f1f3f5', borderRadius: '15px', padding: '15px', marginBottom: '20px' };
const statItem = { flex: 1, textAlign: 'center' as 'center' };
const lossStyle = (l: number) => ({ color: l > 0 ? '#d32f2f' : '#2ecc71', fontWeight: 900, fontSize: '1.4rem' });
const logTable = { maxHeight: '200px', overflowY: 'auto' as 'auto', padding: '5px' };
const rowStyle = (anom: boolean) => ({ display: 'flex', padding: '10px', borderRadius: '10px', marginBottom: '5px', background: anom ? '#fff5f5' : '#f8f9fa', color: anom ? '#d32f2f' : '#333', fontSize: '14px' });
const timeText = { fontSize: '12px', color: '#999', width: '50px' };
const waBtn: any = { width: '100%', marginTop: '20px', padding: '15px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' };
