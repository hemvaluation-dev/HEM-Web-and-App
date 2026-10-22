import 'dart:io';
import 'dart:async';
import 'dart:typed_data';
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'compass_widget.dart';
import 'package:camera/camera.dart';
import 'package:flutter_compass/flutter_compass.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:screenshot/screenshot.dart';
import 'package:path_provider/path_provider.dart';
import 'package:image/image.dart' as img;
import 'package:native_device_orientation/native_device_orientation.dart';
import 'package:geolocator/geolocator.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

class CameraScreen extends StatefulWidget {
  final String address;
  final double latitude;
  final double longitude;
  final double altitude;
  final double speed;
  final String caseId;

  const CameraScreen({
    super.key,
    required this.address,
    required this.latitude,
    required this.longitude,
    required this.altitude,
    required this.speed,
    required this.caseId,
  });

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  CameraController? _controller;
  List<CameraDescription> _cameras = [];
  bool _isReady = false;
  double _previewOpacity = 0.0;
  String? _permissionError;
  int _selectedCameraIndex = 0;

  double? _heading;
  Uint8List? _mapImageBytes;
  StreamSubscription<CompassEvent>? _compassSubscription;

  bool _showPreview = true;

  // Pinch-to-zoom support
  double _minZoom = 1.0;
  double _maxZoom = 1.0;
  double _currentZoom = 1.0;
  double _baseZoom = 1.0;

  // Real-time location
  late double _currentLatitude;
  late double _currentLongitude;
  late double _currentAltitude;
  late double _currentSpeed;
  StreamSubscription<Position>? _positionSubscription;
  double? _lastMapFetchLatitude;
  double? _lastMapFetchLongitude;
  DateTime? _lastMapFetchAt;
  bool _mapFetchInProgress = false;

  // Real-time physical device orientation (for accurate compass offset)
  NativeDeviceOrientation _currentOrientation =
      NativeDeviceOrientation.portraitUp;
  StreamSubscription<NativeDeviceOrientation>? _orientationSubscription;

  @override
  void initState() {
    super.initState();
    _currentLatitude = widget.latitude;
    _currentLongitude = widget.longitude;
    _currentAltitude = widget.altitude;
    _currentSpeed = widget.speed;

    // Lock to portrait so UI controls behave like native camera
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    _initHardwareAndPermissions();
    _fetchMapImage();
    _startLocationUpdates();
  }

  void _startLocationUpdates() {
    const LocationSettings locationSettings = LocationSettings(
      accuracy: LocationAccuracy.best,
      distanceFilter: 0,
    );
    _positionSubscription =
        Geolocator.getPositionStream(locationSettings: locationSettings).listen(
          (Position position) {
            if (mounted) {
              setState(() {
                _currentLatitude = position.latitude;
                _currentLongitude = position.longitude;
                _currentAltitude = position.altitude;
                _currentSpeed = position.speed;
              });

              if (!_mapFetchInProgress &&
                  (_lastMapFetchAt == null ||
                      DateTime.now().difference(_lastMapFetchAt!) >=
                          const Duration(minutes: 1)) &&
                  (_lastMapFetchLatitude == null ||
                      Geolocator.distanceBetween(
                            _lastMapFetchLatitude!,
                            _lastMapFetchLongitude!,
                            _currentLatitude,
                            _currentLongitude,
                          ) >
                          100)) {
                _fetchMapImage();
              }
            }
          },
        );
  }

  Future<void> _initHardwareAndPermissions() async {
    if (mounted) {
      setState(() {
        _permissionError = null;
      });
    }

    try {
      final statuses = await [
        Permission.camera,
        Permission.locationWhenInUse,
      ].request();

      final camStatus = statuses[Permission.camera];
      if (camStatus != null &&
          (camStatus.isDenied || camStatus.isPermanentlyDenied)) {
        if (mounted) {
          setState(() {
            _permissionError =
                'Camera access permission was denied. Please allow Camera and Location permissions in your phone settings to capture geo-tagged photos.';
          });
        }
        return;
      }
    } catch (e) {
      debugPrint('Permission request warning: $e');
    }

    _initSensors();
    await _initCamera();
  }

  Future<void> _fetchMapImage() async {
    if (_mapFetchInProgress) return;
    _mapFetchInProgress = true;
    _lastMapFetchAt = DateTime.now();
    _lastMapFetchLatitude = _currentLatitude;
    _lastMapFetchLongitude = _currentLongitude;

    try {
      final res = await Supabase.instance.client.functions.invoke(
        'google-geocode',
        body: {
          'action': 'static_map',
          'latitude': _currentLatitude,
          'longitude': _currentLongitude,
        },
      );
      if (res.data is Map && res.data['imageBase64'] != null) {
        final base64Str = res.data['imageBase64'] as String;
        final bytes = base64Decode(base64Str);
        if (mounted) setState(() => _mapImageBytes = bytes);
      }
    } catch (e) {
      debugPrint('Failed to fetch map image: $e');
    } finally {
      _mapFetchInProgress = false;
    }
  }

  void _initSensors() {
    _orientationSubscription = NativeDeviceOrientationCommunicator()
        .onOrientationChanged(useSensor: true)
        .listen((orientation) {
          if (mounted) {
            setState(() {
              _currentOrientation = orientation;
            });
          }
        });

    try {
      _compassSubscription?.cancel();
      _compassSubscription = FlutterCompass.events?.listen((event) {
        // Use headingForCameraMode which gives the direction the back camera
        // points, computed directly from the rotation matrix in the native
        // plugin. Works correctly in all device orientations.
        double? h = event.headingForCameraMode ?? event.heading;
        if (h != null) {
          final normalized = CompassUtils.normalize(h);
          if (_heading == null || (_heading! - normalized).abs() > 0.3) {
            setState(() => _heading = normalized);
          }
        }
      });
    } catch (e) {
      debugPrint('Compass error: $e');
    }
  }

  Future<void> _switchCamera() async {
    if (_cameras.length < 2) return;

    setState(() {
      _isReady = false;
      _selectedCameraIndex = (_selectedCameraIndex + 1) % _cameras.length;
    });

    await _controller?.dispose();
    _controller = CameraController(
      _cameras[_selectedCameraIndex],
      ResolutionPreset.max, // Max resolution to avoid sensor crop
      enableAudio: false,
      imageFormatGroup: ImageFormatGroup.jpeg,
    );

    try {
      await _controller!.initialize();
      _minZoom = await _controller!.getMinZoomLevel();
      _maxZoom = await _controller!.getMaxZoomLevel();
      _currentZoom = _minZoom;
      if (mounted) {
        setState(() {
          _isReady = true;
          _previewOpacity = 0.0;
        });
        Future.delayed(const Duration(milliseconds: 300), () {
          if (mounted) setState(() => _previewOpacity = 1.0);
        });
      }
    } catch (e) {
      debugPrint('Camera switch error: $e');
    }
  }

  Future<void> _initCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras.isEmpty) {
        if (mounted) {
          setState(() {
            _permissionError = 'No camera sensors detected on this device.';
          });
        }
        return;
      }

      _controller = CameraController(
        _cameras[_selectedCameraIndex],
        ResolutionPreset.max, // Max resolution to avoid sensor crop
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.jpeg,
      );
      await _controller!.initialize();
      _minZoom = await _controller!.getMinZoomLevel();
      _maxZoom = await _controller!.getMaxZoomLevel();
      _currentZoom = _minZoom;
      if (mounted) {
        setState(() => _isReady = true);
        // Delay the fade-in slightly to allow the camera sensor's auto-exposure to settle
        // and prevent the "white blink" flash on Android devices.
        Future.delayed(const Duration(milliseconds: 300), () {
          if (mounted) setState(() => _previewOpacity = 1.0);
        });
      }
    } on CameraException catch (e) {
      debugPrint('Camera init exception: $e');
      if (mounted) {
        if (e.code == 'CameraAccessDenied' ||
            e.code == 'CameraAccessDeniedWithoutPrompt') {
          setState(() {
            _permissionError =
                'Camera access permission was denied. Please open your phone settings and enable Camera permission for this app.';
          });
        } else {
          setState(() {
            _permissionError = 'Camera error (${e.code}): ${e.description}';
          });
        }
      }
    } catch (e) {
      debugPrint('Camera init error: $e');
      if (mounted) {
        setState(() {
          _permissionError = 'Unable to access camera: $e';
        });
      }
    }
  }

  @override
  void dispose() {
    // Restore portrait-only orientation when leaving camera screen
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    _orientationSubscription?.cancel();
    _positionSubscription?.cancel();
    _compassSubscription?.cancel();
    _controller?.dispose();
    super.dispose();
  }

  Future<void> _takePicture() async {
    if (_controller == null ||
        !_controller!.value.isInitialized ||
        _controller!.value.isTakingPicture)
      return;

    try {
      // Freeze capture timestamp at the moment the shutter is pressed
      final DateTime captureTime = DateTime.now();
      final XFile photo = await _controller!.takePicture();

      if (!mounted) return;

      // Hide preview to avoid BLASTBufferQueue max frames error on Android
      setState(() {
        _showPreview = false;
      });

      final File? watermarkedFile = await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => PhotoPreviewScreen(
            imagePath: photo.path,
            latitude: _currentLatitude,
            longitude: _currentLongitude,
            altitude: _currentAltitude,
            speed: _currentSpeed,
            caseId: widget.caseId,
            heading: _heading,
            address: widget.address,
            mapImageBytes: _mapImageBytes,
            captureTime: captureTime,
            captureOrientation: _currentOrientation,
            isFrontCamera:
                _cameras[_selectedCameraIndex].lensDirection ==
                CameraLensDirection.front,
          ),
        ),
      );

      if (watermarkedFile != null) {
        Navigator.pop(context, watermarkedFile);
      } else {
        if (mounted &&
            _controller != null &&
            _controller!.value.isInitialized) {
          setState(() {
            _showPreview = true;
          });
        }
      }
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_permissionError != null) {
      return Scaffold(
        backgroundColor: const Color(0xFF0B0E14),
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(28.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFFEF6C4D).withOpacity(0.15),
                      border: Border.all(
                        color: const Color(0xFFEF6C4D),
                        width: 2,
                      ),
                    ),
                    child: const Icon(
                      LucideIcons.cameraOff,
                      size: 48,
                      color: Color(0xFFEF6C4D),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Camera Permission Required',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    _permissionError!,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 15,
                      color: Colors.grey.shade400,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () async {
                        await openAppSettings();
                      },
                      icon: const Icon(
                        LucideIcons.settings,
                        color: Colors.white,
                        size: 20,
                      ),
                      label: const Text(
                        'Open App Settings',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        backgroundColor: const Color(0xFFEF6C4D),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        setState(() {
                          _isReady = false;
                          _permissionError = null;
                        });
                        _initHardwareAndPermissions();
                      },
                      icon: const Icon(
                        LucideIcons.refreshCw,
                        color: Colors.white,
                        size: 18,
                      ),
                      label: const Text(
                        'I Granted Permission, Try Again',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 15),
                        side: const BorderSide(color: Colors.white30),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    if (!_isReady || _controller == null) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: CircularProgressIndicator(color: Colors.white)),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Pinch-to-zoom GestureDetector wrapping the camera preview with exactly aligned watermark
          if (_showPreview)
            AnimatedOpacity(
              opacity: _previewOpacity,
              duration: const Duration(milliseconds: 400),
              child: Center(
                child: Stack(
                  children: [
                    GestureDetector(
                      onScaleStart: (details) {
                        _baseZoom = _currentZoom;
                      },
                      onScaleUpdate: (details) {
                        final newZoom = (_baseZoom * details.scale).clamp(
                          _minZoom,
                          _maxZoom,
                        );
                        setState(() => _currentZoom = newZoom);
                        _controller?.setZoomLevel(newZoom);
                      },
                      child: CameraPreview(_controller!),
                    ),
                    Positioned.fill(
                      child: Builder(
                        builder: (context) {
                          int quarterTurns = 0;
                          if (_currentOrientation ==
                              NativeDeviceOrientation.landscapeLeft) {
                            quarterTurns = 1;
                          } else if (_currentOrientation ==
                              NativeDeviceOrientation.landscapeRight) {
                            quarterTurns = 3;
                          } else if (_currentOrientation ==
                              NativeDeviceOrientation.portraitDown) {
                            quarterTurns = 2;
                          }

                          return RotatedBox(
                            quarterTurns: quarterTurns,
                            child: IgnorePointer(
                              child: WatermarkOverlay(
                                latitude: _currentLatitude,
                                longitude: _currentLongitude,
                                altitude: _currentAltitude,
                                speed: _currentSpeed,
                                caseId: widget.caseId,
                                heading: _heading,
                                address: widget.address,
                                mapImageBytes: _mapImageBytes,
                                isLivePreview: true,
                                deviceOrientation: _currentOrientation,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // Top Title Bar
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.only(top: 16.0),
                child: Center(
                  child: Text(
                    'HEM - Geo Cam',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.9),
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1.2,
                    ),
                  ),
                ),
              ),
            ),
          ),

          // Discrete Zoom Controls
          if (_showPreview)
            Positioned(
              bottom: 120,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildZoomButton(1.0),
                  const SizedBox(width: 16),
                  _buildZoomButton(2.0),
                  const SizedBox(width: 16),
                  _buildZoomButton(5.0),
                ],
              ),
            ),

          // Camera Controls
          Positioned(
            bottom: 30,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                IconButton(
                  icon: const Icon(
                    LucideIcons.x,
                    color: Colors.white,
                    size: 32,
                  ),
                  onPressed: () => Navigator.pop(context),
                ),
                GestureDetector(
                  onTap: _takePicture,
                  child: Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 4),
                      color: Colors.white.withOpacity(0.5),
                    ),
                  ),
                ),
                if (_cameras.length > 1)
                  IconButton(
                    icon: const Icon(
                      LucideIcons.refreshCcw,
                      color: Colors.white,
                      size: 32,
                    ),
                    onPressed: _switchCamera,
                  )
                else
                  const SizedBox(width: 48),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildZoomButton(double zoom) {
    final isSelected = (_currentZoom - zoom).abs() < 0.2;
    return GestureDetector(
      onTap: () {
        final targetZoom = zoom.clamp(_minZoom, _maxZoom);
        setState(() => _currentZoom = targetZoom);
        _controller?.setZoomLevel(targetZoom);
      },
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.black54,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 1.5),
        ),
        child: Center(
          child: Text(
            '${zoom.toInt()}x',
            style: TextStyle(
              color: isSelected ? Colors.black : Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
        ),
      ),
    );
  }
}

class PhotoPreviewScreen extends StatefulWidget {
  final String imagePath;
  final double latitude;
  final double longitude;
  final double altitude;
  final double speed;
  final String caseId;
  final double? heading;
  final String address;
  final Uint8List? mapImageBytes;
  final DateTime captureTime;
  final NativeDeviceOrientation captureOrientation;
  final bool isFrontCamera;

  const PhotoPreviewScreen({
    super.key,
    required this.imagePath,
    required this.latitude,
    required this.longitude,
    required this.altitude,
    required this.speed,
    required this.caseId,
    this.heading,
    required this.address,
    this.mapImageBytes,
    required this.captureTime,
    this.captureOrientation = NativeDeviceOrientation.portraitUp,
    this.isFrontCamera = false,
  });

  @override
  State<PhotoPreviewScreen> createState() => _PhotoPreviewScreenState();
}

class _PhotoPreviewScreenState extends State<PhotoPreviewScreen> {
  final ScreenshotController _screenshotController = ScreenshotController();
  bool _isSaving = false;
  Uint8List? _mapImageBytes;
  double _aspectRatio = 3 / 4; // Default portrait
  bool _imageLoaded = false;

  @override
  void initState() {
    super.initState();
    _mapImageBytes = widget.mapImageBytes;
    if (_mapImageBytes == null) {
      _fetchMapImage();
    }
    _loadImageDimensions();
  }

  Future<void> _loadImageDimensions() async {
    try {
      final file = File(widget.imagePath);
      final bytes = await file.readAsBytes();
      final decoded = await decodeImageFromList(bytes);
      if (mounted) {
        setState(() {
          _aspectRatio = decoded.width / decoded.height;
          _imageLoaded = true;
        });
      }
    } catch (e) {
      debugPrint('Failed to load image dimensions: $e');
      if (mounted) {
        setState(() => _imageLoaded = true); // Fallback to default
      }
    }
  }

  Future<void> _fetchMapImage() async {
    try {
      final res = await Supabase.instance.client.functions.invoke(
        'google-geocode',
        body: {
          'action': 'static_map',
          'latitude': widget.latitude,
          'longitude': widget.longitude,
        },
      );
      if (res.data is Map && res.data['imageBase64'] != null) {
        final base64Str = res.data['imageBase64'] as String;
        final bytes = base64Decode(base64Str);
        if (mounted) setState(() => _mapImageBytes = bytes);
      }
    } catch (e) {
      debugPrint('Failed to fetch map in preview: $e');
    }
  }

  Future<void> _saveWatermarkedPhoto() async {
    setState(() => _isSaving = true);
    try {
      final Uint8List? imageBytes = await _screenshotController.capture(
        delay: const Duration(milliseconds: 100),
        pixelRatio: 3.0, // Higher res capture for sharper watermark text
      );

      if (imageBytes != null) {
        // Compress PNG screenshot to JPEG to reduce file size (8-15MB PNG → 1-2MB JPEG)
        final decodedImage = img.decodeImage(imageBytes);
        if (decodedImage == null) {
          throw Exception('Failed to decode screenshot image');
        }

        // Start with 85% quality, reduce if file exceeds 5MB
        const int maxSizeBytes = 5 * 1024 * 1024; // 5MB cap
        int quality = 85;
        Uint8List jpegBytes = Uint8List.fromList(
          img.encodeJpg(decodedImage, quality: quality),
        );

        // Progressively reduce quality if still over 5MB
        while (jpegBytes.length > maxSizeBytes && quality > 40) {
          quality -= 10;
          jpegBytes = Uint8List.fromList(
            img.encodeJpg(decodedImage, quality: quality),
          );
        }

        final directory = await getApplicationDocumentsDirectory();
        final file = File(
          '${directory.path}/watermarked_${DateTime.now().millisecondsSinceEpoch}.jpg',
        );
        await file.writeAsBytes(jpegBytes);

        debugPrint(
          'Watermarked photo: ${(jpegBytes.length / 1024 / 1024).toStringAsFixed(2)} MB at quality $quality',
        );

        if (!mounted) return;
        Navigator.pop(context, file); // Return the compressed image
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Failed to save image: $e')));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_imageLoaded) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: CircularProgressIndicator(color: Colors.white)),
      );
    }

    int turns = 0;
    if (widget.captureOrientation == NativeDeviceOrientation.landscapeLeft) {
      turns = widget.isFrontCamera ? 1 : 3;
    } else if (widget.captureOrientation ==
        NativeDeviceOrientation.landscapeRight) {
      turns = widget.isFrontCamera ? 3 : 1;
    } else if (widget.captureOrientation ==
        NativeDeviceOrientation.portraitDown) {
      turns = 2;
    }

    final displayAspectRatio = (turns == 1 || turns == 3)
        ? (1.0 / _aspectRatio)
        : _aspectRatio;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // The image and watermark to be captured
          Center(
            child: AspectRatio(
              aspectRatio: displayAspectRatio,
              child: Screenshot(
                controller: _screenshotController,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    RotatedBox(
                      quarterTurns: turns,
                      child: Image.file(
                        File(widget.imagePath),
                        fit: BoxFit.fill,
                      ),
                    ),
                    WatermarkOverlay(
                      latitude: widget.latitude,
                      longitude: widget.longitude,
                      altitude: widget.altitude,
                      speed: widget.speed,
                      caseId: widget.caseId,
                      heading: widget.heading,
                      address: widget.address,
                      mapImageBytes: _mapImageBytes,
                      isLivePreview: false,
                      captureTime: widget.captureTime,
                    ),
                  ],
                ),
              ),
            ),
          ),

          Positioned(
            top: 50,
            left: 20,
            child: CircleAvatar(
              backgroundColor: Colors.black54,
              child: IconButton(
                icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
            ),
          ),

          Positioned(
            bottom: 30,
            right: 20,
            left: 20,
            child: ElevatedButton(
              onPressed: _isSaving ? null : _saveWatermarkedPhoto,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: Colors.green,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _isSaving
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : const Text(
                      'Confirm & Save Geo-Tag',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class WatermarkOverlay extends StatelessWidget {
  final double latitude;
  final double longitude;
  final double altitude;
  final double speed;
  final String caseId;
  final double? heading;
  final String address;
  final Uint8List? mapImageBytes;
  final bool isLivePreview;
  final DateTime? captureTime;
  final NativeDeviceOrientation? deviceOrientation;

  const WatermarkOverlay({
    super.key,
    required this.latitude,
    required this.longitude,
    required this.altitude,
    required this.speed,
    required this.caseId,
    this.heading,
    required this.address,
    this.mapImageBytes,
    this.isLivePreview = false,
    this.captureTime,
    this.deviceOrientation,
  });

  @override
  Widget build(BuildContext context) {
    final normalizedHeading = CompassUtils.normalize(heading);

    final latStr =
        '${latitude.abs().toStringAsFixed(7)}${latitude >= 0 ? "N" : "S"}';
    final lngStr =
        '${longitude.abs().toStringAsFixed(7)}${longitude >= 0 ? "E" : "W"}';
    final dir = CompassUtils.getDirection(normalizedHeading);
    final displayTime = captureTime ?? DateTime.now();
    final time = DateFormat('MMM d, yyyy h:mm:ss a').format(displayTime);
    final alt = altitude.toStringAsFixed(1);

    return LayoutBuilder(
      builder: (context, constraints) {
        // Size against the photo, not the screen: landscape captures can be
        // much shorter than the portrait-locked camera screen.
        final shortEdge = constraints.biggest.shortestSide;
        final inset = shortEdge * 0.025;
        final footerHeight = shortEdge * 0.22;
        final fontSize = shortEdge * 0.022;
        final textStyle = TextStyle(
          color: Colors.white,
          fontSize: fontSize,
          height: 1.2,
          fontWeight: FontWeight.w600,
        );
        Widget line(String value, {int maxLines = 1}) => Text(
          value,
          style: textStyle,
          maxLines: maxLines,
          overflow: TextOverflow.ellipsis,
        );

        return MediaQuery.withNoTextScaling(
          child: Stack(
            children: [
              Positioned(
                top: inset,
                left: inset,
                child: CircularCompassRose(
                  key: const ValueKey('photo-compass'),
                  size: shortEdge * 0.14,
                  heading: normalizedHeading,
                  showDigitalReadout: false,
                  isLivePreview: isLivePreview,
                  deviceOrientation: deviceOrientation,
                ),
              ),
              Positioned(
                bottom: inset,
                left: inset,
                right: inset,
                height: footerHeight,
                child: Container(
                  key: const ValueKey('photo-location-strip'),
                  padding: EdgeInsets.all(shortEdge * 0.015),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.65),
                    borderRadius: BorderRadius.circular(shortEdge * 0.01),
                  ),
                  child: Row(
                    children: [
                      if (mapImageBytes != null) ...[
                        AspectRatio(
                          aspectRatio: 1,
                          child: Image.memory(
                            mapImageBytes!,
                            fit: BoxFit.contain,
                          ),
                        ),
                        SizedBox(width: shortEdge * 0.025),
                      ],
                      Expanded(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            line(time),
                            line('$latStr  $lngStr'),
                            line(
                              '${normalizedHeading.toStringAsFixed(0)}° $dir  •  Altitude: $alt m',
                            ),
                            line(
                              address.trim().isEmpty
                                  ? 'Address unavailable'
                                  : address.trim(),
                              maxLines: 2,
                            ),
                            FittedBox(
                              fit: BoxFit.scaleDown,
                              alignment: Alignment.centerLeft,
                              child: Text('Case: $caseId', style: textStyle),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
