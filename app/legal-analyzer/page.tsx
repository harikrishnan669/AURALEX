"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Scale, Search, BookOpen, AlertTriangle, ArrowLeft, FileText, Gavel } from "lucide-react"
import Link from "next/link"

interface LegalSection {
  section: string
  title: string
  description: string
  punishment: string
  relevanceScore: number
  category: "IPC" | "CrPC" | "Other"
}

export default function LegalAnalyzer() {
  const [query, setQuery] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<LegalSection[]>([])

  const analyzeLegalSections = async () => {
    if (!query.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PORT_FORWARD_URL}/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: query }),
        }
      );
      if (!res.ok) {
        throw new Error("Failed to analyze legal sections");
      }
      const apiResults = await res.json();
      setResults(Array.isArray(apiResults.sections) ? apiResults.sections : []);
    } catch (err) {
      setResults([]);
    } finally {
      setIsAnalyzing(false);
    }
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800"
    if (score >= 70) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "IPC":
        return "bg-blue-100 text-blue-800"
      case "CrPC":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen ">
      <div className="fixed inset-0 -z-10 bg-black overflow-hidden">
        <div className="absolute inset-0 opacity-[0.1]" style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, white 0, white 1px, transparent 1px, transparent 160px)",
        }}/>
        <img
          src="/lady.png"
          alt="Justice Scale"
          className="absolute top-1/2 left-1/2
            -translate-x-1/2 -translate-y-1/2
            w-[300px] h-[300px]
            sm:w-[420px] sm:h-[420px]
            md:w-[520px] md:h-[520px]
            lg:h-[700px]
            opacity-[0.18]
            pointer-events-none
            select-none"
        />
      </div>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2"/>
                  Back to Dashboard
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6"/>
              <div className="flex items-center space-x-2">
                <Scale className="h-6 w-6 text-black"/>
                <h1 className="text-xl font-semibold text-gray-900">Legal Section Analyzer</h1>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-6 w-6 text-black"/>
                <span>Analyze Case Details</span>
              </CardTitle>
              <CardDescription>
                Enter case details or incident description to find relevant legal sections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="query">Case Description or Keywords</Label>
                <Textarea
                    id="query"
                    placeholder="Enter incident details, case description, or specific keywords to analyze relevant legal sections..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="min-h-[120px] mt-2"
                />
              </div>

              <Button
                  onClick={analyzeLegalSections}
                  disabled={!query.trim() || isAnalyzing}
                  className="bg-black hover:bg-gray-700"
              >
                <Search className="h-4 w-4 mr-2"/>
                {isAnalyzing ? "Analyzing..." : "Analyze Legal Sections"}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          {results.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {results.length} sections found
                  </Badge>
                </div>
                <div className="grid gap-6">
                  {results.map((section, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="flex items-center space-x-2">
                                <Gavel className="h-5 w-5 text-gray-600"/>
                                <span>{section.section}</span>
                              </CardTitle>
                              <CardDescription className="text-lg font-medium text-gray-900 mt-1">
                                {section.title}
                              </CardDescription>
                            </div>
                            <div className="flex space-x-2">
                              <Badge className={getCategoryColor(section.category)}>{section.category}</Badge>
                              <Badge className={getRelevanceColor(section.relevanceScore)}>
                                {section.relevanceScore}% match
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                            <p className="text-gray-700 leading-relaxed">{section.description}</p>
                          </div>
                          <Separator/>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-1 text-orange-600"/>
                              Punishment/Penalty
                            </h4>
                            <p className="text-gray-700">{section.punishment}</p>
                          </div>
                          {section.relevanceScore >= 90 && (
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <BookOpen className="h-4 w-4 text-green-600"/>
                                  <span className="text-green-800 font-medium text-sm">Highly Relevant Section</span>
                                </div>
                                <p className="text-green-700 text-sm mt-1">
                                  This section is highly applicable to your case description.
                                </p>
                              </div>
                          )}
                        </CardContent>
                      </Card>
                  ))}
                </div>
                {/* Summary Card */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-blue-900">
                      <FileText className="h-5 w-5"/>
                      <span>Analysis Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-900">
                          {results.filter((r) => r.category === "IPC").length}
                        </div>
                        <div className="text-blue-700">IPC Sections</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-900">
                          {results.filter((r) => r.category === "CrPC").length}
                        </div>
                        <div className="text-blue-700">CrPC Sections</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-900">
                          {results.filter((r) => r.relevanceScore >= 90).length}
                        </div>
                        <div className="text-blue-700">High Relevance</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
          )}
          {/* Help Section */}
          {results.length === 0 && !isAnalyzing && (
              <Card className="bg-gray-50">
                <CardContent className="p-8 text-center">
                  <Scale className="h-16 w-16 text-black mx-auto mb-4"/>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Legal Section Analysis</h3>
                  <p className="text-gray-600 mb-4">
                    Enter case details above to get AI-powered analysis of relevant legal sections from IPC, CrPC, and
                    other
                    applicable laws.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>IPC Sections:</strong> Criminal offenses and punishments
                    </div>
                    <div>
                      <strong>CrPC Sections:</strong> Criminal procedure and process
                    </div>
                    <div>
                      <strong>Relevance Score:</strong> AI-calculated applicability
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}
        </main>
      </div>
  )
}
