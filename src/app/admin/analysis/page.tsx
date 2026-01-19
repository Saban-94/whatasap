'use client';

import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function SabanUltimateAnalyzer() {
  const [analyzedDrivers, setAnalyzedDrivers] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  // טעינת ספריית XLSX מה-CDN
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
        // @ts-ignore
        const XLSX = window.XLSX;
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        await processSabanData(jsonData);
      } catch (err) {
        alert("שגיאה בפענוח הקובץ.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processSabanData = async (rows: any[][]) => {
    const rulesSnap = await getDocs(collection(db, "business_rules"));
    const rules = rulesSnap.docs.map(d => d.data());

    const driverMap: any = {};

    rows.forEach((row, index) => {
      // דילוג על שורות הלוגו והכותרת של איתורן (7 השורות הראשונות)
      if (index < 8 || !row[1]) return; 

      const time = row[0];        // זמן הודעה
      const driverName = row[1];  // תג זיהוי / שם נהג
      const address = row[6];     // כתובת
      const status = row[8];      // שם מצב (חניה/נסיעה/PTO)
      
      // איתורן שמים קילומטראז' בעמודה 4, נשתמש בו לזיהוי תנועה חריגה
      const rawDuration = parseFloat(row[4]) || 0; 

      if (!driverMap[driverName]) {
        driverMap[driverName] = { 
          name: driverName, 
          logs: [], 
          totalLoss: 0, 
          score: 100,
          totalPtoTime: 0 
        };
      }

      // חישוב חריגה - אם המצב הוא עמידה/PTO והזמן ארוך מהחוק
      const rule = rules.find(r => address?.includes(r.item)) || { maxTime: 30 };
      const isAnomaly = rawDuration > rule.maxTime;

      if (isAnomaly) {
        driverMap[driverName].totalLoss += (rawDuration - rule.maxTime) * 7.5; // 7.5 ש"ח לדקת חריגה
        driverMap[driverName].score -= 5;
      }

      driverMap[driverName].logs.push({
        time, address, status, duration: rawDuration, isAnomaly
      });
    });

    setAnalyzedDrivers(Object.values(driverMap));
  };

  return (
    <main dir="rtl" style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={{margin:0, color:'#075E54'}}>🧠 המוח של סבן - ניתוח איתורן</h1>
        <label style={uploadBtn}>
          {isProcessing ? 'מעבד...' : '📂 העלה דוח איתורן'}
          <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} style={{display:'none'}} />
        </label>
      </header>

      {/* תצוגת נהגים ככפתורים */}
      <div style={driverGrid}>
        {analyzedDrivers.map(driver => (
          <div key={driver.name} style={driverCard} onClick={() => setSelectedDriver(driver)}>
            <div style={{fontSize:'2rem', marginBottom:'10px'}}>🚚</div>
            <h3 style={{margin:0}}>{driver.name}</h3>
            <div style={lossBadge}>הפסד: ₪{driver.totalLoss.toFixed(0)}</div>
            <div style={{color: driver.score > 70 ? '#2e7d32' : '#d32f2f', fontWeight:'bold'}}>
              יעילות: {Math.max(driver.score, 0)}%
            </div>
            <button style={viewBtn}>צפה בניתוח מצבים</button>
          </div>
        ))}
      </div>

      {/* חלון פירוט לנהג נבחר */}
      {selectedDriver && (
        <div style={modalOverlay} onClick={() => setSelectedDriver(null)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <header style={modalHeader}>
              <h2>דוח פעילות: {selectedDriver.name}</h2>
              <button onClick={() => setSelectedDriver(null)} style={closeBtn}>✕</button>
            </header>
            
            <div style={tableWrapper}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{background:'#f1f3f5'}}>
                    <th>זמן</th>
                    <th>מיקום / כתובת</th>
                    <th>סטטוס</th>
                    <th>משך (דק')</th>
                    <th>ניתוח Gemini</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDriver.logs.map((log:any, i:number) => (
                    <tr key={i} style={{borderBottom:'1px solid #eee', background: log.isAnomaly ? '#fff5f5' : 'transparent'}}>
                      <td>{log.time}</td>
                      <td>{log.address}</td>
                      <td>{log.status}</td>
                      <td style={{fontWeight:'bold'}}>{log.duration.toFixed(1)}</td>
                      <td style={{color: log.isAnomaly ? '#d32f2f' : '#2e7d32'}}>
                        {log.isAnomaly ? '🚨 חריגת זמן - לבדוק חיוב' : '✅ תקין'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// --- Styles ---
const containerStyle: any = { background: '#f8f9fa', minHeight: '100vh', padding: '30px', fontFamily: 'sans-serif' };
const headerStyle: any = { background: '#fff', padding: '20px 40px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' };
const uploadBtn: any = { background: '#075E54', color: '#fff', padding: '12px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };
const driverGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' };
const driverCard: any = { background: '#fff', padding: '25px', borderRadius: '20px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', border: '1px solid #eee', transition: '0.2s' };
const lossBadge = { background: '#ffebee', color: '#d32f2f', padding: '5px 10px', borderRadius: '8px', margin: '10px 0', fontWeight: 'bold' };
const viewBtn = { marginTop: '15px', background: '#e9ecef', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' };
const modalOverlay: any = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent: any = { background: '#fff', width: '90%', maxHeight: '80%', borderRadius: '25px', padding: '30px', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' };
const closeBtn = { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' };
const tableWrapper = { overflowX: 'auto' as 'auto' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' as 'collapse', textAlign: 'right' as 'right' };
