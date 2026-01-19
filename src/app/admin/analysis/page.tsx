'use client';

import { useState } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import * as XLSX from 'xlsx'; // ספריה לקריאת אקסל

export default function SabanFinalAnalysis() {
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
        
        // לוקחים את הגיליון הראשון
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // הופכים את האקסל לרשימת אובייקטים (JSON)
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        await processData(jsonData);
      } catch (err) {
        console.error("Error reading Excel:", err);
        alert("שגיאה בקריאת הקובץ. וודא שזה קובץ אקסל תקין.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const processData = async (rows: any[]) => {
    const rulesSnap = await getDocs(collection(db, "business_rules"));
    const rules = rulesSnap.docs.map(d => d.data());

    const driverStats: any = {};

    rows.forEach((row, index) => {
      if (index === 0) return; // דילוג על כותרות

      // מיפוי עמודות לפי דוח איתורן (נניח: [רכב, שעה, מיקום, PTO, משך])
      const [vId, time, location, ptoStatus, duration] = row;

      if (!vId || vId === "") return;

      if (!driverStats[vId]) {
        driverStats[vId] = { id: vId, actions: [], score: 100, costLoss: 0 };
      }

      const durInt = parseInt(duration) || 0;
      const rule = rules.find(r => location?.toString().includes(r.item));
      const isAnomaly = durInt > (rule?.maxTime || 30);

      if (isAnomaly) {
        driverStats[vId].score -= 10;
        driverStats[vId].costLoss += (durInt - 30) * 7.5; // חישוב הפסד לפי דקה
      }

      driverStats[vId].actions.push({
        time: time?.toString(),
        location: location?.toString(),
        durInt,
        isAnomaly,
        status: isAnomaly ? 'חריגת זמן' : 'תקין'
      });
    });

    setAnalyzedDrivers(Object.values(driverStats));
    setIsProcessing(false);
  };

  return (
    <main dir="rtl" style={containerStyle}>
      <header style={headerCard}>
        <div>
          <h1 style={{margin:0, color:'#075E54'}}>🧠 Gemini Logic - ניתוח עומק</h1>
          <p style={{color:'#666'}}>מנתח נתוני אמת: הצלבת איתורן וחוקי ח. סבן</p>
        </div>
        
        <div style={uploadContainer}>
          <label htmlFor="file-upload" style={uploadBtn}>
            {isProcessing ? 'מעבד...' : '📂 העלאת דוח איתורן (Excel)'}
          </label>
          <input id="file-upload" type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} style={{display:'none'}} />
        </div>
      </header>

      <div style={gridStyle}>
        {analyzedDrivers.map(driver => (
          <div key={driver.id} style={driverCard}>
            <div style={driverHeader}>
              <h3 style={{margin:0}}>🚚 משאית: {driver.id}</h3>
              <div style={scoreBadge(driver.score)}>יעילות: {driver.score}%</div>
            </div>

            <div style={statsBox}>
              <div style={statItem}>
                <small>הפסד משוער</small>
                <div style={{color:'#d32f2f', fontSize:'18px', fontWeight:'bold'}}>₪ {driver.costLoss.toFixed(0)}</div>
              </div>
              <div style={statItem}>
                <small>חריגות שנמצאו</small>
                <div style={{fontWeight:'bold'}}>{driver.actions.filter((a:any)=>a.isAnomaly).length}</div>
              </div>
            </div>

            <div style={logContainer}>
              {driver.actions.map((a: any, i: number) => (
                <div key={i} style={logRow(a.isAnomaly)}>
                  <span style={{fontSize:'11px'}}>{a.time}</span>
                  <span style={{flex:1, marginRight:'10px', fontWeight: a.isAnomaly ? 'bold' : 'normal'}}>{a.location}</span>
                  <span>{a.durInt} דק'</span>
                </div>
              ))}
            </div>

            <button style={reportBtn} onClick={() => window.open(`https://wa.me/97250XXXXXXX?text=נמצאו חריגות למשאית ${driver.id}`)}>
              דווח לראמי / נהג 📱
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

// (הסטייל נשאר אותו דבר כמו שביקשת בעיצוב הבהיר והנקי)
const containerStyle: any = { background: '#f8f9fa', minHeight: '100vh', padding: '30px', fontFamily: 'sans-serif' };
const headerCard: any = { background: '#fff', padding: '30px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '30px' };
const uploadContainer: any = { textAlign: 'center' };
const uploadBtn: any = { background: '#075E54', color: '#fff', padding: '15px 30px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '25px' };
const driverCard: any = { background: '#fff', borderRadius: '20px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid #edf2f7' };
const driverHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const scoreBadge = (score: number) => ({ background: score > 70 ? '#e8f5e9' : '#ffebee', color: score > 70 ? '#2e7d32' : '#d32f2f', padding: '6px 15px', borderRadius: '10px', fontWeight: 'bold' });
const statsBox = { display: 'flex', background: '#f1f3f5', borderRadius: '15px', padding: '15px', marginBottom: '20px' };
const statItem = { flex: 1, textAlign: 'center' as 'center' };
const logContainer = { maxHeight: '180px', overflowY: 'auto' as 'auto', padding: '5px' };
const logRow = (isAnomaly: boolean) => ({ display: 'flex', padding: '10px', borderRadius: '8px', marginBottom: '5px', background: isAnomaly ? '#fff5f5' : '#f8f9fa', color: isAnomaly ? '#d32f2f' : '#495057' });
const reportBtn = { width: '100%', marginTop: '20px', padding: '12px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
