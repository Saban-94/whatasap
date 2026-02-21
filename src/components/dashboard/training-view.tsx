"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  FileText,
  Upload,
  Save,
  Plus,
  Trash2,
  Database,
  Key,
  MapPin,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Code,
  Globe,
} from "lucide-react"

// --- Script Editor Section ---
function ScriptEditor() {
  const [scripts, setScripts] = useState([
    {
      id: "s1",
      name: "\u05EA\u05E1\u05E8\u05D9\u05D8 \u05D1\u05E8\u05DB\u05EA \u05D1\u05E8\u05D5\u05DB\u05D9\u05DD",
      content:
        'if (intent === "greeting") {\n  reply("\u05E9\u05DC\u05D5\u05DD! \u05D0\u05E0\u05D9 \u05D4\u05E2\u05D5\u05D6\u05E8 \u05D4\u05D7\u05DB\u05DD \u05E9\u05DC \u05D7.\u05E1\u05D1\u05DF \u05DC\u05D5\u05D2\u05D9\u05E1\u05D8\u05D9\u05E7\u05D4. \u05D0\u05D9\u05DA \u05D0\u05E4\u05E9\u05E8 \u05DC\u05E2\u05D6\u05D5\u05E8?");\n}',
      active: true,
    },
    {
      id: "s2",
      name: "\u05DE\u05E2\u05E7\u05D1 \u05DE\u05E9\u05DC\u05D5\u05D7",
      content:
        'if (intent === "track_shipment") {\n  const data = await getShipmentStatus(shipmentId);\n  reply(`\u05DE\u05E9\u05DC\u05D5\u05D7 ${shipmentId}: ${data.status}`);\n}',
      active: true,
    },
    {
      id: "s3",
      name: "\u05EA\u05D9\u05D0\u05D5\u05DD \u05E0\u05E1\u05D9\u05E2\u05D4",
      content:
        'if (intent === "schedule_trip") {\n  const route = await optimizeRoute(origin, destination);\n  reply(`\u05DE\u05E1\u05DC\u05D5\u05DC \u05DE\u05D5\u05DE\u05DC\u05E5: ${route.distance} \u05E7\u05F4\u05DE`);\n}',
      active: false,
    },
  ])
  const [selectedScript, setSelectedScript] = useState<string | null>("s1")
  const [editContent, setEditContent] = useState(scripts[0].content)

  const handleSelectScript = (id: string) => {
    setSelectedScript(id)
    const script = scripts.find((s) => s.id === id)
    if (script) setEditContent(script.content)
  }

  const handleSave = () => {
    if (!selectedScript) return
    setScripts((prev) =>
      prev.map((s) => (s.id === selectedScript ? { ...s, content: editContent } : s))
    )
  }

  const handleAddScript = () => {
    const newScript = {
      id: `s${Date.now()}`,
      name: `\u05E1\u05E7\u05E8\u05D9\u05E4\u05D8 \u05D7\u05D3\u05E9 ${scripts.length + 1}`,
      content: '// \u05DB\u05EA\u05D5\u05D1 \u05DB\u05D0\u05DF \u05D0\u05EA \u05D4\u05DC\u05D5\u05D2\u05D9\u05E7\u05D4 \u05E9\u05DC\u05DA\n',
      active: true,
    }
    setScripts((prev) => [...prev, newScript])
    setSelectedScript(newScript.id)
    setEditContent(newScript.content)
  }

  const handleDelete = (id: string) => {
    setScripts((prev) => prev.filter((s) => s.id !== id))
    if (selectedScript === id) {
      setSelectedScript(null)
      setEditContent("")
    }
  }

  const handleToggleActive = (id: string) => {
    setScripts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    )
  }

  return (
    <div className="crm-card overflow-hidden" dir="rtl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Code className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{"\u05E2\u05D5\u05E8\u05DA \u05E1\u05E7\u05E8\u05D9\u05E4\u05D8\u05D9\u05DD"}</h3>
            <p className="text-xs text-muted-foreground">Script Editor</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => {}}>
            <Upload className="h-3.5 w-3.5" />
            {"\u05D4\u05E2\u05DC\u05D0\u05D4"}
          </Button>
          <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddScript}>
            <Plus className="h-3.5 w-3.5" />
            {"\u05D7\u05D3\u05E9"}
          </Button>
        </div>
      </div>

      <div className="flex h-80">
        {/* Script list */}
        <ScrollArea className="w-56 border-l border-border">
          <div className="p-2 space-y-1">
            {scripts.map((script) => (
              <motion.button
                key={script.id}
                layout
                onClick={() => handleSelectScript(script.id)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-right transition-colors ${
                  selectedScript === script.id
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-accent"
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs font-medium truncate">{script.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge
                    variant={script.active ? "default" : "secondary"}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {script.active ? "\u05E4\u05E2\u05D9\u05DC" : "\u05DB\u05D1\u05D5\u05D9"}
                  </Badge>
                </div>
              </motion.button>
            ))}
          </div>
        </ScrollArea>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {selectedScript ? (
            <>
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
                <span className="text-xs text-muted-foreground font-mono">
                  {scripts.find((s) => s.id === selectedScript)?.name}
                </span>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={scripts.find((s) => s.id === selectedScript)?.active ?? false}
                    onCheckedChange={() => handleToggleActive(selectedScript)}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(selectedScript)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 relative">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="h-full w-full resize-none bg-background p-4 font-mono text-xs text-foreground leading-relaxed outline-none"
                  dir="ltr"
                  spellCheck={false}
                />
              </div>
              <div className="flex items-center justify-end gap-2 px-4 py-2 border-t border-border">
                <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave}>
                  <Save className="h-3.5 w-3.5" />
                  {"\u05E9\u05DE\u05D5\u05E8"}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              {"\u05D1\u05D7\u05E8 \u05E1\u05E7\u05E8\u05D9\u05E4\u05D8 \u05DC\u05E2\u05E8\u05D9\u05DB\u05D4"}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Knowledge Base Section ---
function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expanded, setExpanded] = useState(true)
  const memoryEntries = [
    { id: "m1", key: "\u05DC\u05E7\u05D5\u05D7_1042", value: "\u05DE\u05E9\u05DC\u05D5\u05D7 \u05DC\u05D7\u05D9\u05E4\u05D4 - \u05DE\u05D7\u05E1\u05DF B2", type: "shipment", date: "2026-02-20" },
    { id: "m2", key: "\u05E0\u05D4\u05D2_\u05EA\u05DC_\u05D0\u05D1\u05D9\u05D1", value: "\u05D5\u05D9\u05E6\u05DE\u05DF 10, \u05E8\u05E2\u05E0\u05E0\u05D4 -> \u05D3\u05E8\u05DA \u05D4\u05E9\u05DC\u05D5\u05DD 50, \u05EA\u05DC \u05D0\u05D1\u05D9\u05D1", type: "route", date: "2026-02-19" },
    { id: "m3", key: "\u05E0\u05D4\u05D2_\u05E6\u05E4\u05D5\u05DF", value: "\u05DE\u05E1\u05DC\u05D5\u05DC \u05DE\u05D4\u05D9\u05E8 \u05DC\u05D0\u05D9\u05DC\u05EA \u05D3\u05E8\u05DA 4", type: "driver", date: "2026-02-18" },
    { id: "m4", key: "\u05E2\u05D3\u05D9\u05E4\u05D5\u05EA_VIP", value: "\u05E8\u05E9\u05D9\u05DE\u05EA \u05DC\u05E7\u05D5\u05D7\u05D5\u05EA VIP \u05DE\u05E2\u05D5\u05D3\u05DB\u05E0\u05EA", type: "config", date: "2026-02-17" },
  ]

  const typeColors: Record<string, string> = {
    shipment: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    route: "bg-primary/10 text-primary border-primary/20",
    driver: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    config: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  }

  const filtered = memoryEntries.filter(
    (e) =>
      e.key.includes(searchQuery) ||
      e.value.includes(searchQuery)
  )

  return (
    <div className="crm-card overflow-hidden" dir="rtl">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between w-full px-5 py-4 text-right"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
            <Database className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{"\u05DE\u05D0\u05D2\u05E8 \u05D9\u05D3\u05E2 \u2013 Vector DB"}</h3>
            <p className="text-xs text-muted-foreground">Knowledge Base &middot; {memoryEntries.length} entries</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Separator />
            <div className="px-5 py-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={"\u05D7\u05D9\u05E4\u05D5\u05E9 \u05D1\u05DE\u05D0\u05D2\u05E8 \u05D4\u05D9\u05D3\u05E2..."}
                  className="pr-10 bg-muted/50 border-border text-sm"
                />
              </div>
            </div>
            <ScrollArea className="max-h-60">
              <div className="px-5 pb-4 space-y-2">
                {filtered.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <Badge variant="outline" className={`text-[10px] shrink-0 mt-0.5 ${typeColors[entry.type] || ""}`}>
                      {entry.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground font-mono">{entry.key}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.value}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{entry.date}</span>
                  </motion.div>
                ))}
                {filtered.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">{"\u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D5 \u05EA\u05D5\u05E6\u05D0\u05D5\u05EA"}</p>
                )}
              </div>
            </ScrollArea>
            <div className="px-5 py-3 border-t border-border flex items-center justify-between">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                {"\u05D4\u05D5\u05E1\u05E3 \u05E8\u05E9\u05D5\u05DE\u05D4"}
              </Button>
              <span className="text-[10px] text-muted-foreground">
                {"\u05E2\u05D3\u05DB\u05D5\u05DF \u05D0\u05D7\u05E8\u05D5\u05DF:"} {memoryEntries[0]?.date}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// --- API Config Section ---
function ApiConfig() {
  const [expanded, setExpanded] = useState(true)
  const [geminiKey, setGeminiKey] = useState("")
  const [mapsKey, setMapsKey] = useState("")
  const [geminiSaved, setGeminiSaved] = useState(false)
  const [mapsSaved, setMapsSaved] = useState(false)

  const handleSaveGemini = () => setGeminiSaved(true)
  const handleSaveMaps = () => setMapsSaved(true)

  return (
    <div className="crm-card overflow-hidden" dir="rtl">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between w-full px-5 py-4 text-right"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
            <Key className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{"\u05D4\u05D2\u05D3\u05E8\u05D5\u05EA API"}</h3>
            <p className="text-xs text-muted-foreground">Gemini & Google Maps Integration</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Separator />
            <div className="px-5 py-4 space-y-4">
              {/* Gemini API */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Gemini API Key
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => { setGeminiKey(e.target.value); setGeminiSaved(false) }}
                    placeholder="AIza..."
                    className="bg-muted/50 border-border text-sm font-mono"
                    dir="ltr"
                  />
                  <Button
                    size="sm"
                    variant={geminiSaved ? "outline" : "default"}
                    className={`shrink-0 text-xs gap-1 ${geminiSaved ? "text-primary border-primary/30" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                    onClick={handleSaveGemini}
                  >
                    {geminiSaved ? "\u05E0\u05E9\u05DE\u05E8" : "\u05E9\u05DE\u05D5\u05E8"}
                  </Button>
                </div>
              </div>

              {/* Google Maps API */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-foreground">
                  <Globe className="h-3.5 w-3.5 text-blue-400" />
                  Google Maps API Key
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="password"
                    value={mapsKey}
                    onChange={(e) => { setMapsKey(e.target.value); setMapsSaved(false) }}
                    placeholder="AIza..."
                    className="bg-muted/50 border-border text-sm font-mono"
                    dir="ltr"
                  />
                  <Button
                    size="sm"
                    variant={mapsSaved ? "outline" : "default"}
                    className={`shrink-0 text-xs gap-1 ${mapsSaved ? "text-primary border-primary/30" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                    onClick={handleSaveMaps}
                  >
                    {mapsSaved ? "\u05E0\u05E9\u05DE\u05E8" : "\u05E9\u05DE\u05D5\u05E8"}
                  </Button>
                </div>
              </div>

              {/* Status indicators */}
              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${geminiSaved ? "bg-primary" : "bg-muted-foreground/40"}`} />
                  <span className="text-[11px] text-muted-foreground">Gemini</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${mapsSaved ? "bg-primary" : "bg-muted-foreground/40"}`} />
                  <span className="text-[11px] text-muted-foreground">Maps</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// --- Main Training View ---
export function TrainingView() {
  return (
    <>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">{"\u05D0\u05D9\u05DE\u05D5\u05DF AI \u05D5\u05E1\u05E7\u05E8\u05D9\u05E4\u05D8"}</h1>
        </div>
        <p className="text-sm text-muted-foreground mr-8">
          {"\u05E0\u05D4\u05DC \u05D0\u05EA \u05D4\u05DE\u05D5\u05D7 \u05E9\u05DC \u05D4\u05E6\u05F2\u05D8\u05D1\u05D5\u05D8 \u2013 \u05E1\u05E7\u05E8\u05D9\u05E4\u05D8\u05D9\u05DD, \u05DE\u05D0\u05D2\u05E8 \u05D9\u05D3\u05E2 \u05D5\u05D7\u05D9\u05D1\u05D5\u05E8\u05D9 API"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <ScriptEditor />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <KnowledgeBase />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <ApiConfig />
      </motion.div>
    </>
  )
}
