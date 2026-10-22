import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:hem_agent/screens/workflows/review_step.dart';
import 'package:hem_agent/theme/app_theme.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  var template = 'veritas';
  Map<String, dynamic>? saved;
  final input =
      (jsonDecode(File('../qa/fixtures/measurements.json').readAsStringSync())
              as List)
          .first['input'];
  setUpAll(() async {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(
          const MethodChannel('plugins.flutter.io/shared_preferences'),
          (call) async => call.method == 'getAll' ? <String, Object>{} : true,
        );
    await Supabase.initialize(
      url: 'https://qa.invalid',
      publishableKey: 'qa-only',
      authOptions: const FlutterAuthClientOptions(
        autoRefreshToken: false,
        detectSessionInUri: false,
        localStorage: EmptyLocalStorage(),
      ),
      httpClient: MockClient((req) async {
        if (req.url.path == '/rest/v1/rpc/save_case_data') {
          saved = jsonDecode(req.body);
          return http.Response(
            jsonEncode({'revision': 2}),
            200,
            request: req,
            headers: {'content-type': 'application/json'},
          );
        }
        expect(req.url.path, '/rest/v1/cases');
        return http.Response(
          jsonEncode({
            'id': 'qa',
            'revision': 1,
            'client': {'template_name': template},
            'extracted_data': {
              ...input,
              'meter_owner_matching': 'N/A - legacy observation',
            },
          }),
          200,
          request: req,
          headers: {'content-type': 'application/json'},
        );
      }),
    );
  });
  tearDownAll(() => Supabase.instance.dispose());
  final registry =
      jsonDecode(
            File('../hem_portal/template-registry.json').readAsStringSync(),
          )
          as List;
  for (final id in ['veritas', ...registry.map((t) => t['id'] as String)]) {
    for (final dark in [false, true]) {
      testWidgets(
        '$id mobile review loads legacy data in ${dark ? 'dark' : 'light'} mode',
        (tester) async {
          template = id;
          await tester.pumpWidget(
            MaterialApp(
              theme: dark ? AppTheme.darkTheme : AppTheme.lightTheme,
              home: const ReviewStep(caseId: 'qa'),
            ),
          );
          await tester.pumpAndSettle();
          expect(tester.takeException(), isNull);
          expect(find.text('Save Data'), findsOneWidget);
          expect(find.text('Submit'), findsNothing);
          expect(find.text('Land area unit'), findsOneWidget);
          expect(find.text('Include Slab value in total'), findsOneWidget);
          expect(find.text('1800000'), findsOneWidget);
        },
      );
    }
  }
  testWidgets(
    'incomplete draft saves converted areas without submitting the case',
    (tester) async {
      final router = GoRouter(
        initialLocation: '/review',
        routes: [
          GoRoute(
            path: '/',
            builder: (_, _) => const Scaffold(body: Text('Case summary')),
            routes: [
              GoRoute(
                path: 'review',
                builder: (_, _) => const ReviewStep(caseId: 'qa'),
              ),
            ],
          ),
        ],
      );
      addTearDown(router.dispose);
      await tester.pumpWidget(
        MaterialApp.router(theme: AppTheme.lightTheme, routerConfig: router),
      );
      await tester.pumpAndSettle();
      final unit = find.ancestor(
        of: find.text('Land area unit'),
        matching: find.byType(DropdownButtonFormField<String>),
      );
      await tester.ensureVisible(unit);
      await tester.pumpAndSettle();
      await tester.tap(unit);
      await tester.pumpAndSettle();
      await tester.tap(find.text('sq.mtr').last);
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text('Save Data'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Save Data'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Save', skipOffstage: false).last);
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(saved?['p_submit'], false);
      expect(saved?['p_expected_revision'], 1);
      expect(saved?['p_data']['land_area_unit'], 'sqm');
      expect(saved?['p_data']['land_area'], '111.483648');
      expect(saved?['p_data']['total_value'], '1800000');
      expect(find.text('Case summary'), findsOneWidget);
    },
  );
}
