"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { FileText, Download, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import SidebarLayout from "@/components/layout/sidebar-layout"

const documents = [
  {
    id: "DOC-001",
    name: "No Dues Certificate",
    type: "Certificate",
    issuedDate: "2026-06-01",
    status: "available",
  },
  {
    id: "DOC-002",
    name: "Bill Print — May 2026",
    type: "Bill",
    issuedDate: "2026-06-01",
    status: "available",
  },
  {
    id: "DOC-003",
    name: "Bill Print — Apr 2026",
    type: "Bill",
    issuedDate: "2026-05-01",
    status: "available",
  },
  {
    id: "DOC-004",
    name: "Bill Print — Mar 2026",
    type: "Bill",
    issuedDate: "2026-04-01",
    status: "available",
  },
]

function DocumentsInner() {
  const searchParams = useSearchParams()
  const consumerNo = searchParams.get("consumer") || "KPDCL-2024-001"

  return (
    <SidebarLayout consumerNo={consumerNo}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-sm text-muted-foreground">View & download certificates and bills</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Documents</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {doc.name}
                      </div>
                    </TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell>{new Date(doc.issuedDate).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        Available
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  )
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading...</div>}>
      <DocumentsInner />
    </Suspense>
  )
}
