"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Eye, Download, FileText } from "lucide-react"
import jsPDF from "jspdf"

interface ExtractedInfo {
  complainant: string
  accused: string
  incidentType: string
  location: string
  dateTime: string
  description: string
  sections: string[]
}

interface PDFPreviewModalProps {
  extractedInfo: ExtractedInfo
}

export function PDFPreviewModal({ extractedInfo }: PDFPreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const downloadPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 20
    const lineHeight = 7
    let yPosition = 30

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number) => {
      const lines = doc.splitTextToSize(text, maxWidth)
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
    doc.text("Under Section 154 Cr.P.C.", pageWidth / 2, yPosition, { align: "center" })

    yPosition += 20

    // FIR Details
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")

    // Basic Information
    doc.text("FIR No:", margin, yPosition)
    doc.setFont("helvetica", "normal")
    doc.text("FIR/2024/001238", margin + 30, yPosition)

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
    doc.text("Gurgaon", pageWidth / 2 + 25, yPosition)

    yPosition += lineHeight + 10

    // Separator line
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    // Case Details
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

    // Separator line
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    // Incident Details
    doc.setFont("helvetica", "bold")
    doc.text("Details of Incident:", margin, yPosition)
    yPosition += lineHeight
    doc.setFont("helvetica", "normal")
    yPosition = addWrappedText(extractedInfo.description, margin, yPosition, pageWidth - margin * 2)
    yPosition += 10

    // Separator line
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    // Legal Sections
    doc.setFont("helvetica", "bold")
    doc.text("Sections of Law:", margin, yPosition)
    yPosition += lineHeight
    doc.setFont("helvetica", "normal")

    extractedInfo.sections.forEach((section) => {
      yPosition = addWrappedText(`• ${section}`, margin, yPosition, pageWidth - margin * 2)
      yPosition += 3
    })

    yPosition += 10

    // Separator line
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    // Footer
    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    yPosition = addWrappedText(
      "This FIR has been generated using AI-powered system and reviewed by the investigating officer.",
      margin,
      yPosition,
      pageWidth - margin * 2,
    )
    yPosition += 5
    yPosition = addWrappedText(
      `Generated on: ${new Date().toLocaleString()}`,
      margin,
      yPosition,
      pageWidth - margin * 2,
    )

    // Save the PDF
    doc.save(`FIR_${extractedInfo.incidentType}_${new Date().toISOString().split("T")[0]}.pdf`)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
          <Eye className="h-4 w-4 mr-2" />
          Preview & Download PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>FIR Document Preview</span>
          </DialogTitle>
          <DialogDescription>Review the FIR document before downloading as PDF</DialogDescription>
        </DialogHeader>

        <div className="bg-white border rounded-lg p-8 space-y-6 shadow-sm">
          {/* Header */}
          <div className="text-center border-b pb-6">
            <h2 className="text-2xl font-bold text-gray-900">FIRST INFORMATION REPORT</h2>
            <p className="text-sm text-gray-600 mt-2">Under Section 154 Cr.P.C.</p>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <div>
                <strong>FIR No:</strong> FIR/2024/001238
              </div>
              <div>
                <strong>Police Station:</strong> Cyber Crime Cell
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <strong>Date:</strong> {new Date().toLocaleDateString()}
              </div>
              <div>
                <strong>District:</strong> Gurgaon
              </div>
            </div>
          </div>

          <Separator />

          {/* Case Details */}
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Complainant:</strong>
                <p className="mt-1 text-gray-700">{extractedInfo.complainant}</p>
              </div>
              <div>
                <strong>Accused:</strong>
                <p className="mt-1 text-gray-700">{extractedInfo.accused}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Date & Time of Occurrence:</strong>
                <p className="mt-1 text-gray-700">{extractedInfo.dateTime}</p>
              </div>
              <div>
                <strong>Type of Information:</strong>
                <p className="mt-1 text-gray-700">{extractedInfo.incidentType}</p>
              </div>
            </div>

            <div>
              <strong>Place of Occurrence:</strong>
              <p className="mt-1 text-gray-700">{extractedInfo.location}</p>
            </div>
          </div>

          <Separator />

          {/* Incident Details */}
          <div>
            <strong className="text-sm">Details of Incident:</strong>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">{extractedInfo.description}</p>
          </div>

          <Separator />

          {/* Legal Sections */}
          <div>
            <strong className="text-sm">Sections of Law:</strong>
            <div className="mt-3 space-y-2">
              {extractedInfo.sections.map((section, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-sm text-gray-600">•</span>
                  <Badge variant="secondary" className="text-xs">
                    {section}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Footer */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>This FIR has been generated using AI-powered system and reviewed by the investigating officer.</p>
            <p>Generated on: {new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close Preview
          </Button>
          <Button onClick={downloadPDF} className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
