import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../theme/app_theme.dart';
import '../../widgets/hem_confirm_dialog.dart';

class LeaveRequestScreen extends StatefulWidget {
  const LeaveRequestScreen({super.key});

  @override
  State<LeaveRequestScreen> createState() => _LeaveRequestScreenState();
}

class _LeaveRequestScreenState extends State<LeaveRequestScreen> {
  bool _loading = true;
  List<dynamic> _leaves = [];

  final _formKey = GlobalKey<FormState>();
  DateTime? _startDate;
  DateTime? _endDate;
  final _reasonController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchLeaves();
  }

  Future<void> _fetchLeaves() async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) {
        if (mounted) setState(() => _loading = false);
        return;
      }

      final res = await Supabase.instance.client
          .from('leaves')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', ascending: false);

      setState(() {
        _leaves = res;
        _loading = false;
      });
    } catch (e) {
      debugPrint('Error fetching leaves: $e');
      setState(() => _loading = false);
    }
  }

  Future<void> _submitRequest() async {
    if (!_formKey.currentState!.validate()) return;
    if (_startDate == null || _endDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please select both start and end dates')),
      );
      return;
    }

    final confirmed = await HemConfirmDialog.show(
      context: context,
      title: 'Submit Leave Request',
      message:
          'Are you sure you want to submit this leave request for approval by management?',
      confirmLabel: 'Submit Leave',
      icon: LucideIcons.calendarCheck,
    );
    if (confirmed != true) return;

    setState(() => _loading = true);
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return;

      await Supabase.instance.client.from('leaves').insert({
        'user_id': user.id,
        'start_date': _startDate!.toIso8601String().split('T')[0],
        'end_date': _endDate!.toIso8601String().split('T')[0],
        'reason': _reasonController.text,
        'status': 'pending',
      });

      _reasonController.clear();
      _startDate = null;
      _endDate = null;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Leave request submitted successfully!'),
          backgroundColor: AppColors.success,
        ),
      );
      await _fetchLeaves();
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: $e')));
      setState(() => _loading = false);
    }
  }

  Future<void> _withdrawLeave(String leaveId) async {
    final confirmed = await HemConfirmDialog.show(
      context: context,
      title: 'Withdraw Request',
      message: 'Are you sure you want to withdraw this leave request?',
      confirmLabel: 'Withdraw',
      icon: LucideIcons.xCircle,
      isDestructive: true,
    );
    if (confirmed != true) return;

    setState(() => _loading = true);
    try {
      await Supabase.instance.client
          .from('leaves')
          .update({'status': 'withdrawn'})
          .eq('id', leaveId)
          .eq('user_id', Supabase.instance.client.auth.currentUser!.id)
          .inFilter('status', ['pending', 'pending_owner']);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Leave request withdrawn successfully'),
          backgroundColor: AppColors.success,
        ),
      );
      await _fetchLeaves();
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: $e')));
      setState(() => _loading = false);
    }
  }

  Future<void> _selectDate(BuildContext context, bool isStart) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: isStart ? DateTime.now() : (_startDate ?? DateTime.now()),
      firstDate: isStart ? DateTime.now() : (_startDate ?? DateTime.now()),
      lastDate: DateTime(2030),
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          _startDate = picked;
          if (_endDate != null && _endDate!.isBefore(_startDate!)) {
            _endDate = null;
          }
        } else {
          _endDate = picked;
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: Text('Leave Management'),
        actions: [
          IconButton(
            icon: Icon(LucideIcons.refreshCw),
            onPressed: () {
              setState(() => _loading = true);
              _fetchLeaves();
            },
            tooltip: 'Refresh Leaves',
          ),
        ],
      ),
      body: _loading && _leaves.isEmpty
          ? Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchLeaves,
              color: colorScheme.primary,
              child: CustomScrollView(
                physics: AlwaysScrollableScrollPhysics(),
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Card(
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Padding(
                          padding: EdgeInsets.all(16.0),
                          child: Form(
                            key: _formKey,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'New Request',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: colorScheme.onSurface,
                                  ),
                                ),
                                SizedBox(height: 16),
                                Row(
                                  children: [
                                    Expanded(
                                      child: InkWell(
                                        onTap: () => _selectDate(context, true),
                                        child: InputDecorator(
                                          decoration: InputDecoration(
                                            labelText: 'Start Date',
                                            border: OutlineInputBorder(
                                              borderRadius:
                                                  BorderRadius.circular(12),
                                            ),
                                          ),
                                          child: Text(
                                            _startDate != null
                                                ? _startDate!
                                                      .toLocal()
                                                      .toString()
                                                      .split(' ')[0]
                                                : 'Select Date',
                                          ),
                                        ),
                                      ),
                                    ),
                                    SizedBox(width: 16),
                                    Expanded(
                                      child: InkWell(
                                        onTap: () =>
                                            _selectDate(context, false),
                                        child: InputDecorator(
                                          decoration: InputDecoration(
                                            labelText: 'End Date',
                                            border: OutlineInputBorder(
                                              borderRadius:
                                                  BorderRadius.circular(12),
                                            ),
                                          ),
                                          child: Text(
                                            _endDate != null
                                                ? _endDate!
                                                      .toLocal()
                                                      .toString()
                                                      .split(' ')[0]
                                                : 'Select Date',
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                SizedBox(height: 16),
                                TextFormField(
                                  controller: _reasonController,
                                  maxLines: 3,
                                  maxLength: 2000,
                                  decoration: InputDecoration(
                                    labelText: 'Reason for Leave',
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                  validator: (v) =>
                                      v!.isEmpty ? 'Required' : null,
                                ),
                                SizedBox(height: 16),
                                SizedBox(
                                  width: double.infinity,
                                  height: 48,
                                  child: ElevatedButton.icon(
                                    onPressed: _submitRequest,
                                    icon: Icon(LucideIcons.send),
                                    label: Text(
                                      'Submit Request',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: colorScheme.primary,
                                      foregroundColor: colorScheme.onPrimary,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
                      child: Text(
                        'Leave History',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: colorScheme.onSurface,
                        ),
                      ),
                    ),
                  ),
                  _leaves.isEmpty
                      ? SliverToBoxAdapter(
                          child: Padding(
                            padding: EdgeInsets.all(32.0),
                            child: Center(
                              child: Text(
                                'No leave requests found.',
                                style: TextStyle(
                                  color: colorScheme.onSurfaceVariant,
                                ),
                              ),
                            ),
                          ),
                        )
                      : SliverList(
                          delegate: SliverChildBuilderDelegate((
                            context,
                            index,
                          ) {
                            final l = _leaves[index];
                            final status = l['status'] as String;
                            Color statusColor = AppColors.warning;
                            if (status == 'approved')
                              statusColor = AppColors.success;
                            if (status == 'rejected')
                              statusColor = AppColors.danger;
                            if (status == 'withdrawn')
                              statusColor = colorScheme.onSurfaceVariant;

                            final isPending =
                                status == 'pending' ||
                                status == 'pending_owner';

                            return Card(
                              margin: EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 8,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: ListTile(
                                leading: Icon(
                                  LucideIcons.calendarDays,
                                  color: colorScheme.primary,
                                ),
                                title: Text(
                                  '${l['start_date']} to ${l['end_date']}',
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                                subtitle: Text(
                                  l['reason'] ?? '',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Container(
                                      padding: EdgeInsets.symmetric(
                                        horizontal: 10,
                                        vertical: 4,
                                      ),
                                      decoration: BoxDecoration(
                                        color: statusColor.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text(
                                        status.toUpperCase(),
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                          color: statusColor,
                                        ),
                                      ),
                                    ),
                                    if (isPending) ...[
                                      SizedBox(width: 8),
                                      IconButton(
                                        icon: Icon(
                                          LucideIcons.xCircle,
                                          color: AppColors.dangerFor(context),
                                          size: 20,
                                        ),
                                        tooltip: 'Withdraw Request',
                                        onPressed: () =>
                                            _withdrawLeave(l['id'].toString()),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            );
                          }, childCount: _leaves.length),
                        ),
                ],
              ),
            ),
    );
  }
}
