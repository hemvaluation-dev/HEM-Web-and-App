import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:hem_agent/core/measurements.dart';

void main() {
  final fixtures =
      jsonDecode(File('../qa/fixtures/measurements.json').readAsStringSync())
          as List;
  for (final fixture in fixtures) {
    test('portal parity: ${fixture['name']}', () {
      final result = Measurements.calculate(
        Map<String, dynamic>.from(fixture['input']),
      );
      (fixture['expected'] as Map).forEach(
        (key, value) => expect(result[key], value, reason: key),
      );
    });
  }
  test('unit changes preserve amounts and reject incomplete dimensions', () {
    var result = Measurements.calculate(
      Map<String, dynamic>.from(fixtures.first['input']),
    );
    result = Measurements.changeUnit(result, 'land_area', 'sqm');
    result = Measurements.changeUnit(result, 'land_rate', 'sqm');
    expect(double.parse(result['land_value']), closeTo(1200000, .01));
    expect(result['land_area'], '111.483648');
    expect(Measurements.number('NaN'), isNull);
    expect(Measurements.number('Infinity'), isNull);
    expect(Measurements.number('-1'), isNull);
  });
}
