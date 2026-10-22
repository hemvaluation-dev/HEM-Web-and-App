import 'dart:typed_data';
import 'package:flutter_test/flutter_test.dart';
import 'package:image/image.dart' as img;
import 'package:hem_agent/core/photo_upload.dart';
import 'package:hem_agent/core/photo_types.dart';

void main() {
  test('PNG screenshots retain original bytes and correct upload MIME', () {
    final bytes = Uint8List.fromList(
      img.encodePng(img.Image(width: 160, height: 90)),
    );
    final upload = PhotoUpload.prepare(bytes);
    expect(upload.bytes, same(bytes));
    expect(upload.extension, 'png');
    expect(upload.contentType, 'image/png');
  });
  test('other supported images normalize and invalid files fail clearly', () {
    final bytes = Uint8List.fromList(
      img.encodeBmp(img.Image(width: 160, height: 90)),
    );
    final upload = PhotoUpload.prepare(bytes);
    expect(upload.contentType, 'image/jpeg');
    expect(img.decodeJpg(upload.bytes), isNotNull);
    expect(
      () => PhotoUpload.prepare(Uint8List.fromList([1, 2, 3])),
      throwsFormatException,
    );
  });
  test('oversized images are resized below the actual upload limit', () {
    final image = img.Image(width: 600, height: 400);
    for (final pixel in image) {
      pixel.setRgb(pixel.x % 255, pixel.y % 255, (pixel.x * pixel.y) % 255);
    }
    final upload = PhotoUpload.prepare(
      Uint8List.fromList(img.encodePng(image)),
      maxBytes: 20000,
    );
    expect(upload.bytes.length, lessThanOrEqualTo(20000));
    expect(img.decodeImage(upload.bytes), isNotNull);
  });
  test(
    'report evidence categories include maps, satellite, plans and generic screenshots',
    () {
      for (final name in [
        'Others - Screenshots',
        'Others - Route Sketch',
        'Others - Satellite View',
        'Others - Approved Plan / Layout',
      ]) {
        expect(photoTypes, contains(name));
        expect(isScreenshotType(name), isTrue);
      }
    },
  );
}
