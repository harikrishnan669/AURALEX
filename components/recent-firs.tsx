"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"
import { queryFIRs, saveFIR } from "@/lib/fir"

export default function RecentFIRs() {
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [name, setName] = useState("")
  const [firNumber, setFirNumber] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<string[]>([])

  const toISOStart = (d: string) => (d ? new Date(d).toISOString() : undefined)
  const toISOEnd = (d: string) => (d ? new Date(d + "T23:59:59").toISOString() : undefined)

  const handleSearch = async () => {
    setLoading(true)
    try {
      const res = await queryFIRs({
        start: toISOStart(start),
        end: toISOEnd(end),
        name: name || undefined,
        firNumber: firNumber || undefined,
        limit: 50,
      })
      setResults(res)
    } catch (e) {
      console.error("Failed to query FIRs", e)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setStart("")
    setEnd("")
    setName("")
    setFirNumber("")
    setResults([])
  }

  const handleSave = async (fir: any) => {
    if (!fir) return
    setSavingId(fir.id)
    try {
      const payload = {
        firNumber: fir.firNumber,
        name: fir.name,
        extractedInfo: fir.extractedInfo,
        metadata: { sourceId: fir.id },
        createdAt: fir.createdAt,
      }

      const res = await saveFIR(payload)
      setSavedIds((s) => [...s, res.id])
    } catch (e) {
      console.error("Failed to save FIR", e)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent FIR Activity</CardTitle>
        <CardDescription>Filter by date, name, or FIR number</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div>
            <Label>Start Date</Label>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <Label>End Date</Label>
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <div>
            <Label>Name</Label>
            <Input placeholder="Complainant name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>FIR Number</Label>
            <Input placeholder="FIR/2024/123456" value={firNumber} onChange={(e) => setFirNumber(e.target.value)} />
          </div>
        </div>

        <div className="flex space-x-2 mb-4">
          <Button onClick={handleSearch} className="bg-black" disabled={loading}>{loading ? "Searching..." : "Search"}</Button>
          <Button variant="outline" onClick={handleClear}>Clear</Button>
        </div>

        <Separator />

        <div className="space-y-3 mt-4">
          {results.length === 0 && <p className="text-sm text-gray-500">No results. Run a search to see recent FIRs.</p>}

          {results.map((fir) => (
            <div key={fir.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-2 rounded">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{fir.firNumber}</p>
                  <p className="text-sm text-gray-600">{fir.name || (fir.extractedInfo?.complainant ?? "-")}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Badge className="bg-gray-100 text-gray-800">{new Date(fir.createdAt).toLocaleString()}</Badge>
                <Button
                  size="sm"
                  variant={savedIds.includes(fir.id) ? "secondary" : "outline"}
                  onClick={() => handleSave(fir)}
                  disabled={savingId === fir.id || savedIds.includes(fir.id)}
                >
                  {savingId === fir.id ? "Saving..." : savedIds.includes(fir.id) ? "Saved" : "Download"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
