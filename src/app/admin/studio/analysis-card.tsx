// src/app/admin/studio/analysis-card.tsx

export const AnalysisCard = ({ data }: { data: any }) => (
      <div className="bg-white rounded-3xl p-5 shadow-xl border border-gray-100 mb-4 font-sans rtl">    <div className="flex justify-between items-center mb-4">
      <span className="text-gray-400 text-sm font-medium">{data.ticketId}</span>
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${data.isGapHigh ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
        {data.isGapHigh ? '🔴 חריגת זמן' : '✅ תקין'}
      </span>
    </div>

    <h3 className="text-xl font-bold text-gray-800 mb-1">{data.driver}</h3>
    <p className="text-gray-500 text-sm mb-4">{data.location}</p>

    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
      <div className="flex justify-between">
        <span className="text-gray-600">פער איתורן:</span>
        <span className={`font-bold ${data.isGapHigh ? 'text-red-600' : 'text-gray-800'}`}>{data.ptoGap} דקות</span>
      </div>
      
      {data.missingGear.length > 0 && (
        <div className="flex justify-between border-t pt-2">
          <span className="text-red-600 font-bold">חוסר בחיוב:</span>
          <span className="text-red-600 font-bold">{data.missingGear.join(', ')}</span>
        </div>
      )}
    </div>

    <div className="mt-4 text-center text-xs text-blue-500 font-medium">
      💡 "הראל, הנהג דיווח שעה, המנוף עבד 26 דק'. חסכון של בלה אחת זוהה."
    </div>
  </div>
);
