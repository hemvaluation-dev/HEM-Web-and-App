# H.E.M Associates — Enterprise Production Deployment Guide

This document is the definitive engineering guide for deploying the **H.E.M Associates** property valuation and field operations platform to production.

The platform is designed as an enterprise micro-services suite consisting of three core pillars:
1. **Supabase**: Backend-as-a-Service (PostgreSQL database, Row Level Security, Authentication, and File Storage).
2. **Next.js Web Portal**: The enterprise management dashboard and API gateway for admins, reviewers, and staff. It also handles PDF report generation.
3. **Flutter Mobile App**: The field operations mobile client for GPS tracking, live attendance, leave requests, photo captures, and media recording.

---

## 1. Supabase Production Setup

Before deploying application services, ensure your production Supabase project is fully initialized and secured.

### A. Database Schema & RLS Policies
1. Run all migrations in your Supabase SQL Editor or via Supabase CLI:
   ```bash
   npx supabase db push
   ```
2. Verify that **Row Level Security (RLS)** is enabled on all tables:
   - `users`, `clients`, `cases`, `case_location`, `case_photos`, `case_documents`, `case_field_data`, `extracted_data`, `attendance`, `leaves`.
3. Verify default Admin accounts:
   - Ensure your owner/admin account (`srikanthganja@gmail.com`) exists with the role set to `owner` in the public `users` table.

### B. Storage Buckets & Policies
Ensure two public storage buckets exist under **Storage -> Buckets**:
1. `photos` — For site inspection captures and geo-watermarked photos.
2. `documents` — For PDF valuation reports, title documents, video recordings, and audio recordings.

Verify storage policies allow authenticated uploads and public reads:
```sql
-- Allow public read on storage objects
CREATE POLICY "Allow public read on storage" ON storage.objects FOR SELECT USING (bucket_id IN ('photos', 'documents'));

-- Allow authenticated insert on storage objects
CREATE POLICY "Allow authenticated insert on storage" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('photos', 'documents'));
```

### C. Edge Functions
Deploy `google-geocode` with its `_shared` modules after applying `202610180001_open_maps_cache.sql`. The route name is retained for older mobile versions; it now uses OpenStreetMap and needs no Google key. Report generation runs in the web portal. See `docs/OPEN_MAPS.md` for service limits and configuration.

### D. Required Credentials
Obtain the following API keys from **Project Settings -> API**:
- `Project URL` (e.g., `https://xxxx.supabase.co`)
- `anon / public key` (`sb_publishable_xxxx`)
- `service_role / secret key` (Keep confidential; required for backend admin workflows)

---

## 2. Next.js Web Portal (Vercel Deployment)

The Next.js frontend acts as the enterprise dashboard and API gateway.

### A. Vercel Project Setup
1. Import the repository into **Vercel**.
2. Set the **Root Directory** to `frontend`.
3. Set the **Framework Preset** to **Next.js**.

### B. Production Environment Variables
Configure the following Environment Variables in Vercel (**Project Settings -> Environment Variables**):

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Public Anon Key | `sb_publishable_xxxx` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Secret Service Key | `sb_secret_xxxx` |

### C. Build Optimization & Fallbacks
- The project uses `next/font/google` with explicit offline/firewall fallback families (`Georgia`, `system-ui`) and disabled metric calculation overrides (`adjustFontFallback: false`) to guarantee zero build failures in CI/CD environments.
- If `REPORT_ENGINE_URL` is temporarily unreachable during local development or network outages, `/api/schemas` automatically falls back to local repository schema discovery.

### D. Case Detail Media Tab
The web portal includes a **Media** tab at `/dashboard/cases/[id]/media` that renders video and audio recordings captured by field agents. This tab reads from `case_documents` filtered by `document_type IN ('Video Recording', 'Audio Recording')`.

---

## 4. Flutter Mobile App Production Build

The Flutter mobile app (`HEM_Agent/`) provides field agents with real-time tools including GPS capture, photo documentation, video/audio recording, and document upload.

### A. Pre-Build Configuration
1. Open `HEM_Agent/lib/core/supabase_config.dart`.
2. Ensure `SupabaseConfig.url` and `SupabaseConfig.publishableKey` match your production Supabase instance:
   ```dart
   class SupabaseConfig {
     static const String url = 'https://your-project.supabase.co';
     static const String publishableKey = 'your-publishable-key';
   }
   ```
   *(Alternatively, pass credentials via `--dart-define` during CI/CD builds).*

### B. Android Permissions
The app requires the following Android permissions (already declared in `AndroidManifest.xml`):
- `CAMERA` — for photo capture and video recording
- `RECORD_AUDIO` — for audio note recording
- `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` — for GPS
- `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` — for media gallery access

Minimum SDK: **23** (Android 6.0 Marshmallow).

### C. Android APK & App Bundle Build
To build for Google Play Store or enterprise distribution:
```bash
cd HEM_Agent

# Clean previous build artifacts
flutter clean
flutter pub get

# Build Release APK (for direct sideloading/MDM)
flutter build apk --release

# Build Android App Bundle (.aab for Play Store)
flutter build appbundle --release
```
Artifacts will be generated in `HEM_Agent/build/app/outputs/flutter-apk/app-release.apk` and `HEM_Agent/build/app/outputs/bundle/release/app-release.aab`.

### D. iOS IPA Build
To build for Apple App Store or TestFlight (macOS with Xcode required):
```bash
cd HEM_Agent
flutter build ipa --release
```
Open `HEM_Agent/build/ios/archive/Runner.xcarchive` in Xcode Organizer to validate and distribute to App Store Connect.

---

## 5. End-to-End Production Checklist

Before onboarding enterprise clients, execute the following verification checklist:

- [ ] **Auth & Role Security**: Log in as Owner (`srikanthganja@gmail.com`). Verify access to User Management (`/admin/users`) and Team Hub (`/admin/team`). Verify that field agents cannot access administrative routes.
- [ ] **Case Assignment Rules**: Verify that only case creators (or admins) can re-assign valuation cases.
- [ ] **Status Lifecycle**: Move a test case through: `Draft` -> `Assigned` -> `In Progress` -> `Review Pending` -> `Approved` -> `Delivered`. Verify that `Delivered` cases automatically register as **Completed** across all dashboards and KPIs.
- [ ] **Directional Fields**: Confirm the agent can save individual directional measurement fields (east, west, south, north) for boundaries, land measurements, plinth measurements, and slab measurements.
- [ ] **Report Engine Sync**: In a case, select a bank template (e.g., *Aditya Birla LAP*) and click **Generate Report**. Verify that the Next.js portal successfully generates the PDF, automatically saves the document to Supabase storage, and downloads the populated `.pdf` file. Verify that revisiting the tab shows the "Valuation Report Generated" view.
- [ ] **Media Recording**: Open the Flutter app on an iOS/Android device. Navigate to the Media step for an assigned case. Record a short video walkthrough and an audio note. Verify both appear in the web portal under the **Media** tab for that case.
- [ ] **Mobile Operations**: Open the Flutter app on an iOS/Android device. Clock in, submit a leave request, and capture GPS coordinates and site photos for an assigned case. Verify real-time sync with the Next.js dashboard.
- [ ] **Geo Cam Watermark**: Capture a photo using the Geo Cam. Verify that the watermark contains GPS coordinates, address, altitude, and timestamp before upload confirmation.
- [ ] **Leave Withdrawal**: Apply for a leave on mobile and verify the **Withdraw** option appears for pending requests. Confirm the status updates correctly on the web portal.
