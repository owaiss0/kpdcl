"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { 
  CreditCard, Wallet, Plus, Zap,
  MapPin, AlertCircle, LifeBuoy, ArrowRight, ClipboardList, Trash2
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
  LineChart, Line
} from "recharts"

const paymentChartData = [
  { month: "Jan", amount: 1200 },
  { month: "Feb", amount: 1450 },
  { month: "Mar", amount: 2100 },
  { month: "Apr", amount: 1620 },
  { month: "May", amount: 1845 },
  { month: "Jun", amount: 500 },
]

type Connection = { consumerNo: string; name: string; type?: string; balance?: number }

function DashboardInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const consumerNo = searchParams.get("consumer")

  const [session] = useState<{ email: string } | null>(() => {
    try {
      const sess = localStorage.getItem("kpdcl_user_session")
      if (sess) return JSON.parse(sess)
    } catch (e) {
      console.error(e)
    }
    return null
  })
  
  // Account portal states
  const [connections, setConnections] = useState<Connection[]>(() => {
    try {
      const stored = localStorage.getItem("kpdcl_linked_consumers")
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error(e)
    }
    return [
      { consumerNo: "KPDCL-2024-001", name: "Mohammad Irfan", type: "Domestic", balance: 500 },
      { consumerNo: "KPDCL-2024-002", name: "Fatima Begum", type: "Commercial", balance: 0 }
    ]
  })
  const [newConsumerNo, setNewConsumerNo] = useState("")
  const [newName, setNewName] = useState("")
  const [linkError, setLinkError] = useState("")
  const [linkSuccess, setLinkSuccess] = useState("")

  // Disconnect connection modal state
  const [confirmRemoveConsumer, setConfirmRemoveConsumer] = useState<string | null>(null)

  // Connection-specific states
  const [consumer, setConsumer] = useState<Consumer | null>(null)
  const [currentBill, setCurrentBill] = useState<Bill | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])

  // Sync connections to storage when they change
  useEffect(() => {
    localStorage.setItem("kpdcl_linked_consumers", JSON.stringify(connections))
  }, [connections])

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
    // Check if already linked
    if (connections.some(c => c.consumerNo === cNo)) {
      setLinkError("This consumer connection is already linked to your account.")
      return
    }

    const newConn: Connection = {
      consumerNo: cNo,
      name: newName.trim(),
      type: "Domestic",
      balance: 0
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

  // ── RENDER SCENARIO 1: Individual Connection Dashboard ──
  if (consumerNo && consumerNo !== "undefined" && consumerNo !== "null") {
    if (!consumer) {
      return (
        <SidebarLayout consumerNo={consumerNo}>
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            Loading connection details...
          </div>
        </SidebarLayout>
      )
    }

    return (
      <SidebarLayout consumerNo={consumerNo}>
        <div className="space-y-6">
          {/* Dashboard Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push("/dashboard")}
                  className="h-8 px-2 -ml-2 text-slate-500 hover:text-slate-900 animate-in fade-in slide-in-from-left-2 duration-150"
                >
                  &larr; Back to Portal Overview
                </Button>
              </div>
              <h1 className="text-2xl font-bold tracking-tight mt-1 text-slate-950">
                Welcome, {consumer.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Consumer No: <span className="font-mono font-semibold">{consumer.consumerNo}</span>
                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {consumer.category}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push(`/billing?consumer=${consumerNo}`)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay Bill
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Consumer Info Card */}
            <Card className="md:col-span-2 shadow-xs border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Consumer Details</CardTitle>
                <CardDescription>Official connection details registered with KPDCL</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div className="bg-slate-50/50 rounded-lg p-2.5 border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Registered Name</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{consumer.name}</p>
                  </div>
                  <div className="bg-slate-50/50 rounded-lg p-2.5 border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Consumer Number</p>
                    <p className="font-mono font-semibold text-slate-800 mt-0.5">{consumer.consumerNo}</p>
                  </div>
                  <div className="bg-slate-50/50 rounded-lg p-2.5 border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Tariff Category</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{consumer.category} ({consumer.connectionType})</p>
                  </div>
                  <div className="bg-slate-50/50 rounded-lg p-2.5 border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Meter Serial No</p>
                    <p className="font-mono font-semibold text-slate-800 mt-0.5">{consumer.meterSerialNo}</p>
                  </div>
                  <div className="bg-slate-50/50 rounded-lg p-2.5 border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Account ID</p>
                    <p className="font-mono font-semibold text-slate-800 mt-0.5">{consumer.accountId}</p>
                  </div>
                  <div className="bg-slate-50/50 rounded-lg p-2.5 border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Sanctioned Load</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{consumer.sanctionedLoad} kW</p>
                  </div>
                  <div className="bg-slate-50/50 rounded-lg p-2.5 border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Contact Mobile</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{consumer.mobile}</p>
                  </div>
                  <div className="bg-slate-50/50 rounded-lg p-2.5 border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Registered Email</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{consumer.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Pending Card */}
            <Card className="shadow-xs border-slate-200 bg-linear-to-b from-white to-slate-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Outstanding Balance</CardTitle>
                <CardDescription>Current billing status and dues</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentBill ? (
                  <>
                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">Pending Amount</p>
                      <p className="text-3xl font-black text-red-600 mt-1">
                        ₹{currentBill.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-slate-500 mt-2 font-medium">
                        Due Date: {new Date(currentBill.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button className="w-full" onClick={() => router.push(`/billing?consumer=${consumerNo}`)}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay Now
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => router.push(`/billing?consumer=${consumerNo}`)}>
                        View Invoice
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 border border-green-200">
                      <Wallet className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mt-2">No pending dues</p>
                    <p className="text-xs text-muted-foreground">All your bills have been fully paid</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => router.push(`/billing?consumer=${consumerNo}`)}>
                      View Receipts
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Payments */}
            <Card className="shadow-xs border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Recent Payments</CardTitle>
                <CardDescription>Latest credit transactions posted</CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <div className="space-y-3.5">
                    {payments.slice(0, 4).map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition">
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            ₹{p.amount.toLocaleString("en-IN")}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(p.paidAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })} &middot; txn: <span className="font-mono text-[10px] uppercase font-semibold">{p.transactionId}</span>
                          </p>
                        </div>
                        <Badge className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-50 font-semibold text-[10px]">
                          Success
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No payment transactions available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Payment History Chart */}
            <Card className="shadow-xs border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Bill Outflow History</CardTitle>
                <CardDescription>Last 6 billing cycles analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentChartData}>
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                      <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Line Chart */}
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Consumption/Cost Trend</CardTitle>
              <CardDescription>Monthly expense curves</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={paymentChartData}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarLayout>
    )
  }

  // ── RENDER SCENARIO 2: General Account Portal ──
  return (
    <SidebarLayout consumerNo="">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-linear-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center pr-10">
            <Zap className="h-48 w-48 animate-pulse" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {session?.email || "Guest"}!
            </h1>
            <p className="text-blue-100/90 text-sm mt-1 leading-relaxed">
              Manage your power connections, track smart meters, request solar installation agreements, and check active service requests in one unified platform.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Linked Connections List */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="shadow-xs border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Your Linked Power Connections
                </CardTitle>
                <CardDescription>
                  Choose a connection to inspect detailed usage charts, bills, and documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {connections.map((c) => (
                  <div 
                    key={c.consumerNo}
                    onClick={() => router.push(`/dashboard?consumer=${c.consumerNo}`)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-xs transition duration-150 cursor-pointer group relative overflow-hidden"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition">
                          {c.name}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500 bg-slate-50">
                          {c.type}
                        </Badge>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground">
                        Consumer ID: <span className="font-bold">{c.consumerNo}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right mr-2">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">Wallet Balance</p>
                        <p className="text-sm font-bold text-slate-800">
                          ₹{c.balance !== undefined ? c.balance.toLocaleString("en-IN") : "0"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0 font-semibold text-xs flex items-center gap-1">
                          Manage
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
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

            {/* Track Services timeline */}
            <Card className="shadow-xs border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                  Service Requests Tracker
                </CardTitle>
                <CardDescription>
                  Real-time status of connection upgrades and official agreements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                {/* Request 1 */}
                <div className="relative pl-6 border-l border-slate-200">
                  {/* Step Dot */}
                  <div className="absolute -left-[6.5px] top-1 h-3 w-3 rounded-full bg-blue-600 border border-white ring-4 ring-blue-50" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Solar Net-Metering Agreement</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Application: #SOL-2026-9812 &middot; KPDCL-2024-001</p>
                    </div>
                    <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-50 font-semibold w-fit text-[10px]">
                      Under Verification
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-3.5 max-w-md">
                    <div className="text-center">
                      <div className="text-[10px] font-bold text-blue-600">Submitted</div>
                      <div className="h-1 bg-blue-600 rounded-full mt-1" />
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] font-bold text-blue-600">Verifying</div>
                      <div className="h-1 bg-blue-600 rounded-full mt-1 animate-pulse" />
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] font-medium text-slate-300">Inspection</div>
                      <div className="h-1 bg-slate-100 rounded-full mt-1" />
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] font-medium text-slate-300">Approval</div>
                      <div className="h-1 bg-slate-100 rounded-full mt-1" />
                    </div>
                  </div>
                </div>

                {/* Request 2 */}
                <div className="relative pl-6 border-l border-slate-200">
                  <div className="absolute -left-[6.5px] top-1 h-3 w-3 rounded-full bg-green-600 border border-white ring-4 ring-green-50" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Load Enhancement (Sanctioned Load +3kW)</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Application: #LOD-2026-4431 &middot; KPDCL-2024-002</p>
                    </div>
                    <Badge className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-50 font-semibold w-fit text-[10px]">
                      Approved
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    ✓ On-site load verification completed. Technical load certificate issued. Status updated: Connection upgraded.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Area: Link Connection & Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Link Connection Card */}
            <Card className="shadow-xs border-slate-200 bg-linear-to-b from-white to-slate-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Link New Connection</CardTitle>
                <CardDescription>Add another consumer account under this profile</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLinkConnection} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Registered Name</label>
                    <Input 
                      placeholder="e.g. Amit Sharma"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="h-9 text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Consumer Number</label>
                    <Input 
                      placeholder="e.g. KPDCL-2024-003"
                      value={newConsumerNo}
                      onChange={(e) => setNewConsumerNo(e.target.value)}
                      className="h-9 text-xs font-mono font-semibold"
                      required
                    />
                  </div>

                  {linkError && <p className="text-xs text-destructive font-medium">{linkError}</p>}
                  {linkSuccess && <p className="text-xs text-green-600 font-semibold">{linkSuccess}</p>}

                  <Button type="submit" size="sm" className="w-full mt-2 h-9 text-xs">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Link Connection
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Actions List */}
            <Card className="shadow-xs border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Quick Services</CardTitle>
                <CardDescription>Apply for updates or report problems</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  <a 
                    href="/services" 
                    className="flex items-center gap-3 p-3.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                      <LifeBuoy className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800">Apply for Services</p>
                      <p className="text-[10px] text-muted-foreground truncate">Transfer ownership, solar setup, load edits</p>
                    </div>
                  </a>
                  <a 
                    href="/services?action=complaint" 
                    className="flex items-center gap-3 p-3.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600 shrink-0">
                      <AlertCircle className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800">Lodge Support Ticket</p>
                      <p className="text-[10px] text-muted-foreground truncate">Report meters running fast or power supply issues</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3 p-3.5 text-xs">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 text-green-600 shrink-0">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800">Local Grid Status</p>
                      <p className="text-[10px] text-green-600 font-semibold">● Normal Grid voltage in Srinagar division</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Disconnection Confirmation Dialog */}
        <Dialog open={!!confirmRemoveConsumer} onOpenChange={(op) => { if(!op) setConfirmRemoveConsumer(null) }}>
          <DialogContent className="sm:max-w-md p-6 bg-white rounded-xl shadow-lg border border-slate-150">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900">Disconnect Connection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-slate-600 leading-relaxed">
                Are you sure you want to disconnect consumer connection <span className="font-mono font-bold text-slate-900 bg-slate-100 rounded px-1.5 py-0.5">{confirmRemoveConsumer}</span> from your portal account? 
                You will lose immediate access to its consumption ledger, bills, and billing statements.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setConfirmRemoveConsumer(null)} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" onClick={handleConfirmRemove} className="h-9 text-xs bg-red-600 hover:bg-red-700 text-white">
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading...</div>}>
      <DashboardInner />
    </Suspense>
  )
}
