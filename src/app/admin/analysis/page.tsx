'use client';

import { useState, useMemo } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function SabanAIProcessor() {
  const [rawData, setRawData] = useState('');
  const [analyzedDrivers, setAnalyzedDrivers] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // פונקציית פענוח וניתוח נתוני אמת
  const processLogisticsData = async () => {
    setIsProcessing(true);
    
    // 1. שליפת חוקי העסק מ-Firebase להצלבה
    const rulesSnap = await getDocs(collection(db, "business_rules"));
    const rules = rulesSnap.docs.map(d => d.data());

    // 2. פענוח הטקסט הגולמי מהקובץ (Parsing)
    // אנחנו מניחים פורמט של איתורן: רכב, שעה, מיקום, PTO
    const rows = rawData.split('\n').filter(row => row.trim() !== '');
    
    const driverStats: any = {};

    rows.forEach(row => {
      const [vId, time, location, ptoStatus, duration] = row.split('\t'); // הפרדה לפי טאבים/אקסל
      if (!driverStats[vId]) {
        driverStats[vId] = { id: vId, actions: [], totalAnomalies: 0, efficiency: 100 };
      }

      // הצלבה מול חוקי העסק
      const rule = rules.find(r => location.includes(r.item) || r.item.includes("כללי"));
      const isAnomaly = parseInt(duration) > (rule?.maxTime || 30);
      
      if (isAnomaly) {
        driverStats[vId].totalAnomalies++;
        driverStats[vId].efficiency -= 10;
      }

      driverStats[vId].actions.push({
        time, location, ptoStatus, duration, 
        status: isAnomaly ? 'חריגה' : 'תקין',
        costImpact: isAnomaly ? (parseInt(duration) * 5) : 0 // חישוב הפסד משוער
      });
    });

    setAnalyzedDrivers(Object.values(driverStats));
    setIsProcessing(false);
  };

  return (
    <main dir="rtl" style={pageStyle}>
      {/* אזור העלאת קובץ */}
      <section style={uploadSection}>
        <h2 style={titleStyle}>🧩 מנתח נתוני איתורן & Gemini AI</h2>
        <textarea 
          style={inputArea} 
          placeholder="הדבק כאן את נתוני דוח התנועות הגולמי מאיתורן..."
          value={rawData}
          onChange={(e) => setRawData(e.target.value)}
        />
        <button style={processBtn} onClick={processLogisticsData} disabled={isProcessing}>
          {isProcessing ? 'Gemini מעבד נתונים...' : 'הרץ ניתוח עומק לוגיסטי'}
        </button>
      </section>

      {/* Dashboard נהגים */}
      <div style={gridContainer}>
        {analyzedDrivers.map(driver => (
          <div key={driver.id} style={driverCard}>
            <div style={cardHeader}>
              <span style={vIdBadge}>🚚 {driver.id}</span>
              <span style={effScore(driver.efficiency)}>יעילות: {driver.efficiency}%</span>
            </div>

            <div style={statsRow}>
              <div style={statBox}><span>חריגות</span><strong>{driver.totalAnomalies}</strong></div>
              <div style={statBox}><span>סטטוס</span><strong style={{color: driver.efficiency > 80 ? '#2ecc71' : '#e74c3c'}}>
                {driver.efficiency > 80 ? 'רווחי' : 'הפסד'}
              </strong></div>
            </div>

            <div style={logTable}>
              {driver.actions.map((action: any, idx: number) => (
                <div key={idx} style={logRow(action.status === 'חריגה')}>
                  <span>{action.time}</span>
                  <span style={{flex: 1, marginRight: '10px'}}>{action.location}</span>
                  <span>{action.duration} דק'</span>
                  <span style={statusBadge(action.status)}>{action.status}</span>
                </div>
              ))}
            </div>

            <button style={waReportBtn} onClick={() => window.open(`https://wa.me/97250XXXXXXX?text=דוח חריגות למשאית ${driver.id}`)}>
              שלח דוח לנהג / ראמי
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

// --- עיצוב מקצועי (Saban UI/UX) ---
const pageStyle = { background: '#1a1c1e', minHeight: '100vh', padding: '30px', color: '#fff', fontFamily: 'system-ui' };
const uploadSection = { background: '#2c2e33', padding: '25px', borderRadius: '15px', marginBottom: '30px', border: '1px solid #3e4249' };
const titleStyle = { margin: '0 0 20px 0', fontSize: '24px', color: '#00d1b2' };
const inputArea = { width: '100%', height: '120px', background: '#1a1c1e', border: '1px solid #444', color: '#00d1b2', padding: '15px', borderRadius: '10px', fontSize: '14px' };
const processBtn = { marginTop: '15px', width: '100%', padding: '18px', background: '#00d1b2', color: '#1a1c1e', border: 'none', borderRadius: '10px', fontWeight: 'bold' as 'bold', cursor: 'pointer', fontSize: '16px' };

const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' };
const driverCard = { background: '#2c2e33', borderRadius: '15px', padding: '20px', border: '1px solid #3e4249', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const vIdBadge = { background: '#00d1b2', color: '#1a1c1e', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold' };
const effScore = (val: number) => ({ color: val > 80 ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' });

const statsRow = { display: 'flex', gap: '15px', marginBottom: '20px' };
const statBox = { flex: 1, background: '#1a1c1e', padding: '10px', borderRadius: '10px', textAlign: 'center' as 'center' };

const logTable = { maxHeight: '200px', overflowY: 'auto' as 'auto', background: '#1a1c1e', borderRadius: '10px', padding: '10px' };
const logRow = (isAnomaly: boolean) => ({
  display: 'flex', justifyContent: 'space-between', padding: '8px 5px', fontSize: '13px',
  borderBottom: '1px solid #333', color: isAnomaly ? '#e74c3c' : '#bbb'
});

const statusBadge = (status: string) => ({
  padding: '2px 6px', borderRadius: '4px', fontSize: '11px', 
  background: status === 'חריגה' ? '#e74c3c' : '#2ecc71', color: '#fff', marginLeft: '5px'
});

const waReportBtn = { width: '100%', marginTop: '15px', padding: '12px', background: 'transparent', border: '1px solid #25D366', color: '#25D366', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };
