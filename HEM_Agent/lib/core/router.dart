import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../blocs/auth/auth_bloc.dart';
import '../blocs/auth/auth_state.dart';
import '../screens/auth/login_screen.dart';
import '../screens/cases/cases_list_screen.dart';
import '../screens/cases/case_details_screen.dart';
import '../screens/workflows/location_step.dart';
import '../screens/workflows/documents_step.dart';
import '../screens/workflows/photos_step.dart';
import '../screens/workflows/review_step.dart';
import '../screens/workflows/media_step.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/leaves/leave_request_screen.dart';

class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    _subscription = stream.asBroadcastStream().listen((_) => notifyListeners());
  }

  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}

class AppRouter {
  static GoRouter createRouter(AuthBloc authBloc) {
    return GoRouter(
      initialLocation: '/',
      refreshListenable: GoRouterRefreshStream(authBloc.stream),
      redirect: (context, state) {
        final authState = authBloc.state;

        final isAuthRoute = state.matchedLocation == '/login';

        if (authState is AuthInitial || authState is AuthLoading) {
          return null; // Don't redirect while loading
        }

        if (authState is Unauthenticated && !isAuthRoute) {
          return '/login';
        }

        if (authState is Authenticated && isAuthRoute) {
          return '/cases';
        }

        if (state.matchedLocation == '/') {
          return authState is Authenticated ? '/cases' : '/login';
        }

        return null;
      },
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) =>
              const Scaffold(body: Center(child: CircularProgressIndicator())),
        ),
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: '/cases',
          builder: (context, state) => const CasesListScreen(),
          routes: [
            GoRoute(
              path: ':id',
              builder: (context, state) {
                final id = state.pathParameters['id']!;
                return CaseDetailsScreen(caseId: id);
              },
              routes: [
                GoRoute(
                  path: 'location',
                  builder: (context, state) =>
                      LocationStep(caseId: state.pathParameters['id']!),
                ),
                GoRoute(
                  path: 'documents',
                  builder: (context, state) =>
                      DocumentsStep(caseId: state.pathParameters['id']!),
                ),
                GoRoute(
                  path: 'photos',
                  builder: (context, state) =>
                      PhotosStep(caseId: state.pathParameters['id']!),
                ),
                GoRoute(
                  path: 'review',
                  builder: (context, state) =>
                      ReviewStep(caseId: state.pathParameters['id']!),
                ),
                GoRoute(
                  path: 'media',
                  builder: (context, state) =>
                      MediaStep(caseId: state.pathParameters['id']!),
                ),
              ],
            ),
          ],
        ),
        GoRoute(
          path: '/profile',
          builder: (context, state) => const ProfileScreen(),
        ),
        GoRoute(
          path: '/leaves',
          builder: (context, state) => const LeaveRequestScreen(),
        ),
      ],
    );
  }
}
