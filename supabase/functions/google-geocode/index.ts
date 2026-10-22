// The legacy route name is retained so already-installed HEM Agent versions work.
// All mapping uses OpenStreetMap. No Google Maps API key is read or required.
import { reverseAddress, emptyAmenities } from '../_shared/open-maps.ts';
import { renderStaticMap } from '../_shared/open-map-image.ts';
const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers });
const timeout = () => AbortSignal.timeout(10000);
async function activeUser(req: Request): Promise<boolean> {
  const authorization = req.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return false;
  const base = Deno.env.get('SUPABASE_URL');
  const authHeaders = { Authorization: authorization, apikey: Deno.env.get('SUPABASE_ANON_KEY') || '' };
  const auth = await fetch(`${base}/auth/v1/user`, { headers: authHeaders, signal: timeout() });
  if (!auth.ok) return false;
  const user = await auth.json();
  const profile = await fetch(`${base}/rest/v1/users?id=eq.${encodeURIComponent(user.id)}&select=is_active`, { headers: authHeaders, signal: timeout() });
  return profile.ok && (await profile.json())[0]?.is_active === true;
}
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  try {
    if (!await activeUser(req)) return json({ error: 'Sign in with an active account.' }, 401);
    let body;
    try { body = await req.json(); } catch { return json({ error: 'Invalid JSON.' }, 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Supply a location object.' }, 400);
    const { latitude: lat, longitude: lng, altitude = 0, accuracy = 0, action = 'fetch' } = body;
    if (!Number.isFinite(lat) || Math.abs(lat)>90 || !Number.isFinite(lng) || Math.abs(lng)>180 || !Number.isFinite(accuracy) || accuracy < 0 || !Number.isFinite(altitude)) return json({ error: 'Invalid coordinates or accuracy.' }, 400);
    if (action === 'amenities') return json(emptyAmenities());
    if (action === 'fetch' || action === 'capture') {
      const result: Record<string, unknown> = { coordinates: { latitude: lat, longitude: lng, altitude, accuracy }, address: null, provider: 'OpenStreetMap', attribution: '© OpenStreetMap contributors' };
      if (action === 'capture') result.amenities = emptyAmenities();
      try { result.address = await reverseAddress(lat, lng); result.mapping_status = 'OK'; }
      catch (error) {
        result.mapping_status = error instanceof Error && error.message === 'RATE_LIMIT' ? 'RATE_LIMIT' : 'UNAVAILABLE';
        result.warning = 'GPS captured. OpenStreetMap address lookup is unavailable or busy. You can enter the address manually.';
      }
      return json(result);
    }
    if (action === 'static_map') {
      try { return json(await renderStaticMap(lat, lng)); }
      catch { return json({ error: 'The OpenStreetMap preview is unavailable. GPS coordinates can still be saved.' }, 503); }
    }
    return json({ error: 'Unknown action.' }, 400);
  } catch { return json({ error: 'Location service temporarily unavailable. Please try again.' }, 502); }
});
