'use client';
import React, { useState, useRef } from 'react';
import { Upload, FileSearch, Database, HardHat, Loader2, CheckCircle, AlertCircle, FilePlus } from 'lucide-react';

export default function PtoAnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [status, setStatus] = useState('');
  const [results, setResults] = useState<any[]>([]);
  
  // רפרנסים לשדות ההעלאה הנסתרים
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const steps = [
    "מזהה נהג: חכמת...",
    "סורק עט ירוק וסימוני פקדון (חוק אורן)...",
    "מצליב נתוני GPS מאיתוראן...",
    "מחשב משך פתיחת PTO וזמני הגעה...",
    "מנתח חותמות ואישורי מסירה..."
  ];

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    for (const step of steps) {
      setStatus(step);
      await new Promise(r => setTimeout(r, 1400));
    }
    setResults([
      { id: '6710537', driver: 'חכמת', customer: 'גל בן דוד', location: 'טייבה', pto: '12 דק', match: true, note: 'זוהה עט ירוק: הוחזר משטח' },
      { id: '6710529', driver: 'חכמת', customer: 'ד.ניב/ב"ס ח', location: 'רעננה', pto: '2 דק', match: false, note: 'אזהרה: חסרה חותמת פרויקט!' },
      { id: '6710552', driver: 'חכמת', customer: 'ינון אבני פ', location: 'הרצליה', pto: '25 דק', match: true, note: 'תקין' }
    ]);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-[#0b141a] text-white p-4 md:p-10 font-sans rtl">
      {/* Header מקצועי */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-gray-800 pb-8 gap-4">
        <div className="flex items-center gap-5">
          <div className="bg-[#C9A227] p-4 rounded-2xl text-black shadow-[0_0_20px_rgba(201,162,39,0.3)]">
            <HardHat size={35} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-[#C9A227]">Saban PTO Intelligence</h1>
            <p className="text-gray-500 text-xs font-bold tracking-widest mt-1">LOGISTICS & ANALYSIS CONTROL</p>
          </div>
        </div>
        <div className="flex items-center gap-6 bg-[#162127] px-6 py-3 rounded-2xl border border-gray-800">
           <div className="text-center">
             <p className="text-[10px] text-gray-500 font-bold uppercase">מכסה יומית</p>
             <p className="text-sm font-mono text-[#C9A227]">142 / 1,500</p>
           </div>
           <div className="w-[1px] h-8 bg-gray-700"></div>
           <div className="text-center">
             <p className="text-[10px] text-gray-500 font-bold uppercase">סטטוס מוח</p>
             <p className="text-sm font-bold text-green-500">ONLINE</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* פאנל העלאת מסמכים בלחיצה */}
        <div className="bg-[#162127] p-8 rounded-3xl border border-gray-800 shadow-2xl">
          <h2 className="font-bold text-xl mb-6 flex items-center gap-3 text-[#C9A227]">
            <FilePlus size={22}/> טעינת נתונים יומיים
          </h2>
          
          <div className="space-y-6">
            {/* שדה תעודות משלוח */}
            <div 
              onClick={() => fileInputRef1.current?.click()}
              className="bg-[#202c33] border-2 border-dashed border-gray-700 p-6 rounded-2xl text-center cursor-pointer hover:border-[#C9A227] hover:bg-[#2a3942] transition-all group"
            >
              <input type="file" ref={fileInputRef1} className="hidden" accept=".pdf,.jpg,.png" />
              <Upload className="mx-auto mb-3 text-gray-500 group-hover:text-[#C9A227] group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold">לחץ להעלאת תעודות משלוח</p>
              <p className="text-[10px] text-gray-500 mt-1">PDF או צילום מהשטח</p>
            </div>

            {/* שדה איתוראן */}
            <div 
              onClick={() => fileInputRef2.current?.click()}
              className="bg-[#202c33] border-2 border-dashed border-gray-700 p-6 rounded-2xl text-center cursor-pointer hover:border-[#C9A227] hover:bg-[#2a3942] transition-all group"
            >
              <input type="file" ref={fileInputRef2} className="hidden" accept=".csv,.xlsx" />
              <FileSearch className="mx-auto mb-3 text-gray-500 group-hover:text-[#C9A227] group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold">לחץ להעלאת דוח איתוראן</p>
              <p className="text-[10px] text-gray-500 mt-1">קובץ CSV יומי</p>
            </div>

            <button 
              onClick={runAnalysis} 
              disabled={isAnalyzing} 
              className="w-full bg-[#C9A227] text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:bg-[#e0b52d] active:scale-95 transition-all disabled:opacity-40"
            >
              {isAnalyzing ? (
                <><Loader2 className="animate-spin" size={20}/> {status}</>
              ) : (
                "הרץ הצלבה וניתוח חוק אורן"
              )}
            </button>
          </div>
        </div>

        {/* פאנל תוצאות חכם */}
        <div className="lg:col-span-2 bg-[#162127] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden">
          <div className="p-6 bg-[#202c33] border-b border-gray-800 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2 text-gray-300">
              <Database size={18} className="text-[#C9A227]"/> ממצאים לוגיסטיים
            </h2>
            <div className="text-[10px] font-mono text-gray-500 tracking-widest">REAL-TIME ANALYSIS ACTIVE</div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-[#2a3942] text-gray-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-5">תעודה</th>
                  <th className="p-5">לקוח ליעד</th>
                  <th className="p-5">משך PTO</th>
                  <th className="p-5">הערות "חוק אורן"</th>
                  <th className="p-5 text-center">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {results.map((r, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors animate-in fade-in slide-in-from-bottom-2">
                    <td className="p-5 text-[#C9A227] font-mono font-bold tracking-tighter text-lg">{r.id}</td>
                    <td className="p-5">
                      <p className="font-black text-sm">{r.customer}</p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-1 font-medium">
                        <CheckCircle size={10} className="text-blue-500"/> {r.location}
                      </p>
                    </td>
                    <td className="p-5 font-mono text-sm">{r.pto}</td>
                    <td className="p-5">
                      <span className={`text-[11px] px-3 py-1 rounded-full font-medium ${r.match ? 'bg-green-900/20 text-green-400 border border-green-800/30' : 'bg-red-900/20 text-red-400 border border-red-800/30'}`}>
                        {r.note}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      {r.match ? <CheckCircle className="text-green-500 mx-auto" size={22}/> : <AlertCircle className="text-red-500 mx-auto" size={22}/>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.length === 0 && !isAnalyzing && (
              <div className="p-32 text-center">
                <FileSearch size={48} className="mx-auto text-gray-700 mb-4" />
                <p className="text-gray-600 font-medium italic">ממתין לטעינת מסמכים לביצוע הצלבה...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
