import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hem_agent/theme/app_theme.dart';

double contrast(Color a, Color b) {
  final x = a.computeLuminance(), y = b.computeLuminance();
  return x > y ? (x + .05) / (y + .05) : (y + .05) / (x + .05);
}

void main() {
  for (final theme in [AppTheme.lightTheme, AppTheme.darkTheme]) {
    test(
      '${theme.brightness} text, accents and fields have readable contrast',
      () {
        final scheme = theme.colorScheme;
        for (final surface in [
          scheme.surface,
          scheme.surfaceContainerLow,
          scheme.surfaceContainerHighest,
          theme.scaffoldBackgroundColor,
        ]) {
          for (final ink in [
            scheme.onSurface,
            scheme.onSurfaceVariant,
            scheme.primary,
            theme.textTheme.labelSmall!.color!,
          ]) {
            expect(contrast(ink, surface), greaterThanOrEqualTo(4.5));
          }
        }
        expect(
          contrast(scheme.primary, scheme.onPrimary),
          greaterThanOrEqualTo(4.5),
        );
        expect(
          contrast(scheme.primaryContainer, scheme.onPrimaryContainer),
          greaterThanOrEqualTo(4.5),
        );
      },
    );
  }
}
