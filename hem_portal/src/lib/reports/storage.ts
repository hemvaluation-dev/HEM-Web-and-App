import type { SupabaseClient } from '@supabase/supabase-js'
import { storageImageUrl } from './images'

export function objectPath(url: string, bucket: string): string {
  const parsed = storageImageUrl(url)
  const marker = new RegExp(`^/storage/v1/object/(?:public|sign)/${bucket}/`)
  if (!marker.test(parsed.pathname)) throw new Error('Unexpected storage bucket.')
  return decodeURIComponent(parsed.pathname.replace(marker, ''))
}

export async function signFiles<T extends { file_url: string }>(client: SupabaseClient, rows: T[], bucket: string): Promise<T[]> {
  if (!rows.length) return rows
  const paths = rows.map(row => objectPath(row.file_url, bucket))
  const { data, error } = await client.storage.from(bucket).createSignedUrls(paths, 3600)
  if (error || !data || data.some(item => !item.signedUrl)) throw new Error('Case files could not be loaded.')
  return rows.map((row, i) => ({ ...row, file_url: data[i].signedUrl }))
}
