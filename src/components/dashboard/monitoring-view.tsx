"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Eye,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"

interface LiveConversation {
  id: string
  contact: string
  initials: string
  lastMessage: string
  time: string
  status: "active" | "stuck" | "resolved"
  messageCount: number
  stuckReason?: string
}

const conversations: LiveConversation[] = [
  {
    id: "c1",
    contact: "\u05E9\u05D7\u05E8 - \u05DE\u05E0\u05D4\u05DC \u05E6\u05D9",
    initials: "\u05E9\u05D4",
    lastMessage: "\u05D0\u05D9\u05E4\u05D4 \u05D4\u05DE\u05E9\u05D0\u05D9\u05EA \u05DC\u05E8\u05DE\u05DC\u05D4?",
    time: "14:32",
    status: "active",
    messageCount: 12,
  },
  {
    id: "c2",
    contact: "\u05E8\u05DE\u05D9 - \u05D3\u05D9\u05E1\u05E4\u05E6\u05F4\u05E8",
    initials: "\u05E8\u05DE",
    lastMessage: "\u05D0\u05E0\u05D9 \u05E6\u05E8\u05D9\u05DA \u05E0\u05D9\u05D5\u05D5\u05D8 \u05DC\u05D5\u05D9\u05E6\u05DE\u05DF 10 \u05E8\u05E2\u05E0\u05E0\u05D4",
    time: "14:28",
    status: "stuck",
    messageCount: 8,
    stuckReason: "\u05DC\u05D0 \u05D6\u05D5\u05D4\u05D4 \u05DB\u05EA\u05D5\u05D1\u05EA \u05D1\u05DE\u05D0\u05D2\u05E8 - \u05E6\u05E8\u05D9\u05DA Geocoding",
  },
  {
    id: "c3",
    contact: "\u05D4\u05D6\u05DE\u05E0\u05D5\u05EA \u05DE\u05E9\u05E8\u05D3",
    initials: "\u05D4\u05D6",
    lastMessage: "\u05D4\u05D6\u05DE\u05E0\u05D4 2847 \u05D0\u05D5\u05E9\u05E8\u05D4",
    time: "14:15",
    status: "resolved",
    messageCount: 5,
  },
  {
    id: "c4",
    contact: "\u05DC\u05E7\u05D5\u05D7 VIP - \u05D0\u05DC\u05E7\u05D8\u05E8\u05D4",
    initials: "VIP",
    lastMessage: "\u05DE\u05D4 \u05D4\u05DE\u05D7\u05D9\u05E8 \u05DC\u05DE\u05E9\u05DC\u05D5\u05D7 \u05D3\u05D7\u05D5\u05E3?",
    time: "14:05",
    status: "stuck",
    messageCount: 15,
    stuckReason: "\u05E9\u05D0\u05DC\u05D4 \u05E2\u05DC \u05DE\u05D7\u05D9\u05E8 - \u05D0\u05D9\u05DF \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05D1\u05E1\u05E7\u05E8\u05D9\u05E4\u05D8",
  },
  {
    id: "c5",
    contact: "\u05E0\u05D4\u05D2 \u05D7\u05D3\u05E9 - \u05D1\u05D0\u05E8 \u05E9\u05D1\u05E2",
    initials: "\u05E0\u05D7",
    lastMessage: "\u05D4\u05E0\u05D4\u05D2 \u05D9\u05D5\u05E6\u05D0 \u05DE\u05D7\u05E8 \u05D1-6:00",
    time: "13:50",
    status: "active",
    messageCount: 3,
  },
]

const statusConfig = {
  active: { color: "bg-primary", label: "\u05E4\u05E2\u05D9\u05DC", badge: "bg-primary/10 text-primary border-primary/20" },
  stuck: { color: "bg-amber-500", label: "\u05EA\u05E7\u05D5\u05E2", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  resolved: { color: "bg-muted-foreground", label: "\u05E0\u05E4\u05EA\u05E8", badge: "bg-muted text-muted-foreground border-border" },
}

function GeminiFix({ conversation }: { conversation: LiveConversation }) {
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)

  const handleFix = async () => {
    setLoading(true)
    setSuggestion(null)
    // Simulate Gemini API call
    await new Promise((r) => setTimeout(r, 1500))
    const suggestions: Record<string, string> = {
      c2: "\u05D4\u05E6\u05E2\u05EA \u05EA\u05D9\u05E7\u05D5\u05DF: \u05D4\u05D5\u05E1\u05E3 Geocoding \u05DC\u05DB\u05EA\u05D5\u05D1\u05EA \"\u05D5\u05D9\u05E6\u05DE\u05DF 10, \u05E8\u05E2\u05E0\u05E0\u05D4\" \u05D5\u05E9\u05DC\u05D7 \u05E7\u05D9\u05E9\u05D5\u05E8 Waze \u05D0\u05D5\u05D8\u05D5\u05DE\u05D8\u05D9. \u05D4\u05E1\u05E7\u05E8\u05D9\u05E4\u05D8 \u05D7\u05E1\u05E8 \u05D4\u05EA\u05D9\u05D9\u05D7\u05E1\u05D5\u05EA \u05DC-intent \u05E9\u05DC address_navigation.",
      c4: "\u05D4\u05E6\u05E2\u05EA \u05EA\u05D9\u05E7\u05D5\u05DF: \u05D4\u05D5\u05E1\u05E3 \u05DC\u05E1\u05E7\u05E8\u05D9\u05E4\u05D8 \u05D8\u05D9\u05E4\u05D5\u05DC \u05D1-intent \u05E9\u05DC \"price_quote\". \u05D4\u05E9\u05EA\u05DE\u05E9 \u05D1\u05E0\u05D5\u05E1\u05D7\u05EA \u05D4\u05EA\u05DE\u05D7\u05D5\u05E8: \"\u05DE\u05D7\u05D9\u05E8 \u05DE\u05E9\u05DC\u05D5\u05D7 \u05D3\u05D7\u05D5\u05E3 \u05EA\u05DC\u05D5\u05D9 \u05D1\u05D2\u05D5\u05D3\u05DC \u05D4\u05DE\u05E9\u05DC\u05D5\u05D7 \u05D5\u05D4\u05DE\u05E8\u05D7\u05E7. \u05D0\u05E2\u05D3\u05DB\u05DF \u05D1\u05D4\u05E7\u05D3\u05DD\".",
    }
    setSuggestion(suggestions[conversation.id] || "\u05D4-AI \u05DC\u05D0 \u05DE\u05E6\u05D0 \u05D1\u05E2\u05D9\u05D4 \u05E1\u05E4\u05E6\u05D9\u05E4\u05D9\u05EA. \u05DE\u05D5\u05DE\u05DC\u05E5 \u05DC\u05D1\u05D3\u05D5\u05E7 \u05D0\u05EA \u05D4\u05E1\u05E7\u05E8\u05D9\u05E4\u05D8 \u05D9\u05D3\u05E0\u05D9\u05EA.")
    setLoading(false)
  }

  return (
    <div className="mt-2 space-y-2">
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
        onClick={handleFix}
        disabled={loading}
      >
        {loading ? (
          <RotateCcw className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        {loading ? "\u05D2\u05F2\u05DE\u05D9\u05E0\u05D9 \u05D1\u05D5\u05D3\u05E7..." : "Gemini Fix"}
      </Button>

      <AnimatePresence>
        {suggestion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 overflow-hidden"
          >
            <div className="flex items-start gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-foreground leading-relaxed">{suggestion}</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button size="sm" className="text-[10px] h-6 bg-primary text-primary-foreground hover:bg-primary/90">
                {"\u05D9\u05D9\u05E9\u05DD \u05EA\u05D9\u05E7\u05D5\u05DF"}
              </Button>
              <Button size="sm" variant="ghost" className="text-[10px] h-6 text-muted-foreground">
                {"\u05D4\u05EA\u05E2\u05DC\u05DD"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function MonitoringView() {
  const [filter, setFilter] = useState<"all" | "stuck" | "active">("all")

  const stats = {
    total: conversations.length,
    active: conversations.filter((c) => c.status === "active").length,
    stuck: conversations.filter((c) => c.status === "stuck").length,
    resolved: conversations.filter((c) => c.status === "resolved").length,
  }

  const filtered =
    filter === "all"
      ? conversations
      : conversations.filter((c) => c.status === filter)

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6 max-w-4xl mx-auto" dir="rtl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <Activity className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">{"\u05E0\u05D9\u05D8\u05D5\u05E8 \u05D1\u05D6\u05DE\u05DF \u05D0\u05DE\u05EA"}</h1>
            <div className="flex items-center gap-1.5 mr-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-primary font-medium">LIVE</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mr-8">
            {"\u05E9\u05D9\u05D7\u05D5\u05EA WhatsApp \u05E4\u05E2\u05D9\u05DC\u05D5\u05EA \u2013 \u05D6\u05D9\u05D4\u05D5\u05D9 \u05EA\u05E7\u05D9\u05E2\u05D5\u05EA \u05D5\u05EA\u05D9\u05E7\u05D5\u05E0\u05D9 Gemini"}
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-2 gap-3 md:grid-cols-4"
        >
          {[
            { label: "\u05E1\u05D4\u05F4\u05DB \u05E9\u05D9\u05D7\u05D5\u05EA", value: stats.total, icon: MessageSquare, color: "text-foreground" },
            { label: "\u05E4\u05E2\u05D9\u05DC\u05D5\u05EA", value: stats.active, icon: Zap, color: "text-primary" },
            { label: "\u05EA\u05E7\u05D5\u05E2\u05D5\u05EA", value: stats.stuck, icon: AlertTriangle, color: "text-amber-400" },
            { label: "\u05E0\u05E4\u05EA\u05E8\u05D5", value: stats.resolved, icon: CheckCircle2, color: "text-muted-foreground" },
          ].map((stat) => (
            <div key={stat.label} className="crm-card px-4 py-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          {(["all", "stuck", "active"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              className={`text-xs ${filter === f ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "\u05D4\u05DB\u05DC" : f === "stuck" ? "\u05EA\u05E7\u05D5\u05E2\u05D5\u05EA" : "\u05E4\u05E2\u05D9\u05DC\u05D5\u05EA"}
            </Button>
          ))}
          <span className="text-xs text-muted-foreground mr-auto">{filtered.length} {"\u05E9\u05D9\u05D7\u05D5\u05EA"}</span>
        </div>

        {/* Conversation List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((conv) => {
              const statusConf = statusConfig[conv.status]
              return (
                <motion.div
                  key={conv.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={`crm-card p-4 transition-shadow ${conv.status === "stuck" ? "crm-glow-sm border-amber-500/20" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className={`text-xs font-bold ${conv.status === "stuck" ? "bg-amber-500/10 text-amber-400" : "bg-primary/10 text-primary"}`}>
                        {conv.initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground truncate">{conv.contact}</span>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${statusConf.badge}`}>
                          {statusConf.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground shrink-0 mr-auto flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {conv.time}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground truncate mb-1">{conv.lastMessage}</p>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {conv.messageCount} {"\u05D4\u05D5\u05D3\u05E2\u05D5\u05EA"}
                        </span>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusConf.color} ${conv.status === "active" ? "animate-pulse" : ""}`} />
                      </div>

                      {/* Stuck reason */}
                      {conv.status === "stuck" && conv.stuckReason && (
                        <div className="mt-2 flex items-start gap-2 rounded-md bg-amber-500/5 border border-amber-500/15 px-3 py-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-amber-300/90">{conv.stuckReason}</p>
                        </div>
                      )}

                      {/* Gemini Fix for stuck conversations */}
                      {conv.status === "stuck" && <GeminiFix conversation={conv} />}
                    </div>

                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {"\u05D0\u05D9\u05DF \u05E9\u05D9\u05D7\u05D5\u05EA \u05D1\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4 \u05D6\u05D5"}
            </div>
          )}
        </motion.div>
      </div>
    </ScrollArea>
  )
}
