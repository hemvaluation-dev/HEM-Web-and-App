import '../../../core/field_requirements.dart';
import '../../core/case_workflow.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../theme/app_theme.dart';
import '../../widgets/hem_loader.dart';
import '../../widgets/hem_confirm_dialog.dart';
import '../../core/case_status.dart';

class CaseDetailsScreen extends StatefulWidget {
  final String caseId;
  const CaseDetailsScreen({super.key, required this.caseId});

  @override
  State<CaseDetailsScreen> createState() => _CaseDetailsScreenState();
}

class _CaseDetailsScreenState extends State<CaseDetailsScreen> {
  Map<String, dynamic>? _caseData;
  bool _loading = true;
  bool _isLocCompleted = false;
  bool _isDocCompleted = false;
  bool _isPhotoCompleted = false;
  bool _isReviewCompleted = false;
  bool _isMediaCompleted = false;

  @override
  void initState() {
    super.initState();
    _fetchCaseDetails();
  }

  Future<void> _fetchCaseDetails() async {
    try {
      final client = Supabase.instance.client;
      final results = await Future.wait([
        client
            .from('cases')
            .select('*, client:client_id(template_name)')
            .eq('id', widget.caseId)
            .single(),
        client
            .from('case_location')
            .select('id')
            .eq('case_id', widget.caseId)
            .limit(1),
        client
            .from('case_documents')
            .select('id')
            .eq('case_id', widget.caseId)
            .limit(1),
        client
            .from('case_photos')
            .select('id')
            .eq('case_id', widget.caseId)
            .limit(1),
        client
            .from('case_documents')
            .select('id')
            .eq('case_id', widget.caseId)
            .inFilter('document_type', ['Video Recording', 'Audio Recording'])
            .limit(1),
      ]);
      final res = results[0] as Map<String, dynamic>;
      final locRes = results[1] as List;
      final docRes = results[2] as List;
      final photoRes = results[3] as List;
      final mediaRes = results[4] as List;

      if (!mounted) return;
      setState(() {
        _caseData = res;
        _isLocCompleted = locRes.isNotEmpty;
        _isDocCompleted = docRes.isNotEmpty;
        _isPhotoCompleted = photoRes.isNotEmpty;
        _isMediaCompleted = mediaRes.isNotEmpty;

        bool allReviewFieldsFilled = false;
        if (res['extracted_data'] != null && res['extracted_data'] is Map) {
          final data = res['extracted_data'] as Map;
          allReviewFieldsFilled = true;
          allReviewFieldsFilled = FieldRequirements.forTemplate(
            res['client']?['template_name'] ?? '',
          ).every((field) => FieldRequirements.filled(field['key']!, data));
        }
        _isReviewCompleted = allReviewFieldsFilled;

        _loading = false;
      });
    } catch (e) {
      debugPrint('Failed to fetch case details: $e');
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _handleSubmit() async {
    final confirmed = await HemConfirmDialog.show(
      context: context,
      title: 'Submit Case Report',
      message:
          'Are you sure you want to finalize and submit this case report? Once submitted, the dossier will be locked for editing.',
      confirmLabel: 'Submit Dossier',
      icon: LucideIcons.send,
    );
    if (confirmed != true) return;

    try {
      await CaseWorkflow.submit(
        widget.caseId,
        (_caseData?['revision'] as num?)?.toInt() ?? 0,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Case submitted successfully')));
      if (context.canPop()) {
        context.pop();
      } else {
        context.go('/cases');
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Failed to submit case: $e')));
    }
  }

  String _getDynamicStatusLabel() {
    final rawStatus = (_caseData!['status'] ?? '').toString().toLowerCase();

    if (rawStatus == 'in_progress') {
      if (!_isLocCompleted && !_isDocCompleted && !_isPhotoCompleted) {
        return 'IN PROGRESS';
      }

      final parts = <String>[];
      if (_isLocCompleted) parts.add('Location');
      if (_isDocCompleted) parts.add('Document');
      if (_isPhotoCompleted) parts.add('Photo');

      return '${parts.join(' + ')} Done'.toUpperCase();
    }

    return rawStatus.toUpperCase().replaceAll('_', ' ');
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        body: Center(
          child: HemLoader(size: 60, text: 'Loading case details...'),
        ),
      );
    }

    if (_caseData == null) {
      return Scaffold(
        appBar: AppBar(title: Text('Error')),
        body: Center(child: Text('Case not found')),
      );
    }

    final st = (_caseData!['status'] ?? '').toString().toLowerCase();
    final isLocked = CaseStatus.isLocked(st);
    final isCompleted = CaseStatus.isCompleted(st);
    final allCompleted =
        _isLocCompleted && _isDocCompleted && _isPhotoCompleted;

    return Scaffold(
      appBar: AppBar(
        title: Text(_caseData!['application_number'] ?? 'Case Details'),
        leading: IconButton(
          icon: Icon(LucideIcons.arrowLeft),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/cases');
            }
          },
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _fetchCaseDetails,
        child: SingleChildScrollView(
          physics: AlwaysScrollableScrollPhysics(),
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (isLocked) ...[
                Container(
                  padding: EdgeInsets.all(16),
                  margin: EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: AppColors.successFor(context).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.successFor(context)),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        LucideIcons.checkCircle2,
                        color: AppColors.successFor(context),
                        size: 28,
                      ),
                      SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isCompleted
                                  ? 'Case Evaluation Completed'
                                  : 'Case Submitted for Review',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: AppColors.successFor(context),
                                fontSize: 16,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              isCompleted
                                  ? 'All verification workflows and reviews have been finalized.'
                                  : 'The field dossier is with central operations for review. Editing is locked until the review is complete.',
                              style: TextStyle(
                                color: Theme.of(context).colorScheme.onSurface,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              Card(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Applicant Details',
                        style: Theme.of(context).textTheme.headlineMedium,
                      ),
                      SizedBox(height: 16),
                      _buildInfoRow('Name', _caseData!['applicant_name']),
                      if (_caseData!['application_number'] != null &&
                          _caseData!['application_number']
                              .toString()
                              .isNotEmpty)
                        _buildInfoRow(
                          'App No',
                          _caseData!['application_number'],
                        ),
                      _buildInfoRow('Phone', _caseData!['phone_number']),
                      _buildInfoRow(
                        'Property',
                        _caseData!['property_type'] ?? 'Pending',
                      ),
                      if (_caseData!['case_type'] != null &&
                          _caseData!['case_type'].toString().isNotEmpty)
                        _buildInfoRow('Case Type', _caseData!['case_type']),
                      _buildInfoRow('Address', _caseData!['address']),
                      if (_caseData!['branch'] != null &&
                          _caseData!['branch'].toString().isNotEmpty)
                        _buildInfoRow('Branch', _caseData!['branch']),
                      if (_caseData!['state'] != null &&
                          _caseData!['state'].toString().isNotEmpty)
                        _buildInfoRow('State', _caseData!['state']),
                      if (_caseData!['deadline_date'] != null)
                        _buildInfoRow(
                          'Initiation Date',
                          DateTime.tryParse(_caseData!['deadline_date']) != null
                              ? "${DateTime.parse(_caseData!['deadline_date']).toLocal().day.toString().padLeft(2, '0')}/${DateTime.parse(_caseData!['deadline_date']).toLocal().month.toString().padLeft(2, '0')}/${DateTime.parse(_caseData!['deadline_date']).toLocal().year} ${DateTime.parse(_caseData!['deadline_date']).toLocal().hour.toString().padLeft(2, '0')}:${DateTime.parse(_caseData!['deadline_date']).toLocal().minute.toString().padLeft(2, '0')}"
                              : _caseData!['deadline_date'],
                        ),
                      if (_caseData!['extracted_data'] != null &&
                          _caseData!['extracted_data']['submitted_at'] != null)
                        _buildInfoRow(
                          'Submitted Date',
                          DateTime.tryParse(
                                    _caseData!['extracted_data']['submitted_at'],
                                  ) !=
                                  null
                              ? "${DateTime.parse(_caseData!['extracted_data']['submitted_at']).toLocal().day.toString().padLeft(2, '0')}/${DateTime.parse(_caseData!['extracted_data']['submitted_at']).toLocal().month.toString().padLeft(2, '0')}/${DateTime.parse(_caseData!['extracted_data']['submitted_at']).toLocal().year} ${DateTime.parse(_caseData!['extracted_data']['submitted_at']).toLocal().hour.toString().padLeft(2, '0')}:${DateTime.parse(_caseData!['extracted_data']['submitted_at']).toLocal().minute.toString().padLeft(2, '0')}"
                              : _caseData!['extracted_data']['submitted_at'],
                        ),
                      _buildInfoRow('Status', _getDynamicStatusLabel()),
                    ],
                  ),
                ),
              ),
              SizedBox(height: 24),
              Text(
                'Workflow Steps',
                style: Theme.of(context).textTheme.displaySmall,
              ),
              SizedBox(height: 16),

              _buildWorkflowCard(
                context,
                title: 'Property Location and Type',
                description: 'Capture GPS coordinates and verify address',
                icon: LucideIcons.mapPin,
                route: 'location',
                isCompleted: _isLocCompleted,
              ),
              _buildWorkflowCard(
                context,
                title: 'Documents',
                description: 'Upload property documents for this property',
                icon: LucideIcons.fileText,
                route: 'documents',
                isCompleted: _isDocCompleted,
              ),
              _buildWorkflowCard(
                context,
                title: 'Photos',
                description: 'Capture watermarked property photos',
                icon: LucideIcons.camera,
                route: 'photos',
                isCompleted: _isPhotoCompleted,
              ),
              _buildWorkflowCard(
                context,
                title: 'Data Review',
                description:
                    'Review property data; unfilled fields are allowed',
                icon: LucideIcons.bot,
                route: 'review',
                isCompleted: _isReviewCompleted,
              ),
              _buildWorkflowCard(
                context,
                title: 'Media Recordings',
                description: 'Record optional video and voice notes',
                icon: LucideIcons.video,
                route: 'media',
                isCompleted: _isMediaCompleted,
              ),

              SizedBox(height: 32),
              if (!isLocked)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (!allCompleted)
                      Padding(
                        padding: EdgeInsets.only(bottom: 12.0),
                        child: Text(
                          'Add GPS location, a property document and a photo to unlock submission. Data Review fields may remain blank.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Theme.of(
                              context,
                            ).colorScheme.onSurfaceVariant,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ElevatedButton(
                      onPressed: allCompleted ? _handleSubmit : null,
                      style: ElevatedButton.styleFrom(
                        padding: EdgeInsets.symmetric(vertical: 16),
                        backgroundColor: allCompleted
                            ? AppColors.success
                            : Colors.grey,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            LucideIcons.checkCircle,
                            color: allCompleted ? Colors.white : Colors.white70,
                          ),
                          SizedBox(width: 8),
                          Text(
                            'Submit Case',
                            style: TextStyle(
                              color: allCompleted
                                  ? Colors.white
                                  : Colors.white70,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String? value) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: TextStyle(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value ?? '',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWorkflowCard(
    BuildContext context, {
    required String title,
    required String description,
    required IconData icon,
    required String route,
    required bool isCompleted,
  }) {
    final locked = CaseStatus.isLocked(_caseData?['status']?.toString());
    return Card(
      margin: EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () async {
          if (locked) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  'This case is locked while central operations review it.',
                ),
              ),
            );
            return;
          }
          await context.push('/cases/${widget.caseId}/$route');
          _fetchCaseDetails(); // Refresh after returning
        },
        child: Padding(
          padding: EdgeInsets.all(16.0),
          child: Row(
            children: [
              Container(
                padding: EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: locked
                      ? Theme.of(
                          context,
                        ).colorScheme.surfaceContainerLow.withValues(alpha: 0.7)
                      : isCompleted
                      ? AppColors.success.withValues(alpha: 0.1)
                      : AppColors.primary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon,
                  color: locked
                      ? Theme.of(context).colorScheme.onSurfaceVariant
                      : isCompleted
                      ? AppColors.success
                      : AppColors.primaryLight,
                ),
              ),
              SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).colorScheme.onSurface,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      description,
                      style: TextStyle(
                        fontSize: 12,
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              if (isCompleted)
                Icon(
                  LucideIcons.checkCircle2,
                  color: AppColors.successFor(context),
                  size: 24,
                )
              else
                Icon(
                  LucideIcons.chevronRight,
                  color: Theme.of(context).colorScheme.outline,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
