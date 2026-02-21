"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Truck, Clock, MessageSquare } from "lucide-react"

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

  const sendWhatsApp = (phone: string, name: string) => {
    if (!phone) {
      alert("לא הוגדר מספר טלפון לנהג זה");
      return;
    }
    // מנקה תווים שאינם מספרים מהטלפון
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`היי ${name}, יש לך עדכון חדש ממערכת סבן לוגיסטיקה. נא לבדוק את האפליקציה.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-bold">מאתר נהגים בזמן אמת...</div>

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
      <AnimatePresence>
        {drivers.map((driver) => (
          <motion.div
            key={driver.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/10">
                  <AvatarFallback className="bg-primary/5 text-primary font-bold">
                    {driver.full_name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-sm text-right">{driver.full_name}</h3>
                  <div className="flex items-center text-xs text-muted-foreground justify-end">
                    {driver.vehicle_type || 'כללי'} <Truck className="h-3 w-3 ml-1" />
                  </div>
                </div>
              </div>
              <Badge className={
                driver.status === 'active' ? 'bg-green-500/10 text-green-600 border-green-200' : 
                driver.status === 'busy' ? 'bg-orange-500/10 text-orange-600 border-orange-200' : 'bg-slate-500/10 text-slate-600'
              }>
                {driver.status === 'active' ? '● פעיל' : driver.status === 'busy' ? '● עסוק' : '● לא זמין'}
              </Badge>
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t border-dashed">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{driver.location || 'לא הוגדר'}</span>
                <div className="flex items-center text-muted-foreground">
                  <span className="mr-1">מיקום</span>
                  <MapPin className="h-4 w-4 text-primary/60" />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-xs font-mono">{new Date(driver.last_update).toLocaleTimeString('he-IL')}</span>
                <div className="flex items-center text-muted-foreground">
                  <span className="mr-1">עדכון</span>
                  <Clock className="h-4 w-4 text-primary/60" />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Button 
                onClick={() => sendWhatsApp(driver.phone, driver.full_name)}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex gap-2 items-center justify-center transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                שלח הודעת וואטסאפ
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
