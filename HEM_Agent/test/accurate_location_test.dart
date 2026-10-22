import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:geolocator/geolocator.dart';
import 'package:hem_agent/core/accurate_location.dart';

Position fix(double accuracy, {int seconds = 0}) => Position(
  latitude: 16.99 + accuracy / 1000000,
  longitude: 81.78,
  timestamp: DateTime(2026, 10, 18).add(Duration(seconds: seconds)),
  accuracy: accuracy,
  altitude: 20,
  altitudeAccuracy: 5,
  heading: 0,
  headingAccuracy: 0,
  speed: 0,
  speedAccuracy: 0,
);
void main() {
  test(
    'captures the most accurate fresh device reading without changing coordinates',
    () async {
      final best = fix(4, seconds: 3);
      final result = await AccurateLocation.improve(
        fix(70),
        Stream.fromIterable([fix(30, seconds: 1), fix(50, seconds: 2), best]),
      );
      expect(result, same(best));
      expect(result.accuracy, 4);
    },
  );
  test('rejects stale and invalid accuracy samples', () async {
    final first = fix(40);
    final result = await AccurateLocation.improve(
      first,
      Stream.fromIterable([fix(1, seconds: -120), fix(-1), fix(double.nan)]),
    );
    expect(result, same(first));
  });
  test(
    'deadline returns the best available GPS fix when stream stays open',
    () async {
      final updates = StreamController<Position>();
      final first = fix(40);
      final pending = AccurateLocation.improve(
        first,
        updates.stream,
        wait: const Duration(milliseconds: 20),
      );
      final better = fix(22, seconds: 1);
      updates.add(better);
      expect(await pending, same(better));
      await updates.close();
    },
  );
  test('sensor stream errors keep the valid initial fix', () async {
    final first = fix(40);
    expect(
      await AccurateLocation.improve(
        first,
        Stream<Position>.error(StateError('sensor unavailable')),
      ),
      same(first),
    );
  });
}
