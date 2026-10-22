'use server'

import { uploadEvidence, deleteEvidence } from '@/lib/cases/evidence'

export async function uploadPhoto(formData: FormData) {
  return uploadEvidence(formData, 'photos')
}

export async function deletePhoto(id: string, caseId: string) {
  return deleteEvidence(id, caseId, 'photos')
}
