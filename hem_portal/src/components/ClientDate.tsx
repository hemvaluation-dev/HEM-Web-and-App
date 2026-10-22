'use client'

import { useEffect, useState } from 'react'

interface ClientDateProps {
  date: string | Date;
  format?: 'date' | 'datetime' | 'time';
  className?: string;
  fallback?: string;
}

export default function ClientDate({ date, format = 'date', className = '', fallback = '' }: ClientDateProps) {
  const [formatted, setFormatted] = useState<string>(fallback)

  useEffect(() => {
    if (!date) return;
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return;

      if (format === 'date') {
        setFormatted(d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' }));
      } else if (format === 'time') {
        setFormatted(d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }));
      } else {
        setFormatted(d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
      }
    } catch (e) {
      console.error("Invalid date", date)
    }
  }, [date, format])

  // Suppress hydration warning because we intentionally render fallback/empty on server and update on client
  return <span suppressHydrationWarning className={className}>{formatted}</span>
}
