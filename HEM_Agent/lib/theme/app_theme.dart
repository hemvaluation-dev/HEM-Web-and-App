import 'package:flutter/material.dart';

class AppColors {
  static Color successFor(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
      ? const Color(0xFF6EE7B7)
      : success;
  static Color warningFor(BuildContext context) =>
      Theme.of(context).brightness == Brightness.dark
      ? const Color(0xFFFCD34D)
      : warning;
  static Color dangerFor(BuildContext context) =>
      Theme.of(context).colorScheme.error;
  // Portal design tokens: professional blue on a slate canvas.
  static const Color primary = Color(0xFF2563EB);
  static const Color primaryHover = Color(0xFF1D4ED8);
  static const Color onPrimary = Colors.white;

  // Light Mode Tokens (Clean Slate Canvas)
  static const Color backgroundLight = Color(0xFFF8FAFC);
  static const Color paper2Light = Color(0xFFF1F5F9);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color surfaceHoverLight = Color(0xFFF8FAFC);
  static const Color borderLight = Color(0xFFE2E8F0);
  static const Color inkLight = Color(0xFF0F172A);
  static const Color mutedLight = Color(0xFF475569);
  static const Color subtleLight = Color(0xFF475569);

  // Dark Mode Tokens (Obsidian Pitch Canvas)
  static const Color backgroundDark = Color(0xFF0E0F12);
  static const Color paper2Dark = Color(0xFF14151A);
  static const Color surfaceDark = Color(0xFF181A20);
  static const Color surfaceHoverDark = Color(0xFF1F2229);
  static const Color borderDark = Color(0xFF262932);
  static const Color inkDark = Color(0xFFF8FAFC);
  static const Color mutedDark = Color(0xFFB0BACB);
  static const Color subtleDark = Color(0xFFB0BACB);

  // Status & Accents
  static const Color accent = Color(0xFF1D4ED8);
  static const Color secondary = accent;
  static const Color success = Color(0xFF047857);
  static const Color warning = Color(0xFF92400E);
  static const Color danger = Color(0xFFB91C1C);

  // Legacy mappings for backwards compatibility
  static const Color textSecondary = mutedLight;
  static const Color textMuted = subtleLight;
  static const Color error = danger;
  static const Color input = paper2Light;
  static const Color text = inkLight;
  static const Color borderBase = borderLight;
  static const Color surfaceHover = surfaceHoverLight;
  static const Color primaryLight = Color(0xFF1D4ED8);
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      snackBarTheme: const SnackBarThemeData(
        backgroundColor: Color(0xFF334155),
        contentTextStyle: TextStyle(color: Colors.white),
      ),
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.backgroundLight,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        onPrimary: AppColors.onPrimary,
        secondary: AppColors.accent,
        onSecondary: Colors.white,
        background: AppColors.backgroundLight,
        onBackground: AppColors.inkLight,
        surface: AppColors.surfaceLight,
        onSurface: AppColors.inkLight,
        surfaceVariant: AppColors.paper2Light,
        onSurfaceVariant: AppColors.mutedLight,
        error: AppColors.danger,
        onError: Colors.white,
        outline: AppColors.mutedLight,
        outlineVariant: AppColors.borderLight,
        surfaceContainerLowest: AppColors.surfaceLight,
        surfaceContainerLow: AppColors.paper2Light,
        surfaceContainer: AppColors.paper2Light,
        surfaceContainerHigh: AppColors.surfaceHoverLight,
        surfaceContainerHighest: AppColors.surfaceHoverLight,
        primaryContainer: Color(0xFFEFF6FF),
        onPrimaryContainer: Color(0xFF1E3A8A),
        secondaryContainer: Color(0xFFEFF6FF),
        onSecondaryContainer: Color(0xFF1E3A8A),
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          color: AppColors.inkLight,
          fontWeight: FontWeight.bold,
        ),
        displayMedium: TextStyle(
          color: AppColors.inkLight,
          fontWeight: FontWeight.bold,
        ),
        displaySmall: TextStyle(
          color: AppColors.inkLight,
          fontWeight: FontWeight.bold,
        ),
        headlineLarge: TextStyle(
          color: AppColors.inkLight,
          fontWeight: FontWeight.bold,
        ),
        headlineMedium: TextStyle(
          color: AppColors.inkLight,
          fontWeight: FontWeight.bold,
        ),
        headlineSmall: TextStyle(
          color: AppColors.inkLight,
          fontWeight: FontWeight.bold,
        ),
        titleLarge: TextStyle(
          color: AppColors.inkLight,
          fontWeight: FontWeight.bold,
        ),
        titleMedium: TextStyle(
          color: AppColors.inkLight,
          fontWeight: FontWeight.w600,
        ),
        titleSmall: TextStyle(
          color: AppColors.inkLight,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: TextStyle(color: AppColors.inkLight),
        bodyMedium: TextStyle(color: AppColors.inkLight),
        bodySmall: TextStyle(color: AppColors.mutedLight),
        labelLarge: TextStyle(
          color: AppColors.inkLight,
          fontWeight: FontWeight.w600,
        ),
        labelMedium: TextStyle(color: AppColors.mutedLight),
        labelSmall: TextStyle(color: AppColors.subtleLight),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.surfaceLight,
        foregroundColor: AppColors.inkLight,
        elevation: 0,
        centerTitle: true,
        scrolledUnderElevation: 0,
        iconTheme: IconThemeData(color: AppColors.inkLight),
      ),
      cardTheme: CardThemeData(
        color: AppColors.surfaceLight,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.borderLight, width: 1),
        ),
        margin: const EdgeInsets.only(bottom: 16),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.borderLight,
        thickness: 1,
        space: 1,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.surfaceLight,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.mutedLight,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.paper2Light,
        hintStyle: const TextStyle(color: AppColors.mutedLight),
        labelStyle: const TextStyle(color: AppColors.mutedLight),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.borderLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.borderLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.onPrimary,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      snackBarTheme: const SnackBarThemeData(
        backgroundColor: Color(0xFF334155),
        contentTextStyle: TextStyle(color: Colors.white),
      ),
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.backgroundDark,
      colorScheme: const ColorScheme.dark(
        primary: Color(0xFF93C5FD),
        onPrimary: Color(0xFF172554),
        secondary: Color(0xFF93C5FD),
        onSecondary: Color(0xFF172554),
        background: AppColors.backgroundDark,
        onBackground: AppColors.inkDark,
        surface: AppColors.surfaceDark,
        onSurface: AppColors.inkDark,
        surfaceVariant: AppColors.paper2Dark,
        onSurfaceVariant: AppColors.mutedDark,
        error: Color(0xFFFCA5A5),
        onError: Color(0xFF450A0A),
        outline: AppColors.mutedDark,
        outlineVariant: AppColors.borderDark,
        surfaceContainerLowest: AppColors.surfaceDark,
        surfaceContainerLow: AppColors.paper2Dark,
        surfaceContainer: AppColors.paper2Dark,
        surfaceContainerHigh: AppColors.surfaceHoverDark,
        surfaceContainerHighest: AppColors.surfaceHoverDark,
        primaryContainer: Color(0xFF172554),
        onPrimaryContainer: Color(0xFFBFDBFE),
        secondaryContainer: Color(0xFF172554),
        onSecondaryContainer: Color(0xFFBFDBFE),
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          color: AppColors.inkDark,
          fontWeight: FontWeight.bold,
        ),
        displayMedium: TextStyle(
          color: AppColors.inkDark,
          fontWeight: FontWeight.bold,
        ),
        displaySmall: TextStyle(
          color: AppColors.inkDark,
          fontWeight: FontWeight.bold,
        ),
        headlineLarge: TextStyle(
          color: AppColors.inkDark,
          fontWeight: FontWeight.bold,
        ),
        headlineMedium: TextStyle(
          color: AppColors.inkDark,
          fontWeight: FontWeight.bold,
        ),
        headlineSmall: TextStyle(
          color: AppColors.inkDark,
          fontWeight: FontWeight.bold,
        ),
        titleLarge: TextStyle(
          color: AppColors.inkDark,
          fontWeight: FontWeight.bold,
        ),
        titleMedium: TextStyle(
          color: AppColors.inkDark,
          fontWeight: FontWeight.w600,
        ),
        titleSmall: TextStyle(
          color: AppColors.inkDark,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: TextStyle(color: AppColors.inkDark),
        bodyMedium: TextStyle(color: AppColors.inkDark),
        bodySmall: TextStyle(color: AppColors.mutedDark),
        labelLarge: TextStyle(
          color: AppColors.inkDark,
          fontWeight: FontWeight.w600,
        ),
        labelMedium: TextStyle(color: AppColors.mutedDark),
        labelSmall: TextStyle(color: AppColors.subtleDark),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.surfaceDark,
        foregroundColor: AppColors.inkDark,
        elevation: 0,
        centerTitle: true,
        scrolledUnderElevation: 0,
        iconTheme: IconThemeData(color: AppColors.inkDark),
      ),
      cardTheme: CardThemeData(
        color: AppColors.surfaceDark,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.borderDark, width: 1),
        ),
        margin: const EdgeInsets.only(bottom: 16),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.borderDark,
        thickness: 1,
        space: 1,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.surfaceDark,
        selectedItemColor: Color(0xFF93C5FD),
        unselectedItemColor: AppColors.mutedDark,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.paper2Dark,
        hintStyle: const TextStyle(color: AppColors.mutedDark),
        labelStyle: const TextStyle(color: AppColors.mutedDark),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.borderDark),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.borderDark),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.onPrimary,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
        ),
      ),
    );
  }
}

class ThemeController {
  // The portal defaults to the light slate workspace; users can opt into dark mode.
  static final ValueNotifier<ThemeMode> themeModeNotifier = ValueNotifier(
    ThemeMode.light,
  );
}
