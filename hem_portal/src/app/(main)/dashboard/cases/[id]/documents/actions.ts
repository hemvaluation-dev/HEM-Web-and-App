'use server'

import { uploadEvidence, deleteEvidence } from '@/lib/cases/evidence'

export async function uploadDocument(formData: FormData) {
  return uploadEvidence(formData, 'documents')
}

export async function deleteDocument(id: string, caseId: string) {
  return deleteEvidence(id, caseId, 'documents')
}
