import { signFiles } from '@/lib/reports/storage'
import { createClient } from '@/utils/supabase/server'
import { Camera, Image as ImageIcon } from 'lucide-react'
import UploadPhotoModal from './UploadPhotoModal'
import DeletePhotoButton from './DeletePhotoButton'
import { BulkDownloadButton, IndividualDownloadButton } from './DownloadComponents'

export default async function PhotosTab({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: rawFiles } = await supabase
    .from('case_photos')
    .select('*')
    .eq('case_id', id)

  const photos = await signFiles(supabase, rawFiles || [], 'photos')

  return (
    <div className="space-y-6 text-on-surface">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Property Photos</h2>
          <p className="text-on-surface-variant text-sm mt-1">Images captured by field agents</p>
        </div>
        <div className="flex items-center gap-3">
          <BulkDownloadButton files={(photos || []).map(p => ({ url: p.file_url, filename: `${p.photo_type || 'photo'}_${p.id}.jpg` }))} label="Download All Photos" />
          <UploadPhotoModal caseId={id} />
        </div>
      </div>

      {!photos || photos.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border-base p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-on-surface-variant" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-2">No Photos</h3>
          <p className="text-on-surface-variant">No photos have been uploaded for this property.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo: any) => (
            <div key={photo.id} className="group relative aspect-square bg-surface rounded-xl overflow-hidden border border-border-base shadow-sm">
              <img 
                loading="lazy" decoding="async"
                src={photo.file_url} 
                alt={photo.photo_type}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-100 transition-opacity flex flex-col justify-between p-4">
                <div className="flex justify-end gap-2">
                  <IndividualDownloadButton url={photo.file_url} filename={`${photo.photo_type || 'photo'}_${photo.id}.jpg`} />
                  <a 
                    href={photo.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-lg transition-colors shadow-sm"
                    title="View photo fullscreen"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </a>
                  <DeletePhotoButton photoId={photo.id} caseId={id} />
                </div>
                <div>
                  <p className="text-white font-medium text-sm capitalize">{photo.photo_type}</p>
                  {photo.latitude && photo.longitude && (
                    <p className="text-white/80 text-xs">Lat: {photo.latitude?.toFixed(4)}, Lng: {photo.longitude?.toFixed(4)}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
