import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../theme/app_theme.dart';
import '../../blocs/auth/auth_bloc.dart';
import '../../blocs/auth/auth_event.dart';
import '../../widgets/hem_confirm_dialog.dart';
import '../../core/assignment_notifications.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _loading = true;
  Map<String, dynamic>? _profile;

  final _formKey = GlobalKey<FormState>();
  final _oldPasswordController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscureOld = true;
  bool _obscurePassword = true;
  bool _obscureConfirm = true;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  @override
  void dispose() {
    _oldPasswordController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _fetchProfile() async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) {
        if (mounted) setState(() => _loading = false);
        return;
      }

      final res = await Supabase.instance.client
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
      if (res['is_active'] == false) {
        await Supabase.instance.client.auth.signOut();
        if (mounted) setState(() => _loading = false);
        return;
      }
      if (mounted) {
        setState(() {
          _profile = res;
          _loading = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching profile: $e');
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _updatePassword() async {
    if (!_formKey.currentState!.validate()) return;

    if (_passwordController.text != _confirmPasswordController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('New passwords do not match'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    final confirmed = await HemConfirmDialog.show(
      context: context,
      title: 'Update Password',
      message:
          'Are you sure you want to change your account password? You will use the new password on next login.',
      confirmLabel: 'Change Password',
      icon: LucideIcons.key,
    );
    if (confirmed != true) return;

    final user = Supabase.instance.client.auth.currentUser;
    if (user == null || user.email == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('User session not found'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() => _loading = true);
    try {
      // Verify old password first
      try {
        await Supabase.instance.client.auth.signInWithPassword(
          email: user.email!,
          password: _oldPasswordController.text,
        );
      } on AuthException catch (authErr) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Incorrect current password: ${authErr.message}'),
              backgroundColor: AppColors.error,
            ),
          );
        }
        return;
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Incorrect current password. Please try again.'),
              backgroundColor: AppColors.error,
            ),
          );
        }
        return;
      }

      // Old password verified successfully! Update to new password
      await Supabase.instance.client.auth.updateUser(
        UserAttributes(password: _passwordController.text),
      );
      _oldPasswordController.clear();
      _passwordController.clear();
      _confirmPasswordController.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Password updated successfully'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error updating password: $e')));
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Widget _buildReadOnlyField(String label, String value, IconData icon) {
    final colorScheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final displayValue = value.trim().isEmpty ? 'Not specified' : value;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;
    return Padding(
      padding: EdgeInsets.only(bottom: 16.0),
      child: TextFormField(
        key: ValueKey('$label-$displayValue'),
        initialValue: displayValue,
        readOnly: true,
        style: TextStyle(
          color: colorScheme.onSurface,
          fontWeight: FontWeight.w600,
          fontSize: 15,
        ),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
            fontWeight: FontWeight.w500,
          ),
          prefixIcon: Icon(
            icon,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
            size: 20,
          ),
          filled: true,
          fillColor: isDark
              ? AppColors.surfaceHoverDark
              : AppColors.surfaceHoverLight,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: borderColor),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: borderColor),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: borderColor),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final fullName = _profile?['full_name']?.toString() ?? '';
    final email =
        _profile?['email']?.toString() ??
        Supabase.instance.client.auth.currentUser?.email ??
        '';
    final phone = _profile?['phone']?.toString() ?? '';
    final address = _profile?['address']?.toString() ?? '';
    final role =
        _profile?['role']?.toString().replaceAll('_', ' ').toUpperCase() ?? '';
    final department = _profile?['department']?.toString() ?? '';
    final level = _profile?['level']?.toString() ?? '';

    return Scaffold(
      appBar: AppBar(title: Text('Profile & Settings')),
      body: _loading && _profile == null
          ? Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // User Avatar & Header
                  Center(
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 44,
                          backgroundColor: AppColors.primary.withOpacity(0.1),
                          child: Text(
                            fullName.isNotEmpty
                                ? fullName[0].toUpperCase()
                                : (email.isNotEmpty
                                      ? email[0].toUpperCase()
                                      : 'U'),
                            style: TextStyle(
                              fontSize: 36,
                              color: Theme.of(context).colorScheme.primary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        SizedBox(height: 12),
                        Text(
                          fullName.isNotEmpty ? fullName : 'My Profile',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: colorScheme.onSurface,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          email,
                          style: TextStyle(
                            fontSize: 14,
                            color: Theme.of(
                              context,
                            ).colorScheme.onSurfaceVariant,
                          ),
                        ),
                        if (role.isNotEmpty || level.isNotEmpty) ...[
                          SizedBox(height: 6),
                          Text(
                            [
                              role,
                              level,
                            ].where((value) => value.isNotEmpty).join(' • '),
                            style: TextStyle(
                              fontSize: 12,
                              color: Theme.of(context).colorScheme.primary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  SizedBox(height: 32),

                  ValueListenableBuilder<String>(
                    valueListenable: AssignmentNotifications.instance.status,
                    builder: (context, status, _) => Card(
                      child: ListTile(
                        leading: const Icon(Icons.notifications_outlined),
                        title: const Text('Case assignment notifications'),
                        subtitle: Text(status),
                        trailing: AssignmentNotifications.instance.available
                            ? IconButton(
                                tooltip: 'Check notifications',
                                icon: const Icon(Icons.refresh),
                                onPressed: () =>
                                    AssignmentNotifications.instance.signedIn(),
                              )
                            : null,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Account Details Section (Read-Only)
                  Text(
                    'Account Information (Read-Only)',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  SizedBox(height: 16),
                  _buildReadOnlyField('Full Name', fullName, LucideIcons.user),
                  _buildReadOnlyField('Email Address', email, LucideIcons.mail),
                  _buildReadOnlyField('Phone Number', phone, LucideIcons.phone),
                  _buildReadOnlyField('Address', address, LucideIcons.mapPin),
                  _buildReadOnlyField(
                    'Department',
                    department,
                    LucideIcons.building,
                  ),
                  _buildReadOnlyField('Access Level', level, LucideIcons.award),

                  SizedBox(height: 24),
                  Divider(color: Theme.of(context).colorScheme.outline),
                  SizedBox(height: 24),

                  // Password Update Section (Editable)
                  Text(
                    'Security & Password',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'You are permitted to update your account password below.',
                    style: TextStyle(
                      fontSize: 13,
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  SizedBox(height: 16),

                  Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        TextFormField(
                          controller: _oldPasswordController,
                          obscureText: _obscureOld,
                          decoration: InputDecoration(
                            labelText: 'Current Password',
                            prefixIcon: Icon(LucideIcons.key, size: 20),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscureOld
                                    ? LucideIcons.eyeOff
                                    : LucideIcons.eye,
                                size: 20,
                              ),
                              onPressed: () =>
                                  setState(() => _obscureOld = !_obscureOld),
                            ),
                          ),
                          validator: (v) {
                            if (v == null || v.isEmpty)
                              return 'Please enter your current password';
                            return null;
                          },
                        ),
                        SizedBox(height: 16),
                        TextFormField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          decoration: InputDecoration(
                            labelText: 'New Password',
                            prefixIcon: Icon(LucideIcons.lock, size: 20),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword
                                    ? LucideIcons.eyeOff
                                    : LucideIcons.eye,
                                size: 20,
                              ),
                              onPressed: () => setState(
                                () => _obscurePassword = !_obscurePassword,
                              ),
                            ),
                          ),
                          validator: (v) {
                            if (v == null || v.isEmpty)
                              return 'Please enter a new password';
                            if (v.length < 6)
                              return 'Password must be at least 6 characters';
                            return null;
                          },
                        ),
                        SizedBox(height: 16),
                        TextFormField(
                          controller: _confirmPasswordController,
                          obscureText: _obscureConfirm,
                          decoration: InputDecoration(
                            labelText: 'Confirm New Password',
                            prefixIcon: Icon(LucideIcons.lock, size: 20),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscureConfirm
                                    ? LucideIcons.eyeOff
                                    : LucideIcons.eye,
                                size: 20,
                              ),
                              onPressed: () => setState(
                                () => _obscureConfirm = !_obscureConfirm,
                              ),
                            ),
                          ),
                          validator: (v) {
                            if (v == null || v.isEmpty)
                              return 'Please confirm your new password';
                            if (v != _passwordController.text)
                              return 'Passwords do not match';
                            return null;
                          },
                        ),
                        SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: ElevatedButton.icon(
                            onPressed: _loading ? null : _updatePassword,
                            icon: _loading
                                ? SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : Icon(LucideIcons.key),
                            label: Text(
                              _loading ? 'Updating...' : 'Update Password',
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  SizedBox(height: 32),
                  Divider(color: Theme.of(context).colorScheme.outlineVariant),
                  SizedBox(height: 24),

                  // Appearance Section
                  Text(
                    'Appearance & Theme',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  SizedBox(height: 12),
                  ValueListenableBuilder<ThemeMode>(
                    valueListenable: ThemeController.themeModeNotifier,
                    builder: (context, currentMode, _) {
                      return SizedBox(
                        width: double.infinity,
                        child: SegmentedButton<ThemeMode>(
                          segments: [
                            ButtonSegment(
                              value: ThemeMode.system,
                              label: Text('System'),
                              icon: Icon(LucideIcons.monitor, size: 16),
                            ),
                            ButtonSegment(
                              value: ThemeMode.light,
                              label: Text('Light'),
                              icon: Icon(LucideIcons.sun, size: 16),
                            ),
                            ButtonSegment(
                              value: ThemeMode.dark,
                              label: Text('Dark'),
                              icon: Icon(LucideIcons.moon, size: 16),
                            ),
                          ],
                          selected: {currentMode},
                          onSelectionChanged: (Set<ThemeMode> newSelection) {
                            ThemeController.themeModeNotifier.value =
                                newSelection.first;
                          },
                        ),
                      );
                    },
                  ),

                  SizedBox(height: 32),
                  Divider(color: Theme.of(context).colorScheme.outlineVariant),
                  SizedBox(height: 24),

                  // Sign Out Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        final confirmed = await HemConfirmDialog.show(
                          context: context,
                          title: 'Sign Out',
                          message:
                              'Are you sure you want to sign out of your H.E.M Associates account?',
                          confirmLabel: 'Sign Out',
                          isDestructive: true,
                          icon: LucideIcons.logOut,
                        );
                        if (confirmed == true && context.mounted) {
                          BlocProvider.of<AuthBloc>(context).add(LoggedOut());
                        }
                      },
                      icon: Icon(
                        LucideIcons.logOut,
                        color: AppColors.dangerFor(context),
                      ),
                      label: Text(
                        'Sign Out',
                        style: TextStyle(
                          color: AppColors.dangerFor(context),
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: AppColors.dangerFor(context)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(height: 32),
                ],
              ),
            ),
    );
  }
}
