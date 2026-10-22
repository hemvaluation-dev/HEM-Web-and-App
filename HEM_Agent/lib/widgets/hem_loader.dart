import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'hem_logo.dart';

class HemLoader extends StatefulWidget {
  final double size;
  final String? text;

  const HemLoader({super.key, this.size = 80.0, this.text});

  @override
  State<HemLoader> createState() => _HemLoaderState();
}

class _HemLoaderState extends State<HemLoader>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final accentColor = isDark
        ? const Color(0xFF60A5FA)
        : const Color(0xFF2563EB);

    return Column(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        SizedBox(
          width: widget.size * 1.3,
          height: widget.size * 1.3,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Outer Rotating Glow Ring
              AnimatedBuilder(
                animation: _controller,
                builder: (context, child) {
                  return Transform.rotate(
                    angle: _controller.value * 2 * math.pi,
                    child: CustomPaint(
                      size: Size(widget.size * 1.3, widget.size * 1.3),
                      painter: _RingPainter(
                        color: accentColor,
                        strokeWidth: widget.size * 0.035,
                      ),
                    ),
                  );
                },
              ),

              // Reverse Counter-Rotating Subtle Arc
              AnimatedBuilder(
                animation: _controller,
                builder: (context, child) {
                  return Transform.rotate(
                    angle: -_controller.value * 2 * math.pi * 0.7,
                    child: CustomPaint(
                      size: Size(widget.size * 1.12, widget.size * 1.12),
                      painter: _ArcPainter(
                        color: accentColor.withOpacity(0.4),
                        strokeWidth: widget.size * 0.025,
                      ),
                    ),
                  );
                },
              ),

              // Breathing Center Logo
              AnimatedBuilder(
                animation: _controller,
                builder: (context, child) {
                  final scale =
                      0.94 + 0.06 * math.sin(_controller.value * 2 * math.pi);
                  return Transform.scale(
                    scale: scale,
                    child: Container(
                      padding: EdgeInsets.all(widget.size * 0.12),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isDark ? const Color(0xFF181A20) : Colors.white,
                        boxShadow: [
                          BoxShadow(
                            color: accentColor.withOpacity(0.2),
                            blurRadius: 16,
                            spreadRadius: 2,
                          ),
                        ],
                        border: Border.all(
                          color: isDark
                              ? const Color(0xFF262932)
                              : const Color(0xFFE2E8F0),
                          width: 1.5,
                        ),
                      ),
                      child: HemLogo(size: widget.size * 0.65),
                    ),
                  );
                },
              ),
            ],
          ),
        ),

        if (widget.text != null) ...[
          const SizedBox(height: 16),
          AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              final opacity =
                  0.6 + 0.4 * math.sin(_controller.value * 2 * math.pi);
              return Opacity(
                opacity: opacity,
                child: Text(
                  widget.text!,
                  style: TextStyle(
                    fontSize: widget.size * 0.17,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.5,
                    color: isDark
                        ? const Color(0xFF8E95A5)
                        : const Color(0xFF64748B),
                  ),
                ),
              );
            },
          ),
        ],
      ],
    );
  }
}

class _RingPainter extends CustomPainter {
  final Color color;
  final double strokeWidth;

  _RingPainter({required this.color, required this.strokeWidth});

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round
      ..shader = SweepGradient(
        colors: [color.withOpacity(0.0), color.withOpacity(0.1), color],
        stops: const [0.0, 0.6, 1.0],
      ).createShader(rect);

    canvas.drawArc(
      Rect.fromCircle(
        center: rect.center,
        radius: size.width / 2 - strokeWidth,
      ),
      0,
      1.7 * math.pi,
      false,
      paint,
    );
  }

  @override
  bool shouldRepaint(_RingPainter oldDelegate) => false;
}

class _ArcPainter extends CustomPainter {
  final Color color;
  final double strokeWidth;

  _ArcPainter({required this.color, required this.strokeWidth});

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round
      ..color = color;

    canvas.drawArc(
      Rect.fromCircle(
        center: rect.center,
        radius: size.width / 2 - strokeWidth,
      ),
      math.pi,
      math.pi * 0.8,
      false,
      paint,
    );
  }

  @override
  bool shouldRepaint(_ArcPainter oldDelegate) => false;
}
