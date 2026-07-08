"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  User, Hash, Zap, FileKey, Calendar, Gauge, Phone, Mail,
  MapPin, Cpu, CheckCircle2, ChevronLeft, ArrowUpRight,
  Pencil, AlertCircle, ShieldCheck
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import SidebarLayout from "@/components/layout/sidebar-layout"
import { fetchConsumerByNo } from "@/data/demo"
import type { Consumer } from "@/data/types"

function ProfileInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const consumerNo = searchParams.get("consumer") || "KPDCL-2024-001"

  const [consumer, setConsumer] = useState<Consumer | null>(null)

  // Edit contact modals state
  const [editField, setEditField] = useState<"phone" | "email" | null>(null)
  const [editValue, setEditValue] = useState("")
  const [confirmValue, setConfirmValue] = useState("")
  const [validationError, setValidationError] = useState("")
  const [modalStep, setModalStep] = useState<"edit" | "otp" | "success" | "failure">("edit")
  const [otpCode, setOtpCode] = useState("")

  // Load consumer details & local overrides
  useEffect(() => {
    fetchConsumerByNo(consumerNo).then((data) => {
      if (data) {
        try {
          const storedUpdates = localStorage.getItem(`kpdcl_profile_updates_${consumerNo}`)
          if (storedUpdates) {
            const parsed = JSON.parse(storedUpdates)
            setConsumer({
              ...data,
              mobile: parsed.mobile || data.mobile,
              email: parsed.email || data.email
            })
          } else {
            setConsumer(data)
          }
        } catch (e) {
          console.error(e)
          setConsumer(data)
        }
      }
    })
  }, [consumerNo])

  if (!consumer) {
    return (
      <SidebarLayout consumerNo={consumerNo}>
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Loading consumer profile...
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
      setValidationError(`New and Confirm values do not match!`)
      return
    }
    
    setModalStep("otp")
  }

  // Verify OTP handler (demo logic: "123456" succeeds, other fails)
  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!consumer) return

    if (otpCode.trim() === "123456") {
      const updatedMobile = editField === "phone" ? editValue.trim() : consumer.mobile
      const updatedEmail = editField === "email" ? editValue.trim() : consumer.email

      // Update state
      setConsumer({
        ...consumer,
        mobile: updatedMobile,
        email: updatedEmail
      })

      // Save override to localStorage
      localStorage.setItem(`kpdcl_profile_updates_${consumerNo}`, JSON.stringify({
        mobile: updatedMobile,
        email: updatedEmail
      }))

      setModalStep("success")
    } else {
      setModalStep("failure")
    }
  }

  return (
    <SidebarLayout consumerNo={consumerNo}>
      <div className="space-y-6">
        {/* Breadcrumbs / Header navigation */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push(`/dashboard?consumer=${consumerNo}`)}
              className="h-8 px-2 -ml-2 text-slate-500 hover:text-slate-900"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Dashboard
            </Button>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">Consumer Profile</h1>
            <p className="text-xs text-muted-foreground">Official supply details & ownership record</p>
          </div>
          
          <Badge className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-50 font-bold px-3 py-1 text-xs shrink-0 w-fit flex items-center gap-1.5 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" />
            Active Supply
          </Badge>
        </div>

        {/* Profile Header Summary Card */}
        <Card className="overflow-hidden shadow-md border-slate-200 bg-white">
          <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-950 px-6 py-12 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-12 pointer-events-none">
              <Zap className="h-36 w-36 text-white" />
            </div>
          </div>
          <CardContent className="relative -mt-10 flex flex-col md:flex-row items-start md:items-end gap-5 px-6 pb-6 min-w-0">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white shadow-lg shrink-0 rounded-full bg-white">
              <AvatarFallback className="bg-linear-to-tr from-blue-600 to-indigo-700 text-white text-2xl font-black rounded-full">
                {consumer.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col sm:flex-row sm:items-end sm:justify-between gap-4 w-full min-w-0 pb-1.5">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 truncate">{consumer.name}</h2>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 font-bold text-xs uppercase px-2 py-0.5 border border-blue-100/50">
                    {consumer.connectionType === "domestic" ? "Domestic" : consumer.connectionType === "commercial" ? "Commercial" : "Industrial"}
                  </Badge>
                </div>
                <p className="text-xs font-mono font-bold text-muted-foreground flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-slate-400" />
                  ID: {consumer.consumerNo}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => router.push(`/billing?consumer=${consumerNo}`)}
                  className="text-xs border-slate-200 hover:bg-slate-50"
                >
                  Billing Ledger
                  <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2-Column Info Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Column Left: Metering & Registration Details */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Supply & Metering details */}
            <Card className="shadow-xs border-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                  <Cpu className="h-4 w-4 text-blue-600" />
                  Supply & Metering Info
                </CardTitle>
                <CardDescription>Grid connection hardware details and load statistics</CardDescription>
              </CardHeader>
              <CardContent className="pt-5 p-0">
                <div className="grid sm:grid-cols-2 gap-px bg-slate-100 divide-y sm:divide-y-0 divide-slate-100">
                  
                  {/* Field 1 */}
                  <div className="bg-white p-5 flex items-start gap-4">
                    <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <Gauge className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sanctioned Load</p>
                      <p className="text-lg font-black text-slate-800 mt-0.5">{consumer.sanctionedLoad} kW</p>
                      <p className="text-[10px] text-muted-foreground">Authorized maximum peak draw</p>
                    </div>
                  </div>

                  {/* Field 2 */}
                  <div className="bg-white p-5 flex items-start gap-4">
                    <div className="h-9 w-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Smart Meter Serial</p>
                      <p className="text-base font-mono font-bold text-slate-800 mt-1">{consumer.meterSerialNo}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Model batch Make: SMx-2024</p>
                    </div>
                  </div>

                  {/* Field 3 */}
                  <div className="bg-white p-5 flex items-start gap-4">
                    <div className="h-9 w-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Feeder Division Code</p>
                      <p className="text-base font-bold text-slate-800 mt-1">FV-21B (Srinagar)</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Connected local substation feeder</p>
                    </div>
                  </div>

                  {/* Field 4 */}
                  <div className="bg-white p-5 flex items-start gap-4">
                    <div className="h-9 w-9 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Meter Make / Status</p>
                      <p className="text-base font-bold text-slate-800 mt-1">L&T Smart Meter</p>
                      <p className="text-[10px] text-green-600 font-semibold mt-0.5">● Communicating / Online</p>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Registration & Legal Details */}
            <Card className="shadow-xs border-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                  <FileKey className="h-4 w-4 text-blue-600" />
                  Account & Agreement Records
                </CardTitle>
                <CardDescription>Official administrative registrations and identifiers</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="divide-y divide-slate-100">
                  
                  <div className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-3">
                      <Hash className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">Account ID</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-slate-800">{consumer.accountId}</span>
                  </div>

                  <div className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-3">
                      <FileKey className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">Service Agreement ID</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-slate-800">SA-2024-001</span>
                  </div>

                  <div className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-3">
                      <Hash className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">Installation Number</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-slate-800">INST-87321</span>
                  </div>

                  <div className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">Parentage</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800">Ghulam Mohammad</span>
                  </div>

                  <div className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">Service Activation Date</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800">January 3, 2025</span>
                  </div>

                </div>
              </CardContent>
            </Card>

          </div>

          {/* Column Right: Contact Information */}
          <div className="lg:col-span-4 space-y-6">
            
            <Card className="shadow-xs border-slate-200 bg-linear-to-b from-white to-slate-50/50">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                  <Phone className="h-4 w-4 text-blue-600" />
                  Registered Contacts
                </CardTitle>
                <CardDescription>Contact numbers for billing alerts and SMS</CardDescription>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                
                {/* Mobile Phone */}
                <div className="bg-white border rounded-xl p-4 flex items-center justify-between gap-3 shadow-2xs hover:border-blue-200 transition group/item">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mobile Phone</p>
                      <a href={`tel:${consumer.mobile}`} className="text-sm font-bold text-slate-800 hover:text-blue-600 transition mt-0.5 block">
                        {consumer.mobile}
                      </a>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
                    onClick={() => handleOpenEdit("phone", consumer.mobile)}
                    title="Edit Phone Number"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Email Address */}
                <div className="bg-white border rounded-xl p-4 flex items-center justify-between gap-3 shadow-2xs hover:border-blue-200 transition group/item">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</p>
                      <a href={`mailto:${consumer.email}`} className="text-sm font-bold text-slate-800 hover:text-blue-600 transition mt-0.5 block truncate">
                        {consumer.email}
                      </a>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
                    onClick={() => handleOpenEdit("email", consumer.email)}
                    title="Edit Email Address"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Address Map */}
                <div className="bg-white border rounded-xl p-4 flex gap-3 shadow-2xs">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Supply Address</p>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold mt-1">
                      {consumer.address}
                    </p>
                  </div>
                </div>

              </CardContent>
            </Card>

          </div>
        </div>

        {/* Dynamic Verification Wizard Modal */}
        <Dialog open={!!editField} onOpenChange={(op) => { if (!op) setEditField(null) }}>
          <DialogContent className="sm:max-w-md p-6 bg-white rounded-xl shadow-lg border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Step 1: Input value change */}
            {modalStep === "edit" && (
              <form onSubmit={handleSendVerification} className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-base font-bold text-slate-900">
                    Update Registered {editField === "phone" ? "Mobile Phone" : "Email Address"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3.5 py-2">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Please enter and confirm your new {editField === "phone" ? "phone number" : "email address"}. 
                    We will send a 6-digit verification code to confirm ownership.
                  </p>

                  {/* Current detail (read-only) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Current {editField === "phone" ? "Phone Number" : "Email Address"}
                    </label>
                    <div className="h-10 px-3 flex items-center bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm font-semibold select-none">
                      {editField === "phone" ? consumer.mobile : consumer.email}
                    </div>
                  </div>

                  {/* New value input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      New {editField === "phone" ? "Phone Number" : "Email Address"}
                    </label>
                    <Input
                      type={editField === "phone" ? "tel" : "email"}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder={editField === "phone" ? "e.g. 9876543210" : "e.g. user@example.com"}
                      className="h-10 text-sm"
                      required
                    />
                  </div>

                  {/* Confirm new value input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Confirm New {editField === "phone" ? "Phone Number" : "Email Address"}
                    </label>
                    <Input
                      type={editField === "phone" ? "tel" : "email"}
                      value={confirmValue}
                      onChange={(e) => setConfirmValue(e.target.value)}
                      placeholder={editField === "phone" ? "e.g. 9876543210" : "e.g. user@example.com"}
                      className="h-10 text-sm"
                      required
                    />
                  </div>

                  {validationError && (
                    <p className="text-xs font-semibold text-destructive mt-1.5 flex items-center gap-1.5 animate-in fade-in duration-100">
                      <AlertCircle className="h-4 w-4" />
                      {validationError}
                    </p>
                  )}
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditField(null)} className="h-9 text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="h-9 text-xs">
                    Send Verification Code
                  </Button>
                </div>
              </form>
            )}

            {/* Step 2: OTP Entry */}
            {modalStep === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-base font-bold text-slate-900">
                    Verify Registration
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3.5 py-2">
                  <div className="text-xs text-slate-500 leading-relaxed flex flex-wrap items-center gap-1.5">
                    <span>A 6-digit code has been dispatched to:</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                      {editValue}
                      <button 
                        type="button" 
                        onClick={() => { setModalStep("edit"); setValidationError(""); }}
                        className="text-blue-600 hover:text-blue-700 transition"
                        title="Correct typo in phone/email"
                      >
                        <Pencil className="h-3 w-3 inline text-blue-600" />
                      </button>
                    </span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Enter 6-Digit OTP
                    </label>
                    <Input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="e.g. 123456"
                      className="h-10 text-sm text-center font-mono font-bold tracking-widest"
                      required
                    />
                    <p className="text-[9px] text-slate-400 font-semibold leading-normal">
                      ℹ️ For demonstration: Enter <span className="font-bold text-blue-600">123456</span> to simulate success. Any other code simulates failure.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setModalStep("edit")} className="h-9 text-xs">
                    Back
                  </Button>
                  <Button type="submit" size="sm" className="h-9 text-xs">
                    Verify Code
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Success Screen */}
            {modalStep === "success" && (
              <div className="space-y-4 py-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 border border-green-200 text-green-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Verification Successful</h3>
                  <p className="text-xs text-slate-500 leading-relaxed px-2">
                    Your registered {editField === "phone" ? "phone number" : "email address"} has been successfully updated to <span className="font-semibold text-slate-800">{editValue}</span>.
                  </p>
                </div>
                <div className="pt-2 flex justify-center">
                  <Button type="button" size="sm" onClick={() => setEditField(null)} className="h-9 text-xs px-6">
                    Close Window
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Failure Screen */}
            {modalStep === "failure" && (
              <div className="space-y-4 py-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 border border-red-200 text-red-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Verification Failed</h3>
                  <p className="text-xs text-slate-500 leading-relaxed px-2">
                    The verification code you entered is invalid. Please try again.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditField(null)} className="h-9 text-xs">
                    Cancel
                  </Button>
                  <Button type="button" size="sm" onClick={() => { setModalStep("otp"); setOtpCode(""); }} className="h-9 text-xs px-6 bg-red-600 hover:bg-red-700 text-white">
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading...</div>}>
      <ProfileInner />
    </Suspense>
  )
}
