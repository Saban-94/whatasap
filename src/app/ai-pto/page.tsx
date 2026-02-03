'use client';
import React, { useState, useRef } from 'react';
import { Upload, HardHat, Loader2, CheckCircle, AlertCircle, Clock, BarChart3, ClipboardList } from 'lucide-react';

export default function SabanIntelligencePage() {
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

  // נתונים שהפקנו מהקבצים של חכמת
  const timeline = [
    { action: "פתיחת סוויץ'", time: "05:33", loc: "טייבה", duration: "-", delta: "-", status: "תקין" },
    { action: "פריקה 1", time: "07:08", loc: "הפרדס 21, הוד השרון", duration: "12.1", delta: "91 דק'", status: "תואם תעודה" },
    { action: "פריקה 2", time: "09:27", loc: "קהילת ורשה, ת\"א", duration: "17.1", delta: "139 דק'", status: "זיהוי חותמת ✅" },
    { action: "פריקה 3", time: "10:12", loc: "גבעת המורה, ת\"א", duration: "15.9", delta: "45 דק'", status: "תקין" },
    { action: "פריקה 4", time: "11:54", loc: "אלוף דוד 175, ר\"ג", duration: "22.8", delta: "102 דק'", status: "תקין" },
    { action: "פריקה 5", time: "14:02", loc: "יהודה הלוי 8, רעננה", duration: "18.9", delta: "128 דק'", status: "עט ירוק 🟢" },
    { action: "פריקה 6", time: "15:07", loc: "קקטוס 6, אבן יהודה", duration: "22.9", delta: "65 דק'", status: "תקין" },
  ];

  return (
    <div className="min-h-screen bg-[#0b141a] text-white p-4 md:p-8 font-sans rtl">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-800 pb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-[#C9A227] p-3 rounded-xl text-black shadow-lg"><HardHat size={32} /></div>
          <div>
            <h1 className="text-2xl font-black text-[#C9A227]">Saban PTO Intelligence</h1>
            <p className="text-gray-500 text-xs font-bold">LOGISTICS ANALYSIS CENTER</p>
          </div>
        </div>
        <button onClick={runAnalysis} disabled={isAnalyzing} className="bg-[#C9A227] text-black font-black px-8 py-3 rounded-xl hover:bg-[#e0b52d] transition-all flex items-center gap-2">
          {isAnalyzing ? <><Loader2 className="animate-spin" size={18}/> {status}</> : "הרץ ניתוח חוק אורן"}
        </button>
      </div>

      {!showResults ? (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-20">
            <div onClick={() => fileInputRef1.current?.click()} className="bg-[#162127] border-2 border-dashed border-gray-700 p-10 rounded-3xl text-center cursor-pointer hover:border-[#C9A227] transition-all">
                <input type="file" ref={fileInputRef1} className="hidden" />
                <Upload className="mx-auto mb-4 text-gray-500" size={40} />
                <p className="font-bold text-lg text-gray-300">טעינת תעודות (PDF)</p>
            </div>
            <div onClick={() => fileInputRef2.current?.click()} className="bg-[#162127] border-2 border-dashed border-gray-700 p-10 rounded-3xl text-center cursor-pointer hover:border-[#C9A227] transition-all">
                <input type="file" ref={fileInputRef2} className="hidden" />
                <BarChart3 className="mx-auto mb-4 text-gray-500" size={40} />
                <p className="font-bold text-lg text-gray-300">טעינת איתוראן (CSV)</p>
            </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
          
          {/* תובנות ניהוליות */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-900/20 border border-blue-800 p-6 rounded-2xl">
                <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2 tracking-tighter"><CheckCircle size={18}/> שיא יעילות פריקה</h3>
                <p className="text-2xl font-black text-white">12.1 דקות</p>
                <p className="text-xs text-blue-300 mt-1">אתר: הפרדס 21, הוד השרון</p>
            </div>
            <div className="bg-green-900/20 border border-green-800 p-6 rounded-2xl">
                <h3 className="text-green-400 font-bold mb-2 flex items-center gap-2 tracking-tighter"><ClipboardList size={18}/> חוק אורן: זיכויים</h3>
                <p className="text-2xl font-black text-white">1 זיהוי פעיל</p>
                <p className="text-xs text-green-300 mt-1">החזרת משטח בעט ירוק (יהודה הלוי)</p>
            </div>
            <div className="bg-red-900/20 border border-red-800 p-6 rounded-2xl">
                <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2 tracking-tighter"><Clock size={18}/> חריגת "זמן מת"</h3>
                <p className="text-2xl font-black text-white">139 דקות</p>
                <p className="text-xs text-red-300 mt-1">בין הוד השרון לקהילת ורשה</p>
            </div>
          </div>

          {/* ציר זמן מלא */}
          <div className="bg-[#162127] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 bg-[#202c33] border-b border-gray-800 flex justify-between">
                <h2 className="font-black text-xl flex items-center gap-2"><Clock className="text-[#C9A227]"/> ציר זמן לוגיסטי - חכמת</h2>
            </div>
            <table className="w-full text-right">
                <thead className="bg-[#2a3942] text-gray-400 text-xs uppercase">
                    <tr>
                        <th className="p-4">פעולה</th>
                        <th className="p-4">שעה</th>
                        <th className="p-4">מיקום</th>
                        <th className="p-4">משך PTO</th>
                        <th className="p-4">סטטוס חוק אורן</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-sm">
                    {timeline.map((item, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-bold">{item.action}</td>
                            <td className="p-4 font-mono text-[#C9A227]">{item.time}</td>
                            <td className="p-4 text-gray-400">{item.loc}</td>
                            <td className="p-4 font-mono">{item.duration === '-' ? '-' : `${item.duration} דק'`}</td>
                            <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${item.status.includes('🟢') || item.status.includes('✅') ? 'bg-green-500/10 text-green-500 border border-green-500/30' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
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
