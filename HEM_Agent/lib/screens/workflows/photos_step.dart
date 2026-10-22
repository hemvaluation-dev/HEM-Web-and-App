import '../../core/photo_types.dart';
import '../../core/case_files.dart';
import 'dart:io';
import '../../core/photo_upload.dart';
import 'package:flutter/foundation.dart' show compute;
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../theme/app_theme.dart';
import '../../widgets/hem_confirm_dialog.dart';
import 'camera_screen.dart';

class PhotosStep extends StatefulWidget {
  final String caseId;
  const PhotosStep({super.key, required this.caseId});

  @override
  State<PhotosStep> createState() => _PhotosStepState();
}

class _PhotosStepState extends State<PhotosStep> {
  List<dynamic> _photos = [];
  bool _loading = true;
  bool _uploading = false;
  double _uploadProgress = 0.0;
  String _address = '';

  final List<String> _photoTypes = photoTypes;

  @override
  void initState() {
    super.initState();
    _fetchPhotos();
    _fetchCaseAddress();
  }

  Map<String, dynamic>? _locationData;

  Future<void> _fetchCaseAddress() async {
    try {
      final res = await Supabase.instance.client
          .from('case_location')
          .select('address_from_gps, latitude, longitude, altitude, accuracy')
          .eq('case_id', widget.caseId)
          .maybeSingle();

      if (res != null) {
        if (mounted) {
          setState(() {
            _address = res['address_from_gps'] ?? '';
            _locationData = res;
          });
        }
      } else {
        final caseRes = await Supabase.instance.client
            .from('cases')
            .select('address')
            .eq('id', widget.caseId)
            .single();
        if (mounted) {
          setState(() => _address = caseRes['address'] ?? '');
        }
      }
    } catch (e) {
      debugPrint('Failed to fetch address: $e');
    }
  }

  Future<void> _fetchPhotos() async {
    try {
      final res = await Supabase.instance.client
          .from('case_photos')
          .select('*')
          .eq('case_id', widget.caseId);
      final signedFiles = await CaseFiles.sign(res, 'photos');
      setState(() {
        _photos = signedFiles;
        _loading = false;
      });
    } catch (e) {
      debugPrint('Failed to fetch photos: $e');
      setState(() => _loading = false);
    }
  }

  Future<String?> _askForPhotoType() async {
    String? selected = _photoTypes.first;
    return showDialog<String>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              title: Text('Select Photo Type'),
              content: DropdownButtonFormField<String>(
                initialValue: selected,
                isExpanded: true,
                items: _photoTypes
                    .map(
                      (type) => DropdownMenuItem(
                        value: type,
                        child: Text(type, style: TextStyle(fontSize: 14)),
                      ),
                    )
                    .toList(),
                onChanged: (val) => setStateDialog(() => selected = val),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context, null),
                  child: Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context, selected),
                  child: Text('Continue'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _handleUploadFromGallery() async {
    final photoType = await _askForPhotoType();
    if (photoType == null) return;

    try {
      final ImagePicker picker = ImagePicker();
      final XFile? photo = await picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: isScreenshotType(photoType) ? null : 80,
        maxWidth: isScreenshotType(photoType) ? null : 1920,
        maxHeight: isScreenshotType(photoType) ? null : 1920,
      );

      if (photo != null) {
        final confirmed = await _showPreUploadPreview(
          File(photo.path),
          photoType,
        );
        if (confirmed == true) {
          await _uploadPhotoFile(File(photo.path), photoType, null, null);
        }
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Gallery failed: $e')));
    }
  }

  Future<bool?> _showPreUploadPreview(File file, String photoType) async {
    return showDialog<bool>(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        clipBehavior: Clip.antiAlias,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: EdgeInsets.all(16.0),
              child: Row(
                children: [
                  Icon(
                    LucideIcons.camera,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Preview: $photoType',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () =>
                  _openPhotoViewer(context, imageFile: file, title: photoType),
              child: Container(
                constraints: BoxConstraints(maxHeight: 350),
                width: double.infinity,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.file(file, fit: BoxFit.contain),
                    Positioned(
                      bottom: 8,
                      right: 8,
                      child: Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              LucideIcons.maximize2,
                              color: Colors.white,
                              size: 14,
                            ),
                            SizedBox(width: 4),
                            Text(
                              'Tap to Fullscreen',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.all(16.0),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context, false),
                      style: OutlinedButton.styleFrom(
                        padding: EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text('Retake / Cancel'),
                    ),
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => Navigator.pop(context, true),
                      icon: Icon(LucideIcons.uploadCloud, size: 18),
                      label: Text('Upload Photo'),
                      style: ElevatedButton.styleFrom(
                        padding: EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
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

  Future<void> _handleCaptureGeoCam() async {
    final photoType = await _askForPhotoType();
    if (photoType == null) return;
    if (!mounted) return;

    if (_locationData == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Please complete Property Location and Type first before using Geo Cam',
          ),
        ),
      );
      return;
    }

    final File? watermarkedFile = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CameraScreen(
          address: _address,
          latitude: (_locationData!['latitude'] as num?)?.toDouble() ?? 0.0,
          longitude: (_locationData!['longitude'] as num?)?.toDouble() ?? 0.0,
          altitude: (_locationData!['altitude'] as num?)?.toDouble() ?? 0.0,
          speed: 0.0, // Since location is stationary
          caseId: widget.caseId,
        ),
      ),
    );

    if (watermarkedFile != null) {
      final confirmed = await _showPreUploadPreview(watermarkedFile, photoType);
      if (confirmed == true) {
        await _uploadPhotoFile(
          watermarkedFile,
          photoType,
          (_locationData!['latitude'] as num?)?.toDouble(),
          (_locationData!['longitude'] as num?)?.toDouble(),
        );
      }
    }
  }

  Future<void> _uploadPhotoFile(
    File file,
    String photoType,
    double? lat,
    double? lng,
  ) async {
    setState(() {
      _uploading = true;
      _uploadProgress = 0.0;
    });
    try {
      final upload = await compute(
        PhotoUpload.prepare,
        await file.readAsBytes(),
      );
      final fileBytes = upload.bytes;
      final extension = upload.extension;
      final supabase = Supabase.instance.client;
      final cleanType = photoType.replaceAll(' ', '_').replaceAll('/', '_');
      final fileName =
          '${widget.caseId}/${DateTime.now().millisecondsSinceEpoch}_$cleanType.$extension';

      await supabase.storage
          .from('photos')
          .uploadBinary(
            fileName,
            fileBytes,
            fileOptions: FileOptions(
              upsert: false,
              contentType: upload.contentType,
            ),
          );
      // Mark upload as complete
      if (mounted) setState(() => _uploadProgress = 1.0);

      final fileUrl = supabase.storage.from('photos').getPublicUrl(fileName);

      try {
        await supabase.from('case_photos').insert({
          'case_id': widget.caseId,
          'original_file_url': fileUrl,
          'file_url': fileUrl,
          'latitude': lat,
          'longitude': lng,
          'photo_type': photoType,
        });
      } catch (_) {
        try {
          await supabase.storage.from('photos').remove([fileName]);
        } catch (cleanupError) {
          debugPrint('Could not clean up failed photo upload: $cleanupError');
        }
        rethrow;
      }

      // Update case status
      await supabase
          .from('cases')
          .update({'status': 'in_progress'})
          .eq('id', widget.caseId);

      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Photo uploaded successfully')));
      await _fetchPhotos();
    } catch (e) {
      if (!mounted) return;
      debugPrint(e.toString());
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Upload failed: $e')));
    } finally {
      setState(() {
        _uploading = false;
        _uploadProgress = 0.0;
      });
    }
  }

  Future<void> _handleDelete(String photoId) async {
    if (!mounted) return;
    final confirm = await HemConfirmDialog.show(
      context: context,
      title: 'Delete',
      message: 'Delete this photo?',
      confirmLabel: 'Delete',
      isDestructive: true,
      icon: LucideIcons.trash2,
    );

    if (confirm == true) {
      try {
        await Supabase.instance.client
            .from('case_photos')
            .delete()
            .eq('id', photoId);
        _fetchPhotos();
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Delete failed: $e')));
      }
    }
  }

  void _openPhotoViewer(
    BuildContext context, {
    String? imageUrl,
    File? imageFile,
    required String title,
  }) {
    if (imageUrl == null && imageFile == null) return;
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => Scaffold(
          backgroundColor: Colors.black,
          appBar: AppBar(
            backgroundColor: Colors.black,
            iconTheme: IconThemeData(color: Colors.white),
            title: Text(
              title,
              style: TextStyle(color: Colors.white, fontSize: 16),
            ),
          ),
          body: Center(
            child: InteractiveViewer(
              panEnabled: true,
              minScale: 0.5,
              maxScale: 5.0,
              child: imageFile != null
                  ? Image.file(imageFile, fit: BoxFit.contain)
                  : Image.network(
                      imageUrl!,
                      fit: BoxFit.contain,
                      loadingBuilder: (context, child, loadingProgress) {
                        if (loadingProgress == null) return child;
                        return Center(
                          child: CircularProgressIndicator(color: Colors.white),
                        );
                      },
                      errorBuilder: (context, error, stackTrace) => Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              LucideIcons.imageOff,
                              color: Colors.white54,
                              size: 48,
                            ),
                            SizedBox(height: 12),
                            Text(
                              'Failed to load photo',
                              style: TextStyle(color: Colors.white54),
                            ),
                          ],
                        ),
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Photos')),
      body: _loading
          ? Center(child: CircularProgressIndicator())
          : CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          'Upload property photos. The Geo Cam will automatically stamp GPS, Compass Direction, and Location.',
                          style: TextStyle(
                            color: Theme.of(
                              context,
                            ).colorScheme.onSurfaceVariant,
                            height: 1.5,
                          ),
                        ),
                        SizedBox(height: 24),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: _uploading
                                    ? null
                                    : _handleCaptureGeoCam,
                                icon: _uploading
                                    ? SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: CircularProgressIndicator(
                                          color: Colors.white,
                                          strokeWidth: 2,
                                        ),
                                      )
                                    : Icon(LucideIcons.camera, size: 20),
                                label: Text('Geo Cam'),
                                style: ElevatedButton.styleFrom(
                                  padding: EdgeInsets.symmetric(vertical: 16),
                                ),
                              ),
                            ),
                            SizedBox(width: 12),
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: _uploading
                                    ? null
                                    : _handleUploadFromGallery,
                                icon: Icon(LucideIcons.image, size: 20),
                                label: Text('Gallery'),
                                style: OutlinedButton.styleFrom(
                                  padding: EdgeInsets.symmetric(vertical: 16),
                                ),
                              ),
                            ),
                          ],
                        ),
                        // Upload progress indicator
                        if (_uploading) ...[
                          SizedBox(height: 16),
                          Container(
                            padding: EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Theme.of(
                                context,
                              ).colorScheme.primary.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: Theme.of(
                                  context,
                                ).colorScheme.primary.withOpacity(0.2),
                              ),
                            ),
                            child: Column(
                              children: [
                                Row(
                                  children: [
                                    SizedBox(
                                      width: 16,
                                      height: 16,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Theme.of(
                                          context,
                                        ).colorScheme.primary,
                                      ),
                                    ),
                                    SizedBox(width: 10),
                                    Text(
                                      _uploadProgress >= 1.0
                                          ? 'Saving to database...'
                                          : 'Compressing & uploading photo...',
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: Theme.of(
                                          context,
                                        ).colorScheme.onSurface,
                                      ),
                                    ),
                                  ],
                                ),
                                SizedBox(height: 8),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(6),
                                  child: LinearProgressIndicator(
                                    value: _uploadProgress >= 1.0
                                        ? null
                                        : _uploadProgress,
                                    backgroundColor: Theme.of(
                                      context,
                                    ).colorScheme.surfaceContainerHighest,
                                    color: Theme.of(
                                      context,
                                    ).colorScheme.primary,
                                    minHeight: 6,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                SliverPadding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  sliver: _photos.isEmpty
                      ? SliverToBoxAdapter(
                          child: Padding(
                            padding: EdgeInsets.symmetric(vertical: 40),
                            child: Center(
                              child: Text(
                                'No photos uploaded yet.',
                                style: TextStyle(
                                  color: Theme.of(
                                    context,
                                  ).colorScheme.onSurfaceVariant,
                                ),
                              ),
                            ),
                          ),
                        )
                      : SliverGrid(
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 12,
                                childAspectRatio: 0.8,
                              ),
                          delegate: SliverChildBuilderDelegate((
                            context,
                            index,
                          ) {
                            final photo = _photos[index];
                            final imageUrl =
                                photo['file_url'] ?? photo['original_file_url'];

                            return GestureDetector(
                              behavior: HitTestBehavior.opaque,
                              onTap: () {
                                if (imageUrl != null) {
                                  _openPhotoViewer(
                                    context,
                                    imageUrl: imageUrl,
                                    title: (photo['photo_type'] ?? 'Photo')
                                        .toString(),
                                  );
                                }
                              },
                              child: Card(
                                clipBehavior: Clip.antiAlias,
                                margin: EdgeInsets.zero,
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.stretch,
                                  children: [
                                    Expanded(
                                      child: imageUrl != null
                                          ? Stack(
                                              fit: StackFit.expand,
                                              children: [
                                                Image.network(
                                                  imageUrl,
                                                  fit: BoxFit.cover,
                                                ),
                                                Positioned(
                                                  top: 6,
                                                  right: 6,
                                                  child: Container(
                                                    padding: EdgeInsets.all(4),
                                                    decoration: BoxDecoration(
                                                      color: Colors.black54,
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                            6,
                                                          ),
                                                    ),
                                                    child: Icon(
                                                      LucideIcons.maximize2,
                                                      color: Colors.white,
                                                      size: 12,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            )
                                          : Container(
                                              color: Theme.of(context)
                                                  .colorScheme
                                                  .surfaceContainerHighest,
                                            ),
                                    ),
                                    Padding(
                                      padding: EdgeInsets.all(8.0),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Text(
                                              (photo['photo_type'] ?? '')
                                                  .toString(),
                                              style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          InkWell(
                                            onTap: () =>
                                                _handleDelete(photo['id']),
                                            child: Icon(
                                              LucideIcons.trash2,
                                              color: AppColors.error,
                                              size: 16,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }, childCount: _photos.length),
                        ),
                ),
              ],
            ),
    );
  }
}
