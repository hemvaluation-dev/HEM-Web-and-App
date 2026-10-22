import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide AuthState;
import 'auth_event.dart';
import '../../core/assignment_notifications.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final SupabaseClient supabase = Supabase.instance.client;

  AuthBloc() : super(AuthInitial()) {
    on<AppStarted>((event, emit) async {
      emit(AuthLoading());
      try {
        final session = supabase.auth.currentSession;
        if (session != null) {
          final profile = await supabase
              .from('users')
              .select('is_active')
              .eq('id', session.user.id)
              .maybeSingle();
          if (profile == null || profile['is_active'] != true) {
            await supabase.auth.signOut();
            emit(Unauthenticated());
          } else {
            emit(Authenticated());
          }
        } else {
          emit(Unauthenticated());
        }
      } catch (_) {
        emit(
          AuthError(
            message:
                'Could not verify your account. Check your connection and sign in again.',
          ),
        );
      }
    });

    on<LoggedIn>((event, emit) async {
      emit(AuthLoading());
      try {
        final response = await supabase.auth.signInWithPassword(
          email: event.email,
          password: event.password,
        );
        final profile = response.user == null
            ? null
            : await supabase
                  .from('users')
                  .select('is_active')
                  .eq('id', response.user!.id)
                  .maybeSingle();
        if (profile == null || profile['is_active'] != true) {
          await supabase.auth.signOut();
          emit(
            AuthError(
              message: 'This account is inactive. Contact your administrator.',
            ),
          );
        } else {
          emit(Authenticated());
        }
      } catch (e) {
        emit(AuthError(message: e.toString()));
      }
    });

    on<LoggedOut>((event, emit) async {
      emit(AuthLoading());
      await AssignmentNotifications.instance.signedOut();
      await supabase.auth.signOut();
      emit(Unauthenticated());
    });
  }
}
