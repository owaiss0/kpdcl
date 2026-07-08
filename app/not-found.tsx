import Link from "next/link"
import { Zap, Home, LogIn } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-slate-50/40 p-4">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold">
          K
        </div>
        <span className="text-sm font-semibold text-slate-700">KPDCL Consumer Portal</span>
      </div>

      <Card className="w-full max-w-sm shadow-sm border-slate-200 text-center">
        <CardContent className="py-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 border border-blue-100">
            <Zap className="h-8 w-8 text-blue-600" />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">Error 404</p>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Page not found</h1>
          <p className="text-xs text-muted-foreground leading-relaxed mb-8">
            The page you requested does not exist in the KPDCL portal.
            It may have been moved, renamed, or is temporarily unavailable.
          </p>

          <div className="space-y-2.5">
            <Link href="/dashboard" className={buttonVariants({ className: "w-full" })}>
              <Home className="mr-1.5 h-4 w-4" />
              Go to Dashboard
            </Link>
            <Link
              href="/login"
              className={buttonVariants({ variant: "outline", className: "w-full" })}
            >
              <LogIn className="mr-1.5 h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-[10px] text-slate-400 font-semibold text-center">
        Kashmir Power Distribution Corporation Limited &copy; 2026
      </p>
    </div>
  )
}
