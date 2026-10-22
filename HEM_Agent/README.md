# HEM Agent

Flutter field companion to the HEM portal. The current supported release workflow is Android; the presence of other platform folders does not certify those platforms for production. It shares the HEM theme, case data and new Supabase backend with `hem_portal/`.

## Setup

Use Flutter with Dart compatible with `pubspec.yaml` (`^3.11.5`). Recent builds used Flutter **3.47.5**. Install Android SDK and the compatible Java/Gradle toolchain.

```sh
flutter pub get
flutter run \
  --dart-define=SUPABASE_URL=https://gwqfwtcxlwcmglrozshc.supabase.co \
  --dart-define=SUPABASE_PUBLISHABLE_KEY=YOUR_NEW_PROJECT_PUBLIC_KEY
```

Defaults in `lib/core/supabase_config.dart` target the restored project. Override URL and public key together for another environment. These are public client values; never pass a service-role key or Firebase private key to Dart, assets or the APK.

For assignment notifications, supply `android/app/google-services.json` matching Firebase project **hem-9b6dc** and package **com.example.flutter_app**. That native configuration is Git-ignored and must be supplied on another build machine. Android initializes Firebase from this native file; the generated `lib/firebase_options.dart` is unused, remains local if generated, and must not be committed. Do not rename the package merely to configure Firebase. Notification setup is optional for core sign-in/inspection; the notification service reports an unavailable configuration without blocking normal startup.

## Structure and workflow

- `lib/main.dart`: initializes Flutter binding before plugins, then Supabase and optional notifications.
- `lib/core/`: Supabase configuration, routing, normalized statuses, GPS and assignment notifications.
- `lib/blocs/`: authentication and application state.
- `lib/screens/`: sign-in, assigned cases, inspection/review, media and staff workflows.
- `lib/theme/`: light/dark design tokens.
- `packages/flutter_compass/`: local compass dependency; retain it when copying/building the project.

Agents capture GPS, categorized photos, documents, audio/video and editable property data. Data Review provides **Save Data**; case submission belongs to the case workflow. Incomplete Data Review values are allowed at submission, but GPS, a property document and a property photo remain required. The submitted state is `field_visit_done`; central report preparation/completion is performed in the portal. Senior approval is not required for case completion.

Location coordinates come from the phone, not Google Maps. OpenStreetMap enrichment is optional; an address lookup outage must not discard the captured GPS coordinates. Read [mapping limits](../docs/OPEN_MAPS.md).

## Notifications and release

Android FCM tokens register against the signed-in account through restricted RPCs. A notification opens only a case the current user may access. Android permission must be granted; logout unregisters the device on a best-effort basis. See [notification operations](../docs/ASSIGNMENT_NOTIFICATIONS.md). Server configuration checks passed; physical-device delivery still needs verification.

```sh
flutter test
flutter analyze
flutter build apk --release
```

APK output: `build/app/outputs/flutter-apk/app-release.apk`. The repository-root `app-release.apk` is a copied release artifact; rebuild/copy it deliberately for subsequent releases. Check signing and version-code requirements for the chosen distribution channel before rollout. Analysis may report existing modernization notices; do not describe focused checks as a full clean analysis.

Completed cases are read-only and are permanently deleted with related files after 30 days by the backend retention job. Downloaded/offline copies on a device are not remotely erased by this server cleanup. See [retention policy](../docs/CASE_COMPLETION_RETENTION.md).
