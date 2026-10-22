import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../theme/app_theme.dart';

class MediaPreviewDialog extends StatefulWidget {
  final String fileUrl;
  final String documentType;
  final String fileName;

  const MediaPreviewDialog({
    super.key,
    required this.fileUrl,
    required this.documentType,
    required this.fileName,
  });

  @override
  State<MediaPreviewDialog> createState() => _MediaPreviewDialogState();
}

class _MediaPreviewDialogState extends State<MediaPreviewDialog> {
  VideoPlayerController? _videoController;
  final AudioPlayer _audioPlayer = AudioPlayer();

  bool _isPlaying = false;
  Duration _duration = Duration.zero;
  Duration _position = Duration.zero;
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _initializeMedia();
  }

  Future<void> _initializeMedia() async {
    try {
      if (widget.documentType == 'Video Recording') {
        _videoController = VideoPlayerController.networkUrl(
          Uri.parse(widget.fileUrl),
        );
        await _videoController!.initialize();
        _videoController!.addListener(() {
          if (mounted) {
            setState(() {
              _position = _videoController!.value.position;
              _isPlaying = _videoController!.value.isPlaying;
            });
          }
        });
        setState(() {
          _duration = _videoController!.value.duration;
          _isInitialized = true;
        });
      } else if (widget.documentType == 'Audio Recording') {
        _audioPlayer.onDurationChanged.listen((d) {
          if (mounted) setState(() => _duration = d);
        });
        _audioPlayer.onPositionChanged.listen((p) {
          if (mounted) setState(() => _position = p);
        });
        _audioPlayer.onPlayerStateChanged.listen((state) {
          if (mounted) {
            setState(() {
              _isPlaying = state == PlayerState.playing;
            });
          }
        });
        await _audioPlayer.setSourceUrl(widget.fileUrl);
        setState(() {
          _isInitialized = true;
        });
      }
    } catch (e) {
      debugPrint('Error initializing media: $e');
    }
  }

  @override
  void dispose() {
    _videoController?.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }

  void _togglePlayPause() {
    if (widget.documentType == 'Video Recording' && _videoController != null) {
      _videoController!.value.isPlaying
          ? _videoController!.pause()
          : _videoController!.play();
    } else if (widget.documentType == 'Audio Recording') {
      _isPlaying ? _audioPlayer.pause() : _audioPlayer.resume();
    }
  }

  String _formatDuration(Duration d) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(d.inMinutes.remainder(60));
    final seconds = twoDigits(d.inSeconds.remainder(60));
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.black87,
      insetPadding: const EdgeInsets.all(16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: Colors.black,
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      widget.fileName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(LucideIcons.x, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),

            // Content
            if (!_isInitialized)
              const SizedBox(
                height: 200,
                child: Center(
                  child: CircularProgressIndicator(color: Colors.white),
                ),
              )
            else if (widget.documentType == 'Video Recording' &&
                _videoController != null)
              AspectRatio(
                aspectRatio: _videoController!.value.aspectRatio,
                child: VideoPlayer(_videoController!),
              )
            else if (widget.documentType == 'Audio Recording')
              Container(
                height: 150,
                alignment: Alignment.center,
                child: const Icon(
                  LucideIcons.music,
                  size: 64,
                  color: Colors.white54,
                ),
              ),

            // Controls
            if (_isInitialized)
              Container(
                color: Colors.black,
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    IconButton(
                      icon: Icon(
                        _isPlaying ? LucideIcons.pause : LucideIcons.play,
                        color: Colors.white,
                      ),
                      onPressed: _togglePlayPause,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${_formatDuration(_position)} / ${_formatDuration(_duration)}',
                      style: const TextStyle(color: Colors.white),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Slider(
                        activeColor: AppColors.primary,
                        inactiveColor: Colors.grey,
                        value: _position.inMilliseconds.toDouble(),
                        min: 0,
                        max: _duration.inMilliseconds.toDouble() > 0
                            ? _duration.inMilliseconds.toDouble()
                            : 1.0,
                        onChanged: (value) {
                          final newPosition = Duration(
                            milliseconds: value.toInt(),
                          );
                          if (widget.documentType == 'Video Recording') {
                            _videoController?.seekTo(newPosition);
                          } else {
                            _audioPlayer.seek(newPosition);
                          }
                        },
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
