class SupabaseConfig {
  // Public client configuration is safe to ship in the APK. CI can override
  // these defaults when building for another explicitly selected project.
  static const String url = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://gwqfwtcxlwcmglrozshc.supabase.co',
  );
  static const String publishableKey = String.fromEnvironment(
    'SUPABASE_PUBLISHABLE_KEY',
    defaultValue: 'sb_publishable_CirwfeFTPgg1KBC2t4Kr3A_L0bjp6tc',
  );
}
