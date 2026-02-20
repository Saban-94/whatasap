import React from 'react';
import { Check, HelpCircle } from 'lucide-react';

export function AmbiguityCard({ input, candidates, qty, unit, onPick }: any) {
  return (
    <div className="bg-[#111b21] border border-[#C9A227]/50 rounded-2xl p-4 my-2 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center gap-2 mb-3 text-[#C9A227]">
        <HelpCircle size={18} />
        <span className="text-sm font-bold">מצאתי כמה אפשרויות ל"{input}":</span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {candidates.map((c: any) => (
          <button
            key={c.sku}
            onClick={() => onPick(c.sku)}
            className="flex justify-between items-center bg-[#202c33] hover:bg-[#2a3942] p-3 rounded-xl transition-all border border-transparent hover:border-[#00a884] group"
          >
            <span className="text-xs text-right text-gray-200">{c.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-mono">{c.sku}</span>
              <div className="w-5 h-5 rounded-full border border-gray-600 flex items-center justify-center group-hover:bg-[#00a884] group-hover:border-none">
                <Check size={12} className="text-white opacity-0 group-hover:opacity-100" />
              </div>
            </div>
          </button>
        ))}
      </div>
      {qty && (
        <p className="mt-3 text-[10px] text-gray-400 border-t border-gray-800 pt-2">
          כמות לרישום: <span className="text-white font-bold">{qty} {unit || "יח'"}</span>
        </p>
      )}
    </div>
  );
}
