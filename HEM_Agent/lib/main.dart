import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/supabase_config.dart';
import 'theme/app_theme.dart';
import 'blocs/auth/auth_bloc.dart';
import 'blocs/auth/auth_event.dart';
import 'core/router.dart';
import 'core/assignment_notifications.dart';
import 'blocs/auth/auth_state.dart' as app_auth;
import 'package:go_router/go_router.dart';
import 'dart:async';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (SupabaseConfig.publishableKey.isEmpty) {
    runApp(const ConfigurationErrorApp());
    return;
  }

  await Supabase.initialize(
    url: SupabaseConfig.url,
    publishableKey: SupabaseConfig.publishableKey,
  );

  await AssignmentNotifications.instance.initialize();
  runApp(const HEMApp());
}

class ConfigurationErrorApp extends StatelessWidget {
  const ConfigurationErrorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: Scaffold(
        body: Center(
          child: Padding(
            padding: EdgeInsets.all(24),
            child: Text(
              'HEM Agent is missing SUPABASE_PUBLISHABLE_KEY. Rebuild the app with the protected Supabase project configuration.',
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ),
    );
  }
}

class HEMApp extends StatelessWidget {
  const HEMApp({super.key});
  @override
  Widget build(BuildContext context) => BlocProvider(
    create: (context) => AuthBloc()..add(AppStarted()),
    child: const _Application(),
  );
}

class _Application extends StatefulWidget {
  const _Application();
  @override
  State<_Application> createState() => _ApplicationState();
}

class _ApplicationState extends State<_Application> {
  late final GoRouter _router;
  final _messenger = GlobalKey<ScaffoldMessengerState>();

  @override
  void initState() {
    super.initState();
    _router = AppRouter.createRouter(context.read<AuthBloc>());
    AssignmentNotifications.instance.openCase = _openCase;
    AssignmentNotifications.instance.foregroundCase = (id) {
      _messenger.currentState?.showSnackBar(
        SnackBar(
          content: const Text('A new case has been assigned to you.'),
          action: SnackBarAction(
            label: 'Open',
            onPressed: () => unawaited(_openCase(id)),
          ),
        ),
      );
    };
  }

  Future<void> _openCase(String id) async {
    final client = Supabase.instance.client;
    final user = client.auth.currentUser;
    if (user == null || !mounted) return;
    try {
      final row = await client
          .from('cases')
          .select('id')
          .eq('id', id)
          .eq('assigned_to', user.id)
          .maybeSingle()
          .timeout(const Duration(seconds: 10));
      if (!mounted) return;
      if (row != null) {
        _router.go('/cases/$id');
      } else {
        _messenger.currentState?.showSnackBar(
          const SnackBar(
            content: Text('This case is no longer assigned to you.'),
          ),
        );
      }
    } catch (_) {
      _messenger.currentState?.showSnackBar(
        const SnackBar(
          content: Text('Could not open the case. Check your connection.'),
        ),
      );
    }
  }

  @override
  void dispose() {
    AssignmentNotifications.instance.openCase = null;
    AssignmentNotifications.instance.foregroundCase = null;
    _router.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) =>
      BlocListener<AuthBloc, app_auth.AuthState>(
        listener: (context, state) {
          if (state is app_auth.Authenticated) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (mounted) {
                unawaited(AssignmentNotifications.instance.signedIn());
              }
            });
          }
        },
        child: ValueListenableBuilder<ThemeMode>(
          valueListenable: ThemeController.themeModeNotifier,
          builder: (context, themeMode, _) => MaterialApp.router(
            title: 'HEM Agent',
            debugShowCheckedModeBanner: false,
            scaffoldMessengerKey: _messenger,
            themeMode: themeMode,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            routerConfig: _router,
          ),
        ),
      );
}
