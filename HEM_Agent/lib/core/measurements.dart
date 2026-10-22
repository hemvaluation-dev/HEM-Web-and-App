/// Canonical feet measurements and unit-aware values shared with portal JSON.
class Measurements {
  static const units = {'sqft': 'sq.fts', 'sqyd': 'sq.yards', 'sqm': 'sq.mtr'};
  static const factors = {'sqft': 1.0, 'sqyd': 9.0, 'sqm': 1 / .09290304};
  static const groups = [
    {
      'prefix': 'land',
      'area': 'land_area',
      'rate': 'land_rate',
      'amount': 'land_value',
      'label': 'Land',
    },
    {
      'prefix': 'plinth',
      'area': 'bua',
      'rate': 'construction_rate',
      'amount': 'building_value',
      'label': 'Build-up',
    },
    {
      'prefix': 'slab',
      'area': 'slab_area',
      'rate': 'slab_rate',
      'amount': 'slab_value',
      'label': 'Slab',
    },
  ];
  static double? number(dynamic value) {
    final n = double.tryParse(
      (value ?? '').toString().replaceAll(',', '').trim(),
    );
    return n != null && n.isFinite && n >= 0 ? n : null;
  }

  static String unit(dynamic value, [String fallback = 'sqyd']) =>
      units.containsKey(value) ? value as String : fallback;
  static String decimal(double n) =>
      n.toStringAsFixed(6).replaceFirst(RegExp(r'\.?0+$'), '');
  static Map<String, dynamic> calculate(Map<String, dynamic> input) {
    final data = Map<String, dynamic>.from(input);
    for (final g in groups) {
      final areaUnit = unit(data['${g['area']}_unit']);
      final rateUnit = unit(
        data['${g['rate']}_unit'],
        g['prefix'] == 'land' ? 'sqyd' : 'sqft',
      );
      data['${g['area']}_unit'] = areaUnit;
      data['${g['rate']}_unit'] = rateUnit;
      final sides = [
        'east',
        'west',
        'north',
        'south',
      ].map((side) => data['${g['prefix']}_measurements_$side']).toList();
      final values = sides.map(number).toList();
      double? sqft;
      if (values.every((v) => v != null)) {
        sqft = (values[0]! + values[1]!) / 2 * (values[2]! + values[3]!) / 2;
        data[g['area']!] = decimal(sqft / factors[areaUnit]!);
      } else if (sides.any((v) => (v ?? '').toString().trim().isNotEmpty)) {
        data[g['area']!] = '';
      }
      final area = number(data[g['area']]);
      sqft ??= area == null ? null : area * factors[areaUnit]!;
      final rate = number(data[g['rate']]);
      data[g['amount']!] = sqft != null && rate != null
          ? decimal(sqft / factors[rateUnit]! * rate)
          : '';
    }
    final included = groups
        .where(
          (g) =>
              (data['include_${g['prefix']}_value'] ??
                  (g['prefix'] != 'slab')) ==
              true,
        )
        .toList();
    data['total_value'] =
        included.isNotEmpty &&
            included.every((g) => number(data[g['amount']]) != null)
        ? decimal(
            included.fold(0.0, (sum, g) => sum + number(data[g['amount']])!),
          )
        : '';
    return data;
  }

  static Map<String, dynamic> changeUnit(
    Map<String, dynamic> input,
    String key,
    String next,
  ) {
    final data = calculate(input);
    final current = unit(data['${key}_unit']);
    final n = number(data[key]);
    data[key] = n == null
        ? ''
        : decimal(
            n *
                (key.endsWith('_rate')
                    ? factors[next]! / factors[current]!
                    : factors[current]! / factors[next]!),
          );
    data['${key}_unit'] = next;
    return calculate(data);
  }
}
