import React from "react"

export default function JsonLd() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Drag and Preach",
    "operatingSystem": "Web",
    "applicationCategory": "EducationalApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Effortlessly organize, structure, and export your sermons with Drag and Preach. A modern drag-and-drop planner designed for pastors, preachers, and teachers."
  }

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to plan a sermon with Drag and Preach",
    "step": [
      {
        "@type": "HowToStep",
        "text": "Add body sections to your sermon outline.",
        "name": "Add sections"
      },
      {
        "@type": "HowToStep",
        "text": "Drag and drop blocks to reorder your sermon content.",
        "name": "Organize content"
      },
      {
        "@type": "HowToStep",
        "text": "Export your sermon to PDF or Word format.",
        "name": "Export sermon"
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
    </>
  )
}
