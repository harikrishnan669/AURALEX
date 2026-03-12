"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, FileText, Scale, Users, Clock, LogOut,Zap,Shield,Trash2 } from "lucide-react"
import Link from "next/link"
import { collection, query, where, orderBy, getDocs, limit, deleteDoc, doc, getDoc } from "firebase/firestore"
import { auth } from "@/lib/firebase"
import { db } from "@/lib/firebase"
import jsPDF from "jspdf"
import { toast } from "sonner"


export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [firs, setFirs] = useState<any[]>([])
  const [searchFirNumber, setSearchFirNumber] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        fetchMyFIRs(firebaseUser.uid)
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") {
      setCheckingAuth(false)
      return
    }

    const auth = localStorage.getItem("isAuthenticated")
    if (auth !== "true") {
      router.replace("/login")
      return
    }
    const raw = localStorage.getItem("user")
    if (raw) {
      try {
        setUser(JSON.parse(raw))
      } catch {
        setUser(null)
        localStorage.removeItem("isAuthenticated")
        localStorage.removeItem("user")
        router.replace("/login")
        return
      }
    } else {
      localStorage.removeItem("isAuthenticated")
      router.replace("/login")
      return
    }

    setCheckingAuth(false)
  }, [])

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("user")
      router.replace("/login")
    }
  }
  const fetchMyFIRs = async (uid: string) => {
    try {
      const q = query(
          collection(db, "fir_documents"),
          where("officerUid", "==", uid),
          orderBy("createdAt", "desc"),
          limit(4)
      )

      const snapshot = await getDocs(q)

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setFirs(data)

    } catch (error) {
      console.error("Error fetching FIRs:", error)
    }
  }
  const handleSearch = async () => {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) return

      setLoading(true)

      const searchValue = searchFirNumber.trim()

      if (searchValue === "") {
        await fetchMyFIRs(currentUser.uid)
        return
      }

      const q = query(
          collection(db, "fir_documents"),
          where("officerUid", "==", currentUser.uid),
          where("firNumber", "==", searchValue)
      )

      const snapshot = await getDocs(q)

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setFirs(data)

    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }
  const handleClear = async () => {
    const currentUser = auth.currentUser
    setSearchFirNumber("")

    if (currentUser) {
      await fetchMyFIRs(currentUser.uid)
    }
  }
  const fetchAllFIRs = async () => {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) return

      const q = query(
          collection(db, "fir_documents"),
          where("officerUid", "==", currentUser.uid),
          orderBy("createdAt", "desc")
      )

      const snapshot = await getDocs(q)

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setFirs(data)

    } catch (error) {
      console.error("Error fetching all FIRs:", error)
    }
  }
  const handleDownload = (fir: any) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 20
    const lineHeight = 7
    let yPosition = 30

    const addWrappedText = (text: string, x: number, y: number, maxWidth: number) => {
      const lines = doc.splitTextToSize(text || "-", maxWidth)
      doc.text(lines, x, y)
      return y + lines.length * lineHeight
    }
    // Header
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("FIRST INFORMATION REPORT", pageWidth / 2, yPosition, { align: "center" })

    yPosition += 10
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Under IPC & CrPC Section.", pageWidth / 2, yPosition, { align: "center" })

    yPosition += 20

    // FIR Details
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")

    doc.text("FIR No:", margin, yPosition)
    doc.setFont("helvetica", "normal")
    doc.text(fir.firNumber || "-", margin + 30, yPosition)

    doc.setFont("helvetica", "bold")
    doc.text("Date:", pageWidth / 2, yPosition)
    doc.setFont("helvetica", "normal")
    doc.text(new Date().toLocaleDateString(), pageWidth / 2 + 25, yPosition)

    yPosition += lineHeight + 5

    doc.setFont("helvetica", "bold")
    doc.text("Police Station:", margin, yPosition)
    doc.setFont("helvetica", "normal")
    doc.text("Cyber Crime Cell", margin + 45, yPosition)

    doc.setFont("helvetica", "bold")
    doc.text("District:", pageWidth / 2, yPosition)
    doc.setFont("helvetica", "normal")
    doc.text("Kottayam", pageWidth / 2 + 25, yPosition)

    yPosition += lineHeight + 10

    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    // Case Details
    doc.setFont("helvetica", "bold")
    doc.text("Complainant:", margin, yPosition)
    doc.setFont("helvetica", "normal")
    yPosition = addWrappedText(fir.complainant, margin + 40, yPosition, pageWidth - margin - 40)
    yPosition += 5

    doc.setFont("helvetica", "bold")
    doc.text("Accused:", margin, yPosition)
    doc.setFont("helvetica", "normal")
    yPosition = addWrappedText(fir.accused, margin + 30, yPosition, pageWidth - margin - 30)
    yPosition += 5

    doc.setFont("helvetica", "bold")
    doc.text("Date & Time of Occurrence:", margin, yPosition)
    doc.setFont("helvetica", "normal")
    yPosition = addWrappedText(fir.dateTime, margin + 70, yPosition, pageWidth - margin - 70)
    yPosition += 5

    doc.setFont("helvetica", "bold")
    doc.text("Place of Occurrence:", margin, yPosition)
    doc.setFont("helvetica", "normal")
    yPosition = addWrappedText(fir.location, margin + 60, yPosition, pageWidth - margin - 60)
    yPosition += 5

    doc.setFont("helvetica", "bold")
    doc.text("Type of Information:", margin, yPosition)
    doc.setFont("helvetica", "normal")
    yPosition = addWrappedText(fir.incidentType, margin + 60, yPosition, pageWidth - margin - 60)
    yPosition += 10

    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    // Incident Description
    doc.setFont("helvetica", "bold")
    doc.text("Details of Incident:", margin, yPosition)
    yPosition += lineHeight
    doc.setFont("helvetica", "normal")
    yPosition = addWrappedText(fir.description, margin, yPosition, pageWidth - margin * 2)
    yPosition += 10

    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    // Legal Sections
    doc.setFont("helvetica", "bold")
    doc.text("Sections of Law:", margin, yPosition)
    yPosition += lineHeight
    doc.setFont("helvetica", "normal")

    fir.sections?.forEach((section: string) => {
      yPosition = addWrappedText(`• ${section}`, margin, yPosition, pageWidth - margin * 2)
      yPosition += 3
    })

    yPosition += 10
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    // Footer
    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    yPosition = addWrappedText(
        "This FIR has been generated using AI-powered system and reviewed by the investigating officer.",
        margin,
        yPosition,
        pageWidth - margin * 2
    )

    yPosition += 5
    yPosition = addWrappedText(
        `Generated on: ${new Date().toLocaleString()}`,
        margin,
        yPosition,
        pageWidth - margin * 2
    )

    doc.save(`${fir.firNumber}.pdf`)
  }
  const handleDelete = async (firId: string) => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      toast.error("User not authenticated")
      return
    }
    toast("Delete FIR?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteDoc(doc(db, "fir_documents", firId))
            setFirs((prev) => prev.filter((fir) => fir.id !== firId))
            toast.success("FIR deleted successfully")
          } catch (error) {
            toast.error("Error deleting FIR")
          }
        },
      },
    })
  }
  if (checkingAuth) {
    return null
  }
  return (
      <div className="min-h-screen">
        <div className="fixed inset-0 -z-10 bg-black overflow-hidden">
          <div className="absolute inset-0 opacity-[0.1]"
              style={{
                backgroundImage:
                    "repeating-linear-gradient(135deg, white 0, white 1px, transparent 1px, transparent 160px)",
              }}/>
          <img
              src="/lady.png"
              alt="Justice Scale"
              className="
      absolute top-1/2 left-1/2
      -translate-x-1/2 -translate-y-1/2

      w-[300px] h-[300px]
      sm:w-[420px] sm:h-[420px]
      md:w-[520px] md:h-[520px]
      lg:h-[700px]

      opacity-[0.18]

      pointer-events-none
      select-none
    "
          />
        </div>
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="bg-black p-2 rounded-lg">
                  <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-white"/>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                    AURALEX
                  </h1>
                  <p className="text-[11px] sm:text-sm lg:text-base text-gray-600 leading-tight">
                    AI-Powered Legal Document System
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {user ? (
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500">
                          Signed as
                        </p>
                        <p className="font-medium text-gray-900 text-xs sm:text-xs lg:text-base">
                          {user.name ?? user.email}
                        </p>
                      </div>

                      <Button

                          onClick={handleLogout}
                          className="flex items-center space-x-2 text-xs sm:text-sm lg:text-base"
                          title="Logout"
                      >
                        <LogOut className="h-4 w-4"/>
                        <span>Logout</span>
                      </Button>
                    </div>
                ) : (
                    <Link href="/login">
                      <Button className="text-xs sm:text-sm lg:text-base" variant="ghost">
                        Sign in
                      </Button>
                    </Link>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mic className="h-6 w-6 text-black"/>
                  <span>New FIR Registration</span>
                </CardTitle>
                <CardDescription>
                  Record incident details using voice input and generate FIR automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/new-fir">
                  <Button className="w-full bg-black hover:bg-gray-600" size="lg">
                    Start Voice Recording
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="h-6 w-6 text-black"/>
                  <span>Legal Section Analyzer</span>
                </CardTitle>
                <CardDescription>Analyze and retrieve relevant IPC/CrPC sections for cases</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/legal-analyzer">
                  <Button className="w-full bg-black hover:bg-gray-600" size="lg">
                    Analyze Legal Sections
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Feature 1 */}
            <Card
                className="group border border-blue-100 hover:border-blue-400 transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div
                    className="flex items-center justify-center w-12 h-12 rounded-lg bg-black">
                  <Zap className="h-6 w-6 text-white"/>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  AI FIR Generation
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Automatically generate well-structured FIR drafts using AI based on incident narratives.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card
                className="group border border-indigo-100 hover:border-indigo-400 transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div
                    className="flex items-center justify-center w-12 h-12 rounded-lg bg-black">
                  <Scale className="h-6 w-6 text-white"/>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Legal Section Analysis
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Instantly identify relevant IPC and CrPC sections using intelligent legal analysis.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card
                className="group border border-purple-100 hover:border-purple-400 transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div
                    className="flex items-center justify-center w-12 h-12 rounded-lg bg-black">
                  <Mic className="h-6 w-6 text-white"/>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Voice to Text Input
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Record officer statements via voice and convert them into accurate, searchable text.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card
                className="group border border-green-100 hover:border-green-400 transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div
                    className="flex items-center justify-center w-12 h-12 rounded-lg bg-black">
                  <Shield className="h-6 w-6 text-white"/>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Secure Officer Access
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Role-based authentication ensures privacy, accountability, and authorized access only.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle>Recent FIR Activity</CardTitle>
              <CardDescription>
                Find case details by FIR number or view your recent FIRs below
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <input
                    placeholder="FIR/2026/001234"
                    value={searchFirNumber}
                    onChange={(e) => setSearchFirNumber(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch()
                    }}
                    className="border rounded-md px-3 py-2 text-sm w-full"
                />
              </div>
              <div className="flex gap-3">
                <Button
                    onClick={handleSearch}
                    className="bg-black hover:bg-gray-700">
                  Search
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              </div>
              <div className="space-y-4">
                {firs.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No FIRs found.
                    </p>
                ) : (
                    firs.map((fir) => (
                        <div
                            key={fir.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-xl hover:shadow-md transition gap-4">
                          <div className="flex items-start space-x-4">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <FileText className="h-4 w-4 text-blue-600"/>
                            </div>

                            <div>
                              <p className="font-medium text-gray-900 break-words">
                                {fir.firNumber}
                              </p>
                              <p className="text-sm text-gray-600 break-words">
                                {fir.incidentType} • {fir.officerName}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/fir/${fir.id}`)}
                                className="w-full sm:w-auto">
                              View
                            </Button>
                            <Button
                                size="sm"
                                className="bg-black hover:bg-gray-700 text-white w-full sm:w-auto"
                                onClick={() => handleDownload(fir)}>
                              Download
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(fir.id)}>
                              <Trash2 className="h-4 w-4"/>
                            </Button>
                          </div>
                        </div>
                    ))
                )}
              </div>
              {firs.length >= 4 && (
                  <Button
                      variant="outline"
                      onClick={() => fetchAllFIRs()}
                      className="w-full bg-black text-white">
                    View All FIRs
                  </Button>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
  )
}
