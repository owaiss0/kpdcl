"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/login")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-slate-500 text-sm font-medium animate-pulse">
        Redirecting to login portal...
      </div>
    </div>
  )
}
