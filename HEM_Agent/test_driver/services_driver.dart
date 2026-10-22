import 'dart:convert';
import 'dart:io';
import 'package:integration_test/integration_test_driver_extended.dart';
Future<void> main() async {
  await integrationDriver(writeResponseOnFailure: true, responseDataCallback: (data) async {
    await File('../qa/runs/2026-09-26-alignment/services-results.json').writeAsString(const JsonEncoder.withIndent('  ').convert(data));
  });
}
