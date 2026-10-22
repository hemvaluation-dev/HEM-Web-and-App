import 'package:flutter/material.dart';

class HemLogo extends StatelessWidget {
  final double size;

  const HemLogo({super.key, this.size = 80.0});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _HemLogoPainter()),
    );
  }
}

class _HemLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double scale = size.width / 200.0;
    canvas.save();
    canvas.scale(scale, scale);

    final Paint strokeBrown = Paint()
      ..color = const Color(0xFF4A3B32)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;

    // Curved Bottom Swoop Lines
    final Path swoopLeft = Path()
      ..moveTo(40, 130)
      ..cubicTo(65, 170, 85, 175, 95, 175);
    final Path swoopRight = Path()
      ..moveTo(160, 130)
      ..cubicTo(135, 170, 115, 175, 105, 175);
    canvas.drawPath(swoopLeft, strokeBrown);
    canvas.drawPath(swoopRight, strokeBrown);

    // Earth Globe
    final Paint paintGlobe = Paint()
      ..color = const Color(0xFF4A7C59)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(const Offset(100, 175), 14, paintGlobe);
    final Paint paintContinents = Paint()
      ..color = const Color(0xFFA8E6CF)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(const Offset(98, 173), 6, paintContinents);
    canvas.drawCircle(const Offset(104, 178), 5, paintContinents);

    // Tree Roots Spreading Down
    final Paint rootPaint = Paint()
      ..color = const Color(0xFF4A3B32)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.8
      ..strokeCap = StrokeCap.round;

    canvas.drawPath(
      Path()
        ..moveTo(100, 115)
        ..cubicTo(95, 130, 85, 140, 75, 148),
      rootPaint,
    );
    canvas.drawPath(
      Path()
        ..moveTo(100, 115)
        ..cubicTo(98, 135, 90, 148, 85, 156),
      rootPaint,
    );
    canvas.drawPath(
      Path()
        ..moveTo(100, 115)
        ..cubicTo(100, 138, 100, 152, 100, 160),
      rootPaint,
    );
    canvas.drawPath(
      Path()
        ..moveTo(100, 115)
        ..cubicTo(102, 135, 110, 148, 115, 156),
      rootPaint,
    );
    canvas.drawPath(
      Path()
        ..moveTo(100, 115)
        ..cubicTo(105, 130, 115, 140, 125, 148),
      rootPaint,
    );

    // Center Lines
    final Paint linePaint = Paint()
      ..color = const Color(0xFFB0BEC5)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;
    canvas.drawLine(const Offset(60, 110), const Offset(140, 110), linePaint);
    canvas.drawLine(const Offset(60, 117), const Offset(140, 117), linePaint);

    // Center Text H.E.M
    const TextSpan textSpan = TextSpan(
      text: 'H.E.M',
      style: TextStyle(
        color: Color(0xFF1C5C44),
        fontFamily: 'Georgia',
        fontWeight: FontWeight.bold,
        fontSize: 18,
        letterSpacing: 2,
      ),
    );
    final TextPainter textPainter = TextPainter(
      text: textSpan,
      textAlign: TextAlign.center,
      textDirection: TextDirection.ltr,
    );
    textPainter.layout();
    textPainter.paint(
      canvas,
      Offset(100 - textPainter.width / 2, 113 - textPainter.height / 2),
    );

    // Tree Trunk
    final Paint trunkPaint = Paint()
      ..color = const Color(0xFF4A3B32)
      ..style = PaintingStyle.fill;
    final Path trunkPath = Path()
      ..moveTo(95, 100)
      ..cubicTo(97, 85, 96, 75, 93, 60)
      ..cubicTo(97, 60, 103, 60, 107, 60)
      ..cubicTo(104, 75, 103, 85, 105, 100)
      ..close();
    canvas.drawPath(trunkPath, trunkPaint);

    // Branches
    canvas.drawPath(
      Path()
        ..moveTo(96, 75)
        ..cubicTo(90, 68, 80, 62, 70, 58),
      strokeBrown,
    );
    canvas.drawPath(
      Path()
        ..moveTo(104, 75)
        ..cubicTo(110, 68, 120, 62, 130, 58),
      strokeBrown,
    );

    // Tree Foliage / Crown
    canvas.drawCircle(
      const Offset(100, 40),
      24,
      Paint()..color = const Color(0xFF2D5A27).withAlpha(230),
    );
    canvas.drawCircle(
      const Offset(80, 50),
      20,
      Paint()..color = const Color(0xFF4A7C59).withAlpha(230),
    );
    canvas.drawCircle(
      const Offset(120, 50),
      20,
      Paint()..color = const Color(0xFF3B6944).withAlpha(230),
    );
    canvas.drawCircle(
      const Offset(85, 35),
      18,
      Paint()..color = const Color(0xFF5C9E6F).withAlpha(215),
    );
    canvas.drawCircle(
      const Offset(115, 35),
      18,
      Paint()..color = const Color(0xFF4A7C59).withAlpha(215),
    );
    canvas.drawCircle(
      const Offset(100, 25),
      16,
      Paint()..color = const Color(0xFF6EBA82).withAlpha(200),
    );

    // Left Icon: Smiley Face
    canvas.drawCircle(
      const Offset(45, 113),
      12,
      Paint()..color = const Color(0xFFFFC107),
    );
    canvas.drawCircle(
      const Offset(41, 110),
      1.5,
      Paint()..color = const Color(0xFF212121),
    );
    canvas.drawCircle(
      const Offset(49, 110),
      1.5,
      Paint()..color = const Color(0xFF212121),
    );
    canvas.drawPath(
      Path()
        ..moveTo(40, 116)
        ..quadraticBezierTo(45, 121, 50, 116),
      Paint()
        ..color = const Color(0xFF212121)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.8,
    );

    // Right Icon: Red Fist inside Circle
    canvas.drawCircle(
      const Offset(155, 113),
      12,
      Paint()..color = const Color(0xFFD32F2F),
    );
    canvas.drawCircle(const Offset(155, 113), 5, Paint()..color = Colors.white);

    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
