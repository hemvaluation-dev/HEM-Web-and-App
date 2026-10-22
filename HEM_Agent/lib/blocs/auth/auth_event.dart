abstract class AuthEvent {}

class AppStarted extends AuthEvent {}

class LoggedIn extends AuthEvent {
  final String email;
  final String password;
  LoggedIn({required this.email, required this.password});
}

class LoggedOut extends AuthEvent {}
