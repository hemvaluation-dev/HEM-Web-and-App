'use client'
import { CircleAlert, RotateCw } from 'lucide-react'
export default function WorkspaceError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section role="alert" className="ui-panel p-12 text-center max-w-lg mx-auto mt-12"><CircleAlert className="text-warning mx-auto mb-4" size={30} /><h1 className="text-xl font-semibold">This page could not be loaded</h1><p className="text-muted text-sm mt-3 mb-6">Check your connection and try again. If the problem continues, contact your administrator.</p><button onClick={reset} className="ui-button"><RotateCw size={16} />Try again</button></section>
}
