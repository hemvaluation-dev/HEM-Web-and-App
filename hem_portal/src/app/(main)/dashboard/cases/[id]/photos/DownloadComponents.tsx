'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

// Helper function to fetch a file and trigger download via a Blob
const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Network response was not ok')
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename || 'download'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error('Failed to download file:', error)
    alert(`Failed to download ${filename}`)
  }
}

export function IndividualDownloadButton({ url, filename, className }: { url: string, filename: string, className?: string }) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    await downloadFile(url, filename)
    setIsDownloading(false)
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      title="Download file"
      className={className || "bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"}
    >
      {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
    </button>
  )
}

export function BulkDownloadButton({ files, label = "Download All" }: { files: {url: string, filename: string}[], label?: string }) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleBulkDownload = async () => {
    setIsDownloading(true)
    for (const file of files) {
      await downloadFile(file.url, file.filename)
      // Small delay between downloads to prevent browser blocking
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    setIsDownloading(false)
  }

  if (!files || files.length === 0) return null

  return (
    <button
      onClick={handleBulkDownload}
      disabled={isDownloading}
      className="flex items-center gap-2 px-4 py-2 bg-paper-2 dark:bg-paper-2 hover:bg-surface-hover dark:hover:bg-surface-hover border border-line dark:border-line rounded-xl text-xs font-bold text-ink dark:text-white transition-all shadow-sm disabled:opacity-50"
    >
      {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      <span>{isDownloading ? 'Downloading...' : label}</span>
    </button>
  )
}
