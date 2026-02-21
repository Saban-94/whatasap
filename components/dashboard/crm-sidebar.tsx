"use client"

import { cn } from "@/lib/utils"
import { Brain, Activity, MessageSquare, Settings, ChevronRight, Truck } from "lucide-react"
import { motion } from "framer-motion"

export type CrmView = "training" | "monitoring"

interface CrmSidebarProps {
  activeView: CrmView
  onViewChange: (view: CrmView) => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const navItems: { id: CrmView; labelHe: string; icon: any; description: string }[] = [
  { id: "training", labelHe: "אימון AI וסקריפט", icon: Brain, description: "The Brain" },
  { id: "monitoring", labelHe: "ניטור בזמן אמת", icon: Activity, description: "The Dashboard" },
]

export function CrmSidebar({ activeView, onViewChange, collapsed = false, onToggleCollapse }: CrmSidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
      className="flex h-full flex-col border-l border-border bg-card overflow-hidden"
      dir="rtl"
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Truck className="h-5 w-5 text-primary" />
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-foreground truncate">Saban Logistics</span>
            <span className="text-xs text-muted-foreground truncate">מרכז בקרה AI</span>
          </div>
        )}
        <button onClick={onToggleCollapse} className="mr-auto h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent">
          <ChevronRight className={cn("h-4 w-4 transition-transform", !collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn("relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-right", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent")}
            >
              <item.icon className="h-5 w-5 shrink-0 relative z-10" />
              {!collapsed && (
                <div className="flex flex-col overflow-hidden relative z-10">
                  <span className="text-sm font-medium">{item.labelHe}</span>
                  <span className="text-[11px] opacity-70">{item.description}</span>
                </div>
              )}
            </button>
          )
        })}
      </nav>
    </motion.aside>
  )
}
