"use client"

import React, { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {Mic, Square, FileText, User, AlertCircle, CheckCircle, ArrowLeft, Send, Scale} from "lucide-react"
import Link from "next/link"
import jsPDF from "jspdf"
import { PDFPreviewModal } from "@/components/pdf-preview-modal"
import { SkipForward } from "lucide-react"

interface ExtractedInfo {
  complainant: string
  accused: string
  incidentType: string
  location: string
  dateTime: string
  description: string
  sections: string[]
}

export default function NewFIR() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcription, setTranscription] = useState("")
  const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [firNumber] = useState(() => {
    const year = new Date().getFullYear()
    const random = Math.floor(100000 + Math.random() * 900000)
    return `FIR/${year}/${random}`
  })
  const handleSkip = () => {
    if (isRecording) {
      stopRecording()
    }
    // Skip voice recording go to Transcription step
    setTranscription("")
    setCurrentStep(2)
  }


// The voice will start recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    const mediaRecorder = new MediaRecorder(stream)
    audioChunksRef.current = []

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data)
    }

    mediaRecorder.start()
    mediaRecorderRef.current = mediaRecorder
    setIsRecording(true)
  }

// The voice will stop recording
  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return

    mediaRecorderRef.current.onstop = async () => {
      try {
        const blob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        })

        audioChunksRef.current = []

        setAudioBlob(blob)

        const formData = new FormData()
        formData.append("file", blob, "incident.webm")

        // Changed to Https port and transcription of the audio to text
          const res = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/transcribe`,
              {
                  method: "POST",
                  body: formData,
              }
          )

        if (!res.ok) {
          throw new Error("Failed to transcribe audio")
        }

        const data = await res.json()
        setTranscription(data.text)
        setCurrentStep(2)
      } catch (error) {
        console.error("Transcription error:", error)
      }
    }

    mediaRecorderRef.current.stop()
    setIsRecording(false)
  }
  const processTranscription = async () => {
    if (!transcription.trim()) return

    setIsProcessing(true)

    const payload = {
      text: transcription,
    }

    try {
      const res = await fetch(
          `${process.env.NEXT_PUBLIC_PORT_FORWARD_URL}/predict`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
      )

      if (!res.ok) {
        throw new Error("Backend error")
      }

      const data = await res.json()
      console.log("BACKEND DATA:", data)

      setExtractedInfo({
        complainant: data.complainant || "",
        accused: data.accused || "Unknown",
        incidentType: data.incident_type || "",
        dateTime: data.date_time || "",
        location: data.location || "",
        description: data.description || transcription,
        sections: Array.isArray(data.ipc_sections)
            ? data.ipc_sections
            : [],
      })

      setCurrentStep(3)
    } catch (e) {
      console.error("Information extraction error:", e)
    } finally {
      setIsProcessing(false)
    }
  }

  const generateFIR = () => {
    setCurrentStep(4)
  }

  const downloadPDF = () => {
    if (!extractedInfo) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 20
    const lineHeight = 7
    let yPosition = 30

    const addWrappedText = (text: string, x: number, y: number, maxWidth: number) => {
      const lines = doc.splitTextToSize(text, maxWidth)
      doc.text(lines, x, y)
      return y + lines.length * lineHeight
    }

    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("FIRST INFORMATION REPORT", pageWidth / 2, yPosition, { align: "center" })

    yPosition += 10
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Under IPC/CrPC Sections", pageWidth / 2, yPosition, { align: "center" })

    yPosition += 20

    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")

    // Generating the FIR Number
    function generateFIRNumber() {
      const year = new Date().getFullYear()
      const randomNumber = Math.floor(100000 + Math.random() * 900000) // 6-digit
      return `FIR/${year}/${randomNumber}`
    }
    const firNumber = generateFIRNumber()
    doc.text("FIR No:", margin, yPosition)
    doc.setFont("helvetica", "normal")
    doc.text(firNumber, margin + 30, yPosition)


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

    doc.setFont("helvetica", "bold")
    doc.text("Complainant:", margin, yPosition)
    doc.setFont("helvetica", "normal")
    yPosition = addWrappedText(extractedInfo.complainant, margin + 40, yPosition, pageWidth - margin - 40)
    yPosition += 5

    doc.setFont("helvetica", "bold")
    doc.text("Accused:", margin, yPosition)
    doc.setFont("helvetica", "normal")
    yPosition = addWrappedText(extractedInfo.accused, margin + 30, yPosition, pageWidth - margin - 30)
    yPosition += 5

    doc.setFont("helvetica", "bold")
    doc.text("Date & Time of Occurrence:", margin, yPosition)
    doc.setFont("helvetica", "normal")
    yPosition = addWrappedText(extractedInfo.dateTime, margin + 70, yPosition, pageWidth - margin - 70)
    yPosition += 5

    doc.setFont("helvetica", "bold")
    doc.text("Place of Occurrence:", margin, yPosition)
    doc.setFont("helvetica", "normal")
    yPosition = addWrappedText(extractedInfo.location, margin + 60, yPosition, pageWidth - margin - 60)
    yPosition += 5

    doc.setFont("helvetica", "bold")
    doc.text("Type of Information:", margin, yPosition)
    doc.setFont("helvetica", "normal")
    yPosition = addWrappedText(extractedInfo.incidentType, margin + 60, yPosition, pageWidth - margin - 60)
    yPosition += 10

    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    doc.setFont("helvetica", "bold")
    doc.text("Details of Incident:", margin, yPosition)
    yPosition += lineHeight
    doc.setFont("helvetica", "normal")
    yPosition = addWrappedText(extractedInfo.description, margin, yPosition, pageWidth - margin * 2)
    yPosition += 10

    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    doc.setFont("helvetica", "bold")
    doc.text("Sections of Law:", margin, yPosition)
    yPosition += lineHeight
    doc.setFont("helvetica", "normal")

    extractedInfo.sections.forEach((section) => {
      yPosition = addWrappedText(`• ${section}`, margin, yPosition, pageWidth - margin * 2)
      yPosition += 3
    })

    yPosition += 10

    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    yPosition = addWrappedText(
        "This FIR has been generated using AI-powered system and reviewed by the investigating officer.",
        margin,
        yPosition,
        pageWidth - margin * 2,
    )
    yPosition += 5
    yPosition = addWrappedText(`Drafted on: ${new Date().toLocaleString()}`, margin, yPosition, pageWidth - margin * 2)

    doc.save(`FIR_${extractedInfo.incidentType}_${new Date().toISOString().split("T")[0]}.pdf`)
  }

  return (
      <div className="min-h-screen overflow-x-hidden">
        <div className="fixed inset-0 -z-10 bg-black overflow-hidden">

          {/* Line pattern */}
          <div
              className="absolute inset-0 opacity-[0.1]"
              style={{
                backgroundImage:
                    "repeating-linear-gradient(135deg, white 0, white 1px, transparent 1px, transparent 160px)",
              }}
          />

          {/* Center background image */}
          <img
              src="/lady.png"   //
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
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center flex-wrap gap-2">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-1"/>
                    Back
                  </Button>
                </Link>
                <div className="flex items-center gap-3 w-full">
                  <Separator orientation="vertical" className="hidden sm:block h-6"/>

                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                    New FIR Registration
                  </h1>

                  <Badge
                      variant="outline"
                      className="bg-black text-white ml-auto"
                  >
                    Step {currentStep} of 4
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[
                {step: 1, title: "Voice Recording", icon: Mic},
                {step: 2, title: "Transcription", icon: FileText},
                {step: 3, title: "Information Extraction", icon: User},
                {step: 4, title: "FIR Generation", icon: CheckCircle},
              ].map(({step, title, icon: Icon}) => (
                  <div key={step} className="flex flex-col items-center">
                    <div
                        className={`
            w-8 h-8 sm:w-10 sm:h-10 
            rounded-full flex items-center justify-center
            ${currentStep >= step ? "bg-[#1ceff4] text-black" : "bg-white text-gray-500"}
          `}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5"/>
                    </div>

                    <span className={`
            mt-1 sm:mt-2
            text-[10px] sm:text-sm
            text-center leading-tight
            ${currentStep >= step ? "text-white font-medium" : "text-gray-500"}
          `}
                    >
          {title}
        </span>
                  </div>
              ))}
            </div>
          </div>


          {/*Voice Recording Section*/}
          {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mic className="h-6 w-6 text-red-600"/>
                    <span>Record Incident Details</span>
                  </CardTitle>
                  <CardDescription>Click the start recording button and describe the incident details
                    clearly</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div
                        className={`w-32 h-32 rounded-full flex items-center justify-center ${isRecording ? "bg-red-100 animate-pulse" : "bg-gray-100"}`}
                    >
                      <Mic className={`h-16 w-16 ${isRecording ? "text-red-600" : "text-gray-400"}`}/>
                    </div>

                    <div className="text-center">
                      <p className="text-lg font-medium text-gray-900">{isRecording ? "Recording in progress..." : "Ready to record"}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {isRecording ? "Speak clearly and describe all incident details" : "Click start to begin recording"}
                      </p>
                    </div>

                    <div className="flex space-x-4">
                      {!isRecording ? (
                          <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700">
                            <Mic className="h-4 w-4 mr-2"/>
                            Start Recording
                          </Button>
                      ) : (
                          <Button onClick={stopRecording} variant="outline">
                            <Square className="h-4 w-4 mr-2"/>
                            Stop Recording
                          </Button>
                      )}
                    </div>
                    <Button onClick={handleSkip} variant="secondary" className="bg-black text-white">
                      <SkipForward className="h-4 w-4 mr-2" />
                      Skip
                    </Button>
                  </div>

                  {audioBlob && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600"/>
                          <span className="text-green-800 font-medium">Recording completed successfully</span>
                        </div>
                        <p className="text-green-700 text-sm mt-1">Audio recorded. Proceeding to transcription...</p>
                      </div>
                  )}
                </CardContent>
              </Card>
          )}

          {/*Transcription Section here*/}
          {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-black"/>
                    <span>Review Transcription</span>
                  </CardTitle>
                  <CardDescription>Review and edit the transcribed text before processing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="transcription">Transcribed Text</Label>
                    <Textarea id="transcription"
                              placeholder="The transcribed text will appear here. You can edit it if needed..."
                              value={transcription} onChange={(e) => setTranscription(e.target.value)}
                              className="min-h-[200px] mt-2"/>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5"/>
                      <div>
                        <p className="text-yellow-800 font-medium">Review Carefully</p>
                        <p className="text-yellow-700 text-sm mt-1">Please review the transcription for accuracy. Any
                          errors here will affect the FIR generation.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button onClick={() => setCurrentStep(1)} variant="outline">
                      Re-record
                    </Button>
                    <Button onClick={processTranscription} disabled={!transcription.trim() || isProcessing}
                            className="bg-black hover:bg-gray-600">
                      {isProcessing ? "Processing..." : "Process Information"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
          )}

          {/*Information Extraction Section*/}
          {currentStep === 3 && extractedInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-6 w-6 text-black"/>
                    <span>Extracted Information</span>
                  </CardTitle>
                  <CardDescription>Review the extracted information and make corrections if needed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="complainant">Complainant Name</Label>
                      <Input id="complainant" value={extractedInfo.complainant}
                             onChange={(e) => setExtractedInfo((p) => (p ? {...p, complainant: e.target.value} : p))}
                             className="mt-2"/>
                    </div>

                    <div>
                      <Label htmlFor="accused">Accused</Label>
                      <Input id="accused" value={extractedInfo.accused}
                             onChange={(e) => setExtractedInfo((p) => (p ? {...p, accused: e.target.value} : p))}
                             className="mt-2"/>
                    </div>

                    <div>
                      <Label htmlFor="incidentType">Incident Type</Label>
                      <Input id="incidentType" value={extractedInfo.incidentType}
                             onChange={(e) => setExtractedInfo((p) => (p ? {...p, incidentType: e.target.value} : p))}
                             className="mt-2"/>
                    </div>

                    <div>
                      <Label htmlFor="dateTime">Date & Time</Label>
                      <Input id="dateTime" value={extractedInfo.dateTime}
                             onChange={(e) => setExtractedInfo((p) => (p ? {...p, dateTime: e.target.value} : p))}
                             className="mt-2"/>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={extractedInfo.location}
                           onChange={(e) => setExtractedInfo((p) => (p ? {...p, location: e.target.value} : p))}
                           className="mt-2"/>
                  </div>

                  <div>
                    <Label htmlFor="description">Incident Description</Label>
                    <Textarea id="description" value={extractedInfo.description}
                              onChange={(e) => setExtractedInfo((p) => (p ? {...p, description: e.target.value} : p))}
                              className="min-h-[120px] mt-2"/>
                  </div>

                  <div>
                    <Label>Applicable Legal Sections</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {extractedInfo.sections.map((section, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                            {section}
                          </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button onClick={() => setCurrentStep(2)} variant="outline">
                      Back to Transcription
                    </Button>
                    <Button onClick={generateFIR} className="bg-black hover:bg-gray-600">
                      Generate FIR
                    </Button>
                  </div>
                </CardContent>
              </Card>
          )}


          {/*FIR Generation*/}
          {currentStep === 4 && extractedInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-6 w-6 text-black"/>
                    <span>Generated FIR</span>
                  </CardTitle>
                  <CardDescription>Review the generated FIR document before submission</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-white border rounded-lg p-6 space-y-4">
                    <div className="text-center border-b pb-4">
                      <h2 className="text-xl font-bold">FIRST INFORMATION REPORT</h2>
                      <p className="text-sm text-gray-600">Under IPC & CrPC Sections</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>FIR No:</strong> {firNumber}
                      </div>
                      <div>
                        <strong>Date:</strong> {new Date().toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Police Station:</strong> Cyber Crime Cell
                      </div>
                      <div>
                        <strong>District:</strong> Kottayam
                      </div>
                    </div>

                    <Separator/>

                    <div className="space-y-3 text-sm">
                      <div>
                        <strong>Complainant:</strong> {extractedInfo.complainant}
                      </div>
                      <div>
                        <strong>Accused:</strong> {extractedInfo.accused}
                      </div>
                      <div>
                        <strong>Date & Time of Occurrence:</strong> {extractedInfo.dateTime}
                      </div>
                      <div>
                        <strong>Place of Occurrence:</strong> {extractedInfo.location}
                      </div>
                      <div>
                        <strong>Type of Information:</strong> {extractedInfo.incidentType}
                      </div>
                    </div>

                    <Separator/>

                    <div>
                      <strong className="text-sm">Details of Incident:</strong>
                      <p className="mt-2 text-sm leading-relaxed">{extractedInfo.description}</p>
                    </div>

                    <Separator/>

                    <div>
                      <strong className="text-sm">Sections of Law:</strong>
                      <div className="mt-2 space-y-1">
                        {extractedInfo.sections.map((section, index) => (
                            <div key={index} className="text-sm">
                              • {section}
                            </div>
                        ))}
                      </div>
                    </div>

                    <Separator/>

                    <div className="text-xs text-gray-600">
                      <p>This FIR has been generated using AI-powered system and reviewed by the investigating
                        officer.</p>
                      <p className="mt-1">Drafted on: {new Date().toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button onClick={() => setCurrentStep(3)} variant="outline">
                      Edit Information
                    </Button>
                    <PDFPreviewModal extractedInfo={extractedInfo}/>
                    <Button className="bg-black hover:bg-gray-600" onClick={downloadPDF}>
                      <Send className="h-4 w-4 mr-2"/>
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
          )}
        </main>
      </div>
  )
}
