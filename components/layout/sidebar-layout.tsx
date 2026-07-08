"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  BarChart3,
  Zap,
  Receipt,
  Menu,
  User,
  FileText,
  LifeBuoy,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
)
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

const navItems = [
  { label: "Portal Home", href: "/dashboard", icon: LayoutDashboard, portalOnly: true },
  { label: "Connection Dashboard", href: "/dashboard", icon: LayoutDashboard, connectionOnly: true },
  { label: "Usage", href: "/usage", icon: BarChart3, connectionOnly: true },
  { label: "Net Meter", href: "/net-meter", icon: Zap, connectionOnly: true },
  { label: "Billing", href: "/billing", icon: Receipt, connectionOnly: true },
  { label: "Services", href: "/services", icon: LifeBuoy, connectionOnly: true },
  { label: "Documents", href: "/documents", icon: FileText, connectionOnly: true },
  { label: "Profile", href: "/profile", icon: User, connectionOnly: true },
]

type Connection = { consumerNo: string; name: string }

function Sidebar({ consumerNo, className }: { consumerNo: string; className?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [connections, setConnections] = useState<Connection[]>(() => {
    try {
      const stored = localStorage.getItem("kpdcl_linked_consumers")
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error(e)
    }
    return [
      { consumerNo: "KPDCL-2024-001", name: "Mohammad Irfan" },
      { consumerNo: "KPDCL-2024-002", name: "Fatima Begum" }
    ]
  })

  // Dynamic reload from storage events (e.g. when connections are removed/linked)
  useEffect(() => {
    function handleStorageChange() {
      const stored = localStorage.getItem("kpdcl_linked_consumers")
      if (stored) {
        setConnections(JSON.parse(stored))
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const hasActiveConnection = !!consumerNo && consumerNo !== "undefined" && consumerNo !== "null"

  function handleConnectionChange(val: string | null) {
    if (!val) return
    if (val === "portal") {
      router.push("/dashboard")
    } else {
      router.push(`${pathname}?consumer=${val}`)
    }
  }

  return (
    <aside className={cn("flex h-full w-full md:w-66 flex-col bg-card", className)}>
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <Zap className="h-5 w-5 text-blue-600 animate-pulse" />
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-slate-800">KPDCL Consumer Portal</span>
          <span className="text-[10px] text-muted-foreground font-medium -mt-1">Government of J&K</span>
        </div>
      </div>

      {/* Connection Selector */}
      <div className="p-3">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5 px-1">
          Active Connection
        </label>
        <Select
          value={hasActiveConnection ? consumerNo : "portal"}
          onValueChange={handleConnectionChange}
        >
          <SelectTrigger className="w-full h-10 text-xs bg-slate-50 border-slate-200">
            <SelectValue placeholder="Select connection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="portal" className="text-xs font-medium">
              💼 All Connections (Portal)
            </SelectItem>
            {connections.map((c) => (
              <SelectItem key={c.consumerNo} value={c.consumerNo} className="text-xs">
                ⚡ {c.name} ({c.consumerNo})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator className="opacity-50" />

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          
          // Hide Connection Dashboard on portal view, hide Portal Home on connection view
          if (item.portalOnly && hasActiveConnection) return null
          if (item.connectionOnly && !hasActiveConnection) return null

          const targetHref = hasActiveConnection && !item.portalOnly
            ? `${item.href}?consumer=${consumerNo}`
            : item.href

          const active = pathname === item.href && (item.portalOnly ? !hasActiveConnection : true)

          return (
            <Link
              key={item.label}
              href={targetHref}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* Footer / Logout */}
      <div className="p-3 space-y-1.5 pb-8 md:pb-3">
        {hasActiveConnection && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50/50 border border-blue-100/50 px-2.5 py-1.5 mb-1">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-[10px] font-bold">
                {consumerNo.slice(-2)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate font-mono text-[10px] text-blue-800 font-semibold">{consumerNo}</span>
          </div>
        )}
        <a
          href="https://github.com/owaiss0/kpdcl"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <GithubIcon className="h-4 w-4 text-slate-700" />
          Open Source Code
        </a>
        <a
          href="/login"
          onClick={() => {
            localStorage.removeItem("kpdcl_user_session")
          }}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 bg-red-50/60 transition-colors hover:bg-red-100/80"
        >
          <LogOut className="h-4 w-4 text-red-600" />
          Logout
        </a>
        <div className="text-[10px] text-slate-700 font-bold text-center border-t border-slate-100/50 pt-2.5 mt-2">
          Built by Owais
        </div>
      </div>
    </aside>
  )
}

export default function SidebarLayout({
  children,
  consumerNo,
}: {
  children: React.ReactNode
  consumerNo: string
}) {
  return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <Sidebar consumerNo={consumerNo} className="border-r" />
      </div>

      {/* Mobile header + sheet */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 items-center justify-between border-b px-4 md:hidden bg-white">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" />}>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 max-w-[280px] animate-in slide-in-from-left duration-200">
                <Sidebar consumerNo={consumerNo} className="border-none" />
              </SheetContent>
            </Sheet>
            <Zap className="h-5 w-5 text-blue-600 animate-pulse" />
            <span className="font-bold text-sm tracking-tight text-slate-800">KPDCL Portal</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-700 font-bold">By Owais</span>
            <a 
              href="https://github.com/owaiss0/kpdcl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-900 p-1.5 rounded-lg border border-slate-200 bg-slate-50"
            >
              <GithubIcon className="h-4 w-4" />
            </a>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-slate-50/20">{children}</main>
      </div>
    </div>
  )
}
