// Public OSM use is user-triggered only. Cache and global rate gate fail closed.
const identity = 'HEMAssociates/1.0 (https://github.com/hemassociatesdev/hem_final_prod)';
const timeout = () => AbortSignal.timeout(10000);
const env = (name: string) => Deno.env.get(name) || '';
export async function mappingRpc(name: string, body: Record<string, unknown>) {
  const response = await fetch(`${env('SUPABASE_URL')}/rest/v1/rpc/${name}`, {
    method: 'POST', headers: { apikey: env('SUPABASE_SERVICE_ROLE_KEY'), Authorization: `Bearer ${env('SUPABASE_SERVICE_ROLE_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal: timeout(),
  });
  if (!response.ok) throw new Error('CACHE_UNAVAILABLE');
  return response.json();
}
export async function cachedMapping(key: string, load: () => Promise<unknown>) {
  const cache = await mappingRpc('hem_mapping_cache_read', { p_key: key });
  if (cache.value !== null && cache.value !== undefined) return cache.value;
  if (!cache.writable) throw new Error('CACHE_FULL');
  const result = await load();
  await mappingRpc('hem_mapping_cache_write', { p_key: key, p_value: result });
  return result;
}
export async function reverseAddress(lat: number, lng: number) {
  const provider = env('OSM_NOMINATIM_URL') || 'https://nominatim.openstreetmap.org';
  return cachedMapping(`address:${provider}:${lat.toFixed(5)}:${lng.toFixed(5)}`, async () => {
    if (!await mappingRpc('hem_mapping_claim_geocode', {})) throw new Error('RATE_LIMIT');
    const url = new URL('reverse', provider.replace(/\/?$/, '/'));
    url.search = new URLSearchParams({ format: 'jsonv2', lat: String(lat), lon: String(lng), addressdetails: '1', zoom: '18', 'accept-language': 'en' }).toString();
    const response = await fetch(url, { headers: { 'User-Agent': identity }, signal: timeout() });
    if (!response.ok) throw new Error('ADDRESS_UNAVAILABLE');
    const data = await response.json();
    if (!data.display_name) throw new Error('ADDRESS_NOT_FOUND');
    const address = data.address || {};
    return { formatted_address: data.display_name, city: address.city || address.town || address.village || address.county || '', district: address.state_district || address.county || '', state: address.state || '', pincode: address.postcode || '', country: address.country || '' };
  });
}
export function emptyAmenities() {
  return Object.fromEntries(['bus_stop', 'railway_station', 'hospital', 'airport', 'highway'].map(key => [key, { name: 'N/A', distance: null }]));
}
export async function osmTile(z: number, x: number, y: number) {
  const provider = env('OSM_TILE_URL') || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  // An upstream change must not return the previous provider's cached tiles.
  const key = `tile:${provider}:${z}:${x}:${y}`;
  return cachedMapping(key, async () => {
    const url = provider.replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y));
    const response = await fetch(url, { headers: { 'User-Agent': identity }, signal: timeout() });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/png')) throw new Error('MAP_UNAVAILABLE');
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length > 140000) throw new Error('MAP_TOO_LARGE');
    return bytesToBase64(bytes);
  });
}
export function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
