"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Database, Key, MapPin, Search, ChevronDown, ChevronUp, Sparkles, BookOpen, Code, Save, Trash2, Plus } from "lucide-react"

export function TrainingView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [geminiKey, setGeminiKey] = useState("")
  
  const memoryEntries = [
    { id: "m1", key: "לקוח_1042", value: "משלוח לחיפה - מחסן B2", type: "shipment", date: "2026-02-20" },
    { id: "m2", key: "כתובת_רעננה", value: "ויצמן 10, רעננה", type: "route", date: "2026-02-19" },
  ];

  const getWazeLink = (addr: string) => `https://www.waze.com/ul?q=${encodeURIComponent(addr)}&navigate=yes`;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">ניהול מוח ה-AI - סבן לוגיסטיקה</h1>
      </div>

      {/* API Keys Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-4 border rounded-xl bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Key className="h-4 w-4 text-amber-500" />
            <h2 className="font-semibold">הגדרות Gemini API</h2>
          </div>
          <Input 
            type="password" 
            placeholder="AIza..." 
            value={geminiKey} 
            onChange={(e) => setGeminiKey(e.target.value)}
            className="mb-2"
          />
          <Button size="sm" className="w-full">שמור מפתח</Button>
        </div>

        {/* Knowledge Base */}
        <div className="p-4 border rounded-xl bg-card shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <h2 className="font-semibold">מאגר ידע (Vector DB)</h2>
            </div>
            <Badge>{memoryEntries.length} רשומות</Badge>
          </div>
          <ScrollArea className="h-40">
            {memoryEntries.map(entry => (
              <div key={entry.id} className="p-2 mb-2 border rounded bg-muted/50 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold">{entry.key}</p>
                  <p className="text-xs text-muted-foreground">{entry.value}</p>
                </div>
                {entry.type === "route" && (
                  <Button size="icon" variant="ghost" onClick={() => window.open(getWazeLink(entry.value))}>
                    <MapPin className="h-4 w-4 text-primary" />
                  </Button>
                )}
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
