"use client"

import { Suspense, useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import {
  UserPen, ArrowLeftRight, Tag, Gauge, Sun, TicketPlus,
  Upload, Clock, FileText, CheckCircle2, Search,
  PhoneCall, Headphones, ArrowUpRight, Check, X,
  Info, Sparkles, Building2,
  ArrowRight, ShieldCheck
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SidebarLayout from "@/components/layout/sidebar-layout"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { fetchConsumerByNo } from "@/data/demo"
import type { Consumer } from "@/data/types"

function formatDate(dateStr: string): string {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${d.getDate().toString().padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`
}

// ── Service Catalog Definition ──

type ServiceCategory = "all" | "ownership" | "load" | "solar" | "support"

interface ServiceDef {
  id: string
  label: string
  category: ServiceCategory
  categoryLabel: string
  icon: React.ComponentType<{ className?: string }>
  desc: string
  color: string
  tat: string
  fee: string
  docsCount: number
  popular?: boolean
}

const services: ServiceDef[] = [
  {
    id: "name-change",
    label: "Name Change",
    category: "ownership",
    categoryLabel: "Ownership",
    icon: UserPen,
    desc: "Change name on your electricity connection",
    color: "bg-blue-100 text-blue-600",
    tat: "7-10 Days",
    fee: "Free",
    docsCount: 3,
  },
  {
    id: "ownership",
    label: "Ownership Change",
    category: "ownership",
    categoryLabel: "Ownership",
    icon: ArrowLeftRight,
    desc: "Transfer connection to another person",
    color: "bg-purple-100 text-purple-600",
    tat: "15 Days",
    fee: "₹250 Processing",
    docsCount: 4,
    popular: true,
  },
  {
    id: "category-change",
    label: "Category Change",
    category: "load",
    categoryLabel: "Tariff",
    icon: Tag,
    desc: "Change tariff or connection category",
    color: "bg-orange-100 text-orange-600",
    tat: "10-12 Days",
    fee: "Inspection Charge",
    docsCount: 2,
  },
  {
    id: "load-change",
    label: "Load Change",
    category: "load",
    categoryLabel: "Load",
    icon: Gauge,
    desc: "Increase or decrease sanctioned load",
    color: "bg-cyan-100 text-cyan-600",
    tat: "7 Days",
    fee: "Free (Diff security only)",
    docsCount: 2,
    popular: true,
  },
  {
    id: "solar",
    label: "Solar Agreement",
    category: "solar",
    categoryLabel: "Solar",
    icon: Sun,
    desc: "Register solar / net metering",
    color: "bg-yellow-100 text-yellow-600",
    tat: "15-20 Days",
    fee: "Subsidy Eligible",
    docsCount: 3,
    popular: true,
  },
  {
    id: "ticket",
    label: "Raise / Track Ticket",
    category: "support",
    categoryLabel: "Support",
    icon: TicketPlus,
    desc: "Create or track a support ticket",
    color: "bg-red-100 text-red-600",
    tat: "24-48 Hours",
    fee: "Free",
    docsCount: 1,
    popular: true,
  },
]

// ── Demo Tickets Data ──

interface TicketTimelineStep {
  title: string
  date: string
  description: string
  completed: boolean
  current?: boolean
}

interface TicketRecord {
  id: string
  subject: string
  category: string
  status: "open" | "in-progress" | "resolved"
  date: string
  priority: "high" | "medium" | "low"
  assignedTo: string
  lastUpdate: string
  subDivision: string
  timeline: TicketTimelineStep[]
}

const initialDemoTickets: TicketRecord[] = [
  {
    id: "TKT-2026-0891",
    subject: "Smart meter showing frequent disconnections",
    category: "Meter / Hardware",
    status: "in-progress",
    date: "2026-06-22",
    priority: "high",
    assignedTo: "Er. Firdous Ahmad (JE, Electric Sub-Division Rajbagh)",
    lastUpdate: "Lineman dispatched for terminal check & modem signal inspection.",
    subDivision: "Sub-Division II (Srinagar)",
    timeline: [
      { title: "Complaint Registered", date: "2026-06-22 09:30 AM", description: "Consumer logged grievance via Consumer Web Portal.", completed: true },
      { title: "Assigned to Field Engineer", date: "2026-06-22 11:15 AM", description: "Ticket routed to Electric Sub-Division Rajbagh.", completed: true },
      { title: "Site Inspection & Diagnostics", date: "2026-06-23 02:00 PM", description: "Modem signal diagnostics in progress by metering team.", completed: false, current: true },
      { title: "Verification & Resolution", date: "Pending", description: "Final test confirmation & consumer sign-off.", completed: false },
    ],
  },
  {
    id: "TKT-2026-0742",
    subject: "May 2026 bill excess units query",
    category: "Billing & Payment",
    status: "open",
    date: "2026-06-20",
    priority: "medium",
    assignedTo: "Revenue Section (ED-II Srinagar)",
    lastUpdate: "Awaiting billing reconciliation report from IT cell.",
    subDivision: "Central Billing Division",
    timeline: [
      { title: "Complaint Registered", date: "2026-06-20 03:40 PM", description: "Consumer disputed 142 units billing variation.", completed: true },
      { title: "Assigned to Revenue Officer", date: "2026-06-21 10:00 AM", description: "Assigned to Commercial Accounts desk.", completed: false, current: true },
      { title: "Ledger Audit", date: "Pending", description: "Cross-verifying AMI head-end read with billing cycle.", completed: false },
      { title: "Resolution & Credit Adjustment", date: "Pending", description: "Issue revised bill or credit memo.", completed: false },
    ],
  },
  {
    id: "TKT-2026-0519",
    subject: "Tree branch leaning on LT service line",
    category: "Safety & Hazard",
    status: "resolved",
    date: "2026-06-12",
    priority: "high",
    assignedTo: "Line Maintenance Crew #4",
    lastUpdate: "Branch safely trimmed. Line clearance restored.",
    subDivision: "Sub-Division II (Srinagar)",
    timeline: [
      { title: "Complaint Registered", date: "2026-06-12 08:15 AM", description: "Reported tree branch touching bare LT conductor.", completed: true },
      { title: "Emergency Crew Assigned", date: "2026-06-12 08:45 AM", description: "Urgent safety alert issued to Rajbagh section.", completed: true },
      { title: "Tree Trimming Carried Out", date: "2026-06-12 11:30 AM", description: "Feeder shut down for 20 mins; tree pruned.", completed: true },
      { title: "Restored & Closed", date: "2026-06-12 12:15 PM", description: "Power supply checked and normal clearance verified.", completed: true },
    ],
  },
]

const problemCategories = [
  { value: "bill-payment", label: "Bill & Payment Issues" },
  { value: "meter", label: "Smart Meter & Hardware" },
  { value: "safety", label: "Safety & Hazardous Lines" },
  { value: "supply-issue", label: "Power Supply Interruption" },
  { value: "other", label: "General Inquiries & Other" },
]

const subCategories: Record<string, { value: string; label: string }[]> = {
  "bill-payment": [
    { value: "bill-not-generating", label: "Current bill not generating / delayed" },
    { value: "bill-incorrect-usage", label: "High consumption / units mismatch" },
    { value: "payment-error", label: "Online payment debited but bill unpaid" },
    { value: "payment-incorrect-no", label: "Payment made to incorrect consumer ID" },
    { value: "payment-not-showing", label: "Recent transaction not reflecting in ledger" },
  ],
  meter: [
    { value: "non-communicating", label: "Smart Meter not communicating (Offline)" },
    { value: "running-too-fast", label: "Meter reading appears abnormally fast" },
    { value: "damaged-meter", label: "Burnt / physically damaged meter" },
    { value: "smart-meter-replacement", label: "Request for Smart Meter installation/swap" },
    { value: "meter-shifting", label: "Meter shifting to new pole / wall" },
    { value: "incorrect-tagging", label: "Incorrect meter serial tagged to account" },
  ],
  safety: [
    { value: "sparking-transformer", label: "Sparks on transformer or distribution pole" },
    { value: "loose-conductor", label: "Sagging or loose live conductor wire" },
    { value: "meter-cabinet-fire", label: "Meter cabinet burnt / smoking" },
  ],
  "supply-issue": [
    { value: "low-voltage", label: "Severe low voltage (appliances tripping)" },
    { value: "single-phase-missing", label: "Single phasing issue in 3-phase supply" },
    { value: "prolonged-outage", label: "Unscheduled local outage exceeding 4 hours" },
  ],
  other: [
    { value: "street-light", label: "Street lighting non-functional" },
    { value: "general-inquiry", label: "General grievance / feedback" },
  ],
}

// ── Main Page Component ──

function ServicesInner() {
  const searchParams = useSearchParams()
  const consumerNo = searchParams.get("consumer") || "KPDCL-2024-001"

  const [consumer, setConsumer] = useState<Consumer | null>(null)
  const [tickets, setTickets] = useState<TicketRecord[]>(initialDemoTickets)
  const [activeTab, setActiveTab] = useState<"catalog" | "tracker" | "help">("catalog")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>("all")
  
  // Modal states
  const [activeServiceModal, setActiveServiceModal] = useState<ServiceDef | null>(null)
  const [viewingTicket, setViewingTicket] = useState<TicketRecord | null>(null)
  
  // Submission confirmation state
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    referenceId: string
    title: string
    tat: string
  } | null>(null)

  // Ticket tracker filter states
  const [ticketSearch, setTicketSearch] = useState("")
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>("all")

  // Load consumer data
  useEffect(() => {
    fetchConsumerByNo(consumerNo).then(setConsumer)
  }, [consumerNo])

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesCategory = selectedCategory === "all" || s.category === selectedCategory
      const matchesSearch = s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesStatus = ticketStatusFilter === "all" || t.status === ticketStatusFilter
      const matchesSearch = t.id.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                            t.subject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                            t.category.toLowerCase().includes(ticketSearch.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [tickets, ticketStatusFilter, ticketSearch])

  // Count active tickets
  const activeTicketCount = useMemo(() => {
    return tickets.filter(t => t.status !== "resolved").length
  }, [tickets])

  // Handle Form Submission Success
  function handleFormSubmitted(serviceTitle: string, tat: string) {
    const randomDigits = Math.floor(10000 + Math.random() * 90000)
    const newRefId = `KPDCL-SRV-${randomDigits}`
    
    // Automatically add to tickets list if it was a ticket, or create a service request record
    const newRecord: TicketRecord = {
      id: newRefId,
      subject: serviceTitle,
      category: "Citizen Service Request",
      status: "open",
      date: new Date().toISOString().split("T")[0],
      priority: "medium",
      assignedTo: "Sub-Divisional Officer (Processing Desk)",
      lastUpdate: "Application received. Verification scheduled under citizen charter.",
      subDivision: "Sub-Division II (Srinagar)",
      timeline: [
        { title: "Application Submitted", date: new Date().toLocaleDateString("en-IN") + " (Just now)", description: "Application digitally recorded with verification documents.", completed: true, current: true },
        { title: "Document Scrutiny", date: "Pending", description: "Checking ownership deed & latest bill clearance.", completed: false },
        { title: "Field Inspection / Approval", date: "Pending", description: "Technical approval by Executive Engineer.", completed: false },
        { title: "Service Order Completed", date: "Pending", description: "System update & SMS notification.", completed: false },
      ]
    }

    setTickets(prev => [newRecord, ...prev])
    setActiveServiceModal(null)
    setSubmissionSuccess({
      referenceId: newRefId,
      title: serviceTitle,
      tat,
    })
  }

  return (
    <SidebarLayout consumerNo={consumerNo}>
      <div className="space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Services &amp; Grievance Hub</h1>
            <p className="text-sm text-muted-foreground">
              Submit digital requests for connection modifications, solar net-metering, or register 24x7 complaints.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("tracker")}
              className="gap-2"
            >
              <TicketPlus className="h-4 w-4 text-primary" />
              <span>Track Requests</span>
              {activeTicketCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs font-semibold">
                  {activeTicketCount}
                </Badge>
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const ticketSvc = services.find(s => s.id === "ticket")
                if (ticketSvc) setActiveServiceModal(ticketSvc)
              }}
              className="gap-2 shadow-xs"
            >
              <TicketPlus className="h-4 w-4" />
              <span>Raise Ticket</span>
            </Button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Active Connection */}
          <Card className="border shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Active Connection</p>
                <p className="truncate text-sm font-semibold text-foreground">
                  {consumer?.name || "Mohammad Irfan"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                    {consumerNo}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {consumer?.sanctionedLoad || 5} kW
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Open Requests */}
          <Card className="border shadow-xs cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab("tracker")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Active Requests</p>
                <p className="text-lg font-bold text-foreground">
                  {activeTicketCount} <span className="text-xs font-normal text-muted-foreground">in progress</span>
                </p>
                <p className="text-[11px] text-primary flex items-center gap-1 mt-0.5">
                  View tracking timeline <ArrowRight className="h-3 w-3" />
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Standard SLA */}
          <Card className="border shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Citizen Charter SLA</p>
                <p className="text-sm font-semibold text-foreground">24h - 7 Days</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Standard DISCOM turnaround
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: 24/7 Helpline */}
          <Card className="border bg-linear-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">24x7 Emergency Call</p>
                <p className="text-base font-bold text-foreground tracking-tight">1912</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  Toll-Free Outage Desk
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Section Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex mb-4">
            <TabsTrigger value="catalog" className="text-xs sm:text-sm">
              Explore Services
            </TabsTrigger>
            <TabsTrigger value="tracker" className="text-xs sm:text-sm flex items-center gap-1.5">
              <span>Track Requests</span>
              {activeTicketCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] h-4 w-4 font-semibold">
                  {activeTicketCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="help" className="text-xs sm:text-sm">
              Citizen Charter &amp; SLA
            </TabsTrigger>
          </TabsList>

          {/* ═════════ TAB 1: SERVICE CATALOG ═════════ */}
          <TabsContent value="catalog" className="space-y-5">
            {/* Search and Category Filter Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <Button
                  size="sm"
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  className="rounded-full text-xs h-7 px-3"
                >
                  All ({services.length})
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === "ownership" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("ownership")}
                  className="rounded-full text-xs h-7 px-3"
                >
                  Ownership
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === "load" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("load")}
                  className="rounded-full text-xs h-7 px-3"
                >
                  Load &amp; Tariff
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === "solar" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("solar")}
                  className="rounded-full text-xs h-7 px-3"
                >
                  Solar Net-Meter
                </Button>
                <Button
                  size="sm"
                  variant={selectedCategory === "support" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("support")}
                  className="rounded-full text-xs h-7 px-3"
                >
                  Grievances
                </Button>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Service Grid */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((s) => {
                const Icon = s.icon
                return (
                  <Card
                    key={s.id}
                    className="group relative flex flex-col justify-between overflow-hidden border transition-all duration-200 hover:shadow-md hover:border-primary/50"
                  >
                    <div>
                      {/* Top Header Card Info */}
                      <CardHeader className="p-5 pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.color} transition-transform group-hover:scale-105`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                              {s.categoryLabel}
                            </Badge>
                            {s.popular && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                                <Sparkles className="h-2.5 w-2.5" /> Popular
                              </span>
                            )}
                          </div>
                        </div>
                        <CardTitle className="text-base font-semibold leading-snug mt-3">
                          {s.label}
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                          {s.desc}
                        </CardDescription>
                      </CardHeader>

                      {/* Middle Specifications Chips */}
                      <div className="px-5 py-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground border-t border-border/50 bg-muted/20">
                        <span className="inline-flex items-center gap-1 font-medium text-foreground">
                          <Clock className="h-3 w-3 text-primary" /> {s.tat}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <FileText className="h-3 w-3" /> {s.docsCount} {s.docsCount === 1 ? 'Doc' : 'Docs'}
                        </span>
                        <span>•</span>
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">
                          {s.fee}
                        </Badge>
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="p-4 pt-3 border-t">
                      <Button
                        onClick={() => setActiveServiceModal(s)}
                        className="w-full justify-between text-xs h-9 shadow-xs group-hover:bg-primary"
                      >
                        <span>Apply Online</span>
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Button>
                    </div>
                  </Card>
                )
              })}

              {filteredServices.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <p className="text-sm font-medium text-muted-foreground">No services matched your search &quot;{searchQuery}&quot;</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => { setSearchQuery(""); setSelectedCategory("all") }}
                    className="mt-2 text-xs"
                  >
                    Clear search filters
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Process Info Banner */}
            <Card className="border bg-muted/40">
              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    <Info className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">How KPDCL Online Citizen Requests Work</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      1. Submit request online &rarr; 2. Automated SMS acknowledgment with Tracker ID &rarr; 3. Field inspection by Sub-Division &rarr; 4. Approval &amp; updated ledger.
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("help")} className="shrink-0 text-xs">
                  View Citizen Charter
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═════════ TAB 2: TRACK APPLICATIONS & TICKETS ═════════ */}
          <TabsContent value="tracker" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-semibold">Service Requests &amp; Complaints Tracker</CardTitle>
                  <CardDescription className="text-xs">
                    Live status and inspection milestones for your connection {consumerNo}
                  </CardDescription>
                </div>

                {/* Table Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-48">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Filter ticket ID..."
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                      className="h-8 pl-8 text-xs"
                    />
                  </div>
                  <Select value={ticketStatusFilter} onValueChange={(val) => setTicketStatusFilter(val || "all")}>
                    <SelectTrigger className="h-8 text-xs w-32">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Tracking ID</TableHead>
                      <TableHead>Subject / Service</TableHead>
                      <TableHead className="w-[110px]">Date</TableHead>
                      <TableHead className="w-[100px]">Priority</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[120px] text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((t) => (
                      <TableRow key={t.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setViewingTicket(t)}>
                        <TableCell className="font-mono text-xs font-semibold text-primary">
                          {t.id}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-xs sm:text-sm text-foreground line-clamp-1">{t.subject}</div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span>{t.category}</span>
                            <span>•</span>
                            <span className="truncate">{t.subDivision}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap" suppressHydrationWarning>
                          {formatDate(t.date)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] capitalize font-medium ${
                            t.priority === "high" ? "border-red-200 bg-red-50 text-red-700 dark:bg-red-950 dark:border-red-900 dark:text-red-300" :
                            t.priority === "medium" ? "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-300" :
                            "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-900 dark:text-emerald-300"
                          }`}>
                            {t.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] font-medium flex items-center gap-1 w-fit ${
                            t.status === "in-progress" ? "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" :
                            t.status === "open" ? "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" :
                            "border-green-200 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              t.status === "in-progress" ? "bg-blue-500 animate-pulse" :
                              t.status === "open" ? "bg-amber-500" : "bg-green-500"
                            }`} />
                            {t.status === "in-progress" ? "In Progress" : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              setViewingTicket(t)
                            }}
                          >
                            Lifecycle
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredTickets.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-muted-foreground text-xs">
                          No service tickets found matching your filter criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═════════ TAB 3: CITIZEN CHARTER & SLA ═════════ */}
          <TabsContent value="help" className="space-y-6">
            {/* Citizen Charter SLA Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">KPDCL Citizen Charter — Service Delivery Timelines</CardTitle>
                <CardDescription className="text-xs">
                  Guaranteed turnaround times mandated under the Jammu &amp; Kashmir Public Services Guarantee Act
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Designated Officer</TableHead>
                      <TableHead>Statutory Timeline (SLA)</TableHead>
                      <TableHead>First Appellate Authority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium text-xs">New Connection / Load Enhancement</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Assistant Executive Engineer (AEE)</TableCell>
                      <TableCell className="text-xs font-semibold text-primary">7 Working Days</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Executive Engineer (XEN)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-xs">Transfer of Ownership / Title Name</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Assistant Executive Engineer (AEE)</TableCell>
                      <TableCell className="text-xs font-semibold text-primary">15 Working Days</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Executive Engineer (XEN)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-xs">Defective / Burnt Smart Meter Replacement</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Junior Engineer (JE)</TableCell>
                      <TableCell className="text-xs font-semibold text-emerald-600">Within 24 to 48 Hours</TableCell>
                      <TableCell className="text-xs text-muted-foreground">AEE (Sub-Division)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-xs">Correction in Electricity Bill</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Revenue Officer / Commercial Section</TableCell>
                      <TableCell className="text-xs font-semibold text-primary">7 Working Days</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Executive Engineer (XEN)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-xs">Rooftop Solar Agreement &amp; Net-Metering</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Technical Officer (ED)</TableCell>
                      <TableCell className="text-xs font-semibold text-primary">15 Working Days</TableCell>
                      <TableCell className="text-xs text-muted-foreground">Superintending Engineer (SE)</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Escalation Matrix & Helpline Cards */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    DISCOM Hierarchy Escalation Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5 pb-2 border-b">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">1</span>
                    <div>
                      <p className="font-semibold text-foreground">Level 1: Electric Sub-Division</p>
                      <p className="text-muted-foreground">Junior Engineer (JE) &amp; Sub-Divisional Officer (SDO) for local supply &amp; meter issues.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 pb-2 border-b">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">2</span>
                    <div>
                      <p className="font-semibold text-foreground">Level 2: Electric Division Office</p>
                      <p className="text-muted-foreground">Executive Engineer (XEN) for unresolved billing disputes &amp; major works.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">3</span>
                    <div>
                      <p className="font-semibold text-foreground">Level 3: Circle &amp; DISCOM HQ</p>
                      <p className="text-muted-foreground">Superintending Engineer (SE) &amp; Chief Engineer (Distribution), KPDCL Srinagar.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Headphones className="h-4 w-4 text-primary" />
                    Dedicated Assistance Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="rounded-lg border bg-muted/40 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">KPDCL Central Call Center</span>
                      <Badge className="bg-emerald-600 text-[10px]">24x7 Active</Badge>
                    </div>
                    <p className="text-base font-bold text-foreground mt-1">1912</p>
                    <p className="text-[11px] text-muted-foreground">Toll-free emergency dispatch from anywhere in Kashmir valley.</p>
                  </div>

                  <div className="rounded-lg border bg-muted/40 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Smart Meter Technical Helpline</span>
                      <Badge variant="outline" className="text-[10px]">Office Hours</Badge>
                    </div>
                    <p className="text-base font-bold text-foreground mt-1">1800-180-7080</p>
                    <p className="text-[11px] text-muted-foreground">Direct AMI integration, billing readings, and prepaid app support.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* ═════════ ACTIVE SERVICE APPLICATION DIALOG ═════════ */}
        {activeServiceModal && (
          <Dialog open={!!activeServiceModal} onOpenChange={(open) => !open && setActiveServiceModal(null)}>
            <DialogContent className="sm:max-w-2xl max-h-[88vh] overflow-y-auto p-0 gap-0">
              {/* Dialog Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${activeServiceModal.color}`}>
                    <activeServiceModal.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-semibold leading-snug">
                      {activeServiceModal.label}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Estimated turnaround: <span className="font-medium text-foreground">{activeServiceModal.tat}</span> • Standard DISCOM processing
                    </DialogDescription>
                  </div>
                </div>
              </div>

              {/* Form Content Body */}
              <div className="px-5 py-5">
                {activeServiceModal.id === "name-change" && (
                  <NameChangeForm
                    consumer={consumer}
                    consumerNo={consumerNo}
                    onClose={() => setActiveServiceModal(null)}
                    onSubmitSuccess={() => handleFormSubmitted("Name Correction Request", "7-10 Days")}
                  />
                )}
                {activeServiceModal.id === "ownership" && (
                  <OwnershipForm
                    consumer={consumer}
                    consumerNo={consumerNo}
                    onClose={() => setActiveServiceModal(null)}
                    onSubmitSuccess={() => handleFormSubmitted("Connection Ownership Transfer", "15 Days")}
                  />
                )}
                {activeServiceModal.id === "load-change" && (
                  <LoadForm
                    consumer={consumer}
                    consumerNo={consumerNo}
                    onClose={() => setActiveServiceModal(null)}
                    onSubmitSuccess={() => handleFormSubmitted("Load Enhancement / Reduction", "7 Days")}
                  />
                )}
                {activeServiceModal.id === "category-change" && (
                  <CategoryForm
                    consumer={consumer}
                    consumerNo={consumerNo}
                    onClose={() => setActiveServiceModal(null)}
                    onSubmitSuccess={() => handleFormSubmitted("Tariff Category Change", "10-12 Days")}
                  />
                )}
                {activeServiceModal.id === "solar" && (
                  <SolarForm
                    consumer={consumer}
                    consumerNo={consumerNo}
                    onClose={() => setActiveServiceModal(null)}
                    onSubmitSuccess={() => handleFormSubmitted("PM Surya Ghar Solar Agreement", "15-20 Days")}
                  />
                )}
                {activeServiceModal.id === "ticket" && (
                  <TicketForm
                    consumer={consumer}
                    consumerNo={consumerNo}
                    onClose={() => setActiveServiceModal(null)}
                    onSubmitSuccess={() => handleFormSubmitted("Consumer Grievance Lodged", "24-48 Hours")}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* ═════════ TICKET LIFECYCLE MODAL ═════════ */}
        {viewingTicket && (
          <TicketLifecycleModal
            ticket={viewingTicket}
            onClose={() => setViewingTicket(null)}
          />
        )}

        {/* ═════════ SUBMISSION SUCCESS MODAL ═════════ */}
        {submissionSuccess && (
          <Dialog open={!!submissionSuccess} onOpenChange={() => setSubmissionSuccess(null)}>
            <DialogContent className="sm:max-w-md text-center p-6 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Application Registered Successfully</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                  Your request has been officially recorded in KPDCL Consumer Management System.
                </DialogDescription>
              </div>

              <div className="rounded-xl border bg-muted/40 p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="text-muted-foreground">Tracking ID</span>
                  <span className="font-mono font-bold text-primary">{submissionSuccess.referenceId}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="text-muted-foreground">Service Name</span>
                  <span className="font-medium text-foreground">{submissionSuccess.title}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="text-muted-foreground">Expected Resolution</span>
                  <span className="font-medium text-emerald-600">{submissionSuccess.tat}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Consumer ID</span>
                  <span className="font-mono text-muted-foreground">{consumerNo}</span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                An acknowledgment SMS and digital confirmation token have been sent to your registered mobile number.
              </p>

              <div className="flex gap-2 justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSubmissionSuccess(null)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSubmissionSuccess(null)
                    setActiveTab("tracker")
                  }}
                  className="gap-1.5"
                >
                  <span>Track Status</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

      </div>
    </SidebarLayout>
  )
}

// ── Shared Connection Snapshot Card ──

function CurrentDetailsCard({ consumer, consumerNo }: { consumer: Consumer | null; consumerNo: string }) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4 space-y-2.5">
      <div className="flex items-center justify-between border-b pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Active Connection Record
        </p>
        <Badge variant="outline" className="text-[10px] font-mono bg-background">
          {consumerNo}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
        <div>
          <span className="text-muted-foreground block text-[11px]">Consumer Name</span>
          <span className="font-medium text-foreground truncate">{consumer?.name || "Mohammad Irfan"}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[11px]">Sanctioned Load</span>
          <span className="font-medium text-foreground">{consumer?.sanctionedLoad || 5} kW ({consumer?.connectionType || "Domestic"})</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[11px]">Meter Serial No.</span>
          <span className="font-mono font-medium text-foreground">{consumer?.meterSerialNo || "KA-87321"}</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[11px]">Mobile Number</span>
          <span className="font-mono font-medium text-foreground">{consumer?.mobile || "9419000001"}</span>
        </div>
      </div>
    </div>
  )
}

// ── Realistic Document Upload Item Component ──

function InteractiveDocUploader({ label, fileType, required }: { label: string; fileType: string; required: boolean }) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<string | null>(null)

  function handleSimulateUpload() {
    const sampleNames: Record<string, string[]> = {
      pdf: ["latest_kpdcl_bill.pdf", "property_mutation_deed.pdf", "test_report_licensed_contractor.pdf"],
      "jpg/jpeg": ["photo_id_aadhaar.jpg", "specimen_signature.jpg", "rooftop_site_photo.jpeg"],
    }
    const pool = sampleNames[fileType] || ["document_attachment.pdf"]
    const picked = pool[Math.floor(Math.random() * pool.length)]
    const randomSize = (0.8 + Math.random() * 1.5).toFixed(1) + " MB"
    
    setFileName(picked)
    setFileSize(randomSize)
  }

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-lg border p-3 transition-colors ${
      fileName ? "bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900" : "bg-card"
    }`}>
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          fileName ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : "bg-muted text-muted-foreground"
        }`}>
          {fileName ? <Check className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground truncate">{label}</span>
            <Badge variant="outline" className="text-[10px] font-mono uppercase px-1 py-0">
              {fileType}
            </Badge>
          </div>
          {fileName ? (
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
              <span>{fileName}</span>
              <span className="text-muted-foreground">({fileSize})</span>
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Max size 5MB • Formats: {fileType}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 shrink-0">
        {required && !fileName && (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] hover:bg-amber-100">
            Mandatory
          </Badge>
        )}
        {fileName ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => { setFileName(null); setFileSize(null) }}
            className="h-7 text-xs text-muted-foreground hover:text-destructive px-2"
          >
            <X className="h-3.5 w-3.5 mr-1" /> Remove
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSimulateUpload}
            className="h-7 text-xs gap-1.5"
          >
            <Upload className="h-3 w-3" />
            <span>Upload File</span>
          </Button>
        )}
      </div>
    </div>
  )
}

function FormActionButtons({ onClose, submitText = "Submit Application" }: { onClose: () => void; submitText?: string }) {
  return (
    <div className="flex items-center justify-end gap-2 pt-4 border-t">
      <Button variant="outline" type="button" onClick={onClose} size="sm">
        Cancel
      </Button>
      <Button type="submit" size="sm" className="shadow-xs">
        {submitText}
      </Button>
    </div>
  )
}

// ── Specific Form 1: Name Change ──

function NameChangeForm({
  consumer,
  consumerNo,
  onClose,
  onSubmitSuccess,
}: {
  consumer: Consumer | null
  consumerNo: string
  onClose: () => void
  onSubmitSuccess: () => void
}) {
  return (
    <form className="space-y-4 text-xs" onSubmit={(e) => { e.preventDefault(); onSubmitSuccess() }}>
      <CurrentDetailsCard consumer={consumer} consumerNo={consumerNo} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="mb-1 block font-medium text-foreground">Current Name on Record</label>
          <Input value={consumer?.name || "Mohammad Irfan"} disabled className="bg-muted text-xs h-8" />
        </div>
        <div>
          <label className="mb-1 block font-medium text-foreground">
            Corrected / New Name <span className="text-destructive">*</span>
          </label>
          <Input placeholder="Enter exact name as per Aadhaar/Passport" required className="text-xs h-8" />
        </div>
      </div>

      <div>
        <label className="mb-1 block font-medium text-foreground">
          Reason for Name Correction <span className="text-destructive">*</span>
        </label>
        <Select required defaultValue="spelling">
          <SelectTrigger className="text-xs h-8">
            <SelectValue placeholder="Select reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="spelling">Spelling typographical error on bill</SelectItem>
            <SelectItem value="marriage">Post-marriage name adjustment</SelectItem>
            <SelectItem value="gazette">Legal name change via official gazette</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="font-semibold text-foreground text-xs">Required Supporting Documents</p>
        <InteractiveDocUploader label="Copy of latest paid electricity bill" fileType="pdf" required />
        <InteractiveDocUploader label="Government Photo ID (Aadhaar / Voter ID)" fileType="jpg/jpeg" required />
        <InteractiveDocUploader label="Affidavit / Gazette publication copy" fileType="pdf" required={false} />
      </div>

      <FormActionButtons onClose={onClose} />
    </form>
  )
}

// ── Specific Form 2: Ownership Transfer ──

function OwnershipForm({
  consumer,
  consumerNo,
  onClose,
  onSubmitSuccess,
}: {
  consumer: Consumer | null
  consumerNo: string
  onClose: () => void
  onSubmitSuccess: () => void
}) {
  return (
    <form className="space-y-4 text-xs" onSubmit={(e) => { e.preventDefault(); onSubmitSuccess() }}>
      <CurrentDetailsCard consumer={consumer} consumerNo={consumerNo} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="mb-1 block font-medium text-foreground">
            Transferee (New Owner) Name <span className="text-destructive">*</span>
          </label>
          <Input placeholder="Full legal name of recipient" required className="text-xs h-8" />
        </div>
        <div>
          <label className="mb-1 block font-medium text-foreground">
            Transferee Mobile Number <span className="text-destructive">*</span>
          </label>
          <Input placeholder="10-digit mobile number" required type="tel" maxLength={10} className="text-xs h-8" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block font-medium text-foreground">Transfer Type</label>
          <Select required defaultValue="sale">
            <SelectTrigger className="text-xs h-8">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sale">Property Sale / Purchase deed</SelectItem>
              <SelectItem value="inheritance">Legal Heirship / Inheritance</SelectItem>
              <SelectItem value="gift">Gift Deed / Family settlement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block font-medium text-foreground">Aadhaar / ID Card No.</label>
          <Input placeholder="XXXX-XXXX-XXXX" required className="text-xs h-8" />
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="font-semibold text-foreground text-xs">Required Transfer Documents</p>
        <InteractiveDocUploader label="Registered Sale Deed / Title Ownership Deed" fileType="pdf" required />
        <InteractiveDocUploader label="Latest Paid Bill (No Arrears Clearance)" fileType="pdf" required />
        <InteractiveDocUploader label="NOC from Legal Heirs (if applicable)" fileType="pdf" required={false} />
        <InteractiveDocUploader label="Press Release / NOC in local newspaper" fileType="pdf" required />
      </div>

      <FormActionButtons onClose={onClose} submitText="Submit Transfer Request" />
    </form>
  )
}

// ── Specific Form 3: Load Change ──

function LoadForm({
  consumer,
  consumerNo,
  onClose,
  onSubmitSuccess,
}: {
  consumer: Consumer | null
  consumerNo: string
  onClose: () => void
  onSubmitSuccess: () => void
}) {
  const currentLoad = consumer?.sanctionedLoad || 5
  const [requestedLoad, setRequestedLoad] = useState<number>(currentLoad + 2)

  const delta = (requestedLoad - currentLoad).toFixed(1)
  const isEnhancement = requestedLoad >= currentLoad

  return (
    <form className="space-y-4 text-xs" onSubmit={(e) => { e.preventDefault(); onSubmitSuccess() }}>
      <CurrentDetailsCard consumer={consumer} consumerNo={consumerNo} />

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground">Requested Sanctioned Load</span>
          <Badge variant="outline" className={`text-xs font-semibold ${
            isEnhancement ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"
          }`}>
            {isEnhancement ? `+${delta} kW Enhancement` : `${delta} kW Reduction`}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 items-center">
          <div>
            <span className="text-[11px] text-muted-foreground block mb-1">Current Sanctioned</span>
            <div className="h-9 px-3 rounded-md bg-muted border flex items-center font-bold text-sm">
              {currentLoad} kW
            </div>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block mb-1">New Desired Load (kW)</span>
            <Input
              type="number"
              step="0.5"
              min="1"
              max="100"
              value={requestedLoad}
              onChange={(e) => setRequestedLoad(parseFloat(e.target.value) || currentLoad)}
              className="h-9 text-sm font-bold"
              required
            />
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1 block font-medium text-foreground">
          Reason for Load Revision <span className="text-destructive">*</span>
        </label>
        <Textarea
          placeholder="e.g. Installed 2 x 1.5-ton AC units, heat convector heaters, water pump..."
          className="text-xs min-h-[70px]"
          required
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="font-semibold text-foreground text-xs">Required Verification</p>
        <InteractiveDocUploader label="Copy of latest paid electricity bill" fileType="pdf" required />
        <InteractiveDocUploader label="Licensed Electrical Contractor Test Certificate" fileType="pdf" required={requestedLoad > 10} />
      </div>

      <FormActionButtons onClose={onClose} submitText="Apply for Load Revision" />
    </form>
  )
}

// ── Specific Form 4: Category Change ──

function CategoryForm({
  consumer,
  consumerNo,
  onClose,
  onSubmitSuccess,
}: {
  consumer: Consumer | null
  consumerNo: string
  onClose: () => void
  onSubmitSuccess: () => void
}) {
  return (
    <form className="space-y-4 text-xs" onSubmit={(e) => { e.preventDefault(); onSubmitSuccess() }}>
      <CurrentDetailsCard consumer={consumer} consumerNo={consumerNo} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="mb-1 block font-medium text-foreground">Current Tariff Category</label>
          <Input value="Domestic (LT-1)" disabled className="bg-muted text-xs h-8" />
        </div>
        <div>
          <label className="mb-1 block font-medium text-foreground">
            Target Tariff Category <span className="text-destructive">*</span>
          </label>
          <Select required defaultValue="commercial">
            <SelectTrigger className="text-xs h-8">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="commercial">Commercial / Non-Domestic (LT-2)</SelectItem>
              <SelectItem value="industrial">Small Scale Industrial (LT-3)</SelectItem>
              <SelectItem value="agricultural">Agricultural / Tube Well</SelectItem>
              <SelectItem value="state-gov">State Government Department</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="mb-1 block font-medium text-foreground">
          Purpose &amp; Description of Commercial Activity <span className="text-destructive">*</span>
        </label>
        <Textarea
          placeholder="Briefly state premise commercial usage (e.g. Retail shop, clinic, office)..."
          className="text-xs min-h-[70px]"
          required
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="font-semibold text-foreground text-xs">Required Category Proof</p>
        <InteractiveDocUploader label="Municipal Trade License / GST Registration" fileType="pdf" required />
        <InteractiveDocUploader label="Proof of Ownership or Rental Agreement" fileType="pdf" required />
      </div>

      <FormActionButtons onClose={onClose} submitText="Submit Category Modification" />
    </form>
  )
}

// ── Specific Form 5: Solar Net-Metering ──

function SolarForm({
  consumer,
  consumerNo,
  onClose,
  onSubmitSuccess,
}: {
  consumer: Consumer | null
  consumerNo: string
  onClose: () => void
  onSubmitSuccess: () => void
}) {
  const currentLoad = consumer?.sanctionedLoad || 5

  return (
    <form className="space-y-4 text-xs" onSubmit={(e) => { e.preventDefault(); onSubmitSuccess() }}>
      <CurrentDetailsCard consumer={consumer} consumerNo={consumerNo} />

      <div className="rounded-xl border bg-amber-50/40 dark:bg-amber-950/20 p-3 space-y-1">
        <p className="font-semibold text-amber-900 dark:text-amber-200 text-xs flex items-center gap-1.5">
          <Sun className="h-3.5 w-3.5 text-amber-600" /> PM Surya Ghar: Muft Bijli Yojana Eligible
        </p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Sanctioned load allows rooftop solar capacity up to 100% of sanctioned load ({currentLoad} kWp).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block font-medium text-foreground">
            Proposed PV Plant Capacity (kWp) <span className="text-destructive">*</span>
          </label>
          <Input type="number" step="0.5" defaultValue="3.0" min="1" max={currentLoad} className="text-xs h-8" required />
        </div>
        <div>
          <label className="mb-1 block font-medium text-foreground">
            Inverter Make &amp; Rating <span className="text-destructive">*</span>
          </label>
          <Input placeholder="e.g. Growatt 3.3kW Grid-Tied" className="text-xs h-8" required />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block font-medium text-foreground">Anti-Islanding Protection</label>
          <RadioGroup defaultValue="yes" className="flex gap-4 mt-1.5">
            <div className="flex items-center gap-1.5"><RadioGroupItem value="yes" /><span className="text-xs">Yes, In-Built</span></div>
            <div className="flex items-center gap-1.5"><RadioGroupItem value="external" /><span className="text-xs">External Relay</span></div>
          </RadioGroup>
        </div>
        <div>
          <label className="mb-1 block font-medium text-foreground">Expected Commissioning</label>
          <Input type="date" defaultValue="2026-07-20" className="text-xs h-8" required />
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="font-semibold text-foreground text-xs">Required Solar Documents</p>
        <InteractiveDocUploader label="Rooftop Shadow-Free Area Photograph" fileType="jpg/jpeg" required />
        <InteractiveDocUploader label="MNRE Empaneled Vendor Work Order" fileType="pdf" required />
        <InteractiveDocUploader label="Inverter Type-Test Certificate" fileType="pdf" required />
      </div>

      <FormActionButtons onClose={onClose} submitText="Submit Net-Meter Application" />
    </form>
  )
}

// ── Specific Form 6: Support / Grievance Ticket ──

function TicketForm({
  consumer,
  consumerNo,
  onClose,
  onSubmitSuccess,
}: {
  consumer: Consumer | null
  consumerNo: string
  onClose: () => void
  onSubmitSuccess: () => void
}) {
  const [category, setCategory] = useState("meter")
  const [priority, setPriority] = useState("medium")

  return (
    <form className="space-y-4 text-xs" onSubmit={(e) => { e.preventDefault(); onSubmitSuccess() }}>
      <CurrentDetailsCard consumer={consumer} consumerNo={consumerNo} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="mb-1 block font-medium text-foreground">
            Complaint Category <span className="text-destructive">*</span>
          </label>
          <Select value={category} onValueChange={(v) => setCategory(v || "meter")}>
            <SelectTrigger className="text-xs h-8">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {problemCategories.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1 block font-medium text-foreground">
            Specific Issue <span className="text-destructive">*</span>
          </label>
          <Select required defaultValue={subCategories[category]?.[0]?.value || "other"}>
            <SelectTrigger className="text-xs h-8">
              <SelectValue placeholder="Select specific problem" />
            </SelectTrigger>
            <SelectContent>
              {subCategories[category]?.map((sc) => (
                <SelectItem key={sc.value} value={sc.value}>{sc.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="mb-1 block font-medium text-foreground">Urgency / Severity Level</label>
        <RadioGroup value={priority} onValueChange={setPriority} className="grid grid-cols-3 gap-2 mt-1">
          <label className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
            priority === "low" ? "bg-muted border-foreground/50 font-medium" : "hover:bg-muted/50"
          }`}>
            <RadioGroupItem value="low" className="sr-only" />
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Low (Routine)</span>
          </label>
          <label className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
            priority === "medium" ? "bg-muted border-foreground/50 font-medium" : "hover:bg-muted/50"
          }`}>
            <RadioGroupItem value="medium" className="sr-only" />
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Medium</span>
          </label>
          <label className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
            priority === "high" ? "bg-muted border-foreground/50 font-medium" : "hover:bg-muted/50"
          }`}>
            <RadioGroupItem value="high" className="sr-only" />
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>High / Urgent</span>
          </label>
        </RadioGroup>
      </div>

      <div>
        <label className="mb-1 block font-medium text-foreground">
          Detailed Description of Grievance <span className="text-destructive">*</span>
        </label>
        <Textarea
          placeholder="Please describe what happened, since when, appliance symptoms or location landmark..."
          className="text-xs min-h-[80px]"
          required
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="font-semibold text-foreground text-xs">Optional Photo / Screenshot</p>
        <InteractiveDocUploader label="Meter display photo or burnt component" fileType="jpg/jpeg" required={false} />
      </div>

      <FormActionButtons onClose={onClose} submitText="Register Complaint" />
    </form>
  )
}

// ── Ticket Lifecycle Detail Modal ──

function TicketLifecycleModal({ ticket, onClose }: { ticket: TicketRecord; onClose: () => void }) {
  const [remarkInput, setRemarkInput] = useState("")
  const [remarks, setRemarks] = useState<string[]>([])

  function handleAddRemark(e: React.FormEvent) {
    e.preventDefault()
    if (!remarkInput.trim()) return
    setRemarks([...remarks, remarkInput.trim()])
    setRemarkInput("")
  }

  return (
    <Dialog open={!!ticket} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4 bg-card sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary">{ticket.id}</span>
              <Badge variant="outline" className="text-[10px] capitalize">
                {ticket.status}
              </Badge>
            </div>
            <DialogTitle className="text-sm font-semibold mt-1 leading-snug">
              {ticket.subject}
            </DialogTitle>
          </div>
        </div>

        <div className="p-5 space-y-5 text-xs">
          {/* Metadata Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg border bg-muted/30">
            <div>
              <span className="text-[11px] text-muted-foreground block">Assigned Section</span>
              <span className="font-medium text-foreground">{ticket.subDivision}</span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Field In-Charge</span>
              <span className="font-medium text-foreground truncate block">{ticket.assignedTo}</span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Logged On</span>
              <span className="font-medium text-foreground">{ticket.date}</span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div>
            <p className="font-semibold text-foreground text-xs mb-3">Live Resolution Stepper</p>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {ticket.timeline.map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Step Dot */}
                  <span className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                    step.completed ? "bg-primary text-primary-foreground border-primary" :
                    step.current ? "bg-blue-100 text-blue-700 border-blue-400 ring-2 ring-blue-300 dark:bg-blue-950 dark:text-blue-200" :
                    "bg-card text-muted-foreground border-border"
                  }`}>
                    {step.completed ? <Check className="h-3 w-3" /> : idx + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-semibold ${step.current ? "text-primary" : "text-foreground"}`}>
                        {step.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground">{step.date}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Officer Latest Update Note */}
          <div className="rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 p-3 space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Field Inspection Officer Remarks
            </span>
            <p className="text-xs text-foreground italic leading-relaxed">
              &quot;{ticket.lastUpdate}&quot;
            </p>
          </div>

          {/* Consumer Remarks Log */}
          {remarks.length > 0 && (
            <div className="space-y-1.5">
              <p className="font-semibold text-foreground text-xs">Your Follow-up Comments:</p>
              {remarks.map((r, i) => (
                <div key={i} className="rounded-md border bg-muted/40 p-2 text-xs">
                  {r}
                </div>
              ))}
            </div>
          )}

          {/* Add Consumer Follow-up message */}
          <form onSubmit={handleAddRemark} className="space-y-2 pt-1">
            <label className="font-medium text-foreground text-xs block">
              Add Note / Additional Information for Lineman
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Type follow-up note (e.g. gate is locked, call before visit)..."
                value={remarkInput}
                onChange={(e) => setRemarkInput(e.target.value)}
                className="text-xs h-8"
              />
              <Button type="submit" size="sm" className="h-8 text-xs shrink-0">
                Post Note
              </Button>
            </div>
          </form>

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading Services Hub...</div>}>
      <ServicesInner />
    </Suspense>
  )
}
