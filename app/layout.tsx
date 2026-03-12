import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
const inter = Inter({ subsets: ["latin"] })
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "AURALEX",
  icons: "/scale.png",
  description: "Generate FIRs and analyze legal sections using AI and RAG technology",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}
      <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
