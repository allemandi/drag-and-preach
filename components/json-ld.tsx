import React from "react"
import { SEO_CONFIG } from "@/lib/seo-constants"

export default function JsonLd() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": SEO_CONFIG.siteName,
    "operatingSystem": "Web",
    "applicationCategory": "EducationalApplication",
    "description": SEO_CONFIG.description,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
    />
  )
}
