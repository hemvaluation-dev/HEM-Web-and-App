import 'package:flutter_test/flutter_test.dart';
import 'package:hem_agent/core/assignment_notifications.dart';

void main() {
  test('assignment routes accept only a typed UUID case identifier', () {
    const id = '5d2508c9-a603-4d87-8069-9ba846720f99';
    expect(assignmentCaseId({'type': 'case_assigned', 'case_id': id}), id);
    for (final data in <Map<String, dynamic>>[
      {},
      {'type': 'other', 'case_id': id},
      {'type': 'case_assigned', 'case_id': '/admin'},
      {'type': 'case_assigned', 'case_id': 42},
      {'type': 'case_assigned', 'case_id': '$id/../profile'},
    ]) {
      expect(assignmentCaseId(data), isNull);
    }
  });
  test('unconfigured notifications do not prevent login or logout', () async {
    final service = AssignmentNotifications.instance;
    expect(service.available, isFalse);
    await service.signedIn();
    await service.signedOut();
    expect(service.available, isFalse);
  });
}
