"use client"

import { Suspense, useMemo, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Download, FileSpreadsheet, FileJson, FileText as PdfIcon, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import SidebarLayout from "@/components/layout/sidebar-layout"
import { fetchNetMeterRecords, fetchConsumerByNo } from "@/data/demo"
import type { NetMeterRecord, TimeFilter, Consumer } from "@/data/types"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"
import { exportToCSV, exportToExcel, exportToPDF } from "@/lib/export"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// Deterministic, SSR-safe date formatting helper
function formatDateByFilter(dateStr: string, filter: TimeFilter, type: 'chart' | 'table' = 'chart') {
  if (!dateStr) return "-"
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr

  const day = d.getDate().toString().padStart(2, "0")
  const month = MONTHS[d.getMonth()]
  const year = d.getFullYear()

  switch (filter) {
    case 'hourly': {
      const hours = d.getHours()
      const ampm = hours >= 12 ? "PM" : "AM"
      const formattedHours = (hours % 12 || 12).toString().padStart(2, "0")
      return `${formattedHours}:00 ${ampm}`
    }
    case 'weekly': {
      const endOfWeek = new Date(d.getTime() + 6 * 24 * 60 * 60 * 1000)
      const endDay = endOfWeek.getDate().toString().padStart(2, "0")
      const endMonth = MONTHS[endOfWeek.getMonth()]
      if (type === 'table') {
        return `${day} ${month} - ${endDay} ${endMonth}`
      }
      return `${day} ${month}`
    }
    case 'monthly':
      return `${month} ${year}`
    case 'yearly':
      return `${year}`
    case 'daily':
    default:
      return `${day} ${month}`
  }
}

function NetMeterInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const consumerNo = searchParams.get("consumer") || ""

  const [consumer, setConsumer] = useState<Consumer | null>(null)
  const [records, setRecords] = useState<NetMeterRecord[]>([])
  const [filter, setFilter] = useState<TimeFilter>("daily")
  
  // Date states
  const [fromDate, setFromDate] = useState("2026-06-01")
  const [toDate, setToDate] = useState("2026-06-10")

  // Sync consumer details
  useEffect(() => {
    if (consumerNo) {
      fetchConsumerByNo(consumerNo).then(setConsumer)
    }
  }, [consumerNo])

  // Sync date ranges on filter changes to prevent data hiding
  function handleFilterChange(newFilter: TimeFilter) {
    setFilter(newFilter)
    switch (newFilter) {
      case 'hourly':
        setFromDate("2026-06-10")
        setToDate("2026-06-10")
        break
      case 'weekly':
        setFromDate("2026-04-20")
        setToDate("2026-06-15")
        break
      case 'monthly':
        setFromDate("2025-07-01")
        setToDate("2026-06-30")
        break
      case 'yearly':
        setFromDate("2024-01-01")
        setToDate("2026-12-31")
        break
      case 'daily':
      default:
        setFromDate("2026-06-01")
        setToDate("2026-06-10")
        break
    }
  }

  // Fetch data
  useEffect(() => {
    if (consumerNo) {
      fetchNetMeterRecords(consumerNo, filter).then(setRecords)
    }
  }, [consumerNo, filter])

  // Filter records by dates (memoized for performance)
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const recordDate = r.date.includes('T') ? r.date.split('T')[0] : r.date
      if (fromDate && recordDate < fromDate) return false
      if (toDate && recordDate > toDate) return false
      return true
    })
  }, [records, fromDate, toDate])

  // Prepare chart data (memoized for performance)
  const chartData = useMemo(() => {
    return filteredRecords.map((r) => ({
      displayDate: formatDateByFilter(r.date, filter, 'chart'),
      imported: r.totalImp,
      exported: r.totalExp,
      net: r.netUsage,
    }))
  }, [filteredRecords, filter])

  // Download Handlers
  function triggerCSVDownload() {
    const headers = ["Date/Time", "Start Imp.", "End Imp.", "Total Imp. (kWh)", "Start Exp.", "End Exp.", "Total Exp. (kWh)", "Net Usage (kWh)"]
    const data = filteredRecords.map(r => [
      filter === 'hourly'
        ? `${formatDateByFilter(r.date, 'daily')} ${formatDateByFilter(r.date, 'hourly')}`
        : formatDateByFilter(r.date, filter, 'table'),
      r.startImp,
      r.endImp,
      r.totalImp,
      r.startExp,
      r.endExp,
      r.totalExp,
      r.netUsage
    ])
    exportToCSV(data, headers, `KPDCL_NetMeter_${consumerNo}_${filter}.csv`)
  }

  function triggerExcelDownload() {
    const headers = ["Date/Time", "Start Imp.", "End Imp.", "Total Imp. (kWh)", "Start Exp.", "End Exp.", "Total Exp. (kWh)", "Net Usage (kWh)"]
    const data = filteredRecords.map(r => [
      filter === 'hourly'
        ? `${formatDateByFilter(r.date, 'daily')} ${formatDateByFilter(r.date, 'hourly')}`
        : formatDateByFilter(r.date, filter, 'table'),
      r.startImp,
      r.endImp,
      r.totalImp,
      r.startExp,
      r.endExp,
      r.totalExp,
      r.netUsage
    ])
    exportToExcel(data, headers, "Net Meter Records", `KPDCL_NetMeter_${consumerNo}_${filter}.xls`)
  }

  function triggerPDFDownload() {
    const headers = ["Date/Time", "Start Imp.", "End Imp.", "Total Imp. (kWh)", "Start Exp.", "End Exp.", "Total Exp. (kWh)", "Net Usage (kWh)"]
    const data = filteredRecords.map(r => [
      filter === 'hourly'
        ? `${formatDateByFilter(r.date, 'daily')} ${formatDateByFilter(r.date, 'hourly')}`
        : formatDateByFilter(r.date, filter, 'table'),
      r.startImp,
      r.endImp,
      r.totalImp,
      r.startExp,
      r.endExp,
      r.totalExp,
      r.netUsage
    ])
    
    const info = {
      name: consumer?.name || "Mohammad Irfan",
      id: consumerNo,
      category: consumer?.category || "PREPAID",
      address: consumer?.address || "House No. 42, Colony Road, Srinagar"
    }

    exportToPDF(`Solar Net Metering Statement (${filter.toUpperCase()})`, headers, data, info)
  }

  // Render helper if no connection active
  if (!consumerNo) {
    return (
      <SidebarLayout consumerNo="">
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto space-y-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">No Connection Active</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To view solar generation net meter charts and download statements, please select an active connection from the sidebar dropdown.
          </p>
          <Button onClick={() => router.push('/dashboard')}>Go to Portal Dashboard</Button>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout consumerNo={consumerNo}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Net Metering Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Consumer No: <span className="font-mono font-semibold">{consumerNo}</span> &middot; {consumer?.name}
          </p>
        </div>

        {/* Chart */}
        <Card className="shadow-xs border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-600">Import vs Export Profile</CardTitle>
            <CardDescription>Comparison of imported power (Grid) and exported power (Solar) in kWh</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-68 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit=" kWh" />
                  <Tooltip cursor={{ fill: 'rgba(37,99,235,0.04)' }} contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="imported" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={30} name="Imported (Grid)" isAnimationActive={false} />
                  <Bar dataKey="exported" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={30} name="Exported (Solar)" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-xs border-slate-200">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b">
            <div>
              <CardTitle className="text-base font-bold">Import / Export Readings Ledger</CardTitle>
              <CardDescription>Chronological breakdown of net meter activities</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={filter} onValueChange={(v) => handleFilterChange(v as TimeFilter)}>
                <SelectTrigger className="w-28 h-9 text-xs bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-1 border">
                <DatePicker value={fromDate} onChange={setFromDate} />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">to</span>
                <DatePicker value={toDate} onChange={setToDate} />
              </div>

              {/* Download dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button variant="outline" size="icon" className="h-9 w-9 border-slate-200 hover:bg-slate-50" title="Download Reports" />
                }>
                  <Download className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white">
                  <DropdownMenuItem onClick={triggerCSVDownload} className="cursor-pointer py-2">
                    <FileJson className="mr-2 h-4 w-4 text-amber-500" />
                    <span className="text-xs">Export as CSV</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={triggerExcelDownload} className="cursor-pointer py-2">
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-xs">Export as Excel</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={triggerPDFDownload} className="cursor-pointer py-2">
                    <PdfIcon className="mr-2 h-4 w-4 text-red-600" />
                    <span className="text-xs">Export as PDF</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/70">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700 text-xs">Date / Time interval</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 text-xs">Start Imp.</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 text-xs">End Imp.</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 text-xs">Total Imp. (kWh)</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 text-xs">Start Exp.</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 text-xs">End Exp.</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 text-xs">Total Exp. (kWh)</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 text-xs">Net Usage (kWh)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((r) => (
                    <TableRow key={r.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-slate-700 text-xs font-medium">
                        {filter === 'hourly' 
                          ? `${formatDateByFilter(r.date, 'daily')} ${formatDateByFilter(r.date, 'hourly')}`
                          : formatDateByFilter(r.date, filter, 'table')
                        }
                      </TableCell>
                      <TableCell className="text-right font-mono text-slate-500 text-xs">{r.startImp.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono text-slate-500 text-xs">{r.endImp.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-bold text-slate-900 text-xs">{r.totalImp.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono text-slate-500 text-xs">{r.startExp.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono text-slate-500 text-xs">{r.endExp.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-bold text-slate-900 text-xs">{r.totalExp.toFixed(2)}</TableCell>
                      <TableCell className={`text-right font-bold text-xs ${r.netUsage < 0 ? "text-green-600" : "text-orange-600"}`}>
                        {r.netUsage > 0 ? "+" : ""}{r.netUsage.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRecords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                        No net metering records found for the selected date range.
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

export default function NetMeterPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading...</div>}>
      <NetMeterInner />
    </Suspense>
  )
}
