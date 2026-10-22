import 'dart:typed_data';
import 'package:image/image.dart' as img;

class PhotoUpload {
  final Uint8List bytes;
  final String extension;
  String get contentType => 'image/${extension == 'jpg' ? 'jpeg' : extension}';
  PhotoUpload(this.bytes, this.extension);

  /// Preserve PNG screenshots losslessly when possible; normalize other formats.
  static PhotoUpload prepare(
    Uint8List bytes, {
    int maxBytes = 5 * 1024 * 1024,
  }) {
    img.Image? decoded;
    try {
      decoded = img.decodeImage(bytes);
    } catch (_) {
      throw const FormatException('Choose a valid photo or screenshot.');
    }
    if (decoded == null) {
      throw const FormatException('Choose a valid photo or screenshot.');
    }
    final png =
        bytes.length >= 8 &&
        bytes[0] == 137 &&
        bytes[1] == 80 &&
        bytes[2] == 78 &&
        bytes[3] == 71;
    final jpeg =
        bytes.length >= 3 &&
        bytes[0] == 255 &&
        bytes[1] == 216 &&
        bytes[2] == 255;
    if (bytes.length <= maxBytes && (png || jpeg)) {
      return PhotoUpload(bytes, png ? 'png' : 'jpg');
    }
    var image = img.bakeOrientation(decoded);
    var output = Uint8List.fromList(img.encodeJpg(image, quality: 85));
    while (output.length > maxBytes) {
      if (image.width <= 1 && image.height <= 1) {
        throw const FormatException('Image cannot fit the upload limit.');
      }
      image = img.copyResize(
        image,
        width: (image.width * .8).floor().clamp(1, image.width),
        height: (image.height * .8).floor().clamp(1, image.height),
      );
      output = Uint8List.fromList(img.encodeJpg(image, quality: 85));
    }
    return PhotoUpload(output, 'jpg');
  }
}
