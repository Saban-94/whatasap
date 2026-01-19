'use client';

import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Saban94Insights() {
  const [analyzedDrivers, setAnalyzedDrivers] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalStats, setGlobalStats] = useState({ loss: 0, anomalies: 0, drivers: 0 });

  // טעינת ספריית XLSX מה-CDN באופן בטוח
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
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
        
        if (!XLSX) {
          alert("מערכת הפענוח בטעינה, אנא נסה שוב בעוד 2 שניות");
          return;
        }

        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        await runDeepAnalysis(jsonData);
      } catch (err) {
        console.error(err);
        alert("שגיאה בניתוח הקובץ. וודא שזה דוח איתורן תקין.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const runDeepAnalysis = async (rows: any[][]) => {
    // 1. שליפת חוקי העסק מה-Database
    const rulesSnap = await getDocs(collection(db, "business_rules"));
    const rules = rulesSnap.docs.map(d => d.data());

    const driverMap: any = {};
    let totalLoss = 0;
    let totalAnomalies = 0;

    // 2. עיבוד הנתונים וצמצום שורות לאירועים (Aggregation)
    rows.forEach((row, index) => {
      if (index < 8 || !row[1]) return; // דילוג על כותרות איתורן

      const [time, driverName, , , duration, , address, , status] = row;
      const durInt = parseFloat(duration) || 0;

      if (!driverMap[driverName]) {
        driverMap[driverName] = { name: driverName, events: [], loss: 0, efficiency: 100 };
      }

      const rule = rules.find(r => address?.includes(r.item)) || { maxTime: 30 };
      const isAnomaly = (status?.includes('עצירה') || status?.includes('PTO')) && durInt > rule.maxTime;

      // צמצום שורות רצופות לאירוע אחד
      const lastEvent = driverMap[driverName].events[driverMap[driverName].events.length - 1];
      
      if (!lastEvent || lastEvent.status !== status || lastEvent.address !== address) {
        driverMap[driverName].events.push({
          time, address, status, duration: durInt, isAnomaly
        });
      } else {
        lastEvent.duration += durInt;
        if (lastEvent.duration > rule.maxTime) lastEvent.isAnomaly = true;
      }

      if (isAnomaly) {
        const penalty = (durInt - rule.maxTime) * 7.5;
        driverMap[driverName].loss += penalty;
        totalLoss += penalty;
        totalAnomalies++;
      }
    });

    const driversArray = Object.values(driverMap).map((d: any) => ({
      ...d,
      efficiency: Math.max(100 - (d.loss / 20), 0) // חישוב ציון יעילות
    }));

    setAnalyzedDrivers(driversArray);
    setGlobalStats({ loss: totalLoss, anomalies: totalAnomalies, drivers: driversArray.length });
  };

  return (
    <main dir="rtl" style={theme.page}>
      {/* Header Section */}
      <header style={theme.header}>
        <div>
          <h1 style={theme.title}>SABAN 94 <span style={{color:'#2ecc71'}}>INSIGHTS</span></h1>
          <p style={{margin:0, opacity:0.8}}>מערכת ניתוח היסטורית והצלבת נתוני שטח</p>
        </div>
        <label style={theme.uploadBtn}>
          {isProcessing ? 'Gemini מנתח...' : '➕ טען דוח היסטורי'}
          <input type="file" onChange={handleFileUpload} style={{display:'none'}} />
        </label>
      </header>

      {/* Summary Dashboard */}
      <div style={theme.statsRow}>
        <div style={theme.statCard}>
          <small>הפסד כספי (זמן המתנה)</small>
          <h2 style={{color:'#e74c3c'}}>₪{globalStats.loss.toFixed(0)}</h2>
        </div>
        <div style={theme.statCard}>
          <small>נהגים פעילים בדוח</small>
          <h2>{globalStats.drivers}</h2>
        </div>
        <div style={theme.statCard}>
          <small>חריגות פריקה</small>
          <h2 style={{color:'#f39c12'}}>{globalStats.anomalies}</h2>
        </div>
      </div>

      {/* Main Analysis Area */}
      <section style={theme.mainContent}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
          <h3 style={{margin:0}}>דירוג ביצועי נהגים (Leaderboard)</h3>
          <span style={{fontSize:'12px', color:'#7f8c8d'}}>מבוסס על הצלבת איתורן מול חוקי עסק</span>
        </div>

        <div style={theme.tableWrapper}>
          <table style={theme.table}>
            <thead>
              <tr style={theme.thRow}>
                <th>נהג / משאית</th>
                <th>סטטוס יעילות</th>
                <th>אירועי חריגה</th>
                <th>נזק כספי משוער</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {analyzedDrivers.sort((a,b)=>b.loss - a.loss).map(driver => (
                <tr key={driver.name} style={theme.tr}>
                  <td style={{fontWeight:'bold'}}>🚚 {driver.name}</td>
                  <td>
                    <div style={theme.progressBg}>
                      <div style={theme.progressFill(driver.efficiency)} />
                    </div>
                    <small>{driver.efficiency.toFixed(0)}% יעילות</small>
                  </td>
                  <td>{driver.events.filter((e:any)=>e.isAnomaly).length} חריגות</td>
                  <td style={{color: driver.loss > 0 ? '#e74c3c' : '#2ecc71', fontWeight:'900'}}>
                    ₪{driver.loss.toFixed(0)}
                  </td>
                  <td>
                    <button style={theme.viewBtn} onClick={() => alert(`ציר זמן לנהג ${driver.name} בבניה...`)}>
                      מבט עומק
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {analyzedDrivers.length === 0 && (
            <div style={theme.emptyState}>אנא טען קובץ אקסל לקבלת נתונים</div>
          )}
        </div>
      </section>
    </main>
  );
}

// --- Enterprise Design Theme ---
const theme: any = {
  page: { background: '#f4f7f6', minHeight: '100vh', padding: '30px', fontFamily: 'system-ui, -apple-system' },
  header: { background: '#075E54', color: '#fff', padding: '25px 40px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', boxShadow: '0 10px 30px rgba(7,94,84,0.15)' },
  title: { margin: 0, fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-1px' },
  uploadBtn: { background: '#fff', color: '#075E54', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' },
  statCard: { background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', textAlign: 'center', border: '1px solid #edf2f7' },
  mainContent: { background: '#fff', padding: '35px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'right' },
  thRow: { borderBottom: '2px solid #f1f3f5', color: '#95a5a6', fontSize: '13px', paddingBottom: '10px' },
  tr: { borderBottom: '1px solid #f8f9fa', height: '60px' },
  progressBg: { width: '100px', height: '6px', background: '#eee', borderRadius: '10px', marginBottom: '4px' },
  progressFill: (val: number) => ({ width: `${val}%`, height: '100%', background: val > 75 ? '#2ecc71' : val > 40 ? '#f1c40f' : '#e74c3c', borderRadius: '10px' }),
  viewBtn: { background: '#f1f3f5', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  emptyState: { textAlign: 'center', padding: '80px', color: '#bdc3c7', fontSize: '1.1rem' }
};
