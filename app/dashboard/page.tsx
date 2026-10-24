"use client"

import { Suspense, useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { 
  CreditCard, Plus, Zap,
  MapPin, LifeBuoy, ArrowRight, ClipboardList, Trash2,
  Copy, Check, FileText, BarChart3,
  TrendingUp, Activity, PhoneCall,
  ChevronRight, Sparkles, Building2,
  CheckCircle2, ArrowLeft
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import SidebarLayout from "@/components/layout/sidebar-layout"
import { fetchConsumerByNo, fetchCurrentBill, fetchRecentPayments } from "@/data/demo"
import type { Consumer, Bill, Payment } from "@/data/types"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from "recharts"

// Monthly billing & consumption demo data (Chart color: Green as per user style guidelines)
const paymentChartData = [
  { month: "Jan", amount: 1200, units: 280 },
  { month: "Feb", amount: 1450, units: 310 },
  { month: "Mar", amount: 2100, units: 420 },
  { month: "Apr", amount: 1620, units: 340 },
  { month: "May", amount: 1845, units: 390 },
  { month: "Jun", amount: 500, units: 110 },
]

type Connection = { consumerNo: string; name: string; type?: string; balance?: number; address?: string }

const DEFAULT_CONNECTIONS: Connection[] = [
  { consumerNo: "KPDCL-2024-001", name: "Mohammad Irfan", type: "Domestic", balance: 500, address: "House No. 42, Colony Road, Srinagar" },
  { consumerNo: "KPDCL-2024-002", name: "Fatima Begum", type: "Commercial", balance: 0, address: "Shop No. 12, Main Bazaar, Anantnag" }
]

function formatDate(dateStr: string): string {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${d.getDate().toString().padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function DashboardInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const consumerNo = searchParams.get("consumer")

  const [mounted, setMounted] = useState(false)
  const [session, setSession] = useState<{ email: string } | null>(null)
  
  // Account portal connections state initialized with deterministic defaults
  const [connections, setConnections] = useState<Connection[]>(DEFAULT_CONNECTIONS)
  const [newConsumerNo, setNewConsumerNo] = useState("")
  const [newName, setNewName] = useState("")
  const [linkError, setLinkError] = useState("")
  const [linkSuccess, setLinkSuccess] = useState("")

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Chart view mode (amount vs units)
  const [chartMode, setChartMode] = useState<"amount" | "units">("amount")

  // Disconnect connection modal state
  const [confirmRemoveConsumer, setConfirmRemoveConsumer] = useState<string | null>(null)

  // Connection-specific states
  const [consumer, setConsumer] = useState<Consumer | null>(null)
  const [currentBill, setCurrentBill] = useState<Bill | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])

  // Copy helper
  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Hydrate client state from localStorage safely after mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    try {
      const stored = localStorage.getItem("kpdcl_linked_consumers")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = parsed.map((item: Connection) => {
            const def = DEFAULT_CONNECTIONS.find(d => d.consumerNo === item.consumerNo)
            return {
              ...item,
              address: item.address || def?.address || "Srinagar, J&K"
            }
          })
          setConnections(merged)
        }
      }
      const sess = localStorage.getItem("kpdcl_user_session")
      if (sess) setSession(JSON.parse(sess))
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Sync connections to storage only after mounted
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("kpdcl_linked_consumers", JSON.stringify(connections))
    }
  }, [connections, mounted])

  // Load connection-specific details
  useEffect(() => {
    if (consumerNo && consumerNo !== "undefined" && consumerNo !== "null") {
      fetchConsumerByNo(consumerNo).then(setConsumer)
      fetchCurrentBill(consumerNo).then(setCurrentBill)
      fetchRecentPayments(consumerNo).then(setPayments)
    }
  }, [consumerNo])

  // Link connection handler
  function handleLinkConnection(e: React.FormEvent) {
    e.preventDefault()
    setLinkError("")
    setLinkSuccess("")

    if (!newConsumerNo.trim() || !newName.trim()) {
      setLinkError("Please enter both Name and Consumer Number")
      return
    }

    const cNo = newConsumerNo.trim().toUpperCase()
    if (connections.some(c => c.consumerNo === cNo)) {
      setLinkError("This consumer connection is already linked to your account.")
      return
    }

    const newConn: Connection = {
      consumerNo: cNo,
      name: newName.trim(),
      type: "Domestic",
      balance: 0,
      address: "Srinagar, J&K"
    }

    const updated = [...connections, newConn]
    setConnections(updated)
    localStorage.setItem("kpdcl_linked_consumers", JSON.stringify(updated))
    setNewConsumerNo("")
    setNewName("")
    setLinkSuccess(`Successfully linked connection: ${cNo}`)
    
    // Auto-update Sidebar select dropdown trigger
    window.dispatchEvent(new Event('storage'))
  }

  // Remove connection handler
  function handleConfirmRemove() {
    if (!confirmRemoveConsumer) return

    const updated = connections.filter(c => c.consumerNo !== confirmRemoveConsumer)
    setConnections(updated)
    localStorage.setItem("kpdcl_linked_consumers", JSON.stringify(updated))
    setConfirmRemoveConsumer(null)

    // Auto-update Sidebar dropdown selector
    window.dispatchEvent(new Event('storage'))
  }

  // Total outstanding across all linked accounts
  const totalBalance = useMemo(() => {
    return connections.reduce((acc, c) => acc + (c.balance || 0), 0)
  }, [connections])

  // ════════════════════════════════════════════════════════════════
  // RENDER SCENARIO 1: Individual Connection Detailed Dashboard
  // ════════════════════════════════════════════════════════════════
  if (consumerNo && consumerNo !== "undefined" && consumerNo !== "null") {
    if (!consumer) {
      return (
        <SidebarLayout consumerNo={consumerNo}>
          <div className="flex flex-col items-center justify-center py-24 space-y-3 text-muted-foreground">
            <Activity className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading electricity connection details...</p>
          </div>
        </SidebarLayout>
      )
    }

    return (
      <SidebarLayout consumerNo={consumerNo}>
        <div className="space-y-6">
          
          {/* Top Breadcrumb & Hero Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push("/dashboard")}
                  className="h-6 px-1.5 -ml-1 text-xs text-muted-foreground hover:text-foreground gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Portal Overview
                </Button>
                <span>/</span>
                <span className="font-mono font-medium text-foreground">{consumer.consumerNo}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {consumer.name}
                </h1>
                <Badge variant="outline" className="text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                  {consumer.category}
                </Badge>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Smart AMI Online
                </span>
              </div>

              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{consumer.address}</span>
              </p>
            </div>

            {/* Quick Header Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/documents?consumer=${consumerNo}`)}
                className="text-xs h-9 gap-1.5"
              >
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span>View Bill</span>
              </Button>
              <Button 
                size="sm"
                onClick={() => router.push(`/billing?consumer=${consumerNo}`)}
                className="text-xs h-9 gap-1.5 shadow-xs"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Pay Outstanding</span>
              </Button>
            </div>
          </div>

          {/* 4 Metric KPI Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* KPI 1: Outstanding Bill */}
            <Card className="border shadow-xs">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Outstanding Dues</span>
                  <Badge variant="outline" className={currentBill?.status === "unpaid" ? "bg-red-50 text-red-700 border-red-200 text-[10px]" : "bg-emerald-50 text-emerald-700 text-[10px]"}>
                    {currentBill?.status === "unpaid" ? "Due" : "Cleared"}
                  </Badge>
                </div>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  ₹{currentBill ? currentBill.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}
                </p>
                <p className="text-[11px] text-muted-foreground" suppressHydrationWarning>
                  {currentBill ? `Due by ${formatDate(currentBill.dueDate)}` : "No pending bills"}
                </p>
              </CardContent>
            </Card>

            {/* KPI 2: Sanctioned Load */}
            <Card className="border shadow-xs">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Sanctioned Load</span>
                  <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                    {consumer.connectionType}
                  </Badge>
                </div>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {consumer.sanctionedLoad} <span className="text-sm font-normal text-muted-foreground">kW</span>
                </p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Peak Demand: 3.8 kW</span>
                  <span className="text-emerald-600 font-medium">Within limit</span>
                </div>
              </CardContent>
            </Card>

            {/* KPI 3: Smart AMI Meter */}
            <Card className="border shadow-xs">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Smart AMI Meter</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                    Active
                  </Badge>
                </div>
                <p className="font-mono text-xl font-bold text-foreground truncate">
                  {consumer.meterSerialNo}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  15-min interval sync • 100% Signal
                </p>
              </CardContent>
            </Card>

            {/* KPI 4: Monthly Consumption */}
            <Card className="border shadow-xs">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">May 2026 Usage</span>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" /> -4.2%
                  </span>
                </div>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  390 <span className="text-sm font-normal text-muted-foreground">kWh</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Avg 12.6 units / day
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main 2-Column Section */}
          <div className="grid gap-6 lg:grid-cols-12">
            
            {/* Left 8 Cols: Charts, Recent Payments & Shortcuts */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Consumption / Bill Outflow Chart */}
              <Card className="border shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold">Consumption &amp; Billing History</CardTitle>
                    <CardDescription className="text-xs">
                      Past 6 months analytics for account {consumer.accountId}
                    </CardDescription>
                  </div>
                  {/* Mode switch */}
                  <div className="flex items-center rounded-lg border bg-muted/40 p-0.5 text-xs">
                    <button
                      onClick={() => setChartMode("amount")}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                        chartMode === "amount" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Billed (₹)
                    </button>
                    <button
                      onClick={() => setChartMode("units")}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                        chartMode === "units" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Units (kWh)
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={paymentChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                          contentStyle={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            fontSize: '12px'
                          }}
                          formatter={(val) => [
                            chartMode === "amount" ? `₹${Number(val).toLocaleString("en-IN")}` : `${val} kWh`,
                            chartMode === "amount" ? "Billed Amount" : "Units Consumed"
                          ]}
                        />
                        {/* Green chart color as instructed by user rules */}
                        <Bar
                          dataKey={chartMode === "amount" ? "amount" : "units"}
                          fill="#16a34a"
                          radius={[4, 4, 0, 0]}
                          isAnimationActive={false}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t mt-2 text-center text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">6-Month Average</span>
                      <span className="font-semibold text-foreground">₹1,452.50</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Highest Bill</span>
                      <span className="font-semibold text-foreground">₹2,100.00 (Mar)</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Total Paid 2026</span>
                      <span className="font-semibold text-emerald-600">₹8,715.50</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Payments Ledger */}
              <Card className="border shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base font-semibold">Recent Credit Transactions</CardTitle>
                    <CardDescription className="text-xs">Latest bill payments and recharge transactions</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/billing?consumer=${consumerNo}`)}
                    className="text-xs text-primary hover:text-primary gap-1"
                  >
                    View All <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y text-xs">
                    {payments.slice(0, 4).map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3.5 hover:bg-muted/40 transition">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground flex items-center gap-2">
                              <span>₹{p.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                              <Badge variant="outline" className="text-[10px] uppercase font-mono px-1 py-0">
                                {p.method}
                              </Badge>
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                              <span suppressHydrationWarning>{formatDate(p.paidAt)}</span>
                              <span>•</span>
                              <span className="font-mono">Ref: {p.transactionId}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleCopy(p.transactionId, p.id)}
                            title="Copy Transaction ID"
                          >
                            {copiedKey === p.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </div>
                    ))}
                    {payments.length === 0 && (
                      <p className="py-6 text-center text-xs text-muted-foreground">
                        No transactions recorded for this account.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Fast Action Shortcuts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/usage?consumer=${consumerNo}`)}
                  className="h-auto p-3 flex flex-col items-center justify-center gap-1.5 border shadow-2xs hover:border-primary/50"
                >
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold">Usage Trends</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/net-meter?consumer=${consumerNo}`)}
                  className="h-auto p-3 flex flex-col items-center justify-center gap-1.5 border shadow-2xs hover:border-primary/50"
                >
                  <Zap className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold">Net Meter</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/documents?consumer=${consumerNo}`)}
                  className="h-auto p-3 flex flex-col items-center justify-center gap-1.5 border shadow-2xs hover:border-primary/50"
                >
                  <FileText className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-semibold">Certificates</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/services?consumer=${consumerNo}`)}
                  className="h-auto p-3 flex flex-col items-center justify-center gap-1.5 border shadow-2xs hover:border-primary/50"
                >
                  <LifeBuoy className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-semibold">Services Hub</span>
                </Button>
              </div>

            </div>

            {/* Right 4 Cols: Account Details & Subdivision Info */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Account Master Details */}
              <Card className="border shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Connection Records</CardTitle>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      KPDCL Central
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">Official billing profile details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  
                  <div className="rounded-lg border bg-muted/30 p-2.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase block">Account ID</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono font-bold text-foreground text-sm">{consumer.accountId}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => handleCopy(consumer.accountId, "acc")}
                      >
                        {copiedKey === "acc" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Consumer No.</span>
                      <span className="font-mono font-medium">{consumer.consumerNo}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Registered Name</span>
                      <span className="font-medium text-foreground">{consumer.name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium">{consumer.category} ({consumer.connectionType})</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Sanctioned Load</span>
                      <span className="font-medium text-foreground">{consumer.sanctionedLoad} kW</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Meter Serial</span>
                      <span className="font-mono font-medium">{consumer.meterSerialNo}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Mobile</span>
                      <span className="font-mono">{consumer.mobile}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Email</span>
                      <span className="truncate max-w-[150px]">{consumer.email}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/profile?consumer=${consumerNo}`)}
                      className="w-full text-xs h-8"
                    >
                      Edit Profile Information
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Electricity Sub-Division & Helpline Card */}
              <Card className="border bg-linear-to-br from-blue-50/40 to-indigo-50/20 dark:from-blue-950/20 dark:to-indigo-950/10 shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-primary" />
                    Feeder &amp; Sub-Division
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Supply Feeder</span>
                    <span className="font-semibold text-foreground">11 kV Rajbagh Feeder (Grid Station Bemina)</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Electric Sub-Division</span>
                    <span className="font-medium text-foreground">Sub-Division II (ED-II Srinagar)</span>
                  </div>
                  <div className="rounded-lg border bg-background/80 p-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Emergency Outage Line</p>
                      <p className="text-[11px] text-muted-foreground">24x7 DISCOM Control Room</p>
                    </div>
                    <span className="text-base font-bold text-primary font-mono">1912</span>
                  </div>
                </CardContent>
              </Card>

            </div>

          </div>

        </div>
      </SidebarLayout>
    )
  }

  // ════════════════════════════════════════════════════════════════
  // RENDER SCENARIO 2: Central Account Portal Overview
  // ════════════════════════════════════════════════════════════════
  return (
    <SidebarLayout consumerNo="">
      <div className="space-y-6">
        
        {/* Modern Welcome Banner */}
        <div className="rounded-2xl border bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 shadow-md relative overflow-hidden">
          <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center pr-12 pointer-events-none">
            <Zap className="h-52 w-52" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-blue-200 mb-2">
              <Sparkles className="h-3 w-3" /> Kashmir Power Distribution Corporation Limited
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {session?.email?.split("@")[0] || "Consumer"}!
            </h1>
            <p className="text-blue-100/80 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Centralized consumer portal to monitor multiple electricity accounts, track smart meters, clear bills, and manage DISCOM citizen services.
            </p>

            {/* Quick Metrics Pills inside Banner */}
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/10 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>{connections.length} Linked Connections</span>
              </div>
              <span className="text-white/30">•</span>
              <div>
                <span>Wallet: <strong>₹{totalBalance.toLocaleString("en-IN")}</strong></span>
              </div>
              <span className="text-white/30">•</span>
              <div className="flex items-center gap-1">
                <PhoneCall className="h-3 w-3 text-blue-300" />
                <span>Helpline: <strong>1912</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid gap-6 lg:grid-cols-12">
          
          {/* Left Column: Linked Connections & Service Status */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Linked Power Connections */}
            <Card className="border shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Your Linked Power Connections
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Select a connection to view detailed consumption graphs, ledger, and bills
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-semibold">
                  {connections.length} Accounts
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {connections.map((c) => (
                  <div 
                    key={c.consumerNo}
                    onClick={() => router.push(`/dashboard?consumer=${c.consumerNo}`)}
                    className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-card hover:border-primary hover:shadow-xs transition duration-150 cursor-pointer overflow-hidden"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-sm text-foreground group-hover:text-primary transition">
                          {c.name}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold bg-muted/50">
                          {c.type || "Domestic"}
                        </Badge>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                        </span>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground">
                        Consumer ID: <span className="font-semibold text-foreground">{c.consumerNo}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {c.address || "Srinagar, J&K"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0">
                      <div className="text-left sm:text-right mr-1">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">Wallet / Credit</p>
                        <p className="text-sm font-bold text-foreground">
                          ₹{c.balance !== undefined ? c.balance.toLocaleString("en-IN") : "0"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs font-semibold gap-1 text-primary hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard?consumer=${c.consumerNo}`)
                          }}
                        >
                          <span>Manage</span>
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfirmRemoveConsumer(c.consumerNo)
                          }}
                          title="Remove Connection"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Service Requests Tracker */}
            <Card className="border shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Service Requests Tracker
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Live status of official applications and connection modifications
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/services")}
                  className="text-xs text-primary hover:text-primary gap-1"
                >
                  View All Services <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-5 pt-1">
                {/* Request 1 */}
                <div className="relative pl-6 border-l space-y-2">
                  <div className="absolute -left-[6.5px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/10" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">Solar Agreement (PM Surya Ghar Net-Meter)</h4>
                      <p className="text-[11px] text-muted-foreground font-mono">App #SOL-2026-9812 • KPDCL-2024-001</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 w-fit">
                      Under Verification
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 max-w-sm pt-1">
                    <div className="text-center">
                      <div className="text-[9px] font-bold text-primary">Submitted</div>
                      <div className="h-1 bg-primary rounded-full mt-1" />
                    </div>
                    <div className="text-center">
                      <div className="text-[9px] font-bold text-primary">Verifying</div>
                      <div className="h-1 bg-primary rounded-full mt-1 animate-pulse" />
                    </div>
                    <div className="text-center">
                      <div className="text-[9px] font-medium text-muted-foreground">Inspection</div>
                      <div className="h-1 bg-muted rounded-full mt-1" />
                    </div>
                    <div className="text-center">
                      <div className="text-[9px] font-medium text-muted-foreground">Approval</div>
                      <div className="h-1 bg-muted rounded-full mt-1" />
                    </div>
                  </div>
                </div>

                {/* Request 2 */}
                <div className="relative pl-6 border-l space-y-1">
                  <div className="absolute -left-[6.5px] top-1 h-3 w-3 rounded-full bg-emerald-600 ring-4 ring-emerald-50 dark:ring-emerald-950" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">Load Change (Sanctioned Load +3kW)</h4>
                      <p className="text-[11px] text-muted-foreground font-mono">App #LOD-2026-4431 • KPDCL-2024-002</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 w-fit">
                      Approved
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    ✓ On-site load inspection verified. Sanctioned load updated in DISCOM billing ledger.
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column: Link Connection & Quick Utilities */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Link Connection Card */}
            <Card className="border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-primary" />
                  Link Another Connection
                </CardTitle>
                <CardDescription className="text-xs">Add family or business meter accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLinkConnection} className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                      Registered Owner Name <span className="text-destructive">*</span>
                    </label>
                    <Input 
                      placeholder="e.g. Tariq Ahmad"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="h-8 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                      Consumer Number (13-digit ID) <span className="text-destructive">*</span>
                    </label>
                    <Input 
                      placeholder="e.g. KPDCL-2024-003"
                      value={newConsumerNo}
                      onChange={(e) => setNewConsumerNo(e.target.value)}
                      className="h-8 text-xs font-mono font-semibold"
                      required
                    />
                  </div>

                  {linkError && <p className="text-[11px] text-destructive font-medium">{linkError}</p>}
                  {linkSuccess && <p className="text-[11px] text-emerald-600 font-semibold">{linkSuccess}</p>}

                  <Button type="submit" size="sm" className="w-full mt-2 h-8 text-xs shadow-xs">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Link Connection
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Citizen Utilities */}
            <Card className="border shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Quick Services</CardTitle>
                <CardDescription className="text-xs">Direct access to citizen utilities</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y text-xs">
                  <button 
                    onClick={() => router.push("/services")}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/40 transition"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 shrink-0">
                      <LifeBuoy className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">Apply for Services</p>
                      <p className="text-[10px] text-muted-foreground truncate">Name change, ownership, solar, load change</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>

                  <button 
                    onClick={() => router.push("/services")}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/40 transition"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 shrink-0">
                      <ClipboardList className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">Raise / Track Ticket</p>
                      <p className="text-[10px] text-muted-foreground truncate">Smart meter issues, billing errors, line fault</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>

                  <div className="flex items-center gap-3 p-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 shrink-0">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">Kashmir Grid Status</p>
                      <p className="text-[10px] text-emerald-600 font-medium">● Normal voltage in all Kashmir circles</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>

        {/* Disconnection Confirmation Dialog */}
        <Dialog open={!!confirmRemoveConsumer} onOpenChange={(op) => { if(!op) setConfirmRemoveConsumer(null) }}>
          <DialogContent className="sm:max-w-md p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Disconnect Connection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                Are you sure you want to unlink connection <span className="font-mono font-bold text-foreground bg-muted rounded px-1.5 py-0.5">{confirmRemoveConsumer}</span> from your portal profile? 
                You will lose immediate access to its smart meter analytics, billing ledger, and certificates.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setConfirmRemoveConsumer(null)} className="h-8 text-xs">
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" onClick={handleConfirmRemove} className="h-8 text-xs">
                  Confirm Disconnect
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </SidebarLayout>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading Dashboard...</div>}>
      <DashboardInner />
    </Suspense>
  )
}
