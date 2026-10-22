import 'dart:convert';
import 'dart:io';
import 'package:integration_test/integration_test_driver_extended.dart';

Future<void> main() async {
  const root = String.fromEnvironment('QA_OUTPUT', defaultValue: '../qa/runs/2026-09-26-alignment');
  await Directory(root).create(recursive: true);
  await integrationDriver(
    writeResponseOnFailure: true,
    onScreenshot: (name, bytes, [args]) async {
      await File('$root/mobile-$name.png').writeAsBytes(bytes);
      return true; // Capture only; visual acceptance is reviewed separately.
    },
    responseDataCallback: (data) async {
      final clean = Map<String, dynamic>.from(data ?? {})..remove('screenshots');
      await File('$root/mobile-results.json').writeAsString(
        const JsonEncoder.withIndent('  ').convert(clean),
      );
    },
  );
}
