import 'dart:async';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

String? assignmentCaseId(Map<String, dynamic> data) {
  final id = data['case_id'];
  if (data['type'] != 'case_assigned' ||
      id is! String ||
      !RegExp(
        r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
      ).hasMatch(id)) {
    return null;
  }
  return id;
}

@pragma('vm:entry-point')
Future<void> assignmentBackgroundHandler(RemoteMessage message) async {
  // Android displays notification payloads itself. Do not send another local alert.
}

/// Optional until google-services.json is installed. No polling or analytics.
class AssignmentNotifications with WidgetsBindingObserver {
  AssignmentNotifications._();
  static final instance = AssignmentNotifications._();
  bool available = false;
  String? _token;
  String? _userId;
  String? _registeredUser;
  DateTime? _registeredAt;
  int _generation = 0;
  String? _pendingCase;
  Future<void> Function(String)? openCase;
  void Function(String)? foregroundCase;
  final status = ValueNotifier<String>('Notifications not configured');

  Future<void> initialize() async {
    if (kIsWeb || defaultTargetPlatform != TargetPlatform.android) return;
    try {
      await Firebase.initializeApp().timeout(const Duration(seconds: 8));
      available = true;
      Supabase.instance.client.auth.onAuthStateChange.listen((event) {
        if (event.event == AuthChangeEvent.signedOut && _userId != null) {
          unawaited(signedOut());
        }
      });
      status.value = 'Sign in to enable assignment notifications';
      FirebaseMessaging.onBackgroundMessage(assignmentBackgroundHandler);
      FirebaseMessaging.onMessageOpenedApp.listen(_opened);
      FirebaseMessaging.onMessage.listen((message) {
        final id = assignmentCaseId(message.data);
        if (id != null && _userId != null) foregroundCase?.call(id);
      });
      // Keep legacy registration tokens for the standard FCM HTTP v1 sender.
      // ignore: deprecated_member_use
      FirebaseMessaging.instance.onTokenRefresh.listen((token) async {
        try {
          await _register(token, _generation);
        } catch (_) {
          status.value =
              'Notification registration will retry when the app resumes';
        }
      });
      final initial = await FirebaseMessaging.instance.getInitialMessage();
      if (initial != null) _pendingCase = assignmentCaseId(initial.data);
      WidgetsBinding.instance.addObserver(this);
    } catch (_) {
      status.value = 'Notifications not configured';
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && _userId != null) {
      unawaited(signedIn());
    }
  }

  Future<void> signedIn() async {
    if (!available) return;
    final client = Supabase.instance.client;
    _userId = client.auth.currentUser?.id;
    if (_userId == null) return;
    final generation = _generation;
    try {
      final permission = await FirebaseMessaging.instance.requestPermission();
      if (permission.authorizationStatus != AuthorizationStatus.authorized &&
          permission.authorizationStatus != AuthorizationStatus.provisional) {
        status.value = 'Notifications disabled in Android settings';
        return;
      }
      await FirebaseMessaging.instance.setAutoInitEnabled(true);
      // HTTP v1 uses registration tokens; the new FID API is a different target.
      // ignore: deprecated_member_use
      final token = await FirebaseMessaging.instance.getToken();
      if (token != null) await _register(token, generation);
      final pending = _pendingCase;
      if (pending != null && generation == _generation && openCase != null) {
        _pendingCase = null;
        await openCase!(pending);
      }
    } catch (_) {
      status.value =
          'Notification registration will retry when the app resumes';
    }
  }

  Future<void> _register(String token, int generation) async {
    if (_userId == null ||
        generation != _generation ||
        Supabase.instance.client.auth.currentUser?.id != _userId) {
      return;
    }
    if (_token == token &&
        _registeredUser == _userId &&
        _registeredAt != null &&
        DateTime.now().difference(_registeredAt!) < const Duration(hours: 24)) {
      status.value = 'Assignment notifications enabled';
      return;
    }
    await Supabase.instance.client
        .rpc('hem_register_push_device', params: {'p_token': token})
        .timeout(const Duration(seconds: 10));
    _token = token;
    _registeredUser = _userId;
    _registeredAt = DateTime.now();
    status.value = 'Assignment notifications enabled';
  }

  void _opened(RemoteMessage message) {
    final id = assignmentCaseId(message.data);
    if (id == null) return;
    if (_userId == null || openCase == null) {
      _pendingCase = id;
    } else {
      unawaited(openCase!(id));
    }
  }

  Future<void> signedOut() async {
    _generation++;
    _userId = null;
    _pendingCase = null;
    if (!available) return;
    final token = _token;
    _token = null;
    _registeredUser = null;
    _registeredAt = null;
    try {
      if (token != null) {
        await Supabase.instance.client
            .rpc('hem_unregister_push_device', params: {'p_token': token})
            .timeout(const Duration(seconds: 5));
      }
    } catch (_) {
      /* Still invalidate the installation's FCM token below. */
    }
    try {
      await FirebaseMessaging.instance.setAutoInitEnabled(false);
      // ignore: deprecated_member_use
      await FirebaseMessaging.instance.deleteToken().timeout(
        const Duration(seconds: 5),
      );
    } catch (_) {
      /* Delivery checks current device registration and case ownership. */
    }
    status.value = 'Sign in to enable assignment notifications';
  }
}
