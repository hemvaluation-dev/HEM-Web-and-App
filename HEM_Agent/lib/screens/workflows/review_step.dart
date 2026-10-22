import '../../../core/field_requirements.dart';
import '../../core/case_workflow.dart';
import '../../core/measurements.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../widgets/hem_confirm_dialog.dart';

class ReviewStep extends StatefulWidget {
  final String caseId;
  const ReviewStep({super.key, required this.caseId});

  // Review completeness indicators; these fields do not block field submission.
  static const mandatoryFields = FieldRequirements.mandatoryFields;
  static const veritasFields = FieldRequirements.veritasFields;
  static const yesNoFields = FieldRequirements.yesNoFields;

  @override
  State<ReviewStep> createState() => _ReviewStepState();
}

class _ReviewStepState extends State<ReviewStep> {
  bool _loading = true;
  bool _loadFailed = false;
  Map<String, dynamic> _reviewData = {};
  Map<String, bool> _mandatoryStatus = {};
  int _mandatoryFilled = 0;
  int _mandatoryTotal = 0;
  String _template = '';

  bool get _isVeritas => FieldRequirements.isVeritas(_template);

  List<Map<String, String>> get _currentMandatoryFields {
    if (_isVeritas) {
      return [...ReviewStep.mandatoryFields, ...ReviewStep.veritasFields];
    }
    return ReviewStep.mandatoryFields;
  }

  int _revision = 0;
  final _formKey = GlobalKey<FormState>();
  final Map<String, TextEditingController> _controllers = {};

  TextEditingController _getController(String key) {
    if (!_controllers.containsKey(key)) {
      _controllers[key] = TextEditingController(
        text: _reviewData[key]?.toString() ?? '',
      );
    }
    return _controllers[key]!;
  }

  @override
  void dispose() {
    for (var c in _controllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  void _recalculateAreas() {
    _reviewData = Measurements.calculate(_reviewData);
    for (final g in Measurements.groups) {
      _getController(g['area']!).text = (_reviewData[g['area']] ?? '')
          .toString();
      _getController(g['amount']!).text = (_reviewData[g['amount']] ?? '')
          .toString();
    }
    _getController('total_value').text = (_reviewData['total_value'] ?? '')
        .toString();
  }

  List<Widget> _valuationControls() => [
    const Text(
      'All side measurements are in feet. Areas use average opposite sides; irregular plots need survey review.',
    ),
    for (final g in Measurements.groups) ...[
      for (final key in [g['area']!, g['rate']!])
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: DropdownButtonFormField<String>(
            key: ValueKey('$key:${_reviewData['${key}_unit']}'),
            initialValue: Measurements.unit(
              _reviewData['${key}_unit'],
              key == 'construction_rate' || key == 'slab_rate'
                  ? 'sqft'
                  : 'sqyd',
            ),
            decoration: InputDecoration(
              labelText:
                  "${g['label']} ${key == g['rate'] ? 'rate per' : 'area unit'}",
            ),
            items: Measurements.units.entries
                .map(
                  (e) => DropdownMenuItem(value: e.key, child: Text(e.value)),
                )
                .toList(),
            onChanged: (value) {
              if (value == null) return;
              setState(() {
                _reviewData = Measurements.changeUnit(
                  _reviewData,
                  key,
                  value,
                );
                _getController(key).text = (_reviewData[key] ?? '')
                    .toString();
                _recalculateAreas();
              });
            },
          ),
        ),
      _buildOptionalField(g['amount']!, "${g['label']} value (INR)"),
      Material(
        color: Colors.transparent,
        child: CheckboxListTile(
          contentPadding: EdgeInsets.zero,
          title: Text("Include ${g['label']} value in total"),
          value:
              (_reviewData['include_${g['prefix']}_value'] ??
                  (g['prefix'] != 'slab')) ==
              true,
          onChanged: (value) => setState(() {
            _reviewData['include_${g['prefix']}_value'] = value ?? false;
            _recalculateAreas();
          }),
        ),
      ),
    ],
  ];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  void _recalculateMandatoryStatus() {
    int filled = 0;
    Map<String, bool> status = {};
    for (final field in _currentMandatoryFields) {
      final key = field['key']!;
      final isFilled = FieldRequirements.filled(key, _reviewData);

      status[key] = isFilled;
      if (isFilled) filled++;
    }
    _mandatoryStatus = status;
    _mandatoryFilled = filled;
    _mandatoryTotal = _currentMandatoryFields.length;
  }

  Future<void> _fetchData() async {
    setState(() {
      _loading = true;
      _loadFailed = false;
    });
    try {
      final res = await Supabase.instance.client
          .from('cases')
          .select('*, client:client_id (template_name)')
          .eq('id', widget.caseId)
          .single();

      if (mounted) {
        setState(() {
          _revision = (res['revision'] as num?)?.toInt() ?? 0;
          _reviewData = Map<String, dynamic>.from(
            res['extracted_data'] ?? {},
          );
          for (final controller in _controllers.values) {
            controller.dispose();
          }
          _controllers.clear();
          _recalculateAreas();
          _template = res['client'] != null
              ? (res['client']['template_name'] ?? '')
              : '';

          // Auto-fill available case details if not already present
          if (_reviewData['branch'] == null ||
              _reviewData['branch'].toString().isEmpty) {
            _reviewData['branch'] = res['branch'];
          }
          if (_reviewData['property_address'] == null ||
              _reviewData['property_address'].toString().isEmpty) {
            _reviewData['property_address'] = res['address'];
          }

          _recalculateMandatoryStatus();
          _loading = false;
        });
      }
    } catch (e, stack) {
      debugPrint('Error fetching data: $e');
      debugPrintStack(stackTrace: stack);
      if (mounted) {
        setState(() {
          _loading = false;
          _loadFailed = true;
        });
      }
    }
  }

  Future<void> _saveData({bool showSnackbar = true}) async {
    if (_formKey.currentState != null) {
      _formKey.currentState!.save();
    }

    // Recalculate from saved dimensions and rates before persisting.
    _recalculateAreas();
    _recalculateMandatoryStatus();

    if (showSnackbar) {
      final confirm = await HemConfirmDialog.show(
        context: context,
        title: 'Save Data',
        message: 'Save your review data? Unfilled fields may remain blank.',
        confirmLabel: 'Save',
        icon: LucideIcons.save,
      );
      if (confirm != true) return;
    }

    try {
      final saved = await CaseWorkflow.save(
        widget.caseId,
        _reviewData,
        _revision,
      );
      _revision = (saved['revision'] as num).toInt();

      if (showSnackbar && mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Data saved successfully!')));
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error saving data: $e')));
      }
    }
  }

  Widget _buildFloorWiseAreaTable() {
    final key = 'floor_wise_area';
    final isMissing = _mandatoryStatus[key] != true;
    final noOfFloorsStr = _reviewData['no_of_floors']?.toString() ?? '0';
    int noOfFloors = int.tryParse(noOfFloorsStr) ?? 0;

    if (noOfFloors <= 0) return const SizedBox.shrink();

    // Ensure list is initialized and sized correctly
    List<dynamic> currentList = [];
    if (_reviewData[key] is List) {
      currentList = List<dynamic>.from(_reviewData[key]);
    }

    if (currentList.length != noOfFloors) {
      List<dynamic> newList = [];
      for (int i = 0; i < noOfFloors; i++) {
        if (i < currentList.length && currentList[i] is Map) {
          newList.add(Map<String, dynamic>.from(currentList[i]));
        } else {
          // Pre-fill floor names for convenience
          String floorName = '';
          if (i == 0)
            floorName = 'Ground Floor';
          else if (i == 1)
            floorName = 'First Floor';
          else if (i == 2)
            floorName = 'Second Floor';
          else if (i == 3)
            floorName = 'Third Floor';
          else
            floorName = 'Floor ${i + 1}';

          newList.add({'floor': floorName, 'plinthArea': '', 'slabArea': ''});
        }
      }
      // Update data without triggering full setState loop inside build
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          setState(() {
            _reviewData[key] = newList;
            _recalculateMandatoryStatus();
          });
        }
      });
      currentList = newList;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16.0),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isMissing
              ? Colors.red
              : Theme.of(context).colorScheme.outline.withOpacity(0.3),
          width: isMissing ? 2 : 1,
        ),
        color: isMissing
            ? Colors.red.withOpacity(0.02)
            : Theme.of(context).colorScheme.surface,
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Floor Wise Area (in Sqft.)',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: isMissing
                      ? Colors.red
                      : Theme.of(context).colorScheme.onSurface,
                ),
              ),
              if (isMissing)
                const Padding(
                  padding: EdgeInsets.only(left: 8.0),
                  child: Icon(
                    LucideIcons.alertTriangle,
                    color: Colors.red,
                    size: 16,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: const [
              Expanded(
                flex: 3,
                child: Text(
                  'Floor',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ),
              SizedBox(width: 8),
              Expanded(
                flex: 2,
                child: Text(
                  'Plinth',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ),
              SizedBox(width: 8),
              Expanded(
                flex: 2,
                child: Text(
                  'Slab',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ...List.generate(noOfFloors, (index) {
            final item = currentList[index] as Map<String, dynamic>;
            return Padding(
              padding: const EdgeInsets.only(bottom: 8.0),
              child: Row(
                children: [
                  Expanded(
                    flex: 3,
                    child: TextFormField(
                      initialValue: item['floor']?.toString() ?? '',
                      style: const TextStyle(fontSize: 13),
                      decoration: const InputDecoration(
                        isDense: true,
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 8,
                        ),
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (val) {
                        currentList[index]['floor'] = val;
                        _reviewData[key] = currentList;
                        setState(() {
                          _recalculateMandatoryStatus();
                        });
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    flex: 2,
                    child: TextFormField(
                      initialValue: item['plinthArea']?.toString() ?? '',
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      style: const TextStyle(fontSize: 13),
                      decoration: const InputDecoration(
                        isDense: true,
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 8,
                        ),
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (val) {
                        currentList[index]['plinthArea'] = val;
                        _reviewData[key] = currentList;
                        setState(() {
                          _recalculateMandatoryStatus();
                        });
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    flex: 2,
                    child: TextFormField(
                      initialValue: item['slabArea']?.toString() ?? '',
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      style: const TextStyle(fontSize: 13),
                      decoration: const InputDecoration(
                        isDense: true,
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 8,
                        ),
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (val) {
                        currentList[index]['slabArea'] = val;
                        _reviewData[key] = currentList;
                        setState(() {
                          _recalculateMandatoryStatus();
                        });
                      },
                    ),
                  ),
                  IconButton(
                    icon: const Icon(
                      LucideIcons.minusCircle,
                      color: Colors.red,
                      size: 18,
                    ),
                    onPressed: () {
                      setState(() {
                        int newNoOfFloors = noOfFloors - 1;
                        if (newNoOfFloors < 0) newNoOfFloors = 0;
                        _reviewData['no_of_floors'] = newNoOfFloors
                            .toString();
                        _getController('no_of_floors').text = newNoOfFloors
                            .toString();
                        currentList.removeAt(index);
                        _reviewData[key] = currentList;
                        _recalculateMandatoryStatus();
                      });
                    },
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
            );
          }),
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton.icon(
              onPressed: () {
                setState(() {
                  int newNoOfFloors = noOfFloors + 1;
                  _reviewData['no_of_floors'] = newNoOfFloors.toString();
                  _getController('no_of_floors').text = newNoOfFloors
                      .toString();
                  _recalculateMandatoryStatus();
                });
              },
              icon: const Icon(LucideIcons.plus, size: 16),
              label: const Text('Add Floor'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMandatoryField(String key, String label, {int maxLines = 1}) {
    final isMissing = _mandatoryStatus[key] != true;

    final isArea = [
      'land_area',
      'land_area_as_per_physical',
      'bua',
      'slab_area',
    ].contains(key);
    final isLength =
        key.contains('measurements') ||
        key.contains('setback') ||
        key == 'road_width';
    final isNumeric = [
      'age_of_property',
      'no_of_floors',
      'land_measurements_east',
      'land_measurements_west',
      'land_measurements_north',
      'land_measurements_south',
      'land_area',
      'land_area_as_per_physical',
      'plinth_measurements_east',
      'plinth_measurements_west',
      'plinth_measurements_north',
      'plinth_measurements_south',
      'bua',
      'slab_measurements_east',
      'slab_measurements_west',
      'slab_measurements_north',
      'slab_measurements_south',
      'slab_area',
      'road_width',
      'setback_front',
      'setback_rear',
      'setback_right',
      'setback_left',
      'no_of_units',
      'land_rate',
      'construction_rate',
      'slab_rate',
      'rental_per_month',
      'phone_number',
      'applicant_contact',
    ].contains(key);

    String displayLabel = label;
    if (isArea) {
      final areaUnit = _reviewData['${key}_unit'] ?? 'sqyd';
      displayLabel += areaUnit == 'sqft'
          ? ' (sq.fts)'
          : areaUnit == 'sqm'
          ? ' (sq.mtr)'
          : ' (sq.yards)';
    }
    if (isLength) displayLabel += ' (ft)';

    if (ReviewStep.yesNoFields.contains(key)) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 16.0),
        child: DropdownButtonFormField<String>(
          value: (_reviewData[key]?.toString().isNotEmpty == true)
              ? _reviewData[key].toString()
              : null,
          style: TextStyle(
            fontSize: 14,
            color: Theme.of(context).colorScheme.onSurface,
          ),
          dropdownColor: Theme.of(context).colorScheme.surface,
          decoration: InputDecoration(
            labelText: displayLabel,
            labelStyle: TextStyle(
              fontSize: 14,
              color: isMissing
                  ? Colors.red
                  : Theme.of(context).colorScheme.onSurfaceVariant,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: isMissing
                    ? Colors.red
                    : Theme.of(context).colorScheme.outline.withOpacity(0.3),
                width: isMissing ? 2 : 1,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: Theme.of(context).colorScheme.primary,
                width: 2,
              ),
            ),
            filled: true,
            fillColor: isMissing
                ? Colors.red.withOpacity(0.05)
                : Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.5),
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 14,
            ),
            suffixIcon: isMissing
                ? const Tooltip(
                    message: 'Not filled — optional for submission',
                    child: Icon(
                      LucideIcons.alertTriangle,
                      color: Colors.red,
                      size: 18,
                    ),
                  )
                : null,
          ),
          items: [
            const DropdownMenuItem(value: 'Yes', child: Text('Yes')),
            const DropdownMenuItem(value: 'No', child: Text('No')),
            if ((_reviewData[key]?.toString().isNotEmpty ?? false) &&
                !['Yes', 'No'].contains(_reviewData[key]?.toString()))
              DropdownMenuItem(
                value: _reviewData[key].toString(),
                child: Text(_reviewData[key].toString()),
              ),
          ],
          onChanged: (val) {
            setState(() {
              _reviewData[key] = val;
              _recalculateMandatoryStatus();
            });
          },
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextFormField(
        controller: _getController(key),
        readOnly: [
          'land_area',
          'bua',
          'slab_area',
          'land_value',
          'building_value',
          'slab_value',
          'total_value',
        ].contains(key),
        maxLines: maxLines,
        keyboardType: isNumeric
            ? const TextInputType.numberWithOptions(decimal: true)
            : (maxLines > 1 ? TextInputType.multiline : TextInputType.text),
        style: TextStyle(
          fontSize: 14,
          color: Theme.of(context).colorScheme.onSurface,
        ),
        decoration: InputDecoration(
          labelText: displayLabel,
          labelStyle: TextStyle(
            fontSize: 14,
            color: isMissing
                ? Colors.red
                : Theme.of(context).colorScheme.onSurfaceVariant,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(
              color: isMissing
                  ? Colors.red
                  : Theme.of(context).colorScheme.outline.withOpacity(0.3),
              width: isMissing ? 2 : 1,
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(
              color: Theme.of(context).colorScheme.primary,
              width: 2,
            ),
          ),
          filled: true,
          fillColor: isMissing
              ? Colors.red.withOpacity(0.05)
              : Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.5),
          isDense: true,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 14,
          ),
          suffixIcon: isMissing
              ? const Tooltip(
                  message: 'Not filled — optional for submission',
                  child: Icon(
                    LucideIcons.alertTriangle,
                    color: Colors.red,
                    size: 18,
                  ),
                )
              : const Icon(
                  LucideIcons.checkCircle2,
                  color: Colors.green,
                  size: 18,
                ),
        ),
        onChanged: (value) {
          _reviewData[key] = value;
          _recalculateAreas();
          _recalculateMandatoryStatus();
          setState(() {});
        },
        onSaved: (value) => _reviewData[key] = value,
      ),
    );
  }

  Widget _buildOptionalField(String key, String label, {int maxLines = 1}) {
    final isArea = [
      'land_area',
      'land_area_as_per_physical',
      'bua',
      'slab_area',
    ].contains(key);
    final isLength =
        key.contains('measurements') ||
        key.contains('setback') ||
        key == 'road_width';
    final isNumeric = [
      'age_of_property',
      'no_of_floors',
      'land_measurements_east',
      'land_measurements_west',
      'land_measurements_north',
      'land_measurements_south',
      'land_area',
      'land_area_as_per_physical',
      'plinth_measurements_east',
      'plinth_measurements_west',
      'plinth_measurements_north',
      'plinth_measurements_south',
      'bua',
      'slab_measurements_east',
      'slab_measurements_west',
      'slab_measurements_north',
      'slab_measurements_south',
      'slab_area',
      'road_width',
      'setback_front',
      'setback_rear',
      'setback_right',
      'setback_left',
      'no_of_units',
      'land_rate',
      'construction_rate',
      'slab_rate',
      'rental_per_month',
      'phone_number',
      'applicant_contact',
    ].contains(key);

    String displayLabel = label;
    if (isArea) {
      final areaUnit = _reviewData['${key}_unit'] ?? 'sqyd';
      displayLabel += areaUnit == 'sqft'
          ? ' (sq.fts)'
          : areaUnit == 'sqm'
          ? ' (sq.mtr)'
          : ' (sq.yards)';
    }
    if (isLength) displayLabel += ' (ft)';

    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextFormField(
        controller: _getController(key),
        readOnly: [
          'land_area',
          'bua',
          'slab_area',
          'land_value',
          'building_value',
          'slab_value',
          'total_value',
        ].contains(key),
        maxLines: maxLines,
        keyboardType: isNumeric
            ? const TextInputType.numberWithOptions(decimal: true)
            : (maxLines > 1 ? TextInputType.multiline : TextInputType.text),
        style: TextStyle(
          fontSize: 14,
          color: Theme.of(context).colorScheme.onSurface,
        ),
        decoration: InputDecoration(
          labelText: displayLabel,
          labelStyle: TextStyle(
            fontSize: 14,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(
              color: Theme.of(context).colorScheme.outline.withOpacity(0.3),
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(
              color: Theme.of(context).colorScheme.primary,
              width: 2,
            ),
          ),
          filled: true,
          fillColor: Theme.of(
            context,
          ).colorScheme.surfaceVariant.withOpacity(0.5),
          isDense: true,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 14,
          ),
        ),
        onChanged: (value) {
          _reviewData[key] = value;
          _recalculateAreas();
          _recalculateMandatoryStatus();
          setState(() {});
        },
        onSaved: (value) => _reviewData[key] = value,
      ),
    );
  }

  Widget _buildSection(String title, IconData icon, List<Widget> children) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24.0),
      padding: const EdgeInsets.all(20.0),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Theme.of(context).colorScheme.outline.withOpacity(0.5),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  icon,
                  color: Theme.of(context).colorScheme.primary,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          ...children,
        ],
      ),
    );
  }

  Widget _buildCompletenessBar() {
    final pct = _mandatoryTotal > 0
        ? (_mandatoryFilled / _mandatoryTotal)
        : 0.0;
    final color = pct == 1.0
        ? Colors.green
        : pct >= 0.7
        ? Colors.orange
        : Colors.red;

    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(
                pct == 1.0 ? LucideIcons.checkCircle : LucideIcons.alertCircle,
                color: color,
                size: 20,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  '$_mandatoryFilled / $_mandatoryTotal review fields filled (optional for submission)',
                  style: TextStyle(
                    color: color,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: pct,
              backgroundColor: color.withOpacity(0.15),
              valueColor: AlwaysStoppedAnimation<Color>(color),
              minHeight: 8,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loadFailed) {
      return Scaffold(
        appBar: AppBar(title: const Text('Data Review')),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Case data could not be loaded.'),
              const SizedBox(height: 12),
              ElevatedButton(onPressed: _fetchData, child: const Text('Retry')),
            ],
          ),
        ),
      );
    }

    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Data Review')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Completeness indicator
              _buildCompletenessBar(),

              // ===== MANDATORY SECTIONS =====
              _buildSection('Property Details', LucideIcons.home, [
                _buildMandatoryField('branch', 'Branch'),
                _buildMandatoryField('property_address', 'Property Address'),
                _buildMandatoryField('age_of_property', 'Age of Property'),
                _buildMandatoryField('no_of_floors', 'No. of Floors'),
                _buildMandatoryField('property_usage', 'Property Usage'),
                _buildMandatoryField('structure_type', 'Structure of Property'),
                _buildMandatoryField('flooring_type', 'Flooring Type'),
                _buildMandatoryField('occupancy_details', 'Occupancy Details'),
                _buildMandatoryField(
                  'property_documents_verified',
                  'Property Documents Verified',
                ),
                _buildMandatoryField('ownership_type', 'Ownership Type'),
                _buildMandatoryField(
                  'quality_of_construction',
                  'Quality of Construction',
                ),
                _buildMandatoryField(
                  'interiors_exteriors',
                  'Interiors/Exteriors Quality',
                ),
                _buildMandatoryField('residual_life', 'Residual Life'),
              ]),

              _buildSection('Measurements & Boundaries', LucideIcons.ruler, [
                _buildMandatoryField('setback_front', 'Setback - Front'),
                _buildMandatoryField('setback_rear', 'Setback - Rear'),
                _buildMandatoryField('setback_right', 'Setback - Right'),
                _buildMandatoryField('setback_left', 'Setback - Left'),
                _buildMandatoryField(
                  'boundaries_document_east',
                  'Document Boundary - East',
                ),
                _buildMandatoryField(
                  'boundaries_document_west',
                  'Document Boundary - West',
                ),
                _buildMandatoryField(
                  'boundaries_document_north',
                  'Document Boundary - North',
                ),
                _buildMandatoryField(
                  'boundaries_document_south',
                  'Document Boundary - South',
                ),
                _buildMandatoryField(
                  'boundaries_physical_east',
                  'Physical Boundary - East',
                ),
                _buildMandatoryField(
                  'boundaries_physical_west',
                  'Physical Boundary - West',
                ),
                _buildMandatoryField(
                  'boundaries_physical_south',
                  'Physical Boundary - South',
                ),
                _buildMandatoryField(
                  'boundaries_physical_north',
                  'Physical Boundary - North',
                ),
                _buildMandatoryField(
                  'land_measurements_east',
                  'Land Measurement - East',
                ),
                _buildMandatoryField(
                  'land_measurements_west',
                  'Land Measurement - West',
                ),
                _buildMandatoryField(
                  'land_measurements_north',
                  'Land Measurement - North',
                ),
                _buildMandatoryField(
                  'land_measurements_south',
                  'Land Measurement - South',
                ),
                _buildMandatoryField('land_area', 'Calculated land area'),
                _buildMandatoryField(
                  'plinth_measurements_east',
                  'Plinth Measurement - East',
                ),
                _buildMandatoryField(
                  'plinth_measurements_west',
                  'Plinth Measurement - West',
                ),
                _buildMandatoryField(
                  'plinth_measurements_north',
                  'Plinth Measurement - North',
                ),
                _buildMandatoryField(
                  'plinth_measurements_south',
                  'Plinth Measurement - South',
                ),
                _buildMandatoryField(
                  'bua',
                  'Calculated built-up (plinth) area',
                ),
                _buildMandatoryField(
                  'slab_measurements_east',
                  'Slab Measurement - East',
                ),
                _buildMandatoryField(
                  'slab_measurements_west',
                  'Slab Measurement - West',
                ),
                _buildMandatoryField(
                  'slab_measurements_north',
                  'Slab Measurement - North',
                ),
                _buildMandatoryField(
                  'slab_measurements_south',
                  'Slab Measurement - South',
                ),
                _buildMandatoryField('slab_area', 'Calculated slab area'),
                _buildMandatoryField('road_width', 'Road Width'),
                _buildFloorWiseAreaTable(),
              ]),

              _buildSection('Inspection & Status', LucideIcons.search, [
                _buildMandatoryField(
                  'person_met_at_site',
                  'Person Met at Site',
                ),
                _buildMandatoryField(
                  'relationship_with_customer',
                  'Relationship with Customer',
                ),
                _buildMandatoryField(
                  'stage_of_construction',
                  'Stage of Construction',
                ),
                _buildMandatoryField('stage_percentage', 'Stage Percentage'),
                _buildMandatoryField(
                  'remarks_and_violations',
                  'Remarks & Violations',
                  maxLines: 3,
                ),
              ]),

              _buildSection('Location & Surroundings', LucideIcons.mapPin, [
                _buildMandatoryField('class_of_locality', 'Class of Locality'),
                _buildMandatoryField('site_developed', 'Site Developed'),
                _buildMandatoryField(
                  'proximity_amenities',
                  'Proximity to Civic Amenities',
                ),
                _buildMandatoryField(
                  'within_municipal_limits',
                  'Within Municipal Limits',
                ),
                _buildMandatoryField('panchayat_name', 'Name of Panchayat'),
                _buildMandatoryField('site_access', 'Site Access'),
                _buildMandatoryField('landmark', 'Landmark'),
                _buildMandatoryField('gps_coordinates', 'GPS Coordinates'),
                _buildMandatoryField('address_docs', 'Address Docs'),
                _buildMandatoryField('dist_railway', 'Dist. from Railway'),
                _buildMandatoryField('dist_bus', 'Dist. from Bus Stand'),
                _buildMandatoryField(
                  'dist_city_center',
                  'Dist. from City Center',
                ),
                _buildMandatoryField(
                  'approach_road_width',
                  'Approach Road Width',
                ),
              ]),

              _buildSection('Inspection & Status', LucideIcons.search, [
                _buildMandatoryField('meter_number', 'Meter Number'),
                _buildMandatoryField('meter_owner_name', 'Meter Owner Name'),
                _buildMandatoryField(
                  'bill_generated_name',
                  'Bill Generated Name',
                ),
                _buildMandatoryField(
                  'meter_owner_matching',
                  'Meter No & Owner Matching',
                ),
                _buildMandatoryField('lift', 'Lift Details'),
                _buildMandatoryField('lift_available', 'Lift Available'),
                _buildMandatoryField('near_hazards', 'Near Hazards/Water Body'),
                _buildMandatoryField(
                  'demarcation_available',
                  'Demarcation Available',
                ),
                _buildMandatoryField('basic_amenities', 'Basic Amenities'),
                _buildMandatoryField('marketability', 'Marketability'),
                _buildMandatoryField(
                  'high_tension_wires',
                  'High Tension Wires',
                ),
                _buildMandatoryField(
                  'area_left_for_cross',
                  'Area Left for Cross',
                ),
                _buildMandatoryField('joint_wall_slab', 'Joint Wall/Slab'),
                _buildMandatoryField('graveyard_nearby', 'Graveyard Nearby'),
              ]),

              _buildSection('Other Details', LucideIcons.list, [
                _buildMandatoryField(
                  'property_identified_by',
                  'Property Identified By',
                ),
                _buildMandatoryField(
                  'community_dominated',
                  'Community Dominated',
                ),
                _buildMandatoryField('linear_dimensions', 'Linear Dimensions'),
                _buildMandatoryField(
                  'linear_dimensions_matching',
                  'Linear Dimensions Matching',
                ),
                _buildMandatoryField(
                  'land_area_as_per_physical',
                  'Separately recorded site area (legacy)',
                ),
                _buildMandatoryField('no_of_units', 'No. of Units'),
                _buildMandatoryField(
                  'land_rate',
                  'Land Rate (INR per selected unit)',
                ),
                _buildMandatoryField('rental_per_month', 'Rental Per Month'),
                _buildMandatoryField(
                  'land_mismatch_reason',
                  'Reason for Land Extent Mismatch',
                ),
                _buildMandatoryField(
                  'excess_land',
                  'Structure Under Excess Land',
                ),
                _buildMandatoryField(
                  'boundary_mismatch_reason',
                  'Reason for Boundary Mismatch',
                ),
              ]),

              if (_isVeritas)
                _buildSection('Veritas Bank Fields', LucideIcons.building, [
                  _buildMandatoryField('nhb_1991', 'NHB 1991'),
                  _buildMandatoryField('nhb_2011', 'NHB 2011'),
                  _buildMandatoryField('roof', 'Roof'),
                  _buildMandatoryField('eb_service', 'EB Service'),
                  _buildMandatoryField('property_tax', 'Property Tax'),
                  _buildMandatoryField(
                    'passage_less_10ft',
                    'Passage Less 10ft',
                  ),
                  _buildMandatoryField('passage_width', 'Passage Width'),
                  _buildMandatoryField(
                    'distance_main_road',
                    'Distance Main Road',
                  ),
                  _buildMandatoryField('water_supply', 'Water Supply'),
                  _buildMandatoryField('drainage', 'Drainage'),
                  _buildMandatoryField('condition', 'Condition'),
                  _buildMandatoryField('facilities', 'Facilities'),
                  _buildMandatoryField('civic_status', 'Civic Status'),
                  _buildMandatoryField('deviation', 'Deviation'),
                ]),

              // ===== OPTIONAL SECTIONS (backward-compatible) =====
              _buildSection('Applicant Details', LucideIcons.user, [
                _buildOptionalField('applicant_name', 'Applicant Name'),
                _buildOptionalField('owner_name', 'Owner Name'),
                _buildOptionalField('phone_number', 'Phone Number'),
                _buildOptionalField(
                  'applicant_contact',
                  'Additional applicant contact',
                ),
                _buildOptionalField('case_ref', 'Application No / Case Ref'),
              ]),

              _buildSection('Branch Distance', LucideIcons.mapPin, [
                _buildOptionalField(
                  'distance_from_branch',
                  'Distance from Branch',
                ),
              ]),

              _buildSection('Valuation', LucideIcons.calculator, [
                _buildOptionalField(
                  'construction_rate',
                  'Construction Rate (INR per selected unit)',
                ),
                _buildOptionalField(
                  'slab_rate',
                  'Slab Rate (INR per selected unit)',
                ),
                ..._valuationControls(),
                _buildOptionalField('previous_valuation', 'Previous Valuation'),
                _buildOptionalField('total_value', 'Total Value'),
                _buildOptionalField('distress_value', 'Distress Value'),
                _buildOptionalField('gov_value', 'Govt Value'),
                _buildOptionalField(
                  'pct_recommendation',
                  'Recommendation % (legacy entry)',
                ),
                _buildOptionalField(
                  'recommended_percentage',
                  'Recommended Percentage',
                ),
              ]),

              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _saveData(showSnackbar: true),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  icon: const Icon(LucideIcons.save, size: 18),
                  label: const Text('Save Data'),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
