"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, FileText, Scale, Users, Clock, LogOut,Zap,Shield } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

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

          <Card>
            <CardHeader>
              <CardTitle>Recent FIR Activity</CardTitle>
              <CardDescription>Latest registered cases and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: "FIR/2024/001234",
                    type: "Theft",
                    status: "Completed",
                    officer: "SI Sharma",
                    time: "2 hours ago",
                  },
                  {
                    id: "FIR/2024/001235",
                    type: "Assault",
                    status: "Under Review",
                    officer: "CI Patel",
                    time: "4 hours ago",
                  },
                  {
                    id: "FIR/2024/001236",
                    type: "Fraud",
                    status: "Completed",
                    officer: "ASI Kumar",
                    time: "6 hours ago",
                  },
                  {
                    id: "FIR/2024/001237",
                    type: "Domestic Violence",
                    status: "Pending",
                    officer: "SI Singh",
                    time: "8 hours ago",
                  },
                ].map((fir, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded">
                          <FileText className="h-4 w-4 text-blue-600"/>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{fir.id}</p>
                          <p className="text-sm text-gray-600">
                            {fir.type} • {fir.officer}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                            variant={
                              fir.status === "Completed" ? "default" : fir.status === "Under Review" ? "secondary" : "outline"
                            }
                            className={
                              fir.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : fir.status === "Under Review"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                            }
                        >
                          {fir.status}
                        </Badge>
                        <span className="text-sm text-gray-500">{fir.time}</span>
                      </div>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
  )
}
