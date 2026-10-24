"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Hash, FileKey, Phone, Mail,
  MapPin, Cpu, CheckCircle2, ArrowLeft, ArrowUpRight,
  Pencil, AlertCircle, ShieldCheck, Copy, Check, Building2,
  Headphones, RefreshCw, Zap
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import SidebarLayout from "@/components/layout/sidebar-layout"
import { fetchConsumerByNo } from "@/data/demo"
import type { Consumer } from "@/data/types"
import { setStoredProfileUpdates } from "@/lib/storage"

function ProfileInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const consumerNo = searchParams.get("consumer") || "KPDCL-2024-001"

  const [consumer, setConsumer] = useState<Consumer | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Edit contact modals state
  const [editField, setEditField] = useState<"phone" | "email" | null>(null)
  const [editValue, setEditValue] = useState("")
  const [confirmValue, setConfirmValue] = useState("")
  const [validationError, setValidationError] = useState("")
  const [modalStep, setModalStep] = useState<"edit" | "otp" | "success" | "failure">("edit")
  const [otpCode, setOtpCode] = useState("")

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Load consumer details (with local overrides handled by fetchConsumerByNo)
  useEffect(() => {
    fetchConsumerByNo(consumerNo).then((data) => {
      if (data) setConsumer(data)
    })
  }, [consumerNo])

  if (!consumer) {
    return (
      <SidebarLayout consumerNo={consumerNo}>
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading consumer profile record...</p>
        </div>
      </SidebarLayout>
    )
  }

  // Open edit modal handler
  function handleOpenEdit(type: "phone" | "email", currentVal: string) {
    setEditField(type)
    setEditValue(currentVal)
    setConfirmValue(currentVal)
    setModalStep("edit")
    setOtpCode("")
    setValidationError("")
  }

  // Send verification triggers step shift
  function handleSendVerification(e: React.FormEvent) {
    e.preventDefault()
    setValidationError("")
    
    if (editValue.trim() !== confirmValue.trim()) {
      setValidationError("New and Confirm values do not match!")
      return
    }

    if (editField === "phone" && !/^\d{10}$/.test(editValue.trim())) {
      setValidationError("Please enter a valid 10-digit mobile number.")
      return
    }

    if (editField === "email" && !/\S+@\S+\.\S+/.test(editValue.trim())) {
      setValidationError("Please enter a valid email address.")
      return
    }
    
    setModalStep("otp")
  }

  // Verify OTP handler (demo logic: "123456" succeeds)
  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!consumer) return

    if (otpCode.trim() === "123456") {
      const updatedMobile = editField === "phone" ? editValue.trim() : consumer.mobile
      const updatedEmail = editField === "email" ? editValue.trim() : consumer.email

      setConsumer({
        ...consumer,
        mobile: updatedMobile,
        email: updatedEmail
      })

      setStoredProfileUpdates(consumerNo, {
        mobile: updatedMobile,
        email: updatedEmail
      })

      setModalStep("success")
    } else {
      setModalStep("failure")
    }
  }

  const initials = consumer.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <SidebarLayout consumerNo={consumerNo}>
      <div className="space-y-6">
        
        {/* Breadcrumbs & Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push(`/dashboard?consumer=${encodeURIComponent(consumerNo)}`)}
              className="h-7 px-2 -ml-2 text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">Consumer Profile</h1>
            <p className="text-xs text-muted-foreground">Official electricity supply registration and ownership credentials</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 text-xs px-2.5 py-1 flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Grid Supply
            </Badge>
          </div>
        </div>

        {/* Hero Profile Summary Card - Full Bleed Card (No Half Banner Cutout) */}
        <Card className="border border-blue-500/20 bg-linear-to-r from-blue-700 via-blue-600 to-indigo-700 dark:from-blue-950 dark:via-blue-900 dark:to-indigo-950 text-white shadow-sm overflow-hidden relative">
          {/* Subtle Grid & Lighting Watermark */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
            <Zap className="h-44 w-44" />
          </div>

          <CardContent className="p-5 sm:p-6 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
              {/* User Identity Info - Fully Responsive (Zero mobile clipping) */}
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <Avatar className="h-14 w-14 sm:h-16 sm:w-16 ring-2 ring-white/30 shadow-md shrink-0">
                  <AvatarFallback className="bg-white text-blue-700 text-lg sm:text-xl font-bold tracking-tight">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white truncate">
                      {consumer.name}
                    </h2>
                    <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-white backdrop-blur-xs">
                      {consumer.category} ({consumer.connectionType})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-100 font-mono">
                    <span>ID: {consumer.consumerNo}</span>
                    <button
                      onClick={() => handleCopy(consumer.consumerNo, "cno")}
                      className="hover:text-white p-0.5 rounded transition-colors"
                      title="Copy Consumer ID"
                    >
                      {copiedKey === "cno" ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Full Width on Mobile, Inline on Desktop */}
              <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t border-white/10 sm:border-t-0">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => router.push(`/billing?consumer=${encodeURIComponent(consumerNo)}`)}
                  className="text-xs h-8.5 gap-1.5 bg-white/10 border-white/25 text-white hover:bg-white/20 hover:text-white cursor-pointer justify-center"
                >
                  <span>Billing Ledger</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => router.push(`/documents?consumer=${encodeURIComponent(consumerNo)}`)}
                  className="text-xs h-8.5 gap-1.5 bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-xs border-0 cursor-pointer justify-center"
                >
                  <FileKey className="h-3.5 w-3.5" />
                  <span>No Dues Certificate</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4 Master Record Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Card 1: Account & Supply Record */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" />
                Account &amp; Registration Ledger
              </CardTitle>
              <CardDescription className="text-xs">Statutory DISCOM identification numbers</CardDescription>
            </CardHeader>
            <CardContent className="pt-3 divide-y text-xs">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">Consumer ID</span>
                <span className="font-mono font-bold text-foreground">{consumer.consumerNo}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">Account Number</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-foreground">{consumer.accountId}</span>
                  <button
                    onClick={() => handleCopy(consumer.accountId, "acc")}
                    className="text-muted-foreground hover:text-foreground"
                    title="Copy Account ID"
                  >
                    {copiedKey === "acc" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">Sanctioned Load</span>
                <span className="font-bold text-foreground">{consumer.sanctionedLoad} kW</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">Tariff Classification</span>
                <span className="font-medium text-foreground capitalize">{consumer.connectionType} (LT-1)</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">Billing Category</span>
                <span className="font-medium text-foreground">{consumer.category} (Smart AMI)</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">Agreement ID</span>
                <span className="font-mono text-muted-foreground">SA-2024-KPDCL-001</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Metering & Sub-Station Hardware */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                Smart Metering &amp; Substation
              </CardTitle>
              <CardDescription className="text-xs">Live telemetry and grid feeder details</CardDescription>
            </CardHeader>
            <CardContent className="pt-3 divide-y text-xs">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">Smart Meter Serial</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-foreground">{consumer.meterSerialNo}</span>
                  <button
                    onClick={() => handleCopy(consumer.meterSerialNo, "meter")}
                    className="text-muted-foreground hover:text-foreground"
                    title="Copy Meter Serial"
                  >
                    {copiedKey === "meter" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">Meter Make / Spec</span>
                <span className="font-medium text-foreground">L&amp;T Smart AMI (Bidirectional)</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">Supply Feeder</span>
                <span className="font-medium text-foreground">11 kV Rajbagh Feeder</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">Receiving Grid Station</span>
                <span className="font-medium text-foreground">132/33kV Bemina Station</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">AMI Signal Health</span>
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 100% Cellular Sync
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">Switch State</span>
                <span className="font-medium text-emerald-600">Connected / Closed</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Verified Contacts & Direct Update */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Registered Contact Information
              </CardTitle>
              <CardDescription className="text-xs">Used for SMS outage alerts, bills, and payment tokens</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              {/* Phone item */}
              <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Registered Mobile</p>
                    <p className="font-mono font-bold text-foreground mt-0.5">{consumer.mobile}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit("phone", consumer.mobile)}
                  className="h-7 text-xs gap-1"
                >
                  <Pencil className="h-3 w-3" /> Update
                </Button>
              </div>

              {/* Email item */}
              <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Registered Email</p>
                    <p className="font-medium text-foreground mt-0.5 truncate max-w-[170px]">{consumer.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit("email", consumer.email)}
                  className="h-7 text-xs gap-1"
                >
                  <Pencil className="h-3 w-3" /> Update
                </Button>
              </div>

              {/* Address item */}
              <div className="p-3 rounded-xl border bg-muted/30 flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Premises Supply Address</p>
                  <p className="text-xs font-medium text-foreground mt-0.5 leading-relaxed">{consumer.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Administrative Hierarchy & Emergency Outage */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Sub-Division Hierarchy &amp; Escalation
              </CardTitle>
              <CardDescription className="text-xs">Designated officers under J&amp;K Public Services Guarantee</CardDescription>
            </CardHeader>
            <CardContent className="pt-3 divide-y text-xs">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">Electric Sub-Division</span>
                <span className="font-medium text-foreground">Sub-Division II (Rajbagh)</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">Sub-Divisional Officer (SDO)</span>
                <span className="font-medium text-foreground">Er. Mushtaq Ahmad</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">Section Junior Engineer (JE)</span>
                <span className="font-medium text-foreground">Er. Firdous Ahmad</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground">Executive Engineer (XEN)</span>
                <span className="font-medium text-foreground">Electric Division II (Srinagar)</span>
              </div>

              <div className="pt-3">
                <div className="rounded-xl border bg-linear-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Headphones className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">24x7 Emergency Call Center</p>
                      <p className="text-[10px] text-muted-foreground">Immediate outage &amp; fault report</p>
                    </div>
                  </div>
                  <span className="font-mono text-base font-bold text-primary">1912</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Dynamic Verification Wizard Modal */}
        <Dialog open={!!editField} onOpenChange={(op) => { if (!op) setEditField(null) }}>
          <DialogContent className="sm:max-w-md p-6">
            
            {/* Step 1: Input value change */}
            {modalStep === "edit" && (
              <form onSubmit={handleSendVerification} className="space-y-4 text-xs">
                <DialogHeader>
                  <DialogTitle className="text-base font-bold">
                    Update Registered {editField === "phone" ? "Mobile Number" : "Email Address"}
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Enter and confirm your new {editField === "phone" ? "phone number" : "email address"}. A verification OTP will be simulated.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-1">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                      Current Value
                    </label>
                    <div className="h-8 px-3 flex items-center bg-muted/50 border rounded-md text-muted-foreground text-xs font-mono">
                      {editField === "phone" ? consumer.mobile : consumer.email}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                      New {editField === "phone" ? "Mobile (10 digits)" : "Email Address"} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type={editField === "phone" ? "tel" : "email"}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder={editField === "phone" ? "e.g. 9419000008" : "e.g. user@example.com"}
                      className="h-8 text-xs font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                      Confirm New Value <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type={editField === "phone" ? "tel" : "email"}
                      value={confirmValue}
                      onChange={(e) => setConfirmValue(e.target.value)}
                      placeholder={editField === "phone" ? "Re-enter 10-digit number" : "Re-enter email address"}
                      className="h-8 text-xs font-medium"
                      required
                    />
                  </div>

                  {validationError && (
                    <p className="text-xs font-medium text-destructive flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {validationError}
                    </p>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditField(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="shadow-xs">
                    Send Verification Code
                  </Button>
                </div>
              </form>
            )}

            {/* Step 2: OTP Entry */}
            {modalStep === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                <DialogHeader>
                  <DialogTitle className="text-base font-bold">Verify Registration</DialogTitle>
                  <DialogDescription className="text-xs">
                    A 6-digit confirmation code was dispatched to <strong className="font-mono text-foreground">{editValue}</strong>.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-1">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                      Enter 6-Digit OTP Code
                    </label>
                    <Input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="e.g. 123456"
                      className="h-9 text-center font-mono font-bold tracking-widest text-sm"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground p-2 rounded-lg bg-muted/40">
                    <span>Demo Verification Code: <strong className="text-primary font-mono">123456</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtpCode("123456")}
                      className="text-primary hover:underline font-semibold"
                    >
                      Auto-fill
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button type="button" variant="outline" size="sm" onClick={() => setModalStep("edit")}>
                    Back
                  </Button>
                  <Button type="submit" size="sm" className="shadow-xs">
                    Confirm &amp; Update
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Success Screen */}
            {modalStep === "success" && (
              <div className="space-y-4 py-2 text-center text-xs">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Contact Record Updated</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your registered {editField === "phone" ? "mobile number" : "email address"} has been successfully updated to <strong className="text-foreground font-mono">{editValue}</strong>.
                  </p>
                </div>
                <div className="pt-2 flex justify-center">
                  <Button type="button" size="sm" onClick={() => setEditField(null)}>
                    Done
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Failure Screen */}
            {modalStep === "failure" && (
              <div className="space-y-4 py-2 text-center text-xs">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Invalid Code</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    The code you entered does not match. Please use demo code <strong className="font-mono text-foreground">123456</strong>.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditField(null)}>
                    Cancel
                  </Button>
                  <Button type="button" size="sm" onClick={() => { setModalStep("otp"); setOtpCode("123456"); }}>
                    Try Again
                  </Button>
                </div>
              </div>
            )}

          </DialogContent>
        </Dialog>
      </div>
    </SidebarLayout>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading Profile...</div>}>
      <ProfileInner />
    </Suspense>
  )
}
