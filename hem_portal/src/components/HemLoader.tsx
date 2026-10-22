'use client'

import React from 'react'
import HemLogo from './HemLogo'

interface HemLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  fullScreen?: boolean
}

export default function HemLoader({
  size = 'md',
  text,
  fullScreen = false
}: HemLoaderProps) {
  const sizeMap = {
    sm: { container: 'w-10 h-10', logo: 'w-6 h-6', ring: 'border-2', text: 'text-xs' },
    md: { container: 'w-16 h-16', logo: 'w-10 h-10', ring: 'border-2.5', text: 'text-sm' },
    lg: { container: 'w-24 h-24', logo: 'w-14 h-14', ring: 'border-3', text: 'text-base' },
    xl: { container: 'w-32 h-32', logo: 'w-20 h-20', ring: 'border-4', text: 'text-lg' }
  }

  const s = sizeMap[size]

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`relative flex items-center justify-center ${s.container}`}>
        <div className="absolute inset-0 bg-primary/20 dark:bg-primary/25 rounded-full blur-xl animate-pulse" />

        {/* Outer Rotating Gradient Orbit Ring */}
        <div 
          className={`absolute inset-0 rounded-full border-transparent border-t-primary dark:border-t-primary border-r-primary/40 dark:border-r-primary/40 animate-spin ${s.ring}`} 
          style={{ animationDuration: '1.5s' }}
        />

        {/* Counter-rotating Inner Subtle Ring */}
        <div 
          className={`absolute inset-1 rounded-full border-transparent border-b-primary/60 dark:border-b-primary/60 animate-spin ${s.ring}`} 
          style={{ animationDirection: 'reverse', animationDuration: '2.5s' }}
        />

        {/* Center Logo with Breathing Animation */}
        <div className="relative z-10 animate-pulse bg-surface dark:bg-surface p-2 rounded-full shadow-inner border border-line dark:border-line flex items-center justify-center">
          <HemLogo className={s.logo} />
        </div>
      </div>

      {text && (
        <div className="flex items-center gap-1.5 font-semibold text-muted dark:text-muted tracking-wide animate-pulse">
          <span className={s.text}>{text}</span>
        </div>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-surface/80 dark:bg-[#0F1117]/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
        {content}
      </div>
    )
  }

  return content
}
