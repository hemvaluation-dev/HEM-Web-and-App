import { createClient } from '@/utils/supabase/server'
import { MapPin, Navigation, Map } from 'lucide-react'
import FetchLocationButton from './FetchLocationButton'

function amenityText(value: unknown): string {
  if (typeof value === 'string') return value.trim() || 'Not entered'
  if (value && typeof value === 'object' && 'name' in value) {
    const entry = value as { name?: string; distance?: number | string }
    return entry.name ? `${entry.name}${entry.distance == null ? '' : ` (${entry.distance} m)`}` : 'Not entered'
  }
  return 'Not entered'
}

export default async function LocationTab({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: locationData } = await supabase
    .from('case_location')
    .select('*')
    .eq('case_id', id)
    .single()

  if (!locationData) {
    return (
      <div className="bg-surface rounded-xl border border-border-base p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-on-surface-variant" />
        </div>
        <h3 className="text-lg font-semibold text-on-surface mb-2">No Location Data</h3>
        <p className="text-on-surface-variant mb-8">Location has not been captured yet by the field agent.</p>
        <FetchLocationButton caseId={id} exists={false} />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-on-surface">
      <div className="bg-surface rounded-xl border border-border-base p-6 shadow-sm">
        <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-dark" />
          Captured Coordinates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-hover p-4 rounded-xl border border-border-base">
            <p className="text-sm text-on-surface-variant mb-1 font-semibold">Latitude</p>
            <p className="font-mono text-on-surface font-bold">{locationData.latitude}</p>
          </div>
          <div className="bg-surface-hover p-4 rounded-xl border border-border-base">
            <p className="text-sm text-on-surface-variant mb-1 font-semibold">Longitude</p>
            <p className="font-mono text-on-surface font-bold">{locationData.longitude}</p>
          </div>
          <div className="bg-surface-hover p-4 rounded-xl border border-border-base">
            <p className="text-sm text-on-surface-variant mb-1 font-semibold">Altitude</p>
            <p className="font-mono text-on-surface font-bold">{locationData.altitude ?? 'N/A'}</p>
          </div>
          <div className="bg-surface-hover p-4 rounded-xl border border-border-base">
            <p className="text-sm text-on-surface-variant mb-1 font-semibold">Accuracy</p>
            <p className="font-mono text-on-surface font-bold">{locationData.accuracy ?? 'N/A'} m</p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border-base p-6 shadow-sm">
        <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
          <Map className="w-5 h-5 text-brand-dark" />
          Reverse Geocoded Address
        </h2>
        <p className="text-on-surface font-semibold text-lg mb-2">{locationData.address_from_gps || 'GPS captured; street address lookup was unavailable. Enter the verified address in Data Review.'}</p>
        <p className="text-xs text-on-surface-variant mb-2">Mapping service: © OpenStreetMap contributors</p>
        <div className="flex gap-4 text-sm text-on-surface-variant">
          <p>City: <span className="font-medium text-on-surface">{locationData.city}</span></p>
          <p>State: <span className="font-medium text-on-surface">{locationData.state}</span></p>
          <p>Pincode: <span className="font-medium text-on-surface">{locationData.pincode}</span></p>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border-base p-6 shadow-sm">
        <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-brand-dark" />
          Nearby Amenities (field verified)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-border-base bg-surface-hover p-4 rounded-xl">
            <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Bus Stop</p>
            <p className="font-medium text-on-surface">
              {amenityText(locationData.nearest_bus_stop)}
            </p>
          </div>
          <div className="border border-border-base bg-surface-hover p-4 rounded-xl">
            <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Railway</p>
            <p className="font-medium text-on-surface">
              {amenityText(locationData.nearest_railway)}
            </p>
          </div>
          <div className="border border-border-base bg-surface-hover p-4 rounded-xl">
            <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Hospital</p>
            <p className="font-medium text-on-surface">
              {amenityText(locationData.nearest_hospital)}
            </p>
          </div>
          <div className="border border-border-base bg-surface-hover p-4 rounded-xl">
            <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">Airport</p>
            <p className="font-medium text-on-surface">
              {amenityText(locationData.nearest_airport)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
