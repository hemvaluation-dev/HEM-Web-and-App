import React from 'react'

export default function HemLogo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Curved Bottom Swoop Lines */}
      <path d="M 40 130 C 65 170, 85 175, 95 175" stroke="#4A3B32" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 160 130 C 135 170, 115 175, 105 175" stroke="#4A3B32" strokeWidth="2.5" strokeLinecap="round" />

      {/* Earth Globe at Bottom */}
      <circle cx="100" cy="175" r="14" fill="#4A7C59" />
      <path d="M 94 172 C 96 168, 102 168, 104 171 C 106 174, 108 178, 103 182 C 98 185, 92 180, 94 172 Z" fill="#A8E6CF" />
      <path d="M 106 170 C 109 170, 112 173, 110 177 C 108 180, 104 179, 106 170 Z" fill="#A8E6CF" />

      {/* Tree Roots Spreading Down */}
      <path d="M 100 115 C 95 130, 85 140, 75 148" stroke="#4A3B32" strokeWidth="2" strokeLinecap="round" />
      <path d="M 100 115 C 98 135, 90 148, 85 156" stroke="#4A3B32" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M 100 115 C 100 138, 100 152, 100 160" stroke="#4A3B32" strokeWidth="2" strokeLinecap="round" />
      <path d="M 100 115 C 102 135, 110 148, 115 156" stroke="#4A3B32" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M 100 115 C 105 130, 115 140, 125 148" stroke="#4A3B32" strokeWidth="2" strokeLinecap="round" />
      <path d="M 90 120 C 80 125, 70 128, 65 130" stroke="#4A3B32" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 110 120 C 120 125, 130 128, 135 130" stroke="#4A3B32" strokeWidth="1.5" strokeLinecap="round" />

      {/* Center Horizontal Dividing Line & Background Bar */}
      <line x1="60" y1="110" x2="140" y2="110" stroke="#B0BEC5" strokeWidth="1" />
      <line x1="60" y1="117" x2="140" y2="117" stroke="#B0BEC5" strokeWidth="1" />

      {/* Center Serif Text: H . E . M */}
      <text x="100" y="113" textAnchor="middle" dominantBaseline="middle" fill="#1C5C44" fontFamily="Georgia, serif" fontWeight="bold" fontSize="19" letterSpacing="2">
        H.E.M
      </text>

      {/* Tree Trunk */}
      <path d="M 95 100 C 97 85, 96 75, 93 60 C 97 60, 103 60, 107 60 C 104 75, 103 85, 105 100 Z" fill="#4A3B32" />
      {/* Branches */}
      <path d="M 96 75 C 90 68, 80 62, 70 58" stroke="#4A3B32" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 104 75 C 110 68, 120 62, 130 58" stroke="#4A3B32" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 98 65 C 93 55, 85 48, 78 40" stroke="#4A3B32" strokeWidth="2" strokeLinecap="round" />
      <path d="M 102 65 C 107 55, 115 48, 122 40" stroke="#4A3B32" strokeWidth="2" strokeLinecap="round" />

      {/* Tree Foliage / Crown */}
      <circle cx="100" cy="40" r="24" fill="#2D5A27" fillOpacity="0.9" />
      <circle cx="80" cy="50" r="20" fill="#4A7C59" fillOpacity="0.9" />
      <circle cx="120" cy="50" r="20" fill="#3B6944" fillOpacity="0.9" />
      <circle cx="85" cy="35" r="18" fill="#5C9E6F" fillOpacity="0.85" />
      <circle cx="115" cy="35" r="18" fill="#4A7C59" fillOpacity="0.85" />
      <circle cx="100" cy="25" r="16" fill="#6EBA82" fillOpacity="0.8" />

      {/* Left Icon: Smiley Face */}
      <circle cx="45" cy="113" r="12" fill="#FFC107" />
      <circle cx="41" cy="110" r="1.5" fill="#212121" />
      <circle cx="49" cy="110" r="1.5" fill="#212121" />
      <path d="M 40 116 Q 45 121, 50 116" stroke="#212121" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* Right Icon: Red Fist inside Circle */}
      <circle cx="155" cy="113" r="12" fill="#D32F2F" />
      {/* White Raised Fist Path */}
      <path d="M 152 118 L 152 112 Q 151 110, 153 110 Q 154 110, 154 112 Q 154 109, 156 109 Q 157 109, 157 112 Q 157 110, 159 110 Q 160 110, 159 114 L 158 118 Z" fill="#FFFFFF" />
    </svg>
  )
}
