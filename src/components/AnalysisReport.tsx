// src/components/AnalysisReport.tsx
export const AnalysisReport = ({ report }) => (
  <div className="max-w-md mx-auto bg-gray-50 p-4 rounded-[40px] shadow-2xl border-[8px] border-black min-h-[600px] font-sans rtl">
    <div className="w-32 h-6 bg-black mx-auto rounded-b-3xl mb-6"></div>
    <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">דוח בקרה - ח.סבן</h1>
    
    {report.map(item => (
      <div key={item.ticketId} className={`mb-4 p-5 rounded-3xl shadow-sm border-r-8 ${item.isAnomalous ? 'bg-red-50 border-red-500' : 'bg-white border-green-500'}`}>
        <div className="flex justify-between items-start mb-2">
          <span className="font-bold text-lg">{item.driver}</span>
          <span className="text-xs text-gray-500">{item.ticketId}</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">{item.address}</p>
        
        <div className="flex justify-between text-sm py-2 border-t border-gray-100">
          <span>דווח בתעודה: {item.reportedTime} דק'</span>
          <span className={item.isAnomalous ? 'text-red-600 font-bold' : ''}>אמת (איתורן): {item.actualTime} דק'</span>
        </div>

        {item.alerts.length > 0 && (
          <div className="mt-2 p-2 bg-red-100 rounded-xl text-xs text-red-700 font-bold">
            ⚠️ {item.alerts.join(' | ')}
          </div>
        )}
      </div>
    ))}
    
    <div className="mt-8 p-4 bg-blue-600 rounded-2xl text-white text-center shadow-lg">
      <p className="text-sm opacity-80">פוטנציאל חיסכון יומי זוהה:</p>
      <p className="text-2xl font-black">₪ {report.reduce((sum, i) => sum + i.loss, 0)}</p>
    </div>
  </div>
);
