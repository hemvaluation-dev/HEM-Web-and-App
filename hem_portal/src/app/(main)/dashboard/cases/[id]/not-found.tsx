import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
export default function CaseNotFound() {
  return <div className="ui-panel p-12 text-center"><FileQuestion size={30} className="mx-auto text-muted mb-4" /><h1 className="font-semibold">Case unavailable</h1><p className="text-muted text-sm mt-3 mb-6">This case could not be found or your account cannot access it.</p><Link className="ui-button" href="/dashboard/cases">Return to cases</Link></div>
}
