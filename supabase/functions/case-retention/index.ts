const reply = (status: number, body: unknown) => Response.json(body, { status });
export async function handleRetention(request: Request): Promise<Response> {
  if (request.method !== 'POST') return reply(405, { error: 'POST required' });
  const secret = Deno.env.get('PUSH_WEBHOOK_SECRET');
  if (!secret || request.headers.get('x-push-secret') !== secret) return reply(401, { error: 'Unauthorized' });
  let dryRun = true;
  try { dryRun = (await request.json()).dry_run !== false; }
  catch { return reply(400, { error: 'JSON body required' }); }
  const base = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const deadline = AbortSignal.timeout(100000);
  async function call(path: string, body: unknown, method = 'POST') {
    const response = await fetch(base + path, {
      method, signal: AbortSignal.any([deadline, AbortSignal.timeout(20000)]),
      headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('Retention operation failed');
    return response.json();
  }
  let deleted = 0, deferred = 0, failed = 0;
  try {
    const candidates = await call('/rest/v1/rpc/hem_retention_inventory', {});
    if (dryRun) return reply(200, { dry_run: true, eligible: candidates.length });
    for (const candidate of candidates) {
      if (deadline.aborted) break;
      try {
        // Recheck the server-controlled completion timestamp immediately before deletion.
        const current = await call('/rest/v1/rpc/hem_retention_inventory', { p_case_id: candidate.id });
        if (current.length !== 1 || current[0].completed_at !== candidate.completed_at) { deferred++; continue; }
        for (const bucket of ['photos', 'documents', 'reports']) {
          const prefixes = current[0].objects.filter((o: { bucket_id: string }) => o.bucket_id === bucket).map((o: { name: string }) => o.name);
          if (prefixes.length) await call('/storage/v1/object/' + bucket, { prefixes }, 'DELETE');
        }
        // RPC refuses to remove metadata while ANY matching Storage object remains.
        const complete = await call('/rest/v1/rpc/hem_retention_finalize', { p_case_id: candidate.id, p_completed_at: candidate.completed_at });
        if (complete === true) deleted++; else deferred++;
      } catch { failed++; }
    }
    return reply(200, { dry_run: false, deleted, deferred, failed });
  } catch { return reply(503, { error: 'Retention temporarily unavailable' }); }
}
Deno.serve(handleRetention);
