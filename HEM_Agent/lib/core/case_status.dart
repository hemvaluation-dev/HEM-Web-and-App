class CaseStatus {
  static String normalize(String? value) {
    final status = (value ?? 'new').toLowerCase();
    const aliases = {
      'created': 'new',
      'draft': 'new',
      'delivered': 'completed',
      'approved': 'completed',
      'location_captured': 'in_progress',
      'photos_uploaded': 'in_progress',
      'data_drafted': 'in_progress',
      'documents_uploaded': 'in_progress',
      'document_uploaded': 'in_progress',
      'document_processing': 'in_progress',
      'submitted': 'field_visit_done',
      'site_inspected': 'field_visit_done',
      'site_inspection_completed': 'field_visit_done',
      'pending_review': 'in_review',
      'under_review': 'in_review',
    };
    return aliases[status] ?? status;
  }

  static bool isCompleted(String? value) => normalize(value) == 'completed';
  static bool isLocked(String? value) => [
    'field_visit_done',
    'report_drafted',
    'in_review',
    'reviewed',
    'completed',
  ].contains(normalize(value));
  static String label(String? value) =>
      const {
        'new': 'New',
        'assigned': 'Assigned',
        'in_progress': 'Inspection',
        'field_visit_done': 'Field submitted',
        'report_drafted': 'Report drafted',
        'in_review': 'In review',
        'reviewed': 'Reviewed',
        'completed': 'Completed',
      }[normalize(value)] ??
      normalize(value).replaceAll('_', ' ');
}
