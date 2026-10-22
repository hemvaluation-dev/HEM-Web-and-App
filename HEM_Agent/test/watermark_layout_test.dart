import 'dart:typed_data';
import 'package:image/image.dart' as img;
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hem_agent/screens/workflows/camera_screen.dart';
import 'package:hem_agent/screens/workflows/compass_widget.dart';

void main() {
  for (final size in [
    const Size(360, 480),
    const Size(360, 270),
    const Size(640, 360),
  ]) {
    testWidgets(
      'photo watermark stays compact at $size with enlarged system text',
      (tester) async {
        await tester.pumpWidget(
          MaterialApp(
            home: MediaQuery(
              data: const MediaQueryData(textScaler: TextScaler.linear(2)),
              child: Center(
                child: SizedBox(
                  width: size.width,
                  height: size.height,
                  child: WatermarkOverlay(
                    latitude: 17.7606249,
                    longitude: 83.3128977,
                    altitude: -24.9,
                    speed: 0,
                    caseId: '5e0cda61-33c8-4852-9010-0bf296d46886',
                    heading: 252,
                    mapImageBytes: size.width > size.height
                        ? Uint8List.fromList(
                            img.encodePng(img.Image(width: 40, height: 40)),
                          )
                        : null,
                    address:
                        'A long property address, residential street, neighbourhood, city, district, state, postal code',
                    captureTime: DateTime(2026, 10, 17, 11, 18, 35),
                  ),
                ),
              ),
            ),
          ),
        );
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
        final strip = tester.getRect(
          find.byKey(const ValueKey('photo-location-strip')),
        );
        final compass = tester.widget<CircularCompassRose>(
          find.byType(CircularCompassRose),
        );
        expect(strip.height, lessThanOrEqualTo(size.height * .23));
        expect(compass.size, lessThanOrEqualTo(size.shortestSide * .15));
        expect(
          find.text('Case: 5e0cda61-33c8-4852-9010-0bf296d46886'),
          findsOneWidget,
        );
        expect(find.byType(CircularProgressIndicator), findsNothing);
      },
    );
  }
}
