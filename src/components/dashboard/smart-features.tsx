"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Brain, Zap, CheckCircle2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

export function AddressDetector() {
  const [isScanning, setIsScanning] = useState(true)

  return (
    <div className="crm-card p-5 border-primary/20 bg-primary/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-sm">זיהוי כתובות אוטומטי (Geocoding)</h3>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          פעיל
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        ה-AI סורק הודעות נכנסות ומזהה כתובות לניווט ב-Waze עבור הנהגים של סבן.
      </p>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 rounded bg-background/50 border text-[11px]">
          <span>"ויצמן 10, רעננה"</span>
          <span className="text-green-500 font-medium italic">זוהה בהצלחה</span>
        </div>
      </div>
    </div>
  )
}

export function MemoryRetrievalToggle() {
  const [enabled, setEnabled] = useState(true)

  return (
    <div className="crm-card p-5 border-blue-500/20 bg-blue-500/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          <div>
            <h3 className="font-bold text-sm">שליפת זיכרון וקטורי</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">חיבור אוטומטי להיסטוריית לקוחות</p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>
    </div>
  )
}
