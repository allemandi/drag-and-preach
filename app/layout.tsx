import type React from "react"
import type { Metadata, Viewport } from "next"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import Favicon from "@/components/ui/favicon"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL("https://drag-and-preach.netlify.app"),
  title: {
    default: "Drag and Preach | Modern Sermon Planner & Outliner",
    template: "%s | Drag and Preach",
  },
  description:
    "Effortlessly organize, structure, and export your sermons with Drag and Preach. A modern drag-and-drop planner designed for pastors, preachers, and teachers.",
  keywords: [
    "sermon planner",
    "sermon outliner",
    "preaching",
    "pastor tools",
    "drag and drop",
    "sermon preparation",
    "homiletics",
    "church technology",
  ],
  authors: [{ name: "allemandi" }],
  creator: "allemandi",
  publisher: "Drag and Preach",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Drag and Preach | Modern Sermon Planner & Outliner",
    description: "Effortlessly organize, structure, and export your sermons with a modern drag-and-drop planner.",
    type: "website",
    url: "https://drag-and-preach.netlify.app/",
    siteName: "Drag and Preach",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Drag and Preach | Modern Sermon Planner & Outliner",
    description: "Effortlessly organize, structure, and export your sermons with a modern drag-and-drop planner.",
    creator: "@allemandi",
  },
  verification: {
    google: "google-site-verification-placeholder",
  },
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
