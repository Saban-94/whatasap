'use client';
import { useState } from 'react';
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function AnalysisPage() {
  const [ituranRawData, setIturanRawData] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    // 1. מושכים את חוקי העסק שהגדרנו קודם (מכולה = 30 דקות וכו')
    const rulesSnap = await getDocs(collection(db, "business_rules"));
    const rules = rulesSnap.docs.map(d => d.data());

    // 2. סימולציה של ניתוח Gemini על הנתונים הגולמיים
    // כאן Gemini עובר שורה שורה ומצליב
    setTimeout(() => {
      const mockAnalysis = [
        { vehicle: '12-345-67', location: 'הרצליה', issue: 'חריגת זמן פריקה', extra: '22 דקות מעל המותר', status: 'בדיקת חיוב' },
        { vehicle: '99-888-77', location: 'נתניה', issue: 'מנוף פעל ללא תעודה', extra: 'חשד לפריקה לא מדווחת', status: 'דחוף' }
      ];
      setResults(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <main dir="rtl" style={mainStyle}>
      <header style={headerStyle}>
        <h2>🧠 Gemini Logic - ניתוח איתורן</h2>
        <p>הדבק נתונים גולמיים מהדוח וקבל חריגות בשנייה</p>
      </header>

      <section style={sectionStyle}>
        <textarea 
          style={textareaStyle} 
          placeholder="הדבק כאן את שורות הנתונים מאקסל איתורן..."
          value={ituranRawData}
          onChange={(e) => setIturanRawData(e.target.value)}
        />
        <button 
          style={isAnalyzing ? disabledBtn : activeBtn} 
          onClick={startAnalysis}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Gemini מנתח נתונים...' : 'התחל ניתוח חכם 🚀'}
        </button>
      </section>

      {results.length > 0 && (
        <section style={{marginTop:'20px'}}>
          <h3 style={{color:'#d32f2f'}}>ממצאים דחופים (חריגות):</h3>
          {results.map((res, i) => (
            <div key={i} style={resultCard}>
              <div style={badge}>{res.status}</div>
              <strong>משאית: {res.vehicle} | מיקום: {res.location}</strong>
              <p style={{margin:'5px 0', color:'#d32f2f'}}>{res.issue}</p>
              <small>{res.extra}</small>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}

// Styles
const mainStyle: any = { padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif' };
const headerStyle: any = { textAlign: 'center', color: '#075E54', marginBottom: '20px' };
const sectionStyle: any = { background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
const textareaStyle: any = { width: '100%', height: '150px', borderRadius: '10px', padding: '10px', border: '1px solid #ddd', marginBottom: '15px' };
const activeBtn: any = { width: '100%', padding: '15px', background: '#075E54', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const disabledBtn: any = { ...activeBtn, background: '#ccc', cursor: 'wait' };
const resultCard: any = { background: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '10px', borderRight: '5px solid #d32f2f', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
const badge: any = { background: '#ffebee', color: '#d32f2f', padding: '3px 8px', borderRadius: '5px', fontSize: '12px', display: 'inline-block', marginBottom: '5px' };
