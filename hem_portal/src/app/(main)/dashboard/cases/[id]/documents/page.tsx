import { signFiles } from '@/lib/reports/storage'
import { createClient } from '@/utils/supabase/server'
import { FileText, Download, FileType, Eye } from 'lucide-react'
import UploadDocumentModal from './UploadDocumentModal'
import DeleteDocumentButton from './DeleteDocumentButton'
import { BulkDownloadButton, IndividualDownloadButton } from '../photos/DownloadComponents'

export default async function DocumentsTab({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: rawFiles } = await supabase
    .from('case_documents')
    .select('*')
    .eq('case_id', id)
    .neq('document_type', 'Video Recording')
    .neq('document_type', 'Audio Recording')
    .order('created_at', { ascending: false })

  const documents = await signFiles(supabase, rawFiles || [], 'documents')

  return (
    <div className="space-y-6 text-on-surface">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Case Documents</h2>
          <p className="text-on-surface-variant text-sm mt-1">Files uploaded by field agents</p>
        </div>
        <div className="flex items-center gap-3">
          <BulkDownloadButton files={(documents || []).map(d => ({ url: d.file_url, filename: d.file_name || `${d.document_type || 'document'}_${d.id}.pdf` }))} label="Download All Documents" />
          <UploadDocumentModal caseId={id} />
        </div>
      </div>

      {!documents || documents.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border-base p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-on-surface-variant" />
          </div>
          <h3 className="text-lg font-semibold text-on-surface mb-2">No Documents</h3>
          <p className="text-on-surface-variant">No documents have been uploaded for this case.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {documents.map((doc: any) => (
            <div key={doc.id} className="flex flex-col gap-2">
              <div className="bg-surface rounded-xl border border-border-base p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-brand-dark rounded-xl flex items-center justify-center">
                    <FileType className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-on-surface">{doc.file_name || doc.document_type || 'Document'}</h4>
                    <p className="text-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                      {doc.document_type !== doc.file_name ? doc.document_type : 'Uploaded File'}
                      {' • '}
                      <span className="normal-case tracking-normal">{new Date(doc.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a 
                    href={doc.file_url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-base text-on-surface-variant hover:bg-surface-hover transition-colors"
                    title="View Document"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <IndividualDownloadButton 
                    url={doc.file_url} 
                    filename={doc.file_name || `${doc.document_type || 'document'}_${doc.id}.pdf`}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-base text-brand-dark hover:bg-primary/10 transition-colors"
                  />
                  <DeleteDocumentButton documentId={doc.id} caseId={id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
