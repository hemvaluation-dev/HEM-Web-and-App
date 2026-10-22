import { signFiles } from '@/lib/reports/storage'
import { createClient } from '@/utils/supabase/server'
import { Video, Mic, Film } from 'lucide-react'
import DeleteDocumentButton from '../documents/DeleteDocumentButton'

export default async function MediaTab({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: rawFiles } = await supabase
    .from('case_documents')
    .select('*')
    .eq('case_id', id)
    .in('document_type', ['Video Recording', 'Audio Recording'])
    .order('created_at', { ascending: false })

  const documents = await signFiles(supabase, rawFiles || [], 'documents')

  return (
    <div className="space-y-6 text-on-surface">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Media Recordings</h2>
          <p className="text-on-surface-variant text-sm mt-1">Audio and video recordings from field agents</p>
        </div>
      </div>

      {!documents || documents.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border-base p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mx-auto mb-4">
            <Film className="w-8 h-8 text-on-surface-variant" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-2">No Media Recordings</h3>
          <p className="text-on-surface-variant">No audio or video recordings have been uploaded for this case.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.map((doc: any) => {
            const isVideo = doc.document_type === 'Video Recording';
            
            return (
              <div key={doc.id} className="flex flex-col bg-surface rounded-xl border border-border-base overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border-base flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isVideo ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'}`}>
                      {isVideo ? <Video className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-on-surface">{doc.file_name || doc.document_type}</h4>
                      <p className="text-xs text-on-surface-variant">
                        {new Date(doc.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <DeleteDocumentButton documentId={doc.id} caseId={id} />
                </div>
                
                <div className="p-4 bg-surface-hover/50 flex items-center justify-center min-h-[200px]">
                  {isVideo ? (
                    <video 
                      src={doc.file_url} 
                      controls 
                      className="w-full max-h-[300px] rounded-lg bg-black"
                    />
                  ) : (
                    <audio 
                      src={doc.file_url} 
                      controls 
                      className="w-full"
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
