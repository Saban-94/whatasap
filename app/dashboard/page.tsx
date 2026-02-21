"use client"

import { useState } from "react"
import { CrmSidebar, CrmView } from "@/components/dashboard/crm-sidebar"
import { TrainingView } from "@/components/dashboard/training-view"
import { MonitoringView } from "@/components/dashboard/monitoring-view"

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<CrmView>("monitoring")
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <CrmSidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />
      <main className="flex-1 overflow-y-auto">
        {activeView === "training" ? <TrainingView /> : <MonitoringView />}
      </main>
    </div>
  )
}
