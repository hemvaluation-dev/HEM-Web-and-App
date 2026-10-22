# H.E.M Associates — Platform

> **Property Valuation & Field Survey Platform** — a full-stack monorepo powering end-to-end valuation case management, field data collection, and automated report generation for H.E.M Associates.

---

## Overview

Portal verification, module boundaries, deployment packaging, and remaining release requirements are documented in [Production readiness](docs/PRODUCTION_READINESS.md). Run `npm run release:check` from `hem_portal` before shipping portal changes.

The HEM platform manages the complete lifecycle of a property valuation case — from assignment and field inspection to report generation and lender submission. It consists of three tightly integrated components:

| Component | Technology | Role |
|---|---|---|
| **Web Portal** (`hem_portal/`) | Next.js 16 (App Router) · React 19 · Supabase | Admin, reviewer dashboard, & Report Generation |
| **Field App** (`HEM_Agent/`) | Flutter · Dart · Supabase | Mobile app for field agents |

---

## Architecture

```
HEM PROD/
├── hem_portal/        # Next.js web portal (admin, reviewer, report generation)
├── HEM_Agent/         # Flutter mobile app (field agent data collection)
├── supabase/          # Supabase config & edge functions (geocoding)
├── start-all.sh       # One-command local startup script
├── docs/              # Documentation (design system, reference images)
└── DEPLOYMENT.md      # Full production deployment manual
```

### Data Flow

```
Field Agent (Flutter App)
    ↓ uploads case data, photos, documents, media → Supabase (DB + Storage)
Admin/Reviewer (Web Portal)
    ↓ reviews, approves, triggers report generation
Next.js API Route (`/api/generate-report`)
    ↓ dynamically generates PDF valuation reports using @react-pdf/renderer
    → returns completed valuation report, which is offered for download
```

---

## Tech Stack

### Web Portal (`hem_portal/`)
- **Framework:** Next.js 16 (App Router) with TypeScript
- **UI:** React 19 · Tailwind CSS v4 · Lucide React icons
- **Auth & Database:** Supabase (SSR client `@supabase/ssr`)
- **Fonts:** Fraunces (serif display) + Hanken Grotesk (sans body)

### Mobile Field App (`HEM_Agent/`)
- **Framework:** Flutter (Material 3) with Dart SDK `^3.11.5`
- **State Management:** flutter_bloc
- **Navigation:** go_router
- **Backend:** supabase_flutter
- **Device Features:** geolocator · camera · image_picker · file_picker · flutter_compass
- **Media:** record (audio) · video_player · audioplayers · path_provider
- **PDF Viewing:** pdfx
- **Screenshots:** screenshot package (GeoCam watermark burning)

### Infrastructure
- **Database & Auth:** Supabase (PostgreSQL + RLS policies)
- **Storage:** Supabase Storage (case photos, documents, media recordings)
- **Functions:** Supabase Edge Functions (Deno) for secure backend integrations (OpenStreetMap address lookup and map previews)
- **Hosting:** Vercel (web portal)

---

## Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Flutter | >= 3.11.5 |
| Dart | >= 3.11.5 |
| Node.js | >= 18 (v24 recommended) |
| npm | >= 9 |

### 1. Install Dependencies

**Flutter App:**
```bash
cd HEM_Agent && flutter pub get
```

**Web Portal:**
```bash
cd hem_portal && npm ci
npm test
npm run build
```

### 2. Configure Environment

Fill in your Supabase credentials in `hem_portal/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

For the Flutter app, update `HEM_Agent/lib/core/supabase_config.dart` with the project URL and publishable key. The mobile app must only contain the publishable key; never embed the service-role key.

### 3. Start All Services

**One-command startup:**
```bash
chmod +x start-all.sh && ./start-all.sh
```

Or start individually:
```bash
cd hem_portal && npm run dev             # port 3000
cd HEM_Agent && flutter run
```

| Service | URL |
|---|---|
| Web Portal | http://localhost:3000 |

---

## User Hierarchy & Granular Access Governance

The HEM platform employs a multi-dimensional access governance matrix combining **Levels (L1–L5)**, **Departments**, and a **Reporting Manager Hierarchy**:

### 1. Levels & Departments Matrix

| Level | Role Title | Allowed Departments | Key Responsibilities & Permissions |
|---|---|---|---|
| **L5** | **Owner** | All | Full unrestricted access across the entire platform, user management, and system administration. |
| **L4** | **Sr. Manager** | `Management` · `HR/Admin` | **L4 Management**: Full portal access (level down from Owner, excluding HR leave/attendance approvals). **L4 HR**: Full portal access excluding Case management/operations. *Note:* L4 of all departments also have full access to mobile app login. |
| **L3** | **Manager** | `Management` · `Valuation` | **L3 Management**: Full operational management access without final approval authorities. **L3 Valuation**: Dedicated case management, analysis, and report generation access. |
| **L1 / L2** | **Employee** | `Valuation` · `Field Operations` · `HR/Admin` · `Management` | **Field Operations**: Mobile app login for onsite inspection, GPS capture, photo upload, and case data submission. **Valuation**: Web portal access to analyze field data and create valuation reports. |

### 2. Reporting Manager Hierarchy
- During user creation and editing, staff at **L1, L2, and L3** can be assigned a **Reporting Manager**.
- Potential reporting managers are dynamically populated from active **L4 Management** and **Owner (L5)** accounts.
- This hierarchy powers leave approval workflows, case assignment routing, and team oversight.

---

## Web Portal Features

### Admin Panel (`/admin`)
- **Cases** — view all cases, assign to field agents and reviewers, track status
- **Team** — manage team members, department assignments, and reporting hierarchies
- **Users** — create and manage user accounts with strict level-department rules
- **Attendance** — view and export attendance records
- **Leaves** — manage leave applications with managerial routing
- **Applications** — process new agent applications
- **Report Generation** — generate lender-specific valuation reports from case data

### Dashboard (`/dashboard` & `/admin/dashboard`)
- Comprehensive overview of assigned cases and their statuses
- **KPI Metrics** — Total Cases, Completed, Pending, In Progress, Unassigned
- **MIS & Data Export** — Advanced MIS reporting with real-time dynamic filters (by agent, bank, date range, etc.) enabling precise Excel data dumps
- **Case Tracking** — Distinct tracking of both *Initiation Date* and *Submitted Date* across all cards and tables for operational SLAs

### Case Detail Tabs (`/dashboard/cases/[id]`)
- **Overview** — full case metadata with inline editing via `EditCaseDetailsModal`
- **Data Review** — editable agent-entered property data fields. Includes a robust custom UI for nested arrays (e.g., dynamically editing Floor-wise Slab & Plinth Areas instead of raw JSON)
- **Documents** — manage uploaded case documents
- **Media** — view video recordings and audio recordings captured in the field
- **Report** — generate, auto-save to database, and download lender-specific valuation reports (with completeness validation gates)

### API Routes (`/api/`)
- `/api/export-cases` — Filtered MIS Case data export
- `/api/export-analytics` — Agent performance & analytics export
- `/api/export-team` — Team directory export
- `/api/export-attendance` — Attendance & timesheet export
- `/api/export-leaves` — Leave requests export
- `/api/export-media` — Media/photo export bundle

---

## Flutter Field App Features

### Authentication
- Supabase-backed login with BLoC state management
- Persistent session handling and role/level authorization

### Cases
- **Cases List** — view assigned cases with status filtering and search. Highly visible *Initiation* & *Submitted* dates on case cards.
- **Case Details** — full case overview with timeline

### Field Workflow (per-case multi-step process)

| Step | Screen | Description |
|---|---|---|
| 1 | **Field Data** | Fill property details and valuation fields |
| 2 | **Location** | Device GPS with OpenStreetMap address lookup, compass bearing, and manually verified nearby amenities |
| 3 | **Photos** | Per-slot photo capture (Geo Cam with GPS watermark or gallery) with progress checklist |
| 4 | **Documents** | Upload supporting documents (PDFs, images) |
| 5 | **Media** | Record or upload video walkthroughs and audio notes |
| 6 | **Review** | Saved field data, area calculations, and completeness tracking |

### Location Step
- **Robust GPS parsing**: All coordinates (latitude, longitude, altitude, accuracy) explicitly cast as `double` with safe fallbacks to device position values, preventing type errors.
- **Edge Geocoding**: OpenStreetMap lookups are cached and rate-limited through a Supabase Edge Function; GPS stays device-derived.
- **Amenity data**: Nearest bus stop, railway station, hospital, airport, and highway fetched and displayed.

### Photos Step (Geo Cam)
- Watermarked photos with GPS coordinates, address, altitude, and timestamp embedded.
- Pre-upload preview before confirming upload.
- Full-screen photo viewer with expand gesture.
- Fully orientation-aware: Properly captures and scales landscape photos securely via byte-stream rotation handling. Masks auto-exposure flashes with smooth animated opacities.

### Review Step
- **Floor-wise Area Engine**: Dynamic UI for creating unlimited floors (Ground, First, Second) and specifying Plinth and Slab areas for each in Sqft.
- **Expanded mandatory field set**: Boundaries, land measurements, plinth measurements, and slab measurements are each tracked per cardinal direction.
- Field-data completeness bar with color-coded percentage indicator (green/orange/red).

### Media Step
- **Video Recording**: Record site walkthrough videos directly from the app or upload from gallery.
- **Audio Recording**: Capture verbal notes and observations as audio files.
- Playback preview via `MediaPreviewDialog` with inline video player and audio player controls.

### Additional
- **Profile** — view and edit profile
- **Leave Requests** — apply for and withdraw pending leave requests from mobile
- **Light/Dark Theme** — full Material 3 theming support



## Database (Supabase)

| Table | Description |
|---|---|
| `users` | Platform users with roles, levels (`L1`–`L5`), departments, and `reporting_manager` |
| `cases` | Valuation cases with status, assignment, and metadata |
| `case_documents` | Uploaded supporting documents, photos, video recordings, and audio recordings per case |
| `case_location` | GPS coordinates, compass bearing, address, and nearest amenity data per case |
| `case_field_data` | Structured field data collected by the agent |
| `cases.extracted_data` | Saved agent and portal field-review values retained for report generation |
| `case_photos` | Per-slot photo metadata and storage URLs |
| `attendance` | Agent attendance records |
| `leaves` | Leave applications |

Row-Level Security (RLS) is enforced — field agents can only access their assigned cases; admins and managers have departmental visibility.

---

## Design System

The platform uses a unified "land-and-earth trust" design language across both web and mobile. See `docs/design.md` for full details.

**Core color tokens:**

| Token | Hex | Usage |
|---|---|---|
| Brand (evergreen) | `#1C5C44` | Primary actions, nav, active states |
| Paper (canvas) | `#F7F4EC` | App background |
| Ink (text) | `#18241F` | Primary text |
| Sand (accent) | `#B3863A` | Highlights, avatars |

**Typography:** Fraunces (serif, display/headings) + Hanken Grotesk (sans, body)

---

## Deployment

For comprehensive step-by-step instructions on deploying the entire platform to production (Supabase, Vercel, and mobile builds), refer to the authoritative **[DEPLOYMENT.md](DEPLOYMENT.md)** guide.

### Quick Summary:
- **Supabase Functions:** Deploy `google-geocode` (the backwards-compatible route name) for OpenStreetMap lookup and previews, after applying the mapping-cache migration. No Google or AI key is required.
- **Web Portal (Vercel):** `cd hem_portal && npx vercel --prod`
- **Flutter App:** `flutter build apk --release` / `flutter build ios --release`

---

## License

Private — H.E.M Associates. All rights reserved.
