'use client';

import { useState } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function SabanAdvancedAnalysis() {
  const [analyzedDrivers, setAnalyzedDrivers] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // פונקציה לטיפול בהעלאת קובץ
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const content = event.target?.result as string;
      await processData(content);
    };

    reader.readAsText(file); // קורא קבצי CSV או טקסט מאקסל
  };

  const processData = async (data: string) => {
    const rulesSnap = await getDocs(collection(db, "business_rules"));
    const rules = rulesSnap.docs.map(d => d.data());

    const rows = data.split('\n').filter(row => row.trim() !== '');
    const driverStats: any = {};

    rows.forEach((row, index) => {
      if (index === 0) return; // דילוג על כותרות הטבלה
      
      const columns = row.split(/,|\t/); // תמיכה ב-CSV או העתקה מאקסל
      const [vId, time, location, ptoStatus, duration] = columns;

      if (!vId) return;

      if (!driverStats[vId]) {
        driverStats[vId] = { id: vId, actions: [], score: 100, costLoss: 0 };
      }

      const durInt = parseInt(duration) || 0;
      const rule = rules.find(r => location?.includes(r.item));
      const isAnomaly = durInt > (rule?.maxTime || 30);

      if (isAnomaly) {
        driverStats[vId].score -= 15;
        driverStats[vId].costLoss += (durInt - 30) * 8; // חישוב הפסד משוער ב₪
      }

      driverStats[vId].actions.push({
        time, location, durInt, isAnomaly,
        status: isAnomaly ? 'חריגת זמן' : 'תקין'
      });
    });

    setAnalyzedDrivers(Object.values(driverStats));
    setIsProcessing(false);
  };

  return (
    <main dir="rtl" style={containerStyle}>
      {/* Header & Upload */}
      <header style={headerCard}>
        <div style={{textAlign:'right'}}>
          <h1 style={{margin:0, color:'#075E54'}}>המוח של סבן - ניתוח ביצועים</h1>
          <p style={{color:'#666'}}>העלאת דוח איתורן והצלבה מול חוקי עסק</p>
        </div>
        
        <div style={uploadContainer}>
          <label htmlFor="file-upload" style={uploadBtn}>
            📁 בחר קובץ אקסל / CSV
          </label>
          <input id="file-upload" type="file" accept=".csv, .txt, .xlsx" onChange={handleFileUpload} style={{display:'none'}} />
        </div>
      </header>

      {isProcessing && <div style={loaderStyle}>Gemini מנתח את נתוני הנהגים...</div>}

      {/* Drivers Results Grid */}
      <div style={gridStyle}>
        {analyzedDrivers.map(driver => (
          <div key={driver.id} style={driverCard}>
            <div style={driverHeader}>
              <h2 style={{margin:0}}>משאית: {driver.id}</h2>
              <div style={scoreBadge(driver.score)}>יעילות: {driver.score}%</div>
            </div>

            <div style={statsBox}>
              <div style={statItem}>
                <small>הפסד משוער</small>
                <div style={{color:'#d32f2f', fontWeight:'bold'}}>₪ {driver.costLoss}</div>
              </div>
              <div style={statItem}>
                <small>סטטוס יומי</small>
                <div style={{color: driver.score > 70 ? '#2e7d32' : '#d32f2f'}}>{driver.score > 70 ? 'רווחי' : 'דורש בדיקה'}</div>
              </div>
            </div>

            <div style={logContainer}>
              {driver.actions.map((a: any, i: number) => (
                <div key={i} style={logRow(a.isAnomaly)}>
                  <span>{a.time}</span>
                  <span style={{flex:1, marginRight:'10px'}}>{a.location}</span>
                  <span style={{fontWeight:'bold'}}>{a.durInt} דק'</span>
                </div>
              ))}
            </div>

            <button style={reportBtn} onClick={() => window.open(`https://wa.me/97250XXXXXXX?text=דוח חריגות משאית ${driver.id}`)}>
              דווח לראמי / נהג
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

// --- Styles (Mixed Light Design) ---
const containerStyle: any = { background: '#f8f9fa', minHeight: '100vh', padding: '30px', fontFamily: 'sans-serif' };
const headerCard: any = { 
  background: '#fff', padding: '30px', borderRadius: '20px', display: 'flex', 
  justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '30px' 
};
const uploadContainer: any = { textAlign: 'center' };
const uploadBtn: any = { 
  background: '#075E54', color: '#fff', padding: '12px 25px', borderRadius: '12px', 
  cursor: 'pointer', fontWeight: 'bold', display: 'inline-block', transition: '0.3s' 
};

const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '25px' };
const driverCard: any = { background: '#fff', borderRadius: '20px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid #edf2f7' };
const driverHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const scoreBadge = (score: number) => ({
  background: score > 70 ? '#e8f5e9' : '#ffebee', color: score > 70 ? '#2e7d32' : '#d32f2f',
  padding: '6px 15px', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px'
});

const statsBox = { display: 'flex', background: '#f1f3f5', borderRadius: '15px', padding: '15px', marginBottom: '20px' };
const statItem = { flex: 1, textAlign: 'center' as 'center' };

const logContainer = { maxHeight: '180px', overflowY: 'auto' as 'auto', padding: '5px' };
const logRow = (isAnomaly: boolean) => ({
  display: 'flex', padding: '10px', borderRadius: '8px', marginBottom: '5px',
  background: isAnomaly ? '#fff5f5' : '#f8f9fa',
  borderRight: isAnomaly ? '4px solid #f8d7da' : '4px solid #e9ecef',
  fontSize: '13px', color: isAnomaly ? '#d32f2f' : '#495057'
});

const reportBtn = { 
  width: '100%', marginTop: '20px', padding: '12px', background: '#25D366', 
  color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' 
};
const loaderStyle = { textAlign: 'center' as 'center', padding: '20px', color: '#075E54', fontWeight: 'bold' };
