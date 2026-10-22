import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_compass/flutter_compass.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:native_device_orientation/native_device_orientation.dart';

class CompassUtils {
  static double normalize(double? heading) {
    if (heading == null || heading.isNaN || heading.isInfinite) return 0.0;
    return (heading % 360 + 360) % 360;
  }

  static String getDirection(double? heading) {
    double h = normalize(heading);
    if (h >= 337.5 || h < 22.5) return 'N';
    if (h >= 22.5 && h < 67.5) return 'NE';
    if (h >= 67.5 && h < 112.5) return 'E';
    if (h >= 112.5 && h < 157.5) return 'SE';
    if (h >= 157.5 && h < 202.5) return 'S';
    if (h >= 202.5 && h < 247.5) return 'SW';
    if (h >= 247.5 && h < 292.5) return 'W';
    if (h >= 292.5 && h < 337.5) return 'NW';
    return 'N';
  }
}

/// Standalone CompassScreen using the exact logic requested
class CompassScreen extends StatefulWidget {
  const CompassScreen({super.key});

  @override
  State<CompassScreen> createState() => _CompassScreenState();
}

class _CompassScreenState extends State<CompassScreen> {
  bool _permissionChecked = false;
  bool _hasPermission = true;

  @override
  void initState() {
    super.initState();
    _checkPermission();
  }

  Future<void> _checkPermission() async {
    // Location permission is required on Android for magnetometer-based
    // heading data in some versions / OEM skins.
    final status = await Permission.locationWhenInUse.status;
    if (!status.isGranted) {
      final result = await Permission.locationWhenInUse.request();
      setState(() {
        _hasPermission = result.isGranted;
        _permissionChecked = true;
      });
    } else {
      setState(() {
        _hasPermission = true;
        _permissionChecked = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_permissionChecked) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (!_hasPermission) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.explore_off, size: 64, color: Colors.grey),
                const SizedBox(height: 16),
                const Text(
                  'Location permission is required to read the compass heading.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16, color: Colors.grey),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _checkPermission,
                  child: const Text('Grant permission'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: StreamBuilder<CompassEvent>(
          stream: FlutterCompass.events,
          builder: (context, snapshot) {
            if (snapshot.hasError) {
              return _buildMessage(
                icon: Icons.error_outline,
                message: 'Error reading compass: ${snapshot.error}',
              );
            }

            if (!snapshot.hasData) {
              return _buildMessage(
                icon: Icons.hourglass_empty,
                message: 'Waiting for compass data...',
              );
            }

            final double? heading = snapshot.data!.heading;

            if (heading == null) {
              return _buildMessage(
                icon: Icons.explore_off,
                message: 'Compass sensor not available on this device.',
              );
            }

            return _CompassBody(heading: heading);
          },
        ),
      ),
    );
  }

  Widget _buildMessage({required IconData icon, required String message}) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}

class _CompassBody extends StatelessWidget {
  final double heading;

  const _CompassBody({required this.heading});

  String _cardinalDirection(double heading) {
    const directions = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW',
    ];
    final index = ((heading % 360) / 22.5).round() % 16;
    return directions[index];
  }

  @override
  Widget build(BuildContext context) {
    final headingRounded = heading.round() % 360;

    return Column(
      children: [
        const SizedBox(height: 24),
        Text(
          'COMPASS',
          style: TextStyle(
            fontSize: 14,
            letterSpacing: 6,
            fontWeight: FontWeight.w600,
            color: Colors.grey.shade500,
          ),
        ),
        Expanded(
          child: Center(
            child: LayoutBuilder(
              builder: (context, constraints) {
                final size =
                    math.min(constraints.maxWidth, constraints.maxHeight) * 0.8;
                return SizedBox(
                  width: size,
                  height: size,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Rotating dial
                      TweenAnimationBuilder<double>(
                        tween: Tween<double>(
                          begin: 0,
                          end: -heading * (math.pi / 180),
                        ),
                        duration: const Duration(milliseconds: 200),
                        curve: Curves.easeOut,
                        builder: (context, angle, child) {
                          return Transform.rotate(angle: angle, child: child);
                        },
                        child: CustomPaint(
                          size: Size(size, size),
                          painter: _CompassDialPainter(),
                        ),
                      ),
                      // Fixed needle
                      CustomPaint(
                        size: Size(size, size),
                        painter: _CompassNeedlePainter(),
                      ),
                      // Center hub
                      Container(
                        width: size * 0.06,
                        height: size * 0.06,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.grey.shade300,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.4),
                              blurRadius: 4,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(bottom: 48.0),
          child: Column(
            children: [
              Text(
                '$headingRounded°',
                style: const TextStyle(
                  fontSize: 56,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                _cardinalDirection(heading),
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w500,
                  color: Colors.grey.shade400,
                  letterSpacing: 2,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _CompassDialPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // Cardinal labels
    const labels = {0: 'N', 90: 'E', 180: 'S', 270: 'W'};

    labels.forEach((deg, label) {
      final angle = deg * math.pi / 180;
      final labelRadius = radius * 0.75;
      final position = Offset(
        center.dx + labelRadius * math.sin(angle),
        center.dy - labelRadius * math.cos(angle),
      );

      final textPainter = TextPainter(
        text: TextSpan(
          text: label,
          style: TextStyle(
            color: Colors.white,
            fontSize: radius * 0.35,
            fontWeight: FontWeight.bold,
            shadows: const [Shadow(color: Colors.black87, blurRadius: 4)],
          ),
        ),
        textDirection: TextDirection.ltr,
      );
      textPainter.layout();
      textPainter.paint(
        canvas,
        position - Offset(textPainter.width / 2, textPainter.height / 2),
      );
    });
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _CompassNeedlePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // 3D Cyan Needle pointing UP (0 degrees)
    final path = Path();
    path.moveTo(center.dx, center.dy - radius * 0.45); // Tip pointing UP
    path.lineTo(
      center.dx + radius * 0.15,
      center.dy + radius * 0.15,
    ); // Bottom right
    path.lineTo(center.dx, center.dy + radius * 0.05); // Center indent
    path.lineTo(
      center.dx - radius * 0.15,
      center.dy + radius * 0.15,
    ); // Bottom left
    path.close();

    final paint = Paint()
      ..color = Colors.cyanAccent
      ..style = PaintingStyle.fill;

    canvas.drawPath(path, paint);

    // Darker right half for 3D effect
    final rightPath = Path();
    rightPath.moveTo(center.dx, center.dy - radius * 0.45);
    rightPath.lineTo(center.dx + radius * 0.15, center.dy + radius * 0.15);
    rightPath.lineTo(center.dx, center.dy + radius * 0.05);
    rightPath.close();

    final rightPaint = Paint()
      ..color = Colors.cyan.shade800
      ..style = PaintingStyle.fill;
    canvas.drawPath(rightPath, rightPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Circular glassmorphic compass rose for camera overlay using StreamBuilder
/// and exact _CompassDialPainter rotation from user logic.
class CircularCompassRose extends StatelessWidget {
  final double heading;
  final bool showDigitalReadout;
  final double size;
  final bool isLivePreview;
  final NativeDeviceOrientation? deviceOrientation;

  const CircularCompassRose({
    Key? key,
    required this.heading,
    this.showDigitalReadout = true,
    this.size = 110.0,
    this.isLivePreview = true,
    this.deviceOrientation,
  }) : super(key: key);

  Widget _buildRoseContent(BuildContext context, double currentHeading) {
    final normHeading = CompassUtils.normalize(currentHeading);
    final dirStr = CompassUtils.getDirection(normHeading);

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.black.withOpacity(0.3),
            border: Border.all(color: Colors.white, width: 1.5),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 8),
            ],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Rotating dial using exact _CompassDialPainter
              TweenAnimationBuilder<double>(
                tween: Tween<double>(
                  begin: 0,
                  end: -currentHeading * (math.pi / 180),
                ),
                duration: const Duration(milliseconds: 200),
                curve: Curves.easeOut,
                builder: (context, angle, child) {
                  return Transform.rotate(angle: angle, child: child);
                },
                child: CustomPaint(
                  size: Size(size, size),
                  painter: _CompassDialPainter(),
                ),
              ),
              // Fixed cyan needle
              CustomPaint(
                size: Size(size, size),
                painter: _CompassNeedlePainter(),
              ),
            ],
          ),
        ),

        if (showDigitalReadout) ...[
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.88),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white24, width: 1),
              boxShadow: const [
                BoxShadow(
                  color: Colors.black54,
                  blurRadius: 4,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '${normHeading.toStringAsFixed(0)}°',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  dirStr,
                  style: const TextStyle(
                    color: Colors.cyanAccent,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!isLivePreview) {
      return _buildRoseContent(context, heading);
    }

    return StreamBuilder<CompassEvent>(
      stream: FlutterCompass.events,
      builder: (context, snapshot) {
        double? h =
            snapshot.data?.headingForCameraMode ?? snapshot.data?.heading;

        final double currentHeading = (h != null && !h.isNaN && !h.isInfinite)
            ? h
            : heading;
        return _buildRoseContent(context, currentHeading);
      },
    );
  }
}
