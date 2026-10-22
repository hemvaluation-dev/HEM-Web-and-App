'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveCustomerResponseRemark } from './actions'

export default function CustomerResponseRemark({ caseId, initialValue, readOnly = false, reportDrafted = false }: { caseId: string; initialValue: string | null; readOnly?: boolean; reportDrafted?: boolean }) {
  const [value, setValue] = useState(initialValue || '')
  const [saved, setSaved] = useState(initialValue || '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  return <form className="ui-panel p-5 space-y-3" onSubmit={async e => {
    e.preventDefault(); setBusy(true); setMessage('')
    try {
      const result = await saveCustomerResponseRemark(caseId, value, saved)
      if (result.error) setMessage(result.error)
      else { setSaved(value.trim()); setValue(value.trim()); setMessage('Customer response remark saved.'); router.refresh() }
    } catch { setMessage('Could not save the remark. Please try again.') }
    finally { setBusy(false) }
  }}>
    <label htmlFor="customer-response-remark" className="block text-sm font-semibold">Customer Response Remark</label>
    <textarea id="customer-response-remark" className="ui-input min-h-24" value={value} maxLength={2000} readOnly={readOnly} disabled={busy} onChange={e => setValue(e.target.value)} placeholder={readOnly ? '' : 'Enter the customer’s response (optional)'} />
    {reportDrafted && !readOnly && <p className="text-xs text-warning">Saving changes follows the case revision rules. Generate an updated report before continuing review.</p>}
    <div className="flex items-center justify-between gap-3"><p role="status" className="text-xs text-muted">{message || (readOnly ? 'Read only · Included in MIS' : `${value.length}/2000 · Included in MIS`)}</p>{!readOnly && <button type="submit" className="ui-button ui-button-primary" disabled={busy || value === saved}>{busy ? 'Saving…' : 'Save remark'}</button>}</div>
  </form>
}
