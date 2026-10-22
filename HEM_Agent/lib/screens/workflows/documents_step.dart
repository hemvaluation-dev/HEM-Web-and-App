import '../../core/case_files.dart';
import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:pdfx/pdfx.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:image/image.dart' as img;
import '../../../theme/app_theme.dart';
import '../../widgets/hem_confirm_dialog.dart';

class DocumentsStep extends StatefulWidget {
  final String caseId;
  const DocumentsStep({super.key, required this.caseId});

  @override
  State<DocumentsStep> createState() => _DocumentsStepState();
}

class _DocumentsStepState extends State<DocumentsStep> {
  List<dynamic> _documents = [];
  bool _loading = true;
  bool _uploading = false;
  double _uploadProgress = 0.0;

  @override
  void initState() {
    super.initState();
    _fetchDocuments();
  }

  Future<void> _fetchDocuments() async {
    try {
      final res = await Supabase.instance.client
          .from('case_documents')
          .select('*')
          .eq('case_id', widget.caseId)
          .neq('document_type', 'Video Recording')
          .neq('document_type', 'Audio Recording')
          .order('created_at', ascending: false);
      final signedFiles = await CaseFiles.sign(res, 'documents');
      if (mounted) {
        setState(() {
          _documents = signedFiles;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to load documents: $e')));
      }
    }
  }

  void _showUploadOptions() {
    showModalBottomSheet(
      context: context,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: EdgeInsets.only(bottom: 12),
                child: Text(
                  'Select Document Source',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
              ListTile(
                leading: Icon(
                  LucideIcons.camera,
                  color: Theme.of(context).colorScheme.primary,
                ),
                title: Text('Take Photo of Document'),
                subtitle: Text('Use camera to scan physical paper or receipt'),
                onTap: () {
                  Navigator.pop(context);
                  _pickFromCameraOrGallery(ImageSource.camera);
                },
              ),
              ListTile(
                leading: Icon(LucideIcons.image, color: AppColors.secondary),
                title: Text('Choose from Photo Gallery'),
                subtitle: Text('Select a saved photo or screenshot'),
                onTap: () {
                  Navigator.pop(context);
                  _pickFromCameraOrGallery(ImageSource.gallery);
                },
              ),
              ListTile(
                leading: Icon(
                  LucideIcons.folder,
                  color: AppColors.warningFor(context),
                ),
                title: Text('Browse Files & PDFs'),
                subtitle: Text('Select PDF, DOC, or file from device storage'),
                onTap: () {
                  Navigator.pop(context);
                  _pickFromFileSystem();
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _pickFromCameraOrGallery(ImageSource source) async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: source,
        imageQuality: 80,
        maxWidth: 1920,
        maxHeight: 1920,
      );
      if (image != null) {
        await _processAndUploadFile(File(image.path), image.name);
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Failed to pick image: $e')));
    }
  }

  Future<void> _pickFromFileSystem() async {
    try {
      // Using FileType.any without data loading prevents native OS indexing lag and slow caching
      final result = await FilePicker.platform.pickFiles(
        type: FileType.any,
        withData: false,
        allowCompression: true,
      );

      if (result != null && result.files.single.path != null) {
        final file = result.files.single;
        await _processAndUploadFile(File(file.path!), file.name);
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Failed to pick file: $e')));
    }
  }

  Future<void> _processAndUploadFile(File file, String fileName) async {
    final confirmed = await HemConfirmDialog.show(
      context: context,
      title: 'Upload Document',
      message: 'Confirm upload of "$fileName" to this case dossier?',
      confirmLabel: 'Upload File',
      icon: LucideIcons.uploadCloud,
    );
    if (confirmed != true) return;

    setState(() {
      _uploading = true;
      _uploadProgress = 0.0;
    });
    try {
      final supabase = Supabase.instance.client;

      // Compress image files if they exceed 5MB
      File uploadFile = file;
      final fileSize = await file.length();
      const int maxSizeBytes = 5 * 1024 * 1024; // 5MB
      const int maxDocumentBytes = 18 * 1024 * 1024;
      final isImage =
          fileName.toLowerCase().endsWith('.jpg') ||
          fileName.toLowerCase().endsWith('.jpeg') ||
          fileName.toLowerCase().endsWith('.png') ||
          fileName.toLowerCase().endsWith('.webp');

      if (isImage && fileSize > maxSizeBytes) {
        debugPrint(
          'Document image is ${(fileSize / 1024 / 1024).toStringAsFixed(2)} MB, compressing...',
        );
        final bytes = await file.readAsBytes();
        final decoded = img.decodeImage(bytes);
        if (decoded != null) {
          int quality = 80;
          Uint8List compressed = Uint8List.fromList(
            img.encodeJpg(decoded, quality: quality),
          );
          while (compressed.length > maxSizeBytes && quality > 30) {
            quality -= 10;
            compressed = Uint8List.fromList(
              img.encodeJpg(decoded, quality: quality),
            );
          }
          uploadFile = File(
            '${file.parent.path}/doc_compressed_${DateTime.now().millisecondsSinceEpoch}.jpg',
          );
          await uploadFile.writeAsBytes(compressed);
          debugPrint(
            'Compressed to ${(compressed.length / 1024 / 1024).toStringAsFixed(2)} MB',
          );
        }
      }
      if (await uploadFile.length() > maxDocumentBytes) {
        throw const FormatException('Choose a document smaller than 18 MB.');
      }

      // Sanitize the stored filename so case documents have stable URLs.
      final storedFileName = uploadFile == file
          ? fileName
          : fileName.replaceFirst(RegExp(r'\.[^.]+$'), '.jpg');
      final cleanFileName = storedFileName.replaceAll(
        RegExp(r'[^a-zA-Z0-9._-]'),
        '_',
      );
      final storageName =
          '${widget.caseId}/${DateTime.now().millisecondsSinceEpoch}_$cleanFileName';
      await supabase.storage.from('documents').upload(storageName, uploadFile);

      if (mounted) setState(() => _uploadProgress = 1.0);

      final fileUrl = supabase.storage
          .from('documents')
          .getPublicUrl(storageName);

      // Insert DB record
      try {
        await supabase.from('case_documents').insert({
          'case_id': widget.caseId,
          'file_url': fileUrl,
          'file_name': fileName,
          'document_type': fileName,
        });
      } catch (_) {
        try {
          await supabase.storage.from('documents').remove([storageName]);
        } catch (cleanupError) {
          debugPrint('Could not clean up failed document upload: $cleanupError');
        }
        rethrow;
      }

      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Document uploaded successfully')));
      await _fetchDocuments();
    } catch (e) {
      if (!mounted) return;
      debugPrint('Failed to upload document: $e');
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Upload failed: $e')));
    } finally {
      if (mounted)
        setState(() {
          _uploading = false;
          _uploadProgress = 0.0;
        });
    }
  }

  Future<void> _handleDelete(String docId) async {
    if (!mounted) return;
    final confirm = await HemConfirmDialog.show(
      context: context,
      title: 'Delete Document',
      message:
          'Are you sure you want to delete this document permanently from the case dossier?',
      confirmLabel: 'Delete Permanently',
      isDestructive: true,
      icon: LucideIcons.trash2,
    );

    if (confirm == true) {
      try {
        await Supabase.instance.client
            .from('case_documents')
            .delete()
            .eq('id', docId);
        _fetchDocuments();
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Delete failed: $e')));
      }
    }
  }

  void _openDocumentViewer(
    BuildContext context,
    String? fileUrl,
    String title,
  ) {
    if (fileUrl == null) return;
    final isPdf = fileUrl.toLowerCase().contains('.pdf');

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
            child: isPdf
                ? FutureBuilder<Uint8List>(
                    future: () async {
                      final response = await HttpClient().getUrl(
                        Uri.parse(fileUrl),
                      );
                      final httpResponse = await response.close();
                      final bytes = await httpResponse.fold<List<int>>(
                        <int>[],
                        (buffer, data) => buffer..addAll(data),
                      );
                      return Uint8List.fromList(bytes);
                    }(),
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return Center(
                          child: CircularProgressIndicator(color: Colors.white),
                        );
                      }
                      if (snapshot.hasError || !snapshot.hasData) {
                        return Center(
                          child: Text(
                            'Failed to load PDF document',
                            style: TextStyle(color: Colors.white54),
                          ),
                        );
                      }
                      return _PdfViewerWidget(data: snapshot.data!);
                    },
                  )
                : InteractiveViewer(
                    panEnabled: true,
                    minScale: 0.5,
                    maxScale: 5.0,
                    child: Image.network(
                      fileUrl,
                      fit: BoxFit.contain,
                      loadingBuilder: (context, child, loadingProgress) {
                        if (loadingProgress == null) return child;
                        return Center(
                          child: CircularProgressIndicator(color: Colors.white),
                        );
                      },
                      errorBuilder: (context, error, stackTrace) => Center(
                        child: Text(
                          'Failed to load document image',
                          style: TextStyle(color: Colors.white54),
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
      appBar: AppBar(title: Text('Documents')),
      body: _loading
          ? Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: EdgeInsets.all(16),
              itemCount: _documents.length + 1, // +1 for header
              itemBuilder: (context, index) {
                if (index == 0) {
                  return _buildHeader();
                }

                final doc = _documents[index - 1];

                return Card(
                  clipBehavior: Clip.antiAlias,
                  child: InkWell(
                    onTap: doc['file_url'] != null
                        ? () => _openDocumentViewer(
                            context,
                            doc['file_url'],
                            (doc['file_name'] ??
                                    doc['document_type'] ??
                                    'Document')
                                .toString(),
                          )
                        : null,
                    child: Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(
                                LucideIcons.fileText,
                                color: Theme.of(context).colorScheme.primary,
                                size: 32,
                              ),
                              SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      (doc['file_name'] ??
                                              doc['document_type'] ??
                                              'Document')
                                          .toString(),
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      DateTime.parse(
                                        doc['created_at'] ??
                                            doc['uploaded_at'] ??
                                            DateTime.now().toIso8601String(),
                                      ).toLocal().toString().split(' ')[0],
                                      style: TextStyle(
                                        color: Theme.of(
                                          context,
                                        ).colorScheme.onSurfaceVariant,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: Icon(
                                  LucideIcons.trash2,
                                  color: AppColors.error,
                                  size: 20,
                                ),
                                onPressed: () => _handleDelete(doc['id']),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: EdgeInsets.only(bottom: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Upload ownership documents, tax receipts, and other legal papers for this property.',
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
              height: 1.5,
            ),
          ),
          SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _uploading ? null : _showUploadOptions,
            icon: _uploading
                ? SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  )
                : Icon(LucideIcons.uploadCloud, size: 20),
            label: Text('Upload New Document'),
            style: ElevatedButton.styleFrom(
              padding: EdgeInsets.symmetric(vertical: 16),
            ),
          ),
          // Upload progress indicator
          if (_uploading) ...[
            SizedBox(height: 16),
            Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary.withOpacity(0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.2),
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
                          color: Theme.of(context).colorScheme.primary,
                        ),
                      ),
                      SizedBox(width: 10),
                      Text(
                        _uploadProgress >= 1.0
                            ? 'Saving to database...'
                            : 'Compressing & uploading...',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Theme.of(context).colorScheme.onSurface,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: _uploadProgress >= 1.0 ? null : _uploadProgress,
                      backgroundColor: Theme.of(context).colorScheme.surfaceContainerHighest,
                      color: Theme.of(context).colorScheme.primary,
                      minHeight: 6,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _PdfViewerWidget extends StatefulWidget {
  final Uint8List data;
  const _PdfViewerWidget({required this.data});

  @override
  State<_PdfViewerWidget> createState() => _PdfViewerWidgetState();
}

class _PdfViewerWidgetState extends State<_PdfViewerWidget> {
  late PdfController _pdfController;

  @override
  void initState() {
    super.initState();
    _pdfController = PdfController(document: PdfDocument.openData(widget.data));
  }

  @override
  void dispose() {
    _pdfController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PdfView(controller: _pdfController);
  }
}
