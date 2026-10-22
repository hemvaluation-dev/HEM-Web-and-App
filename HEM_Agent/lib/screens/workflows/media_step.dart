import '../../core/case_files.dart';
import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../theme/app_theme.dart';
import '../../widgets/hem_confirm_dialog.dart';
import '../../widgets/media_preview_dialog.dart';

class MediaStep extends StatefulWidget {
  final String caseId;
  const MediaStep({super.key, required this.caseId});

  @override
  State<MediaStep> createState() => _MediaStepState();
}

class _MediaStepState extends State<MediaStep> {
  bool _isLoading = false;
  List<dynamic> _mediaItems = [];
  bool _isLoadingMedia = true;

  @override
  void initState() {
    super.initState();
    _fetchMedia();
  }

  Future<void> _fetchMedia() async {
    try {
      final res = await Supabase.instance.client
          .from('case_documents')
          .select('*')
          .eq('case_id', widget.caseId)
          .inFilter('document_type', ['Video Recording', 'Audio Recording'])
          .order('created_at', ascending: false);
      final signedFiles = await CaseFiles.sign(res, 'documents');
      if (mounted) {
        setState(() {
          _mediaItems = signedFiles;
          _isLoadingMedia = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching media: $e');
      if (mounted) setState(() => _isLoadingMedia = false);
    }
  }

  Future<void> _deleteMedia(String id, String fileUrl) async {
    final confirm = await HemConfirmDialog.show(
      context: context,
      title: 'Delete Media',
      message:
          'Are you sure you want to delete this media? This cannot be undone.',
      confirmLabel: 'Delete',
      isDestructive: true,
    );

    if (confirm != true) return;

    setState(() => _isLoadingMedia = true);
    try {
      final supabase = Supabase.instance.client;

      // Delete from storage
      final uri = Uri.parse(fileUrl);
      final pathSegments = uri.pathSegments;
      final documentsIndex = pathSegments.indexOf('documents');
      if (documentsIndex != -1 && documentsIndex + 1 < pathSegments.length) {
        final filePath = pathSegments.sublist(documentsIndex + 1).join('/');
        // Decode the URL path to correctly handle spaces/special characters
        final decodedPath = Uri.decodeComponent(filePath);
        await supabase.storage.from('documents').remove([decodedPath]);
      }

      // Delete from DB
      await supabase.from('case_documents').delete().eq('id', id);

      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Media deleted successfully')));
      }
    } catch (e) {
      debugPrint('Error deleting media: $e');
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to delete media')));
      }
    } finally {
      if (mounted) _fetchMedia();
    }
  }

  // Audio Recording State
  final AudioRecorder _audioRecorder = AudioRecorder();
  bool _isRecordingAudio = false;
  int _recordDuration = 0;
  Timer? _timer;

  @override
  void dispose() {
    _timer?.cancel();
    _audioRecorder.dispose();
    super.dispose();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(Duration(seconds: 1), (Timer t) {
      if (mounted) {
        setState(() => _recordDuration++);
      }
    });
  }

  Future<void> _startRecording() async {
    try {
      if (await _audioRecorder.hasPermission()) {
        final dir = await getApplicationDocumentsDirectory();
        final path =
            '${dir.path}/audio_${DateTime.now().millisecondsSinceEpoch}.m4a';

        await _audioRecorder.start(
          RecordConfig(encoder: AudioEncoder.aacLc),
          path: path,
        );

        setState(() {
          _isRecordingAudio = true;
          _recordDuration = 0;
        });

        _startTimer();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Microphone permission denied.')),
        );
      }
    } catch (e) {
      debugPrint('Error starting recording: $e');
    }
  }

  Future<void> _stopRecording() async {
    try {
      final path = await _audioRecorder.stop();
      _timer?.cancel();

      setState(() {
        _isRecordingAudio = false;
      });

      if (path != null) {
        await _uploadMedia(File(path), 'Audio Recording', 'audio.m4a');
      }
    } catch (e) {
      debugPrint('Error stopping recording: $e');
    }
  }

  Future<void> _recordVideo() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickVideo(source: ImageSource.camera);
    if (pickedFile != null) {
      await _uploadMedia(File(pickedFile.path), 'Video Recording', 'video.mp4');
    }
  }

  Future<void> _uploadMedia(
    File file,
    String docType,
    String defaultExt,
  ) async {
    setState(() => _isLoading = true);
    try {
      final supabase = Supabase.instance.client;
      final fileName =
          '${widget.caseId}/${DateTime.now().millisecondsSinceEpoch}_$defaultExt';

      await supabase.storage.from('documents').upload(fileName, file);

      final fileUrl = supabase.storage.from('documents').getPublicUrl(fileName);

      try {
        await supabase.from('case_documents').insert({
          'case_id': widget.caseId,
          'file_url': fileUrl,
          'file_name': '$docType - ${DateTime.now().toString().split('.')[0]}',
          'document_type': docType,
        });
      } catch (_) {
        try {
          await supabase.storage.from('documents').remove([fileName]);
        } catch (cleanupError) {
          debugPrint('Could not clean up failed media upload: $cleanupError');
        }
        rethrow;
      }

      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('$docType uploaded successfully')));
      _fetchMedia();
    } catch (e) {
      debugPrint('Error uploading media: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to upload media. Please try again.')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  String _formatDuration(int seconds) {
    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Media Recordings'),
        leading: IconButton(
          icon: Icon(LucideIcons.arrowLeft),
          onPressed: () => context.pop(),
        ),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : Padding(
              padding: EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Record Video',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  SizedBox(height: 8),
                  ElevatedButton.icon(
                    onPressed: _recordVideo,
                    icon: Icon(LucideIcons.video),
                    label: Text('Capture Video'),
                    style: ElevatedButton.styleFrom(
                      padding: EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                  SizedBox(height: 32),
                  Text(
                    'Record Voice Note',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  SizedBox(height: 8),
                  if (_isRecordingAudio)
                    Container(
                      padding: EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.red.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.red),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(LucideIcons.mic, color: Colors.red),
                              SizedBox(width: 8),
                              Text(
                                'Recording... ${_formatDuration(_recordDuration)}',
                                style: TextStyle(
                                  color: Colors.red,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          TextButton(
                            onPressed: _stopRecording,
                            style: TextButton.styleFrom(
                              backgroundColor: Colors.red,
                              foregroundColor: Colors.white,
                            ),
                            child: Text('Stop & Save'),
                          ),
                        ],
                      ),
                    )
                  else
                    ElevatedButton.icon(
                      onPressed: _startRecording,
                      icon: Icon(LucideIcons.mic),
                      label: Text('Start Recording'),
                      style: ElevatedButton.styleFrom(
                        padding: EdgeInsets.symmetric(vertical: 16),
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                      ),
                    ),
                  SizedBox(height: 32),
                  Divider(),
                  SizedBox(height: 16),
                  Text(
                    'Recorded Media',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  SizedBox(height: 16),
                  Expanded(
                    child: _isLoadingMedia
                        ? Center(child: CircularProgressIndicator())
                        : _mediaItems.isEmpty
                        ? Center(
                            child: Text(
                              'No media recordings yet.',
                              style: TextStyle(
                                color: Theme.of(
                                  context,
                                ).colorScheme.onSurfaceVariant,
                              ),
                            ),
                          )
                        : ListView.builder(
                            itemCount: _mediaItems.length,
                            itemBuilder: (context, index) {
                              final item = _mediaItems[index];
                              final isVideo =
                                  item['document_type'] == 'Video Recording';

                              return Card(
                                margin: EdgeInsets.only(bottom: 12),
                                child: ListTile(
                                  leading: CircleAvatar(
                                    backgroundColor: isVideo
                                        ? Colors.blue.withValues(alpha: 0.1)
                                        : Colors.orange.withValues(alpha: 0.1),
                                    child: Icon(
                                      isVideo
                                          ? LucideIcons.video
                                          : LucideIcons.mic,
                                      color: isVideo
                                          ? Colors.blue
                                          : Colors.orange,
                                    ),
                                  ),
                                  title: Text(item['file_name'] ?? 'Recording'),
                                  subtitle: Text(
                                    item['created_at'].toString().split('T')[0],
                                    style: TextStyle(fontSize: 12),
                                  ),
                                  trailing: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      IconButton(
                                        icon: Icon(LucideIcons.play),
                                        onPressed: () {
                                          showDialog(
                                            context: context,
                                            builder: (context) =>
                                                MediaPreviewDialog(
                                                  fileUrl: item['file_url'],
                                                  documentType:
                                                      item['document_type'],
                                                  fileName:
                                                      item['file_name'] ??
                                                      'Recording',
                                                ),
                                          );
                                        },
                                      ),
                                      IconButton(
                                        icon: Icon(
                                          LucideIcons.trash2,
                                          color: Colors.red,
                                        ),
                                        onPressed: () => _deleteMedia(
                                          item['id'],
                                          item['file_url'],
                                        ),
                                      ),
                                    ],
                                  ),
                                  onTap: () {
                                    showDialog(
                                      context: context,
                                      builder: (context) => MediaPreviewDialog(
                                        fileUrl: item['file_url'],
                                        documentType: item['document_type'],
                                        fileName:
                                            item['file_name'] ?? 'Recording',
                                      ),
                                    );
                                  },
                                ),
                              );
                            },
                          ),
                  ),
                ],
              ),
            ),
    );
  }
}
