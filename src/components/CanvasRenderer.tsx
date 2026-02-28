'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Info, PlayCircle, Package } from 'lucide-react';

export default function CanvasRenderer({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="space-y-6 w-full max-w-md mx-auto p-4" dir="rtl">
      {/* הודעת טקסט ראשית בתצורת Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[2rem] shadow-2xl"
      >
        <p className="text-lg font-medium leading-relaxed">{data.text}</p>
        <span className="text-[10px] text-[#10B981] font-bold uppercase mt-4 block tracking-widest">
          Source: {data.source}
        </span>
      </motion.div>

      {/* רינדור דינמי של קומפוננטות ה-UIBlueprint */}
      <AnimatePresence mode="popLayout">
        {data.components?.map((comp: any, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            {comp.type === 'calcCard' && (
              <div className="bg-[#0B2C63] border-l-4 border-[#10B981] p-5 rounded-2xl flex items-center gap-4 shadow-lg">
                <Box className="text-[#10B981]" size={32} />
                <div>
                  <h4 className="text-xs text-gray-400 font-bold uppercase">תוצאת חישוב</h4>
                  <p className="text-xl font-black">{comp.props.boxes} קרטונים</p>
                </div>
              </div>
            )}

            {comp.type === 'productCard' && (
              <div className="bg-[#1c272d] rounded-3xl overflow-hidden border border-gray-800 shadow-xl">
                <div className="h-40 bg-white p-4 flex items-center justify-center">
                  <img src={comp.props.image || "/avattar.png"} className="h-full object-contain" />
                </div>
                <div className="p-4 flex justify-between items-center">
                  <h3 className="font-bold">{comp.props.name}</h3>
                  <button className="bg-[#10B981] text-white px-4 py-2 rounded-full text-xs font-bold active:scale-95">הוסף</button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
