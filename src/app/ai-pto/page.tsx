'use client';
import React, { useState, useRef } from 'react';
import { Upload, HardHat, Loader2, CheckCircle, AlertCircle, Clock, Database, FilePlus, BarChart3 } from 'lucide-react';

export default function PtoAnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [status, setStatus] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const steps = [
    "מזהה נהג: חכמת (3)...",
    "סורק עט ירוק (חוק אורן)...",
    "מצליב נתוני GPS מאיתוראן...",
    "מחשב משכי PTO וממוצעים...",
    "מייצר תובנות ניהוליות..."
  ];

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setShowResults(false);
    for (const step of steps) {
      setStatus(step);
      await new Promise(r => setTimeout(r, 1000));
    }
    setShowResults(true);
    setIsAnalyzing(false);
  };

  const timeline = [
    { action: "פתיחת סוויץ'", time: "05:33", loc: "טייבה", duration: "-", status: "תקין" },
    { action: "פריקה (הפרדס 21)", time: "07:08", loc: "הוד השרון", duration: "12.1", status: "תואם תעודה" },
    { action: "פריקה (קהילת ורשה)", time: "09:27", loc: "תל אביב", duration: "17.1", status: "זיהוי חותמת ✅" },
    { action: "פריקה (גבעת המורה)", time: "10:12", loc: "תל אביב", duration: "15.9", status: "תקין" },
    { action: "פריקה (אלוף דוד 175)", time: "11:54", loc: "רמת גן", duration: "22.8", status: "תקין" },
    { action: "פריקה (יהודה הלוי 8)", time: "14:02", loc: "רעננה", duration: "18.9", status: "עט ירוק 🟢" },
    { action: "פריקה (קקטוס 6)", time: "15:07", loc: "אבן יהודה", duration: "22.9", status: "תקין" },
  ];

  return (
    <div className="min-h-screen bg-[#0b141a] text-white p-4 md:p-10 font-sans rtl" dir="rtl">
      {/* Header - Saban Intelligence */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 border-b border-gray-800 pb-8 gap-4">
        <div className="flex items-center gap-5">
          <div className="bg-[#C9A227] p-4 rounded-2xl text-black shadow-lg shadow-sabanGold/20">
            <HardHat size={35} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#C9A227] tracking-tighter uppercase">Saban PTO Intelligence</h1>
            <p className="text-gray-500 text-xs font-bold tracking-widest mt-1">CENTER OF LOGISTICS & ANALYSIS</p>
          </div>
        </div>
        <button 
          onClick={runAnalysis} 
          disabled={isAnalyzing} 
          className="bg-[#C9A227] text-black font-black px-10 py-4 rounded-2xl hover:bg-[#e0b52d] active:scale-95 transition-all flex items-center gap-3 shadow-lg disabled:opacity-50"
        >
          {isAnalyzing ? <><Loader2 className="animate-spin" size={20}/> {status}</> : "הרץ ניתוח חוק אורן"}
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {!showResults && !isAnalyzing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 animate-in fade-in zoom-in duration-500">
            {/* כפתור העלאת PDF */}
            <div 
              onClick={() => fileInputRef1.current?.click()} 
              className="bg-[#162127] border-2 border-dashed border-gray-700 p-16 rounded-3xl text-center cursor-pointer hover:border-[#C9A227] hover:bg-[#1c2a32] transition-all group"
            >
              <input type="file" ref={fileInputRef1} className="hidden" accept=".pdf,.png,.jpg" />
              <FilePlus className="mx-auto mb-4 text-gray-500 group-hover:text-[#C9A227] transition-colors" size={56} />
              <p className="text-xl font-bold text-gray-300">טעינת תעודות משלוח</p>
              <p className="text-sm text-gray-500 mt-2">לחץ לבחירת קבצי סריקה או PDF</p>
            </div>

            {/* כפתור העלאת CSV */}
            <div 
              onClick={() => fileInputRef2.current?.click()} 
              className="bg-[#162127] border-2 border-dashed border-gray-700 p-16 rounded-3xl text-center cursor-pointer hover:border-[#C9A227] hover:bg-[#1c2a32] transition-all group"
            >
              <input type="file" ref={fileInputRef2} className="hidden" accept=".csv,.xlsx" />
              <BarChart3 className="mx-auto mb-4 text-gray-500 group-hover:text-[#C9A227] transition-colors" size={56} />
              <p className="text-xl font-bold text-gray-300">טעינת דוחות איתוראן</p>
              <p className="text-sm text-gray-500 mt-2">לחץ לבחירת קובץ CSV יומי</p>
            </div>
          </div>
        ) : isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="animate-spin text-[#C9A227] mb-6" size={64} />
            <h2 className="text-2xl font-bold animate-pulse">{status}</h2>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
            {/* כרטיסיות סיכום */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-900/10 border border-blue-800/40 p-6 rounded-3xl backdrop-blur-sm">
                  <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2 tracking-tighter text-sm"><CheckCircle size={16}/> שיא יעילות פריקה</h3>
                  <p className="text-3xl font-black text-white">12.1 דקות</p>
                  <p className="text-[10px] text-blue-300/70 mt-2 uppercase font-bold tracking-widest">אתר: הוד השרון</p>
              </div>
              <div className="bg-green-900/10 border border-green-800/40 p-6 rounded-3xl backdrop-blur-sm">
                  <h3 className="text-green-400 font-bold mb-2 flex items-center gap-2 tracking-tighter text-sm"><Database size={16}/> חוק אורן: זיכויים</h3>
                  <p className="text-3xl font-black text-white">זוהתה הערה</p>
                  <p className="text-[10px] text-green-300/70 mt-2 uppercase font-bold tracking-widest italic">החזרת משטח בעט ירוק</p>
              </div>
              <div className="bg-red-900/10 border border-red-800/40 p-6 rounded-3xl backdrop-blur-sm">
                  <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2 tracking-tighter text-sm"><Clock size={16}/> חריגת נסיעה</h3>
                  <p className="text-3xl font-black text-white">139 דקות</p>
                  <p className="text-[10px] text-red-300/70 mt-2 uppercase font-bold tracking-widest italic">בין הוד השרון לת"א</p>
              </div>
            </div>

            {/* טבלת ציר הזמן */}
            <div className="bg-[#162127] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
              <div className="p-6 bg-[#202c33] border-b border-gray-800 flex justify-between items-center">
                  <h2 className="font-black text-xl flex items-center gap-3"><Clock className="text-[#C9A227]"/> ציר זמן לוגיסטי - חכמת</h2>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Saban Analysis System v1.1</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-[#2a3942] text-gray-400 text-[10px] font-black uppercase tracking-widest">
                    <tr>
                      <th className="p-5">פעולה הנדסית</th>
                      <th className="p-5">שעה</th>
                      <th className="p-5">מיקום (איתוראן)</th>
                      <th className="p-5">משך PTO</th>
                      <th className="p-5 text-center">סטטוס</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-sm">
                    {timeline.map((item, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors group">
                        <td className="p-5 font-black text-gray-200 group-hover:text-[#C9A227] transition-colors">{item.action}</td>
                        <td className="p-5 font-mono text-[#C9A227] font-bold">{item.time}</td>
                        <td className="p-5 text-gray-400 text-xs font-medium">{item.loc}</td>
                        <td className="p-5 font-mono text-sm">{item.duration === '-' ? '-' : `${item.duration} דק'`}</td>
                        <td className="p-5 text-center">
                          <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black tracking-tight ${item.status.includes('🟢') || item.status.includes('✅') ? 'bg-green-500/10 text-green-500 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
