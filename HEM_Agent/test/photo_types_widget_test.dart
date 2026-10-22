import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:hem_agent/screens/workflows/photos_step.dart';
import 'package:hem_agent/theme/app_theme.dart';
import 'package:hem_agent/core/photo_types.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
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
      httpClient: MockClient(
        (req) async => http.Response(
          jsonEncode(
            req.url.path.endsWith('case_photos')
                ? []
                : {'address_from_gps': 'QA only'},
          ),
          200,
          request: req,
          headers: {'content-type': 'application/json'},
        ),
      ),
    );
  });
  tearDownAll(() => Supabase.instance.dispose());
  for (final dark in [false, true]) {
    testWidgets(
      'photo picker exposes report evidence categories without overflow in ${dark ? 'dark' : 'light'} mode',
      (tester) async {
        tester.view.physicalSize = const Size(360, 800);
        tester.view.devicePixelRatio = 1;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);
        await tester.pumpWidget(
          MaterialApp(
            theme: dark ? AppTheme.darkTheme : AppTheme.lightTheme,
            home: const PhotosStep(caseId: 'qa'),
          ),
        );
        await tester.pumpAndSettle();
        await tester.tap(find.text('Gallery'));
        await tester.pumpAndSettle();
        final field = tester.widget<DropdownButton<String>>(
          find.byType(DropdownButton<String>),
        );
        expect(field.items!.map((i) => i.value).toList(), photoTypes);
        field.onChanged!('Others - Prohibited Property Screenshot');
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
        await tester.tap(find.text('Cancel'));
        await tester.pumpAndSettle();
      },
    );
  }
}
