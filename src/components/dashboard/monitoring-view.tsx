"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase" // וודא שהקובץ הזה קיים ב-lib
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Activity, MapPin, Truck, Clock } from "lucide-react"

export default function MonitoringView() {
const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 1. פונקציה למשיכת נהגים
  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('full_name', { ascending: true })
    
    if (error) console.error('Error fetching drivers:', error)
    else setDrivers(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchDrivers()

    // 2. האזנה לשינויים בזמן אמת (Realtime)
    // זה יעדכן את המסך אוטומטית כשיש שינוי ב-DB
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'drivers' },
        () => fetchDrivers()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">מתחבר ללויין ומאתר נהגים...</div>

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence>
        {drivers.map((driver) => (
          <motion.div
            key={driver.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-card border rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/10">
                  <AvatarFallback className="bg-primary/5 text-primary">
                    {driver.full_name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-sm">{driver.full_name}</h3>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Truck className="h-3 w-3 mr-1" /> {driver.vehicle_type || 'לא הוגדר'}
                  </div>
                </div>
              </div>
              <Badge variant={driver.status === 'active' ? 'default' : 'secondary'} className={
                driver.status === 'active' ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : 
                driver.status === 'busy' ? 'bg-orange-500/10 text-orange-600' : 'bg-slate-500/10 text-slate-600'
              }>
                {driver.status === 'active' ? 'פעיל' : driver.status === 'busy' ? 'עסוק' : 'לא זמין'}
              </Badge>
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t border-dashed">
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-primary/60" />
                <span className="text-muted-foreground">מיקום:</span>
                <span className="mr-auto font-medium">{driver.location || 'לא ידוע'}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-primary/60" />
                <span className="text-muted-foreground">עדכון אחרון:</span>
                <span className="mr-auto text-xs">{new Date(driver.last_update).toLocaleTimeString('he-IL')}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
