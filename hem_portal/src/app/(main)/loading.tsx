import HemLoader from '@/components/HemLoader'

export default function Loading() {
  return <div role="status" aria-label="Loading workspace" className="min-h-[60vh] grid place-items-center"><span className="sr-only">Loading workspace…</span><HemLoader size="lg" text="Loading workspace…" /></div>
}
