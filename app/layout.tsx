import type React from "react"
import type { Metadata } from "next"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import Favicon from "@/components/ui/favicon"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Drag and Preach | Modern Sermon Planner & Outliner",
  description:
    "Effortlessly organize, structure, and export your sermons with Drag and Preach. A modern drag-and-drop planner designed for pastors, preachers, and teachers.",
  keywords: ["sermon planner", "sermon outliner", "preaching", "pastor tools", "drag and drop", "sermon preparation"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Favicon />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
