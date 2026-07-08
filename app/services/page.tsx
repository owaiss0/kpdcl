"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  UserPen, ArrowLeftRight, Tag, Gauge, Sun, TicketPlus,
  Upload,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
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

const services = [
  { id: "name-change", label: "Name Change", icon: UserPen, desc: "Change name on your electricity connection", color: "bg-blue-100 text-blue-600" },
  { id: "ownership", label: "Ownership Change", icon: ArrowLeftRight, desc: "Transfer connection to another person", color: "bg-purple-100 text-purple-600" },
  { id: "category-change", label: "Category Change", icon: Tag, desc: "Change tariff or connection category", color: "bg-orange-100 text-orange-600" },
  { id: "load-change", label: "Load Change", icon: Gauge, desc: "Increase or decrease sanctioned load", color: "bg-cyan-100 text-cyan-600" },
  { id: "solar", label: "Solar Agreement", icon: Sun, desc: "Register solar / net metering", color: "bg-yellow-100 text-yellow-600" },
  { id: "ticket", label: "Raise / Track Ticket", icon: TicketPlus, desc: "Create or track a support ticket", color: "bg-red-100 text-red-600" },
]

const demoOpenTickets = [
  { id: "TKT-001", subject: "Meter not working", status: "open", date: "2026-06-20", priority: "high" },
  { id: "TKT-002", subject: "Billing discrepancy", status: "in-progress", date: "2026-06-18", priority: "medium" },
  { id: "TKT-003", subject: "Voltage fluctuation", status: "resolved", date: "2026-06-10", priority: "low" },
]

const statusBadge: Record<string, string> = {
  open: "bg-red-100 text-red-700",
  "in-progress": "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
}

const problemCategories = [
  { value: "bill-payment", label: "Bill Payment" },
  { value: "meter", label: "Meter" },
  { value: "safety", label: "Safety" },
  { value: "supply-issue", label: "Supply Issue" },
  { value: "other", label: "Other" },
]

const subCategories: Record<string, { value: string; label: string }[]> = {
  "bill-payment": [
    { value: "bill-not-generating", label: "Bill not generating" },
    { value: "bill-incorrect-usage", label: "Bill incorrect usage" },
    { value: "payment-error", label: "Payment error" },
    { value: "payment-incorrect-no", label: "Payment to incorrect no." },
    { value: "payment-not-showing", label: "Payment not showing" },
  ],
  meter: [
    { value: "incorrect-tagging", label: "Incorrect Tagging" },
    { value: "net-meter", label: "Net Meter" },
    { value: "damaged-meter", label: "Damaged Meter" },
    { value: "old-meter-exchange", label: "Old Meter Exchange" },
    { value: "non-communicating", label: "Non Communicating Meter" },
    { value: "meter-not-posted", label: "Meter Not Posted" },
    { value: "running-too-fast", label: "Running Too Fast" },
    { value: "improper-last-read", label: "Improper Last Read" },
    { value: "smart-meter-replacement", label: "Replacement of Smart Meter" },
    { value: "meter-closed-sa", label: "Meter installed for closed SA" },
    { value: "high-read-old-meter", label: "High read for old meter" },
    { value: "meter-shifting", label: "Meter shifting" },
    { value: "meter-not-sealed", label: "Meter not sealed" },
  ],
  safety: [{ value: "safety-general", label: "General Safety Issue" }],
  "supply-issue": [{ value: "supply-general", label: "General Supply Issue" }],
  other: [{ value: "other-general", label: "Other Issue" }],
}

// ── Main Page ──

function ServicesInner() {
  const searchParams = useSearchParams()
  const consumerNo = searchParams.get("consumer") || "KPDCL-2024-001"

  return (
    <SidebarLayout consumerNo={consumerNo}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-sm text-muted-foreground">Request changes, agreements, or raise tickets</p>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const Icon = s.icon
            return (
              <ServiceDialog key={s.id} service={s}>
                <Card className="cursor-pointer overflow-hidden transition-all hover:shadow-md">
                  {s.id !== "name-change" && <div className={`h-1.5 ${s.color.replace('text-', 'bg-').replace('100', '500')}`} />}
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold leading-tight">{s.label}</h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </ServiceDialog>
            )
          })}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoOpenTickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs font-medium">{t.id}</TableCell>
                    <TableCell>{t.subject}</TableCell>
                    <TableCell>{new Date(t.date).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        t.priority === "high" ? "bg-red-100 text-red-700" :
                        t.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }>{t.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadge[t.status]}>
                        {t.status === "in-progress" ? "In Progress" : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {demoOpenTickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No tickets found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  )
}

// ── Dialog ──

function ServiceDialog({ service, children }: { service: typeof services[number]; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const Icon = service.icon
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<div />} nativeButton={false}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto p-0 gap-0">
        <div className="flex items-center gap-3 border-b px-4 sm:px-6 py-4">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${service.color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-base">{service.label}</DialogTitle>
          </DialogHeader>
        </div>
        <div className="px-4 sm:px-6 pb-6 pt-5">
          {service.id === "name-change" && <NameChangeForm onClose={() => setOpen(false)} />}
          {service.id === "ownership" && <OwnershipForm onClose={() => setOpen(false)} />}
          {service.id === "category-change" && <CategoryForm onClose={() => setOpen(false)} />}
          {service.id === "load-change" && <LoadForm onClose={() => setOpen(false)} />}
          {service.id === "solar" && <SolarForm onClose={() => setOpen(false)} />}
          {service.id === "ticket" && <TicketForm onClose={() => setOpen(false)} />}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Shared Components ──

function FormActions({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
      <Button type="submit">Submit</Button>
    </div>
  )
}

function CurrentDetailsCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Details</p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">{children}</div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-2 py-0.5">
      <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>
      <span className="text-sm font-medium text-right truncate">{value}</span>
    </div>
  )
}

function DocBadge({ label, fileType, required }: { label: string; fileType: string; required: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-sm leading-snug">{label}</span>
        <Badge variant="outline" className="shrink-0 text-xs font-mono">{fileType}</Badge>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {required && <Badge className="bg-red-100 text-red-700 text-xs hover:bg-red-100">Mandatory</Badge>}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <Upload className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ── Name Change ──

function NameChangeForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onClose() }}>
      <CurrentDetailsCard>
        <Field label="Consumer ID" value="0207030008588" />
        <Field label="Sanction Load" value="2 KW" />
        <Field label="Registered Name" value="Mohammad Irfan" />
        <Field label="Mobile Number" value="8825037610" />
        <Field label="Address" value="House No. 42, Colony Road, Srinagar" />
      </CurrentDetailsCard>
      <div>
        <label className="mb-1.5 block text-sm font-medium">New Name</label>
        <Input placeholder="Specify the connection owner's new name" required />
      </div>
      <Separator />
      <div>
        <p className="mb-3 text-sm font-medium">Documents Required</p>
        <div className="space-y-2">
          <DocBadge label="Copy of latest bill duly paid" fileType="pdf" required />
          <DocBadge label="Proof of ownership / legal occupation" fileType="pdf" required />
          <DocBadge label="NOC from other legal heir(s)" fileType="pdf" required={false} />
          <DocBadge label="Other document" fileType="pdf" required={false} />
          <DocBadge label="NOC Published in Print Media" fileType="pdf" required />
        </div>
      </div>
      <FormActions onClose={onClose} />
    </form>
  )
}

// ── Ownership Change ──

function OwnershipForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onClose() }}>
      <CurrentDetailsCard>
        <Field label="Consumer ID" value="0207030008588" />
        <Field label="Sanction Load" value="2 KW" />
        <Field label="Registered Name" value="Mohammad Irfan" />
        <Field label="Mobile Number" value="8825037610" />
        <Field label="Address" value="House No. 42, Colony Road, Srinagar" />
      </CurrentDetailsCard>
      <div>
        <label className="mb-1.5 block text-sm font-medium">New Owner Name</label>
        <Input placeholder="Name of person in whose name connection to be changed" required />
      </div>
      <Separator />
      <div>
        <p className="mb-3 text-sm font-medium">Documents Required</p>
        <div className="space-y-2">
          <DocBadge label="Copy of latest bill duly paid" fileType="pdf" required />
          <DocBadge label="Proof of ownership / legal occupation" fileType="pdf" required />
          <DocBadge label="NOC from other legal heir(s)" fileType="pdf" required={false} />
          <DocBadge label="Other document" fileType="pdf" required={false} />
          <DocBadge label="NOC Published in Print Media" fileType="pdf" required />
        </div>
      </div>
      <FormActions onClose={onClose} />
    </form>
  )
}

// ── Category Change ──

function CategoryForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onClose() }}>
      <CurrentDetailsCard>
        <Field label="Consumer ID" value="0207030008588" />
        <Field label="Sanction Load" value="2 KW" />
        <Field label="Registered Name" value="Mohammad Irfan" />
        <Field label="Mobile Number" value="8825037610" />
        <Field label="Address" value="House No. 42, Colony Road, Srinagar" />
      </CurrentDetailsCard>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Tariff Category</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="domestic">Domestic</SelectItem>
            <SelectItem value="non-domestic">Non Domestic</SelectItem>
            <SelectItem value="agricultural">Agricultural</SelectItem>
            <SelectItem value="state-gov">State Government Dep.</SelectItem>
            <SelectItem value="central-gov">Central Government Dep.</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Reason for change</label>
        <Textarea placeholder="Explain the reason..." required />
      </div>
      <Separator />
      <div>
        <p className="mb-3 text-sm font-medium">Documents Required</p>
        <DocBadge label="Proof of ownership / legal occupation" fileType="pdf" required />
        <div className="mt-2">
          <DocBadge label="Other document (industrial/agricultural)" fileType="pdf" required={false} />
        </div>
      </div>
      <FormActions onClose={onClose} />
    </form>
  )
}

// ── Load Change ──

function LoadForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onClose() }}>
      <div className="rounded-xl border bg-cyan-50/50 px-4 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">Enhancement / Reduction</p>
      </div>
      <CurrentDetailsCard>
        <Field label="Consumer ID" value="0207030008588" />
        <Field label="Sanction Load" value="2 KW" />
        <Field label="Name" value="Mohammad Irfan" />
        <Field label="Mobile Number" value="8825037610" />
        <Field label="Address" value="House No. 42, Colony Road, Srinagar" />
      </CurrentDetailsCard>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Requested Load</label>
        <div className="relative">
          <Input type="number" step="0.5" min="0" placeholder="e.g. 5" className="pr-12" required />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">KW</span>
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Reason</label>
        <Textarea placeholder="Reason for load change" required />
      </div>
      <Separator />
      <div>
        <p className="mb-3 text-sm font-medium">Documents Required</p>
        <DocBadge label="Copy of latest bill duly paid" fileType="pdf" required />
      </div>
      <FormActions onClose={onClose} />
    </form>
  )
}

// ── Solar Agreement ──

function SolarForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onClose() }}>
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Applicant Details</p>
          <div className="rounded-xl border bg-card p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            <Field label="Consumer Name" value="Mohammad Irfan" />
            <Field label="Sanctioned Load" value="2 KW" />
            <Field label="Category" value="Domestic" />
            <Field label="Meter Serial No." value="KA-87321" />
            <Field label="Address" value="House No. 42, Colony Road, Srinagar" />
            <Field label="Mobile" value="8825037610" />
            <Field label="Email" value="irfan@example.com" />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Solar PV System Details</p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Capacity (kWp)</label>
              <Input type="number" step="0.1" placeholder="e.g. 5" required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Inverter Make/Type</label>
              <Input placeholder="Enter make/type" required />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Anti-islanding Protection?</label>
              <RadioGroup defaultValue="yes" className="flex gap-6 mt-1">
                <div className="flex items-center gap-2"><RadioGroupItem value="yes" /><span className="text-sm">YES</span></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="no" /><span className="text-sm">NO</span></div>
              </RadioGroup>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Solar Generation Installed?</label>
              <RadioGroup defaultValue="yes" className="flex gap-6 mt-1">
                <div className="flex items-center gap-2"><RadioGroupItem value="yes" /><span className="text-sm">YES</span></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="no" /><span className="text-sm">NO</span></div>
              </RadioGroup>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Expected Commissioning Date</label>
            <Input type="date" required />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <p className="mb-3 text-sm font-medium">Documents Required</p>
        <div className="space-y-2">
          <DocBadge label="Passport size picture" fileType="jpg/jpeg" required />
          <DocBadge label="Specimen Signature" fileType="jpg/jpeg" required />
          <DocBadge label="Test Certificates" fileType="pdf" required />
        </div>
      </div>
      <FormActions onClose={onClose} />
    </form>
  )
}

// ── Raise / Track Ticket ──

function TicketForm({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState("")

  return (
    <Tabs defaultValue="raise">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="raise">Raise Ticket</TabsTrigger>
        <TabsTrigger value="track">Track Ticket</TabsTrigger>
      </TabsList>

      <TabsContent value="raise" className="pt-5 space-y-5">
        <form onSubmit={(e) => { e.preventDefault(); onClose() }} className="space-y-5">
          <div className="rounded-xl border bg-card p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Consumer</p>
            <Field label="Consumer ID" value="0207030008588" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Problem Category</label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="-- Select One --" />
              </SelectTrigger>
              <SelectContent>
                {problemCategories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {category && subCategories[category] && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">Sub Category</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="-- Select One --" />
                </SelectTrigger>
                <SelectContent>
                  {subCategories[category].map((sc) => (
                    <SelectItem key={sc.value} value={sc.value}>{sc.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Describe your problem</label>
            <Textarea placeholder="Describe your issue in detail..." required />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="track" className="pt-5 space-y-5">
        <form onSubmit={(e) => { e.preventDefault(); onClose() }} className="space-y-5">
          <p className="text-sm text-muted-foreground">Select a ticket ID to view its status.</p>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Track ID</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="-- Select One --" />
              </SelectTrigger>
              <SelectContent>
                {demoOpenTickets.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.id} — {t.subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit">Track</Button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  )
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading...</div>}>
      <ServicesInner />
    </Suspense>
  )
}
