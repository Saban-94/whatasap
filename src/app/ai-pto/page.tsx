'use client';
import React, { useState, useRef } from 'react';
import { FileText, MapPin, CheckCircle, AlertTriangle, Upload, Search, Database, HardHat } from 'lucide-react';

export default function LogisticsControlPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState({ dailyUsage: 142, limit: 1500 }); // מדמה את המכסה של Gemini

  // פונקציה מדומה להרצת הניתוח (כאן תבוא הפנייה ל-API שכתבנו)
  const runAnalysis = async () => {
    setIsAnalyzing(true);
    // מדמה המתנה לניתוח ה-OCR וההצלבה
    setTimeout(() => {
      setResults([
        { id: '6710537', customer: 'גל בן דוד', status: 'delivered', time: '12:21', location: 'טייבה', pto: '12 דקות', notes: 'הוחזר משטח (ירוק)', match: true },
        { id: '6710529', customer: 'ד.ניב/ב"ס ח', status: 'warning', time: '13:45', location: 'רעננה', pto: '2 דקות', notes: 'חסרה חותמת', match: false },
        { id: '6710552', customer: 'ינון אבני פ', status: 'delivered', time: '15:10', location: 'הרצליה', pto: '25 דקות', notes: 'תקין', match: true },
      ]);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b141a] text-white font-sans p-4 md:p-8">
      {/* Header - לוגו וסטטוס */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-[#C9A227] p-3 rounded-xl text-black shadow-lg">
            <HardHat size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">ח. סבן - מרכז בקרה לוגיסטי</h1>
            <p className="text-gray-400 text-sm italic">מערכת הצלבת תעודות ואיתוראן (מוח AI)</p>
          </div>
        </div>

        {/* מחוון מכסה - שלא תיחסם */}
        <div className="bg-[#202c33] p-3 rounded-lg border border-gray-700 flex items-center gap-4">
          <Database size={20} className="text-[#C9A227]" />
          <div>
            <p className="text-[10px] uppercase text-gray-500 font-bold">מכסה יומית (Gemini)</p>
            <div className="w-32 h-2 bg-gray-800 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${(stats.dailyUsage / stats.limit) * 100}%` }}></div>
            </div>
            <p className="text-[10px] mt-1 text-gray-400">{stats.dailyUsage} / {stats.limit} שאילתות נוצלו</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* פאנל העלאת קבצים */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#202c33] p-6 rounded-2xl border border-gray-700 shadow-xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Upload size={20} className="text-[#C9A227]" /> העלאת דוחות יומיים
            </h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-[#C9A227] transition-colors cursor-pointer group">
                <FileText className="mx-auto mb-2 text-gray-500 group-hover:text-[#C9A227]" />
                <p className="text-xs text-gray-400">גרור תעודות משלוח (PDF)</p>
              </div>

              <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-[#C9A227] transition-colors cursor-pointer group">
                <Search className="mx-auto mb-2 text-gray-500 group-hover:text-[#C9A227]" />
                <p className="text-xs text-gray-400">גרור דוח איתוראן (CSV)</p>
              </div>

              <button 
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="w-full bg-[#C9A227] text-black font-bold py-3 rounded-xl hover:bg-[#e0b52d] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? "מבצע הצלבה הנדסית..." : "הרץ ניתוח חוק אורן"}
              </button>
            </div>
          </div>

          <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-800 text-blue-200 text-xs leading-relaxed">
            <AlertTriangle size={16} className="mb-2" />
            <strong>חוק אורן פעיל:</strong> המערכת סורקת כעת הערות בעט ירוק, חותמות פרויקט, והחזרות משטחים אוטומטית.
          </div>
        </div>

        {/* פאנל תוצאות והצלבות */}
        <div className="lg:col-span-2">
          <div className="bg-[#202c33] rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold">דוח הצלבה: נהג חכמת (01/02)</h2>
              <span className="bg-green-900/30 text-green-400 text-[10px] px-2 py-1 rounded-full border border-green-800 font-bold uppercase tracking-wider">מעודכן</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="bg-[#2a3942] text-gray-300">
                    <th className="p-4">תעודה</th>
                    <th className="p-4">לקוח</th>
                    <th className="p-4">כתובת (איתוראן)</th>
                    <th className="p-4">זמן PTO</th>
                    <th className="p-4">הערות חכמת</th>
                    <th className="p-4">סטטוס</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {results.length > 0 ? results.map((res, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-[#C9A227]">{res.id}</td>
                      <td className="p-4 font-bold">{res.customer}</td>
                      <td className="p-4 text-xs text-gray-400">{res.location} ({res.time})</td>
                      <td className="p-4">{res.pto}</td>
                      <td className="p-4 text-[11px] text-green-400 italic font-medium">{res.notes}</td>
                      <td className="p-4">
                        {res.status === 'delivered' ? (
                          <CheckCircle className="text-green-500" size={18} />
                        ) : (
                          <AlertTriangle className="text-red-500" size={18} />
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="p-20 text-center text-gray-500 italic">
                        העלה קבצים כדי להתחיל בניתוח הנתונים...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
