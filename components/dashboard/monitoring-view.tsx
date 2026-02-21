"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Activity, AlertTriangle, Sparkles, Clock, MessageSquare, Eye } from "lucide-react"

export function MonitoringView() {
  const [conversations] = useState([
    { id: "c2", contact: "רמי - דיספצ'ר", status: "stuck", lastMessage: "אני צריך ניווט לויצמן 10 רעננה", stuckReason: "לא זוהה נתיב במאגר - נדרש Geocoding" }
  ]);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">ניטור שיחות לייב</h1>
        <Badge variant="outline" className="animate-pulse text-primary border-primary">LIVE</Badge>
      </div>

      <div className="space-y-4">
        {conversations.map((conv) => (
          <motion.div key={conv.id} layout className="p-4 border rounded-xl bg-card shadow-lg border-amber-500/20">
            <div className="flex items-start gap-4">
              <Avatar><AvatarFallback className="bg-amber-100 text-amber-600">רמ</AvatarFallback></Avatar>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-bold">{conv.contact}</span>
                  <Badge className="bg-amber-500/10 text-amber-600">תקוע</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{conv.lastMessage}</p>
                
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-amber-700">{conv.stuckReason}</span>
                </div>

                <Button className="mt-4 gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                  <Sparkles className="h-4 w-4" />
                  Gemini Fix: תקן סקריפט ושלח וייז
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
