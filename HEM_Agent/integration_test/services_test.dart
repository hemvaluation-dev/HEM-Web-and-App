import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:integration_test/integration_test.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:hem_agent/core/supabase_config.dart';

void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets('Authenticated mapping services', (tester) async {
    await Supabase.initialize(
      url: SupabaseConfig.url,
      publishableKey: SupabaseConfig.publishableKey,
    );
    final session = Supabase.instance.client.auth.currentSession;
    expect(session, isNotNull);
    final checks = <Map<String, dynamic>>[];
    for (final action in ['fetch', 'amenities', 'static_map']) {
      final response = await http
          .post(
            Uri.parse('${SupabaseConfig.url}/functions/v1/google-geocode'),
            headers: {
              'Authorization': 'Bearer ${session!.accessToken}',
              'apikey': SupabaseConfig.publishableKey,
              'Content-Type': 'application/json',
            },
            body: jsonEncode({
              'latitude': 12.9716,
              'longitude': 77.5946,
              'action': action,
            }),
          )
          .timeout(const Duration(seconds: 40));
      final body = jsonDecode(response.body) as Map<String, dynamic>;
      final address = Map<String, dynamic>.from(body['address'] ?? {});
      final hospital = Map<String, dynamic>.from(body['hospital'] ?? {});
      final valid =
          response.statusCode == 200 &&
          (action == 'fetch'
              ? (body['coordinates']?['latitude'] is num &&
                    (address['formatted_address'] is String ||
                        body['warning'] is String))
              : action == 'static_map'
              ? (body['imageBase64'] as String? ?? '').isNotEmpty
              : hospital['name'] == 'N/A' && hospital['distance'] == null);
      checks.add({
        'action': action,
        'status': response.statusCode,
        'pass': valid,
      });
      binding.reportData = {'checks': checks};
      print(
        'QA_SERVICE $action ${response.statusCode} ${valid ? "PASS" : "FAIL"}',
      );
    }
    expect(checks.every((check) => check['pass'] == true), true);
  });
}
