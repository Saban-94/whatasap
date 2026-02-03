'use client';
import React, { useState, useRef } from 'react';
import { Upload, HardHat, Loader2, CheckCircle, AlertCircle, Clock, Database, FilePlus } from 'lucide-react';

export default function PtoAnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [status, setStatus] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const steps = [
    "מזהה נהג: חכמת (3)...",
    "סורק עט ירוק וסימוני פקדון (חוק אורן)...",
    "מצליב נתוני GPS מאיתוראן...",
    "מחשב משכי PTO וממוצעים לאתר...",
    "מייצר תובנות ניהוליות..."
  ];

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    for (const step of steps) {
      setStatus(step);
      await new Promise(r => setTimeout(r, 1200));
    }
    setShowResults(true);
    setIsAnalyzing(false);
  };

  const timeline = [
    { action: "פתיחת סוויץ'", time: "05:33", loc: "טייבה", duration: "-", status: "תקין" },
    { action: "פריקה 1", time: "07:08", loc: "הפרדס 21, הוד השרון", duration: "12.1", status: "תואם תעודה" },
    { action: "פריקה 2", time: "09:27", loc: "קהילת ורשה, ת\"א", duration: "17.1", status: "זיהוי חותמת ✅" },
    { action: "פריקה 3", time: "10:12", loc: "גבעת המורה, ת\"א", duration: "15.9", status: "תקין" },
    { action: "פריקה 4", time: "11:54", loc: "אלוף דוד 175, ר\"ג", duration: "22.8", status: "תקין" },
    { action: "פריקה 5", time: "14:02", loc: "יהודה הלוי 8, רעננה", duration: "18.9", status: "עט ירוק 🟢" },
    { action: "פריקה 6", time: "15:07", loc: "קקטוס 6, אבן יהודה", duration: "22.9", status: "תקין" },
  ];

  return (
    <div className="min-h-screen bg-[#0b141a] text-white p-4 md:p-10 font-sans rtl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 border-b border-gray-800 pb-8 gap-4">
        <div className="flex items-center gap-5">
          <div className="bg-[#C9A227] p-4 rounded-2xl text-black shadow-lg"><HardHat size={35} /></div>
          <div>
            <h1 className="text-3xl font-black text-[#C9A227] tracking-tighter uppercase">Saban PTO Intelligence</h1>
            <p className="text-gray-500 text-xs font-bold tracking-widest mt-1">LOGISTICS & ANALYSIS CONTROL</p>
          </div>
        </div>
        <button onClick={runAnalysis} disabled={isAnalyzing} className="bg-[#C9A227] text-black font-black px-10 py-4 rounded-2xl hover:bg-[#e0b52d] active:scale-95 transition-all flex items-center gap-3">
          {isAnalyzing ? <><Loader2 className="animate-spin" size={20}/> {status}</> : "הרץ ניתוח חוק אורן"}
        </button>
      </div>

      {!showResults ? (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 font-bold">
            <div onClick={() => fileInputRef1.current?.click()} className="bg-[#162127] border-2 border-dashed border-gray-700 p-12 rounded-3xl text-center cursor-pointer hover:border-[#C9A227] transition-all group">
                <input type="file" ref={fileInputRef1} className="hidden" />
                <FilePlus className="mx-auto mb-4 text-gray-500 group-hover:text-[#C9A227]" size={48} />
                <p className="text-xl text-gray-300">טעינת תעודות (PDF)</p>
            </div>
            <div onClick={() => fileInputRef2.current?.click()} className="bg-[#162127] border-2 border-dashed border-gray-700 p-12 rounded-3xl text-center cursor-pointer hover:border-[#C9A227] transition-all group">
                <input type="file" ref={fileInputRef2} className="hidden" />
                <Database className="mx-auto mb-4 text-gray-500 group-hover:text-[#C9A227]" size={48} />
                <p className="text-xl text-gray-300">טעינת איתוראן (CSV)</p>
            </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-bold">
            <div className="bg-blue-900/20 border border-blue-800 p-6 rounded-2xl text-center">
                <h3 className="text-blue-400 mb-2">שיא יעילות פריקה</h3>
                <p className="text-3xl text-white">12.1 דקות</p>
                <p className="text-[10px] text-blue-300 mt-2 italic">הפרדס 21, הוד השרון</p>
            </div>
            <div className="bg-green-900/20 border border-green-800 p-6 rounded-2xl text-center">
                <h3 className="text-green-400 mb-2 font-black tracking-tighter">חוק אורן: זיכויים</h3>
                <p className="text-3xl text-white">1 פעולה</p>
                <p className="text-[10px] text-green-300 mt-2 italic font-medium tracking-tight">החזרת משטח (יהודה הלוי)</p>
            </div>
            <div className="bg-red-900/20 border border-red-800 p-6 rounded-2xl text-center">
                <h3 className="text-red-400 mb-2">חריגת "זמן מת"</h3>
                <p className="text-3xl text-white">139 דקות</p>
                <p className="text-[10px] text-red-300 mt-2 italic">נסיעה ארוכה מהוד השרון לת"א</p>
            </div>
          </div>

          <div className="bg-[#162127] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 bg-[#202c33] border-b border-gray-800 flex justify-between items-center font-bold">
                <h2 className="text-xl flex items-center gap-3"><Clock className="text-[#C9A227]"/> ציר זמן לוגיסטי - חכמת ג'אבר</h2>
                <span className="text-xs text-gray-500">תאריך: 01/02/2026</span>
            </div>
            <table className="w-full text-right border-collapse">
                <thead className="bg-[#2a3942] text-gray-400 text-xs uppercase font-bold tracking-widest">
                    <tr>
                        <th className="p-5">פעולה הנדסית</th>
                        <th className="p-5">שעה</th>
                        <th className="p-5">מיקום (איתוראן)</th>
                        <th className="p-5">משך PTO</th>
                        <th className="p-5">סטטוס חוק אורן</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-sm font-medium">
                    {timeline.map((item, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="p-5 font-black text-gray-200">{item.action}</td>
                            <td className="p-5 font-mono text-[#C9A227] font-bold">{item.time}</td>
                            <td className="p-5 text-gray-400 text-xs">{item.loc}</td>
                            <td className="p-5 font-mono">{item.duration === '-' ? '-' : `${item.duration} דק'`}</td>
                            <td className="p-5 text-left">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-tight ${item.status.includes('🟢') || item.status.includes('✅') ? 'bg-green-500/10 text-green-500 border border-green-500/30' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                                    {item.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
