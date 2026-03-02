"use client";
import { motion } from "framer-motion";

export const AnimatedOrb = () => {
  return (
    <div className="relative flex justify-center items-center py-10">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
      />
      <div className="relative z-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-2xl shadow-blue-500/50 flex items-center justify-center">
        <span className="text-white font-black italic text-xl">SABAN AI</span>
      </div>
    </div>
  );
};
