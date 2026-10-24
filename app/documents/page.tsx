"use client"

import { Suspense, useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { FileText, Download, Eye, CheckCircle2, ShieldCheck, FileCheck, X, Printer, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import SidebarLayout from "@/components/layout/sidebar-layout"

interface DocumentItem {
  id: string
  name: string
  type: "Certificate" | "Bill" | "Receipt"
  issuedDate: string
  size: string
  referenceNo: string
}

const documents: DocumentItem[] = [
  {
    id: "DOC-001",
    name: "No Dues Certificate (NDC)",
    type: "Certificate",
    issuedDate: "2026-06-01",
    size: "245 KB",
    referenceNo: "NDC/2026/SXR-8841",
  },
  {
    id: "DOC-002",
    name: "Official Tariff Bill — May 2026",
    type: "Bill",
    issuedDate: "2026-06-01",
    size: "410 KB",
    referenceNo: "INV-2026-05-9921",
  },
  {
    id: "DOC-003",
    name: "Official Tariff Bill — Apr 2026",
    type: "Bill",
    issuedDate: "2026-05-01",
    size: "395 KB",
    referenceNo: "INV-2026-04-8712",
  },
  {
    id: "DOC-004",
    name: "Official Tariff Bill — Mar 2026",
    type: "Bill",
    issuedDate: "2026-04-01",
    size: "388 KB",
    referenceNo: "INV-2026-03-7643",
  },
  {
    id: "DOC-005",
    name: "Prepaid Top-up Payment Receipt",
    type: "Receipt",
    issuedDate: "2026-06-10",
    size: "128 KB",
    referenceNo: "REC-2026-06-1049",
  },
]

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

function DocumentsInner() {
  const searchParams = useSearchParams()
  const consumerNo = searchParams.get("consumer") || "KPDCL-2024-001"

  const [activeTab, setActiveTab] = useState<"all" | "Bill" | "Certificate" | "Receipt">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null)

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (activeTab !== "all" && doc.type !== activeTab) return false
      if (searchQuery.trim() && !doc.name.toLowerCase().includes(searchQuery.toLowerCase()) && !doc.referenceNo.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      return true
    })
  }, [activeTab, searchQuery])

  function handleDownload(doc: DocumentItem) {
    const textContent = `========================================================\n` +
      `KASHMIR POWER DISTRIBUTION CORPORATION LIMITED (KPDCL)\n` +
      `GOVERNMENT OF JAMMU & KASHMIR\n` +
      `========================================================\n\n` +
      `DOCUMENT: ${doc.name}\n` +
      `REFERENCE NO: ${doc.referenceNo}\n` +
      `CONSUMER NUMBER: ${consumerNo}\n` +
      `DATE OF ISSUE: ${doc.issuedDate}\n` +
      `STATUS: Digitally Verified / Official Copy\n\n` +
      `This is a digitally generated document issued by the KPDCL Central Portal.\n` +
      `For verifications, contact 1912 or visit https://kpdcl.jk.gov.in\n`

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${doc.referenceNo.replace(/\//g, "-")}_${doc.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <SidebarLayout consumerNo={consumerNo}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Documents & Certificates</h1>
          <p className="text-sm text-muted-foreground">Download official billing receipts, tariff invoices, and verification letters</p>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground font-medium">Available Invoices</p>
                <p className="text-xl font-bold text-foreground">3 Monthly Bills</p>
                <p className="text-[11px] text-muted-foreground">Certified electronic bills</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground font-medium">No Dues Certificate</p>
                <p className="text-xl font-bold text-emerald-600 flex items-center gap-1.5">
                  <ShieldCheck className="h-5 w-5" /> Active
                </p>
                <p className="text-[11px] text-muted-foreground">Zero outstanding dues</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground font-medium">Digital Verification</p>
                <p className="text-xl font-bold text-foreground">QR Sealed</p>
                <p className="text-[11px] text-muted-foreground">Compliant with J&K IT Act</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <FileCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Table Card */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Repository Records</CardTitle>
              <CardDescription className="text-xs">Browse and search authenticated records for your account</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-48 sm:w-60">
                <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
              <div className="flex items-center rounded-lg border bg-muted/40 p-0.5 text-xs">
                {(["all", "Bill", "Certificate", "Receipt"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-2.5 py-1 rounded-md capitalize transition-colors font-medium ${
                      activeTab === tab ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "all" ? "All" : `${tab}s`}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reference No.</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocs.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-medium text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FileText className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-xs">{doc.name}</p>
                            <p className="text-[10px] text-muted-foreground">{doc.size}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="text-[10px] font-medium border-muted-foreground/30">
                          {doc.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground font-medium">
                        {doc.referenceNo}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(doc.issuedDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                          Available
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-muted"
                            title="Preview Document"
                            onClick={() => setPreviewDoc(doc)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-muted text-primary"
                            title="Download Document"
                            onClick={() => handleDownload(doc)}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredDocs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-xs font-medium">No matching documents found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Document Preview Modal */}
        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in-0 duration-75">
            <div className="relative w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl text-card-foreground">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 mb-5 border-b pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{previewDoc.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{previewDoc.referenceNo}</p>
                </div>
              </div>

              <div className="rounded-xl border bg-muted/20 p-4 space-y-3 font-mono text-xs mb-5">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Issuing Authority:</span>
                  <span className="font-semibold text-foreground">KPDCL IT Cell</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Consumer ID:</span>
                  <span className="font-semibold text-foreground">{consumerNo}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Issue Date:</span>
                  <span className="font-semibold text-foreground">{formatDate(previewDoc.issuedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verification Seal:</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Valid & Certified
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs">
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </Button>
                <Button size="sm" onClick={() => handleDownload(previewDoc)} className="gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" />
                  Download File
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted-foreground text-sm">Loading documents repository...</div>}>
      <DocumentsInner />
    </Suspense>
  )
}
