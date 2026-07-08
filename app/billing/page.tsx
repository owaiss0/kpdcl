"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

const typeColor: Record<string, string> = {
  payment: "bg-red-100 text-red-700",
  recharge: "bg-green-100 text-green-700",
  refund: "bg-blue-100 text-blue-700",
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

  const filteredRecords = records.filter((r) => {
    if (fromDate && r.date < fromDate) return false
    if (toDate && r.date > toDate) return false
    return true
  })

  return (
    <SidebarLayout consumerNo={consumerNo}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-sm text-muted-foreground">Transactions, recharge & balance history</p>
        </div>

        {/* Combined Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transactions vs Recharge vs Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="transactions" stroke="#ef4444" strokeWidth={2} name="Transactions" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="recharge" stroke="#2563eb" strokeWidth={2} name="Recharge" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="balance" stroke="#16a34a" strokeWidth={2} name="Balance" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Billing Table */}
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Transaction History</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <DatePicker value={fromDate} onChange={setFromDate} />
              <span className="text-xs text-muted-foreground">to</span>
              <DatePicker value={toDate} onChange={setToDate} />
              <div className="flex gap-1">
                <Button variant="outline" size="sm">CSV</Button>
                <Button variant="outline" size="sm">Excel</Button>
                <Button variant="outline" size="sm">PDF</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.date).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell className="font-mono text-xs">{r.transactionId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeColor[r.transactionType] || ""}>
                        {r.transactionType}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${r.transactionAmount < 0 ? "text-red-600" : "text-green-600"}`}>
                      {r.transactionAmount < 0 ? "-" : "+"}₹{Math.abs(r.transactionAmount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">₹{r.availableBalance.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {filteredRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No records found
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading...</div>}>
      <BillingInner />
    </Suspense>
  )
}
