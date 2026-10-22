# Android case assignment notifications

Status (2026-10-21): mobile integration and sender code implemented; additive database migration applied to the original HEM project. Firebase credentials, sender deployment, dispatcher activation and physical-device delivery testing are still pending. No historical case data was modified. No notifications have been sent.

## Firebase details needed

1. Create/use a Firebase project on Spark. Register the existing Android application ID **`com.example.flutter_app`**. Do not rename that ID as part of this integration: installed APKs must continue to update normally.
2. Download the matching `google-services.json` to `HEM_Agent/android/app/google-services.json`. This path is ignored by Git. Do not paste credentials into chat.
3. Enable the Firebase Cloud Messaging HTTP v1 API. Create a server service account with only the required FCM sending permission (`cloudmessaging.messages.create`; Firebase Cloud Messaging API Admin is the standard predefined role). Store its downloaded JSON in a protected local folder. Configure its full JSON as the encrypted Supabase Edge secret **`FIREBASE_SERVICE_ACCOUNT_JSON`**. Never place that private key in the mobile app, Next.js public environment, source control or logs.
4. Generate a strong random shared secret and configure **`PUSH_WEBHOOK_SECRET`** in Supabase Edge secrets. Use the same value for the Vault secret `hem_push_webhook_secret` below.

There is no Firebase database, Storage, Analytics or Cloud Function dependency. FCM is free; Supabase database, Edge executions and egress still count toward the existing plan.

## Activation (after credentials are available)

- The migration `20261021090405_assignment_push_notifications.sql` is already installed on HEM. Apply it normally only on other environments.
- Deploy `supabase/functions/assignment-push/index.ts` as `assignment-push`, using the checked-in function config (`verify_jwt=false`). The handler validates `x-push-secret`; neither the public publishable key nor a user's session authorizes sending.
- In Supabase Vault, create `hem_push_url` = `https://osvuyzhaucjrtdhqrmlx.supabase.co/functions/v1/assignment-push` and `hem_push_webhook_secret` = the same strong value used in Edge secrets.
- Run `supabase/setup/enable_assignment_push.sql`. This installs an asynchronous database wake-up and one five-minute retry job. It is deliberately not activated before the sender is configured. Do not additionally create a Dashboard webhook: that would invoke the sender twice.
- Build/install the updated release APK and sign in. Accept Android's notification permission. Profile shows configuration/permission/registration status and a retry control.

The trigger covers both case creation with an assignee and later assignment/reassignment, independent of which portal API performs the write. Unchanged assignee updates and removal of an assignee do not enqueue alerts. Existing assignments are not backfilled. If an agent has no registered device at send time, the event is skipped; their case is still available normally in the app.

## Security, reliability and quota controls

- Device tokens and event/delivery records are service-only tables with RLS; clients register/unregister only their own active account through restricted RPCs. Private privileged functions have fixed search paths and no anonymous execution privileges.
- Generic lock-screen text contains no customer name, address or documents. Tap navigation validates the UUID and checks that the logged-in user is still the assignee. The sender also rechecks case ownership and device registration before dispatch.
- Foreground messages show an in-app alert with an Open action. Android displays background notification payloads; no extra local notification is created. Cold-start taps are held until login has completed.
- Logout unregisters the token and invalidates it with FCM on a best-effort basis. Expired `UNREGISTERED` responses remove stale tokens. An offline logout cannot guarantee immediate server revocation; notification text stays generic and opening a case always requires current access.
- No app polling, no payload/token/provider-response logging, maximum ten devices per account. Unchanged registrations are refreshed at most daily within a running app session. Queue records expire after 30 days; inactive device records after 90 days. Delivery rows cascade with expired events.
- The retry job performs only a database check when idle: no Edge invocation when no event is pending. Retry batches are limited to twenty events, five claims per event, and a 24-hour delivery window. Each event has a processing lease. Successful device sends are recorded so retries skip them.
- FCM is an external service: exactly-once delivery cannot be guaranteed if a process stops after FCM accepts a message but before the delivery row commits. Android notification tags/collapse keys reduce duplicate tray entries. Force-stopped apps and denied permissions can prevent delivery.

To pause dispatch, remove the Vault `hem_push_webhook_secret` and unschedule `hem-assignment-push-retry`; assignments continue to queue. Do not delete cases or storage to disable notifications.

## Verification

- `flutter test`: 55 passing tests including payload route validation and unconfigured feature behavior.
- Focused Flutter analysis: new service, main and auth code pass.
- Release APK builds without Firebase configuration.
- `npm test`: 123 passing portal/backend tests.
- `node --test hem_portal/tests/assignment-push.test.cjs`: seven passing tests; mocked sender tests cover authentication/configuration guards, duplicate claims, stale assignments, no devices, transient failure recovery, successful OAuth/FCM sending, prior deliveries and invalid-token removal.
- `supabase/tests/assignment_push.sql`: live transactional assertions passed; all test queue/device writes rolled back. Real case rows are never updated by this test.
- Table/RPC privilege probes confirmed client reads and client dispatch are denied. Security advisors flag the service-only tables' absence of client RLS policies as informational; deny-by-default is intentional. Other pre-existing project advisories are outside this feature.

Before rollout, test a real assignment on a physical Android phone in foreground, background and cold-start states, then reassignment, logout/account switching, denied permission, and a network outage/retry. This cannot be verified until Firebase is configured.

References: [Firebase Flutter messaging](https://firebase.google.com/docs/cloud-messaging/flutter/get-started), [FCM HTTP v1](https://firebase.google.com/docs/cloud-messaging/send/v1-api), [Supabase push notifications](https://supabase.com/docs/guides/functions/examples/push-notifications).
