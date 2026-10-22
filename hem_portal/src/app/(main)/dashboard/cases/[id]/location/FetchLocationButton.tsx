'use client'

import { useRouter } from 'next/navigation'

import { useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { captureLocation } from '../actions'

export default function FetchLocationButton({ caseId, exists }: { caseId: string, exists?: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleFetch() {
    setLoading(true)
    setError('')

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        
        const res = await captureLocation(caseId, latitude, longitude, accuracy)
        
        if (res.error) {
          setError(res.error)
        } else {
          router.refresh()
        }
        setLoading(false)
      },
      (geoError) => {
        setError(`Location access denied: ${geoError.message}`)
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  return (
    <div className="flex flex-col items-center">
      {error && (
        <div className="mb-4 p-3 bg-danger-bg text-danger text-sm font-medium rounded-lg border border-red-100 text-center w-full max-w-md">
          {error}
        </div>
      )}
      
      <button
        onClick={handleFetch}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-sm transition-colors bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <MapPin className="w-5 h-5" />
        )}
        {loading 
          ? 'Fetching Location & Amenities...' 
          : 'Capture Location & Amenities'}
      </button>
    </div>
  )
}
