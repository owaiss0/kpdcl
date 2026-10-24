"use client"

import { Suspense, useMemo, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowDownLeft, ArrowUpRight, Wallet, Download, Printer, FileSpreadsheet, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import SidebarLayout from "@/components/layout/sidebar-layout"
import { fetchBillingRecords } from "@/data/demo"
import type { BillingRecord } from "@/data/types"
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts"

const combinedChartData = [
  { month: "Jan", transactions: 1800, recharge: 2000, balance: 200 },
  { month: "Feb", transactions: 1500, recharge: 1500, balance: 200 },
  { month: "Mar", transactions: 2100, recharge: 2500, balance: 600 },
  { month: "Apr", transactions: 2700, recharge: 2200, balance: 100 },
  { month: "May", transactions: 1845, recharge: 2000, balance: 255 },
  { month: "Jun", transactions: 500, recharge: 500, balance: 255 },
]

const typeBadgeConfig: Record<string, { label: string; className: string }> = {
  payment: { label: "Bill Debit", className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300" },
  recharge: { label: "Recharge", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300" },
  refund: { label: "Refund", className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300" },
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-"
  const parts = dateStr.split("T")[0].split("-")
  if (parts.length === 3) {
    const [y, m, d] = parts
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1] || m} ${y}`
  }
  return dateStr
}

function BillingInner() {
  const searchParams = useSearchParams()
  const consumerNo = searchParams.get("consumer") || "KPDCL-2024-001"

  const [records, setRecords] = useState<BillingRecord[]>([])
  const [fromDate, setFromDate] = useState("2026-04-01")
  const [toDate, setToDate] = useState("2026-06-30")

  useEffect(() => {
    fetchBillingRecords(consumerNo).then(setRecords)
  }, [consumerNo])

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (fromDate && r.date < fromDate) return false
      if (toDate && r.date > toDate) return false
      return true
    })
  }, [records, fromDate, toDate])

  const stats = useMemo(() => {
    let rechargeTotal = 0
    let debitTotal = 0
    filteredRecords.forEach((r) => {
      if (r.transactionAmount > 0) {
        rechargeTotal += r.transactionAmount
      } else {
        debitTotal += Math.abs(r.transactionAmount)
      }
    })
    const latestBalance = filteredRecords.length > 0 ? filteredRecords[0].availableBalance : 0
    return { rechargeTotal, debitTotal, latestBalance }
  }, [filteredRecords])

  function exportCSV() {
    const headers = ["Date", "Transaction ID", "Type", "Amount (INR)", "Available Balance (INR)"]
    const rows = filteredRecords.map((r) => [
      r.date,
      r.transactionId,
      r.transactionType,
      r.transactionAmount,
      r.availableBalance,
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `KPDCL_Billing_${consumerNo}_${fromDate}_to_${toDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function exportExcel() {
    exportCSV()
  }

  function handlePrint() {
    window.print()
  }

  return (
    <SidebarLayout consumerNo={consumerNo}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing & Transactions</h1>
          <p className="text-sm text-muted-foreground">Recharge ledger, consumption debits, and balance statements</p>
        </div>

        {/* 3 Summary Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground font-medium">Total Recharges</p>
                <p className="text-xl font-bold text-foreground font-mono">₹{stats.rechargeTotal.toLocaleString()}</p>
                <p className="text-[11px] text-emerald-600 font-medium">Credits in selected range</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground font-medium">Total Bill Debits</p>
                <p className="text-xl font-bold text-foreground font-mono">₹{stats.debitTotal.toLocaleString()}</p>
                <p className="text-[11px] text-red-600 font-medium">Settled against consumption</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground font-medium">Available Balance</p>
                <p className="text-xl font-bold text-foreground font-mono">₹{stats.latestBalance.toLocaleString()}</p>
                <p className="text-[11px] text-blue-600 font-medium">Active prepaid wallet</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Wallet className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Combined Trend Chart */}
        <Card className="border shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Transactions vs Recharge vs Balance</CardTitle>
            <CardDescription className="text-xs">Prepaid account movement trends over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border, #e2e8f0)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{
                      background: 'var(--popover, #fff)',
                      border: '1px solid var(--border, #e2e8f0)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="transactions"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Transactions"
                    dot={{ r: 3 }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="recharge"
                    stroke="#2563eb"
                    strokeWidth={2}
                    name="Recharge"
                    dot={{ r: 3 }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="#16a34a"
                    strokeWidth={2}
                    name="Balance"
                    dot={{ r: 3 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Billing Table */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Transaction History</CardTitle>
              <CardDescription className="text-xs">Audit log of payments, meter deductions, and top-ups</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <DatePicker value={fromDate} onChange={setFromDate} />
                <span className="text-xs text-muted-foreground font-medium">to</span>
                <DatePicker value={toDate} onChange={setToDate} />
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={exportCSV} className="h-8 gap-1 text-xs">
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={exportExcel} className="h-8 gap-1 text-xs">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 gap-1 text-xs">
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-36">Date</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Available Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((r) => {
                    const badge = typeBadgeConfig[r.transactionType] || { label: r.transactionType, className: "bg-muted text-muted-foreground" }
                    return (
                      <TableRow key={r.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="text-xs font-medium text-foreground">{formatDate(r.date)}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground font-semibold">{r.transactionId}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[11px] font-medium border ${badge.className}`}>
                            {badge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-medium font-mono text-xs ${r.transactionAmount < 0 ? "text-red-600" : "text-emerald-600"}`}>
                          {r.transactionAmount < 0 ? "-" : "+"}₹{Math.abs(r.transactionAmount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                          ₹{r.availableBalance.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredRecords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center">
                        <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                          <FileText className="h-6 w-6 stroke-1" />
                          <p className="text-xs font-medium">No transactions found for the selected date range</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted-foreground text-sm">Loading billing ledger...</div>}>
      <BillingInner />
    </Suspense>
  )
}
