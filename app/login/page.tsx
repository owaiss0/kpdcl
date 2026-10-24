"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, ChevronLeft, PhoneCall } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login")
  // Quick Pay state
  const [consumerNo, setConsumerNo] = useState("")
  const [payError, setPayError] = useState("")

  function handleQuickPay(e: React.FormEvent) {
    e.preventDefault()
    setPayError("")
    if (!consumerNo.trim()) {
      setPayError("Please enter your consumer number")
      return
    }

    // Redirect directly to the billing page of the connection
    router.push(`/billing?consumer=${consumerNo.trim()}`)
  }


  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Image — left */}
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80"
          alt="Power lines"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 0px, 50vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-8 left-8 text-white">
          <h2 className="text-2xl font-bold">KPDCL</h2>
          <p className="text-sm text-white/80">
            Kashmir Power Distribution Corporation Limited
          </p>
        </div>
      </div>

      {/* Form — right */}
      <div className="flex flex-col p-6 md:p-10 justify-between bg-slate-50/20">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100/50">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold">
              K
            </div>
            <span className="font-semibold text-slate-800">KPDCL Portal</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <a 
              href="tel:1912" 
              className="text-blue-700 hover:text-blue-800 transition flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 shadow-2xs"
            >
              <PhoneCall className="h-3.5 w-3.5 text-blue-600" />
              <span>Helpline 1912</span>
            </a>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-full max-w-sm">
            {mode === "login" && (
              <div className="flex flex-col gap-6">
                <Tabs defaultValue="login" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Account Login</TabsTrigger>
                    <TabsTrigger value="quickpay">Quick Pay</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4 pt-1">
                    <LoginForm
                      onSignup={() => setMode("signup")}
                      onForgot={() => setMode("forgot")}
                    />
                  </TabsContent>
                  
                  <TabsContent value="quickpay" className="space-y-4 pt-1">
                    <form onSubmit={handleQuickPay} className="space-y-4">
                      <div className="space-y-1">
                        <h1 className="text-xl font-bold text-center">Quick Bill Pay</h1>
                        <p className="text-xs text-muted-foreground text-center">Enter your Consumer Number to view and pay bills directly</p>
                      </div>
                      <div className="space-y-1.5 pt-2">
                        <label className="text-xs font-semibold text-slate-700">Consumer Number</label>
                        <Input
                          type="text"
                          placeholder="e.g. KPDCL-2024-001"
                          value={consumerNo}
                          onChange={(e) => setConsumerNo(e.target.value)}
                          className="h-10 text-sm text-center font-mono font-semibold"
                          required
                        />
                        <p className="text-[10px] text-muted-foreground leading-snug">
                          Enter your 13-digit Consumer ID or KPDCL account code to pay bills without logging in.
                        </p>
                      </div>

                      {payError && <p className="text-xs text-destructive font-medium">{payError}</p>}

                      <Button type="submit" className="w-full h-10 mt-2">
                        Pay / View Dues
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>


              </div>
            )}

            {mode === "signup" && (
              <SignUpForm onBack={() => setMode("login")} />
            )}

            {mode === "forgot" && (
              <ForgotPasswordForm onBack={() => setMode("login")} />
            )}
          </div>
        </div>

        {/* Custom Footer */}
        <div className="text-center space-y-1 pt-4 border-t border-slate-100/50">
          <p className="text-[10px] font-semibold text-slate-700">
            Kashmir Power Distribution Corporation Limited &copy; 2026
          </p>
          <p className="text-[9px] text-slate-400">
            Helpline support: 1912 | Toll Free: 1800-180-1912 &middot; Government of Jammu &amp; Kashmir
          </p>
        </div>
      </div>
    </div>
  )
}

function SignUpForm({ onBack }: { onBack: () => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit">
        <ChevronLeft className="h-4 w-4" /> Back to login
      </button>
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Fill in your details to register</p>
      </div>
      <form className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="first-name" className="text-sm font-medium">First Name</label>
            <Input id="first-name" type="text" placeholder="John" className="mt-1" />
          </div>
          <div>
            <label htmlFor="last-name" className="text-sm font-medium">Last Name</label>
            <Input id="last-name" type="text" placeholder="Doe" className="mt-1" />
          </div>
        </div>
        <div>
          <label htmlFor="signup-phone" className="text-sm font-medium">Phone Number</label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+91</span>
            <Input id="signup-phone" type="tel" placeholder="9876543210" className="pl-10" />
          </div>
        </div>
        <div>
          <label htmlFor="signup-email" className="text-sm font-medium">Email</label>
          <Input id="signup-email" type="email" placeholder="john@example.com" className="mt-1" />
        </div>
        <div>
          <label htmlFor="signup-password" className="text-sm font-medium">Password</label>
          <div className="relative mt-1">
            <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="Create a password" className="pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="signup-confirm" className="text-sm font-medium">Confirm Password</label>
          <div className="relative mt-1">
            <Input id="signup-confirm" type={showConfirm ? "text" : "password"} placeholder="Re-enter password" className="pr-10" />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="mt-2">Sign Up</Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button onClick={onBack} className="underline underline-offset-4 hover:text-primary">Login</button>
      </p>
    </div>
  )
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email")
  const [otpMethod, setOtpMethod] = useState<"email" | "phone">("email")
  const [contactValue, setContactValue] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [showOtp, setShowOtp] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  if (step === "otp") {
    return (
      <div className="flex flex-col gap-6">
        <button type="button" onClick={() => setStep("email")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Verify OTP</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the 6-digit code sent to {otpMethod === "email" ? contactValue : `+91 ${contactValue.slice(0, -4).replace(/./g, "X")}${contactValue.slice(-4)}`}
          </p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setStep("reset"); }} className="flex flex-col gap-6">
          <div className="flex justify-center gap-1.5 sm:gap-2">
            {otp.map((digit, i) => (
              <Input
                key={i}
                type={showOtp ? "text" : "password"}
                maxLength={1}
                value={digit}
                onChange={(e) => {
                  const newOtp = [...otp]
                  newOtp[i] = e.target.value
                  setOtp(newOtp)
                  if (e.target.value && i < 5) {
                    const next = document.getElementById(`otp-${i + 1}`)
                    next?.focus()
                  }
                }}
                id={`otp-${i}`}
                className="h-11 w-9 sm:h-12 sm:w-10 text-center text-base sm:text-lg"
              />
            ))}
          </div>
          <button type="button" onClick={() => setShowOtp(!showOtp)} className="mx-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            {showOtp ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showOtp ? "Hide" : "Show"} OTP
          </button>
          
          <Button type="submit">Verify OTP</Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          <button type="button" className="underline underline-offset-4 hover:text-primary">Resend OTP</button>
        </p>
      </div>
    )
  }

  if (step === "reset") {
    return (
      <div className="flex flex-col gap-6">
        <button type="button" onClick={() => setStep("otp")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit">
          <ChevronLeft className="h-4 w-4" /> Back to OTP
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create New Password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose a secure new password for your account</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onBack(); }} className="flex flex-col gap-4">
          <div>
            <label htmlFor="new-password" className="text-sm font-medium">New Password</label>
            <div className="relative mt-1">
              <Input id="new-password" type={showNewPass ? "text" : "password"} placeholder="New password" className="pr-10" required />
              <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</label>
            <div className="relative mt-1">
              <Input id="confirm-password" type={showConfirmPass ? "text" : "password"} placeholder="Re-enter password" className="pr-10" required />
              <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="mt-2">Reset Password</Button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit">
        <ChevronLeft className="h-4 w-4" /> Back to login
      </button>
      <div className="text-center">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose how to receive the OTP</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); setStep("otp"); }} className="flex flex-col gap-4">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setOtpMethod("email")}
            className={`flex-1 rounded-lg border p-3 text-center text-sm transition-colors ${otpMethod === "email" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-input hover:bg-muted"}`}
          >
            <span className="block font-medium">Email</span>
            <span className="block text-xs text-muted-foreground mt-0.5">Send via email</span>
          </button>
          <button
            type="button"
            onClick={() => setOtpMethod("phone")}
            className={`flex-1 rounded-lg border p-3 text-center text-sm transition-colors ${otpMethod === "phone" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-input hover:bg-muted"}`}
          >
            <span className="block font-medium">Phone</span>
            <span className="block text-xs text-muted-foreground mt-0.5">Send via SMS</span>
          </button>
        </div>
        <div>
          <label htmlFor="forgot-contact" className="text-sm font-medium">
            {otpMethod === "email" ? "Email" : "Phone Number"}
          </label>
          <div className="relative mt-1">
            {otpMethod === "phone" && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium z-10">+91</span>
            )}
            <Input
              id="forgot-contact"
              type={otpMethod === "email" ? "email" : "tel"}
              placeholder={otpMethod === "email" ? "john@example.com" : "9876543210"}
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              className={otpMethod === "phone" ? "pl-10" : ""}
              required
            />
          </div>
        </div>
        <Button type="submit" className="mt-2">Send OTP</Button>
      </form>
    </div>
  )
}
