import 'package:supabase_flutter/supabase_flutter.dart';

class CaseWorkflow {
  static SupabaseClient get _client => Supabase.instance.client;

  static Future<Map<String, dynamic>> save(
    String caseId,
    Map<String, dynamic> data,
    int revision, {
    bool submit = false,
  }) async {
    try {
      final result = await _client.rpc(
        'save_case_data',
        params: {
          'p_case_id': caseId,
          'p_data': data,
          'p_expected_revision': revision,
          'p_submit': submit,
        },
      );
      return Map<String, dynamic>.from(result as Map);
    } on PostgrestException catch (error) {
      if (error.code == '409' || error.code == '40001') {
        throw StateError('This case changed. Reload it before saving.');
      }
      rethrow;
    }
  }

  static Future<void> submit(String caseId, int revision) async {
    await _client.rpc(
      'transition_case',
      params: {
        'p_case_id': caseId,
        'p_status': 'field_visit_done',
        'p_expected_revision': revision,
      },
    );
  }
}
