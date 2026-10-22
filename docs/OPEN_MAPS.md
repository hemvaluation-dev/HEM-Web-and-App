# OpenStreetMap location service

HEM Agent reads coordinates from the phone through Geolocator. It requests a fresh best-accuracy fix, then waits up to eight more seconds for a better fix if the first reading is worse than 10 metres. It retains the smallest reported accuracy, rejects stale/invalid updates, and warns when accuracy is worse than 25 metres. This improves selection; it cannot guarantee survey accuracy or correct device GPS errors. Capture outdoors with precise location enabled.

## Mapping

- Reverse address: Nominatim / OpenStreetMap, cached for seven days. The original GPS coordinates are always retained; a place centroid never replaces them.
- Photo map: OpenStreetMap raster tiles, with a marker at the original coordinates and attribution embedded into the PNG.
- Nearby amenities: manual, editable fields. No automatic public Overpass queries or Google Places calls. Existing case amenities are retained by the portal when GPS is recaptured.
- The existing Supabase route name `google-geocode` is retained for installed app compatibility. Its implementation no longer calls Google or reads a Google API key. The new app uses one `capture` call rather than separate address/amenity calls.

## Free public service limits

Nominatim allows at most one request per second for the entire application, not per agent. A database-backed atomic gate enforces a 1.1-second spacing across Edge Function instances, and cached results avoid repeat requests. A concurrent uncached lookup returns GPS with a warning rather than retrying. Lookups are explicitly triggered by the user's capture action; no background/autocomplete or batch geocoding runs.

Public tile requests identify HEM Associates, download only the current 256px preview viewport (at most four tiles), and reuse tiles for seven days. No offline area downloads or prefetching. Attribution remains in saved photos, including photos captured by older app versions.

The cache is service-only with RLS and revoked client grants. It is bounded to 1,024 entries, with a maximum of 192 KiB per JSON payload (less than 192 MiB of payload total before database overhead). Expired entries are removed on writes. If it fills with unexpired entries, new lookups/previews fall back gracefully instead of evicting tiles before the required seven-day retention. GPS can still be saved. Monitor cache and database size before increasing the limit.

Public community services are best-effort and can be blocked or unavailable. They have no usage bill or API key, but are not an unlimited hosted service. Supabase hosting, requests and cache storage still count against that project's quotas. Larger usage should switch to an appropriate hosted service or self-hosted Nominatim/tiles.

- https://operations.osmfoundation.org/policies/nominatim/
- https://operations.osmfoundation.org/policies/tiles/
- https://www.openstreetmap.org/copyright

Only coordinates and tile IDs go to providers; applicant names, case references, documents and account credentials are not sent to them.

## Deployment and configuration

1. Apply `supabase/migrations/202610180001_open_maps_cache.sql`.
2. Deploy `supabase/functions/google-geocode/index.ts` together with `../_shared/open-maps.ts`, `../_shared/open-map-image.ts` and its deno.json.
3. Rebuild HEM Agent for the single-call capture flow and improved GPS selection. Older versions continue to work with `fetch`, `amenities`, and `static_map`.
4. Deploy the portal for its OpenStreetMap capture flow. GOOGLE_MAPS_API_KEY is no longer a required application variable.

Optional encrypted Edge Function environment values let the administrator switch providers without releasing a new app:

- OSM_NOMINATIM_URL: Nominatim-compatible HTTPS base URL; default https://nominatim.openstreetmap.org.
- OSM_TILE_URL: PNG tile URL containing {z}, {x}, {y}; default https://tile.openstreetmap.org/{z}/{x}/{y}.png.

SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are provided to the Edge runtime by Supabase. The service key is used only inside the function for the cache. The app never receives it. Use only trusted administrator-controlled provider URLs.

## Verification

Mapping tests cover caching, cache failure, shared rate denial, old mobile request compatibility, unchanged GPS coordinates, authentication, map pixel placement, and attribution. GPS tests cover improved readings, stale/invalid readings, fixed deadlines and sensor errors. A live generic test coordinate was reverse-geocoded and rendered through the real service-only cache; no case records were modified.
