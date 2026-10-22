import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../theme/app_theme.dart';
import 'package:geolocator/geolocator.dart';
import '../../widgets/hem_loader.dart';
import '../../widgets/hem_logo.dart';
import '../../widgets/hem_confirm_dialog.dart';
import '../../core/case_status.dart';

class CasesListScreen extends StatefulWidget {
  const CasesListScreen({super.key});

  @override
  State<CasesListScreen> createState() => _CasesListScreenState();
}

class _CasesListScreenState extends State<CasesListScreen> {
  List<dynamic> _cases = [];
  bool _loading = true;
  int _currentIndex = 0; // For bottom nav
  String _casesFilter = 'all'; // 'all', 'pending', 'completed'
  String _searchQuery = '';
  bool _checkedIn = false;
  String? _checkInTime;
  bool _checkedOut = false;
  String? _checkOutTime;
  String? _attendanceId;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  String _formatTime12(DateTime dt) {
    final h = dt.hour == 0 ? 12 : (dt.hour > 12 ? dt.hour - 12 : dt.hour);
    final m = dt.minute.toString().padLeft(2, '0');
    final amPm = dt.hour >= 12 ? 'PM' : 'AM';
    return "$h:$m $amPm";
  }

  Future<void> _fetchData() async {
    setState(() {
      _loading = true;
    });
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user != null) {
        final todayStr = DateTime.now().toIso8601String().split('T')[0];
        final results = await Future.wait([
          Supabase.instance.client
              .from('cases')
              .select(
                'id,application_number,applicant_name,address,status,created_at,deadline_date,property_type,case_type,submitted_at,case_location(id),case_documents(id),case_photos(id)',
              )
              .eq('assigned_to', user.id)
              .inFilter('status', ['new', 'assigned', 'in_progress'])
              .order('created_at', ascending: false),
          Supabase.instance.client
              .from('attendance')
              .select('id,check_in_time,check_out_time')
              .eq('user_id', user.id)
              .eq('date', todayStr)
              .maybeSingle(),
        ]);
        final casesRes = results[0] as List;
        final attRes = results[1] as Map<String, dynamic>?;

        if (mounted) {
          setState(() {
            _cases = casesRes;
            _attendanceId = null;
            _checkedIn = false;
            _checkedOut = false;
            _checkInTime = null;
            _checkOutTime = null;
            if (attRes != null) {
              _attendanceId = attRes['id'];
              _checkedIn = true;
              if (attRes['check_in_time'] != null) {
                final dt = DateTime.parse(attRes['check_in_time']).toLocal();
                _checkInTime = _formatTime12(dt);
              }
              if (attRes['check_out_time'] != null) {
                _checkedOut = true;
                final dt = DateTime.parse(attRes['check_out_time']).toLocal();
                _checkOutTime = _formatTime12(dt);
              }
            }
            _loading = false;
          });
        }
      } else {
        if (mounted)
          setState(() {
            _loading = false;
          });
      }
    } catch (e) {
      if (mounted)
        setState(() {
          _loading = false;
        });
    }
  }

  Future<void> _performDailyCheckIn() async {
    if (_checkedIn) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Already checked in today at $_checkInTime!')),
      );
      return;
    }

    final confirmed = await HemConfirmDialog.show(
      context: context,
      title: 'Confirm Check-In',
      message:
          'Ready to start your shift? This will record your current GPS coordinates and attendance timestamp.',
      confirmLabel: 'Check-In Now',
      icon: LucideIcons.mapPin,
    );
    if (confirmed != true) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Center(child: CircularProgressIndicator()),
    );

    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      Position? position;
      if (permission != LocationPermission.denied &&
          permission != LocationPermission.deniedForever) {
        position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.best,
        );
      }

      final now = DateTime.now();
      final timeStr = _formatTime12(now);

      final user = Supabase.instance.client.auth.currentUser;
      if (user != null) {
        final inserted = await Supabase.instance.client
            .from('attendance')
            .insert({
              'user_id': user.id,
              'date': now.toIso8601String().split('T')[0],
              'check_in_time': now.toUtc().toIso8601String(),
              'check_in_location': position != null
                  ? {
                      'latitude': position.latitude,
                      'longitude': position.longitude,
                    }
                  : null,
              'status': 'Present',
            })
            .select()
            .maybeSingle();
        if (inserted != null) {
          _attendanceId = inserted['id'];
        }
      }

      if (mounted) {
        Navigator.pop(context); // close dialog
        setState(() {
          _checkedIn = true;
          _checkInTime = timeStr;
        });

        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            title: Row(
              children: [
                Icon(
                  LucideIcons.checkCircle,
                  color: AppColors.successFor(context),
                ),
                SizedBox(width: 8),
                Text('Attendance Verified'),
              ],
            ),
            content: Text(
              position != null
                  ? 'Checked in successfully at $timeStr.\nGPS: ${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}'
                  : 'Checked in successfully at $timeStr.',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: Text(
                  'OK',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Check-in failed: $e')));
      }
    }
  }

  Future<void> _performDailyCheckOut() async {
    if (_checkedOut) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Already checked out today at $_checkOutTime!')),
      );
      return;
    }

    final confirmed = await HemConfirmDialog.show(
      context: context,
      title: 'Confirm Check-Out',
      message:
          'Are you sure you want to end your shift for today? This will log your departure timestamp.',
      confirmLabel: 'End Shift',
      icon: LucideIcons.logOut,
    );
    if (confirmed != true) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Center(child: CircularProgressIndicator()),
    );

    try {
      Position? position;
      try {
        position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.best,
        );
      } catch (_) {}

      final now = DateTime.now();
      final timeStr = _formatTime12(now);

      if (_attendanceId != null) {
        await Supabase.instance.client
            .from('attendance')
            .update({
              'check_out_time': now.toUtc().toIso8601String(),
              'check_out_location': position != null
                  ? {
                      'latitude': position.latitude,
                      'longitude': position.longitude,
                    }
                  : null,
              'status': 'Completed Shift',
            })
            .eq('id', _attendanceId!);
      }

      if (mounted) {
        Navigator.pop(context); // close dialog
        setState(() {
          _checkedOut = true;
          _checkOutTime = timeStr;
        });

        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            title: Row(
              children: [
                Icon(LucideIcons.logOut, color: AppColors.dangerFor(context)),
                SizedBox(width: 8),
                Text('Shift Completed'),
              ],
            ),
            content: Text('Checked out successfully at $timeStr.'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: Text(
                  'OK',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Check-out failed: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark
        ? AppColors.backgroundDark
        : AppColors.backgroundLight;
    final surfaceColor = isDark
        ? AppColors.surfaceDark
        : AppColors.surfaceLight;
    final paperColor = isDark ? AppColors.paper2Dark : AppColors.paper2Light;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textColor = isDark ? AppColors.inkDark : AppColors.inkLight;
    final mutedColor = isDark ? AppColors.mutedDark : AppColors.mutedLight;

    final completedCases = _cases.where((c) {
      final st = (c['status'] ?? '').toString().toLowerCase();
      return CaseStatus.isCompleted(st);
    }).length;
    final pendingCases = _cases.length - completedCases;

    final displayedCases = _cases.where((c) {
      final st = (c['status'] ?? '').toString().toLowerCase();
      final isCompleted = CaseStatus.isCompleted(st);
      if (_currentIndex == 0) {
        return !isCompleted;
      }
      if (_casesFilter == 'pending' && isCompleted) return false;
      if (_casesFilter == 'completed' && !isCompleted) return false;
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final name = (c['applicant_name'] ?? '').toString().toLowerCase();
        final appNo = (c['application_number'] ?? '').toString().toLowerCase();
        final addr = (c['address'] ?? '').toString().toLowerCase();
        if (!name.contains(q) && !appNo.contains(q) && !addr.contains(q))
          return false;
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: bgColor,
      body: _loading
          ? Center(child: HemLoader(size: 64, text: 'Syncing portal cases...'))
          : Stack(
              children: [
                SafeArea(
                  child: RefreshIndicator(
                    onRefresh: _fetchData,
                    child: CustomScrollView(
                      slivers: [
                        // Header Bar matching Web Portal
                        SliverToBoxAdapter(
                          child: Container(
                            padding: EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 16,
                            ),
                            decoration: BoxDecoration(
                              color: surfaceColor,
                              border: Border(
                                bottom: BorderSide(color: borderColor),
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    HemLogo(size: 42),
                                    SizedBox(width: 12),
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'HEM Associates Portal',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: mutedColor,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        Text(
                                          _currentIndex == 1
                                              ? 'Cases Directory'
                                              : 'Active Dashboard',
                                          style: TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                            color: textColor,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                Row(
                                  children: [
                                    IconButton(
                                      icon: Icon(
                                        isDark
                                            ? LucideIcons.sun
                                            : LucideIcons.moon,
                                        color: textColor,
                                        size: 20,
                                      ),
                                      onPressed: () {
                                        ThemeController
                                            .themeModeNotifier
                                            .value = isDark
                                            ? ThemeMode.light
                                            : ThemeMode.dark;
                                      },
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),

                        SliverToBoxAdapter(
                          child: Padding(
                            padding: EdgeInsets.symmetric(
                              horizontal: 20.0,
                              vertical: 20.0,
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (_currentIndex == 0) ...[
                                  // Dedicated Live Shift & Attendance Command Card
                                  Container(
                                    padding: EdgeInsets.all(20),
                                    decoration: BoxDecoration(
                                      color: isDark
                                          ? Color(0xFF14151A)
                                          : Color(0xFF0F172A),
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(
                                        color: _checkedOut
                                            ? Colors.grey.withOpacity(0.3)
                                            : (_checkedIn
                                                  ? AppColors.success
                                                        .withOpacity(0.5)
                                                  : AppColors.primary
                                                        .withOpacity(0.4)),
                                        width: 1.5,
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color:
                                              (_checkedIn && !_checkedOut
                                                      ? AppColors.success
                                                      : AppColors.primary)
                                                  .withOpacity(0.12),
                                          blurRadius: 20,
                                          offset: Offset(0, 6),
                                        ),
                                      ],
                                    ),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Row(
                                              children: [
                                                Container(
                                                  padding: EdgeInsets.all(8),
                                                  decoration: BoxDecoration(
                                                    color:
                                                        (_checkedOut
                                                                ? Colors.grey
                                                                : (_checkedIn
                                                                      ? AppColors
                                                                            .success
                                                                      : AppColors
                                                                            .primary))
                                                            .withOpacity(0.15),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                          12,
                                                        ),
                                                  ),
                                                  child: Icon(
                                                    _checkedOut
                                                        ? LucideIcons.checkCheck
                                                        : (_checkedIn
                                                              ? LucideIcons
                                                                    .shieldCheck
                                                              : LucideIcons
                                                                    .clock),
                                                    color: _checkedOut
                                                        ? Colors.grey[400]
                                                        : (_checkedIn
                                                              ? AppColors
                                                                    .success
                                                              : AppColors
                                                                    .primary),
                                                    size: 20,
                                                  ),
                                                ),
                                                SizedBox(width: 12),
                                                Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      _checkedOut
                                                          ? 'SHIFT COMPLETED'
                                                          : (_checkedIn
                                                                ? 'ACTIVE ON SHIFT'
                                                                : 'OFF DUTY'),
                                                      style: TextStyle(
                                                        fontSize: 11,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                        letterSpacing: 1.2,
                                                        color: _checkedOut
                                                            ? Colors.grey[400]
                                                            : (_checkedIn
                                                                  ? AppColors
                                                                        .success
                                                                  : AppColors
                                                                        .primary),
                                                      ),
                                                    ),
                                                    SizedBox(height: 2),
                                                    Text(
                                                      'GPS Verified Tracker',
                                                      style: TextStyle(
                                                        fontSize: 16,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                        color: Colors.white,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ],
                                            ),
                                            Container(
                                              padding: EdgeInsets.symmetric(
                                                horizontal: 10,
                                                vertical: 4,
                                              ),
                                              decoration: BoxDecoration(
                                                color: Colors.white.withOpacity(
                                                  0.1,
                                                ),
                                                borderRadius:
                                                    BorderRadius.circular(20),
                                              ),
                                              child: Row(
                                                children: [
                                                  Container(
                                                    width: 6,
                                                    height: 6,
                                                    decoration: BoxDecoration(
                                                      color: _checkedOut
                                                          ? Colors.grey
                                                          : (_checkedIn
                                                                ? AppColors
                                                                      .success
                                                                : AppColors
                                                                      .primary),
                                                      shape: BoxShape.circle,
                                                    ),
                                                  ),
                                                  SizedBox(width: 6),
                                                  Text(
                                                    _checkedOut
                                                        ? 'Done'
                                                        : (_checkedIn
                                                              ? 'Live'
                                                              : 'Ready'),
                                                    style: TextStyle(
                                                      fontSize: 11,
                                                      fontWeight:
                                                          FontWeight.bold,
                                                      color: Colors.white,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                        SizedBox(height: 18),
                                        if (_checkedIn || _checkedOut) ...[
                                          Container(
                                            padding: EdgeInsets.symmetric(
                                              horizontal: 14,
                                              vertical: 12,
                                            ),
                                            decoration: BoxDecoration(
                                              color: Colors.white.withOpacity(
                                                0.05,
                                              ),
                                              borderRadius:
                                                  BorderRadius.circular(14),
                                            ),
                                            child: Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment.spaceAround,
                                              children: [
                                                Column(
                                                  children: [
                                                    Text(
                                                      'CHECK-IN',
                                                      style: TextStyle(
                                                        fontSize: 10,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                        color: Colors.white54,
                                                      ),
                                                    ),
                                                    SizedBox(height: 4),
                                                    Text(
                                                      _checkInTime ?? '--:--',
                                                      style: TextStyle(
                                                        fontSize: 15,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                        color: Colors.white,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                Container(
                                                  width: 1,
                                                  height: 28,
                                                  color: Colors.white12,
                                                ),
                                                Column(
                                                  children: [
                                                    Text(
                                                      'CHECK-OUT',
                                                      style: TextStyle(
                                                        fontSize: 10,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                        color: Colors.white54,
                                                      ),
                                                    ),
                                                    SizedBox(height: 4),
                                                    Text(
                                                      _checkOutTime ??
                                                          'Active Now',
                                                      style: TextStyle(
                                                        fontSize: 15,
                                                        fontWeight:
                                                            FontWeight.bold,
                                                        color:
                                                            _checkOutTime !=
                                                                null
                                                            ? Colors.white
                                                            : AppColors.success,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ],
                                            ),
                                          ),
                                          SizedBox(height: 16),
                                        ],
                                        if (!_checkedIn)
                                          SizedBox(
                                            width: double.infinity,
                                            child: ElevatedButton.icon(
                                              onPressed: _performDailyCheckIn,
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor:
                                                    AppColors.primary,
                                                foregroundColor:
                                                    AppColors.onPrimary,
                                                padding: EdgeInsets.symmetric(
                                                  vertical: 14,
                                                ),
                                                shape: RoundedRectangleBorder(
                                                  borderRadius:
                                                      BorderRadius.circular(16),
                                                ),
                                                elevation: 4,
                                              ),
                                              icon: Icon(
                                                LucideIcons.logIn,
                                                size: 18,
                                              ),
                                              label: Text(
                                                'Start Daily Shift (Check-In)',
                                                style: TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ),
                                          )
                                        else if (!_checkedOut)
                                          SizedBox(
                                            width: double.infinity,
                                            child: ElevatedButton.icon(
                                              onPressed: _performDailyCheckOut,
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor:
                                                    AppColors.danger,
                                                foregroundColor: Colors.white,
                                                padding: EdgeInsets.symmetric(
                                                  vertical: 14,
                                                ),
                                                shape: RoundedRectangleBorder(
                                                  borderRadius:
                                                      BorderRadius.circular(16),
                                                ),
                                                elevation: 4,
                                              ),
                                              icon: Icon(
                                                LucideIcons.logOut,
                                                size: 18,
                                              ),
                                              label: Text(
                                                'End Shift & Check-Out',
                                                style: TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ),
                                          )
                                        else
                                          Container(
                                            width: double.infinity,
                                            padding: EdgeInsets.symmetric(
                                              vertical: 12,
                                            ),
                                            alignment: Alignment.center,
                                            decoration: BoxDecoration(
                                              color: Colors.white.withOpacity(
                                                0.05,
                                              ),
                                              borderRadius:
                                                  BorderRadius.circular(14),
                                            ),
                                            child: Text(
                                              'Daily Shift Log Completed',
                                              style: TextStyle(
                                                color: Colors.white70,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 13,
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),

                                  SizedBox(height: 24),

                                  // Quick Action Buttons
                                  Row(
                                    children: [
                                      Expanded(
                                        child: GestureDetector(
                                          onTap: () => context.push('/leaves'),
                                          child: Container(
                                            padding: EdgeInsets.symmetric(
                                              vertical: 14,
                                              horizontal: 16,
                                            ),
                                            decoration: BoxDecoration(
                                              color: surfaceColor,
                                              borderRadius:
                                                  BorderRadius.circular(16),
                                              border: Border.all(
                                                color: borderColor,
                                              ),
                                              boxShadow: [
                                                BoxShadow(
                                                  color: Colors.black
                                                      .withOpacity(0.03),
                                                  blurRadius: 10,
                                                  offset: Offset(0, 4),
                                                ),
                                              ],
                                            ),
                                            child: Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment.center,
                                              children: [
                                                Icon(
                                                  LucideIcons.calendarDays,
                                                  color: AppColors.warningFor(
                                                    context,
                                                  ),
                                                  size: 18,
                                                ),
                                                SizedBox(width: 8),
                                                Text(
                                                  'Leave Request',
                                                  style: TextStyle(
                                                    fontSize: 13,
                                                    fontWeight: FontWeight.bold,
                                                    color: textColor,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),

                                  SizedBox(height: 28),
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        'Assigned Evaluations ($pendingCases)',
                                        style: TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: textColor,
                                        ),
                                      ),
                                      if (_cases.isNotEmpty)
                                        GestureDetector(
                                          onTap: () =>
                                              setState(() => _currentIndex = 1),
                                          child: Text(
                                            'View All',
                                            style: TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.w600,
                                              color: Theme.of(
                                                context,
                                              ).colorScheme.primary,
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                  SizedBox(height: 16),
                                ] else ...[
                                  // Cases Directory Search & Filter Hub
                                  Container(
                                    decoration: BoxDecoration(
                                      color: surfaceColor,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(color: borderColor),
                                    ),
                                    child: TextField(
                                      onChanged: (val) =>
                                          setState(() => _searchQuery = val),
                                      style: TextStyle(
                                        color: textColor,
                                        fontSize: 14,
                                      ),
                                      decoration: InputDecoration(
                                        hintText:
                                            'Search application #, applicant, or address...',
                                        hintStyle: TextStyle(
                                          color: mutedColor,
                                          fontSize: 13,
                                        ),
                                        prefixIcon: Icon(
                                          LucideIcons.search,
                                          color: mutedColor,
                                          size: 18,
                                        ),
                                        border: InputBorder.none,
                                        contentPadding: EdgeInsets.symmetric(
                                          horizontal: 16,
                                          vertical: 14,
                                        ),
                                      ),
                                    ),
                                  ),
                                  SizedBox(height: 16),
                                  SingleChildScrollView(
                                    scrollDirection: Axis.horizontal,
                                    child: Row(
                                      children: [
                                        _buildFilterPill(
                                          'all',
                                          'All Cases (${_cases.length})',
                                          surfaceColor,
                                          borderColor,
                                          textColor,
                                        ),
                                        SizedBox(width: 10),
                                        _buildFilterPill(
                                          'pending',
                                          'Pending ($pendingCases)',
                                          surfaceColor,
                                          borderColor,
                                          textColor,
                                        ),
                                        SizedBox(width: 10),
                                        _buildFilterPill(
                                          'completed',
                                          'Completed ($completedCases)',
                                          surfaceColor,
                                          borderColor,
                                          textColor,
                                        ),
                                      ],
                                    ),
                                  ),
                                  SizedBox(height: 24),
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        _casesFilter == 'all'
                                            ? 'All Cases Directory (${displayedCases.length})'
                                            : (_casesFilter == 'pending'
                                                  ? 'Pending Actions (${displayedCases.length})'
                                                  : 'Completed History (${displayedCases.length})'),
                                        style: TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: textColor,
                                        ),
                                      ),
                                      Icon(
                                        LucideIcons.briefcase,
                                        color: mutedColor,
                                        size: 18,
                                      ),
                                    ],
                                  ),
                                  SizedBox(height: 16),
                                ],
                              ],
                            ),
                          ),
                        ),

                        displayedCases.isEmpty
                            ? SliverToBoxAdapter(
                                child: Padding(
                                  padding: EdgeInsets.symmetric(
                                    horizontal: 20,
                                    vertical: 40,
                                  ),
                                  child: Center(
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Icon(
                                          LucideIcons.inbox,
                                          size: 48,
                                          color: mutedColor.withOpacity(0.5),
                                        ),
                                        SizedBox(height: 16),
                                        Text(
                                          'No cases found',
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                            color: textColor,
                                          ),
                                        ),
                                        SizedBox(height: 6),
                                        Text(
                                          _searchQuery.isNotEmpty
                                              ? 'No results match "$_searchQuery"'
                                              : 'There are no cases matching this status filter.',
                                          style: TextStyle(
                                            fontSize: 13,
                                            color: mutedColor,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              )
                            : SliverPadding(
                                padding: EdgeInsets.symmetric(horizontal: 20),
                                sliver: SliverList(
                                  delegate: SliverChildBuilderDelegate((
                                    context,
                                    index,
                                  ) {
                                    final item = displayedCases[index];
                                    return _buildRichCaseCard(
                                      item,
                                      isDark,
                                      surfaceColor,
                                      paperColor,
                                      borderColor,
                                      textColor,
                                      mutedColor,
                                    );
                                  }, childCount: displayedCases.length),
                                ),
                              ),
                        SliverToBoxAdapter(
                          child: SizedBox(height: 100),
                        ), // Space for bottom nav
                      ],
                    ),
                  ),
                ),

                // Floating Bottom Navigation
                Positioned(
                  bottom: 20,
                  left: 20,
                  right: 20,
                  child: Container(
                    height: 76,
                    decoration: BoxDecoration(
                      color: surfaceColor,
                      borderRadius: BorderRadius.circular(38),
                      border: Border.all(color: borderColor),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(isDark ? 0.3 : 0.08),
                          blurRadius: 20,
                          offset: Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildNavItem(
                          context,
                          LucideIcons.home,
                          'Home',
                          0,
                          textColor,
                          mutedColor,
                        ),
                        _buildNavItem(
                          context,
                          LucideIcons.briefcase,
                          'Cases',
                          1,
                          textColor,
                          mutedColor,
                        ),
                        _buildNavItem(
                          context,
                          LucideIcons.calendarDays,
                          'Leave',
                          2,
                          textColor,
                          mutedColor,
                        ),
                        _buildNavItem(
                          context,
                          LucideIcons.user,
                          'Profile',
                          3,
                          textColor,
                          mutedColor,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildNavItem(
    BuildContext context,
    IconData icon,
    String label,
    int index,
    Color textColor,
    Color mutedColor,
  ) {
    final isSelected = _currentIndex == index;
    return GestureDetector(
      onTap: () {
        setState(() => _currentIndex = index);
        if (index == 0 || index == 1) {
          // already on cases
        } else if (index == 2) {
          context.push('/leaves');
          setState(() => _currentIndex = 0);
        } else if (index == 3) {
          context.push('/profile');
          setState(() => _currentIndex = 0); // reset when coming back
        }
      },
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isSelected ? AppColors.primary : mutedColor,
              size: 24,
            ),
            SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? AppColors.primary : mutedColor,
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getDynamicStatusLabel(dynamic item, String rawStatus) {
    if (rawStatus == 'in_progress') {
      final hasLoc =
          item['case_location'] != null &&
          (item['case_location'] is List
              ? (item['case_location'] as List).isNotEmpty
              : true);
      final hasDocs =
          item['case_documents'] != null &&
          (item['case_documents'] is List
              ? (item['case_documents'] as List).isNotEmpty
              : true);
      final hasPhotos =
          item['case_photos'] != null &&
          (item['case_photos'] is List
              ? (item['case_photos'] as List).isNotEmpty
              : true);

      if (!hasLoc && !hasDocs && !hasPhotos) {
        return 'IN PROGRESS';
      }

      final parts = <String>[];
      if (hasLoc) parts.add('Location');
      if (hasDocs) parts.add('Document');
      if (hasPhotos) parts.add('Photo');

      return '${parts.join(' + ')} Done'.toUpperCase();
    }

    return CaseStatus.label(rawStatus).toUpperCase();
  }

  Widget _buildRichCaseCard(
    dynamic item,
    bool isDark,
    Color surfaceColor,
    Color paperColor,
    Color borderColor,
    Color textColor,
    Color mutedColor,
  ) {
    final status = item['status'] ?? 'unknown';
    Color statusColor = Theme.of(context).colorScheme.primary;
    if (CaseStatus.isCompleted(status)) statusColor = AppColors.successFor(context);
    if (status == 'submitted' ||
        status == 'in_review' ||
        status == 'pending_review' ||
        status == 'under_review')
      statusColor = AppColors.warningFor(context);
    if (status == 'reviewed') statusColor = AppColors.successFor(context);

    final isFinalized = CaseStatus.isLocked(status);

    final actualSurfaceColor = isFinalized
        ? (isDark
              ? statusColor.withOpacity(0.1)
              : statusColor.withOpacity(0.03))
        : surfaceColor;

    final actualBorderColor = isFinalized
        ? statusColor.withOpacity(0.3)
        : borderColor;

    return Container(
      margin: EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: actualSurfaceColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: actualBorderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.15 : 0.03),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: () async {
            await context.push('/cases/${item['id']}');
            _fetchData();
          },
          child: Padding(
            padding: EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        _getDynamicStatusLabel(item, status),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: statusColor,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    Text(
                      item['application_number'] ?? '#REQ-UNKNOWN',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: mutedColor,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 14),
                Text(
                  item['applicant_name'] ?? 'Unknown Applicant',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: textColor,
                  ),
                ),
                SizedBox(height: 10),
                Row(
                  children: [
                    Container(
                      padding: EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: paperColor,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        LucideIcons.mapPin,
                        size: 15,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        item['address'] ??
                            'No Address provided. Please fetch from server.',
                        style: TextStyle(
                          color: mutedColor,
                          fontSize: 13,
                          height: 1.4,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 16),
                Divider(height: 1, color: borderColor),
                SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                LucideIcons.clock,
                                size: 14,
                                color: AppColors.warningFor(context),
                              ),
                              SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  item['deadline_date'] != null
                                      ? 'Initiated: ${DateTime.tryParse(item['deadline_date']) != null ? "${DateTime.parse(item['deadline_date']).toLocal().day.toString().padLeft(2, '0')}/${DateTime.parse(item['deadline_date']).toLocal().month.toString().padLeft(2, '0')}/${DateTime.parse(item['deadline_date']).toLocal().year} ${DateTime.parse(item['deadline_date']).toLocal().hour.toString().padLeft(2, '0')}:${DateTime.parse(item['deadline_date']).toLocal().minute.toString().padLeft(2, '0')}" : "Unknown"}'
                                      : 'Initiated: Unknown',
                                  style: TextStyle(
                                    color: AppColors.warningFor(context),
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          if (CaseStatus.isLocked(status)) ...[
                            SizedBox(height: 4),
                            Row(
                              children: [
                                Icon(
                                  LucideIcons.checkCircle2,
                                  size: 14,
                                  color: AppColors.successFor(context),
                                ),
                                SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    (item['submitted_at'] != null)
                                        ? 'Submitted: ${DateTime.tryParse(item['submitted_at']) != null ? "${DateTime.parse(item['submitted_at']).toLocal().day.toString().padLeft(2, '0')}/${DateTime.parse(item['submitted_at']).toLocal().month.toString().padLeft(2, '0')}/${DateTime.parse(item['submitted_at']).toLocal().year} ${DateTime.parse(item['submitted_at']).toLocal().hour.toString().padLeft(2, '0')}:${DateTime.parse(item['submitted_at']).toLocal().minute.toString().padLeft(2, '0')}" : "Yes"}'
                                        : 'Status: ${CaseStatus.label(status)}',
                                    style: TextStyle(
                                      color: AppColors.successFor(context),
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                    SizedBox(width: 8),
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: CaseStatus.isLocked(status)
                            ? AppColors.success.withOpacity(0.1)
                            : AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            CaseStatus.isLocked(status) ? 'View' : 'Start',
                            style: TextStyle(
                              color: CaseStatus.isLocked(status)
                                  ? AppColors.success
                                  : AppColors.primary,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                          SizedBox(width: 4),
                          Icon(
                            CaseStatus.isLocked(status)
                                ? LucideIcons.chevronRight
                                : LucideIcons.arrowRight,
                            color: CaseStatus.isLocked(status)
                                ? AppColors.success
                                : AppColors.primary,
                            size: 14,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFilterPill(
    String filterKey,
    String label,
    Color surfaceColor,
    Color borderColor,
    Color textColor,
  ) {
    final isSelected = _casesFilter == filterKey;
    return GestureDetector(
      onTap: () => setState(() => _casesFilter = filterKey),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : surfaceColor,
          borderRadius: BorderRadius.circular(25),
          border: Border.all(
            color: isSelected ? AppColors.primary : borderColor,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
            color: isSelected ? AppColors.onPrimary : textColor,
          ),
        ),
      ),
    );
  }
}
