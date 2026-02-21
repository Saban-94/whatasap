"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Truck, Clock, MessageSquare, RefreshCw } from "lucide-react"

// הגדרת טיפוס הנתונים עבור TypeScript
interface Driver {
  id: string;
  full_name: string;
  phone: string;
  status: 'active' | 'busy' | 'away';
  location?: string;
  vehicle_type?: string;
  last_update: string;
}

export default function MonitoringView() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // פונקציה למשיכת הנהגים מ-Supabase
  const fetchDrivers = async () => {
    setIsSyncing(true)
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('full_name', { ascending: true })
    
    if (error) {
      console.error('Error fetching drivers:', error)
    } else {
      setDrivers(data || [])
    }
    setLoading(false)
    setTimeout(() => setIsSyncing(false), 1000)
  }

  useEffect(() => {
    fetchDrivers()

    // הפעלת Realtime - האזנה לשינויים בבסיס הנתונים
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'drivers' },
        () => {
          console.log('Change detected, refreshing...')
          fetchDrivers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // פונקציה לשליחת וואטסאפ
  const sendWhatsApp = (phone: string, name: string) => {
    if (!phone) {
      alert("לא הוגדר מספר טלפון לנהג זה בבסיס הנתונים");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`היי ${name}, עדכון ממערכת סבן לוגיסטיקה: נא ליצור קשר בהקדם.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium italic">מתחבר לנתוני השטח של שחר...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">ניטור נהגים בזמן אמת</h2>
        {isSyncing && <Badge variant="outline" className="animate-pulse text-xs">מסנכרן נתונים...</Badge>}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {drivers.map((driver) => (
            <motion.div
              key={driver.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-all"
            >
              {/* Header: Driver Info & Status */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/10 shadow-inner">
                    <AvatarFallback className="bg-primary/5 text-primary font-bold text-lg">
                      {driver.full_name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-right">
                    <h3 className="font-bold text-base leading-none mb-1">{driver.full_name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                      {driver.vehicle_type || 'רכב כללי'} <Truck className="h-3 w-3" />
                    </p>
                  </div>
                </div>
                <Badge className={
                  driver.status === 'active' ? 'bg-green-500/10 text-green-600 border-green-200' : 
                  driver.status === 'busy' ? 'bg-orange-500/10 text-orange-600 border-orange-200' : 
                  'bg-slate-500/10 text-slate-600 border-slate-200'
                }>
                  {driver.status === 'active' ? '● פעיל' : driver.status === 'busy' ? '● עסוק' : '● לא זמין'}
                </Badge>
              </div>

              {/* Body: Details */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm py-2 border-b border-dashed border-muted">
                  <span className="font-semibold text-foreground">{driver.location || 'בדרך ליעד'}</span>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    מיקום נוכחי <MapPin className="h-3.5 w-3.5 text-primary/60" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-mono text-xs text-primary">{new Date(driver.last_update).toLocaleTimeString('he-IL')}</span>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    עדכון אחרון <Clock className="h-3.5 w-3.5 text-primary/60" />
                  </div>
                </div>
              </div>

              {/* Footer: Action */}
              <div className="mt-5">
                <Button 
                  onClick={() => sendWhatsApp(driver.phone, driver.full_name)}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold gap-2 shadow-sm transition-transform active:scale-95"
                >
                  <MessageSquare className="h-4 w-4" />
                  וואטסאפ לנהג
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {drivers.length === 0 && !loading && (
        <div className="text-center p-12 border-2 border-dashed rounded-xl">
          <p className="text-muted-foreground">לא נמצאו נהגים במערכת. הוסף נהגים ב-Supabase כדי להתחיל.</p>
        </div>
      )}
    </div>
  )
}
