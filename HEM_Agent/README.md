# HEM Agent

The field app is the mobile companion to the HEM web portal. It uses the same slate/blue design tokens, HEM logo and loader, Supabase project, and case lifecycle labels as `hem_portal/`.

## Setup

Use Flutter with Dart 3.11 or newer:

```sh
flutter pub get
export SUPABASE_PUBLISHABLE_KEY='your-original-project-publishable-key'
flutter run \
  --dart-define=SUPABASE_URL=https://osvuyzhaucjrtdhqrmlx.supabase.co \
  --dart-define=SUPABASE_PUBLISHABLE_KEY="$SUPABASE_PUBLISHABLE_KEY"
```

Pass `--dart-define=SUPABASE_URL=... --dart-define=SUPABASE_PUBLISHABLE_KEY=...` from protected CI or a local secret store. Only the publishable key belongs in a mobile binary. Never add the service-role key. The default URL targets the current original project, but the key remains a required build input.

## Workflow contract

The app keeps assigned cases visible across inspection and review. Draft saves use `in_progress`; field submission uses `field_visit_done`. Data Review fields may remain blank at submission, including lender-specific fields. GPS location, a property document, and a property photo are still required. Submission locks the mobile dossier for central processing; report and senior-review checks remain separate. Legacy status names are normalized by the shared workflow.

The mobile app writes only the field-owned records: location, photos, documents, media, attendance, leave requests, and field data. Central review and final approval remain portal responsibilities.

## Checks

```sh
dart analyze
dart format lib
flutter build apk --release
```

The analyzer currently has informational modernization notices from Flutter APIs, but no app errors or warnings. Android builds require the local Flutter SDK and Gradle cache; run the release build on the CI Linux/macOS runner when those toolchains are available.

## Case assignment notifications

Optional Android FCM integration is ready for Firebase configuration. See [setup, activation and verification](../docs/ASSIGNMENT_NOTIFICATIONS.md). The app still builds and signs in without Firebase configuration.
