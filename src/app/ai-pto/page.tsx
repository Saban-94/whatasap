'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Upload, HardHat, Loader2, CheckCircle, AlertCircle, Clock, Database, FilePlus, BarChart3 } from 'lucide-react';

export default function PtoAnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [status, setStatus] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const steps = [
    "מזהה נהג: חכמת (3)... [cite: 6]",
    "סורק תעודות: גל בן דוד, ינון אבני פ [cite: 14, 21]",
    "מזהה פרויקטים: ערוגת הבשם, ב\"ס חינוך מיוחד [cite: 29, 146]",
    "מנתח לוגיסטיקה: משטחי פקדון ומוצרי סיקה [cite: 70, 149]",
    "סורק חתימות ואישורי מסירה: Muntaser [cite: 174, 175]"
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

  // גלילה אוטומטית לתוצאות
  useEffect(() => {
    if (showResults && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showResults]);

  const timeline = [
    { id: "6710537", customer: "גל בן דוד", loc: "קהילת ורשה 45, תל אביב", duration: "12.1", status: "עט ירוק 🟢 [cite: 53, 70]" },
    { id: "6710529", customer: "ד.ניב/ב\"ס ח", loc: "רונית אלקבץ 8, הוד השרון", duration: "17.1", status: "חתימה: Muntaser [cite: 139, 174]" },
    { id: "6710552", customer: "ינון אבני פ", loc: "אלוף דוד 175, רמת גן", duration: "15.9", status: "תקין [cite: 183, 196]" },
    { id: "6710558", customer: "לירן/יהודה", loc: "יהודה הלוי 6, רעננה", duration: "22.8", status: "תקין [cite: 300, 308]" },
    { id: "6710559", customer: "ערוגת הבשם", loc: "קקטוס 4, אבן יהודה", duration: "18.9", status: "תקין [cite: 341, 355]" },
  ];

  return (
    <div className="min-h-screen bg-[#0b141a] text-white p-4 md:p-10 font-sans" dir="rtl">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 border-b border-gray-800 pb-8 gap-4">
        <div className="flex items-center gap-5">
          <div className="bg-[#C9A227] p-4 rounded-2xl text-black shadow-lg">
            <HardHat size={35} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#C9A227] tracking-tighter uppercase">Saban PTO Intelligence</h1>
            <p className="text-gray-500 text-xs font-bold tracking-widest mt-1">LOGISTICS ANALYSIS CENTER [cite: 1, 46]</p>
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

      <div className="max-w-7xl mx-auto">
        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div 
            onClick={() => fileInputRef1.current?.click()} 
            className="bg-[#162127] border-2 border-dashed border-gray-700 p-10 rounded-3xl text-center cursor-pointer hover:border-[#C9A227] transition-all group"
          >
            <input type="file" ref={fileInputRef1} className="hidden" accept=".pdf,.png,.jpg" />
            <FilePlus className="mx-auto mb-4 text-gray-500 group-hover:text-[#C9A227]" size={48} />
            <p className="text-xl font-bold text-gray-300 italic">טעינת תעודות משלוח [cite: 2]</p>
          </div>

          <div 
            onClick={() => fileInputRef2.current?.click()} 
            className="bg-[#162127] border-2 border-dashed border-gray-700 p-10 rounded-3xl text-center cursor-pointer hover:border-[#C9A227] transition-all group"
          >
            <input type="file" ref={fileInputRef2} className="hidden" accept=".csv" />
            <Database className="mx-auto mb-4 text-gray-500 group-hover:text-[#C9A227]" size={48} />
            <p className="text-xl font-bold text-gray-300 italic">טעינת דוחות איתוראן [cite: 435]</p>
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div ref={scrollRef} className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-900/10 border border-blue-800/40 p-6 rounded-3xl">
                  <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2 tracking-tighter text-sm"><CheckCircle size={16}/> יעד מוביל</h3>
                  <p className="text-3xl font-black text-white">תל אביב מרכז [cite: 70, 410]</p>
              </div>
              <div className="bg-green-900/10 border border-green-800/40 p-6 rounded-3xl">
                  <h3 className="text-green-400 font-bold mb-2 flex items-center gap-2 tracking-tighter text-sm"><Database size={16}/> חוק אורן: זיכוי</h3>
                  <p className="text-3xl font-black text-white">משטח סבן פקדון [cite: 70, 149]</p>
              </div>
              <div className="bg-red-900/10 border border-red-800/40 p-6 rounded-3xl">
                  <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2 tracking-tighter text-sm"><Clock size={16}/> נהג פעיל</h3>
                  <p className="text-3xl font-black text-white">חכמת (3) </p>
              </div>
            </div>

            <div className="bg-[#162127] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 bg-[#202c33] border-b border-gray-800">
                  <h2 className="font-black text-xl flex items-center gap-3"><Clock className="text-[#C9A227]"/> ציר זמן לוגיסטי - חכמת [cite: 6, 170]</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-[#2a3942] text-gray-400 text-xs uppercase font-bold">
                    <tr>
                      <th className="p-5">תעודה</th>
                      <th className="p-5">לקוח</th>
                      <th className="p-5">מיקום אספקה</th>
                      <th className="p-5">משך PTO (משוער)</th>
                      <th className="p-5 text-center">סטטוס</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-sm">
                    {timeline.map((item, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="p-5 font-black text-[#C9A227]">{item.id} [cite: 13, 137]</td>
                        <td className="p-5 font-bold">{item.customer} </td>
                        <td className="p-5 text-gray-400 text-xs">{item.loc} </td>
                        <td className="p-5 font-mono">{item.duration} דק'</td>
                        <td className="p-5 text-center">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black bg-green-500/10 text-green-500 border border-green-500/30">
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
