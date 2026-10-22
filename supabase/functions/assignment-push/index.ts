import { accessToken, assignmentMessage, invalidToken, parseAccount } from './fcm.ts';
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function handlePush(request: Request): Promise<Response> {
    if (request.method !== 'POST')
        return json(405, { error: 'POST required' });
    const secret = Deno.env.get('PUSH_WEBHOOK_SECRET');
    if (!secret || request.headers.get('x-push-secret') !== secret)
        return json(401, { error: 'Unauthorized' });
    const raw = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON');
    if (!raw)
        return json(503, { error: 'Push is not configured' });
    let id: string;
    try {
        const body = await request.json();
        id = body.event_id ?? body.record?.id;
        if (!uuid.test(id))
            throw new Error();
    }
    catch {
        return json(400, { error: 'Valid event_id required' });
    }
    const base = Deno.env.get('SUPABASE_URL')!;
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    async function db(path: string, method = 'GET', body?: unknown) {
        const response = await fetch(base + '/rest/v1/' + path, { method, signal: AbortSignal.any([operation, AbortSignal.timeout(10000)]), headers: { apikey: service, Authorization: 'Bearer ' + service, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: body === undefined ? undefined : JSON.stringify(body) });
        if (!response.ok)
            throw new Error('Push database unavailable');
        return response.status === 204 ? null : response.json();
    }
    // Keep all outbound I/O within the lease, including multi-device delivery.
    const operation = AbortSignal.timeout(45000);
    let claimed = false;
    try {
        const account = parseAccount(raw);
        const events = await db('rpc/hem_claim_assignment_push', 'POST', { p_id: id });
        if (!events.length)
            return json(200, { status: 'not_pending' });
        claimed = true;
        const event = events[0];
        const finish = async (status: string) => db('hem_assignment_notifications?id=eq.' + id, 'PATCH', { status, finished_at: new Date().toISOString(), locked_until: null });
        const cases = await db('cases?id=eq.' + event.case_id + '&assigned_to=eq.' + event.user_id + '&select=id');
        const users = await db('users?id=eq.' + event.user_id + '&is_active=eq.true&select=id');
        if (!cases.length || !users.length) {
            await finish('skipped');
            return json(200, { status: 'skipped' });
        }
        const devices = await db('hem_push_devices?user_id=eq.' + event.user_id + '&select=token');
        if (!devices.length) {
            await finish('skipped');
            return json(200, { status: 'no_devices' });
        }
        const delivered = await db('hem_push_deliveries?event_id=eq.' + id + '&select=token');
        const sent = new Set(delivered.map((row: {
            token: string;
        }) => row.token));
        const pending = devices.filter((device: {
            token: string;
        }) => !sent.has(device.token));
        if (pending.length) {
            const bearer = await accessToken(account);
            for (const device of pending) {
                // Recheck ownership immediately before dispatch (reassignment/logout may have occurred).
                const active = await db('hem_push_devices?token=eq.' + encodeURIComponent(device.token) + '&user_id=eq.' + event.user_id + '&select=token');
                const current = await db('cases?id=eq.' + event.case_id + '&assigned_to=eq.' + event.user_id + '&select=id');
                if (!active.length || !current.length)
                    continue;
                const response = await fetch('https://fcm.googleapis.com/v1/projects/' + account.project_id + '/messages:send', { method: 'POST', signal: AbortSignal.any([operation, AbortSignal.timeout(10000)]), headers: { Authorization: 'Bearer ' + bearer, 'Content-Type': 'application/json' }, body: JSON.stringify(assignmentMessage(event, device.token)) });
                if (!response.ok) {
                    const result = await response.json();
                    if (invalidToken(result)) {
                        await db('hem_push_devices?token=eq.' + encodeURIComponent(device.token), 'DELETE');
                        continue;
                    }
                    throw new Error('Push provider unavailable');
                }
                await db('hem_push_deliveries', 'POST', { event_id: id, token: device.token });
            }
        }
        await finish('sent');
        return json(200, { status: 'sent' });
    }
    catch {
        // Never log credentials, tokens, payloads, or provider responses.
        if (claimed)
            try {
                const rows = await db('hem_assignment_notifications?id=eq.' + id + '&select=attempts');
                await db('hem_assignment_notifications?id=eq.' + id, 'PATCH', { status: rows[0]?.attempts >= 5 ? 'failed' : 'pending', locked_until: null });
            }
            catch { /* Lease expiry permits recovery. */ }
        return json(503, { error: 'Notification delivery unavailable; retry later' });
    }
}
Deno.serve(handlePush);
