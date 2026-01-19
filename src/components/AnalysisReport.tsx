'use client';

// src/components/AnalysisReport.tsx

export const AnalysisReport = ({ report }: { report: any }) => {
  // הגנה למקרה שהדוח ריק או לא הגיע
  if (!report || !Array.isArray(report)) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl shadow-xl">
        <p className="text-gray-500">ממתין לנתוני ניתוח...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 p-4 rounded-[40px] shadow-2xl border-[8px] border-black min-h-[600px] font-sans rtl" dir="rtl">
      {/* Notch סגנון אייפון */}
      <div className="w-32 h-6 bg-black mx-auto rounded-b-3xl mb-6"></div>
      
      <h1 className="text-2xl font-black text-center mb-6 text-gray-800">מרכז בקרה - ח.סבן</h1>
      
      <div className="space-y-4">
        {report.map((item: any) => (
          <div 
            key={item.ticketId || Math.random()} 
            className={`p-5 rounded-3xl shadow-sm border-r-8 transition-all ${
              item.isAnomalous ? 'bg-red-50 border-red-500' : 'bg-white border-green-500'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-lg text-gray-900">{item.driver}</span>
              {item.isAnomalous && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                  חריגה
                </span>
              )}
            </div>
            
            <div className="text-sm text-gray-600 mb-3">
              <p>📍 {item.address}</p>
              <p>📄 תעודה: {item.ticketId}</p>
            </div>

            {item.isAnomalous && (
              <div className="bg-white p-3 rounded-xl border border-red-100 mt-2">
                <p className="text-xs font-bold text-red-700">
                  ⚠️ {item.anomalyType || 'זוהה פער בנתונים'}
                </p>
                {item.loss > 0 && (
                  <p className="text-xs text-red-600 mt-1">אובדן מוערך: ₪{item.loss}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* סיכום חיסכון יומי */}
      <div className="mt-8 p-5 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl text-white text-center shadow-xl">
        <p className="text-sm opacity-90 mb-1">פוטנציאל חיסכון יומי זוהה:</p>
        <p className="text-3xl font-black">
          ₪ {report.reduce((sum: any, i: any) => sum + (Number(i.loss) || 0), 0)}
        </p>
      </div>

      <div className="mt-6 text-center">
        <p className="text-[10px] text-gray-400 font-medium">SABAN INTELLIGENCE SYSTEM v1.0</p>
      </div>
    </div>
  );
};
