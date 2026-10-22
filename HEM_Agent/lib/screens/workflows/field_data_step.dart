import '../../../core/case_workflow.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class FieldDataStep extends StatefulWidget {
  final String caseId;
  const FieldDataStep({super.key, required this.caseId});

  @override
  State<FieldDataStep> createState() => _FieldDataStepState();
}

class _FieldDataStepState extends State<FieldDataStep> {
  final _formKey = GlobalKey<FormState>();
  bool _loading = true;
  int _revision = 0;
  bool _saving = false;
  Map<String, dynamic> _formData = {};
  final Map<String, TextEditingController> _controllers = {};

  TextEditingController _getController(String key) {
    if (!_controllers.containsKey(key)) {
      _controllers[key] = TextEditingController(
        text: _formData[key]?.toString() ?? '',
      );
    }
    return _controllers[key]!;
  }

  @override
  void dispose() {
    for (var controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final supabase = Supabase.instance.client;
      final record = await supabase
          .from('cases')
          .select('extracted_data, revision')
          .eq('id', widget.caseId)
          .single();
      _revision = (record['revision'] as num).toInt();
      final initialData = Map<String, dynamic>.from(
        record['extracted_data'] ?? {},
      );
      if (!mounted) return;
      setState(() {
        _formData = initialData;
        _loading = false;
      });
    } catch (e) {
      debugPrint('Failed to fetch field data: $e');
      setState(() => _loading = false);
    }
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() => _saving = true);
    try {
      await CaseWorkflow.save(widget.caseId, _formData, _revision);

      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Field data saved successfully')));
      context.pop();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Failed to save field data: $e')));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Field Data',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: _loading
          ? Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildSectionHeader(
                      'Boundary Dimensions',
                      LucideIcons.ruler,
                    ),
                    _buildSectionContainer(
                      children: [
                        _buildField(
                          'East to West',
                          'east_west_dimension',
                          LucideIcons.moveHorizontal,
                          isNumeric: true,
                          onChanged: (_) => _calculatePlotArea(),
                        ),
                        SizedBox(height: 16),
                        _buildField(
                          'North to South',
                          'north_south_dimension',
                          LucideIcons.moveVertical,
                          isNumeric: true,
                          onChanged: (_) => _calculatePlotArea(),
                        ),
                        SizedBox(height: 16),
                        _buildField(
                          'Plot Area (Sq.Yds)',
                          'plot_area',
                          LucideIcons.scaling,
                          isNumeric: true,
                        ),
                      ],
                    ),

                    _buildSectionHeader(
                      'Valuation Metrics',
                      LucideIcons.calculator,
                    ),
                    _buildSectionContainer(
                      children: [
                        _buildField(
                          'Market Value per Sq.Ft',
                          'market_value_per_sqft',
                          LucideIcons.banknote,
                          isNumeric: true,
                        ),
                        SizedBox(height: 16),
                        _buildField(
                          'Realizable Value (%)',
                          'realizable_value_percentage',
                          LucideIcons.percent,
                          isNumeric: true,
                        ),
                        SizedBox(height: 16),
                        _buildField(
                          'Distress Value (%)',
                          'distress_value_percentage',
                          LucideIcons.trendingDown,
                          isNumeric: true,
                        ),
                      ],
                    ),

                    _buildSectionHeader(
                      'Observations',
                      LucideIcons.clipboardList,
                    ),
                    _buildSectionContainer(
                      children: [
                        _buildField(
                          'General Remarks',
                          'remarks',
                          LucideIcons.messageSquare,
                          maxLines: 4,
                        ),
                      ],
                    ),

                    SizedBox(height: 32),
                    ElevatedButton.icon(
                      onPressed: _saving ? null : _handleSave,
                      icon: _saving
                          ? SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : Icon(LucideIcons.save, size: 20),
                      label: Text(
                        _saving ? 'Saving Data...' : 'Save Field Data',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        padding: EdgeInsets.symmetric(vertical: 20),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                    ),
                    SizedBox(height: 48),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Padding(
      padding: EdgeInsets.only(bottom: 16, top: 8),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              size: 18,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
          SizedBox(width: 12),
          Text(
            title,
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  void _calculatePlotArea() {
    double ew =
        double.tryParse(_controllers['east_west_dimension']?.text ?? '0') ?? 0;
    double ns =
        double.tryParse(_controllers['north_south_dimension']?.text ?? '0') ??
        0;
    if (ew > 0 && ns > 0) {
      double areaSqFt = ew * ns;
      double areaSqYds = areaSqFt / 9;
      String result = areaSqYds.toStringAsFixed(2);
      _getController('plot_area').text = result;
      _formData['plot_area'] = double.tryParse(result) ?? 0.0;
    }
  }

  Widget _buildSectionContainer({required List<Widget> children}) {
    return Container(
      margin: EdgeInsets.only(bottom: 32),
      padding: EdgeInsets.all(20),
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
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: children,
      ),
    );
  }

  Widget _buildField(
    String label,
    String key,
    IconData icon, {
    bool isNumeric = false,
    int maxLines = 1,
    void Function(String)? onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
        SizedBox(height: 8),
        TextFormField(
          controller: _getController(key),
          keyboardType: isNumeric
              ? TextInputType.numberWithOptions(decimal: true)
              : TextInputType.text,
          maxLines: maxLines,
          style: TextStyle(fontWeight: FontWeight.w500),
          decoration: InputDecoration(
            hintText: 'Enter $label',
            hintStyle: TextStyle(
              color: Theme.of(
                context,
              ).colorScheme.onSurfaceVariant.withOpacity(0.5),
            ),
            prefixIcon: maxLines == 1
                ? Icon(
                    icon,
                    size: 18,
                    color: Theme.of(context).colorScheme.primary,
                  )
                : null,
            filled: true,
            fillColor: Theme.of(
              context,
            ).colorScheme.surfaceVariant.withOpacity(0.5),
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
            contentPadding: EdgeInsets.symmetric(
              horizontal: 16,
              vertical: maxLines > 1 ? 16 : 0,
            ),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) return 'Required field';
            return null;
          },
          onChanged: (value) {
            if (isNumeric) {
              _formData[key] = double.tryParse(value) ?? 0.0;
            } else {
              _formData[key] = value;
            }
            if (onChanged != null) onChanged(value);
          },
          onSaved: (value) {
            if (isNumeric && value != null) {
              _formData[key] = double.tryParse(value) ?? 0.0;
            } else {
              _formData[key] = value;
            }
          },
        ),
      ],
    );
  }
}
