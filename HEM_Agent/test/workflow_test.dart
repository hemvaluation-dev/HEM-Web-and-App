import 'package:flutter_test/flutter_test.dart';
import 'package:hem_agent/core/case_status.dart';
import 'package:hem_agent/core/field_requirements.dart';

void main() {
  test('legacy Veritas institution names retain lender requirements', () {
    for (final name in [
      'VERITAS',
      'veritas_template',
      'VERITAS-HL',
      'veritas_eel_template',
    ]) {
      expect(FieldRequirements.isVeritas(name), true);
      expect(
        FieldRequirements.forTemplate(name).length,
        FieldRequirements.forTemplate('veritas').length,
      );
    }
    expect(FieldRequirements.isVeritas('kreditbee_template'), false);
    expect(FieldRequirements.isVeritas('unknown'), false);
  });
  test('submitted inspections are locked but not completed reports', () {
    for (final status in ['submitted', 'field_visit_done', 'site_inspected']) {
      expect(CaseStatus.isLocked(status), true);
      expect(CaseStatus.isCompleted(status), false);
      expect(CaseStatus.label(status), 'Field submitted');
    }
    expect(CaseStatus.isCompleted('delivered'), true);
    expect(CaseStatus.isLocked('data_drafted'), false);
  });
  test(
    'floor completion requires every measurement, and supports zero floors',
    () {
      expect(
        FieldRequirements.filled('floor_wise_area', {'no_of_floors': '0'}),
        true,
      );
      expect(
        FieldRequirements.filled('floor_wise_area', {
          'no_of_floors': '1',
          'floor_wise_area': [],
        }),
        false,
      );
      final data = {
        'no_of_floors': '1',
        'floor_wise_area': [
          {'floor': 'Ground', 'plinthArea': '900', 'slabArea': ''},
        ],
      };
      expect(FieldRequirements.filled('floor_wise_area', data), false);
      (data['floor_wise_area'] as List)[0]['slabArea'] = '900';
      expect(FieldRequirements.filled('floor_wise_area', data), true);
      expect(FieldRequirements.filled('land_rate', {'land_rate': 0}), true);
    },
  );
  test('Veritas-specific requirements depend on template ID', () {
    expect(
      FieldRequirements.forTemplate('veritas').length,
      FieldRequirements.mandatoryFields.length +
          FieldRequirements.veritasFields.length,
    );
    expect(
      FieldRequirements.forTemplate('axis_finance').length,
      FieldRequirements.mandatoryFields.length,
    );
  });
}
