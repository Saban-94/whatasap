"use client"

import { motion } from "framer-motion"

export default function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Blue Orb */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-[#0B2C63]/10 rounded-full blur-[120px]"
      />
      
      {/* Orange Orb */}
      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[10%] -right-[5%] w-[400px] h-[400px] bg-orange-200/20 rounded-full blur-[100px]"
      />
    </div>
  )
}
