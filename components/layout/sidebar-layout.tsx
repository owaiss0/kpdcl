"use client"

import { useState, useEffect, useRef } from "react"
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
  ChevronsUpDown,
  Check,
  Plus,
  Building2,
  PhoneCall,
  Activity,
  ArrowRight,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  DEFAULT_CONNECTIONS,
  getStoredConnections,
  getStoredSession,
  clearStoredSession,
  resetToDefaults,
  type Connection,
} from "@/lib/storage"

const navItems = [
  { label: "Portal Home", href: "/dashboard", icon: LayoutDashboard, portalOnly: true },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, connectionOnly: true },
  { label: "Daily & Hourly Usage", href: "/usage", icon: BarChart3, connectionOnly: true },
  { label: "Net Metering", href: "/net-meter", icon: Zap, connectionOnly: true },
  { label: "Billing & Ledger", href: "/billing", icon: Receipt, connectionOnly: true },
  { label: "Consumer Services", href: "/services", icon: LifeBuoy, connectionOnly: true },
  { label: "Documents & NOC", href: "/documents", icon: FileText, connectionOnly: true },
  { label: "Account Profile", href: "/profile", icon: User },
]

function Sidebar({
  consumerNo,
  className,
  onNavigate,
}: {
  consumerNo: string
  className?: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  
  const [connections, setConnections] = useState<Connection[]>(DEFAULT_CONNECTIONS)
  const [session, setSession] = useState<{ email: string } | null>(null)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const switcherRef = useRef<HTMLDivElement>(null)

  // Safe client hydration from localStorage
  useEffect(() => {
    function hydrate() {
      const stored = getStoredConnections()
      if (stored !== null) {
        setConnections(stored)
      }
      setSession(getStoredSession())
    }

    hydrate()
    window.addEventListener("storage", hydrate)
    return () => window.removeEventListener("storage", hydrate)
  }, [])

  // Close switcher dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setSwitcherOpen(false)
      }
    }
    if (switcherOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [switcherOpen])

  const hasActiveConnection = !!consumerNo && consumerNo !== "undefined" && consumerNo !== "null"
  const activeConnection = connections.find(c => c.consumerNo === consumerNo)

  // Bulletproof connection switch handler (prevents 404s)
  function handleConnectionSwitch(val: string) {
    setSwitcherOpen(false)
    if (onNavigate) onNavigate()
    if (val === "portal") {
      router.push("/dashboard")
      return
    }
    const validConsumerPages = ["/dashboard", "/profile", "/usage", "/net-meter", "/billing", "/services", "/documents"]
    const basePath = validConsumerPages.includes(pathname) ? pathname : "/dashboard"
    router.push(`${basePath}?consumer=${encodeURIComponent(val)}`)
  }

  function handleNavigateProfile() {
    setSwitcherOpen(false)
    if (onNavigate) onNavigate()
    const targetConsumer = hasActiveConnection ? consumerNo : (connections[0]?.consumerNo || "KPDCL-2024-001")
    router.push(`/profile?consumer=${encodeURIComponent(targetConsumer)}`)
  }

  // Initials for avatar
  const initials = hasActiveConnection
    ? (activeConnection?.name || "Consumer")
        .split(" ")
        .map(w => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "KP"

  const userInitials = activeConnection?.name
    ? activeConnection.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : (session?.email ? session.email.slice(0, 2).toUpperCase() : "MI")

  return (
    <aside className={cn("flex h-full w-full md:w-66 flex-col bg-card border-r select-none", className)}>
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs group-hover:scale-105 transition-transform duration-150">
            <Zap className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
              KPDCL Portal
            </span>
            <span className="text-[10px] text-muted-foreground font-medium -mt-0.5">Government of J&amp;K</span>
          </div>
        </Link>
        <span className="relative flex h-2 w-2" title="Grid Connected">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>

      {/* Lightweight, High-Performance Profile & Connection Switcher */}
      <div className="p-3 relative" ref={switcherRef}>
        <div className="flex items-center justify-between mb-1.5 px-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Active Connection
          </p>
          <span className="text-[10px] font-mono text-muted-foreground">
            {connections.length} Linked
          </span>
        </div>
        
        <button
          type="button"
          onClick={() => setSwitcherOpen(!switcherOpen)}
          className="w-full flex items-center justify-between gap-2.5 p-2 rounded-xl border bg-muted/40 hover:bg-muted/70 hover:border-primary/30 transition-all duration-150 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="h-8 w-8 shrink-0 ring-1 ring-border">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate leading-tight">
                {hasActiveConnection ? (activeConnection?.name || "Mohammad Irfan") : "Portal Overview"}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground truncate leading-tight mt-0.5">
                {hasActiveConnection ? consumerNo : `${connections.length} Accounts Linked`}
              </p>
            </div>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </button>

        {/* Custom Popover Content - zero lag, instant display */}
        {switcherOpen && (
          <div className="absolute top-full left-3 right-3 mt-1.5 z-50 rounded-xl border bg-popover p-1.5 shadow-xl text-popover-foreground animate-in fade-in-0 zoom-in-95 duration-75">
            <p className="text-[10px] uppercase font-semibold text-muted-foreground px-2 py-1">
              Switch Connection Profile
            </p>

            <div className="space-y-0.5 max-h-56 overflow-y-auto">
              {connections.map((c) => {
                const isSelected = consumerNo === c.consumerNo
                const cInitials = c.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                return (
                  <button
                    key={c.consumerNo}
                    type="button"
                    onClick={() => handleConnectionSwitch(c.consumerNo)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                      isSelected ? "bg-primary/10 font-medium text-primary" : "hover:bg-muted/70 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                          {cInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs truncate">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">{c.consumerNo}</p>
                      </div>
                    </div>
                    {isSelected ? (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Badge variant="outline" className="text-[9px] uppercase px-1 py-0 shrink-0 text-muted-foreground">
                        {c.type || "Domestic"}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="h-px bg-border my-1.5" />

            {/* Portal Overview option */}
            <button
              type="button"
              onClick={() => handleConnectionSwitch("portal")}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                !hasActiveConnection ? "bg-primary/10 font-medium text-primary" : "hover:bg-muted/70 text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs truncate">Portal Overview</p>
                  <p className="text-[10px] text-muted-foreground truncate">All {connections.length} linked accounts</p>
                </div>
              </div>
              {!hasActiveConnection && <Check className="h-4 w-4 text-primary shrink-0" />}
            </button>

            <div className="h-px bg-border my-1.5" />

            {/* Direct Quick Actions */}
            <button
              type="button"
              onClick={() => {
                setSwitcherOpen(false)
                if (onNavigate) onNavigate()
                router.push("/dashboard")
              }}
              className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-primary font-medium hover:bg-primary/10 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Link New Connection</span>
            </button>

            <button
              type="button"
              onClick={handleNavigateProfile}
              className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <User className="h-3.5 w-3.5" />
              <span>Manage Profile &amp; Contacts</span>
            </button>
          </div>
        )}
      </div>

      <Separator className="opacity-50" />

      {/* Navigation Section */}
      <div className="px-3 pt-3 pb-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2">
          Consumer Navigation
        </p>
      </div>

      {/* Navigation Links with Smooth Hover & Active States */}
      <nav className="flex-1 space-y-1 p-3 pt-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          
          if (item.portalOnly && hasActiveConnection) return null
          if (item.connectionOnly && !hasActiveConnection) return null

          const targetHref = item.href === "/profile"
            ? (hasActiveConnection ? `/profile?consumer=${consumerNo}` : `/profile?consumer=${connections[0]?.consumerNo || "KPDCL-2024-001"}`)
            : hasActiveConnection && !item.portalOnly
              ? `${item.href}?consumer=${consumerNo}`
              : item.href

          const active = pathname === item.href && (item.portalOnly ? !hasActiveConnection : true)

          return (
            <Link
              key={item.label}
              href={targetHref}
              onClick={() => onNavigate?.()}
              className={cn(
                "group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-150 outline-none",
                active
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-0.5"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                <span className="truncate">{item.label}</span>
              </div>
              {active ? (
                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground shrink-0" />
              ) : (
                <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      <Separator className="opacity-50" />

      {/* Official 24x7 Helpline Quick Banner */}
      <div className="p-3 pb-1">
        <a
          href="tel:1912"
          className="flex items-center justify-between p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100/70 transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-6 w-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <PhoneCall className="h-3 w-3" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold leading-tight">24x7 Helpline: 1912</p>
              <p className="text-[9px] text-blue-700/80 dark:text-blue-400 leading-tight">Toll-free power support</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[9px] font-semibold bg-white/80 dark:bg-card border-blue-300">
            Emergency
          </Badge>
        </a>
      </div>

      {/* Sidebar Footer with Logged In User Profile & Logout (OW logo removed) */}
      <div className="p-3 space-y-2 pb-6 md:pb-3">
        {/* Always-visible Reset Demo Data button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            resetToDefaults()
            router.push("/dashboard")
          }}
          className="w-full h-8 text-xs font-medium border-dashed border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:border-primary/40 gap-1.5 cursor-pointer shadow-none"
          title="Reset all connections and profile updates back to factory defaults"
        >
          <RotateCcw className="h-3.5 w-3.5 text-primary" />
          <span>Reset Demo Data</span>
        </Button>

        <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-8 w-8 shrink-0 ring-1 ring-border">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {session?.email?.split("@")[0] || activeConnection?.name || "Mohammad Irfan"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {session?.email || "consumer@kpdcl.jk.gov.in"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
            onClick={() => {
              clearStoredSession()
              router.push("/login")
            }}
            title="Log Out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Clean Official Portal Status (No OW / third-party logo) */}
        <div className="flex items-center justify-between px-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium">
            <Activity className="h-3 w-3 text-emerald-500" />
            <span>Smart Grid Online</span>
          </span>
          <span className="font-mono text-muted-foreground/70">KPDCL v2.6</span>
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
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <Sidebar consumerNo={consumerNo} />
      </div>

      {/* Mobile header + sheet */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b px-4 md:hidden bg-card shrink-0">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                <Menu className="h-4 w-4" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 max-w-[280px]">
                <Sidebar
                  consumerNo={consumerNo}
                  className="border-none"
                  onNavigate={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">KPDCL Portal</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetToDefaults()
                router.push("/dashboard")
              }}
              className="h-8 px-2 text-xs gap-1 border-dashed text-muted-foreground hover:text-foreground cursor-pointer"
              title="Reset Demo Data to factory defaults"
            >
              <RotateCcw className="h-3 w-3 text-primary" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <a 
              href="tel:1912" 
              className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30"
              title="Call Helpline 1912"
            >
              <PhoneCall className="h-3 w-3 text-blue-600" />
              <span>1912</span>
            </a>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/15">
          {children}
        </main>
      </div>
    </div>
  )
}
